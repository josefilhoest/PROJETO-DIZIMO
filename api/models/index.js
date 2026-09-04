import Paroquia from "./Paroquia.js";
import Comunidade from "./Comunidade.js";
import Usuario from "./Usuario.js";

// ========================================
// PARÓQUIA -> COMUNIDADES
// ========================================
//
// Uma paróquia pode possuir várias comunidades.
//
// Exemplo:
// Paróquia Nossa Senhora da Penha
//   -> Sucatinga
//   -> Palmeira
//   -> outras comunidades
//
// ========================================

Paroquia.hasMany(Comunidade, {
    foreignKey: "paroquiaId",
    as: "comunidades",
    onUpdate: "CASCADE",
    onDelete: "SET NULL",
});

Comunidade.belongsTo(Paroquia, {
    foreignKey: "paroquiaId",
    as: "paroquiaDados",
    onUpdate: "CASCADE",
    onDelete: "SET NULL",
});

// ========================================
// PARÓQUIA -> USUÁRIOS
// ========================================
//
// Permite identificar todos os usuários
// pertencentes a determinada paróquia.
//
// ADMIN_PAROQUIA:
//   paroquiaId identifica a paróquia
//   que ele administra.
//
// ADMIN_COMUNIDADE:
//   paroquiaId identifica a paróquia
//   à qual sua comunidade pertence.
//
// SUPER_ADMIN:
//   pode possuir paroquiaId = null.
//
// ========================================

Paroquia.hasMany(Usuario, {
    foreignKey: "paroquiaId",
    as: "usuarios",
    onUpdate: "CASCADE",
    onDelete: "SET NULL",
});

Usuario.belongsTo(Paroquia, {
    foreignKey: "paroquiaId",
    as: "paroquiaDados",
    onUpdate: "CASCADE",
    onDelete: "SET NULL",
});

// ========================================
// COMUNIDADE -> USUÁRIOS
// ========================================
//
// Uma comunidade pode possuir usuários
// vinculados a ela.
//
// ADMIN_COMUNIDADE:
//   comunidadeId identifica a comunidade
//   que ele administra.
//
// ADMIN_PAROQUIA:
//   comunidadeId identifica sua
//   comunidade-sede e permite utilizar
//   normalmente o sistema de dizimistas.
//
// ========================================

Comunidade.hasMany(Usuario, {
    foreignKey: "comunidadeId",
    as: "usuarios",
    onUpdate: "CASCADE",
    onDelete: "SET NULL",
});

Usuario.belongsTo(Comunidade, {
    foreignKey: "comunidadeId",
    as: "comunidade",
    onUpdate: "CASCADE",
    onDelete: "SET NULL",
});

// ========================================
// EXPORTAÇÕES
// ========================================

export {
    Paroquia,
    Comunidade,
    Usuario,
};