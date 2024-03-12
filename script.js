document.addEventListener('DOMContentLoaded', () => {
    const input = document.getElementById('csv-file');
    input.addEventListener('change', handleFileSelect, false);
});

function handleFileSelect(event) {
    const file = event.target.files[0];

    Papa.parse(file, {
        complete: function(results) {
            displayData(results.data);
        },
        header: true 
    });
}


