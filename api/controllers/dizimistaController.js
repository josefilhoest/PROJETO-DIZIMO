import Dizimista from "../models/Dizimista.js";


// ========================================
// LISTAR DIZIMISTAS DE UMA COMUNIDADE
// ========================================

export const listarDizimistas = async (req, res) => {
  try {
    const { comunidadeId } = req.query;

    if (!comunidadeId) {
      return res.status(400).json({
        erro: "comunidadeId é obrigatório",
      });
    }

    const dizimistas = await Dizimista.findAll({
      where: {
        comunidadeId,
      },

      order: [["numero", "ASC"]],
    });

    res.json(dizimistas);

  } catch (error) {
    console.error(error);

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

    const {
      numero,
      folha,
      nome,
      valor,
      comunidadeId,
    } = req.body;


    if (!comunidadeId) {
      return res.status(400).json({
        erro: "comunidadeId é obrigatório",
      });
    }


    const novoDizimista = await Dizimista.create({
      numero,
      folha,
      nome,
      valor,
      comunidadeId,
    });


    res.status(201).json(novoDizimista);

  } catch (error) {

    console.error(error);


    // número repetido dentro da mesma comunidade
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

    const { id } = req.params;

    const {
      numero,
      folha,
      nome,
      valor,
      comunidadeId,
    } = req.body;


    if (!comunidadeId) {
      return res.status(400).json({
        erro: "comunidadeId é obrigatório",
      });
    }


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

    console.error(error);


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

    const { id } = req.params;

    const { comunidadeId } = req.query;


    if (!comunidadeId) {

      return res.status(400).json({
        erro: "comunidadeId é obrigatório",
      });

    }


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

    console.error(error);

    res.status(500).json({
      erro: "Erro ao remover dizimista",
    });

  }
};