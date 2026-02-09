// main.js - Orquestador Único del Tiempo y Seguridad Adaptado

let lastSignalSide = null; 
let lastPowerSnapshot = 0; // Captura la fuerza exacta al momento de la señal

window.addEventListener('DOMContentLoaded', () => {
    loadConfig();
    initCanvas(); 
    
    const hSaved = localStorage.getItem('tradeHistory');
    if(hSaved) { 
        tradeHistory = JSON.parse(hSaved); 
        updateStats(); 
    }
});

function handleWinClick() {
    const resultStep = document.getElementById('result-step');
    const colorStep = document.getElementById('color-step');
    if(resultStep && colorStep) {
        resultStep.style.display = 'none';
        colorStep.style.display = 'flex';
    }
}

function triggerSignal(side, strength) {
    if (isSignalActive) return;
    isSignalActive = true;
    signalCooldown = true;
    lastSignalSide = side; 
    lastPowerSnapshot = strength; // Guardamos la potencia para el registro posterior

    const feedbackGrid = document.getElementById('f-grid'); 
    const winBtn = document.getElementById('winBtn');
    const lossBtn = document.getElementById('lossBtn');
    const resultStep = document.getElementById('result-step');
    const colorStep = document.getElementById('color-step');

    if(resultStep) resultStep.style.display = 'flex';
    if(colorStep) colorStep.style.display = 'none';
    if(feedbackGrid) feedbackGrid.classList.add('show'); 

    if(winBtn && lossBtn) {
        winBtn.disabled = false;
        lossBtn.disabled = false;
        winBtn.style.opacity = "1";
        winBtn.style.filter = "none";
        lossBtn.style.opacity = "1";
        lossBtn.style.filter = "none";
    }

    const statusMsg = document.getElementById('op-status');
    const timerEl = document.getElementById('op-timer');
    const bigIcon = document.getElementById('big-icon');

    if(statusMsg) {
        statusMsg.innerHTML = `<span style="color:${side === 'COMPRA' ? 'var(--up-neon)' : 'var(--down-neon)'}; font-weight:bold;">${side} DETECTADA</span>`;
    }

    if(bigIcon) {
        bigIcon.innerText = side === 'COMPRA' ? "▲" : "▼";
        bigIcon.style.color = side === 'COMPRA' ? "var(--up-neon)" : "var(--down-neon)";
        bigIcon.style.display = "flex";
        document.body.classList.add('signal-active');
    }

    if (countdownInterval) clearInterval(countdownInterval); 
    let count = parseInt(selectedTime) || 30;

    countdownInterval = setInterval(() => {
        count--;
        if(timerEl) timerEl.innerText = count < 10 ? "0" + count : count;
        if(count <= 0) {
            clearInterval(countdownInterval);
            resetUI(false);
            setTimeout(() => { signalCooldown = false; }, 2000);
        }
    }, 1000);
}

function resetUI(fullReset = true) {
    if (countdownInterval) {
        clearInterval(countdownInterval);
        countdownInterval = null;
    }
    isSignalActive = false;
    
    const feedbackGrid = document.getElementById('f-grid');
    const resultStep = document.getElementById('result-step');
    const colorStep = document.getElementById('color-step');
    const winBtn = document.getElementById('winBtn');
    const lossBtn = document.getElementById('lossBtn');

    if(feedbackGrid) feedbackGrid.classList.remove('show'); 
    if(resultStep) resultStep.style.display = 'flex';
    if(colorStep) colorStep.style.display = 'none';

    if (winBtn && lossBtn) {
        winBtn.style.opacity = "0.3";
        winBtn.style.filter = "grayscale(1)";
        lossBtn.style.opacity = "0.3";
        lossBtn.style.filter = "grayscale(1)";
        winBtn.disabled = true;
        lossBtn.disabled = true;
    }

    const bigIcon = document.getElementById('big-icon');
    if(bigIcon) bigIcon.style.display = "none";
    
    const statusMsg = document.getElementById('op-status');
    if(statusMsg) {
        statusMsg.innerText = fullReset ? "SISTEMA STANDBY" : "ESPERANDO SEÑAL";
        statusMsg.style.color = "var(--text-dim)";
    }
    document.body.classList.remove('signal-active');
}

async function recordResult(win, manualColor = null) {
    const signalType = lastSignalSide === 'COMPRA' ? 'A' : 'B';
    let finalColor = manualColor;
    
    // Si es LOSS, deducimos que el color fue el opuesto a la señal
    if (!win) finalColor = (signalType === 'A') ? 'B' : 'A';

    const tradeData = {
        win: win,
        color: finalColor,
        time: new Date().getTime(),
        power: lastPowerSnapshot,
        trend: typeof getMajorTrend === 'function' ? getMajorTrend() : "NEUTRAL",
        neuralAtTrade: neuralMode
    };

    tradeHistory.push(tradeData);
    if(tradeHistory.length > 50) tradeHistory.shift(); 
    localStorage.setItem('tradeHistory', JSON.stringify(tradeHistory));

    // --- INTEGRACIÓN CON IA CORE ---
    // Si la IA está activa, aprende de este resultado
    if(win && typeof AICore !== 'undefined') {
        AICore.learn(); 
    }

    updateStats();
    resetUI(false);
    
    // Actualizar diagnóstico si existe la función
    if(typeof updateHourlyIntelligence === 'function') updateHourlyIntelligence();
}

function updateStats() {
    const wins = tradeHistory.filter(x => x && x.win === true).length;
    const total = tradeHistory.length;
    const totalEl = document.getElementById('stat-total');
    const winRateEl = document.getElementById('stat-winrate');
    if(totalEl) totalEl.innerText = total;
    if(winRateEl) winRateEl.innerText = total > 0 ? Math.round((wins/total)*100) + "%" : "0%";
}

// --- CONTROL DE ENTRADAS (RADAR Y TÁCTIL) ---
const radarOverlay = document.getElementById('mouse-overlay');
if(radarOverlay) {
    // Soporte para Mouse
    radarOverlay.addEventListener('mousedown', (e) => {
        if (isSignalActive || (typeof signalCooldown !== 'undefined' && signalCooldown)) return;
        e.preventDefault();
        if (e.button === 0) registerInput('A');
        else if (e.button === 2) registerInput('B');
    });
    
    // Soporte para Táctil (Evita zooms accidentales)
    radarOverlay.addEventListener('touchstart', (e) => {
        if (isSignalActive || (typeof signalCooldown !== 'undefined' && signalCooldown)) {
            e.preventDefault();
            return;
        }
    }, { passive: false });

    radarOverlay.addEventListener('contextmenu', e => e.preventDefault());
}