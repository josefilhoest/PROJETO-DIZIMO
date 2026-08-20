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
// ALTERAR STATUS DA COMUNIDADE
// ========================================

export const alterarStatusComunidade = async (req, res) => {
  try {
    const { id } = req.params;
    const { ativa } = req.body;

    // ----------------------------------------
    // VALIDAR CAMPO RECEBIDO
    // ----------------------------------------

    if (typeof ativa !== "boolean") {
      return res.status(400).json({
        erro:
          "O campo 'ativa' deve ser true ou false.",
      });
    }

    // ----------------------------------------
    // BUSCAR COMUNIDADE
    // ----------------------------------------

    const comunidade = await Comunidade.findByPk(id);

    if (!comunidade) {
      return res.status(404).json({
        erro: "Comunidade não encontrada.",
      });
    }

    // ----------------------------------------
    // PROTEGER A COMUNIDADE DO SUPER_ADMIN
    // ----------------------------------------

    if (
      Number(comunidade.id) ===
      Number(req.usuario.comunidadeId)
    ) {
      return res.status(403).json({
        erro:
          "Você não pode alterar o status da sua própria comunidade.",
      });
    }

    // ----------------------------------------
    // ALTERAR STATUS
    // ----------------------------------------

    comunidade.ativa = ativa;

    await comunidade.save();

    return res.status(200).json({
      mensagem:
        "Status da comunidade atualizado com sucesso.",

      comunidade: {
        id: comunidade.id,
        nome: comunidade.nome,
        paroquia: comunidade.paroquia,
        cidade: comunidade.cidade,
        ativa: comunidade.ativa,
      },
    });
  } catch (error) {
    console.error(
      "Erro ao alterar status da comunidade:",
      error
    );

    return res.status(500).json({
      erro:
        "Erro ao alterar status da comunidade.",
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
        "licencaStatus",
        "createdAt",
      ],

      order: [["nome", "ASC"]],
    });

    const resultado = await Promise.all(
      usuarios.map(async (usuario) => {
        const comunidade = usuario.comunidadeId
          ? await Comunidade.findByPk(
              usuario.comunidadeId
            )
          : null;

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
          licencaStatus: usuario.licencaStatus,
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

// ========================================
// ALTERAR STATUS DA LICENÇA
// ========================================

export const alterarLicencaUsuario = async (req, res) => {
  try {
    const { id } = req.params;
    const { licencaStatus } = req.body;

    const statusPermitidos = [
      "ATIVA",
      "BLOQUEADA",
    ];

    if (!statusPermitidos.includes(licencaStatus)) {
      return res.status(400).json({
        erro: "Status de licença inválido.",
      });
    }

    const usuario = await Usuario.findByPk(id);

    if (!usuario) {
      return res.status(404).json({
        erro: "Usuário não encontrado.",
      });
    }

    if (
      Number(usuario.id) ===
      Number(req.usuario.usuarioId)
    ) {
      return res.status(403).json({
        erro:
          "Você não pode alterar a própria licença.",
      });
    }

    usuario.licencaStatus = licencaStatus;

    await usuario.save();

    return res.status(200).json({
      mensagem:
        "Status da licença atualizado com sucesso.",

      usuario: {
        id: usuario.id,
        nome: usuario.nome,
        email: usuario.email,
        perfil: usuario.perfil,
        comunidadeId: usuario.comunidadeId,
        ativo: usuario.ativo,
        licencaStatus: usuario.licencaStatus,
      },
    });
  } catch (error) {
    console.error(
      "Erro ao alterar licença do usuário:",
      error
    );

    return res.status(500).json({
      erro:
        "Erro ao alterar status da licença.",
    });
  }
};

// ========================================
// RESUMO DO DASHBOARD SUPER ADMIN
// ========================================

export const resumoDashboard = async (req, res) => {
  try {
    const totalComunidades =
      await Comunidade.count();

    const comunidadesAtivas =
      await Comunidade.count({
        where: {
          ativa: true,
        },
      });

    const totalUsuarios =
      await Usuario.count();

    const usuariosAtivos =
      await Usuario.count({
        where: {
          ativo: true,
        },
      });

    const totalDizimistas =
      await Dizimista.count();

    return res.status(200).json({
      totalComunidades,
      comunidadesAtivas,
      totalUsuarios,
      usuariosAtivos,
      totalDizimistas,
    });
  } catch (error) {
    console.error(
      "Erro ao carregar dashboard:",
      error
    );

    return res.status(500).json({
      mensagem:
        "Erro ao carregar resumo do dashboard.",
      erro: error.message,
    });
  }
};