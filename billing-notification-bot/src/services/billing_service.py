import os
from typing import Optional

import pytz
from google.cloud import bigquery
from models import BillingData, ServiceCost


def get_billing_data() -> Optional[BillingData]:
    bq_client = bigquery.Client()
    table_name = os.environ.get("BQ_TABLE_NAME")

    jakarta_tz = pytz.timezone("Asia/Jakarta")
    pacific_tz = pytz.timezone("America/Los_Angeles")

    # Find the absolute latest data point
    query_date = f"SELECT MAX(usage_end_time) as latest_usage FROM `{table_name}`"
    latest_usage_time = list(bq_client.query(query_date).result())[0].latest_usage

    if not latest_usage_time:
        return None

    # Convert to Jakarta time for the Telegram message display
    latest_usage_jkt = latest_usage_time.astimezone(jakarta_tz)

    # Convert the latest data timestamp to Pacific Time because that is the timezone Google uses to assign the `invoice.month`.
    latest_usage_pt = latest_usage_time.astimezone(pacific_tz)
    invoice_month = latest_usage_pt.strftime("%Y%m")
    display_month = latest_usage_pt.strftime("%B %Y")  # e.g., 'May 2026'

    # The Budget-Optimized Financial Query
    query_costs = f"""
        SELECT 
            IF(cost_type IN ('tax', 'adjustment'), cost_type, service.description) as item_name,
            SUM(CAST(cost AS NUMERIC)) as total_cost, 
            SUM(IFNULL((SELECT SUM(CAST(c.amount AS NUMERIC)) FROM UNNEST(credits) c), 0)) as total_credits
        FROM `{table_name}`
        WHERE invoice.month = '{invoice_month}'
        GROUP BY item_name
    """

    costs_results = bq_client.query(query_costs).result()

    services_cost: list[ServiceCost] = []
    grand_total: float = 0.0
    tax_and_adjustments: float = 0.0

    for row in costs_results:
        # Bank-grade precision math
        net_cost = float((row.total_cost or 0) + (row.total_credits or 0))

        # Isolate taxes and adjustments from the services
        if row.item_name in ("tax", "adjustment"):
            tax_and_adjustments += net_cost
            grand_total += net_cost
        elif net_cost > 0.00:
            services_cost.append(ServiceCost(name=row.item_name, cost=net_cost))
            grand_total += net_cost

    # Sort services by most expensive first
    services_cost.sort(key=lambda x: x.cost, reverse=True)

    # Append taxes to the bottom of the list
    if tax_and_adjustments != 0.0:
        services_cost.append(
            ServiceCost(name="Taxes & Adjustments", cost=tax_and_adjustments)
        )

    return BillingData(
        display_month=display_month,
        freshness=latest_usage_jkt.strftime("%d %b %Y, %H:%M WIB"),
        grand_total=grand_total,
        services=services_cost,
        tax_and_adjustments=tax_and_adjustments,
    )
