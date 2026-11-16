*** Settings ***
Documentation       LoanLab API keywords (RequestsLibrary): test hooks to arrange data, plus payment,
...                 reversal and end-of-day calls. Requirements: practice-app/REQUIREMENTS-LOANLAB.md
Resource            shoplab_api.resource
Library             String


*** Keywords ***
Create Loan For Customer
    [Documentation]    Test hook: an account + loan for an existing customer, directly in the requested state.
    ...                Returns the loan dictionary (id, loanNo, outstanding, status, accountId ...).
    [Arguments]    ${username}    ${outstanding}=10000    ${account_status}=ACTIVE
    Create ShopLab Session    ll_hooks
    ${body}=    Create Dictionary    username=${username}    accountStatus=${account_status}    outstanding=${{ float(${outstanding}) }}
    ${resp}=    POST On Session    ll_hooks    /api/test/loanlab/accounts    json=${body}    expected_status=201
    RETURN    ${resp.json()}[loan]

Customer With A Loan
    [Documentation]    A fresh customer, logged in on session ``alias``, with one loan. Returns the loan.
    [Arguments]    ${outstanding}=10000    ${account_status}=ACTIVE    ${alias}=shoplab
    ${user}=    Create Test User
    Login Via API    ${user}    alias=${alias}
    ${loan}=    Create Loan For Customer    ${user}[username]    ${outstanding}    ${account_status}
    Set Test Variable    ${LOAN_USER}    ${user}
    RETURN    ${loan}

Pay Loan Via API
    [Arguments]    ${loan_id}    ${amount}    ${alias}=shoplab    ${expected_status}=201
    ${body}=    Create Dictionary    amount=${{ float(${amount}) }}
    ${resp}=    POST On Session    ${alias}    /api/loanlab/loans/${loan_id}/payments    json=${body}    expected_status=${expected_status}
    RETURN    ${resp}

Get Loan Via API
    [Arguments]    ${loan_id}    ${alias}=shoplab    ${expected_status}=200
    ${resp}=    GET On Session    ${alias}    /api/loanlab/loans/${loan_id}    expected_status=${expected_status}
    RETURN    ${resp.json()}

Loan Balance Should Be
    [Arguments]    ${loan_id}    ${expected}    ${status}=${None}    ${alias}=shoplab
    ${loan}=    Get Loan Via API    ${loan_id}    ${alias}
    Should Be Equal As Numbers    ${loan}[outstanding]    ${expected}
    IF    $status is not None    Should Be Equal    ${loan}[status]    ${status}

Get Transaction Via API
    [Arguments]    ${txn_id}    ${alias}=shoplab
    ${resp}=    GET On Session    ${alias}    /api/loanlab/transactions/${txn_id}    expected_status=200
    RETURN    ${resp.json()}

Login As Officer
    [Documentation]    The seeded admin acts as the back-office officer.
    Login Via API    ${ADMIN}    alias=officer

Unique Reversal Reference
    ${suffix}=    Generate Random String    10    [UPPER][NUMBERS]
    RETURN    RF-${suffix}

Reverse Payment Via API
    [Documentation]    ``amount`` empty = reverse everything that is left. ``reference`` empty = a new unique one.
    [Arguments]    ${txn_id}    ${amount}=${None}    ${reference}=${None}    ${alias}=officer    ${expected_status}=201
    IF    $reference is None
        ${reference}=    Unique Reversal Reference
    END
    ${body}=    Create Dictionary    originalTransactionId=${txn_id}    reference=${reference}    reason=Robot acceptance test reversal
    IF    $amount is not None    Set To Dictionary    ${body}    amount=${{ float(${amount}) }}
    ${resp}=    POST On Session    ${alias}    /api/loanlab/reversals    json=${body}    expected_status=${expected_status}
    RETURN    ${resp}

Set Business Date
    [Arguments]    ${date}
    Create ShopLab Session    ll_hooks
    ${body}=    Create Dictionary    date=${date}
    POST On Session    ll_hooks    /api/test/loanlab/business-date    json=${body}    expected_status=200

Business Date Should Be
    [Arguments]    ${expected}
    Create ShopLab Session    ll_hooks
    ${resp}=    GET On Session    ll_hooks    /api/test/loanlab/business-date    expected_status=200
    Should Be Equal    ${resp.json()}[businessDate]    ${expected}

Run End Of Day
    [Documentation]    Test hook: runs EOD for the current business date and returns the run (status, breaks ...).
    Create ShopLab Session    ll_hooks
    ${resp}=    POST On Session    ll_hooks    /api/test/loanlab/eod    expected_status=201
    RETURN    ${resp.json()}

Force Loan Balance
    [Documentation]    Fault injection: changes the stored balance without a ledger entry.
    [Arguments]    ${loan_id}    ${outstanding}
    Create ShopLab Session    ll_hooks
    ${body}=    Create Dictionary    outstanding=${{ float(${outstanding}) }}
    PATCH On Session    ll_hooks    /api/test/loanlab/loans/${loan_id}    json=${body}    expected_status=200
