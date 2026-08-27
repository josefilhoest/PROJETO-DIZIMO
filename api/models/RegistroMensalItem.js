import { DataTypes } from "sequelize";
import sequelize from "../database/database.js";

const RegistroMensalItem = sequelize.define(
    "RegistroMensalItem",
    {
        id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true,
        },

        registroMensalId: {
            type: DataTypes.INTEGER,
            allowNull: false,

            references: {
                model: "registros_mensais",
                key: "id",
            },

            onUpdate: "CASCADE",
            onDelete: "CASCADE",
        },

        comunidadeId: {
            type: DataTypes.INTEGER,
            allowNull: false,

            references: {
                model: "comunidades",
                key: "id",
            },
        },

        // Guardamos o ID original apenas como referência histórica.
        // Não colocamos FK obrigatória para o histórico continuar válido
        // mesmo se futuramente o dizimista for removido.
        dizimistaId: {
            type: DataTypes.INTEGER,
            allowNull: true,
        },

        // Fotografia dos dados no momento do fechamento.
        numero: {
            type: DataTypes.INTEGER,
            allowNull: false,
        },

        folha: {
            type: DataTypes.INTEGER,
            allowNull: false,
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
        tableName: "registro_mensal_itens",
        timestamps: true,

        indexes: [
            {
                name: "idx_registro_mensal_item_registro",
                fields: ["registroMensalId"],
            },

            {
                name: "idx_registro_mensal_item_comunidade",
                fields: ["comunidadeId"],
            },

            {
                name: "idx_registro_mensal_item_numero",
                fields: ["registroMensalId", "numero"],
            },
        ],
    }
);

export default RegistroMensalItem;