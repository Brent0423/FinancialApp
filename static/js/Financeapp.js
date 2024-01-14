class FinanceApp {
    constructor() {
        this.INVALID_TICKER_SYMBOL = 'Invalid ticker symbol';
        this.USD_FORMAT = { style: 'currency', currency: 'USD' };
        this.formObject = {};
    }

    fetchMaxTradingYears(stockSymbol) {
        return fetch(`/maxTradingYears?symbol=${stockSymbol}`)
            .then(response => {
                if (!response.ok) {
                    throw new Error(this.INVALID_TICKER_SYMBOL);
                }
                return response.json();
            })
            .then(data => data.maxTradingYears);
    }

    formatAsDollarAmount(amount) {
        return new Intl.NumberFormat('en-US', this.USD_FORMAT).format(amount);
    }

    handleFormSubmit(event) {
        event.preventDefault();

        this.serializeForm();

        this.formObject['inflation'] = this.formObject['inflation'] === '' ? '0' : this.formObject['inflation'];
        this.formObject['inflationRate'] = $('#inflation').val();
        this.formObject['returnRate'] = $('#returnRate').val();

        this.formObject['investmentAmount'] = this.formatAsDollarAmount(parseFloat(this.formObject['investmentAmount']));

        this.fetchMaxTradingYears(this.formObject['symbol'])
            .then(maxTradingYears => {
                if (parseInt(this.formObject['timeFrame'], 10) > maxTradingYears) {
                    alert(`Warning: The stock has only been traded for ${maxTradingYears} years. Please use a number less than or equal to ${maxTradingYears}.`);
                    return;
                }

                $.ajax({
                    url: '/update_table',
                    type: 'POST',
                    data: this.formObject,
                    success: data => {
                        const formattedCurrentPrice = this.formatAsDollarAmount(parseFloat(data.current_price));

                        $('table tbody').append(`<tr>
                            <td>${data.stock_symbol}</td>
                            <td>${formattedCurrentPrice}</td>
                            <td>${data.investment_amount}</td>
                            <td>${data.time_frame}</td>
                            <td>${data.annualized_return}</td>
                            <td>${data.real_return}</td>
                            <td>${data.confidence_interval}</td>
                            <td><button class="remove-btn">X</button></td>
                        </tr>`);
                    },
                    error: (xhr, status, error) => {
                        if (xhr.status === 400 && xhr.responseText === this.INVALID_TICKER_SYMBOL) {
                            alert(`${this.INVALID_TICKER_SYMBOL}. Please enter a valid ticker symbol.`);
                        } else {
                            alert("An error occurred: " + error);
                        }
                    }
                });
            })
            .catch(error => {
                if (error.message === this.INVALID_TICKER_SYMBOL) {
                    alert(`${this.INVALID_TICKER_SYMBOL}. Please enter a valid ticker symbol.`);
                } else {
                    console.error('Error:', error);
                }
            });
    }

    serializeForm() {
        this.formObject = {};
        $('#investmentForm').serializeArray().forEach(item => {
            this.formObject[item.name] = item.value;
        });
    }

    attachEventHandlers() {
        $('#investmentForm').on('submit', this.handleFormSubmit.bind(this));
        $(document).on('click', '.remove-btn', function () {
            $(this).closest('tr').remove();
        });
    }

    fetchInitialData() {
        $.get('/', response => {
            if (response.warning) {
                alert(response.warning);
            }
        });
    }

    initialize() {
        this.attachEventHandlers();
        this.fetchInitialData();
    }
}

const financeApp = new FinanceApp();
financeApp.initialize();
