Chart.register(ChartDataLabels);
Chart.defaults.font.family = '-apple-system, BlinkMacSystemFont, "Helvetica Neue", sans-serif';
Chart.defaults.color = '#5a5a5e';

let charts = {};
let activeFilter = null;
let originalBoxContents = {}; 
let currentEditionGlobal = 1;
let rotationTimer = null;
let currentRotationIndex = 0;

// --- BASES DE DATOS COMPLETAS (Para el clic interactivo en gráficos) ---
const exCtx = {
    laboral: [
        { title: "Muestra unLEMA", val: 58.4, text: "Porcentaje de graduados evaluados que declaran como meta principal la vinculación laboral inmediata.", color: "#00a19b" },
        { title: "Universidad de los Andes", val: 42.0, text: "A modo de contraste institucional, según reportes del CTP de Los Andes, el 42% apunta a empleo directo.", color: "#4dcad4" }
    ],
    academic: [
        { title: "Nacional (SNIES)", val: 9.2, text: "En Colombia, un promedio muy reducido transita de inmediato del pregrado al posgrado directo.", color: "#eb4160" },
        { title: "Muestra unLEMA", val: 31.4, text: "Nuestra comunidad demuestra un perfil académico e investigativo marcadamente superior a la media.", color: "#df0832" },
        { title: "Top 100 Global", val: 47.5, text: "En universidades de élite internacional, la continuidad a maestrías o doctorados roza el 50%.", color: "#f57a8e" }
    ],
    emprendimiento: [
        { title: "Muestra unLEMA", val: 4.9, text: "Una marcada minoría contempla crear empresa inmediatamente tras culminar estudios, sugiriendo alta aversión al riesgo.", color: "#ec7920" },
        { title: "Estándar Global", val: 14.9, text: "Tasa promedio esperada en intenciones de creación de startups universitarias a nivel mundial.", color: "#f29a50" },
        { title: "Promedio Colombia", val: 28.8, text: "De acuerdo con el estudio GUESSS, el promedio nacional en intenciones de emprendimiento al egreso suele ser más optimista.", color: "#f7bd84" }
    ]
};

const exMot = {
    laboral: [
        { title: "Seguridad Económica", val: 58.7, text: "Búsqueda activa de estabilidad para asegurar ingresos mensuales constantes y autonomía financiera.", color: "#00a19b" },
        { title: "Experiencia Laboral", val: 31.0, text: "Deseo prioritario de incorporarse a entornos reales para consolidar los conocimientos adquiridos.", color: "#4dcad4" },
        { title: "Impulso Emprendedor", val: 1.5, text: "Trabajar temporalmente con la meta explícita de acumular capital para financiar un negocio propio a mediano plazo.", color: "#007a75" },
        { title: "Otras Motivaciones", val: 8.8, text: "Agrupa metas personales diversificadas, compromisos y responsabilidades de apoyo o cuidado del núcleo familiar.", color: "#b3e2df" }
    ],
    emprendimiento: [
        { title: "Independencia Laboral", val: 23.1, text: "Fuerte deseo de autogestión profesional y rechazo explícito a los esquemas jerárquicos corporativos clásicos.", color: "#ec7920" },
        { title: "Independencia Financiera", val: 19.2, text: "Aspiración a percibir dividendos económicos que correspondan directamente al rendimiento de su propio esfuerzo.", color: "#f29a50" },
        { title: "Generación de Empleo", val: 15.4, text: "Clara visión de responsabilidad social corporativa para impactar positivamente el mercado de trabajo nacional.", color: "#f7bd84" },
        { title: "Flexibilidad de Tiempo", val: 11.5, text: "Búsqueda consciente de un equilibrio sano entre vida personal, proyectos y horas de dedicación.", color: "#f9cda9" },
        { title: "Oportunidad de Negocio", val: 11.5, text: "Aseguran haber identificado un nicho específico o demanda insatisfecha lista para ser explotada comercialmente.", color: "#eb5d00" },
        { title: "Espíritu Innovador", val: 11.5, text: "Motivación intrínseca volcada a la invención, desarrollo tecnológico y materialización de ideas disruptivas.", color: "#d66c1b" }
    ],
    academic: [
        { title: "Motivación Personal", val: 36.1, text: "Búsqueda intelectual de la excelencia académica guiada exclusivamente por una profunda vocación científica.", color: "#df0832" },
        { title: "Experiencia en Pregrado", val: 21.6, text: "Asegura que el contacto directo con semilleros y mentores durante su carrera despertó de forma decisiva su perfil investigador.", color: "#eb4160" },
        { title: "Requisito Laboral", val: 15.0, text: "Percepción de que ciertos campos específicos del mercado laboral exigen obligatoriamente títulos especializados para el ingreso.", color: "#f57a8e" }
    ]
};

// --- BASE DE DATOS DE LAS FRASES DINÁMICAS (CARRUSEL INTELIGENTE) ---
const phrasesDatabase = {
    1: {
        all: [
            "La intención de buscar empleo coincide perfectamente con un mercado que, en la práctica, contrata a la gran mayoría de nuestros egresados.",
            "unLEMA demuestra que nuestros estudiantes trazan metas balanceadas entre la academia pura y la rápida salida al entorno productivo.",
            "El acompañamiento estratégico del SAE busca potenciar estas intenciones en realidades exitosas para el egresado."
        ],
        L: [
            "Enfoque Laboral: El empleo tradicional sigue siendo el gran imán de atracción debido a las garantías de estabilidad inicial.",
            "La altísima cifra de intención laboral reafirma la confianza de los graduados en la inserción directa que ofrece la marca institucional."
        ],
        E: [
            "Enfoque de Emprendimiento: El bajo porcentaje inicial de creación de startups revela un reto de mentalidad y un campo fértil para incubadoras.",
            "La baja intención de emprender de forma directa sugiere que el estudiante prefiere acumular experiencia corporativa previa."
        ],
        A: [
            "Enfoque Académico: Superar por más de 3 veces el promedio nacional en intención de posgrados demuestra el fuerte ADN científico estudiantil.",
            "Los semilleros de investigación y la excelencia en pregrado rinden frutos en un tránsito directo muy fuerte hacia las maestrías."
        ]
    },
    2: {
        all: [
            "La psicología del egresado prioriza la estabilidad como el escalón fundamental para construir autonomía a largo plazo.",
            "Emprender o investigar ya no son vistos como obligaciones, sino como pasiones genuinas motivadas por el crecimiento propio.",
            "Cada decisión responde a un análisis maduro del contexto económico del país por parte de la comunidad de graduados."
        ],
        L: [
            "Motivaciones Laborales: El peso de la seguridad económica actúa como el motor central en más de la mitad de los perfiles analizados.",
            "La experiencia de campo se consolida como el segundo factor más buscado para validar las habilidades técnicas del pregrado."
        ],
        E: [
            "Motivaciones de Emprendimiento: La libertad y el propósito de ser dueños de su tiempo superan a la simple ambición monetaria.",
            "Generar empleo e innovar representan factores clave, demostrando un alto sentido de impacto y responsabilidad social."
        ],
        A: [
            "Motivaciones Académicas: La vocación intelectual pura domina el tránsito a posgrados, validando el rigor de la formación recibida.",
            "La experiencia vivida dentro del aula y los laboratorios es la responsable directa de despertar el amor por la ciencia continua."
        ]
    }
};

// --- SISTEMA INTERACTIVO (CON BOTÓN RESTAURAR CORREGIDO) ---
function storeOriginalContents() {
    document.querySelectorAll('.info-box').forEach(box => {
        if (!originalBoxContents[box.id]) {
            originalBoxContents[box.id] = box.innerHTML;
        }
    });
}

function restoreBox(boxId) {
    const box = document.getElementById(boxId);
    box.style.opacity = 0;
    setTimeout(() => {
        box.innerHTML = originalBoxContents[boxId];
        box.style.opacity = 1;
        animateNumbers('#' + boxId);
    }, 200);
}

function handleChartClick(dataSource, textKey, boxId, itemIndex) {
    const data = dataSource[textKey][itemIndex];
    if (!data) return;
    const box = document.getElementById(boxId);
    box.style.opacity = 0;
    setTimeout(() => {
        box.innerHTML = `
            <div class="big-stat" style="color:${data.color}">${data.val}%</div>
            <div class="stat-label" style="margin-bottom: 10px; font-size:1.1rem; color:${data.color};">${data.title}</div>
            <p class="card-desc" style="font-size: 0.95rem; line-height: 1.5;">${data.text}</p>
            <button onclick="restoreBox('${boxId}')" class="btn-restore">Restaurar resumen original <i class="fa-solid fa-rotate-left"></i></button>
        `;
        box.style.opacity = 1;
    }, 200);
}

// --- CONTROL DEL CARRUSEL DE FRASES ROTATIVAS ---
function startPhrasesRotation() {
    if (rotationTimer) clearInterval(rotationTimer);
    
    const textElement = document.getElementById(`rotative-text-${currentEditionGlobal}`);
    if (!textElement) return;

    // Obtener las frases de la edición actual según el filtro activo (o 'all')
    const filterKey = activeFilter && ['L','E','A'].includes(activeFilter) ? activeFilter : 'all';
    const phrases = phrasesDatabase[currentEditionGlobal][filterKey];
    
    currentRotationIndex = 0;
    textElement.style.opacity = 1;
    textElement.innerText = `"${phrases[currentRotationIndex]}"`;

    rotationTimer = setInterval(() => {
        gsap.to(textElement, { opacity: 0, duration: 0.3, onComplete: () => {
            currentRotationIndex = (currentRotationIndex + 1) % phrases.length;
            textElement.innerText = `"${phrases[currentRotationIndex]}"`;
            gsap.to(textElement, { opacity: 1, duration: 0.3 });
        }});
    }, 6000); // 6 segundos por frase
}

// --- FILTRO L.E.M.A. AVANZADO ---
function filterCards(category) {
    const currentEdition = document.getElementById(`edition-${currentEditionGlobal}`);
    const cards = currentEdition.querySelectorAll('.card, .download-box');
    const emptyState = currentEdition.getElementById(`empty-m-${currentEditionGlobal}`);
    const banners = currentEdition.querySelectorAll('.lema-box');

    // Restaurar primero los textos interactivos de gráficos si el usuario dejó alguno abierto
    document.querySelectorAll('.info-box').forEach(box => {
        if (originalBoxContents[box.id]) box.innerHTML = originalBoxContents[box.id];
    });

    if (activeFilter === category) {
        // Apagar el filtro
        activeFilter = null;
        banners.forEach(b => b.style.opacity = '1');
        if (emptyState) emptyState.style.display = 'none';
        cards.forEach(c => {
            c.style.display = 'flex';
            gsap.to(c, { opacity: 1, scale: 1, duration: 0.3 });
        });
    } else {
        // Encender filtro
        activeFilter = category;
        banners.forEach(b => {
            b.style.opacity = b.classList.contains('bg-' + category) ? '1' : '0.3';
        });

        cards.forEach(c => {
            if (c.dataset.cat === category || c.dataset.cat === 'all') {
                c.style.display = 'flex';
                gsap.to(c, { opacity: 1, scale: 1, duration: 0.3 });
            } else {
                gsap.to(c, { opacity: 0, scale: 0.95, duration: 0.2, onComplete: () => c.style.display = 'none' });
            }
        });

        // Caso Movilidad ('M') -> Mostrar Empty State dedicado
        if (category === 'M' && emptyState) {
            emptyState.style.display = 'flex';
            gsap.fromTo(emptyState, { opacity: 0, y: 20 }, { opacity: 1, y: 0, duration: 0.4 });
        } else if (emptyState) {
            emptyState.style.display = 'none';
        }
    }

    // Reiniciar las frases para que correspondan al filtro seleccionado
    startPhrasesRotation();
    animateNumbers(`#edition-${currentEditionGlobal}`);
}

// --- ANIMACIÓN DE NÚMEROS DESDE CERO ---
function animateNumbers(containerId) {
    document.querySelectorAll(`${containerId} .big-stat`).forEach(stat => {
        const targetValue = parseFloat(stat.getAttribute('data-count'));
        if (!targetValue) return;
        let countObj = { value: 0 };
        gsap.to(countObj, { value: targetValue, duration: 1.5, ease: "power2.out", onUpdate: function () { stat.innerText = countObj.value.toFixed(1) + '%'; } });
    });
}

// --- INTERCAMBIO DE BOLETINES ---
function switchEdition(num) {
    const currentId = num === 1 ? 2 : 1;
    const currentDiv = document.getElementById(`edition-${currentId}`);
    const nextDiv = document.getElementById(`edition-${num}`);
    if (nextDiv.style.display === "block") return;

    activeFilter = null;
    currentEditionGlobal = num;
    document.querySelectorAll('.lema-box').forEach(b => b.style.opacity = '1');
    document.querySelectorAll('.card-empty').forEach(c => c.style.display = 'none');

    document.querySelectorAll(".edition-btn").forEach(b => b.classList.remove("active"));
    document.getElementById(`btn-edicion-${num}`).classList.add("active");

    gsap.to(currentDiv, { opacity: 0, y: 20, duration: 0.3, onComplete: () => {
        currentDiv.style.display = "none";
        nextDiv.style.display = "block";
        
        nextDiv.querySelectorAll('.card, .download-box').forEach(c => { c.style.display = 'flex'; c.style.opacity = 1; });

        gsap.to(nextDiv, { opacity: 1, y: 0, duration: 0.4 });
        window.scrollTo({ top: 0, behavior: 'smooth' });
        
        gsap.fromTo(`#edition-${num} .lema-box`, { opacity: 0, scale: 0.9 }, { opacity: 1, scale: 1, stagger: 0.08, duration: 0.4 });

        gsap.fromTo(`#edition-${num} .card, #edition-${num} .download-box`, 
            { opacity: 0, y: 35 }, 
            { opacity: 1, y: 0, duration: 0.5, stagger: 0.1, ease: "power2.out", onComplete: () => {
                initCharts(num);
                storeOriginalContents();
                animateNumbers(`#edition-${num}`);
                startPhrasesRotation();
            }}
        );
    }});
}

// --- CREACIÓN Y CONFIGURACIÓN DE CHART.JS ---
function createChart(id, config) {
    if (charts[id]) charts[id].destroy(); 
    charts[id] = new Chart(document.getElementById(id), config);
}

function initCharts(edition) {
    const animCfg = { duration: 1100, easing: 'easeOutQuart' };

    if (edition === 1) {
        createChart('chartLaboralCtx', { type: 'bar', data: { labels: ['Muestra unLEMA', 'Uniandes'], datasets: [{ data: [58.4, 42.0], backgroundColor: ['#00a19b', '#d1d1d6'], borderRadius: 6 }] }, options: { indexAxis: 'y', responsive: true, maintainAspectRatio: false, animation: animCfg, plugins: { legend: { display: false }, datalabels: { color: '#fff', font: { weight: 'bold' }, formatter: v => v + '%' } }, scales: { x: { display: false, max: 100 }, y: { grid: { display: false }, border: { display: false }, ticks: { font: { weight: 'bold' } } } }, onHover: (e, el) => e.native.target.style.cursor = el[0] ? 'pointer' : 'default', onClick: (e, el) => { if (el.length) handleChartClick(exCtx, 'laboral', 'infoCtxLaboral', el[0].index); } } });
        createChart('chartAcademicCtx', { type: 'line', data: { labels: ['Nal.', 'unLEMA', 'Top100'], datasets: [{ data: [9.2, 31.4, 47.5], borderColor: '#df0832', backgroundColor: 'rgba(223, 8, 50, 0.1)', fill: true, tension: 0.4, pointRadius: 7, pointBackgroundColor: '#df0832' }] }, options: { responsive: true, maintainAspectRatio: false, animation: animCfg, plugins: { legend: { display: false }, datalabels: { align: 'bottom', color: '#df0832', font: { weight: 'bold' }, formatter: v => v + '%' } }, scales: { y: { display: false, min: 0, max: 60 }, x: { grid: { display: false } } }, onHover: (e, el) => e.native.target.style.cursor = el[0] ? 'pointer' : 'default', onClick: (e, el) => { if (el.length) handleChartClick(exCtx, 'academic', 'infoCtxAcademic', el[0].index); } } });
        createChart('chartEmprendimientoCtx', { type: 'polarArea', data: { labels: ['unLEMA', 'Global', 'Colombia'], datasets: [{ data: [4.9, 14.9, 28.8], backgroundColor: ['rgba(236, 121, 32, 0.85)', 'rgba(236, 121, 32, 0.5)', 'rgba(236, 121, 32, 0.25)'], borderWidth: 2, borderColor: '#fff', hoverOffset: 15 }] }, options: { responsive: true, maintainAspectRatio: false, animation: { duration: 1300, easing: 'easeOutElastic' }, plugins: { legend: { position: 'right' }, datalabels: { display: false } }, scales: { r: { ticks: { display: false } } }, onHover: (e, el) => e.native.target.style.cursor = el[0] ? 'pointer' : 'default', onClick: (e, el) => { if (el.length) handleChartClick(exCtx, 'emprendimiento', 'infoCtxEmprendimiento', el[0].index); } } });
    } else {
        createChart('chartLaboralMot', { type: 'doughnut', data: { labels: ['Seguridad Econ.', 'Exp. Laboral', 'Emprender', 'Otros'], datasets: [{ data: [58.7, 31.0, 1.5, 8.8], backgroundColor: ['#00a19b', '#4dcad4', '#007a75', '#b3e2df'], borderWidth: 3, borderColor: '#fff', hoverOffset: 12 }] }, options: { responsive: true, maintainAspectRatio: false, cutout: '55%', animation: { duration: 1200, easing: 'easeOutQuart' }, plugins: { legend: { position: 'right', labels: { boxWidth: 15, padding: 15 } }, datalabels: { color: '#fff', font: { weight: 'bold', size: 11 }, formatter: (v) => v > 5 ? v + '%' : '' } }, onHover: (e, el) => e.native.target.style.cursor = el[0] ? 'pointer' : 'default', onClick: (e, el) => { if (el.length) handleChartClick(exMot, 'laboral', 'infoMotLaboral', el[0].index); } } });
        createChart('chartEmprendimientoMot', { type: 'radar', data: { labels: ['Laboral', 'Financiera', 'Empleo', 'Flexibilidad', 'Oportunidad', 'Innovación'], datasets: [{ data: [23.1, 19.2, 15.4, 11.5, 11.5, 11.5], backgroundColor: 'rgba(236, 121, 32, 0.25)', borderColor: '#ec7920', pointBackgroundColor: '#ec7920', pointRadius: 5, pointHoverRadius: 8, borderWidth: 2 }] }, options: { responsive: true, maintainAspectRatio: false, animation: animCfg, plugins: { legend: { display: false }, datalabels: { display: false } }, scales: { r: { angleLines: { color: 'rgba(0,0,0,0.1)' }, grid: { color: 'rgba(0,0,0,0.1)' }, pointLabels: { font: { size: 11, weight: 'bold' } }, ticks: { display: false, max: 25 } } }, onHover: (e, el) => e.native.target.style.cursor = el[0] ? 'pointer' : 'default', onClick: (e, el) => { if (el.length) handleChartClick(exMot, 'emprendimiento', 'infoMotEmprendimiento', el[0].index); } } });
        createChart('chartAcademicMot', { type: 'bar', data: { labels: ['Personal', 'Pregrado', 'Requisito'], datasets: [{ data: [36.1, 21.6, 15.0], backgroundColor: ['#df0832', '#eb4160', '#f57a8e'], borderRadius: 6 }] }, options: { responsive: true, maintainAspectRatio: false, animation: animCfg, plugins: { legend: { display: false }, datalabels: { anchor: 'end', align: 'start', color: '#fff', font: { weight: 'bold' }, formatter: v => v + '%' } }, scales: { y: { display: false, max: 40 }, x: { grid: { display: false }, border: { display: false }, ticks: { font: { weight: 'bold' } } } }, onHover: (e, el) => e.native.target.style.cursor = el[0] ? 'pointer' : 'default', onClick: (e, el) => { if (el.length) handleChartClick(exMot, 'academic', 'infoMotAcademic', el[0].index); } } });
    }
}

// --- DISPARO INICIAL EN CARGA ---
window.onload = () => {
    gsap.fromTo(".lema-box", { opacity: 0, scale: 0.9 }, { opacity: 1, scale: 1, stagger: 0.1, duration: 0.5 });
    gsap.fromTo("#edition-1 .card, #edition-1 .download-box", { opacity: 0, y: 40 }, { opacity: 1, y: 0, duration: 0.7, stagger: 0.1, ease: "power2.out", delay: 0.2 });
    setTimeout(() => { 
        initCharts(1); 
        storeOriginalContents();
        animateNumbers("#edition-1"); 
        startPhrasesRotation();
    }, 450);
};