$(document).on('click', '.remove-btn', function() {
    // If the clicked element has the 'remove-btn' class, remove its parent `tr`
    $(this).closest('tr').remove();
});

$('#investmentForm').on('submit', function(event) {
    event.preventDefault();

    // Serialize the form data and also prepare for additional values to be sent
    var formData = $(this).serializeArray();
    var formObject = {};
    formData.forEach(function(item) {
        formObject[item.name] = item.value;
    });

    $.ajax({
        url: '/update_table',
        type: 'POST',
        data: formData,
        success: function(data) {
            // Check for any errors in the response
            if (data.error) {
                alert(data.error);
                return;
            }

            // Use the return rate from the form if provided, otherwise use the one from the API
            var returnRate = formObject['returnRate'] ? formObject['returnRate'] : data.annualized_return;

            // Perform the real rate calculation client-side if inflation rate is provided
            var realRate = returnRate; // Default to use the return rate from the form or API
            if (formObject['inflation']) {
                var nominalRateDecimal = parseFloat(returnRate) / 100;
                var inflationRateDecimal = parseFloat(formObject['inflation']) / 100;
                var realRateDecimal = (1 + nominalRateDecimal) / (1 + inflationRateDecimal) - 1;
                realRate = (realRateDecimal * 100).toFixed(2); // Convert to percentage and round to two decimals
            } else {
                realRate = 'N/A'; // If inflation rate is not provided, set realRate to 'N/A'
            }

            // Adjust the annualized return and real rate of return if expected change in interest rate is provided
            if (formObject['expectedInterestRateChange']) {
                var expectedInterestRateChange = parseFloat(formObject['expectedInterestRateChange']);
                returnRate -= expectedInterestRateChange;
                realRate -= expectedInterestRateChange;
            }

            // Retrieve the confidence interval from the form or the server response
            var confidenceInterval = formObject['confidenceInterval'] ? formObject['confidenceInterval'] : data.confidence_interval;

            // Now append the new row with the data in the correct order
            const newRow = $('<tr></tr>');
            newRow.append('<td>' + data.stock_symbol + '</td>'); // Company
            newRow.append('<td>' + data.current_price + '</td>'); // Stock Price
            newRow.append('<td>' + formObject['investmentAmount'] + '</td>'); // Investment Amount
            newRow.append('<td>' + formObject['timeFrame'] + '</td>'); // Time Frame (years)
            newRow.append('<td>' + returnRate + '</td>'); // Annualized Return Rate (%)
            newRow.append('<td>' + realRate + '</td>'); // Real Rate %
            newRow.append('<td>' + confidenceInterval + '</td>'); // Confidence Interval

            // Add the remove button
            newRow.append('<td><button class="remove-btn">X</button></td>'); // Actions

            // Append the new row to the table body
            $('tbody').append(newRow);

            // Clear the form
            $('#investmentForm')[0].reset();
        },
        error: function(xhr, status, error) {
            // Handle any AJAX errors
            alert("An error occurred: " + error);
        }
    });
});
