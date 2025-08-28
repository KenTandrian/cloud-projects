import json

PRODUCTS_FILE = 'data/products.json'

def validate_product_variety():
    """
    Loads products.json and prints the counts of stocks categorized
    for the event generation personas.
    """
    print("--- Starting Data Variety Validation ---")
    
    try:
        products = []
        with open(PRODUCTS_FILE, 'r') as f:
            for line in f:
                products.append(json.loads(line))
        
        if not products:
            print(f"Error: No products found in {PRODUCTS_FILE}")
            return
            
        print(f"Successfully loaded {len(products)} total products from '{PRODUCTS_FILE}'.")
    except FileNotFoundError:
        print(f"Error: The file '{PRODUCTS_FILE}' was not found. Please generate it first.")
        return
    except json.JSONDecodeError:
        print(f"Error: Could not decode JSON from '{PRODUCTS_FILE}'. Make sure it's formatted correctly.")
        return

    # Use the exact same logic as the event generator
    tech_stocks = [p['id'] for p in products if 'Technology' in p.get('categories', [])]
    value_stocks = [p['id'] for p in products if 'Consumer Staples' in p.get('categories', []) or 'Financial Services' in p.get('categories', [])]

    # Calculate the total number of unique stocks available to the simulation personas
    combined_unique_stocks = set(tech_stocks + value_stocks)

    print("\n--- Persona Category Counts ---")
    print(f"Number of 'Technology' stocks found: {len(tech_stocks)}")
    print(f"Number of 'Value' (Consumer Staples/Financial) stocks found: {len(value_stocks)}")
    print(f"Total unique stocks available for personas: {len(combined_unique_stocks)}")

    print("\n--- Analysis ---")
    if len(combined_unique_stocks) >= 100:
        print("✅ SUCCESS: The number of unique stocks available to the personas is well above the 100-item minimum requirement.")
        print("You can confidently proceed with generating and importing user events.")
    else:
        print(f"⚠️ WARNING: The number of unique stocks ({len(combined_unique_stocks)}) is below the 100-item minimum requirement.")
        print("The product catalog may not be diverse enough. Consider generating more products before proceeding.")

if __name__ == '__main__':
    validate_product_variety()
