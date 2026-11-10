*** Settings ***
Documentation       Products API (RequestsLibrary). Fast feedback, no browser.
Resource            ../../resources/api/shoplab_api.resource
Library             ../../libraries/ShopLabLibrary.py
Suite Setup         Create ShopLab Session
Test Tags           api    products


*** Test Cases ***
List Products Returns Paging Metadata
    [Tags]    smoke
    ${resp}=    GET On Session    shoplab    /api/products    expected_status=200
    Should Be Equal    ${resp.headers}[Content-Type]    application/json; charset=utf-8
    Should Be Equal As Integers    ${resp.json()}[total]    28
    Should Be Equal As Integers    ${resp.json()}[totalPages]    4
    Length Should Be    ${resp.json()}[items]    8
    Dictionary Should Contain Key    ${resp.json()}[items][0]    sku

Price Sorting Is Numeric
    [Documentation]    Guards BUG-04
    ${params}=    Create Dictionary    sort=price_asc    pageSize=50
    ${resp}=    GET On Session    shoplab    /api/products    params=${params}
    ${prices}=    Evaluate    [p['price'] for p in $resp.json()['items']]
    Should Be Sorted    ${prices}

Pages Cover Every Product Exactly Once
    [Documentation]    Guards BUG-05
    ${ids}=    Create List
    FOR    ${page}    IN RANGE    1    5
        ${params}=    Create Dictionary    page=${page}    pageSize=8
        ${resp}=    GET On Session    shoplab    /api/products    params=${params}
        FOR    ${item}    IN    @{resp.json()}[items]
            Append To List    ${ids}    ${item}[id]
        END
    END
    Length Should Be    ${ids}    28
    List Should Not Contain Duplicates    ${ids}

Invalid Query Parameters Return 400
    [Template]    Products Query Should Be Rejected
    page=0          page
    pageSize=51     pageSize
    sort=cheap      sort
    category=toys   category

Unknown Product Returns 404
    ${resp}=    GET On Session    shoplab    /api/products/99999    expected_status=404
    Should Be Equal    ${resp.json()}[error][code]    NOT_FOUND


*** Keywords ***
Products Query Should Be Rejected
    [Arguments]    ${query}    ${field}
    ${resp}=    GET On Session    shoplab    /api/products?${query}    expected_status=400
    Should Be Equal    ${resp.json()}[error][code]    VALIDATION_ERROR
    Dictionary Should Contain Key    ${resp.json()}[error][details]    ${field}
