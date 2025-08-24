import json
import os
import random
from datetime import datetime, timedelta, timezone
from tqdm import tqdm

def load_products(filename="products.json"):
    """Loads product data and categorizes stocks for personas."""
    products = []
    # Handle both single JSON object per line and a list of JSON objects
    with open(filename, 'r') as f:
        content = f.read()
        if content.startswith('['):
            products = json.loads(content)
        else:
            for line in content.splitlines():
                if line.strip():
                    products.append(json.loads(line))

    tech_stocks = [p['id'] for p in products if 'Technology' in p.get('categories', [])]
    value_stocks = [p['id'] for p in products if 'Consumer Staples' in p.get('categories', []) or 'Financial Services' in p.get('categories', [])]
    
    # Ensure lists are not empty
    if not tech_stocks: tech_stocks = [p['id'] for p in products[:len(products)//2]]
    if not value_stocks: value_stocks = [p['id'] for p in products[len(products)//2:]]
        
    return products, tech_stocks, value_stocks

def generate_events():
    """Generates a comprehensive set of user events to satisfy all three model requirements."""
    script_dir = os.path.dirname(__file__)
    resources_path = os.path.join(script_dir, "products.json")
    all_products, tech_stocks, value_stocks = load_products(resources_path)
    if not all_products:
        print("Error: products.json is empty or not found.")
        return

    all_events = []
    NUM_DAYS = 95
    VISITORS_PER_DAY = 50

    print(f"Generating events for {VISITORS_PER_DAY} visitors/day over {NUM_DAYS} days...")

    for day in tqdm(range(NUM_DAYS), desc="Simulating Days"):
        current_date = datetime.now(timezone.utc) - timedelta(days=day)
        
        for i in range(VISITORS_PER_DAY):
            persona_choice = random.choice(['tech', 'value', 'hedger'])
            visitor_id = f"visitor-{persona_choice}-{day}-{i}"
            
            session_start_time = current_date - timedelta(minutes=random.randint(1, 1440))
            
            # 1. Every session starts with a home-page-view for RFY model
            all_events.append({
                "eventType": "home-page-view",
                "visitorId": visitor_id,
                "eventTime": (session_start_time).strftime('%Y-%m-%dT%H:%M:%SZ')
            })

            # 2. Session consists of multiple detail-page-views
            num_dpv_events = random.randint(5, 15)
            session_product_ids = set()
            for event_num in range(num_dpv_events):
                event_time = session_start_time + timedelta(seconds=event_num * 10)
                
                if persona_choice == 'tech':
                    product_id = random.choice(tech_stocks)
                else: # Both value and hedger personas look at value stocks
                    product_id = random.choice(value_stocks)
                
                session_product_ids.add(product_id)
                all_events.append({
                    "eventType": "detail-page-view",
                    "visitorId": visitor_id,
                    "eventTime": event_time.strftime('%Y-%m-%dT%H:%M:%SZ'),
                    "productDetails": [{"product": {"id": product_id}}]
                })
            
            # 3. A chance of a purchase event to train FBT model
            if random.random() < 0.3: # 30% chance of a purchase per session
                purchase_time = session_start_time + timedelta(seconds=num_dpv_events * 10 + 20)
                purchase_event = {
                    "eventType": "purchase-complete",
                    "visitorId": visitor_id,
                    "eventTime": purchase_time.strftime('%Y-%m-%dT%H:%M:%SZ'),
                    "productDetails": [],
                    "purchaseTransaction": {"currencyCode": "USD"}
                }
                
                total_revenue = 0
                
                if persona_choice == 'hedger':
                    # Create the FBT pattern: buy one tech and one value stock
                    p1_id = random.choice(tech_stocks)
                    p2_id = random.choice(value_stocks)
                    purchase_event["productDetails"].extend([{"product": {"id": p1_id}, "quantity": random.randint(10,50)}, 
                                                            {"product": {"id": p2_id}, "quantity": random.randint(10,50)}])
                else:
                    # Standard purchase of one or two items from the session
                    items_to_buy = random.sample(list(session_product_ids), k=min(len(session_product_ids), random.randint(1,2)))
                    for pid in items_to_buy:
                        purchase_event["productDetails"].append({"product": {"id": pid}, "quantity": random.randint(10, 50)})
                
                # Calculate revenue
                for detail in purchase_event["productDetails"]:
                    product = next((p for p in all_products if p['id'] == detail['product']['id']), None)
                    if product and product.get('priceInfo', {}).get('price'):
                        total_revenue += detail['quantity'] * product['priceInfo']['price']
                
                purchase_event["purchaseTransaction"]["revenue"] = round(total_revenue, 2)
                
                if purchase_event["productDetails"]:
                    all_events.append(purchase_event)

    # Final count summary
    dpv_count = len([e for e in all_events if e['eventType'] == 'detail-page-view'])
    hpv_count = len([e for e in all_events if e['eventType'] == 'home-page-view'])
    purchase_count = len([e for e in all_events if e['eventType'] == 'purchase-complete'])
    print("\n--- Generation Summary ---")
    print(f"Total events generated: {len(all_events)}")
    print(f"Detail page views: {dpv_count} (Requirement: >10,000)")
    print(f"Home page views: {hpv_count} (Requirement: >10,000)")
    print(f"Purchase-complete events: {purchase_count} (Requirement: >1,000)")

    script_dir = os.path.dirname(__file__)
    resources_path = os.path.join(script_dir, "user_events.json")
    with open(resources_path, 'w') as f:
        for event in all_events:
            f.write(json.dumps(event) + '\n')
            
    print(f"\nFile '{resources_path}' created successfully.")

if __name__ == '__main__':
    generate_events()
