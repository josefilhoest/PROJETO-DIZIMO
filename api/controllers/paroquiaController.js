import Comunidade from "../models/Comunidade.js";

// ========================================
// LISTAR COMUNIDADES DA PARÓQUIA LOGADA
// ========================================

export const listarComunidadesParoquia = async (req, res) => {
    try {
        const paroquiaId = req.usuario?.paroquiaId;

        if (!paroquiaId) {
            return res.status(403).json({
                erro: "Usuário não vinculado a uma paróquia",
            });
        }

        const comunidades = await Comunidade.findAll({
            where: {
                paroquiaId,
            },

            attributes: [
                "id",
                "nome",
                "paroquia",
                "paroquiaId",
                "cidade",
                "ativa",
                "createdAt",
                "updatedAt",
            ],

            order: [["nome", "ASC"]],
        });

        return res.json({
            total: comunidades.length,
            comunidades,
        });
    } catch (error) {
        console.error(
            "Erro ao listar comunidades da paróquia:",
            error
        );

        return res.status(500).json({
            erro: "Erro ao listar comunidades da paróquia",
        });
    }
};