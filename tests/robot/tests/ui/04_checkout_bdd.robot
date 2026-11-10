*** Settings ***
Documentation       Checkout written in BDD (Given/When/Then) style — Robot strips the Given/When/Then/And prefixes.
...                 Business readers can review these scenarios directly.
Resource            ../../resources/common.resource
Resource            ../../resources/pages/catalog_page.resource
Resource            ../../resources/pages/cart_checkout_page.resource
Suite Setup         Open ShopLab Browser
Test Tags           ui    checkout    bdd


*** Test Cases ***
Customer Buys A Book With A Card
    [Tags]    smoke
    Given a logged in customer with "BOOK-001" in the cart
    When the customer checks out paying by card    ${VALID_CARD}
    Then the order is confirmed with status "PAID"
    And the cart is empty

Declined Card Does Not Create An Order
    Given a logged in customer with "FASH-001" in the cart
    When the customer checks out paying by card    ${DECLINED_CARD}
    Then the checkout error is "Payment was declined by the bank"


*** Keywords ***
A Logged In Customer With "${sku}" In The Cart
    ${user}=    Create Test User
    Open Page As User    ${user}    /
    Add To Cart Via API    ${sku}    1

The Customer Checks Out Paying By Card
    [Arguments]    ${card}
    Go To Cart
    Click    ${CHECKOUT_BUTTON}
    Fill Shipping Address    ${ADDRESS}
    Pay By Card    ${card}
    Place Order

The Order Is Confirmed With Status "${status}"
    Get Text    ${ORDER_NUMBER}    matches    ^SL-\\d{8}-\\d{4}$
    Get Text    ${ORDER_STATUS}    ==    ${status}

The Cart Is Empty
    Cart Count Should Be    0

The Checkout Error Is "${message}"
    Get Text    ${CHECKOUT_ERROR}    ==    ${message}
