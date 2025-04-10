const config = {
    apiKey: 'AIzaSyCDFkQH1IPOymqa9ocp4m-vyOURRQpIGOU',
    spreadsheetId: '1dU1-R0Ncrp20oRDiYu7_YfDxk_djIBVqSTEpzwke6Io',
    materialsRange: 'ШФ-матеріали!A2:G1000',
    servicesRange: 'ШФ-послуги!A2:D1000'
};

let additionalDataArray = [];

document.addEventListener('DOMContentLoaded', () => {
    fetch(`https://sheets.googleapis.com/v4/spreadsheets/${config.spreadsheetId}/values/${config.materialsRange}?key=${config.apiKey}`)
        .then(response => response.json())
        .then(data => {
            fillData(data);
            initClientType(data);
            updateScore()
        })
        .catch(error => console.error('Error:', error));
});

function initClientType(data) {
    const savedType = localStorage.getItem('clientType') || 'ec';
    setClientType(savedType);

    document.getElementById('optionEC').addEventListener('change', (event) => {
        if (event.target.checked) setClientType('ec');
        fillData(data);
        updateTotal();
    });

    document.getElementById('optionAA').addEventListener('change', (event) => {
        if (event.target.checked) setClientType('aa');
        fillData(data);
        updateTotal();
    });
}

function setClientType(type) {
    const optionEC = document.getElementById('optionEC');
    const optionAA = document.getElementById('optionAA');

    if (type === 'ec') {
        optionEC.checked = true;
    } else if (type === 'aa') {
        optionAA.checked = true;
    }

    localStorage.setItem('clientType', type);
    clearCalculator()
}

function fillData(data) {
    const selectElement = document.getElementById('selectField');
    while (selectElement.options.length > 1) {
        selectElement.remove(1);
    }

    data.values.forEach(item => {
        const option = document.createElement('option');
        option.value = item[0];
        option.textContent = item[0];

        option.setAttribute('data-units', item[1]);

        if (item[5]) {
            option.setAttribute('data-width', item[5]);
        }
        if (item[6]) {
            option.setAttribute('data-height', item[6]);
        }

        if (localStorage.getItem('clientType') === 'ec') {
            option.setAttribute('data-price', item[2]);
        } else {
            option.setAttribute('data-price', item[3]);
        }

        selectElement.appendChild(option);

    });

    document.getElementById('addToScore').addEventListener('click', addToScore);

    updateServiceData();
}

function updateServiceData() {
    const selectElement = document.getElementById('selectField');
    const unitsField = document.getElementById('unitsField');
    const widthField = document.getElementById('widthField');
    const heightField = document.getElementById('heightField');
    const quantityField = document.getElementById('quantityField');
    const clearScoreBtn = document.getElementById('clearScore');
    const addAdditionalService = document.getElementById('addAdditionalService');

    selectElement.addEventListener('change', function () {
        const selectedOption = selectElement.options[selectElement.selectedIndex];

        const units = selectedOption.getAttribute('data-units');
        const price = selectedOption.getAttribute('data-price');

        unitsField.textContent = units;
        if (units === "шт.") {
            widthField.value = Number(selectedOption.getAttribute('data-width'));
            heightField.value = Number(selectedOption.getAttribute('data-height'));
            console.log()
            widthField.disabled = true;
            heightField.disabled = true;
        } else {
            widthField.disabled = false;
            heightField.disabled = false;
        }
        updateTotal();
    });

    widthField.addEventListener('input', updateTotal);
    heightField.addEventListener('input', updateTotal);
    quantityField.addEventListener('input', updateTotal);
    addAdditionalService.addEventListener('click', addAdditionalCard);
    clearScoreBtn.addEventListener('click', () => {
        localStorage.removeItem('savedScore');
        updateScore();
    });
}

function updateTotal() {
    const selectElement = document.getElementById('selectField');
    const widthField = document.getElementById('widthField');
    const heightField = document.getElementById('heightField');
    const quantityField = document.getElementById('quantityField');
    const unitsField = document.getElementById('unitsField');
    const totalField = document.getElementById('totalField');
    const serviceCost = document.getElementById('serviceCost');

    if (selectElement.value === "") {
        return;
    }

    updateAdditionalCards();

    const width = parseFloat(widthField.value);
    const height = parseFloat(heightField.value);
    const quantity = parseFloat(quantityField.value);

    if (isNaN(width) || isNaN(height) || isNaN(quantity) || selectElement.value === "Матеріал...") {
        totalField.textContent = `0`;
        serviceCost.textContent = `0`;
        return;
    }

    const price = parseFloat(selectElement.options[selectElement.selectedIndex].getAttribute('data-price'));

    let total;
    if (unitsField.textContent === "шт.") {
        total = parseFloat((quantity * price).toFixed(2));
    } else {
        total = parseFloat((width * height * quantity * price).toFixed(2));
    }

    totalField.textContent = `${total}`;

    const additionalServiceArray = document.querySelectorAll('#additionalServiceArea .card .tab-pane.active .additionalTotal')
    let totalCount = total;
    additionalServiceArray.forEach(span => {
        totalCount += parseFloat(span.textContent);
    })
    serviceCost.textContent = `${totalCount}`;
}

function addAdditionalCard() {
    if (!additionalDataArray.length) {
        fetch(`https://sheets.googleapis.com/v4/spreadsheets/${config.spreadsheetId}/values/${config.servicesRange}?key=${config.apiKey}`)
            .then(response => response.json())
            .then(data => {
                additionalDataArray = data.values;
                fillAdditionalData(additionalDataArray);
            })
            .catch(error => console.error('Error:', error));
    } else {
        fillAdditionalData(additionalDataArray);
    }
}

function fillAdditionalData(data) {
    const additionalServiceArea = document.getElementById('additionalServiceArea');
    const additionalServiceLength = document.querySelectorAll('#additionalServiceArea .card').length;

    const cardHTML = `
        <div class="card mb-3">
                    <div class="card-body">
                        <div class="d-flex justify-content-between align-items-center mb-3">
                            <h5 class="card-title mb-0">Додаткова послуга</h5>
                            <button class="btn btn-danger" onclick="this.closest('.card').remove();">
                                <i class="fa-solid fa-trash"></i> Видалити
                            </button>
                        </div>
                        <div class="d-flex align-items-center mb-3">
                            <select class="form-select me-3 additional-service__select"
                                    aria-label="Default select example">
                                <option selected disabled>Оберіть послугу</option>
                            </select>

                            <span class="me-3 additional-service__units">шт.</span>
                        </div>
                        <nav>
                            <div class="nav nav-tabs mb-3" role="tablist">
                                <button class="nav-link active" data-bs-toggle="tab"
                                        data-bs-target="#nav-sides-${additionalServiceLength + 1}" type="button" role="tab" aria-controls="nav-sides-${additionalServiceLength + 1}"
                                        aria-selected="true">Виберіть сторони
                                </button>
                                <button class="nav-link" data-bs-toggle="tab"
                                        data-bs-target="#nav-manual-${additionalServiceLength + 1}" type="button" role="tab"
                                        aria-controls="nav-manual-${additionalServiceLength + 1}" aria-selected="false">Введіть вручну
                                </button>
                            </div>
                        </nav>
                        <div class="tab-content">
                            <div class="tab-pane fade show active" id="nav-sides-${additionalServiceLength + 1}" role="tabpanel"
                                 tabindex="0">
                                <div class="container">
                                    <div class="row">
                                        <div class="mb-3 col-3 direction-toggle" role="group"
                                             aria-label="Direction toggle buttons">
                                            <div class="container">
                                                <div class="row sides-switcher">
                                                    <div class="col-4"></div>
                                                    <label class="btn btn-outline-dark col-4 active" title="Вгору">
                                                        <input type="checkbox" class="btn-check" autocomplete="off"
                                                               data-direction="up" checked>
                                                        <i class="fa-solid fa-caret-up"></i>
                                                    </label>
                                                    <div class="col-4"></div>
                                                    <label class="btn btn-outline-dark col-4 active" title="Вліво">
                                                        <input type="checkbox" class="btn-check" autocomplete="off"
                                                               data-direction="left" checked>
                                                        <i class="fa-solid fa-caret-left"></i>
                                                    </label>
                                                    <div class="col-4"></div>

                                                    <label class="btn btn-outline-dark col-4 active" title="Вправо">
                                                        <input type="checkbox" class="btn-check" autocomplete="off"
                                                               data-direction="right" checked>
                                                        <i class="fa-solid fa-caret-right"></i>
                                                    </label>
                                                    <div class="col-4"></div>

                                                    <label class="btn btn-outline-dark col-4 active" title="Вниз">
                                                        <input type="checkbox" class="btn-check" autocomplete="off"
                                                               data-direction="down" checked>
                                                        <i class="fa-solid fa-caret-down"></i>
                                                    </label>
                                                    <div class="col-4"></div>
                                                </div>
                                            </div>
                                        </div>
                                        <div class="col-6">
                                            Вартість: <span class="fw-bold additionalTotal">0</span> <span class="fw-bold">грн.</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <div class="tab-pane fade" id="nav-manual-${additionalServiceLength + 1}" role="tabpanel"
                                 tabindex="0">
                                <div class="row">
                                    <div class="col-5">
                                        <label class="form-label w-100">
                                            <input type="number" class="form-control manual-additional-value" placeholder="Введіть значення">
                                        </label>
                                    </div>
                                    <div class="col-7">
                                        Вартість: <span class="fw-bold additionalTotal">0</span> <span class="fw-bold">грн.</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
    `;

    additionalServiceArea.insertAdjacentHTML('beforeend', cardHTML);

    const allCards = additionalServiceArea.querySelectorAll('.card.mb-3');
    const newCard = allCards[allCards.length - 1];

    const newCardSelect = newCard.querySelector('.additional-service__select');
    const newCardManualInput = newCard.querySelector('.manual-additional-value');
    const newCardUnits = newCard.querySelector('.additional-service__units');

    data.forEach(item => {
        const option = document.createElement('option');
        option.value = item[0];
        option.textContent = item[0];

        option.setAttribute('data-units', item[1]);
        if (localStorage.getItem('clientType') === 'ec') {
            option.setAttribute('data-price', item[2]);
        } else {
            option.setAttribute('data-price', item[3]);
        }

        newCardSelect.appendChild(option);
    });

    newCardSelect.addEventListener('change', function () {
        const selectedOption = newCardSelect.options[newCardSelect.selectedIndex];

        const units = selectedOption.getAttribute('data-units');
        const price = selectedOption.getAttribute('data-price');

        newCardUnits.textContent = units;

        updateAdditionalCard(newCard);
        updateTotal();
    });

    newCardManualInput.addEventListener('input', function () {
        updateAdditionalCard(newCard);
        updateTotal();
    });

    newCard.querySelectorAll('input[type="checkbox"]').forEach(input => {
        input.addEventListener('change', function () {
            if (this.checked) {
                this.closest('label').classList.add('active');
            } else {
                this.closest('label').classList.remove('active');
            }

            updateAdditionalCard(newCard);
            updateTotal();
        });
    });

    const tabButtons = document.querySelectorAll('button[data-bs-toggle="tab"]');

    tabButtons.forEach(button => {
        button.addEventListener('shown.bs.tab', function () {
            updateTotal(); // виклик твоєї функції
        });
    });
}

function clearCalculator() {
    document.getElementById('additionalServiceArea').innerHTML = '';
    document.getElementById('selectField').selectedIndex = 0;
    document.getElementById('unitsField').textContent = '';
    document.getElementById('widthField').value = '';
    document.getElementById('heightField').value = '';
    document.getElementById('quantityField').value = '1';

    updateTotal();
}

function updateAdditionalCard(card) {
    const service = card.querySelector('.additional-service__select');
    const tab = card.querySelector('.tab-content .tab-pane.active');
    const tabId = tab?.id || '';

    let tabType = '';

    if (tabId.startsWith('nav-sides-')) {
        tabType = 'sides';
    } else if (tabId.startsWith('nav-manual-')) {
        tabType = 'manual';
    }

    const selectedOption = service.options[service.selectedIndex];
    const price = selectedOption.getAttribute('data-price');
    const units = selectedOption.getAttribute('data-units');

    const widthField = document.getElementById('widthField').value;
    const heightField = document.getElementById('heightField').value;
    const quantityField = document.getElementById('quantityField').value;

    const sidesTotal = tab.querySelector('.additionalTotal');

    if (tabType === 'manual') {
        const manualTotal = tab.querySelector('.additionalTotal');
        manualTotal.textContent = tab.querySelector('input[type="number"]').value * price;
    } else if (tabType === 'sides') {
        const switcher = card.querySelector('.sides-switcher');
        const switcherValues = Array.from(switcher.querySelectorAll('input[type="checkbox"]:checked'))
            .map(input => input.dataset.direction);

        let sum = 0;
        switcherValues.forEach(side => {
            if ((units === 'м.пог.') || 'шт.') {
                if ((side === 'up') || (side === 'down')) {
                    sum += Number(widthField);
                } else if ((side === 'left') || (side === 'right')) {
                    sum += Number(heightField);
                }

            }
        })

        if (units === 'шт.') {
            sum = sum / 0.3;
            function roundToEven(n) {
                const rounded = Math.round(n);
                return (rounded % 2 === 0) ? rounded : rounded + 1;
            }

            sum = roundToEven(sum);
        } else if (units === 'м2') {
            if (switcherValues.length === 4) {
                sum = Number(widthField) * Number(heightField);
            } else {
                sidesTotal.textContent = 'Перевірте значення!';
                return;
            }
        }

        sidesTotal.textContent = sum * quantityField * price;
    }
}

function updateAdditionalCards() {
    document.querySelectorAll("#additionalServiceArea .card").forEach(card => {
        updateAdditionalCard(card);
    })
}

function addToScore() {
    let scoreData = JSON.parse(localStorage.getItem('savedScore')) || [];

    const selectElement = document.getElementById('selectField');
    const widthField = document.getElementById('widthField').value;
    const heightField = document.getElementById('heightField').value;
    const quantityField = Number(document.getElementById('quantityField').value);
    const price = parseFloat(selectElement.options[selectElement.selectedIndex].getAttribute('data-price'));
    const total = document.getElementById('totalField').textContent;
    const client = (localStorage.getItem('clientType') === 'aa') ? '(ра)' : '(кк)';

    const additionalData = document.querySelectorAll('#additionalServiceArea .card')

    if (widthField && heightField && quantityField && price) {
        scoreData.push([selectElement.options[selectElement.selectedIndex].text, `${widthField}x${heightField}`, quantityField, `${price} ${client}`, total]);
        localStorage.setItem('savedScore', JSON.stringify(scoreData));
        updateScore();
        clearCalculator();
    } else {
        if (!additionalData.length) {
            showAlert('warning', 'Увага! Заповніть всі поля перед додаванням.');
        }
    }

    if (additionalData.length) {
        additionalData.forEach(card => {
            const activeTab = card.querySelector('.tab-content .tab-pane.active');
            const totalPrice = Number(activeTab.querySelector('.additionalTotal').textContent);

            if (totalPrice) {
                const select = card.querySelector('.additional-service__select');
                const selectedIndex = select.selectedIndex;
                const selectValue = select.options[selectedIndex].text;
                const additionalPrice = select.options[selectedIndex].getAttribute('data-price');
                const units = select.options[selectedIndex].getAttribute('data-units');
                let size = '';
                let quantity = '';
                const tabId = activeTab?.id || '';

                if (tabId.startsWith('nav-sides-')) {
                    size = `${widthField}x${heightField}`;
                    quantity = quantityField;
                } else if (tabId.startsWith('nav-manual-')) {
                    const manualValue = activeTab.querySelector('.manual-additional-value').value;

                    if (units === 'шт.') {
                        size = '-';
                        quantity = manualValue;
                    } else {
                        size = manualValue;
                        quantity = 1;
                    }
                }

                if (selectValue && size && quantity && additionalPrice) {
                    scoreData.push([selectValue, size, quantity, `${additionalPrice} ${client}`, totalPrice]);
                }

                localStorage.setItem('savedScore', JSON.stringify(scoreData));
                updateScore();
                clearCalculator();
            } else {
                if (!(widthField && heightField && quantityField && price)) {
                    showAlert('warning', 'Увага! Заповніть всі поля перед додаванням.');
                }
            }
        });
    }
}

function updateScore() {
    const data = JSON.parse(localStorage.getItem('savedScore')) || [];
    const tableBody = document.querySelector('#count-table tbody');
    const tableTotal = document.querySelector('#count-table tfoot span');
    let totalSum = 0;

    tableBody.innerHTML = '';

    data.forEach((item, index) => {
        const row = document.createElement('tr');

        totalSum += Number(item[4]);
        item.forEach(value => {
            const cell = document.createElement('td');
            cell.textContent = value;
            row.appendChild(cell);
        });

        const deleteCell = document.createElement('td');
        const deleteBtn = document.createElement('button');
        deleteBtn.className = 'btn btn-light';
        deleteBtn.innerHTML = '<i class="fa-solid fa-trash"></i>';
        deleteBtn.addEventListener('click', () => {
            data.splice(index, 1);
            localStorage.setItem('savedScore', JSON.stringify(data));
            updateScore();
        });

        deleteCell.appendChild(deleteBtn);
        row.appendChild(deleteCell);

        tableBody.appendChild(row);
    });

    tableTotal.textContent = totalSum;
}

function showAlert(type, message) {
    const alertContainer = document.getElementById('alertContainer');
    if (!alertContainer) return;

    alertContainer.innerHTML = '';

    const alert = document.createElement('div');
    alert.className = `alert alert-${type} alert-dismissible fade show mt-3`;
    alert.role = 'alert';
    alert.innerHTML = `
        ${message}
        <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>
    `;

    alertContainer.appendChild(alert);

    setTimeout(() => {
        alert.classList.remove('show');
        alert.classList.add('hide');

        setTimeout(() => {
            alert.remove();
        }, 300);
    }, 5000);
}