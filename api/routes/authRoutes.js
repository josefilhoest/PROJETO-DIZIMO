import { Router } from "express";
import rateLimit from "express-rate-limit";

import {
  cadastrarUsuario,
  cadastrarComunidade,
  login,
} from "../controllers/authController.js";

import { autenticar } from "../middlewares/authMiddleware.js";
import { somenteSuperAdmin } from "../middlewares/adminMiddleware.js";

const router = Router();

// ========================================
// LIMITADOR DE TENTATIVAS DE LOGIN
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
// LOGIN
// ROTA PÚBLICA
// ========================================

router.post(
  "/login",
  loginLimiter,
  login
);

// ========================================
// CADASTRAR USUÁRIO LICENCIADO
// SOMENTE SUPER ADMIN
// ========================================

router.post(
  "/cadastrar",
  autenticar,
  somenteSuperAdmin,
  cadastrarUsuario
);

// ========================================
// CADASTRAR A PRÓPRIA COMUNIDADE
// USUÁRIO AUTENTICADO
// ========================================

router.post(
  "/cadastrar-comunidade",
  autenticar,
  cadastrarComunidade
);

export default router;