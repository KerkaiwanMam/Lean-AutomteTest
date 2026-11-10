*** Settings ***
Documentation       Database verification (Module 14): act through the API, then prove the data was
...                 persisted correctly with SQL. Uses DatabaseLibrary + Python's built-in sqlite3 driver.
Resource            ../../resources/api/shoplab_api.resource
Library             DatabaseLibrary
Suite Setup         Connect To Database    sqlite3    database=${DB_PATH}    isolation_level=${None}
Suite Teardown      Disconnect From Database
Test Tags           db


*** Test Cases ***
Seed Data Is Consistent
    [Tags]    smoke
    Check Row Count    SELECT id FROM users WHERE role = 'admin'    ==    1
    Check Row Count    SELECT id FROM products WHERE stock = 0 AND active = 1    >=    2
    ${rows}=    Query    SELECT COUNT(*) FROM coupons WHERE expires_at < '2026-01-01'
    Should Be Equal As Integers    ${rows}[0][0]    1

Order Is Persisted With Items And Correct Totals
    ${user}=    Create Test User
    Login Via API    ${user}
    Add To Cart Via API    ELEC-001    2
    ${resp}=    Checkout Via API
    ${order_no}=    Set Variable    ${resp.json()}[orderNo]

    ${order}=    Query    SELECT id, status, subtotal, shipping, vat, total FROM orders WHERE order_no = '${order_no}'
    Length Should Be    ${order}    1
    Should Be Equal    ${order}[0][1]    PAID
    Should Be Equal As Numbers    ${order}[0][2]    998
    Should Be Equal As Numbers    ${order}[0][3]    50
    # total = subtotal - discount + shipping + vat (data integrity rule)
    Should Be Equal As Numbers    ${order}[0][5]    ${{ round(998 + 50 + ${order}[0][4], 2) }}
    Check Row Count    SELECT id FROM order_items WHERE order_id = ${order}[0][0]    ==    1
    Check Row Count    SELECT id FROM cart_items WHERE user_id = ${user}[id]    ==    0

Passwords Are Never Stored In Plain Text
    [Documentation]    Security check at the data layer.
    Check Row Count    SELECT id FROM users WHERE password_hash LIKE '%Passw0rd!%'    ==    0
    Check Row Count    SELECT id FROM users WHERE password_hash NOT LIKE '%:%'    ==    0

No Negative Stock Exists
    Check Row Count    SELECT id FROM products WHERE stock < 0    ==    0
