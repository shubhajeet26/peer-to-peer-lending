#![cfg(test)]

use crate::{types::*, LoanManager, LoanManagerClient};
use reputation_registry::{ReputationRegistry, ReputationRegistryClient};
use soroban_sdk::{
    testutils::{Address as _, Ledger},
    token::{Client as TokenClient, StellarAssetClient as TokenAdminClient},
    Address, BytesN, Env,
};

fn setup_test() -> (
    Env,
    Address,
    Address,
    Address,
    Address,
    LoanManagerClient<'static>,
    ReputationRegistryClient<'static>,
) {
    let env = Env::default();
    env.mock_all_auths();

    let admin = Address::generate(&env);
    let fee_collector = Address::generate(&env);
    let token_admin = Address::generate(&env);

    let token_contract = env.register_stellar_asset_contract_v2(token_admin.clone());
    let token_address = token_contract.address();

    let rep_contract_id = env.register(ReputationRegistry, ());
    let rep_client = ReputationRegistryClient::new(&env, &rep_contract_id);

    let lm_contract_id = env.register(LoanManager, ());
    let lm_client = LoanManagerClient::new(&env, &lm_contract_id);

    rep_client.initialize(&admin, &lm_contract_id);
    lm_client.initialize(&admin, &rep_contract_id, &100, &fee_collector);

    (
        env,
        admin,
        fee_collector,
        token_admin,
        token_address,
        lm_client,
        rep_client,
    )
}

#[test]
fn test_create_and_cancel_loan() {
    let (env, _admin, _fee_collector, _token_admin, token, lm_client, rep_client) = setup_test();

    let borrower = Address::generate(&env);
    let purpose_hash = BytesN::from_array(&env, &[1u8; 32]);

    let loan_id = lm_client.create_loan(
        &borrower,
        &token,
        &1_000_0000000,
        &1000,
        &2592000,
        &4,
        &purpose_hash,
    );

    assert_eq!(loan_id, 1);
    let loan = lm_client.get_loan(&loan_id);
    assert_eq!(loan.principal, 1_000_0000000);
    assert_eq!(loan.status, LoanStatus::Created);

    let borrower_rep = rep_client.get_borrower_reputation(&borrower);
    assert_eq!(borrower_rep.total_loans, 1);
    assert_eq!(borrower_rep.total_borrowed, 1_000_0000000);

    lm_client.cancel_loan(&loan_id, &borrower);
    let updated_loan = lm_client.get_loan(&loan_id);
    assert_eq!(updated_loan.status, LoanStatus::Cancelled);
}

#[test]
fn test_funding_disbursement_repayment_and_completion_lifecycle() {
    let (env, _admin, _fee_collector, token_admin, token_address, lm_client, rep_client) =
        setup_test();

    let borrower = Address::generate(&env);
    let lender = Address::generate(&env);
    let purpose_hash = BytesN::from_array(&env, &[2u8; 32]);

    let token_admin_client = TokenAdminClient::new(&env, &token_address);
    token_admin_client.mint(&lender, &5_000_0000000);

    let principal = 1_000_0000000;
    let loan_id = lm_client.create_loan(
        &borrower,
        &token_address,
        &principal,
        &1000,
        &31536000,
        &1,
        &purpose_hash,
    );

    let loan_created = lm_client.get_loan(&loan_id);
    assert_eq!(loan_created.total_repayment_amount, 1_100_0000000);

    lm_client.fund_loan(&loan_id, &lender);

    let token_client = TokenClient::new(&env, &token_address);
    assert_eq!(token_client.balance(&borrower), 1_000_0000000);
    assert_eq!(token_client.balance(&lender), 4_000_0000000);

    let funded_loan = lm_client.get_loan(&loan_id);
    assert_eq!(funded_loan.status, LoanStatus::Active);

    let lender_rep = rep_client.get_lender_reputation(&lender);
    assert_eq!(lender_rep.total_funded_loans, 1);
    assert_eq!(lender_rep.total_amount_funded, 1_000_0000000);

    token_admin_client.mint(&borrower, &500_0000000);

    lm_client.repay_loan(&loan_id, &borrower, &1_100_0000000);

    let completed_loan = lm_client.get_loan(&loan_id);
    assert_eq!(completed_loan.status, LoanStatus::Repaid);

    let final_borrower_rep = rep_client.get_borrower_reputation(&borrower);
    assert_eq!(final_borrower_rep.completed_loans, 1);
    assert_eq!(final_borrower_rep.credit_score, 635);
}

#[test]
fn test_default_handling() {
    let (env, _admin, _fee_collector, _token_admin, token_address, lm_client, rep_client) =
        setup_test();

    let borrower = Address::generate(&env);
    let lender = Address::generate(&env);
    let purpose_hash = BytesN::from_array(&env, &[3u8; 32]);

    let token_admin_client = TokenAdminClient::new(&env, &token_address);
    token_admin_client.mint(&lender, &2_000_0000000);

    let loan_id = lm_client.create_loan(
        &borrower,
        &token_address,
        &1_000_0000000,
        &1000,
        &86400,
        &1,
        &purpose_hash,
    );

    lm_client.fund_loan(&loan_id, &lender);

    env.ledger().set_timestamp(env.ledger().timestamp() + 100000);

    let caller = Address::generate(&env);
    lm_client.check_and_mark_default(&loan_id, &caller);

    let defaulted_loan = lm_client.get_loan(&loan_id);
    assert_eq!(defaulted_loan.status, LoanStatus::Defaulted);

    let borrower_rep = rep_client.get_borrower_reputation(&borrower);
    assert_eq!(borrower_rep.defaulted_loans, 1);
    assert_eq!(borrower_rep.credit_score, 500);
}

#[test]
fn test_invalid_parameter_validations() {
    let (env, _admin, _fee_collector, _token_admin, token, lm_client, _rep_client) = setup_test();

    let borrower = Address::generate(&env);
    let purpose_hash = BytesN::from_array(&env, &[4u8; 32]);

    let res1 = lm_client.try_create_loan(
        &borrower,
        &token,
        &0,
        &1000,
        &86400,
        &1,
        &purpose_hash,
    );
    assert_eq!(res1, Err(Ok(LoanError::InvalidAmount)));

    let res2 = lm_client.try_create_loan(
        &borrower,
        &token,
        &1_000_0000000,
        &0,
        &86400,
        &1,
        &purpose_hash,
    );
    assert_eq!(res2, Err(Ok(LoanError::InvalidInterestRate)));
}
