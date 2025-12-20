
let timer;

const price = document.getElementById('priceInput');
price.addEventListener('input', () => {
  clearTimeout(timer);
  document.getElementById('radarBadge').style.display = 'none';
  timer = setTimeout(startRadar, 5000);
});

function startRadar(){
  document.getElementById('radarBadge').style.display = 'block';
  setTimeout(showMatch, 10000);
}

function showMatch(){
  document.getElementById('radarBadge').style.display = 'none';
  document.getElementById('matchModal').style.display = 'block';
}

function closeMatch(){
  document.getElementById('matchModal').style.display = 'none';
}
