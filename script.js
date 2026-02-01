// Configurações do sistema
let config = {
    freeSignalsPerCycle: 2,
    adSignalsPerCycle: 1,
    signalInterval: 120, // 2 minutos em segundos
    adDuration: 10, // segundos
    currentSignal: null,
    history: [],
    stats: {
        totalSignals: 0,
        freeSignals: 0,
        adSignals: 0,
        successfulTrades: 0,
        failedTrades: 0
    },
    cycleCounter: 0,
    isAdRequired: false,
    isAdActive: false
};

// Ativos para demonstração
const assets = [
    { symbol: 'EUR/USD', name: 'Euro vs Dólar', category: 'Forex' },
    { symbol: 'GBP/USD', name: 'Libra vs Dólar', category: 'Forex' },
    { symbol: 'BTC/USD', name: 'Bitcoin', category: 'Cripto' },
    { symbol: 'ETH/USD', name: 'Ethereum', category: 'Cripto' },
    { symbol: 'XAU/USD', name: 'Ouro', category: 'Commodity' },
    { symbol: 'AAPL', name: 'Apple', category: 'Ações' },
    { symbol: 'TSLA', name: 'Tesla', category: 'Ações' },
    { symbol: 'USOIL', name: 'Petróleo', category: 'Commodity' }
];

// Inicialização
document.addEventListener('DOMContentLoaded', function() {
    loadFromLocalStorage();
    updateStatsDisplay();
    startSignalCycle();
    updateFreeSignalsCounter();
});

// Sistema de ciclo: 2 grátis, 1 com ad
function startSignalCycle() {
    let timeLeft = config.signalInterval;
    const countdownElement = document.getElementById('countdown');
    const signalCard = document.getElementById('signalCard');
    
    const timer = setInterval(() => {
        timeLeft--;
        
        const minutes = Math.floor(timeLeft / 60);
        const seconds = timeLeft % 60;
        countdownElement.textContent = 
            `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
        
        if (timeLeft <= 0) {
            clearInterval(timer);
            generateNewSignal();
            timeLeft = config.signalInterval;
            setTimeout(() => startSignalCycle(), 1000);
        }
    }, 1000);
}

// Gerar novo sinal
function generateNewSignal() {
    config.cycleCounter++;
    
    // Verificar se é um sinal com propaganda
    const isAdSignal = config.cycleCounter > config.freeSignalsPerCycle;
    
    if (isAdSignal && config.cycleCounter <= (config.freeSignalsPerCycle + config.adSignalsPerCycle)) {
        // Este sinal requer propaganda
        config.isAdRequired = true;
        showAdModal();
        return; // Não gerar sinal ainda, aguardar ad
    } else if (config.cycleCounter > (config.freeSignalsPerCycle + config.adSignalsPerCycle)) {
        // Resetar ciclo
        config.cycleCounter = 1;
        config.isAdRequired = false;
    }
    
    // Gerar o sinal
    createSignal(isAdSignal);
}

// Criar sinal específico
function createSignal(requiresAd = false) {
    const randomAsset = assets[Math.floor(Math.random() * assets.length)];
    const directions = ['CALL', 'PUT'];
    const randomDirection = directions[Math.floor(Math.random() * directions.length)];
    const expirationTimes = [1, 2, 5];
    const randomExpiration = expirationTimes[Math.floor(Math.random() * expirationTimes.length)];
    
    config.currentSignal = {
        id: Date.now(),
        asset: randomAsset,
        direction: randomDirection,
        expiration: randomExpiration,
        timestamp: new Date().toLocaleTimeString('pt-BR'),
        date: new Date().toLocaleDateString('pt-BR'),
        requiresAd: requiresAd,
        executed: false,
        result: null
    };
    
    // Atualizar estatísticas
    if (requiresAd) {
        config.stats.adSignals++;
    } else {
        config.stats.freeSignals++;
    }
    config.stats.totalSignals++;
    
    // Atualizar interface
    updateSignalDisplay();
    updateStatsDisplay();
    updateFreeSignalsCounter();
    
    // Salvar no histórico
    addToHistory(config.currentSignal);
    
    // Salvar no localStorage
    saveToLocalStorage();
    
    // Mostrar notificação
    showNotification(`🎯 Novo sinal ${requiresAd ? 'com propaganda' : 'grátis'} gerado!`);
}

// Atualizar display do sinal
function updateSignalDisplay() {
    const signal = config.currentSignal;
    const signalCard = document.getElementById('signalCard');
    const signalType = document.getElementById('signalType');
    const signalInfo = document.getElementById('signalInfo');
    const adNotice = document.getElementById('adNotice');
    const openIQBtn = document.getElementById('openIQBtn');
    
    // Configurar estilo baseado no tipo
    if (signal.requiresAd) {
        signalCard.className = 'signal-card ad';
        signalType.className = 'signal-type ad-signal';
        signalType.textContent = 'SINAL COM PROPAGANDA';
        openIQBtn.className = 'btn btn-ad';
        openIQBtn.innerHTML = '📢 VER PROPAGANDA PRIMEIRO';
        openIQBtn.onclick = showAdModal;
    } else {
        signalCard.className = 'signal-card free';
        signalType.className = 'signal-type free-signal';
        signalType.textContent = 'SINAL GRÁTIS';
        openIQBtn.className = 'btn btn-success';
        openIQBtn.innerHTML = '🚀 ABRIR IQ OPTIONS';
        openIQBtn.onclick = openIQ;
    }
    
    // Mostrar aviso sobre próximo sinal com ad
    const freeSignalsLeft = config.freeSignalsPerCycle - (config.cycleCounter % config.freeSignalsPerCycle);
    if (!signal.requiresAd && freeSignalsLeft === 1) {
        adNotice.style.display = 'block';
    } else {
        adNotice.style.display = 'none';
    }
    
    // Informações do sinal
    const directionColor = signal.direction === 'CALL' ? '#2ecc71' : '#e74c3c';
    const directionIcon = signal.direction === 'CALL' ? '📈' : '📉';
    
    signalInfo.innerHTML = `
        <div style="display: flex; align-items: center; gap: 15px; margin-bottom: 15px;">
            <div style="font-size: 2.5rem;">${directionIcon}</div>
            <div>
                <h3 style="color: ${directionColor}; margin: 0 0 5px 0;">
                    ${signal.asset.symbol} - ${signal.direction}
                </h3>
                <p style="color: #bdc3c7; margin: 0;">${signal.asset.name}</p>
            </div>
        </div>
        
        <div style="background: rgba(0,0,0,0.2); padding: 15px; border-radius: 8px;">
            <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(150px, 1fr)); gap: 10px; text-align: center;">
                <div>
                    <small>Categoria</small>
                    <p style="font-weight: bold;">${signal.asset.category}</p>
                </div>
                <div>
                    <small>Expiração Recomendada</small>
                    <p style="font-weight: bold;">${signal.expiration} minuto${signal.expiration > 1 ? 's' : ''}</p>
                </div>
                <div>
                    <small>Tipo</small>
                    <p style="font-weight: bold; color: ${signal.requiresAd ? '#e67e22' : '#27ae60'}">
                        ${signal.requiresAd ? 'Com Propaganda' : 'Grátis'}
                    </p>
                </div>
                <div>
                    <small>Horário</small>
                    <p style="font-weight: bold;">${signal.timestamp}</p>
                </div>
            </div>
        </div>
        
        ${signal.requiresAd ? `
            <div style="margin-top: 15px; padding: 10px; background: rgba(230, 126, 34, 0.1); border-radius: 5px; border-left: 3px solid #e67e22;">
                <p style="margin: 0; color: #e67e22;">
                    <strong>📢 Este sinal requer visualização de propaganda</strong><br>
                    <small>Clique em "Ver Propaganda Primeiro" para continuar</small>
                </p>
            </div>
        ` : ''}
    `;
}

// Mostrar modal de propaganda
function showAdModal() {
    const modal = document.getElementById('adModal');
    const closeBtn = document.getElementById('closeAdBtn');
    const adTimer = document.getElementById('adTimer');
    const progressFill = document.getElementById('adProgress');
    
    // Resetar elementos
    closeBtn.style.display = 'none';
    progressFill.style.width = '0%';
    adTimer.textContent = config.adDuration;
    
    // Mostrar modal
    modal.style.display = 'flex';
    config.isAdActive = true;
    
    // Iniciar contagem regressiva
    let timeLeft = config.adDuration;
    const timer = setInterval(() => {
        timeLeft--;
        adTimer.textContent = timeLeft;
        
        // Atualizar barra de progresso
        const progress = ((config.adDuration - timeLeft) / config.adDuration) * 100;
        progressFill.style.width = `${progress}%`;
        
        if (timeLeft <= 0) {
            clearInterval(timer);
            closeBtn.style.display = 'block';
            showNotification('✅ Propaganda concluída! Sinal liberado.');
        }
    }, 1000);
    
    // Simular clique no anúncio (para demonstração)
    document.getElementById('adContent').onclick = function() {
        showNotification('🏆 Obrigado por clicar no anúncio! Suporte monetário recebido.');
    };
}

// Fechar modal de propaganda
function closeAd() {
    const modal = document.getElementById('adModal');
    modal.style.display = 'none';
    config.isAdActive = false;
    config.isAdRequired = false;
    
    // Atualizar botão para abrir IQ Options
    const openIQBtn = document.getElementById('openIQBtn');
    openIQBtn.className = 'btn btn-success';
    openIQBtn.innerHTML = '🚀 ABRIR IQ OPTIONS';
    openIQBtn.onclick = openIQ;
    
    showNotification('🎉 Propaganda concluída! Agora você pode executar o sinal.');
}

// Abrir IQ Options
function openIQ() {
    if (config.currentSignal && config.currentSignal.requiresAd && !config.isAdActive) {
        showAdModal();
        return;
    }
    
    if (config.currentSignal) {
        window.open('https://iqoption.com/traderoom', '_blank');
        
        // Marcar como executado
        config.currentSignal.executed = true;
        config.currentSignal.executedAt = new Date().toLocaleTimeString('pt-BR');
        
        showNotification(`📊 Sinal ${config.currentSignal.asset.symbol} executado na IQ Options!`);
        saveToLocalStorage();
    }
}

// Simular operação
function simulateTrade() {
    if (!config.currentSignal) return;
    
    const results = ['GANHOU', 'PERDEU'];
    const result = Math.random() > 0.5 ? 'GANHOU' : 'PERDEU';
    const profitLoss = (Math.random() * 100).toFixed(2);
    
    // Atualizar estatísticas
    if (result === 'GANHOU') {
        config.stats.successfulTrades++;
    } else {
        config.stats.failedTrades++;
    }
    
    // Atualizar sinal no histórico
    const signalIndex = config.history.findIndex(s => s.id === config.currentSignal.id);
    if (signalIndex !== -1) {
        config.history[signalIndex].simulated = true;
        config.history[signalIndex].simulationResult = result;
        config.history[signalIndex].simulationValue = profitLoss;
    }
    
    updateStatsDisplay();
    updateHistoryDisplay();
    
    showNotification(
        result === 'GANHOU' 
            ? `💰 Simulação: GANHOU ${profitLoss} unidades!` 
            : `📉 Simulação: PERDEU ${profitLoss} unidades`
    );
    
    saveToLocalStorage();
}

// Pular sinal
function skipSignal() {
    config.cycleCounter--;
    if (config.cycleCounter < 0) config.cycleCounter = 0;
    
    showNotification('⏭️ Sinal pulado. Próximo em 2 minutos...');
    updateFreeSignalsCounter();
}

// Adicionar ao histórico
function addToHistory(signal) {
    config.history.unshift(signal);
    
    // Manter apenas os últimos 50 itens
    if (config.history.length > 50) {
        config.history.pop();
    }
    
    updateHistoryDisplay();
}

// Atualizar display do histórico
function updateHistoryDisplay() {
    const historyGrid = document.getElementById('historyGrid');
    historyGrid.innerHTML = '';
    
    config.history.forEach(signal => {
        const item = document.createElement('div');
        item.className = `history-item ${signal.direction.toLowerCase()}`;
        
        const adIcon = signal.requiresAd ? '<span class="ad-icon">📢</span>' : '<span class="free-icon">🎯</span>';
        const resultIcon = signal.simulated 
            ? (signal.simulationResult === 'GANHOU' ? '✅' : '❌')
            : '➡️';
        
        item.innerHTML = `
            ${adIcon}
            <div style="flex: 1;">
                <div style="display: flex; justify-content: space-between;">
                    <strong>${signal.asset.symbol}</strong>
                    <span>${resultIcon}</span>
                </div>
                <div style="font-size: 0.9rem; color: #bdc3c7;">
                    ${signal.direction} • ${signal.expiration} min
                </div>
                <div style="font-size: 0.8rem; color: #95a5a6;">
                    ${signal.time || signal.timestamp}
                </div>
            </div>
        `;
        
        historyGrid.appendChild(item);
    });
}

// Atualizar contador de sinais grátis
function updateFreeSignalsCounter() {
    const freeSignalsLeft = config.freeSignalsPerCycle - (config.cycleCounter % config.freeSignalsPerCycle);
    document.getElementById('freeSignalsCounter').textContent = 
        freeSignalsLeft > 0 ? freeSignalsLeft : 0;
}

// Atualizar estatísticas
function updateStatsDisplay() {
    document.getElementById('totalSignals').textContent = config.stats.totalSignals;
    document.getElementById('freeSignals').textContent = config.stats.freeSignals;
    document.getElementById('adSignals').textContent = config.stats.adSignals;
    
    const totalTrades = config.stats.successfulTrades + config.stats.failedTrades;
    const successRate = totalTrades > 0 
        ? Math.round((config.stats.successfulTrades / totalTrades) * 100)
        : 0;
    
    document.getElementById('successRate').textContent = `${successRate}%`;
}

// Notificações
function showNotification(message) {
    const notification = document.createElement('div');
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: rgba(44, 62, 80, 0.95);
        color: white;
        padding: 15px 25px;
        border-radius: 10px;
        box-shadow: 0 5px 15px rgba(0,0,0,0.3);
        z-index: 1000;
        border-left: 4px solid #3498db;
        animation: slideIn 0.3s ease;
        max-width: 300px;
    `;
    
    notification.innerHTML = `
        <div style="display: flex; align-items: center; gap: 10px;">
            <div style="font-size: 1.5rem;">🔔</div>
            <div>${message}</div>
        </div>
    `;
    
    document.body.appendChild(notification);
    
    setTimeout(() => {
        notification.style.animation = 'slideOut 0.3s ease';
        setTimeout(() => {
            document.body.removeChild(notification);
        }, 300);
    }, 3000);
}

// LocalStorage
function saveToLocalStorage() {
    try {
        localStorage.setItem('iqSignalsConfig', JSON.stringify(config));
    } catch (e) {
        console.log('Erro ao salvar no localStorage:', e);
    }
}

function loadFromLocalStorage() {
    try {
        const saved = localStorage.getItem('iqSignalsConfig');
        if (saved) {
            const parsed = JSON.parse(saved);
            // Mesclar configurações salvas
            config = { ...config, ...parsed };
            
            // Garantir que as propriedades existam
            config.stats = parsed.stats || config.stats;
            config.history = parsed.history || config.history;
            
            updateHistoryDisplay();
        }
    } catch (e) {
        console.log('Erro ao carregar do localStorage:', e);
    }
}

// Adicionar animações CSS
const style = document.createElement('style');
style.textContent = `
    @keyframes slideIn {
        from { transform: translateX(100%); opacity: 0; }
        to { transform: translateX(0); opacity: 1; }
    }
    
    @keyframes slideOut {
        from { transform: translateX(0); opacity: 1; }
        to { transform: translateX(100%); opacity: 0; }
    }
    
    @keyframes pulse {
        0% { box-shadow: 0 0 0 0 rgba(230, 126, 34, 0.4); }
        70% { box-shadow: 0 0 0 10px rgba(230, 126, 34, 0); }
        100% { box-shadow: 0 0 0 0 rgba(230, 126, 34, 0); }
    }
`;
document.head.appendChild(style);