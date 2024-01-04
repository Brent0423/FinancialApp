import yfinance as yf
from datetime import datetime, timedelta
import pytz
import numpy as np

def fetch_total_years_traded(symbol):
    stock = yf.Ticker(symbol)
    data = stock.history(period='max')
    first_trade_date = data.index[0]
    total_years_traded = (datetime.now(pytz.timezone('America/New_York')) - first_trade_date).days // 365
    return total_years_traded

def fetch_data(symbol, years, inflation_rate=None, annualized_return=None):
    if not symbol or not years:
        return {'error': 'Missing required parameters.'}
    years = int(years)
    if inflation_rate is not None:
        inflation_rate = float(inflation_rate) / 100
    if annualized_return is not None:
        annualized_return = float(annualized_return)

    total_years_traded = fetch_total_years_traded(symbol)
    years = min(years, total_years_traded)

    stock = yf.Ticker(symbol)
    data = stock.history(period=f'{years}y')
    now = datetime.now(pytz.timezone('America/New_York')) - timedelta(days=1)
    data = data.loc[data.index < now]
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
        real_return = ((1 + nominal_return) / (1 + inflation_rate)) - 1
        data['real_return'] = round(real_return * 100, 2)

    return data

if __name__ == "__main__":
    symbol = input("Enter stock symbol: ")
    years = int(input("Enter number of years: "))
    inflation_rate = float(input("Enter expected inflation rate: "))
    annualized_return = None
    fetch_data(symbol, years, inflation_rate, annualized_return)
