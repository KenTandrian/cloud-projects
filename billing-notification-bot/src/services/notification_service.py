import os

from models import BillingData
from notifiers.telegram import send_telegram
from notifiers.whatsapp import send_whatsapp


def dispatch_notifications(billing_data: BillingData) -> dict[str, str]:
    results: dict[str, str] = {}

    # Check Toggles
    enable_telegram = os.environ.get("ENABLE_TELEGRAM", "false").lower() == "true"
    enable_whatsapp = os.environ.get("ENABLE_WHATSAPP", "false").lower() == "true"

    if enable_telegram:
        try:
            send_telegram(billing_data)
            results["telegram"] = "Success"
        except Exception as e:
            print(f"Telegram failed: {e}")
            results["telegram"] = f"Failed ({e})"

    if enable_whatsapp:
        try:
            send_whatsapp(billing_data)
            results["whatsapp"] = "Success"
        except Exception as e:
            print(f"WhatsApp failed: {e}")
            results["whatsapp"] = f"Failed ({e})"

    if not enable_telegram and not enable_whatsapp:
        results["status"] = "No notification channels enabled."

    return results
