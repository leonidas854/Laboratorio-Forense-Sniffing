import { test, expect } from '@playwright/test';

for (let i = 1; i <= 3; i++) {
  test(`Login de demostración ${i}`, async ({ page, baseURL }) => {
    await page.goto('/');
    await expect(page.getByRole('heading', { name: /Un inicio de sesión/ })).toBeVisible();
    await expect(page.getByTestId('protocol')).toHaveText(new URL(baseURL!).protocol === 'https:' ? 'HTTPS' : 'HTTP');
    await page.getByLabel('Usuario', { exact: true }).fill('admin');
    await page.getByLabel('Contraseña', { exact: true }).fill('admin123');
    await page.getByRole('button', { name: /Iniciar sesión/ }).click();
    await expect(page.getByRole('status')).toContainText('Login exitoso');
  });
}

test('Credenciales incorrectas y formulario móvil', async ({ page }) => {
  await page.setViewportSize({ width: 375, height: 812 });
  await page.goto('/');
  await page.getByLabel('Usuario', { exact: true }).fill('admin');
  await page.getByLabel('Contraseña', { exact: true }).fill('incorrecta');
  await page.getByRole('button', { name: /Iniciar sesión/ }).click();
  await expect(page.getByRole('status')).toContainText('Credenciales inválidas');
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true);
});

test('API rechaza formatos inválidos y consultas de inyección', async ({ request }) => {
  expect((await request.post('/api/login', { data: null, headers: { 'Content-Type': 'application/json' } })).status()).toBe(400);
  expect((await request.post('/api/login', { data: { username: [], password: {} } })).status()).toBe(400);
  expect((await request.post('/api/login', { data: '{', headers: { 'Content-Type': 'application/json' } })).status()).toBe(400);
  expect((await request.post('/api/login', { data: 'no-json', headers: { 'Content-Type': 'text/plain' } })).status()).toBe(415);
  const response = await request.post('/api/login', { data: { username: "' OR 1=1 --", password: 'incorrecta' } });
  expect(response.status()).toBe(401);
  expect(response.headers()['cache-control']).toContain('no-store');
});
