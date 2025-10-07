// Catálogo (mantuve tu estructura; si querés, podés sumar priceNumber para cálculos futuros)
const products = [
  {
    id: 1,
    title: "Combo Mate + Bombilla Acero",
    price: "$5.000",
    description: "Set completo con mate de cerámica artesanal y bombilla de acero inoxidable de primera calidad.",
    material: "Cerámica y acero inoxidable",
    capacity: "Mate para 250ml",
    origin: "Misiones, Argentina",
    availability: "En stock",
    mainImage: "assets/combo-mate.jpg",
    thumbnails: [] // <- ya no se usan
  },
  {
    id: 2,
    title: "Yerba Mate 500g elaborada con palo",
    price: "$1.800",
    description: "Yerba mate tradicional con palo, estacionada y equilibrada.",
    material: "Yerba mate natural",
    capacity: "500 gramos",
    origin: "Andresito, Misiones",
    availability: "En stock",
    mainImage: "assets/yerba-500g.jpg",
    thumbnails: []
  },
  {
    id: 3,
    title: "Termo Soberanía Acero",
    price: "$39.900",
    description: "Termo de acero inoxidable 1L. Mantiene temperatura por horas.",
    material: "Acero inoxidable",
    capacity: "1 litro",
    origin: "Importado, ensamblado en Argentina",
    availability: "En stock",
    mainImage: "assets/termo-acero.jpg",
    thumbnails: []
  },
  {
    id: 4,
    title: "Termo Soberanía Plástico",
    price: "$15.000",
    description: "Termo plástico 1L libre de BPA, resistente y liviano.",
    material: "Plástico libre de BPA",
    capacity: "1 litro",
    origin: "Argentina",
    availability: "En stock",
    mainImage: "assets/termo-plastico.jpg",
    thumbnails: []
  }
];

function initProducts() {
  // 1) Toggle de vistas (Tabla / Cajas)
  const viewOptions = document.querySelectorAll(".view-option");
  const viewSections = document.querySelectorAll(".view-section");
  viewOptions.forEach(option => {
    option.addEventListener("click", () => {
      viewOptions.forEach(opt => opt.classList.remove("active"));
      viewSections.forEach(section => section.classList.remove("active"));
      option.classList.add("active");
      const viewId = option.getAttribute("data-view");
      const targetSection = document.getElementById(`${viewId}-view`);
      if (targetSection) targetSection.classList.add("active");
    });
  });

  // 2) Modal de productos
  const productModal = document.getElementById('productModal');
  const viewProductButtons = document.querySelectorAll('.view-product');
  const closeModalButton = document.querySelector('.close-modal');
  const prevProductButton = document.getElementById('prevProduct');
  const nextProductButton = document.getElementById('nextProduct');
  const buyNowBtn = document.getElementById('buyNowBtn');

  let currentProductId = null;

  // Abrir modal
  viewProductButtons.forEach(button => {
    button.addEventListener('click', (e) => {
      e.preventDefault();
      const productId = parseInt(button.getAttribute('data-product'), 10);
      showProductDetail(productId);
    });
  });

  // Cerrar modal
  function closeModal() {
    if (!productModal) return;
    productModal.classList.remove('active');
    document.body.style.overflow = 'auto';
  }
  closeModalButton?.addEventListener('click', closeModal);
  productModal?.addEventListener('click', (e) => { if (e.target === productModal) closeModal(); });
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && productModal?.classList.contains('active')) closeModal();
  });

  // Navegación entre productos
  prevProductButton?.addEventListener('click', () => {
    if (currentProductId == null) return;
    let prevId = currentProductId - 1;
    if (prevId < 1) prevId = products.length;
    showProductDetail(prevId);
  });
  nextProductButton?.addEventListener('click', () => {
    if (currentProductId == null) return;
    let nextId = currentProductId + 1;
    if (nextId > products.length) nextId = 1;
    showProductDetail(nextId);
  });

  // Comprar ahora → agrega y lleva al carrito
  buyNowBtn?.addEventListener('click', () => {
    if (!currentProductId) return;
    addToCart(currentProductId);
    closeModal();
    window.location.href = 'carrito.html';
  });

  // Agregar al carrito desde el modal (sin notificación extra: ya notifica cart.js)
  const addToCartBtn = document.querySelector('.btn-cart');
  addToCartBtn?.addEventListener('click', () => {
    if (!currentProductId) return;
    addToCart(currentProductId);
  });

  // Mostrar detalles (sin miniaturas)
  function showProductDetail(productId) {
    const product = products.find(p => p.id === productId);
    if (!product) return;

    currentProductId = productId;

    const setText = (id, text) => {
      const el = document.getElementById(id);
      if (el) el.textContent = text;
    };

    setText('modalProductTitle', product.title);
    setText('modalProductPrice', product.price);
    setText('modalProductDescription', product.description);
    setText('modalProductMaterial', product.material);
    setText('modalProductCapacity', product.capacity);
    setText('modalProductOrigin', product.origin);
    setText('modalProductAvailability', product.availability);

    const mainImage = document.getElementById('modalProductImage');
    if (mainImage) {
      mainImage.src = product.mainImage;
      mainImage.alt = product.title;
    }

    // Ocultar contenedor de miniaturas si existiera en el HTML
    const thumbs = document.querySelector('.product-thumbnails');
    if (thumbs) {
      thumbs.innerHTML = '';
      thumbs.style.display = 'none';
    }

    if (productModal) {
      productModal.classList.add('active');
      document.body.style.overflow = 'hidden';
    }
  }

  // Integración con carrito
  function addToCart(productId) {
    const product = products.find(p => p.id === productId);
    if (!product) return;

    if (typeof window.cart !== 'undefined' && window.cart?.addItem) {
      window.cart.addItem(product, 1);
    } else {
      // Fallback simple a localStorage si aún no está inicializado el carrito
      const raw = localStorage.getItem('cart');
      const store = raw ? JSON.parse(raw) : [];
      const found = store.find(i => i.id === product.id);
      if (found) found.quantity += 1;
      else store.push({ ...product, quantity: 1 });
      localStorage.setItem('cart', JSON.stringify(store));
    }
    showToast(`Producto agregado: ${product.title}`);
  }

  // Toast flotante
  function showToast(message) {
    let toast = document.getElementById('toastNotification');
    if (!toast) {
      toast = document.createElement('div');
      toast.id = 'toastNotification';
      toast.className = 'toast-notification';
      document.body.appendChild(toast);
    }
    toast.textContent = message;
    toast.classList.add('show');
    setTimeout(() => {
      toast.classList.remove('show');
    }, 2000);
  }
}

document.addEventListener("DOMContentLoaded", initProducts);
