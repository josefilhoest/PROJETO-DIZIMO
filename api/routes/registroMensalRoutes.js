import { Router } from "express";

import {
  listarRegistros,
  listarHistoricoMensal,
  detalharHistoricoMensal,
  buscarRegistroPorId,
  criarRegistro,
  atualizarRegistro,
  removerRegistro,
  fecharMes,

} from "../controllers/registroMensalController.js";

import { autenticar } from "../middlewares/authMiddleware.js";

const router = Router();

// ========================================
// LISTAR REGISTROS MENSAIS
// ========================================

router.get(
  "/",
  autenticar,
  listarRegistros
);

// ========================================
// LISTAR HISTÓRICO MENSAL
// ========================================

router.get(
  "/historico",
  autenticar,
  listarHistoricoMensal
);

// ========================================
// FECHAR MÊS / INICIAR NOVA CONTAGEM
// ========================================

router.post(
  "/fechar-mes",
  autenticar,
  fecharMes
);
router.get(
  "/historico/:id",
  autenticar,
  detalharHistoricoMensal
);

// ========================================
// BUSCAR REGISTRO POR ID
// ========================================

router.get(
  "/:id",
  autenticar,
  buscarRegistroPorId
);

// ========================================
// CRIAR REGISTRO
// ========================================

router.post(
  "/",
  autenticar,
  criarRegistro
);

// ========================================
// ATUALIZAR REGISTRO
// ========================================

router.put(
  "/:id",
  autenticar,
  atualizarRegistro
);

// ========================================
// REMOVER REGISTRO
// ========================================

router.delete(
  "/:id",
  autenticar,
  removerRegistro
);

export default router;
