
const priceInput = document.getElementById('priceInput');
const radar = document.getElementById('radarBubble');
const matchBar = document.getElementById('matchBar');
const offers = document.getElementById('offers');

let timer;

priceInput.addEventListener('input', () => {
  clearTimeout(timer);
  radar.classList.add('hidden');
  matchBar.classList.add('hidden');

  timer = setTimeout(() => {
    radar.classList.remove('hidden');

    setTimeout(() => {
      radar.classList.add('hidden');
      matchBar.classList.remove('hidden');
    }, 10000);
  }, 5000);
});

const mockOffers = [
  "iPhone 11 · 64GB · R$ 1.890",
  "iPhone 12 · 64GB · R$ 2.500",
  "Galaxy S23 · 256GB · R$ 3.499"
];

mockOffers.forEach(o => {
  const div = document.createElement('div');
  div.className = 'card';
  div.textContent = o;
  offers.appendChild(div);
});
