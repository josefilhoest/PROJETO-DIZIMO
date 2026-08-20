import "dotenv/config";

import express from "express";
import cors from "cors";
import helmet from "helmet";
import rateLimit from "express-rate-limit";

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

const app = express();

// ========================================
// LIMITADOR DE TENTATIVAS DE AUTENTICAÇÃO
// ========================================

const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutos

  limit: 10,

  standardHeaders: "draft-8",

  legacyHeaders: false,

  message: {
    erro:
      "Muitas tentativas de login. Aguarde alguns minutos e tente novamente.",
  },
});

// ========================================
// MIDDLEWARES DE SEGURANÇA
// ========================================

// Adiciona headers de segurança
app.use(helmet());

// ========================================
// CORS
// ========================================

// Frontends autorizados a acessar a API
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

// Permite receber JSON nas requisições
app.use(express.json());

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
// Protegida contra excesso de tentativas
app.use(
  "/api/auth",
  loginLimiter,
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
  res.json({
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
}