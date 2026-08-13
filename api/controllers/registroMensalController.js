import RegistroMensal from "../models/RegistroMensal.js";

export const listarRegistros = async (req, res) => {
  try {
    const registros = await RegistroMensal.findAll({
      order: [["data", "DESC"]],
    });

    res.json(registros);
  } catch (error) {
    console.error(error);

    res.status(500).json({
      erro: "Erro ao listar registros mensais",
    });
  }
};

export const buscarRegistroPorId = async (req, res) => {
  try {
    const { id } = req.params;

    const registro = await RegistroMensal.findByPk(id);

    if (!registro) {
      return res.status(404).json({
        erro: "Registro mensal não encontrado",
      });
    }

    res.json(registro);
  } catch (error) {
    console.error(error);

    res.status(500).json({
      erro: "Erro ao buscar registro mensal",
    });
  }
};

export const criarRegistro = async (req, res) => {
  try {
    const {
      comunidade,
      data,
      equipe_comunidade,
      conferido_em,
      responsavel_paroquia,
    } = req.body;

    const novoRegistro = await RegistroMensal.create({
      comunidade,
      data: data || null,
      equipe_comunidade,
      conferido_em: conferido_em || null,
      responsavel_paroquia,
    });

    res.status(201).json(novoRegistro);
  } catch (error) {
    console.error(error);

    res.status(500).json({
      erro: "Erro ao criar registro mensal",
    });
  }
};

export const atualizarRegistro = async (req, res) => {
  try {
    const { id } = req.params;

    const {
      comunidade,
      data,
      equipe_comunidade,
      conferido_em,
      responsavel_paroquia,
    } = req.body;

    const registro = await RegistroMensal.findByPk(id);

    if (!registro) {
      return res.status(404).json({
        erro: "Registro mensal não encontrado",
      });
    }

    await registro.update({
      comunidade,
      data: data || null,
      equipe_comunidade,
      conferido_em: conferido_em || null,
      responsavel_paroquia,
    });

    res.json(registro);
  } catch (error) {
    console.error(error);

    res.status(500).json({
      erro: "Erro ao atualizar registro mensal",
    });
  }
};

export const removerRegistro = async (req, res) => {
  try {
    const { id } = req.params;

    const registro = await RegistroMensal.findByPk(id);

    if (!registro) {
      return res.status(404).json({
        erro: "Registro mensal não encontrado",
      });
    }

    await registro.destroy();

    res.json({
      mensagem: "Registro mensal removido com sucesso",
    });
  } catch (error) {
    console.error(error);

    res.status(500).json({
      erro: "Erro ao remover registro mensal",
    });
  }
};