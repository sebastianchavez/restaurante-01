/**
 * storage.js — Helpers para LocalStorage
 * Namespace: restaurante_*
 */

const Storage = (() => {
  const NAMESPACE = 'restaurante_';

  function key(id) { return NAMESPACE + id; }

  function get(id, fallback = null) {
    try {
      const raw = localStorage.getItem(key(id));
      return raw ? JSON.parse(raw) : fallback;
    } catch (e) {
      return fallback;
    }
  }

  function set(id, value) {
    try {
      localStorage.setItem(key(id), JSON.stringify(value));
      return true;
    } catch (e) {
      console.error('Storage error:', e);
      return false;
    }
  }

  function remove(id) {
    localStorage.removeItem(key(id));
  }

  function clear() {
    Object.keys(localStorage)
      .filter(k => k.startsWith(NAMESPACE))
      .forEach(k => localStorage.removeItem(k));
  }

  function exists(id) {
    return localStorage.getItem(key(id)) !== null;
  }

  return { get, set, remove, clear, exists, key };
})();

/**
 * Helpers de inicialización — crea datos demo si no existen
 */
const Seed = {
  init() {
    if (!Storage.exists('users')) {
      const demoUsers = [
        {
          id: 'u_demo_001',
          nombre: 'Carlos Demo',
          email: 'demo@restaurante.com',
          password: '123456',
          telefono: '+56 9 8765 4321',
          dni: '12345678-9',
          fechaRegistro: '2025-08-15T10:00:00Z',
          avatar: '👨'
        }
      ];
      Storage.set('users', demoUsers);
    }

    if (!Storage.exists('reservas')) {
      const demoReservas = [
        {
          id: 'RES-100001',
          usuarioId: 'u_demo_001',
          fecha: addDays(-7),
          hora: '20:00',
          personas: 2,
          zona: 'Salón Principal',
          ocasion: 'Aniversario',
          comentarios: 'Mesa cerca de la ventana por favor',
          precioBase: 30000,
          precioExtras: 0,
          total: 30000,
          estado: 'Completada',
          pago: { metodo: 'Tarjeta', referencia: 'OP-998877', fecha: addDays(-7) },
          createdAt: addDays(-10)
        },
        {
          id: 'RES-100002',
          usuarioId: 'u_demo_001',
          fecha: addDays(1),
          hora: '21:30',
          personas: 4,
          zona: 'VIP',
          ocasion: 'Cumpleaños',
          comentarios: '',
          precioBase: 60000,
          precioExtras: 32000,
          total: 92000,
          estado: 'Confirmada',
          pago: { metodo: 'Tarjeta', referencia: 'OP-112233', fecha: addDays(-1) },
          createdAt: addDays(-2)
        },
        {
          id: 'RES-100003',
          usuarioId: 'u_demo_001',
          fecha: addDays(3),
          hora: '19:00',
          personas: 6,
          zona: 'Terraza',
          ocasion: 'Reunión de negocios',
          comentarios: 'Necesitamos proyector',
          precioBase: 90000,
          precioExtras: 0,
          total: 90000,
          estado: 'Pendiente',
          pago: null,
          createdAt: addDays(-1)
        },
        {
          id: 'RES-100004',
          usuarioId: 'u_demo_001',
          fecha: addDays(0),
          hora: '14:00',
          personas: 2,
          zona: 'Barra',
          ocasion: '',
          comentarios: '',
          precioBase: 30000,
          precioExtras: 0,
          total: 30000,
          estado: 'En curso',
          pago: { metodo: 'Efectivo', referencia: null, fecha: addDays(0) },
          createdAt: addDays(-5)
        },
        {
          id: 'RES-100005',
          usuarioId: 'u_demo_001',
          fecha: addDays(-3),
          hora: '13:00',
          personas: 3,
          zona: 'Salón Principal',
          ocasion: '',
          comentarios: '',
          precioBase: 45000,
          precioExtras: 0,
          total: 45000,
          estado: 'Anulada',
          pago: null,
          createdAt: addDays(-5),
          motivoAnulacion: 'Cambio de planes'
        },
        {
          id: 'RES-100006',
          usuarioId: 'u_demo_001',
          fecha: addDays(-15),
          hora: '20:30',
          personas: 4,
          zona: 'VIP',
          ocasion: 'Aniversario',
          comentarios: '',
          precioBase: 60000,
          precioExtras: 32000,
          total: 92000,
          estado: 'Completada',
          pago: { metodo: 'Tarjeta', referencia: 'OP-445566', fecha: addDays(-16) },
          createdAt: addDays(-16)
        }
      ];
      Storage.set('reservas', demoReservas);
    }

    if (!Storage.exists('config')) {
      Storage.set('config', {
        nombreRestaurante: 'Le Gourmet',
        telefono: '+56 2 2345 6789',
        email: 'contacto@legourmet.cl',
        direccion: 'Av. Apoquindo 345, Las Condes, Santiago',
        precioPorPersona: 15000,
        iva: 0.19,
        zonas: [
          { id: 'salon', nombre: 'Salón Principal', precioExtra: 0 },
          { id: 'vip', nombre: 'VIP', precioExtra: 8000 },
          { id: 'terraza', nombre: 'Terraza', precioExtra: 0 },
          { id: 'barra', nombre: 'Barra', precioExtra: 0 }
        ]
      });
    }
  }
};

function addDays(n) {
  const d = new Date();
  d.setDate(d.getDate() + n);
  d.setHours(0, 0, 0, 0);
  return d.toISOString();
}

/**
 * Sesión activa
 */
const Session = {
  get() { return Storage.get('session', null); },
  set(user) { Storage.set('session', user); },
  clear() { Storage.remove('session'); },
  isLogged() { return !!Session.get(); },
  current() { return Session.get(); },
  logout() {
    Session.clear();
    window.dispatchEvent(new Event('auth:logout'));
  }
};

/**
 * Genera un ID de reserva correlativo
 */
function nextReservaId() {
  const reservas = Storage.get('reservas', []);
  if (reservas.length === 0) return 'RES-100001';
  const nums = reservas
    .map(r => parseInt(r.id.split('-')[1]))
    .filter(n => !isNaN(n));
  const max = Math.max(...nums, 100000);
  return 'RES-' + (max + 1);
}

/**
 * Hash simple (NO seguro, solo demo)
 */
function hashPassword(pwd) {
  let h = 0;
  for (let i = 0; i < pwd.length; i++) {
    h = (h << 5) - h + pwd.charCodeAt(i);
    h |= 0;
  }
  return 'h_' + Math.abs(h);
}