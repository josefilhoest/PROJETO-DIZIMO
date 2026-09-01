import { DataTypes } from "sequelize";
import sequelize from "../database/database.js";

const Paroquia = sequelize.define(
    "Paroquia",
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
        tableName: "paroquias",
        timestamps: true,
    }
);

export default Paroquia;