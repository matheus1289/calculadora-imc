/**
 * IMC Pro — Professional Calculator Script
 * Features: validation, gauge animation, category colors,
 *           ideal weight range, session history
 */

'use strict';

// ── Constants ──────────────────────────────────────────────────────────────

const IMC_CATEGORIES = [
    {
        key: 'muito-baixo',
        label: 'Abaixo do peso',
        min: 0,
        max: 18.5,
        color: '#60a5fa',
        icon: 'fa-arrow-trend-down',
        message: 'Seu IMC indica que você está abaixo do peso ideal. Considere consultar um nutricionista para avaliar sua alimentação e garantir que está recebendo os nutrientes necessários.',
    },
    {
        key: 'normal',
        label: 'Peso normal',
        min: 18.5,
        max: 25,
        color: '#34d399',
        icon: 'fa-circle-check',
        message: 'Parabéns! Seu IMC está dentro da faixa considerada saudável pela OMS. Continue mantendo uma alimentação equilibrada e a prática regular de atividades físicas.',
    },
    {
        key: 'sobrepeso',
        label: 'Sobrepeso',
        min: 25,
        max: 30,
        color: '#fbbf24',
        icon: 'fa-triangle-exclamation',
        message: 'Seu IMC indica sobrepeso. Pequenas mudanças na alimentação e o aumento da atividade física podem fazer uma grande diferença. Considere consultar um profissional de saúde.',
    },
    {
        key: 'obesidade-1',
        label: 'Obesidade Grau I',
        min: 30,
        max: 35,
        color: '#f97316',
        icon: 'fa-circle-exclamation',
        message: 'Seu IMC indica Obesidade Grau I. É importante procurar orientação médica e nutricional para estabelecer um plano seguro de perda de peso e reduzir riscos à saúde.',
    },
    {
        key: 'obesidade-2',
        label: 'Obesidade Grau II',
        min: 35,
        max: 40,
        color: '#ef4444',
        icon: 'fa-circle-exclamation',
        message: 'Seu IMC indica Obesidade Grau II (severa). Procure orientação médica com urgência. Um acompanhamento multidisciplinar é essencial para sua saúde e qualidade de vida.',
    },
    {
        key: 'obesidade-3',
        label: 'Obesidade Grau III',
        min: 40,
        max: Infinity,
        color: '#7f1d1d',
        icon: 'fa-circle-exclamation',
        message: 'Seu IMC indica Obesidade Grau III (mórbida). É fundamental buscar acompanhamento médico especializado imediatamente para avaliar as melhores opções de tratamento.',
    },
];

// Gauge: maps IMC range to needle angle (-90° to +90°)
// IMC 10 → -90°, IMC 50 → +90°
function imcToAngle(imc) {
    const clamped = Math.min(Math.max(imc, 10), 50);
    return ((clamped - 10) / 40) * 180 - 90;
}

function getCategory(imc) {
    return IMC_CATEGORIES.find(c => imc >= c.min && imc < c.max) || IMC_CATEGORIES[IMC_CATEGORIES.length - 1];
}

function calcIdealWeight(altura) {
    // Fórmula OMS: IMC 18.5–24.9 → intervalo de peso ideal
    const low  = (18.5 * altura * altura).toFixed(1);
    const high = (24.9 * altura * altura).toFixed(1);
    return `${low}–${high} kg`;
}

// ── DOM References ──────────────────────────────────────────────────────────

const form           = document.getElementById('imc-form');
const pesoInput      = document.getElementById('peso');
const alturaInput    = document.getElementById('altura');
const pesoWrapper    = document.getElementById('peso-wrapper');
const alturaWrapper  = document.getElementById('altura-wrapper');
const pesoError      = document.getElementById('peso-error');
const alturaError    = document.getElementById('altura-error');
const btnCalc        = document.getElementById('btn-calcular');
const btnReset       = document.getElementById('btn-limpar');

const resultPlaceholder = document.getElementById('result-placeholder');
const resultContent     = document.getElementById('result-content');

const gaugeNeedle    = document.getElementById('gauge-needle');
const imcValueEl     = document.getElementById('imc-value');
const categoryChip   = document.getElementById('category-chip');
const chipIcon       = document.getElementById('chip-icon');
const categoryText   = document.getElementById('category-text');
const infoText       = document.getElementById('info-text');

const statPeso       = document.getElementById('stat-peso');
const statAltura     = document.getElementById('stat-altura');
const statIdeal      = document.getElementById('stat-ideal');



// ── Validation ──────────────────────────────────────────────────────────────

function validateField(input, wrapper, errorEl, { min, max, label }) {
    const val = parseFloat(input.value);
    if (!input.value || isNaN(val)) {
        showError(wrapper, errorEl, `${label} é obrigatório.`);
        return false;
    }
    if (val < min || val > max) {
        showError(wrapper, errorEl, `${label} deve estar entre ${min} e ${max}.`);
        return false;
    }
    clearError(wrapper, errorEl);
    return true;
}

function showError(wrapper, errorEl, msg) {
    wrapper.classList.add('error');
    errorEl.textContent = msg;
}

function clearError(wrapper, errorEl) {
    wrapper.classList.remove('error');
    errorEl.textContent = '';
}

// Clear errors on input
pesoInput.addEventListener('input',   () => clearError(pesoWrapper, pesoError));
alturaInput.addEventListener('input', () => clearError(alturaWrapper, alturaError));

// ── Render Result ───────────────────────────────────────────────────────────

function renderResult(imc, category, peso, altura) {
    // Switch visibility
    resultPlaceholder.classList.add('hidden');
    resultContent.classList.remove('hidden');
    resultContent.classList.remove('animate-in');
    void resultContent.offsetWidth; // reflow
    resultContent.classList.add('animate-in');

    // IMC value with count-up
    animateCountUp(imcValueEl, imc);

    // Gauge needle
    const angle = imcToAngle(imc);
    gaugeNeedle.style.transform = `rotate(${angle}deg)`;

    // Category chip
    categoryText.textContent = category.label;
    categoryChip.style.background = hexToRgba(category.color, 0.25);
    categoryChip.style.borderColor = hexToRgba(category.color, 0.5);
    chipIcon.className = `fa-solid ${category.icon} chip-icon`;

    // Info text
    infoText.textContent = category.message;

    // Stats
    statPeso.textContent   = `${peso} kg`;
    statAltura.textContent = `${altura} m`;
    statIdeal.textContent  = calcIdealWeight(altura);

    // Show reset button
    btnReset.classList.remove('hidden');
}

// Count-up animation
function animateCountUp(el, target) {
    const duration = 800;
    const start = performance.now();
    const startVal = 0;

    function step(now) {
        const progress = Math.min((now - start) / duration, 1);
        const eased = 1 - Math.pow(1 - progress, 3);
        const current = startVal + (target - startVal) * eased;
        el.textContent = current.toFixed(1).replace('.', ',');
        if (progress < 1) requestAnimationFrame(step);
        else {
            el.textContent = target.toFixed(1).replace('.', ',');
            el.classList.add('pulse');
            el.addEventListener('animationend', () => el.classList.remove('pulse'), { once: true });
        }
    }
    requestAnimationFrame(step);
}

function hexToRgba(hex, alpha) {
    const r = parseInt(hex.slice(1, 3), 16);
    const g = parseInt(hex.slice(3, 5), 16);
    const b = parseInt(hex.slice(5, 7), 16);
    return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}

// ── Form Submit ──────────────────────────────────────────────────────────────

form.addEventListener('submit', function (e) {
    e.preventDefault();

    const validPeso   = validateField(pesoInput, pesoWrapper, pesoError, { min: 1, max: 500, label: 'Peso' });
    const validAltura = validateField(alturaInput, alturaWrapper, alturaError, { min: 0.5, max: 3, label: 'Altura' });

    if (!validPeso || !validAltura) return;

    const peso   = parseFloat(pesoInput.value);
    const altura = parseFloat(alturaInput.value);
    const imc    = peso / (altura * altura);
    const cat    = getCategory(imc);

    renderResult(imc, cat, peso, altura);
    addToHistory(imc, cat, peso, altura);
});

// ── Reset ────────────────────────────────────────────────────────────────────

btnReset.addEventListener('click', () => {
    form.reset();
    clearError(pesoWrapper, pesoError);
    clearError(alturaWrapper, alturaError);
    resultContent.classList.add('hidden');
    resultPlaceholder.classList.remove('hidden');
    btnReset.classList.add('hidden');
    tableRows.forEach(r => r.classList.remove('active'));
    pesoInput.focus();
});