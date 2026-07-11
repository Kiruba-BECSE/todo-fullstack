requireAuth();

const user = getUser();
document.getElementById('userName').textContent = user ? user.name : '';

// get list ID from URL: list.html?id=xxxx
const params = new URLSearchParams(window.location.search);
const listId = params.get('id');

if (!listId) window.location.href = 'dashboard.html';

let currentList = null;
let activeTagFilter = null;

const listTitleEl = document.getElementById('listTitle');
const shareLabel = document.getElementById('shareLabel');
const shareUrl = document.getElementById('shareUrl');
const shareToggle = document.getElementById('shareToggle');
const statsBar = document.getElementById('statsBar');
const tagFilters = document.getElementById('tagFilters');
const todoListEl = document.getElementById('todoList');
const newItemForm = document.getElementById('newItemForm');

// ---------- Load everything ----------
async function loadAll() {
  await loadListInfo();
  await loadStats();
  await loadTodos();
}

async function loadListInfo() {
  const res = await apiFetch(`${API}/lists/${listId}`);
  if (res.status === 401) return logout();
  if (!res.ok) { listTitleEl.textContent = 'List not found'; return; }

  currentList = await res.json();
  listTitleEl.textContent = currentList.title;
  renderShareBox();
}

function renderShareBox() {
  shareToggle.classList.toggle('on', currentList.isPublic);
  if (currentList.isPublic) {
    shareLabel.textContent = 'Public sharing is on — anyone with this link can view';
    const url = `${window.location.origin}${window.location.pathname.replace('list.html', 'shared.html')}?shareId=${currentList.shareId}`;
    shareUrl.textContent = url;
    shareUrl.style.display = 'block';
  } else {
    shareLabel.textContent = 'Public sharing is off';
    shareUrl.style.display = 'none';
  }
}

async function togglePublic() {
  const res = await apiFetch(`${API}/lists/${listId}`, {
    method: 'PUT',
    body: JSON.stringify({ title: currentList.title, isPublic: !currentList.isPublic })
  });
  currentList = await res.json();
  renderShareBox();
}

// ---------- Stats ----------
async function loadStats() {
  const res = await apiFetch(`${API}/lists/${listId}/stats`);
  const stats = await res.json();
  renderStats(stats);
  renderTagFilters(stats.tagCounts);
}

function renderStats(stats) {
  statsBar.innerHTML = `
    <div class="stat-pill"><span class="num">${stats.total}</span> total</div>
    <div class="stat-pill completed"><span class="num">${stats.completed}</span> completed</div>
    <div class="stat-pill pending"><span class="num">${stats.pending}</span> pending</div>
  `;
}

function renderTagFilters(tagCounts) {
  const tags = Object.keys(tagCounts);
  if (tags.length === 0) { tagFilters.innerHTML = ''; return; }

  let html = `<button class="tag-filter ${!activeTagFilter ? 'active' : ''}" onclick="setTagFilter(null)">All</button>`;
  tags.forEach(tag => {
    html += `<button class="tag-filter ${activeTagFilter === tag ? 'active' : ''}" onclick="setTagFilter('${tag}')">${escapeHtml(tag)} <span class="mono">${tagCounts[tag]}</span></button>`;
  });
  tagFilters.innerHTML = html;
}

function setTagFilter(tag) {
  activeTagFilter = tag;
  loadTodos();
  loadStats(); // re-render filter buttons with correct active state
}

// ---------- Todo items ----------
async function loadTodos() {
  let url = `${API}/todos/${listId}`;
  if (activeTagFilter && activeTagFilter !== 'no tag') url += `?tag=${encodeURIComponent(activeTagFilter)}`;

  const res = await apiFetch(url);
  let todos = await res.json();

  // "no tag" filter isn't supported by backend query, so filter client-side
  if (activeTagFilter === 'no tag') {
    todos = todos.filter(t => t.tags.length === 0);
  }

  renderTodos(todos);
}

function renderTodos(todos) {
  if (todos.length === 0) {
    todoListEl.innerHTML = `<div class="empty-state"><strong>No tasks here</strong><p>Add one above to get started.</p></div>`;
    return;
  }

  todoListEl.innerHTML = '';
  todos.forEach(todo => {
    const li = document.createElement('li');
    li.className = `todo-item ${todo.completed ? 'completed' : ''}`;

    const tagsHtml = todo.tags.map(tag =>
      `<span class="tag-pill ${tag.toLowerCase() === 'urgent' ? 'urgent' : ''}">${escapeHtml(tag)}</span>`
    ).join('');

    li.innerHTML = `
      <button class="check-btn ${todo.completed ? 'checked' : ''}" onclick="toggleComplete('${todo._id}', ${todo.completed})">✓</button>
      <div class="todo-body">
        <div class="todo-title">${escapeHtml(todo.title)}</div>
        <div class="todo-tags">${tagsHtml}</div>
      </div>
      <button class="icon-btn" onclick="deleteTodo('${todo._id}')">Delete</button>
    `;
    todoListEl.appendChild(li);
  });
}

newItemForm.addEventListener('submit', async (e) => {
  e.preventDefault();
  const title = document.getElementById('newItemTitle').value.trim();
  const tagsRaw = document.getElementById('newItemTags').value.trim();
  const tags = tagsRaw ? tagsRaw.split(',').map(t => t.trim()).filter(Boolean) : [];

  if (!title) return;

  await apiFetch(`${API}/todos/${listId}`, {
    method: 'POST',
    body: JSON.stringify({ title, tags })
  });

  document.getElementById('newItemTitle').value = '';
  document.getElementById('newItemTags').value = '';
  loadAll();
});

async function toggleComplete(id, completed) {
  await apiFetch(`${API}/todos/item/${id}`, {
    method: 'PUT',
    body: JSON.stringify({ completed: !completed })
  });
  loadAll();
}

async function deleteTodo(id) {
  await apiFetch(`${API}/todos/item/${id}`, { method: 'DELETE' });
  loadAll();
}

function escapeHtml(str) {
  const div = document.createElement('div');
  div.textContent = str;
  return div.innerHTML;
}

loadAll();