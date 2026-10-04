/**
 * auth.js — Autenticación (login, registro, recuperación)
 */

const Auth = (() => {
  function login(email, password) {
    const users = Storage.get('users', []);
    const user = users.find(u => u.email === email && u.password === password);
    if (!user) return { ok: false, error: 'Credenciales incorrectas' };
    const sessionData = {
      id: user.id,
      nombre: user.nombre,
      email: user.email,
      telefono: user.telefono,
      dni: user.dni,
      avatar: user.avatar
    };
    Session.set(sessionData);
    window.dispatchEvent(new Event('auth:login'));
    return { ok: true, user: sessionData };
  }

  function register({ nombre, email, telefono, dni, password, avatar }) {
    const list = Storage.get('users', []);
    if (list.find(u => u.email === email)) {
      return { ok: false, error: 'El email ya está registrado' };
    }
    const newUser = {
      id: 'u_' + Date.now(),
      nombre,
      email,
      telefono,
      dni,
      password,
      avatar: avatar || '👤',
      fechaRegistro: new Date().toISOString()
    };
    list.push(newUser);
    Storage.set('users', list);
    return { ok: true, user: newUser };
  }

  function recoveryRequest(email) {
    const users = Storage.get('users', []);
    const user = users.find(u => u.email === email);
    if (!user) return { ok: false, error: 'Email no encontrado' };
    const token = 'tok_' + Date.now();
    const tokens = Storage.get('recovery_tokens', {});
    tokens[token] = { userId: user.id, createdAt: Date.now() };
    Storage.set('recovery_tokens', tokens);
    return { ok: true, token, email: user.email };
  }

  function resetPassword(token, newPassword) {
    const tokens = Storage.get('recovery_tokens', {});
    const data = tokens[token];
    if (!data) return { ok: false, error: 'Token inválido o expirado' };
    const users = Storage.get('users', []);
    const user = users.find(u => u.id === data.userId);
    if (!user) return { ok: false, error: 'Usuario no encontrado' };
    user.password = newPassword;
    Storage.set('users', users);
    delete tokens[token];
    Storage.set('recovery_tokens', tokens);
    return { ok: true };
  }

  function updateProfile(updates) {
    const session = Session.get();
    if (!session) return { ok: false, error: 'No autenticado' };
    const users = Storage.get('users', []);
    const idx = users.findIndex(u => u.id === session.id);
    if (idx === -1) return { ok: false, error: 'Usuario no encontrado' };
    users[idx] = { ...users[idx], ...updates };
    Storage.set('users', users);
    Session.set({ ...session, ...updates });
    window.dispatchEvent(new Event('auth:login'));
    return { ok: true };
  }

  function getCurrentFull() {
    const session = Session.get();
    if (!session) return null;
    const users = Storage.get('users', []);
    return users.find(u => u.id === session.id) || null;
  }

  return { login, register, recoveryRequest, resetPassword, updateProfile, getCurrentFull };
})();