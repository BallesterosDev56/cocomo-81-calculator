document.addEventListener('DOMContentLoaded', function() {
    // Navegación
    const navLinks = document.querySelectorAll('.nav-links a');
    const sections = document.querySelectorAll('.section');

    navLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            const targetSection = this.getAttribute('data-section');
            
            // Actualizar enlaces activos
            navLinks.forEach(l => l.classList.remove('active'));
            this.classList.add('active');
            
            // Mostrar sección correspondiente
            sections.forEach(section => {
                section.classList.remove('active');
                if (section.id === targetSection) {
                    section.classList.add('active');
                }
            });
        });
    });

    const form = document.getElementById('cocomo-form');
    const inputSection = document.getElementById('input-section');
    const resultsSection = document.getElementById('results-section');
    const resultsContainer = document.getElementById('results-container');
    const backBtn = document.getElementById('back-btn');
    const calcTeamRadio = document.getElementById('calc-team');
    const calcDurationRadio = document.getElementById('calc-duration');
    const teamSizeInput = document.getElementById('team-size');
    const desiredDurationInput = document.getElementById('desired-duration');

    const constants = {
        organic: { a: 2.4, b: 1.05, c: 2.5, d: 0.38 },
        'semi-detached': { a: 3.0, b: 1.12, c: 2.5, d: 0.35 },
        embedded: { a: 3.6, b: 1.2, c: 2.5, d: 0.32 }
    };

    const costDrivers = [
        { id: 'RELY', name: 'Fiabilidad requerida del software', values: ['Muy bajo: 0.75', 'Bajo: 0.88', 'Nominal: 1.00', 'Alto: 1.15', 'Muy alto: 1.40'] },
        { id: 'DATA', name: 'Tamaño de la base de datos', values: ['Muy bajo: 0.94', 'Bajo: 1.00', 'Nominal: 1.08', 'Alto: 1.16'] },
        { id: 'CPLX', name: 'Complejidad del producto', values: ['Muy bajo: 0.70', 'Bajo: 0.85', 'Nominal: 1.00', 'Alto: 1.15', 'Muy alto: 1.30', 'Extra alto: 1.65'] },
        { id: 'TIME', name: 'Restricciones del tiempo de ejecución', values: ['Nominal: 1.00', 'Alto: 1.11', 'Muy alto: 1.30', 'Extra alto: 1.66'] },
        { id: 'STOR', name: 'Restricciones del almacenamiento', values: ['Nominal: 1.00', 'Alto: 1.06', 'Muy alto: 1.21', 'Extra alto: 1.56'] },
        { id: 'VIRT', name: 'Inestabilidad de la máquina virtual', values: ['Bajo: 0.87', 'Nominal: 1.00', 'Alto: 1.15', 'Muy alto: 1.30'] },
        { id: 'TURN', name: 'Tiempo de respuesta del computador', values: ['Bajo: 0.87', 'Nominal: 1.00', 'Alto: 1.07', 'Muy alto: 1.15'] },
        { id: 'ACAP', name: 'Capacidad del analista', values: ['Muy bajo: 1.46', 'Bajo: 1.19', 'Nominal: 1.00', 'Alto: 0.86', 'Muy alto: 0.71'] },
        { id: 'AEXP', name: 'Experiencia en la aplicación', values: ['Muy bajo: 1.29', 'Bajo: 1.13', 'Nominal: 1.00', 'Alto: 0.91', 'Muy alto: 0.82'] },
        { id: 'PCAP', name: 'Capacidad de los programadores', values: ['Muy bajo: 1.42', 'Bajo: 1.17', 'Nominal: 1.00', 'Alto: 0.86', 'Muy alto: 0.70'] },
        { id: 'VEXP', name: 'Experiencia en S.O. utilizado', values: ['Muy bajo: 1.21', 'Bajo: 1.10', 'Nominal: 1.00', 'Alto: 0.90'] },
        { id: 'LEXP', name: 'Experiencia en el lenguaje de programación', values: ['Muy bajo: 1.14', 'Bajo: 1.07', 'Nominal: 1.00', 'Alto: 0.95'] },
        { id: 'MODP', name: 'Uso de prácticas de programación modernas', values: ['Muy bajo: 1.24', 'Bajo: 1.10', 'Nominal: 1.00', 'Alto: 0.91', 'Muy alto: 0.82'] },
        { id: 'TOOL', name: 'Uso de herramientas software', values: ['Muy bajo: 1.24', 'Bajo: 1.10', 'Nominal: 1.00', 'Alto: 0.91', 'Muy alto: 0.83'] },
        { id: 'SCED', name: 'Restricciones en la duración del proyecto', values: ['Muy bajo: 1.23', 'Bajo: 1.08', 'Nominal: 1.00', 'Alto: 1.04', 'Muy alto: 1.10'] }
    ];

    function initCostDrivers() {
        const container = document.getElementById('cost-drivers');
        
        costDrivers.forEach(driver => {
            const driverElement = document.createElement('div');
            driverElement.className = 'cost-driver';
            
            const label = document.createElement('label');
            label.textContent = driver.name;
            label.htmlFor = driver.id;
            
            const select = document.createElement('select');
            select.id = driver.id;
            select.required = true;
            
            const defaultOption = document.createElement('option');
            defaultOption.value = '';
            defaultOption.textContent = 'Seleccione una opción';
            defaultOption.disabled = true;
            defaultOption.selected = true;
            select.appendChild(defaultOption);

            driver.values.forEach(value => {
                const option = document.createElement('option');
                const [label, val] = value.split(': ');
                option.textContent = label;
                option.value = parseFloat(val);
                select.appendChild(option);
            });
            
            driverElement.appendChild(label);
            driverElement.appendChild(select);
            container.appendChild(driverElement);
        });
    }

    calcTeamRadio.addEventListener('change', function() {
        teamSizeInput.disabled = !this.checked;
        desiredDurationInput.disabled = this.checked;
    });

    calcDurationRadio.addEventListener('change', function() {
        teamSizeInput.disabled = this.checked;
        desiredDurationInput.disabled = !this.checked;
    });

    form.addEventListener('submit', function(e) {
        e.preventDefault();
   
        const kloc = parseFloat(document.getElementById('kloc').value);
        const mode = document.getElementById('mode').value;
        const salary = parseFloat(document.getElementById('salary').value);
        const calcOption = document.querySelector('input[name="calc-option"]:checked').value;
        const teamSize = calcOption === 'team' ? parseInt(teamSizeInput.value) : null;
        const desiredDuration = calcOption === 'duration' ? parseInt(desiredDurationInput.value) : null;
        
        const costDriverValues = {};
        costDrivers.forEach(driver => {
            const select = document.getElementById(driver.id);
            costDriverValues[driver.id] = parseFloat(select.value);
        });
       
        let eaf = 1;
        for (const key in costDriverValues) {
            eaf *= costDriverValues[key];
        }
 
        const { a, b, c, d } = constants[mode];
        const effort = a * Math.pow(kloc, b) * eaf;
  
        let duration, persons;
        
        if (calcOption === 'team') {
            duration = c * Math.pow(effort, d);
            persons = teamSize;
        } else {
            duration = desiredDuration;
            persons = effort / duration;
        }
        
        let cost = 0;
        let remainingMonths = duration;
        let currentSalary = salary;
        let year = 1;
        
        while (remainingMonths > 0) {
            const monthsInYear = Math.min(12, remainingMonths);
            cost += persons * monthsInYear * currentSalary;
            remainingMonths -= monthsInYear;
            year++;
            currentSalary *= 1.05;
        }
        
        displayResults({
            mode: document.getElementById('mode').options[document.getElementById('mode').selectedIndex].text,
            kloc,
            effort,
            duration,
            persons,
            cost,
            eaf
        });
    });

    function displayResults(results) {
        inputSection.classList.add('hidden');
        resultsSection.classList.remove('hidden');
        
        resultsContainer.innerHTML = `
            <div class="result-item">
                <div class="result-label">Modo de desarrollo:</div>
                <div class="result-value">${results.mode}</div>
            </div>
            
            <div class="result-item">
                <div class="result-label">Tamaño del proyecto:</div>
                <div class="result-value">${results.kloc.toFixed(1)} KLOC</div>
            </div>
            
            <div class="result-item">
                <div class="result-label">Factor de ajuste de esfuerzo (EAF):</div>
                <div class="result-value">${results.eaf.toFixed(3)}</div>
                <div class="result-description">Producto de todos los multiplicadores de los atributos de coste</div>
            </div>
            
            <div class="result-item">
                <div class="result-label">Esfuerzo estimado:</div>
                <div class="result-value">${results.effort.toFixed(2)} persona-meses</div>
                <div class="result-description">Esfuerzo total requerido para completar el proyecto</div>
            </div>
            
            <div class="result-item">
                <div class="result-label">Duración estimada:</div>
                <div class="result-value">${results.duration.toFixed(2)} meses</div>
                <div class="result-description">Tiempo estimado para completar el proyecto</div>
            </div>
            
            <div class="result-item">
                <div class="result-label">Personal requerido:</div>
                <div class="result-value">${Math.ceil(results.persons)} personas</div>
                <div class="result-description">Número de desarrolladores necesarios</div>
            </div>
            
            <div class="result-item">
                <div class="result-label">Costo estimado:</div>
                <div class="result-value">$${results.cost.toFixed(2)}</div>
                <div class="result-description">Costo total del proyecto considerando aumentos salariales anuales del 5%</div>
            </div>
        `;
    }

    backBtn.addEventListener('click', function() {
        inputSection.classList.remove('hidden');
        resultsSection.classList.add('hidden');
    });

    initCostDrivers();
});