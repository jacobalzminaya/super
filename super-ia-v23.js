// super-ia-v23.js - Capa de Inteligencia Contextual
const SuperIA = {
    // 1. CONFIGURACIÓN DINÁMICA
    config: {
        dnaLength: 5,           // Cuántas velas atrás mira para buscar el "ADN"
        extremeSpeed: 450,      // Milisegundos para detectar entrada institucional
        recencyBias: 1.4,       // Multiplicador de peso para lo más nuevo
        decayFactor: 0.6        // Cuánto "olvida" lo antiguo (0 a 1)
    },

    /**
     * CAPA 1: DNA PATTERN MATCHING
     * Busca en el historial si este movimiento exacto ya ocurrió.
     */
    getDNAMatch() {
        if (sequence.length < this.config.dnaLength || tradeHistory.length < 3) return 0;

        // Creamos el "ADN" actual (ejemplo: "AABAB")
        const currentDNA = sequence.slice(-this.config.dnaLength).map(s => s.val).join('');
        
        let matches = 0;
        let success = 0;

        // Escaneamos el historial
        tradeHistory.forEach(trade => {
            if (trade.dna === currentDNA) {
                matches++;
                if (trade.win) success++;
            }
        });

        if (matches === 0) return 0; // ADN virgen, no hay datos previos
        
        const ratio = success / matches;
        console.log(`🧬 DNA Match: ${currentDNA} | Prob: ${(ratio * 100).toFixed(1)}%`);
        
        return ratio > 0.6 ? 1.5 : (ratio < 0.4 ? -1.5 : 0);
    },

    /**
     * CAPA 2: SENTIMENT ANALYZER (VELOCIDAD)
     * Analiza si los clics del radar indican euforia o duda.
     */
    getSentiment(ms) {
        if (ms <= 0) return 0;
        if (ms < this.config.extremeSpeed) {
            console.log("⚡ Sentimiento: FUERZA EXTREMA DETECTADA");
            return 2.0; // Bono alto por velocidad institucional
        }
        if (ms > 2000) return -1.0; // Penalización por mercado lento/dudoso
        return 0;
    },

    /**
     * CAPA 3: MOMENTUM BIAS
     * ¿Estamos en una racha ganadora o perdedora justo ahora?
     */
    getMomentum() {
        if (tradeHistory.length < 3) return 0;
        const lastThree = tradeHistory.slice(-3);
        const wins = lastThree.filter(t => t.win).length;

        if (wins === 3) return 1.0; // Estamos en racha, confianza extra
        if (wins === 0) return -2.0; // Estamos fallando, la IA se vuelve ultra-exigente
        return 0;
    },

    /**
     * PROCESADOR MAESTRO DE CONFLUENCIA
     * Suma todas las capas para decidir si se dispara la señal.
     */
    calculateSuperScore(baseNeural, ms, power) {
        const dnaScore = this.getDNAMatch();
        const sentimentScore = this.getSentiment(ms);
        const momentumScore = this.getMomentum();

        // Ponderación final (Ecuación Maestra)
        const totalScore = baseNeural + dnaScore + sentimentScore + momentumScore;

        console.table({
            "Neural Base": baseNeural.toFixed(2),
            "DNA Match": dnaScore,
            "Sentiment": sentimentScore,
            "Momentum": momentumScore,
            "TOTAL": totalScore.toFixed(2)
        });

        return totalScore;
    }
};