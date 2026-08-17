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

    comunidade: {
      type: DataTypes.STRING(150),
      allowNull: false,
      defaultValue: "Palmeira",
    },

    comunidadeId: {
      type: DataTypes.INTEGER,
      allowNull: false,

      references: {
        model: "comunidades",
        key: "id",
      },
    },

    data: {
      type: DataTypes.DATEONLY,
      allowNull: true,
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
  }
);

export default RegistroMensal;