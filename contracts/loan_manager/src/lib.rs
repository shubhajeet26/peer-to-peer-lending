#![no_std]

mod storage;
pub mod types;

#[cfg(test)]
mod test;

use soroban_sdk::{
    contract, contractimpl, symbol_short, token, Address, BytesN, Env, IntoVal, Symbol,
};
use storage::*;
use types::*;

const BPS_BASE: u32 = 10_000;
const SECONDS_PER_YEAR: u64 = 31_536_000;

pub struct ReputationRegistryClient {
    pub env: Env,
    pub address: Address,
}

impl ReputationRegistryClient {
    pub fn new(env: &Env, address: &Address) -> Self {
        Self {
            env: env.clone(),
            address: address.clone(),
        }
    }

    pub fn record_loan_created(&self, borrower: &Address, amount: &i128) {
        self.env.invoke_contract::<()>(
            &self.address,
            &Symbol::new(&self.env, "record_loan_created"),
            soroban_sdk::vec![&self.env, borrower.into_val(&self.env), amount.into_val(&self.env)],
        );
    }

    pub fn record_funding(&self, lender: &Address, amount: &i128) {
        self.env.invoke_contract::<()>(
            &self.address,
            &Symbol::new(&self.env, "record_funding"),
            soroban_sdk::vec![&self.env, lender.into_val(&self.env), amount.into_val(&self.env)],
        );
    }

    pub fn record_repayment(&self, borrower: &Address, amount: &i128, on_time: &bool) {
        self.env.invoke_contract::<()>(
            &self.address,
            &Symbol::new(&self.env, "record_repayment"),
            soroban_sdk::vec![
                &self.env,
                borrower.into_val(&self.env),
                amount.into_val(&self.env),
                on_time.into_val(&self.env)
            ],
        );
    }

    pub fn record_completion(&self, borrower: &Address) {
        self.env.invoke_contract::<()>(
            &self.address,
            &Symbol::new(&self.env, "record_completion"),
            soroban_sdk::vec![&self.env, borrower.into_val(&self.env)],
        );
    }

    pub fn record_default(&self, borrower: &Address, amount: &i128) {
        self.env.invoke_contract::<()>(
            &self.address,
            &Symbol::new(&self.env, "record_default"),
            soroban_sdk::vec![&self.env, borrower.into_val(&self.env), amount.into_val(&self.env)],
        );
    }

    pub fn record_yield(&self, lender: &Address, yield_amount: &i128) {
        self.env.invoke_contract::<()>(
            &self.address,
            &Symbol::new(&self.env, "record_yield"),
            soroban_sdk::vec![&self.env, lender.into_val(&self.env), yield_amount.into_val(&self.env)],
        );
    }
}

#[contract]
pub struct LoanManager;

#[contractimpl]
impl LoanManager {
    /// Initialize LoanManager contract configuration and admin access.
    pub fn initialize(
        env: Env,
        admin: Address,
        reputation_contract: Address,
        platform_fee_bps: u32,
        fee_collector: Address,
    ) -> Result<(), LoanError> {
        admin.require_auth();

        if is_initialized(&env) {
            return Err(LoanError::AlreadyInitialized);
        }
        if platform_fee_bps > 1000 {
            // Max 10% fee limit
            return Err(LoanError::InvalidConfiguration);
        }

        let config = Config {
            reputation_contract,
            platform_fee_bps,
            fee_collector,
        };

        set_admin(&env, &admin);
        set_config(&env, &config);
        set_initialized(&env);

        extend_instance_ttl(&env);

        env.events()
            .publish((symbol_short!("init"), admin), config.platform_fee_bps);

        Ok(())
    }

    /// Update contract WASM code (Admin only).
    pub fn upgrade(env: Env, new_wasm_hash: BytesN<32>) -> Result<(), LoanError> {
        let admin = get_admin(&env)?;
        admin.require_auth();

        env.deployer().update_current_contract_wasm(new_wasm_hash);

        extend_instance_ttl(&env);

        env.events()
            .publish((symbol_short!("upgrade"), admin), ());

        Ok(())
    }

    /// Update platform configuration (Admin only).
    pub fn update_config(
        env: Env,
        new_reputation_contract: Option<Address>,
        new_fee_bps: Option<u32>,
        new_fee_collector: Option<Address>,
    ) -> Result<(), LoanError> {
        let admin = get_admin(&env)?;
        admin.require_auth();

        let mut config = get_config(&env)?;

        if let Some(rep) = new_reputation_contract {
            config.reputation_contract = rep;
        }
        if let Some(fee_bps) = new_fee_bps {
            if fee_bps > 1000 {
                return Err(LoanError::InvalidConfiguration);
            }
            config.platform_fee_bps = fee_bps;
        }
        if let Some(collector) = new_fee_collector {
            config.fee_collector = collector;
        }

        set_config(&env, &config);
        extend_instance_ttl(&env);

        env.events()
            .publish((symbol_short!("config"), admin), config.platform_fee_bps);

        Ok(())
    }

    /// Borrower creates a new loan request.
    #[allow(clippy::too_many_arguments, clippy::manual_range_contains)]
    pub fn create_loan(
        env: Env,
        borrower: Address,
        token: Address,
        principal: i128,
        interest_rate_bps: u32,
        duration_seconds: u64,
        total_installments: u32,
        purpose_hash: BytesN<32>,
    ) -> Result<u64, LoanError> {
        borrower.require_auth();

        if principal <= 0 {
            return Err(LoanError::InvalidAmount);
        }
        if interest_rate_bps == 0 || interest_rate_bps > 10_000 {
            return Err(LoanError::InvalidInterestRate);
        }
        if duration_seconds < 86400 || duration_seconds > 31536000 * 5 {
            // 1 day to 5 years
            return Err(LoanError::InvalidDuration);
        }
        if total_installments == 0 || total_installments > 120 {
            return Err(LoanError::InvalidInstallments);
        }

        let config = get_config(&env)?;

        // Fixed-point integer math for simple interest APR
        // Interest = (Principal * InterestRateBps * Duration) / (10,000 * 31,536,000)
        let interest_amount = (principal as u128)
            .checked_mul(interest_rate_bps as u128)
            .and_then(|val| val.checked_mul(duration_seconds as u128))
            .map(|val| val / ((BPS_BASE as u128) * (SECONDS_PER_YEAR as u128)))
            .ok_or(LoanError::InvalidAmount)? as i128;

        let total_repayment_amount = principal
            .checked_add(interest_amount)
            .ok_or(LoanError::InvalidAmount)?;

        let installment_amount = total_repayment_amount / (total_installments as i128);
        let interval_seconds = duration_seconds / (total_installments as u64);
        let created_at = env.ledger().timestamp();

        let loan_id = increment_loan_count(&env);

        let schedule = RepaymentSchedule {
            total_installments,
            installments_paid: 0,
            interval_seconds,
            installment_amount,
            next_due_timestamp: 0, // Set when funded
        };

        let loan = Loan {
            id: loan_id,
            borrower: borrower.clone(),
            lender: None,
            token: token.clone(),
            principal,
            interest_rate_bps,
            duration_seconds,
            created_at,
            funded_at: 0,
            maturity_timestamp: 0,
            amount_funded: 0,
            total_repayment_amount,
            amount_repaid: 0,
            status: LoanStatus::Created,
            schedule,
            purpose_hash,
        };

        set_loan(&env, &loan);
        extend_instance_ttl(&env);

        // Real Cross-Contract Call to ReputationRegistry
        let rep_client = ReputationRegistryClient::new(&env, &config.reputation_contract);
        rep_client.record_loan_created(&borrower, &principal);

        env.events().publish(
            (Symbol::new(&env, "loan_create"), loan_id, borrower),
            (principal, interest_rate_bps, duration_seconds),
        );

        Ok(loan_id)
    }

    /// Borrower cancels an unfunded loan request.
    pub fn cancel_loan(env: Env, loan_id: u64, borrower: Address) -> Result<(), LoanError> {
        borrower.require_auth();

        let mut loan = get_loan(&env, loan_id)?;

        if loan.borrower != borrower {
            return Err(LoanError::Unauthorized);
        }
        if loan.status != LoanStatus::Created {
            return Err(LoanError::InvalidState);
        }

        loan.status = LoanStatus::Cancelled;
        set_loan(&env, &loan);
        extend_instance_ttl(&env);

        env.events()
            .publish((Symbol::new(&env, "loan_cancel"), loan_id), borrower);

        Ok(())
    }

    /// Lender funds a loan request. Escrows funds and auto-disburses to borrower.
    pub fn fund_loan(env: Env, loan_id: u64, lender: Address) -> Result<(), LoanError> {
        lender.require_auth();

        let mut loan = get_loan(&env, loan_id)?;

        if loan.status != LoanStatus::Created {
            return Err(LoanError::InvalidState);
        }
        if loan.borrower == lender {
            return Err(LoanError::Unauthorized);
        }

        let config = get_config(&env)?;
        let contract_address = env.current_contract_address();

        // 1. Transfer principal tokens from lender to contract escrow
        let token_client = token::Client::new(&env, &loan.token);
        token_client.transfer(&lender, &contract_address, &loan.principal);

        // 2. Update loan funding & schedule state
        let now = env.ledger().timestamp();
        loan.lender = Some(lender.clone());
        loan.funded_at = now;
        loan.maturity_timestamp = now + loan.duration_seconds;
        loan.amount_funded = loan.principal;
        loan.status = LoanStatus::Funded;
        loan.schedule.next_due_timestamp = now + loan.schedule.interval_seconds;

        set_loan(&env, &loan);

        // 3. Record funding in ReputationRegistry via cross-contract call
        let rep_client = ReputationRegistryClient::new(&env, &config.reputation_contract);
        rep_client.record_funding(&lender, &loan.principal);

        env.events().publish(
            (Symbol::new(&env, "loan_fund"), loan_id, lender.clone()),
            loan.principal,
        );

        // 4. Auto-disburse principal to borrower
        token_client.transfer(&contract_address, &loan.borrower, &loan.principal);
        loan.status = LoanStatus::Active;
        set_loan(&env, &loan);
        extend_instance_ttl(&env);

        env.events().publish(
            (
                Symbol::new(&env, "loan_disburse"),
                loan_id,
                loan.borrower.clone(),
            ),
            loan.principal,
        );

        Ok(())
    }

    /// Borrower or third-party submits installment / full loan repayment.
    pub fn repay_loan(
        env: Env,
        loan_id: u64,
        payer: Address,
        amount: i128,
    ) -> Result<(), LoanError> {
        payer.require_auth();

        if amount <= 0 {
            return Err(LoanError::InvalidAmount);
        }

        let mut loan = get_loan(&env, loan_id)?;

        if loan.status != LoanStatus::Active {
            return Err(LoanError::InvalidState);
        }

        let remaining = loan.total_repayment_amount - loan.amount_repaid;
        if amount > remaining {
            return Err(LoanError::OverpaymentNotAllowed);
        }

        let lender = loan.lender.clone().ok_or(LoanError::InvalidState)?;
        let config = get_config(&env)?;

        // Calculate optional platform fee
        let fee_amount = if config.platform_fee_bps > 0 {
            (amount as u128 * config.platform_fee_bps as u128 / BPS_BASE as u128) as i128
        } else {
            0
        };
        let lender_net_amount = amount - fee_amount;

        // 1. Transfer tokens from payer to lender (and fee collector)
        let token_client = token::Client::new(&env, &loan.token);
        if fee_amount > 0 {
            token_client.transfer(&payer, &config.fee_collector, &fee_amount);
        }
        token_client.transfer(&payer, &lender, &lender_net_amount);

        // 2. Repayment Schedule & On-time tracking
        let now = env.ledger().timestamp();
        let on_time = now <= loan.schedule.next_due_timestamp;

        loan.amount_repaid += amount;
        loan.schedule.installments_paid += 1;
        loan.schedule.next_due_timestamp = now + loan.schedule.interval_seconds;

        let completed = loan.amount_repaid >= loan.total_repayment_amount;
        if completed {
            loan.status = LoanStatus::Repaid;
        }

        set_loan(&env, &loan);

        // 3. Inter-contract call to ReputationRegistry
        let rep_client = ReputationRegistryClient::new(&env, &config.reputation_contract);
        rep_client.record_repayment(&loan.borrower, &amount, &on_time);

        if completed {
            rep_client.record_completion(&loan.borrower);
            let interest_earned = loan.total_repayment_amount - loan.principal;
            rep_client.record_yield(&lender, &interest_earned);

            env.events().publish(
                (
                    Symbol::new(&env, "loan_complete"),
                    loan_id,
                    loan.borrower.clone(),
                ),
                loan.total_repayment_amount,
            );
        }

        extend_instance_ttl(&env);

        env.events().publish(
            (Symbol::new(&env, "loan_repay"), loan_id, payer),
            (
                amount,
                loan.total_repayment_amount - loan.amount_repaid,
                on_time,
            ),
        );

        Ok(())
    }

    /// Check if loan maturity timestamp has passed without full payment and mark as Defaulted.
    pub fn check_and_mark_default(
        env: Env,
        loan_id: u64,
        caller: Address,
    ) -> Result<(), LoanError> {
        caller.require_auth();

        let mut loan = get_loan(&env, loan_id)?;

        if loan.status != LoanStatus::Active {
            return Err(LoanError::InvalidState);
        }

        let now = env.ledger().timestamp();
        if now <= loan.maturity_timestamp {
            return Err(LoanError::RepaymentDeadlineNotPassed);
        }

        let remaining = loan.total_repayment_amount - loan.amount_repaid;
        loan.status = LoanStatus::Defaulted;
        set_loan(&env, &loan);

        let config = get_config(&env)?;
        let rep_client = ReputationRegistryClient::new(&env, &config.reputation_contract);
        rep_client.record_default(&loan.borrower, &remaining);

        extend_instance_ttl(&env);

        env.events().publish(
            (
                Symbol::new(&env, "loan_default"),
                loan_id,
                loan.borrower.clone(),
            ),
            remaining,
        );

        Ok(())
    }

    /// Get loan details by ID.
    pub fn get_loan(env: Env, loan_id: u64) -> Result<Loan, LoanError> {
        get_loan(&env, loan_id)
    }

    /// Get total loan count created.
    pub fn get_loan_count(env: Env) -> u64 {
        get_loan_count(&env)
    }

    /// Get contract config parameters.
    pub fn get_config(env: Env) -> Result<Config, LoanError> {
        get_config(&env)
    }

    /// Get contract admin.
    pub fn get_admin(env: Env) -> Result<Address, LoanError> {
        get_admin(&env)
    }
}
