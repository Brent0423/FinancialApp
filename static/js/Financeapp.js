// Mock function to simulate fetching stock price
function fetchStockPrice(stockTicker) {
    return new Promise((resolve) => {
        // Simulate a network request with a timeout
        setTimeout(() => {
            // Mock stock price value
            const mockPrice = Math.random() * 1000;
            resolve(mockPrice.toFixed(2)); // Return the price with two decimal places
        }, 1000);
    });
}

$(document).on('click', '.remove-btn', function() {
    // If the clicked element has the 'remove-btn' class, remove its parent `tr`
    $(this).closest('tr').remove();
});

$('#investmentForm').on('submit', function(event) {
    event.preventDefault();

    // You would need to get these values from the form or another source
    const investmentAmount = $('#investmentAmount').val(); // Placeholder for investment amount
    const timeFrame = $('#timeFrame').val(); // Placeholder for time frame

    $.ajax({
        url: '/update_table',
        type: 'POST',
        data: $(this).serialize(),
        success: function(data) {
            // Now append the new row
            const newRow = $('<tr></tr>');

            newRow.append('<td>' + data.stock_symbol + '</td>'); // Company
            newRow.append('<td>' + data.current_price + '</td>'); // Stock Price
            newRow.append('<td>' + investmentAmount + '</td>'); // Investment Amount (placeholder value)
            newRow.append('<td>' + data.annualized_return + '</td>'); // Anticipated Return Rate (%)
            newRow.append('<td>' + timeFrame + '</td>'); // Time Frame (placeholder value)
            newRow.append('<td>' + data.confidence_interval + '</td>'); // Confidence Interval

            // Add the remove button
            newRow.append('<td><button class="remove-btn">X</button></td>'); // Actions

            // Append the new row to the table body
            $('tbody').append(newRow);

            // Clear the form
            event.target.reset();
        }
    });
});
