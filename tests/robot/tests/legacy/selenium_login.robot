*** Settings ***
Documentation       The same login test written with SeleniumLibrary — many existing company projects still use it.
...                 Compare with ui/01_login.robot (Browser library): explicit waits are needed here,
...                 Browser library auto-waits. Run with:  robot --include legacy tests
Library             SeleniumLibrary    timeout=10s    implicit_wait=0s
Variables           ../../resources/variables.py
Suite Setup         Open Browser    ${BASE_URL}/login    chrome    options=add_argument("--headless=new")
Suite Teardown      Close All Browsers
Test Tags           legacy    selenium


*** Test Cases ***
Customer Logs In With SeleniumLibrary
    Input Text    id:username    ${CUSTOMER}[username]
    Input Password    id:password    ${CUSTOMER}[password]
    Click Button    css:[data-testid="login-button"]
    Wait Until Element Is Visible    css:[data-testid="nav-username"]
    Element Should Contain    css:[data-testid="nav-username"]    customer
