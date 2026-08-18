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

    if (error.name === "SequelizeUniqueConstraintError") {
      return res.status(409).json({
        erro: "Já existe um dizimista com esse número nesta comunidade",
      });
    }

    res.status(500).json({
      erro: "Erro ao cadastrar dizimista",
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
        erro: "Dizimista não encontrado nesta comunidade",
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
    console.error("Erro ao atualizar dizimista:", error);

    if (error.name === "SequelizeUniqueConstraintError") {
      return res.status(409).json({
        erro: "Já existe um dizimista com esse número nesta comunidade",
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
        erro: "Dizimista não encontrado nesta comunidade",
      });
    }

    await dizimista.destroy();

    res.json({
      mensagem: "Dizimista removido com sucesso",
    });
  } catch (error) {
    console.error("Erro ao remover dizimista:", error);

    res.status(500).json({
      erro: "Erro ao remover dizimista",
    });
  }
};