import React, { useState, useEffect } from 'react';
import './App.css';

function App() {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [statusFilter, setStatusFilter] = useState('all');
  const [form, setForm] = useState({
    title: '',
    description: '',
    dueDate: '',
  });
  const [editTaskId, setEditTaskId] = useState(null);
  const [editForm, setEditForm] = useState({
    title: '',
    description: '',
    dueDate: '',
    completed: false,
  });
  const [feedback, setFeedback] = useState('');

  useEffect(() => {
    fetchTasks(statusFilter);
  }, [statusFilter]);

  const fetchTasks = async (filter = 'all') => {
    try {
      setLoading(true);
      const suffix = filter && filter !== 'all' ? `?status=${filter}` : '';
      const response = await fetch(`/api/tasks${suffix}`);
      if (!response.ok) {
        throw new Error('Network response was not ok');
      }
      const result = await response.json();
      setTasks(result);
      setError(null);
    } catch (err) {
      setError('Failed to fetch tasks: ' + err.message);
      console.error('Error fetching tasks:', err);
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setForm({ title: '', description: '', dueDate: '' });
  };

  const handleCreateTask = async (e) => {
    e.preventDefault();
    const title = form.title.trim();
    if (!title) {
      setError('Task title is required');
      return;
    }

    try {
      const response = await fetch('/api/tasks', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          title,
          description: form.description,
          dueDate: form.dueDate || null,
          completed: false,
        }),
      });

      if (!response.ok) {
        const payload = await response.json();
        throw new Error(payload.error || 'Failed to add task');
      }

      const result = await response.json();
      setTasks((current) => [...current, result]);
      resetForm();
      setFeedback('Task created');
      setError(null);
    } catch (err) {
      setError('Error creating task: ' + err.message);
      console.error('Error creating task:', err);
    }
  };

  const handleDelete = async (taskId) => {
    const shouldDelete = window.confirm('Delete this task?');
    if (!shouldDelete) {
      return;
    }

    try {
      const response = await fetch(`/api/tasks/${taskId}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Failed to delete task');
      }

      setTasks((current) => current.filter((task) => task.id !== taskId));
      setFeedback('Task deleted');
      setError(null);
    } catch (err) {
      setError('Error deleting task: ' + err.message);
      console.error('Error deleting task:', err);
    }
  };

  const handleToggleComplete = async (task) => {
    try {
      const response = await fetch(`/api/tasks/${task.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ completed: !task.completed }),
      });

      if (!response.ok) {
        throw new Error('Failed to update task');
      }

      const updated = await response.json();
      setTasks((current) => current.map((item) => (item.id === task.id ? updated : item)));
      setFeedback(updated.completed ? 'Task marked as completed' : 'Task marked as active');
      setError(null);
    } catch (err) {
      setError('Error updating task: ' + err.message);
    }
  };

  const startEdit = (task) => {
    setEditTaskId(task.id);
    setEditForm({
      title: task.title,
      description: task.description || '',
      dueDate: task.dueDate || '',
      completed: task.completed,
    });
  };

  const cancelEdit = () => {
    setEditTaskId(null);
    setEditForm({ title: '', description: '', dueDate: '', completed: false });
  };

  const handleSaveEdit = async (taskId) => {
    if (!editForm.title.trim()) {
      setError('Task title is required');
      return;
    }

    try {
      const response = await fetch(`/api/tasks/${taskId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          title: editForm.title,
          description: editForm.description,
          dueDate: editForm.dueDate || null,
          completed: editForm.completed,
        }),
      });

      if (!response.ok) {
        const payload = await response.json();
        throw new Error(payload.error || 'Failed to save task');
      }

      const updated = await response.json();
      setTasks((current) => current.map((item) => (item.id === taskId ? updated : item)));
      cancelEdit();
      setFeedback('Task updated');
      setError(null);
    } catch (err) {
      setError('Error updating task: ' + err.message);
    }
  };

  return (
    <div className="app-shell">
      <header className="app-header">
        <h1>Task Flow</h1>
        <p>Plan, prioritize, and finish your work with clarity.</p>
      </header>

      <main className="app-main">
        <section className="card-section">
          <h2>Create Task</h2>
          <form className="task-form" onSubmit={handleCreateTask}>
            <label htmlFor="task-title">Title</label>
            <input
              id="task-title"
              type="text"
              value={form.title}
              onChange={(e) => setForm((current) => ({ ...current, title: e.target.value }))}
              placeholder="Write a task title"
            />

            <label htmlFor="task-description">Description</label>
            <textarea
              id="task-description"
              value={form.description}
              onChange={(e) => setForm((current) => ({ ...current, description: e.target.value }))}
              placeholder="Optional notes"
              rows={3}
            />

            <label htmlFor="task-due-date">Due date</label>
            <input
              id="task-due-date"
              type="date"
              value={form.dueDate}
              onChange={(e) => setForm((current) => ({ ...current, dueDate: e.target.value }))}
            />

            <button type="submit" className="btn btn-primary">Add Task</button>
          </form>
        </section>

        <section className="card-section">
          <div className="tasks-head">
            <h2>Tasks</h2>
            <div className="filter-tabs" role="tablist" aria-label="Task filter">
              {['all', 'active', 'completed'].map((filter) => (
                <button
                  key={filter}
                  type="button"
                  className={`btn ${statusFilter === filter ? 'btn-primary' : 'btn-outline'}`}
                  onClick={() => setStatusFilter(filter)}
                >
                  {filter}
                </button>
              ))}
            </div>
          </div>

          {loading && <p>Loading tasks...</p>}
          {feedback && <p className="status-message" aria-live="polite">{feedback}</p>}
          {error && <p className="error-message" role="alert">{error}</p>}
          {!loading && !error && (
            <ul className="task-list">
              {tasks.length > 0 ? (
                tasks.map((task) => (
                  <li key={task.id} className={`task-item ${task.completed ? 'completed' : ''}`}>
                    {editTaskId === task.id ? (
                      <div className="task-edit-panel">
                        <input
                          type="text"
                          value={editForm.title}
                          onChange={(e) => setEditForm((current) => ({ ...current, title: e.target.value }))}
                          aria-label="Edit task title"
                        />
                        <textarea
                          rows={2}
                          value={editForm.description}
                          onChange={(e) => setEditForm((current) => ({ ...current, description: e.target.value }))}
                          aria-label="Edit task description"
                        />
                        <input
                          type="date"
                          value={editForm.dueDate}
                          onChange={(e) => setEditForm((current) => ({ ...current, dueDate: e.target.value }))}
                          aria-label="Edit task due date"
                        />
                        <label className="checkbox-row" htmlFor={`edit-completed-${task.id}`}>
                          <input
                            id={`edit-completed-${task.id}`}
                            type="checkbox"
                            checked={editForm.completed}
                            onChange={(e) =>
                              setEditForm((current) => ({ ...current, completed: e.target.checked }))
                            }
                          />
                          Completed
                        </label>
                        <div className="task-actions">
                          <button type="button" className="btn btn-primary" onClick={() => handleSaveEdit(task.id)}>
                            Save
                          </button>
                          <button type="button" className="btn btn-outline" onClick={cancelEdit}>
                            Cancel
                          </button>
                        </div>
                      </div>
                    ) : (
                      <>
                        <div className="task-content">
                          <h3>{task.title}</h3>
                          {task.description ? <p>{task.description}</p> : null}
                          <p className="due-date">
                            {task.dueDate ? `Due: ${task.dueDate}` : 'No due date'}
                          </p>
                        </div>
                        <div className="task-actions">
                          <button
                            type="button"
                            className="btn btn-outline"
                            aria-label={`Toggle completion for ${task.title}`}
                            onClick={() => handleToggleComplete(task)}
                          >
                            {task.completed ? 'Mark Active' : 'Mark Complete'}
                          </button>
                          <button type="button" className="btn btn-outline" onClick={() => startEdit(task)}>
                            Edit
                          </button>
                          <button type="button" className="btn btn-danger" onClick={() => handleDelete(task.id)}>
                            Delete
                          </button>
                        </div>
                      </>
                    )}
                  </li>
                ))
              ) : (
                <p className="empty-state">No tasks yet. Create your first task to get started.</p>
              )}
            </ul>
          )}
        </section>
      </main>
    </div>
  );
}

export default App;