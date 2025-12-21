/**
 * RePhone V3 - Core Engine (Versão Ajustada aos IDs do HTML)
 */

(() => {
    // 1. Configurações e Mocks
    const PLACEHOLDER_IMG = "assets/phone-placeholder.svg";
    const brl = new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' });

    const MOCK_OFFERS = [
        { id: "o1", model: "iPhone 11", storage: "64GB", price: 1890, cond: "Usado", city: "Serra/ES", distKm: 55, distLabel: "Longe", verified: true, delivery: true, rating: 4.6, reviews: 92 },
        { id: "o2", model: "iPhone 12", storage: "64GB", price: 2500, cond: "Seminovo", city: "Vitória/ES", distKm: 48, distLabel: "Longe", verified: false, delivery: false, rating: 4.2, reviews: 18 },
        { id: "o3", model: "iPhone 13", storage: "128GB", price: 2900, cond: "Seminovo", city: "Aracruz/ES", distKm: 3, distLabel: "Muito perto", verified: true, delivery: false, rating: 4.9, reviews: 312 },
        { id: "o4", model: "Galaxy S23", storage: "256GB", price: 3499, cond: "Novo", city: "Linhares/ES", distKm: 78, distLabel: "Longe", verified: true, delivery: true, rating: 4.7, reviews: 89 },
        { id: "o5", model: "Moto G84", storage: "256GB", price: 1499, cond: "Novo", city: "Aracruz/ES", distKm: 6, distLabel: "Perto", verified: true, delivery: true, rating: 4.8, reviews: 204 }
    ];

    // 2. Seletores (Ajustados para o seu HTML)
    const offersGrid = document.getElementById('offersGrid');
    const modelInput = document.getElementById('modelInput');
    const priceInput = document.getElementById('priceInput');
    const buscarBtn = document.getElementById('buscarOpp'); // ID correto do seu HTML
    const radarPill = document.getElementById('radarPill');
    const matchBar = document.getElementById('matchBar');
    const matchTitle = document.getElementById('matchTitle');
    const matchSub = document.getElementById('matchSub');
    const matchProg = document.getElementById('matchProg');

    // 3. Renderização
    function renderOffers(list) {
        if(!offersGrid) return;
        offersGrid.innerHTML = list.map(o => `
            <div class="card" id="card-${o.id}">
                <div class="card-media">
                    <img src="${PLACEHOLDER_IMG}" alt="${o.model}" onerror="this.style.opacity=.2">
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
        `).join('');
    }

    // 4. Lógica do Radar
    function startRadar() {
        if (!modelInput.value || !priceInput.value) {
            alert("Por favor, preencha o modelo e o valor desejado.");
            return;
        }

        // Estado 1: Armado
        radarPill.classList.remove('state-idle');
        radarPill.classList.add('state-armed');
        matchTitle.innerText = "Buscando MATCH...";
        matchSub.innerText = "Analisando anúncios compatíveis...";
        matchBar.classList.add('show');
        if(matchProg) matchProg.style.width = "30%";

        // Estado 2: Scan (Piscar)
        setTimeout(() => {
            radarPill.classList.replace('state-armed', 'state-scan');
            if(matchProg) matchProg.style.width = "70%";
            matchSub.innerText = "Cruzando dados de vendedores seguros...";
        }, 3000);

        // Estado 3: Resultado
        setTimeout(() => {
            const match = MOCK_OFFERS[2]; // iPhone 13 (Simulação)
            showFinalMatch(match);
        }, 7000);
    }

    function showFinalMatch(offer) {
        document.body.classList.add('match-bar-open');
        matchTitle.innerText = `MATCH: ${offer.model}`;
        matchSub.innerText = `Oferta exclusiva por ${brl.format(offer.price)}`;
        if(matchProg) matchProg.style.width = "100%";
        
        // Esconder do grid (Exclusividade)
        const card = document.getElementById(`card-${offer.id}`);
        if (card) card.classList.add('hidden-by-match');

        // Ativar botão de ver MATCH
        const matchBtn = document.getElementById('matchBtn');
        if(matchBtn) {
            matchBtn.disabled = false;
            matchBtn.onclick = () => window.location.href = 'anuncio.html';
        }
    }

    // 5. Init
    document.addEventListener('DOMContentLoaded', () => {
        renderOffers(MOCK_OFFERS);

        if (buscarBtn) {
            buscarBtn.disabled = false; // Garante que o botão funciona
            buscarBtn.addEventListener('click', (e) => {
                e.preventDefault();
                startRadar();
            });
        }
        
        // Esconder label de carregando
        const loadingLabel = document.getElementById('loadingLabel');
        if(loadingLabel) loadingLabel.style.display = 'none';
    });
})();
