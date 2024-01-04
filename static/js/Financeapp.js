// Define some constants
const INVALID_TICKER_SYMBOL = 'Invalid ticker symbol';
const USD_FORMAT = { style: 'currency', currency: 'USD' };

// Define a function to fetch the maximum trading years for a stock
function fetchMaxTradingYears(stockSymbol) {
    return fetch(`/maxTradingYears?symbol=${stockSymbol}`)
        .then(response => {
            if (!response.ok) {
                throw new Error(INVALID_TICKER_SYMBOL);
            }
            return response.json();
        })
        .then(data => data.maxTradingYears);
}

// Define a function to format an amount as a dollar amount
function formatAsDollarAmount(amount) {
    return new Intl.NumberFormat('en-US', USD_FORMAT).format(amount);
}

// Define a function to handle the form submission
function handleFormSubmit(event) {
    event.preventDefault();

    const formObject = {};
    $('#investmentForm').serializeArray().forEach(item => {
        formObject[item.name] = item.value;
    });

    formObject['inflation'] = formObject['inflation'] === '' ? '0' : formObject['inflation'];
    formObject['inflationRate'] = $('#inflation').val();
    formObject['returnRate'] = $('#returnRate').val();

    formObject['investmentAmount'] = formatAsDollarAmount(parseFloat(formObject['investmentAmount']));

    fetchMaxTradingYears(formObject['symbol'])
        .then(maxTradingYears => {
            if (parseInt(formObject['timeFrame'], 10) > maxTradingYears) {
                alert(`Warning: The stock has only been traded for ${maxTradingYears} years. Please use a number less than or equal to ${maxTradingYears}.`);
                return;
            }

            $.ajax({
                url: '/update_table',
                type: 'POST',
                data: formObject,
                success: data => {
                    const formattedCurrentPrice = formatAsDollarAmount(parseFloat(data.current_price));

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
                    if (xhr.status === 400 && xhr.responseText === INVALID_TICKER_SYMBOL) {
                        alert(`${INVALID_TICKER_SYMBOL}. Please enter a valid ticker symbol.`);
                    } else {
                        alert("An error occurred: " + error);
                    }
                }
            });
        })
        .catch(error => {
            if (error.message === INVALID_TICKER_SYMBOL) {
                alert(`${INVALID_TICKER_SYMBOL}. Please enter a valid ticker symbol.`);
            } else {
                console.error('Error:', error);
            }
        });
}

// Attach the form submit handler
$('#investmentForm').on('submit', handleFormSubmit);

// Attach the click handler for the remove button
$(document).on('click', '.remove-btn', function() {
    $(this).closest('tr').remove();
});

// Fetch the initial data
$.get('/', response => {
    if (response.warning) {
        alert(response.warning);
    }
});
