use crate::types::{BorrowerReputation, DataKey, LenderReputation, ReputationError};
use soroban_sdk::{Address, Env};

pub const DAY_IN_LEDGERS: u32 = 17280; // ~5 sec per ledger = 17280 ledgers / day
pub const INSTANCE_BUMP_AMOUNT: u32 = 30 * DAY_IN_LEDGERS; // 30 days
pub const INSTANCE_LIFETIME_THRESHOLD: u32 = 7 * DAY_IN_LEDGERS; // 7 days

pub const PERSISTENT_BUMP_AMOUNT: u32 = 60 * DAY_IN_LEDGERS; // 60 days
pub const PERSISTENT_LIFETIME_THRESHOLD: u32 = 14 * DAY_IN_LEDGERS; // 14 days

pub fn extend_instance_ttl(env: &Env) {
    env.storage()
        .instance()
        .extend_ttl(INSTANCE_LIFETIME_THRESHOLD, INSTANCE_BUMP_AMOUNT);
}

pub fn set_initialized(env: &Env) {
    env.storage().instance().set(&DataKey::Initialized, &true);
}

pub fn is_initialized(env: &Env) -> bool {
    env.storage()
        .instance()
        .get::<DataKey, bool>(&DataKey::Initialized)
        .unwrap_or(false)
}

pub fn set_admin(env: &Env, admin: &Address) {
    env.storage().instance().set(&DataKey::Admin, admin);
}

pub fn get_admin(env: &Env) -> Result<Address, ReputationError> {
    env.storage()
        .instance()
        .get::<DataKey, Address>(&DataKey::Admin)
        .ok_or(ReputationError::NotInitialized)
}

pub fn set_loan_manager(env: &Env, loan_manager: &Address) {
    env.storage()
        .instance()
        .set(&DataKey::LoanManager, loan_manager);
}

pub fn get_loan_manager(env: &Env) -> Result<Address, ReputationError> {
    env.storage()
        .instance()
        .get::<DataKey, Address>(&DataKey::LoanManager)
        .ok_or(ReputationError::NotInitialized)
}

pub fn get_borrower_rep(env: &Env, borrower: &Address) -> BorrowerReputation {
    let key = DataKey::BorrowerRep(borrower.clone());
    if let Some(rep) = env
        .storage()
        .persistent()
        .get::<DataKey, BorrowerReputation>(&key)
    {
        env.storage()
            .persistent()
            .extend_ttl(&key, PERSISTENT_LIFETIME_THRESHOLD, PERSISTENT_BUMP_AMOUNT);
        rep
    } else {
        BorrowerReputation {
            address: borrower.clone(),
            total_loans: 0,
            completed_loans: 0,
            defaulted_loans: 0,
            total_borrowed: 0,
            total_repaid: 0,
            on_time_repayments: 0,
            late_repayments: 0,
            credit_score: 600, // Base default score
            last_updated: env.ledger().timestamp(),
        }
    }
}

pub fn set_borrower_rep(env: &Env, borrower: &Address, rep: &BorrowerReputation) {
    let key = DataKey::BorrowerRep(borrower.clone());
    env.storage().persistent().set(&key, rep);
    env.storage()
        .persistent()
        .extend_ttl(&key, PERSISTENT_LIFETIME_THRESHOLD, PERSISTENT_BUMP_AMOUNT);
}

pub fn get_lender_rep(env: &Env, lender: &Address) -> LenderReputation {
    let key = DataKey::LenderRep(lender.clone());
    if let Some(rep) = env
        .storage()
        .persistent()
        .get::<DataKey, LenderReputation>(&key)
    {
        env.storage()
            .persistent()
            .extend_ttl(&key, PERSISTENT_LIFETIME_THRESHOLD, PERSISTENT_BUMP_AMOUNT);
        rep
    } else {
        LenderReputation {
            address: lender.clone(),
            total_funded_loans: 0,
            total_amount_funded: 0,
            total_yield_earned: 0,
            last_updated: env.ledger().timestamp(),
        }
    }
}

pub fn set_lender_rep(env: &Env, lender: &Address, rep: &LenderReputation) {
    let key = DataKey::LenderRep(lender.clone());
    env.storage().persistent().set(&key, rep);
    env.storage()
        .persistent()
        .extend_ttl(&key, PERSISTENT_LIFETIME_THRESHOLD, PERSISTENT_BUMP_AMOUNT);
}
