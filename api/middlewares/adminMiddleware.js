// ========================================
// PERMITIR SOMENTE SUPER ADMIN
// ========================================

export const somenteSuperAdmin = (req, res, next) => {
  try {
    // ========================================
    // VERIFICAR AUTENTICAÇÃO
    // ========================================

    if (!req.usuario) {
      return res.status(401).json({
        erro: "Usuário não autenticado",
      });
    }

    // ========================================
    // VERIFICAR PERFIL
    // ========================================

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
    // ========================================
    // VERIFICAR AUTENTICAÇÃO
    // ========================================

    if (!req.usuario) {
      return res.status(401).json({
        erro: "Usuário não autenticado",
      });
    }

    // ========================================
    // VERIFICAR PERFIL
    // ========================================

    if (req.usuario.perfil !== "ADMIN_PAROQUIA") {
      return res.status(403).json({
        erro: "Acesso permitido somente para ADMIN_PAROQUIA",
      });
    }

    // ========================================
    // VERIFICAR VÍNCULO COM PARÓQUIA
    // ========================================

    const paroquiaId = Number(req.usuario.paroquiaId);

    if (
      !Number.isInteger(paroquiaId) ||
      paroquiaId <= 0
    ) {
      return res.status(403).json({
        erro: "Administrador não vinculado a uma paróquia",
      });
    }

    // ========================================
    // NORMALIZAR PAROQUIA ID
    // ========================================
    //
    // A partir daqui os controllers podem usar:
    //
    // req.usuario.paroquiaId
    //
    // como número válido.
    //
    // ========================================

    req.usuario.paroquiaId = paroquiaId;

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

// ========================================
// PERMITIR SUPER ADMIN OU ADMIN DA PARÓQUIA
// ========================================
//
// Este middleware poderá ser utilizado em rotas
// administrativas que futuramente possam ser
// acessadas tanto pelo SUPER_ADMIN quanto pelo
// ADMIN_PAROQUIA.
//
// IMPORTANTE:
// mesmo quando ADMIN_PAROQUIA acessar a rota,
// o controller deverá limitar os dados usando:
//
// req.usuario.paroquiaId
//
// ========================================

export const somenteSuperAdminOuAdminParoquia = (
  req,
  res,
  next
) => {
  try {
    // ========================================
    // VERIFICAR AUTENTICAÇÃO
    // ========================================

    if (!req.usuario) {
      return res.status(401).json({
        erro: "Usuário não autenticado",
      });
    }

    const perfil = req.usuario.perfil;

    // ========================================
    // SUPER ADMIN
    // ========================================

    if (perfil === "SUPER_ADMIN") {
      return next();
    }

    // ========================================
    // ADMIN DA PARÓQUIA
    // ========================================

    if (perfil === "ADMIN_PAROQUIA") {
      const paroquiaId = Number(
        req.usuario.paroquiaId
      );

      if (
        !Number.isInteger(paroquiaId) ||
        paroquiaId <= 0
      ) {
        return res.status(403).json({
          erro:
            "Administrador não vinculado a uma paróquia",
        });
      }

      req.usuario.paroquiaId = paroquiaId;

      return next();
    }

    // ========================================
    // DEMAIS PERFIS
    // ========================================

    return res.status(403).json({
      erro:
        "Acesso permitido somente para administradores autorizados",
    });
  } catch (error) {
    console.error(
      "Erro ao verificar permissão administrativa:",
      error
    );

    return res.status(500).json({
      erro: "Erro ao verificar permissão administrativa",
    });
  }
};