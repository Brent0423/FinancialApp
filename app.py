from flask import Flask, render_template, request, jsonify
from fetch_data import fetch_data, fetch_total_years_traded

app = Flask(__name__)  # Changed to use the 'app' variable directly for Flask instance

@app.route('/', methods=['GET'])  # Changed to use the 'app.route' decorator directly
def home():
    # Fetch data for a given stock symbol and time frame
    stock_symbol = request.args.get('symbol')
    time_frame = request.args.get('timeFrame')

    data = None
    total_years_traded = None

    if stock_symbol:
        data = fetch_data(stock_symbol, time_frame)
        total_years_traded = data['total_years_traded']

    # Render the home page with the fetched data
    return render_template('index.html', data=data, total_years_traded=total_years_traded)

@app.route('/maxTradingYears', methods=['GET'])  # Changed to use the 'app.route' decorator directly
def max_trading_years():
    # Fetch the maximum trading years for a given stock symbol
    stock_symbol = request.args.get('symbol')

    if stock_symbol:
        total_years_traded = fetch_total_years_traded(stock_symbol)
        return jsonify({'maxTradingYears': total_years_traded})
    else:
        return jsonify("No data")

@app.route('/update_table', methods=['POST'])
def update_table():
    symbol = request.form.get('symbol')
    investment_amount = request.form.get('investmentAmount')
    return_rate = request.form.get('returnRate')
    time_frame = request.form.get('timeFrame')
    inflation_rate = request.form.get('inflationRate')

    # Validate numeric inputs
    inflation_rate = inflation_rate if inflation_rate and inflation_rate.replace('.', '', 1).isdigit() else None
    return_rate = return_rate if return_rate and return_rate.replace('.', '', 1).isdigit() else None

    fetched_data = fetch_data(symbol, time_frame, inflation_rate)

    real_return = 'N/A'
    if inflation_rate and return_rate:
        real_return_value = ((1 + float(return_rate) / 100) / (1 + float(inflation_rate) / 100)) - 1
        real_return = f"{round(real_return_value * 100, 2)}%"

    data = {
        'stock_symbol': symbol,
        'current_price': fetched_data.get('current_price', 'N/A'),
        'investment_amount': investment_amount,
        'annualized_return': return_rate or fetched_data.get('annualized_return', 'N/A'),
        'real_return': real_return,
        'time_frame': time_frame,
        'confidence_interval': f"{fetched_data.get('confidence_interval', ['N/A', 'N/A'])[0]} - {fetched_data.get('confidence_interval', ['N/A', 'N/A'])[1]}"
    }

    return jsonify(data)

if __name__ == "__main__":
    app.run(host='0.0.0.0', port=5000, debug=True)  # Changed port to 5000 to match Docker Compose port mapping
