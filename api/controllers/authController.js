import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import Usuario from "../models/Usuario.js";

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
      },
    });
  } catch (error) {
    console.error("Erro ao realizar login:", error);

    res.status(500).json({
      erro: "Erro ao realizar login",
    });
  }
};