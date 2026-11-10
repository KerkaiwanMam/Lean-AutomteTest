*** Settings ***
Documentation       Login (REQ-AUTH). Keyword-driven style: each test reads like a manual test case.
Resource            ../../resources/common.resource
Resource            ../../resources/pages/login_page.resource
Suite Setup         Open ShopLab Browser
Test Setup          New ShopLab Page    /login
Test Tags           ui    auth


*** Test Cases ***
Valid Customer Can Log In And Out
    [Tags]    smoke
    ${user}=    Create Test User
    Submit Credentials    ${user}[username]    ${user}[password]
    Logged In User Should Be    ${user}[username]
    Log Out
    Get Element States    data-testid=nav-login    contains    visible

Admin Lands On Back Office
    Submit Credentials    ${ADMIN}[username]    ${ADMIN}[password]
    Wait For Navigation    ${BASE_URL}/admin
    Get Text    h1    ==    Back Office

Locked Account Is Rejected
    [Documentation]    Guards BUG-11
    Submit Credentials    ${LOCKED}[username]    ${LOCKED}[password]
    Login Should Fail With    Account is locked. Please contact support.

Invalid Credentials Show A Generic Message
    [Documentation]    Guards BUG-13 (user enumeration). Data-driven with a template.
    [Template]    Login With Invalid Credentials Should Show Generic Error
    customer        WrongPass1!
    nobody_here     Passw0rd!
    jane            not-the-password


*** Keywords ***
Login With Invalid Credentials Should Show Generic Error
    [Arguments]    ${username}    ${password}
    Go To Login Page
    Submit Credentials    ${username}    ${password}
    Login Should Fail With    Invalid username or password
