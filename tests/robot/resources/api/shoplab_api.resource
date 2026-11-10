*** Settings ***
Documentation       API keywords (RequestsLibrary). Used to test the API directly and to
...                 arrange data for UI tests quickly (login, fill cart) — Module 13.
Library             RequestsLibrary
Library             Collections
Variables           ../variables.py


*** Keywords ***
Create ShopLab Session
    [Documentation]    Anonymous session. ``alias`` lets one test act as several users.
    [Arguments]    ${alias}=shoplab
    Create Session    ${alias}    ${BASE_URL}    verify=${True}    disable_warnings=1

Reset ShopLab
    Create ShopLab Session    admin_tasks
    ${resp}=    POST On Session    admin_tasks    /api/test/reset    expected_status=200
    Should Be True    ${resp.json()}[ok]

Set Bug Mode
    [Arguments]    ${enabled}
    ${resp}=    POST On Session    admin_tasks    /api/test/config    json=${{ {"bugMode": ${enabled}} }}    expected_status=200
    RETURN    ${resp.json()}

Create Test User
    [Documentation]    Test-data factory: a unique customer per test keeps parallel (pabot) runs independent.
    Create ShopLab Session    factory
    ${resp}=    POST On Session    factory    /api/test/users    json=${{ {} }}    expected_status=201
    RETURN    ${resp.json()}

Login Via API
    [Documentation]    Logs in and stores the bearer token as session headers. Returns the token.
    [Arguments]    ${user}    ${alias}=shoplab
    Create ShopLab Session    ${alias}
    ${body}=    Create Dictionary    username=${user}[username]    password=${user}[password]
    ${resp}=    POST On Session    ${alias}    /api/auth/login    json=${body}    expected_status=200
    ${token}=    Set Variable    ${resp.json()}[token]
    ${headers}=    Create Dictionary    Authorization=Bearer ${token}
    Update Session    ${alias}    headers=${headers}
    RETURN    ${token}

Get Product Id By Sku
    [Arguments]    ${sku}    ${alias}=shoplab
    ${params}=    Create Dictionary    search=${sku}    pageSize=50
    ${resp}=    GET On Session    ${alias}    /api/products    params=${params}    expected_status=200
    FOR    ${p}    IN    @{resp.json()}[items]
        IF    '${p}[sku]' == '${sku}'    RETURN    ${p}[id]
    END
    Fail    Product ${sku} not found

Get Product Stock
    [Arguments]    ${product_id}    ${alias}=shoplab
    ${resp}=    GET On Session    ${alias}    /api/products/${product_id}    expected_status=200
    RETURN    ${resp.json()}[stock]

Add To Cart Via API
    [Arguments]    ${sku}    ${qty}=1    ${alias}=shoplab    ${expected_status}=201
    ${id}=    Get Product Id By Sku    ${sku}    ${alias}
    ${body}=    Create Dictionary    productId=${id}    qty=${{ int(${qty}) }}
    ${resp}=    POST On Session    ${alias}    /api/cart/items    json=${body}    expected_status=${expected_status}
    RETURN    ${resp}

Checkout Via API
    [Arguments]    ${alias}=shoplab    ${payment_method}=card    ${coupon}=${None}    ${card}=${VALID_CARD}    ${expected_status}=201
    ${body}=    Create Dictionary    address=${ADDRESS}    shippingMethod=standard    paymentMethod=${payment_method}
    IF    $coupon is not None    Set To Dictionary    ${body}    couponCode=${coupon}
    IF    '${payment_method}' == 'card'    Set To Dictionary    ${body}    card=${card}
    ${resp}=    POST On Session    ${alias}    /api/orders    json=${body}    expected_status=${expected_status}
    RETURN    ${resp}
