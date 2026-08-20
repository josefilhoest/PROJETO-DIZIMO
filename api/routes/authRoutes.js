import { Router } from "express";

import {
  cadastrarUsuario,
  cadastrarComunidade,
  login,
} from "../controllers/authController.js";

import { autenticar } from "../middlewares/authMiddleware.js";
import { somenteSuperAdmin } from "../middlewares/adminMiddleware.js";

const router = Router();

// ========================================
// LOGIN
// ROTA PÚBLICA
// ========================================

router.post(
  "/login",
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