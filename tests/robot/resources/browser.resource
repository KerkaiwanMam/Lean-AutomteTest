*** Settings ***
Documentation       Single place that imports the Browser library with its settings.
...                 Every resource that needs Browser keywords imports THIS file, so the library is never
...                 imported twice with different arguments.
Library             Browser    timeout=10s    auto_closing_level=SUITE    run_on_failure=Take Screenshot \ EMBED
