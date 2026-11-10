*** Settings ***
Documentation       Page objects for /cart and /checkout.
Resource            ../browser.resource
Library             Collections
Library             ../../libraries/ShopLabLibrary.py


*** Variables ***
${CART_ROW}             data-testid=cart-row
${COUPON_INPUT}         data-testid=coupon-input
${APPLY_COUPON}         data-testid=apply-coupon
${COUPON_MESSAGE}       data-testid=coupon-message
${SUMMARY_TOTAL}        data-testid=summary-total
${CHECKOUT_BUTTON}      data-testid=checkout-button
${ORDER_NUMBER}         data-testid=order-number
${ORDER_STATUS}         data-testid=order-status
${CHECKOUT_ERROR}       data-testid=checkout-error


*** Keywords ***
Go To Cart
    Go To    ${BASE_URL}/cart
    Wait For Elements State    ${CART_ROW} >> nth=0    visible
    Wait For Condition    Text    ${SUMMARY_TOTAL}    !=    -

Apply Coupon
    [Arguments]    ${code}
    Fill Text    ${COUPON_INPUT}    ${code}
    ${promise}=    Promise To    Wait For Response    matcher=**/api/cart/quote
    Click    ${APPLY_COUPON}
    Wait For    ${promise}

Choose Shipping
    [Arguments]    ${method}
    ${promise}=    Promise To    Wait For Response    matcher=**/api/cart/quote
    Check Checkbox    data-testid=shipping-${method}
    Wait For    ${promise}

Read Cart Summary
    [Documentation]    Returns the order summary as a dictionary of numbers.
    ${summary}=    Create Dictionary
    FOR    ${field}    IN    subtotal    discount    shipping    vat    total
        ${text}=    Get Text    data-testid=summary-${field}
        ${value}=    Parse Money    ${text}
        Set To Dictionary    ${summary}    ${field}=${{ abs(${value}) }}
    END
    RETURN    ${summary}

Coupon Message Should Be
    [Arguments]    ${message}
    Get Text    ${COUPON_MESSAGE}    ==    ${message}

Fill Shipping Address
    [Arguments]    ${address}
    Fill Text    id=fullName    ${address}[fullName]
    Fill Text    id=phone    ${address}[phone]
    Fill Text    id=line1    ${address}[line1]
    Fill Text    id=district    ${address}[district]
    Fill Text    id=province    ${address}[province]
    Fill Text    id=postcode    ${address}[postcode]
    Click    data-testid=to-payment

Pay By Card
    [Arguments]    ${card}
    Check Checkbox    data-testid=pay-card
    Fill Text    id=cardNumber    ${card}[number]
    Fill Text    id=cardExpiry    ${card}[expiry]
    ${cvv}=    Set Variable    ${card}[cvv]
    Fill Secret    id=cardCvv    $cvv
    Fill Text    id=cardName    ${card}[name]
    Click    data-testid=to-review

Place Order
    Click    data-testid=place-order
