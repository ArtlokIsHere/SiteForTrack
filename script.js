let tasks = JSON.parse(localStorage.getItem('tasks')) || [];
let notes = JSON.parse(localStorage.getItem('notes')) || [];
let completedVisible = false;

function showSection(id) {
  document.querySelectorAll('.section').forEach(s => s.style.display = 'none');
  document.getElementById(id).style.display = 'block';

  if (id === 'tasks') renderTasks();
  else if (id === 'notes') renderNotes();
}

function saveTasks() {
  localStorage.setItem('tasks', JSON.stringify(tasks));
}

function saveNotes() {
  localStorage.setItem('notes', JSON.stringify(notes));
}

// ---------------------- ЗАДАЧИ ----------------------

function renderTasks() {
  const list = document.getElementById('taskList');
  const completedList = document.getElementById('completedTaskList');
  const search = document.getElementById('searchTaskInput').value.toLowerCase();
  list.innerHTML = '';
  completedList.innerHTML = '';

  const categories = ['Работа', 'Дом', 'Саморазвитие'];

  categories.forEach(category => {
    const activeTasks = [];
    const doneTasks = [];

    tasks.forEach((task, index) => {
      if (task.category === category && task.text.toLowerCase().includes(search)) {
        const li = createTaskElement(task, index);
        if (task.done) {
          doneTasks.push(li);
        } else {
          activeTasks.push(li);
        }
      }
    });

    if (activeTasks.length > 0) {
      const catHeader = document.createElement('h3');
      catHeader.textContent = category;
      list.appendChild(catHeader);
      activeTasks.forEach(li => list.appendChild(li));
    }

    if (doneTasks.length > 0) {
      const catHeader = document.createElement('h3');
      catHeader.textContent = category;
      completedList.appendChild(catHeader);
      doneTasks.forEach(li => completedList.appendChild(li));
    }
  });

  const btn = document.querySelector('.toggle-btn');
  btn.textContent = completedVisible ? 'Скрыть выполненные' : 'Показать выполненные';
  completedList.className = completedVisible ? '' : 'collapsed';
}

function createTaskElement(task, index) {
  const li = document.createElement('li');

  const mark = document.createElement('span');
  mark.className = 'check-icon';
  mark.innerHTML = task.done ? '✅' : '⬜';
  mark.onclick = () => toggleDone(index);

  const span = document.createElement('span');
  span.textContent = task.text;
  if (task.done) {
    span.style.textDecoration = 'line-through';
    span.style.color = 'gray';
  }

  const editBtn = document.createElement('button');
  editBtn.textContent = 'Редактировать';
  editBtn.onclick = () => editTask(index);

  const deleteBtn = document.createElement('button');
  deleteBtn.textContent = 'Удалить';
  deleteBtn.onclick = () => deleteTask(index);

  li.appendChild(mark);
  li.appendChild(span);
  li.appendChild(editBtn);
  li.appendChild(deleteBtn);

  return li;
}

function addTask() {
  const input = document.getElementById('taskInput');
  const category = document.getElementById('taskCategory').value;
  const text = input.value.trim();
  if (text) {
    tasks.push({ text, done: false, category });
    input.value = '';
    saveTasks();
    renderTasks();
  }
}

function editTask(index) {
  const newText = prompt('Изменить задачу:', tasks[index].text);
  if (newText !== null) {
    tasks[index].text = newText.trim();
    saveTasks();
    renderTasks();
  }
}

function deleteTask(index) {
  if (confirm('Удалить задачу?')) {
    tasks.splice(index, 1);
    saveTasks();
    renderTasks();
  }
}

function toggleDone(index) {
  tasks[index].done = !tasks[index].done;
  saveTasks();
  renderTasks();
}

function toggleCompletedTasks() {
  completedVisible = !completedVisible;
  renderTasks();
}

// ---------------------- ЗАМЕТКИ ----------------------

function renderNotes() {
  const list = document.getElementById('noteList');
  const search = document.getElementById('searchNoteInput').value.toLowerCase();
  list.innerHTML = '';

  notes.forEach((note, index) => {
    if (!note.toLowerCase().includes(search)) return;

    const li = document.createElement('li');

    const span = document.createElement('span');
    span.textContent = note;

    const editBtn = document.createElement('button');
    editBtn.textContent = 'Редактировать';
    editBtn.onclick = () => editNote(index);

    const deleteBtn = document.createElement('button');
    deleteBtn.textContent = 'Удалить';
    deleteBtn.onclick = () => deleteNote(index);

    li.appendChild(span);
    li.appendChild(editBtn);
    li.appendChild(deleteBtn);

    list.appendChild(li);
  });
}

function addNote() {
  const input = document.getElementById('noteInput');
  const text = input.value.trim();
  if (text) {
    notes.push(text);
    input.value = '';
    saveNotes();
    renderNotes();
  }
}

function editNote(index) {
  const newText = prompt('Изменить заметку:', notes[index]);
  if (newText !== null) {
    notes[index] = newText.trim();
    saveNotes();
    renderNotes();
  }
}

function deleteNote(index) {
  if (confirm('Удалить заметку?')) {
    notes.splice(index, 1);
    saveNotes();
    renderNotes();
  }
}

renderTasks();