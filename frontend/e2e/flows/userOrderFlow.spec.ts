import { test, expect } from '@playwright/test';

test.describe('Customer Order Lifecycle Flow (Role.USER)', () => {
  test.beforeEach(async ({ page }) => {
    // Intercept API routes to respond with clean, deterministic mock data
    await page.route('**/api/auth/users/me/', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          id: 'usr_user_1',
          wallet_id: '0x1111111111111111111111111111111111111111',
          first_name: 'Mijoz',
          last_name: 'Karimov',
          username: 'mijoz_user',
          email: 'mijoz@halqil.uz',
          role: 'USER',
          status: 'ACTIVE',
        }),
      });
    });

    await page.route('**/api/users/me/', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          id: 'usr_user_1',
          wallet_id: '0x1111111111111111111111111111111111111111',
          first_name: 'Mijoz',
          last_name: 'Karimov',
          username: 'mijoz_user',
          email: 'mijoz@halqil.uz',
          role: 'USER',
          status: 'ACTIVE',
        }),
      });
    });

    // Mock specialists list
    await page.route('**/api/provider/skills/', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify([
          {
            id: 1,
            user: {
              id: 'usr_001',
              wallet_id: '0x71C7656EC7ab88b098defB751B7401B5f6d8976F',
              first_name: 'Farxod',
              last_name: 'Alimov',
              username: 'farxod_plumber',
              email: 'farxod.plumber@gmail.com',
              role: 'PROVIDER',
              status: 'ACTIVE',
              is_online: true,
              avatar: null,
            },
            bio: 'Professional santexnika xizmatlari. 10 yildan ortiq tajriba.',
            availability_status: 'AVAILABLE',
            reliability: 98,
            successful_orders: 142,
            failed_orders: 2,
            skills: [
              {
                id: 101,
                provider: 1,
                skill: {
                  id: 10,
                  category: 1,
                  name: 'Santexnika',
                  description: 'Santexnika ishlari va ta\'mirlash',
                  is_active: true,
                },
                service_type: 'BOTH',
                experience_years: 11,
                price_from: '50000',
                price_to: '150000',
                description: 'Barcha santexnika ishlari',
              },
            ],
            districts: [{ id: 201, provider: 1, district_name: 'Yunusobod' }],
            schedule: [
              { id: 301, provider: 1, day_of_week: 1, open_time: '09:00', close_time: '18:00', is_active: true },
            ],
          },
        ]),
      });
    });

    // Mock single order details retrieval
    await page.route('**/api/orders/101/', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          id: 101,
          client: { first_name: 'Mijoz', username: 'mijoz_user', role: 'USER' },
          user: { id: 'usr_user_1', first_name: 'Mijoz', username: 'mijoz_user', role: 'USER' },
          provider: {
            id: 1,
            user: { first_name: 'Farxod', last_name: 'Alimov', role: 'PROVIDER' },
            bio: 'Professional santexnika',
            skills: [],
            districts: [],
            schedule: [],
          },
          service_type: 'PLUMBING',
          description: 'Suv quvuri nosoz holatga kelib qolgan',
          price: 150000,
          status: 'PENDING',
          district: 'Yunusobod',
          address: 'Chilonzor 4, 12-uy, 45',
          created_at: '2026-05-20T12:00:00Z',
          updated_at: '2026-05-20T12:00:00Z',
        }),
      });
    });

    // Mock create order endpoint
    await page.route('**/api/orders/', async (route) => {
      if (route.request().method() === 'POST') {
        await route.fulfill({
          status: 201,
          contentType: 'application/json',
          body: JSON.stringify({ id: 101 }),
        });
      } else {
        await route.fallback();
      }
    });
  });

  test('User can browse, filter, view details, and place order successfully', async ({ page }) => {
    // 1. Pre-authenticate client role user via localStorage injection
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

    // 2. Go to /catalog page
    await page.goto('/catalog');
    await expect(page.locator('h1')).toContainText('Xizmatlar katalogi');

    // Assertion 1: Verify filter panel options
    const categorySelector = page.locator('select').first();
    await expect(categorySelector).toBeVisible();

    // 3. FilterPanel category selection
    await categorySelector.selectOption({ label: 'Santexnika' });

    // Assertion 2: Verify URL contains updated category query parameter
    await expect(page).toHaveURL(/category=Santexnika/);

    // 4. Click specialist card to view details (navigates to /catalog/1)
    const viewButton = page.locator('text=Batafsil').first();
    await viewButton.click();
    await expect(page).toHaveURL(/\/catalog\/1/);

    // Assertion 3: Verify order button is visible for Role.USER
    const orderButton = page.locator('button:has-text("Buyurtma berish")');
    await expect(orderButton).toBeVisible();

    // 5. Open CreateOrderModal and fill form
    await orderButton.click();
    
    const modalTitle = page.locator('h3:has-text("Buyurtma berish")');
    await expect(modalTitle).toBeVisible();

    // Fill form elements
    await page.locator('input[type="datetime-local"]').fill('2026-05-21T10:00');
    await page.locator('input[placeholder*="Masalan: Chilonzor"]').fill('Chilonzor 4, 12-uy, 45');
    await page.locator('textarea[placeholder*="Muammo haqida"]').fill('Suv quvuri nosoz holatga kelib qolgan');

    // Assertion 4: Form validation succeeds and submission works
    const submitOrderButton = page.locator('button[type="submit"]:has-text("Buyurtma berish")');
    await submitOrderButton.click();

    // Assertion 5: Redirect to order detail view occurs
    await expect(page).toHaveURL(/\/orders\/101/);
    await expect(page.locator('h2').first()).toContainText(/HALQIL-101/i);
  });

  test('Provider role user cannot see the Order button', async ({ page }) => {
    // 1. Pre-authenticate provider role user via localStorage injection
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

    // 2. Go straight to specialist catalog details page
    await page.goto('/catalog/1');

    // Assertion: The "Buyurtma berish" button is hidden/unavailable, and restrictions notice is displayed
    const orderButton = page.locator('button:has-text("Buyurtma berish")');
    await expect(orderButton).toBeHidden();
    
    const limitationNotice = page.locator('text=Buyurtma cheklovi');
    await expect(limitationNotice).toBeVisible();
  });
});
