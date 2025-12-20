// RePhone V3 — Correções:
// 1) Campo de valor: NÃO formata durante a digitação (não trava / não pula cursor). Formata só no blur.
// 2) MATCH: suspense com etapas + duração maior.
// 3) Ao encontrar MATCH: oculta o anúncio correspondente na lista (exclusivo).

const $ = (sel, root=document) => root.querySelector(sel);
const $$ = (sel, root=document) => Array.from(root.querySelectorAll(sel));

const offers = [
  { id:"iphone13-128", title:"iPhone 13 • 128GB", price:2900.00, condition:"Seminovo", city:"Aracruz/ES", distanceKm:3,  distanceLabel:"Muito perto", verified:true,  rating:4.9, sales:312, since:2021, delivery:true,  match:92, compatibility:"Alta compatibilidade", image:"assets/products/iphone-13-128.webp" },
  { id:"iphone12-64",  title:"iPhone 12 • 64GB",  price:2500.00, condition:"Seminovo", city:"Vitória/ES", distanceKm:48, distanceLabel:"Longe",      verified:false, rating:4.2, sales:18,  since:2024, delivery:false, match:71, compatibility:"Boa compatibilidade", image:"assets/products/iphone-12-64.webp" },
  { id:"galaxy-s23-256", title:"Galaxy S23 • 256GB", price:3499.00, condition:"Novo", city:"Linhares/ES", distanceKm:78, distanceLabel:"Longe", verified:true, rating:4.7, sales:89, since:2022, delivery:true, match:84, compatibility:"Entrega disponível", image:"assets/products/galaxy-s23-256.webp" },
  { id:"iphone14pro-256", title:"iPhone 14 Pro • 256GB", price:5290.00, condition:"Seminovo", city:"Rio de Janeiro/RJ", distanceKm:410, distanceLabel:"Muito longe", verified:false, rating:4.0, sales:7, since:2025, delivery:true, match:58, compatibility:"Premium", image:"assets/products/iphone-14-pro-256.webp" },
  { id:"iphone11-64", title:"iPhone 11 • 64GB", price:1890.00, condition:"Usado", city:"Serra/ES", distanceKm:55, distanceLabel:"Longe", verified:true, rating:4.6, sales:41, since:2023, delivery:true, match:66, compatibility:"Bom custo-benefício", image:"assets/products/iphone-11-64.webp" },
  { id:"moto-g84-256", title:"Moto G84 • 256GB", price:1499.00, condition:"Novo", city:"Aracruz/ES", distanceKm:6, distanceLabel:"Perto", verified:true, rating:4.8, sales:204, since:2020, delivery:true, match:73, compatibility:"Entrega local", image:"assets/products/moto-g84-256.webp" },
];

// ===== Util BRL =====
function formatBRL(value){
  return new Intl.NumberFormat("pt-BR", { style:"currency", currency:"BRL" }).format(value);
}

// Aceita: 2500 | 2.500 | 2.500,00 | R$ 2.500,00
function parseBRLToNumber(raw){
  if(raw === null || raw === undefined) return null;
  let s = String(raw).trim();
  if(!s) return null;

  // remove tudo exceto dígitos, ponto e vírgula
  s = s.replace(/[^0-9.,]/g, "");
  if(!s) return null;

  // Se tem vírgula, vírgula é decimal e ponto é milhar
  if(s.includes(",")){
    s = s.replace(/\./g, ""); // remove milhares
    s = s.replace(",", "."); // decimal
  } else {
    // sem vírgula
    const dots = (s.match(/\./g) || []).length;
    if(dots === 1){
      const parts = s.split(".");
      const last = parts[1] || "";
      // se tiver 2 dígitos após o ponto, trata como decimal (1500.50)
      if(last.length === 2){
        s = parts[0] + "." + last;
      } else {
        // senão, ponto é milhar
        s = parts[0] + last;
      }
    } else if(dots > 1){
      // muitos pontos => milhares
      s = s.replace(/\./g, "");
    }
  }

  const n = Number(s);
  return Number.isFinite(n) ? n : null;
}

function formatPtNumber(n){
  return new Intl.NumberFormat("pt-BR", { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(n);
}

// ===== Render / Filters =====
const offersGrid = $("#offersGrid");
const loadingLabel = $("#loadingLabel");

let activeFilter = "all";
let activeQuery = "";

// Quando existe MATCH, removemos esse item do grid (exclusivo)
let hiddenOfferId = null;

function passesFilter(offer){
  if(activeFilter === "near") return offer.distanceKm <= 10;
  if(activeFilter === "verified") return offer.verified;
  if(activeFilter === "delivery") return offer.delivery;
  return true;
}
function passesSearch(offer){
  if(!activeQuery) return true;
  return offer.title.toLowerCase().includes(activeQuery) || offer.city.toLowerCase().includes(activeQuery);
}

function buildCard(offer){
  const verifiedPill = offer.verified
    ? '<span class="pill good">Verificado</span>'
    : '<span class="pill warn">Verificação pendente</span>';

  const distPill =
    offer.distanceLabel === "Muito perto" ? `<span class="pill good">Muito perto • ${offer.distanceKm}km</span>` :
    offer.distanceLabel === "Perto" ? `<span class="pill good">Perto • ${offer.distanceKm}km</span>` :
    offer.distanceLabel === "Muito longe" ? `<span class="pill neutral">Muito longe • ${offer.distanceKm}km</span>` :
    `<span class="pill neutral">Longe • ${offer.distanceKm}km</span>`;

  const deliveryPill = offer.delivery ? '<span class="pill good">Entrega</span>' : '<span class="pill neutral">Retirada</span>';

  return `
    <a class="card" href="anuncio.html?id=${encodeURIComponent(offer.id)}" data-offer-id="${offer.id}">
      <div class="card-media">
        <img src="${offer.image}" alt="${offer.title}" loading="lazy" />
      </div>
      <div class="card-body">
        <div class="title">${offer.title}</div>
        <div class="price">${formatBRL(offer.price)}</div>

        <div class="meta">
          <span>${offer.condition}</span><span>•</span><span>${offer.city}</span>
        </div>

        <div class="meta">
          ${distPill}
          ${verifiedPill}
          ${deliveryPill}
        </div>

        <div class="details">
          <div><strong>${offer.match}%</strong> Match • <small>${offer.compatibility}</small></div>
          <div>★ ${offer.rating.toFixed(1)} • ${offer.sales} vendas • desde ${offer.since}</div>
        </div>
      </div>
    </a>
  `;
}

function render(){
  const visible = offers
    .filter(o => passesFilter(o) && passesSearch(o))
    .filter(o => o.id !== hiddenOfferId);

  offersGrid.innerHTML = visible.map(buildCard).join("");
  loadingLabel.textContent = visible.length ? `${visible.length} ofertas` : "Nenhuma oferta encontrada";
}

function initFilters(){
  $$(".chip").forEach(btn => {
    btn.addEventListener("click", () => {
      $$(".chip").forEach(b => b.classList.remove("active"));
      btn.classList.add("active");
      activeFilter = btn.dataset.filter;
      render();
    });
  });
}

function initSearch(){
  const search = $("#searchInput");
  search.addEventListener("input", () => {
    activeQuery = search.value.trim().toLowerCase();
    render();
  });
}

// ===== Campo de valor (corrigido) =====
const priceInput = $("#priceInput");

// Enquanto digita: só filtra caracteres. Não formata e não “pula”.
priceInput.addEventListener("input", () => {
  const before = priceInput.value;
  const cleaned = before.replace(/[^0-9.,]/g, "");
  if(cleaned !== before) priceInput.value = cleaned;

  // guarda valor numérico (se der para interpretar)
  const n = parseBRLToNumber(priceInput.value);
  priceInput.dataset.value = (n === null) ? "" : String(n);

  // MATCH será disparado por debounce (abaixo)
  scheduleMatch();
});

// Ao sair do campo: padroniza visualmente
priceInput.addEventListener("blur", () => {
  const n = parseBRLToNumber(priceInput.value);
  if(n === null){
    priceInput.value = "";
    priceInput.dataset.value = "";
    return;
  }
  priceInput.dataset.value = String(n);
  priceInput.value = formatPtNumber(n); // sem "R$" porque já existe prefixo
});

// ===== MATCH BAR (suspense por etapas) =====
const matchBar = $("#matchBar");
const matchTitle = $("#matchTitle");
const matchSub = $("#matchSub");
const matchBtn = $("#matchBtn");
const radarPill = $("#radarPill");
const matchProg = $("#matchProg");

const modalBackdrop = $("#matchModalBackdrop");
const modalBody = $("#matchModalBody");
const openOfferLink = $("#openOfferLink");
const closeMatchModal = $("#closeMatchModal");

const MATCH_SUSPENSE_MS = 4200;
const MATCH_DEBOUNCE_MS = 650;
// NOVO: comportamento do Radar/MATCH
const SILENT_AFTER_INPUT_MS = 5000; // 5s invisível após parar de digitar
const RADAR_VISIBLE_MS = 10000;     // 10s com RP Radar no canto antes do resultado
let silentTimer = null;
let radarTimer = null;

let matchDebounceTimer = null;
let matchTimer = null;
let stageTimer = null;
let currentMatch = null;

function showMatchBar(){
  matchBar.classList.add("show");
  matchBar.setAttribute("aria-hidden","false");
}
function hideMatchBar(){
  matchBar.classList.remove("show");
  matchBar.setAttribute("aria-hidden","true");
}


function showRadarPill(){
  if(!radarPill) return;
  radarPill.classList.add("show");
  radarPill.setAttribute("aria-hidden","false");
}
function hideRadarPill(){
  if(!radarPill) return;
  radarPill.classList.remove("show");
  radarPill.setAttribute("aria-hidden","true");
}
function cancelRadarFlow(){
  if(silentTimer){ clearTimeout(silentTimer); silentTimer = null; }
  if(radarTimer){ clearTimeout(radarTimer); radarTimer = null; }
  hideRadarPill();
}

function resetProgress(){
  matchProg.style.width = "0%";
}

function setSearching(){
  currentMatch = null;
  matchBtn.disabled = true;
  matchBtn.textContent = "Aguardando…";
  matchTitle.textContent = "Buscando MATCH…";
  matchSub.textContent = "Iniciando análise";
  resetProgress();
  showMatchBar();
}

function setNoMatch(){
  currentMatch = null;
  matchBtn.disabled = true;
  matchBtn.textContent = "Radar ativo";
  matchTitle.textContent = "RP Radar monitorando";
  matchSub.textContent = "A RePhone vai avisar assim que surgir uma oportunidade compatível. Você pode ajustar o valor se quiser.";
  matchProg.style.width = "100%";
  showMatchBar();
}

function setMatchFound(offer, score){
  currentMatch = offer;
  matchTitle.textContent = `MATCH encontrado: ${offer.title}`;
  matchSub.textContent = `${formatBRL(offer.price)} • ${offer.distanceLabel} • ${offer.verified ? "vendedor verificado" : "verificação pendente"} • ${Math.round(score)}% compatível`;
  matchBtn.disabled = false;
  matchBtn.textContent = "Ver MATCH";
  matchProg.style.width = "100%";
  showMatchBar();
}

function computeScore(offer, budget){
  const priceDiff = Math.abs(budget - offer.price);
  const priceScore = Math.max(0, 100 - (priceDiff / Math.max(1, budget)) * 100);
  const distScore = Math.max(0, 100 - (offer.distanceKm / 5));
  const verifiedScore = offer.verified ? 10 : 0;
  const deliveryScore = offer.delivery ? 6 : 0;
  const ratingScore = (offer.rating || 0) * 2;
  return priceScore * 0.55 + distScore * 0.25 + ratingScore * 0.10 + verifiedScore + deliveryScore;
}

function chooseMatch(budget){
  const below = offers.filter(o => o.price <= budget);
  const candidates = below.length ? below : offers.slice();

  const ranked = candidates
    .map(o => ({ o, score: computeScore(o, budget) }))
    .sort((a,b) => b.score - a.score);

  return ranked.length ? ranked[0] : null;
}

function runStages(totalMs){
  const stages = [
    { t: 0.10, sub: "Validando o seu valor" },
    { t: 0.35, sub: "Checando reputação e verificação" },
    { t: 0.62, sub: "Analisando distância e logística" },
    { t: 0.85, sub: "Comparando as melhores ofertas" },
  ];
  let idx = 0;
  const started = Date.now();

  clearInterval(stageTimer);
  stageTimer = setInterval(() => {
    const elapsed = Date.now() - started;
    const progress = Math.min(0.98, elapsed / totalMs);
    matchProg.style.width = `${Math.round(progress * 100)}%`;

    // Atualiza texto de etapa
    while(idx < stages.length && progress >= stages[idx].t){
      matchSub.textContent = stages[idx].sub;
      idx++;
    }

    if(elapsed >= totalMs){
      clearInterval(stageTimer);
    }
  }, 120);
}

function scheduleMatch(){
  if(matchDebounceTimer) clearTimeout(matchDebounceTimer);
  // Enquanto o usuário digita, nada aparece.
  // Quando ele para, esperamos 5s invisível; depois mostramos o RP Radar por 10s; só então exibimos o resultado do MATCH.
  matchDebounceTimer = setTimeout(() => {
    cancelRadarFlow();
    // Se não há orçamento válido, volta ao estado inicial
    const budget = Number(priceInput.dataset.value || 0);
    if(!budget || budget <= 0){
      currentMatch = null;
      hiddenOfferId = null;
      hideMatchBar();
      render();
      return;
    }
    // some qualquer barra durante o tempo invisível
    hideMatchBar();
    // 5s invisível
    silentTimer = setTimeout(() => {
      // 10s de radar discreto
      showRadarPill();
      radarTimer = setTimeout(() => {
        hideRadarPill();
        // agora sim, decide o match e mostra a barra de resultado
        startMatch();
      }, RADAR_VISIBLE_MS);
    }, SILENT_AFTER_INPUT_MS);
  }, MATCH_DEBOUNCE_MS);
}

function startMatch(){
  if(matchTimer) clearTimeout(matchTimer);
  clearInterval(stageTimer);

  const budget = Number(priceInput.dataset.value || 0);

  if(!budget || budget <= 0){
    // sem valor => volta tudo
    currentMatch = null;
    hiddenOfferId = null;
    hideMatchBar();
    render();
    return;
  }

  // Mudou o valor => devolve lista (o match pode mudar)
  currentMatch = null;
  hiddenOfferId = null;
  render();

  setSearching();
  // Suspense visual já aconteceu no RP Radar (10s). Agora mostramos o resultado imediatamente.
  const chosen = chooseMatch(budget);
    if(!chosen || !chosen.o){
      hiddenOfferId = null;
      setNoMatch();
      render();
      return;
    }

    const score = chosen.score;

    // Exclusivo: remove do grid
    currentMatch = chosen.o;
    hiddenOfferId = currentMatch.id;

    setMatchFound(currentMatch, score);
    render();

}

// Modal
function openMatchModal(offer, score){
  modalBody.innerHTML = `
    <div style="display:flex; gap:1rem; align-items:flex-start; flex-wrap:wrap;">
      <div style="flex:0 0 160px;">
        <div style="border:1px solid rgba(15,23,42,.10); border-radius:18px; padding:.75rem; background:rgba(15,23,42,.02); display:grid; place-items:center;">
          <img src="${offer.image}" alt="${offer.title}" style="max-width:100%; max-height:140px; object-fit:contain;" />
        </div>
      </div>
      <div style="flex:1; min-width:220px;">
        <div style="font-weight:950; letter-spacing:-.02em; font-size:1.15rem;">${offer.title}</div>
        <div style="margin-top:.35rem; font-weight:950; font-size:1.25rem;">${formatBRL(offer.price)}</div>
        <div style="margin-top:.55rem; color:rgba(15,23,42,.78); font-weight:650;">
          ${offer.condition} • ${offer.city} • ${offer.distanceLabel} (${offer.distanceKm}km)
        </div>
        <div style="margin-top:.6rem; display:flex; gap:.5rem; flex-wrap:wrap;">
          <span class="pill ${offer.verified ? "good" : "warn"}">${offer.verified ? "Verificado" : "Verificação pendente"}</span>
          <span class="pill ${offer.delivery ? "good" : "neutral"}">${offer.delivery ? "Entrega" : "Retirada"}</span>
          <span class="pill good">MATCH ${offer.match}%</span>
          <span class="pill neutral">★ ${offer.rating.toFixed(1)} • ${offer.sales} vendas</span>
        </div>
        <div style="margin-top:.75rem; color:var(--muted); font-weight:700;">
          Compatibilidade estimada: <strong>${Math.round(score)}%</strong> (demo)
        </div>
      </div>
    </div>
  `;

  openOfferLink.href = `anuncio.html?id=${encodeURIComponent(offer.id)}`;
  modalBackdrop.classList.add("show");
  modalBackdrop.setAttribute("aria-hidden","false");
  document.body.style.overflow = "hidden";
}
function closeModal(){
  modalBackdrop.classList.remove("show");
  modalBackdrop.setAttribute("aria-hidden","true");
  document.body.style.overflow = "";
}

matchBtn.addEventListener("click", () => {
  if(!currentMatch) return;
  const budget = Number(priceInput.dataset.value || currentMatch.price);
  const score = computeScore(currentMatch, budget);
  openMatchModal(currentMatch, score);
});

closeMatchModal.addEventListener("click", closeModal);
modalBackdrop.addEventListener("click", (e) => { if(e.target === modalBackdrop) closeModal(); });
document.addEventListener("keydown", (e) => { if(e.key === "Escape" && modalBackdrop.classList.contains("show")) closeModal(); });

// Boot
function boot(){
  setTimeout(() => { loadingLabel.textContent = `${offers.length} ofertas`; }, 250);
  initFilters();
  initSearch();
  render();
}
document.addEventListener("DOMContentLoaded", boot);


// Clicar no RP Radar mostra uma mensagem discreta (sem resultado)
if(radarPill){
  radarPill.addEventListener("click", () => {
    showMatchBar();
    matchTitle.textContent = "RP Radar monitorando";
    matchSub.textContent = "Aguardando uma oportunidade compatível…";
    matchBtn.disabled = true;
    matchBtn.textContent = "Aguardando";
    matchProg.style.width = "35%";
  });
}
