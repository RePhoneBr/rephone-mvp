const state = {
    userLoc: null,
    currentMatch: null,
    offers: [
        { id: 1, model: "iPhone 13 128GB", price: 3150, kyc: "premium", trustScore: 99, rating: 5.0, sales: 124, status: "Impecável", img: "https://m.media-amazon.com/images/I/71GLMJ7TQiL._AC_SL1500_.jpg" },
        { id: 2, model: "iPhone 13 Blue", price: 2900, kyc: "none", trustScore: 45, rating: 3.2, sales: 2, status: "Usado", img: "https://m.media-amazon.com/images/I/71xb2xkN5qL._AC_SL1500_.jpg" },
        { id: 3, model: "iPhone 14 Pro Max", price: 5200, kyc: "verified", trustScore: 88, rating: 4.7, sales: 45, status: "Vitrine", img: "https://m.media-amazon.com/images/I/61H79+y7E+L._AC_SL1500_.jpg" },
        { id: 4, model: "iPhone 11 64GB", price: 1650, kyc: "premium", trustScore: 97, rating: 4.9, sales: 89, status: "Loja", img: "https://m.media-amazon.com/images/I/71i2XhHU3pL._AC_SL1500_.jpg" },
        { id: 5, model: "iPhone 12 128GB", price: 2400, kyc: "verified", trustScore: 82, rating: 4.5, sales: 12, status: "Bom", img: "https://m.media-amazon.com/images/I/71fVoqRC0JL._AC_SL1500_.jpg" },
        { id: 6, model: "iPhone 14 128GB", price: 3900, kyc: "none", trustScore: 30, rating: 0.0, sales: 0, status: "Novo", img: "https://m.media-amazon.com/images/I/61bK6PMOC3L._AC_SL1500_.jpg" }
    ]
};

function renderGrid() {
    const grid = document.getElementById('offersGrid');
    grid.innerHTML = state.offers.map(off => `
        <div class="card">
            <div class="card-media">
                <span class="badge-kyc ${off.kyc}">${off.kyc === 'premium' ? '💎 Premium' : (off.kyc === 'verified' ? '✅ Verificado' : '⚠️ Pendente')}</span>
                <img src="${off.img}">
            </div>
            <div class="card-body" style="padding:15px">
                <h3>${off.model}</h3>
                <p style="color:var(--green); font-weight:800">R$ ${off.price.toLocaleString('pt-BR')}</p>
            </div>
        </div>
    `).join('');
}

function updateRadar(mode) {
    const pill = document.getElementById('radarPill');
    pill.className = mode === 'scanning' ? 'state-scanning' : (mode === 'found' ? 'state-found' : 'state-idle');
}

async function startRadar() {
    if(!document.getElementById('modelInput').value) return alert("O que busca?");
    updateRadar('scanning');
    navigator.geolocation.getCurrentPosition(() => {
        setTimeout(() => {
            updateRadar('found');
            state.currentMatch = state.offers[0];
            showMatch(state.currentMatch);
        }, 3000);
    }, () => { alert("Ative o GPS"); updateRadar('idle'); });
}

function showMatch(m) {
    const panel = document.getElementById('matchBar');
    
    // 1. Atualiza os textos principais (sai o "Buscando" e entra o modelo)
    document.getElementById('matchTitle').innerText = m.model;
    document.getElementById('matchSub').innerText = `Encontrado a 1.2km em Aracruz (${m.status})`;
    
    // 2. Atualiza os indicadores de qualidade com os dados do vendedor simulado
    document.getElementById('q-trust').innerText = `${m.trustScore}%`;
    document.getElementById('q-rating').innerText = m.rating.toFixed(1);
    document.getElementById('q-sales').innerText = `+${m.sales}`;
    
    // 3. Configura o botão de conversão (WhatsApp)
    const btnMatch = document.getElementById('matchBtn');
    if(m.kyc === 'none') {
        btnMatch.style.background = "#64748b";
        btnMatch.innerText = "SOLICITAR VERIFICAÇÃO";
    } else {
        btnMatch.style.background = "var(--green)";
        btnMatch.innerText = "CONVERTER AGORA";
    }
    
    btnMatch.onclick = () => {
        const msg = encodeURIComponent(`Olá! Vi o seu ${m.model} no RePhone por R$ ${m.price} e tenho interesse.`);
        window.open(`https://wa.me/5527999999999?text=${msg}`, '_blank');
    };

    // 4. Mostra o painel com animação
    panel.classList.add('show');
}
