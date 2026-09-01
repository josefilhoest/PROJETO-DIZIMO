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

// ========================================
// PERMITIR SOMENTE ADMIN DA PARÓQUIA
// ========================================

export const somenteAdminParoquia = (req, res, next) => {
  try {
    if (!req.usuario) {
      return res.status(401).json({
        erro: "Usuário não autenticado",
      });
    }

    if (req.usuario.perfil !== "ADMIN_PAROQUIA") {
      return res.status(403).json({
        erro: "Acesso permitido somente para ADMIN_PAROQUIA",
      });
    }

    if (!req.usuario.paroquiaId) {
      return res.status(403).json({
        erro: "Administrador não vinculado a uma paróquia",
      });
    }

    next();
  } catch (error) {
    console.error(
      "Erro ao verificar perfil ADMIN_PAROQUIA:",
      error
    );

    return res.status(500).json({
      erro: "Erro ao verificar permissão paroquial",
    });
  }
};