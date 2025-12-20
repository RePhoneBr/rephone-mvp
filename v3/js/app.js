/* RePhone V3 — anúncios simulados + filtros + imagens externas com fallback */

const $ = (sel, root=document) => root.querySelector(sel);
const $$ = (sel, root=document) => Array.from(root.querySelectorAll(sel));

const grid = $("#resultsGrid");
const emptyState = $("#emptyState");
const resultsMeta = $("#resultsMeta");

const searchInput = $("#searchInput");
const priceInput = $("#priceInput");
const filterButtons = $$(".chip");

const IMAGE_PROVIDER = "unsplash"; // "unsplash" | "loremflickr"

function formatBRL(value){
  try{
    return value.toLocaleString("pt-BR", { style:"currency", currency:"BRL" });
  } catch {
    return `R$ ${value}`;
  }
}
function clamp(n, min, max){ return Math.max(min, Math.min(max, n)); }

function parsePriceInput(str){
  const cleaned = String(str || "")
    .replace(/[^\d,\.]/g, "")
    .replace(/\./g, "")
    .replace(",", ".");
  const num = Number(cleaned);
  return Number.isFinite(num) ? num : null;
}

function distanceLabel(km){
  if(km <= 10) return "Muito perto";
  if(km <= 60) return "Longe";
  return "Muito longe";
}

/* Score simples para simular o MATCH */
function computeMatchScore(ad, userBudget){
  let score = 50;

  if(ad.distanceKm <= 10) score += 20;
  else if(ad.distanceKm <= 60) score += 10;

  score += ad.verified ? 15 : 0;
  score += ad.delivery ? 8 : 0;

  if(userBudget && userBudget > 0){
    const diff = ad.price - userBudget;
    if(diff <= 0) score += 12;
    else score -= clamp(Math.round(diff / userBudget * 30), 5, 30);
  }

  score += Math.round((ad.rating - 3.5) * 10);
  score += ad.premium ? 5 : 0;

  return clamp(score, 0, 100);
}

/* ====== IMAGENS (link direto pela internet via query) ====== */
/* Observação: isso puxa imagens "livres" por busca — não garante modelo exato sempre. */
function toQuery(title){
  return encodeURIComponent(
    title
      .replace(/•/g, " ")
      .replace(/\s+/g, " ")
      .trim()
      .toLowerCase()
  );
}

function getProductImageUrl(title){
  const q = toQuery(title + " smartphone");
  // 1) Unsplash Source (retorna direto um JPG)
  if(IMAGE_PROVIDER === "unsplash"){
    // "source.unsplash.com" costuma funcionar bem em hotlink
    return `https://source.unsplash.com/featured/800x600?${q}`;
  }
  // 2) LoremFlickr (alternativa)
  return `https://loremflickr.com/800/600/${q}`;
}

/* fallback inline (SVG data URI) — nunca fica “quebrado” */
function fallbackSvg(title){
  const safe = String(title || "RePhone").replace(/</g,"").replace(/>/g,"");
  const svg =
`<svg xmlns="http://www.w3.org/2000/svg" width="800" height="600">
  <defs>
    <linearGradient id="g" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0" stop-color="#0b3d2e" stop-opacity="0.15"/>
      <stop offset="1" stop-color="#16a34a" stop-opacity="0.12"/>
    </linearGradient>
  </defs>
  <rect width="100%" height="100%" fill="url(#g)"/>
  <circle cx="660" cy="-10" r="220" fill="#16a34a" opacity="0.14"/>
  <circle cx="140" cy="640" r="260" fill="#0b3d2e" opacity="0.10"/>
  <text x="40" y="90" font-family="Arial, Helvetica, sans-serif" font-size="34" fill="#0f172a" opacity="0.75">RePhone</text>
  <text x="40" y="140" font-family="Arial, Helvetica, sans-serif" font-size="26" fill="#0f172a" opacity="0.65">${safe}</text>
  <text x="40" y="190" font-family="Arial, Helvetica, sans-serif" font-size="18" fill="#0f172a" opacity="0.45">Imagem ilustrativa • MVP</text>
</svg>`;
  return "data:image/svg+xml;charset=utf-8," + encodeURIComponent(svg);
}

/* ====== Dataset simulado ====== */
const ADS = [
  { id:"a1",  title:"iPhone 13 • 128GB",        price:2900, distanceKm:3,   delivery:true,  verified:true,  rating:4.9, premium:true,  condition:"Seminovo", compatibility:"Alta compatibilidade" },
  { id:"a2",  title:"iPhone 12 • 64GB",         price:2500, distanceKm:48,  delivery:false, verified:false, rating:4.2, premium:false, condition:"Seminovo", compatibility:"Boa compatibilidade" },
  { id:"a3",  title:"Galaxy S23 • 256GB",       price:3499, distanceKm:78,  delivery:true,  verified:true,  rating:4.7, premium:false, condition:"Novo",     compatibility:"Match alto" },
  { id:"a4",  title:"iPhone 14 Pro • 256GB",    price:5290, distanceKm:410, delivery:true,  verified:false, rating:4.0, premium:true,  condition:"Seminovo", compatibility:"Alta compatibilidade" },
  { id:"a5",  title:"iPhone 11 • 64GB",         price:1890, distanceKm:55,  delivery:true,  verified:true,  rating:4.6, premium:false, condition:"Usado",    compatibility:"Boa compatibilidade" },
  { id:"a6",  title:"Moto G84 • 256GB",         price:1499, distanceKm:6,   delivery:true,  verified:true,  rating:4.8, premium:false, condition:"Novo",     compatibility:"Perto e seguro" },
  { id:"a7",  title:"Xiaomi 12 Lite • 128GB",   price:1399, distanceKm:120, delivery:true,  verified:false, rating:3.9, premium:false, condition:"Seminovo", compatibility:"Boa compatibilidade" },
  { id:"a8",  title:"Samsung A54 • 128GB",      price:1600, distanceKm:32,  delivery:false, verified:true,  rating:4.4, premium:false, condition:"Seminovo", compatibility:"Boa compatibilidade" },
  { id:"a9",  title:"iPhone XR • 64GB",         price:1200, distanceKm:4,   delivery:false, verified:false, rating:3.8, premium:false, condition:"Usado",    compatibility:"Compatibilidade média" },
  { id:"a10", title:"iPhone 13 Pro • 256GB",    price:4200, distanceKm:14,  delivery:true,  verified:true,  rating:4.9, premium:true,  condition:"Seminovo", compatibility:"Match alto" },
];

let activeFilter = "all";

/* ====== Render ====== */
function renderAds(list){
  grid.innerHTML = "";

  if(!list.length){
    emptyState.style.display = "block";
    resultsMeta.textContent = "0 ofertas";
    return;
  }

  emptyState.style.display = "none";
  resultsMeta.textContent = `${list.length} oferta(s) encontradas`;

  const fragment = document.createDocumentFragment();

  list.forEach(ad => {
    const a = document.createElement("a");
    a.className = "card";
    a.href = "anuncio.html";
    a.setAttribute("data-id", ad.id);

    const sellerStatus = ad.verified ? "Verificado" : "Verificação pendente";
    const sellerBadgeClass = ad.verified ? "good" : "warn";
    const distTag = distanceLabel(ad.distanceKm);
    const deliveryTag = ad.delivery ? "Entrega" : "Retirada";

    const imgUrl = getProductImageUrl(ad.title);
    const fb = fallbackSvg(ad.title);

    a.innerHTML = `
      <div class="card-media">
        <img
          src="${imgUrl}"
          alt="${ad.title}"
          loading="lazy"
          referrerpolicy="no-referrer"
          onerror="this.onerror=null; this.src='${fb}';"
        >
      </div>

      <div class="card-body">
        <div class="title">${ad.title}</div>

        <div class="badges">
          <span class="badge ${ad.matchScore >= 80 ? "good" : ""}">MATCH ${ad.matchScore}%</span>
          ${ad.premium ? `<span class="badge premium">Premium</span>` : ""}
          <span class="badge">${ad.compatibility}</span>
        </div>

        <div class="row">
          <div class="price">${formatBRL(ad.price)}</div>
          <span class="badge ${sellerBadgeClass}">${sellerStatus}</span>
        </div>

        <div class="meta">
          <span>📍 ${distTag} • ${ad.distanceKm} km</span>
          <span>🚚 ${deliveryTag}</span>
          <span>⭐ ${ad.rating.toFixed(1)}</span>
          <span>🧾 ${ad.condition}</span>
        </div>
      </div>
    `;

    fragment.appendChild(a);
  });

  grid.appendChild(fragment);
}

/* ====== Filtros ====== */
function applyFilter(ads){
  const q = (searchInput.value || "").trim().toLowerCase();
  const budget = parsePriceInput(priceInput.value);

  let filtered = ads.filter(ad => {
    if(!q) return true;
    return ad.title.toLowerCase().includes(q);
  });

  filtered = filtered.map(ad => ({
    ...ad,
    matchScore: computeMatchScore(ad, budget)
  }));

  if(activeFilter === "near"){
    filtered = filtered.filter(ad => ad.distanceKm <= 10);
  } else if(activeFilter === "verified"){
    filtered = filtered.filter(ad => ad.verified);
  } else if(activeFilter === "delivery"){
    filtered = filtered.filter(ad => ad.delivery);
  }

  filtered.sort((a,b) => {
    if(b.matchScore !== a.matchScore) return b.matchScore - a.matchScore;
    if((b.premium ? 1 : 0) !== (a.premium ? 1 : 0)) return (b.premium ? 1 : 0) - (a.premium ? 1 : 0);
    return a.distanceKm - b.distanceKm;
  });

  return filtered;
}

function setActiveChip(btn){
  filterButtons.forEach(b => b.classList.remove("is-active"));
  btn.classList.add("is-active");
  activeFilter = btn.dataset.filter;
  rerender();
}

function rerender(){
  resultsMeta.textContent = "Carregando ofertas…";
  const list = applyFilter(ADS);
  renderAds(list);
}

filterButtons.forEach(btn => btn.addEventListener("click", () => setActiveChip(btn)));
searchInput.addEventListener("input", rerender);
priceInput.addEventListener("input", rerender);

rerender();
