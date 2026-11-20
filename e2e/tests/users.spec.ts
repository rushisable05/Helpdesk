import { expect, test } from '@playwright/test';
import { login, loginAsAdmin, logout, TEST_USERS } from '../fixtures/auth';

/**
 * E2E tests for User Management CRUD operations
 *
 * Focuses on happy paths for:
 * - Create: Creating new agent users via modal form
 * - Read: Viewing users list, table columns, and seeded admin details
 * - Update: Editing user name, email, and password
 * - Delete: Cancelling deletion and successfully deleting users
 *
 * All tests run as an admin user since user management is admin-only.
 */
test.describe('User Management', () => {
  test.beforeEach(async ({ page }) => {
    // Login as admin before each test
    await loginAsAdmin(page);
    // Navigate to the users page
    await page.goto('/users');
  });

  test.describe('View Users (Read)', () => {
    test('should display users table with correct columns', async ({ page }) => {
      // Wait for table to be visible
      const table = page.getByRole('table');
      await expect(table).toBeVisible();

      // Check all column headers are present
      await expect(page.getByRole('columnheader', { name: /^name$/i })).toBeVisible();
      await expect(page.getByRole('columnheader', { name: /^email$/i })).toBeVisible();
      await expect(page.getByRole('columnheader', { name: /^role$/i })).toBeVisible();
      await expect(page.getByRole('columnheader', { name: /^created$/i })).toBeVisible();
      await expect(page.getByRole('columnheader', { name: /^actions$/i })).toBeVisible();
    });

    test('should display seeded admin user in table', async ({ page }) => {
      const adminRow = page.getByRole('row').filter({ hasText: TEST_USERS.admin.email });
      await expect(adminRow).toBeVisible();
      await expect(adminRow).toContainText(TEST_USERS.admin.name);
      await expect(adminRow).toContainText(TEST_USERS.admin.email);
      await expect(adminRow).toContainText('admin');
    });

    test('should not show delete button for admin user', async ({ page }) => {
      const adminRow = page.getByRole('row').filter({ hasText: TEST_USERS.admin.email });
      await expect(adminRow).toBeVisible();
      // Admin should have edit button but NO delete button
      await expect(adminRow.getByRole('button', { name: new RegExp(`edit ${TEST_USERS.admin.name}`, 'i') })).toBeVisible();
      await expect(adminRow.getByRole('button', { name: new RegExp(`delete ${TEST_USERS.admin.name}`, 'i') })).not.toBeVisible();
    });
  });

  test.describe('Create User (Create)', () => {
    test("should open create user dialog when clicking 'New User'", async ({ page }) => {
      // Click "New User" button
      await page.getByRole('button', { name: /new user/i }).click();

      // Dialog should be visible
      await expect(page.getByRole('heading', { name: /^create user$/i })).toBeVisible();

      // Form fields should be visible
      await expect(page.getByLabel(/^name$/i)).toBeVisible();
      await expect(page.getByLabel(/^email$/i)).toBeVisible();
      await expect(page.getByLabel(/^password$/i)).toBeVisible();

      // Submit button should be visible
      await expect(page.getByRole('button', { name: /create user/i })).toBeVisible();
    });

    test('should create a new agent user successfully', async ({ page }) => {
      await expect(page).toHaveURL('/users');
      await expect(page.getByRole('heading', { name: /^users$/i })).toBeVisible();

      // Click "New User" button
      await page.getByRole('button', { name: /new user/i }).click();

      // Fill in the form
      const timestamp = Date.now();
      const userName = `Test Agent ${timestamp}`;
      const userEmail = `agent${timestamp}@example.com`;
      const userPassword = 'password123';

      await page.getByLabel(/^name$/i).fill(userName);
      await page.getByLabel(/^email$/i).fill(userEmail);
      await page.getByLabel(/^password$/i).fill(userPassword);

      // Listen for the API response
      const responsePromise = page.waitForResponse(
        (response) =>
          response.url().includes('/api/users') &&
          response.request().method() === 'POST',
        { timeout: 10000 },
      );

      // Submit the form
      await page.getByRole('button', { name: /create user/i }).click();

      // Wait for the API response
      const response = await responsePromise;
      expect(response.status()).toBe(201);

      // Wait for the new user to appear in the table
      await expect(page.getByRole('cell', { name: userEmail, exact: true })).toBeVisible();

      // Verify user details are correct
      const newUserRow = page.getByRole('row').filter({ hasText: userEmail });
      await expect(newUserRow).toContainText(userName);
      await expect(newUserRow).toContainText(userEmail);
      await expect(newUserRow).toContainText('agent');

      // New agent user should have both edit and delete buttons
      await expect(
        newUserRow.getByRole('button', { name: new RegExp(`edit ${userName}`, 'i') }),
      ).toBeVisible();
      await expect(
        newUserRow.getByRole('button', { name: new RegExp(`delete ${userName}`, 'i') }),
      ).toBeVisible();
    });
  });

  test.describe('Edit User (Update)', () => {
    test('should open edit user dialog with pre-populated values', async ({ page }) => {
      // First create a user to edit
      await page.getByRole('button', { name: /new user/i }).click();
      const timestamp = Date.now();
      const userName = `Edit Test ${timestamp}`;
      const userEmail = `edittest${timestamp}@example.com`;

      await page.getByLabel(/^name$/i).fill(userName);
      await page.getByLabel(/^email$/i).fill(userEmail);
      await page.getByLabel(/^password$/i).fill('password123');
      await page.getByRole('button', { name: /create user/i }).click();

      // Wait for user to appear in the table
      await expect(page.getByRole('cell', { name: userEmail })).toBeVisible();

      // Click edit button for the newly created user
      const userRow = page.getByRole('row').filter({ hasText: userEmail });
      await userRow.getByRole('button', { name: new RegExp(`edit ${userName}`, 'i') }).click();

      // Edit dialog should be visible
      await expect(page.getByRole('heading', { name: /^edit user$/i })).toBeVisible();

      // Form fields should be pre-populated
      await expect(page.getByLabel(/^name$/i)).toHaveValue(userName);
      await expect(page.getByLabel(/^email$/i)).toHaveValue(userEmail);

      // Password field should be empty with placeholder text
      await expect(page.getByLabel(/^password$/i)).toHaveValue('');
      await expect(page.getByLabel(/^password$/i)).toHaveAttribute(
        'placeholder',
        /leave blank to keep current/i,
      );

      // Submit button should say "Save Changes"
      await expect(page.getByRole('button', { name: /save changes/i })).toBeVisible();
    });

    test('should edit user name and email together', async ({ page }) => {
      // Create a user
      await page.getByRole('button', { name: /new user/i }).click();
      const timestamp = Date.now();
      const originalName = `Original Both ${timestamp}`;
      const originalEmail = `originalboth${timestamp}@example.com`;

      await page.getByLabel(/^name$/i).fill(originalName);
      await page.getByLabel(/^email$/i).fill(originalEmail);
      await page.getByLabel(/^password$/i).fill('password123');
      await page.getByRole('button', { name: /create user/i }).click();

      await expect(page.getByRole('cell', { name: originalEmail, exact: true })).toBeVisible();

      // Open edit dialog
      const userRow = page.getByRole('row').filter({ hasText: originalEmail });
      await userRow.getByRole('button', { name: new RegExp(`edit ${originalName}`, 'i') }).click();

      // Edit both name and email
      const newName = `Updated Both ${timestamp}`;
      const newEmail = `updatedboth${timestamp}@example.com`;
      await page.getByLabel(/^name$/i).clear();
      await page.getByLabel(/^name$/i).fill(newName);
      await page.getByLabel(/^email$/i).clear();
      await page.getByLabel(/^email$/i).fill(newEmail);

      // Submit the form
      await page.getByRole('button', { name: /save changes/i }).click();

      // Wait for the updated values to appear in the table
      await expect(page.getByRole('cell', { name: newEmail, exact: true })).toBeVisible();
      await expect(page.getByRole('cell', { name: newName, exact: true })).toBeVisible();

      // Original values should not be visible
      await expect(page.getByText(originalName)).not.toBeVisible();
      await expect(page.getByText(originalEmail)).not.toBeVisible();
    });

    test('should update only user name keeping email unchanged', async ({ page }) => {
      // Create a user
      await page.getByRole('button', { name: /new user/i }).click();
      const timestamp = Date.now();
      const originalName = `Original NameOnly ${timestamp}`;
      const userEmail = `nameonly${timestamp}@example.com`;

      await page.getByLabel(/^name$/i).fill(originalName);
      await page.getByLabel(/^email$/i).fill(userEmail);
      await page.getByLabel(/^password$/i).fill('password123');
      await page.getByRole('button', { name: /create user/i }).click();

      await expect(page.getByRole('cell', { name: userEmail, exact: true })).toBeVisible();

      // Open edit dialog
      const userRow = page.getByRole('row').filter({ hasText: userEmail });
      await userRow.getByRole('button', { name: new RegExp(`edit ${originalName}`, 'i') }).click();

      // Edit only name
      const updatedName = `Renamed User ${timestamp}`;
      await page.getByLabel(/^name$/i).clear();
      await page.getByLabel(/^name$/i).fill(updatedName);

      // Save changes
      await page.getByRole('button', { name: /save changes/i }).click();

      // Wait for the new name to appear with the existing email
      await expect(page.getByRole('cell', { name: updatedName, exact: true })).toBeVisible();
      await expect(page.getByRole('cell', { name: userEmail, exact: true })).toBeVisible();
    });

    test('should update user password and allow logging in with new password', async ({ page }) => {
      // Create a user with initial password
      await page.getByRole('button', { name: /new user/i }).click();
      const timestamp = Date.now();
      const userName = `Password Test ${timestamp}`;
      const userEmail = `pwduser${timestamp}@example.com`;
      const initialPassword = 'oldpassword123';
      const updatedPassword = 'newpassword456';

      await page.getByLabel(/^name$/i).fill(userName);
      await page.getByLabel(/^email$/i).fill(userEmail);
      await page.getByLabel(/^password$/i).fill(initialPassword);
      await page.getByRole('button', { name: /create user/i }).click();

      await expect(page.getByRole('cell', { name: userEmail, exact: true })).toBeVisible();

      // Open edit dialog
      const userRow = page.getByRole('row').filter({ hasText: userEmail });
      await userRow.getByRole('button', { name: new RegExp(`edit ${userName}`, 'i') }).click();

      // Set new password
      await page.getByLabel(/^password$/i).fill(updatedPassword);

      // Submit changes
      await page.getByRole('button', { name: /save changes/i }).click();
      await expect(page.getByRole('heading', { name: /^edit user$/i })).not.toBeVisible();

      // Sign out as admin
      await logout(page);

      // Log in with the updated password
      await login(page, { email: userEmail, password: updatedPassword });

      // Verify successful login redirect to dashboard
      await expect(page).toHaveURL('/');
      await expect(page.getByText(userName)).toBeVisible();
    });
  });

  test.describe('Delete User (Delete)', () => {
    test('should open delete confirmation dialog with user details', async ({ page }) => {
      // Create a user to delete
      await page.getByRole('button', { name: /new user/i }).click();
      const timestamp = Date.now();
      const userName = `Delete Test ${timestamp}`;
      const userEmail = `deletetest${timestamp}@example.com`;

      await page.getByLabel(/^name$/i).fill(userName);
      await page.getByLabel(/^email$/i).fill(userEmail);
      await page.getByLabel(/^password$/i).fill('password123');
      await page.getByRole('button', { name: /create user/i }).click();

      // Wait for user to appear in the table
      await expect(page.getByRole('cell', { name: userEmail })).toBeVisible();

      // Click delete button
      const userRow = page.getByRole('row').filter({ hasText: userEmail });
      await userRow.getByRole('button', { name: new RegExp(`delete ${userName}`, 'i') }).click();

      // Delete confirmation dialog should be visible
      await expect(page.getByRole('heading', { name: /^delete user$/i })).toBeVisible();

      // Confirmation message should include user name
      await expect(
        page.getByText(new RegExp(`are you sure you want to delete ${userName}`, 'i')),
      ).toBeVisible();

      // Cancel and Confirm buttons should be visible
      await expect(page.getByRole('button', { name: /^cancel$/i })).toBeVisible();
      await expect(page.getByRole('button', { name: /^confirm$/i })).toBeVisible();
    });

    test('should cancel deletion and keep user when clicking Cancel', async ({ page }) => {
      // Create a user
      await page.getByRole('button', { name: /new user/i }).click();
      const timestamp = Date.now();
      const userName = `Cancel Delete ${timestamp}`;
      const userEmail = `canceldelete${timestamp}@example.com`;

      await page.getByLabel(/^name$/i).fill(userName);
      await page.getByLabel(/^email$/i).fill(userEmail);
      await page.getByLabel(/^password$/i).fill('password123');
      await page.getByRole('button', { name: /create user/i }).click();

      await expect(page.getByRole('cell', { name: userEmail, exact: true })).toBeVisible();

      // Open delete dialog
      const userRow = page.getByRole('row').filter({ hasText: userEmail });
      await userRow.getByRole('button', { name: new RegExp(`delete ${userName}`, 'i') }).click();
      await expect(page.getByRole('heading', { name: /^delete user$/i })).toBeVisible();

      // Click Cancel
      await page.getByRole('button', { name: /^cancel$/i }).click();

      // Dialog should close
      await expect(page.getByRole('heading', { name: /^delete user$/i })).not.toBeVisible();

      // User should still exist in the table
      await expect(page.getByRole('cell', { name: userEmail, exact: true })).toBeVisible();
      await expect(page.getByRole('cell', { name: userName, exact: true })).toBeVisible();
    });

    test('should delete user successfully when clicking Confirm', async ({ page }) => {
      // Create a user to delete
      await page.getByRole('button', { name: /new user/i }).click();
      const timestamp = Date.now();
      const userName = `To Delete ${timestamp}`;
      const userEmail = `todelete${timestamp}@example.com`;

      await page.getByLabel(/^name$/i).fill(userName);
      await page.getByLabel(/^email$/i).fill(userEmail);
      await page.getByLabel(/^password$/i).fill('password123');
      await page.getByRole('button', { name: /create user/i }).click();

      // Wait for user to appear in the table
      await expect(page.getByRole('cell', { name: userEmail })).toBeVisible();

      // Click delete button
      const userRow = page.getByRole('row').filter({ hasText: userEmail });
      await userRow.getByRole('button', { name: new RegExp(`delete ${userName}`, 'i') }).click();

      // Click Confirm
      await page.getByRole('button', { name: /^confirm$/i }).click();

      // Wait for the user to be removed from the table
      await expect(page.getByRole('cell', { name: userEmail, exact: true })).not.toBeVisible();
      await expect(page.getByText(userName)).not.toBeVisible();
    });
  });
});
