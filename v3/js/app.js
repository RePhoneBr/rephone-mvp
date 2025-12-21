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

function renderGrid() {
    const grid = document.getElementById('offersGrid');
    if(!grid) return;
    grid.innerHTML = state.offers.map(off => `
        <div class="card">
            <div class="card-media"><img src="${off.img}"></div>
            <div class="card-body" style="padding:15px">
                <h3 style="font-size:15px; margin-bottom:5px">${off.model}</h3>
                <p style="color:var(--green); font-weight:800; font-size:18px">R$ ${off.price.toLocaleString('pt-BR')}</p>
                <small style="color:#94a3b8">📍 Aracruz</small>
            </div>
        </div>
    `).join('');
}

function updateRadar(mode) {
    const pill = document.getElementById('radarPill');
    if(!pill) return;
    pill.className = mode === 'scanning' ? 'state-scanning' : (mode === 'found' ? 'state-found' : 'state-idle');
}

async function startRadar() {
    const modelSearch = document.getElementById('modelInput').value;
    if(!modelSearch) return alert("Digite o modelo que busca!");

    updateRadar('scanning');

    setTimeout(() => {
        updateRadar('found');
        // Seleciona o primeiro vendedor como match padrão para o teste
        state.currentMatch = state.offers[0];
        showMatch(state.currentMatch);
    }, 3000);
}

function showMatch(m) {
    // Injeta os dados nos campos
    document.getElementById('matchTitle').innerText = m.model;
    document.getElementById('matchSub').innerText = `Vendedor em Aracruz • ${m.status}`;
    document.getElementById('q-trust').innerText = `${m.trustScore}%`;
    document.getElementById('q-rating').innerText = m.rating.toFixed(1);
    document.getElementById('q-sales').innerText = `+${m.sales}`;

    const btn = document.getElementById('matchBtn');
    if(m.kyc === 'none') {
        btn.style.backgroundColor = "#64748b";
        btn.innerText = "SOLICITAR VERIFICAÇÃO";
    } else {
        btn.style.backgroundColor = "#16a34a";
        btn.innerText = "CONVERTER AGORA";
    }

    document.getElementById('matchBar').classList.add('show');
}

// BOTÃO FECHAR (X) - Reset total do radar e painel
document.getElementById('closeMatch').onclick = function() {
    document.getElementById('matchBar').classList.remove('show');
    setTimeout(() => {
        updateRadar('idle');
    }, 400);
};

// GALERIA
document.getElementById('viewDetails').onclick = () => {
    if(!state.currentMatch) return;
    const modal = document.getElementById('galleryModal');
    document.getElementById('galleryImg').src = state.currentMatch.img;
    document.getElementById('galleryTitle').innerText = state.currentMatch.model;
    document.getElementById('galleryPrice').innerText = `R$ ${state.currentMatch.price.toLocaleString('pt-BR')}`;
    document.getElementById('galleryTags').innerHTML = `<span class="tag">Bateria 92%</span><span class="tag">📍 Aracruz</span>`;
    modal.classList.add('show');
};

document.getElementById('closeGallery').onclick = () => {
    document.getElementById('galleryModal').classList.remove('show');
};

document.getElementById('btnSearch').onclick = startRadar;
window.onload = renderGrid;
function showMatch(m) {
    // 1. Feedback Tátil (Vibra o celular ao encontrar o match)
    if (navigator.vibrate) {
        navigator.vibrate([100, 50, 100]); // Vibração dupla curta
    }

    // 2. Injeta os dados nos campos
    document.getElementById('matchTitle').innerText = m.model;
    document.getElementById('matchSub').innerText = `Vendedor em Aracruz • ${m.status}`;
    document.getElementById('q-trust').innerText = `${m.trustScore}%`;
    document.getElementById('q-rating').innerText = m.rating.toFixed(1);
    document.getElementById('q-sales').innerText = `+${m.sales}`;

    const btn = document.getElementById('matchBtn');
    
    // 3. Configura a ação do botão baseada no vendedor
    if(m.kyc === 'none') {
        btn.style.backgroundColor = "#64748b";
        btn.innerText = "SOLICITAR VERIFICAÇÃO";
        btn.onclick = () => alert("Sua solicitação de verificação para este vendedor foi enviada à equipe RePhone!");
    } else {
        btn.style.backgroundColor = "#16a34a";
        btn.innerText = "CONVERTER AGORA";
        btn.onclick = () => {
            const mensagem = encodeURIComponent(`Olá! Vi o seu ${m.model} no RP MATCH por R$ ${m.price} e tenho interesse. Podemos conversar?`);
            window.open(`https://wa.me/5527999999999?text=${mensagem}`, '_blank'); // Altere para o seu número de teste
        };
    }

    document.getElementById('matchBar').classList.add('show');
}
