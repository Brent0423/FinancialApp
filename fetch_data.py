import yfinance as yf
from datetime import datetime, timedelta
import pytz
import numpy as np


class StockDataFetcher:
    def __init__(self, symbol):
        # Initialize with a stock symbol
        self.symbol = symbol
        # Fetch the stock data
        self.stock = yf.Ticker(symbol)
        # Get the stock's history
        self.data = self.stock.history(period='max')
        # Calculate the total years the stock has been traded
        self.total_years_traded = self._calculate_total_years_traded()

    def _calculate_total_years_traded(self):
        # Calculate the total number of years the stock has been traded
        first_trade_date = self.data.index[0]
        total_years_traded = (datetime.now(pytz.timezone('America/New_York')) - first_trade_date).days // 365
        return total_years_traded

    def fetch_data(self, years, inflation_rate=None, annualized_return=None):
        # Fetch stock data for a given number of years
        if not years:
            return {'error': 'Missing required parameters.'}
        years = int(years)
        if inflation_rate is not None:
            inflation_rate = float(inflation_rate) / 100
        if annualized_return is not None:
            annualized_return = float(annualized_return)

        # Limit the years to the total years traded
        years = min(years, self.total_years_traded)

        # Fetch the stock history for the given years
        data = self.stock.history(period=f'{years}y')
        now = datetime.now(pytz.timezone('America/New_York')) - timedelta(days=1)
        data = data.loc[data.index < now]
        closing_prices = data['Close']

        # Calculate the first prices of each month
        first_prices = closing_prices.resample('M').first()

        # Calculate the mean and standard deviation of the first prices
        mean = np.mean(first_prices)
        std_dev = np.std(first_prices)

        # Calculate the current price and z-score
        current_price = closing_prices.iloc[-1]
        z_score = (current_price - mean) / std_dev

        # Calculate the confidence interval
        confidence_interval = (
            round(mean - 1.96 * (std_dev / np.sqrt(len(first_prices))), 2),
            round(mean + 1.96 * (std_dev / np.sqrt(len(first_prices))), 2)
        )

        # Calculate the annualized return if not provided
        if annualized_return is None:
            beginning_price = closing_prices.iloc[0]
            ending_price = closing_prices.iloc[-1]
            actual_years = len(closing_prices) / 252
            nominal_return = ((ending_price / beginning_price) ** (1 / actual_years) - 1)
            annualized_return = round(nominal_return * 100, 2)
        else:
            nominal_return = annualized_return / 100

        # Prepare the data to return
        data = {
            'stock_symbol': self.symbol,
            'current_price': round(current_price, 2),
            'z_score': round(z_score, 2),
            'mean': round(mean, 2),
            'std_dev': round(std_dev, 2),
            'confidence_interval': confidence_interval,
            'annualized_return': annualized_return,
            'total_years_traded': self.total_years_traded,
        }

        if inflation_rate is not None:
            # Calculate real return if inflation rate is provided
            real_return = ((1 + nominal_return) / (1 + inflation_rate)) - 1
            # Add real return to the data dictionary
            data['real_return'] = round(real_return * 100, 2)

        return data

    def fetch_data_and_calculate_real_return(self, years, inflation_rate=None, annualized_return=None):
        # Fetch stock data and calculate real return
        data = self.fetch_data(years, inflation_rate, annualized_return)

        if inflation_rate is not None and inflation_rate.replace('.', '', 1).isdigit():
            # Calculate real return if inflation rate is provided and is a valid number
            if 'annualized_return' in data:
                real_return = ((1 + data['annualized_return'] / 100) / (1 + float(inflation_rate) / 100)) - 1
                data['real_return'] = round(real_return * 100, 2)
            elif 'real_return' in data:
                data['real_return'] = round(data['real_return'] * 100, 2)

        return data


def fetch_data(symbol, years, inflation_rate=None, annualized_return=None):
    # Fetch stock data for a given symbol and number of years
    stock_data_fetcher = StockDataFetcher(symbol)
    return stock_data_fetcher.fetch_data(years, inflation_rate, annualized_return)


def fetch_data_and_calculate_real_return(symbol, years, inflation_rate=None, annualized_return=None):
    # Fetch stock data and calculate real return for a given symbol and number of years
    stock_data_fetcher = StockDataFetcher(symbol)
    return stock_data_fetcher.fetch_data_and_calculate_real_return(years, inflation_rate, annualized_return)


def fetch_total_years_traded(symbol):
    # Fetch the total number of years a stock has been traded for a given symbol
    stock_data_fetcher = StockDataFetcher(symbol)
    return stock_data_fetcher.total_years_traded


if __name__ == "__main__":
    # Get user inputs for stock symbol, number of years, and expected inflation rate
    symbol = input("Enter stock symbol: ")
    years = int(input("Enter number of years: "))
    inflation_rate = float(input("Enter expected inflation rate: "))
    annualized_return = None

    # Fetch stock data and calculate real return
    stock_data = fetch_data_and_calculate_real_return(symbol, years, inflation_rate, annualized_return)
    # Print the fetched data
    print(stock_data)
