const API = '/api';

function saveAuth(token, user) {
  localStorage.setItem('token', token);
  localStorage.setItem('user', JSON.stringify(user));
}

function getToken() {
  return localStorage.getItem('token');
}

function getUser() {
  const u = localStorage.getItem('user');
  return u ? JSON.parse(u) : null;
}

function logout() {
  localStorage.removeItem('token');
  localStorage.removeItem('user');
  window.location.href = 'index.html';
}

function requireAuth() {
  if (!getToken()) window.location.href = 'index.html';
}

async function apiFetch(url, options = {}) {
  const headers = options.headers || {};
  headers['Content-Type'] = 'application/json';
  headers['Authorization'] = `Bearer ${getToken()}`;
  const res = await fetch(url, { ...options, headers });
  return res;
}

function showError(el, message) {
  el.textContent = message;
  el.classList.add('show');
}