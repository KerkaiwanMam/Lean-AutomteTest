*** Settings ***
Documentation       LoanLab acceptance tests — loan payment, reversal and end-of-day
...                 (practice-app/REQUIREMENTS-LOANLAB.md). Every test builds its own customer and loan through
...                 the test hooks, then acts through the UI or the API.
...
...                 KEEP ALL LOANLAB TESTS IN THIS ONE SUITE FILE: the business date and EOD are state of the
...                 whole system. pabot runs suite FILES in parallel but the tests inside one file in order, so a
...                 single file guarantees that the EOD test never runs in the middle of a payment-then-reversal test.
Resource            ../../resources/common.resource
Resource            ../../resources/api/loanlab_api.resource
Resource            ../../resources/pages/loanlab_page.resource
Suite Setup         Open ShopLab Browser
Test Tags           loanlab


*** Test Cases ***
Customer Pays Part Of A Loan From The Payment Page
    [Documentation]    Acceptance test (BDD): LL-PAY-06, LL-PAY-07, LL-PAY-09, LL-RPT-01
    [Tags]    ui    smoke    bdd
    Given a customer with an outstanding loan of 10000 baht
    When the customer pays "499.99" baht
    Then the payment is rejected with "Minimum payment is 500.00 THB"
    And the outstanding balance shows "฿10,000.00"
    When the customer pays "1500.50" baht
    Then the receipt shows the new balance "฿8,499.50"
    And the payment history shows "฿1,500.50" with status "POSTED"
    And the API reports an outstanding balance of 8499.5

Payment Decision Table
    [Documentation]    Data-driven: one row per rule of the decision table (REQUIREMENTS-LOANLAB.md §3).
    ...                Guards LL-BUG-01 (R5), LL-BUG-02 (R3), LL-BUG-03 (R1), LL-BUG-04 and LL-BUG-05 (R6).
    [Tags]    api
    [Template]    Payment Should Result In
    # account    outstanding    amount      http    error code / balance after    loan status
    FROZEN       10000          1000        409     ACCOUNT_NOT_ACTIVE
    ACTIVE       0              500         409     LOAN_CLOSED
    ACTIVE       10000          10000.01    400     OVERPAYMENT
    ACTIVE       10000          499.99      400     BELOW_MINIMUM
    ACTIVE       300            299.99      400     BELOW_MINIMUM
    ACTIVE       10000          500         201     9500                          ACTIVE
    ACTIVE       10000          10000       201     0                             CLOSED
    ACTIVE       300            300         201     0                             CLOSED

Officer Reverses A Payment In Two Parts
    [Documentation]    LL-REV-04, LL-REV-07, LL-REV-09. Guards LL-BUG-06, LL-BUG-07, LL-BUG-13.
    [Tags]    api
    ${loan}=    Customer With A Loan    10000
    ${paid}=    Pay Loan Via API    ${loan}[id]    1000
    ${txn_id}=    Set Variable    ${paid.json()}[transaction][id]
    Login As Officer

    ${reference}=    Unique Reversal Reference
    ${first}=    Reverse Payment Via API    ${txn_id}    amount=400    reference=${reference}
    Should Be Equal    ${first.json()}[original][status]    PARTIALLY_REVERSED
    Loan Balance Should Be    ${loan}[id]    9400

    # the same request again is a duplicate: rejected, balance unchanged
    ${again}=    Reverse Payment Via API    ${txn_id}    amount=400    reference=${reference}    expected_status=409
    Should Be Equal    ${again.json()}[error][code]    DUPLICATE_REVERSAL
    Loan Balance Should Be    ${loan}[id]    9400

    ${rest}=    Reverse Payment Via API    ${txn_id}
    Should Be Equal As Numbers    ${rest.json()}[reversal][amount]    600
    Should Be Equal    ${rest.json()}[original][status]    REVERSED
    Loan Balance Should Be    ${loan}[id]    10000    ACTIVE

    ${third}=    Reverse Payment Via API    ${txn_id}    expected_status=409
    Should Be Equal    ${third.json()}[error][code]    ALREADY_REVERSED
    Loan Balance Should Be    ${loan}[id]    10000

Reversal Must Reference The Original Payment
    [Documentation]    LL-REV-02
    [Tags]    api
    Login As Officer
    ${body}=    Create Dictionary    reference=RF-NO-ORIGINAL    reason=No original transaction given
    ${resp}=    POST On Session    officer    /api/loanlab/reversals    json=${body}    expected_status=400
    Dictionary Should Contain Key    ${resp.json()}[error][details]    originalTransactionId
    ${unknown}=    Reverse Payment Via API    99999999    expected_status=404
    Should Be Equal    ${unknown.json()}[error][code]    TRANSACTION_NOT_FOUND

Customer Cannot Reverse Or Read Another Customer's Loan
    [Documentation]    LL-REV-01, LL-SEC-02. Guards LL-BUG-08 and LL-BUG-09.
    [Tags]    api    security
    ${loan}=    Customer With A Loan    10000
    ${paid}=    Pay Loan Via API    ${loan}[id]    1000
    Reverse Payment Via API    ${paid.json()}[transaction][id]    alias=shoplab    expected_status=403
    Loan Balance Should Be    ${loan}[id]    9000

    ${intruder}=    Create Test User
    Login Via API    ${intruder}    alias=intruder
    Get Loan Via API    ${loan}[id]    alias=intruder    expected_status=404
    GET On Session    intruder    /api/loanlab/loans/${loan}[id]/transactions    expected_status=404
    GET On Session    intruder    /api/loanlab/transactions/${paid.json()}[transaction][id]    expected_status=404

End Of Day Settles On The Next Business Day And Closes The Reversal Window
    [Documentation]    LL-EOD-04..07, LL-REV-05. Guards LL-BUG-10, LL-BUG-11, LL-BUG-12.
    ...                Changes the system business date — see the suite documentation.
    [Tags]    api    eod
    Set Business Date    2026-01-09    # a Friday
    ${loan}=    Customer With A Loan    10000
    ${paid}=    Pay Loan Via API    ${loan}[id]    1000
    ${txn_id}=    Set Variable    ${paid.json()}[transaction][id]
    Should Be Equal    ${paid.json()}[transaction][businessDate]    2026-01-09

    ${run}=    Run End Of Day
    Should Be Equal    ${run}[nextBusinessDate]    2026-01-12    # Friday -> Monday
    Business Date Should Be    2026-01-12
    ${txn}=    Get Transaction Via API    ${txn_id}
    Should Be Equal    ${txn}[settlementDate]    2026-01-12

    Login As Officer
    ${late}=    Reverse Payment Via API    ${txn_id}    expected_status=409
    Should Be Equal    ${late.json()}[error][code]    REVERSAL_WINDOW_CLOSED
    Loan Balance Should Be    ${loan}[id]    9000

    # reconciliation: a 0.01 difference between ledger and stored balance is a break
    Force Loan Balance    ${loan}[id]    9000.01
    ${broken}=    Run End Of Day
    Force Loan Balance    ${loan}[id]    9000
    Should Be Equal    ${broken}[status]    OUT_OF_BALANCE
    ${mine}=    Evaluate    [b for b in $broken['breaks'] if b['loanId'] == ${loan}[id]]
    Length Should Be    ${mine}    1
    Should Be Equal As Numbers    ${mine}[0][difference]    0.01


*** Keywords ***
A Customer With An Outstanding Loan Of ${amount} Baht
    ${loan}=    Customer With A Loan    ${amount}
    Set Test Variable    ${LOAN}    ${loan}
    ${token}=    Login Via API    ${LOAN_USER}
    New Context    baseURL=${BASE_URL}    locale=en-US    tracing=retain-on-failure
    Add Cookie    sl_token    ${token}    url=${BASE_URL}
    New Page    ${BASE_URL}/loanlab/
    Open Loan From Account Overview    ${LOAN}[id]

The Customer Pays "${amount}" Baht
    Submit Payment    ${amount}

The Payment Is Rejected With "${message}"
    Payment Should Be Rejected With    ${message}

The Outstanding Balance Shows "${text}"
    Outstanding Balance Should Show    ${text}

The Receipt Shows The New Balance "${text}"
    Payment Receipt Should Show Balance    ${text}
    Outstanding Balance Should Show    ${text}

The Payment History Shows "${amount_text}" With Status "${status}"
    Open History From Receipt
    History Should Show Latest Transaction    ${amount_text}    ${status}

The API Reports An Outstanding Balance Of ${expected}
    Loan Balance Should Be    ${LOAN}[id]    ${expected}

Payment Should Result In
    [Arguments]    ${account_status}    ${outstanding}    ${amount}    ${http}    ${outcome}    ${loan_status}=${None}
    ${loan}=    Customer With A Loan    ${outstanding}    ${account_status}
    ${resp}=    Pay Loan Via API    ${loan}[id]    ${amount}    expected_status=${http}
    IF    ${http} == 201
        Should Be Equal As Numbers    ${resp.json()}[loan][outstanding]    ${outcome}
        Loan Balance Should Be    ${loan}[id]    ${outcome}    ${loan_status}
    ELSE
        Should Be Equal    ${resp.json()}[error][code]    ${outcome}
        Loan Balance Should Be    ${loan}[id]    ${outstanding}
    END
