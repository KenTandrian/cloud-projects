import json
import random
from datetime import datetime, timedelta, timezone
from tqdm import tqdm

def load_products(filename="data/products.json"):
    """
    Loads product data and categorizes stocks for different investor personas.
    """
    products = []
    try:
        with open(filename, 'r') as f:
            for line in f:
                products.append(json.loads(line))
    except FileNotFoundError:
        print(f"Error: Product file not found at '{filename}'. Please run the product generator first.")
        return [], [], [], []

    # Categorize stocks based on keywords and known tickers
    tech_stocks = [p['id'] for p in products if 'Technology' in p.get('categories', [])]
    value_stocks = [p['id'] for p in products if 'Consumer Staples' in p.get('categories', []) or 'Financial Services' in p.get('categories', [])]
    
    # Identify ETFs for the Dollar-Cost Averaging (DCA) persona
    etfs = [p['id'] for p in products if 'Exchange Traded Fund' in p.get('description', '') or p['id'] in ['SPY', 'VOO', 'QQQ', 'IVV']]
    if not etfs: etfs = ['SPY', 'VOO', 'QQQ'] # Fallback if specific ETFs are not in the product catalog

    # Fallbacks to prevent empty lists
    if not tech_stocks: tech_stocks = [p['id'] for p in products[:len(products)//2]]
    if not value_stocks: value_stocks = [p['id'] for p in products[len(products)//2:]]
        
    return products, tech_stocks, value_stocks, etfs

def generate_events():
    """
    Generates a realistic stream of user events with recurring visitors and specific
    purchasing patterns to satisfy all recommendation model requirements.
    """
    all_products, tech_stocks, value_stocks, etfs = load_products()
    if not all_products:
        return

    # Create a fixed pool of "loyal investors"
    # This is critical for generating repeat purchase histories for the "Buy It Again" model.
    NUM_LOYAL_INVESTORS = 250
    loyal_investors = {}
    for i in range(NUM_LOYAL_INVESTORS):
        persona_choice = random.choice(['tech', 'value', 'hedger', 'dca'])
        visitor_id = f"investor-{persona_choice}-{i}"
        
        investor_data = {'persona': persona_choice}
        # Assign a "core holding" to DCA investors that they will purchase repeatedly
        if persona_choice == 'dca' and etfs:
            investor_data['core_holding'] = random.choice(etfs)
        loyal_investors[visitor_id] = investor_data

    all_events = []
    NUM_DAYS = 95
    SESSIONS_PER_DAY = 150 # Number of random sessions to simulate each day

    print(f"Simulating {SESSIONS_PER_DAY} daily sessions from a pool of {NUM_LOYAL_INVESTORS} loyal investors over {NUM_DAYS} days...")

    for day in tqdm(range(NUM_DAYS), desc="Simulating Days"):
        current_date = datetime.now(timezone.utc) - timedelta(days=day)
        
        # Select a random subset of loyal investors to be active each day
        active_investors_today = random.sample(list(loyal_investors.keys()), k=min(SESSIONS_PER_DAY, NUM_LOYAL_INVESTORS))

        for visitor_id in active_investors_today:
            persona_data = loyal_investors[visitor_id]
            persona_choice = persona_data['persona']
            
            session_start_time = current_date - timedelta(minutes=random.randint(1, 1440))
            # Every session starts with a home-page-view for the RFY model
            all_events.append({"eventType": "home-page-view", "visitorId": visitor_id, "eventTime": (session_start_time).strftime('%Y-%m-%dT%H:%M:%SZ')})

            # Each session has several detail-page-views based on persona
            num_dpv_events = random.randint(3, 10)
            session_product_ids = set()
            for event_num in range(num_dpv_events):
                event_time = session_start_time + timedelta(seconds=event_num * 10)
                product_id = random.choice(tech_stocks) if persona_choice == 'tech' else random.choice(value_stocks)
                session_product_ids.add(product_id)
                all_events.append({"eventType": "detail-page-view", "visitorId": visitor_id, "eventTime": event_time.strftime('%Y-%m-%dT%H:%M:%SZ'), "productDetails": [{"product": {"id": product_id}}]})

            # --- Purchase Logic Tailored for Different Models ---
            
            # 1. DCA investors have a high chance of making their recurring "Buy It Again" purchase
            if persona_choice == 'dca' and 'core_holding' in persona_data and random.random() < 0.75:
                purchase_time = session_start_time + timedelta(seconds=num_dpv_events * 10 + 20)
                purchase_event = {"eventType": "purchase-complete", "visitorId": visitor_id, "eventTime": purchase_time.strftime('%Y-%m-%dT%H:%M:%SZ'), "productDetails": [], "purchaseTransaction": {"currencyCode": "USD"}}
                
                core_holding_id = persona_data['core_holding']
                product = next((p for p in all_products if p['id'] == core_holding_id), None)
                if product:
                    quantity = random.randint(5, 20)
                    revenue = quantity * product.get('priceInfo', {}).get('price', 100)
                    purchase_event["productDetails"].append({"product": {"id": core_holding_id}, "quantity": quantity})
                    purchase_event["purchaseTransaction"]["revenue"] = round(revenue, 2)
                    all_events.append(purchase_event)

            # 2. Other personas have a smaller chance of making multi-item purchases for FBT model
            elif random.random() < 0.2:
                purchase_time = session_start_time + timedelta(seconds=num_dpv_events * 10 + 20)
                purchase_event = {"eventType": "purchase-complete", "visitorId": visitor_id, "eventTime": purchase_time.strftime('%Y-%m-%dT%H:%M:%SZ'), "productDetails": [], "purchaseTransaction": {"currencyCode": "USD"}}
                total_revenue = 0
                
                # 'hedger' persona creates a specific co-purchase pattern
                if persona_choice == 'hedger' and len(tech_stocks) > 0 and len(value_stocks) > 0:
                    p1_id, p2_id = random.choice(tech_stocks), random.choice(value_stocks)
                    purchase_event["productDetails"].extend([{"product": {"id": p1_id}, "quantity": random.randint(10,50)}, {"product": {"id": p2_id}, "quantity": random.randint(10,50)}])
                # 'tech' and 'value' personas make a standard 2-item purchase
                elif len(session_product_ids) >= 2:
                    items_to_buy = random.sample(list(session_product_ids), k=2)
                    for pid in items_to_buy:
                        purchase_event["productDetails"].append({"product": {"id": pid}, "quantity": random.randint(10, 50)})
                
                # Calculate revenue for the purchase
                for detail in purchase_event["productDetails"]:
                    product = next((p for p in all_products if p['id'] == detail['product']['id']), None)
                    if product and product.get('priceInfo', {}).get('price'): 
                        total_revenue += detail['quantity'] * product['priceInfo']['price']
                purchase_event["purchaseTransaction"]["revenue"] = round(total_revenue, 2)
                
                if purchase_event["productDetails"]:
                    all_events.append(purchase_event)

    # --- Final Summary ---
    dpv_count = len([e for e in all_events if e['eventType'] == 'detail-page-view'])
    hpv_count = len([e for e in all_events if e['eventType'] == 'home-page-view'])
    purchase_count = len([e for e in all_events if e['eventType'] == 'purchase-complete'])
    print(f"\n--- Generation Summary ---")
    print(f"Total events generated: {len(all_events)}")
    print(f"Total unique visitors: {len(loyal_investors)}")
    print(f"Detail page views: {dpv_count} (Requirement: >10,000)")
    print(f"Home page views: {hpv_count} (Requirement: >10,000)")
    print(f"Purchase-complete events: {purchase_count} (Requirement: >1,000)")

    with open('data/user_events.json', 'w') as f:
        for event in all_events:
            f.write(json.dumps(event) + '\n')
            
    print("\nFile 'data/user_events.json' created successfully.")

if __name__ == '__main__':
    generate_events()
