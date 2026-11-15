"""Export agent corrections from the app database to CSV for retraining.

    python export_corrections.py > ../../temp/corrections.csv
    python train.py --corrections ../../temp/corrections.csv
"""
import csv
import sqlite3
import sys
from pathlib import Path

DB = Path(__file__).resolve().parent.parent / "data" / "resolvedesk.db"

con = sqlite3.connect(DB)
rows = con.execute(
    "SELECT r.body, c.new_category FROM corrections c JOIN requests r ON r.id = c.request_id"
).fetchall()
w = csv.writer(sys.stdout)
w.writerow(["text", "category"])
w.writerows(rows)
