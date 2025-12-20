// v3/js/app.js

const $ = (sel, root = document) => root.querySelector(sel);
const $$ = (sel, root = document) => Array.from(root.querySelectorAll(sel));

const formatBRL = (n) =>
  n.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });

const distanceLabel = (km) => {
  if (km <= 5) return "Muito perto";
  if (km <= 20) return "Perto";
  if (km <= 80) return "Longe";
  return "Muito longe";
};

const distanceBadgeClass = (km) => {
  if (km <= 5) return "badge badge-near";
  if (km <= 20) return "badge badge-mid";
  if (km <= 80) return "badge badge-far";
  return "badge badge-veryfar";
};

// Mock de anúncios (simulação)
const MOCK_LISTINGS = [
  {
    id: "a1",
    title: "iPhone 13 • 128GB",
    price: 2900,
    condition: "Seminovo",
    city: "Aracruz/ES",
    distanceKm: 3,
    seller: { name: "Loja Centro", verified: true, rating: 4.9, sales: 312, since: "2021" },
    delivery: { pickup: true, local: true, shipping: true },
    matchScore: 92,
    tags: ["Alta compatibilidade", "Pagamento protegido"],
  },
  {
    id: "a2",
    title: "iPhone 12 • 64GB",
    price: 2500,
    condition: "Seminovo",
    city: "Vitória/ES",
    distanceKm: 48,
    seller: { name: "Carlos", verified: false, rating: 4.2, sales: 18, since: "2024" },
    delivery: { pickup: true, local: false, shipping: false },
    matchScore: 71,
    tags: ["Boa compatibilidade", "Retirada em mãos"],
  },
  {
    id: "a3",
    title: "Galaxy S23 • 256GB",
    price: 3499,
    condition: "Novo",
    city: "Linhares/ES",
    distanceKm: 78,
    seller: { name: "Tech Lineares", verified: true, rating: 4.7, sales: 89, since: "2022" },
    delivery: { pickup: false, local: true, shipping: true },
    matchScore: 84,
    tags: ["Entrega disponível", "Vendedor verificado"],
  },
  {
    id: "a4",
    title: "iPhone 14 Pro • 256GB",
    price: 5290,
    condition: "Seminovo",
    city: "Rio de Janeiro/RJ",
    distanceKm: 410,
    seller: { name: "Rafa", verified: false, rating: 4.0, sales: 7, since: "2025" },
    delivery: { pickup: false, local: false, shipping: true },
    matchScore: 63,
    tags: ["Muito longe", "Envio"],
  },
  {
    id: "a5",
    title: "iPhone 11 • 64GB",
    price: 1890,
    condition: "Usado",
    city: "Serra/ES",
    distanceKm: 55,
    seller: { name: "Bruna", verified: true, rating: 4.6, sales: 41, since: "2023" },
    delivery: { pickup: true, local: true, shipping: false },
    matchScore: 79,
    tags: ["Preço agressivo", "Pagamento protegido"],
  },
  {
    id: "a6",
    title: "Moto G84 • 256GB",
    price: 1499,
    condition: "Novo",
    city: "Aracruz/ES",
    distanceKm: 6,
    seller: { name: "Loja Verde", verified: true, rating: 4.8, sales: 204, since: "2020" },
    delivery: { pickup: true, local: true, shipping: true },
    matchScore: 88,
    tags: ["Excelente custo-benefício", "Entrega rápida"],
  },
  {
    id: "a7",
    title: "Xiaomi 13 Lite • 128GB",
    price: 2100,
    condition: "Seminovo",
    city: "Colatina/ES",
    distanceKm: 120,
    seller: { name: "Marcos", verified: false, rating: 3.9, sales: 9, since: "2024" },
    delivery: { pickup: true, local: false, shipping: true },
    matchScore: 58,
    tags: ["Envio", "Verificação pendente"],
  },
  {
    id: "a8",
    title: "iPhone 15 • 128GB",
    price: 5690,
    condition: "Novo",
    city: "Vila Velha/ES",
    distanceKm: 42,
    seller: { name: "Premium Store", verified: true, rating: 4.9, sales: 512, since: "2019" },
    delivery: { pickup: false, local: true, shipping: true },
    matchScore: 90,
    tags: ["Top match", "Vendedor verificado"],
  },
  {
    id: "a9",
    title: "Galaxy A55 • 128GB",
    price: 1990,
    condition: "Novo",
    city: "Aracruz/ES",
    distanceKm: 2,
    seller: { name: "João", verified: false, rating: 4.4, sales: 22, since: "2023" },
    delivery: { pickup: true, local: true, shipping: false },
    matchScore: 76,
    tags: ["Muito perto", "Retirada"],
  },
  {
    id: "a10",
    title: "iPhone 13 Pro • 256GB",
    price: 3790,
    condition: "Seminovo",
    city: "Belo Horizonte/MG",
    distanceKm: 525,
    seller: { name: "BH Cell", verified: true, rating: 4.5, sales: 73, since: "2022" },
    delivery: { pickup: false, local: false, shipping: true },
    matchScore: 67,
    tags: ["Envio", "Pagamento protegido"],
  },
  {
    id: "a11",
    title: "iPhone SE (2022) • 64GB",
    price: 1790,
    condition: "Usado",
    city: "Cariacica/ES",
    distanceKm: 47,
    seller: { name: "Ana", verified: true, rating: 4.3, sales: 15, since: "2023" },
    delivery: { pickup: true, local: true, shipping: true },
    matchScore: 72,
    tags: ["Boa compatibilidade", "Entrega local"],
  },
  {
    id: "a12",
    title: "Redmi Note 13 • 256GB",
    price: 1690,
    condition: "Novo",
    city: "Aracruz/ES",
    distanceKm: 8,
    seller: { name: "Outlet ES", verified: true, rating: 4.7, sales: 190, since: "2021" },
    delivery: { pickup: true, local: true, shipping: true },
    matchScore: 86,
    tags: ["Entrega", "Vendedor verificado"],
  },
  {
    id: "a13",
    title: "iPhone 14 • 128GB",
    price: 4190,
    condition: "Seminovo",
    city: "São Paulo/SP",
    distanceKm: 820,
    seller: { name: "SP Phones", verified: false, rating: 4.1, sales: 33, since: "2022" },
    delivery: { pickup: false, local: false, shipping: true },
    matchScore: 61,
    tags: ["Muito longe", "Envio"],
  },
  {
    id: "a14",
    title: "Galaxy S22 • 128GB",
    price: 2690,
    condition: "Usado",
    city: "Fundão/ES",
    distanceKm: 35,
    seller: { name: "Pedro", verified: true, rating: 4.8, sales: 58, since: "2020" },
    delivery: { pickup: true, local: true, shipping: false },
    matchScore: 83,
    tags: ["Perto", "Pagamento protegido"],
  },
];

function deliveryText(d) {
  const parts = [];
  if (d.pickup) parts.push("Retirada");
  if (d.local) parts.push("Entrega local");
  if (d.shipping) parts.push("Envio");
  return parts.join(" • ");
}

function renderCard(item) {
  const verified = item.seller.verified;

  const verifiedBadge = verified
    ? `<span class="badge badge-verified">Verificado</span>`
    : `<span class="badge badge-pending">Verificação pendente</span>`;

  const distBadge = `<span class="${distanceBadgeClass(item.distanceKm)}">${distanceLabel(item.distanceKm)} • ${item.distanceKm}km</span>`;

  const tags = (item.tags || []).slice(0, 2).map(t => `<span class="tag">${t}</span>`).join("");

  const match = item.matchScore != null
    ? `<div class="match">Match: <strong>${item.matchScore}%</strong></div>`
    : "";

  // Link vai para anuncio.html com querystring (simulado)
  const href = `anuncio.html?id=${encodeURIComponent(item.id)}`;

  return `
    <a class="card" href="${href}">
      <div class="card-top">
        <div class="title">${item.title}</div>
        <div class="price">${formatBRL(item.price)}</div>
      </div>

      <div class="meta">
        <span class="muted">${item.condition}</span>
        <span class="dot">•</span>
        <span class="muted">${item.city}</span>
      </div>

      <div class="badges">
        ${distBadge}
        ${verifiedBadge}
      </div>

      <div class="seller">
        <div class="seller-name">${item.seller.name}</div>
        <div class="seller-stats">
          <span>★ ${item.seller.rating.toFixed(1)}</span>
          <span class="dot">•</span>
          <span>${item.seller.sales} vendas</span>
          <span class="dot">•</span>
          <span>desde ${item.seller.since}</span>
        </div>
      </div>

      <div class="delivery">
        ${deliveryText(item.delivery)}
      </div>

      <div class="footer-row">
        ${match}
        <div class="tags">${tags}</div>
      </div>
    </a>
  `;
}

function applyFilter(list, filter) {
  if (filter === "near") return list.filter(x => x.distanceKm <= 20);
  if (filter === "verified") return list.filter(x => x.seller.verified);
  if (filter === "delivery") return list.filter(x => x.delivery.shipping || x.delivery.local);
  return list;
}

function render(list) {
  const grid = $("#resultsGrid");
  if (!grid) return;

  grid.innerHTML = list.map(renderCard).join("");
}

function initFilters() {
  const wrap = $("#quickFilters");
  if (!wrap) return;

  wrap.addEventListener("click", (e) => {
    const btn = e.target.closest("button[data-filter]");
    if (!btn) return;

    $$("#quickFilters .chip").forEach(b => b.classList.remove("active"));
    btn.classList.add("active");

    const f = btn.getAttribute("data-filter");
    render(applyFilter(MOCK_LISTINGS, f));
  });
}

// Init
render(MOCK_LISTINGS);
initFilters();

// (Opcional) Filtrar por preço digitado no input já existente
const priceInput = $("#priceInput");
if (priceInput) {
  priceInput.addEventListener("input", () => {
    const value = Number(String(priceInput.value).replace(/[^\d]/g, "")) || 0;
    const filtered = value ? MOCK_LISTINGS.filter(x => x.price <= value) : MOCK_LISTINGS;
    // respeita filtro atual
    const active = $("#quickFilters .chip.active");
    const f = active ? active.getAttribute("data-filter") : "all";
    render(applyFilter(filtered, f));
  });
}
