import jwt from "jsonwebtoken";
import Usuario from "../models/Usuario.js";

// ========================================
// VERIFICAR TOKEN JWT E USUÁRIO ATUAL
// ========================================

export const autenticar = async (req, res, next) => {
  try {
    const authorization =
      req.headers.authorization;

    if (!authorization) {
      return res.status(401).json({
        erro: "Token não informado",
      });
    }

    const [tipo, token] =
      authorization.split(" ");

    if (tipo !== "Bearer" || !token) {
      return res.status(401).json({
        erro: "Token inválido",
      });
    }

    if (!process.env.JWT_SECRET) {
      console.error(
        "JWT_SECRET não configurado no servidor."
      );

      return res.status(500).json({
        erro: "Erro interno de autenticação",
      });
    }

    const dadosToken = jwt.verify(
      token,
      process.env.JWT_SECRET
    );

    const usuarioId =
      Number(dadosToken.usuarioId);

    if (
      !Number.isInteger(usuarioId) ||
      usuarioId <= 0
    ) {
      return res.status(401).json({
        erro: "Token inválido",
      });
    }

    // ========================================
    // CONFIRMAR USUÁRIO NO BANCO
    // ========================================

    const usuario = await Usuario.findByPk(
      usuarioId,
      {
        attributes: [
          "id",
          "nome",
          "email",
          "perfil",
          "paroquiaId",
          "comunidadeId",
          "ativo",
          "licencaStatus",
        ],
      }
    );

    if (!usuario) {
      return res.status(401).json({
        erro: "Usuário não encontrado",
      });
    }

    // ========================================
    // VERIFICAR SE O USUÁRIO ESTÁ ATIVO
    // ========================================

    if (!usuario.ativo) {
      return res.status(403).json({
        erro: "Usuário desativado",
      });
    }

    // ========================================
    // VERIFICAR LICENÇA
    // ========================================
    // O SUPER_ADMIN é tratado como conta
    // administrativa do sistema.
    // A licença comercial é aplicada aos
    // administradores de comunidade.
    // ========================================

    if (
      usuario.perfil !== "SUPER_ADMIN" &&
      usuario.licencaStatus !== "ATIVA"
    ) {
      return res.status(403).json({
        erro: "Licença bloqueada",
      });
    }

    // ========================================
    // USAR SEMPRE OS DADOS ATUAIS DO BANCO
    // ========================================

    req.usuario = {
      usuarioId: usuario.id,
      paroquiaId: usuario.paroquiaId,
      comunidadeId: usuario.comunidadeId,
      perfil: usuario.perfil,
      ativo: usuario.ativo,
      licencaStatus: usuario.licencaStatus,
    };

    next();
  } catch (error) {
    if (
      error?.name === "TokenExpiredError"
    ) {
      return res.status(401).json({
        erro: "Token expirado",
      });
    }

    if (
      error?.name === "JsonWebTokenError" ||
      error?.name === "NotBeforeError"
    ) {
      return res.status(401).json({
        erro: "Token inválido",
      });
    }

    console.error(
      "Erro ao validar autenticação:",
      error
    );

    return res.status(500).json({
      erro: "Erro interno de autenticação",
    });
  }
};
