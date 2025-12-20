// RePhone V3 - Demo (static)
// - Valor em BRL: digitação livre (sem travar cursor) + formata no blur
// - MATCH: suspense mais longo com etapas + quando encontra, remove o item da lista (exclusivo)

const $ = (sel, root=document) => root.querySelector(sel);
const $$ = (sel, root=document) => Array.from(root.querySelectorAll(sel));

/**
 * IMPORTANTE:
 * Agora as imagens são LOCAIS. Baixe e coloque em:
 * v3/assets/products/
 * com estes nomes (webp/png):
 * - iphone-13-128.webp
 * - iphone-12-64.webp
 * - galaxy-s23-256.webp
 * - iphone-14-pro-256.webp
 * - iphone-11-64.webp
 * - moto-g84-256.webp
 */
const offers = [
  {
    id: "iphone13-128",
    title: "iPhone 13 • 128GB",
    price: 2900.00,
    condition: "Seminovo",
    city: "Aracruz/ES",
    distanceKm: 3,
    distanceLabel: "Muito perto",
    verified: true,
    rating: 4.9,
    sales: 312,
    since: 2021,
    delivery: true,
    match: 92,
    compatibility: "Alta compatibilidade",
    image: "assets/products/iphone-13-128.webp"
  },
  {
    id: "iphone12-64",
    title: "iPhone 12 • 64GB",
    price: 2500.00,
    condition: "Seminovo",
    city: "Vitória/ES",
    distanceKm: 48,
    distanceLabel: "Longe",
    verified: false,
    rating: 4.2,
    sales: 18,
    since: 2024,
    delivery: false,
    match: 71,
    compatibility: "Boa compatibilidade",
    image: "assets/products/iphone-12-64.webp"
  },
  {
    id: "galaxy-s23-256",
    title: "Galaxy S23 • 256GB",
    price: 3499.00,
    condition: "Novo",
    city: "Linhares/ES",
    distanceKm: 78,
    distanceLabel: "Longe",
    verified: true,
    rating: 4.7,
    sales: 89,
    since: 2022,
    delivery: true,
    match: 84,
    compatibility: "Entrega disponível",
    image: "assets/products/galaxy-s23-256.webp"
  },
  {
    id: "iphone14pro-256",
    title: "iPhone 14 Pro • 256GB",
    price: 5290.00,
    condition: "Seminovo",
    city: "Rio de Janeiro/RJ",
    distanceKm: 410,
    distanceLabel: "Muito longe",
    verified: false,
    rating: 4.0,
    sales: 7,
    since: 2025,
    delivery: true,
    match: 58,
    compatibility: "Premium",
    image: "assets/products/iphone-14-pro-256.webp"
  },
  {
    id: "iphone11-64",
    title: "iPhone 11 • 64GB",
    price: 1890.00,
    condition: "Usado",
    city: "Serra/ES",
    distanceKm: 55,
    distanceLabel: "Longe",
    verified: true,
    rating: 4.6,
    sales: 41,
    since: 2023,
    delivery: true,
    match: 66,
    compatibility: "Bom custo-benefício",
    image: "assets/products/iphone-11-64.webp"
  },
  {
    id: "moto-g84-256",
    title: "Moto G84 • 256GB",
    price: 1499.00,
    condition: "Novo",
    city: "Aracruz/ES",
    distanceKm: 6,
    distanceLabel: "Perto",
    verified: true,
    rating: 4.8,
    sales: 204,
    since: 2020,
    delivery: true,
    match: 73,
    compatibility: "Entrega local",
    image: "assets/products/moto-g84-256.webp"
  }
];

function formatBRL(value){
  return new Intl.NumberFormat("pt-BR", { style:"currency", currency:"BRL" }).format(value);
}

/**
 * Aceita: 1500 | 1.500 | 1.500,00 | R$ 1.500,00 | 1500,5
 * Regra: vírgula decimal; ponto milhar.
 */
function parseBRLToNumber(raw){
  const s0 = String(raw || "").trim();
  if(!s0) return null;

  let s = s0.replace(/[^0-9.,]/g, "");
  if(!s) return null;

  if(s.includes(",")){
    s = s.replace(/\./g, "").replace(",", ".");
  } else if ((s.match(/\./g) || []).length === 1){
    const [a,b] = s.split(".");
    if((b || "").length === 2) s = a + "." + b;
    else s = a + b; // milhar
  } else {
    s = s.replace(/\./g, "");
  }

  const n = Number(s);
  return Number.isFinite(n) ? n : null;
}

// ===== UI: cards =====
const offersGrid = $("#offersGrid");
const loadingLabel = $("#loadingLabel");

let activeFilter = "all";
let activeQuery = "";

// item oculto (o que virou match)
let hiddenOfferId = null;

function passesFilter(offer){
  if(activeFilter === "near") return offer.distanceKm <= 10;
  if(activeFilter === "verified") return offer.verified;
  if(activeFilter === "delivery") return offer.delivery;
  return true;
}
function passesSearch(offer){
  if(!activeQuery) return true;
  const q = activeQuery;
  return offer.title.toLowerCase().includes(q) || offer.city.toLowerCase().includes(q);
}

function buildCard(offer){
  const verifiedPill = offer.verified
    ? '<span class="pill good">Verificado</span>'
    : '<span class="pill warn">Verificação pendente</span>';

  const distPill = offer.distanceLabel === "Muito perto"
    ? '<span class="pill good">Muito perto • ' + offer.distanceKm + 'km</span>'
    : (offer.distanceLabel === "Perto"
      ? '<span class="pill good">Perto • ' + offer.distanceKm + 'km</span>'
      : (offer.distanceLabel === "Muito longe"
        ? '<span class="pill neutral">Muito longe • ' + offer.distanceKm + 'km</span>'
        : '<span class="pill neutral">Longe • ' + offer.distanceKm + 'km</span>'
      )
    );

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
          <span>${offer.condition}</span>
          <span>•</span>
          <span>${offer.city}</span>
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
    .filter(o => o.id !== hiddenOfferId); // <-- exclusividade do MATCH

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

// ===== Valor (UX correto) =====
const priceInput = $("#priceInput");

// Enquanto digita: não formatar, só filtrar caracteres inválidos.
priceInput.addEventListener("input", () => {
  priceInput.value = priceInput.value.replace(/[^0-9.,]/g, "");
  scheduleMatch(); // atualiza match com debounce + suspense
});

// Ao sair do campo: formata padrão BRL
priceInput.addEventListener("blur", () => {
  const n = parseBRLToNumber(priceInput.value);
  if(n === null){
    priceInput.value = "";
    return;
  }
  priceInput.value = formatBRL(n);
});

// ===== MATCH BAR + MODAL =====
const matchBar = $("#matchBar");
const matchTitle = $("#matchTitle");
const matchSub = $("#matchSub");
const matchBtn = $("#matchBtn");

const modalBackdrop = $("#matchModalBackdrop");
const modalBody = $("#matchModalBody");
const openOfferLink = $("#openOfferLink");
const closeMatchModal = $("#closeMatchModal");

const MATCH_SUSPENSE_MS = 4200; // suspense total
const STAGES = [
  { t: 0,   title: "Buscando MATCH…", sub: "Validando o seu valor" },
  { t: 900, title: "Buscando MATCH…", sub: "Checando reputação e verificação" },
  { t: 1900,title: "Buscando MATCH…", sub: "Analisando distância e logística" },
  { t: 3000,title: "Buscando MATCH…", sub: "Comparando as melhores ofertas" }
];

let matchTimer = null;
let stageTimers = [];
let currentMatch = null;

function showMatchBar(){
  matchBar.classList.add("show");
  matchBar.setAttribute("aria-hidden","false");
}

function clearStageTimers(){
  stageTimers.forEach(id => clearTimeout(id));
  stageTimers = [];
}

function setSearching(){
  currentMatch = null;
  matchTitle.textContent = "Buscando MATCH…";
  matchSub.textContent = "Analisando sinais de segurança (alguns segundos)";
  matchBtn.disabled = true;
  matchBtn.textContent = "Aguardando…";
  showMatchBar();

  // Etapas (efeito suspense)
  clearStageTimers();
  STAGES.forEach(s => {
    stageTimers.push(setTimeout(() => {
      matchTitle.textContent = s.title;
      matchSub.textContent = s.sub;
    }, s.t));
  });
}

function setMatchFound(offer, score){
  currentMatch = offer;
  matchTitle.textContent = "MATCH encontrado";
  matchSub.textContent = `${offer.title} • ${formatBRL(offer.price)} • ${Math.round(score)}% compatível`;
  matchBtn.disabled = false;
  matchBtn.textContent = "Ver MATCH";
  showMatchBar();

  if(navigator.vibrate) navigator.vibrate([40, 30, 40]);
  matchBar.animate(
    [{ transform:"translateY(10px)", opacity:.6 }, { transform:"translateY(0px)", opacity:1 }],
    { duration: 240, easing:"ease-out" }
  );
}

function setNoMatch(){
  currentMatch = null;
  matchTitle.textContent = "Sem MATCH por enquanto";
  matchSub.textContent = "Tente ajustar o valor — a RePhone procura o melhor encaixe";
  matchBtn.disabled = true;
  matchBtn.textContent = "Sem match";
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
  // Regra: prioriza abaixo do orçamento; se não houver, tenta o mais próximo
  const below = offers.filter(o => o.price <= budget);
  const candidates = below.length ? below : offers.slice();

  const ranked = candidates
    .map(o => ({ o, score: computeScore(o, budget) }))
    .sort((a,b) => b.score - a.score);

  return ranked.length ? ranked[0] : null;
}

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
        <div style="margin-top:.55rem; color:rgba(15,23,42,.70); font-weight:650;">
          <strong>Exclusivo:</strong> este anúncio foi removido da lista e aparece apenas no MATCH.
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
  const budget = parseBRLToNumber(priceInput.value) || currentMatch.price;
  const score = computeScore(currentMatch, budget);
  openMatchModal(currentMatch, score);
});

closeMatchModal.addEventListener("click", closeModal);
modalBackdrop.addEventListener("click", (e) => { if(e.target === modalBackdrop) closeModal(); });
document.addEventListener("keydown", (e) => { if(e.key === "Escape" && modalBackdrop.classList.contains("show")) closeModal(); });

// Debounce: espera o usuário parar de digitar antes de iniciar suspense
let inputDebounce = null;

function scheduleMatch(){
  if(matchTimer) clearTimeout(matchTimer);
  clearStageTimers();

  const budget = parseBRLToNumber(priceInput.value);

  if(!budget || budget <= 0){
    currentMatch = null;
    hiddenOfferId = null;
    matchBar.classList.remove("show");
    matchBar.setAttribute("aria-hidden","true");
    render();
    return;
  }

  // sempre que o valor muda: devolve o item para a lista enquanto recalcula
  currentMatch = null;
  hiddenOfferId = null;
  render();

  if(inputDebounce) clearTimeout(inputDebounce);
  inputDebounce = setTimeout(() => {
    setSearching();

    matchTimer = setTimeout(() => {
      const chosen = chooseMatch(budget);

      if(!chosen || !chosen.o){
        hiddenOfferId = null;
        setNoMatch();
        render();
        return;
      }

      // define match e oculta item da lista
      currentMatch = chosen.o;
      hiddenOfferId = currentMatch.id;

      setMatchFound(currentMatch, chosen.score);
      render();

    }, MATCH_SUSPENSE_MS);

  }, 550);
}

// ===== Boot =====
function boot(){
  setTimeout(() => {
    loadingLabel.textContent = `${offers.length} ofertas`;
  }, 350);

  initFilters();
  initSearch();
  render();
}

document.addEventListener("DOMContentLoaded", boot);
