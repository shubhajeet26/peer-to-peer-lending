#![no_std]

pub mod storage;
pub mod types;

#[cfg(test)]
mod test;

use soroban_sdk::{contract, contractimpl, symbol_short, Address, Env, Symbol};
use storage::*;
use types::*;

#[contract]
pub struct ReputationRegistry;

#[contractimpl]
impl ReputationRegistry {
    /// Initialize the Reputation Registry with admin and authorized loan_manager address.
    pub fn initialize(
        env: Env,
        admin: Address,
        loan_manager: Address,
    ) -> Result<(), ReputationError> {
        if is_initialized(&env) {
            return Err(ReputationError::AlreadyInitialized);
        }

        admin.require_auth();

        set_admin(&env, &admin);
        set_loan_manager(&env, &loan_manager);
        set_initialized(&env);
        extend_instance_ttl(&env);

        env.events()
            .publish((symbol_short!("init"), admin), loan_manager);

        Ok(())
    }

    /// Admin update authorized loan manager contract address.
    pub fn set_loan_manager(env: Env, new_loan_manager: Address) -> Result<(), ReputationError> {
        let admin = get_admin(&env)?;
        admin.require_auth();

        set_loan_manager(&env, &new_loan_manager);
        extend_instance_ttl(&env);

        env.events()
            .publish((symbol_short!("set_lm"), admin), new_loan_manager);

        Ok(())
    }

    /// Record a new loan creation for borrower (called by loan_manager).
    pub fn record_loan_created(
        env: Env,
        borrower: Address,
        amount: i128,
    ) -> Result<(), ReputationError> {
        Self::require_loan_manager_auth(&env)?;

        let mut rep = get_borrower_rep(&env, &borrower);
        rep.total_loans += 1;
        rep.total_borrowed += amount;
        rep.last_updated = env.ledger().timestamp();

        set_borrower_rep(&env, &borrower, &rep);
        extend_instance_ttl(&env);

        env.events()
            .publish((Symbol::new(&env, "loan_req"), borrower), amount);

        Ok(())
    }

    /// Record funding contribution by a lender (called by loan_manager).
    pub fn record_funding(env: Env, lender: Address, amount: i128) -> Result<(), ReputationError> {
        Self::require_loan_manager_auth(&env)?;

        let mut rep = get_lender_rep(&env, &lender);
        rep.total_funded_loans += 1;
        rep.total_amount_funded += amount;
        rep.last_updated = env.ledger().timestamp();

        set_lender_rep(&env, &lender, &rep);
        extend_instance_ttl(&env);

        env.events()
            .publish((Symbol::new(&env, "fund_req"), lender), amount);

        Ok(())
    }

    /// Record a repayment made by borrower (called by loan_manager).
    pub fn record_repayment(
        env: Env,
        borrower: Address,
        amount_paid: i128,
        on_time: bool,
    ) -> Result<(), ReputationError> {
        Self::require_loan_manager_auth(&env)?;

        let mut rep = get_borrower_rep(&env, &borrower);
        rep.total_repaid += amount_paid;
        if on_time {
            rep.on_time_repayments += 1;
        } else {
            rep.late_repayments += 1;
        }

        rep.credit_score = Self::calculate_credit_score(&rep);
        rep.last_updated = env.ledger().timestamp();

        set_borrower_rep(&env, &borrower, &rep);
        extend_instance_ttl(&env);

        env.events().publish(
            (Symbol::new(&env, "repay_rec"), borrower),
            (amount_paid, on_time, rep.credit_score),
        );

        Ok(())
    }

    /// Record completed loan for borrower (called by loan_manager).
    pub fn record_completion(env: Env, borrower: Address) -> Result<(), ReputationError> {
        Self::require_loan_manager_auth(&env)?;

        let mut rep = get_borrower_rep(&env, &borrower);
        rep.completed_loans += 1;
        rep.credit_score = Self::calculate_credit_score(&rep);
        rep.last_updated = env.ledger().timestamp();

        set_borrower_rep(&env, &borrower, &rep);
        extend_instance_ttl(&env);

        env.events()
            .publish((Symbol::new(&env, "comp_rec"), borrower), rep.credit_score);

        Ok(())
    }

    /// Record defaulted loan for borrower (called by loan_manager).
    pub fn record_default(
        env: Env,
        borrower: Address,
        _amount_defaulted: i128,
    ) -> Result<(), ReputationError> {
        Self::require_loan_manager_auth(&env)?;

        let mut rep = get_borrower_rep(&env, &borrower);
        rep.defaulted_loans += 1;
        rep.credit_score = Self::calculate_credit_score(&rep);
        rep.last_updated = env.ledger().timestamp();

        set_borrower_rep(&env, &borrower, &rep);
        extend_instance_ttl(&env);

        env.events()
            .publish((Symbol::new(&env, "def_rec"), borrower), rep.credit_score);

        Ok(())
    }

    /// Record yield earned by lender (called by loan_manager).
    pub fn record_yield(
        env: Env,
        lender: Address,
        yield_amount: i128,
    ) -> Result<(), ReputationError> {
        Self::require_loan_manager_auth(&env)?;

        let mut rep = get_lender_rep(&env, &lender);
        rep.total_yield_earned += yield_amount;
        rep.last_updated = env.ledger().timestamp();

        set_lender_rep(&env, &lender, &rep);
        extend_instance_ttl(&env);

        env.events()
            .publish((Symbol::new(&env, "yield_rec"), lender), yield_amount);

        Ok(())
    }

    /// Read borrower reputation profile.
    pub fn get_borrower_reputation(env: Env, borrower: Address) -> BorrowerReputation {
        get_borrower_rep(&env, &borrower)
    }

    /// Read lender reputation profile.
    pub fn get_lender_reputation(env: Env, lender: Address) -> LenderReputation {
        get_lender_rep(&env, &lender)
    }

    /// Read contract admin address.
    pub fn get_admin(env: Env) -> Result<Address, ReputationError> {
        get_admin(&env)
    }

    /// Read authorized loan manager contract address.
    pub fn get_loan_manager(env: Env) -> Result<Address, ReputationError> {
        get_loan_manager(&env)
    }

    // Helper: Require caller to be authorized loan_manager contract
    fn require_loan_manager_auth(env: &Env) -> Result<(), ReputationError> {
        let lm = get_loan_manager(env)?;
        lm.require_auth();
        Ok(())
    }

    // Deterministic credit score calculation formula:
    // Base: 600
    // +30 per completed loan
    // +5 per on-time repayment
    // -10 per late repayment
    // -100 per defaulted loan
    // Min score: 300, Max score: 1000
    fn calculate_credit_score(rep: &BorrowerReputation) -> u32 {
        let base: i32 = 600;
        let bonus = (rep.completed_loans as i32 * 30) + (rep.on_time_repayments as i32 * 5);
        let penalties = (rep.late_repayments as i32 * 10) + (rep.defaulted_loans as i32 * 100);

        let raw_score = base + bonus - penalties;

        if raw_score < 300 {
            300
        } else if raw_score > 1000 {
            1000
        } else {
            raw_score as u32
        }
    }
}
