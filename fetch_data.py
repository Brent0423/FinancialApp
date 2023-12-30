import sys
import yfinance as yf
from datetime import datetime, timedelta
import pytz
import numpy as np

def fetch_data(symbol, years):
    try:
        stock = yf.Ticker(symbol)
        data = stock.history(period='max')  # get all available data
        first_trade_date = data.index[0]
        total_years_traded = (datetime.now(pytz.timezone('America/New_York')) - first_trade_date).days // 365

        if years > total_years_traded:
            print(f"Warning: {symbol} has only been traded for {total_years_traded} years. Using {total_years_traded} instead of {years}.")
            years = total_years_traded

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
        confidence_interval = round(1.96 * (std_dev / np.sqrt(len(first_prices))), 2)

        # Calculate the annualized rate of return
        beginning_price = closing_prices.iloc[0]
        ending_price = closing_prices.iloc[-1]
        annualized_return = round(((ending_price / beginning_price) ** (1/years) - 1) * 100, 2)

        print(f"Current stock price for {symbol}: {round(current_price, 2)}")
        print(f"Z-Score for {symbol}: {round(z_score, 2)}")
        print(f"Mean of first closing prices for {symbol}: {round(mean, 2)}")
        print(f"Standard deviation of first closing prices for {symbol}: {round(std_dev, 2)}")
        print(f"95% confidence interval for {symbol}: {round(mean - confidence_interval, 2)} to {round(mean + confidence_interval, 2)}")
        print(f"Annualized rate of return for {symbol} over {years} years: {annualized_return}%")

        return round(mean, 2), round(std_dev, 2), round(z_score, 2), round(confidence_interval, 2), round(current_price, 2), annualized_return
    except Exception as e:
        print(f"An error occurred while fetching data for {symbol}: {e}")

if __name__ == "__main__":
    symbol = sys.argv[1] if len(sys.argv) > 1 else input("Enter stock symbol: ")
    years = int(sys.argv[2]) if len(sys.argv) > 2 else int(input("Enter number of years: "))
    fetch_data(symbol, years)
