import { DataTypes } from "sequelize";
import sequelize from "../database/database.js";

const Dizimista = sequelize.define(
  "Dizimista",
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },

    numero: {
      type: DataTypes.INTEGER,
      allowNull: false,
      // NÃO usar unique: true aqui
    },

    folha: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 1,
    },

    nome: {
      type: DataTypes.STRING(150),
      allowNull: false,
    },

    valor: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
      defaultValue: 0,
    },

    comunidadeId: {
      type: DataTypes.INTEGER,
      allowNull: false,

      references: {
        model: "comunidades",
        key: "id",
      },
    },
  },
  {
    tableName: "dizimistas",
    timestamps: true,

    indexes: [
      {
        unique: true,
        fields: ["comunidadeId", "numero"],
        name: "uq_dizimistas_comunidade_numero",
      },
    ],
  }
);

export default Dizimista;