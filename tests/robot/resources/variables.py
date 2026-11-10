"""Environment variables for the ShopLab Robot Framework suite.

Override from the command line, e.g.:
    robot --variable BASE_URL:http://staging.shoplab.test --variable HEADLESS:False tests
or with environment variables (CI): BASE_URL, HEADLESS, BROWSER_CHANNEL, ADMIN_PASS ...
"""
import os
from pathlib import Path

ROOT = Path(__file__).resolve().parents[3]

BASE_URL = os.getenv("BASE_URL", "http://localhost:3000")
HEADLESS = os.getenv("HEADLESS", "True").lower() != "false"
# "chrome" uses the locally installed Google Chrome; empty = Playwright's bundled chromium
BROWSER_CHANNEL = os.getenv("BROWSER_CHANNEL") or None
BROWSER_TIMEOUT = "10s"

# Seeded practice accounts (practice-app/src/seed-data.js). Real projects: read from a vault.
CUSTOMER = {"username": "customer", "password": os.getenv("CUSTOMER_PASS", "Passw0rd!")}
ADMIN = {"username": "admin", "password": os.getenv("ADMIN_PASS", "Admin123!")}
LOCKED = {"username": "locked", "password": "Passw0rd!"}

# SQLite file written by ShopLab — used by the database verification suite
DB_PATH = os.getenv("SHOPLAB_DB", str(ROOT / "practice-app" / "data" / "shoplab.db"))

VALID_CARD = {"number": "4242424242424242", "expiry": "12/30", "cvv": "123", "name": "ROBOT TESTER"}
DECLINED_CARD = {"number": "4000000000000002", "expiry": "12/30", "cvv": "123", "name": "ROBOT TESTER"}
ADDRESS = {
    "fullName": "Robot Tester", "phone": "0812345678", "line1": "1 Robot Street",
    "district": "Bang Rak", "province": "Bangkok", "postcode": "10500",
}
