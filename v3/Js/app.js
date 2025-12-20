
const priceInput = document.getElementById("priceInput");
if(priceInput){
  priceInput.addEventListener("input", e => {
    const target = Number(e.target.value || 0);
    document.querySelectorAll("[data-price]").forEach(card => {
      const price = Number(card.dataset.price);
      const badge = card.querySelector(".badge");
      badge.textContent = target && price <= target ? "Alta compatibilidade" : "Boa compatibilidade";
    });
  });
}
