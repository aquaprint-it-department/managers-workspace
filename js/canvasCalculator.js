import { showAlert } from './widePrintDisplay.js';

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
            document.getElementById('addToScore').addEventListener('click', addToScore);
            document.getElementById('serviceSelect').addEventListener('change', calculatePrice);
            document.getElementById('quantityInput').addEventListener('input', calculatePrice);

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
        calculatePrice();
    });

    document.getElementById('optionAA').addEventListener('change', (event) => {
        if (event.target.checked) setClientType('aa');
        calculatePrice();
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

    calculatePrice();
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

function addToScore() {
    let scoreData = JSON.parse(localStorage.getItem('savedScore')) || [];

    const selectElement = document.getElementById('serviceSelect');
    const quantityField = Number(document.getElementById('quantityInput').value);
    const client = (localStorage.getItem('clientType') === 'aa') ? '(ра)' : '(кк)';
    const price = parseFloat(selectElement.options[selectElement.selectedIndex].getAttribute(`data-price-${localStorage.getItem('clientType')}`));
    const total = document.getElementById('result').textContent;

    const additionalData = document.querySelectorAll('#additionalServiceArea .card')

    
    if (quantityField && price) {
        scoreData.push(['Холст на підрамнику', selectElement.options[selectElement.selectedIndex].text, quantityField, `${price} ${client}`, total]);
        
    console.log(scoreData);
        localStorage.setItem('savedScore', JSON.stringify(scoreData));
        showAlert('success', 'Успішно додано!');
    } else {
        if (!additionalData.length) {
            showAlert('warning', 'Увага! Заповніть всі поля перед додаванням.');
        }
    }
}
