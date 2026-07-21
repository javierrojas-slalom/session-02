const path = require('path');
const fs = require('fs');
const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const Database = require('better-sqlite3');
const {
  normalizeTaskInput,
  parseTaskId,
  normalizeStatusFilter,
} = require('./taskValidation');

const seedTasks = [
  { title: 'Plan weekly goals', description: 'Review priorities for the sprint', dueDate: null },
  { title: 'Refine TODO UX', description: 'Polish list interactions', dueDate: null },
  { title: 'Prepare demo notes', description: '', dueDate: null },
];

function mapTaskRow(row) {
  return {
    id: row.id,
    title: row.title,
    description: row.description,
    dueDate: row.due_date,
    completed: row.completed === 1,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

function createDatabase(dbPath) {
  if (dbPath !== ':memory:') {
    fs.mkdirSync(path.dirname(dbPath), { recursive: true });
  }

  const db = new Database(dbPath);
  db.pragma('journal_mode = WAL');
  db.exec(`
    CREATE TABLE IF NOT EXISTS tasks (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      title TEXT NOT NULL,
      description TEXT DEFAULT '',
      due_date TEXT DEFAULT NULL,
      completed INTEGER NOT NULL DEFAULT 0,
      created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
      updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
    );
  `);

  const count = db.prepare('SELECT COUNT(*) AS count FROM tasks').get().count;
  if (count === 0) {
    const insertSeed = db.prepare(
      'INSERT INTO tasks (title, description, due_date, completed) VALUES (?, ?, ?, ?)'
    );
    seedTasks.forEach((task) => {
      insertSeed.run(task.title, task.description, task.dueDate, 0);
    });
    console.log('Database initialized with sample tasks');
  }

  return db;
}

function createApp(options = {}) {
  const dbPath = options.dbPath || path.join(__dirname, '../data/todos.db');
  const db = createDatabase(dbPath);
  const app = express();

  app.use(cors());
  app.use(express.json());
  app.use(morgan('dev'));

  const selectTaskById = db.prepare('SELECT * FROM tasks WHERE id = ?');
  const createTaskStmt = db.prepare(
    'INSERT INTO tasks (title, description, due_date, completed) VALUES (?, ?, ?, ?)'
  );
  const updateTaskStmt = db.prepare(
    `UPDATE tasks
     SET title = ?, description = ?, due_date = ?, completed = ?, updated_at = CURRENT_TIMESTAMP
     WHERE id = ?`
  );
  const deleteTaskStmt = db.prepare('DELETE FROM tasks WHERE id = ?');

  app.get('/', (req, res) => {
    res.status(200).json({ status: 'ok', message: 'Backend server is running' });
  });

  const listTasks = (req, res) => {
    try {
      const status = normalizeStatusFilter(req.query.status);
      let query = 'SELECT * FROM tasks';

      if (status === 'active') {
        query += ' WHERE completed = 0';
      }
      if (status === 'completed') {
        query += ' WHERE completed = 1';
      }

      query += ' ORDER BY due_date IS NULL, due_date ASC, created_at DESC';
      const tasks = db.prepare(query).all().map(mapTaskRow);
      return res.json(tasks);
    } catch (error) {
      console.error('Error fetching tasks:', error);
      return res.status(500).json({ error: 'Failed to fetch tasks' });
    }
  };

  app.get('/api/tasks', listTasks);

  app.post('/api/tasks', (req, res) => {
    try {
      const normalized = normalizeTaskInput(req.body);
      if (!normalized.ok) {
        return res.status(400).json({ error: normalized.error });
      }

      const result = createTaskStmt.run(
        normalized.task.title,
        normalized.task.description,
        normalized.task.dueDate,
        normalized.task.completed ? 1 : 0
      );
      const created = selectTaskById.get(result.lastInsertRowid);
      return res.status(201).json(mapTaskRow(created));
    } catch (error) {
      console.error('Error creating task:', error);
      return res.status(500).json({ error: 'Failed to create task' });
    }
  });

  app.put('/api/tasks/:id', (req, res) => {
    try {
      const taskId = parseTaskId(req.params.id);
      if (!taskId.ok) {
        return res.status(400).json({ error: taskId.error });
      }

      const current = selectTaskById.get(taskId.id);
      if (!current) {
        return res.status(404).json({ error: 'Task not found' });
      }

      const normalized = normalizeTaskInput(req.body, {
        title: current.title,
        description: current.description,
        dueDate: current.due_date,
        completed: current.completed === 1,
      });
      if (!normalized.ok) {
        return res.status(400).json({ error: normalized.error });
      }

      updateTaskStmt.run(
        normalized.task.title,
        normalized.task.description,
        normalized.task.dueDate,
        normalized.task.completed ? 1 : 0,
        taskId.id
      );

      const updated = selectTaskById.get(taskId.id);
      return res.json(mapTaskRow(updated));
    } catch (error) {
      console.error('Error updating task:', error);
      return res.status(500).json({ error: 'Failed to update task' });
    }
  });

  app.delete('/api/tasks/:id', (req, res) => {
    try {
      const taskId = parseTaskId(req.params.id);
      if (!taskId.ok) {
        return res.status(400).json({ error: taskId.error });
      }

      const existing = selectTaskById.get(taskId.id);
      if (!existing) {
        return res.status(404).json({ error: 'Task not found' });
      }

      deleteTaskStmt.run(taskId.id);
      return res.json({ message: 'Task deleted successfully', id: taskId.id });
    } catch (error) {
      console.error('Error deleting task:', error);
      return res.status(500).json({ error: 'Failed to delete task' });
    }
  });

  app.get('/api/items', listTasks);

  return { app, db };
}

const { app, db } = createApp();

module.exports = {
  app,
  db,
  createApp,
  normalizeTaskInput,
  parseTaskId,
  normalizeStatusFilter,
};