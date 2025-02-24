import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-app.js";
import { getFirestore, collection, addDoc, getDocs, updateDoc, deleteDoc, doc, onSnapshot } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";
import { getAnalytics } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-analytics.js";

    

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyALY4ojjvEEzxA9on3N_JpK4njouJ4YiJ0",
  authDomain: "to-do-list-ac6d2.firebaseapp.com",
  projectId: "to-do-list-ac6d2",
  storageBucket: "to-do-list-ac6d2.firebasestorage.app",
  messagingSenderId: "667092373594",
  appId: "1:667092373594:web:83e3b8846b30c4531b0863",
  measurementId: "G-2MC5XZQMRV"
};


// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const tasksCollection = collection(db, "tasks");
const analytics = getAnalytics(app);



// DOM Elements
const taskInput = document.getElementById("taskInput");
const addTaskBtn = document.getElementById("addTaskBtn");
const taskList = document.getElementById("taskList");

// Add Task
async function addTask() {
    const taskText = taskInput.value.trim();
    if (taskText) {
        await addDoc(tasksCollection, { text: taskText, completed: false });
        taskInput.value = ""; // Clear input field
    }
}

// Delete Task
async function deleteTask(id) {
    await deleteDoc(doc(db, "tasks", id));
}

// Render Tasks
function renderTasks(tasks) {
  taskList.innerHTML = ""; // Clear list
  tasks.forEach(task => {
      const li = document.createElement("li");

      li.innerHTML = `
          <input type="checkbox" ${task.completed ? "checked" : ""} data-id="${task.id}">
          <span class="task-text ${task.completed ? "completed" : ""}" data-id="${task.id}">${task.text}</span>
          <input type="text" class="edit-input" data-id="${task.id}" value="${task.text}" style="display: none;">
          <button class="edit" data-id="${task.id}">Edit</button>
          <button class="save" data-id="${task.id}" style="display: none;">Save</button>
          <button class="delete" data-id="${task.id}">X</button>
      `;

      taskList.appendChild(li);
  });

  // Attach event listeners
  document.querySelectorAll("input[type='checkbox']").forEach(checkbox => {
      checkbox.addEventListener("change", () => toggleTaskCompletion(checkbox.dataset.id, checkbox.checked));
  });

  document.querySelectorAll(".edit").forEach(button => {
      button.addEventListener("click", (e) => enableInlineEdit(e.target.dataset.id));
  });

  document.querySelectorAll(".save").forEach(button => {
      button.addEventListener("click", (e) => saveTaskEdit(e.target.dataset.id));
  });

  document.querySelectorAll(".delete").forEach(button => {
      button.addEventListener("click", () => deleteTask(button.dataset.id));
  });
}


async function toggleTaskCompletion(taskId, completed) {
  const taskRef = doc(db, "tasks", taskId);
  await updateDoc(taskRef, { completed: completed });
}

async function editTask(taskId) {
  const newText = prompt("Enter new task text:");
  if (newText) {
      const taskRef = doc(db, "tasks", taskId);
      await updateDoc(taskRef, { text: newText });
  }
}


// Real-time Listener (Auto-refresh)
onSnapshot(tasksCollection, (snapshot) => {
    const tasks = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    renderTasks(tasks);
});

// Event Listeners
addTaskBtn.addEventListener("click", addTask);

function enableInlineEdit(taskId) {
  const textSpan = document.querySelector(`.task-text[data-id='${taskId}']`);
  const inputField = document.querySelector(`.edit-input[data-id='${taskId}']`);
  const editButton = document.querySelector(`.edit[data-id='${taskId}']`);
  const saveButton = document.querySelector(`.save[data-id='${taskId}']`);

  textSpan.style.display = "none";
  inputField.style.display = "inline-block";
  editButton.style.display = "none";
  saveButton.style.display = "inline-block";
}

async function saveTaskEdit(taskId) {
  const inputField = document.querySelector(`.edit-input[data-id='${taskId}']`);
  const newText = inputField.value.trim();

  if (newText) {
      const taskRef = doc(db, "tasks", taskId);
      await updateDoc(taskRef, { text: newText });
  }
}
