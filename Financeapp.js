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

document.addEventListener('DOMContentLoaded', () => {
    const form = document.querySelector('form');
    const tableBody = document.querySelector('tbody');

    form.addEventListener('submit', async function(event) {
        event.preventDefault(); // Prevent default form submission

        console.log('Form submitted');

        // Retrieve input values
        const stockTicker = document.querySelector('#stockTicker').value;
        const investmentAmount = document.querySelector('#investmentAmount').value;
        const returnRate = document.querySelector('#returnRate').value;
        const timeFrame = document.querySelector('#timeFrame').value;

        try {
            // Fetch stock price asynchronously
            const stockPrice = await fetchStockPrice(stockTicker);

            // Create a new row and populate it
            const newRow = document.createElement('tr');
            [stockTicker, stockPrice, investmentAmount, returnRate, timeFrame].forEach(text => {
                const newCell = document.createElement('td');
                newCell.textContent = text;
                newRow.appendChild(newCell);
            });

            // Add a cell for 'Confidence Interval' (modify as needed)
            const confidenceIntervalCell = document.createElement('td');
            confidenceIntervalCell.textContent = 'N/A'; // Placeholder value
            newRow.appendChild(confidenceIntervalCell);

            // Add a cell for the 'Actions' column (e.g., a remove button)
            const removeCell = document.createElement('td');
            const removeButton = document.createElement('button');
            removeButton.textContent = 'Remove';
            removeButton.onclick = function() { this.parentNode.parentNode.remove(); };
            removeCell.appendChild(removeButton);
            newRow.appendChild(removeCell);

            // Append the new row to the table
            tableBody.appendChild(newRow);
        } catch (error) {
            console.error('Error fetching stock price:', error);
            // Handle the error (e.g., show an alert or a message in the UI)
        }
    });
});
