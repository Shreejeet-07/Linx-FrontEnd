const KEY = 'linx_db';

function getDB() {
  const raw = localStorage.getItem(KEY);
  if (raw) return JSON.parse(raw);
  const db = {
    users: [{
      id: 'admin-001', username: 'admin', email: 'admin@linx.app',
      password: 'admin123', bio: 'Linx administrator', avatar: '👑',
      role: 'admin', createdAt: new Date().toISOString(), links: [],
      notifications: [], profileTheme: 'default',
    }]
  };
  localStorage.setItem(KEY, JSON.stringify(db));
  return db;
}

function saveDB(db) {
  try {
    localStorage.setItem(KEY, JSON.stringify(db));
  } catch (e) {
    if (e.name === 'QuotaExceededError' || e.code === 22) {
      db.users.forEach(u => { u.photo = null; });
      try { localStorage.setItem(KEY, JSON.stringify(db)); } catch (_) {}
    }
  }
}

function compressImage(dataUrl, maxSize = 150, quality = 0.6) {
  return new Promise(resolve => {
    if (!dataUrl || !dataUrl.startsWith('data:image')) return resolve(null);
    const img = new Image();
    img.onload = () => {
      let w = img.width, h = img.height;
      if (w > h) { if (w > maxSize) { h = Math.round(h * maxSize / w); w = maxSize; } }
      else       { if (h > maxSize) { w = Math.round(w * maxSize / h); h = maxSize; } }
      const canvas = document.createElement('canvas');
      canvas.width = w; canvas.height = h;
      canvas.getContext('2d').drawImage(img, 0, 0, w, h);
      resolve(canvas.toDataURL('image/jpeg', quality));
    };
    img.onerror = () => resolve(null);
    img.src = dataUrl;
  });
}

function uid() { return Math.random().toString(36).slice(2) + Date.now().toString(36); }
function sanitize(u) { const { password, ...rest } = u; return rest; }

function pushNotification(user, notif) {
  if (!user.notifications) user.notifications = [];
  user.notifications.unshift({ id: uid(), ...notif, time: new Date().toISOString(), read: false });
  if (user.notifications.length > 50) user.notifications = user.notifications.slice(0, 50);
}

// ── AUTH ──────────────────────────────────────────────────
export function signup({ username, email, password }) {
  const db = getDB();
  if (db.users.find(u => u.email === email)) return { error: 'Email already in use' };
  if (db.users.find(u => u.username === username)) return { error: 'Username already taken' };
  const user = {
    id: uid(), username, email, password,
    bio: '', avatar: '🌟', role: 'influencer',
    createdAt: new Date().toISOString(), links: [],
    notifications: [], profileTheme: 'default',
  };
  db.users.push(user);
  saveDB(db);
  return { user: sanitize(user) };
}

export function login({ email, password }) {
  const db = getDB();
  const user = db.users.find(u => u.email === email);
  if (!user) return { error: 'User not found' };
  if (user.password !== password) return { error: 'Wrong password' };
  return { user: sanitize(user) };
}

// ── PUBLIC / GUEST ────────────────────────────────────────
export function getAllInfluencers() {
  const db = getDB();
  return db.users
    .filter(u => u.role === 'influencer')
    .map(u => ({ id: u.id, username: u.username, bio: u.bio, avatar: u.avatar, photo: u.photo || null, createdAt: u.createdAt, linkCount: u.links.filter(l => l.active).length }));
}

export function getPublicProfile(userId) {
  const db = getDB();
  const user = db.users.find(u => u.id === userId);
  if (!user) return null;
  return {
    id: user.id, username: user.username, bio: user.bio, avatar: user.avatar,
    photo: user.photo || null, profileTheme: user.profileTheme || 'default',
    links: user.links.filter(l => l.active).sort((a, b) => a.order - b.order),
  };
}

export function guestTrackClick(userId, linkId) {
  const db = getDB();
  const user = db.users.find(u => u.id === userId);
  if (!user) return;
  const link = user.links.find(l => l.id === linkId);
  if (link) {
    link.clicks += 1;
    pushNotification(user, { type: 'click', linkTitle: link.title, linkIcon: link.icon });
  }
  saveDB(db);
}

// ── INFLUENCER LINKS ──────────────────────────────────────
export function getLinks(userId) {
  const db = getDB();
  const user = db.users.find(u => u.id === userId);
  return user ? [...user.links].sort((a, b) => a.order - b.order) : [];
}

export function addLink(userId, { title, url, icon = '🔗' }) {
  const db = getDB();
  const user = db.users.find(u => u.id === userId);
  if (!user) return [];
  user.links.push({ id: uid(), title, url, icon, clicks: 0, active: true, order: user.links.length, createdAt: new Date().toISOString() });
  saveDB(db);
  return [...user.links].sort((a, b) => a.order - b.order);
}

export function updateLink(userId, linkId, patch) {
  const db = getDB();
  const user = db.users.find(u => u.id === userId);
  if (!user) return [];
  const link = user.links.find(l => l.id === linkId);
  if (link) Object.assign(link, patch);
  saveDB(db);
  return [...user.links].sort((a, b) => a.order - b.order);
}

export function deleteLink(userId, linkId) {
  const db = getDB();
  const user = db.users.find(u => u.id === userId);
  if (!user) return [];
  user.links = user.links.filter(l => l.id !== linkId);
  saveDB(db);
  return [...user.links].sort((a, b) => a.order - b.order);
}

export function trackClick(userId, linkId) {
  const db = getDB();
  const user = db.users.find(u => u.id === userId);
  if (!user) return;
  const link = user.links.find(l => l.id === linkId);
  if (link) {
    link.clicks += 1;
    pushNotification(user, { type: 'click', linkTitle: link.title, linkIcon: link.icon });
  }
  saveDB(db);
}

export async function updateProfile(userId, { bio, avatar, photo, profileTheme }) {
  const db = getDB();
  const user = db.users.find(u => u.id === userId);
  if (!user) return null;
  user.bio = bio;
  user.avatar = avatar;
  if (profileTheme !== undefined) user.profileTheme = profileTheme;
  if (photo !== undefined) {
    user.photo = photo ? await compressImage(photo) : null;
  }
  saveDB(db);
  return sanitize(user);
}

export function updateUsername(userId, newUsername) {
  const db = getDB();
  if (db.users.find(u => u.username === newUsername && u.id !== userId))
    return { error: 'Username already taken' };
  const user = db.users.find(u => u.id === userId);
  if (!user) return { error: 'User not found' };
  user.username = newUsername;
  saveDB(db);
  return { user: sanitize(user) };
}

export function updateEmail(userId, newEmail) {
  const db = getDB();
  if (db.users.find(u => u.email === newEmail && u.id !== userId))
    return { error: 'Email already in use' };
  const user = db.users.find(u => u.id === userId);
  if (!user) return { error: 'User not found' };
  user.email = newEmail;
  saveDB(db);
  return { user: sanitize(user) };
}

// ── NOTIFICATIONS ─────────────────────────────────────────
export function getNotifications(userId) {
  const db = getDB();
  const user = db.users.find(u => u.id === userId);
  return user?.notifications || [];
}

export function markNotificationsRead(userId) {
  const db = getDB();
  const user = db.users.find(u => u.id === userId);
  if (!user) return;
  (user.notifications || []).forEach(n => { n.read = true; });
  saveDB(db);
}

export function clearNotifications(userId) {
  const db = getDB();
  const user = db.users.find(u => u.id === userId);
  if (!user) return;
  user.notifications = [];
  saveDB(db);
}

// ── ADMIN ─────────────────────────────────────────────────
export function getAllUsers() {
  const db = getDB();
  return db.users.filter(u => u.role !== 'admin').map(sanitize);
}

export function adminDeleteUser(userId) {
  const db = getDB();
  db.users = db.users.filter(u => u.id !== userId);
  saveDB(db);
}

export function adminDeleteLink(userId, linkId) {
  const db = getDB();
  const user = db.users.find(u => u.id === userId);
  if (user) user.links = user.links.filter(l => l.id !== linkId);
  saveDB(db);
}
