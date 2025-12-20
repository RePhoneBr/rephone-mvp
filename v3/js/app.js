/* RePhone V3 (teste fechado)
   - Acesso por código (gate)
   - Vitrine com ofertas simuladas
   - MATCH exclusivo (fora do grid), suspense ~10s com etapas
   - Melhor oportunidade dentro do raio (10/30/60km) após clique
   - Nunca “não encontra”: entra em Radar ativo e promete monitorar
   - Sugestão automática de valor (faixa de mercado simulada por modelo)
*/

(() => {
  const OWNER_WA = "5527998205547";   // seu WhatsApp
  const ACCESS_CODE = "RPH-8742";     // troque e faça commit para revogar

  const MATCH_SUSPENSE_MS = 10000;
  const STEP_MS = 2000;
  const MATCH_STEPS = [
    "Validando o seu valor…",
    "Checando reputação e verificação…",
    "Analisando distância e logística…",
    "Buscando oportunidades imediatas…",
    "Finalizando MATCH…"
  ];

  const RADIUS_LEVELS = [10, 30, 60];
  let radiusIndex = 0; // começa em 10km

  const FALLBACK_IMG = "assets/phone-placeholder.svg";

  const $ = (sel, root=document) => root.querySelector(sel);
  const $$ = (sel, root=document) => Array.from(root.querySelectorAll(sel));

  const yearEl = $("#year");
  if (yearEl) yearEl.textContent = new Date().getFullYear();

  // ---------- GATE ----------
  const gate = $("#gate");
  const gateToken = $("#gateToken");
  const gateBtn = $("#gateBtn");
  const gateWa = $("#gateWa");

  function openGate(){
    gate.classList.add("show");
    gate.setAttribute("aria-hidden","false");
    document.body.style.overflow = "hidden";
  }
  function closeGate(){
    gate.classList.remove("show");
    gate.setAttribute("aria-hidden","true");
    document.body.style.overflow = "";
  }

  if (gateWa){
    const msg = encodeURIComponent("Olá! Quero acesso ao V3 do RePhone. Meu nome é: ______. Pode me liberar o código temporário?");
    gateWa.href = `https://wa.me/${OWNER_WA}?text=${msg}`;
  }

  // prefill from URL ?token=
  try{
    const u = new URL(window.location.href);
    const t = u.searchParams.get("token");
    if (t && gateToken) gateToken.value = t;
  }catch(e){}

  // sempre exige código ao abrir (1 pessoa por vez por prática: você troca o código)
  openGate();

  function validateGate(){
    const t = (gateToken?.value || "").trim();
    if (t === ACCESS_CODE){
      closeGate();
      // limpa token na URL
      try{
        const u = new URL(window.location.href);
        u.searchParams.delete("token");
        window.history.replaceState({}, "", u.toString());
      }catch(e){}
      // botão encerrar acesso (recarrega e volta ao gate)
      const exit = document.createElement("button");
      exit.textContent = "Encerrar acesso";
      exit.className = "btn";
      exit.style.cssText = "position:fixed; bottom:16px; right:16px; z-index:90; box-shadow:none; background:rgba(255,255,255,.92)";
      exit.addEventListener("click", () => location.reload());
      document.body.appendChild(exit);
    } else {
      alert("Código inválido ou acesso revogado. Peça autorização no WhatsApp.");
    }
  }
  gateBtn?.addEventListener("click", validateGate);
  gateToken?.addEventListener("keydown", (e) => { if(e.key === "Enter") validateGate(); });

  // ---------- DATA ----------
  // Faixas simuladas (no futuro: banco de dados real)
  const market = [
    { key:"iphone 11", min: 1700, avg: 2100, max: 2600 },
    { key:"iphone 12", min: 2100, avg: 2500, max: 3200 },
    { key:"iphone 13", min: 2500, avg: 3000, max: 3800 },
    { key:"iphone 14 pro", min: 4200, avg: 5200, max: 6500 },
    { key:"galaxy s23", min: 2900, avg: 3500, max: 4500 },
    { key:"moto g84", min: 1100, avg: 1500, max: 1900 },
  ];

  const offers = [
    {
      id:"iphone11-64",
      title:"iPhone 11 • 64GB",
      modelKey:"iphone 11",
      price:1890,
      condition:"Usado",
      city:"Serra/ES",
      distanceKm:55,
      verified:true,
      rating:4.6,
      reviews: 92,
      delivery:true,
      image:"assets/products/iphone-11-64.webp"
    },
    {
      id:"iphone13-128",
      title:"iPhone 13 • 128GB",
      modelKey:"iphone 13",
      price:2900,
      condition:"Seminovo",
      city:"Aracruz/ES",
      distanceKm:3,
      verified:true,
      rating:4.9,
      reviews: 312,
      delivery:true,
      image:"assets/products/iphone-13-128.webp"
    },
    {
      id:"iphone12-64",
      title:"iPhone 12 • 64GB",
      modelKey:"iphone 12",
      price:2500,
      condition:"Seminovo",
      city:"Vitória/ES",
      distanceKm:48,
      verified:false,
      rating:4.2,
      reviews: 18,
      delivery:false,
      image:"assets/products/iphone-12-64.webp"
    },
    {
      id:"galaxys23-256",
      title:"Galaxy S23 • 256GB",
      modelKey:"galaxy s23",
      price:3499,
      condition:"Novo",
      city:"Linhares/ES",
      distanceKm:78,
      verified:true,
      rating:4.7,
      reviews: 89,
      delivery:true,
      image:"assets/products/galaxy-s23-256.webp"
    },
    {
      id:"iphone14pro-256",
      title:"iPhone 14 Pro • 256GB",
      modelKey:"iphone 14 pro",
      price:5290,
      condition:"Seminovo",
      city:"Rio de Janeiro/RJ",
      distanceKm:410,
      verified:false,
      rating:4.0,
      reviews: 7,
      delivery:true,
      image:"assets/products/iphone-14-pro-256.webp"
    },
    {
      id:"motog84-256",
      title:"Moto G84 • 256GB",
      modelKey:"moto g84",
      price:1499,
      condition:"Novo",
      city:"Aracruz/ES",
      distanceKm:6,
      verified:true,
      rating:4.8,
      reviews: 204,
      delivery:true,
      image:"assets/products/moto-g84-256.webp"
    },
  ];

  function attachImageFallback(img){
    img.addEventListener("error", () => {
      if(img.dataset.fallbackApplied) return;
      img.dataset.fallbackApplied = "1";
      img.src = FALLBACK_IMG;
    });
  }

  function formatBRL(n){
    return n.toLocaleString("pt-BR", { style:"currency", currency:"BRL" });
  }

  // parse BR value to number
  function parseBRL(raw){
    if(!raw) return null;
    let s = String(raw).trim().replace(/[^\d.,]/g, "");
    if(!s) return null;

    if(s.includes(",")){
      s = s.replace(/\./g, "").replace(",", ".");
    } else if ((s.match(/\./g) || []).length === 1){
      const [a,b] = s.split(".");
      if(b.length !== 2) s = a + b;
    } else {
      s = s.replace(/\./g, "");
    }

    const n = Number(s);
    return Number.isFinite(n) ? n : null;
  }

  function normalizeBRLInputOnBlur(input){
    const n = parseBRL(input.value);
    if(n === null){
      input.dataset.value = "";
      input.value = "";
      return;
    }
    input.dataset.value = String(n);
    input.value = formatBRL(n);
  }

  function toModelKey(str){
    return String(str||"").trim().toLowerCase();
  }

  function findMarketRange(modelKey){
    const mk = toModelKey(modelKey);
    // match by inclusion for flexibility (iphone 11 / iphone11)
    const hit = market.find(m => mk.includes(m.key));
    return hit || null;
  }

  function priceTag(offer){
    const r = findMarketRange(offer.modelKey);
    if(!r) return { label:"Preço", cls:"neutral" };
    if(offer.price < r.avg*0.92) return { label:"Bom preço", cls:"good" };
    if(offer.price > r.avg*1.10) return { label:"Acima da média", cls:"warn" };
    return { label:"Dentro da média", cls:"neutral" };
  }

  function distanceLabel(km){
    if(km <= 5) return "Muito perto";
    if(km <= 10) return "Perto";
    if(km <= 80) return "Longe";
    return "Muito longe";
  }

  // ---------- UI (GRID) ----------
  const offersGrid = $("#offersGrid");
  const countLabel = $("#countLabel");
  const searchInput = $("#searchInput");
  const modelInput = $("#modelInput");
  const priceInput = $("#priceInput");

  const suggestBox = $("#suggestBox");
  const suggestText = $("#suggestText");
  const applySuggest = $("#applySuggest");
  const keepValue = $("#keepValue");

  const radiusLabel = $("#radiusLabel");

  let activeFilter = "all";
  let query = "";
  let hiddenOfferId = null;

  function passesFilter(o){
    if(activeFilter === "near") return o.distanceKm <= 10;
    if(activeFilter === "verified") return o.verified;
    if(activeFilter === "delivery") return o.delivery;
    return true;
  }
  function passesSearch(o){
    if(!query) return true;
    const q = query.toLowerCase();
    return o.title.toLowerCase().includes(q) || o.city.toLowerCase().includes(q);
  }

  function buildCard(o){
    const ver = o.verified ? {t:"Verificado", c:"good"} : {t:"Verificação pendente", c:"warn"};
    const dist = distanceLabel(o.distanceKm);
    const distBadge = dist === "Muito perto" || dist === "Perto" ? "good" : "neutral";
    const del = o.delivery ? {t:"Entrega", c:"good"} : {t:"Retirada", c:"neutral"};
    const pt = priceTag(o);

    return `
      <a class="card" href="anuncio.html?id=${encodeURIComponent(o.id)}">
        <div class="media">
          <img src="${o.image}" alt="${o.title}" loading="lazy" referrerpolicy="no-referrer" data-fallback="1" />
        </div>
        <div class="body">
          <div class="title">${o.title}</div>
          <div class="price">${formatBRL(o.price)}</div>
          <div class="meta">${o.condition} • ${o.city}</div>
          <div class="badges">
            <span class="badge ${distBadge}">📍 ${dist} • ${o.distanceKm}km</span>
            <span class="badge ${ver.c}">🛡 ${ver.t}</span>
            <span class="badge ${del.c}">🚚 ${del.t}</span>
            <span class="badge ${pt.cls}">💰 ${pt.label}</span>
            <span class="badge neutral">⭐ ${o.rating.toFixed(1)} (${o.reviews})</span>
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
    $$('img[data-fallback="1"]', offersGrid).forEach(attachImageFallback);

    countLabel.textContent = visible.length ? `${visible.length} ofertas` : "Sem ofertas nesta combinação";
  }

  $$(".chip").forEach(btn => {
    btn.addEventListener("click", () => {
      $$(".chip").forEach(b => b.classList.remove("active"));
      btn.classList.add("active");
      activeFilter = btn.dataset.filter;
      render();
    });
  });

  searchInput?.addEventListener("input", () => {
    query = searchInput.value.trim();
    render();
  });

  // ---------- SUGESTÃO DE VALOR (automática) ----------
  let lastSuggested = null;
  function showSuggestion(msg, value){
    if(!suggestBox) return;
    suggestText.textContent = msg;
    lastSuggested = value;
    suggestBox.style.display = "block";
  }
  function hideSuggestion(){
    if(!suggestBox) return;
    suggestBox.style.display = "none";
    lastSuggested = null;
  }

  function updateSuggestion(){
    const mk = toModelKey(modelInput?.value);
    const n = parseBRL(priceInput?.value);
    if(!mk || n === null) { hideSuggestion(); return; }
    const range = findMarketRange(mk);
    if(!range) { hideSuggestion(); return; }

    // abaixo do mínimo "realista"
    if(n < range.min){
      showSuggestion(`Para ${range.key.toUpperCase()}, oportunidades costumam aparecer a partir de ${formatBRL(range.min)}. Mantemos seu valor e seguimos monitorando.`, range.min);
      return;
    }
    // muito acima da média -> sugerir ajustar para média
    if(n > range.avg * 1.20){
      showSuggestion(`Este valor está acima da média atual (${formatBRL(range.avg)}). Se quiser, podemos priorizar ofertas mais justas.`, range.avg);
      return;
    }
    hideSuggestion();
  }

  applySuggest?.addEventListener("click", () => {
    if(lastSuggested === null) return;
    priceInput.value = String(Math.round(lastSuggested)); // deixa digitável
    priceInput.dataset.value = String(lastSuggested);
    normalizeBRLInputOnBlur(priceInput); // padroniza
    hideSuggestion();
    kickMatch(); // reprocessa
  });
  keepValue?.addEventListener("click", () => hideSuggestion());

  // ---------- PRICE INPUT (corrigido: não trava) ----------
  priceInput?.addEventListener("input", () => {
    // Não formatar aqui! (evita pulo de cursor)
    priceInput.value = priceInput.value.replace(/[^\d.,]/g, "");
    updateSuggestion();
    kickMatch(); // reage com debounce/suspense
  });
  priceInput?.addEventListener("blur", () => {
    normalizeBRLInputOnBlur(priceInput);
    updateSuggestion();
  });

  modelInput?.addEventListener("input", () => {
    updateSuggestion();
    kickMatch();
  });

  // ---------- MATCH ENGINE ----------
  const matchBar = $("#matchBar");
  const matchTitle = $("#matchTitle");
  const matchSub = $("#matchSub");
  const matchBtn = $("#matchBtn");
  const expandBtn = $("#expandBtn");
  const radarBtn = $("#radarBtn");
  const radarLine = $("#radarLine");
  const radarText = $("#radarText");

  const backdrop = $("#modalBackdrop");
  const modalBody = $("#modalBody");
  const openOffer = $("#openOffer");
  const closeModalBtn = $("#closeModal");

  let matchTimer = null;
  let stepTimer = null;
  let currentMatch = null;
  let radarEnabled = false;

  function showBar(){
    matchBar.classList.add("show");
    matchBar.setAttribute("aria-hidden","false");
  }

  function setSearching(){
    currentMatch = null;
    matchBtn.disabled = true;
    matchBtn.textContent = "Aguardando…";
    matchTitle.textContent = "Buscando MATCH…";
    matchSub.textContent = MATCH_STEPS[0];
    radarLine.style.display = "none";
    showBar();

    // etapas
    let i = 0;
    if(stepTimer) clearInterval(stepTimer);
    stepTimer = setInterval(() => {
      i++;
      if(i < MATCH_STEPS.length){
        matchSub.textContent = MATCH_STEPS[i];
      } else {
        clearInterval(stepTimer);
        stepTimer = null;
      }
    }, STEP_MS);
  }

  function setRadar(msg){
    matchTitle.textContent = "Radar RePhone ativo";
    matchSub.textContent = msg;
    matchBtn.disabled = true;
    matchBtn.textContent = "Sem MATCH agora";
    radarLine.style.display = "flex";
    radarText.textContent = radarEnabled
      ? "Radar RePhone ativo — monitorando oportunidades"
      : "Você pode ativar o Radar para continuar monitorando";
    showBar();
  }

  function isRare(offer, budget){
    const within = offer.price <= budget * 1.02; // muito próximo do valor
    const trust = offer.verified || offer.rating >= 4.7;
    const logistics = offer.delivery || offer.distanceKm <= 10;
    return within && trust && logistics;
  }

  function scoreOffer(o, budget){
    const range = findMarketRange(o.modelKey);
    const priceCenter = range ? range.avg : budget;
    const priceGap = Math.abs(o.price - budget);
    const priceScore = Math.max(0, 100 - (priceGap / Math.max(1, priceCenter)) * 110);

    const distScore = Math.max(0, 100 - (o.distanceKm / 1.2)); // forte impacto de distância, mas não absoluto
    const trustScore = (o.verified ? 14 : 0) + (o.rating * 2.0);
    const deliveryScore = o.delivery ? 8 : 0;

    return priceScore * 0.55 + distScore * 0.20 + trustScore * 0.18 + deliveryScore;
  }

  function chooseBest(modelKey, budget, radiusKm){
    const mk = toModelKey(modelKey);
    let pool = offers.filter(o => o.distanceKm <= radiusKm);

    if(mk){
      // tentativa forte: filtrar por modelo
      const byModel = pool.filter(o => o.modelKey && mk.includes(o.modelKey));
      if(byModel.length) pool = byModel;
    }

    if(!pool.length) return null;

    const ranked = pool
      .map(o => ({o, s: scoreOffer(o, budget)}))
      .sort((a,b) => b.s - a.s);

    // Para “melhor oportunidade”, aceitamos o melhor mesmo se preço > budget,
    // mas com penalidade no score (já acontece no priceScore)
    return ranked[0] || null;
  }

  function setMatchFound(offer, budget){
    currentMatch = offer;
    hiddenOfferId = offer.id; // exclusivo: some do grid
    render();

    const rare = isRare(offer, budget);
    matchTitle.textContent = rare ? "MATCH RARO — oportunidade imediata" : "MATCH encontrado";
    matchSub.textContent = `${offer.title} • ${formatBRL(offer.price)} • ${distanceLabel(offer.distanceKm)} • ${offer.verified ? "verificado" : "verificação pendente"}`;
    matchBtn.disabled = false;
    matchBtn.textContent = rare ? "Ver MATCH raro" : "Ver MATCH";
    showBar();
  }

  function openModal(){
    if(!currentMatch) return;
    const budget = parseBRL(priceInput.value) ?? currentMatch.price;

    const rare = isRare(currentMatch, budget);
    $("#modalKicker").textContent = rare ? "MATCH RARO" : "MATCH RePhone";
    $("#modalTitle").textContent = rare ? "Oportunidade imediata" : "Melhor oportunidade disponível";

    const pt = priceTag(currentMatch);
    modalBody.innerHTML = `
      <div style="display:flex; gap:1rem; flex-wrap:wrap; align-items:flex-start;">
        <div style="flex:0 0 180px;">
          <div style="border:1px solid rgba(15,23,42,.10); border-radius:18px; padding:.75rem; background:rgba(15,23,42,.02); display:grid; place-items:center;">
            <img src="${currentMatch.image}" alt="${currentMatch.title}" style="max-width:100%; max-height:160px; object-fit:contain;" />
          </div>
        </div>
        <div style="flex:1; min-width:240px;">
          <div style="font-weight:950; letter-spacing:-.02em; font-size:1.15rem;">${currentMatch.title}</div>
          <div style="margin-top:.35rem; font-weight:950; font-size:1.25rem;">${formatBRL(currentMatch.price)}</div>
          <div style="margin-top:.55rem; color:rgba(15,23,42,.78); font-weight:750;">
            ${currentMatch.condition} • ${currentMatch.city} • ${distanceLabel(currentMatch.distanceKm)} (${currentMatch.distanceKm}km)
          </div>

          <div style="margin-top:.6rem; display:flex; gap:.5rem; flex-wrap:wrap;">
            <span class="badge ${currentMatch.verified ? "good":"warn"}">🛡 ${currentMatch.verified ? "Verificado":"Verificação pendente"}</span>
            <span class="badge ${currentMatch.delivery ? "good":"neutral"}">🚚 ${currentMatch.delivery ? "Entrega":"Retirada"}</span>
            <span class="badge ${pt.cls}">💰 ${pt.label}</span>
            <span class="badge neutral">⭐ ${currentMatch.rating.toFixed(1)} (${currentMatch.reviews})</span>
          </div>

          <div style="margin-top:.9rem; color:var(--muted); font-weight:750;">
            ${rare ? "Você liberou uma oportunidade rara. Ela pode sair a qualquer momento." : "Encontramos a melhor oportunidade no raio atual."}
          </div>
        </div>
      </div>
    `;

    // fallback in modal
    const img = modalBody.querySelector("img");
    if(img) attachImageFallback(img);

    openOffer.href = `anuncio.html?id=${encodeURIComponent(currentMatch.id)}`;
    backdrop.classList.add("show");
    backdrop.setAttribute("aria-hidden","false");
    document.body.style.overflow = "hidden";
  }

  function closeModal(){
    backdrop.classList.remove("show");
    backdrop.setAttribute("aria-hidden","true");
    document.body.style.overflow = "";
  }

  closeModalBtn?.addEventListener("click", closeModal);
  backdrop?.addEventListener("click", (e) => { if(e.target === backdrop) closeModal(); });
  document.addEventListener("keydown", (e) => { if(e.key === "Escape" && backdrop.classList.contains("show")) closeModal(); });
  matchBtn?.addEventListener("click", openModal);

  function updateRadiusLabel(){
    const km = RADIUS_LEVELS[radiusIndex];
    if (km === 10) radiusLabel.textContent = "Local (10 km)";
    else radiusLabel.textContent = `Região (${km} km)`;
  }
  updateRadiusLabel();

  expandBtn?.addEventListener("click", () => {
    radiusIndex = Math.min(radiusIndex + 1, RADIUS_LEVELS.length - 1);
    updateRadiusLabel();
    // ao expandir, aumenta compromisso do usuário -> reprocessa com suspense
    kickMatch(true);
  });

  radarBtn?.addEventListener("click", () => {
    radarEnabled = true;
    radarLine.style.display = "flex";
    radarText.textContent = "Radar RePhone ativo — monitorando oportunidades";
    matchSub.textContent = "Vamos avisar assim que surgir uma oportunidade compatível.";
  });

  function clearTimers(){
    if(matchTimer) clearTimeout(matchTimer);
    matchTimer = null;
    if(stepTimer) clearInterval(stepTimer);
    stepTimer = null;
  }

  function kickMatch(force=false){
    // reset exclusividade se usuário mudou intenção
    if(!force){
      hiddenOfferId = null;
      render();
    }

    clearTimers();

    const model = modelInput?.value || "";
    const budget = parseBRL(priceInput?.value);

    // Só começa match quando tem pelo menos valor OU modelo (para demonstrar motor).
    if((!model || model.trim().length < 2) && (!budget || budget <= 0)){
      matchBar.classList.remove("show");
      matchBar.setAttribute("aria-hidden","true");
      return;
    }

    setSearching();
    showBar();

    matchTimer = setTimeout(() => {
      const usedBudget = budget && budget > 0 ? budget : (findMarketRange(model)?.avg || 2500);

      const best = chooseBest(model, usedBudget, RADIUS_LEVELS[radiusIndex]);

      if(best && best.o){
        setMatchFound(best.o, usedBudget);
      } else {
        // nunca "sem match": radar
        const km = RADIUS_LEVELS[radiusIndex];
        const msg = km < 60
          ? `Nenhuma oportunidade ideal apareceu em até ${km} km agora. Você pode expandir a distância ou manter o Radar ativo.`
          : "Ainda não apareceu uma oportunidade compatível no momento. A RePhone continua monitorando e vai avisar assim que surgir.";
        setRadar(msg);
      }
    }, MATCH_SUSPENSE_MS);
  }

  // initial render
  render();
  countLabel.textContent = `${offers.length} ofertas`;

})();