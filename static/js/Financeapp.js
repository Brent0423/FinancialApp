const fetchMaxTradingYears = stockSymbol => fetch(`/maxTradingYears?symbol=${stockSymbol}`)
    .then(response => response.json())
    .then(data => data.maxTradingYears)
    .catch(error => console.error('Error fetching max trading years:', error));

const handleFormSubmit = event => {
    event.preventDefault();

    let formObject = $('#investmentForm').serializeArray().reduce((obj, item) => (obj[item.name] = item.value, obj), {});
    formObject['inflation'] = formObject['inflation'] === '' ? '0' : formObject['inflation'];
    formObject['inflationRate'] = $('#inflation').val();
    formObject['returnRate'] = $('#returnRate').val();

    // Format the investment amount as a dollar amount
    let investmentAmount = parseFloat(formObject['investmentAmount']);
    formObject['investmentAmount'] = new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(investmentAmount);

    fetchMaxTradingYears(formObject['symbol']).then(maxTradingYears => {
        if (parseInt(formObject['timeFrame'], 10) > maxTradingYears) {
            alert(`Warning: The stock has only been traded for ${maxTradingYears} years. Please use a number less than or equal to ${maxTradingYears}.`);
            return;
        }

        $.ajax({
            url: '/update_table',
            type: 'POST',
            data: formObject,
            success: data => {
                const { stock_symbol, current_price, investment_amount, time_frame, annualized_return, real_return, confidence_interval } = data;

                // Format the current price as a dollar amount
                let currentPrice = parseFloat(current_price);
                let formattedCurrentPrice = new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(currentPrice);

                $('table tbody').append(`<tr>
                    <td>${stock_symbol}</td>
                    <td>${formattedCurrentPrice}</td>
                    <td>${investment_amount}</td>
                    <td>${time_frame}</td>
                    <td>${annualized_return}</td>
                    <td>${real_return}</td>
                    <td>${confidence_interval}</td>
                    <td><button class="remove-btn">X</button></td>
                </tr>`);
            },
            error: (xhr, status, error) => alert("An error occurred: " + error)
        });
    });
}

$('#investmentForm').on('submit', handleFormSubmit);

$(document).on('click', '.remove-btn', function() { $(this).closest('tr').remove(); });

$.get('/', response => response.warning && alert(response.warning));
