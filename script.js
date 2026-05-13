// Todo App - Complete JavaScript

let tasks = [];
let editTaskId = null;
let currentWeekOffset = 0;

// Charts
let completionChart, categoryChart, weeklyChart;

// DOM Elements
document.addEventListener('DOMContentLoaded', () => {
    loadTasks();
    renderAll();
    setupEventListeners();
    updateDateTime();
    updateQuote();
    
    setInterval(() => {
        updateDateTime();
    }, 60000);
});

function loadTasks() {
    const saved = localStorage.getItem('todoAppData');
    if (saved) {
        tasks = JSON.parse(saved);
    } else {
        tasks = [
            {
                id: Date.now(),
                text: 'Complete Oasis Infobyte Task 3',
                category: 'work',
                priority: 'high',
                dueDate: new Date(Date.now() + 86400000).toISOString(),
                completed: false,
                addedDate: new Date().toLocaleString(),
                completedDate: null
            }
        ];
    }
    updateStreak();
}

function saveTasks() {
    localStorage.setItem('todoAppData', JSON.stringify(tasks));
    updateStreak();
}

function setupEventListeners() {
    document.getElementById('addBtn').addEventListener('click', addTask);
    document.getElementById('taskInput').addEventListener('keypress', (e) => {
        if (e.key === 'Enter') addTask();
    });
    
    // Navigation
    document.querySelectorAll('.nav-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            const tab = btn.dataset.tab;
            switchTab(tab);
        });
    });
    
    // Search and filter
    document.getElementById('searchInput').addEventListener('input', () => renderTasksView());
    document.getElementById('filterCategory').addEventListener('change', () => renderTasksView());
    
    // Calendar navigation
    document.getElementById('prevWeek').addEventListener('click', () => {
        currentWeekOffset--;
        renderCalendar();
    });
    document.getElementById('nextWeek').addEventListener('click', () => {
        currentWeekOffset++;
        renderCalendar();
    });
    
    // Modal
    document.getElementById('saveEditBtn').addEventListener('click', saveEdit);
}

function switchTab(tab) {
    document.querySelectorAll('.nav-btn').forEach(btn => {
        btn.classList.toggle('active', btn.dataset.tab === tab);
    });
    
    document.querySelectorAll('.tab-content').forEach(content => {
        content.classList.toggle('active', content.id === `${tab}Tab`);
    });
    
    if (tab === 'analytics') {
        initCharts();
        updateCharts();
    }
    if (tab === 'calendar') {
        renderCalendar();
    }
}

function updateDateTime() {
    const now = new Date();
    const dateStr = now.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
    document.getElementById('todayDate').textContent = dateStr;
}

const quotes = [
    "Small progress is still progress",
    "Done is better than perfect",
    "Start where you are. Use what you have",
    "The secret of getting ahead is getting started",
    "Your future self will thank you",
    "One task at a time",
    "Progress over perfection"
];

function updateQuote() {
    const quote = quotes[Math.floor(Math.random() * quotes.length)];
    document.getElementById('dailyQuote').textContent = quote;
}

function addTask() {
    const taskText = document.getElementById('taskInput').value.trim();
    if (!taskText) {
        alert('Please enter a task!');
        return;
    }
    
    const newTask = {
        id: Date.now(),
        text: taskText,
        category: document.getElementById('categorySelect').value,
        priority: document.getElementById('prioritySelect').value,
        dueDate: document.getElementById('dueDateTime').value,
        completed: false,
        addedDate: new Date().toLocaleString(),
        completedDate: null
    };
    
    tasks.push(newTask);
    saveTasks();
    renderAll();
    
    document.getElementById('taskInput').value = '';
    document.getElementById('dueDateTime').value = '';
    
    showNotification('Task added! 🎉', 'success');
}

function completeTask(taskId) {
    const task = tasks.find(t => t.id === taskId);
    if (task && !task.completed) {
        task.completed = true;
        task.completedDate = new Date().toLocaleString();
        saveTasks();
        renderAll();
        
        canvasConfetti({
            particleCount: 80,
            spread: 50,
            origin: { y: 0.6 },
            colors: ['#667eea', '#764ba2', '#f093fb']
        });
        showNotification('Great job! Task completed! 🎯', 'success');
    }
}

function deleteTask(taskId) {
    if (confirm('Delete this task?')) {
        tasks = tasks.filter(t => t.id !== taskId);
        saveTasks();
        renderAll();
        showNotification('Task deleted', 'info');
    }
}

function openEditModal(taskId) {
    const task = tasks.find(t => t.id === taskId);
    if (task) {
        editTaskId = taskId;
        document.getElementById('editInput').value = task.text;
        document.getElementById('editModal').style.display = 'flex';
    }
}

function closeModal() {
    document.getElementById('editModal').style.display = 'none';
    editTaskId = null;
}

function saveEdit() {
    const newText = document.getElementById('editInput').value.trim();
    if (newText) {
        const task = tasks.find(t => t.id === editTaskId);
        if (task) {
            task.text = newText;
            saveTasks();
            renderAll();
            showNotification('Task updated! ✏️', 'success');
        }
    }
    closeModal();
}

function showNotification(message, type) {
    const toast = document.createElement('div');
    toast.className = `toast-notification`;
    toast.innerHTML = `
        <i class="fas ${type === 'success' ? 'fa-check-circle' : 'fa-info-circle'}"></i>
        <span>${message}</span>
    `;
    toast.style.cssText = `
        position: fixed;
        bottom: 100px;
        right: 30px;
        background: ${type === 'success' ? '#2ed573' : '#667eea'};
        color: white;
        padding: 12px 20px;
        border-radius: 15px;
        display: flex;
        align-items: center;
        gap: 10px;
        z-index: 2000;
        animation: slideInRight 0.3s ease;
        font-family: 'Inter', sans-serif;
    `;
    document.body.appendChild(toast);
    setTimeout(() => toast.remove(), 2500);
}

function updateStreak() {
    const completedToday = tasks.filter(t => {
        if (!t.completedDate) return false;
        return new Date(t.completedDate).toDateString() === new Date().toDateString();
    }).length;
    
    let streak = parseInt(localStorage.getItem('streak') || '0');
    const lastDate = localStorage.getItem('lastCompleteDate');
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    
    if (completedToday > 0) {
        if (lastDate === yesterday.toDateString()) {
            streak++;
        } else if (lastDate !== new Date().toDateString()) {
            streak = 1;
        }
        localStorage.setItem('streak', streak);
        localStorage.setItem('lastCompleteDate', new Date().toDateString());
    }
    
    const streakText = streak === 1 ? `${streak} day streak` : `${streak} day streak`;
    document.getElementById('streakDisplay').textContent = streakText;
}

function renderAll() {
    renderDashboardStats();
    renderTasksView();
    updateProgressRing();
    if (document.getElementById('analyticsTab').classList.contains('active')) {
        updateCharts();
    }
}

function renderDashboardStats() {
    const total = tasks.length;
    const completed = tasks.filter(t => t.completed).length;
    const pending = total - completed;
    
    document.getElementById('totalTasksHeader').textContent = total;
    document.getElementById('completedTasksHeader').textContent = completed;
    document.getElementById('pendingTasksHeader').textContent = pending;
}

function renderTasksView() {
    const searchTerm = document.getElementById('searchInput').value.toLowerCase();
    const categoryFilter = document.getElementById('filterCategory').value;
    
    let filtered = tasks.filter(task => {
        const matchesSearch = task.text.toLowerCase().includes(searchTerm);
        const matchesCategory = categoryFilter === 'all' || task.category === categoryFilter;
        return matchesSearch && matchesCategory;
    });
    
    const pending = filtered.filter(t => !t.completed);
    const completed = filtered.filter(t => t.completed);
    
    document.getElementById('pendingCount').textContent = pending.length;
    document.getElementById('completedCount').textContent = completed.length;
    
    const pendingContainer = document.getElementById('pendingTasksList');
    if (pending.length === 0) {
        pendingContainer.innerHTML = '<div class="empty-board"><i class="fas fa-smile"></i><p>All caught up! 🎉</p></div>';
    } else {
        pendingContainer.innerHTML = pending.map(task => createTaskCard(task)).join('');
    }
    
    const completedContainer = document.getElementById('completedTasksList');
    if (completed.length === 0) {
        completedContainer.innerHTML = '<div class="empty-board"><i class="fas fa-trophy"></i><p>Complete tasks to see them here</p></div>';
    } else {
        completedContainer.innerHTML = completed.map(task => createTaskCard(task)).join('');
    }
}

function createTaskCard(task) {
    const categoryIcons = { work: '💼', personal: '🧘', shopping: '🛍️', health: '🏋️' };
    const categoryNames = { work: 'Work', personal: 'Personal', shopping: 'Shopping', health: 'Health' };
    const priorityText = { high: 'High', medium: 'Medium', low: 'Low' };
    const dueDateText = task.dueDate ? new Date(task.dueDate).toLocaleDateString() : 'No due date';
    
    return `
        <div class="task-card ${task.completed ? 'completed-task' : ''}">
            <div class="task-card-header">
                <div class="task-title">${escapeHtml(task.text)}</div>
                <span class="priority-badge ${task.priority}">${priorityText[task.priority]}</span>
            </div>
            <div class="task-category category-${task.category}">
                ${categoryIcons[task.category]} ${categoryNames[task.category]}
            </div>
            <div class="task-dates">
                📅 Added: ${task.addedDate}<br>
                ⏰ Due: ${dueDateText}
                ${task.completedDate ? `<br>✅ Completed: ${task.completedDate}` : ''}
            </div>
            <div class="task-actions">
                ${!task.completed ? `<button class="complete-btn" onclick="completeTask(${task.id})"><i class="fas fa-check"></i> Complete</button>` : ''}
                <button class="edit-btn" onclick="openEditModal(${task.id})"><i class="fas fa-edit"></i> Edit</button>
                <button class="delete-btn" onclick="deleteTask(${task.id})"><i class="fas fa-trash"></i> Delete</button>
            </div>
        </div>
    `;
}

function updateProgressRing() {
    const total = tasks.length;
    const completed = tasks.filter(t => t.completed).length;
    const percent = total > 0 ? Math.round((completed / total) * 100) : 0;
    
    const circumference = 220;
    const offset = circumference - (percent / 100) * circumference;
    const circle = document.getElementById('progressCircle');
    if (circle) {
        circle.style.strokeDashoffset = offset;
    }
    document.getElementById('progressPercent').textContent = percent;
}

function initCharts() {
    const ctx1 = document.getElementById('completionChart')?.getContext('2d');
    const ctx2 = document.getElementById('categoryChart')?.getContext('2d');
    const ctx3 = document.getElementById('weeklyChart')?.getContext('2d');
    
    if (ctx1) {
        completionChart = new Chart(ctx1, {
            type: 'doughnut',
            data: { labels: ['Completed', 'Pending'], datasets: [{ data: [0, 0], backgroundColor: ['#2ed573', '#ff4757'], borderWidth: 0 }] },
            options: { responsive: true, plugins: { legend: { labels: { color: 'white' } } } }
        });
    }
    
    if (ctx2) {
        categoryChart = new Chart(ctx2, {
            type: 'bar',
            data: { labels: ['Work', 'Personal', 'Shopping', 'Health'], datasets: [{ label: 'Tasks', data: [0, 0, 0, 0], backgroundColor: '#667eea', borderRadius: 10 }] },
            options: { responsive: true, plugins: { legend: { labels: { color: 'white' } } }, scales: { y: { ticks: { color: 'white' } }, x: { ticks: { color: 'white' } } } }
        });
    }
    
    if (ctx3) {
        weeklyChart = new Chart(ctx3, {
            type: 'line',
            data: { labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'], datasets: [{ label: 'Tasks Completed', data: [0, 0, 0, 0, 0, 0, 0], borderColor: '#f093fb', backgroundColor: 'rgba(240, 147, 251, 0.1)', tension: 0.4, fill: true }] },
            options: { responsive: true, plugins: { legend: { labels: { color: 'white' } } }, scales: { y: { ticks: { color: 'white' } }, x: { ticks: { color: 'white' } } } }
        });
    }
}

function updateCharts() {
    const completed = tasks.filter(t => t.completed).length;
    const pending = tasks.length - completed;
    
    if (completionChart) {
        completionChart.data.datasets[0].data = [completed, pending];
        completionChart.update();
    }
    
    const categories = ['work', 'personal', 'shopping', 'health'];
    const counts = categories.map(c => tasks.filter(t => t.category === c).length);
    if (categoryChart) {
        categoryChart.data.datasets[0].data = counts;
        categoryChart.update();
    }
    
    if (weeklyChart) {
        const weeklyData = [0, 0, 0, 0, 0, 0, 0];
        tasks.forEach(task => {
            if (task.completedDate) {
                const day = new Date(task.completedDate).getDay();
                const index = day === 0 ? 6 : day - 1;
                weeklyData[index]++;
            }
        });
        weeklyChart.data.datasets[0].data = weeklyData;
        weeklyChart.update();
    }
}

function renderCalendar() {
    const today = new Date();
    const startOfWeek = new Date(today);
    startOfWeek.setDate(today.getDate() + (currentWeekOffset * 7) - today.getDay());
    
    const weekRange = `${startOfWeek.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} - ${new Date(startOfWeek.getTime() + 6 * 86400000).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}`;
    document.getElementById('weekRange').textContent = weekRange;
    
    let html = '<div class="calendar-grid">';
    for (let i = 0; i < 7; i++) {
        const date = new Date(startOfWeek);
        date.setDate(startOfWeek.getDate() + i);
        const dateStr = date.toDateString();
        const dayTasks = tasks.filter(t => t.dueDate && new Date(t.dueDate).toDateString() === dateStr);
        
        html += `
            <div class="calendar-day">
                <div class="calendar-date">${date.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}</div>
                <div class="calendar-tasks">
                    ${dayTasks.map(task => `<div class="calendar-task">${task.text.substring(0, 20)}${task.text.length > 20 ? '...' : ''} ${task.completed ? '✅' : '⏳'}</div>`).join('')}
                    ${dayTasks.length === 0 ? '<div style="color:rgba(255,255,255,0.3);">✨ No tasks</div>' : ''}
                </div>
            </div>
        `;
    }
    html += '</div>';
    document.getElementById('calendarGrid').innerHTML = html;
}

function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

// Add CSS animation
const style = document.createElement('style');
style.textContent = `
    @keyframes slideInRight {
        from { transform: translateX(100%); opacity: 0; }
        to { transform: translateX(0); opacity: 1; }
    }
`;
document.head.appendChild(style);