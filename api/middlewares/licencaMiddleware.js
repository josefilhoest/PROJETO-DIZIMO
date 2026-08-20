import Usuario from "../models/Usuario.js";

// ========================================
// VERIFICAR LICENÇA DO USUÁRIO
// ========================================

export const verificarLicenca = async (req, res, next) => {
  try {
    const usuarioId = req.usuario.usuarioId;

    const usuario = await Usuario.findByPk(usuarioId);

    if (!usuario) {
      return res.status(401).json({
        erro: "Usuário não encontrado",
      });
    }

    if (!usuario.ativo) {
      return res.status(403).json({
        erro: "Usuário desativado",
      });
    }

    if (usuario.perfil === "SUPER_ADMIN") {
      return next();
    }

    if (usuario.licencaStatus !== "ATIVA") {
      return res.status(403).json({
        erro: "Licença de uso bloqueada",
      });
    }

    next();
  } catch (error) {
    console.error(
      "Erro ao verificar licença:",
      error
    );

    return res.status(500).json({
      erro: "Erro ao verificar licença do usuário",
    });
  }
};