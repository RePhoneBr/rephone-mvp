/**
 * RePhone V3 - Core Engine
 * Versão Corrigida: Sincronização de Classes e Exclusividade
 */

// 1. Configurações e Mocks
const PLACEHOLDER_IMG = "https://www.apple.com/v/iphone/home/bu/images/overview/select/iphone_15_pro__dqll89m6at6a_xlarge.jpg";
const brl = new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' });

// Gerador de ofertas falsas (Simulando Banco de Dados)
const MOCK_OFFERS = [
    { id: 101, model: "iPhone 13", storage: "128GB", price: 3100, cond: "Excelente", city: "São Paulo", distKm: 4, distLabel: "Perto de você", verified: true, delivery: true, premium: true, rating: 4.9, reviews: 128 },
    { id: 102, model: "iPhone 14", storage: "128GB", price: 4200, cond: "Como novo", city: "Rio de Janeiro", distKm: 12, distLabel: "Barra da Tijuca", verified: true, delivery: true, premium: false, rating: 4.7, reviews: 54 },
    { id: 103, model: "iPhone 11", storage: "64GB", price: 1850, cond: "Bom", city: "Curitiba", distKm: 8, distLabel: "Centro", verified: false, delivery: true, premium: false, rating: 4.5, reviews: 210 },
    { id: 104, model: "iPhone 13 Pro", storage: "256GB", price: 4800, cond: "Excelente", city: "Belo Horizonte", distKm: 15, distLabel: "Savassi", verified: true, delivery: false, premium: true, rating: 5.0, reviews: 42 },
    { id: 105, model: "iPhone 12", storage: "128GB", price: 2750, cond: "Excelente", city: "São Paulo", distKm: 2, distLabel: "Jardins", verified: true, delivery: true, premium: false, rating: 4.8, reviews: 89 }
];

// 2. Seletores
const searchInput = document.getElementById('searchInput');
const priceInput = document.getElementById('priceInput');
const btnSearch = document.getElementById('btnSearch');
const offersGrid = document.getElementById('offersGrid');
const radarPill = document.getElementById('radarPill');
const matchBar = document.getElementById('matchBar');
const matchTitle = document.getElementById('matchTitle');
const matchSub = document.getElementById('matchSub');

// 3. Funções de Renderização
function renderOffers(list) {
    offersGrid.innerHTML = list.map(o => offerCardHTML(o)).join('');
}

function offerCardHTML(o) {
    // CORREÇÃO: Usando 'card-media' para bater com o CSS
    return `
      <div class="card" id="card-${o.id}">
        <div class="card-media">
          <img src="${PLACEHOLDER_IMG}" alt="${o.model}">
        </div>
        <div class="card-body">
          <div class="meta">${o.city} • ${o.distKm}km</div>
          <div class="title">${o.model} ${o.storage}</div>
          <div class="price">${brl.format(o.price)}</div>
          <div class="chips">
            <span class="chip">${o.cond}</span>
            <span class="chip">⭐ ${o.rating}</span>
            ${o.verified ? '<span class="chip">🛡️ Verificado</span>' : ''}
          </div>
        </div>
      </div>
    `;
}

// 4. Lógica do Radar e Match
function runRadarSequence() {
    if (!searchInput.value) return alert("Digite um modelo primeiro!");

    // Passo 1: Armar o Radar
    radarPill.classList.remove('state-idle');
    radarPill.classList.add('state-armed');
    radarPill.querySelector('.rp').innerText = "BUSCANDO...";

    // Passo 2: Iniciar Scan (Animação) após 2 segundos
    setTimeout(() => {
        radarPill.classList.replace('state-armed', 'state-scan');
        
        // Passo 3: Encontrar o Match após 5 segundos de scan
        setTimeout(() => {
            const bestOffer = MOCK_OFFERS[0]; // Simula que a primeira é a melhor
            showMatch(bestOffer);
        }, 5000);

    }, 2000);
}

function showMatch(offer) {
    // Adiciona classe ao body para subir o radar e dar padding
    document.body.classList.add('match-bar-open');

    // Preenche a barra de Match
    matchTitle.innerText = `MATCH: ${offer.model} ${offer.storage}`;
    matchSub.innerText = `Melhor preço encontrado: ${brl.format(offer.price)} em ${offer.city}`;
    
    // Mostra a barra
    matchBar.classList.add('show');

    // Lógica de Exclusividade: Esconde o card original do grid
    const originalCard = document.getElementById(`card-${offer.id}`);
    if (originalCard) {
        originalCard.classList.add('hidden-by-match');
    }

    // Reseta o Radar
    radarPill.classList.remove('state-scan');
    radarPill.classList.add('state-armed');
    radarPill.querySelector('.rp').innerText = "OFERTA\nUNICA!";
}

// 5. Inicialização e Eventos
document.addEventListener('DOMContentLoaded', () => {
    renderOffers(MOCK_OFFERS);

    btnSearch.addEventListener('click', () => {
        runRadarSequence();
    });

    // Filtro simples por preço enquanto digita
    priceInput.addEventListener('input', (e) => {
        const maxPrice = parseFloat(e.target.value) || 99999;
        const filtered = MOCK_OFFERS.filter(o => o.price <= maxPrice);
        renderOffers(filtered);
    });
});
