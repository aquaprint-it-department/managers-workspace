const config = {
    apiKey: 'AIzaSyCDFkQH1IPOymqa9ocp4m-vyOURRQpIGOU',
    spreadsheetId: '1dU1-R0Ncrp20oRDiYu7_YfDxk_djIBVqSTEpzwke6Io',
    laserTime: 'Час лазерної порізки',
};

let laserMaterials;
document.addEventListener('DOMContentLoaded', () => {
    fetch(`https://sheets.googleapis.com/v4/spreadsheets/${config.spreadsheetId}/values/${config.laserTime}?key=${config.apiKey}`)
        .then(response => response.json())
        .then(data => {
            const header = data.values[0].slice(2); // Товщини
            const result = {};

            data.values.slice(1).forEach(row => {
                const material = row[0]?.trim();
                const standard = row[1];
                const values = row.slice(2);
                const entry = {};

                values.forEach((val, i) => {
                    if (val) {
                        const thickness = header[i] ?? "-";
                        entry[thickness] = parseInt(val, 10);
                    }
                });

                if (Object.keys(entry).length === 0 && standard) {
                    entry["-"] = parseInt(standard, 10);
                }

                if (material) {
                    result[material] = entry;
                }
            });

            laserMaterials = result;
            populateMaterialSelect(laserMaterials);
        })
        .catch(error => console.error('Error:', error));
});

function populateMaterialSelect(data) {
    const materialsSelect = document.getElementById('materials');
    const thicknessSelect = document.getElementById('thickness');

    materialsSelect.innerHTML = '<option value="">Виберіть матеріал</option>';

    for (const material in data) {
        if (data.hasOwnProperty(material)) {
            const option = document.createElement('option');
            option.value = material;
            option.textContent = material;
            materialsSelect.appendChild(option);
        }
    }

    materialsSelect.addEventListener('change', (event) => {
        const selectedMaterial = event.target.value;
        populateThicknessSelect(data, selectedMaterial);
        clearResult();
    });
}

function populateThicknessSelect(data, selectedMaterial) {
    const thicknessSelect = document.getElementById('thickness');

    thicknessSelect.innerHTML = '';

    if (selectedMaterial && data[selectedMaterial]) {
        const thicknesses = Object.keys(data[selectedMaterial]);

        thicknesses.forEach(thickness => {
            const option = document.createElement('option');
            option.value = thickness;
            option.textContent = thickness;
            thicknessSelect.appendChild(option);
        });

        thicknessSelect.disabled = false;
    } else {
        thicknessSelect.disabled = true;
    }
}

function clearResult() {
    const resultElement = document.getElementById('result');
    resultElement.textContent = 'Приблизний час порізки: —';
}

function calculateCuttingTime() {
    const materialSelect = document.getElementById('materials');
    const thicknessSelect = document.getElementById('thickness');
    const unitsSelect = document.getElementById('units');
    const lengthInput = document.getElementById('length');
    const resultElement = document.getElementById('result');

    const selectedMaterial = materialSelect.value;
    const selectedThickness = thicknessSelect.value;
    const selectedUnits = unitsSelect.value;
    const length = parseFloat(lengthInput.value);

    if (!selectedMaterial || !selectedThickness || isNaN(length)) {
        resultElement.textContent = 'Будь ласка, виберіть матеріал, товщину і введіть довжину.';
        return;
    }

    const cuttingSpeed = laserMaterials[selectedMaterial][selectedThickness];
    if (!cuttingSpeed) {
        resultElement.textContent = 'Немає інформації для вибраного матеріалу та товщини.';
        return;
    }

    let lengthInMm = length;
    if (selectedUnits === 'м') {
        lengthInMm *= 1000;
    } else if (selectedUnits === 'см') {
        lengthInMm *= 10;
    }

    let timeInSeconds = lengthInMm / cuttingSpeed;

    timeInSeconds *= 1.1;

    const hours = Math.floor(timeInSeconds / 3600);
    const minutes = Math.floor((timeInSeconds % 3600) / 60);
    const seconds = Math.floor(timeInSeconds % 60);

    resultElement.textContent = `Приблизний час порізки: ${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
}

document.getElementById('materials').addEventListener('change', clearResult);
document.getElementById('thickness').addEventListener('change', clearResult);
document.getElementById('units').addEventListener('change', clearResult);
document.getElementById('length').addEventListener('input', clearResult);

document.getElementById('calculateCuttingTime').addEventListener('click', calculateCuttingTime);
