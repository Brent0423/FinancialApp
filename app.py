# Import necessary modules
from flask import Flask, render_template, request, jsonify
from fetch_data import Stock, StockDataFetcher

app = Flask(__name__)

class StockDataController:
    def __init__(self, symbol, time_frame=None):
        self.symbol = symbol
        self.time_frame = time_frame
        self.stock = Stock(symbol)
        self.stock_data = StockDataFetcher(self.stock)

    def get_data(self):
        # Fetch data for the given symbol and time frame
        data = self.stock_data.fetch_data(self.time_frame)
        return data

    def get_total_years_traded(self):
        # Fetch the total years traded for the given symbol
        total_years_traded = self.stock_data.fetch_total_years_traded()
        return total_years_traded

# Define the home route
@app.route('/', methods=['GET'])
def home():
    # Get the stock symbol and time frame from the request parameters
    stock_symbol = request.args.get('symbol')
    time_frame = request.args.get('timeFrame')

    data = None
    total_years_traded = None
    if stock_symbol:
        # Fetch data for the given stock symbol and time frame
        controller = StockDataController(stock_symbol, time_frame)
        data = controller.get_data()
        total_years_traded = controller.get_total_years_traded()

    # Render the financeapp.html template with the fetched data and total years traded
    return render_template('financeapp.html', data=data, total_years_traded=total_years_traded)

# Define the maxTradingYears route
@app.route('/maxTradingYears', methods=['GET'])
def max_trading_years():
    # Get the stock symbol from the request parameters
    stock_symbol = request.args.get('symbol')

    if stock_symbol:
        # Fetch the total years traded for the given stock symbol
        controller = StockDataController(stock_symbol)
        total_years_traded = controller.get_total_years_traded()
        # Return the total years traded as a JSON response
        return jsonify({'maxTradingYears': total_years_traded})
    else:
        # Return "No data" as a JSON response if no stock symbol is provided
        return jsonify("No data")

# Define the update_table route
@app.route('/update_table', methods=['POST'])
def update_table():
    # Get the symbol, investment amount, return rate, time frame, and inflation rate from the form data
    symbol = request.form.get('symbol')
    investment_amount = request.form.get('investmentAmount')
    return_rate = request.form.get('returnRate')
    time_frame = request.form.get('timeFrame')
    inflation_rate = request.form.get('inflationRate')

    inflation_rate_value = None
    if inflation_rate and inflation_rate.replace('.', '', 1).isdigit():
        # Check if the inflation rate is a valid number
        inflation_rate_value = inflation_rate

    # Fetch data for the given symbol, time frame, and inflation rate
    controller = StockDataController(symbol, time_frame)
    fetched_data = controller.get_data()

    real_return = 'N/A'
    if inflation_rate and inflation_rate.replace('.', '', 1).isdigit():
        if return_rate:
            # Calculate the real return if both return rate and inflation rate are provided
            real_return = ((1 + float(return_rate) / 100) / (1 + float(inflation_rate) / 100)) - 1
            real_return = round(real_return * 100, 2)
        else:
            # Use the fetched real return if return rate is not provided
            real_return = fetched_data['real_return']

    # Prepare the data to be returned as a JSON response
    data = {
        'stock_symbol': symbol,
        'current_price': fetched_data['current_price'] if 'current_price' in fetched_data else 'N/A',
        'investment_amount': investment_amount,
        'annualized_return': return_rate if return_rate else fetched_data.get('annualized_return', 'N/A'),
        'real_return': real_return,
        'time_frame': time_frame,
        'confidence_interval': f"{fetched_data.get('confidence_interval', ['N/A', 'N/A'])[0]} - {fetched_data.get('confidence_interval', ['N/A', 'N/A'])[1]}"
    }

    # Return the data as a JSON response
    return jsonify(data)

# Run the Flask app if this file is executed directly
if __name__ == "__main__":
    app.run(host='0.0.0.0', debug=True)
