function isIsoDate(value) {
  if (typeof value !== 'string') {
    return false;
  }

  const trimmed = value.trim();
  if (!/^\d{4}-\d{2}-\d{2}$/.test(trimmed)) {
    return false;
  }

  const asDate = new Date(`${trimmed}T00:00:00.000Z`);
  return !Number.isNaN(asDate.getTime()) && asDate.toISOString().slice(0, 10) === trimmed;
}

function normalizeTaskInput(payload = {}, fallback = {}) {
  const titleValue = payload.title ?? fallback.title;
  const descriptionValue = payload.description ?? fallback.description ?? '';
  const dueDateValue = Object.prototype.hasOwnProperty.call(payload, 'dueDate')
    ? payload.dueDate
    : fallback.dueDate;
  const completedValue = Object.prototype.hasOwnProperty.call(payload, 'completed')
    ? payload.completed
    : fallback.completed ?? false;

  if (typeof titleValue !== 'string' || titleValue.trim() === '') {
    return { ok: false, error: 'Task title is required' };
  }

  if (typeof descriptionValue !== 'string') {
    return { ok: false, error: 'Task description must be a string' };
  }

  let normalizedDueDate = null;
  if (dueDateValue !== null && dueDateValue !== undefined && dueDateValue !== '') {
    if (!isIsoDate(dueDateValue)) {
      return { ok: false, error: 'Due date must use YYYY-MM-DD format' };
    }
    normalizedDueDate = dueDateValue.trim();
  }

  if (typeof completedValue !== 'boolean') {
    return { ok: false, error: 'Task completed must be a boolean' };
  }

  return {
    ok: true,
    task: {
      title: titleValue.trim(),
      description: descriptionValue.trim(),
      dueDate: normalizedDueDate,
      completed: completedValue,
    },
  };
}

function parseTaskId(value) {
  const parsed = Number.parseInt(value, 10);
  if (Number.isNaN(parsed) || parsed <= 0) {
    return { ok: false, error: 'Valid task ID is required' };
  }

  return { ok: true, id: parsed };
}

function normalizeStatusFilter(value) {
  if (value === 'active' || value === 'completed') {
    return value;
  }

  return 'all';
}

module.exports = {
  isIsoDate,
  normalizeTaskInput,
  parseTaskId,
  normalizeStatusFilter,
};
