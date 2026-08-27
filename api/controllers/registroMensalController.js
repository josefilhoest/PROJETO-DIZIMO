import sequelize from "../database/database.js";

import RegistroMensal from "../models/RegistroMensal.js";
import RegistroMensalItem from "../models/RegistroMensalItem.js";
import Dizimista from "../models/Dizimista.js";
import Comunidade from "../models/Comunidade.js";

// ========================================
// LISTAR REGISTROS DA COMUNIDADE DO USUÁRIO
// ========================================

export const listarRegistros = async (req, res) => {
  try {
    const comunidadeId = req.usuario.comunidadeId;

    if (!comunidadeId) {
      return res.status(400).json({
        erro: "Usuário não possui comunidade vinculada",
      });
    }

    const registros = await RegistroMensal.findAll({
      where: {
        comunidadeId,
      },
      order: [
        ["ano", "DESC"],
        ["mes", "DESC"],
        ["data", "DESC"],
        ["id", "DESC"],
      ],
    });

    res.json(registros);
  } catch (error) {
    console.error(
      "Erro ao listar registros mensais:",
      error
    );

    res.status(500).json({
      erro: "Erro ao listar registros mensais",
    });
  }
};

// ========================================
// BUSCAR REGISTRO POR ID
// ========================================

export const buscarRegistroPorId = async (req, res) => {
  try {
    const { id } = req.params;
    const comunidadeId = req.usuario.comunidadeId;

    if (!comunidadeId) {
      return res.status(400).json({
        erro: "Usuário não possui comunidade vinculada",
      });
    }

    const registro = await RegistroMensal.findOne({
      where: {
        id,
        comunidadeId,
      },
    });

    if (!registro) {
      return res.status(404).json({
        erro: "Registro mensal não encontrado nesta comunidade",
      });
    }

    res.json(registro);
  } catch (error) {
    console.error(
      "Erro ao buscar registro mensal:",
      error
    );

    res.status(500).json({
      erro: "Erro ao buscar registro mensal",
    });
  }
};

// ========================================
// CRIAR REGISTRO
// ========================================

export const criarRegistro = async (req, res) => {
  try {
    const comunidadeId = req.usuario.comunidadeId;

    if (!comunidadeId) {
      return res.status(400).json({
        erro: "Usuário não possui comunidade vinculada",
      });
    }

    const {
      comunidade,
      data,
      equipe_comunidade,
      conferido_em,
      responsavel_paroquia,
    } = req.body;

    const novoRegistro = await RegistroMensal.create({
      comunidade,
      comunidadeId,
      data: data || null,
      equipe_comunidade:
        equipe_comunidade || null,
      conferido_em:
        conferido_em || null,
      responsavel_paroquia:
        responsavel_paroquia || null,
    });

    res.status(201).json(novoRegistro);
  } catch (error) {
    console.error(
      "Erro ao criar registro mensal:",
      error
    );

    res.status(500).json({
      erro: "Erro ao criar registro mensal",
    });
  }
};

// ========================================
// ATUALIZAR REGISTRO
// ========================================

export const atualizarRegistro = async (req, res) => {
  try {
    const { id } = req.params;
    const comunidadeId = req.usuario.comunidadeId;

    if (!comunidadeId) {
      return res.status(400).json({
        erro: "Usuário não possui comunidade vinculada",
      });
    }

    const {
      comunidade,
      data,
      equipe_comunidade,
      conferido_em,
      responsavel_paroquia,
    } = req.body;

    const registro = await RegistroMensal.findOne({
      where: {
        id,
        comunidadeId,
      },
    });

    if (!registro) {
      return res.status(404).json({
        erro: "Registro mensal não encontrado nesta comunidade",
      });
    }

    await registro.update({
      comunidade,
      data: data || null,
      equipe_comunidade:
        equipe_comunidade || null,
      conferido_em:
        conferido_em || null,
      responsavel_paroquia:
        responsavel_paroquia || null,
    });

    res.json(registro);
  } catch (error) {
    console.error(
      "Erro ao atualizar registro mensal:",
      error
    );

    res.status(500).json({
      erro: "Erro ao atualizar registro mensal",
    });
  }
};

// ========================================
// REMOVER REGISTRO
// ========================================

export const removerRegistro = async (req, res) => {
  try {
    const { id } = req.params;
    const comunidadeId = req.usuario.comunidadeId;

    if (!comunidadeId) {
      return res.status(400).json({
        erro: "Usuário não possui comunidade vinculada",
      });
    }

    const registro = await RegistroMensal.findOne({
      where: {
        id,
        comunidadeId,
      },
    });

    if (!registro) {
      return res.status(404).json({
        erro: "Registro mensal não encontrado nesta comunidade",
      });
    }

    await registro.destroy();

    res.json({
      mensagem: "Registro mensal removido com sucesso",
    });
  } catch (error) {
    console.error(
      "Erro ao remover registro mensal:",
      error
    );

    res.status(500).json({
      erro: "Erro ao remover registro mensal",
    });
  }
};

// ========================================
// LISTAR HISTÓRICO MENSAL
// ========================================

export const listarHistoricoMensal = async (req, res) => {
  try {
    const comunidadeId = req.usuario.comunidadeId;

    if (!comunidadeId) {
      return res.status(400).json({
        erro: "Usuário não possui comunidade vinculada",
      });
    }

    const historico = await RegistroMensal.findAll({
      where: {
        comunidadeId,
      },
      attributes: [
        "id",
        "comunidade",
        "comunidadeId",
        "data",
        "mes",
        "ano",
        "total",
        "createdAt",
      ],
      order: [
        ["ano", "DESC"],
        ["mes", "DESC"],
        ["id", "DESC"],
      ],
    });

    const fechamentos = historico.filter(
      (registro) =>
        registro.mes !== null &&
        registro.ano !== null
    );

    return res.json(fechamentos);
  } catch (error) {
    console.error(
      "Erro ao listar histórico mensal:",
      error
    );

    return res.status(500).json({
      erro: "Erro ao listar histórico mensal",
    });
  }
};
// ========================================
// DETALHAR HISTÓRICO MENSAL
// ========================================

export const detalharHistoricoMensal = async (req, res) => {
  try {
    const { id } = req.params;

    const comunidadeId =
      req.usuario.comunidadeId;

    if (!comunidadeId) {
      return res.status(400).json({
        erro: "Usuário não possui comunidade vinculada",
      });
    }

    const registro =
      await RegistroMensal.findOne({
        where: {
          id,
          comunidadeId,
        },
      });

    if (!registro) {
      return res.status(404).json({
        erro: "Fechamento mensal não encontrado nesta comunidade",
      });
    }

    if (
      registro.mes === null ||
      registro.ano === null
    ) {
      return res.status(404).json({
        erro: "Este registro não corresponde a um fechamento mensal",
      });
    }

    const itens =
      await RegistroMensalItem.findAll({
        where: {
          registroMensalId: registro.id,
          comunidadeId,
        },

        attributes: [
          "id",
          "dizimistaId",
          "numero",
          "folha",
          "nome",
          "valor",
        ],

        order: [
          ["folha", "ASC"],
          ["numero", "ASC"],
        ],
      });

    return res.json({
      fechamento: {
        id: registro.id,
        comunidade: registro.comunidade,
        comunidadeId: registro.comunidadeId,
        data: registro.data,
        mes: registro.mes,
        ano: registro.ano,
        total: registro.total,
        equipe_comunidade:
          registro.equipe_comunidade,
        conferido_em:
          registro.conferido_em,
        responsavel_paroquia:
          registro.responsavel_paroquia,
        createdAt: registro.createdAt,
      },

      itens,
    });
  } catch (error) {
    console.error(
      "Erro ao detalhar histórico mensal:",
      error
    );

    return res.status(500).json({
      erro: "Erro ao detalhar histórico mensal",
    });
  }
};

// ========================================
// FECHAR MÊS E INICIAR NOVA CONTAGEM
// ========================================

export const fecharMes = async (req, res) => {
  const transaction =
    await sequelize.transaction();

  try {
    const comunidadeId =
      req.usuario.comunidadeId;

    if (!comunidadeId) {
      await transaction.rollback();

      return res.status(400).json({
        erro: "Usuário não possui comunidade vinculada",
      });
    }

    const {
      mes,
      ano,
      equipe_comunidade,
      conferido_em,
      responsavel_paroquia,
    } = req.body;

    const mesNumero = Number(mes);
    const anoNumero = Number(ano);

    if (
      !Number.isInteger(mesNumero) ||
      mesNumero < 1 ||
      mesNumero > 12
    ) {
      await transaction.rollback();

      return res.status(400).json({
        erro: "Mês inválido",
      });
    }

    if (
      !Number.isInteger(anoNumero) ||
      anoNumero < 2000 ||
      anoNumero > 2100
    ) {
      await transaction.rollback();

      return res.status(400).json({
        erro: "Ano inválido",
      });
    }

    const comunidade =
      await Comunidade.findOne({
        where: {
          id: comunidadeId,
        },
        transaction,
      });

    if (!comunidade) {
      await transaction.rollback();

      return res.status(404).json({
        erro: "Comunidade não encontrada",
      });
    }

    const fechamentoExistente =
      await RegistroMensal.findOne({
        where: {
          comunidadeId,
          mes: mesNumero,
          ano: anoNumero,
        },
        transaction,
      });

    if (fechamentoExistente) {
      await transaction.rollback();

      return res.status(409).json({
        erro:
          "Já existe um fechamento para este mês e ano",
      });
    }

    const dizimistas =
      await Dizimista.findAll({
        where: {
          comunidadeId,
        },
        order: [["numero", "ASC"]],
        transaction,
        lock: transaction.LOCK.UPDATE,
      });

    if (dizimistas.length === 0) {
      await transaction.rollback();

      return res.status(400).json({
        erro:
          "Não existem dizimistas cadastrados nesta comunidade",
      });
    }

    const total = dizimistas.reduce(
      (soma, dizimista) => {
        const valor =
          Number(dizimista.valor) || 0;

        return soma + valor;
      },
      0
    );

    const totalArredondado =
      Math.round(
        (total + Number.EPSILON) * 100
      ) / 100;

    const mesFormatado = String(
      mesNumero
    ).padStart(2, "0");

    const dataRegistro =
      `${anoNumero}-${mesFormatado}-01`;

    const novoRegistro =
      await RegistroMensal.create(
        {
          comunidade: comunidade.nome,
          comunidadeId,
          data: dataRegistro,
          mes: mesNumero,
          ano: anoNumero,
          total: totalArredondado,
          equipe_comunidade:
            equipe_comunidade || null,
          conferido_em:
            conferido_em || null,
          responsavel_paroquia:
            responsavel_paroquia || null,
        },
        {
          transaction,
        }
      );

    const itensHistorico =
      dizimistas.map((dizimista) => ({
        registroMensalId:
          novoRegistro.id,
        comunidadeId,
        dizimistaId:
          dizimista.id,
        numero:
          dizimista.numero,
        folha:
          dizimista.folha,
        nome:
          dizimista.nome,
        valor:
          Number(dizimista.valor) || 0,
      }));

    await RegistroMensalItem.bulkCreate(
      itensHistorico,
      {
        transaction,
      }
    );

    await Dizimista.update(
      {
        valor: 0,
      },
      {
        where: {
          comunidadeId,
        },
        transaction,
      }
    );

    await transaction.commit();

    return res.status(201).json({
      mensagem:
        "Mês fechado com sucesso. Os valores foram salvos no histórico e a nova contagem foi iniciada.",

      fechamento: {
        id: novoRegistro.id,
        comunidade:
          comunidade.nome,
        comunidadeId,
        mes: mesNumero,
        ano: anoNumero,
        total:
          totalArredondado,
        quantidadeDizimistas:
          dizimistas.length,
      },
    });
  } catch (error) {
    try {
      await transaction.rollback();
    } catch (rollbackError) {
      console.error(
        "Erro ao desfazer transação:",
        rollbackError
      );
    }

    console.error(
      "Erro ao fechar mês:",
      error
    );

    return res.status(500).json({
      erro:
        "Erro ao fechar o mês. Nenhum valor foi alterado.",
    });
  }
};
