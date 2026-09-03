import Comunidade from "../models/Comunidade.js";
import Usuario from "../models/Usuario.js";
import Dizimista from "../models/Dizimista.js";
import RegistroMensal from "../models/RegistroMensal.js";
import RegistroMensalItem from "../models/RegistroMensalItem.js";

// ========================================
// UTILITÁRIO - VALIDAR PARÓQUIA DO USUÁRIO
// ========================================

const obterParoquiaIdUsuario = (req) => {
  const paroquiaId = Number(
    req.usuario?.paroquiaId
  );

  if (
    !Number.isInteger(paroquiaId) ||
    paroquiaId <= 0
  ) {
    return null;
  }

  return paroquiaId;
};

// ========================================
// UTILITÁRIO - VALIDAR ID DA COMUNIDADE
// ========================================

const obterComunidadeId = (req) => {
  const comunidadeId = Number(
    req.params.id
  );

  if (
    !Number.isInteger(comunidadeId) ||
    comunidadeId <= 0
  ) {
    return null;
  }

  return comunidadeId;
};

// ========================================
// UTILITÁRIO - BUSCAR COMUNIDADE COM
// ISOLAMENTO POR PARÓQUIA
// ========================================

const buscarComunidadeDaParoquia = async (
  comunidadeId,
  paroquiaId
) => {
  return Comunidade.findOne({
    where: {
      id: comunidadeId,
      paroquiaId,
    },

    attributes: [
      "id",
      "nome",
      "paroquia",
      "paroquiaId",
      "cidade",
      "ativa",
      "createdAt",
      "updatedAt",
    ],
  });
};

// ========================================
// UTILITÁRIO - PROTEGER CONTEÚDO CSV
// ========================================

const protegerCelulaCsv = (valor) => {
  let texto =
    valor === null ||
    valor === undefined
      ? ""
      : String(valor);

  /*
   * Proteção contra CSV Injection / Formula Injection.
   * Se a célula começar com caracteres interpretados
   * como fórmula por Excel/LibreOffice, prefixamos
   * com apóstrofo.
   */
  if (/^[=+\-@]/.test(texto)) {
    texto = `'${texto}`;
  }

  texto = texto.replace(/"/g, '""');

  return `"${texto}"`;
};

// ========================================
// UTILITÁRIO - NOME SEGURO PARA ARQUIVO
// ========================================

const normalizarNomeArquivo = (texto) => {
  return String(texto || "comunidade")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-zA-Z0-9_-]+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "")
    .toLowerCase();
};

// ========================================
// LISTAR COMUNIDADES DA PARÓQUIA LOGADA
// ========================================

export const listarComunidadesParoquia = async (
  req,
  res
) => {
  try {
    const paroquiaId =
      obterParoquiaIdUsuario(req);

    if (!paroquiaId) {
      return res.status(403).json({
        erro:
          "Usuário não vinculado a uma paróquia",
      });
    }

    const comunidades =
      await Comunidade.findAll({
        where: {
          paroquiaId,
        },

        attributes: [
          "id",
          "nome",
          "paroquia",
          "paroquiaId",
          "cidade",
          "ativa",
          "createdAt",
          "updatedAt",
        ],

        order: [["nome", "ASC"]],
      });

    return res.status(200).json({
      total: comunidades.length,
      comunidades,
    });

  } catch (error) {
    console.error(
      "Erro ao listar comunidades da paróquia:",
      error
    );

    return res.status(500).json({
      erro:
        "Erro ao listar comunidades da paróquia",
    });
  }
};

// ========================================
// DETALHAR COMUNIDADE DA PARÓQUIA LOGADA
// ========================================

export const detalharComunidadeParoquia = async (
  req,
  res
) => {
  try {
    const paroquiaId =
      obterParoquiaIdUsuario(req);

    const comunidadeId =
      obterComunidadeId(req);

    if (!paroquiaId) {
      return res.status(403).json({
        erro:
          "Usuário não vinculado a uma paróquia",
      });
    }

    if (!comunidadeId) {
      return res.status(400).json({
        erro:
          "ID da comunidade inválido",
      });
    }

    /*
     * SEGURANÇA:
     * A comunidade é buscada usando:
     * - id da comunidade
     * - paroquiaId do usuário autenticado
     *
     * Assim o ADMIN_PAROQUIA não consegue
     * acessar comunidade de outra paróquia
     * apenas alterando o ID da URL.
     */
    const comunidade =
      await buscarComunidadeDaParoquia(
        comunidadeId,
        paroquiaId
      );

    if (!comunidade) {
      return res.status(404).json({
        erro:
          "Comunidade não encontrada nesta paróquia",
      });
    }

    const [
      totalUsuarios,
      usuariosAtivos,
      totalDizimistas,
      valorAtualRegistrado,
      totalRegistrosMensais,
      ultimoRegistroData,
      ultimaAtualizacaoDizimista,
      ultimaAtualizacaoRegistro,
    ] = await Promise.all([
      Usuario.count({
        where: {
          comunidadeId,
        },
      }),

      Usuario.count({
        where: {
          comunidadeId,
          ativo: true,
        },
      }),

      Dizimista.count({
        where: {
          comunidadeId,
        },
      }),

      Dizimista.sum("valor", {
        where: {
          comunidadeId,
        },
      }),

      RegistroMensal.count({
        where: {
          comunidadeId,
        },
      }),

      RegistroMensal.max("data", {
        where: {
          comunidadeId,
        },
      }),

      Dizimista.max("updatedAt", {
        where: {
          comunidadeId,
        },
      }),

      RegistroMensal.max("updatedAt", {
        where: {
          comunidadeId,
        },
      }),
    ]);

    const datasMovimentacao = [
      ultimaAtualizacaoDizimista,
      ultimaAtualizacaoRegistro,
    ]
      .filter(Boolean)
      .map((data) => new Date(data))
      .filter(
        (data) =>
          !Number.isNaN(
            data.getTime()
          )
      );

    const ultimaMovimentacao =
      datasMovimentacao.length > 0
        ? new Date(
            Math.max(
              ...datasMovimentacao.map(
                (data) =>
                  data.getTime()
              )
            )
          )
        : null;

    const diasSemMovimentacao =
      ultimaMovimentacao
        ? Math.floor(
            (
              Date.now() -
              ultimaMovimentacao.getTime()
            ) /
            (1000 * 60 * 60 * 24)
          )
        : null;

    let atividade =
      "SEM_MOVIMENTACAO";

    if (
      diasSemMovimentacao !== null
    ) {
      if (
        diasSemMovimentacao <= 30
      ) {
        atividade = "RECENTE";
      } else if (
        diasSemMovimentacao <= 90
      ) {
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
        paroquiaId:
          comunidade.paroquiaId,
        cidade: comunidade.cidade,
        ativa: comunidade.ativa,
        createdAt:
          comunidade.createdAt,
        updatedAt:
          comunidade.updatedAt,
      },

      indicadores: {
        totalUsuarios,
        usuariosAtivos,
        totalDizimistas,

        valorAtualRegistrado:
          Number(
            valorAtualRegistrado || 0
          ),

        totalRegistrosMensais,

        ultimoRegistroData:
          ultimoRegistroData || null,

        ultimaMovimentacao:
          ultimaMovimentacao
            ? ultimaMovimentacao
                .toISOString()
            : null,

        diasSemMovimentacao,
        atividade,
      },
    });

  } catch (error) {
    console.error(
      "Erro ao detalhar comunidade da paróquia:",
      error
    );

    return res.status(500).json({
      erro:
        "Erro ao carregar os detalhes da comunidade",
    });
  }
};

// ========================================
// EXPORTAR DIZIMISTAS DA COMUNIDADE EM CSV
// ADMIN_PAROQUIA
// ========================================

export const exportarDizimistasComunidadeParoquia =
  async (req, res) => {
    try {
      const paroquiaId =
        obterParoquiaIdUsuario(req);

      const comunidadeId =
        obterComunidadeId(req);

      if (!paroquiaId) {
        return res.status(403).json({
          erro:
            "Usuário não vinculado a uma paróquia",
        });
      }

      if (!comunidadeId) {
        return res.status(400).json({
          erro:
            "ID da comunidade inválido",
        });
      }

      /*
       * Segurança obrigatória antes de consultar
       * qualquer dizimista.
       */
      const comunidade =
        await buscarComunidadeDaParoquia(
          comunidadeId,
          paroquiaId
        );

      if (!comunidade) {
        return res.status(404).json({
          erro:
            "Comunidade não encontrada nesta paróquia",
        });
      }

      const dizimistas =
        await Dizimista.findAll({
          where: {
            comunidadeId,
          },

          attributes: [
            "numero",
            "folha",
            "nome",
            "valor",
          ],

          order: [
            ["folha", "ASC"],
            ["numero", "ASC"],
          ],
        });

      const cabecalho = [
        "Número",
        "Folha",
        "Nome",
        "Valor",
      ]
        .map(protegerCelulaCsv)
        .join(";");

      const linhas = dizimistas.map(
        (dizimista) => {
          const valor =
            Number(
              dizimista.valor || 0
            ).toFixed(2)
              .replace(".", ",");

          return [
            dizimista.numero,
            dizimista.folha,
            dizimista.nome,
            valor,
          ]
            .map(protegerCelulaCsv)
            .join(";");
        }
      );

      /*
       * BOM UTF-8 para abrir corretamente
       * acentos no Excel.
       */
      const csv =
        "\uFEFF" +
        [
          cabecalho,
          ...linhas,
        ].join("\r\n");

      const nomeComunidade =
        normalizarNomeArquivo(
          comunidade.nome
        );

      const dataHoje =
        new Date()
          .toISOString()
          .slice(0, 10);

      const nomeArquivo =
        `dizimistas-${nomeComunidade}-${dataHoje}.csv`;

      res.setHeader(
        "Content-Type",
        "text/csv; charset=utf-8"
      );

      res.setHeader(
        "Content-Disposition",
        `attachment; filename="${nomeArquivo}"`
      );

      res.setHeader(
        "Cache-Control",
        "no-store"
      );

      return res.status(200).send(csv);

    } catch (error) {
      console.error(
        "Erro ao exportar dizimistas da comunidade pela paróquia:",
        error
      );

      return res.status(500).json({
        erro:
          "Erro ao exportar os dizimistas da comunidade",
      });
    }
  };

// ========================================
// BACKUP COMPLETO DA COMUNIDADE
// ADMIN_PAROQUIA
// ========================================

export const gerarBackupComunidadeParoquia =
  async (req, res) => {
    try {
      const paroquiaId =
        obterParoquiaIdUsuario(req);

      const comunidadeId =
        obterComunidadeId(req);

      if (!paroquiaId) {
        return res.status(403).json({
          erro:
            "Usuário não vinculado a uma paróquia",
        });
      }

      if (!comunidadeId) {
        return res.status(400).json({
          erro:
            "ID da comunidade inválido",
        });
      }

      /*
       * Segurança:
       * somente depois de validar que a comunidade
       * pertence à paróquia autenticada consultamos
       * seus dados.
       */
      const comunidade =
        await buscarComunidadeDaParoquia(
          comunidadeId,
          paroquiaId
        );

      if (!comunidade) {
        return res.status(404).json({
          erro:
            "Comunidade não encontrada nesta paróquia",
        });
      }

      const [
        usuarios,
        dizimistas,
        registrosMensais,
        registrosMensaisItens,
      ] = await Promise.all([
        Usuario.findAll({
          where: {
            comunidadeId,
          },

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
            "updatedAt",
          ],

          order: [["nome", "ASC"]],
        }),

        Dizimista.findAll({
          where: {
            comunidadeId,
          },

          order: [
            ["folha", "ASC"],
            ["numero", "ASC"],
          ],
        }),

        RegistroMensal.findAll({
          where: {
            comunidadeId,
          },

          order: [
            ["data", "DESC"],
            ["id", "DESC"],
          ],
        }),

        RegistroMensalItem.findAll({
          where: {
            comunidadeId,
          },

          attributes: [
            "id",
            "registroMensalId",
            "comunidadeId",
            "dizimistaId",
            "numero",
            "folha",
            "nome",
            "valor",
            "createdAt",
            "updatedAt",
          ],

          order: [
            ["registroMensalId", "DESC"],
            ["folha", "ASC"],
            ["numero", "ASC"],
          ],
        }),
      ]);

      const backup = {
        metadata: {
          tipo:
            "BACKUP_COMUNIDADE_ADMIN_PAROQUIA_V1",
          versao: 1,
          geradoEm:
            new Date().toISOString(),

          paroquia: {
            id: paroquiaId,
            nome:
              req.usuario
                ?.paroquiaNome ||
              comunidade.paroquia ||
              null,
          },

          comunidade: {
            id: comunidade.id,
            nome: comunidade.nome,
            paroquiaId:
              comunidade.paroquiaId,
            cidade:
              comunidade.cidade,
            ativa:
              comunidade.ativa,
          },
        },

        dados: {
          comunidade:
            comunidade.toJSON(),

          usuarios: usuarios.map(
            (usuario) =>
              usuario.toJSON()
          ),

          dizimistas:
            dizimistas.map(
              (dizimista) =>
                dizimista.toJSON()
            ),

          registrosMensais:
            registrosMensais.map(
              (registro) =>
                registro.toJSON()
            ),

          registrosMensaisItens:
            registrosMensaisItens.map(
              (item) =>
                item.toJSON()
            ),

        },
      };

      const nomeComunidade =
        normalizarNomeArquivo(
          comunidade.nome
        );

      const dataHoje =
        new Date()
          .toISOString()
          .slice(0, 10);

      const nomeArquivo =
        `backup-${nomeComunidade}-${dataHoje}.json`;

      res.setHeader(
        "Content-Type",
        "application/json; charset=utf-8"
      );

      res.setHeader(
        "Content-Disposition",
        `attachment; filename="${nomeArquivo}"`
      );

      res.setHeader(
        "Cache-Control",
        "no-store"
      );

      return res
        .status(200)
        .send(
          JSON.stringify(
            backup,
            null,
            2
          )
        );

    } catch (error) {
      console.error(
        "Erro ao gerar backup da comunidade pela paróquia:",
        error
      );

      return res.status(500).json({
        erro:
          "Erro ao gerar backup da comunidade",
      });
    }
  };

// ========================================
// LISTAR HISTÓRICO MENSAL DA COMUNIDADE
// ADMIN_PAROQUIA
// ========================================

export const listarHistoricoComunidadeParoquia =
  async (req, res) => {
    try {
      const paroquiaId =
        obterParoquiaIdUsuario(req);

      const comunidadeId =
        obterComunidadeId(req);

      if (!paroquiaId) {
        return res.status(403).json({
          erro:
            "Usuário não vinculado a uma paróquia",
        });
      }

      if (!comunidadeId) {
        return res.status(400).json({
          erro:
            "ID da comunidade inválido",
        });
      }

      /*
       * SEGURANÇA:
       * Antes de consultar qualquer histórico,
       * confirmamos que a comunidade pertence
       * à paróquia do ADMIN_PAROQUIA logado.
       */
      const comunidade =
        await buscarComunidadeDaParoquia(
          comunidadeId,
          paroquiaId
        );

      if (!comunidade) {
        return res.status(404).json({
          erro:
            "Comunidade não encontrada nesta paróquia",
        });
      }

      const historico =
        await RegistroMensal.findAll({
          where: {
            comunidadeId,
          },

          attributes: [
            "id",
            "comunidade",
            "comunidadeId",
            "data",
            "mes",
            "ano",
            "total",
            "equipe_comunidade",
            "conferido_em",
            "responsavel_paroquia",
            "createdAt",
          ],

          order: [
            ["ano", "DESC"],
            ["mes", "DESC"],
            ["id", "DESC"],
          ],
        });

      /*
       * Só entram no histórico os registros
       * que realmente representam fechamento
       * mensal (mes e ano preenchidos).
       */
      const fechamentos =
        historico.filter(
          (registro) =>
            registro.mes !== null &&
            registro.ano !== null
        );

      return res.status(200).json({
        comunidade: {
          id: comunidade.id,
          nome: comunidade.nome,
          cidade: comunidade.cidade,
          paroquiaId:
            comunidade.paroquiaId,
        },

        total:
          fechamentos.length,

        historico:
          fechamentos,
      });

    } catch (error) {
      console.error(
        "Erro ao listar histórico mensal da comunidade pela paróquia:",
        error
      );

      return res.status(500).json({
        erro:
          "Erro ao listar o histórico mensal da comunidade",
      });
    }
  };

// ========================================
// DETALHAR FECHAMENTO MENSAL DA COMUNIDADE
// ADMIN_PAROQUIA
// ========================================

export const detalharHistoricoComunidadeParoquia =
  async (req, res) => {
    try {
      const paroquiaId =
        obterParoquiaIdUsuario(req);

      const comunidadeId =
        obterComunidadeId(req);

      const registroId = Number(
        req.params.registroId
      );

      if (!paroquiaId) {
        return res.status(403).json({
          erro:
            "Usuário não vinculado a uma paróquia",
        });
      }

      if (!comunidadeId) {
        return res.status(400).json({
          erro:
            "ID da comunidade inválido",
        });
      }

      if (
        !Number.isInteger(registroId) ||
        registroId <= 0
      ) {
        return res.status(400).json({
          erro:
            "ID do fechamento mensal inválido",
        });
      }

      /*
       * Primeira camada de isolamento:
       * a comunidade precisa pertencer à
       * paróquia autenticada.
       */
      const comunidade =
        await buscarComunidadeDaParoquia(
          comunidadeId,
          paroquiaId
        );

      if (!comunidade) {
        return res.status(404).json({
          erro:
            "Comunidade não encontrada nesta paróquia",
        });
      }

      /*
       * Segunda camada de isolamento:
       * o fechamento precisa pertencer à
       * comunidade já validada.
       */
      const registro =
        await RegistroMensal.findOne({
          where: {
            id: registroId,
            comunidadeId,
          },
        });

      if (!registro) {
        return res.status(404).json({
          erro:
            "Fechamento mensal não encontrado nesta comunidade",
        });
      }

      if (
        registro.mes === null ||
        registro.ano === null
      ) {
        return res.status(404).json({
          erro:
            "Este registro não corresponde a um fechamento mensal",
        });
      }

      const itens =
        await RegistroMensalItem.findAll({
          where: {
            registroMensalId:
              registro.id,
            comunidadeId,
          },

          attributes: [
            "id",
            "dizimistaId",
            "numero",
            "folha",
            "nome",
            "valor",
          ],

          order: [
            ["folha", "ASC"],
            ["numero", "ASC"],
          ],
        });

      return res.status(200).json({
        comunidade: {
          id: comunidade.id,
          nome: comunidade.nome,
          cidade: comunidade.cidade,
          paroquiaId:
            comunidade.paroquiaId,
        },

        fechamento: {
          id: registro.id,
          comunidade:
            registro.comunidade,
          comunidadeId:
            registro.comunidadeId,
          data: registro.data,
          mes: registro.mes,
          ano: registro.ano,
          total: registro.total,
          equipe_comunidade:
            registro.equipe_comunidade,
          conferido_em:
            registro.conferido_em,
          responsavel_paroquia:
            registro.responsavel_paroquia,
          createdAt:
            registro.createdAt,
        },

        quantidadeDizimistas:
          itens.length,

        itens,
      });

    } catch (error) {
      console.error(
        "Erro ao detalhar histórico mensal da comunidade pela paróquia:",
        error
      );

      return res.status(500).json({
        erro:
          "Erro ao detalhar o histórico mensal da comunidade",
      });
    }
  };

// ========================================
// LISTAR DIZIMISTAS DA COMUNIDADE
// ADMIN_PAROQUIA
// ========================================

export const listarDizimistasComunidadeParoquia =
  async (req, res) => {
    try {
      const paroquiaId =
        obterParoquiaIdUsuario(req);

      const comunidadeId =
        obterComunidadeId(req);

      if (!paroquiaId) {
        return res.status(403).json({
          erro:
            "Usuário não vinculado a uma paróquia",
        });
      }

      if (!comunidadeId) {
        return res.status(400).json({
          erro:
            "ID da comunidade inválido",
        });
      }

      /*
       * SEGURANÇA:
       * Antes de consultar qualquer dizimista,
       * validamos se a comunidade realmente
       * pertence à paróquia do ADMIN_PAROQUIA.
       */
      const comunidade =
        await buscarComunidadeDaParoquia(
          comunidadeId,
          paroquiaId
        );

      if (!comunidade) {
        return res.status(404).json({
          erro:
            "Comunidade não encontrada nesta paróquia",
        });
      }

      const dizimistas =
        await Dizimista.findAll({
          where: {
            comunidadeId,
          },

          attributes: [
            "id",
            "numero",
            "folha",
            "nome",
            "valor",
            "createdAt",
            "updatedAt",
          ],

          order: [
            ["folha", "ASC"],
            ["numero", "ASC"],
          ],
        });

      const total =
        dizimistas.reduce(
          (soma, dizimista) =>
            soma +
            Number(
              dizimista.valor || 0
            ),
          0
        );

      return res.status(200).json({
        comunidade: {
          id: comunidade.id,
          nome: comunidade.nome,
          cidade: comunidade.cidade,
          paroquiaId:
            comunidade.paroquiaId,
        },

        totalDizimistas:
          dizimistas.length,

        totalValor:
          Number(total.toFixed(2)),

        dizimistas,
      });

    } catch (error) {
      console.error(
        "Erro ao listar dizimistas da comunidade pela paróquia:",
        error
      );

      return res.status(500).json({
        erro:
          "Erro ao carregar os dizimistas da comunidade",
      });
    }
  };

