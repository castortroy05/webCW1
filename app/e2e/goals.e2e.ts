import { expect, test } from '@playwright/test';

test('create, edit, complete, share and delete a goal in a real browser', async ({ page }) => {
  const problems: string[] = [];
  page.on('pageerror', (e) => problems.push(String(e)));
  page.on('console', (m) => {
    // The deliberate validation failure below logs a 400; anything else (CSP violations etc.) is a bug.
    if (m.type() === 'error' && !m.text().includes('status of 400')) problems.push(m.text());
  });

  await page.goto('/');
  await expect(page.getByRole('heading', { name: /Welcome back, demo/ })).toBeVisible();

  await test.step('validation errors are shown', async () => {
    await page.goto('/goals/new');
    await page.getByRole('button', { name: 'Save goal' }).click();
    await expect(page.locator('.alert-danger')).toContainText('Add at least one exercise');
  });

  await test.step('create an active and an overdue goal', async () => {
    await page.getByLabel('Goal name').fill('Week training');
    await page.getByLabel('Exercise 1').fill('Running');
    await page.getByLabel('Details 1').fill('5 km');
    await page.getByLabel('Due date 1').fill('2099-03-20');
    await page.getByRole('button', { name: 'Save goal' }).click();
    await expect(page).toHaveURL(/\/goals$/);

    await page.goto('/goals/new');
    await page.getByLabel('Exercise 1').fill('Yoga');
    await page.getByLabel('Details 1').fill('1 hour');
    await page.getByLabel('Due date 1').fill('2020-01-01');
    await page.getByRole('button', { name: 'Save goal' }).click();

    await expect(page.locator('.goal-active')).toContainText('Week training');
    await expect(page.locator('.goal-overdue')).toContainText('Yoga');
  });

  await test.step('edit', async () => {
    await page.locator('.goal-active').getByTitle('Edit').click();
    await page.getByLabel('Details 1').fill('10 km');
    await page.getByRole('button', { name: 'Save goal' }).click();
    await expect(page.locator('.goal-active')).toContainText('10 km');
  });

  await test.step('complete', async () => {
    await page.locator('.goal-active').getByTitle('Mark complete').click();
    await expect(page.locator('.goal-complete')).toContainText('Week training');
  });

  await test.step('share', async () => {
    await page.locator('.goal-complete').getByTitle('Share').click();
    await page.getByLabel("Friend's email").fill('friend@example.com');
    await page.getByRole('button', { name: 'Send' }).click();
    await expect(page.locator('.alert-success')).toContainText('friend@example.com');
  });

  await test.step('delete asks for confirmation', async () => {
    await page.goto('/goals');
    page.once('dialog', (d) => {
      expect(d.message()).toBe('Delete this goal?');
      d.accept();
    });
    await page.locator('.goal-overdue').getByTitle('Delete').click();
    await expect(page.locator('.goal-overdue')).toHaveCount(0);
  });

  expect(problems).toEqual([]);
});
