import { Router } from "express";

import {
  listarDizimistas,
  criarDizimista,
  atualizarDizimista,
  removerDizimista,
} from "../controllers/dizimistaController.js";

import { autenticar } from "../middlewares/authMiddleware.js";

const router = Router();

router.get("/", autenticar, listarDizimistas);

router.post("/", autenticar, criarDizimista);

router.put("/:id", autenticar, atualizarDizimista);

router.delete("/:id", autenticar, removerDizimista);

export default router;