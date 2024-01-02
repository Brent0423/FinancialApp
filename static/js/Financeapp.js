$(document).on('click', '.remove-btn', function() {
    $(this).closest('tr').remove();
});

$('#investmentForm').on('submit', function(event) {
    event.preventDefault();

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
            if (data.error) {
                alert(data.error);
                return;
            }

            // If there's a warning message, show it
            if (data.warning) {
                alert(data.warning);
            }

            var returnRate = formObject['returnRate'] ? formObject['returnRate'] : data.annualized_return;

            var realRate = returnRate;
            if (formObject['inflation']) {
                var nominalRateDecimal = parseFloat(returnRate) / 100;
                var inflationRateDecimal = parseFloat(formObject['inflation']) / 100;
                var realRateDecimal = (1 + nominalRateDecimal) / (1 + inflationRateDecimal) - 1;
                realRate = (realRateDecimal * 100).toFixed(2);
            } else {
                realRate = 'N/A';
            }

            if (formObject['expectedInterestRateChange']) {
                var expectedInterestRateChange = parseFloat(formObject['expectedInterestRateChange']);
                returnRate -= expectedInterestRateChange;
                realRate -= expectedInterestRateChange;
            }

            var confidenceInterval = formObject['confidenceInterval'] ? formObject['confidenceInterval'] : data.confidence_interval;

            const newRow = $('<tr></tr>');
            newRow.append('<td>' + data.stock_symbol + '</td>');
            newRow.append('<td>' + data.current_price + '</td>');
            newRow.append('<td>' + formObject['investmentAmount'] + '</td>');
            newRow.append('<td>' + formObject['timeFrame'] + '</td>');
            newRow.append('<td>' + returnRate + '</td>');
            newRow.append('<td>' + realRate + '</td>');
            newRow.append('<td>' + confidenceInterval + '</td>');
            newRow.append('<td><button class="remove-btn">X</button></td>');

            $('tbody').append(newRow);

            $('#investmentForm')[0].reset();
        },
        error: function(xhr, status, error) {
            alert("An error occurred: " + error);
        }
    });
});

$.get('/', function(response) {
    if (response.warning) {
        alert(response.warning);
    }
});
