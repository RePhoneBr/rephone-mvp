
/* ===============================
   RePhone MATCH Logic (V3 SAFE)
   Layout preserved - logic only
================================ */

let typingTimer;
let isTyping = false;
let radarRunning = false;

const RADAR_DELAY = 10000; // 10s

const radar = document.getElementById("radar") || document.getElementById("rp-radar");
const matchBox = document.getElementById("matchBox") || document.getElementById("match-bar");
const modelInput = document.querySelector("#modelo, #modelInput");
const priceInput = document.querySelector("#valor, #priceInput");

function hideMatch(){
  if(matchBox) matchBox.style.display = "none";
}

function showRadar(){
  if(radar){
    radar.style.display = "block";
  }
}

function hideRadar(){
  if(radar){
    radar.style.display = "none";
  }
}

function startRadarMatch(){
  hideMatch();
  radarRunning = true;
  showRadar();

  setTimeout(() => {
    if(!isTyping && radarRunning){
      finishRadarMatch();
    }
  }, RADAR_DELAY);
}

function finishRadarMatch(){
  hideRadar();
  radarRunning = false;

  if(matchBox){
    matchBox.style.display = "block";
  }
}

if(modelInput){
  modelInput.addEventListener("input", () => {
    isTyping = true;
    hideMatch();
    hideRadar();
    radarRunning = false;
    clearTimeout(typingTimer);
  });
}

if(priceInput){
  priceInput.addEventListener("input", () => {
    isTyping = true;
    hideMatch();
    hideRadar();
    radarRunning = false;
    clearTimeout(typingTimer);

    typingTimer = setTimeout(() => {
      isTyping = false;
      startRadarMatch();
    }, 800);
  });
}

/* Fallback manual trigger if button exists */
const manualBtn = document.querySelector("#startMatch, #buscarMatch");
if(manualBtn){
  manualBtn.addEventListener("click", () => {
    startRadarMatch();
  });
}
