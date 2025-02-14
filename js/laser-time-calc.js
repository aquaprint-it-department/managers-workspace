const laserMaterialsUrl = '../json-files/laser-materials.json';
let laserMaterials;

fetch(laserMaterialsUrl)
    .then(response => {
        if (!response.ok) {
            throw new Error('Network response was not ok');
        }
        return response.json();
    })
    .then(data => {
        laserMaterials = data.laserData.materials;
        populateMaterialSelect(laserMaterials);
    })
    .catch(error => {
        console.error('Error loading JSON:', error);
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

    thicknessSelect.innerHTML = '<option value="">Виберіть товщину</option>';

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
