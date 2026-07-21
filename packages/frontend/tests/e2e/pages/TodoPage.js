class TodoPage {
  constructor(page) {
    this.page = page;
    this.titleInput = page.getByLabel('Title');
    this.descriptionInput = page.getByLabel('Description');
    this.dueDateInput = page.getByLabel('Due date');
    this.addTaskButton = page.getByRole('button', { name: 'Add Task' });
  }

  async goto() {
    await this.page.goto('/');
  }

  async addTask({ title, description = '', dueDate = '' }) {
    await this.titleInput.fill(title);
    await this.descriptionInput.fill(description);
    await this.dueDateInput.fill(dueDate);
    await this.addTaskButton.click();
  }

  filterButton(name) {
    return this.page.getByRole('button', { name, exact: true });
  }

  taskRow(title) {
    return this.page.locator('.task-item').filter({ hasText: title });
  }

  toggleCompletionButton(title) {
    return this.taskRow(title).getByRole('button', {
      name: `Toggle completion for ${title}`,
    });
  }

  editButton(title) {
    return this.taskRow(title).getByRole('button', { name: 'Edit' });
  }

  deleteButton(title) {
    return this.taskRow(title).getByRole('button', { name: 'Delete' });
  }
}

module.exports = { TodoPage };
