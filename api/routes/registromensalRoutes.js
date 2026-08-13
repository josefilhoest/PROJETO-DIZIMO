import { Router } from "express";

import {
  listarRegistros,
  buscarRegistroPorId,
  criarRegistro,
  atualizarRegistro,
  removerRegistro,
} from "../controllers/registroMensalController.js";

const router = Router();

router.get("/", listarRegistros);

router.get("/:id", buscarRegistroPorId);

router.post("/", criarRegistro);

router.put("/:id", atualizarRegistro);

router.delete("/:id", removerRegistro);

export default router;