/* eslint-env browser */
/* global document, window, localStorage */

/**
 * @typedef {Object} Task
 * @property {string} id
 * @property {string} topic
 * @property {string} priority
 * @property {string} status
 * @property {string} description
 * @property {boolean} completed
 * @property {number} createdAt
 * @property {number} updatedAt
 */

'use strict';

import {
  addTask,
  updateTask,
  toggleTaskComplete,
  deleteTaskById,
} from './todoLogic.js';

(function () {
  // Storage key and helpers
  const STORAGE_KEY = 'todo_tasks_v1';
  /** @returns {Array} */
  function loadTasks() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return [];
      const parsed = JSON.parse(raw);
      return Array.isArray(parsed) ? parsed : [];
    } catch {
      return [];
    }
  }
  function saveTasks(tasks) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(tasks));
  }
  function generateId(now) {
    return (
      't_' + Math.random().toString(36).slice(2, 8) + now.toString(36).slice(-4)
    );
  }

  // DOM refs
  const form = /** @type {HTMLFormElement} */ (
    document.getElementById('task-form')
  );
  const formTitle = /** @type {HTMLElement} */ (
    document.getElementById('form-title')
  );
  const inputId = /** @type {HTMLInputElement} */ (
    document.getElementById('task-id')
  );
  const inputTopic = /** @type {HTMLInputElement} */ (
    document.getElementById('topic')
  );
  const inputPriority = /** @type {HTMLSelectElement} */ (
    document.getElementById('priority')
  );
  const inputStatus = /** @type {HTMLSelectElement} */ (
    document.getElementById('status')
  );
  const inputDescription = /** @type {HTMLTextAreaElement} */ (
    document.getElementById('description')
  );
  const saveBtn = /** @type {HTMLButtonElement} */ (
    document.getElementById('save-btn')
  );
  const resetBtn = /** @type {HTMLButtonElement} */ (
    document.getElementById('reset-btn')
  );
  const list = /** @type {HTMLUListElement} */ (
    document.getElementById('task-list')
  );
  const emptyState = /** @type {HTMLElement} */ (
    document.getElementById('empty-state')
  );

  // State
  let tasks = loadTasks();

  // Render
  function render() {
    list.innerHTML = '';
    if (!tasks.length) {
      emptyState.style.display = 'block';
      return;
    }
    emptyState.style.display = 'none';

    tasks
      .sort((a, b) => {
        // Not-done first, then by priority (high->low), then newest first
        if (a.completed !== b.completed) return a.completed ? 1 : -1;
        const prioRank = { high: 0, medium: 1, low: 2 };
        if (prioRank[a.priority] !== prioRank[b.priority]) {
          return prioRank[a.priority] - prioRank[b.priority];
        }
        return b.createdAt - a.createdAt;
      })
      .forEach((t) => {
        const li = document.createElement('li');
        li.className = 'task' + (t.completed ? ' done' : '');
        li.dataset.id = t.id;
        li.innerHTML = `
					<div>
						<div class="title">${escapeHtml(t.topic)}</div>
						<div class="desc">${escapeHtml(t.description || '')}</div>
					</div>
					<div class="meta">
						<span class="badge prio-${t.priority}">
							<span class="dot"></span>
							${t.priority.charAt(0).toUpperCase() + t.priority.slice(1)}
						</span>
					</div>
					<div class="meta">
						${badgeForStatus(t.status)}
					</div>
					<div class="controls">
						<button data-action="edit" class="secondary">Edit</button>
						<button data-action="complete" class="${t.completed ? 'secondary' : ''}">
							${t.completed ? 'Undo' : 'Complete'}
						</button>
						<button data-action="delete" class="danger">Delete</button>
					</div>
				`;
        list.appendChild(li);
      });
  }

  function badgeForStatus(status) {
    const label =
      {
        todo: 'To do',
        'in-progress': 'In progress',
        blocked: 'Blocked',
        done: 'Done',
      }[status] || status;
    return `<span class="badge">${label}</span>`;
  }

  function escapeHtml(str) {
    return String(str)
      .replaceAll('&', '&amp;')
      .replaceAll('<', '&lt;')
      .replaceAll('>', '&gt;')
      .replaceAll('"', '&quot;')
      .replaceAll("'", '&#039;');
  }

  // Form handling
  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const now = Date.now();
    const payload = {
      topic: inputTopic.value.trim(),
      priority: inputPriority.value,
      status: inputStatus.value,
      description: inputDescription.value.trim(),
    };
    if (!payload.topic) {
      inputTopic.focus();
      return;
    }

    if (inputId.value) {
      const result = updateTask(tasks, inputId.value, payload, { now });
      tasks = result.tasks;
    } else {
      const result = addTask(tasks, payload, {
        now,
        id: generateId(now),
      });
      tasks = result.tasks;
    }
    saveTasks(tasks);
    resetForm();
    render();
  });

  resetBtn.addEventListener('click', () => {
    resetForm();
  });

  function resetForm() {
    formTitle.textContent = 'Create Task';
    inputId.value = '';
    form.reset();
    inputPriority.value = 'medium';
    inputStatus.value = 'todo';
    saveBtn.textContent = 'Save Task';
  }

  // List actions (event delegation)
  list.addEventListener('click', (e) => {
    const target = /** @type {HTMLElement} */ (e.target);
    if (target.tagName !== 'BUTTON') return;
    const action = target.dataset.action;
    /** @type {HTMLElement | null} */
    const li = target.closest('.task');
    if (!li) return;
    const id = li.dataset.id;
    const idx = tasks.findIndex((t) => t.id === id);
    if (idx === -1) return;

    if (action === 'edit') {
      const t = tasks[idx];
      formTitle.textContent = 'Edit Task';
      inputId.value = t.id;
      inputTopic.value = t.topic;
      inputPriority.value = t.priority;
      inputStatus.value = t.status;
      inputDescription.value = t.description || '';
      saveBtn.textContent = 'Update Task';
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
    if (action === 'complete') {
      const result = toggleTaskComplete(tasks, id, { now: Date.now() });
      tasks = result.tasks;
      saveTasks(tasks);
      render();
    }
    if (action === 'delete') {
      const confirmDelete = window.confirm('Delete this task?');
      if (!confirmDelete) return;
      const result = deleteTaskById(tasks, id);
      tasks = result.tasks;
      saveTasks(tasks);
      render();
    }
  });

  // Initial paint
  render();
})();
