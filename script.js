/**
 * TaskFlow Pro - Interactive Web Application
 * Demonstrating JavaScript Capabilities:
 * - Dynamic JSON Array manipulation (CRUD, Filter, Search, Sort)
 * - Strict client-side validation engine with custom error display
 * - Real-time JSON data inspector and storage synchronization (LocalStorage & File I/O)
 * - Event-driven reactive UI rendering
 */

// Global State
const STORAGE_KEY = 'TASKFLOW_PRO_TASKS_DATA_V1';

// Sample default data (JSON Array) loaded if no localStorage exists
const INITIAL_TASKS = [
    {
        id: 'task_1711200001',
        title: 'Design Responsive Dashboard UI',
        description: 'Create high-fidelity wireframes and responsive layouts for desktop and mobile devices.',
        category: 'Work',
        priority: 'High',
        dueDate: '2026-10-15',
        estimatedHours: 6.5,
        status: 'In Progress',
        createdAt: '2026-09-20T10:30:00.000Z'
    },
    {
        id: 'task_1711200002',
        title: 'Revise Web Tech JavaScript Concepts',
        description: 'Deep dive into JavaScript Array methods (map, filter, reduce, sort) and JSON serialization.',
        category: 'Study',
        priority: 'Urgent',
        dueDate: '2026-09-30',
        estimatedHours: 4.0,
        status: 'Pending',
        createdAt: '2026-09-21T14:15:00.000Z'
    },
    {
        id: 'task_1711200003',
        title: 'Monthly Budget & Savings Analysis',
        description: 'Audit monthly utility expenses, subscriptions, and allocate investment budget in spreadsheets.',
        category: 'Finance',
        priority: 'Medium',
        dueDate: '2026-10-05',
        estimatedHours: 2.0,
        status: 'Completed',
        createdAt: '2026-09-18T09:00:00.000Z'
    },
    {
        id: 'task_1711200004',
        title: 'Complete 5km Morning Jogging',
        description: 'Maintain cardio routine with a warm-up stretch followed by a 5km outdoor jog.',
        category: 'Health',
        priority: 'Low',
        dueDate: '2026-09-28',
        estimatedHours: 1.0,
        status: 'Completed',
        createdAt: '2026-09-19T06:30:00.000Z'
    }
];

let tasks = [];
let taskToDeleteId = null;

// DOM Elements
const elements = {
    // Stats
    statTotal: document.getElementById('statTotal'),
    statPending: document.getElementById('statPending'),
    statInProgress: document.getElementById('statInProgress'),
    statCompleted: document.getElementById('statCompleted'),
    taskCountBadge: document.getElementById('taskCountBadge'),
    arrayLengthCount: document.getElementById('arrayLengthCount'),

    // Containers & List
    tasksGrid: document.getElementById('tasksGrid'),
    emptyState: document.getElementById('emptyState'),
    jsonLiveViewer: document.getElementById('jsonLiveViewer'),

    // Search & Filters
    searchInput: document.getElementById('searchInput'),
    btnClearSearch: document.getElementById('btnClearSearch'),
    filterCategory: document.getElementById('filterCategory'),
    filterPriority: document.getElementById('filterPriority'),
    filterStatus: document.getElementById('filterStatus'),
    sortBy: document.getElementById('sortBy'),
    btnResetFilters: document.getElementById('btnResetFilters'),

    // View toggles
    btnViewGrid: document.getElementById('btnViewGrid'),
    btnViewList: document.getElementById('btnViewList'),

    // Modals
    taskModal: document.getElementById('taskModal'),
    modalTitle: document.getElementById('modalTitle'),
    modalIcon: document.getElementById('modalIcon'),
    btnCloseModal: document.getElementById('btnCloseModal'),
    btnCancelModal: document.getElementById('btnCancelModal'),
    btnOpenAddModal: document.getElementById('btnOpenAddModal'),
    btnEmptyAddTask: document.getElementById('btnEmptyAddTask'),

    // Form & Inputs
    taskForm: document.getElementById('taskForm'),
    taskId: document.getElementById('taskId'),
    taskTitle: document.getElementById('taskTitle'),
    taskDescription: document.getElementById('taskDescription'),
    taskCategory: document.getElementById('taskCategory'),
    taskPriority: document.getElementById('taskPriority'),
    taskDueDate: document.getElementById('taskDueDate'),
    taskHours: document.getElementById('taskHours'),
    formGlobalError: document.getElementById('formGlobalError'),
    formGlobalErrorText: document.getElementById('formGlobalErrorText'),

    // Feedback elements
    titleError: document.getElementById('titleError'),
    descriptionError: document.getElementById('descriptionError'),
    categoryError: document.getElementById('categoryError'),
    priorityError: document.getElementById('priorityError'),
    dueDateError: document.getElementById('dueDateError'),
    hoursError: document.getElementById('hoursError'),

    // Delete Modal
    confirmModal: document.getElementById('confirmModal'),
    btnConfirmDelete: document.getElementById('btnConfirmDelete'),
    btnCancelDelete: document.getElementById('btnCancelDelete'),
    confirmDeleteMessage: document.getElementById('confirmDeleteMessage'),

    // JSON import/export
    btnExportJson: document.getElementById('btnExportJson'),
    jsonFileInput: document.getElementById('jsonFileInput'),
    btnCopyJson: document.getElementById('btnCopyJson'),

    // Toast Container
    toastContainer: document.getElementById('toastContainer')
};

// ==========================================
// Initialization & Data Loading
// ==========================================
function initApp() {
    loadTasksFromStorage();
    setupEventListeners();
    setMinDueDateToday();
    renderApp();
}

function loadTasksFromStorage() {
    try {
        const stored = localStorage.getItem(STORAGE_KEY);
        if (stored) {
            tasks = JSON.parse(stored);
            if (!Array.isArray(tasks)) {
                tasks = [...INITIAL_TASKS];
            }
        } else {
            tasks = [...INITIAL_TASKS];
            saveTasksToStorage();
        }
    } catch (e) {
        console.error('Error loading JSON data from LocalStorage:', e);
        tasks = [...INITIAL_TASKS];
    }
}

function saveTasksToStorage() {
    try {
        const serialized = JSON.stringify(tasks, null, 2);
        localStorage.setItem(STORAGE_KEY, serialized);
        updateJsonInspector(serialized);
    } catch (e) {
        showToast('Error saving data to LocalStorage', 'error');
    }
}

function updateJsonInspector(jsonString) {
    if (!jsonString) {
        jsonString = JSON.stringify(tasks, null, 2);
    }
    elements.jsonLiveViewer.querySelector('code').textContent = jsonString;
    elements.arrayLengthCount.textContent = tasks.length;
}

function setMinDueDateToday() {
    const today = new Date().toISOString().split('T')[0];
    elements.taskDueDate.setAttribute('min', today);
}

// ==========================================
// Form Validation Engine
// ==========================================
/**
 * Validates a single field or all fields
 * Returns { isValid: boolean, errors: Object }
 */
function validateField(fieldName, value) {
    let error = '';

    switch (fieldName) {
        case 'title':
            if (!value || value.trim() === '') {
                error = 'Task title is required.';
            } else if (value.trim().length < 3) {
                error = 'Title must be at least 3 characters long.';
            } else if (value.trim().length > 60) {
                error = 'Title cannot exceed 60 characters.';
            }
            break;

        case 'description':
            if (!value || value.trim() === '') {
                error = 'Task description is required.';
            } else if (value.trim().length < 10) {
                error = 'Description must be at least 10 characters long.';
            }
            break;

        case 'category':
            const validCategories = ['Work', 'Study', 'Personal', 'Finance', 'Health'];
            if (!value || !validCategories.includes(value)) {
                error = 'Please select a valid category.';
            }
            break;

        case 'priority':
            const validPriorities = ['Urgent', 'High', 'Medium', 'Low'];
            if (!value || !validPriorities.includes(value)) {
                error = 'Please select a priority level.';
            }
            break;

        case 'dueDate':
            if (!value) {
                error = 'Due date is required.';
            } else {
                const today = new Date();
                today.setHours(0, 0, 0, 0);
                const selectedDate = new Date(value + 'T00:00:00');
                if (isNaN(selectedDate.getTime())) {
                    error = 'Invalid date format.';
                } else if (selectedDate < today) {
                    error = 'Due date cannot be set in the past.';
                }
            }
            break;

        case 'hours':
            const num = parseFloat(value);
            if (value === '' || isNaN(num)) {
                error = 'Estimated hours is required and must be a number.';
            } else if (num < 0.5) {
                error = 'Minimum estimated effort is 0.5 hours.';
            } else if (num > 100) {
                error = 'Maximum estimated effort is 100 hours.';
            }
            break;
    }

    return error;
}

function setFieldValidationState(inputElement, errorElement, errorMessage) {
    if (errorMessage) {
        inputElement.classList.add('is-invalid');
        inputElement.classList.remove('is-valid');
        errorElement.textContent = errorMessage;
        errorElement.classList.add('active');
    } else {
        inputElement.classList.remove('is-invalid');
        inputElement.classList.add('is-valid');
        errorElement.textContent = '';
        errorElement.classList.remove('active');
    }
}

function validateAllFormFields() {
    const fields = [
        { name: 'title', input: elements.taskTitle, error: elements.titleError, val: elements.taskTitle.value },
        { name: 'description', input: elements.taskDescription, error: elements.descriptionError, val: elements.taskDescription.value },
        { name: 'category', input: elements.taskCategory, error: elements.categoryError, val: elements.taskCategory.value },
        { name: 'priority', input: elements.taskPriority, error: elements.priorityError, val: elements.taskPriority.value },
        { name: 'dueDate', input: elements.taskDueDate, error: elements.dueDateError, val: elements.taskDueDate.value },
        { name: 'hours', input: elements.taskHours, error: elements.hoursError, val: elements.taskHours.value }
    ];

    let isAllValid = true;
    const errorList = [];

    fields.forEach(field => {
        const errorMsg = validateField(field.name, field.val);
        setFieldValidationState(field.input, field.error, errorMsg);
        if (errorMsg) {
            isAllValid = false;
            errorList.push(errorMsg);
        }
    });

    if (!isAllValid) {
        elements.formGlobalError.style.display = 'flex';
        elements.formGlobalErrorText.textContent = `Please fix ${errorList.length} invalid field(s) before saving.`;
    } else {
        elements.formGlobalError.style.display = 'none';
    }

    return isAllValid;
}

function resetValidationState() {
    elements.formGlobalError.style.display = 'none';
    const inputs = elements.taskForm.querySelectorAll('.form-control');
    inputs.forEach(input => {
        input.classList.remove('is-invalid', 'is-valid');
    });
    const feedbacks = elements.taskForm.querySelectorAll('.field-feedback');
    feedbacks.forEach(fb => {
        fb.textContent = '';
        fb.classList.remove('active');
    });
}

// ==========================================
// CRUD Operations on Task Array
// ==========================================
function handleFormSubmit(e) {
    e.preventDefault();

    if (!validateAllFormFields()) {
        showToast('Validation failed. Please correct highlighted fields.', 'error');
        return;
    }

    const taskIdVal = elements.taskId.value;
    const statusRadio = document.querySelector('input[name="taskStatus"]:checked');
    const statusVal = statusRadio ? statusRadio.value : 'Pending';

    // Construct JSON object from validated form fields
    const taskPayload = {
        title: elements.taskTitle.value.trim(),
        description: elements.taskDescription.value.trim(),
        category: elements.taskCategory.value,
        priority: elements.taskPriority.value,
        dueDate: elements.taskDueDate.value,
        estimatedHours: parseFloat(elements.taskHours.value),
        status: statusVal
    };

    if (taskIdVal) {
        // Edit existing task in Array
        const index = tasks.findIndex(t => t.id === taskIdVal);
        if (index !== -1) {
            tasks[index] = {
                ...tasks[index],
                ...taskPayload,
                updatedAt: new Date().toISOString()
            };
            showToast('Task updated successfully!', 'success');
        }
    } else {
        // Create new task and push to Array
        const newTask = {
            id: 'task_' + Date.now(),
            ...taskPayload,
            createdAt: new Date().toISOString()
        };
        tasks.unshift(newTask); // Add to beginning of array
        showToast('New task added successfully!', 'success');
    }

    saveTasksToStorage();
    renderApp();
    closeTaskModal();
}

function openCreateTaskModal() {
    resetValidationState();
    elements.taskForm.reset();
    elements.taskId.value = '';
    elements.modalTitle.textContent = 'Create New Task';
    elements.modalIcon.className = 'fa-solid fa-file-pen';
    const defaultRadio = document.querySelector('input[name="taskStatus"][value="Pending"]');
    if (defaultRadio) defaultRadio.checked = true;

    elements.taskModal.classList.add('show');
    elements.taskModal.setAttribute('aria-hidden', 'false');
    elements.taskTitle.focus();
}

function openEditTaskModal(taskId) {
    const task = tasks.find(t => t.id === taskId);
    if (!task) return;

    resetValidationState();
    elements.taskId.value = task.id;
    elements.taskTitle.value = task.title;
    elements.taskDescription.value = task.description;
    elements.taskCategory.value = task.category;
    elements.taskPriority.value = task.priority;
    elements.taskDueDate.value = task.dueDate;
    elements.taskHours.value = task.estimatedHours;

    const statusRadio = document.querySelector(`input[name="taskStatus"][value="${task.status}"]`);
    if (statusRadio) statusRadio.checked = true;

    elements.modalTitle.textContent = 'Edit Task Details';
    elements.modalIcon.className = 'fa-solid fa-pen-to-square';

    elements.taskModal.classList.add('show');
    elements.taskModal.setAttribute('aria-hidden', 'false');
    elements.taskTitle.focus();
}

function closeTaskModal() {
    elements.taskModal.classList.remove('show');
    elements.taskModal.setAttribute('aria-hidden', 'true');
}

function updateTaskStatus(taskId, newStatus) {
    const task = tasks.find(t => t.id === taskId);
    if (task) {
        task.status = newStatus;
        task.updatedAt = new Date().toISOString();
        saveTasksToStorage();
        renderApp();
        showToast(`Task status updated to "${newStatus}"`, 'info');
    }
}

function openDeleteConfirm(taskId) {
    const task = tasks.find(t => t.id === taskId);
    if (!task) return;

    taskToDeleteId = taskId;
    elements.confirmDeleteMessage.textContent = `Are you sure you want to delete "${task.title}"? This will remove the object from the JSON storage array.`;
    elements.confirmModal.classList.add('show');
}

function closeDeleteConfirm() {
    taskToDeleteId = null;
    elements.confirmModal.classList.remove('show');
}

function executeDeleteTask() {
    if (!taskToDeleteId) return;

    // JavaScript Array filter to remove item
    tasks = tasks.filter(t => t.id !== taskToDeleteId);
    saveTasksToStorage();
    renderApp();
    closeDeleteConfirm();
    showToast('Task removed from array.', 'success');
}

// ==========================================
// Filtering, Searching & Sorting Pipeline
// ==========================================
function getProcessedTasks() {
    const searchQuery = elements.searchInput.value.toLowerCase().trim();
    const catFilter = elements.filterCategory.value;
    const prioFilter = elements.filterPriority.value;
    const statusFilter = elements.filterStatus.value;
    const sortVal = elements.sortBy.value;

    // 1. Filter pipeline using Array.prototype.filter
    let filtered = tasks.filter(task => {
        // Search text matching (title or description or category)
        const matchesSearch = !searchQuery || 
            task.title.toLowerCase().includes(searchQuery) ||
            task.description.toLowerCase().includes(searchQuery) ||
            task.category.toLowerCase().includes(searchQuery);

        // Category filter
        const matchesCat = (catFilter === 'ALL') || (task.category === catFilter);

        // Priority filter
        const matchesPrio = (prioFilter === 'ALL') || (task.priority === prioFilter);

        // Status filter
        const matchesStatus = (statusFilter === 'ALL') || (task.status === statusFilter);

        return matchesSearch && matchesCat && matchesPrio && matchesStatus;
    });

    // 2. Sorting pipeline using Array.prototype.sort
    const priorityWeight = { 'Urgent': 4, 'High': 3, 'Medium': 2, 'Low': 1 };

    filtered.sort((a, b) => {
        switch (sortVal) {
            case 'date-desc':
                return new Date(b.createdAt || 0) - new Date(a.createdAt || 0);
            case 'date-asc':
                return new Date(a.createdAt || 0) - new Date(b.createdAt || 0);
            case 'due-asc':
                return new Date(a.dueDate) - new Date(b.dueDate);
            case 'due-desc':
                return new Date(b.dueDate) - new Date(a.dueDate);
            case 'priority-desc':
                return (priorityWeight[b.priority] || 0) - (priorityWeight[a.priority] || 0);
            case 'title-asc':
                return a.title.localeCompare(b.title);
            default:
                return 0;
        }
    });

    return filtered;
}

// ==========================================
// UI Rendering
// ==========================================
function renderApp() {
    renderStats();
    renderTasksList();
    updateJsonInspector();
}

function renderStats() {
    const total = tasks.length;
    const pending = tasks.filter(t => t.status === 'Pending').length;
    const inProgress = tasks.filter(t => t.status === 'In Progress').length;
    const completed = tasks.filter(t => t.status === 'Completed').length;

    elements.statTotal.textContent = total;
    elements.statPending.textContent = pending;
    elements.statInProgress.textContent = inProgress;
    elements.statCompleted.textContent = completed;
}

function renderTasksList() {
    const processed = getProcessedTasks();
    elements.taskCountBadge.textContent = `${processed.length} of ${tasks.length} tasks`;

    if (processed.length === 0) {
        elements.emptyState.style.display = 'block';
        elements.tasksGrid.innerHTML = '';
        return;
    }

    elements.emptyState.style.display = 'none';

    const todayStr = new Date().toISOString().split('T')[0];

    // Build Task Cards
    const cardsHtml = processed.map(task => {
        const isOverdue = task.dueDate < todayStr && task.status !== 'Completed';
        const isCompleted = task.status === 'Completed';

        return `
            <div class="task-card ${isCompleted ? 'is-completed' : ''}" data-id="${task.id}" data-priority="${escapeHtml(task.priority)}">
                <div>
                    <div class="card-top">
                        <div class="card-badges">
                            <span class="badge badge-category">
                                <i class="fa-solid fa-folder-open"></i> ${escapeHtml(task.category)}
                            </span>
                            <span class="badge badge-priority-${escapeHtml(task.priority)}">
                                <i class="fa-solid fa-flag"></i> ${escapeHtml(task.priority)}
                            </span>
                        </div>
                        <div class="card-actions-menu">
                            <button class="action-btn-sm" onclick="openEditTaskModal('${task.id}')" title="Edit Task">
                                <i class="fa-regular fa-pen-to-square"></i>
                            </button>
                            <button class="action-btn-sm btn-del" onclick="openDeleteConfirm('${task.id}')" title="Delete Task">
                                <i class="fa-regular fa-trash-can"></i>
                            </button>
                        </div>
                    </div>

                    <h3 class="task-title">${escapeHtml(task.title)}</h3>
                    <p class="task-desc" title="${escapeHtml(task.description)}">${escapeHtml(task.description)}</p>
                </div>

                <div class="card-bottom">
                    <div class="task-meta-row">
                        <div class="meta-item ${isOverdue ? 'is-overdue' : ''}">
                            <i class="fa-regular fa-calendar"></i>
                            <span>${formatDateDisplay(task.dueDate)} ${isOverdue ? '(Overdue)' : ''}</span>
                        </div>
                        <div class="meta-item">
                            <i class="fa-regular fa-clock"></i>
                            <span>${task.estimatedHours}h est.</span>
                        </div>
                    </div>

                    <div class="status-toggle-bar">
                        <span class="badge badge-status-${task.status.replace(/\s+/g, '')}">
                            ${escapeHtml(task.status)}
                        </span>
                        <select class="custom-status-select" onchange="updateTaskStatus('${task.id}', this.value)">
                            <option value="Pending" ${task.status === 'Pending' ? 'selected' : ''}>Pending</option>
                            <option value="In Progress" ${task.status === 'In Progress' ? 'selected' : ''}>In Progress</option>
                            <option value="Completed" ${task.status === 'Completed' ? 'selected' : ''}>Completed</option>
                        </select>
                    </div>
                </div>
            </div>
        `;
    }).join('');

    elements.tasksGrid.innerHTML = cardsHtml;
}

// ==========================================
// JSON Import & Export Utilities
// ==========================================
function exportToJsonFile() {
    try {
        const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(tasks, null, 2));
        const downloadAnchor = document.createElement('a');
        downloadAnchor.setAttribute("href", dataStr);
        downloadAnchor.setAttribute("download", `taskflow_backup_${new Date().toISOString().slice(0, 10)}.json`);
        document.body.appendChild(downloadAnchor);
        downloadAnchor.click();
        downloadAnchor.remove();
        showToast('JSON data exported successfully!', 'success');
    } catch (e) {
        showToast('Failed to export JSON file.', 'error');
    }
}

function handleJsonImport(event) {
    const file = event.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = function(e) {
        try {
            const parsedData = JSON.parse(e.target.result);
            if (!Array.isArray(parsedData)) {
                throw new Error('Imported JSON must be an array of task objects.');
            }

            // Validate that imported objects contain required structure
            let validCount = 0;
            const importedTasks = [];

            parsedData.forEach(item => {
                if (item && item.title && item.category && item.priority) {
                    importedTasks.push({
                        id: item.id || ('task_' + Math.random().toString(36).substr(2, 9)),
                        title: String(item.title).substring(0, 60),
                        description: String(item.description || 'Imported task details'),
                        category: item.category,
                        priority: item.priority,
                        dueDate: item.dueDate || new Date().toISOString().split('T')[0],
                        estimatedHours: parseFloat(item.estimatedHours) || 1,
                        status: item.status || 'Pending',
                        createdAt: item.createdAt || new Date().toISOString()
                    });
                    validCount++;
                }
            });

            if (validCount === 0) {
                showToast('No valid task objects found in JSON file.', 'error');
                return;
            }

            tasks = importedTasks;
            saveTasksToStorage();
            renderApp();
            showToast(`Successfully imported ${validCount} tasks from JSON!`, 'success');
        } catch (err) {
            showToast('Invalid JSON file format: ' + err.message, 'error');
        }
    };
    reader.readAsText(file);
    event.target.value = ''; // Reset input
}

function copyJsonToClipboard() {
    const jsonText = JSON.stringify(tasks, null, 2);
    navigator.clipboard.writeText(jsonText).then(() => {
        showToast('JSON copied to clipboard!', 'info');
    }).catch(() => {
        showToast('Failed to copy to clipboard', 'error');
    });
}

// ==========================================
// Toast Notification System
// ==========================================
function showToast(message, type = 'info') {
    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;
    
    let iconClass = 'fa-solid fa-circle-info';
    if (type === 'success') iconClass = 'fa-solid fa-circle-check';
    if (type === 'error') iconClass = 'fa-solid fa-triangle-exclamation';

    toast.innerHTML = `
        <i class="${iconClass}"></i>
        <span>${escapeHtml(message)}</span>
    `;

    elements.toastContainer.appendChild(toast);

    setTimeout(() => {
        toast.style.opacity = '0';
        toast.style.transform = 'translateX(100%)';
        toast.style.transition = 'all 0.3s ease';
        setTimeout(() => toast.remove(), 300);
    }, 3500);
}

// ==========================================
// Helper Functions
// ==========================================
function escapeHtml(str) {
    if (!str) return '';
    return String(str)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#039;');
}

function formatDateDisplay(dateStr) {
    if (!dateStr) return '';
    try {
        const parts = dateStr.split('-');
        if (parts.length === 3) {
            const date = new Date(parts[0], parts[1] - 1, parts[2]);
            return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
        }
        return dateStr;
    } catch {
        return dateStr;
    }
}

// ==========================================
// Event Listeners Setup
// ==========================================
function setupEventListeners() {
    // Modal Open & Close
    elements.btnOpenAddModal.addEventListener('click', openCreateTaskModal);
    elements.btnEmptyAddTask.addEventListener('click', openCreateTaskModal);
    elements.btnCloseModal.addEventListener('click', closeTaskModal);
    elements.btnCancelModal.addEventListener('click', closeTaskModal);
    elements.taskModal.addEventListener('click', (e) => {
        if (e.target === elements.taskModal) closeTaskModal();
    });

    // Delete Modal
    elements.btnCancelDelete.addEventListener('click', closeDeleteConfirm);
    elements.btnConfirmDelete.addEventListener('click', executeDeleteTask);
    elements.confirmModal.addEventListener('click', (e) => {
        if (e.target === elements.confirmModal) closeDeleteConfirm();
    });

    // Form Submission & Real-time Validations
    elements.taskForm.addEventListener('submit', handleFormSubmit);

    elements.taskTitle.addEventListener('input', () => {
        const error = validateField('title', elements.taskTitle.value);
        setFieldValidationState(elements.taskTitle, elements.titleError, error);
    });

    elements.taskDescription.addEventListener('input', () => {
        const error = validateField('description', elements.taskDescription.value);
        setFieldValidationState(elements.taskDescription, elements.descriptionError, error);
    });

    elements.taskCategory.addEventListener('change', () => {
        const error = validateField('category', elements.taskCategory.value);
        setFieldValidationState(elements.taskCategory, elements.categoryError, error);
    });

    elements.taskPriority.addEventListener('change', () => {
        const error = validateField('priority', elements.taskPriority.value);
        setFieldValidationState(elements.taskPriority, elements.priorityError, error);
    });

    elements.taskDueDate.addEventListener('change', () => {
        const error = validateField('dueDate', elements.taskDueDate.value);
        setFieldValidationState(elements.taskDueDate, elements.dueDateError, error);
    });

    elements.taskHours.addEventListener('input', () => {
        const error = validateField('hours', elements.taskHours.value);
        setFieldValidationState(elements.taskHours, elements.hoursError, error);
    });

    // Search & Filter Events
    elements.searchInput.addEventListener('input', () => {
        elements.btnClearSearch.style.display = elements.searchInput.value ? 'block' : 'none';
        renderTasksList();
    });

    elements.btnClearSearch.addEventListener('click', () => {
        elements.searchInput.value = '';
        elements.btnClearSearch.style.display = 'none';
        renderTasksList();
    });

    elements.filterCategory.addEventListener('change', renderTasksList);
    elements.filterPriority.addEventListener('change', renderTasksList);
    elements.filterStatus.addEventListener('change', renderTasksList);
    elements.sortBy.addEventListener('change', renderTasksList);

    elements.btnResetFilters.addEventListener('click', () => {
        elements.searchInput.value = '';
        elements.btnClearSearch.style.display = 'none';
        elements.filterCategory.value = 'ALL';
        elements.filterPriority.value = 'ALL';
        elements.filterStatus.value = 'ALL';
        elements.sortBy.value = 'date-desc';
        renderTasksList();
        showToast('All filters have been reset', 'info');
    });

    // View switchers
    elements.btnViewGrid.addEventListener('click', () => {
        elements.btnViewGrid.classList.add('active');
        elements.btnViewList.classList.remove('active');
        elements.tasksGrid.classList.add('view-grid-mode');
        elements.tasksGrid.classList.remove('view-list-mode');
    });

    elements.btnViewList.addEventListener('click', () => {
        elements.btnViewList.classList.add('active');
        elements.btnViewGrid.classList.remove('active');
        elements.tasksGrid.classList.add('view-list-mode');
        elements.tasksGrid.classList.remove('view-grid-mode');
    });

    // Import & Export
    elements.btnExportJson.addEventListener('click', exportToJsonFile);
    elements.jsonFileInput.addEventListener('change', handleJsonImport);
    elements.btnCopyJson.addEventListener('click', copyJsonToClipboard);

    // Keyboard Shortcuts
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
            closeTaskModal();
            closeDeleteConfirm();
        }
    });
}

// Boot application
document.addEventListener('DOMContentLoaded', initApp);
