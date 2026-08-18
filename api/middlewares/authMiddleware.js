import jwt from "jsonwebtoken";

// ========================================
// VERIFICAR TOKEN JWT
// ========================================

export const autenticar = (req, res, next) => {
  try {
    const authorization = req.headers.authorization;

    if (!authorization) {
      return res.status(401).json({
        erro: "Token não informado",
      });
    }

    const [tipo, token] = authorization.split(" ");

    if (tipo !== "Bearer" || !token) {
      return res.status(401).json({
        erro: "Token inválido",
      });
    }

    const dadosToken = jwt.verify(
      token,
      process.env.JWT_SECRET
    );

    req.usuario = {
      usuarioId: dadosToken.usuarioId,
      comunidadeId: dadosToken.comunidadeId,
      perfil: dadosToken.perfil,
    };

    next();
  } catch (error) {
    console.error("Erro ao validar token:", error);

    return res.status(401).json({
      erro: "Token inválido ou expirado",
    });
  }
};