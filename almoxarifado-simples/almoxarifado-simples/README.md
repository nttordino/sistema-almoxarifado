# Almoxarifado Simples

Sistema de estudo para cadastro e controle básico de produtos, desenvolvido com HTML, CSS, JavaScript e Node.js. Inclui testes automatizados com Playwright.

## Funcionalidades
- Cadastro de produtos, categoria, quantidade, estoque mínimo e localização.
- Resumo de produtos cadastrados, unidades e itens com estoque baixo.
- Registro de entrada e saída de uma unidade.
- Pesquisa de produtos.
- Exclusão com confirmação.
- Exportação de relatório CSV.
- Persistência dos dados no `localStorage` do navegador.
- Testes automatizados com Playwright e screenshots.

## Requisitos
- Node.js instalado.
- VS Code (recomendado).

## Como executar
1. Abra a pasta do projeto no VS Code.
2. No terminal, execute:

   ```bash
   npm install
   npx playwright install chromium
   npm start
   ```

3. Acesse `http://localhost:3000`.

## Como executar os testes
Em outro terminal, dentro da pasta do projeto:

```bash
npm test
```

Para abrir o relatório HTML:

```bash
npm run report
```

Os testes salvam capturas de tela na pasta `screenshots/` quando o teste correspondente cria o arquivo. Se a pasta não existir, crie-a antes de executar os testes:

```bash
mkdir screenshots
```

## Observação importante
Esta é uma versão didática: os dados ficam armazenados no navegador por meio de `localStorage`. Isso significa que não há sincronização entre computadores ou usuários. Para uso real em uma empresa, é necessário implementar backend com banco de dados, login, permissões, histórico de movimentações e cópias de segurança.

## Estrutura
```text
almoxarifado-simples/
├── public/
│   ├── css/style.css
│   ├── js/app.js
│   └── index.html
├── tests/
│   └── almoxarifado.spec.js
├── package.json
├── playwright.config.js
├── server.js
└── README.md
```
