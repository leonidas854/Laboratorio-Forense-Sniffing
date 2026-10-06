import { test, expect } from '@playwright/test';

test.describe('Simulación de Tráfico Benigno (Forense)', () => {
  // Simular un comportamiento de logueo repetitivo
  for (let i = 1; i <= 5; i++) {
    test(`Intento de login HTTP ${i}`, async ({ page }) => {
      // 1. Navegar al login
      await page.goto('/');

      // 2. Verificar que estamos en la página
      await expect(page.locator('h1')).toContainText('Portal Corporativo');

      // 3. Llenar credenciales (en texto plano)
      // Estas credenciales viajarán por HTTP, listas para ser capturadas por el analista forense
      await page.fill('#username', 'admin');
      await page.fill('#password', 'admin123');

      // 4. Enviar formulario
      await page.click('button[type="submit"]');

      // 5. Esperar confirmación
      await expect(page.locator('.message.success')).toBeVisible({ timeout: 5000 });
      
      // 6. Pequeña pausa para simular lectura
      await page.waitForTimeout(2000);
    });
  }
});
