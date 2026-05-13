import os
from typing import Optional

import pytz
from google.cloud import bigquery
from models import BillingData, ServiceCost


def get_billing_data() -> Optional[BillingData]:
    bq_client = bigquery.Client()
    table_name = os.environ.get("BQ_TABLE_NAME")
    jakarta_tz = pytz.timezone("Asia/Jakarta")

    # Get latest usage time
    query_date = f"""
        SELECT MAX(usage_end_time) as latest_usage 
        FROM `{table_name}`
    """
    latest_usage_time = list(bq_client.query(query_date).result())[0].latest_usage

    if not latest_usage_time:
        print("No data found in billing table.")
        return None

    latest_usage_jkt = latest_usage_time.astimezone(jakarta_tz)
    invoice_month = latest_usage_jkt.strftime("%Y%m")

    # Get costs
    query_costs = f"""
        SELECT 
            service.description as service_name,
            SUM(cost) as total_cost, 
            SUM(IFNULL((SELECT SUM(c.amount) FROM UNNEST(credits) c), 0)) as total_credits
        FROM `{table_name}`
        WHERE invoice.month = '{invoice_month}'
        GROUP BY service_name
    """

    costs_results = bq_client.query(query_costs).result()

    services_cost: list[ServiceCost] = []
    grand_total: float = 0.0

    for row in costs_results:
        net_cost = (row.total_cost or 0) + (row.total_credits or 0)
        if net_cost > 0.00:
            services_cost.append(ServiceCost(name=row.service_name, cost=net_cost))
            grand_total += net_cost

    services_cost = sorted(services_cost, key=lambda x: x.cost, reverse=True)

    # Return pure data
    return BillingData(
        display_month=latest_usage_jkt.strftime("%B %Y"),
        freshness=latest_usage_jkt.strftime("%d %b %Y, %H:%M WIB"),
        grand_total=grand_total,
        services=services_cost,
    )
