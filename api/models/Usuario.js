import { DataTypes } from "sequelize";
import sequelize from "../database/database.js";

const Usuario = sequelize.define(
  "Usuario",
  {
    // ========================================
    // ID
    // ========================================

    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },

    // ========================================
    // DADOS DO USUÁRIO
    // ========================================

    nome: {
      type: DataTypes.STRING(150),
      allowNull: false,

      validate: {
        notEmpty: {
          msg: "O nome do usuário é obrigatório.",
        },

        len: {
          args: [2, 150],
          msg: "O nome deve ter entre 2 e 150 caracteres.",
        },
      },
    },

    email: {
      type: DataTypes.STRING(150),
      allowNull: false,
      unique: true,

      validate: {
        notEmpty: {
          msg: "O e-mail é obrigatório.",
        },

        isEmail: {
          msg: "Informe um e-mail válido.",
        },
      },
    },

    senha: {
      type: DataTypes.STRING(255),
      allowNull: false,
    },

    // ========================================
    // PERFIL / NÍVEL DE ACESSO
    // ========================================
    //
    // SUPER_ADMIN
    //   → acesso administrativo geral
    //
    // ADMIN_PAROQUIA
    //   → administra somente a própria paróquia
    //   → pode possuir comunidadeId da comunidade-sede
    //
    // ADMIN_COMUNIDADE
    //   → administra somente a própria comunidade
    //
    // ========================================

    perfil: {
      type: DataTypes.STRING(50),
      allowNull: false,
      defaultValue: "ADMIN_COMUNIDADE",

      validate: {
        isIn: {
          args: [
            [
              "SUPER_ADMIN",
              "ADMIN_PAROQUIA",
              "ADMIN_COMUNIDADE",
            ],
          ],

          msg: "Perfil de usuário inválido.",
        },
      },
    },

    // ========================================
    // PARÓQUIA DO USUÁRIO
    // ========================================
    //
    // ADMIN_PAROQUIA:
    // identifica qual paróquia ele administra.
    //
    // ADMIN_COMUNIDADE:
    // identifica a qual paróquia sua comunidade
    // pertence.
    //
    // SUPER_ADMIN:
    // pode permanecer null.
    //
    // ========================================

    paroquiaId: {
      type: DataTypes.INTEGER,
      allowNull: true,

      references: {
        model: "paroquias",
        key: "id",
      },

      onUpdate: "CASCADE",
      onDelete: "SET NULL",
    },

    // ========================================
    // COMUNIDADE DO USUÁRIO
    // ========================================
    //
    // ADMIN_COMUNIDADE:
    // comunidade que ele administra.
    //
    // ADMIN_PAROQUIA:
    // comunidade-sede onde ficam os próprios
    // dizimistas da paróquia.
    //
    // Pode inicialmente ser null durante o
    // processo de cadastro/vinculação.
    //
    // ========================================

    comunidadeId: {
      type: DataTypes.INTEGER,
      allowNull: true,

      references: {
        model: "comunidades",
        key: "id",
      },

      onUpdate: "CASCADE",
      onDelete: "SET NULL",
    },

    // ========================================
    // USUÁRIO ATIVO / DESATIVADO
    // ========================================

    ativo: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: true,
    },

    // ========================================
    // LICENÇA DO SISTEMA
    // ========================================

    licencaStatus: {
      type: DataTypes.STRING(30),
      allowNull: false,
      defaultValue: "ATIVA",

      validate: {
        isIn: {
          args: [["ATIVA", "BLOQUEADA"]],
          msg: "Status de licença inválido.",
        },
      },
    },
  },
  {
    tableName: "usuarios",
    timestamps: true,

    // ========================================
    // ÍNDICES
    // ========================================

    indexes: [
      {
        fields: ["paroquiaId"],
      },

      {
        fields: ["comunidadeId"],
      },

      {
        fields: ["perfil"],
      },
    ],
  }
);

export default Usuario;