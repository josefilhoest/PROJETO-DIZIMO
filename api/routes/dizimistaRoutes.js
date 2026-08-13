import { Router } from "express";

import {
  listarDizimistas,
  criarDizimista,
  atualizarDizimista,
  removerDizimista,
} from "../controllers/dizimistaController.js";

const router = Router();

router.get("/", listarDizimistas);
router.post("/", criarDizimista);
router.put("/:id", atualizarDizimista);
router.delete("/:id", removerDizimista);

export default router;