*** Settings ***
Documentation       Product catalogue (REQ-CAT).
Resource            ../../resources/common.resource
Resource            ../../resources/pages/catalog_page.resource
Suite Setup         Open ShopLab Browser
Test Setup          Run Keywords    New ShopLab Page    /    AND    Wait For Product List
Test Tags           ui    catalog


*** Test Cases ***
First Page Shows Eight Of Twenty Eight Products
    [Tags]    smoke
    Get Element Count    ${PRODUCT_CARD}    ==    8
    Get Text    ${RESULT_SUMMARY}    ==    Showing 1–8 of 28 products

Search Is Case Insensitive
    [Documentation]    Guards BUG-03
    Search Products    KEYBOARD
    ${names}=    Get Product Names
    Should Be Equal    ${names}    ${{ ['Mechanical Keyboard'] }}

Unknown Search Term Shows Empty State
    Search Products    zzz-not-a-product
    Get Element States    ${EMPTY_STATE}    contains    visible
    Get Element Count    ${PRODUCT_CARD}    ==    0

Category Filter Shows Only That Category
    Filter By Category    books
    Get Element Count    ${PRODUCT_CARD}    ==    6

Sort By Price Ascending Is Numeric
    [Documentation]    Guards BUG-04
    Sort Products By    price_asc
    ${prices}=    Get Product Prices
    Should Be Sorted    ${prices}
    Should Be Equal As Numbers    ${prices}[0]    150

Customer Adds Product To Cart
    ${user}=    Create Test User
    Open Page As User    ${user}    /?search=Yoga
    Wait For Product List
    Add Product To Cart    SPRT-001
    Toast Should Say    Added to cart
    Cart Count Should Be    1
