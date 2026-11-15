"""The documented CLINC150 subset used by ResolveDesk.

20 intents grouped into 5 support teams. Every other CLINC150 intent, plus the
official out-of-scope (oos) split, is treated as an *unsupported* request.
"""

TEAMS = {
    "banking": ["transfer", "balance", "freeze_account", "report_fraud"],
    "cards": ["card_declined", "report_lost_card", "replacement_card_duration", "credit_limit_change"],
    "travel": ["book_flight", "lost_luggage", "travel_alert", "international_visa"],
    "auto": ["schedule_maintenance", "oil_change_how", "tire_pressure", "jump_start"],
    "billing": ["pay_bill", "bill_due", "spending_history", "order_checks"],
}

CATEGORY_TO_TEAM = {c: t for t, cats in TEAMS.items() for c in cats}
CATEGORIES = sorted(CATEGORY_TO_TEAM)
