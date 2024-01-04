from flask import Flask, render_template, request, jsonify
from fetch_data import fetch_data, fetch_total_years_traded

app = Flask(__name__)

@app.route('/', methods=['GET'])
def home():
    # Get the stock symbol from the query parameters
    stock_symbol = request.args.get('symbol')
    time_frame = request.args.get('timeFrame')

    print("home route hit")

    data = None
    total_years_traded = None
    if stock_symbol:
        # Fetch the data for the entered stock symbol
        print("fetch_data called from home route")
        data = fetch_data(stock_symbol, time_frame)
        total_years_traded = data['total_years_traded']  # Get the total years traded

    return render_template('financeapp.html', data=data, total_years_traded=total_years_traded)

@app.route('/maxTradingYears', methods=['GET'])
def max_trading_years():
    # Get the stock symbol from the query parameters
    stock_symbol = request.args.get('symbol')

    if stock_symbol:
        # Fetch the total years traded for the entered stock symbol
        total_years_traded = fetch_total_years_traded(stock_symbol)
        return jsonify({'maxTradingYears': total_years_traded})
    else:
        return jsonify("No data")

@app.route('/update_table', methods=['POST'])
def update_table():
    print("update_table route hit")

    # Get the form data from the request
    symbol = request.form.get('symbol')
    investment_amount = request.form.get('investmentAmount')
    return_rate = request.form.get('returnRate')
    time_frame = request.form.get('timeFrame')
    inflation_rate = request.form.get('inflationRate')

    # Fetch the data for the entered stock symbol
    print("fetch_data called from update_table route")
    fetched_data = fetch_data(symbol, time_frame, inflation_rate if inflation_rate and inflation_rate.replace('.', '', 1).isdigit() else None)

    # Check if inflation_rate is valid and if not, set real_return to 'N/A'
    real_return = fetched_data['real_return'] if inflation_rate and inflation_rate.replace('.', '', 1).isdigit() else 'N/A'

    # Create a dictionary with the data for the new table row
    data = {
        'stock_symbol': symbol,
        'current_price': fetched_data['current_price'] if 'current_price' in fetched_data else 'N/A',
        'investment_amount': investment_amount,
        'annualized_return': return_rate if return_rate else fetched_data.get('annualized_return', 'N/A'),
        'real_return': real_return,
        'time_frame': time_frame,
        'confidence_interval': f"{fetched_data.get('confidence_interval', ['N/A', 'N/A'])[0]} - {fetched_data.get('confidence_interval', ['N/A', 'N/A'])[1]}"
    }

    # Return the data as JSON
    return jsonify(data)

@app.route('/investmentreport', methods=['GET'])
def investment_report():
    return render_template('investmentreport.html')

if __name__ == "__main__":
    app.run(debug=True)
