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
    await request(app)
      .post('/api/tasks')
      .send({ title: 'Done task', completed: true })
      .set('Accept', 'application/json');

    const response = await request(app).get('/api/tasks?status=completed');

    expect(response.status).toBe(200);
    expect(Array.isArray(response.body)).toBe(true);
    expect(response.body.every((task) => task.completed === true)).toBe(true);
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
});
