import { Op } from "sequelize";
import Dizimista from "../models/Dizimista.js";
import Comunidade from "../models/Comunidade.js";
import RegistroMensal from "../models/RegistroMensal.js";

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
// EXPORTAR DIZIMISTAS DA COMUNIDADE EM CSV
// ========================================

export const exportarDizimistasCsv = async (req, res) => {
    try {
        const comunidadeId = req.usuario?.comunidadeId;

        // Segurança:
        // a comunidade vem exclusivamente do usuário autenticado.
        if (!comunidadeId) {
            return res.status(400).json({
                erro:
                    "Não foi possível identificar a comunidade do usuário.",
            });
        }

        const dizimistas = await Dizimista.findAll({
            where: {
                comunidadeId,
            },
            attributes: [
                "numero",
                "folha",
                "nome",
                "valor",
            ],
            order: [["numero", "ASC"]],
        });

        const protegerCelulaTexto = (valor) => {
            const texto = String(valor ?? "");

            if (/^[=+\-@]/.test(texto)) {
                return `'${texto}`;
            }

            return texto;
        };

        const escaparCsv = (valor) => {
            const texto = String(valor ?? "")
                .replace(/"/g, '""');

            return `"${texto}"`;
        };

        const linhas = [
            ["Número", "Folha", "Nome", "Valor"]
                .map(escaparCsv)
                .join(";"),
        ];

        for (const dizimista of dizimistas) {
            const numero = Number(dizimista.numero);
            const folha = Number(dizimista.folha);

            const nome = protegerCelulaTexto(
                dizimista.nome
            );

            const valorNumerico = Number(
                dizimista.valor ?? 0
            );

            const valor = Number.isFinite(valorNumerico)
                ? valorNumerico
                    .toFixed(2)
                    .replace(".", ",")
                : "0,00";

            linhas.push(
                [numero, folha, nome, valor]
                    .map(escaparCsv)
                    .join(";")
            );
        }

        const csv = `\uFEFF${linhas.join("\r\n")}`;

        const dataAtual = new Date()
            .toISOString()
            .slice(0, 10);

        const nomeArquivo =
            `dizimistas-${dataAtual}.csv`;

        res.setHeader(
            "Content-Type",
            "text/csv; charset=utf-8"
        );

        res.setHeader(
            "Content-Disposition",
            `attachment; filename="${nomeArquivo}"`
        );

        res.setHeader(
            "Cache-Control",
            "no-store"
        );

        return res.status(200).send(csv);
    } catch (error) {
        console.error(
            "Erro ao exportar dizimistas:",
            error
        );

        return res.status(500).json({
            erro:
                "Erro ao exportar dizimistas.",
        });
    }
};
// ========================================
// BACKUP COMPLETO DA COMUNIDADE EM JSON
// ========================================

export const exportarBackupComunidade = async (req, res) => {
    try {
        const comunidadeId = req.usuario?.comunidadeId;

        // Segurança:
        // a comunidade vem exclusivamente do usuário autenticado.
        if (!comunidadeId) {
            return res.status(400).json({
                erro:
                    "Não foi possível identificar a comunidade do usuário.",
            });
        }

        const [comunidade, dizimistas, registrosMensais] =
            await Promise.all([
                Comunidade.findOne({
                    where: {
                        id: comunidadeId,
                    },
                    attributes: [
                        "id",
                        "nome",
                        "paroquia",
                        "cidade",
                        "ativa",
                    ],
                }),

                Dizimista.findAll({
                    where: {
                        comunidadeId,
                    },
                    attributes: [
                        "numero",
                        "folha",
                        "nome",
                        "valor",
                    ],
                    order: [["numero", "ASC"]],
                }),

                RegistroMensal.findAll({
                    where: {
                        comunidadeId,
                    },
                    attributes: [
                        "data",
                        "equipe_comunidade",
                        "conferido_em",
                        "responsavel_paroquia",
                    ],
                    order: [["data", "ASC"]],
                }),
            ]);

        if (!comunidade) {
            return res.status(404).json({
                erro: "Comunidade não encontrada.",
            });
        }

        const criadoEm = new Date().toISOString();

        const backup = {
            formato: "PROJETO-DIZIMO-BACKUP",
            versao: "1.0",
            criadoEm,

            comunidade: {
                id: Number(comunidade.id),
                nome: comunidade.nome,
                paroquia: comunidade.paroquia,
                cidade: comunidade.cidade,
                ativa: Boolean(comunidade.ativa),
            },

            dados: {
                dizimistas: dizimistas.map(
                    (dizimista) => ({
                        numero: Number(dizimista.numero),
                        folha: Number(dizimista.folha),
                        nome: dizimista.nome,
                        valor: Number(
                            dizimista.valor ?? 0
                        ),
                    })
                ),

                registrosMensais:
                    registrosMensais.map(
                        (registro) => ({
                            data: registro.data,
                            equipe_comunidade:
                                registro.equipe_comunidade,
                            conferido_em:
                                registro.conferido_em,
                            responsavel_paroquia:
                                registro.responsavel_paroquia,
                        })
                    ),
            },

            resumo: {
                totalDizimistas:
                    dizimistas.length,
                totalRegistrosMensais:
                    registrosMensais.length,
            },
        };

        const json = JSON.stringify(
            backup,
            null,
            2
        );

        const dataAtual = criadoEm.slice(0, 10);

        const nomeComunidadeSeguro = String(
            comunidade.nome || "comunidade"
        )
            .normalize("NFD")
            .replace(/[\u0300-\u036f]/g, "")
            .replace(/[^a-zA-Z0-9_-]+/g, "-")
            .replace(/^-+|-+$/g, "")
            .toLowerCase() || "comunidade";

        const nomeArquivo =
            `backup-${nomeComunidadeSeguro}-${dataAtual}.json`;

        res.setHeader(
            "Content-Type",
            "application/json; charset=utf-8"
        );

        res.setHeader(
            "Content-Disposition",
            `attachment; filename="${nomeArquivo}"`
        );

        res.setHeader(
            "Cache-Control",
            "no-store"
        );

        res.setHeader(
            "Pragma",
            "no-cache"
        );

        return res.status(200).send(json);
    } catch (error) {
        console.error(
            "Erro ao gerar backup da comunidade:",
            error
        );

        return res.status(500).json({
            erro:
                "Erro ao gerar backup da comunidade.",
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
