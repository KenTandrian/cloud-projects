from dataclasses import dataclass
from typing import List


@dataclass
class ServiceCost:
    name: str
    cost: float


@dataclass
class BillingData:
    display_month: str
    freshness: str
    grand_total: float
    services: List[ServiceCost]
