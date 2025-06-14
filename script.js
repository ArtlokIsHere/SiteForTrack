// Firebase config
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.11.0/firebase-app.js";
import { getAuth, GoogleAuthProvider, signInWithPopup, signOut, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.11.0/firebase-auth.js";
import { getFirestore, doc, setDoc, getDoc, updateDoc, arrayUnion } from "https://www.gstatic.com/firebasejs/10.11.0/firebase-firestore.js";

// Твоя конфигурация
const firebaseConfig = {
  apiKey: "AIzaSyCod69i-DoHTz06Gh8oQQUTAUl_uJ7C-9E",
  authDomain: "artloktrack-f8d67.firebaseapp.com",
  projectId: "artloktrack-f8d67",
  storageBucket: "artloktrack-f8d67.firebasestorage.app",
  messagingSenderId: "67208735837",
  appId: "1:67208735837:web:c8ce7c23ba7f88c079f1b4"
};

// Инициализация Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);
const provider = new GoogleAuthProvider();

const taskInput = document.getElementById("taskInput");
const taskList = document.getElementById("taskList");
const userArea = document.getElementById("userArea");
const userName = document.getElementById("userName");

let currentUserUID = null;

export function signIn() {
  signInWithPopup(auth, provider)
    .then((result) => {
      console.log("Signed in:", result.user.displayName);
    })
    .catch((error) => {
      alert("Ошибка входа: " + error.message);
    });
}

export function signOutUser() {
  signOut(auth).then(() => {
    currentUserUID = null;
    userArea.style.display = "none";
    taskList.innerHTML = '';
  });
}

window.signIn = signIn;
window.signOut = signOutUser;
window.addTask = addTask;

onAuthStateChanged(auth, async (user) => {
  if (user) {
    currentUserUID = user.uid;
    userName.textContent = user.displayName;
    userArea.style.display = "block";
    await loadTasks();
  } else {
    userArea.style.display = "none";
  }
});

async function addTask() {
  const text = taskInput.value.trim();
  if (!text || !currentUserUID) return;

  const userDocRef = doc(db, "tasks", currentUserUID);
  const docSnap = await getDoc(userDocRef);

  if (docSnap.exists()) {
    await updateDoc(userDocRef, {
      list: arrayUnion(text)
    });
  } else {
    await setDoc(userDocRef, {
      list: [text]
    });
  }

  taskInput.value = "";
  await loadTasks();
}

async function loadTasks() {
  taskList.innerHTML = "";

  const userDocRef = doc(db, "tasks", currentUserUID);
  const docSnap = await getDoc(userDocRef);

  if (docSnap.exists()) {
    const tasks = docSnap.data().list || [];
    tasks.forEach(task => {
      const li = document.createElement("li");
      li.textContent = task;
      taskList.appendChild(li);
    });
  }
}