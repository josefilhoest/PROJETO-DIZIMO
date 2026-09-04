import bcrypt from "bcrypt";
import Comunidade from "../models/Comunidade.js";
import Usuario from "../models/Usuario.js";
import Dizimista from "../models/Dizimista.js";
import RegistroMensal from "../models/RegistroMensal.js";
import Paroquia from "../models/Paroquia.js";

// ========================================
// LISTAR TODAS AS PARÓQUIAS
// ========================================

export const listarParoquias = async (req, res) => {
  try {
    const paroquias = await Paroquia.findAll({
      attributes: [
        "id",
        "nome",
        "cidade",
        "ativa",
        "createdAt",
        "updatedAt",
      ],
      order: [["nome", "ASC"]],
    });

    const paroquiasComTotais = await Promise.all(
      paroquias.map(async (paroquia) => {
        const totalComunidades =
          await Comunidade.count({
            where: {
              paroquiaId: paroquia.id,
            },
          });

        return {
          ...paroquia.toJSON(),
          totalComunidades,
        };
      })
    );

    return res.status(200).json(
      paroquiasComTotais
    );
  } catch (error) {
    console.error(
      "Erro ao listar paróquias:",
      error
    );

    return res.status(500).json({
      erro: "Erro ao listar paróquias.",
    });
  }
};
// ========================================
// CADASTRAR NOVA PARÓQUIA PELO SUPER ADMIN
// ========================================

export const cadastrarParoquia = async (req, res) => {
  try {
    const { nome, cidade } = req.body;

    const nomeLimpo = nome
      ?.trim()
      .replace(/\s+/g, " ");

    const cidadeLimpa = cidade
      ?.trim()
      .replace(/\s+/g, " ") || null;

    // ========================================
    // VALIDAR DADOS DA PARÓQUIA
    // ========================================

    if (!nomeLimpo) {
      return res.status(400).json({
        erro: "O nome da paróquia é obrigatório.",
      });
    }

    if (nomeLimpo.length < 2) {
      return res.status(400).json({
        erro:
          "O nome da paróquia deve ter pelo menos 2 caracteres.",
      });
    }

    if (nomeLimpo.length > 150) {
      return res.status(400).json({
        erro:
          "O nome da paróquia deve ter no máximo 150 caracteres.",
      });
    }

    if (
      cidadeLimpa &&
      cidadeLimpa.length > 150
    ) {
      return res.status(400).json({
        erro:
          "O nome da cidade deve ter no máximo 150 caracteres.",
      });
    }

    // ========================================
    // IMPEDIR PARÓQUIA DUPLICADA
    // ========================================
    //
    // A comparação é feita também no backend,
    // ignorando diferenças de maiúsculas e
    // minúsculas e espaços extras.
    //
    // ========================================

    const paroquiasExistentes =
      await Paroquia.findAll({
        attributes: ["id", "nome"],
      });

    const nomeNormalizado =
      nomeLimpo.toLocaleLowerCase("pt-BR");

    const paroquiaExistente =
      paroquiasExistentes.find((paroquia) => {
        const nomeExistente = paroquia.nome
          ?.trim()
          .replace(/\s+/g, " ")
          .toLocaleLowerCase("pt-BR");

        return nomeExistente === nomeNormalizado;
      });

    if (paroquiaExistente) {
      return res.status(409).json({
        erro:
          "Já existe uma paróquia cadastrada com este nome.",
      });
    }

    // ========================================
    // CRIAR PARÓQUIA
    // ========================================
    //
    // O status nasce sempre ATIVO pelo backend.
    // O frontend não decide ID, status, usuários
    // nem comunidades durante este cadastro.
    //
    // ========================================

    const novaParoquia =
      await Paroquia.create({
        nome: nomeLimpo,
        cidade: cidadeLimpa,
        ativa: true,
      });

    return res.status(201).json({
      mensagem:
        "Paróquia cadastrada com sucesso.",

      paroquia: {
        id: novaParoquia.id,
        nome: novaParoquia.nome,
        cidade: novaParoquia.cidade,
        ativa: novaParoquia.ativa,
        createdAt: novaParoquia.createdAt,
        updatedAt: novaParoquia.updatedAt,
        totalComunidades: 0,
      },
    });
  } catch (error) {
    console.error(
      "Erro ao cadastrar paróquia:",
      error
    );

    return res.status(500).json({
      erro: "Erro ao cadastrar paróquia.",
    });
  }
};

export const detalharParoquia = async (req, res) => {
  try {
    const { id } = req.params;

    const paroquiaId = Number(id);

    if (
      !Number.isInteger(paroquiaId) ||
      paroquiaId <= 0
    ) {
      return res.status(400).json({
        erro: "ID da paróquia inválido.",
      });
    }

    const paroquia = await Paroquia.findByPk(
      paroquiaId,
      {
        attributes: [
          "id",
          "nome",
          "cidade",
          "ativa",
          "createdAt",
          "updatedAt",
        ],
      }
    );

    if (!paroquia) {
      return res.status(404).json({
        erro: "Paróquia não encontrada.",
      });
    }

    const comunidades = await Comunidade.findAll({
      where: {
        paroquiaId,
      },
      attributes: [
        "id",
        "nome",
        "cidade",
        "ativa",
        "createdAt",
      ],
      order: [["nome", "ASC"]],
    });

    const administradores = await Usuario.findAll({
      where: {
        paroquiaId,
        perfil: "ADMIN_PAROQUIA",
      },
      attributes: [
        "id",
        "nome",
        "email",
        "ativo",
        "licencaStatus",
      ],
      order: [["nome", "ASC"]],
    });

    return res.status(200).json({
      paroquia,
      indicadores: {
        totalComunidades:
          comunidades.length,
        comunidadesAtivas:
          comunidades.filter(
            (comunidade) =>
              comunidade.ativa
          ).length,
        comunidadesInativas:
          comunidades.filter(
            (comunidade) =>
              !comunidade.ativa
          ).length,
        totalAdministradores:
          administradores.length,
      },
      comunidades,
      administradores,
    });
  } catch (error) {
    console.error(
      "Erro ao detalhar paróquia:",
      error
    );

    return res.status(500).json({
      erro: "Erro ao detalhar paróquia.",
    });
  }
};


// ========================================
// EDITAR DADOS DA PARÓQUIA PELO SUPER ADMIN
// ========================================

export const editarParoquia = async (req, res) => {
  try {
    const { id } = req.params;
    const paroquiaId = Number(id);

    if (
      !Number.isInteger(paroquiaId) ||
      paroquiaId <= 0
    ) {
      return res.status(400).json({
        erro: "ID da paróquia inválido.",
      });
    }

    const { nome, cidade } = req.body;

    const nomeLimpo = nome
      ?.trim()
      .replace(/\s+/g, " ");

    const cidadeLimpa = cidade
      ?.trim()
      .replace(/\s+/g, " ") || null;

    if (!nomeLimpo) {
      return res.status(400).json({
        erro: "O nome da paróquia é obrigatório.",
      });
    }

    if (nomeLimpo.length < 2) {
      return res.status(400).json({
        erro:
          "O nome da paróquia deve ter pelo menos 2 caracteres.",
      });
    }

    if (nomeLimpo.length > 150) {
      return res.status(400).json({
        erro:
          "O nome da paróquia deve ter no máximo 150 caracteres.",
      });
    }

    if (
      cidadeLimpa &&
      cidadeLimpa.length > 150
    ) {
      return res.status(400).json({
        erro:
          "O nome da cidade deve ter no máximo 150 caracteres.",
      });
    }

    const paroquia = await Paroquia.findByPk(
      paroquiaId
    );

    if (!paroquia) {
      return res.status(404).json({
        erro: "Paróquia não encontrada.",
      });
    }

    const paroquiasExistentes =
      await Paroquia.findAll({
        attributes: ["id", "nome"],
      });

    const nomeNormalizado =
      nomeLimpo.toLocaleLowerCase("pt-BR");

    const paroquiaComMesmoNome =
      paroquiasExistentes.find((item) => {
        if (
          Number(item.id) ===
          Number(paroquia.id)
        ) {
          return false;
        }

        const nomeExistente = item.nome
          ?.trim()
          .replace(/\s+/g, " ")
          .toLocaleLowerCase("pt-BR");

        return nomeExistente === nomeNormalizado;
      });

    if (paroquiaComMesmoNome) {
      return res.status(409).json({
        erro:
          "Já existe outra paróquia cadastrada com este nome.",
      });
    }

    paroquia.nome = nomeLimpo;
    paroquia.cidade = cidadeLimpa;

    await paroquia.save();

    return res.status(200).json({
      mensagem:
        "Dados da paróquia atualizados com sucesso.",

      paroquia: {
        id: paroquia.id,
        nome: paroquia.nome,
        cidade: paroquia.cidade,
        ativa: paroquia.ativa,
        createdAt: paroquia.createdAt,
        updatedAt: paroquia.updatedAt,
      },
    });
  } catch (error) {
    console.error(
      "Erro ao editar paróquia:",
      error
    );

    return res.status(500).json({
      erro: "Erro ao editar os dados da paróquia.",
    });
  }
};

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

    const valorAtualRegistrado =
      await Dizimista.sum("valor", {
        where: {
          comunidadeId,
        },
      });

    const totalRegistrosMensais =
      await RegistroMensal.count({
        where: {
          comunidadeId,
        },
      });

    const ultimoRegistroData =
      await RegistroMensal.max("data", {
        where: {
          comunidadeId,
        },
      });

    const ultimaAtualizacaoDizimista =
      await Dizimista.max("updatedAt", {
        where: {
          comunidadeId,
        },
      });

    const ultimaAtualizacaoRegistro =
      await RegistroMensal.max("updatedAt", {
        where: {
          comunidadeId,
        },
      });

    const datasMovimentacao = [
      ultimaAtualizacaoDizimista,
      ultimaAtualizacaoRegistro,
    ]
      .filter(Boolean)
      .map((data) => new Date(data))
      .filter(
        (data) =>
          !Number.isNaN(data.getTime())
      );

    const ultimaMovimentacao =
      datasMovimentacao.length > 0
        ? new Date(
          Math.max(
            ...datasMovimentacao.map(
              (data) => data.getTime()
            )
          )
        )
        : null;

    const diasSemMovimentacao =
      ultimaMovimentacao
        ? Math.floor(
          (Date.now() -
            ultimaMovimentacao.getTime()) /
          (1000 * 60 * 60 * 24)
        )
        : null;

    let atividade = "SEM_MOVIMENTACAO";

    if (diasSemMovimentacao !== null) {
      if (diasSemMovimentacao <= 30) {
        atividade = "RECENTE";
      } else if (diasSemMovimentacao <= 90) {
        atividade = "ATENCAO";
      } else {
        atividade = "INATIVA";
      }
    }

    return res.status(200).json({
      comunidade: {
        id: comunidade.id,
        nome: comunidade.nome,
        paroquia: comunidade.paroquia,
        cidade: comunidade.cidade,
        ativa: comunidade.ativa,
        createdAt: comunidade.createdAt,
      },

      indicadores: {
        totalUsuarios: usuarios.length,
        totalDizimistas,
        valorAtualRegistrado:
          Number(valorAtualRegistrado || 0),
        totalRegistrosMensais,
        ultimoRegistroData:
          ultimoRegistroData || null,
        ultimaMovimentacao:
          ultimaMovimentacao
            ? ultimaMovimentacao.toISOString()
            : null,
        diasSemMovimentacao,
        atividade,
      },

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
// EDITAR DADOS DA COMUNIDADE PELO SUPER ADMIN
// ========================================

export const editarComunidadeAdmin = async (
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

    const {
      nome,
      paroquia,
      cidade,
    } = req.body;

    const nomeLimpo = nome?.trim();
    const paroquiaLimpa =
      paroquia?.trim() || null;
    const cidadeLimpa =
      cidade?.trim() || null;

    if (!nomeLimpo) {
      return res.status(400).json({
        erro:
          "O nome da comunidade é obrigatório.",
      });
    }

    if (nomeLimpo.length < 2) {
      return res.status(400).json({
        erro:
          "O nome da comunidade deve ter pelo menos 2 caracteres.",
      });
    }

    if (
      paroquiaLimpa &&
      paroquiaLimpa.length > 150
    ) {
      return res.status(400).json({
        erro:
          "O nome da paróquia deve ter no máximo 150 caracteres.",
      });
    }

    if (
      cidadeLimpa &&
      cidadeLimpa.length > 150
    ) {
      return res.status(400).json({
        erro:
          "O nome da cidade deve ter no máximo 150 caracteres.",
      });
    }

    const comunidade =
      await Comunidade.findByPk(
        comunidadeId
      );

    if (!comunidade) {
      return res.status(404).json({
        erro:
          "Comunidade não encontrada.",
      });
    }

    comunidade.nome = nomeLimpo;
    comunidade.paroquia =
      paroquiaLimpa;
    comunidade.cidade =
      cidadeLimpa;

    await comunidade.save();

    return res.status(200).json({
      mensagem:
        "Dados da comunidade atualizados com sucesso.",

      comunidade: {
        id: comunidade.id,
        nome: comunidade.nome,
        paroquia:
          comunidade.paroquia,
        cidade:
          comunidade.cidade,
        ativa:
          comunidade.ativa,
        createdAt:
          comunidade.createdAt,
        updatedAt:
          comunidade.updatedAt,
      },
    });
  } catch (error) {
    console.error(
      "Erro ao editar comunidade:",
      error
    );

    return res.status(500).json({
      erro:
        "Erro ao editar os dados da comunidade.",
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
// EXCLUIR COMUNIDADE PELO SUPER ADMIN
// ========================================

export const excluirComunidadeAdmin = async (req, res) => {
  let transaction = null;

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

    // A transação só começa depois de validar o ID.
    transaction =
      await Comunidade.sequelize.transaction();

    const comunidade = await Comunidade.findByPk(
      comunidadeId,
      {
        transaction,
      }
    );

    if (!comunidade) {
      await transaction.rollback();

      return res.status(404).json({
        erro: "Comunidade não encontrada.",
      });
    }

    // ========================================
    // PROTEÇÕES DE SEGURANÇA
    // ========================================

    // Impede o SUPER_ADMIN de excluir
    // a própria comunidade.
    if (
      Number(comunidade.id) ===
      Number(req.usuario.comunidadeId)
    ) {
      await transaction.rollback();

      return res.status(403).json({
        erro:
          "Você não pode excluir a sua própria comunidade.",
      });
    }

    // Proteção adicional:
    // nenhuma comunidade com SUPER_ADMIN
    // vinculado pode ser excluída.
    const superAdminVinculado =
      await Usuario.findOne({
        where: {
          comunidadeId,
          perfil: "SUPER_ADMIN",
        },
        transaction,
      });

    if (superAdminVinculado) {
      await transaction.rollback();

      return res.status(403).json({
        erro:
          "Esta comunidade possui um SUPER_ADMIN protegido e não pode ser excluída.",
      });
    }

    // ========================================
    // RESUMO ANTES DA EXCLUSÃO
    // ========================================

    const totalUsuarios = await Usuario.count({
      where: {
        comunidadeId,
      },
      transaction,
    });

    const totalDizimistas =
      await Dizimista.count({
        where: {
          comunidadeId,
        },
        transaction,
      });

    const totalRegistrosMensais =
      await RegistroMensal.count({
        where: {
          comunidadeId,
        },
        transaction,
      });

    const comunidadeExcluida = {
      id: comunidade.id,
      nome: comunidade.nome,
      totalUsuarios,
      totalDizimistas,
      totalRegistrosMensais,
    };

    // ========================================
    // EXCLUSÃO DOS DADOS VINCULADOS
    // ========================================

    // Primeiro removemos os dados dependentes.
    await RegistroMensal.destroy({
      where: {
        comunidadeId,
      },
      transaction,
    });

    await Dizimista.destroy({
      where: {
        comunidadeId,
      },
      transaction,
    });

    await Usuario.destroy({
      where: {
        comunidadeId,
      },
      transaction,
    });

    // A comunidade é removida somente depois
    // de todos os dados vinculados.
    await comunidade.destroy({
      transaction,
    });

    await transaction.commit();

    return res.status(200).json({
      mensagem:
        "Comunidade e todos os seus dados vinculados foram excluídos com sucesso.",
      comunidade: comunidadeExcluida,
    });
  } catch (error) {
    if (transaction && !transaction.finished) {
      await transaction.rollback();
    }

    console.error(
      "Erro ao excluir comunidade:",
      error
    );

    return res.status(500).json({
      erro: "Erro ao excluir comunidade.",
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
        "paroquiaId",
        "comunidadeId",
        "ativo",
        "licencaStatus",
        "createdAt",
      ],
      order: [["nome", "ASC"]],
    });

    const resultado = await Promise.all(
      usuarios.map(async (usuario) => {
        const paroquia = usuario.paroquiaId
          ? await Paroquia.findByPk(
            usuario.paroquiaId,
            {
              attributes: [
                "id",
                "nome",
                "cidade",
                "ativa",
              ],
            }
          )
          : null;

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

          paroquiaId: usuario.paroquiaId,
          paroquiaNome: paroquia
            ? paroquia.nome
            : null,

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
      perfil = "ADMIN_COMUNIDADE",
      paroquiaId,
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

    const perfisPermitidos = [
      "ADMIN_COMUNIDADE",
      "ADMIN_PAROQUIA",
    ];

    if (!perfisPermitidos.includes(perfil)) {
      return res.status(400).json({
        erro: "Perfil de usuário inválido.",
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

    // ========================================
    // VALIDAR PARÓQUIA
    // ========================================
    //
    // Tanto ADMIN_COMUNIDADE quanto
    // ADMIN_PAROQUIA precisam nascer
    // vinculados a uma paróquia.
    // ========================================

    const paroquiaIdNumero = Number(paroquiaId);

    if (
      !Number.isInteger(paroquiaIdNumero) ||
      paroquiaIdNumero <= 0
    ) {
      return res.status(400).json({
        erro: "A paróquia é obrigatória para o usuário.",
      });
    }

    const paroquia = await Paroquia.findByPk(
      paroquiaIdNumero
    );

    if (!paroquia) {
      return res.status(404).json({
        erro: "Paróquia não encontrada.",
      });
    }

    if (!paroquia.ativa) {
      return res.status(403).json({
        erro: "Paróquia desativada.",
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
      perfil,

      paroquiaId: paroquiaIdNumero,

      // ADMIN_COMUNIDADE e ADMIN_PAROQUIA
      // nascem sem comunidade. No primeiro
      // acesso, cada perfil cadastra a própria
      // comunidade. Para ADMIN_PAROQUIA, ela
      // será a comunidade-sede.
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

        paroquiaId: novoUsuario.paroquiaId,
        paroquiaNome: paroquia.nome,

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

    const paroquia = usuario.paroquiaId
      ? await Paroquia.findByPk(
        usuario.paroquiaId
      )
      : null;

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

        paroquiaId: usuario.paroquiaId,
        paroquiaNome: paroquia
          ? paroquia.nome
          : null,

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

    });
  }
};