import { DataTypes } from "sequelize";
import sequelize from "../database/database.js";

const Usuario = sequelize.define(
  "Usuario",
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

    email: {
      type: DataTypes.STRING(150),
      allowNull: false,
      unique: true,
    },

    senha: {
      type: DataTypes.STRING(255),
      allowNull: false,
    },

    perfil: {
      type: DataTypes.STRING(50),
      allowNull: false,
      defaultValue: "ADMIN_COMUNIDADE",
    },

    // ========================================
    // COMUNIDADE DO USUÁRIO
    // ========================================

    comunidadeId: {
      type: DataTypes.INTEGER,
      allowNull: true,

      references: {
        model: "comunidades",
        key: "id",
      },
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
    },
  },
  {
    tableName: "usuarios",
    timestamps: true,
  }
);

export default Usuario;