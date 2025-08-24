# import pandas as pd
import yfinance as yf
import json
import requests
from bs4 import BeautifulSoup
from tqdm import tqdm
import random

def get_sp500_tickers():
    """Scrapes S&P 500 tickers from Wikipedia."""
    url = 'https://en.wikipedia.org/wiki/List_of_S%26P_500_companies'
    response = requests.get(url)
    soup = BeautifulSoup(response.text, 'html.parser')
    table = soup.find('table', {'id': 'constituents'})
    tickers = []
    for row in table.find_all('tr')[1:]:
        ticker = row.find('td').text.strip()
        tickers.append(ticker)
    return tickers

def get_stock_data(ticker):
    """Fetches and formats data for a single stock ticker using yfinance."""
    try:
        stock = yf.Ticker(ticker)
        info = stock.info

        # Skip if essential data is missing
        if 'longName' not in info or 'regularMarketPrice' not in info or info['regularMarketPrice'] is None:
            return None

        # Prepare categories and tags
        categories = ["S&P 500"]
        if info.get('sector'):
            categories.append(info['sector'])
        if info.get('industry'):
            categories.append(info['industry'])

        tags = list(set(categories)) # Basic tags from categories
        if info.get('quoteType') == 'EQUITY':
             # Add tags based on financial metrics
            if info.get('trailingPE', 0) > 0 and info.get('trailingPE', 0) < 20:
                tags.append("value")
            if info.get('marketCap', 0) > 200000000000:
                tags.append("large cap")
            if info.get('forwardEps', 0) > info.get('trailingEps', 0) and info.get('trailingEps', 0) > 0:
                 tags.append("growth")


        # Build the attributes list
        attributes = []
        if info.get('marketCap'):
            attributes.append({'key': 'marketCap', 'value': {'numbers': [info['marketCap']]}})
        if info.get('trailingPE'):
            attributes.append({'key': 'peRatio', 'value': {'numbers': [info['trailingPE']]}})
        if info.get('dividendYield'):
            attributes.append({'key': 'dividendYield', 'value': {'numbers': [info['dividendYield']]}})
        if info.get('recommendationKey'):
             attributes.append({'key': 'analystRating', 'value': {'text': [info['recommendationKey']]}})


        product_data = {
            'id': ticker,
            'title': info.get('longName', ticker),
            'categories': categories,
            'description': info.get('longBusinessSummary', 'No description available.'),
            'brands': [info.get('exchange', 'N/A')],
            'languageCode': 'en-US',
            'priceInfo': {
                'currencyCode': info.get('currency', 'USD'),
                'price': info.get('regularMarketPrice')
            },
            'availability': 'IN_STOCK',
            'uri': f"https://finance.yahoo.com/quote/{ticker}",
            'tags': list(set(tags)), # Ensure unique tags
            'attributes': attributes
        }
        return product_data
    except Exception as e:
        print(f"Could not fetch data for {ticker}: {e}")
        return None

def main():
    """Main function to generate the products.json file."""
    print("Fetching S&P 500 tickers...")
    tickers = get_sp500_tickers()
    
    # We'll aim for at least 300, let's take a sample in case some fail
    if len(tickers) > 350:
        tickers_to_fetch = random.sample(tickers, 350)
    else:
        tickers_to_fetch = tickers

    print(f"Fetching financial data for {len(tickers_to_fetch)} stocks. This may take a few minutes...")
    
    all_products = []
    # Using tqdm for a progress bar
    for ticker in tqdm(tickers_to_fetch, desc="Processing stocks"):
        data = get_stock_data(ticker)
        if data:
            all_products.append(data)
        if len(all_products) >= 300:
            break
            
    if len(all_products) < 300:
        print(f"Warning: Only managed to generate data for {len(all_products)} stocks.")
    else:
        print(f"Successfully generated data for {len(all_products)} stocks.")

    # Save to file with each JSON object on a new line
    print("Saving data to products.json...")

    with open('products.json', 'w') as f:
        for product in all_products:
            f.write(json.dumps(product) + '\n')
            
    print("File 'products.json' has been created successfully.")

if __name__ == '__main__':
    main()
