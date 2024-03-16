let tasks = [];  // This array will hold the task objects
let selectedTasks = new Set(); // Tracks selected tasks for multi-select functionality

document.addEventListener('DOMContentLoaded', () => {
    const addTaskBtn = document.getElementById('addTaskBtn');
    const taskInput = document.getElementById('taskInput');
    const prioritySelect = document.getElementById('prioritySelect');
    const taskList = document.getElementById('taskList');
    const startTimerBtn = document.getElementById('startTimerBtn');
    const pauseTimerBtn = document.getElementById('pauseTimerBtn');
    const resumeTimerBtn = document.getElementById('resumeTimerBtn');
    const timerDisplay = document.getElementById('timerDisplay'); // version - Ensure this element exists for the timer

    loadTasks();
    updateTimerDisplay();

    addTaskBtn.addEventListener('click', () => {
        const taskText = taskInput.value.trim();
        const priority = prioritySelect.value;

        if (!taskText) {
            alert('Please enter a task description.');
            return;
        }

        addTask(taskText, priority);
        taskInput.value = '';
        saveTasks();
    });

    startTimerBtn.addEventListener('click', () => {
        let duration = prompt("Enter timer duration in minutes:", "25");
        duration = parseInt(duration, 10);
        if (!isNaN(duration) && duration > 0) {
            startTimer(duration);
        } else {
            alert("Please enter a valid duration.");
        }
    });

    pauseTimerBtn.addEventListener('click', pauseTimer);
    resumeTimerBtn.addEventListener('click', resumeTimer);
});

function loadTasks() {
    // Load tasks from storage and render them - version - Ensure this function exists for the timer
    chrome.storage.local.get(['tasks'], function(result) {
        tasks = result.tasks || [];
        renderTasks();
    });
}

function saveTasks() {
    // Save tasks to storage
    chrome.storage.local.set({tasks: tasks});
}

function addTask(taskText, priority) {
    tasks.push({ text: taskText, priority: priority });
    sortTasksByPriority();
    renderTasks();
    saveTasks();
}

function sortTasksByPriority() {
    const priorityOrder = { 'high': 1, 'medium': 2, 'low': 3 };
    tasks.sort((a, b) => priorityOrder[a.priority] - priorityOrder[b.priority]);
}

function renderTasks() {
    const taskList = document.getElementById('taskList');
    taskList.innerHTML = '';
    tasks.forEach((task, index) => {
        const taskItem = document.createElement('li');

        const checkBox = document.createElement('input');
        checkBox.type = 'checkbox';
        checkBox.checked = selectedTasks.has(index);
        checkBox.onchange = () => checkBox.checked ? selectedTasks.add(index) : selectedTasks.delete(index);

        const textSpan = document.createElement('span');
        textSpan.textContent = `${task.text} - Priority: ${task.priority}`;

        const editButton = document.createElement('button');
        editButton.textContent = 'Edit';
        editButton.onclick = () => editTask(index);

        const deleteButton = document.createElement('button');
        deleteButton.textContent = 'Delete';
        deleteButton.onclick = () => deleteTask(index);

        taskItem.appendChild(checkBox);
        taskItem.appendChild(textSpan);
        taskItem.appendChild(editButton);
        taskItem.appendChild(deleteButton);
        taskList.appendChild(taskItem);
    });
}

function editTask(index) {
    const newText = prompt("Edit your task:", tasks[index].text);
    if (newText) {
        tasks[index].text = newText;
        renderTasks();
        saveTasks();
    }
}

function deleteTask(index) {
    tasks.splice(index, 1);
    selectedTasks.delete(index);
    renderTasks();
    saveTasks();
}

function startTimer(duration) {
    chrome.runtime.sendMessage({ command: "startTimer", duration }, handleTimerResponse);
}

function pauseTimer() {
    chrome.runtime.sendMessage({ command: "pauseTimer" }, handleTimerResponse);
}

function resumeTimer() {
    chrome.runtime.sendMessage({ command: "resumeTimer" }, handleTimerResponse);
}

function handleTimerResponse(response) {
    if (chrome.runtime.lastError) {
        console.error(chrome.runtime.lastError.message);
    } else if (response && response.message) {
        console.log(response.message);
    }
}

function updateTimerDisplay() {
    chrome.storage.local.get(['isTimerRunning', 'timerEndTime'], function(data) {
        if (data.isTimerRunning && data.timerEndTime) {
            const updateDisplay = () => {
                const now = Date.now();
                const remaining = data.timerEndTime - now;
                if (remaining <= 0) {
                    timerDisplay.textContent = "Timer Done";
                } else {
                    const minutes = Math.floor(remaining / 60000);
                    const seconds = Math.floor((remaining % 60000) / 1000);
                    timerDisplay.textContent = `${minutes}:${seconds.toString().padStart(2, '0')} remaining`;
                }
            };
            updateDisplay();
            const interval = setInterval(() => {
                updateDisplay();
                if (Date.now() >= data.timerEndTime) {
                    clearInterval(interval);
                }
            }, 1000);
        } else {
            timerDisplay.textContent = "No active timer";
        }
    });
}
