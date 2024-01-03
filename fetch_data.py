import sys
import yfinance as yf
from datetime import datetime, timedelta
import pytz
import numpy as np
import json

def fetch_total_years_traded(symbol):
    stock = yf.Ticker(symbol)
    data = stock.history(period='max')  # get all available data
    first_trade_date = data.index[0]
    total_years_traded = (datetime.now(pytz.timezone('America/New_York')) - first_trade_date).days // 365
    return total_years_traded

def fetch_data(symbol, years, inflation_rate=None):
    print(f"fetch_data called with symbol={symbol}, years={years}, and inflation_rate={inflation_rate}")
    try:
        years = int(years)  # Convert years to integer
        if inflation_rate is not None:
            inflation_rate = float(inflation_rate) / 100  # Convert inflation rate to a decimal if it's provided

        total_years_traded = fetch_total_years_traded(symbol)
        if years > total_years_traded:
            print(f"Warning: {symbol} has only been traded for {total_years_traded} years. Using {total_years_traded} instead of {years}.")
            years = total_years_traded
        else:
            total_years_traded=years

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
        beginning_price = closing_prices.iloc[0]
        ending_price = closing_prices.iloc[-1]
        nominal_return = ((ending_price / beginning_price) ** (1/years) - 1)

        # Create a dictionary with the data
        data = {
            'stock_symbol': symbol,
            'current_price': round(current_price, 2),
            'z_score': round(z_score, 2),
            'mean': round(mean, 2),
            'std_dev': round(std_dev, 2),
            'confidence_interval': confidence_interval,
            'annualized_return': round(nominal_return * 100, 2),
            'total_years_traded': total_years_traded,
        }

        if inflation_rate is not None:
            # Calculate the real return
            real_return = ((1 + nominal_return) / (1 + inflation_rate)) - 1
            data['real_return'] = round(real_return * 100, 2)

        # Print data as JSON
        print(json.dumps(data))

        return data
    except Exception as e:
        print(f"An error occurred while fetching data for {symbol}: {e}")

if __name__ == "__main__":
    symbol = sys.argv[1] if len(sys.argv) > 1 else input("Enter stock symbol: ")
    years = int(sys.argv[2]) if len(sys.argv) > 2 else int(input("Enter number of years: "))
    inflation_rate = float(sys.argv[3]) if len(sys.argv) > 3 else float(input("Enter expected inflation rate: "))
    fetch_data(symbol, years, inflation_rate)
