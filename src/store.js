const API = 'https://linxbackend.onrender.com';

function getToken() { return localStorage.getItem('linx_token'); }
function setToken(t) { localStorage.setItem('linx_token', t); }
function removeToken() { localStorage.removeItem('linx_token'); }

async function req(method, path, body) {
  const headers = { 'Content-Type': 'application/json' };
  const token = getToken();
  if (token) headers['Authorization'] = `Bearer ${token}`;
  const res = await fetch(`${API}${path}`, {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined,
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || 'Request failed');
  return data;
}

// ── AUTH ──────────────────────────────────────────────────
export async function signup({ username, email, password }) {
  try {
    const data = await req('POST', '/api/signup', { username, email, password });
    setToken(data.token);
    return { user: { ...data.user, id: data.user.id || data.user._id } };
  } catch (err) {
    return { error: err.message };
  }
}

export async function login({ email, password }) {
  try {
    const data = await req('POST', '/api/login', { email, password });
    setToken(data.token);
    return { user: { ...data.user, id: data.user.id || data.user._id } };
  } catch (err) {
    return { error: err.message };
  }
}

export function logout() { removeToken(); }

// ── PUBLIC / GUEST ────────────────────────────────────────
export async function getAllInfluencers() {
  try {
    const data = await req('GET', '/api/users');
    return data.map(u => ({ ...u, id: u._id || u.id }));
  } catch { return []; }
}

export async function getPublicProfile(userId) {
  try {
    const data = await req('GET', `/api/users/${userId}`);
    return { ...data, id: data._id || data.id };
  } catch { return null; }
}

export async function guestTrackClick(userId, linkId) {
  try { await req('POST', `/api/users/${userId}/links/${linkId}/click`); } catch {}
}

// ── INFLUENCER LINKS ──────────────────────────────────────
export async function getLinks() {
  try {
    const data = await req('GET', '/api/links');
    return data.map(l => ({ ...l, id: l._id || l.id }));
  } catch { return []; }
}

export async function addLink(userId, { title, url, icon = '🔗' }) {
  try {
    const data = await req('POST', '/api/links', { title, url, icon });
    return data.map(l => ({ ...l, id: l._id || l.id }));
  } catch { return []; }
}

export async function updateLink(userId, linkId, patch) {
  try {
    const data = await req('PATCH', `/api/links/${linkId}`, patch);
    return data.map(l => ({ ...l, id: l._id || l.id }));
  } catch { return []; }
}

export async function deleteLink(userId, linkId) {
  try {
    const data = await req('DELETE', `/api/links/${linkId}`);
    return data.map(l => ({ ...l, id: l._id || l.id }));
  } catch { return []; }
}

export async function trackClick(userId, linkId) {
  try { await req('POST', `/api/links/${linkId}/click`); } catch {}
}

// ── PROFILE ───────────────────────────────────────────────
export async function updateProfile(userId, { bio, avatar }) {
  try {
    const data = await req('PATCH', '/api/me', { bio, avatar });
    return { ...data, id: data._id || data.id };
  } catch { return null; }
}

export async function getMe() {
  try {
    const data = await req('GET', '/api/me');
    return { ...data, id: data._id || data.id };
  } catch { return null; }
}

// ── NOTIFICATIONS ─────────────────────────────────────────
export function getNotifications() { return []; }
export function markNotificationsRead() {}
export function clearNotifications() {}

// ── ADMIN ─────────────────────────────────────────────────
export async function getAllUsers() {
  try {
    const data = await req('GET', '/api/admin/users');
    return data.map(u => ({ ...u, id: u._id || u.id }));
  } catch { return []; }
}

export async function adminDeleteUser(userId) {
  try { await req('DELETE', `/api/admin/users/${userId}`); } catch {}
}

export async function adminDeleteLink(userId, linkId) {
  try { await req('DELETE', `/api/admin/users/${userId}/links/${linkId}`); } catch {}
}
