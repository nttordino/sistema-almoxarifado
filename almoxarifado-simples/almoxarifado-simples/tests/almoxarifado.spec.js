const { test, expect } = require('@playwright/test');

test.beforeEach(async ({ page }) => {
  await page.goto('/');
  await page.evaluate(() => localStorage.clear());
  await page.reload();
});

test('1. abre a aplicação e mostra o título', async ({ page }) => {
  await expect(page).toHaveTitle(/Almoxarifado/);
  await expect(page.getByRole('heading', { name: 'Painel do almoxarifado' })).toBeVisible();
  await page.screenshot({ path: 'screenshots/01-pagina-inicial.png', fullPage: true });
});

test('2. navega pelo formulário e pela lista de produtos', async ({ page }) => {
  await page.getByRole('heading', { name: 'Cadastrar produto' }).click();
  await expect(page.getByRole('heading', { name: 'Produtos em estoque' })).toBeVisible();
});

test('3. localiza e interage com campos e botão', async ({ page }) => {
  await page.locator('#nome-produto').fill('Teclado USB');
  await page.locator('#categoria-produto').selectOption({ label: 'Equipamentos' });
  await page.locator('#quantidade-produto').fill('12');
  await page.locator('#estoque-minimo').fill('3');
  await page.locator('#localizacao-produto').fill('Prateleira A1');
  await expect(page.getByRole('button', { name: 'Cadastrar produto' })).toBeEnabled();
});

test('4. cadastra produto e registra entrada e saída', async ({ page }) => {
  await page.locator('#nome-produto').fill('Mouse');
  await page.locator('#categoria-produto').selectOption({ label: 'Equipamentos' });
  await page.locator('#quantidade-produto').fill('5');
  await page.locator('#estoque-minimo').fill('2');
  await page.getByRole('button', { name: 'Cadastrar produto' }).click();
  await expect(page.getByText('Mouse', { exact: true })).toBeVisible();

  const row = page.locator('tr[data-product-id]');
  await row.getByRole('button', { name: 'Adicionar unidade' }).click();
  await expect(row).toContainText('6');
  await row.getByRole('button', { name: 'Retirar unidade' }).click();
  await expect(row).toContainText('5');

  await page.screenshot({ path: 'screenshots/02-produto-cadastrado.png', fullPage: true });
});

test('5. valida campos obrigatórios e informa estoque baixo', async ({ page }) => {
  await page.getByRole('button', { name: 'Cadastrar produto' }).click();
  await expect(page.locator('#nome-produto')).toHaveAttribute('required', '');

  await page.locator('#nome-produto').fill('Capacete');
  await page.locator('#categoria-produto').selectOption({ label: 'EPIs' });
  await page.locator('#quantidade-produto').fill('2');
  await page.locator('#estoque-minimo').fill('5');
  await page.getByRole('button', { name: 'Cadastrar produto' }).click();

  await expect(page.locator('#mensagem-formulario')).toContainText('sucesso');
  await expect(page.locator('tr[data-product-id] .status')).toContainText('Estoque baixo');
  await expect(page.locator('#total-baixo')).toHaveText('1');
});

test('6. pesquisa produto e exclui com confirmação', async ({ page }) => {
  await page.locator('#nome-produto').fill('Óculos de proteção');
  await page.locator('#categoria-produto').selectOption({ label: 'EPIs' });
  await page.locator('#quantidade-produto').fill('10');
  await page.locator('#estoque-minimo').fill('2');
  await page.getByRole('button', { name: 'Cadastrar produto' }).click();

  await page.locator('#buscar-produto').fill('Óculos');
  await expect(page.locator('tr[data-product-id]')).toHaveCount(1);

  page.once('dialog', dialog => dialog.accept());
  await page.locator('tr[data-product-id]').getByRole('button', { name: 'Excluir produto' }).click();
  await expect(page.locator('tr[data-product-id]')).toHaveCount(0);
});
