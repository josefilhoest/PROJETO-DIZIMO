import { Router } from "express";

import { autenticar } from "../middlewares/authMiddleware.js";
import {
  somenteSuperAdmin,
  somenteAdminParoquia,
} from "../middlewares/adminMiddleware.js";
import {
  listarComunidadesParoquia,
} from "../controllers/paroquiaController.js";

import {
  listarComunidades,
  detalharComunidade,
  editarComunidadeAdmin,
  alterarStatusComunidade,
  excluirComunidadeAdmin,
  listarUsuarios,
  cadastrarUsuarioAdmin,
  editarUsuarioAdmin,
  redefinirSenhaUsuarioAdmin,
  excluirUsuarioAdmin,
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
// DETALHAR UMA COMUNIDADE
// ========================================

router.get(
  "/comunidades/:id",
  autenticar,
  somenteSuperAdmin,
  detalharComunidade
);

// ========================================
// EDITAR DADOS DE UMA COMUNIDADE
// ========================================

router.patch(
  "/comunidades/:id",
  autenticar,
  somenteSuperAdmin,
  editarComunidadeAdmin
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
// EXCLUIR UMA COMUNIDADE
// ========================================

router.delete(
  "/comunidades/:id",
  autenticar,
  somenteSuperAdmin,
  excluirComunidadeAdmin
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
// EDITAR NOME E E-MAIL DE UM USUÁRIO
// ========================================

router.patch(
  "/usuarios/:id",
  autenticar,
  somenteSuperAdmin,
  editarUsuarioAdmin
);

// ========================================
// REDEFINIR SENHA DE UM USUÁRIO
// ========================================

router.patch(
  "/usuarios/:id/senha",
  autenticar,
  somenteSuperAdmin,
  redefinirSenhaUsuarioAdmin
);

// ========================================
// EXCLUIR USUÁRIO SEM COMUNIDADE
// ========================================

router.delete(
  "/usuarios/:id",
  autenticar,
  somenteSuperAdmin,
  excluirUsuarioAdmin
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

// ========================================
// LISTAR COMUNIDADES DA PARÓQUIA LOGADA
// ========================================

router.get(
  "/paroquia/comunidades",
  autenticar,
  somenteAdminParoquia,
  listarComunidadesParoquia
);

export default router;
