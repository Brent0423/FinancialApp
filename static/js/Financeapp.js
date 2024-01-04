// Define a function to fetch the maximum trading years for a given stock symbol
const fetchMaxTradingYears = stockSymbol => fetch(`/maxTradingYears?symbol=${stockSymbol}`)
    // Convert the response from the fetch API call to JSON
    .then(response => response.json())
    // Extract the maxTradingYears property from the JSON data
    .then(data => data.maxTradingYears)
    // Log any errors that occur during the fetch API call
    .catch(error => console.error('Error fetching max trading years:', error));

// Define a function to handle form submission events
const handleFormSubmit = event => {
    // Prevent the default form submission behavior
    event.preventDefault();

    // Convert the form data to an object where the keys are the form field names and the values are the form field values
    let formObject = $('#investmentForm').serializeArray().reduce((obj, item) => (obj[item.name] = item.value, obj), {});
    // If the inflation field is empty, set it to '0'
    formObject['inflation'] = formObject['inflation'] === '' ? '0' : formObject['inflation'];
    formObject['inflationRate'] = $('#inflation').val(); // Added this line
    formObject['returnRate'] = $('#returnRate').val(); // Added this line

    // Fetch the maximum trading years for the stock symbol entered in the form
    fetchMaxTradingYears(formObject['symbol']).then(maxTradingYears => {
        // If the time frame entered in the form is greater than the maximum trading years, show a warning and return
        if (parseInt(formObject['timeFrame'], 10) > maxTradingYears) {
            alert(`Warning: The stock has only been traded for ${maxTradingYears} years. Please use a number less than or equal to ${maxTradingYears}.`);
            return;
        }

        // Send a POST request to the server with the form data
        $.ajax({
            url: '/update_table',
            type: 'POST',
            data: formObject,
            success: data => $('table tbody').append(`<tr>
                <td>${data.stock_symbol}</td>
                <td>${data.current_price}</td>
                <td>${data.investment_amount}</td>
                <td>${data.time_frame}</td>
                <td>${data.annualized_return}</td>
                <td>${data.real_return}</td> <!-- Updated this line -->
                <td>${data.confidence_interval}</td>
                <td><button class="remove-btn">X</button></td>
            </tr>`),
            error: (xhr, status, error) => alert("An error occurred: " + error)
        });
    });
}

// Attach the handleFormSubmit function as an event handler for the form submit event
$('#investmentForm').on('submit', handleFormSubmit);

// Attach an event handler for the click event on elements with the class 'remove-btn' to remove the closest table row
$(document).on('click', '.remove-btn', () => $(this).closest('tr').remove());

// Send a GET request to the server and alert any warning message in the response
$.get('/', response => response.warning && alert(response.warning));
