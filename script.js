function addStep() {
    const inputTable = document.querySelector('.input-table');
    const lastRow = inputTable.rows[inputTable.rows.length - 1];
    const newRow = lastRow.cloneNode(true);

    newRow.querySelector('.column-name').value = '';
    newRow.querySelector('.possibilities').value = '';

    const stepCounters = document.querySelectorAll('.step-counter');
    const newCounter = stepCounters.length + 1;
    newRow.querySelector('.step-counter').textContent = newCounter;

    inputTable.appendChild(newRow);
}

function removeStep(button) {
    const row = button.closest('tr');
    row.parentNode.removeChild(row);

    const stepCounters = document.querySelectorAll('.step-counter');
    stepCounters.forEach((counter, index) => {
        counter.textContent = index + 1;
    });
}

function generateScenarios() {
    const stepContainers = document.getElementsByClassName('step-container');
    const scenarios = [];

    const stepsData = Array.from(stepContainers).map((container, index) => {
        const columnName = container.querySelector('.column-name').value;
        const possibilities = container.querySelector('.possibilities').value.split(',').map(option => option.trim());
        return { columnName, possibilities, index };
    });

    // Sort stepsData by the original order of appearance
    stepsData.sort((a, b) => a.index - b.index);

    const totalScenarios = stepsData.reduce((acc, step) => acc * step.possibilities.length, 1);

    for (let i = 0; i < totalScenarios; i++) {
        scenarios[i] = {};
        let remaining = i;

        stepsData.forEach((step, index) => {
            const valueIndex = remaining % step.possibilities.length;
            remaining = Math.floor(remaining / step.possibilities.length);
            scenarios[i][step.columnName] = step.possibilities[valueIndex];
        });
    }

    // Sort scenarios based on the order of columns that came first
    scenarios.sort((a, b) => {
        for (const step of stepsData) {
            const columnName = step.columnName;
            const aValue = a[columnName];
            const bValue = b[columnName];

            if (aValue !== bValue) {
                return aValue.localeCompare(bValue);
            }
        }
        return 0;
    });

    displayScenarios(scenarios, stepsData.map(step => step.columnName));
}


function displayScenarios(scenarios, headers) {
    const chartContainer = document.getElementById('chart-container');
    chartContainer.innerHTML = '';

    const table = document.createElement('table');

    const headerRow = table.insertRow();
    const lineHeader = document.createElement('th');
    lineHeader.textContent = '#';
    headerRow.appendChild(lineHeader);

    headers.forEach(header => {
        const th = document.createElement('th');
        th.textContent = header;
        headerRow.appendChild(th);
    });

    scenarios.forEach((scenario, index) => {
        const row = table.insertRow();
        const lineCell = row.insertCell();
        lineCell.textContent = index + 1;

        headers.forEach(header => {
            const cell = row.insertCell();
            cell.textContent = scenario[header];
        });
    });

    chartContainer.appendChild(table);
}

function exportCSV() {
    const scenarios = [];
    const headers = [];

    const table = document.querySelector('#chart-container table');
    const rows = table.querySelectorAll('tr');

    const headerCells = rows[0].querySelectorAll('th');
    headerCells.forEach(cell => headers.push(cell.textContent));

    for (let i = 1; i < rows.length; i++) {
        const scenario = {};
        const cells = rows[i].querySelectorAll('td');

        for (let j = 0; j < headers.length; j++) {
            scenario[headers[j]] = cells[j].textContent;
        }

        scenarios.push(scenario);
    }

    let csvContent = headers.join(',') + '\n';

    scenarios.forEach(scenario => {
        const values = headers.map(header => scenario[header]);
        csvContent += values.join(',') + '\n';
    });

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);

    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', 'scenarios.csv');
    document.body.appendChild(link);

    link.click();

    document.body.removeChild(link);
    URL.revokeObjectURL(url);
}

function importCSV() {
    const fileInput = document.getElementById('csvFileInput');
    const file = fileInput.files[0];

    const loadingContainer = document.getElementById('loadingContainer');
    const loadingText = document.getElementById('loadingText');

    if (file) {
        const reader = new FileReader();

        loadingText.innerText = 'Carregando...';
        loadingContainer.style.display = 'block';

        reader.onload = function (e) {
            const csvContent = e.target.result;
            parseCSV(csvContent);

            loadingText.innerText = '';
            loadingContainer.style.display = 'none';

            // Clear the file input to allow importing the same file again
            fileInput.value = '';

            // Remove the event listener to avoid multiple attachments
            fileInput.removeEventListener('change', importCSV);
        };

        reader.onprogress = function (e) {
            if (e.lengthComputable) {
                const percentLoaded = Math.round((e.loaded / e.total) * 100);
                loadingText.innerText = `Carregando... ${percentLoaded}%`;
            }
        };

        reader.readAsText(file);
    } else {
        // Instead of alert, trigger the file input click to open the system file selection dialog
        fileInput.click();
    }
}

// Attach the event listener initially
const fileInput = document.getElementById('csvFileInput');
fileInput.addEventListener('change', importCSV);



function parseCSV(csvContent) {
    const lines = csvContent.split('\n');
    const headers = lines[0].split(',');

    const chartContainer = document.getElementById('chart-container');
    chartContainer.innerHTML = '';

    const table = document.createElement('table');

    const headerRow = table.insertRow();
    headers.forEach(header => {
        const th = document.createElement('th');
        th.textContent = header;
        headerRow.appendChild(th);
    });

    for (let i = 1; i < lines.length; i++) {
        const values = lines[i].split(',');
        const row = table.insertRow();

        for (let j = 0; j < headers.length; j++) {
            const cell = row.insertCell();
            cell.textContent = values[j];
        }
    }

    chartContainer.appendChild(table);
}
