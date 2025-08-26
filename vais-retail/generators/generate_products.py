# import pandas as pd
import yfinance as yf
import json
import requests
from bs4 import BeautifulSoup
from tqdm import tqdm
from urllib.parse import urlparse

def get_logo_url(website_url: str) -> str | None:
    """
    Constructs a Clearbit logo URL from a company website and verifies it exists.
    """
    if not website_url:
        return None
    
    try:
        # Extract the domain (e.g., "apple.com") from "https://www.apple.com"
        domain = urlparse(website_url).netloc
        if domain.startswith('www.'):
            domain = domain[4:]
        
        if not domain:
            return None
            
        logo_url = f"https://logo.clearbit.com/{domain}"
        
        # Check if the logo actually exists to avoid broken links
        response = requests.head(logo_url, timeout=5)
        if response.status_code == 200:
            return logo_url
        else:
            return None
    except requests.RequestException:
        return None

def get_sp500_tickers():
    """Scrapes all S&P 500 tickers from Wikipedia."""
    url = 'https://en.wikipedia.org/wiki/List_of_S%26P_500_companies'
    response = requests.get(url)
    soup = BeautifulSoup(response.text, 'html.parser')
    table = soup.find('table', {'id': 'constituents'})
    tickers = []
    for row in table.find_all('tr')[1:]:
        # Replace '.' with '-' for tickers like 'BRK.B' -> 'BRK-B'
        ticker = row.find('td').text.strip().replace('.', '-')
        tickers.append(ticker)
    return tickers

def get_stock_data(ticker):
    """Fetches and formats data for a single stock ticker using yfinance."""
    try:
        stock = yf.Ticker(ticker)
        info = stock.info

        if 'longName' not in info or 'regularMarketPrice' not in info or info['regularMarketPrice'] is None:
            return None

        logo_image_url = get_logo_url(info.get('website'))
        images = []
        if logo_image_url:
            images.append({"uri": logo_image_url})

        categories = ["S&P 500"]
        if info.get('sector'):
            categories.append(info['sector'])
        if info.get('industry'):
            categories.append(info['industry'])

        tags = list(set(categories))
        if info.get('quoteType') == 'EQUITY':
            if info.get('trailingPE', 0) > 0 and info.get('trailingPE', 0) < 20:
                tags.append("value")
            if info.get('marketCap', 0) > 200000000000:
                tags.append("large cap")
            if info.get('forwardEps', 0) > info.get('trailingEps', 0) and info.get('trailingEps', 0) > 0:
                 tags.append("growth")

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
            'images': images,
            'tags': list(set(tags)),
            'attributes': attributes,
        }
        return product_data
    except Exception as e:
        print(f"Could not fetch data for {ticker}: {e}")
        return None

def main():
    """Main function to generate the products.json file."""
    print("Fetching all S&P 500 tickers...")
    tickers_to_fetch = get_sp500_tickers()
    
    print(f"Fetching financial data for up to {len(tickers_to_fetch)} stocks. This will take several minutes...")
    
    all_products = []
    for ticker in tqdm(tickers_to_fetch, desc="Processing stocks"):
        data = get_stock_data(ticker)
        if data:
            all_products.append(data)
    
    print(f"\nSuccessfully generated data for {len(all_products)} stocks.")

    print("Saving data to products.json...")
    with open('products.json', 'w') as f:
        for product in all_products:
            f.write(json.dumps(product) + '\n')
            
    print("File 'products.json' has been created successfully.")

if __name__ == '__main__':
    main()
