import Comunidade from "../models/Comunidade.js";
import Usuario from "../models/Usuario.js";
import Dizimista from "../models/Dizimista.js";

// ========================================
// LISTAR TODAS AS COMUNIDADES
// ========================================

export const listarComunidades = async (req, res) => {
  try {
    const comunidades = await Comunidade.findAll({
      order: [["nome", "ASC"]],
    });

    const resultado = await Promise.all(
      comunidades.map(async (comunidade) => {
        const totalUsuarios = await Usuario.count({
          where: {
            comunidadeId: comunidade.id,
          },
        });

        const totalDizimistas = await Dizimista.count({
          where: {
            comunidadeId: comunidade.id,
          },
        });

        return {
          id: comunidade.id,
          nome: comunidade.nome,
          paroquia: comunidade.paroquia,
          cidade: comunidade.cidade,
          ativa: comunidade.ativa,
          totalUsuarios,
          totalDizimistas,
          createdAt: comunidade.createdAt,
        };
      })
    );

    return res.json(resultado);
  } catch (error) {
    console.error(
      "Erro ao listar comunidades:",
      error
    );

    return res.status(500).json({
      erro: "Erro ao listar comunidades",
    });
  }
};

// ========================================
// LISTAR TODOS OS USUÁRIOS
// ========================================

export const listarUsuarios = async (req, res) => {
  try {
    const usuarios = await Usuario.findAll({
      attributes: [
        "id",
        "nome",
        "email",
        "perfil",
        "comunidadeId",
        "ativo",
        "createdAt",
      ],

      order: [["nome", "ASC"]],
    });

    const resultado = await Promise.all(
      usuarios.map(async (usuario) => {
        const comunidade = await Comunidade.findByPk(
          usuario.comunidadeId
        );

        return {
          id: usuario.id,
          nome: usuario.nome,
          email: usuario.email,
          perfil: usuario.perfil,
          comunidadeId: usuario.comunidadeId,
          comunidadeNome: comunidade
            ? comunidade.nome
            : null,
          ativo: usuario.ativo,
          createdAt: usuario.createdAt,
        };
      })
    );

    return res.json(resultado);
  } catch (error) {
    console.error(
      "Erro ao listar usuários:",
      error
    );

    return res.status(500).json({
      erro: "Erro ao listar usuários",
    });
  }
};