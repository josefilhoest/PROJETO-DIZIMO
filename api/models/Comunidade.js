import { DataTypes } from "sequelize";
import sequelize from "../database/database.js";

const Comunidade = sequelize.define(
  "Comunidade",
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },

    nome: {
      type: DataTypes.STRING(150),
      allowNull: false,
    },

    paroquia: {
      type: DataTypes.STRING(150),
      allowNull: true,
    },
    paroquiaId: {
      type: DataTypes.INTEGER,
      allowNull: true,

      references: {
        model: "paroquias",
        key: "id",
      },
    },

    cidade: {
      type: DataTypes.STRING(100),
      allowNull: true,
    },

    ativa: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: true,
    },
  },
  {
    tableName: "comunidades",
    timestamps: true,
  }
);

export default Comunidade;