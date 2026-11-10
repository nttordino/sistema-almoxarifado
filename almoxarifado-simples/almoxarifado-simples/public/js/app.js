const STORAGE_KEY = 'almoxarifado-produtos-v1';

const form = document.getElementById('form-produto');
const productList = document.getElementById('lista-produtos');
const searchInput = document.getElementById('buscar-produto');
const message = document.getElementById('mensagem-formulario');
const toast = document.getElementById('toast');

let products = loadProducts();

function loadProducts() {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY)) || [];
  } catch {
    return [];
  }
}

function saveProducts() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(products));
}

function showToast(text) {
  toast.textContent = text;
  toast.classList.add('show');
  window.setTimeout(() => toast.classList.remove('show'), 2200);
}

function escapeHTML(value) {
  return String(value).replace(/[&<>"']/g, char => ({
    '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'
  })[char]);
}

function render() {
  const totalUnits = products.reduce((sum, product) => sum + product.quantity, 0);
  const lowStock = products.filter(product => product.quantity <= product.minimum).length;

  document.getElementById('total-produtos').textContent = products.length;
  document.getElementById('total-unidades').textContent = totalUnits;
  document.getElementById('total-baixo').textContent = lowStock;

  const term = searchInput.value.trim().toLocaleLowerCase('pt-BR');
  const filtered = products.filter(product =>
    `${product.name} ${product.category} ${product.location}`.toLocaleLowerCase('pt-BR').includes(term)
  );

  if (filtered.length === 0) {
    productList.innerHTML = `<tr><td colspan="7" class="empty-state">${
      products.length ? 'Nenhum produto encontrado para essa busca.' : 'Nenhum produto cadastrado. Adicione o primeiro item acima.'
    }</td></tr>`;
    return;
  }

  productList.innerHTML = filtered.map(product => {
    const low = product.quantity <= product.minimum;
    return `
      <tr data-product-id="${product.id}">
        <td>${escapeHTML(product.name)}</td>
        <td>${escapeHTML(product.category)}</td>
        <td>${product.quantity}</td>
        <td>${product.minimum}</td>
        <td>${escapeHTML(product.location || 'Não informada')}</td>
        <td><span class="status ${low ? 'low' : ''}">${low ? 'Estoque baixo' : 'Adequado'}</span></td>
        <td>
          <div class="action-group">
            <button class="action-button" type="button" data-action="entry" data-id="${product.id}" aria-label="Adicionar unidade">+ Entrada</button>
            <button class="action-button" type="button" data-action="exit" data-id="${product.id}" aria-label="Retirar unidade">− Saída</button>
            <button class="action-button delete" type="button" data-action="delete" data-id="${product.id}" aria-label="Excluir produto">Excluir</button>
          </div>
        </td>
      </tr>`;
  }).join('');
}

form.addEventListener('submit', event => {
  event.preventDefault();
  const name = document.getElementById('nome-produto').value.trim();
  const category = document.getElementById('categoria-produto').value;
  const quantity = Number(document.getElementById('quantidade-produto').value);
  const minimum = Number(document.getElementById('estoque-minimo').value);
  const location = document.getElementById('localizacao-produto').value.trim();

  if (!name || !category || !Number.isInteger(quantity) || quantity < 0 ||
      !Number.isInteger(minimum) || minimum < 0) {
    message.textContent = 'Preencha os campos corretamente. Quantidades devem ser números inteiros não negativos.';
    message.classList.add('error');
    return;
  }

  const duplicate = products.some(product => product.name.toLocaleLowerCase('pt-BR') === name.toLocaleLowerCase('pt-BR'));
  if (duplicate) {
    message.textContent = 'Já existe um produto com esse nome.';
    message.classList.add('error');
    return;
  }

  products.push({
    id: (window.crypto && crypto.randomUUID) ? crypto.randomUUID() : String(Date.now()),
    name, category, quantity, minimum, location
  });
  saveProducts();
  render();
  form.reset();
  document.getElementById('estoque-minimo').value = 5;
  message.textContent = 'Produto cadastrado com sucesso!';
  message.classList.remove('error');
  showToast('Produto cadastrado com sucesso!');
});

productList.addEventListener('click', event => {
  const button = event.target.closest('button[data-action]');
  if (!button) return;
  const product = products.find(item => item.id === button.dataset.id);
  if (!product) return;

  if (button.dataset.action === 'entry') {
    product.quantity += 1;
    showToast('Entrada de 1 unidade registrada.');
  } else if (button.dataset.action === 'exit') {
    if (product.quantity === 0) {
      showToast('Não há unidades disponíveis para saída.');
      return;
    }
    product.quantity -= 1;
    showToast('Saída de 1 unidade registrada.');
  } else if (button.dataset.action === 'delete') {
    if (!window.confirm(`Deseja excluir "${product.name}"?`)) return;
    products = products.filter(item => item.id !== product.id);
    showToast('Produto excluído.');
  }

  saveProducts();
  render();
});

searchInput.addEventListener('input', render);

document.getElementById('exportar-csv').addEventListener('click', () => {
  const header = ['Produto', 'Categoria', 'Quantidade', 'Estoque mínimo', 'Localização'];
  const rows = products.map(p => [p.name, p.category, p.quantity, p.minimum, p.location]);
  const csv = [header, ...rows].map(row =>
    row.map(value => `"${String(value ?? '').replace(/"/g, '""')}"`).join(';')
  ).join('\n');
  const blob = new Blob(['\uFEFF' + csv], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = 'relatorio-almoxarifado.csv';
  link.click();
  URL.revokeObjectURL(url);
  showToast('Relatório CSV gerado.');
});

render();
