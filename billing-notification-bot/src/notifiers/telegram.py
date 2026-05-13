import os

import requests
from models import BillingData


def send_telegram(data: BillingData) -> None:
    bot_token = os.environ.get("TELEGRAM_BOT_TOKEN")
    chat_id = os.environ.get("TELEGRAM_CHAT_ID")

    if not bot_token or not chat_id:
        raise ValueError("Telegram credentials missing")

    # Format the message
    message = f"☁️ *GCP Billing Update ({data.display_month})*\n"
    message += f"💰 *Total Spend:* ${data.grand_total:.2f}\n"
    message += f"🕒 *Data fresh as of:* _{data.freshness}_\n\n"

    if data.services:
        message += "📊 *Breakdown by Service:*\n"
        for item in data.services[:5]:
            message += f"🔹 {item.name}: ${item.cost:.2f}\n"

        if len(data.services) > 5:
            other_cost = sum(item.cost for item in data.services[5:])
            if other_cost > 0.00:
                message += f"🔹 _Other Services_: ${other_cost:.2f}\n"
    else:
        message += "No charges reported yet! 🎉"

    # Send the request
    url = f"https://api.telegram.org/bot{bot_token}/sendMessage"
    response = requests.post(
        url, data={"chat_id": chat_id, "text": message, "parse_mode": "Markdown"}
    )
    response.raise_for_status()
