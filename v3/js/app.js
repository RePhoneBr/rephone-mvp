/* RePhone V3 - Core Inteligente */
const brl = new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' });

const state = {
    userLoc: null,
    favorites: JSON.parse(localStorage.getItem('favs')) || [],
    offers: [
        { id: 1, model: "iPhone 13", price: 3100, lat: -19.82, lng: -40.27, kyc: true, history: [3400, 3300, 3100], verified: true },
        { id: 2, model: "iPhone 12", price: 2400, lat: -19.85, lng: -40.30, kyc: false, history: [2600, 2500, 2400], verified: false }
    ]
};

// --- LOGÍSTICA & GPS ---
function getDistance(lat1, lon1, lat2, lon2) {
    const R = 6371;
    const dLat = (lat2-lat1) * Math.PI / 180;
    const dLon = (lon2-lon1) * Math.PI / 180;
    const a = Math.sin(dLat/2)**2 + Math.cos(lat1*Math.PI/180)*Math.cos(lat2*Math.PI/180)*Math.sin(dLon/2)**2;
    return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
}

// --- FEEDBACK HÁPTICO (VIBRAÇÃO) ---
function triggerVibrate() {
    if (navigator.vibrate) navigator.vibrate([100, 50, 100]);
}

// --- ALGORITMO DE MATCH ---
async function runRadar() {
    const targetModel = document.getElementById('modelInput').value;
    const targetPrice = document.getElementById('priceInput').value;

    const pill = document.getElementById('radarPill');
    pill.className = 'state-scan';
    
    // Captura GPS Real
    navigator.geolocation.getCurrentPosition(pos => {
        state.userLoc = pos.coords;
        
        setTimeout(() => {
            const results = state.offers.map(off => {
                let score = 0;
                const dist = getDistance(state.userLoc.latitude, state.userLoc.longitude, off.lat, off.lng);
                
                // Prioridade 1: Logística (0 a 15km)
                if (dist <= 15) score += 50;
                else if (dist <= 40) score += 20;

                // Prioridade 2: KYC
                if (off.kyc) score += 30;

                // Prioridade 3: Preço
                if (off.price <= targetPrice) score += 20;

                return { ...off, score, dist };
            }).sort((a, b) => b.score - a.score);

            showMatch(results[0]);
        }, 3000);
    });
}

function showMatch(match) {
    triggerVibrate();
    const bar = document.getElementById('matchBar');
    bar.classList.add('show');
    
    // Gráfico de Histórico
    const ctx = document.getElementById('historyChart').getContext('2d');
    new Chart(ctx, {
        type: 'line',
        data: {
            labels: ['30d', '15d', 'Hoje'],
            datasets: [{ data: match.history, borderColor: '#16a34a', tension: 0.4 }]
        },
        options: { plugins: { legend: { display: false } }, scales: { y: { display: false } } }
    });

    document.getElementById('trustScore').innerText = `Confiança RePhone: ${match.score}%`;
    document.getElementById('matchTitle').innerText = `${match.model} a ${match.dist.toFixed(1)}km`;
    
    // Gatilho de Urgência
    const views = Math.floor(Math.random() * 10) + 2;
    document.getElementById('urgencyText').innerText = `🔥 ${views} pessoas interessadas nesta região.`;

    if (!match.kyc) {
        document.getElementById('matchBtn').innerText = "NOTIFICAR VENDEDOR (KYC PENDENTE)";
        document.getElementById('matchBtn').style.background = "#f59e0b";
    }
}

// Iniciar Eventos
document.getElementById('btnSearch').addEventListener('click', runRadar);
