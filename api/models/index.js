import Paroquia from "./Paroquia.js";
import Comunidade from "./Comunidade.js";
import Usuario from "./Usuario.js";

// ========================================
// ASSOCIAÇÕES - PARÓQUIA
// ========================================

Paroquia.hasMany(Comunidade, {
    foreignKey: "paroquiaId",
    as: "comunidades",
});

Comunidade.belongsTo(Paroquia, {
    foreignKey: "paroquiaId",
    as: "paroquiaDados",
});

// ========================================
// PARÓQUIA - USUÁRIOS
// ========================================

Paroquia.hasMany(Usuario, {
    foreignKey: "paroquiaId",
    as: "usuarios",
});

Usuario.belongsTo(Paroquia, {
    foreignKey: "paroquiaId",
    as: "paroquiaDados",
});

// ========================================
// COMUNIDADE - USUÁRIOS
// ========================================

Comunidade.hasMany(Usuario, {
    foreignKey: "comunidadeId",
    as: "usuarios",
});

Usuario.belongsTo(Comunidade, {
    foreignKey: "comunidadeId",
    as: "comunidade",
});

export {
    Paroquia,
    Comunidade,
    Usuario,
};