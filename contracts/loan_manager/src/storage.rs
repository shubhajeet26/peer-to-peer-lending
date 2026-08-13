use crate::types::{Config, DataKey, Loan, LoanError};
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

pub fn get_admin(env: &Env) -> Result<Address, LoanError> {
    env.storage()
        .instance()
        .get::<DataKey, Address>(&DataKey::Admin)
        .ok_or(LoanError::NotInitialized)
}

pub fn set_config(env: &Env, config: &Config) {
    env.storage().instance().set(&DataKey::Config, config);
}

pub fn get_config(env: &Env) -> Result<Config, LoanError> {
    env.storage()
        .instance()
        .get::<DataKey, Config>(&DataKey::Config)
        .ok_or(LoanError::NotInitialized)
}

pub fn get_loan_count(env: &Env) -> u64 {
    env.storage()
        .instance()
        .get::<DataKey, u64>(&DataKey::LoanCount)
        .unwrap_or(0)
}

pub fn increment_loan_count(env: &Env) -> u64 {
    let count = get_loan_count(env) + 1;
    env.storage().instance().set(&DataKey::LoanCount, &count);
    count
}

pub fn set_loan(env: &Env, loan: &Loan) {
    let key = DataKey::Loan(loan.id);
    env.storage().persistent().set(&key, loan);
    env.storage()
        .persistent()
        .extend_ttl(&key, PERSISTENT_LIFETIME_THRESHOLD, PERSISTENT_BUMP_AMOUNT);
}

pub fn get_loan(env: &Env, loan_id: u64) -> Result<Loan, LoanError> {
    let key = DataKey::Loan(loan_id);
    if let Some(loan) = env.storage().persistent().get::<DataKey, Loan>(&key) {
        env.storage()
            .persistent()
            .extend_ttl(&key, PERSISTENT_LIFETIME_THRESHOLD, PERSISTENT_BUMP_AMOUNT);
        Ok(loan)
    } else {
        Err(LoanError::LoanNotFound)
    }
}
