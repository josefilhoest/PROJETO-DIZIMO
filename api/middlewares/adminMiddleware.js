// ========================================
// PERMITIR SOMENTE SUPER ADMIN
// ========================================

export const somenteSuperAdmin = (req, res, next) => {
  try {
    if (!req.usuario) {
      return res.status(401).json({
        erro: "Usuário não autenticado",
      });
    }

    if (req.usuario.perfil !== "SUPER_ADMIN") {
      return res.status(403).json({
        erro: "Acesso permitido somente para SUPER_ADMIN",
      });
    }

    next();
  } catch (error) {
    console.error(
      "Erro ao verificar perfil SUPER_ADMIN:",
      error
    );

    return res.status(500).json({
      erro: "Erro ao verificar permissão administrativa",
    });
  }
};