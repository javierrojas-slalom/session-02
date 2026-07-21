import React, { act } from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { rest } from 'msw';
import { setupServer } from 'msw/node';
import App from '../App';

let tasks = [
  { id: 1, title: 'Design homepage', description: 'Create wireframe', dueDate: '2026-08-01', completed: false },
  { id: 2, title: 'Write tests', description: '', dueDate: null, completed: true },
];

const server = setupServer(
  rest.get('/api/tasks', (req, res, ctx) => {
    const filter = req.url.searchParams.get('status') || 'all';
    if (filter === 'active') {
      return res(ctx.status(200), ctx.json(tasks.filter((task) => !task.completed)));
    }
    if (filter === 'completed') {
      return res(ctx.status(200), ctx.json(tasks.filter((task) => task.completed)));
    }

    return res(ctx.status(200), ctx.json(tasks));
  }),

  rest.post('/api/tasks', (req, res, ctx) => {
    const { title, description, dueDate, completed } = req.body;
    if (!title || title.trim() === '') {
      return res(ctx.status(400), ctx.json({ error: 'Task title is required' }));
    }

    const newTask = {
      id: tasks.length + 10,
      title,
      description: description || '',
      dueDate: dueDate || null,
      completed: Boolean(completed),
    };
    tasks = [...tasks, newTask];
    return res(ctx.status(201), ctx.json(newTask));
  }),

  rest.put('/api/tasks/:id', (req, res, ctx) => {
    const id = Number(req.params.id);
    const current = tasks.find((task) => task.id === id);
    if (!current) {
      return res(ctx.status(404), ctx.json({ error: 'Task not found' }));
    }

    const next = { ...current, ...req.body };
    tasks = tasks.map((task) => (task.id === id ? next : task));
    return res(
      ctx.status(200),
      ctx.json(next)
    );
  }),

  rest.delete('/api/tasks/:id', (req, res, ctx) => {
    const id = Number(req.params.id);
    tasks = tasks.filter((task) => task.id !== id);
    return res(ctx.status(200), ctx.json({ message: 'Task deleted successfully', id }));
  })
);

beforeAll(() => server.listen());
afterEach(() => {
  tasks = [
    { id: 1, title: 'Design homepage', description: 'Create wireframe', dueDate: '2026-08-01', completed: false },
    { id: 2, title: 'Write tests', description: '', dueDate: null, completed: true },
  ];
  server.resetHandlers();
});
afterAll(() => server.close());

describe('App Component', () => {
  test('renders header and form controls', async () => {
    await act(async () => {
      render(<App />);
    });

    expect(screen.getByText('Task Flow')).toBeInTheDocument();
    expect(screen.getByLabelText('Title')).toBeInTheDocument();
    expect(screen.getByLabelText('Description')).toBeInTheDocument();
    expect(screen.getByLabelText('Due date')).toBeInTheDocument();
  });

  test('loads and displays tasks', async () => {
    await act(async () => {
      render(<App />);
    });

    expect(screen.getByText('Loading tasks...')).toBeInTheDocument();

    await waitFor(() => {
      expect(screen.getByText('Design homepage')).toBeInTheDocument();
      expect(screen.getByText('Write tests')).toBeInTheDocument();
    });
  });

  test('adds a new task', async () => {
    const user = userEvent.setup();

    await act(async () => {
      render(<App />);
    });

    await waitFor(() => {
      expect(screen.queryByText('Loading tasks...')).not.toBeInTheDocument();
    });

    const input = screen.getByLabelText('Title');
    await act(async () => {
      await user.type(input, 'New Test Task');
    });

    const submitButton = screen.getByText('Add Task');
    await act(async () => {
      await user.click(submitButton);
    });

    await waitFor(() => {
      expect(screen.getByText('New Test Task')).toBeInTheDocument();
    });
  });

  test('handles API error', async () => {
    server.use(
      rest.get('/api/tasks', (req, res, ctx) => {
        return res(ctx.status(500));
      })
    );

    await act(async () => {
      render(<App />);
    });

    await waitFor(() => {
      expect(screen.getByText(/Failed to fetch tasks/)).toBeInTheDocument();
    });
  });

  test('filters completed tasks', async () => {
    const user = userEvent.setup();

    await act(async () => {
      render(<App />);
    });

    await waitFor(() => {
      expect(screen.getByText('Design homepage')).toBeInTheDocument();
    });

    await act(async () => {
      await user.click(screen.getByRole('button', { name: 'completed' }));
    });

    await waitFor(() => {
      expect(screen.queryByText('Design homepage')).not.toBeInTheDocument();
      expect(screen.getByText('Write tests')).toBeInTheDocument();
    });
  });

  test('shows empty state when no tasks', async () => {
    server.use(
      rest.get('/api/tasks', (req, res, ctx) => {
        return res(ctx.status(200), ctx.json([]));
      })
    );

    await act(async () => {
      render(<App />);
    });

    await waitFor(() => {
      expect(screen.getByText('No tasks yet. Create your first task to get started.')).toBeInTheDocument();
    });
  });
});