
requireAuth();

const user = getUser();
document.getElementById('userName').textContent = user ? user.name : '';

// Get list ID from URL: list.html?id=xxxx
const params = new URLSearchParams(window.location.search);
const listId = params.get('id');

if (!listId) window.location.href = 'dashboard.html';

let currentList = null;
let activeTagFilter = null;

const listTitleEl = document.getElementById('listTitle');
const statsBar = document.getElementById('statsBar');
const tagFilters = document.getElementById('tagFilters');
const todoListEl = document.getElementById('todoList');
const newItemForm = document.getElementById('newItemForm');
const PRESET_TAGS = ['Urgent', 'Important', 'Personal', 'Work', 'Low priority'];
let selectedTags = [];

// ---------- LOAD EVERYTHING ----------
async function loadAll() {
  await loadListInfo();
  await loadStats();
  await loadTodos();
}

// ---------- LOAD LIST INFO ----------
async function loadListInfo() {
  const res = await apiFetch(`${API}/lists/${listId}`);

  if (res.status === 401) return logout();

  if (!res.ok) {
    listTitleEl.textContent = 'List not found';
    return;
  }

  currentList = await res.json();
  listTitleEl.textContent = currentList.title;

}



// ---------- STATS ----------
async function loadStats() {
  const res = await apiFetch(`${API}/lists/${listId}/stats`);

  const stats = await res.json();

  renderStats(stats);
  renderTagFilters(stats.tagCounts);
}

function renderStats(stats) {
  statsBar.innerHTML = `
    <div class="stat-pill">
      <span class="num">${stats.total}</span> total
    </div>

    <div class="stat-pill completed">
      <span class="num">${stats.completed}</span> completed
    </div>

    <div class="stat-pill pending">
      <span class="num">${stats.pending}</span> pending
    </div>
  `;
}

// ---------- TAG FILTERS ----------
function renderTagPicker() {
  const container = document.getElementById('tagPickerOptions');
  container.innerHTML = PRESET_TAGS.map(tag => `
    <button type="button" class="tag-filter ${selectedTags.includes(tag) ? 'active' : ''}" onclick="toggleTagSelection('${tag}')">${tag}</button>
  `).join('');

  // show any custom tags the user has added, that aren't in the preset list
  selectedTags.filter(t => !PRESET_TAGS.includes(t)).forEach(tag => {
    container.innerHTML += `<button type="button" class="tag-filter active" onclick="toggleTagSelection('${escapeHtml(tag)}')">${escapeHtml(tag)} ✕</button>`;
  });
}

function toggleTagSelection(tag) {
  if (selectedTags.includes(tag)) {
    selectedTags = selectedTags.filter(t => t !== tag);
  } else {
    selectedTags.push(tag);
  }
  renderTagPicker();
}

function addCustomTag() {
  const input = document.getElementById('customTagInput');
  const value = input.value.trim();
  if (!value) return;
  if (!selectedTags.includes(value)) selectedTags.push(value);
  input.value = '';
  renderTagPicker();
}
function renderTagFilters(tagCounts) {
  const tags = Object.keys(tagCounts);

  if (tags.length === 0) {
    tagFilters.innerHTML = '';
    return;
  }

  let html = `
    <button
      class="tag-filter ${!activeTagFilter ? 'active' : ''}"
      onclick="setTagFilter(null)">
      All
    </button>
  `;

  tags.forEach(tag => {
    html += `
      <button
        class="tag-filter ${activeTagFilter === tag ? 'active' : ''}"
        onclick="setTagFilter('${tag}')">

        ${escapeHtml(tag)}

        <span class="mono">
          ${tagCounts[tag]}
        </span>
      </button>
    `;
  });

  tagFilters.innerHTML = html;
}

function setTagFilter(tag) {
  activeTagFilter = tag;

  loadTodos();
  loadStats();
}

// ---------- LOAD TODOS ----------
async function loadTodos() {
  let url = `${API}/todos/${listId}`;

  if (activeTagFilter && activeTagFilter !== 'no tag') {
    url += `?tag=${encodeURIComponent(activeTagFilter)}`;
  }

  const res = await apiFetch(url);

  let todos = await res.json();

  // "no tag" filter
  if (activeTagFilter === 'no tag') {
    todos = todos.filter(todo => todo.tags.length === 0);
  }

  renderTodos(todos);
}

// ---------- RENDER TODOS ----------
function renderTodos(todos) {
  if (todos.length === 0) {
    todoListEl.innerHTML = `
      <div class="empty-state">
        <strong>No tasks here</strong>
        <p>Add one above to get started.</p>
      </div>
    `;

    return;
  }

  todoListEl.innerHTML = '';

  todos.forEach(todo => {
    const li = document.createElement('li');

    li.className =
      `todo-item ${todo.completed ? 'completed' : ''}`;

    li.draggable = true;
    li.dataset.id = todo._id;

    // Tags
    const tagsHtml = todo.tags
      .map(tag =>
        `<span class="tag-pill ${
          tag.toLowerCase() === 'urgent'
            ? 'urgent'
            : ''
        }">
          ${escapeHtml(tag)}
        </span>`
      )
      .join('');

    // Reminder badge
    const reminderHtml = todo.reminderAt
      ? `
        <span
          class="tag-pill"
          style="border-color:#565C63;color:#565C63;">
          ⏰ ${new Date(todo.reminderAt).toLocaleString()}
        </span>
      `
      : '';

    li.innerHTML = `
      <button
        class="check-btn ${todo.completed ? 'checked' : ''}"
        onclick="toggleComplete('${todo._id}', ${todo.completed})">
        ✓
      </button>

      <div class="todo-body">
        <div class="todo-title">
          ${escapeHtml(todo.title)}
        </div>

        <div class="todo-tags">
          ${tagsHtml}
          ${reminderHtml}
        </div>
      </div>

      <button
        class="icon-btn"
        onclick="deleteTodo('${todo._id}')">
        Delete
      </button>
    `;

    // Drag start
    li.addEventListener('dragstart', () => {
      li.classList.add('dragging');
    });

    // Drag end
    li.addEventListener('dragend', () => {
      li.classList.remove('dragging');

      saveNewOrder();
    });

    todoListEl.appendChild(li);
  });
}

// ---------- DRAG AND DROP ----------
todoListEl.addEventListener('dragover', (e) => {
  e.preventDefault();

  const dragging = document.querySelector('.dragging');

  if (!dragging) return;

  const afterElement = getDragAfterElement(
    todoListEl,
    e.clientY
  );

  if (afterElement == null) {
    todoListEl.appendChild(dragging);
  } else {
    todoListEl.insertBefore(
      dragging,
      afterElement
    );
  }
});

function getDragAfterElement(container, y) {
  const items = [
    ...container.querySelectorAll(
      '.todo-item:not(.dragging)'
    )
  ];

  return items.reduce(
    (closest, child) => {
      const box = child.getBoundingClientRect();

      const offset =
        y - box.top - box.height / 2;

      if (
        offset < 0 &&
        offset > closest.offset
      ) {
        return {
          offset,
          element: child
        };
      }

      return closest;
    },
    {
      offset: Number.NEGATIVE_INFINITY
    }
  ).element;
}

// ---------- SAVE NEW ORDER ----------
async function saveNewOrder() {
  const ids = [
    ...todoListEl.querySelectorAll('.todo-item')
  ].map(li => li.dataset.id);

  if (ids.length === 0) return;

  await apiFetch(
    `${API}/todos/reorder/${listId}`,
    {
      method: 'PUT',

      body: JSON.stringify({
        orderedIds: ids
      })
    }
  );
}

// ---------- CREATE TODO WITH REMINDER ----------
newItemForm.addEventListener('submit', async (e) => {
  e.preventDefault();
  const title = document.getElementById('newItemTitle').value.trim();
  const reminderRaw = document.getElementById('newItemReminder').value;

  if (!title) return;

  await apiFetch(`${API}/todos/${listId}`, {
    method: 'POST',
    body: JSON.stringify({
      title,
      tags: selectedTags,
      reminderAt: reminderRaw ? new Date(reminderRaw).toISOString() : null
    })
  });

  document.getElementById('newItemTitle').value = '';
  document.getElementById('newItemReminder').value = '';
  selectedTags = [];
  renderTagPicker();
  loadAll();
});

// ---------- COMPLETE TODO ----------
async function toggleComplete(id, completed) {
  await apiFetch(`${API}/todos/item/${id}`, {
    method: 'PUT',

    body: JSON.stringify({
      completed: !completed
    })
  });

  loadAll();
}

// ---------- DELETE TODO ----------
async function deleteTodo(id) {
  await apiFetch(
    `${API}/todos/item/${id}`,
    {
      method: 'DELETE'
    }
  );

  loadAll();
}

// ---------- ESCAPE HTML ----------
function escapeHtml(str) {
  const div = document.createElement('div');

  div.textContent = str;

  return div.innerHTML;
}
document.getElementById('submitNewTask').addEventListener('click', async () => {
  const title = document.getElementById('newItemTitle').value.trim();
  const reminderRaw = document.getElementById('newItemReminder').value;

  if (!title) return;

  await apiFetch(`${API}/todos/${listId}`, {
    method: 'POST',
    body: JSON.stringify({
      title: title,
      tags: selectedTags,
      reminderAt: reminderRaw ? new Date(reminderRaw).toISOString() : null
    })
  });

  document.getElementById('newItemTitle').value = '';
  document.getElementById('newItemReminder').value = '';
  selectedTags = [];
  renderTagPicker();
  loadAll();
});

// ---------- INITIAL LOAD ----------
renderTagPicker();
loadAll();