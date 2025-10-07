// Funcionalidades generales del sitio
document.addEventListener("DOMContentLoaded", () => {
  // Navegación móvil
  const toggle = document.querySelector(".menu-toggle");
  const nav = document.querySelector(".navbar");
  if (toggle && nav) {
    toggle.addEventListener("click", () => nav.classList.toggle("open"));
  }

  // Parallax effect para el hero (respeta reduced-motion)
  const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (!prefersReduced) {
    const bg = document.querySelector('.hero-bg');
    if (bg) {
      let ticking = false;
      function onScroll() {
        if (ticking) return;
        ticking = true;
        requestAnimationFrame(() => {
          const y = window.scrollY || window.pageYOffset;
          bg.style.transform = `translate3d(0, ${y * 0.3}px, 0)`;
          ticking = false;
        });
      }
      window.addEventListener('scroll', onScroll, { passive: true });
      onScroll();
    }
  }

  // Link activo por URL (evita "Carrito" seleccionado en otras páginas)
  const links = document.querySelectorAll('.navbar a');
  if (links.length) {
    let path = location.pathname.split('/').pop();
    if (!path || path === '/') path = 'index.html';

    links.forEach(a => {
      const href = (a.getAttribute('href') || '').split(/[?#]/)[0];
      const isIndex = (path === 'index.html') && (href === '' || href === './' || href === 'index.html');
      const match = isIndex || href === path;
      a.classList.toggle('active', match);
      if (match) a.setAttribute('aria-current', 'page'); else a.removeAttribute('aria-current');
    });
  }
});
