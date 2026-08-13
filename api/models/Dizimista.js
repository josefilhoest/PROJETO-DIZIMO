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
      unique: true,
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
  },
  {
    tableName: "dizimistas",
    timestamps: true,
  }
);

export default Dizimista;