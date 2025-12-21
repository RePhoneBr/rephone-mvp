const state = {
    currentMatch: null,
    offers: [
        { id: 1, model: "iPhone 13 128GB", price: 3150, kyc: "premium", trustScore: 99, rating: 5.0, sales: 124, status: "Impecável", img: "https://m.media-amazon.com/images/I/71GLMJ7TQiL._AC_SL1500_.jpg" },
        { id: 2, model: "iPhone 13 Blue", price: 2900, kyc: "none", trustScore: 45, rating: 3.2, sales: 2, status: "Usado", img: "https://m.media-amazon.com/images/I/71xb2xkN5qL._AC_SL1500_.jpg" },
        { id: 3, model: "iPhone 14 Pro Max", price: 5200, kyc: "verified", trustScore: 88, rating: 4.7, sales: 45, status: "Vitrine", img: "https://m.media-amazon.com/images/I/61H79+y7E+L._AC_SL1500_.jpg" },
        { id: 4, model: "iPhone 11 64GB", price: 1650, kyc: "premium", trustScore: 97, rating: 4.9, sales: 89, status: "Loja Parceira", img: "https://m.media-amazon.com/images/I/71i2XhHU3pL._AC_SL1500_.jpg" },
        { id: 5, model: "iPhone 12 128GB", price: 2400, kyc: "verified", trustScore: 82, rating: 4.5, sales: 12, status: "Bom Estado", img: "https://m.media-amazon.com/images/I/71fVoqRC0JL._AC_SL1500_.jpg" },
        { id: 6, model: "iPhone 14 128GB", price: 3900, kyc: "none", trustScore: 30, rating: 0.0, sales: 0, status: "Novo Vendedor", img: "https://m.media-amazon.com/images/I/61bK6PMOC3L._AC_SL1500_.jpg" }
    ]
};

// --- RENDERIZAR GRID INICIAL ---
function renderGrid() {
    const grid = document.getElementById('offersGrid');
    if(!grid) return;
    grid.innerHTML = state.offers.map(off => `
        <div class="card">
            <div class="card-media"><img src="${off.img}"></div>
            <div class="card-body" style="padding:15px">
                <h3 style="font-size:15px; margin-bottom:5px">${off.model}</h3>
                <p style="color:#16a34a; font-weight:800; font-size:18px">R$ ${off.price.toLocaleString('pt-BR')}</p>
            </div>
        </div>
    `).join('');
}

// --- CONTROLE DO RADAR ---
function updateRadar(mode) {
    const pill = document.getElementById('radarPill');
    if(!pill) return;
    pill.className = mode === 'scanning' ? 'state-scanning' : (mode === 'found' ? 'state-found' : 'state-idle');
}

// --- LÓGICA DE BUSCA E FILTRO ---
function startRadar() {
    const modelInput = document.getElementById('modelInput');
    const priceInput = document.getElementById('priceInput');

    const modelSearch = modelInput.value.toLowerCase();
    const priceTarget = parseFloat(priceInput.value) || 99999; // Se não digitar preço, assume valor alto

    if(!modelSearch) {
        alert("Digite o modelo (ex: iPhone 11)");
        return;
    }

    updateRadar('scanning');

    setTimeout(() => {
        // 1. Tenta Match Exato
        let match = state.offers.filter(off => 
            off.model.toLowerCase().includes(modelSearch) && off.price <= priceTarget
        ).sort((a, b) => a.price - b.price)[0];

        let customMsg = null;

        // 2. Se não achar exato, busca sugestão de preço mais próximo
        if (!match) {
            match = state.offers.filter(off => 
                off.model.toLowerCase().includes(modelSearch)
            ).sort((a, b) => a.price - b.price)[0];
            
            if(match) {
                const diff = match.price - priceTarget;
                customMsg = `Não achamos por R$ ${priceTarget.toLocaleString()}, mas temos este por +R$ ${diff.toLocaleString()}:`;
            }
        }

        if (match) {
            updateRadar('found');
            state.currentMatch = match;
            showMatch(match, customMsg);
        } else {
            updateRadar('idle');
            alert("Nenhum modelo encontrado em Aracruz.");
        }
    }, 2500);
}

// --- EXIBIR RESULTADO ---
function showMatch(m, msg) {
    if (navigator.vibrate) navigator.vibrate([100, 50, 100]);

    document.getElementById('matchTitle').innerText = m.model;
    document.getElementById('matchSub').innerText = msg ? msg : `Vendedor em Aracruz • ${m.status}`;
    document.getElementById('q-trust').innerText = `${m.trustScore}%`;
    document.getElementById('q-rating').innerText = m.rating.toFixed(1);
    document.getElementById('q-sales').innerText = `+${m.sales}`;

    const btn = document.getElementById('matchBtn');
    btn.style.backgroundColor = m.kyc === 'none' ? "#64748b" : "#16a34a";
    btn.innerText = m.kyc === 'none' ? "SOLICITAR VERIFICAÇÃO" : "CONVERTER AGORA";

    document.getElementById('matchBar').classList.add('show');
}

// --- EVENTOS ---
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
    modal.classList.add('show');
};

document.getElementById('closeGallery').onclick = () => {
    document.getElementById('galleryModal').classList.remove('show');
};

window.onload = renderGrid;
