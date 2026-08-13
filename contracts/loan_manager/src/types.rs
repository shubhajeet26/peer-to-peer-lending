use soroban_sdk::{contracterror, contracttype, Address, BytesN};

#[contracterror]
#[derive(Copy, Clone, Debug, Eq, PartialEq, PartialOrd, Ord)]
#[repr(u32)]
pub enum LoanError {
    NotInitialized = 1,
    AlreadyInitialized = 2,
    Unauthorized = 3,
    InvalidAmount = 4,
    InvalidInterestRate = 5,
    InvalidDuration = 6,
    InvalidState = 7,
    LoanNotFound = 8,
    LoanAlreadyFunded = 9,
    LoanAlreadyCompleted = 10,
    InsufficientFunding = 11,
    InvalidRepayment = 12,
    UnauthorizedContract = 13,
    InvalidConfiguration = 14,
    RepaymentDeadlineNotPassed = 15,
    OverpaymentNotAllowed = 16,
    InvalidInstallments = 17,
}

#[contracttype]
#[derive(Copy, Clone, Debug, Eq, PartialEq)]
#[repr(u32)]
pub enum LoanStatus {
    Created = 0,
    Funded = 1,
    Active = 2,
    Repaid = 3,
    Defaulted = 4,
    Cancelled = 5,
}

#[contracttype]
#[derive(Clone, Debug, Eq, PartialEq)]
pub enum DataKey {
    Admin,
    Config,
    LoanCount,
    Initialized,
    Loan(u64),
}

#[contracttype]
#[derive(Clone, Debug, Eq, PartialEq)]
pub struct Config {
    pub reputation_contract: Address,
    pub platform_fee_bps: u32,
    pub fee_collector: Address,
}

#[contracttype]
#[derive(Clone, Debug, Eq, PartialEq)]
pub struct RepaymentSchedule {
    pub total_installments: u32,
    pub installments_paid: u32,
    pub interval_seconds: u64,
    pub installment_amount: i128,
    pub next_due_timestamp: u64,
}

#[contracttype]
#[derive(Clone, Debug, Eq, PartialEq)]
pub struct Loan {
    pub id: u64,
    pub borrower: Address,
    pub lender: Option<Address>,
    pub token: Address,
    pub principal: i128,
    pub interest_rate_bps: u32,
    pub duration_seconds: u64,
    pub created_at: u64,
    pub funded_at: u64,
    pub maturity_timestamp: u64,
    pub amount_funded: i128,
    pub total_repayment_amount: i128,
    pub amount_repaid: i128,
    pub status: LoanStatus,
    pub schedule: RepaymentSchedule,
    pub purpose_hash: BytesN<32>,
}
