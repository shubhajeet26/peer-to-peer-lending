#![cfg(test)]

use crate::{types::ReputationError, ReputationRegistry, ReputationRegistryClient};
use soroban_sdk::{testutils::Address as _, Address, Env};

fn setup_test() -> (Env, Address, Address, ReputationRegistryClient<'static>) {
    let env = Env::default();
    env.mock_all_auths();

    let admin = Address::generate(&env);
    let loan_manager = Address::generate(&env);

    let contract_id = env.register(ReputationRegistry, ());
    let client = ReputationRegistryClient::new(&env, &contract_id);

    (env, admin, loan_manager, client)
}

#[test]
fn test_initialization() {
    let (_env, admin, loan_manager, client) = setup_test();

    client.initialize(&admin, &loan_manager);

    assert_eq!(client.get_admin(), admin);
    assert_eq!(client.get_loan_manager(), loan_manager);
}

#[test]
fn test_double_initialization_fails() {
    let (_env, admin, loan_manager, client) = setup_test();

    client.initialize(&admin, &loan_manager);
    let res = client.try_initialize(&admin, &loan_manager);
    assert_eq!(res, Err(Ok(ReputationError::AlreadyInitialized)));
}

#[test]
fn test_borrower_reputation_lifecycle() {
    let (env, admin, loan_manager, client) = setup_test();
    client.initialize(&admin, &loan_manager);

    let borrower = Address::generate(&env);

    // Initial check
    let rep0 = client.get_borrower_reputation(&borrower);
    assert_eq!(rep0.credit_score, 600);
    assert_eq!(rep0.total_loans, 0);

    // Record loan creation
    client.record_loan_created(&borrower, &1_000_0000000);
    let rep1 = client.get_borrower_reputation(&borrower);
    assert_eq!(rep1.total_loans, 1);
    assert_eq!(rep1.total_borrowed, 1_000_0000000);

    // Record on-time repayment
    client.record_repayment(&borrower, &500_0000000, &true);
    let rep2 = client.get_borrower_reputation(&borrower);
    assert_eq!(rep2.total_repaid, 500_0000000);
    assert_eq!(rep2.on_time_repayments, 1);
    assert_eq!(rep2.credit_score, 605); // 600 + 5

    // Record completion
    client.record_completion(&borrower);
    let rep3 = client.get_borrower_reputation(&borrower);
    assert_eq!(rep3.completed_loans, 1);
    assert_eq!(rep3.credit_score, 635); // 605 + 30
}

#[test]
fn test_default_penalty() {
    let (env, admin, loan_manager, client) = setup_test();
    client.initialize(&admin, &loan_manager);

    let borrower = Address::generate(&env);

    client.record_loan_created(&borrower, &5_000_0000000);
    client.record_default(&borrower, &5_000_0000000);

    let rep = client.get_borrower_reputation(&borrower);
    assert_eq!(rep.defaulted_loans, 1);
    assert_eq!(rep.credit_score, 500); // 600 - 100
}

#[test]
fn test_score_limits() {
    let (env, admin, loan_manager, client) = setup_test();
    client.initialize(&admin, &loan_manager);

    let borrower = Address::generate(&env);

    // 4 defaults -> 600 - 400 = 200 -> clamped to min 300
    for _ in 0..4 {
        client.record_default(&borrower, &1_000_0000000);
    }
    let rep = client.get_borrower_reputation(&borrower);
    assert_eq!(rep.credit_score, 300);
}
