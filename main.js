// main.js - Orquestador Único del Tiempo y Seguridad Adaptado | Super-IA v23

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
        // Opcional: Si pasan 10 segundos y no eligen color, cerrar solo
        setTimeout(() => {
            if(isSignalActive && colorStep.style.display === 'flex') {
                recordResult(true, lastSignalSide === 'COMPRA' ? 'A' : 'B');
            }
        }, 10000);
    }
}

function triggerSignal(side, strength) {
    if (isSignalActive) return;
    
    // 1. BLOQUEO DE SEGURIDAD Y CAPTURA DE ESTADO V23
    isSignalActive = true;
    signalCooldown = true;
    lastSignalSide = side; 
    lastPowerSnapshot = strength;
    
    // Capturamos el score de la Super IA en este instante exacto para el historial
    if (typeof lastConfluenceScore !== 'undefined') {
        // Esto asegura que recordResult sepa qué tan buena era la señal
        window.currentSignalScore = lastConfluenceScore; 
    }

    // 2. REFERENCIAS DOM
    const feedbackGrid = document.getElementById('f-grid'); 
    const winBtn = document.getElementById('winBtn');
    const lossBtn = document.getElementById('lossBtn');
    const resultStep = document.getElementById('result-step');
    const colorStep = document.getElementById('color-step');
    const statusMsg = document.getElementById('op-status');
    const timerEl = document.getElementById('op-timer');
    const bigIcon = document.getElementById('big-icon');

    // 3. PREPARAR INTERFAZ (RESET DE PASOS)
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

    if(statusMsg) {
        const color = side === 'COMPRA' ? 'var(--up-neon)' : 'var(--down-neon)';
        statusMsg.innerHTML = `<span style="color:${color}; font-weight:bold; text-shadow: 0 0 10px ${color}44;">${side} DETECTADA</span>`;
    }

    if(bigIcon) {
        bigIcon.innerText = side === 'COMPRA' ? "▲" : "▼";
        bigIcon.style.color = side === 'COMPRA' ? "var(--up-neon)" : "var(--down-neon)";
        bigIcon.style.display = "flex";
        document.body.classList.add('signal-active');
    }

    // 4. CONTROL DEL TEMPORIZADOR SINCRONIZADO (EL CAMBIO QUIRÚRGICO)
    if (countdownInterval) {
        clearInterval(countdownInterval);
        countdownInterval = null;
    }

    // ✅ SINCRONIZACIÓN MANUAL: Lee 'selectedTime' definido por tus botones (5s, 15s, 30s, 60s)
    let count = parseInt(selectedTime) || 30; 
    if(timerEl) timerEl.innerText = count < 10 ? "0" + count : count; 

    console.log(`🚀 Señal Iniciada: ${side} | Tiempo: ${count}s | Fuerza: ${strength}`);

    countdownInterval = setInterval(() => {
        count--;
        
        if(timerEl) {
            timerEl.innerText = count < 10 ? "0" + count : count;
            // Efecto visual de urgencia en los últimos 5 segundos
            if(count <= 5) timerEl.style.color = "var(--down-neon)";
            else timerEl.style.color = "var(--text-main)";
        }
        
        if(count <= 0) {
            clearInterval(countdownInterval);
            countdownInterval = null;
            
            // Si el usuario no marcó resultado, liberamos el sistema automáticamente
            // Pero permitimos que el panel de feedback se quede un momento más
            console.log("⏱️ Tiempo de operación agotado. Esperando feedback manual...");
            
            // Auto-cierre de seguridad si no hay interacción en 15 segundos después del fin
            setTimeout(() => {
                if(isSignalActive && resultStep && resultStep.style.display !== 'none') {
                    resetUI(false);
                    isSignalActive = false;
                    signalCooldown = false;
                    document.body.classList.remove('signal-active');
                }
            }, 15000);
        }
    }, 1000);
    
    // Audio de alerta
    if(typeof AudioEngine !== 'undefined') AudioEngine.play(side);
}

function resetUI(fullReset = true) {
    if (countdownInterval) {
        clearInterval(countdownInterval);
        countdownInterval = null;
    }
    const timerEl = document.getElementById('op-timer');
    if (timerEl) timerEl.innerText = "00";

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
    console.log("♻️ UI Reiniciada. Memoria de Super-IA lista para el siguiente ciclo.");
}

async function recordResult(win, manualColor = null) {
    if (countdownInterval) {
        clearInterval(countdownInterval);
        countdownInterval = null;
    }
    const timerEl = document.getElementById('op-timer');
    if (timerEl) timerEl.innerText = "00";

    const signalType = lastSignalSide === 'COMPRA' ? 'A' : 'B';
    let finalColor = manualColor;
    
    // Lógica de color automática si no se provee manual
    if (!finalColor) {
        finalColor = win ? signalType : (signalType === 'A' ? 'B' : 'A');
    }

    // --- MEJORA V23: CAPTURA DE ADN Y CONTEXTO SNIPER ---
    const currentDNA = (typeof sequence !== 'undefined') ? sequence.slice(-5).map(s => s.val).join('') : "";
    
    const tradeData = {
        win: win,
        color: finalColor,
        side: lastSignalSide,
        timestamp: Date.now(),
        power: lastPowerSnapshot,
        dna: currentDNA,                                     // ADN para el DNAMatcher de la v23
        riskAtTrade: typeof riskLevel !== 'undefined' ? riskLevel : 3, // Nivel de riesgo activo
        trend: typeof getMajorTrend === 'function' ? getMajorTrend() : "NEUTRAL",
        neuralAtTrade: typeof neuralMode !== 'undefined' ? neuralMode : true,
        // Capturamos el último score de confluencia si está disponible
        scoreAtTrade: typeof lastConfluenceScore !== 'undefined' ? lastConfluenceScore : 0 
    };

    // 2. GUARDAR DATOS (Historial limitado a 50 para optimizar RAM)
    tradeHistory.push(tradeData);
    if(tradeHistory.length > 50) tradeHistory.shift(); 
    localStorage.setItem('tradeHistory', JSON.stringify(tradeHistory));

    // 3. APRENDIZAJE HÍBRIDO (Lógico + Neuronal)
    // El AICore aprende del patrón (ADN) y el NeuralCore del tensor de datos
    if(typeof AICore !== 'undefined' && typeof AICore.learn === 'function') {
        AICore.learn(); 
    }
    if(typeof NeuralCore !== 'undefined' && typeof lastData !== 'undefined' && lastData !== null) {
        NeuralCore.train(lastData, win);
    }

    // 4. DESBLOQUEO DE SEGURIDAD (Permitir nuevas señales)
    isSignalActive = false; 
    signalCooldown = false; 
    
    // Reset de variables de sesión
    if (win) {
        consecutiveLosses = 0;
    } else {
        if (typeof consecutiveLosses !== 'undefined') consecutiveLosses++;
    }

    // 5. ACTUALIZACIÓN VISUAL DE TELEMETRÍA
    updateStats();
    if (typeof resetUI === 'function') resetUI(false); 
    
    document.body.classList.remove('signal-active');
    
    // Sincronización con el panel de diagnóstico de la v23
    if(typeof updateHourlyIntelligence === 'function') updateHourlyIntelligence();
    
    console.log(`✅ Operación Registrada | Resultado: ${win ? 'WIN' : 'LOSS'} | ADN: ${currentDNA}`);
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
    radarOverlay.addEventListener('mousedown', (e) => {
        if (isSignalActive || (typeof signalCooldown !== 'undefined' && signalCooldown)) return;
        e.preventDefault();
        if (e.button === 0) registerInput('A');
        else if (e.button === 2) registerInput('B');
    });
    
    radarOverlay.addEventListener('touchstart', (e) => {
        if (isSignalActive || (typeof signalCooldown !== 'undefined' && signalCooldown)) {
            e.preventDefault();
            return;
        }
    }, { passive: false });

    radarOverlay.addEventListener('contextmenu', e => e.preventDefault());
}