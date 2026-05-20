import { test, expect } from '@playwright/test';

test.describe('Provider Workspace & Schedule Flow (Role.PROVIDER)', () => {
  test.beforeEach(async ({ page }) => {
    // Intercept standard authentication profile endpoints
    await page.route('**/api/auth/users/me/', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          id: 'usr_provider_1',
          wallet_id: '0x2222222222222222222222222222222222222222',
          first_name: 'Farxod',
          last_name: 'Alimov',
          username: 'farxod_plumber',
          email: 'farxod.plumber@gmail.com',
          role: 'PROVIDER',
          status: 'ACTIVE',
        }),
      });
    });

    await page.route('**/api/users/me/', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          id: 'usr_provider_1',
          wallet_id: '0x2222222222222222222222222222222222222222',
          first_name: 'Farxod',
          last_name: 'Alimov',
          username: 'farxod_plumber',
          email: 'farxod.plumber@gmail.com',
          role: 'PROVIDER',
          status: 'ACTIVE',
        }),
      });
    });

    // Mock existing services list GET request
    await page.route('**/api/provider/skills/', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify([
          {
            id: 10,
            skill: { id: 1, name: 'Santexnika', description: 'Santexnika ishlari' },
            service_type: 'BOTH',
            experience_years: 5,
            price_from: '50000.00',
            price_to: '100000.00',
            description: 'Eski santexnika jihozlarini almashtirish va yangilarini o\'rnatish.',
          },
        ]),
      });
    });

    // Mock provider apply POST endpoint
    await page.route('**/api/provider/apply/', async (route) => {
      if (route.request().method() === 'POST') {
        await route.fulfill({
          status: 201,
          contentType: 'application/json',
          body: JSON.stringify({
            id: 42,
            status: 'PENDING',
          }),
        });
      } else {
        await route.fallback();
      }
    });

    // Mock schedule endpoints
    await page.route('**/api/provider/schedule/', async (route) => {
      if (route.request().method() === 'GET') {
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({
            schedule: [
              { id: 101, day_of_week: 'MONDAY', open_time: '09:00', close_time: '18:00', is_active: true },
              { id: 102, day_of_week: 'TUESDAY', open_time: '09:00', close_time: '18:00', is_active: false },
              { id: 103, day_of_week: 'WEDNESDAY', open_time: '09:00', close_time: '18:00', is_active: false },
              { id: 104, day_of_week: 'THURSDAY', open_time: '09:00', close_time: '18:00', is_active: false },
              { id: 105, day_of_week: 'FRIDAY', open_time: '09:00', close_time: '18:00', is_active: false },
              { id: 106, day_of_week: 'SATURDAY', open_time: '09:00', close_time: '18:00', is_active: false },
              { id: 107, day_of_week: 'SUNDAY', open_time: '09:00', close_time: '18:00', is_active: false },
            ],
          }),
        });
      } else if (route.request().method() === 'PATCH') {
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({
            success: true,
          }),
        });
      } else {
        await route.fallback();
      }
    });
  });

  test('User with Role.USER is redirected to /403 when trying to access /provider', async ({ page }) => {
    // 1. Inject Role.USER credentials
    await page.addInitScript(() => {
      window.localStorage.setItem('access_token', 'mock_token_user');
      window.localStorage.setItem(
        'user',
        JSON.stringify({
          id: 'usr_user_1',
          wallet_id: '0x1111111111111111111111111111111111111111',
          first_name: 'Mijoz',
          last_name: 'Karimov',
          username: 'mijoz_user',
          email: 'mijoz@halqil.uz',
          role: 'USER',
          status: 'ACTIVE',
        })
      );
    });

    // 2. Attempt to visit provider dashboard
    await page.goto('/provider');

    // 3. Assert redirection to /403 page
    await expect(page).toHaveURL(/\/403/);
    await expect(page.getByText('403').first()).toBeVisible();
  });

  test('User with Role.PROVIDER can view dashboard and submit application form', async ({ page }) => {
    // 1. Inject Role.PROVIDER credentials
    await page.addInitScript(() => {
      window.localStorage.setItem('access_token', 'mock_token_provider');
      window.localStorage.setItem(
        'user',
        JSON.stringify({
          id: 'usr_provider_1',
          wallet_id: '0x2222222222222222222222222222222222222222',
          first_name: 'Farxod',
          last_name: 'Alimov',
          username: 'farxod_plumber',
          email: 'farxod.plumber@gmail.com',
          role: 'PROVIDER',
          status: 'ACTIVE',
        })
      );
    });

    // 2. Visit provider dashboard
    await page.goto('/provider');
    await expect(page.locator('h1')).toContainText('Farxod Alimov');
    await expect(page.locator('span:has-text("Mutaxassis paneli")')).toBeVisible();

    // 3. Toggle tab to application form ("Kategoriya qo'shish arizasi")
    const appTabButton = page.locator('button:has-text("Kategoriya qo\'shish arizasi")');
    await expect(appTabButton).toBeVisible();
    await appTabButton.click();

    // 4. Verify ApplicationForm is rendered
    await expect(page.locator('h2:has-text("Mutaxassislik arizasi")')).toBeVisible();

    // 5. Fill application details
    await page.locator('textarea[placeholder*="O\'zingiz va bajara oladigan"]').fill('Men professional usta santexnikman, 10 yildan ortiq tajribaga egaman va har qanday murakkablikdagi ishlarni sifatli bajara olaman.');
    await page.locator('input[placeholder="Masalan: 5"]').fill('8');
    await page.locator('input[placeholder="Masalan: 50000"]').fill('70000');
    await page.locator('input[placeholder*="https://mywork.com"]').fill('https://farxod-plumbing.uz');

    // Select service location districts
    const chilonzorBtn = page.locator('button:has-text("Chilonzor")');
    const yunusobodBtn = page.locator('button:has-text("Yunusobod")');
    await expect(chilonzorBtn).toBeVisible();
    await chilonzorBtn.click();
    await yunusobodBtn.click();

    // Submit form
    const submitBtn = page.locator('button[type="submit"]:has-text("Ariza topshirish")');
    await expect(submitBtn).toBeVisible();
    await submitBtn.click();

    // 6. Assert success screen details
    await expect(page.locator('h2:has-text("Ariza muvaffaqiyatli yuborildi!")')).toBeVisible();
    await expect(page.locator('span:has-text("Kutilmoqda")')).toBeVisible();
  });

  test('User with Role.PROVIDER can edit schedule weekly calendar grid', async ({ page }) => {
    // 1. Inject Role.PROVIDER credentials
    await page.addInitScript(() => {
      window.localStorage.setItem('access_token', 'mock_token_provider');
      window.localStorage.setItem(
        'user',
        JSON.stringify({
          id: 'usr_provider_1',
          wallet_id: '0x2222222222222222222222222222222222222222',
          first_name: 'Farxod',
          last_name: 'Alimov',
          username: 'farxod_plumber',
          email: 'farxod.plumber@gmail.com',
          role: 'PROVIDER',
          status: 'ACTIVE',
        })
      );
    });

    // Keep track of PATCH requests
    let patchCount = 0;
    let requestPayload: {
      schedule?: Array<{
        day_of_week: string;
        is_active: boolean;
        open_time: string;
        close_time: string;
      }>;
    } | null = null;

    await page.route('**/api/provider/schedule/', async (route) => {
      if (route.request().method() === 'PATCH') {
        patchCount++;
        requestPayload = route.request().postDataJSON();
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({ success: true }),
        });
      } else {
        await route.fallback();
      }
    });

    // 2. Navigate straight to provider schedule page
    await page.goto('/provider/schedule');

    // 3. Assert redirection did not occur, header is correct
    await expect(page.locator('h2:has-text("Ish tartibi taqvimi")')).toBeVisible();

    // 4. Assert 7 days grid is present
    await expect(page.getByText('Dushanba', { exact: true })).toBeVisible();
    await expect(page.getByText('Seshanba', { exact: true })).toBeVisible();
    await expect(page.getByText('Chorshanba', { exact: true })).toBeVisible();
    await expect(page.getByText('Payshanba', { exact: true })).toBeVisible();
    await expect(page.getByText('Juma', { exact: true })).toBeVisible();
    await expect(page.getByText('Shanba', { exact: true })).toBeVisible();
    await expect(page.getByText('Yakshanba', { exact: true })).toBeVisible();

    // 5. Toggle active switch for a day (e.g. Tuesday at index 1)
    const tuesdayToggle = page.locator('input[type="checkbox"]').nth(1);
    await tuesdayToggle.check({ force: true });

    // Set time inputs for Tuesday (open_time and close_time)
    await page.locator('input[type="time"]').nth(2).fill('08:00'); // Tuesday open
    await page.locator('input[type="time"]').nth(3).fill('17:00'); // Tuesday close

    // 6. Click save schedule button
    const saveBtn = page.locator('button[type="submit"]:has-text("Ish jadvalini saqlash")');
    await expect(saveBtn).toBeVisible();
    await saveBtn.click();

    // 7. Verify exactly one PATCH request was made with the updated data
    await expect.poll(() => patchCount).toBe(1);
    expect(requestPayload).not.toBeNull();
    expect(requestPayload.schedule).toBeDefined();
    expect(requestPayload.schedule.length).toBe(7);
    
    // Check that Tuesday (index 1) is active and has correct times in the payload
    const tuesdayData = requestPayload.schedule[1];
    expect(tuesdayData.day_of_week).toBe(2);
    expect(tuesdayData.is_active).toBe(true);
    expect(tuesdayData.open_time).toBe('08:00');
    expect(tuesdayData.close_time).toBe('17:00');

    // Assert success feedback message
    await expect(page.locator('text=Haftalik ish tartibi muvaffaqiyatli saqlandi!')).toBeVisible();
  });
});
