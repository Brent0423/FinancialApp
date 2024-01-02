from flask import Flask, render_template, request, jsonify
from fetch_data import fetch_data

app = Flask(__name__)

@app.route('/', methods=['GET'])
def home():
    # Get the stock symbol from the query parameters
    stock_symbol = request.args.get('symbol')
    time_frame = request.args.get('timeFrame')

    print("home route hit")  # Add this line

    data = None
    if stock_symbol:
        # Fetch the data for the entered stock symbol
        print("fetch_data called from home route")  # Add this line
        data = fetch_data(stock_symbol, time_frame)

    return render_template('financeapp.html', data=data)

@app.route('/update_table', methods=['POST'])
def update_table():
    print("update_table route hit")  # Add this line

    # Get the form data from the request
    symbol = request.form.get('symbol')
    investment_amount = request.form.get('investmentAmount')
    return_rate = request.form.get('returnRate')
    time_frame = request.form.get('timeFrame')
    # ... get the rest of the form data ...

    # Fetch the data for the entered stock symbol
    print("fetch_data called from update_table route")  # Add this line
    fetched_data = fetch_data(symbol, time_frame)

    if fetched_data is None:
        return jsonify({'error': 'Failed to fetch data for symbol {}'.format(symbol)})

    # Process the form data and generate the investment report
    # ...

    # Create a dictionary with the data for the new table row
    data = {
        'stock_symbol': symbol,
        'current_price': fetched_data['current_price'],  # Use the fetched current price
        'investment_amount': investment_amount,
        'annualized_return': return_rate if return_rate else fetched_data['annualized_return'],  # Use the return rate from the form data if it's available, otherwise use the fetched annualized return
        'time_frame': time_frame,
        'confidence_interval': f"{fetched_data['confidence_interval'][0]} - {fetched_data['confidence_interval'][1]}"  # Format the confidence interval as a string
    }

    # Return the data as JSON
    return jsonify(data)

if __name__ == "__main__":
    app.run(debug=True)
