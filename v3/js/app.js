// RePhone V3 — vitrine + MATCH (simulação)
// Objetivo: manter o layout atual e ajustar apenas o comportamento do MATCH/Radar.
// - Ofertas carregam desde o início
// - Radar (círculo) aparece desde o carregamento
// - MATCH só inicia após clicar em "Buscar oportunidade"
// - Radar: cinza -> verde claro -> (5s) piscando -> (até 10s) mostra MATCH (barra) ou mantém radar monitorando

(() => {
  const $ = (sel, root = document) => root.querySelector(sel);
  const $$ = (sel, root = document) => Array.from(root.querySelectorAll(sel));

  // ===== DOM =====
  const offersGrid = $("#offersGrid");
  const offersStatus = $("#offersStatus");
  const modelInput = $("#modelInput");
  const priceInput = $("#priceInput");
  const buscarBtn = $("#buscarOpp");

  const radarPill = $("#radarPill");
  const matchBar = $("#matchBar");
  const matchTitle = $("#matchTitle");
  const matchSub = $("#matchSub");
  const matchProg = $("#matchProg");
  const matchBtn = $("#matchBtn");
  const matchClose = $("#matchClose");

  const priceHint = $(".price-hint");

  // Guard
  if (!offersGrid || !radarPill || !matchBar) return;

  // ===== Data (mock) =====
  // Observação: imagens locais ficam em assets/phone-placeholder.svg (se existir no seu repo).
  const PLACEHOLDER_IMG = "assets/phone-placeholder.svg";

  const OFFERS = [
    { id:"o1", model:"iPhone 11", storage:"64GB", price:1890, cond:"Usado", city:"Serra/ES", distKm:55, distLabel:"Longe", verified:true, delivery:true, rating:4.6, reviews:92, sales:92, since:2023, premium:false },
    { id:"o2", model:"iPhone 12", storage:"64GB", price:2500, cond:"Seminovo", city:"Vitória/ES", distKm:48, distLabel:"Longe", verified:false, delivery:false, rating:4.2, reviews:18, sales:18, since:2024, premium:false },
    { id:"o3", model:"iPhone 13", storage:"128GB", price:2900, cond:"Seminovo", city:"Aracruz/ES", distKm:3, distLabel:"Muito perto", verified:true, delivery:false, rating:4.9, reviews:312, sales:312, since:2021, premium:true },
    { id:"o4", model:"Galaxy S23", storage:"256GB", price:3499, cond:"Novo", city:"Linhares/ES", distKm:78, distLabel:"Longe", verified:true, delivery:true, rating:4.7, reviews:89, sales:89, since:2022, premium:false },
    { id:"o5", model:"Moto G84", storage:"256GB", price:1499, cond:"Novo", city:"Aracruz/ES", distKm:6, distLabel:"Perto", verified:true, delivery:true, rating:4.8, reviews:204, sales:204, since:2020, premium:false },
    { id:"o6", model:"iPhone 14 Pro", storage:"256GB", price:5290, cond:"Seminovo", city:"Rio de Janeiro/RJ", distKm:410, distLabel:"Muito longe", verified:false, delivery:true, rating:4.0, reviews:7, sales:7, since:2025, premium:true },
  ];

  // ===== Helpers =====
  const brl = new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" });

  function onlyDigits(s) {
    return String(s || "").replace(/\D+/g, "");
  }

  // Aceita: 2500, 2.500, 2.500,00, 2500,00 etc.
  // Regra: pega dígitos; se tiver >= 3 últimos dígitos e usuário digitou separador decimal, tenta respeitar,
  // mas como estamos em input texto, padronizamos no blur.
  function parseBRL(input) {
    const raw = String(input || "").trim();
    if (!raw) return null;

    // remove "R$" e espaços
    const cleaned = raw.replace(/[R$\s]/g, "");

    // Caso tenha vírgula, trata como decimal
    if (cleaned.includes(",")) {
      const parts = cleaned.split(",");
      const intPart = onlyDigits(parts[0]);
      const decPart = onlyDigits(parts[1] || "").slice(0, 2).padEnd(2, "0");
      const val = Number(intPart || "0") + Number(decPart || "0") / 100;
      return Number.isFinite(val) ? val : null;
    }

    // Sem vírgula: remove pontos e interpreta como inteiro (reais)
    const intDigits = onlyDigits(cleaned);
    if (!intDigits) return null;
    const val = Number(intDigits);
    return Number.isFinite(val) ? val : null;
  }

  function formatPriceInput() {
    const val = parseBRL(priceInput.value);
    if (val == null) return;
    // Formata como "R$ 2.500,00" mas mantém no input sem "R$" para não bagunçar o cursor.
    // Mostramos "2.500,00" (padrão pt-BR)
    const formatted = new Intl.NumberFormat("pt-BR", { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(val);
    priceInput.value = formatted;
  }

  function modelMatches(offer, query) {
    if (!query) return true;
    const q = query.toLowerCase().trim();
    const m = `${offer.model} ${offer.storage}`.toLowerCase();
    // match simples por inclusão; no futuro pode virar busca por tokens
    return q.split(/\s+/).every(tok => m.includes(tok));
  }

  function distanceBucket(km) {
    if (km <= 10) return "perto";
    if (km <= 80) return "longe";
    return "muito-longe";
  }

  function offerScore(offer, queryModel, targetPrice) {
    // Score maior = melhor
    let score = 0;

    // Modelo (peso alto)
    if (modelMatches(offer, queryModel)) score += 60;

    // Preço: preferir <= valor do comprador
    if (targetPrice != null) {
      if (offer.price <= targetPrice) score += 25;
      else {
        // se passou um pouco, ainda pode contar como "quase"
        const ratio = targetPrice / offer.price;
        if (ratio > 0.92) score += 10;
      }
    }

    // Mercado local e verificação
    const bucket = distanceBucket(offer.distKm);
    if (bucket === "perto") score += 18;
    if (bucket === "longe") score += 8;

    if (offer.verified) score += 14;
    if (offer.delivery) score += 6;
    if (offer.premium) score += 3;

    // Preferir menor preço se local + verificado
    if (offer.verified && offer.distKm <= 80) score += Math.max(0, 8 - Math.min(8, Math.floor(offer.price / 1000)));

    return score;
  }

  // ===== UI: Offers =====
  function offerCardHTML(o) {
    const tags = [];
    tags.push(`📍 ${o.distLabel} • ${o.distKm}km`);
    tags.push(o.verified ? "🛡️ Verificado" : "⏳ Verificação pendente");
    if (o.delivery) tags.push("🚚 Entrega");
    if (o.premium) tags.push("✨ Premium");

    const rating = `⭐ ${o.rating.toFixed(1)} (${o.reviews})`;

    return `
      <a class="card" href="anuncio.html" data-id="${o.id}" data-model="${o.model}" data-price="${o.price}" data-verified="${o.verified ? "1" : "0"}" data-delivery="${o.delivery ? "1" : "0"}" data-distance="${o.distKm}">
        <div class="imgwrap">
          <img src="${PLACEHOLDER_IMG}" alt="${o.model} ${o.storage}" loading="lazy" onerror="this.style.opacity=.12;this.alt='RePhone • imagem indisponível';" />
        </div>

        <div class="card-body">
          <div class="title">${o.model} • ${o.storage}</div>
          <div class="price">${brl.format(o.price)}</div>
          <div class="meta">${o.cond} • ${o.city}</div>

          <div class="chips">
            ${tags.map(t => `<span class="chip">${t}</span>`).join("")}
            <span class="chip">${rating}</span>
          </div>
        </div>
      </a>
    `;
  }

  function renderOffers(list) {
    offersGrid.innerHTML = list.map(offerCardHTML).join("");
    offersStatus.textContent = list.length ? "" : "Nenhuma oferta para exibir.";
  }

  function applyFilters() {
    const active = $(".filter-btn.active")?.dataset.filter || "all";
    const cards = $$(".card", offersGrid);

    cards.forEach(card => {
      const verified = card.dataset.verified === "1";
      const delivery = card.dataset.delivery === "1";
      const dist = Number(card.dataset.distance || "999");

      let ok = true;
      if (active === "perto") ok = dist <= 10;
      if (active === "verificado") ok = verified;
      if (active === "entrega") ok = delivery;

      card.classList.toggle("hidden", !ok);
    });
  }

  // Bind filter buttons
  $$(".filter-btn").forEach(btn => {
    btn.addEventListener("click", () => {
      $$(".filter-btn").forEach(b => b.classList.remove("active"));
      btn.classList.add("active");
      applyFilters();
    });
  });

  // ===== Radar / MATCH =====
  let radarTimers = [];
  let lastSearch = { model: "", price: null };
  let matchedOfferId = null;

  function clearRadarTimers() {
    radarTimers.forEach(t => clearTimeout(t));
    radarTimers = [];
  }

  function setRadarState(state) {
    radarPill.classList.remove("state-idle", "state-armed", "state-scan");
    radarPill.classList.add(state);

    if (state === "state-idle") {
      radarPill.setAttribute("aria-label", "RP MATCH (inativo)");
    } else if (state === "state-armed") {
      radarPill.setAttribute("aria-label", "RP MATCH (preparando busca)");
    } else {
      radarPill.setAttribute("aria-label", "RP MATCH (monitorando)");
    }
  }

  function hideMatchBar() {
    matchBar.classList.remove("show");
    document.body.classList.remove("match-bar-open");
  }

  function showMatchBar() {
    matchBar.classList.add("show");
    document.body.classList.add("match-bar-open");
  }

  function resetMatch() {
    clearRadarTimers();
    matchedOfferId = null;
    hideMatchBar();
    setRadarState("state-idle");
    // re-exibe qualquer card escondido por match
    $$(".card", offersGrid).forEach(c => c.classList.remove("hidden-by-match"));
  }

  function pickBestMatch(queryModel, targetPrice) {
    // Seleciona melhor oferta por score e que não tenha sido "consumida"
    const scored = OFFERS
      .map(o => ({ o, score: offerScore(o, queryModel, targetPrice) }))
      .sort((a, b) => b.score - a.score);

    const best = scored[0];
    if (!best) return null;

    // Regra de "match raro": exige pontuação mínima para aparecer
    if (best.score < 75) return null;
    return best.o;
  }

  function updatePriceHint(val) {
    if (!priceHint) return;
    if (val == null) {
      priceHint.textContent = "Aceitamos 2500, 2.500 ou 2.500,00. A RePhone interpreta e padroniza ao sair do campo.";
      return;
    }
    // Guidance simples (mock): usa a mediana das ofertas do mesmo modelo
    const q = (modelInput.value || "").trim();
    const same = OFFERS.filter(o => modelMatches(o, q));
    if (!same.length) {
      priceHint.textContent = "Dica: use modelo + valor para um MATCH mais preciso. Se estiver fora do mercado, sugerimos ajustar.";
      return;
    }
    const prices = same.map(o => o.price).sort((a, b) => a - b);
    const mid = prices[Math.floor(prices.length / 2)];
    const low = Math.round(mid * 0.85);
    const high = Math.round(mid * 1.15);

    if (val < low) {
      priceHint.textContent = `Para uma compra segura, esse valor está bem abaixo do mercado. Referência: ~${brl.format(mid)} (faixa segura ${brl.format(low)}–${brl.format(high)}).`;
    } else if (val > high) {
      priceHint.textContent = `Esse valor está acima do normal para este modelo. Referência: ~${brl.format(mid)} (faixa ${brl.format(low)}–${brl.format(high)}). Você pode seguir com seu valor.`;
    } else {
      priceHint.textContent = `Valor dentro da faixa comum para este modelo (referência ~${brl.format(mid)}).`;
    }
  }

  function startRadarFlow() {
    clearRadarTimers();
    hideMatchBar();

    const qModel = (modelInput.value || "").trim();
    const priceVal = parseBRL(priceInput.value);

    // validação leve
    if (!qModel || priceVal == null) {
      // feedback mínimo sem mexer no layout
      setRadarState("state-idle");
      matchTitle.textContent = "Complete modelo e valor";
      matchSub.textContent = "Depois clique em “Buscar oportunidade”.";
      matchBtn.disabled = true;
      showMatchBar();
      return;
    }

    lastSearch = { model: qModel, price: priceVal };
    formatPriceInput();
    updatePriceHint(priceVal);

    // Estado 1: verde claro (armado)
    setRadarState("state-armed");
    radarPill.title = "RP MATCH — preparando busca";

    // Pequeno atraso para não ser instantâneo
    matchTitle.textContent = "Buscando MATCH…";
    matchSub.textContent = "Comparando sinais (alguns segundos).";
    matchBtn.disabled = true;
    showMatchBar();

    // após 5s: pisca (scan)
    radarTimers.push(setTimeout(() => {
      setRadarState("state-scan");
      matchSub.textContent = "Radar ativo — monitorando oportunidades.";
      matchProg.style.width = "60%";
    }, 5000));

    // após 10s: decide resultado (match ou monitoramento contínuo)
    radarTimers.push(setTimeout(() => {
      const best = pickBestMatch(lastSearch.model, lastSearch.price);

      if (best) {
        matchedOfferId = best.id;

        // Oculta o item do grid para "exclusividade"
        const card = $(`.card[data-id="${best.id}"]`, offersGrid);
        if (card) card.classList.add("hidden-by-match");

        matchTitle.textContent = `MATCH encontrado: ${best.model} • ${best.storage}`;
        const badges = [
          `${brl.format(best.price)}`,
          best.distLabel.toLowerCase(),
          best.verified ? "vendedor verificado" : "verificação pendente",
          best.delivery ? "entrega" : "retirada"
        ];
        matchSub.textContent = badges.join(" • ");

        matchBtn.disabled = false;
        matchBtn.onclick = (e) => {
          e.preventDefault();
          // Simples: vai para anuncio.html (no futuro pode passar id via querystring)
          window.location.href = "anuncio.html";
        };

        matchProg.style.width = "100%";
        showMatchBar();
        // para o piscar — radar volta a "armed" enquanto a barra está aberta
        setRadarState("state-armed");
      } else {
        // Sem match: nunca "finaliza", apenas mantém radar ativo e sugere ajustar
        matchTitle.textContent = "Radar RePhone ativo";
        matchSub.textContent = "Não apareceu uma oportunidade ideal ainda. Continue navegando — avisamos quando surgir.";
        matchBtn.disabled = true;
        matchProg.style.width = "85%";
        showMatchBar();
        // mantém scan, mas desacelera: remove animação e deixa verde claro estável
        setRadarState("state-armed");
      }
    }, 10000));
  }

  // Close match bar -> circle volta a cinza e aguarda próximo clique
  matchClose.addEventListener("click", (e) => {
    e.preventDefault();
    resetMatch();
  });

  // Radar pill click: mostra status rápido
  radarPill.addEventListener("click", () => {
    if (radarPill.classList.contains("state-idle")) {
      matchTitle.textContent = "RP MATCH";
      matchSub.textContent = "Defina modelo + valor e clique em “Buscar oportunidade”.";
      matchBtn.disabled = true;
      matchProg.style.width = "20%";
      showMatchBar();
      return;
    }
    if (radarPill.classList.contains("state-armed") || radarPill.classList.contains("state-scan")) {
      matchTitle.textContent = "Radar RePhone";
      matchSub.textContent = "Monitorando oportunidades compatíveis.";
      matchBtn.disabled = true;
      showMatchBar();
    }
  });

  // Botão para iniciar busca
  buscarBtn.addEventListener("click", (e) => {
    e.preventDefault();
    startRadarFlow();
  });

  // Campo preço: formata apenas ao sair do campo (evita bug do cursor no mobile)
  priceInput.addEventListener("blur", () => {
    formatPriceInput();
    updatePriceHint(parseBRL(priceInput.value));
  });

  // Habilita botão buscar quando houver algo
  function toggleBuscar() {
    const qModel = (modelInput.value || "").trim();
    const priceVal = parseBRL(priceInput.value);
    buscarBtn.disabled = !(qModel && priceVal != null);
  }
  modelInput.addEventListener("input", toggleBuscar);
  priceInput.addEventListener("input", toggleBuscar);

  // ===== Init =====
  renderOffers(OFFERS);
  $$(".filter-btn")[0]?.classList.add("active");
  applyFilters();

  // Radar visível desde o carregamento (cinza)
  setRadarState("state-idle");

  // Estado do status (para não aparecer “Carregando…” pra sempre)
  if (offersStatus) offersStatus.textContent = "";
})();
