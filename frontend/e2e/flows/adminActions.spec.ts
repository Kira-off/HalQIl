import { test, expect } from '@playwright/test';

test.describe('Super Admin Administration Flow (Role.SUPER_ADMIN)', () => {
  test.beforeEach(async ({ page }) => {
    // Intercept profile endpoints for Role.SUPER_ADMIN
    await page.route('**/api/auth/users/me/', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          id: 'usr_admin_1',
          wallet_id: '0x9999999999999999999999999999999999999999',
          first_name: 'Adham',
          last_name: 'Aliev',
          username: 'super_adham',
          email: 'adham@halqil.uz',
          role: 'SUPER_ADMIN',
          status: 'ACTIVE',
        }),
      });
    });

    await page.route('**/api/users/me/', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          id: 'usr_admin_1',
          wallet_id: '0x9999999999999999999999999999999999999999',
          first_name: 'Adham',
          last_name: 'Aliev',
          username: 'super_adham',
          email: 'adham@halqil.uz',
          role: 'SUPER_ADMIN',
          status: 'ACTIVE',
        }),
      });
    });

    // Mock admin list users
    await page.route('**/api/admin/users/', async (route) => {
      if (route.request().method() === 'GET') {
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify([
            {
              id: 'usr_user_1',
              wallet_id: '0x1111111111111111111111111111111111111111',
              first_name: 'Mijoz',
              last_name: 'Karimov',
              username: 'mijoz_user',
              email: 'mijoz@halqil.uz',
              role: 'USER',
              status: 'ACTIVE',
              created_at: '2026-05-19T10:00:00Z',
            },
            {
              id: 'usr_provider_1',
              wallet_id: '0x2222222222222222222222222222222222222222',
              first_name: 'Farxod',
              last_name: 'Alimov',
              username: 'farxod_plumber',
              email: 'farxod.plumber@gmail.com',
              role: 'PROVIDER',
              status: 'ACTIVE',
              created_at: '2026-05-19T11:00:00Z',
            },
          ]),
        });
      } else {
        await route.fallback();
      }
    });

    // Mock admin provider applications list
    await page.route('**/api/admin/applications/', async (route) => {
      if (route.request().method() === 'GET') {
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify([
            {
              id: 55,
              user: {
                id: 'usr_provider_2',
                wallet_id: '0x3333333333333333333333333333333333333333',
                first_name: 'Sobir',
                last_name: 'Karimov',
                username: 'sobir_electro',
                email: 'sobir@gmail.com',
                role: 'PROVIDER',
                status: 'ACTIVE',
              },
              status: 'PENDING',
              about_me: 'Professional elektrikman, tajriba 15 yil.',
              why_join: 'Ko\'proq mijozlar topish.',
              districts: ['Chilonzor', 'Mirzo Ulug\'bek'],
              skills: [
                {
                  skill_id: 2,
                  service_type: 'BOTH',
                  experience_years: 15,
                  price_from: '60000',
                  price_to: '120000',
                  description: 'Barcha elektrik ishlari',
                },
              ],
            },
          ]),
        });
      } else {
        await route.fallback();
      }
    });

    // Mock admin active disputed orders list
    await page.route('**/api/admin/orders/disputed/', async (route) => {
      if (route.request().method() === 'GET') {
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify([
            {
              id: 201,
              user: {
                id: 'usr_user_1',
                first_name: 'Mijoz',
                last_name: 'Karimov',
                username: 'mijoz_user',
                email: 'mijoz@halqil.uz',
                role: 'USER',
                status: 'ACTIVE',
              },
              provider: {
                id: 1,
                user: {
                  id: 'usr_provider_1',
                  first_name: 'Farxod',
                  last_name: 'Alimov',
                  username: 'farxod_plumber',
                  email: 'farxod.plumber@gmail.com',
                  role: 'PROVIDER',
                  status: 'ACTIVE',
                },
              },
              description: 'Mutaxassis kelishilgan vaqtda kelmadi va ishni chala qoldirdi. Qaytarib to\'lov talab qilaman.',
              price: 100000,
              status: 'DISPUTED',
              district: 'Yunusobod',
              address: 'Yunusobod 4, 12-uy',
              created_at: '2026-05-20T10:00:00Z',
              updated_at: '2026-05-20T11:00:00Z',
            },
          ]),
        });
      } else {
        await route.fallback();
      }
    });

    // Mock notify broadcast endpoint
    await page.route('**/api/admin/notifications/broadcast/', async (route) => {
      if (route.request().method() === 'POST') {
        await route.fulfill({
          status: 201,
          contentType: 'application/json',
          body: JSON.stringify({ success: true }),
        });
      } else {
        await route.fallback();
      }
    });
  });

  test('User with Role.USER is redirected to /403 when trying to access /admin', async ({ page }) => {
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

    // 2. Attempt to visit admin dashboard
    await page.goto('/admin');

    // 3. Assert redirection to /403 page
    await expect(page).toHaveURL(/\/403/);
    await expect(page.getByText('403').first()).toBeVisible();
  });

  test('Role.SUPER_ADMIN can view dashboard, search and freeze users', async ({ page }) => {
    // 1. Inject Role.SUPER_ADMIN credentials
    await page.addInitScript(() => {
      window.localStorage.setItem('access_token', 'mock_token_admin');
      window.localStorage.setItem(
        'user',
        JSON.stringify({
          id: 'usr_admin_1',
          wallet_id: '0x9999999999999999999999999999999999999999',
          first_name: 'Adham',
          last_name: 'Aliev',
          username: 'super_adham',
          email: 'adham@halqil.uz',
          role: 'SUPER_ADMIN',
          status: 'ACTIVE',
        })
      );
    });

    let patchUserCalled = false;
    let patchUserPayload: { status?: string } | null = null;

    // Mock individual user patch endpoint
    await page.route('**/api/admin/users/usr_provider_1/', async (route) => {
      if (route.request().method() === 'PATCH') {
        patchUserCalled = true;
        patchUserPayload = route.request().postDataJSON() as { status?: string };
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({
            id: 'usr_provider_1',
            status: 'FROZEN',
          }),
        });
      } else {
        await route.fallback();
      }
    });

    // 2. Go to /admin dashboard
    await page.goto('/admin');
    await expect(page.locator('h1')).toContainText('Tizim Boshqaruvi');
    await expect(page.locator('span:has-text("Super Admin")')).toBeVisible();

    // 3. Navigate to users console
    const usersLink = page.locator('a:has-text("Foydalanuvchilar")').first();
    await usersLink.click();
    await expect(page).toHaveURL(/\/admin\/users/);
    await expect(page.locator('h1')).toContainText('Foydalanuvchilar Ro\'yxati');

    // 4. Assert table and search input loaded
    const searchInput = page.locator('input[placeholder*="qidirish"]');
    await expect(searchInput).toBeVisible();

    // Test search filter
    await searchInput.fill('farxod');
    await expect(page.locator('text=Farxod Alimov')).toBeVisible();
    await expect(page.locator('text=Mijoz Karimov')).toBeHidden();

    // Reset search
    await searchInput.fill('');
    await expect(page.locator('text=Mijoz Karimov')).toBeVisible();

    // 5. Freeze an active user
    const freezeBtn = page.locator('tr:has-text("Farxod Alimov") button:has-text("Freeze")');
    await expect(freezeBtn).toBeVisible();
    await freezeBtn.click();

    // 6. Assert user status patch request is issued and status tag updates
    await expect.poll(() => patchUserCalled).toBe(true);
    expect(patchUserPayload).not.toBeNull();
    expect(patchUserPayload?.status).toBe('FROZEN');

    // Check optimistic update is reflected in the row
    await expect(page.locator('tr:has-text("Farxod Alimov") >> span:has-text("FROZEN")')).toBeVisible();
  });

  test('Role.SUPER_ADMIN can approve provider applications', async ({ page }) => {
    // 1. Inject Role.SUPER_ADMIN credentials
    await page.addInitScript(() => {
      window.localStorage.setItem('access_token', 'mock_token_admin');
      window.localStorage.setItem(
        'user',
        JSON.stringify({
          id: 'usr_admin_1',
          wallet_id: '0x9999999999999999999999999999999999999999',
          first_name: 'Adham',
          last_name: 'Aliev',
          username: 'super_adham',
          email: 'adham@halqil.uz',
          role: 'SUPER_ADMIN',
          status: 'ACTIVE',
        })
      );
    });

    let patchAppCalled = false;
    let patchAppPayload: { status?: string } | null = null;

    // Mock application patch endpoint
    await page.route('**/api/admin/applications/55/', async (route) => {
      if (route.request().method() === 'PATCH') {
        patchAppCalled = true;
        patchAppPayload = route.request().postDataJSON() as { status?: string };
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({
            id: 55,
            status: 'APPROVED',
          }),
        });
      } else {
        await route.fallback();
      }
    });

    // 2. Go straight to admin applications review page
    await page.goto('/admin/applications');
    await expect(page.locator('h1')).toContainText('Provayderlik Arizalari Moderatsiyasi');

    // 3. Verify application details are rendered beautifully
    await expect(page.locator('text=Sobir Karimov')).toBeVisible();
    await expect(page.locator('text=Professional elektrikman, tajriba 15 yil.')).toBeVisible();
    await expect(page.locator('text=Chilonzor')).toBeVisible();
    await expect(page.locator('text=Mirzo Ulug\'bek')).toBeVisible();
    await expect(page.locator('text=60,000-120,000 UZS/soat')).toBeVisible();

    // 4. Click Approve/Tasdiqlash button
    const approveBtn = page.locator('button:has-text("Tasdiqlash")');
    await expect(approveBtn).toBeVisible();
    await approveBtn.click();

    // 5. Assert PATCH request is sent
    await expect.poll(() => patchAppCalled).toBe(true);
    expect(patchAppPayload).not.toBeNull();
    expect(patchAppPayload?.status).toBe('APPROVED');
  });

  test('Role.SUPER_ADMIN can resolve disputed orders', async ({ page }) => {
    // 1. Inject Role.SUPER_ADMIN credentials
    await page.addInitScript(() => {
      window.localStorage.setItem('access_token', 'mock_token_admin');
      window.localStorage.setItem(
        'user',
        JSON.stringify({
          id: 'usr_admin_1',
          wallet_id: '0x9999999999999999999999999999999999999999',
          first_name: 'Adham',
          last_name: 'Aliev',
          username: 'super_adham',
          email: 'adham@halqil.uz',
          role: 'SUPER_ADMIN',
          status: 'ACTIVE',
        })
      );
    });

    let patchDisputeCalled = false;
    let patchDisputePayload: { resolution_comment?: string; refund_to_user?: boolean; resolution?: string } | null = null;

    // Mock disputes patch endpoint
    await page.route('**/api/admin/orders/disputed/201/', async (route) => {
      if (route.request().method() === 'PATCH') {
        patchDisputeCalled = true;
        patchDisputePayload = route.request().postDataJSON() as { resolution_comment?: string; refund_to_user?: boolean; resolution?: string };
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({
            id: 201,
            status: 'RESOLVED',
          }),
        });
      } else {
        await route.fallback();
      }
    });

    // 2. Go to disputes admin dashboard
    await page.goto('/admin/disputes');
    await expect(page.locator('h1')).toContainText('Nizolarni Hal Qilish Paneli');

    // 3. Assert dispute card is fully rendered
    await expect(page.locator('text=Buyurtma #201')).toBeVisible();
    await expect(page.locator('text=Mutaxassis kelishilgan vaqtda kelmadi').first()).toBeVisible();
    await expect(page.locator('text=Mijoz Karimov')).toBeVisible();
    await expect(page.locator('text=Farxod Alimov')).toBeVisible();

    // 4. Fill resolution comment and resolve in client's favor
    await page.locator('textarea[placeholder*="sababi va qaror tafsilotini"]').fill('Mijozning arizasi to\'liq o\'rganildi. Mutaxassis chaqiruvga kechikkani sababli, mablag\' mijozga to\'liq qaytariladi.');

    const clientFavorBtn = page.locator('button:has-text("Mijoz foydasiga")');
    await expect(clientFavorBtn).toBeVisible();
    await clientFavorBtn.click();

    // 5. Assert PATCH request is issued with the correct resolution details
    await expect.poll(() => patchDisputeCalled).toBe(true);
    expect(patchDisputePayload).not.toBeNull();
    expect(patchDisputePayload?.resolution_comment).toContain('Mijozning arizasi to\'liq o\'rganildi');
    expect(patchDisputePayload?.refund_to_user).toBe(true);
    expect(patchDisputePayload?.resolution).toBe('USER_FAVOR');

    // Success text is shown
    await expect(page.locator('text=Nizo muvaffaqiyatli hal qilindi!')).toBeVisible();
  });

  test('Role.SUPER_ADMIN can broadcast global announcement notification', async ({ page }) => {
    // 1. Inject Role.SUPER_ADMIN credentials
    await page.addInitScript(() => {
      window.localStorage.setItem('access_token', 'mock_token_admin');
      window.localStorage.setItem(
        'user',
        JSON.stringify({
          id: 'usr_admin_1',
          wallet_id: '0x9999999999999999999999999999999999999999',
          first_name: 'Adham',
          last_name: 'Aliev',
          username: 'super_adham',
          email: 'adham@halqil.uz',
          role: 'SUPER_ADMIN',
          status: 'ACTIVE',
        })
      );
    });

    let broadcastCalled = false;
    let broadcastPayload: { title?: string; message?: string; type?: string; is_global?: boolean; target?: string } | null = null;

    // Intercept notify broadcast endpoint
    await page.route('**/api/admin/notifications/broadcast/', async (route) => {
      if (route.request().method() === 'POST') {
        broadcastCalled = true;
        broadcastPayload = route.request().postDataJSON() as { title?: string; message?: string; type?: string; is_global?: boolean; target?: string };
        await route.fulfill({
          status: 201,
          contentType: 'application/json',
          body: JSON.stringify({ success: true }),
        });
      } else {
        await route.fallback();
      }
    });

    // 2. Visit main admin dashboard
    await page.goto('/admin');

    // 3. Fill notification sender console
    await page.locator('input[placeholder*="Xabar sarlavhasi"]').fill('Tizimdagi texnik ta\'mirlash ishlari');
    
    // Choose Warning category and all targets
    await page.locator('select').first().selectOption('WARNING');
    await page.locator('select').nth(1).selectOption('ALL');

    await page.locator('textarea[placeholder*="Broadcast xabar matnini"]').fill('Hurmatli foydalanuvchilar, bugun tunda soat 02:00 dan 04:00 gacha platformada profilaktika ishlari olib boriladi. Keltirilgan noqulayliklar uchun uzr so\'raymiz.');

    // 4. Submit broadcast message
    const sendBtn = page.locator('button:has-text("Xabarni yuborish")');
    await expect(sendBtn).toBeVisible();
    await sendBtn.click();

    // 5. Assert POST endpoint was called with correct data payload
    await expect.poll(() => broadcastCalled).toBe(true);
    expect(broadcastPayload).not.toBeNull();
    expect(broadcastPayload?.title).toBe('Tizimdagi texnik ta\'mirlash ishlari');
    expect(broadcastPayload?.message).toContain('Hurmatli foydalanuvchilar, bugun tunda');
    expect(broadcastPayload?.type).toBe('WARNING');
    expect(broadcastPayload?.is_global).toBe(true);
    expect(broadcastPayload?.target).toBe('ALL');

    // Assert success banner appears
    await expect(page.locator('text=Bildirishnoma muvaffaqiyatli yuborildi!')).toBeVisible();
  });
});
