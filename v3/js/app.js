// RePhone V3 - Demo (static)
// - Formata valor em BRL conforme digita (aceita 1500, 1.500, 1.500,00)
// - Barra do MATCH: animação + resultado clicável em modal

const $ = (sel, root=document) => root.querySelector(sel);
const $$ = (sel, root=document) => Array.from(root.querySelectorAll(sel));

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
    image: "https://upload.wikimedia.org/wikipedia/commons/3/3a/IPhone_13_Pro_vector.svg"
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
    image: "https://upload.wikimedia.org/wikipedia/commons/3/3a/IPhone_12_vector.svg"
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
    image: "https://upload.wikimedia.org/wikipedia/commons/1/1d/Samsung_Galaxy_S23.png"
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
    image: "https://upload.wikimedia.org/wikipedia/commons/6/6b/IPhone_14_Pro_vector.svg"
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
    image: "https://upload.wikimedia.org/wikipedia/commons/f/fa/IPhone_11_vector.svg"
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
    image: "https://upload.wikimedia.org/wikipedia/commons/5/54/Moto_G84_5G.png"
  }
];

function formatBRL(value){
  return new Intl.NumberFormat("pt-BR", { style:"currency", currency:"BRL" }).format(value);
}

function parseBRLToNumber(raw){
  // Aceita: 1500 | 1.500 | 1.500,00 | R$ 1.500,00
  const s = String(raw || "").trim();
  if(!s) return null;

  // Mantém dígitos, vírgula e ponto
  const cleaned = s.replace(/[^0-9.,]/g, "");

  // Estratégia:
  // - Se tem vírgula: ela é decimal (pt-BR). Remove pontos (milhar).
  // - Se não tem vírgula e tem ponto: assume ponto como milhar (se múltiplos) ou decimal (se 1 e 2 casas).
  // - Se não tem nada: só número.
  if(cleaned.includes(",")){
    const normalized = cleaned.replace(/\./g, "").replace(",", ".");
    const n = Number(normalized);
    return Number.isFinite(n) ? n : null;
  }

  // Sem vírgula
  const parts = cleaned.split(".");
  if(parts.length === 1){
    const n = Number(parts[0]);
    return Number.isFinite(n) ? n : null;
  }

  if(parts.length === 2){
    // Se a parte final tiver 2 dígitos -> decimal, senão milhar
    if(parts[1].length === 2){
      const n = Number(parts[0] + "." + parts[1]);
      return Number.isFinite(n) ? n : null;
    }
    const n = Number(parts[0] + parts[1]); // milhar simples
    return Number.isFinite(n) ? n : null;
  }

  // Vários pontos: trata como separador de milhar
  const n = Number(parts.join(""));
  return Number.isFinite(n) ? n : null;
}

function normalizePriceInput(el){
  const raw = el.value;
  const n = parseBRLToNumber(raw);
  if(n === null){
    el.dataset.value = "";
    return;
  }
  el.dataset.value = String(n);
  // Mostra sempre em pt-BR (sem símbolo para ficar com "R$" fora)
  const formatted = new Intl.NumberFormat("pt-BR", { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(n);
  el.value = formatted;
}

function computeScore(offer, budget){
  // score simples (demo) para escolher o MATCH:
  // - preço: quanto mais perto do orçamento sem ultrapassar, melhor
  // - distância: perto melhora
  // - verificado e entrega ganham bônus
  const priceDiff = Math.abs(budget - offer.price);
  const priceScore = Math.max(0, 100 - (priceDiff / Math.max(1, budget)) * 100); // 0-100
  const distScore = Math.max(0, 100 - (offer.distanceKm / 5)); // 0-100 (até ~500km)
  const verifiedScore = offer.verified ? 10 : 0;
  const deliveryScore = offer.delivery ? 6 : 0;
  const ratingScore = (offer.rating || 0) * 2; // ~0-10
  return priceScore * 0.55 + distScore * 0.25 + ratingScore * 0.10 + verifiedScore + deliveryScore;
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

// ===== Render / Filters =====
const offersGrid = $("#offersGrid");
const loadingLabel = $("#loadingLabel");

let activeFilter = "all";
let activeQuery = "";

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

function render(){
  const visible = offers.filter(o => passesFilter(o) && passesSearch(o));
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

// ===== MATCH BAR =====
const priceInput = $("#priceInput");
const matchBar = $("#matchBar");
const matchTitle = $("#matchTitle");
const matchSub = $("#matchSub");
const matchBtn = $("#matchBtn");

const modalBackdrop = $("#matchModalBackdrop");
const modalBody = $("#matchModalBody");
const openOfferLink = $("#openOfferLink");
const closeMatchModal = $("#closeMatchModal");

let matchTimer = null;
let currentMatch = null;

function showMatchBar(){
  matchBar.classList.add("show");
  matchBar.setAttribute("aria-hidden","false");
}
function setSearching(){
  currentMatch = null;
  matchTitle.textContent = "Buscando MATCH…";
  matchSub.textContent = "Comparando preço, distância e segurança";
  matchBtn.disabled = true;
  matchBtn.textContent = "Ver MATCH";
  showMatchBar();
}
function setMatchFound(offer, score){
  currentMatch = offer;
  matchTitle.textContent = `MATCH encontrado: ${offer.title}`;
  matchSub.textContent = `${formatBRL(offer.price)} • ${offer.distanceLabel} • ${offer.verified ? "vendedor verificado" : "verificação pendente"} • ${Math.round(score)}% compatível`;
  matchBtn.disabled = false;
  matchBtn.textContent = "Ver MATCH";
  showMatchBar();

  // atenção extra: vibra (se disponível) + dá um "pulo" visual
  if(navigator.vibrate) navigator.vibrate([40, 30, 40]);
  matchBar.animate(
    [{ transform:"translateY(10px)", opacity:.6 }, { transform:"translateY(0px)", opacity:1 }],
    { duration: 220, easing:"ease-out" }
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

function chooseMatch(budget){
  // Regra: preferir ofertas <= orçamento. Se nada, pega a mais próxima acima.
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

function onPriceChanged(){
  if(matchTimer) clearTimeout(matchTimer);

  normalizePriceInput(priceInput);
  const budget = parseBRLToNumber(priceInput.value);

  if(!budget || budget <= 0){
    matchBar.classList.remove("show");
    matchBar.setAttribute("aria-hidden","true");
    return;
  }

  setSearching();

  // suspense: mostra busca por um tempo
  matchTimer = setTimeout(() => {
    const chosen = chooseMatch(budget);
    if(!chosen){ setNoMatch(); return; }
    const score = computeScore(chosen.o, budget);
    setMatchFound(chosen.o, score);
  }, 1100);
}

function initMatch(){
  priceInput.addEventListener("input", onPriceChanged);
  priceInput.addEventListener("blur", () => normalizePriceInput(priceInput));

  matchBtn.addEventListener("click", () => {
    if(!currentMatch) return;
    const budget = parseBRLToNumber(priceInput.value) || currentMatch.price;
    const score = computeScore(currentMatch, budget);
    openMatchModal(currentMatch, score);
  });

  closeMatchModal.addEventListener("click", closeModal);
  modalBackdrop.addEventListener("click", (e) => { if(e.target === modalBackdrop) closeModal(); });
  document.addEventListener("keydown", (e) => { if(e.key === "Escape" && modalBackdrop.classList.contains("show")) closeModal(); });
}

// ===== Boot =====
function boot(){
  // Simula carregamento
  setTimeout(() => {
    loadingLabel.textContent = "6 ofertas";
  }, 350);

  initFilters();
  initSearch();
  initMatch();
  render();
}

document.addEventListener("DOMContentLoaded", boot);
