import { DataTypes } from "sequelize";
import sequelize from "../database/database.js";

const RegistroMensal = sequelize.define(
  "RegistroMensal",
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },

    // Nome da comunidade no momento do fechamento.
    // Mantemos este campo porque ele já existe no sistema.
    comunidade: {
      type: DataTypes.STRING(150),
      allowNull: false,
    },

    // Comunidade dona deste registro.
    comunidadeId: {
      type: DataTypes.INTEGER,
      allowNull: false,

      references: {
        model: "comunidades",
        key: "id",
      },
    },

    // Data original já utilizada pelo sistema.
    data: {
      type: DataTypes.DATEONLY,
      allowNull: true,
    },

    // Mês referente ao fechamento.
    // Exemplo: 8 = agosto.
    mes: {
      type: DataTypes.INTEGER,
      allowNull: true,

      validate: {
        min: 1,
        max: 12,
      },
    },

    // Ano referente ao fechamento.
    // Exemplo: 2026.
    ano: {
      type: DataTypes.INTEGER,
      allowNull: true,

      validate: {
        min: 2000,
        max: 2100,
      },
    },

    // Total arrecadado no momento do fechamento.
    total: {
      type: DataTypes.DECIMAL(12, 2),
      allowNull: false,
      defaultValue: 0,
    },

    equipe_comunidade: {
      type: DataTypes.STRING(255),
      allowNull: true,
    },

    conferido_em: {
      type: DataTypes.DATEONLY,
      allowNull: true,
    },

    responsavel_paroquia: {
      type: DataTypes.STRING(255),
      allowNull: true,
    },
  },
  {
    tableName: "registros_mensais",
    timestamps: true,

    indexes: [
      {
        name: "idx_registro_mensal_comunidade",
        fields: ["comunidadeId"],
      },

      {
        name: "idx_registro_mensal_mes_ano",
        fields: ["comunidadeId", "ano", "mes"],
      },
    ],
  }
);

export default RegistroMensal;