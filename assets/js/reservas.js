/**
 * reservas.js — CRUD de reservas
 */

const Reservas = (() => {
  function getAll() {
    const all = Storage.get('reservas', []);
    const session = Session.get();
    if (!session) return [];
    return all.filter(r => r.usuarioId === session.id)
              .sort((a, b) => new Date(b.fecha) - new Date(a.fecha));
  }

  function getById(id) {
    return Storage.get('reservas', []).find(r => r.id === id);
  }

  function create(data) {
    const session = Session.get();
    if (!session) return { ok: false, error: 'No autenticado' };
    const cfg = Storage.get('config');
    const zona = cfg.zonas.find(z => z.nombre === data.zona);
    const precioBase = cfg.precioPorPersona * data.personas;
    const precioExtras = (zona ? zona.precioExtra : 0) * data.personas;
    const reserva = {
      id: nextReservaId(),
      usuarioId: session.id,
      fecha: data.fecha,
      hora: data.hora,
      personas: parseInt(data.personas),
      zona: data.zona,
      ocasion: data.ocasion || '',
      comentarios: data.comentarios || '',
      precioBase,
      precioExtras,
      total: precioBase + precioExtras,
      estado: 'Pendiente',
      pago: null,
      createdAt: new Date().toISOString()
    };
    const list = Storage.get('reservas', []);
    list.push(reserva);
    Storage.set('reservas', list);
    return { ok: true, reserva };
  }

  function anular(id, motivo = '') {
    const list = Storage.get('reservas', []);
    const idx = list.findIndex(r => r.id === id);
    if (idx === -1) return { ok: false, error: 'Reserva no encontrada' };
    if (!['Pendiente', 'Confirmada'].includes(list[idx].estado)) {
      return { ok: false, error: 'Esta reserva no puede ser anulada' };
    }
    list[idx].estado = 'Anulada';
    list[idx].motivoAnulacion = motivo;
    list[idx].anuladaEn = new Date().toISOString();
    Storage.set('reservas', list);
    return { ok: true };
  }

  function pagar(id, metodo, referencia = null) {
    const list = Storage.get('reservas', []);
    const idx = list.findIndex(r => r.id === id);
    if (idx === -1) return { ok: false, error: 'Reserva no encontrada' };
    if (list[idx].estado === 'Anulada' || list[idx].estado === 'Completada') {
      return { ok: false, error: 'No se puede procesar el pago' };
    }
    list[idx].estado = metodo === 'Efectivo' ? 'Confirmada' : 'Pagada';
    list[idx].pago = {
      metodo,
      referencia,
      fecha: new Date().toISOString()
    };
    Storage.set('reservas', list);
    return { ok: true };
  }

  function marcarEnCurso(id) {
    const list = Storage.get('reservas', []);
    const idx = list.findIndex(r => r.id === id);
    if (idx === -1) return;
    if (list[idx].estado === 'Confirmada' || list[idx].estado === 'Pagada') {
      list[idx].estado = 'En curso';
      Storage.set('reservas', list);
    }
  }

  function getStats() {
    const list = getAll();
    return {
      total: list.length,
      pendientes: list.filter(r => r.estado === 'Pendiente').length,
      confirmadas: list.filter(r => ['Confirmada', 'Pagada'].includes(r.estado)).length,
      completadas: list.filter(r => r.estado === 'Completada').length,
      anuladas: list.filter(r => r.estado === 'Anulada').length
    };
  }

  /**
   * Slots de tiempo disponibles (cada 30 min entre 12:00 y 23:30)
   */
  function getTimeSlots() {
    const slots = [];
    for (let h = 12; h <= 23; h++) {
      slots.push(String(h).padStart(2, '0') + ':00');
      slots.push(String(h).padStart(2, '0') + ':30');
    }
    return slots;
  }

  /**
   * Calcula precio en tiempo real
   */
  function calcPrecio(personas, zona) {
    const cfg = Storage.get('config');
    const zonaData = cfg.zonas.find(z => z.nombre === zona);
    const base = cfg.precioPorPersona * (personas || 0);
    const extra = zonaData ? zonaData.precioExtra * (personas || 0) : 0;
    return { base, extra, total: base + extra };
  }

  /**
   * Calcula progreso del flujo según el estado
   */
  function getStepInfo(reserva) {
    const steps = [
      { id: 'created', label: 'Creada', completed: true },
      { id: 'confirmed', label: 'Confirmada', completed: ['Confirmada', 'Pagada', 'En curso', 'Completada'].includes(reserva.estado) },
      { id: 'paid', label: 'Pagada', completed: ['Pagada', 'En curso', 'Completada'].includes(reserva.estado) },
      { id: 'done', label: 'Completada', completed: reserva.estado === 'Completada' }
    ];
    return steps;
  }

  return {
    getAll, getById, create, anular, pagar, marcarEnCurso, getStats,
    getTimeSlots, calcPrecio, getStepInfo
  };
})();