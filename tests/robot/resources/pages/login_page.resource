*** Settings ***
Documentation       Page object for /login. Locators live here ONLY — tests never contain selectors.
Resource            ../browser.resource


*** Variables ***
${LOGIN_USERNAME}       id=username
${LOGIN_PASSWORD}       id=password
${LOGIN_BUTTON}         data-testid=login-button
${LOGIN_ERROR}          data-testid=login-error
${NAV_USERNAME}         data-testid=nav-username
${NAV_LOGOUT}           data-testid=nav-logout


*** Keywords ***
Go To Login Page
    Go To    ${BASE_URL}/login
    Wait For Elements State    ${LOGIN_BUTTON}    visible

Submit Credentials
    [Arguments]    ${username}    ${password}
    Fill Text    ${LOGIN_USERNAME}    ${username}
    Fill Secret    ${LOGIN_PASSWORD}    $password
    Click    ${LOGIN_BUTTON}

Login Should Fail With
    [Arguments]    ${message}
    Get Text    ${LOGIN_ERROR}    ==    ${message}
    Get Url    contains    /login

Logged In User Should Be
    [Arguments]    ${username}
    Get Text    ${NAV_USERNAME}    contains    ${username}

Log Out
    Click    ${NAV_LOGOUT}
    # NOT "Wait For Navigation" after the click: on a slow/loaded runner the page may already have
    # navigated before the wait starts, and the keyword then waits for a navigation that never comes.
    # Get Url is an assertion that retries until the URL matches (or times out).
    Get Url    ==    ${BASE_URL}/login
