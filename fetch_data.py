# Import necessary libraries
import yfinance as yf
from datetime import datetime, timedelta
import pytz
import numpy as np

# Define a class to represent a stock
class Stock:
    def __init__(self, symbol):
        # Initialize with a symbol and create a yfinance Ticker object
        self.symbol = symbol
        self.ticker = yf.Ticker(self.symbol)
        self.data = None

    def fetch_history(self, period):
        # Fetches historical stock data for the specified period
        self.data = self.ticker.history(period=period)

# Define a class to fetch data for a stock
class StockDataFetcher:
    def __init__(self, stock):
        # Initialize with a Stock object
        self.stock = stock

    def fetch_total_years_traded(self):
        # Fetches the total number of years the stock has been traded
        self.stock.fetch_history('max')
        first_trade_date = self.stock.data.index[0]
        total_years_traded = (datetime.now(pytz.timezone('America/New_York')) - first_trade_date).days // 365
        return total_years_traded

    def fetch_data(self, years, inflation_rate=None, annualized_return=None):
        # Fetches data for the stock for the specified number of years
        # If inflation_rate is provided, it calculates the real return
        # If annualized_return is not provided, it calculates it from the historical data

        if not years:
            return {'error': 'Missing required parameters.'}

        years = int(years)

        total_years_traded = self.fetch_total_years_traded()
        years = min(years, total_years_traded)

        self.stock.fetch_history(f'{years}y')

        now = datetime.now(pytz.timezone('America/New_York')) - timedelta(days=1)
        data = self.stock.data.loc[self.stock.data.index < now]

        closing_prices = data['Close']
        first_prices = closing_prices.resample('M').first()

        mean = np.mean(first_prices)
        std_dev = np.std(first_prices)

        current_price = closing_prices.iloc[-1]
        z_score = (current_price - mean) / std_dev

        confidence_interval = (round(mean - 1.96 * (std_dev / np.sqrt(len(first_prices))), 2),
                               round(mean + 1.96 * (std_dev / np.sqrt(len(first_prices))), 2))

        if annualized_return is None:
            beginning_price = closing_prices.iloc[0]
            ending_price = closing_prices.iloc[-1]
            actual_years = len(closing_prices) / 252
            nominal_return = ((ending_price / beginning_price) ** (1/actual_years) - 1)
            annualized_return = round(nominal_return * 100, 2)
        else:
            nominal_return = annualized_return / 100

        data = {
            'stock_symbol': self.stock.symbol,
            'current_price': round(current_price, 2),
            'z_score': round(z_score, 2),
            'mean': round(mean, 2),
            'std_dev': round(std_dev, 2),
            'confidence_interval': confidence_interval,
            'annualized_return': annualized_return,
            'total_years_traded': total_years_traded,
        }

        if inflation_rate is not None:
            real_return = ((1 + nominal_return) / (1 + inflation_rate)) - 1
            data['real_return'] = round(real_return * 100, 2)

        return data

# Main execution
if __name__ == "__main__":
    # Get user input for stock symbol, number of years, and expected inflation rate
    symbol = input("Enter stock symbol: ")
    years = int(input("Enter number of years: "))
    inflation_rate = float(input("Enter expected inflation rate: "))
    annualized_return = None

    # Create a Stock object and a StockDataFetcher object
    stock = Stock(symbol)
    fetcher = StockDataFetcher(stock)
    # Fetch data and print the result
    result = fetcher.fetch_data(years, inflation_rate, annualized_return)
    print(result)
