import { Router } from "express";

import { autenticar } from "../middlewares/authMiddleware.js";

import { somenteSuperAdmin } from "../middlewares/adminMiddleware.js";

import {
  listarComunidades,
  listarUsuarios,
  resumoDashboard,
  alterarLicencaUsuario,
} from "../controllers/adminController.js";

const router = Router();

// ========================================
// TESTE DE ACESSO SUPER ADMIN
// ========================================

router.get(
  "/teste",
  autenticar,
  somenteSuperAdmin,
  (req, res) => {
    res.json({
      mensagem: "Acesso SUPER_ADMIN autorizado",
      usuario: req.usuario,
    });
  }
);

// ========================================
// LISTAR TODAS AS COMUNIDADES
// ========================================

router.get(
  "/comunidades",
  autenticar,
  somenteSuperAdmin,
  listarComunidades
);

// ========================================
// LISTAR TODOS OS USUÁRIOS
// ========================================

router.get(
  "/usuarios",
  autenticar,
  somenteSuperAdmin,
  listarUsuarios
);

// ========================================
// RESUMO DO DASHBOARD SUPER ADMIN
// ========================================

router.get(
  "/dashboard",
  autenticar,
  somenteSuperAdmin,
  resumoDashboard
);

// ========================================
// ALTERAR LICENÇA DE UM USUÁRIO
// ========================================

router.patch(
  "/usuarios/:id/licenca",
  autenticar,
  somenteSuperAdmin,
  alterarLicencaUsuario
);

export default router;