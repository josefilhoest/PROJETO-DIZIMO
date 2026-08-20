import { Router } from "express";

import { autenticar } from "../middlewares/authMiddleware.js";
import { somenteSuperAdmin } from "../middlewares/adminMiddleware.js";

import {
  listarComunidades,
  alterarStatusComunidade,
  listarUsuarios,
  cadastrarUsuarioAdmin,
  alterarStatusUsuario,
  alterarLicencaUsuario,
  resumoDashboard,
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
// ALTERAR STATUS DE UMA COMUNIDADE
// ========================================

router.patch(
  "/comunidades/:id/status",
  autenticar,
  somenteSuperAdmin,
  alterarStatusComunidade
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
// CADASTRAR NOVO USUÁRIO
// ========================================

router.post(
  "/usuarios",
  autenticar,
  somenteSuperAdmin,
  cadastrarUsuarioAdmin
);

// ========================================
// ALTERAR STATUS DE UM USUÁRIO
// ========================================

router.patch(
  "/usuarios/:id/status",
  autenticar,
  somenteSuperAdmin,
  alterarStatusUsuario
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

// ========================================
// RESUMO DO DASHBOARD SUPER ADMIN
// ========================================

router.get(
  "/dashboard",
  autenticar,
  somenteSuperAdmin,
  resumoDashboard
);

export default router;
