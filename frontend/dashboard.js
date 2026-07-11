requireAuth();

const user = getUser();
document.getElementById('userName').textContent = user ? user.name : '';

const listsContainer = document.getElementById('listsContainer');
const newListForm = document.getElementById('newListForm');
const newListTitle = document.getElementById('newListTitle');

async function loadLists() {
  const res = await apiFetch(`${API}/lists`);
  if (res.status === 401) return logout(); // token expired/invalid
  const lists = await res.json();
  renderLists(lists);
}

function renderLists(lists) {
  if (lists.length === 0) {
    listsContainer.innerHTML = `
      <div class="empty-state">
        <strong>No lists yet</strong>
        <p>Create your first list above to start tracking tasks.</p>
      </div>
    `;
    return;
  }

  listsContainer.innerHTML = '';
  lists.forEach(list => {
    const div = document.createElement('div');
    div.className = 'list-card';
    div.innerHTML = `
      <div>
        <a href="list.html?id=${list._id}">${escapeHtml(list.title)}</a>
        <div class="meta">${list.isPublic ? '<span class="public-badge">Public</span>' : 'Private'}</div>
      </div>
      <div class="list-actions">
        <button class="icon-btn" onclick="renameList('${list._id}', '${escapeHtml(list.title)}')">Rename</button>
        <button class="icon-btn" onclick="deleteList('${list._id}')">Delete</button>
      </div>
    `;
    listsContainer.appendChild(div);
  });
}

newListForm.addEventListener('submit', async (e) => {
  e.preventDefault();
  const title = newListTitle.value.trim();
  if (!title) return;

  await apiFetch(`${API}/lists`, {
    method: 'POST',
    body: JSON.stringify({ title })
  });

  newListTitle.value = '';
  loadLists();
});

async function renameList(id, currentTitle) {
  const title = prompt('Rename list:', currentTitle);
  if (!title || title === currentTitle) return;

  await apiFetch(`${API}/lists/${id}`, {
    method: 'PUT',
    body: JSON.stringify({ title })
  });
  loadLists();
}

async function deleteList(id) {
  if (!confirm('Delete this list and all its tasks?')) return;

  await apiFetch(`${API}/lists/${id}`, { method: 'DELETE' });
  loadLists();
}

function escapeHtml(str) {
  const div = document.createElement('div');
  div.textContent = str;
  return div.innerHTML;
}

loadLists();