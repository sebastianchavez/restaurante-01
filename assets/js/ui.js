/**
 * ui.js — Utilidades de UI reutilizables
 * Toasts, modales, validaciones, formateadores
 */

const UI = (() => {
  let toastContainer;

  function init() {
    if (!toastContainer) {
      toastContainer = document.createElement('div');
      toastContainer.className = 'toast-container';
      document.body.appendChild(toastContainer);
    }
    Seed.init();
    enforceAuthIfRequired();
    renderUserMenu();
  }

  /**
   * Muestra una notificación toast
   */
  function toast(message, type = 'info', duration = 3500) {
    if (!toastContainer) init();
    const icons = {
      success: '✓',
      error: '✕',
      warning: '⚠',
      info: 'ℹ'
    };
    const el = document.createElement('div');
    el.className = `toast ${type}`;
    el.innerHTML = `
      <span style="font-size:1.2rem; font-weight:700; color:var(--color-${type === 'success' ? 'success' : type === 'error' ? 'danger' : type === 'warning' ? 'warning' : 'info'});"></span>
      <span style="flex:1;">${message}</span>
    `;
    el.querySelector('span').textContent = icons[type] || 'ℹ';
    toastContainer.appendChild(el);
    setTimeout(() => {
      el.style.opacity = '0';
      el.style.transform = 'translateX(120%)';
      el.style.transition = 'all 0.3s ease';
      setTimeout(() => el.remove(), 300);
    }, duration);
  }

  /**
   * Abre un modal por ID
   */
  function openModal(id) {
    const modal = document.getElementById(id);
    if (modal) modal.classList.add('active');
  }

  function closeModal(id) {
    const modal = document.getElementById(id);
    if (modal) modal.classList.remove('active');
  }

  function confirm(title, message, onConfirm, confirmText = 'Confirmar', danger = false) {
    const modalId = 'modalConfirm_' + Date.now();
    const html = `
      <div id="${modalId}" class="modal-overlay active">
        <div class="modal-content" style="max-width:28rem;">
          <h3 class="font-display text-2xl mb-3" style="color:var(--color-noir);">${title}</h3>
          <p style="color:var(--color-noir-soft); margin-bottom:1.5rem; line-height:1.6;">${message}</p>
          <div class="flex gap-3 justify-end">
            <button class="btn-secondary" data-action="cancel">Cancelar</button>
            <button class="${danger ? 'btn-danger' : 'btn-primary'}" data-action="ok">${confirmText}</button>
          </div>
        </div>
      </div>
    `;
    document.body.insertAdjacentHTML('beforeend', html);
    const modal = document.getElementById(modalId);
    modal.addEventListener('click', e => {
      if (e.target === modal || e.target.dataset.action === 'cancel') {
        modal.remove();
      }
      if (e.target.dataset.action === 'ok') {
        modal.remove();
        onConfirm();
      }
    });
  }

  /**
   * Validadores de campos
   */
  const Validators = {
    required: v => v && v.toString().trim().length > 0,
    email: v => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v),
    minLength: (v, n) => v && v.length >= n,
    numeric: v => /^\d+$/.test(v),
    phone: v => /^[\d\s+()-]{7,}$/.test(v),
    date: v => !isNaN(Date.parse(v)),
    futureDate: v => {
      const d = new Date(v);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      return d >= today;
    },
    cardNumber: v => {
        const v2 = v.replace(/\s/g, '');
        return /^\d{13,19}$/.test(v2);
    },
    cvv: v => /^\d{3,4}$/.test(v),
    expiry: v => /^(0[1-9]|1[0-2])\/\d{2}$/.test(v)
  };

  /**
   * Valida un formulario y muestra errores inline
   * rules = { fieldName: [validatorFn, message] }
   */
  function validateForm(form, rules) {
    const errors = {};
    Object.keys(rules).forEach(name => {
      const value = form.elements[name] ? form.elements[name].value : '';
      const [validator, msg] = rules[name];
      if (!validator(value)) {
        errors[name] = msg;
        const input = form.elements[name];
        if (input) input.classList.add('error');
      } else {
        const input = form.elements[name];
        if (input) input.classList.remove('error');
      }
    });
    Object.keys(errors).forEach(name => {
      const input = form.elements[name];
      if (input && input.parentElement) {
        const existing = input.parentElement.querySelector('.error-msg');
        if (existing) existing.remove();
        const span = document.createElement('span');
        span.className = 'error-msg';
        span.textContent = errors[name];
        input.parentElement.appendChild(span);
      }
    });
    return Object.keys(errors).length === 0;
  }

  function clearFormErrors(form) {
    form.querySelectorAll('.error').forEach(el => el.classList.remove('error'));
    form.querySelectorAll('.error-msg').forEach(el => el.remove());
  }

  /**
   * Formateadores
   */
  const Format = {
    currency: n => 'CLP$ ' + Number(n || 0).toLocaleString('es-CL', { maximumFractionDigits: 0 }),
    date: iso => {
      const d = new Date(iso);
      return d.toLocaleDateString('es-PE', { day: '2-digit', month: 'long', year: 'numeric' });
    },
    dateShort: iso => {
      const d = new Date(iso);
      return d.toLocaleDateString('es-PE', { day: '2-digit', month: 'short' });
    },
    time: h => h,
    dayName: iso => {
      const d = new Date(iso);
      return d.toLocaleDateString('es-PE', { weekday: 'long', day: '2-digit', month: 'long' });
    }
  };

  /**
   * Manejo del header dinámico según autenticación
   */
  function renderUserMenu() {
    const slot = document.getElementById('auth-slot');
    if (!slot) return;
    const session = Session.get();
    if (session) {
      slot.innerHTML = `
        <div class="relative group">
          <button class="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-cream-dark transition" id="userMenuBtn">
            <span class="text-xl">${session.avatar || '👤'}</span>
            <span class="hidden sm:inline text-sm font-semibold">${session.nombre.split(' ')[0]}</span>
            <span class="text-xs">▾</span>
          </button>
          <div id="userMenu" class="hidden absolute right-0 mt-2 w-56 bg-white rounded-lg shadow-lg border border-gray-100 py-2 z-50">
            <div class="px-4 py-2 border-b border-gray-100">
              <p class="text-sm font-semibold truncate">${session.nombre}</p>
              <p class="text-xs text-gray-500 truncate">${session.email}</p>
            </div>
            <a href="${basePath()}pages/perfil.html" class="block px-4 py-2 text-sm hover:bg-cream-dark">👤 Mi perfil</a>
            <a href="${basePath()}pages/historial-reservas.html" class="block px-4 py-2 text-sm hover:bg-cream-dark">📅 Mis reservas</a>
            <a href="${basePath()}pages/reservar.html" class="block px-4 py-2 text-sm hover:bg-cream-dark">➕ Nueva reserva</a>
            <hr class="my-1">
            <a href="javascript:void(0)" id="btnLogout" class="block px-4 py-2 text-sm hover:bg-cream-dark text-red-700">↩ Cerrar sesión</a>
          </div>
        </div>
      `;
      const btn = document.getElementById('userMenuBtn');
      const menu = document.getElementById('userMenu');
      btn.addEventListener('click', e => {
        e.stopPropagation();
        menu.classList.toggle('hidden');
      });
      document.addEventListener('click', () => menu.classList.add('hidden'));
      const logoutBtn = document.getElementById('btnLogout');
      if (logoutBtn) {
        logoutBtn.addEventListener('click', () => {
          Session.logout();
          toast('Sesión cerrada', 'info');
          setTimeout(() => location.href = basePath() + 'index.html', 600);
        });
      }
    } else {
      slot.innerHTML = `
        <a href="${basePath()}pages/login.html" class="text-sm font-semibold nav-link">Ingresar</a>
        <a href="${basePath()}pages/registro.html" class="btn-primary text-xs px-4 py-2">Registrarse</a>
      `;
    }
  }

  /**
   * Calcula la ruta base según la profundidad
   */
  function basePath() {
    const inPages = window.location.pathname.includes('/pages/');
    return inPages ? '../' : '';
  }

  /**
   * Si la página requiere autenticación, redirige al login
   */
  function enforceAuthIfRequired() {
    const requiresAuth = document.body.dataset.requiresAuth === 'true';
    if (requiresAuth && !Session.isLogged()) {
      toast('Debes iniciar sesión para acceder', 'warning');
      const redirect = encodeURIComponent(window.location.pathname);
      setTimeout(() => location.href = `${basePath()}pages/login.html?redirect=${redirect}`, 800);
    }
  }

  /**
   * Menú móvil toggle
   */
  function bindMobileMenu() {
    const btn = document.getElementById('mobileMenuBtn');
    const menu = document.getElementById('mobileMenu');
    if (!btn || !menu) return;
    btn.addEventListener('click', () => {
      menu.classList.toggle('hidden');
    });
  }

  /**
   * Construye el header y footer estándar
   */
  function buildChrome() {
    const inPages = window.location.pathname.includes('/pages/');
    const base = basePath();
    const cfg = Storage.get('config', { nombreRestaurante: 'Restaurante' });

    if (!document.querySelector('.site-header')) {
      const headerHtml = `
        <header class="site-header">
          <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div class="flex items-center justify-between h-16 sm:h-20">
              <a href="${base}index.html" class="flex items-center gap-2 sm:gap-3">
                <span class="text-2xl sm:text-3xl">🍷</span>
                <span class="font-display text-xl sm:text-2xl font-bold tracking-wide" style="color:var(--color-noir);">
                  ${cfg.nombreRestaurante}
                </span>
              </a>
              <nav class="hidden lg:flex items-center gap-8">
                <a href="${base}index.html" class="nav-link">Inicio</a>
                <a href="${base}pages/servicios.html" class="nav-link">Servicios</a>
                <a href="${base}pages/contacto.html" class="nav-link">Contacto</a>
                <a href="${base}pages/reservar.html" class="nav-link">Reservar</a>
              </nav>
              <div class="flex items-center gap-2 sm:gap-4">
                <div id="auth-slot" class="flex items-center gap-2 sm:gap-4"></div>
                <button id="mobileMenuBtn" class="lg:hidden p-2 rounded-lg hover:bg-cream-dark">
                  <span class="text-2xl">☰</span>
                </button>
              </div>
            </div>
            <div id="mobileMenu" class="hidden lg:hidden pb-4 border-t border-gray-100">
              <a href="${base}index.html" class="block py-2 nav-link">Inicio</a>
              <a href="${base}pages/servicios.html" class="block py-2 nav-link">Servicios</a>
              <a href="${base}pages/contacto.html" class="block py-2 nav-link">Contacto</a>
              <a href="${base}pages/reservar.html" class="block py-2 nav-link">Reservar</a>
            </div>
          </div>
        </header>
      `;
      document.body.insertAdjacentHTML('afterbegin', headerHtml);
    }

    if (!document.querySelector('.site-footer')) {
      const footerHtml = `
        <footer class="site-footer mt-16">
          <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
            <div class="grid grid-cols-1 md:grid-cols-4 gap-8">
              <div>
                <div class="flex items-center gap-2 mb-4">
                  <span class="text-2xl">🍷</span>
                  <span class="font-display text-xl font-bold text-gold">${cfg.nombreRestaurante}</span>
                </div>
                <p class="text-sm text-gray-400 leading-relaxed">Cocina de autor inspirada en tradiciones mediterráneas y latinoamericanas.</p>
              </div>
              <div>
                <h4 class="font-display text-lg mb-4 text-gold">Navegación</h4>
                <ul class="space-y-2 text-sm text-gray-400">
                  <li><a href="${base}index.html" class="hover:text-gold">Inicio</a></li>
                  <li><a href="${base}pages/servicios.html" class="hover:text-gold">Servicios</a></li>
                  <li><a href="${base}pages/contacto.html" class="hover:text-gold">Contacto</a></li>
                  <li><a href="${base}pages/reservar.html" class="hover:text-gold">Reservar</a></li>
                </ul>
              </div>
              <div>
                <h4 class="font-display text-lg mb-4 text-gold">Legal</h4>
                <ul class="space-y-2 text-sm text-gray-400">
                  <li><a href="${base}pages/terminos-condiciones.html" class="hover:text-gold">Términos y condiciones</a></li>
                  <li><a href="${base}pages/politica-privacidad.html" class="hover:text-gold">Política de privacidad</a></li>
                </ul>
              </div>
              <div>
                <h4 class="font-display text-lg mb-4 text-gold">Contacto</h4>
                <ul class="space-y-2 text-sm text-gray-400">
                  <li>📍 ${cfg.direccion}</li>
                  <li>📞 ${cfg.telefono}</li>
                  <li>✉ ${cfg.email}</li>
                </ul>
                <div class="flex gap-3 mt-4">
                  <a href="#" class="hover:text-gold">📘</a>
                  <a href="#" class="hover:text-gold">📷</a>
                  <a href="#" class="hover:text-gold">🐦</a>
                </div>
              </div>
            </div>
            <div class="border-t border-gray-800 mt-8 pt-6 text-center text-sm text-gray-500">
              © ${new Date().getFullYear()} ${cfg.nombreRestaurante}. Todos los derechos reservados.
            </div>
          </div>
        </footer>
      `;
      document.body.insertAdjacentHTML('beforeend', footerHtml);
    }

    bindMobileMenu();
  }

  document.addEventListener('DOMContentLoaded', () => {
    init();
    buildChrome();
    renderUserMenu();
    hydrateImages();
    window.addEventListener('auth:logout', () => renderUserMenu());
  });

  /**
   * Hidrata contenedores .img-cover a partir de data-img con fallback
   */
  function hydrateImages() {
    document.querySelectorAll('[data-img]').forEach(el => {
      const url = el.dataset.img;
      const fallback = el.dataset.fallback || '🖼';
      if (!url) {
        el.textContent = fallback;
        return;
      }
      const test = new Image();
      test.onload = () => {
        el.style.backgroundImage = `url('${url}')`;
        el.textContent = '';
      };
      test.onerror = () => {
        el.classList.add('placeholder-img');
        el.textContent = fallback;
      };
      test.src = url;
    });
  }

  return {
    toast, openModal, closeModal, confirm, validateForm, clearFormErrors,
    Format, Validators, init, buildChrome, renderUserMenu, basePath, hydrateImages
  };
})();