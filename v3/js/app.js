/* RePhone V3 — anúncios simulados + filtros + match básico */

const $ = (sel, root=document) => root.querySelector(sel);
const $$ = (sel, root=document) => Array.from(root.querySelectorAll(sel));

const grid = $("#resultsGrid");
const emptyState = $("#emptyState");
const resultsMeta = $("#resultsMeta");

const searchInput = $("#searchInput");
const priceInput = $("#priceInput");
const filterButtons = $$(".chip");

/* ====== Dataset simulado ====== */
const ADS = [
  {
    id: "a1",
    title: "iPhone 13 • 128GB",
    price: 2900,
    distanceKm: 3,
    delivery: true,
    verified: true,
    rating: 4.9,
    premium: true,
    condition: "Excelente",
    image: "https://images.unsplash.com/photo-1600541519467-937869997e34?auto=format&fit=crop&w=900&q=70",
    compatibility: "Alta compatibilidade"
  },
  {
    id: "a2",
    title: "iPhone 12 • 64GB",
    price: 2500,
    distanceKm: 8,
    delivery: false,
    verified: true,
    rating: 4.6,
    premium: false,
    condition: "Bom",
    image: "https://images.unsplash.com/photo-1605236453806-6ff36851218e?auto=format&fit=crop&w=900&q=70",
    compatibility: "Boa compatibilidade"
  },
  {
    id: "a3",
    title: "Samsung S22 • 128GB",
    price: 2300,
    distanceKm: 18,
    delivery: true,
    verified: false,
    rating: 4.2,
    premium: false,
    condition: "Muito bom",
    image: "https://images.unsplash.com/photo-1610945265064-0e34e5519bbf?auto=format&fit=crop&w=900&q=70",
    compatibility: "Compatibilidade média"
  },
  {
    id: "a4",
    title: "iPhone 11 • 128GB",
    price: 1950,
    distanceKm: 55,
    delivery: true,
    verified: true,
    rating: 4.7,
    premium: false,
    condition: "Bom",
    image: "https://images.unsplash.com/photo-1581795669633-91ef7c9699a8?auto=format&fit=crop&w=900&q=70",
    compatibility: "Boa compatibilidade"
  },
  {
    id: "a5",
    title: "Xiaomi 12 Lite • 128GB",
    price: 1400,
    distanceKm: 120,
    delivery: true,
    verified: false,
    rating: 3.9,
    premium: false,
    condition: "Bom",
    image: "https://images.unsplash.com/photo-1598327105666-5b89351aff97?auto=format&fit=crop&w=900&q=70",
    compatibility: "Compatibilidade variável"
  },
  {
    id: "a6",
    title: "Moto G84 • 256GB",
    price: 1350,
    distanceKm: 6,
    delivery: true,
    verified: false,
    rating: 4.0,
    premium: false,
    condition: "Novo",
    image: "https://images.unsplash.com/photo-1580915411954-282cb1b0d780?auto=format&fit=crop&w=900&q=70",
    compatibility: "Alta compatibilidade"
  },
  {
    id: "a7",
    title: "iPhone 14 • 128GB",
    price: 3600,
    distanceKm: 950,
    delivery: true,
    verified: true,
    rating: 4.8,
    premium: true,
    condition: "Excelente",
    image: "https://images.unsplash.com/photo-1695668383217-bb6e7be98d6b?auto=format&fit=crop&w=900&q=70",
    compatibility: "Alta compatibilidade"
  },
  {
    id: "a8",
    title: "Samsung A54 • 128GB",
    price: 1600,
    distanceKm: 32,
    delivery: false,
    verified: true,
    rating: 4.4,
    premium: false,
    condition: "Muito bom",
    image: "https://images.unsplash.com/photo-1616348436168-de43ad0db179?auto=format&fit=crop&w=900&q=70",
    compatibility: "Boa compatibilidade"
  },
  {
    id: "a9",
    title: "iPhone XR • 64GB",
    price: 1200,
    distanceKm: 4,
    delivery: false,
    verified: false,
    rating: 3.8,
    premium: false,
    condition: "Regular",
    image: "https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?auto=format&fit=crop&w=900&q=70",
    compatibility: "Compatibilidade média"
  },
  {
    id: "a10",
    title: "iPhone 13 Pro • 256GB",
    price: 4200,
    distanceKm: 14,
    delivery: true,
    verified: true,
    rating: 4.9,
    premium: true,
    condition: "Excelente",
    image: "https://images.unsplash.com/photo-1633097020998-2c3a1f7f1c9a?auto=format&fit=crop&w=900&q=70",
    compatibility: "Alta compatibilidade"
  }
];

/* ====== Estado ====== */
let activeFilter = "all";

/* ====== Helpers ====== */
function formatBRL(value){
  try{
    return value.toLocaleString("pt-BR", { style:"currency", currency:"BRL" });
  } catch {
    return `R$ ${value}`;
  }
}
function clamp(n, min, max){ return Math.max(min, Math.min(max, n)); }

function parsePriceInput(str){
  // aceita "1.500", "1500", "1,500" etc.
  const cleaned = String(str || "")
    .replace(/[^\d,\.]/g, "")
    .replace(/\./g, "")
    .replace(",", ".");
  const num = Number(cleaned);
  return Number.isFinite(num) ? num : null;
}

function distanceLabel(km){
  if(km <= 10) return "Perto";
  if(km <= 60) return "Longe";
  return "Muito longe";
}

/* Score simples para simular o MATCH */
function computeMatchScore(ad, userBudget){
  let score = 50;

  // Proximidade
  if(ad.distanceKm <= 10) score += 20;
  else if(ad.distanceKm <= 60) score += 10;
  else score += 0;

  // Verificação
  score += ad.verified ? 15 : 0;

  // Entrega
  score += ad.delivery ? 8 : 0;

  // Budget (quanto mais perto do budget sem ultrapassar muito, melhor)
  if(userBudget && userBudget > 0){
    const diff = ad.price - userBudget;
    if(diff <= 0) score += 12; // abaixo ou igual
    else {
      // acima do budget: penaliza proporcional
      score -= clamp(Math.round(diff / userBudget * 30), 5, 30);
    }
  }

  // Rating
  score += Math.round((ad.rating - 3.5) * 10); // 3.5 => 0, 4.5 =>
