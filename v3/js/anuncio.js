(() => {
  const $ = (s, r=document) => r.querySelector(s);

  const FALLBACK = "assets/phone-placeholder.svg";
  function attachFallback(img){
    img.addEventListener("error", () => { img.src = FALLBACK; });
  }

  const params = new URLSearchParams(location.search);
  const id = params.get("id") || "";

  // Catálogo mínimo (simulado). No projeto final, virá do backend.
  const DB = {
    "iphone11-64": { title:"iPhone 11 • 64GB", price:1890, meta:"Usado • Serra/ES • Longe (55 km)", img:"assets/products/iphone-11-64.webp", badges:["🛡 Verificado","🚚 Entrega","💰 Bom preço","⭐ 4.6 (92)"] },
    "iphone13-128": { title:"iPhone 13 • 128GB", price:2900, meta:"Seminovo • Aracruz/ES • Muito perto (3 km)", img:"assets/products/iphone-13-128.webp", badges:["🛡 Verificado","🚚 Entrega","💰 Dentro da média","⭐ 4.9 (312)"] },
    "iphone12-64": { title:"iPhone 12 • 64GB", price:2500, meta:"Seminovo • Vitória/ES • Longe (48 km)", img:"assets/products/iphone-12-64.webp", badges:["⏳ Verificação pendente","📦 Retirada","💰 Dentro da média","⭐ 4.2 (18)"] },
    "galaxys23-256": { title:"Galaxy S23 • 256GB", price:3499, meta:"Novo • Linhares/ES • Longe (78 km)", img:"assets/products/galaxy-s23-256.webp", badges:["🛡 Verificado","🚚 Entrega","💰 Dentro da média","⭐ 4.7 (89)"] },
    "iphone14pro-256": { title:"iPhone 14 Pro • 256GB", price:5290, meta:"Seminovo • Rio de Janeiro/RJ • Muito longe (410 km)", img:"assets/products/iphone-14-pro-256.webp", badges:["⏳ Verificação pendente","🚚 Entrega","💰 Acima da média","⭐ 4.0 (7)"] },
    "motog84-256": { title:"Moto G84 • 256GB", price:1499, meta:"Novo • Aracruz/ES • Perto (6 km)", img:"assets/products/moto-g84-256.webp", badges:["🛡 Verificado","🚚 Entrega","💰 Dentro da média","⭐ 4.8 (204)"] },
  };

  const item = DB[id];

  const titleEl = $("#title");
  const priceEl = $("#price");
  const metaEl = $("#meta");
  const imgEl = $("#img");
  const badgesEl = $("#badges");

  function brl(n){
    return n.toLocaleString("pt-BR", { style:"currency", currency:"BRL" });
  }

  if(!item){
    titleEl.textContent = "Anúncio não encontrado (demo)";
    priceEl.textContent = "—";
    metaEl.textContent = "Volte e selecione outro anúncio.";
  } else {
    titleEl.textContent = item.title;
    priceEl.textContent = brl(item.price);
    metaEl.textContent = item.meta;
    imgEl.src = item.img;
    attachFallback(imgEl);
    badgesEl.innerHTML = item.badges.map(b => `<span class="badge neutral">${b}</span>`).join("");
  }
})();