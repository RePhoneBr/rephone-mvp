/* RePhone V3 - Core Engine */

const state = {
    userLoc: null,
    offers: [
        { id: 1, model: "iPhone 13 128GB", price: 3150, lat: -19.8210, lng: -40.2730, kyc: true, history: [3400, 3250, 3150], img: "https://m.media-amazon.com/images/I/71GLMJ7TQiL._AC_SL1500_.jpg" },
        { id: 2, model: "iPhone 13 Blue", price: 2900, lat: -19.8050, lng: -40.2550, kyc: false, history: [3100, 3000, 2900], img: "https://m.media-amazon.com/images/I/71xb2xkN5qL._AC_SL1500_.jpg" },
        { id: 3, model: "iPhone 14 Pro", price: 4800, lat: -19.9680, lng: -40.3950, kyc: true, history: [5200, 5000, 4800], img: "https://m.media-amazon.com/images/I/61H79+y7E+L._AC_SL1500_.jpg" },
        { id: 4, model: "iPhone 11 64GB", price: 1600, lat: -19.8250, lng: -40.2710, kyc: true, history: [1800, 1750, 1600], img: "https://m.media-amazon.com/images/I/71i2XhHU3pL._AC_SL1500_.jpg" }
    ]
};

// --- CÁLCULO DE DISTÂNCIA ---
function haversine(lat1, lon1, lat2, lon2) {
    const R = 6371;
    const dLat = (lat2-lat1) * Math.PI / 180;
    const dLon = (lon2-lon1) * Math.PI / 180;
    const a = Math.sin(dLat/2)**2 + Math.cos(lat1*Math.PI/180)*Math.cos(lat2*Math.PI/180)*Math.sin(dLon/2)**2;
    return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
}

// --- RENDERIZAR GRID INICIAL ---
function renderGrid() {
    const grid = document.getElementById('offersGrid');
    grid.innerHTML = state.offers.map(off => `
        <div class="card">
            <div class="card-media">
                ${off.kyc ? '<span class="badge-kyc">🛡️ Verificado</span>' : ''}
                <img src="${off.img}" alt="${off.model}">
            </div>
            <div class="card-body" style="padding:15px">
                <h3 style="font-size:16px">${off.model}</h3>
                <p style="color:var(--green); font-weight:800; font-size:18px">R$ ${off.price}</p>
                <small style="color:var(--muted)">Vendedor Local</small>
            </div>
        </div>
    `).join('');
}

// --- MOTOR DO RADAR & MATCH ---
async function startRadar() {
    const targetModel = document.getElementById('modelInput').value;
    const targetPrice = parseFloat(document.getElementById('priceInput').value);

    if (!targetModel || !targetPrice) return alert("Defina o modelo e o preço!");

    const pill = document.getElementById('radarPill');
    pill.className = 'state-scan';

    navigator.geolocation.getCurrentPosition(pos => {
        state.userLoc = pos.coords;

        setTimeout(() => {
            const ranked = state.offers.map(off => {
                let score = 0;
                const dist = haversine(state.userLoc.latitude, state.userLoc.longitude, off.lat, off.lng);
                
                if (dist <= 15) score += 50; // Logística
                if (off.kyc) score += 30;    // Segurança
                if (off.price <= targetPrice) score += 20; // Preço

                return { ...off, score, dist };
            }).sort((a, b) => b.score - a.score);

            showMatch(ranked[0]);
            pill.className = 'state-idle';
        }, 4000);
    }, () => alert("Ative o GPS para o Match Local."));
}

// --- EXIBIÇÃO DO MATCH ---
function showMatch(match) {
    if (navigator.vibrate) navigator.vibrate([100, 50, 100]); // Feedback Háptico
    
    const panel = document.getElementById('matchBar');
    panel.classList.add('show');

    document.getElementById('trustScore').innerText = `Confiança RePhone: ${match.score}%`;
    document.getElementById('matchTitle').innerText = `${match.model} a ${match.dist.toFixed(1)}km`;
    
    // Alerta de Urgência
    const views = Math.floor(Math.random() * 8) + 3;
    document.getElementById('matchSub').innerText = `🔥 Encontrado! ${views} interessados nesta região.`;

    // Gráfico de Histórico (Chart.js)
    const ctx = document.getElementById('historyChart').getContext('2d');
    if (window.myChart) window.myChart.destroy();
    window.myChart = new Chart(ctx, {
        type: 'line',
        data: {
            labels: ['30d', '15d', 'Hoje'],
            datasets: [{ 
                data: match.history, 
                borderColor: '#16a34a', 
                backgroundColor: 'rgba(22, 163, 74, 0.1)',
                fill: true,
                tension: 0.4 
            }]
        },
        options: { 
            responsive: true, maintainAspectRatio: false,
            plugins: { legend: { display: false } },
            scales: { y: { display: false }, x: { grid: { display: false } } }
        }
    });

    if (!match.kyc) {
        const btn = document.getElementById('matchBtn');
        btn.innerText = "NOTIFICAR VENDEDOR (KYC PENDENTE)";
        btn.style.background = "#f59e0b";
    }
}

// Iniciar eventos
document.getElementById('btnSearch').addEventListener('click', startRadar);
window.onload = renderGrid;
