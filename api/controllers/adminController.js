import bcrypt from "bcrypt";
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
// DETALHAR UMA COMUNIDADE
// ========================================

export const detalharComunidade = async (
  req,
  res
) => {
  try {
    const { id } = req.params;

    const comunidadeId = Number(id);

    if (
      !Number.isInteger(comunidadeId) ||
      comunidadeId <= 0
    ) {
      return res.status(400).json({
        erro: "ID da comunidade inválido.",
      });
    }

    const comunidade =
      await Comunidade.findByPk(comunidadeId);

    if (!comunidade) {
      return res.status(404).json({
        erro: "Comunidade não encontrada.",
      });
    }

    const usuarios = await Usuario.findAll({
      where: {
        comunidadeId,
      },
      attributes: [
        "id",
        "nome",
        "email",
        "perfil",
        "ativo",
        "licencaStatus",
        "createdAt",
      ],
      order: [["nome", "ASC"]],
    });

    const totalDizimistas =
      await Dizimista.count({
        where: {
          comunidadeId,
        },
      });

    return res.status(200).json({
      comunidade: {
        id: comunidade.id,
        nome: comunidade.nome,
        paroquia: comunidade.paroquia,
        cidade: comunidade.cidade,
        ativa: comunidade.ativa,
        createdAt: comunidade.createdAt,
      },

      totalUsuarios: usuarios.length,
      totalDizimistas,

      usuarios: usuarios.map((usuario) => ({
        id: usuario.id,
        nome: usuario.nome,
        email: usuario.email,
        perfil: usuario.perfil,
        ativo: usuario.ativo,
        licencaStatus: usuario.licencaStatus,
        createdAt: usuario.createdAt,
      })),
    });
  } catch (error) {
    console.error(
      "Erro ao detalhar comunidade:",
      error
    );

    return res.status(500).json({
      erro:
        "Erro ao carregar os detalhes da comunidade.",
    });
  }
};

// ========================================
// ALTERAR STATUS DA COMUNIDADE
// ========================================

export const alterarStatusComunidade = async (
  req,
  res
) => {
  try {
    const { id } = req.params;
    const { ativa } = req.body;

    if (typeof ativa !== "boolean") {
      return res.status(400).json({
        erro:
          "O campo 'ativa' deve ser true ou false.",
      });
    }

    const comunidade = await Comunidade.findByPk(id);

    if (!comunidade) {
      return res.status(404).json({
        erro: "Comunidade não encontrada.",
      });
    }

    // Impede o SUPER_ADMIN de alterar o status
    // da própria comunidade.
    if (
      Number(comunidade.id) ===
      Number(req.usuario.comunidadeId)
    ) {
      return res.status(403).json({
        erro:
          "Você não pode alterar o status da sua própria comunidade.",
      });
    }

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
// CADASTRAR NOVO USUÁRIO PELO SUPER ADMIN
// ========================================

export const cadastrarUsuarioAdmin = async (
  req,
  res
) => {
  try {
    const {
      nome,
      email,
      senha,
      licencaStatus = "ATIVA",
    } = req.body;

    const nomeLimpo = nome?.trim();

    const emailLimpo = email
      ?.trim()
      .toLowerCase();

    if (!nomeLimpo || !emailLimpo || !senha) {
      return res.status(400).json({
        erro:
          "Nome, e-mail e senha são obrigatórios.",
      });
    }

    if (nomeLimpo.length < 3) {
      return res.status(400).json({
        erro:
          "O nome deve ter pelo menos 3 caracteres.",
      });
    }

    const emailValido =
      /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(
        emailLimpo
      );

    if (!emailValido) {
      return res.status(400).json({
        erro: "Digite um e-mail válido.",
      });
    }

    if (senha.length < 6) {
      return res.status(400).json({
        erro:
          "A senha deve ter pelo menos 6 caracteres.",
      });
    }

    const statusPermitidos = [
      "ATIVA",
      "BLOQUEADA",
    ];

    if (
      !statusPermitidos.includes(licencaStatus)
    ) {
      return res.status(400).json({
        erro: "Status de licença inválido.",
      });
    }

    const usuarioExistente =
      await Usuario.findOne({
        where: {
          email: emailLimpo,
        },
      });

    if (usuarioExistente) {
      return res.status(409).json({
        erro:
          "Já existe um usuário cadastrado com este e-mail.",
      });
    }

    const senhaHash = await bcrypt.hash(
      senha,
      10
    );

    const novoUsuario = await Usuario.create({
      nome: nomeLimpo,
      email: emailLimpo,
      senha: senhaHash,

      // O SUPER_ADMIN do sistema não é criado
      // através deste formulário.
      perfil: "ADMIN_COMUNIDADE",

      // O comprador nasce sem comunidade.
      // Ele criará a própria comunidade depois.
      comunidadeId: null,

      ativo: true,
      licencaStatus,
    });

    return res.status(201).json({
      mensagem:
        "Usuário cadastrado com sucesso.",

      usuario: {
        id: novoUsuario.id,
        nome: novoUsuario.nome,
        email: novoUsuario.email,
        perfil: novoUsuario.perfil,

        comunidadeId:
          novoUsuario.comunidadeId,

        comunidadeNome: null,

        ativo: novoUsuario.ativo,

        licencaStatus:
          novoUsuario.licencaStatus,

        createdAt: novoUsuario.createdAt,
      },
    });
  } catch (error) {
    console.error(
      "Erro ao cadastrar usuário:",
      error
    );

    return res.status(500).json({
      erro: "Erro ao cadastrar usuário.",
    });
  }
};

// ========================================
// EDITAR DADOS DO USUÁRIO PELO SUPER ADMIN
// ========================================

export const editarUsuarioAdmin = async (
  req,
  res
) => {
  try {
    const { id } = req.params;
    const { nome, email } = req.body;

    const nomeLimpo = nome?.trim();

    const emailLimpo = email
      ?.trim()
      .toLowerCase();

    if (!nomeLimpo || !emailLimpo) {
      return res.status(400).json({
        erro:
          "Nome e e-mail são obrigatórios.",
      });
    }

    if (nomeLimpo.length < 3) {
      return res.status(400).json({
        erro:
          "O nome deve ter pelo menos 3 caracteres.",
      });
    }

    const emailValido =
      /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(
        emailLimpo
      );

    if (!emailValido) {
      return res.status(400).json({
        erro: "Digite um e-mail válido.",
      });
    }

    const usuario = await Usuario.findByPk(id);

    if (!usuario) {
      return res.status(404).json({
        erro: "Usuário não encontrado.",
      });
    }

    // ========================================
    // PROTEÇÃO DO SUPER_ADMIN
    // ========================================

    if (usuario.perfil === "SUPER_ADMIN") {
      return res.status(403).json({
        erro:
          "O usuário SUPER_ADMIN é protegido e não pode ser editado.",
      });
    }

    const usuarioComMesmoEmail =
      await Usuario.findOne({
        where: {
          email: emailLimpo,
        },
      });

    if (
      usuarioComMesmoEmail &&
      Number(usuarioComMesmoEmail.id) !==
        Number(usuario.id)
    ) {
      return res.status(409).json({
        erro:
          "Já existe outro usuário cadastrado com este e-mail.",
      });
    }

    usuario.nome = nomeLimpo;
    usuario.email = emailLimpo;

    await usuario.save();

    const comunidade = usuario.comunidadeId
      ? await Comunidade.findByPk(
          usuario.comunidadeId
        )
      : null;

    return res.status(200).json({
      mensagem:
        "Usuário atualizado com sucesso.",

      usuario: {
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
      },
    });
  } catch (error) {
    console.error(
      "Erro ao editar usuário:",
      error
    );

    return res.status(500).json({
      erro: "Erro ao editar usuário.",
    });
  }
};

// ========================================
// REDEFINIR SENHA DO USUÁRIO PELO SUPER ADMIN
// ========================================

export const redefinirSenhaUsuarioAdmin = async (
  req,
  res
) => {
  try {
    const { id } = req.params;
    const { novaSenha } = req.body;

    if (!novaSenha) {
      return res.status(400).json({
        erro: "A nova senha é obrigatória.",
      });
    }

    if (novaSenha.length < 6) {
      return res.status(400).json({
        erro:
          "A nova senha deve ter pelo menos 6 caracteres.",
      });
    }

    const usuario = await Usuario.findByPk(id);

    if (!usuario) {
      return res.status(404).json({
        erro: "Usuário não encontrado.",
      });
    }

    // ========================================
    // PROTEÇÃO DO SUPER_ADMIN
    // ========================================

    if (usuario.perfil === "SUPER_ADMIN") {
      return res.status(403).json({
        erro:
          "A senha do usuário SUPER_ADMIN não pode ser redefinida por esta rota.",
      });
    }

    const senhaHash = await bcrypt.hash(
      novaSenha,
      10
    );

    usuario.senha = senhaHash;

    await usuario.save();

    return res.status(200).json({
      mensagem:
        "Senha do usuário redefinida com sucesso.",

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
      "Erro ao redefinir senha do usuário:",
      error
    );

    return res.status(500).json({
      erro:
        "Erro ao redefinir a senha do usuário.",
    });
  }
};

// ========================================
// EXCLUIR USUÁRIO SEM COMUNIDADE
// ========================================

export const excluirUsuarioAdmin = async (
  req,
  res
) => {
  try {
    const { id } = req.params;

    const usuario = await Usuario.findByPk(id);

    if (!usuario) {
      return res.status(404).json({
        erro: "Usuário não encontrado.",
      });
    }

    // ========================================
    // PROTEÇÃO DO SUPER_ADMIN
    // ========================================

    if (usuario.perfil === "SUPER_ADMIN") {
      return res.status(403).json({
        erro:
          "O usuário SUPER_ADMIN é protegido e não pode ser excluído.",
      });
    }

    // Protege a própria conta do usuário autenticado.
    if (
      Number(usuario.id) ===
      Number(req.usuario.usuarioId)
    ) {
      return res.status(403).json({
        erro:
          "Você não pode excluir o próprio usuário.",
      });
    }

    // Nesta etapa somente usuários ainda sem
    // comunidade podem ser excluídos definitivamente.
    if (usuario.comunidadeId !== null) {
      return res.status(409).json({
        erro:
          "Este usuário está vinculado a uma comunidade. Desative o usuário em vez de excluí-lo.",
      });
    }

    const usuarioExcluido = {
      id: usuario.id,
      nome: usuario.nome,
      email: usuario.email,
    };

    await usuario.destroy();

    return res.status(200).json({
      mensagem:
        "Usuário excluído com sucesso.",

      usuario: usuarioExcluido,
    });
  } catch (error) {
    console.error(
      "Erro ao excluir usuário:",
      error
    );

    return res.status(500).json({
      erro: "Erro ao excluir usuário.",
    });
  }
};

// ========================================
// ALTERAR STATUS DO USUÁRIO
// ========================================

export const alterarStatusUsuario = async (
  req,
  res
) => {
  try {
    const { id } = req.params;
    const { ativo } = req.body;

    if (typeof ativo !== "boolean") {
      return res.status(400).json({
        erro:
          "O campo 'ativo' deve ser true ou false.",
      });
    }

    const usuario = await Usuario.findByPk(id);

    if (!usuario) {
      return res.status(404).json({
        erro: "Usuário não encontrado.",
      });
    }

    // ========================================
    // PROTEÇÃO DO SUPER_ADMIN
    // ========================================

    if (usuario.perfil === "SUPER_ADMIN") {
      return res.status(403).json({
        erro:
          "O usuário SUPER_ADMIN é protegido e não pode ter seu status alterado.",
      });
    }

    // Proteção adicional contra alteração
    // do próprio usuário autenticado.
    if (
      Number(usuario.id) ===
      Number(req.usuario.usuarioId)
    ) {
      return res.status(403).json({
        erro:
          "Você não pode alterar o status do próprio usuário.",
      });
    }

    usuario.ativo = ativo;

    await usuario.save();

    return res.status(200).json({
      mensagem:
        "Status do usuário atualizado com sucesso.",

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
      "Erro ao alterar status do usuário:",
      error
    );

    return res.status(500).json({
      erro:
        "Erro ao alterar status do usuário.",
    });
  }
};

// ========================================
// ALTERAR STATUS DA LICENÇA
// ========================================

export const alterarLicencaUsuario = async (
  req,
  res
) => {
  try {
    const { id } = req.params;
    const { licencaStatus } = req.body;

    const statusPermitidos = [
      "ATIVA",
      "BLOQUEADA",
    ];

    if (
      !statusPermitidos.includes(licencaStatus)
    ) {
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

    // ========================================
    // PROTEÇÃO DO SUPER_ADMIN
    // ========================================

    if (usuario.perfil === "SUPER_ADMIN") {
      return res.status(403).json({
        erro:
          "A licença do usuário SUPER_ADMIN é protegida e não pode ser alterada.",
      });
    }

    // Proteção adicional contra alteração
    // da própria licença.
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

export const resumoDashboard = async (
  req,
  res
) => {
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