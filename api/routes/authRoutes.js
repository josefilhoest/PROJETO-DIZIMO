import { Router } from "express";

import {
  cadastrarUsuario,
  login,
} from "../controllers/authController.js";

const router = Router();

router.post("/cadastrar", cadastrarUsuario);

router.post("/login", login);

export default router;