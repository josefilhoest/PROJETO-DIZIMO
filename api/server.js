import "dotenv/config";

import express from "express";
import cors from "cors";
import helmet from "helmet";


import sequelize from "./database/database.js";

import Dizimista from "./models/Dizimista.js";
import Usuario from "./models/Usuario.js";
import RegistroMensal from "./models/RegistroMensal.js";

import dizimistaRoutes from "./routes/dizimistaRoutes.js";
import registroMensalRoutes from "./routes/registroMensalRoutes.js";
import authRoutes from "./routes/authRoutes.js";
import adminRoutes from "./routes/adminRoutes.js";

// ========================================
// VALIDAR JWT_SECRET
// ========================================

if (!process.env.JWT_SECRET) {
  console.error(
    "ERRO: JWT_SECRET não foi configurado."
  );

  process.exit(1);
}

// ========================================
// CRIAR APLICAÇÃO EXPRESS
// ========================================

const app = express();

// ========================================
// CONFIGURAÇÃO PARA PROXY / RENDER
// ========================================

// O Render utiliza proxy reverso.
// Esta configuração também ajuda o
// express-rate-limit a identificar
// corretamente o IP do cliente.
app.set("trust proxy", 1);



// ========================================
// MIDDLEWARES DE SEGURANÇA
// ========================================

// Adiciona headers HTTP de segurança.
app.use(helmet());

// ========================================
// CORS
// ========================================

// Somente estes frontends podem
// acessar a API através do navegador.
const origensPermitidas = [
  "http://localhost:5173",
  "https://dizimo.jrfsite.com",
];

app.use(
  cors({
    origin: origensPermitidas,

    methods: [
      "GET",
      "POST",
      "PUT",
      "PATCH",
      "DELETE",
      "OPTIONS",
    ],

    allowedHeaders: [
      "Content-Type",
      "Authorization",
    ],
  })
);

// ========================================
// JSON
// ========================================

app.use(
  express.json({
    limit: "1mb",
  })
);

// ========================================
// ROTAS
// ========================================

// Dizimistas
app.use(
  "/api/dizimistas",
  dizimistaRoutes
);

// Registros mensais
app.use(
  "/api/registros",
  registroMensalRoutes
);

// Autenticação
app.use(
  "/api/auth",
  authRoutes
);

// Administração SUPER_ADMIN
app.use(
  "/api/admin",
  adminRoutes
);

// ========================================
// ROTA DE TESTE DA API
// ========================================

app.get("/", (req, res) => {
  res.status(200).json({
    mensagem:
      "API do sistema de dízimo funcionando!",
  });
});

// ========================================
// BANCO DE DADOS E SERVIDOR
// ========================================

try {
  await sequelize.authenticate();

  console.log(
    "Banco de dados conectado com sucesso!"
  );

  await sequelize.sync();

  console.log(
    "Tabelas sincronizadas com sucesso!"
  );

  const PORT =
    process.env.PORT || 8080;

  app.listen(PORT, () => {
    console.log(
      `Servidor rodando na porta ${PORT}`
    );
  });
} catch (error) {
  console.error(
    "Erro ao iniciar o servidor:"
  );

  console.error(error);

  process.exit(1);
}