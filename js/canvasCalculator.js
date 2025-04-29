const config = {
    apiKey: 'AIzaSyCDFkQH1IPOymqa9ocp4m-vyOURRQpIGOU',
    spreadsheetId: '1dU1-R0Ncrp20oRDiYu7_YfDxk_djIBVqSTEpzwke6Io',
    sheetName: 'Холсти',
};

let laserMaterials;
document.addEventListener('DOMContentLoaded', () => {
    initClientType();

    fetch(`https://sheets.googleapis.com/v4/spreadsheets/${config.spreadsheetId}/values/${config.sheetName}?key=${config.apiKey}`)
        .then(response => response.json())
        .then(data => {
            console.log(data);
            fillData(data.values);
            document.getElementById('calculatePrice').addEventListener('click', calculatePrice)

        })
        .catch(error => console.error('Error:', error));
});

function setClientType(type) {
    const optionEC = document.getElementById('optionEC');
    const optionAA = document.getElementById('optionAA');

    if (type === 'ec') {
        optionEC.checked = true;
    } else if (type === 'aa') {
        optionAA.checked = true;
    }

    localStorage.setItem('clientType', type);
}

function initClientType() {
    const savedType = localStorage.getItem('clientType') || 'ec';
    setClientType(savedType);

    document.getElementById('optionEC').addEventListener('change', (event) => {
        if (event.target.checked) setClientType('ec');
        
    });

    document.getElementById('optionAA').addEventListener('change', (event) => {
        if (event.target.checked) setClientType('aa');
        
    });
}

function fillData(data) {
    const selectElement = document.getElementById('serviceSelect');
    while (selectElement.options.length > 1) {
        selectElement.remove(1);
    }

    data.forEach((item, index) => {
        if (index !== 0) {
        const option = document.createElement('option');
        option.value = item[0];
        option.textContent = item[0];
        option.setAttribute('data-price-aa', item[1]);
        option.setAttribute('data-price-ec', item[2]);

        selectElement.appendChild(option);}
    });
}

function calculatePrice() {
    const selectElement = document.getElementById('serviceSelect');
    const selectedOption = selectElement.options[selectElement.selectedIndex];    
    const price = (localStorage.getItem('clientType') === 'aa') ? selectedOption.getAttribute('data-price-aa') : selectedOption.getAttribute('data-price-ec')
    const quantity = document.getElementById('quantityInput').value;
    const result = Number(price) * Number(quantity)
    
    document.getElementById('result').textContent = result;
    console.log(price, quantity)
}
