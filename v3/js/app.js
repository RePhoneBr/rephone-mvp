
(() => {
  const $ = (s, r=document) => r.querySelector(s);

  const modelInput = $("#modelInput");
  const priceInput = $("#priceInput");
  const matchBar = $("#matchBar");
  const matchTitle = $("#matchTitle");
  const matchSub = $("#matchSub");
  const progressBar = $("#progressBar");
  const matchBtn = $("#matchBtn");
  const radarBtn = $("#radarBtn");
  const expandBtn = $("#expandBtn");
  const radarPill = $("#radarPill");

  const modalBackdrop = $("#modalBackdrop");
  const closeModal = $("#closeModal");
  const modalBody = $("#modalBody");
  const openOffer = $("#openOffer");
  const adjustBtn = $("#adjustBtn");

  if(!modelInput || !priceInput || !matchBar || !matchTitle || !matchSub || !progressBar || !matchBtn || !radarBtn || !expandBtn || !radarPill) return;

  const fmtBRL = (n) => new Intl.NumberFormat("pt-BR",{style:"currency",currency:"BRL"}).format(n);
  const parseBRL = (raw) => {
    const s = String(raw||"").trim();
    if(!s) return null;
    const cleaned = s.replace(/[R$\s]/g,"");
    if(cleaned.includes(",")){
      const noDots = cleaned.replace(/\./g,"");
      const norm = noDots.replace(",", ".");
      const v = Number(norm);
      return Number.isFinite(v) ? v : null;
    }
    const v = Number(cleaned.replace(/\./g,""));
    return Number.isFinite(v) ? v : null;
  };

  priceInput.addEventListener("blur", () => {
    const v = parseBRL(priceInput.value);
    if(v == null) return;
    priceInput.value = fmtBRL(v);
  });

  const showMatchBar = () => { matchBar.classList.add("show"); matchBar.setAttribute("aria-hidden","false"); };
  const hideMatchBar = () => { matchBar.classList.remove("show"); matchBar.setAttribute("aria-hidden","true"); };
  const showRadarPill = () => { radarPill.classList.add("show"); radarPill.setAttribute("aria-hidden","false"); };
  const hideRadarPill = () => { radarPill.classList.remove("show"); radarPill.setAttribute("aria-hidden","true"); };

  const openModal = () => { if(!modalBackdrop) return; modalBackdrop.classList.add("show"); modalBackdrop.setAttribute("aria-hidden","false"); document.body.style.overflow="hidden"; };
  const closeModalFn = () => { if(!modalBackdrop) return; modalBackdrop.classList.remove("show"); modalBackdrop.setAttribute("aria-hidden","true"); document.body.style.overflow=""; };
  closeModal?.addEventListener("click", closeModalFn);
  modalBackdrop?.addEventListener("click", (e)=>{ if(e.target===modalBackdrop) closeModalFn(); });
  document.addEventListener("keydown", (e)=>{ if(e.key==="Escape") closeModalFn(); });

  let typingTimer=null;
  let processTimer=null;
  let radarTimer=null;

  function clearAllTimers(){
    if(typingTimer) clearTimeout(typingTimer);
    if(processTimer) clearInterval(processTimer);
    if(radarTimer) clearTimeout(radarTimer);
    typingTimer=processTimer=radarTimer=null;
  }

  function canRun(){
    const m = (modelInput.value||"").trim();
    const v = parseBRL(priceInput.value);
    return m.length>=3 && v!=null && v>0;
  }

  function scheduleMatch(){
    clearAllTimers();
    hideMatchBar();
    matchBtn.disabled=true;
    progressBar.style.width="0%";
    // radar não deve aparecer enquanto digita
    // (só aparece se usuário ativar radar manualmente)
    if(!canRun()) return;

    typingTimer = setTimeout(() => {
      startProcess();
    }, 5000);
  }

  function startProcess(){
    if(!canRun()) return;
    showMatchBar();
    matchTitle.textContent="Buscando MATCH…";
    matchSub.textContent="Analisando modelo e valor…";
    matchBtn.disabled=true;
    progressBar.style.width="0%";

    const total=10000;
    const tick=120;
    const start=Date.now();

    processTimer = setInterval(() => {
      const t=Date.now()-start;
      const p=Math.min(1, t/total);
      progressBar.style.width = `${Math.round(p*100)}%`;

      if(t>2000 && t<4000) matchSub.textContent="Verificando oportunidades no seu raio…";
      if(t>4000 && t<6000) matchSub.textContent="Checando sinais de confiança…";
      if(t>6000 && t<8000) matchSub.textContent="Buscando a melhor oportunidade…";
      if(t>8000) matchSub.textContent="Finalizando…";

      if(t>=total){
        clearInterval(processTimer);
        processTimer=null;
        matchTitle.textContent="MATCH encontrado";
        matchSub.textContent="Uma oportunidade compatível apareceu. Quer ver em detalhes?";
        matchBtn.disabled=false;
        progressBar.style.width="100%";
      }
    }, tick);
  }

  modelInput.addEventListener("input", scheduleMatch);
  priceInput.addEventListener("input", scheduleMatch);

  [modelInput, priceInput].forEach(el => {
    el.addEventListener("keydown", (e)=>{
      if(e.key==="Enter"){ e.preventDefault(); el.blur(); scheduleMatch(); }
    });
  });

  matchBtn.addEventListener("click", () => {
    const m=(modelInput.value||"").trim();
    const v=parseBRL(priceInput.value);
    if(modalBody){
      modalBody.innerHTML = `
        <div style="font-weight:900; font-size:1.15rem; letter-spacing:-.02em;">${m}</div>
        <div style="margin-top:.25rem; font-weight:950; font-size:1.35rem;">${v!=null?fmtBRL(v):""}</div>
        <div style="margin-top:.75rem; color: var(--muted); font-weight:800;">
          Visualização do MATCH no V3. No produto final, ele abrirá a oferta encontrada com detalhes e compra protegida.
        </div>
        <div style="margin-top:1rem; border:1px dashed rgba(22,163,74,.35); background:rgba(34,197,94,.08); border-radius:18px; padding:.85rem; font-weight:850; color:#14532d;">
          MATCH exclusivo: não fica misturado na vitrine.
        </div>
      `;
    }
    if(openOffer) openOffer.href="#";
    openModal();
  });

  adjustBtn?.addEventListener("click", () => {
    closeModalFn();
    modelInput.focus();
  });

  let radiusLevel=0;
  const radiusLabels=["Local (10 km)","Regional (80 km)","Ampliado (450 km)"];
  expandBtn.addEventListener("click", () => {
    radiusLevel = Math.min(radiusLevel+1, radiusLabels.length-1);
    matchSub.textContent = `Distância ajustada para ${radiusLabels[radiusLevel]}. Reprocessando…`;
    scheduleMatch();
  });

  radarBtn.addEventListener("click", () => {
    clearAllTimers();
    hideMatchBar();
    showRadarPill();
    const delay = 6000 + Math.round(Math.random()*6000);
    radarTimer = setTimeout(() => {
      hideRadarPill();
      showMatchBar();
      matchTitle.textContent="MATCH encontrado";
      matchSub.textContent="Radar encontrou uma oportunidade. Quer ver em detalhes?";
      progressBar.style.width="100%";
      matchBtn.disabled=false;
    }, delay);
  });

  radarPill.addEventListener("click", () => {
    showMatchBar();
    matchTitle.textContent="Radar RePhone ativo";
    matchSub.textContent="Monitorando oportunidades. Quando surgir um MATCH, mostramos aqui.";
    progressBar.style.width="100%";
    matchBtn.disabled=true;
  });

  hideMatchBar();
  hideRadarPill();
})();
