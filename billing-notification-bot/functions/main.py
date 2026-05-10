import os

import functions_framework
import pytz
import requests
from google.cloud import bigquery


@functions_framework.http
def send_telegram_billing(request):
    # 1. Initialize BigQuery
    bq_client = bigquery.Client()
    table_name = os.environ.get("BQ_TABLE_NAME")
    jakarta_tz = pytz.timezone("Asia/Jakarta")

    # STEP 1: Find the absolute latest data point
    query_date = f"""
        SELECT MAX(usage_end_time) as latest_usage 
        FROM `{table_name}`
    """
    date_results = bq_client.query(query_date).result()

    latest_usage_time = None
    for row in date_results:
        latest_usage_time = row.latest_usage

    if not latest_usage_time:
        return "No data found in billing table.", 200

    # Convert UTC timestamp from BigQuery to Jakarta time
    latest_usage_jkt = latest_usage_time.astimezone(jakarta_tz)

    # Format the variables we need for the next query and the message
    invoice_month = latest_usage_jkt.strftime("%Y%m")  # e.g., '202605'
    display_month = latest_usage_jkt.strftime("%B %Y")  # e.g., 'May 2026'
    display_freshness = latest_usage_jkt.strftime(
        "%d %b %Y, %H:%M WIB"
    )  # e.g., '08 May 2026, 14:00 WIB'

    # STEP 2: Query costs exactly for that target month
    query_costs = f"""
        SELECT 
            service.description as service_name,
            SUM(cost) as total_cost, 
            SUM(IFNULL((SELECT SUM(c.amount) FROM UNNEST(credits) c), 0)) as total_credits
        FROM `{table_name}`
        WHERE invoice.month = '{invoice_month}'
        GROUP BY service_name
    """

    try:
        costs_results = bq_client.query(query_costs).result()

        services_cost = []
        grand_total = 0.0

        # Calculate net cost for each service
        for row in costs_results:
            net_cost = (row.total_cost or 0) + (row.total_credits or 0)
            if net_cost > 0.00:
                services_cost.append({"name": row.service_name, "cost": net_cost})
                grand_total += net_cost

        # Sort the list so the most expensive services are at the top
        services_cost = sorted(services_cost, key=lambda x: x["cost"], reverse=True)

        # STEP 3: Build & Send the Telegram Message
        message = f"☁️ *GCP Billing Update ({display_month})*\n"
        message += f"💰 *Total Spend:* ${grand_total:.2f}\n"
        message += f"🕒 *Data fresh as of:* _{display_freshness}_\n\n"

        if services_cost:
            message += "📊 *Breakdown by Service:*\n"
            for item in services_cost[:5]:
                message += f"🔹 {item['name']}: ${item['cost']:.2f}\n"

            if len(services_cost) > 5:
                other_cost = sum(item["cost"] for item in services_cost[5:])
                if other_cost > 0.00:
                    message += f"🔹 _Other Services_: ${other_cost:.2f}\n"
        else:
            message += "No charges reported yet! 🎉"

        # Send to Telegram
        bot_token = os.environ.get("TELEGRAM_BOT_TOKEN")
        chat_id = os.environ.get("TELEGRAM_CHAT_ID")

        url = f"https://api.telegram.org/bot{bot_token}/sendMessage"
        payload = {"chat_id": chat_id, "text": message, "parse_mode": "Markdown"}

        response = requests.post(url, data=payload)
        response.raise_for_status()  # Throws an error if the request fails

        return "Message sent to Telegram successfully!", 200

    except Exception as e:
        print(f"Error: {e}")
        return f"Failed to send message: {str(e)}", 500
