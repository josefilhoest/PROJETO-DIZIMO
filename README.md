# Sistema de Dízimo

Sistema web para gestão de dízimos de comunidades e paróquias, com suporte a múltiplas paróquias, múltiplas comunidades, perfis administrativos, histórico mensal, importação de dizimistas por PDF, exportação CSV, backups e impressão.

## Status atual

A estrutura multi-paróquia está concluída e publicada em produção.

- Frontend: React + Vite
- Backend: Node.js + Express
- ORM: Sequelize
- Banco de dados: MySQL
- Autenticação: JWT
- Backend em produção: Render
- Frontend em produção: Hostinger
- Banco de produção: MySQL Hostinger
- Monitoramento externo: UptimeRobot

### Produção

- Frontend: `https://dizimo.jrsite.com`
- API: `https://projeto-dizimo.onrender.com/api`

> Nunca publique arquivos `.env`, senhas, chaves JWT ou credenciais do banco no GitHub.

---

## Principais recursos

### Gestão de dizimistas

- Cadastro de dizimistas
- Edição
- Exclusão
- Numeração por comunidade
- Cálculo automático da folha
- Totais por folha
- Total geral
- Divisão automática: 50% Paróquia / 50% Comunidade
- Impressão em formato A4

### Importação por PDF

O sistema permite importar listas de dizimistas a partir de PDF.

A leitura é feita no frontend e apresenta uma prévia antes da gravação.

Validações incluídas:

- número inválido
- nome vazio
- valor inválido
- duplicidade dentro do PDF
- número já existente na comunidade
- prévia editável antes da confirmação

A importação é gravada pelo backend somente após validação.

### Exportação CSV

Cada comunidade pode exportar sua lista de dizimistas em CSV.

Características:

- UTF-8
- compatível com Excel e WPS
- proteção contra fórmulas maliciosas
- isolamento por comunidade

### Histórico mensal

O sistema possui fechamento e histórico mensal.

Cada fechamento pode manter uma fotografia dos dados daquele período, permitindo consultar registros anteriores mesmo se os dados atuais forem alterados posteriormente.

Tabelas relacionadas:

- `registros_mensais`
- `registro_mensal_itens`

### Backup da comunidade

O sistema permite gerar backup dos dados da comunidade para fins administrativos e de segurança.

---

# Estrutura multi-paróquia

A versão atual trabalha com três níveis principais:

```text
SUPER_ADMIN
    |
    +-- Paróquias
          |
          +-- ADMIN_PAROQUIA
          |
          +-- Comunidades
                 |
                 +-- ADMIN_COMUNIDADE
```

## SUPER_ADMIN

Responsável pela administração geral do sistema.

Pode:

- cadastrar paróquias
- visualizar paróquias
- editar paróquias
- excluir paróquias
- visualizar comunidades
- editar comunidades
- ativar/desativar comunidades
- excluir comunidades
- cadastrar usuários
- editar usuários
- bloquear/desbloquear usuários
- controlar licenças
- redefinir senhas
- vincular usuário a uma comunidade existente
- acompanhar indicadores gerais

O `SUPER_ADMIN` não precisa possuir `comunidadeId` nem `paroquiaId`.

Exemplo de estrutura correta:

```text
perfil = SUPER_ADMIN
comunidadeId = NULL
paroquiaId = NULL
```

## ADMIN_PAROQUIA

Responsável por uma paróquia.

Possui `paroquiaId` e pode também possuir `comunidadeId` quando administra sua comunidade-sede.

O perfil possui duas áreas:

### Painel da Paróquia

Permite visualizar as comunidades pertencentes à paróquia.

Recursos disponíveis incluem:

- listar comunidades
- visualizar detalhes
- exportar CSV
- gerar backup
- consultar histórico mensal
- visualizar dizimistas
- imprimir tabela

### Minha Comunidade

Quando o administrador paroquial também possui uma comunidade-sede, ele pode utilizar o sistema normalmente como administrador daquela comunidade.

## ADMIN_COMUNIDADE

Responsável por uma comunidade específica.

Estrutura:

```text
perfil = ADMIN_COMUNIDADE
comunidadeId = ID_DA_COMUNIDADE
paroquiaId = ID_DA_PAROQUIA
```

Pode:

- visualizar sua comunidade
- cadastrar dizimistas
- editar dizimistas
- excluir dizimistas
- importar por PDF
- exportar CSV
- gerar backup
- consultar histórico
- imprimir fichas
- realizar fechamento mensal

---

# Fluxo de cadastro de clientes

O sistema suporta dois fluxos.

## Nova comunidade

O `SUPER_ADMIN` cria o usuário e seleciona:

```text
Criará uma nova comunidade no primeiro acesso
```

No primeiro login, o usuário é direcionado para a tela de cadastro da comunidade.

Após concluir o cadastro, o usuário é vinculado automaticamente à nova comunidade.

## Comunidade já existente

O `SUPER_ADMIN` pode criar um usuário e selecionar:

```text
Vincular a uma comunidade existente
```

Depois escolhe:

1. Paróquia
2. Comunidade existente

O usuário já é criado com os vínculos corretos e entra diretamente na comunidade.

Esse fluxo é utilizado, por exemplo, quando uma comunidade já possui dados históricos e dizimistas cadastrados.

---

# Segurança

O projeto possui várias camadas de proteção.

## Autenticação JWT

Todas as rotas privadas utilizam token JWT.

O middleware de autenticação consulta o usuário atual no banco e valida:

- existência do usuário
- status ativo
- perfil atual
- comunidade atual
- paróquia atual
- situação da licença

## Controle por perfil

Rotas administrativas são protegidas por middleware.

Exemplos:

```text
somenteSuperAdmin
somenteAdminParoquia
```

## Rate limit no login

O endpoint de login possui limitação de tentativas para reduzir ataques de força bruta.

## Helmet

O backend utiliza `helmet` para adicionar cabeçalhos HTTP de segurança.

## CORS

O backend utiliza CORS restrito às origens autorizadas.

## Logout automático por inatividade

O frontend encerra automaticamente a sessão após período prolongado sem atividade.

Configuração atual:

```text
Aviso: aproximadamente 28 minutos
Logout automático: aproximadamente 30 minutos
```

Atividades que renovam a sessão incluem clique, teclado, movimento do mouse, rolagem e toque.

O usuário pode escolher **Continuar conectado** quando o aviso aparecer.

---

# Banco de dados

Principais tabelas:

```text
paroquias
comunidades
usuarios
dizimistas
registros_mensais
registro_mensal_itens
```

## Relações principais

```text
Paroquia
  hasMany Comunidade

Comunidade
  belongsTo Paroquia

Paroquia
  hasMany Usuario

Usuario
  belongsTo Paroquia

Comunidade
  hasMany Usuario

Usuario
  belongsTo Comunidade
```

Campos principais da estrutura multi-paróquia:

### comunidades

```text
paroquiaId
```

### usuarios

```text
paroquiaId
comunidadeId
```

As chaves estrangeiras utilizam integridade referencial no MySQL.

---

# Estrutura do projeto

```text
PROJETO-DIZIMO/
│
├── api/
│   ├── controllers/
│   ├── database/
│   ├── middlewares/
│   ├── models/
│   ├── routes/
│   ├── package.json
│   └── server.js
│
├── app/
│   ├── public/
│   ├── src/
│   │   ├── api/
│   │   ├── assets/
│   │   ├── components/
│   │   ├── App.jsx
│   │   ├── App.css
│   │   └── main.jsx
│   ├── package.json
│   └── vite.config.js
│
├── .gitignore
└── README.md
```

---

# Backend

## Instalação

Entre na pasta:

```bash
cd api
```

Instale as dependências:

```bash
npm install
```

Crie o arquivo `api/.env`.

Exemplo:

```env
DB_HOST=seu_host
DB_PORT=3306
DB_NAME=seu_banco
DB_USER=seu_usuario
DB_PASSWORD=sua_senha
JWT_SECRET=uma_chave_forte
```

Nunca envie esse arquivo para o Git.

## Executar

```bash
npm run dev
```

ou, conforme o script configurado:

```bash
npm start
```

---

# Frontend

Entre na pasta:

```bash
cd app
```

Instale:

```bash
npm install
```

Execute localmente:

```bash
npm run dev
```

Endereço padrão do Vite:

```text
http://localhost:5173
```

## API utilizada pelo frontend

Arquivo:

```text
app/src/api/api.js
```

Produção:

```js
baseURL: "https://projeto-dizimo.onrender.com/api"
```

Para desenvolvimento local, pode ser alterado temporariamente para:

```js
baseURL: "http://localhost:8080/api"
```

> Antes de gerar o build de produção, confirme sempre que o frontend está apontando para a API do Render.

---

# Build do frontend

Dentro de `app`:

```bash
npm run build
```

O Vite gera:

```text
app/dist
```

Para publicação na Hostinger, envie o **conteúdo** de `dist` para:

```text
public_html/dizimo
```

Sempre atualize `index.html` e a pasta `assets` juntos.

---

# Deploy

## Backend — Render

O Render utiliza o código enviado para a branch principal do GitHub.

Antes do deploy, confirme as variáveis:

```text
DB_HOST
DB_PORT
DB_NAME
DB_USER
DB_PASSWORD
JWT_SECRET
```

Banco de produção atual:

```text
u741448239_projeto_dizimo
```

Logs esperados após inicialização:

```text
Banco de dados conectado com sucesso!
Tabelas sincronizadas com sucesso!
Servidor rodando na porta ...
```

## Frontend — Hostinger

Fluxo:

```text
npm run build
        ↓
app/dist
        ↓
public_html/dizimo
```

---

# PWA

O frontend possui suporte a Progressive Web App.

Inclui:

- manifest
- service worker
- ícones
- instalação no desktop
- atualização de cache

O sistema pode ser instalado como aplicativo pelo navegador compatível.

---

# Monitoramento

O projeto utiliza monitoramento externo para verificar disponibilidade do frontend e backend.

Monitoramento atual: UptimeRobot.

---

# Backup e manutenção

Antes de alterações importantes em produção:

1. exporte o banco MySQL em SQL;
2. confirme que o backup foi baixado;
3. mantenha uma cópia fora do servidor;
4. faça a alteração;
5. teste o backend;
6. teste o frontend;
7. confira usuários e dados principais.

O backup do banco pode ser feito pelo phpMyAdmin da Hostinger.

---

# Migração multi-paróquia

A produção foi migrada da estrutura antiga para a nova estrutura multi-paróquia preservando os dados existentes.

A comunidade **Palmeira** foi mantida no mesmo registro e vinculada à sua paróquia, sem recriação dos dizimistas.

Estrutura atual:

```text
Paróquia Nossa Senhora da Penha
└── Palmeira
```

A administração foi separada em:

```text
SUPER_ADMIN
→ Administração Geral

ADMIN_COMUNIDADE
→ Palmeira
```

Os dados existentes da comunidade foram preservados durante a migração.

---

# Tecnologias

### Frontend

- React
- Vite
- Axios
- JavaScript
- CSS
- PWA

### Backend

- Node.js
- Express
- Sequelize
- JWT
- bcrypt
- Helmet
- express-rate-limit
- CORS

### Banco

- MySQL

### Infraestrutura

- Render
- Hostinger
- GitHub
- UptimeRobot

---

# Versionamento

O projeto utiliza Git e GitHub.

Fluxo recomendado:

```bash
git status
git add .
git commit -m "descricao da alteracao"
git push
```

Antes de qualquer commit:

```bash
git status
```

Ao final:

```text
nothing to commit, working tree clean
```

---

# Boas práticas

- nunca versionar `.env`
- nunca publicar credenciais
- sempre testar em banco separado antes da produção
- sempre fazer backup antes de migrações
- evitar alterações manuais no banco sem backup
- validar o ambiente antes do deploy
- confirmar a URL da API antes do build do frontend
- testar cada perfil depois de mudanças de autenticação
- manter o Git limpo depois de cada etapa

---

# Situação atual da versão

A versão atual possui:

- arquitetura multi-paróquia
- múltiplas comunidades
- `SUPER_ADMIN`
- `ADMIN_PAROQUIA`
- `ADMIN_COMUNIDADE`
- vínculo com comunidade existente
- criação de comunidade no primeiro acesso
- controle de licenças
- cadastro e edição de paróquias
- gerenciamento de comunidades
- importação de PDF
- exportação CSV
- backup
- histórico mensal
- impressão
- PWA
- logout por inatividade
- deploy de frontend e backend
- banco de produção migrado para a estrutura multi-paróquia

---

## Autor

**José Filho**
