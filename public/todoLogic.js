// Tekoälyn lisäämä moduuli, koska tehtävälogiikkaa tarvitaan erikseen testattavaksi ilman DOM:ia ja localStoragea

/**
 * Pure task logic (no DOM, no localStorage) so it can be unit-tested with Vitest.
 */

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

/**
 * @typedef {Object} TaskPayload
 * @property {string} topic
 * @property {string} priority
 * @property {string} status
 * @property {string} [description]
 */

/**
 * @param {TaskPayload} payload
 */
export function normalizePayload(payload) {
  return {
    topic: String(payload.topic ?? '').trim(),
    priority: String(payload.priority ?? 'medium'),
    status: String(payload.status ?? 'todo'),
    description: String(payload.description ?? '').trim(),
  };
}

/**
 * @param {TaskPayload} payload
 */
export function isValidNewTask(payload) {
  const normalized = normalizePayload(payload);
  return normalized.topic.length > 0;
}

/**
 * @param {Task[]} tasks
 * @param {TaskPayload} payload
 * @param {{ now?: number, id?: string }} [options]
 * @returns {{ tasks: Task[], added: boolean, task?: Task }}
 */
export function addTask(tasks, payload, options = {}) {
  const now = options.now ?? Date.now();
  const id = options.id;
  const normalized = normalizePayload(payload);

  if (!normalized.topic) {
    return { tasks: [...tasks], added: false };
  }

  const task = {
    id:
      id ??
      `t_${Math.random().toString(36).slice(2, 8)}${now
        .toString(36)
        .slice(-4)}`,
    ...normalized,
    completed: normalized.status === 'done',
    createdAt: now,
    updatedAt: now,
  };

  return { tasks: [...tasks, task], added: true, task };
}

/**
 * @param {Task[]} tasks
 * @param {string} id
 * @param {TaskPayload} payload
 * @param {{ now?: number }} [options]
 * @returns {{ tasks: Task[], updated: boolean }}
 */
export function updateTask(tasks, id, payload, options = {}) {
  const now = options.now ?? Date.now();
  const normalized = normalizePayload(payload);

  const idx = tasks.findIndex((t) => t.id === id);
  if (idx === -1) return { tasks: [...tasks], updated: false };
  if (!normalized.topic) return { tasks: [...tasks], updated: false };

  const current = tasks[idx];
  const next = {
    ...current,
    ...normalized,
    completed: normalized.status === 'done' ? true : current.completed,
    updatedAt: now,
  };

  const nextTasks = [...tasks];
  nextTasks[idx] = next;
  return { tasks: nextTasks, updated: true };
}

/**
 * @param {Task[]} tasks
 * @param {string} id
 * @param {{ now?: number }} [options]
 * @returns {{ tasks: Task[], toggled: boolean, completed?: boolean }}
 */
export function toggleTaskComplete(tasks, id, options = {}) {
  const now = options.now ?? Date.now();
  const idx = tasks.findIndex((t) => t.id === id);
  if (idx === -1) return { tasks: [...tasks], toggled: false };

  const t = tasks[idx];
  const nextCompleted = !t.completed;
  const next = {
    ...t,
    completed: nextCompleted,
    status: nextCompleted ? 'done' : t.status === 'done' ? 'todo' : t.status,
    updatedAt: now,
  };

  const nextTasks = [...tasks];
  nextTasks[idx] = next;
  return { tasks: nextTasks, toggled: true, completed: nextCompleted };
}

/**
 * @param {Task[]} tasks
 * @param {string} id
 * @returns {{ tasks: Task[], deleted: boolean }}
 */
export function deleteTaskById(tasks, id) {
  const idx = tasks.findIndex((t) => t.id === id);
  if (idx === -1) return { tasks: [...tasks], deleted: false };

  const nextTasks = [...tasks];
  nextTasks.splice(idx, 1);
  return { tasks: nextTasks, deleted: true };
}
