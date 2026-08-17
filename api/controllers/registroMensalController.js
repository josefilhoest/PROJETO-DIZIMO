import RegistroMensal from "../models/RegistroMensal.js";


// ========================================
// LISTAR REGISTROS DE UMA COMUNIDADE
// ========================================

export const listarRegistros = async (req, res) => {
  try {
    const { comunidadeId } = req.query;

    if (!comunidadeId) {
      return res.status(400).json({
        erro: "comunidadeId é obrigatório",
      });
    }

    const registros = await RegistroMensal.findAll({
      where: {
        comunidadeId,
      },

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


// ========================================
// BUSCAR REGISTRO POR ID
// ========================================

export const buscarRegistroPorId = async (req, res) => {
  try {
    const { id } = req.params;
    const { comunidadeId } = req.query;

    if (!comunidadeId) {
      return res.status(400).json({
        erro: "comunidadeId é obrigatório",
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
    console.error(error);

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
    const {
      comunidade,
      comunidadeId,
      data,
      equipe_comunidade,
      conferido_em,
      responsavel_paroquia,
    } = req.body;

    if (!comunidadeId) {
      return res.status(400).json({
        erro: "comunidadeId é obrigatório",
      });
    }

    const novoRegistro = await RegistroMensal.create({
      comunidade,
      comunidadeId,
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


// ========================================
// ATUALIZAR REGISTRO
// ========================================

export const atualizarRegistro = async (req, res) => {
  try {
    const { id } = req.params;

    const {
      comunidade,
      comunidadeId,
      data,
      equipe_comunidade,
      conferido_em,
      responsavel_paroquia,
    } = req.body;

    if (!comunidadeId) {
      return res.status(400).json({
        erro: "comunidadeId é obrigatório",
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


// ========================================
// REMOVER REGISTRO
// ========================================

export const removerRegistro = async (req, res) => {
  try {
    const { id } = req.params;
    const { comunidadeId } = req.query;

    if (!comunidadeId) {
      return res.status(400).json({
        erro: "comunidadeId é obrigatório",
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
    console.error(error);

    res.status(500).json({
      erro: "Erro ao remover registro mensal",
    });
  }
};