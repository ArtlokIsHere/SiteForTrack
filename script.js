import { initializeApp } from "https://www.gstatic.com/firebasejs/10.11.0/firebase-app.js";
import {
  getAuth,
  GoogleAuthProvider,
  signInWithPopup,
  signOut,
  onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/10.11.0/firebase-auth.js";
import {
  getFirestore,
  doc,
  setDoc,
  getDoc
} from "https://www.gstatic.com/firebasejs/10.11.0/firebase-firestore.js";

// 🔧 Конфигурация Firebase
const firebaseConfig = {
  apiKey: "AIzaSyCod69i-DoHTz06Gh8oQQUTAUl_uJ7C-9E",
  authDomain: "artloktrack-f8d67.firebaseapp.com",
  projectId: "artloktrack-f8d67",
  storageBucket: "artloktrack-f8d67.firebasestorage.app",
  messagingSenderId: "67208735837",
  appId: "1:67208735837:web:c8ce7c23ba7f88c079f1b4"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);
const provider = new GoogleAuthProvider();

const taskInput = document.getElementById("taskInput");
const taskCategory = document.getElementById("taskCategory");
const taskList = document.getElementById("taskList");
const completedList = document.getElementById("completedTaskList");
const userArea = document.getElementById("userArea");
const userName = document.getElementById("userName");
let searchInput = document.getElementById("searchTaskInput");

let currentUserUID = null;
let completedVisible = false;

// 🔐 Авторизация
export function signIn() {
  signInWithPopup(auth, provider).catch((error) => {
    alert("Ошибка входа: " + error.message);
  });
}

export function signOutUser() {
  signOut(auth).then(() => {
    currentUserUID = null;
    userArea.style.display = "none";
    taskList.innerHTML = "";
    completedList.innerHTML = "";
  });
}

window.signIn = signIn;
window.signOutUser = signOutUser;
window.addTask = addTask;
window.toggleCompletedTasks = toggleCompletedTasks;

onAuthStateChanged(auth, async (user) => {
  if (user) {
    currentUserUID = user.uid;
    userName.textContent = user.displayName;
    userArea.style.display = "block";
    await renderTasks();
  } else {
    userArea.style.display = "none";
  }
});

// ➕ Добавить задачу
async function addTask() {
  const text = taskInput.value.trim();
  const category = taskCategory.value;
  if (!text || !currentUserUID) return;

  const docRef = doc(db, "tasks", currentUserUID);
  const docSnap = await getDoc(docRef);
  let tasks = docSnap.exists() ? docSnap.data().list || [] : [];

  tasks.push({ text, category, done: false });  // <-- ключевая строка
  await setDoc(docRef, { list: tasks });
  taskInput.value = "";
  await renderTasks();
}

// 🔄 Обновить задачи
async function renderTasks() {
  if (!currentUserUID) return;

  taskList.innerHTML = "";
  completedList.innerHTML = "";
  const search = searchInput.value.toLowerCase();
  const docRef = doc(db, "tasks", currentUserUID);
  const docSnap = await getDoc(docRef);
  if (!docSnap.exists()) return;

  const tasks = docSnap.data().list || [];
  const categories = ["Работа", "Дом", "Саморазвитие"];

  categories.forEach(category => {
    const active = [];
    const done = [];

    tasks.forEach((task, index) => {
      if (task.category === category && task.text.toLowerCase().includes(search)) {
        const li = createTaskElement(task, index, tasks);
        if (task.done) done.push(li);
        else active.push(li);
      }
    });

    if (active.length > 0) {
      const header = document.createElement("h3");
      header.textContent = category;
      taskList.appendChild(header);
      active.forEach(el => taskList.appendChild(el));
    }

    if (done.length > 0) {
      const header = document.createElement("h3");
      header.textContent = category;
      completedList.appendChild(header);
      done.forEach(el => completedList.appendChild(el));
    }
  });

  document.querySelector(".toggle-btn").textContent = completedVisible ? "Скрыть выполненные" : "Показать выполненные";
  completedList.className = completedVisible ? "" : "collapsed";
}

// ☑️ Элемент задачи
function createTaskElement(task, index, tasks) {
  const li = document.createElement("li");

  const mark = document.createElement("span");
  mark.className = "check-icon";
  mark.innerHTML = task.done ? "✅" : "⬜";
  mark.onclick = async () => {
    tasks[index].done = !tasks[index].done;
    await saveTasks(tasks);
    await renderTasks();
  };

  const span = document.createElement("span");
  span.textContent = task.text;
  if (task.done) {
    span.style.textDecoration = "line-through";
    span.style.color = "gray";
  }

  li.appendChild(mark);
  li.appendChild(span);
  return li;
}

// 💾 Сохранить задачи
async function saveTasks(tasks) {
  const docRef = doc(db, "tasks", currentUserUID);
  await setDoc(docRef, { list: tasks });
}

// 🔽 Показать/Скрыть выполненные
function toggleCompletedTasks() {
  completedVisible = !completedVisible;
  renderTasks();
}