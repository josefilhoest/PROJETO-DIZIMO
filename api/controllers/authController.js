import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

import sequelize from "../database/database.js";
import Usuario from "../models/Usuario.js";
import Comunidade from "../models/Comunidade.js";

// ========================================
// CADASTRAR USUÁRIO
// ========================================

export const cadastrarUsuario = async (req, res) => {
  try {
    const {
      nome,
      email,
      senha,
      comunidadeId,
      perfil = "ADMIN_COMUNIDADE",
    } = req.body;

    if (!nome || !email || !senha || !comunidadeId) {
      return res.status(400).json({
        erro: "Nome, email, senha e comunidadeId são obrigatórios",
      });
    }

    // Confere se a comunidade existe
    const comunidade = await Comunidade.findByPk(comunidadeId);

    if (!comunidade) {
      return res.status(404).json({
        erro: "Comunidade não encontrada",
      });
    }

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

    const senhaCriptografada = await bcrypt.hash(senha, 10);

    const novoUsuario = await Usuario.create({
      nome,
      email,
      senha: senhaCriptografada,
      comunidadeId,
      perfil,
    });

    res.status(201).json({
      mensagem: "Usuário cadastrado com sucesso",

      usuario: {
        id: novoUsuario.id,
        nome: novoUsuario.nome,
        email: novoUsuario.email,
        perfil: novoUsuario.perfil,
        comunidadeId: novoUsuario.comunidadeId,
        comunidadeNome: comunidade.nome,
      },
    });
  } catch (error) {
    console.error("Erro ao cadastrar usuário:", error);

    res.status(500).json({
      erro: "Erro ao cadastrar usuário",
    });
  }
};

// ========================================
// CADASTRAR NOVA COMUNIDADE
// ========================================

export const cadastrarComunidade = async (req, res) => {
  const transaction = await sequelize.transaction();

  try {
    const {
      nomeComunidade,
      paroquia,
      cidade,
      nomeResponsavel,
      email,
      senha,
    } = req.body;

    // ========================================
    // VALIDAR CAMPOS OBRIGATÓRIOS
    // ========================================

    if (
      !nomeComunidade ||
      !nomeResponsavel ||
      !email ||
      !senha
    ) {
      await transaction.rollback();

      return res.status(400).json({
        erro: "Nome da comunidade, responsável, email e senha são obrigatórios",
      });
    }

    // ========================================
    // VERIFICAR EMAIL DUPLICADO
    // ========================================

    const usuarioExistente = await Usuario.findOne({
      where: {
        email,
      },
      transaction,
    });

    if (usuarioExistente) {
      await transaction.rollback();

      return res.status(409).json({
        erro: "Já existe um usuário cadastrado com este email",
      });
    }

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
    // CRIPTOGRAFAR SENHA
    // ========================================

    const senhaCriptografada = await bcrypt.hash(senha, 10);

    // ========================================
    // CRIAR ADMINISTRADOR DA COMUNIDADE
    // ========================================

    const novoUsuario = await Usuario.create(
      {
        nome: nomeResponsavel,
        email,
        senha: senhaCriptografada,
        perfil: "ADMIN_COMUNIDADE",
        comunidadeId: novaComunidade.id,
        ativo: true,
      },
      {
        transaction,
      }
    );

    // ========================================
    // CONFIRMAR TRANSACTION
    // ========================================

    await transaction.commit();

    return res.status(201).json({
      mensagem: "Comunidade cadastrada com sucesso",

      comunidade: {
        id: novaComunidade.id,
        nome: novaComunidade.nome,
        paroquia: novaComunidade.paroquia,
        cidade: novaComunidade.cidade,
      },

      usuario: {
        id: novoUsuario.id,
        nome: novoUsuario.nome,
        email: novoUsuario.email,
        perfil: novoUsuario.perfil,
        comunidadeId: novoUsuario.comunidadeId,
      },
    });
  } catch (error) {
    await transaction.rollback();

    console.error("Erro ao cadastrar comunidade:", error);

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
    const { email, senha } = req.body;

    if (!email || !senha) {
      return res.status(400).json({
        erro: "Email e senha são obrigatórios",
      });
    }

    const usuario = await Usuario.findOne({
      where: {
        email,
      },
    });

    if (!usuario) {
      return res.status(401).json({
        erro: "Email ou senha inválidos",
      });
    }

    if (!usuario.ativo) {
      return res.status(403).json({
        erro: "Usuário desativado",
      });
    }

    const senhaCorreta = await bcrypt.compare(
      senha,
      usuario.senha
    );

    if (!senhaCorreta) {
      return res.status(401).json({
        erro: "Email ou senha inválidos",
      });
    }

    // Busca a comunidade vinculada ao usuário
    const comunidade = await Comunidade.findByPk(
      usuario.comunidadeId
    );

    if (!comunidade) {
      return res.status(404).json({
        erro: "Comunidade vinculada ao usuário não encontrada",
      });
    }

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

    res.json({
      mensagem: "Login realizado com sucesso",

      token,

      usuario: {
        id: usuario.id,
        nome: usuario.nome,
        email: usuario.email,
        perfil: usuario.perfil,
        comunidadeId: usuario.comunidadeId,
        comunidadeNome: comunidade.nome,
      },
    });
  } catch (error) {
    console.error("Erro ao realizar login:", error);

    res.status(500).json({
      erro: "Erro ao realizar login",
    });
  }
};