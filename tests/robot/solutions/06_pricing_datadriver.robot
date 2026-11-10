*** Settings ***
Documentation       ⚠️ SPOILER (instructor key; this repository is public) — reference solution for Lab 12.2 (DataDriver).
...                 The pricing decision table lives in ../data/pricing.csv; a BA can add or change a row
...                 and a new test case appears without touching this file.
...
...                 Run (venv activated, ShopLab running):
...                     robot --outputdir results/solutions tests/robot/solutions/06_pricing_datadriver.robot
...                 Prerequisite:  pip install robotframework-datadriver
Resource            ../resources/common.resource
Resource            ../resources/pages/cart_checkout_page.resource
Library             DataDriver    file=../data/pricing.csv    dialect=excel    encoding=utf-8
Suite Setup         Open ShopLab Browser
Test Template       Cart Total Should Follow Pricing Rules
Test Tags           ui    pricing    data-driven


*** Test Cases ***
Placeholder — replaced by one test case per row of pricing.csv
    ${EMPTY}    ${EMPTY}    ${EMPTY}    ${EMPTY}    ${EMPTY}    ${EMPTY}    ${EMPTY}


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
    # Assert — UI summary equals the independent oracle
    ${expected}=    Expected Quote    ${subtotal}    ${discount}    ${shipping}    ${free_ship}
    ${actual}=    Read Cart Summary
    Dictionaries Should Be Equal    ${actual}    ${expected}
    [Teardown]    Close Context
