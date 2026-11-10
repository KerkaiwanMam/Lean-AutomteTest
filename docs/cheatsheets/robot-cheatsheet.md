# Robot Framework Cheat Sheet (RF 7 + Browser library)

## CLI
```bash
# ALWAYS activate the venv first (.venv\Scripts\Activate.ps1  |  source .venv/bin/activate)
robot --outputdir results tests
robot --include smoke --exclude legacy tests
robot -t "Locked Account Is Rejected" tests
robot -s "Cart Pricing" tests
robot --variable HEADLESS:False --variable BASE_URL:http://localhost:3001 tests
robot --rerunfailed results/output.xml --output rerun.xml tests
rebot --merge results/output.xml rerun.xml
robot --dryrun tests                                  # syntax/keyword check without running
pabot --processes 4 --variable RESET_DATA:False tests # parallel
pabot --testlevelsplit --processes 8 tests
```

## File skeleton
```robotframework
*** Settings ***
Documentation       ...
Resource            ../resources/common.resource
Library             Collections
Suite Setup         Open ShopLab Browser
Test Setup          New ShopLab Page    /
Test Teardown       Close Context
Test Tags           ui    smoke

*** Variables ***
${URL}              http://localhost:3000
@{LIST}             a    b    c
&{DICT}             key=value    other=2

*** Test Cases ***
My Test
    [Documentation]    ...
    [Tags]    REQ-PRC-03
    Keyword    arg1    arg2
    ${result}=    Other Keyword    named=value

*** Keywords ***
My Keyword
    [Arguments]    ${a}    ${b}=default
    RETURN    ${a}
```

## Variables & expressions
```robotframework
${USER}[username]           ${LIST}[0]          %{ENV_VAR}         ${{ 1 + 2 }}
${{ {"a": 1} }}             ${EMPTY}  ${NONE}  ${TRUE}  ${CURDIR}  ${TEMPDIR}
VAR    ${x}    value    scope=SUITE                                  # RF 7
IF    $coupon is not None    Apply Coupon    ${coupon}               # $var = real Python value
```

## Control flow
```robotframework
FOR    ${item}    IN    @{LIST}          FOR    ${i}    IN RANGE    1    5
    IF    '${item}' == 'b'    CONTINUE        Log    ${i}
END                                      END
TRY
    Click    id=popup-close
EXCEPT    *Timeout*    type=glob
    Log    no popup
FINALLY
    Log    done
END
WHILE    ${n} < 3    limit=10
    ...
END
Wait Until Keyword Succeeds    5x    500ms    Some Keyword
```

## Browser library
```robotframework
New Browser    chromium    headless=True    channel=chrome
New Context    baseURL=${URL}    locale=en-US    tracing=retain-on-failure
New Page       ${URL}/login
Go To          ${URL}/cart
Fill Text      id=username    customer
Fill Secret    id=password    $password            # not logged
Click          data-testid=login-button
Check Checkbox    data-testid=pay-card
Select Options By    data-testid=sort-select    value    price_asc
Upload File By Selector    id=files-input    ${CURDIR}/file.txt
Drag And Drop    id=task-1    data-testid=col-done    steps=10      # scroll into view first!
Scroll To Element    id=dnd
# assertions with auto-retry
Get Text           data-testid=summary-total    ==    ฿1,016.50
Get Text           data-testid=order-number    matches    ^SL-\\d{8}-\\d{4}$
Get Element Count  data-testid=product-card    ==    8
Get Url            contains    /login
Get Element States    data-testid=empty-state    contains    visible
Wait For Elements State    data-testid=loading    hidden
Wait For Condition    Text    data-testid=summary-total    !=    -
# promises (start waiting BEFORE the action)
${p}=    Promise To    Wait For Response    matcher=**/api/cart/quote
Click    data-testid=apply-coupon
Wait For    ${p}
${p}=    Promise To    Wait For Alert    action=accept    prompt_input=Robot
${p}=    Promise To Wait For Download
Switch Page    NEW
Add Cookie    sl_token    ${token}    url=${URL}
```
**Selectors:** `id=x` · `css=.a > .b` · `text=Login` · `"Exact text"` · `data-testid=x` · `xpath=//tr[2]` · chain `css=.card >> text=Add` · iframe `id=frame >>> id=field` · open shadow DOM pierced automatically

## RequestsLibrary
```robotframework
Create Session    api    ${URL}
${resp}=    POST On Session    api    /api/auth/login    json=${body}    expected_status=200
Update Session    api    headers=${{ {"Authorization": "Bearer " + $resp.json()["token"]} }}
${resp}=    GET On Session    api    /api/products    params=${params}    expected_status=any
Should Be Equal As Integers    ${resp.status_code}    200
${resp.json()}[items][0][sku]
```

## DatabaseLibrary
```robotframework
Connect To Database    sqlite3    database=${DB_PATH}    isolation_level=${None}
${rows}=    Query    SELECT status FROM orders WHERE order_no = '${no}'
Check Row Count    SELECT id FROM products WHERE stock < 0    ==    0
Disconnect From Database
```

## Custom Python keyword
```python
from robot.api.deco import keyword, library
@library(scope="GLOBAL", auto_keywords=False)
class MyLib:
    @keyword("Parse Money")
    def parse_money(self, text: str) -> float: ...
```
