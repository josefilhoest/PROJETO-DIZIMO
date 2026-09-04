import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

import sequelize from "../database/database.js";

import Usuario from "../models/Usuario.js";
import Comunidade from "../models/Comunidade.js";
import Paroquia from "../models/Paroquia.js";

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
      perfil = "ADMIN_COMUNIDADE",
      paroquiaId,
    } = req.body;

    const nomeLimpo = nome?.trim();

    const emailLimpo = email
      ?.trim()
      .toLowerCase();

    // ========================================
    // VALIDAR CAMPOS OBRIGATÓRIOS
    // ========================================

    if (!nomeLimpo || !emailLimpo || !senha) {
      return res.status(400).json({
        erro: "Nome, email e senha são obrigatórios",
      });
    }

    // ========================================
    // VALIDAR PERFIL
    // ========================================

    const perfisPermitidos = [
      "ADMIN_COMUNIDADE",
      "ADMIN_PAROQUIA",
    ];

    if (!perfisPermitidos.includes(perfil)) {
      return res.status(400).json({
        erro: "Perfil de usuário inválido",
      });
    }

    // ========================================
    // VALIDAR SENHA
    // ========================================

    if (senha.length < 6) {
      return res.status(400).json({
        erro:
          "A senha deve ter pelo menos 6 caracteres.",
      });
    }

    // ========================================
    // VALIDAR PARÓQUIA DO NOVO USUÁRIO
    // ========================================
    //
    // ADMIN_COMUNIDADE:
    // nasce vinculado à paróquia e depois
    // cadastra sua própria comunidade.
    //
    // ADMIN_PAROQUIA:
    // nasce vinculado à paróquia e depois
    // cadastra sua comunidade-sede.
    //
    // ========================================

    const paroquiaIdNumero =
      Number(paroquiaId);

    if (
      !Number.isInteger(paroquiaIdNumero) ||
      paroquiaIdNumero <= 0
    ) {
      return res.status(400).json({
        erro:
          "A paróquia é obrigatória para o usuário",
      });
    }

    const paroquia =
      await Paroquia.findByPk(
        paroquiaIdNumero
      );

    if (!paroquia) {
      return res.status(404).json({
        erro: "Paróquia não encontrada",
      });
    }

    if (!paroquia.ativa) {
      return res.status(403).json({
        erro: "Paróquia desativada",
      });
    }

    // ========================================
    // VERIFICAR EMAIL DUPLICADO
    // ========================================

    const usuarioExistente =
      await Usuario.findOne({
        where: {
          email: emailLimpo,
        },
      });

    if (usuarioExistente) {
      return res.status(409).json({
        erro:
          "Já existe um usuário cadastrado com este email",
      });
    }

    // ========================================
    // CRIPTOGRAFAR SENHA
    // ========================================

    const senhaCriptografada =
      await bcrypt.hash(
        senha,
        10
      );

    // ========================================
    // CRIAR USUÁRIO LICENCIADO
    // ========================================
    //
    // Ambos os perfis comerciais nascem:
    //
    // paroquiaId   -> já definido
    // comunidadeId -> null
    //
    // No primeiro acesso, cadastram a
    // própria comunidade.
    //
    // Para ADMIN_PAROQUIA essa comunidade
    // será sua comunidade-sede.
    //
    // ========================================

    const novoUsuario =
      await Usuario.create({
        nome: nomeLimpo,
        email: emailLimpo,
        senha: senhaCriptografada,

        perfil,

        paroquiaId:
          paroquiaIdNumero,

        comunidadeId: null,

        ativo: true,

        licencaStatus: "ATIVA",
      });

    return res.status(201).json({
      mensagem:
        "Usuário licenciado cadastrado com sucesso",

      usuario: {
        id: novoUsuario.id,
        nome: novoUsuario.nome,
        email: novoUsuario.email,
        perfil: novoUsuario.perfil,

        paroquiaId:
          novoUsuario.paroquiaId,

        paroquiaNome:
          paroquia.nome,

        paroquiaCidade:
          paroquia.cidade || null,

        comunidadeId:
          novoUsuario.comunidadeId,

        comunidadeNome: null,

        possuiComunidade: false,

        ativo:
          novoUsuario.ativo,

        licencaStatus:
          novoUsuario.licencaStatus,
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
//
// ADMIN_COMUNIDADE:
// cadastra sua comunidade.
//
// ADMIN_PAROQUIA:
// cadastra sua comunidade-sede.
//
// A paróquia nunca é escolhida livremente
// pelo frontend.
// O backend usa a paroquiaId do usuário.
//
// ========================================

export const cadastrarComunidade = async (
  req,
  res
) => {
  let transaction;

  try {
    // ========================================
    // IDENTIFICAR USUÁRIO PELO TOKEN
    // ========================================

    const usuarioId =
      Number(req.usuario?.usuarioId);

    if (
      !Number.isInteger(usuarioId) ||
      usuarioId <= 0
    ) {
      return res.status(401).json({
        erro:
          "Usuário não identificado pelo token",
      });
    }

    const {
      nomeComunidade,
      cidade,
    } = req.body;

    // ========================================
    // NORMALIZAR CAMPOS
    // ========================================

    const nomeComunidadeLimpo =
      nomeComunidade?.trim();

    const cidadeLimpa =
      cidade?.trim() || null;

    // ========================================
    // VALIDAR CAMPOS
    // ========================================

    if (!nomeComunidadeLimpo) {
      return res.status(400).json({
        erro:
          "Nome da comunidade é obrigatório",
      });
    }

    // ========================================
    // BUSCAR USUÁRIO LOGADO
    // ========================================

    const usuario =
      await Usuario.findByPk(
        usuarioId
      );

    if (!usuario) {
      return res.status(404).json({
        erro: "Usuário não encontrado",
      });
    }

    // ========================================
    // GARANTIR PERFIL PERMITIDO
    // ========================================

    const perfisPermitidos = [
      "ADMIN_COMUNIDADE",
      "ADMIN_PAROQUIA",
    ];

    if (
      !perfisPermitidos.includes(
        usuario.perfil
      )
    ) {
      return res.status(403).json({
        erro:
          "Este perfil não pode cadastrar uma comunidade",
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

    if (
      usuario.licencaStatus !== "ATIVA"
    ) {
      return res.status(403).json({
        erro:
          "Licença de uso não está ativa",
      });
    }

    // ========================================
    // VERIFICAR VÍNCULO COM PARÓQUIA
    // ========================================

    const paroquiaId =
      Number(usuario.paroquiaId);

    if (
      !Number.isInteger(paroquiaId) ||
      paroquiaId <= 0
    ) {
      return res.status(403).json({
        erro:
          "Usuário não vinculado a uma paróquia",
      });
    }

    const paroquiaVinculada =
      await Paroquia.findByPk(
        paroquiaId
      );

    if (!paroquiaVinculada) {
      return res.status(404).json({
        erro:
          "Paróquia vinculada ao usuário não encontrada",
      });
    }

    if (!paroquiaVinculada.ativa) {
      return res.status(403).json({
        erro: "Paróquia desativada",
      });
    }

    // ========================================
    // IMPEDIR MAIS DE UMA COMUNIDADE
    // ========================================

    if (usuario.comunidadeId) {
      return res.status(409).json({
        erro:
          "Este usuário já possui uma comunidade cadastrada",
      });
    }

    // ========================================
    // INICIAR TRANSAÇÃO
    // ========================================

    transaction =
      await sequelize.transaction();

    // ========================================
    // CRIAR COMUNIDADE
    // ========================================
    //
    // SEGURANÇA:
    //
    // O frontend não define paroquiaId.
    //
    // A comunidade sempre nasce vinculada
    // à mesma paróquia do usuário logado.
    //
    // ========================================

    const novaComunidade =
      await Comunidade.create(
        {
          nome:
            nomeComunidadeLimpo,

          // Campo textual antigo mantido
          // temporariamente por compatibilidade.
          paroquia:
            paroquiaVinculada.nome,

          // Vínculo oficial.
          paroquiaId,

          cidade:
            cidadeLimpa,

          ativa: true,
        },
        {
          transaction,
        }
      );

    // ========================================
    // VINCULAR COMUNIDADE AO USUÁRIO
    // ========================================
    //
    // ADMIN_COMUNIDADE:
    // comunidade que administra.
    //
    // ADMIN_PAROQUIA:
    // comunidade-sede onde administrará
    // seus próprios dizimistas.
    //
    // ========================================

    await usuario.update(
      {
        comunidadeId:
          novaComunidade.id,
      },
      {
        transaction,
      }
    );

    // ========================================
    // CONFIRMAR TRANSAÇÃO
    // ========================================

    await transaction.commit();

    // ========================================
    // RESPOSTA
    // ========================================

    return res.status(201).json({
      mensagem:
        usuario.perfil ===
          "ADMIN_PAROQUIA"
          ? "Comunidade-sede cadastrada com sucesso"
          : "Comunidade cadastrada com sucesso",

      comunidade: {
        id:
          novaComunidade.id,

        nome:
          novaComunidade.nome,

        paroquia:
          novaComunidade.paroquia,

        paroquiaId:
          novaComunidade.paroquiaId,

        cidade:
          novaComunidade.cidade,

        ativa:
          novaComunidade.ativa,
      },

      usuario: {
        id:
          usuario.id,

        nome:
          usuario.nome,

        email:
          usuario.email,

        perfil:
          usuario.perfil,

        paroquiaId,

        paroquiaNome:
          paroquiaVinculada.nome,

        paroquiaCidade:
          paroquiaVinculada.cidade ||
          null,

        comunidadeId:
          novaComunidade.id,

        comunidadeNome:
          novaComunidade.nome,

        possuiComunidade: true,

        ativo:
          usuario.ativo,

        licencaStatus:
          usuario.licencaStatus,
      },
    });
  } catch (error) {
    // ========================================
    // DESFAZER TRANSAÇÃO
    // ========================================

    if (
      transaction &&
      !transaction.finished
    ) {
      await transaction.rollback();
    }

    console.error(
      "Erro ao cadastrar comunidade:",
      error
    );

    return res.status(500).json({
      erro:
        "Erro ao cadastrar comunidade",
    });
  }
};

// ========================================
// LOGIN
// ========================================

export const login = async (
  req,
  res
) => {
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
        erro:
          "Email e senha são obrigatórios",
      });
    }

    // ========================================
    // NORMALIZAR EMAIL
    // ========================================

    const emailLimpo =
      email
        .trim()
        .toLowerCase();

    // ========================================
    // BUSCAR USUÁRIO
    // ========================================

    const usuario =
      await Usuario.findOne({
        where: {
          email: emailLimpo,
        },
      });

    // Mesma mensagem para usuário inexistente
    // ou senha incorreta.
    if (!usuario) {
      return res.status(401).json({
        erro:
          "Email ou senha inválidos",
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
    //
    // SUPER_ADMIN não depende da licença
    // comercial.
    //
    // ADMIN_PAROQUIA e ADMIN_COMUNIDADE
    // precisam possuir licença ATIVA.
    //
    // ========================================

    if (
      usuario.perfil !==
      "SUPER_ADMIN" &&
      usuario.licencaStatus !==
      "ATIVA"
    ) {
      return res.status(403).json({
        erro:
          "Licença de uso bloqueada",
      });
    }

    // ========================================
    // VERIFICAR SENHA
    // ========================================

    const senhaCorreta =
      await bcrypt.compare(
        senha,
        usuario.senha
      );

    if (!senhaCorreta) {
      return res.status(401).json({
        erro:
          "Email ou senha inválidos",
      });
    }

    // ========================================
    // BUSCAR PARÓQUIA
    // ========================================

    let paroquia = null;

    if (usuario.paroquiaId) {
      paroquia =
        await Paroquia.findByPk(
          usuario.paroquiaId
        );

      if (!paroquia) {
        return res.status(404).json({
          erro:
            "Paróquia vinculada ao usuário não encontrada",
        });
      }

      if (!paroquia.ativa) {
        return res.status(403).json({
          erro:
            "Paróquia desativada",
        });
      }
    }

    // ========================================
    // BUSCAR COMUNIDADE
    // ========================================
    //
    // ADMIN_COMUNIDADE:
    // comunidade administrada.
    //
    // ADMIN_PAROQUIA:
    // comunidade-sede.
    //
    // Um usuário recém-criado pode ainda não
    // possuir comunidade.
    //
    // ========================================

    let comunidade = null;

    if (usuario.comunidadeId) {
      comunidade =
        await Comunidade.findOne({
          where: {
            id:
              usuario.comunidadeId,

            // Camada adicional de segurança:
            // a comunidade também deve pertencer
            // à mesma paróquia do usuário.
            ...(usuario.paroquiaId
              ? {
                paroquiaId:
                  usuario.paroquiaId,
              }
              : {}),
          },
        });

      if (!comunidade) {
        return res.status(404).json({
          erro:
            "Comunidade vinculada ao usuário não encontrada na paróquia informada",
        });
      }

      if (!comunidade.ativa) {
        return res.status(403).json({
          erro:
            "Comunidade desativada",
        });
      }
    }

    // ========================================
    // VERIFICAR JWT_SECRET
    // ========================================

    if (!process.env.JWT_SECRET) {
      console.error(
        "JWT_SECRET não configurado no servidor."
      );

      return res.status(500).json({
        erro:
          "Erro interno de autenticação",
      });
    }

    // ========================================
    // GERAR TOKEN JWT
    // ========================================

    const token = jwt.sign(
      {
        usuarioId:
          usuario.id,

        paroquiaId:
          usuario.paroquiaId,

        comunidadeId:
          usuario.comunidadeId,

        perfil:
          usuario.perfil,
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
      mensagem:
        "Login realizado com sucesso",

      token,

      usuario: {
        id:
          usuario.id,

        nome:
          usuario.nome,

        email:
          usuario.email,

        perfil:
          usuario.perfil,

        paroquiaId:
          usuario.paroquiaId,

        paroquiaNome:
          paroquia?.nome || null,

        paroquiaCidade:
          paroquia?.cidade || null,

        comunidadeId:
          usuario.comunidadeId,

        comunidadeNome:
          comunidade?.nome || null,

        possuiComunidade:
          Boolean(
            usuario.comunidadeId
          ),

        ativo:
          usuario.ativo,

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
      erro:
        "Erro ao realizar login",
    });
  }
};