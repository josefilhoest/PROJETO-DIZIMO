# 💰 Sistema de Dízimo

![React](https://img.shields.io/badge/React-Frontend-61DAFB?logo=react&logoColor=black)
![Vite](https://img.shields.io/badge/Vite-Build-646CFF?logo=vite&logoColor=white)
![Node.js](https://img.shields.io/badge/Node.js-Backend-339933?logo=node.js&logoColor=white)
![Express](https://img.shields.io/badge/Express-API-000000?logo=express&logoColor=white)
![MySQL](https://img.shields.io/badge/MySQL-Database-4479A1?logo=mysql&logoColor=white)
![Sequelize](https://img.shields.io/badge/Sequelize-ORM-52B0E7?logo=sequelize&logoColor=white)
![Render](https://img.shields.io/badge/Render-Backend-46E3B7?logo=render&logoColor=black)
![Hostinger](https://img.shields.io/badge/Hostinger-Frontend-673DE6)
![PWA](https://img.shields.io/badge/PWA-Instal%C3%A1vel-5A0FC8?logo=pwa&logoColor=white)
![Version](https://img.shields.io/badge/Vers%C3%A3o-1.1.0-blue)
![Status](https://img.shields.io/badge/Status-Online-success)

Sistema web desenvolvido para auxiliar no controle mensal de dízimos da **Paróquia Nossa Senhora da Penha - Sucatinga**.

O projeto permite organizar dizimistas por comunidade, registrar valores mensais, calcular totais automaticamente, gerar ficha para impressão A4, importar e exportar dados, realizar fechamento mensal com histórico e administrar usuários, comunidades e licenças por meio de um painel protegido.

---

## 🌐 Projeto online

### Aplicação

[🔗 Acessar Sistema de Dízimo](https://dizimo.jrfsite.com)

### API

[🔗 Acessar API](https://projeto-dizimo.onrender.com)

> As rotas internas da API são protegidas por autenticação JWT. O acesso direto a endpoints administrativos ou de dados exige um usuário autenticado e autorizado.

---

## ✨ Funcionalidades

### 👥 Dizimistas

- Cadastro de dizimistas.
- Edição de nome, número e valor.
- Exclusão de registros.
- Organização automática por folhas.
- Numeração por comunidade.
- Índice único por `comunidadeId + numero`.
- Cálculo de total por folha.
- Cálculo do total geral.
- Cálculo da divisão:
  - 50% Paróquia.
  - 50% Comunidade.

### 📄 Importação por PDF

- Leitura do PDF localmente no navegador.
- Nenhum dado é enviado ao servidor durante a leitura inicial.
- Reconstrução automática das linhas do documento.
- Prévia antes da importação.
- Edição dos dados reconhecidos.
- Remoção de linhas antes da confirmação.
- Detecção de:
  - números duplicados no PDF;
  - números já cadastrados;
  - dados inválidos.
- Importação em lote somente após confirmação.
- Isolamento por comunidade no backend.

### 📤 Exportação CSV

- Exportação dos dizimistas da comunidade autenticada.
- Arquivo UTF-8.
- Colunas:
  - Número;
  - Folha;
  - Nome;
  - Valor.
- Proteção contra fórmulas maliciosas em planilhas.
- Download automático pelo navegador.

### 💾 Backup da comunidade

- Geração de backup dos dados da comunidade.
- Recurso acessível diretamente no sistema.
- Isolamento dos dados conforme a comunidade autenticada.

### 🔒 Fechamento mensal / Nova contagem

- Fechamento do mês por comunidade.
- Histórico preservado antes de zerar os valores.
- Snapshot de todos os dizimistas e respectivos valores.
- Total mensal salvo.
- Bloqueio de fechamento duplicado para o mesmo mês/ano.
- Operação executada em transação no banco.
- Em caso de erro, nenhuma alteração parcial é mantida.
- Após o fechamento:
  - nomes permanecem;
  - números permanecem;
  - folhas permanecem;
  - valores atuais são zerados para iniciar uma nova contagem.

### 📊 Histórico mensal

- Listagem dos fechamentos mensais.
- Visualização por mês e ano.
- Total do mês.
- Total de 50% da Paróquia.
- Total de 50% da Comunidade.
- Detalhamento dos dizimistas registrados no fechamento.
- Layout responsivo para desktop e dispositivos móveis.

### 🖨️ Impressão

- Ficha preparada para impressão em A4.
- Layout específico com `@media print`.
- Cabeçalho da paróquia.
- Nome da comunidade.
- Data.
- Equipe da comunidade.
- Conferência.
- Responsável pela paróquia.
- Ocultação de botões e controles durante a impressão.

---

## 🏘️ Multi-comunidade

O sistema possui isolamento entre comunidades.

Cada usuário de comunidade acessa somente os dados vinculados ao seu próprio `comunidadeId`.

O backend utiliza a comunidade do usuário autenticado, obtida pelo middleware de autenticação, evitando confiar em um `comunidadeId` enviado livremente pelo frontend.

Principais dados isolados:

- Dizimistas.
- Registros mensais.
- Histórico mensal.
- Importações.
- Exportações.
- Backup da comunidade.

---

## 🔐 Autenticação e segurança

O sistema utiliza autenticação JWT e regras de autorização por perfil.

### Perfis

#### `SUPER_ADMIN`

Responsável pela administração geral do sistema.

Pode:

- visualizar o dashboard administrativo;
- listar comunidades;
- visualizar indicadores das comunidades;
- editar dados cadastrais de comunidades;
- cadastrar usuários;
- editar usuários permitidos;
- redefinir senhas de usuários permitidos;
- ativar/desativar usuários;
- controlar licenças;
- ativar/desativar comunidades permitidas;
- excluir comunidades permitidas.

Proteções adicionais impedem alterações destrutivas sobre o próprio `SUPER_ADMIN` e sua comunidade protegida.

#### `ADMIN_COMUNIDADE`

Administrador responsável por uma comunidade.

Pode:

- acessar os dizimistas da própria comunidade;
- cadastrar e editar dizimistas;
- importar PDF;
- exportar CSV;
- gerar backup;
- registrar informações mensais;
- realizar fechamento mensal;
- consultar o histórico da própria comunidade.

### Outras proteções

- JWT validado no backend.
- Usuário autenticado é consultado novamente no banco.
- Usuário desativado é bloqueado.
- Licença bloqueada impede acesso do administrador da comunidade.
- Rotas administrativas usam `autenticar + somenteSuperAdmin`.
- `Helmet` para cabeçalhos de segurança.
- `express-rate-limit` no login.
- CORS restrito aos endereços autorizados.
- Senhas armazenadas com hash usando `bcrypt`.
- Variáveis sensíveis armazenadas fora do código por meio de `.env`.
- Proteção contra acesso cruzado entre comunidades.

---

## 🧑‍💼 Painel Administrativo

O painel do `SUPER_ADMIN` possui três áreas principais:

### Visão Geral

Exibe indicadores como:

- total de comunidades;
- comunidades ativas;
- total de usuários;
- usuários ativos;
- total de dizimistas.

### Comunidades

Permite:

- pesquisar por nome, paróquia ou cidade;
- visualizar detalhes;
- editar nome, paróquia e cidade;
- consultar quantidade de usuários;
- consultar quantidade de dizimistas;
- acompanhar valor atual registrado;
- consultar registros mensais;
- visualizar última movimentação;
- ativar/desativar comunidades permitidas;
- excluir comunidades permitidas.

O painel administrativo trabalha com indicadores agregados e não exibe os dados individuais dos dizimistas.

### Usuários / Licenças

Permite:

- cadastrar novos usuários;
- editar nome e e-mail;
- redefinir senha;
- ativar/desativar usuário;
- ativar/bloquear licença;
- excluir usuários ainda sem comunidade;
- pesquisar por nome, e-mail ou comunidade.

---

## 🆕 Primeiro acesso de um novo cliente

Fluxo atual:

1. O `SUPER_ADMIN` cadastra o novo usuário.
2. O usuário nasce como `ADMIN_COMUNIDADE`, sem comunidade vinculada.
3. O usuário recebe uma licença.
4. No primeiro login, o sistema identifica que ele ainda não possui comunidade.
5. O usuário é direcionado para o cadastro da própria comunidade.
6. A comunidade é criada.
7. O usuário é automaticamente vinculado a ela.
8. Nos próximos logins, o usuário entra diretamente no sistema da comunidade.

---

## 📱 PWA

O frontend funciona como **Progressive Web App**.

Recursos:

- `manifest.webmanifest`;
- Service Worker;
- ícones 192x192 e 512x512;
- favicon personalizado;
- instalação pelo navegador;
- abertura em modo de aplicativo;
- atualização de cache para arquivos JS/CSS;
- estratégia de cache revisada para evitar versões antigas do frontend.

---

## 🗄️ Banco de dados

Banco relacional MySQL.

### Principais tabelas

#### `usuarios`

Armazena:

- nome;
- e-mail;
- senha;
- perfil;
- comunidade;
- status do usuário;
- status da licença.

#### `comunidades`

Armazena:

- nome;
- paróquia;
- cidade;
- status.

#### `dizimistas`

Armazena:

- número;
- folha;
- nome;
- valor;
- comunidade.

#### `registros_mensais`

Armazena informações do fechamento e registro mensal:

- comunidade;
- data;
- mês;
- ano;
- total;
- equipe da comunidade;
- conferência;
- responsável pela paróquia.

Existe restrição única para impedir duplicidade de fechamento no mesmo:

```text
comunidadeId + ano + mes
```

#### `registro_mensal_itens`

Armazena o snapshot de cada fechamento mensal:

- fechamento relacionado;
- comunidade;
- ID original do dizimista, quando disponível;
- número;
- folha;
- nome;
- valor.

O snapshot preserva o histórico mesmo que o cadastro atual do dizimista seja alterado posteriormente.

---

## 🧰 Tecnologias utilizadas

### Frontend

- React
- Vite
- Axios
- pdfjs-dist
- JavaScript
- CSS
- PWA / Service Worker

### Backend

- Node.js
- Express
- Sequelize
- MySQL
- JSON Web Token
- bcrypt
- Helmet
- express-rate-limit
- CORS

### Infraestrutura

- **Frontend:** Hostinger
- **Backend/API:** Render
- **Banco de dados:** MySQL
- **Versionamento:** Git + GitHub

---

## 📁 Estrutura geral do projeto

```text
PROJETO-DIZIMO/
│
├── api/
│   ├── controllers/
│   ├── database/
│   ├── middlewares/
│   ├── models/
│   ├── routes/
│   ├── server.js
│   └── package.json
│
├── app/
│   ├── public/
│   ├── src/
│   │   ├── api/
│   │   ├── assets/
│   │   ├── components/
│   │   ├── App.jsx
│   │   └── main.jsx
│   ├── package.json
│   └── vite.config.js
│
├── .gitignore
└── README.md
```

---

## ▶️ Executar localmente

### 1. Clonar o repositório

```bash
git clone SEU_REPOSITORIO
cd PROJETO-DIZIMO
```

### 2. Instalar dependências do backend

```bash
cd api
npm install
```

### 3. Configurar variáveis de ambiente

Crie o arquivo `.env` na pasta da API com as variáveis necessárias.

Exemplo:

```env
DB_HOST=seu_host
DB_PORT=3306
DB_NAME=seu_banco
DB_USER=seu_usuario
DB_PASSWORD=sua_senha
JWT_SECRET=uma_chave_segura
```

> Nunca envie o arquivo `.env` para o GitHub.

### 4. Iniciar a API

```bash
npm start
```

A API local utiliza normalmente:

```text
http://localhost:8080
```

### 5. Instalar dependências do frontend

Em outro terminal:

```bash
cd app
npm install
```

### 6. Para desenvolvimento local

Durante testes locais, configure temporariamente o `baseURL` da API para:

```text
http://localhost:8080/api
```

Depois execute:

```bash
npm run dev
```

O Vite utiliza normalmente:

```text
http://localhost:5173
```

### 7. Antes do build de produção

Restaure o `baseURL` para:

```text
https://projeto-dizimo.onrender.com/api
```

Depois execute:

```bash
npm run build
```

O Vite criará a pasta:

```text
app/dist
```

---

## 🚀 Deploy

### Backend

O backend é publicado no **Render**.

O deploy é realizado a partir do repositório Git, com variáveis de ambiente configuradas no serviço.

### Frontend

O frontend é compilado com:

```bash
npm run build
```

O conteúdo da pasta `dist` é publicado na **Hostinger**.

Domínio atual:

```text
https://dizimo.jrfsite.com
```

---

## 💾 Backup

Antes de alterações estruturais, exclusões importantes ou manutenção do banco de dados, é recomendado gerar um backup completo.

O backup SQL deve incluir:

- estrutura;
- dados;
- tabelas;
- índices;
- chaves;
- `AUTO_INCREMENT`.

Também existe um recurso de **Backup da comunidade** diretamente no frontend para uso administrativo.

---

## ✅ Status atual

Versão **1.1.0** validada em produção.

Testes finais realizados:

- login;
- autenticação;
- painel `SUPER_ADMIN`;
- isolamento de comunidades;
- listagem de dizimistas;
- cadastro e edição;
- impressão;
- importação por PDF;
- exportação CSV;
- backup da comunidade;
- histórico mensal;
- fechamento mensal;
- edição de comunidade;
- PWA;
- deploy do backend;
- deploy do frontend.

---

## 📝 Histórico de versões

### v1.1.0

- Importação de dizimistas por PDF.
- Prévia e validação antes da importação.
- Exportação CSV.
- Backup da comunidade.
- Fechamento mensal com transação.
- Snapshot dos valores no fechamento.
- Histórico mensal detalhado.
- Divisão 50% Paróquia / 50% Comunidade no histórico.
- Layout responsivo do histórico.
- Edição de comunidades no painel administrativo.
- Melhorias no Service Worker e atualização de cache/PWA.
- Revisões adicionais de segurança.
- Limpeza dos dados de teste em produção.
- Validação final do sistema em produção.

### v1.0.0

- Primeira versão estável.
- CRUD de dizimistas.
- Organização por folhas.
- Totais e divisão 50/50.
- Impressão A4.
- Autenticação JWT.
- Multi-comunidade.
- Painel `SUPER_ADMIN`.
- Controle de usuários e licenças.
- Fluxo de primeiro acesso.
- PWA.
- Deploy inicial em produção.

---

## 👨‍💻 Desenvolvimento

Projeto desenvolvido como aplicação full stack com foco em:

- aprendizado prático;
- organização de código;
- segurança;
- isolamento de dados;
- manutenção;
- evolução contínua do sistema.

---

## 📌 Observações

Este sistema contém dados administrativos e financeiros de comunidades.

Ao evoluir o projeto:

- faça backup antes de alterações importantes;
- teste localmente antes de publicar;
- evite alterações diretas no banco sem necessidade;
- mantenha as rotas administrativas protegidas;
- nunca exponha senhas, tokens ou variáveis de ambiente;
- mantenha o repositório e a versão de produção sincronizados.

---

## 📄 Licença

Uso interno e administrativo.

