const { test, expect } = require('@playwright/test');
const { TodoPage } = require('./pages/TodoPage');

test.describe('TODO critical journeys', () => {
  test.beforeEach(async ({ page }) => {
    page.on('dialog', async (dialog) => {
      await dialog.accept();
    });
  });

  test('creates and completes a task', async ({ page }) => {
    const todoPage = new TodoPage(page);
    await todoPage.goto();
    const taskTitle = `E2E Task One ${Date.now()}`;

    await todoPage.addTask({
      title: taskTitle,
      description: 'Validate happy path',
      dueDate: '2026-08-20',
    });

    await expect(todoPage.taskRow(taskTitle)).toBeVisible();
    await todoPage.toggleCompletionButton(taskTitle).click();
    await expect(todoPage.toggleCompletionButton(taskTitle)).toHaveText('Mark Active');

    const completedApiResponse = await page.request.get('http://127.0.0.1:3030/api/tasks?status=completed');
    expect(completedApiResponse.ok()).toBeTruthy();
    const completedTasks = await completedApiResponse.json();
    expect(completedTasks.some((task) => task.title === taskTitle && task.completed === true)).toBeTruthy();
  });

  test('edits and deletes a task', async ({ page }) => {
    const todoPage = new TodoPage(page);
    await todoPage.goto();
    const taskTitle = `E2E Task Two ${Date.now()}`;
    const updatedTitle = `${taskTitle} Updated`;

    await todoPage.addTask({
      title: taskTitle,
      description: 'Edit me',
      dueDate: '2026-08-21',
    });

    await todoPage.editButton(taskTitle).click();
    await page.getByLabel('Edit task title').fill(updatedTitle);
    await page.getByRole('button', { name: 'Save' }).click();

    await expect(todoPage.taskRow(updatedTitle)).toBeVisible();

    await todoPage.deleteButton(updatedTitle).click();
    await expect(todoPage.taskRow(updatedTitle)).toHaveCount(0);

    const allTasksApiResponse = await page.request.get('http://127.0.0.1:3030/api/tasks');
    expect(allTasksApiResponse.ok()).toBeTruthy();
    const allTasks = await allTasksApiResponse.json();
    expect(allTasks.some((task) => task.title === updatedTitle)).toBeFalsy();
  });

  test('filters completed tasks only', async ({ page }) => {
    const todoPage = new TodoPage(page);
    await todoPage.goto();
    const activeTitle = `Filter Active Task ${Date.now()}`;
    const completedTitle = `Filter Completed Task ${Date.now()}`;

    await todoPage.addTask({ title: activeTitle });
    await todoPage.addTask({ title: completedTitle });
    await todoPage.toggleCompletionButton(completedTitle).click();

    await todoPage.filterButton('completed').click();

    await expect(todoPage.taskRow(completedTitle)).toBeVisible();
    await expect(todoPage.taskRow(activeTitle)).toHaveCount(0);
  });
});
