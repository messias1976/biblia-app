# Bíblia em 180 Dias — Web App

Este projeto contém um backend simples em Node/Express que importa um arquivo Excel e serve os dados como JSON, e um frontend estático que consome a API e exibe os registros.

Passos rápidos:

1. Coloque o arquivo Excel `Bíblia Toda em 180 Dias.xlsx` em `server/data/` ou use o caminho completo do arquivo.
2. Abra um terminal na pasta `C:\Users\messi\OneDrive\Desktop\biblia-app\server` e instale dependências:

```powershell
npm install
```

3. Importe o Excel para JSON (se o arquivo estiver em `server/data/` apenas rode):

```powershell
npm run import
# ou com caminho específico
node import_excel.js "C:\\Users\\messi\\OneDrive\\Desktop\\Bíblia Toda em 180 Dias.xlsx"
```

4. Inicie o servidor:

```powershell
npm start
```

5. Abra no navegador: `http://localhost:3000`

Observações:
- Se preferir, defina a variável de ambiente `FILE_PATH` com o caminho do arquivo Excel e chame `npm run import`.
- O backend serve o frontend estático, então não é necessário rodar um servidor separado para o client.
