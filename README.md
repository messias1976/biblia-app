# Bíblia em 180 Dias — Web App

Uma aplicação web para acompanhar um plano de leitura da Bíblia em 180 dias.

O projeto usa um backend em Node/Express para servir a API e os dados, e um frontend leve em JavaScript que consome esses dados, permite marcar leituras como concluídas e abre capítulos do PDF quando um dia é clicado.

## Recursos

- Lista dos 180 dias de leitura
- Campo de pesquisa para filtrar livros, capítulos e dias
- Checkbox para marcar cada dia como concluído
- Visualizador de PDF integrado
- Ao clicar em um dia, o app tenta abrir o capítulo correspondente no PDF

## Estrutura do projeto

- `client/` — frontend estático
- `server/` — backend Node/Express
- `server/data/data.json` — dados do plano de leitura armazenados em JSON
- `server/pdf/biblia.pdf` — arquivo PDF da Bíblia a ser colocado manualmente

## Pré-requisitos

- Node.js 18+ instalado
- Git instalado
- PDF da Bíblia em `server/pdf/biblia.pdf`

## Instalação

Instale as dependências a partir da raiz do projeto:

```powershell
npm install
```

Esse comando instala dependências no diretório raiz. Para instalar também as dependências do servidor, use:

```powershell
npm run install-all
```

## Importar o plano de leitura do Excel

Se você tiver a planilha Excel com o plano de leitura, execute:

```powershell
cd server
npm install
npm run import
```

Ou use o caminho completo do arquivo:

```powershell
cd server
node import_excel.js "C:\caminho\para\Biblia Toda em 180 Dias.xlsx"
```

## Executar a aplicação

Na raiz do projeto:

```powershell
npm start
```

Abra no navegador:

```text
http://localhost:3000
```

## PDF da Bíblia

Coloque o arquivo PDF em:

```text
server/pdf/biblia.pdf
```

### Observações

- O app tenta localizar o capítulo correto no PDF com base no texto presente no arquivo.
- Se o PDF for apenas imagem, essa localização automática pode falhar.
- O backend já serve o frontend estático; não é preciso rodar dois servidores.

## Deploy

### Opção gratuita: GitHub Pages (site estático)

Uma versão estática do app foi adicionada em `docs/`. Ela funciona sem backend e salva o estado de leitura no navegador usando `localStorage`.

Para usar:

1. Coloque o arquivo `biblia.pdf` em `docs/biblia.pdf`.
2. No GitHub, abra o repositório `messias1976/biblia-app`.
3. Vá em Settings → Pages.
4. Em "Source", selecione a branch `main` e a pasta `/docs`.
5. Salve. Após alguns minutos, o site estará disponível gratuitamente.

> Observação: a versão estática mantém o progresso das leituras apenas no navegador do usuário. Se o navegador for limpo, os dados serão perdidos.

### Outras opções gratuitas

Se você quiser ainda usar servidor, há provedores com planos gratuitos, mas eles podem exigir uma conta e não garantir persistência de arquivo:

- [Render](https://render.com)
- [Railway](https://railway.app)
- [Fly.io](https://fly.io)

Basta apontar o serviço para a raiz do repositório e usar o comando:

```powershell
npm start
```

## GitHub

Repositório remoto:

`https://github.com/messias1976/biblia-app`

## Estrutura de pastas

```text
biblia-app/
  client/
  server/
    data/
    pdf/
    index.js
  package.json
  README.md
```
