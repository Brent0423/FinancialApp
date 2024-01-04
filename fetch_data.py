import sys
import yfinance as yf
from datetime import datetime, timedelta
import pytz
import numpy as np
import json
import logging

# Set up logging
logging.basicConfig(level=logging.INFO)

def fetch_total_years_traded(symbol):
    stock = yf.Ticker(symbol)
    data = stock.history(period='max')  # get all available data
    first_trade_date = data.index[0]
    total_years_traded = (datetime.now(pytz.timezone('America/New_York')) - first_trade_date).days // 365
    return total_years_traded

def fetch_data(symbol, years, inflation_rate=None, annualized_return=None):
    logging.info(f"fetch_data called with symbol={symbol}, years={years}, inflation_rate={inflation_rate}, annualized_return={annualized_return}")
    try:
        # Validate and convert inputs
        if not symbol or not years:
            return {'error': 'Missing required parameters.'}
        years = int(years)  # Convert years to integer
        if inflation_rate is not None:
            inflation_rate = float(inflation_rate) / 100  # Convert inflation rate to a decimal if it's provided
        if annualized_return is not None:
            annualized_return = float(annualized_return)

        total_years_traded = fetch_total_years_traded(symbol)
        years = min(years, total_years_traded)

        stock = yf.Ticker(symbol)
        data = stock.history(period=f'{years}y')
        now = datetime.now(pytz.timezone('America/New_York')) - timedelta(days=1)  # get current date in 'America/New_York' timezone
        data = data.loc[data.index < now]  # exclude today's date
        closing_prices = data['Close']

        # Get the first closing price of each month
        first_prices = closing_prices.resample('M').first()

        # Calculate the sample mean and standard deviation
        mean = np.mean(first_prices)
        std_dev = np.std(first_prices)

        # Calculate the z-score
        current_price = closing_prices.iloc[-1]  # Use .iloc[-1] instead of [-1]
        z_score = (current_price - mean) / std_dev

        # Calculate the 95% confidence interval
        confidence_interval = (round(mean - 1.96 * (std_dev / np.sqrt(len(first_prices))), 2),
                               round(mean + 1.96 * (std_dev / np.sqrt(len(first_prices))), 2))

        # Calculate the annualized rate of return
        if annualized_return is None:
            beginning_price = closing_prices.iloc[0]
            ending_price = closing_prices.iloc[-1]
            actual_years = len(closing_prices) / 252  # Approximate number of trading days in a year
            nominal_return = ((ending_price / beginning_price) ** (1/actual_years) - 1)
            annualized_return = round(nominal_return * 100, 2)
        else:
            nominal_return = annualized_return / 100

        # Create a dictionary with the data
        data = {
            'stock_symbol': symbol,
            'current_price': round(current_price, 2),
            'z_score': round(z_score, 2),
            'mean': round(mean, 2),
            'std_dev': round(std_dev, 2),
            'confidence_interval': confidence_interval,
            'annualized_return': annualized_return,
            'total_years_traded': total_years_traded,
        }

        if inflation_rate is not None:
            # Calculate the real return
            real_return = ((1 + nominal_return) / (1 + inflation_rate)) - 1
            data['real_return'] = round(real_return * 100, 2)

        # Log data as JSON
        logging.info(json.dumps(data))

        return data
    except Exception as e:
        logging.error(f"An error occurred while fetching data for {symbol}: {e}")
        return {'error': f"An error occurred while fetching data for {symbol}: {e}"}

if __name__ == "__main__":
    symbol = sys.argv[1] if len(sys.argv) > 1 else input("Enter stock symbol: ")
    years = int(sys.argv[2]) if len(sys.argv) > 2 else int(input("Enter number of years: "))
    inflation_rate = float(sys.argv[3]) if len(sys.argv) > 3 else float(input("Enter expected inflation rate: "))
    annualized_return = float(sys.argv[4]) if len(sys.argv) > 4 else None
    fetch_data(symbol, years, inflation_rate, annualized_return)
