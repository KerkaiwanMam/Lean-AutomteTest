*** Settings ***
Documentation       Cart & order API: business rules, state machine and authorization.
Resource            ../../resources/api/shoplab_api.resource
Library             ../../libraries/ShopLabLibrary.py
Test Setup          Login As Fresh Customer
Test Tags           api    orders


*** Test Cases ***
Quantity Limit Is Ten Per Product
    [Documentation]    Guards BUG-10 (boundary values 10 / 11)
    Add To Cart Via API    FASH-001    10
    ${resp}=    Add To Cart Via API    FASH-001    1    expected_status=400
    Should Be Equal    ${resp.json()}[error][code]    QTY_LIMIT

Checkout With Coupon Calculates Totals
    Add To Cart Via API    FASH-003    1
    ${resp}=    Checkout Via API    coupon=BIG500
    ${order}=    Set Variable    ${resp.json()}
    ${expected}=    Expected Quote    3000    500
    Should Be Equal    ${order}[status]    PAID
    Should Be Equal As Numbers    ${order}[total]    ${expected}[total]
    Should Match Regexp    ${order}[orderNo]    ^SL-\\d{8}-\\d{4}$

Cancelling An Order Restores Stock
    [Documentation]    Guards BUG-12
    ${id}=    Get Product Id By Sku    BOOK-002
    ${before}=    Get Product Stock    ${id}
    Add To Cart Via API    BOOK-002    2
    ${order}=    Checkout Via API
    ${after_order}=    Get Product Stock    ${id}
    Should Be Equal As Integers    ${after_order}    ${before - 2}
    POST On Session    shoplab    /api/orders/${order.json()}[id]/cancel    expected_status=200
    ${after_cancel}=    Get Product Stock    ${id}
    Should Be Equal As Integers    ${after_cancel}    ${before}

Delivered Order Cannot Be Cancelled
    [Documentation]    State transition testing: PENDING -> PAID -> SHIPPED -> DELIVERED, then cancel = 409
    Add To Cart Via API    FASH-001    1
    ${order}=    Checkout Via API    payment_method=cod
    ${id}=    Set Variable    ${order.json()}[id]
    Login Via API    ${ADMIN}    alias=admin
    FOR    ${status}    IN    PAID    SHIPPED    DELIVERED
        PATCH On Session    admin    /api/admin/orders/${id}/status    json=${{ {"status": "${status}"} }}    expected_status=200
    END
    ${resp}=    POST On Session    shoplab    /api/orders/${id}/cancel    expected_status=409
    Should Be Equal    ${resp.json()}[error][code]    INVALID_TRANSITION

Customer Cannot Read Another Customer's Order
    [Documentation]    Guards BUG-08 (IDOR)
    Add To Cart Via API    FASH-001    1
    ${order}=    Checkout Via API
    ${intruder}=    Create Test User
    Login Via API    ${intruder}    alias=intruder
    GET On Session    intruder    /api/orders/${order.json()}[id]    expected_status=404

Customer Cannot Use Admin Endpoints
    GET On Session    shoplab    /api/admin/users    expected_status=403


*** Keywords ***
Login As Fresh Customer
    ${user}=    Create Test User
    Login Via API    ${user}
