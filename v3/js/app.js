
/* =====================================================
   RePhone MATCH – Implementação Final (Base preservada)
   - Inicia somente ao clicar em 'Buscar'
   - RP MATCH: cinza -> verde -> scanning (10s) -> barra
   - Considera modelo + preço (stub)
   - Sem % visível, sem frustração
   ===================================================== */

(function(){
  const qs = (s) => document.querySelector(s);
  const qsa = (s) => Array.from(document.querySelectorAll(s));

  // Elements (tolerant selectors)
  const rp = qs('#rp-match') || qs('.rp-match');
  const matchBar = qs('#match-bar') || qs('.match-bar');
  const closeBtn = matchBar ? (matchBar.querySelector('.close') || null) : null;

  const modelInput = qs('#modelo') || qs('#model') || qs('#modelInput');
  const priceInput = qs('#valor') || qs('#price') || qs('#priceInput');
  const searchBtn = qs('#buscar') || qs('#buscarMatch') || qs('#startMatch') || qs('button[data-action="buscar"]');

  // Timings
  const SILENT_DELAY = 5000;   // 5s
  const SCAN_TIME = 10000;     // 10s (8–12s pode variar depois)

  let timers = [];
  let active = false;
  let closed = false;

  function clearTimers(){
    timers.forEach(t => clearTimeout(t));
    timers = [];
  }

  function setStateIdle(){
    if(!rp) return;
    rp.classList.remove('ready','scanning');
    rp.style.display = 'flex';
  }

  function setStateReady(){
    if(!rp) return;
    rp.classList.add('ready');
  }

  function setStateScanning(){
    if(!rp) return;
    rp.classList.add('scanning');
  }

  function showMatchBar(){
    if(!matchBar) return;
    matchBar.style.display = 'block';
  }

  function hideMatchBar(){
    if(!matchBar) return;
    matchBar.style.display = 'none';
  }

  function endFlow(){
    active = false;
    closed = true;
    clearTimers();
    hideMatchBar();
    setStateIdle();
  }

  // Close behavior
  if(matchBar){
    const btn = closeBtn || matchBar.querySelector('[data-close]');
    if(btn){
      btn.addEventListener('click', endFlow);
    }
  }

  // Search click (mandatory trigger)
  if(searchBtn){
    searchBtn.addEventListener('click', function(){
      if(!rp) return;
      closed = false;
      active = true;
      hideMatchBar();
      setStateIdle();
      setStateReady();

      clearTimers();

      // silent delay
      timers.push(setTimeout(() => {
        if(!active || closed) return;
        setStateScanning();

        // scanning window
        timers.push(setTimeout(() => {
          if(!active || closed) return;
          // MATCH FOUND (stub): present as event, no %
          rp.classList.remove('scanning','ready');
          showMatchBar();
        }, SCAN_TIME));
      }, SILENT_DELAY));
    });
  }

  // Reset when inputs change (reactivation requires click)
  [modelInput, priceInput].forEach(el => {
    if(!el) return;
    el.addEventListener('input', () => {
      if(active){
        clearTimers();
        hideMatchBar();
        setStateIdle();
        active = false;
      }
    });
  });

  // Init
  setStateIdle();
})();

/* ===== Price Guidance (assistive, non-blocking) ===== */
(function(){
  const qs = (s)=>document.querySelector(s);
  const priceInput = qs('#valor') || qs('#price') || qs('#priceInput');
  const modelInput = qs('#modelo') || qs('#model') || qs('#modelInput');
  const box = qs('#price-guidance');
  if(!priceInput || !box) return;

  // Mock market ranges (stub; replace with real data later)
  const MARKET = {
    'iphone 11': { min: 2200, max: 2400 },
    'iphone 12': { min: 2600, max: 2900 },
    'galaxy s23': { min: 3000, max: 3400 }
  };

  function parseMoney(v){
    if(!v) return null;
    const n = Number(String(v).replace(/[^0-9]/g,''));
    return isNaN(n) ? null : n;
  }

  function getRange(){
    const key = (modelInput && modelInput.value || '').toLowerCase();
    return MARKET[key] || null;
  }

  function show(msg, actions=[]){
    box.innerHTML = '<div>'+msg+'</div>';
    if(actions.length){
      const a = document.createElement('div');
      a.className = 'actions';
      actions.forEach(btn => a.appendChild(btn));
      box.appendChild(a);
    }
    box.style.display = 'block';
  }

  function hide(){
    box.style.display = 'none';
  }

  // Reappear if value changes (decision 2-C)
  priceInput.addEventListener('input', hide);

  // Evaluate only when searching (hook into existing flow by listening to click)
  document.addEventListener('click', (e)=>{
    const t = e.target;
    if(!(t && (t.matches('#buscar') || t.matches('#buscarMatch') || t.matches('#startMatch') || t.matches('button[data-action="buscar"]')))) return;

    const value = parseMoney(priceInput.value);
    const range = getRange();
    if(!value || !range) { hide(); return; }

    if(value < range.min * 0.9){
      const btnUse = document.createElement('button');
      btnUse.textContent = `Usar sugestão (${range.min}–${range.max})`;
      btnUse.onclick = ()=>{ priceInput.value = range.min; hide(); };
      const btnKeep = document.createElement('button');
      btnKeep.textContent = 'Manter meu valor';
      show(
        `Para uma compra segura, valores entre <strong>R$ ${range.min}</strong> e <strong>R$ ${range.max}</strong> são mais comuns.`,
        [btnUse, btnKeep]
      );
    } else if(value > range.max * 1.1){
      const btnUse = document.createElement('button');
      btnUse.textContent = `Usar faixa sugerida (${range.min}–${range.max})`;
      btnUse.onclick = ()=>{ priceInput.value = range.max; hide(); };
      const btnKeep = document.createElement('button');
      btnKeep.textContent = 'Manter meu valor';
      show(
        `Você pode encontrar oportunidades semelhantes por valores menores. Faixa comum: <strong>R$ ${range.min}–${range.max}</strong>.`,
        [btnUse, btnKeep]
      );
    } else if(value < range.min){
      const btnAdj = document.createElement('button');
      btnAdj.textContent = `Ajustar para ${range.min}`;
      btnAdj.onclick = ()=>{ priceInput.value = range.min; hide(); };
      const btnKeep = document.createElement('button');
      btnKeep.textContent = 'Manter meu valor';
      show(
        `Esse valor pode reduzir as chances de encontrar rapidamente. Faixa comum: <strong>R$ ${range.min}–${range.max}</strong>.`,
        [btnAdj, btnKeep]
      );
    } else {
      hide();
    }
  });
})();
