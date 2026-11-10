*** Settings ***
Documentation       Cart pricing decision table (REQ-PRC) — data-driven with Test Template.
...                 Each row = one rule of the decision table in Module 02.
...                 Arrange through the API, verify through the UI, compare with an independent oracle.
Resource            ../../resources/common.resource
Resource            ../../resources/pages/cart_checkout_page.resource
Suite Setup         Open ShopLab Browser
Test Template       Cart Total Should Follow Pricing Rules
Test Tags           ui    pricing    data-driven


*** Test Cases ***                          SKU         QTY    COUPON       SHIPPING    DISCOUNT    FREESHIP    MESSAGE
R1 Below Free Shipping Threshold            BOOK-002    1      ${NONE}      standard    0           False       ${NONE}
R2 Exactly On Threshold (BUG-01)            ELEC-003    1      ${NONE}      standard    0           False       ${NONE}
R4 Discount Applied Before VAT (BUG-02)     ELEC-003    1      SAVE10       standard    100         False       Coupon SAVE10 applied
R5 Percent Discount Is Capped               ELEC-004    1      SAVE10       standard    500         False       Coupon SAVE10 applied
R6 Fixed Coupon Above Minimum               FASH-003    1      BIG500       standard    500         False       ${NONE}
R7 Fixed Coupon Below Minimum               FASH-001    1      BIG500       standard    0           False       Subtotal is too low for this coupon
R8 Free Shipping Coupon                     FASH-001    1      FREESHIP     standard    0           True        ${NONE}
R9 Expired Coupon Is Rejected (BUG-07)      FASH-001    1      EXPIRED20    standard    0           False       Coupon has expired
R11 Express Shipping Always Charged         ELEC-001    1      ${NONE}      express     0           False       ${NONE}


*** Keywords ***
Cart Total Should Follow Pricing Rules
    [Arguments]    ${sku}    ${qty}    ${coupon}    ${shipping}    ${discount}    ${free_ship}    ${message}
    # Arrange — via API (fast, no UI clicks)
    ${user}=    Create Test User
    Open Page As User    ${user}    /
    ${resp}=    Add To Cart Via API    ${sku}    ${qty}
    ${subtotal}=    Set Variable    ${resp.json()}[subtotal]
    # Act — via UI
    Go To Cart
    IF    '${shipping}' == 'express'    Choose Shipping    express
    IF    $coupon is not None    Apply Coupon    ${coupon}
    IF    $message is not None    Coupon Message Should Be    ${message}
    # Assert — UI summary equals the oracle
    ${expected}=    Expected Quote    ${subtotal}    ${discount}    ${shipping}    ${free_ship}
    ${actual}=    Read Cart Summary
    Dictionaries Should Be Equal    ${actual}    ${expected}
    [Teardown]    Close Context
