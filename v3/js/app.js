/* RePhone V3 - Inteligência e Renderização */

const state = {
    userLoc: null,
    offers: [
        { 
            id: 1, 
            model: "iPhone 13 128GB", 
            price: 3150, 
            lat: -19.8210, lng: -40.2730, 
            kyc: true, 
            history: [3400, 3250, 3150], 
            img: "https://m.media-amazon.com/images/I/71GLMJ7TQiL._AC_SL1500_.jpg" 
        },
        { 
            id: 2, 
            model: "iPhone 13 Blue", 
            price: 2900, 
            lat: -19.8050, lng: -40.2550, 
            kyc: false, 
            history: [3100, 3000, 2900], 
            img: "https://m.media-amazon.com/images/I/71xb2xkN5qL._AC_SL1500_.jpg" 
        },
        { 
            id: 3, 
            model: "iPhone 14 Pro Max", 
            price: 5200, 
            lat: -19.9680, lng: -40.3950, 
            kyc: true, 
            history: [5800, 5500, 5200], 
            img: "https://m.media-amazon.com/images/I/61H79+y7E+L._AC_SL1500_.jpg" 
        },
        { 
            id: 4, 
            model: "iPhone 11 64GB", 
            price: 1650, 
            lat: -19.8250, lng: -40.2710, 
            kyc: true, 
            history: [1900, 1800, 1650], 
            img: "https://m.media-amazon.com/images/I/71i2XhHU3pL._AC_SL1500_.jpg" 
        }
    ]
};

// --- FÓRMULA DE DISTÂNCIA ---
function haversine(lat1, lon1, lat2, lon2) {
    const R = 6371;
    const dLat = (lat2-lat1) * Math.PI / 180;
    const dLon = (lon2-lon1) * Math.PI / 180;
    const a = Math.sin(dLat/2)**2 + Math.cos(lat1*Math.PI/180)*Math.cos(lat2*Math.PI/180)*Math.sin(dLon/2)**2;
    return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
}

// --- RENDERIZAR ANÚNCIOS NO GRID ---
function renderGrid() {
    const grid = document.getElementById('offersGrid');
    if (!grid) return;

    grid.innerHTML = state.offers.map(off => `
        <div class="card" id="card-${off.id}">
            <div class="card-media">
                ${off.kyc ? '<span class="badge-kyc">🛡️ Verificado</span>' : ''}
                <img src="${off.img}" alt="${off.model}">
            </div>
            <div class="card-body">
                <h3>${off.model}</h3>
                <p style="color:var(--green); font-weight:800; font-size:20px; margin:5px 0;">
                    R$ ${off.price.toLocaleString('pt-BR')}
                </p>
                <div style="display:flex; justify-content:space-between; align-items:center;">
                    <small style="color:var(--muted)">📍 Aracruz</small>
                    <button class="details-btn">Ver mais</button>
                </div>
            </div>
        </div>
    `).join('');
}

// --- LÓGICA DO RADAR ---
async function startRadar() {
    const modelInput = document.getElementById('modelInput').value;
    const priceInput = document.getElementById('priceInput').value;

    if (!modelInput || !priceInput) {
        alert("Por favor, digite o modelo e seu preço alvo.");
        return;
    }

    const pill = document.getElementById('radarPill');
    pill.classList.add('state-scan');

    navigator.geolocation.getCurrentPosition(pos => {
        state.userLoc = pos.coords;
        
        setTimeout(() => {
            const ranked = state.offers.map(off => {
                const dist = haversine(state.userLoc.latitude, state.userLoc.longitude, off.lat, off.lng);
                let score = off.kyc ? 30 : 0;
                if (dist <= 15) score += 50;
                if (off.price <= parseFloat(priceInput)) score += 20;
                return { ...off, dist, score };
            }).sort((a, b) => b.score - a.score);

            showMatch(ranked[0]);
            pill.classList.remove('state-scan');
        }, 3500);
    }, () => {
        alert("GPS necessário para encontrar ofertas locais.");
        pill.classList.remove('state-scan');
    });
}

// --- EXIBIR PAINEL DE MATCH ---
function showMatch(match) {
    const panel = document.getElementById('matchBar');
    panel.classList.add('show');

    document.getElementById('trustScore').innerText = `Confiança RePhone: ${match.score}%`;
    document.getElementById('matchTitle').innerText = `${match.model} a ${match.dist.toFixed(1)}km`;
    document.getElementById('matchSub').innerText = match.kyc ? "🛡️ Vendedor com KYC Verificado" : "⏳ Verificação pendente para este vendedor";

    const ctx = document.getElementById('historyChart').getContext('2d');
    if (window.rephoneChart) window.rephoneChart.destroy();
    window.rephoneChart = new Chart(ctx, {
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
            plugins: { legend: false },
            scales: { y: { display: false }, x: { grid: { display: false } } }
        }
    });
}

// Inicializar
document.addEventListener('DOMContentLoaded', () => {
    renderGrid();
    document.getElementById('btnSearch').addEventListener('click', startRadar);
});
