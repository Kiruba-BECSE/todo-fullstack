const API = '/api/todos';
const form = document.getElementById('todoForm');
const input = document.getElementById('todoInput');
const list = document.getElementById('todoList');

async function fetchTodos() {
  const res = await fetch(API);
  const todos = await res.json();
  renderTodos(todos);
}

function renderTodos(todos) {
  list.innerHTML = '';
  todos.forEach(todo => {
    const li = document.createElement('li');
    if (todo.completed) li.classList.add('completed');
    li.innerHTML = `
      <span>${todo.title}</span>
      <div>
        <button class="toggle-btn" onclick="toggleTodo('${todo._id}', ${todo.completed})">✓</button>
        <button onclick="deleteTodo('${todo._id}')">✕</button>
      </div>
    `;
    list.appendChild(li);
  });
}

form.addEventListener('submit', async (e) => {
  e.preventDefault();
  await fetch(API, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ title: input.value })
  });
  input.value = '';
  fetchTodos();
});

async function toggleTodo(id, completed) {
  await fetch(`${API}/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ completed: !completed })
  });
  fetchTodos();
}

async function deleteTodo(id) {
  await fetch(`${API}/${id}`, { method: 'DELETE' });
  fetchTodos();
}

fetchTodos();