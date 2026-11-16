*** Settings ***
Documentation       Page object for the LoanLab pages (/loanlab/*). Locators live here ONLY.
Resource            ../browser.resource


*** Variables ***
${LL_BUSINESS_DATE}         data-testid=business-date
${LL_AMOUNT}                data-testid=amount
${LL_PAY_BUTTON}            data-testid=pay-button
${LL_PAY_FULL}              data-testid=pay-full
${LL_OUTSTANDING}           data-testid=outstanding
${LL_MINIMUM}               data-testid=minimum-payment
${LL_PAYMENT_ERROR}         data-testid=payment-error
${LL_PAYMENT_MESSAGE}       data-testid=payment-message
${LL_RECEIPT_REF}           data-testid=receipt-ref
${LL_RECEIPT_BALANCE}       data-testid=receipt-balance
${LL_LOAN_STATUS}           data-testid=loan-status
${LL_VIEW_HISTORY}          data-testid=view-history
${LL_TXN_ROW}               data-testid=txn-row
${LL_TXN_STATUS}            data-testid=txn-status
${LL_TXN_AMOUNT}            data-testid=txn-amount


*** Keywords ***
Open Payment Page For Loan
    [Arguments]    ${loan_id}
    Go To    ${BASE_URL}/loanlab/payment?loanId=${loan_id}
    Wait For Elements State    ${LL_PAY_BUTTON}    visible

Open Loan From Account Overview
    [Documentation]    Account overview -> the "Pay" link of the given loan.
    [Arguments]    ${loan_id}
    Go To    ${BASE_URL}/loanlab/
    Click    [data-testid="loan-row"][data-loan-id="${loan_id}"] >> data-testid=pay-link
    Wait For Elements State    ${LL_PAY_BUTTON}    visible

Submit Payment
    [Arguments]    ${amount}
    Fill Text    ${LL_AMOUNT}    ${amount}
    Click    ${LL_PAY_BUTTON}

Outstanding Balance Should Show
    [Arguments]    ${text}
    Get Text    ${LL_OUTSTANDING}    ==    ${text}

Payment Should Be Rejected With
    [Arguments]    ${message}
    Get Text    ${LL_PAYMENT_ERROR}    ==    ${message}

Payment Receipt Should Show Balance
    [Arguments]    ${text}
    Get Text    ${LL_RECEIPT_REF}    matches    ^PM-\\d{8}-\\d{6}$
    Get Text    ${LL_RECEIPT_BALANCE}    ==    ${text}

Open History From Receipt
    Click    ${LL_VIEW_HISTORY}
    Wait For Elements State    ${LL_TXN_ROW} >> nth=0    visible

History Should Show Latest Transaction
    [Arguments]    ${amount_text}    ${status}
    Get Text    ${LL_TXN_ROW} >> nth=0 >> ${LL_TXN_AMOUNT}    ==    ${amount_text}
    Get Text    ${LL_TXN_ROW} >> nth=0 >> ${LL_TXN_STATUS}    ==    ${status}
