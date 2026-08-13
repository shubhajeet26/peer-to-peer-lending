use soroban_sdk::{contracterror, contracttype, Address};

#[contracterror]
#[derive(Copy, Clone, Debug, Eq, PartialEq, PartialOrd, Ord)]
#[repr(u32)]
pub enum ReputationError {
    NotInitialized = 1,
    AlreadyInitialized = 2,
    Unauthorized = 3,
    InvalidScore = 4,
    InvalidAddress = 5,
}

#[contracttype]
#[derive(Clone, Debug, Eq, PartialEq)]
pub enum DataKey {
    Admin,
    LoanManager,
    Initialized,
    BorrowerRep(Address),
    LenderRep(Address),
}

#[contracttype]
#[derive(Clone, Debug, Eq, PartialEq)]
pub struct BorrowerReputation {
    pub address: Address,
    pub total_loans: u32,
    pub completed_loans: u32,
    pub defaulted_loans: u32,
    pub total_borrowed: i128,
    pub total_repaid: i128,
    pub on_time_repayments: u32,
    pub late_repayments: u32,
    pub credit_score: u32,
    pub last_updated: u64,
}

#[contracttype]
#[derive(Clone, Debug, Eq, PartialEq)]
pub struct LenderReputation {
    pub address: Address,
    pub total_funded_loans: u32,
    pub total_amount_funded: i128,
    pub total_yield_earned: i128,
    pub last_updated: u64,
}
