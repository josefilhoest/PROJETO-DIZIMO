import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

import sequelize from "../database/database.js";

import Usuario from "../models/Usuario.js";
import Comunidade from "../models/Comunidade.js";

// ========================================
// CADASTRAR USUÁRIO LICENCIADO
// SOMENTE O SUPER_ADMIN USA ESTA FUNÇÃO
// ========================================

export const cadastrarUsuario = async (req, res) => {
  try {
    const {
      nome,
      email,
      senha,
    } = req.body;

    // ========================================
    // VALIDAR CAMPOS OBRIGATÓRIOS
    // ========================================

    if (!nome || !email || !senha) {
      return res.status(400).json({
        erro: "Nome, email e senha são obrigatórios",
      });
    }

    // ========================================
    // VERIFICAR EMAIL DUPLICADO
    // ========================================

    const usuarioExistente = await Usuario.findOne({
      where: {
        email,
      },
    });

    if (usuarioExistente) {
      return res.status(409).json({
        erro: "Já existe um usuário cadastrado com este email",
      });
    }

    // ========================================
    // CRIPTOGRAFAR SENHA
    // ========================================

    const senhaCriptografada = await bcrypt.hash(
      senha,
      10
    );

    // ========================================
    // CRIAR USUÁRIO LICENCIADO
    // ========================================
    //
    // IMPORTANTE:
    // O usuário nasce sem comunidade.
    // Depois do primeiro login ele cadastra
    // a própria comunidade.
    //
    // Também não recebemos "perfil" do frontend.
    // Isso impede alguém de tentar criar
    // outro SUPER_ADMIN.
    // ========================================

    const novoUsuario = await Usuario.create({
      nome,
      email,
      senha: senhaCriptografada,

      perfil: "ADMIN_COMUNIDADE",

      comunidadeId: null,

      ativo: true,

      licencaStatus: "ATIVA",
    });

    return res.status(201).json({
      mensagem: "Usuário licenciado cadastrado com sucesso",

      usuario: {
        id: novoUsuario.id,
        nome: novoUsuario.nome,
        email: novoUsuario.email,
        perfil: novoUsuario.perfil,
        comunidadeId: novoUsuario.comunidadeId,
        ativo: novoUsuario.ativo,
        licencaStatus: novoUsuario.licencaStatus,
      },
    });
  } catch (error) {
    console.error(
      "Erro ao cadastrar usuário:",
      error
    );

    return res.status(500).json({
      erro: "Erro ao cadastrar usuário",
    });
  }
};

// ========================================
// CADASTRAR COMUNIDADE
// USUÁRIO LICENCIADO CADASTRA A PRÓPRIA
// ========================================

export const cadastrarComunidade = async (req, res) => {
  let transaction;

  try {
    // ========================================
    // IDENTIFICAR USUÁRIO PELO TOKEN
    // ========================================

    const usuarioId = req.usuario.usuarioId;

    if (!usuarioId) {
      return res.status(401).json({
        erro: "Usuário não identificado pelo token",
      });
    }

    const {
      nomeComunidade,
      paroquia,
      cidade,
    } = req.body;

    // ========================================
    // VALIDAR CAMPOS
    // ========================================

    if (!nomeComunidade) {
      return res.status(400).json({
        erro: "Nome da comunidade é obrigatório",
      });
    }

    // ========================================
    // BUSCAR USUÁRIO LOGADO
    // ========================================

    const usuario = await Usuario.findByPk(usuarioId);

    if (!usuario) {
      return res.status(404).json({
        erro: "Usuário não encontrado",
      });
    }

    // ========================================
    // VERIFICAR SE O USUÁRIO ESTÁ ATIVO
    // ========================================

    if (!usuario.ativo) {
      return res.status(403).json({
        erro: "Usuário desativado",
      });
    }

    // ========================================
    // VERIFICAR LICENÇA
    // ========================================

    if (usuario.licencaStatus !== "ATIVA") {
      return res.status(403).json({
        erro: "Licença de uso não está ativa",
      });
    }

    // ========================================
    // IMPEDIR MAIS DE UMA COMUNIDADE
    // ========================================

    if (usuario.comunidadeId) {
      return res.status(409).json({
        erro: "Este usuário já possui uma comunidade cadastrada",
      });
    }

    // ========================================
    // INICIAR TRANSAÇÃO
    // ========================================

    transaction = await sequelize.transaction();

    // ========================================
    // CRIAR COMUNIDADE
    // ========================================

    const novaComunidade = await Comunidade.create(
      {
        nome: nomeComunidade,
        paroquia: paroquia || null,
        cidade: cidade || null,
        ativa: true,
      },
      {
        transaction,
      }
    );

    // ========================================
    // VINCULAR A COMUNIDADE AO USUÁRIO
    // ========================================

    await usuario.update(
      {
        comunidadeId: novaComunidade.id,
      },
      {
        transaction,
      }
    );

    // ========================================
    // CONFIRMAR TRANSAÇÃO
    // ========================================

    await transaction.commit();

    return res.status(201).json({
      mensagem: "Comunidade cadastrada com sucesso",

      comunidade: {
        id: novaComunidade.id,
        nome: novaComunidade.nome,
        paroquia: novaComunidade.paroquia,
        cidade: novaComunidade.cidade,
        ativa: novaComunidade.ativa,
      },

      usuario: {
        id: usuario.id,
        nome: usuario.nome,
        email: usuario.email,
        perfil: usuario.perfil,
        comunidadeId: novaComunidade.id,
        ativo: usuario.ativo,
        licencaStatus: usuario.licencaStatus,
      },
    });
  } catch (error) {
    // ========================================
    // DESFAZER TRANSAÇÃO EM CASO DE ERRO
    // ========================================

    if (transaction && !transaction.finished) {
      await transaction.rollback();
    }

    console.error(
      "Erro ao cadastrar comunidade:",
      error
    );

    return res.status(500).json({
      erro: "Erro ao cadastrar comunidade",
    });
  }
};

// ========================================
// LOGIN
// ========================================

export const login = async (req, res) => {
  try {
    const {
      email,
      senha,
    } = req.body;

    // ========================================
    // VALIDAR CAMPOS
    // ========================================

    if (!email || !senha) {
      return res.status(400).json({
        erro: "Email e senha são obrigatórios",
      });
    }

    // ========================================
    // BUSCAR USUÁRIO
    // ========================================

    const usuario = await Usuario.findOne({
      where: {
        email,
      },
    });

    // Mesma mensagem para usuário inexistente
    // ou senha errada.
    if (!usuario) {
      return res.status(401).json({
        erro: "Email ou senha inválidos",
      });
    }

    // ========================================
    // VERIFICAR USUÁRIO ATIVO
    // ========================================

    if (!usuario.ativo) {
      return res.status(403).json({
        erro: "Usuário desativado",
      });
    }

    // ========================================
    // VERIFICAR LICENÇA
    // ========================================

    if (usuario.licencaStatus !== "ATIVA") {
      return res.status(403).json({
        erro: "Licença de uso bloqueada",
      });
    }

    // ========================================
    // VERIFICAR SENHA
    // ========================================

    const senhaCorreta = await bcrypt.compare(
      senha,
      usuario.senha
    );

    if (!senhaCorreta) {
      return res.status(401).json({
        erro: "Email ou senha inválidos",
      });
    }

    // ========================================
    // BUSCAR COMUNIDADE
    // ========================================
    //
    // Um novo cliente pode ainda não possuir
    // comunidade. Nesse caso o login continua
    // permitido para que ele possa cadastrá-la.
    // ========================================

    let comunidade = null;

    if (usuario.comunidadeId) {
      comunidade = await Comunidade.findByPk(
        usuario.comunidadeId
      );

      if (!comunidade) {
        return res.status(404).json({
          erro: "Comunidade vinculada ao usuário não encontrada",
        });
      }

      // ========================================
      // VERIFICAR COMUNIDADE ATIVA
      // ========================================

      if (!comunidade.ativa) {
        return res.status(403).json({
          erro: "Comunidade desativada",
        });
      }
    }

    // ========================================
    // GERAR TOKEN JWT
    // ========================================

    const token = jwt.sign(
      {
        usuarioId: usuario.id,
        comunidadeId: usuario.comunidadeId,
        perfil: usuario.perfil,
      },

      process.env.JWT_SECRET,

      {
        expiresIn: "8h",
      }
    );

    // ========================================
    // RESPOSTA DO LOGIN
    // ========================================

    return res.json({
      mensagem: "Login realizado com sucesso",

      token,

      usuario: {
        id: usuario.id,
        nome: usuario.nome,
        email: usuario.email,
        perfil: usuario.perfil,
        comunidadeId: usuario.comunidadeId,

        comunidadeNome:
          comunidade?.nome || null,

        possuiComunidade:
          Boolean(usuario.comunidadeId),

        ativo: usuario.ativo,

        licencaStatus:
          usuario.licencaStatus,
      },
    });
  } catch (error) {
    console.error(
      "Erro ao realizar login:",
      error
    );

    return res.status(500).json({
      erro: "Erro ao realizar login",
    });
  }
};