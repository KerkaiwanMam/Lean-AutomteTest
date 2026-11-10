*** Settings ***
Documentation       Elements Lab with the Browser library: iframes, dialogs, new pages, shadow DOM, upload/download.
Resource            ../../resources/common.resource
Library             OperatingSystem
Suite Setup         Open ShopLab Browser
Test Setup          New ShopLab Page    /lab
Test Tags           ui    lab


*** Test Cases ***
Handle Prompt Dialog
    ${promise}=    Promise To    Wait For Alert    action=accept    prompt_input=Robot
    Click    "Show prompt"
    Wait For    ${promise}
    Get Text    id=dialog-result    ==    Hello, Robot

Wait For Dynamically Loaded Content
    Click    id=start-loading
    Wait For Elements State    id=loaded-text    visible    timeout=10s
    Get Text    id=loaded-text    ==    Hello World! Content loaded.

Work Inside An Iframe
    Fill Text    id=payment-frame >>> id=card-holder    Robot Tester
    Click    id=payment-frame >>> text=Submit inside frame
    Get Text    id=frame-message    ==    Frame submitted for Robot Tester

Switch To A New Tab
    Click    id=open-tab
    Wait Until Keyword Succeeds    5x    200ms    Switch Page    NEW
    Get Text    id=window-kind    ==    Opened in a new tab

Fill An Input Inside Open Shadow DOM
    Fill Text    id=open-shadow >> input    Shadow Robot
    Click    id=open-shadow >> button
    Get Text    id=open-shadow >> .greeting    ==    Hello, Shadow Robot!

Drag And Drop A Task
    # Drag And Drop works with raw mouse coordinates: it does NOT auto-scroll like Playwright's dragTo,
    # so bring the area into the viewport first. HTML5 drag also needs a few intermediate mouse moves.
    Scroll To Element    id=dnd
    Drag And Drop    id=task-1    data-testid=col-done    steps=10
    Get Text    id=done-count    ==    1

Upload Files
    Upload File By Selector    id=files-input    ${CURDIR}/../../libraries/ShopLabLibrary.py
    Click    "Upload"
    Get Text    id=upload-result    contains    ShopLabLibrary.py

Download A File
    ${promise}=    Promise To Wait For Download
    Click    id=download-csv
    ${file}=    Wait For    ${promise}
    Should Be Equal    ${file}[suggestedFilename]    employees.csv
    File Should Exist    ${file}[saveAs]
