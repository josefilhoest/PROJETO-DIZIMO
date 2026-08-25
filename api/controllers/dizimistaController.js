import { Op } from "sequelize";
import Dizimista from "../models/Dizimista.js";

// ========================================
// LISTAR DIZIMISTAS DA COMUNIDADE LOGADA
// ========================================

export const listarDizimistas = async (req, res) => {
    try {
        const comunidadeId = req.usuario.comunidadeId;

        const dizimistas = await Dizimista.findAll({
            where: {
                comunidadeId,
            },
            order: [["numero", "ASC"]],
        });

        res.json(dizimistas);
    } catch (error) {
        console.error("Erro ao listar dizimistas:", error);

        res.status(500).json({
            erro: "Erro ao listar dizimistas",
        });
    }
};

// ========================================
// CRIAR DIZIMISTA
// ========================================

export const criarDizimista = async (req, res) => {
    try {
        const comunidadeId = req.usuario.comunidadeId;

        const {
            numero,
            folha,
            nome,
            valor,
        } = req.body;

        const novoDizimista = await Dizimista.create({
            numero,
            folha,
            nome,
            valor,
            comunidadeId,
        });

        res.status(201).json(novoDizimista);
    } catch (error) {
        console.error("Erro ao cadastrar dizimista:", error);

        if (
            error.name ===
            "SequelizeUniqueConstraintError"
        ) {
            return res.status(409).json({
                erro:
                    "Já existe um dizimista com esse número nesta comunidade",
            });
        }

        res.status(500).json({
            erro: "Erro ao cadastrar dizimista",
        });
    }
};

// ========================================
// IMPORTAR DIZIMISTAS EM LOTE
// ========================================

export const importarDizimistas = async (req, res) => {
    const transaction =
        await Dizimista.sequelize.transaction();

    try {
        const comunidadeId = req.usuario.comunidadeId;

        if (!comunidadeId) {
            await transaction.rollback();

            return res.status(400).json({
                erro:
                    "Não foi possível identificar a comunidade do usuário.",
            });
        }

        const { dizimistas } = req.body;

        if (
            !Array.isArray(dizimistas) ||
            dizimistas.length === 0
        ) {
            await transaction.rollback();

            return res.status(400).json({
                erro:
                    "Envie uma lista de dizimistas para importar.",
            });
        }

        // Limite de segurança para uma única requisição.
        if (dizimistas.length > 1000) {
            await transaction.rollback();

            return res.status(400).json({
                erro:
                    "A importação permite no máximo 1000 dizimistas por vez.",
            });
        }

        const dadosValidados = [];
        const numerosRecebidos = new Set();
        const numerosDuplicadosNoLote = new Set();

        for (
            let indice = 0;
            indice < dizimistas.length;
            indice += 1
        ) {
            const item = dizimistas[indice];

            const numero = Number(item?.numero);
            const nome = String(
                item?.nome || ""
            ).trim();
            const valor = Number(item?.valor ?? 0);

            if (
                !Number.isInteger(numero) ||
                numero < 1
            ) {
                await transaction.rollback();

                return res.status(400).json({
                    erro:
                        `Número inválido na linha ${indice + 1}.`,
                });
            }

            if (!nome) {
                await transaction.rollback();

                return res.status(400).json({
                    erro:
                        `Nome inválido na linha ${indice + 1}.`,
                });
            }

            if (
                !Number.isFinite(valor) ||
                valor < 0
            ) {
                await transaction.rollback();

                return res.status(400).json({
                    erro:
                        `Valor inválido na linha ${indice + 1}.`,
                });
            }

            if (numerosRecebidos.has(numero)) {
                numerosDuplicadosNoLote.add(numero);
            }

            numerosRecebidos.add(numero);

            // A folha é sempre calculada no backend.
            // Não confiamos no valor enviado pelo frontend.
            const folha = Math.ceil(numero / 40);

            dadosValidados.push({
                numero,
                folha,
                nome,
                valor,

                // Segurança:
                // comunidadeId vem exclusivamente do usuário
                // autenticado, nunca do arquivo ou do frontend.
                comunidadeId,
            });
        }

        if (numerosDuplicadosNoLote.size > 0) {
            await transaction.rollback();

            return res.status(409).json({
                erro:
                    "Existem números duplicados na lista enviada.",
                numerosDuplicados: Array.from(
                    numerosDuplicadosNoLote
                ).sort((a, b) => a - b),
            });
        }

        const numeros = dadosValidados.map(
            (item) => item.numero
        );

        const jaExistentes =
            await Dizimista.findAll({
                where: {
                    comunidadeId,
                    numero: {
                        [Op.in]: numeros,
                    },
                },
                attributes: ["numero"],
                transaction,
            });

        if (jaExistentes.length > 0) {
            const numerosJaExistentes =
                jaExistentes
                    .map(
                        (dizimista) =>
                            Number(dizimista.numero)
                    )
                    .sort((a, b) => a - b);

            await transaction.rollback();

            return res.status(409).json({
                erro:
                    "Um ou mais números já existem nesta comunidade.",
                numerosJaExistentes,
            });
        }

        const importados =
            await Dizimista.bulkCreate(
                dadosValidados,
                {
                    transaction,
                    validate: true,
                }
            );

        await transaction.commit();

        return res.status(201).json({
            mensagem:
                "Dizimistas importados com sucesso.",
            quantidade: importados.length,
        });
    } catch (error) {
        if (
            transaction &&
            !transaction.finished
        ) {
            await transaction.rollback();
        }

        console.error(
            "Erro ao importar dizimistas:",
            error
        );

        if (
            error.name ===
            "SequelizeUniqueConstraintError"
        ) {
            return res.status(409).json({
                erro:
                    "Um ou mais números já existem nesta comunidade.",
            });
        }

        if (
            error.name ===
            "SequelizeValidationError"
        ) {
            return res.status(400).json({
                erro:
                    "Um ou mais dizimistas possuem dados inválidos.",
            });
        }

        return res.status(500).json({
            erro:
                "Erro ao importar dizimistas.",
        });
    }
};

// ========================================
// ATUALIZAR DIZIMISTA
// ========================================

export const atualizarDizimista = async (req, res) => {
    try {
        const comunidadeId = req.usuario.comunidadeId;

        const { id } = req.params;

        const {
            numero,
            folha,
            nome,
            valor,
        } = req.body;

        const dizimista = await Dizimista.findOne({
            where: {
                id,
                comunidadeId,
            },
        });

        if (!dizimista) {
            return res.status(404).json({
                erro:
                    "Dizimista não encontrado nesta comunidade",
            });
        }

        await dizimista.update({
            numero,
            folha,
            nome,
            valor,
        });

        res.json(dizimista);
    } catch (error) {
        console.error(
            "Erro ao atualizar dizimista:",
            error
        );

        if (
            error.name ===
            "SequelizeUniqueConstraintError"
        ) {
            return res.status(409).json({
                erro:
                    "Já existe um dizimista com esse número nesta comunidade",
            });
        }

        res.status(500).json({
            erro: "Erro ao atualizar dizimista",
        });
    }
};

// ========================================
// REMOVER DIZIMISTA
// ========================================

export const removerDizimista = async (req, res) => {
    try {
        const comunidadeId = req.usuario.comunidadeId;

        const { id } = req.params;

        const dizimista = await Dizimista.findOne({
            where: {
                id,
                comunidadeId,
            },
        });

        if (!dizimista) {
            return res.status(404).json({
                erro:
                    "Dizimista não encontrado nesta comunidade",
            });
        }

        await dizimista.destroy();

        res.json({
            mensagem:
                "Dizimista removido com sucesso",
        });
    } catch (error) {
        console.error(
            "Erro ao remover dizimista:",
            error
        );

        res.status(500).json({
            erro:
                "Erro ao remover dizimista",
        });
    }
};
