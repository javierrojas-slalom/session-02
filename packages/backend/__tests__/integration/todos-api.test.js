const request = require('supertest');
const { createApp } = require('../../src/app');

describe('TODO API integration tests', () => {
  let app;
  let db;

  beforeEach(() => {
    const instance = createApp({ dbPath: ':memory:' });
    app = instance.app;
    db = instance.db;
  });

  afterEach(() => {
    if (db) {
      db.close();
    }
  });

  it('creates, updates and deletes a task through HTTP', async () => {
    const createResponse = await request(app)
      .post('/api/tasks')
      .send({
        title: 'Integration Task',
        description: 'Created from integration test',
        dueDate: '2026-08-15',
        completed: false,
      })
      .set('Accept', 'application/json');

    expect(createResponse.status).toBe(201);
    expect(createResponse.body.title).toBe('Integration Task');
    expect(createResponse.body.completed).toBe(false);

    const taskId = createResponse.body.id;

    const updateResponse = await request(app)
      .put(`/api/tasks/${taskId}`)
      .send({ completed: true, title: 'Integration Task Updated' })
      .set('Accept', 'application/json');

    expect(updateResponse.status).toBe(200);
    expect(updateResponse.body.completed).toBe(true);
    expect(updateResponse.body.title).toBe('Integration Task Updated');

    const deleteResponse = await request(app).delete(`/api/tasks/${taskId}`);
    expect(deleteResponse.status).toBe(200);
    expect(deleteResponse.body).toEqual({ message: 'Task deleted successfully', id: taskId });
  });

  it('supports status filter endpoint', async () => {
    const createCompleted = await request(app)
      .post('/api/tasks')
      .send({ title: 'Done task', completed: true })
      .set('Accept', 'application/json');
    expect(createCompleted.status).toBe(201);

    const createActive = await request(app)
      .post('/api/tasks')
      .send({ title: 'Active task', completed: false })
      .set('Accept', 'application/json');
    expect(createActive.status).toBe(201);

    const completedResponse = await request(app).get('/api/tasks?status=completed');
    const activeResponse = await request(app).get('/api/tasks?status=active');

    expect(completedResponse.status).toBe(200);
    expect(Array.isArray(completedResponse.body)).toBe(true);
    expect(completedResponse.body.length).toBeGreaterThan(0);
    expect(completedResponse.body.every((task) => task.completed === true)).toBe(true);
    expect(completedResponse.body.some((task) => task.title === 'Done task')).toBe(true);

    expect(activeResponse.status).toBe(200);
    expect(activeResponse.body.every((task) => task.completed === false)).toBe(true);
    expect(activeResponse.body.some((task) => task.title === 'Active task')).toBe(true);
    expect(activeResponse.body.some((task) => task.title === 'Done task')).toBe(false);
  });

  it('rejects invalid payload and invalid id', async () => {
    const invalidCreate = await request(app)
      .post('/api/tasks')
      .send({ title: '  ' })
      .set('Accept', 'application/json');

    expect(invalidCreate.status).toBe(400);
    expect(invalidCreate.body.error).toBe('Task title is required');

    const invalidUpdate = await request(app)
      .put('/api/tasks/abc')
      .send({ title: 'x' })
      .set('Accept', 'application/json');

    expect(invalidUpdate.status).toBe(400);
    expect(invalidUpdate.body.error).toBe('Valid task ID is required');
  });

  it('returns 404 when updating a missing task', async () => {
    const response = await request(app)
      .put('/api/tasks/999999')
      .send({ title: 'Missing task' })
      .set('Accept', 'application/json');

    expect(response.status).toBe(404);
    expect(response.body.error).toBe('Task not found');
  });
});
