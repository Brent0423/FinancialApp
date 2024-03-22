class FinanceApp {
    constructor() {
        // Define constants and initialize form object
        this.INVALID_TICKER_SYMBOL = 'Invalid ticker symbol';
        this.USD_FORMAT = { style: 'currency', currency: 'USD' };
        this.formObject = {};
    }

    fetchMaxTradingYears(stockSymbol) {
        // Fetch the maximum trading years for a given stock symbol
        return fetch(`/maxTradingYears?symbol=${stockSymbol}`)
            .then(response => {
                // Throw an error if the response is not OK
                if (!response.ok) {
                    throw new Error(this.INVALID_TICKER_SYMBOL);
                }
                // Parse the response as JSON
                return response.json();
            })
            .then(data => data.maxTradingYears);
    }

    formatAsDollarAmount(amount) {
        // Format a given amount as a dollar amount
        return new Intl.NumberFormat('en-US', this.USD_FORMAT).format(amount);
    }

    handleFormSubmit(event) {
        // Handle form submission
        event.preventDefault();

        // Serialize the form data
        this.serializeForm();

        // Set default inflation rate if not provided
        this.formObject['inflation'] = this.formObject['inflation'] === '' ? '0' : this.formObject['inflation'];
        // Get inflation rate and return rate from the form
        this.formObject['inflationRate'] = $('#inflation').val();
        this.formObject['returnRate'] = $('#returnRate').val();

        // Format the investment amount as a dollar amount
        this.formObject['investmentAmount'] = this.formatAsDollarAmount(parseFloat(this.formObject['investmentAmount']));

        // Fetch the maximum trading years for the given stock symbol
        this.fetchMaxTradingYears(this.formObject['symbol'])
            .then(maxTradingYears => {
                // Alert the user if the time frame is greater than the maximum trading years
                if (parseInt(this.formObject['timeFrame'], 10) > maxTradingYears) {
                    alert(`Warning: The stock has only been traded for ${maxTradingYears} years. Please use a number less than or equal to ${maxTradingYears}.`);
                    return;
                }

                $.ajax({
                    // Specify the URL to send the request to
                    url: '/update_table',
                    // Specify the type of request (POST)
                    type: 'POST',
                    // Include the form data in the request
                    data: this.formObject,
                    // Define what should happen if the request is successful
                    success: data => {
                        // Format the current price as a dollar amount
                        const formattedCurrentPrice = this.formatAsDollarAmount(parseFloat(data.current_price));

                        // Append a new row to the table with the received data
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

                        // Clear the form
                        this.clearForm();
                    },
                    // Define what should happen if the request fails
                    error: (xhr, status, error) => {
                        // If the status is 400 and the response text is the invalid ticker symbol message, alert the user
                        if (xhr.status === 400 && xhr.responseText === this.INVALID_TICKER_SYMBOL) {
                            alert(`${this.INVALID_TICKER_SYMBOL}. Please enter a valid ticker symbol.`);
                        } else {
                            // Otherwise, alert the user that an error occurred
                            alert("An error occurred: " + error);
                        }
                    }
                })
                .catch(error => {
                    // If the error message is the invalid ticker symbol message, alert the user
                    if (error.message === this.INVALID_TICKER_SYMBOL) {
                        alert(`${this.INVALID_TICKER_SYMBOL}. Please enter a valid ticker symbol.`);
                    } else {
                        // Otherwise, log the error
                        console.error('Error:', error);
                    }
                });
            });
    }

    // Serialize the form data into an object
    serializeForm() {
        this.formObject = {};
        $('#investmentForm').serializeArray().forEach(item => {
            this.formObject[item.name] = item.value;
        });
    }

    // Clear the form
    clearForm() {
        $('#investmentForm').find('input[type=text], input[type=number], select').val('');
    }

    // Attach event handlers to the form and the remove buttons
    attachEventHandlers() {
        $('#investmentForm').on('submit', this.handleFormSubmit.bind(this));
        $(document).on('click', '.remove-btn', function () {
            $(this).closest('tr').remove();
        });
    }

    // Fetch initial data from the server
    fetchInitialData() {
        $.get('/', response => {
            if (response.warning) {
                alert(response.warning);
            }
        });
    }

    // Initialize the app
    initialize() {
        this.attachEventHandlers();
        this.fetchInitialData();
    }
}

// Create a new instance of FinanceApp and initialize it
const financeApp = new FinanceApp();
financeApp.initialize();
