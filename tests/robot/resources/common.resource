*** Settings ***
Documentation       Shared setup for UI suites (Browser library = Playwright engine inside Robot Framework).
Resource            browser.resource
Library             ../libraries/ShopLabLibrary.py
Resource            api/shoplab_api.resource
Variables           variables.py


*** Keywords ***
Open ShopLab Browser
    [Documentation]    One browser per suite; each test gets a fresh context (cookies isolated).
    New Browser    chromium    headless=${HEADLESS}    channel=${BROWSER_CHANNEL}
    Set Browser Timeout    ${BROWSER_TIMEOUT}

New ShopLab Page
    [Arguments]    ${path}=/
    New Context    baseURL=${BASE_URL}    locale=en-US    tracing=retain-on-failure
    New Page    ${BASE_URL}${path}

Open Page As User
    [Documentation]    Logs in through the API and injects the session cookie — no UI login needed (fast & stable).
    [Arguments]    ${user}    ${path}=/
    ${token}=    Login Via API    ${user}
    New Context    baseURL=${BASE_URL}    locale=en-US    tracing=retain-on-failure
    Add Cookie    sl_token    ${token}    url=${BASE_URL}
    New Page    ${BASE_URL}${path}

Toast Should Say
    [Arguments]    ${message}
    Get Text    data-testid=toast >> nth=-1    ==    ${message}
