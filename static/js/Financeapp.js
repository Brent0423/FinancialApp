// Function to fetch the maximum trading years from the API
function fetchMaxTradingYears(stockSymbol) {
    return fetch(`/maxTradingYears?symbol=${stockSymbol}`)
        .then(response => response.json())
        .then(data => {
            return data.maxTradingYears;
        })
        .catch(error => console.error('Error fetching max trading years:', error));
}

// Function to handle form submission
function handleFormSubmit(event) {
    event.preventDefault();

    var formData = $('#investmentForm').serializeArray();
    var formObject = {};
    formData.forEach(function(item) {
        formObject[item.name] = item.value;
    });

    console.log('Time frame:', formObject['timeFrame']);

    // Check if inflation is an empty string
    if (formObject['inflation'] === '') {
        // Option 1: Set a default value
        formObject['inflation'] = '0';

        // Option 2: Show an error message and return
        // alert('Please enter a value for inflation.');
        // return;
    }

    fetchMaxTradingYears(formObject['symbol']).then(maxTradingYears => {
        if (parseInt(formObject['timeFrame'], 10) > maxTradingYears) {
            alert(`Warning: The stock has only been traded for ${maxTradingYears} years. Please use a number less than or equal to ${maxTradingYears}.`);
            return;
        }

        // Continue with the form submission if the time frame is valid
        $.ajax({
            url: '/update_table',
            type: 'POST',
            data: formData,
            success: function(data) {
                // Update the table with new data
                var newRow = `<tr>
                                <td>${data.stock_symbol}</td>
                                <td>${data.current_price}</td>
                                <td>${data.investment_amount}</td>
                                <td>${data.time_frame}</td>
                                <td>${data.annualized_return}</td>
                                <td>${data.real_rate}</td>
                                <td>${data.confidence_interval}</td>
                                <td><button class="remove-btn">X</button></td>
                              </tr>`;
                $('table tbody').append(newRow);
            },
            error: function(xhr, status, error) {
                alert("An error occurred: " + error);
            }
        });
    });
}

// Attach event listener to the form submit event
$('#investmentForm').on('submit', handleFormSubmit);

// Existing code for removing rows
$(document).on('click', '.remove-btn', function() {
    $(this).closest('tr').remove();
});

// Existing code to handle initial GET request
$.get('/', function(response) {
    if (response.warning) {
        alert(response.warning);
    }
});
