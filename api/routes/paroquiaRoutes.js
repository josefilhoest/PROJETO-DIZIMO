import express from "express";

import { autenticar } from "../middlewares/authMiddleware.js";
import { somenteAdminParoquia } from "../middlewares/adminMiddleware.js";

import {
    listarComunidadesParoquia,
} from "../controllers/paroquiaController.js";

const router = express.Router();

// ========================================
// ROTAS DO ADMINISTRADOR DA PARÓQUIA
// ========================================

router.get(
    "/comunidades",
    autenticar,
    somenteAdminParoquia,
    listarComunidadesParoquia
);

export default router;