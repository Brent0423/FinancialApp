// Constants for error messages and formatting
const INVALID_TICKER_SYMBOL = 'Invalid ticker symbol';
const USD_FORMAT = { style: 'currency', currency: 'USD' };

// Class to fetch stock data
class StockDataFetcher {
    constructor(stockSymbol) {
        // Initialize with a stock symbol
        this.stockSymbol = stockSymbol;
    }

    // Method to fetch the maximum number of trading years for a stock
    fetchMaxTradingYears() {
        return fetch(`/maxTradingYears?symbol=${this.stockSymbol}`)
            .then(response => {
                // Throw an error if the response is not OK
                if (!response.ok) {
                    throw new Error(INVALID_TICKER_SYMBOL);
                }
                // Parse the response as JSON
                return response.json();
            })
            .then(data => data.maxTradingYears);
    }
}

// Class to handle form submissions
class FormHandler {
    constructor(formId) {
        // Initialize with a form ID
        this.formId = formId;
    }

    // Method to format an amount as a dollar amount
    formatAsDollarAmount(amount) {
        return new Intl.NumberFormat('en-US', USD_FORMAT).format(amount);
    }

    // Method to handle form submissions
    handleFormSubmit(event) {
        // Prevent the default form submission behavior
        event.preventDefault();

        // Create an object from the form data
        const formObject = {};
        $(this.formId).serializeArray().forEach(item => {
            formObject[item.name] = item.value;
        });

        // Set default values for inflation and return rate
        formObject['inflation'] = formObject['inflation'] === '' ? '0' : formObject['inflation'];
        formObject['inflationRate'] = $('#inflation').val();
        formObject['returnRate'] = $('#returnRate').val();

        // Format the investment amount as a dollar amount
        formObject['investmentAmount'] = this.formatAsDollarAmount(parseFloat(formObject['investmentAmount']));

        // Create a new StockDataFetcher and fetch the maximum number of trading years
        const fetcher = new StockDataFetcher(formObject['symbol']);
        fetcher.fetchMaxTradingYears()
            .then(maxTradingYears => {
                // Warn the user if the time frame is greater than the maximum number of trading years
                if (parseInt(formObject['timeFrame'], 10) > maxTradingYears) {
                    alert(`Warning: The stock has only been traded for ${maxTradingYears} years. Please use a number less than or equal to ${maxTradingYears}.`);
                    return;
                }

                // Send a POST request to update the table
                $.ajax({
                    url: '/update_table',
                    type: 'POST',
                    data: formObject,
                    success: data => {
                        // Format the current price as a dollar amount
                        const formattedCurrentPrice = this.formatAsDollarAmount(parseFloat(data.current_price));
                        // Append a new row to the table
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

                        // Reset the form
                        $(this.formId)[0].reset();
                    },
                    error: (xhr, status, error) => {
                        // Handle errors
                        if (xhr.status === 400 && xhr.responseText === INVALID_TICKER_SYMBOL) {
                            alert(`${INVALID_TICKER_SYMBOL}. Please enter a valid ticker symbol.`);
                        } else {
                            alert("An error occurred: " + error);
                        }
                    }
                });
            })
            .catch(error => {
                // Handle errors
                if (error.message === INVALID_TICKER_SYMBOL) {
                    alert(`${INVALID_TICKER_SYMBOL}. Please enter a valid ticker symbol.`);
                } else {
                    console.error('Error:', error);
                }
            });
    }
}

// Event Handlers
// Create a new FormHandler for the investment form
const formHandler = new FormHandler('#investmentForm');
// Handle form submissions
$('#investmentForm').on('submit', formHandler.handleFormSubmit.bind(formHandler));

// Handle clicks on the remove button
$(document).on('click', '.remove-btn', function() {
    $(this).closest('tr').remove();
});

// Initial Data Fetch
// Fetch data when the page loads
$.get('/', response => {
    if (response.warning) {
        alert(response.warning);
    }
});
