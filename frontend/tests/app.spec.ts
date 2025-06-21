import { test, expect } from '@playwright/test';

test('login and see tasks', async ({ page }) => {
  await page.goto('http://localhost:3000');

  // Use label selectors
  await page.locator('input[name="email"]').fill('amirbelkacem@gmail.com');
  await page.locator('input[name="password"]').fill('123456789');

  await page.getByRole('button', { name: /login/i }).click();

  // Wait for the dashboard or tasks page
  await expect(page.getByText(/your tasks/i)).toBeVisible();
});

test('signup then login and see tasks', async ({ page }) => {
  await page.goto('http://localhost:3000/signup');

  await page.locator('input[name="firstName"]').fill('New');
  await page.locator('input[name="lastName"]').fill('UserTest');
  await page.locator('input[name="email"]').fill('newuserTest@example.com');
  await page.locator('input[name="dateOfBirth"]').fill('2005-01-01');
  await page.locator('input[name="password"]').fill('newpassword123');
  await page.locator('input[name="confirmPassword"]').fill('newpassword123');
  await page.getByRole('button', { name: /sign up/i }).click();

  // After signup, go to login page
  await page.goto('http://localhost:3000/login');
  await page.locator('input[name="email"]').fill('newuserTest@example.com');
  await page.locator('input[name="password"]').fill('newpassword123');
  await page.getByRole('button', { name: /login/i }).click();

  // Now check for tasks/dashboard
  await expect(page.getByText(/your tasks/i)).toBeVisible();
});

test('add a new task', async ({ page }) => {
  await page.goto('http://localhost:3000');
  // Login first
  await page.locator('input[name="email"]').fill('newuserTest@example.com');
  await page.locator('input[name="password"]').fill('newpassword123');
  await page.getByRole('button', { name: /login/i }).click();
  // Add a task
  const now = new Date();
  const uniqueTask = `My task  ${now.toISOString().replace(/[:.]/g, '-')}`;
  await page.locator('input[name="Add a new task"]').fill(uniqueTask);
  await page.getByRole('button', { name: /add/i }).click();

  await expect(page.getByText(uniqueTask)).toBeVisible();
});

test('update a task', async ({ page }) => {
  await page.goto('http://localhost:3000');
  // Login first
  await page.locator('input[name="email"]').fill('newuserTest@example.com');
  await page.locator('input[name="password"]').fill('newpassword123');
  await page.getByRole('button', { name: /login/i }).click();

  // Add a unique task to update
  const now = new Date();
  const uniqueTask = `My task  ${now.toISOString().replace(/[:.]/g, '-')}`;
  await page.locator('input[name="Add a new task"]').fill(uniqueTask);
  await page.getByRole('button', { name: /add/i }).click();
  await expect(page.getByText(uniqueTask)).toBeVisible();

  // Click the edit button for this task
  const taskRow = page.getByText(uniqueTask).locator('..').locator('..');
  await taskRow.getByRole('button', { name: /edit/i }).click();

  // Update the task name
  const updatedTask = `${uniqueTask} updated`;
  await page.locator('input[name="Edit task"]').fill(updatedTask);

  // Click save (adjust selector as needed)
  await page.getByRole('button', { name: /check/i }).click();

  // Verify the updated task is visible
  await expect(page.getByText(updatedTask)).toBeVisible();
});

test('delete a task', async ({ page }) => {
  await page.goto('http://localhost:3000');
  // Login first
  await page.locator('input[name="email"]').fill('newuserTest@example.com');
  await page.locator('input[name="password"]').fill('newpassword123');
  await page.getByRole('button', { name: /login/i }).click();

  // Add a unique task to delete
  const now = new Date();
  const uniqueTask = `My task  ${now.toISOString().replace(/[:.]/g, '-')}`;
  await page.locator('input[name="Add a new task"]').fill(uniqueTask);
  await page.getByRole('button', { name: /add/i }).click();
  await expect(page.getByText(uniqueTask)).toBeVisible();

  // Click the delete button for this task
  const taskRow = page.getByText(uniqueTask).locator('..').locator('..');
  await taskRow.getByRole('button', { name: /delete/i }).click();

  // Optionally, confirm the deletion if a dialog appears
  const dialog = page.getByRole('dialog', { name: /confirm delete/i });
await dialog.getByRole('button', { name: /^delete$/i }).click();

  // Verify the task is no longer visible
  await expect(page.getByText(uniqueTask)).not.toBeVisible();
});

test('mark a task as complete', async ({ page }) => {
  await page.goto('http://localhost:3000');
  // Login first
  await page.locator('input[name="email"]').fill('newuserTest@example.com');
  await page.locator('input[name="password"]').fill('newpassword123');
  await page.getByRole('button', { name: /login/i }).click();

  // Add a unique task to complete
  const now = new Date();
  const uniqueTask = `My task  ${now.toISOString().replace(/[:.]/g, '-')}`;
  await page.locator('input[name="Add a new task"]').fill(uniqueTask);
  await page.getByRole('button', { name: /add/i }).click();
  await expect(page.getByText(uniqueTask)).toBeVisible();

  // Find the task row and click its checkbox to mark as complete
  const taskRow = page.getByText(uniqueTask).locator('..').locator('..');
  await taskRow.getByRole('checkbox').setChecked(true);
});

test('view tasks in daily/monthly formats', async ({ page }) => {
  await page.goto('http://localhost:3000');
  // Login first
  await page.locator('input[name="email"]').fill('newuserTest@example.com');
  await page.locator('input[name="password"]').fill('newpassword123');
  await page.getByRole('button', { name: /login/i }).click();

  // Prepare two different dates (today and yesterday)
  const now = new Date();
  const yyyy = now.getFullYear();
  const mm = String(now.getMonth() + 1).padStart(2, '0');
  const dd = String(now.getDate()).padStart(2, '0');
  const today = `${yyyy}-${mm}-${dd}`;
  const yesterdayDate = new Date(now);
  yesterdayDate.setDate(now.getDate() - 1);
  const yyyyY = yesterdayDate.getFullYear();
  const mmY = String(yesterdayDate.getMonth() + 1).padStart(2, '0');
  const ddY = String(yesterdayDate.getDate()).padStart(2, '0');
  const yesterday = `${yyyyY}-${mmY}-${ddY}`;
  const thisMonth = `${yyyy}-${mm}`;

  const task1 = `Task1 ${now.toISOString().replace(/[:.]/g, '-')}`;
  const task2 = `Task2 ${yesterdayDate.toISOString().replace(/[:.]/g, '-')}`;

  // Add first task for today
  await page.locator('input[name="Add a new task"]').fill(task1);
  await page.locator('input[name="taskDate"]').fill(yesterday);
  // If you have a date picker for the task, set it:
  // await page.locator('input[name="taskDate"]').fill(today);
  await page.getByRole('button', { name: /add/i }).click();
  await expect(page.getByText(task1)).toBeVisible();

  // Add second task for yesterday
  await page.locator('input[name="Add a new task"]').fill(task2);
  await page.locator('input[name="taskDate"]').fill(today);

  // If you have a date picker for the task, set it:
  // await page.locator('input[name="taskDate"]').fill(yesterday);
  await page.getByRole('button', { name: /add/i }).click();
  await expect(page.getByText(task2)).toBeVisible();

  // Filter by this month: both tasks should be visible
  await page.locator('[data-testid="month-filter-select"]').selectOption(thisMonth);
  await expect(page.getByText(task1)).toBeVisible();
  await expect(page.getByText(task2)).toBeVisible();

  // Filter by today: only task1 should be visible
  await page.locator('[data-testid="month-filter-select"]').selectOption(thisMonth);
  await page.locator('select[name="Day"]').selectOption(today);
  await expect(page.getByText(task2)).toBeVisible();
  await expect(page.getByText(task1)).not.toBeVisible();

  // Filter by yesterday: only task2 should be visible
  await page.locator('[data-testid="month-filter-select"]').selectOption(thisMonth);
  await page.locator('select[name="Day"]').selectOption(yesterday);
  await expect(page.getByText(task1)).toBeVisible();
  await expect(page.getByText(task2)).not.toBeVisible();
});
/*
test('drag a task to the top and it stays there', async ({ page }) => {
  await page.goto('http://localhost:3000');
  // Login first
  await page.locator('input[name="email"]').fill('newuserTest@example.com');
  await page.locator('input[name="password"]').fill('newpassword123');
  await page.getByRole('button', { name: /login/i }).click();

  // Add two tasks
  const now = new Date();
  const task1 = `Task1 hello world`;
  const task2 = `Task2 end`;
  await page.locator('input[name="Add a new task"]').fill(task1);
  await page.getByRole('button', { name: /add/i }).click();
  await page.locator('input[name="Add a new task"]').fill(task2);
  await page.getByRole('button', { name: /add/i }).click();

  // Wait for both tasks to be visible
  await expect(page.getByText(task1)).toBeVisible();
  await expect(page.getByText(task2)).toBeVisible();

  // Find the drag handle for task2
  const task2Row = page.getByText(task2).locator('..').locator('..'); // This is the Draggable wrapper
  const task2Handle = task2Row.locator('[data-testid="drag-handle"]'); // Selects the Box with the drag handle

  // Find the drag handle for task1 (target)
  const task1Row = page.getByText(task1).locator('..').locator('..');
  const task1Handle = task1Row.locator('[data-testid="drag-handle"]');

  // Drag task2 to task1's position
  await task2Handle.dragTo(task1Handle);

  // Now check the order as before
  const firstTask = page.locator('[data-testid="task-list"] [role="listitem"]').first();
  const firstTaskText = await firstTask.textContent();
  console.log('DEBUG: firstTaskText:', firstTaskText);
});*/

test('app responds within 2 seconds after login', async ({ page }) => {
  await page.goto('http://localhost:3000');
  await page.locator('input[name="email"]').fill('newuserTest@example.com');
  await page.locator('input[name="password"]').fill('newpassword123');

  const start = Date.now();
  await page.getByRole('button', { name: /login/i }).click();
  await expect(page.getByText(/your tasks/i)).toBeVisible();
  const duration = Date.now() - start;

  expect(duration).toBeLessThanOrEqual(2000); // 2 seconds
});
