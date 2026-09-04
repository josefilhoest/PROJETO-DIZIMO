import jwt from "jsonwebtoken";

import Usuario from "../models/Usuario.js";

// ========================================
// VERIFICAR TOKEN JWT E USUÁRIO ATUAL
// ========================================

export const autenticar = async (req, res, next) => {
  try {
    // ========================================
    // VERIFICAR HEADER DE AUTORIZAÇÃO
    // ========================================

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

    // ========================================
    // VERIFICAR CONFIGURAÇÃO DO JWT
    // ========================================

    if (!process.env.JWT_SECRET) {
      console.error(
        "JWT_SECRET não configurado no servidor."
      );

      return res.status(500).json({
        erro: "Erro interno de autenticação",
      });
    }

    // ========================================
    // VALIDAR TOKEN
    // ========================================

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
    // CONFIRMAR USUÁRIO ATUAL NO BANCO
    // ========================================
    //
    // IMPORTANTE:
    // Não confiamos no perfil, paróquia ou
    // comunidade gravados no token.
    //
    // O banco é sempre a fonte atual.
    //
    // Assim, alterações de:
    // - perfil
    // - paróquia
    // - comunidade
    // - licença
    // - status do usuário
    //
    // passam a valer imediatamente.
    //
    // ========================================

    const usuario =
      await Usuario.findByPk(usuarioId, {
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
      });

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
    //
    // SUPER_ADMIN:
    // conta administrativa geral do sistema.
    //
    // ADMIN_PAROQUIA e ADMIN_COMUNIDADE:
    // dependem de licença ATIVA.
    //
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
    // NORMALIZAR VÍNCULOS
    // ========================================

    const paroquiaId =
      usuario.paroquiaId === null
        ? null
        : Number(usuario.paroquiaId);

    const comunidadeId =
      usuario.comunidadeId === null
        ? null
        : Number(usuario.comunidadeId);

    // ========================================
    // USAR SEMPRE OS DADOS ATUAIS DO BANCO
    // ========================================
    //
    // ADMIN_PAROQUIA poderá possuir:
    //
    // paroquiaId
    //   -> paróquia que administra
    //
    // comunidadeId
    //   -> comunidade-sede onde trabalha
    //      com os próprios dizimistas
    //
    // ========================================

    req.usuario = {
      usuarioId: usuario.id,
      paroquiaId,
      comunidadeId,
      perfil: usuario.perfil,
      ativo: usuario.ativo,
      licencaStatus: usuario.licencaStatus,
    };

    next();
  } catch (error) {
    // ========================================
    // TOKEN EXPIRADO
    // ========================================

    if (
      error?.name === "TokenExpiredError"
    ) {
      return res.status(401).json({
        erro: "Token expirado",
      });
    }

    // ========================================
    // TOKEN INVÁLIDO
    // ========================================

    if (
      error?.name === "JsonWebTokenError" ||
      error?.name === "NotBeforeError"
    ) {
      return res.status(401).json({
        erro: "Token inválido",
      });
    }

    // ========================================
    // ERRO INTERNO
    // ========================================

    console.error(
      "Erro ao validar autenticação:",
      error
    );

    return res.status(500).json({
      erro: "Erro interno de autenticação",
    });
  }
};