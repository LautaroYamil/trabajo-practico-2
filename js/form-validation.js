// Validación del formulario de compra
document.addEventListener("DOMContentLoaded", () => {
  const purchaseForm = document.getElementById('purchaseForm');
  if (!purchaseForm) return;

  purchaseForm.addEventListener('submit', (e) => {
    e.preventDefault();

    // Al menos un producto con cantidad > 0
    const hasProducts = Array.from(document.querySelectorAll('.product-quantity'))
      .some(input => parseInt(input.value, 10) > 0);

    if (!hasProducts) {
      alert('Por favor, seleccione al menos un producto.');
      return;
    }

    alert('¡Pedido realizado con éxito! Nos contactaremos a la brevedad para coordinar el pago y envío.');
    purchaseForm.reset();
  });
});
