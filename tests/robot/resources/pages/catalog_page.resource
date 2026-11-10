*** Settings ***
Documentation       Page object for the product catalogue (/).
Resource            ../browser.resource
Library             Collections
Library             ../../libraries/ShopLabLibrary.py


*** Variables ***
${SEARCH_INPUT}         data-testid=search-input
${SEARCH_BUTTON}        data-testid=search-button
${SORT_SELECT}          data-testid=sort-select
${CATEGORY_SELECT}      data-testid=category-select
${PRODUCT_CARD}         data-testid=product-card
${PRODUCT_NAME}         data-testid=product-name
${PRODUCT_PRICE}        data-testid=product-price
${RESULT_SUMMARY}       data-testid=result-summary
${LOADING}              data-testid=loading
${EMPTY_STATE}          data-testid=empty-state
${CART_COUNT}           data-testid=cart-count


*** Keywords ***
Wait For Product List
    Wait For Elements State    ${LOADING}    hidden
    Wait For Condition    Text    ${RESULT_SUMMARY}    !=    ${EMPTY}

Search Products
    [Arguments]    ${term}
    Fill Text    ${SEARCH_INPUT}    ${term}
    Click    ${SEARCH_BUTTON}
    Wait For Product List

Sort Products By
    [Arguments]    ${value}
    Select Options By    ${SORT_SELECT}    value    ${value}
    Wait For Product List

Filter By Category
    [Arguments]    ${category}
    Select Options By    ${CATEGORY_SELECT}    value    ${category}
    Wait For Product List

Get Product Names
    ${elements}=    Get Elements    ${PRODUCT_NAME}
    ${names}=    Create List
    FOR    ${e}    IN    @{elements}
        ${text}=    Get Text    ${e}
        Append To List    ${names}    ${text}
    END
    RETURN    ${names}

Get Product Prices
    ${elements}=    Get Elements    ${PRODUCT_PRICE}
    ${prices}=    Create List
    FOR    ${e}    IN    @{elements}
        ${text}=    Get Text    ${e}
        ${value}=    Parse Money    ${text}
        Append To List    ${prices}    ${value}
    END
    RETURN    ${prices}

Add Product To Cart
    [Arguments]    ${sku}
    Click    css=[data-testid="product-card"][data-sku="${sku}"] >> data-testid=add-to-cart

Cart Count Should Be
    [Arguments]    ${count}
    Get Text    ${CART_COUNT}    ==    ${count}
