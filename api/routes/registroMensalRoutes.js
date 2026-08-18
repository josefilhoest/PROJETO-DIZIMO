import { Router } from "express";

import {
  listarRegistros,
  buscarRegistroPorId,
  criarRegistro,
  atualizarRegistro,
  removerRegistro,
} from "../controllers/registroMensalController.js";

import { autenticar } from "../middlewares/authMiddleware.js";

const router = Router();

router.get("/", autenticar, listarRegistros);

router.get("/:id", autenticar, buscarRegistroPorId);

router.post("/", autenticar, criarRegistro);

router.put("/:id", autenticar, atualizarRegistro);

router.delete("/:id", autenticar, removerRegistro);

export default router;