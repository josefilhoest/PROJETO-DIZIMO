import Dizimista from "../models/Dizimista.js";

export const listarDizimistas = async (req, res) => {
  try {
    const dizimistas = await Dizimista.findAll({
      order: [["numero", "ASC"]],
    });

    res.json(dizimistas);
  } catch (error) {
    res.status(500).json({
      erro: "Erro ao listar dizimistas",
    });
  }
};

export const criarDizimista = async (req, res) => {
  try {
    const { numero, folha, nome, valor } = req.body;

    const novoDizimista = await Dizimista.create({
      numero,
      folha,
      nome,
      valor,
    });

    res.status(201).json(novoDizimista);
  } catch (error) {
    console.error(error);

    res.status(500).json({
      erro: "Erro ao cadastrar dizimista",
    });
  }
};

export const atualizarDizimista = async (req, res) => {
  try {
    const { id } = req.params;

    const { numero, folha, nome, valor } = req.body;

    const dizimista = await Dizimista.findByPk(id);

    if (!dizimista) {
      return res.status(404).json({
        erro: "Dizimista não encontrado",
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

    res.status(500).json({
      erro: "Erro ao atualizar dizimista",
    });
  }
};

export const removerDizimista = async (req, res) => {
  try {
    const { id } = req.params;

    const dizimista = await Dizimista.findByPk(id);

    if (!dizimista) {
      return res.status(404).json({
        erro: "Dizimista não encontrado",
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