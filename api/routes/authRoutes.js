import { Router } from "express";

import {
  cadastrarUsuario,
  cadastrarComunidade,
  login,
} from "../controllers/authController.js";

const router = Router();

router.post("/cadastrar", cadastrarUsuario);

router.post(
  "/cadastrar-comunidade",
  cadastrarComunidade
);

router.post("/login", login);

export default router;