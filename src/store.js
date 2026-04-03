const API = process.env.REACT_APP_API_URL || 'http://localhost:5000';

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
  const text = await res.text();
  let data;
  try { data = JSON.parse(text); } catch { throw new Error('Server error — backend may be down or not deployed yet'); }
  if (!res.ok && res.status !== 202) throw new Error(data.message || 'Request failed');
  return data;
}

// ── AUTH ──────────────────────────────────────────────────
export async function googleAuth({ credential, password, username }) {
  try {
    const data = await req('POST', '/api/google-auth', { credential, password, username });
    if (data.message === 'new_user') return { newUser: true, email: data.email };
    setToken(data.token);
    const u = data.user;
    return { user: { ...u, id: String(u.id || u._id) } };
  } catch (err) {
    return { error: err.message };
  }
}

export async function login({ emailOrUsername, password }) {
  try {
    const data = await req('POST', '/api/login', { email: emailOrUsername, password });
    setToken(data.token);
    const u = data.user;
    return { user: { ...u, id: String(u.id || u._id) } };
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
const mapLink = l => ({ ...l, id: l._id || l.id, clicks: l.clicks || 0 });

export async function getLinks() {
  try {
    const data = await req('GET', '/api/links');
    return data.map(mapLink);
  } catch { return []; }
}

export async function addLink(userId, { title, url, icon = '🔗' }) {
  try {
    const data = await req('POST', '/api/links', { title, url, icon });
    return data.map(mapLink);
  } catch { return []; }
}

export async function updateLink(userId, linkId, patch) {
  try {
    const data = await req('PATCH', `/api/links/${linkId}`, patch);
    return data.map(mapLink);
  } catch { return []; }
}

export async function deleteLink(userId, linkId) {
  try {
    const data = await req('DELETE', `/api/links/${linkId}`);
    return data.map(mapLink);
  } catch { return []; }
}

export async function trackClick(userId, linkId) {
  try { await req('POST', `/api/links/${linkId}/click`); } catch {}
}

// ── PROFILE ───────────────────────────────────────────────
export async function updateProfile(userId, { bio, avatar, photo, profileTheme }) {
  try {
    const data = await req('PATCH', '/api/me', { bio, avatar, photo, profileTheme });
    return { ...data, id: data._id || data.id };
  } catch (err) {
    console.error('updateProfile failed:', err.message);
    return null;
  }
}

export async function getMe() {
  try {
    const data = await req('GET', '/api/me');
    return { ...data, id: data._id || data.id };
  } catch { return null; }
}

// ── FOUNDER PHOTOS ─────────────────────────────────────────
export async function getFounderPhotos() {
  try { return await req('GET', '/api/founder-photos'); } catch { return {}; }
}

export async function saveFounderPhoto(name, photo) {
  try { return await req('POST', '/api/founder-photos', { name, photo }); } catch { return {}; }
}

// ── NOTIFICATIONS ─────────────────────────────────────────
export async function getNotifications() {
  try { return await req('GET', '/api/notifications'); } catch { return []; }
}
export async function markNotificationsRead() {
  try { await req('PATCH', '/api/notifications/read'); } catch {}
}
export async function clearNotifications() {
  try { await req('DELETE', '/api/notifications'); } catch {}
}

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
