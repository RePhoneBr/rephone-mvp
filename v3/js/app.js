const state = {
    userLoc: null,
    currentMatch: null,
    offers: [
        { 
            id: 1, model: "iPhone 13 128GB", price: 3150, kyc: "premium", 
            trustScore: 99, rating: 5.0, sales: 124, 
            condition: "Semi-novo", aesthetic: "Excelente", battery: "92%",
            lat: -19.8210, lng: -40.2730, status: "Impecável", 
            img: "https://m.media-amazon.com/images/I/71GLMJ7TQiL._AC_SL1500_.jpg" 
        },
        { 
            id: 2, model: "iPhone 13 Blue", price: 2900, kyc: "none", 
            trustScore: 45, rating: 3.2, sales: 2, 
            condition: "Usado", aesthetic: "Bom", battery: "86%",
            lat: -19.8050, lng: -40.2550, status: "Vendedor Local", 
            img: "https://m.media-amazon.com/images/I/71xb2xkN5qL._AC_SL1500_.jpg" 
        },
        { 
            id: 3, model: "iPhone 14 Pro Max", price: 5200, kyc: "verified", 
            trustScore: 88, rating: 4.7, sales: 45, 
            condition: "Vitrine", aesthetic: "Novo", battery: "100%",
            lat: -19.9680, lng: -40.3950, status: "Verificado", 
            img: "https://m.media-amazon.com/images/I/61H79+y7E+L._AC_SL1500_.jpg" 
        },
        { 
            id: 4, model: "iPhone 11 64GB", price: 1650, kyc: "premium", 
            trustScore: 97, rating: 4.9, sales: 89, 
            condition: "Semi-novo", aesthetic: "Excelente", battery: "84%",
            lat: -19.8250, lng: -40.2710, status: "Loja Parceira", 
            img: "https://m.media-amazon.com/images/I/71i2XhHU3pL._AC_SL1500_.jpg" 
        },
        { 
            id: 5, model: "iPhone 12 128GB", price: 2400, kyc: "verified", 
            trustScore: 82, rating: 4.5, sales: 12, 
            condition: "Semi-novo", aesthetic: "Bom", battery: "88%",
            lat: -19.8190, lng: -40.2690, status: "Bom Estado", 
            img: "https://m.media-amazon.com/images/I/71fVoqRC0JL._AC_SL1500_.jpg" 
        },
        { 
            id: 6, model: "iPhone 14 128GB", price: 3900, kyc: "none", 
            trustScore: 30, rating: 0.0, sales: 0, 
            condition: "Novo", aesthetic: "Lacrado", battery: "100%",
            lat: -19.8300, lng: -40.2800, status: "Novo Vendedor", 
            img: "https://m.media-amazon.com/images/I/61bK6PMOC3L._AC_SL1500_.jpg" 
        }
    ]
};

// --- CÁLCULO DE DISTÂNCIA ---
function calculateDistance(lat1, lon1, lat2, lon2) {
    const R = 6371;
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
              Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
              Math.sin(dLon/2) * Math.sin(dLon/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return (R * c).toFixed(1);
}

// --- RENDERIZAR FEED ---
function renderGrid() {
    const grid = document.getElementById('offersGrid');
    if(!grid) return;
    grid.innerHTML = state.offers.map(off => `
        <div class="card">
            <div class="card-media">
                <span class="badge-kyc ${off.kyc}">${off.kyc === 'premium' ? '💎 Premium' : (off.kyc === 'verified' ? '✅ Verificado' : '⚠️ Pendente')}</span>
                <img src="${off.img}">
            </div>
            <div class="card-body" style="padding:20px">
                <h3 style="font-size:16px; margin-bottom:5px">${off.model} <span class="badge-condition">${off.condition}</span></h3>
                <p style="color:var(--green); font-weight:900; font-size:20px">R$ ${off.price.toLocaleString('pt-BR')}</p>
                <div style="margin-top:8px; font-size:12px; color:#64748b; font-weight:600">📍 Aracruz • ✨ ${off.aesthetic}</div>
            </div>
        </div>
    `).join('');
}

// --- CONTROLE RADAR ---
function updateRadar(mode) {
    const pill = document.getElementById('radarPill');
    if(!pill) return;
    pill.className = mode === 'scanning' ? 'state-scanning' : (mode === 'found' ? 'state-found' : 'state-idle');
}

// --- BUSCA INTELIGENTE ---
function startRadar() {
    const modelSearch = document.getElementById('modelInput').value.toLowerCase();
    const priceTarget = parseFloat(document.getElementById('priceInput').value) || 99999;

    if(!modelSearch) return alert("Qual modelo você busca?");

    updateRadar('scanning');

    // Captura localização real para o cálculo de distância
    navigator.geolocation.getCurrentPosition(pos => {
        state.userLoc = pos.coords;
        processMatch(modelSearch, priceTarget);
    }, () => {
        processMatch(modelSearch, priceTarget); // Procura mesmo sem GPS
    });
}

function processMatch(query, price) {
    setTimeout(() => {
        let match = state.offers.filter(off => 
            off.model.toLowerCase().includes(query) && off.price <= price
        ).sort((a, b) => a.price - b.price)[0];

        let msg = null;

        if (!match) {
            match = state.offers.filter(off => off.model.toLowerCase().includes(query))
                    .sort((a, b) => a.price - b.price)[0];
            if(match) msg = `Não achamos por R$ ${price.toLocaleString()}, mas temos este por:`;
        }

        if (match) {
            updateRadar('found');
            state.currentMatch = match;
            showMatch(match, msg);
        } else {
            updateRadar('idle');
            alert("Nenhum aparelho encontrado em Aracruz.");
        }
    }, 2500);
}

// --- EXIBIR RESULTADO ---
function showMatch(m, msg) {
    if (navigator.vibrate) navigator.vibrate([100, 50, 100]);

    // Título e Localização
    let distText = "📍 Localizado em Aracruz";
    if (state.userLoc) {
        const d = calculateDistance(state.userLoc.latitude, state.userLoc.longitude, m.lat, m.lng);
        distText = `📍 Aprox. ${d} km de você (Aracruz)`;
    }

    document.getElementById('matchTitle').innerHTML = `${m.model} <span class="badge-condition">${m.condition}</span>`;
    document.getElementById('matchSub').innerText = msg ? msg : distText;

    // Grid de Especificações
    const specsHTML = `
        <div class="specs-grid">
            <div class="spec-item"><span>Saúde</span><strong>🔋 ${m.battery}</strong></div>
            <div class="spec-item"><span>Estética</span><strong>✨ ${m.aesthetic}</strong></div>
            <div class="spec-item"><span>Entrega</span><strong>🚚 Hoje</strong></div>
        </div>
    `;
    
    const existingSpecs = document.getElementById('dynamicSpecs');
    if(existingSpecs) existingSpecs.remove();
    const specDiv = document.createElement('div');
    specDiv.id = 'dynamicSpecs';
    specDiv.innerHTML = specsHTML;
    document.querySelector('.match-content').insertBefore(specDiv, document.querySelector('.seller-quality'));

    // Reputação
    document.getElementById('q-trust').innerText = `${m.trustScore}%`;
    document.getElementById('q-rating').innerText = m.rating.toFixed(1);
    document.getElementById('q-sales').innerText = `+${m.sales}`;

    // Ação do Botão
    const btn = document.getElementById('matchBtn');
    btn.style.backgroundColor = m.kyc === 'none' ? "#64748b" : "#16a34a";
    btn.innerText = m.kyc === 'none' ? "SOLICITAR VERIFICAÇÃO" : "CONVERTER AGORA";
    btn.onclick = () => {
        const waMsg = encodeURIComponent(`Olá! Vi o ${m.model} no RP MATCH por R$ ${m.price} e quero combinar a retirada.`);
        window.open(`https://wa.me/5527999999999?text=${waMsg}`, '_blank');
    };

    document.getElementById('matchBar').classList.add('show');
}

// --- LISTENERS ---
document.getElementById('btnSearch').onclick = startRadar;

document.getElementById('closeMatch').onclick = () => {
    document.getElementById('matchBar').classList.remove('show');
    setTimeout(() => updateRadar('idle'), 400);
};

document.getElementById('viewDetails').onclick = () => {
    const modal = document.getElementById('galleryModal');
    document.getElementById('galleryImg').src = state.currentMatch.img;
    document.getElementById('galleryTitle').innerText = state.currentMatch.model;
    document.getElementById('galleryPrice').innerText = `R$ ${state.currentMatch.price.toLocaleString('pt-BR')}`;
    document.getElementById('galleryTags').innerHTML = `
        <span class="tag">🔋 Bateria ${state.currentMatch.battery}</span>
        <span class="tag">✨ ${state.currentMatch.aesthetic}</span>
        <span class="tag">🛡️ Garantia RePhone</span>
    `;
    modal.classList.add('show');
};

document.getElementById('closeGallery').onclick = () => document.getElementById('galleryModal').classList.remove('show');

window.onload = renderGrid;
