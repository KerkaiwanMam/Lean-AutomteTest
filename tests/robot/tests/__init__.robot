*** Settings ***
Documentation       Top-level suite: resets ShopLab once so every run starts from the seed data.
...                 With pabot (parallel), reset once BEFORE the run and pass --variable RESET_DATA:False,
...                 otherwise every pabot process would reset the database in the middle of other tests.
Resource            ../resources/api/shoplab_api.resource
Suite Setup         Prepare Test Environment


*** Variables ***
${RESET_DATA}       True
${BUG_MODE}         False


*** Keywords ***
Prepare Test Environment
    IF    ${RESET_DATA}    Reset ShopLab
    IF    ${RESET_DATA}    Set Bug Mode    ${BUG_MODE}
