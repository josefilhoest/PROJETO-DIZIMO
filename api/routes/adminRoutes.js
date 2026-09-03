import { Router } from "express";

import { autenticar } from "../middlewares/authMiddleware.js";

import {
  somenteSuperAdmin,
  somenteAdminParoquia,
} from "../middlewares/adminMiddleware.js";

import {
  listarComunidadesParoquia,
  detalharComunidadeParoquia,
  exportarDizimistasComunidadeParoquia,
  gerarBackupComunidadeParoquia,
  listarHistoricoComunidadeParoquia,
  detalharHistoricoComunidadeParoquia,
  listarDizimistasComunidadeParoquia,
} from "../controllers/paroquiaController.js";

import {
  listarParoquias,
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
      mensagem:
        "Acesso SUPER_ADMIN autorizado",
      usuario: req.usuario,
    });
  }
);

// ========================================
// LISTAR TODAS AS PARÓQUIAS
// ========================================

router.get(
  "/paroquias",
  autenticar,
  somenteSuperAdmin,
  listarParoquias
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
// ALTERAR STATUS DO USUÁRIO
// ========================================

router.patch(
  "/usuarios/:id/status",
  autenticar,
  somenteSuperAdmin,
  alterarStatusUsuario
);

// ========================================
// ALTERAR LICENÇA DO USUÁRIO
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

// ========================================
// DETALHAR COMUNIDADE DA PARÓQUIA LOGADA
// ========================================

router.get(
  "/paroquia/comunidades/:id",
  autenticar,
  somenteAdminParoquia,
  detalharComunidadeParoquia
);

// ========================================
// EXPORTAR DIZIMISTAS DA COMUNIDADE EM CSV
// ADMIN_PAROQUIA
// ========================================

router.get(
  "/paroquia/comunidades/:id/exportar",
  autenticar,
  somenteAdminParoquia,
  exportarDizimistasComunidadeParoquia
);

// ========================================
// BACKUP DA COMUNIDADE
// ADMIN_PAROQUIA
// ========================================

router.get(
  "/paroquia/comunidades/:id/backup",
  autenticar,
  somenteAdminParoquia,
  gerarBackupComunidadeParoquia
);


// ========================================
// HISTÓRICO MENSAL DA COMUNIDADE
// ADMIN_PAROQUIA
// ========================================

router.get(
  "/paroquia/comunidades/:id/historico",
  autenticar,
  somenteAdminParoquia,
  listarHistoricoComunidadeParoquia
);

// ========================================
// DETALHAR FECHAMENTO MENSAL DA COMUNIDADE
// ADMIN_PAROQUIA
// ========================================

router.get(
  "/paroquia/comunidades/:id/historico/:registroId",
  autenticar,
  somenteAdminParoquia,
  detalharHistoricoComunidadeParoquia
);


// ========================================
// LISTAR DIZIMISTAS DA COMUNIDADE
// ADMIN_PAROQUIA
// ========================================

router.get(
  "/paroquia/comunidades/:id/dizimistas",
  autenticar,
  somenteAdminParoquia,
  listarDizimistasComunidadeParoquia
);

export default router;
