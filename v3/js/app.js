const state = {
    userLoc: null,
    currentMatch: null,
    offers: [
        { id: 1, model: "iPhone 13 128GB", price: 3150, kyc: "premium", trustScore: 99, rating: 5.0, sales: 124, condition: "Semi-novo", aesthetic: "Excelente", battery: "92%", lat: -19.8210, lng: -40.2730, img: "https://m.media-amazon.com/images/I/71GLMJ7TQiL._AC_SL1500_.jpg" },
        { id: 4, model: "iPhone 11 64GB", price: 1650, kyc: "premium", trustScore: 97, rating: 4.9, sales: 89, condition: "Semi-novo", aesthetic: "Excelente", battery: "84%", lat: -19.8250, lng: -40.2710, img: "https://m.media-amazon.com/images/I/71i2XhHU3pL._AC_SL1500_.jpg" },
        { id: 5, model: "iPhone 12 128GB", price: 2450, kyc: "verified", trustScore: 85, rating: 4.6, sales: 22, condition: "Semi-novo", aesthetic: "Bom", battery: "88%", lat: -19.8150, lng: -40.2650, img: "https://m.media-amazon.com/images/I/71fVoqRC0JL._AC_SL1500_.jpg" }
    ]
};

function calculateDistance(lat1, lon1, lat2, lon2) {
    const R = 6371;
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a = Math.sin(dLat/2) * Math.sin(dLat/2) + Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * Math.sin(dLon/2) * Math.sin(dLon/2);
    return (R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a))).toFixed(1);
}

function renderGrid() {
    const grid = document.getElementById('offersGrid');
    if(!grid) return;
    grid.innerHTML = state.offers.map(off => `
        <div class="card">
            <div class="card-media"><img src="${off.img}"></div>
            <div class="card-body" style="padding:15px">
                <h3>${off.model} <span class="badge-condition">${off.condition}</span></h3>
                <p style="color:var(--green); font-weight:900; font-size:18px">R$ ${off.price.toLocaleString('pt-BR')}</p>
                <small style="color:#64748b">📍 Aracruz • ✨ ${off.aesthetic}</small>
            </div>
        </div>
    `).join('');
}

function updateRadar(mode) {
    const pill = document.getElementById('radarPill');
    if(!pill) return;
    pill.className = mode === 'scanning' ? 'state-scanning' : (mode === 'found' ? 'state-found' : 'state-idle');
}

function startRadar() {
    const query = document.getElementById('modelInput').value.toLowerCase();
    const price = parseFloat(document.getElementById('priceInput').value) || 99999;
    if(!query) return alert("O que você busca?");

    updateRadar('scanning');
    navigator.geolocation.getCurrentPosition(pos => { state.userLoc = pos.coords; }, () => {});

    setTimeout(() => {
        let match = state.offers.filter(o => o.model.toLowerCase().includes(query) && o.price <= price).sort((a,b)=>a.price-b.price)[0];
        let msg = null;
        if(!match) {
            match = state.offers.filter(o => o.model.toLowerCase().includes(query)).sort((a,b)=>a.price-b.price)[0];
            if(match) msg = `Não achamos por R$ ${price.toLocaleString()}, mas temos este:`;
        }

        if(match) {
            updateRadar('found');
            state.currentMatch = match;
            showMatch(match, msg);
        } else {
            updateRadar('idle');
            alert("Nada encontrado em Aracruz.");
        }
    }, 2500);
}

function showMatch(m, msg) {
    if (navigator.vibrate) navigator.vibrate([100, 50, 100]);
    let dist = state.userLoc ? `📍 Aprox. ${calculateDistance(state.userLoc.latitude, state.userLoc.longitude, m.lat, m.lng)} km de você` : "📍 Aracruz";

    document.getElementById('matchTitle').innerHTML = `${m.model} <span class="badge-condition">${m.condition}</span>`;
    document.getElementById('matchSub').innerText = msg || dist;

    document.getElementById('dynamicSpecs').innerHTML = `
        <div class="specs-grid">
            <div class="spec-item"><span>Saúde</span><strong>🔋 ${m.battery}</strong></div>
            <div class="spec-item"><span>Estética</span><strong>✨ ${m.aesthetic}</strong></div>
            <div class="spec-item"><span>Entrega</span><strong>🚚 Hoje</strong></div>
        </div>`;

    document.getElementById('q-trust').innerText = `${m.trustScore}%`;
    document.getElementById('q-rating').innerText = m.rating.toFixed(1);
    document.getElementById('q-sales').innerText = `+${m.sales}`;
    document.getElementById('matchBar').classList.add('show');

    document.getElementById('matchBtn').onclick = () => {
        window.open(`https://wa.me/5527999999999?text=Olá! Vi o ${m.model} no RP MATCH.`);
    };
}

document.getElementById('btnSearch').onclick = startRadar;
document.getElementById('closeMatch').onclick = () => {
    document.getElementById('matchBar').classList.remove('show');
    setTimeout(() => updateRadar('idle'), 400);
};
document.getElementById('viewDetails').onclick = () => {
    const m = state.currentMatch;
    document.getElementById('galleryImg').src = m.img;
    document.getElementById('galleryTitle').innerText = m.model;
    document.getElementById('galleryPrice').innerText = `R$ ${m.price.toLocaleString()}`;
    document.getElementById('galleryTags').innerHTML = `<span class="tag">🔋 Bateria ${m.battery}</span><span class="tag">✨ ${m.aesthetic}</span>`;
    document.getElementById('galleryModal').classList.add('show');
};
document.getElementById('closeGallery').onclick = () => document.getElementById('galleryModal').classList.remove('show');

window.onload = renderGrid;
