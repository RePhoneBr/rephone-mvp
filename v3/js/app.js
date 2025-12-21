const state = {
    userLoc: null,
    offers: [
        { id: 1, model: "iPhone 13 128GB", price: 3150, lat: -19.8210, lng: -40.2730, kyc: true, history: [3400, 3250, 3150], img: "https://m.media-amazon.com/images/I/71GLMJ7TQiL._AC_SL1500_.jpg" },
        { id: 2, model: "iPhone 13 Blue", price: 2900, lat: -19.8050, lng: -40.2550, kyc: false, history: [3100, 3000, 2900], img: "https://m.media-amazon.com/images/I/71xb2xkN5qL._AC_SL1500_.jpg" },
        { id: 3, model: "iPhone 14 Pro Max", price: 5200, lat: -19.9680, lng: -40.3950, kyc: true, history: [5800, 5500, 5200], img: "https://m.media-amazon.com/images/I/61H79+y7E+L._AC_SL1500_.jpg" },
        { id: 4, model: "iPhone 11 64GB", price: 1650, lat: -19.8250, lng: -40.2710, kyc: true, history: [1900, 1800, 1650], img: "https://m.media-amazon.com/images/I/71i2XhHU3pL._AC_SL1500_.jpg" }
    ]
};

function renderGrid() {
    const grid = document.getElementById('offersGrid');
    grid.innerHTML = state.offers.map(off => `
        <div class="card">
            <div class="card-media"><img src="${off.img}"></div>
            <div class="card-body" style="padding:15px">
                <h3 style="font-size:15px">${off.model}</h3>
                <p style="color:var(--green); font-weight:800; font-size:18px">R$ ${off.price.toLocaleString('pt-BR')}</p>
            </div>
        </div>
    `).join('');
}

function updateRadarState(mode) {
    const pill = document.getElementById('radarPill');
    pill.className = ''; 
    if (mode === 'scanning') pill.classList.add('state-scanning');
    else if (mode === 'found') pill.classList.add('state-found');
    else pill.classList.add('state-idle');
}

async function startRadar() {
    if(!document.getElementById('modelInput').value) return alert("O que você busca?");
    updateRadarState('scanning');
    
    navigator.geolocation.getCurrentPosition(pos => {
        state.userLoc = pos.coords;
        setTimeout(() => {
            updateRadarState('found');
            showMatch(state.offers[0]); // Simulação de melhor match
        }, 3000);
    }, () => {
        alert("Ative o GPS");
        updateRadarState('idle');
    });
}

function showMatch(match) {
    document.getElementById('matchBar').classList.add('show');
    document.getElementById('trustScore').innerText = `Confiança RePhone: 92%`;
    document.getElementById('matchTitle').innerText = `${match.model}`;
    
    const ctx = document.getElementById('historyChart').getContext('2d');
    if(window.reChart) window.reChart.destroy();
    window.reChart = new Chart(ctx, {
        type: 'line',
        data: { labels: ['30d', '15d', 'Hoje'], datasets: [{ data: match.history, borderColor: '#16a34a', tension: 0.4, fill: false }] },
        options: { plugins: { legend: false }, scales: { y: { display: false } } }
    });
}

document.getElementById('closeMatch').addEventListener('click', () => {
    document.getElementById('matchBar').classList.remove('show');
    setTimeout(() => updateRadarState('idle'), 400);
});

document.getElementById('btnSearch').addEventListener('click', startRadar);
window.onload = renderGrid;
