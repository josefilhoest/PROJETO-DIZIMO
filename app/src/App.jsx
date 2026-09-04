import { useState } from "react";

import Tabela from "./components/Tabela";
import Login from "./components/Login";
import CadastroComunidade from "./components/CadastroComunidade";
import AdminDashboard from "./components/AdminDashboard";
import PainelParoquia from "./components/PainelParoquia";

import "./App.css";

function App() {
  // ========================================
  // USUÁRIO LOGADO
  // ========================================

  const [usuario, setUsuario] = useState(() => {
    const usuarioSalvo =
      localStorage.getItem("usuario");

    if (!usuarioSalvo) {
      return null;
    }

    try {
      return JSON.parse(usuarioSalvo);
    } catch {
      localStorage.removeItem("usuario");
      localStorage.removeItem("token");

      return null;
    }
  });

  // ========================================
  // TELA DO USUÁRIO LOGADO
  // ========================================
  //
  // sistema  -> tabela / própria comunidade
  // admin    -> painel SUPER_ADMIN
  // paroquia -> painel ADMIN_PAROQUIA
  //
  // ========================================

  const [telaLogada, setTelaLogada] =
    useState("sistema");

  // ========================================
  // LOGIN CONCLUÍDO
  // ========================================

  const entrar = (dadosUsuario) => {
    if (!dadosUsuario) {
      return;
    }

    localStorage.setItem(
      "usuario",
      JSON.stringify(dadosUsuario)
    );

    setUsuario(dadosUsuario);

    // ========================================
    // TELA INICIAL POR PERFIL
    // ========================================

    if (
      dadosUsuario.perfil ===
      "ADMIN_PAROQUIA" &&
      dadosUsuario.comunidadeId
    ) {
      setTelaLogada("paroquia");
      return;
    }

    setTelaLogada("sistema");
  };

  // ========================================
  // CADASTRO DA COMUNIDADE CONCLUÍDO
  // ========================================

  const comunidadeCadastrada = (
    dadosUsuarioAtualizados
  ) => {
    if (!dadosUsuarioAtualizados) {
      return;
    }

    localStorage.setItem(
      "usuario",
      JSON.stringify(
        dadosUsuarioAtualizados
      )
    );

    setUsuario(
      dadosUsuarioAtualizados
    );

    // ========================================
    // ADMIN_PAROQUIA
    // ========================================
    //
    // Depois de cadastrar sua comunidade-sede,
    // entra no Painel da Paróquia.
    //
    // ADMIN_COMUNIDADE continua indo
    // diretamente para sua tabela.
    //
    // ========================================

    if (
      dadosUsuarioAtualizados.perfil ===
      "ADMIN_PAROQUIA"
    ) {
      setTelaLogada("paroquia");
      return;
    }

    setTelaLogada("sistema");
  };

  // ========================================
  // SAIR DO SISTEMA
  // ========================================

  const sair = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("usuario");

    setUsuario(null);
    setTelaLogada("sistema");
  };

  // ========================================
  // USUÁRIO NÃO LOGADO
  // ========================================

  if (!usuario) {
    return (
      <Login onLogin={entrar} />
    );
  }

  // ========================================
  // USUÁRIO LICENCIADO SEM COMUNIDADE
  // ========================================
  //
  // ADMIN_COMUNIDADE:
  // cadastra sua comunidade.
  //
  // ADMIN_PAROQUIA:
  // cadastra sua comunidade-sede.
  //
  // ========================================

  const perfilPodeCadastrarComunidade =
    usuario.perfil ===
    "ADMIN_COMUNIDADE" ||
    usuario.perfil ===
    "ADMIN_PAROQUIA";

  const usuarioSemComunidade =
    perfilPodeCadastrarComunidade &&
    !usuario.comunidadeId;

  if (usuarioSemComunidade) {
    return (
      <CadastroComunidade
        usuario={usuario}
        onCadastroConcluido={
          comunidadeCadastrada
        }
        onSair={sair}
      />
    );
  }

  // ========================================
  // SEGURANÇA DE PERFIL
  // ========================================

  const perfisPermitidos = [
    "SUPER_ADMIN",
    "ADMIN_PAROQUIA",
    "ADMIN_COMUNIDADE",
  ];

  if (
    !perfisPermitidos.includes(
      usuario.perfil
    )
  ) {
    return (
      <div className="container">
        <div className="topo-sistema">
          <div>
            <h1 className="titulo-sistema">
              Sistema de Dízimo
            </h1>

            <p className="usuario-logado">
              Usuário: {usuario.nome}
            </p>
          </div>

          <button
            type="button"
            className="btn-sair"
            onClick={sair}
          >
            Sair
          </button>
        </div>

        <div
          style={{
            background: "#ffffff",
            borderRadius: "12px",
            padding: "24px",
            marginTop: "16px",
          }}
        >
          <h2>
            Acesso não autorizado
          </h2>

          <p>
            O perfil deste usuário não possui
            uma área liberada no sistema.
          </p>
        </div>
      </div>
    );
  }

  // ========================================
  // ADMIN_PAROQUIA
  // ========================================
  //
  // Possui duas áreas:
  //
  // 1. Painel da Paróquia
  //    -> trabalha com paroquiaId
  //
  // 2. Minha Comunidade
  //    -> trabalha com comunidadeId
  //
  // ========================================

  if (
    usuario.perfil ===
    "ADMIN_PAROQUIA"
  ) {
    return (
      <div className="container">
        <div className="topo-sistema">
          <div>
            <h1 className="titulo-sistema">
              Sistema de Dízimo
            </h1>

            <p className="usuario-logado">
              Usuário: {usuario.nome}
            </p>

            {usuario.paroquiaNome && (
              <p className="usuario-logado">
                Paróquia:{" "}
                {usuario.paroquiaNome}
              </p>
            )}

            {usuario.comunidadeNome && (
              <p className="usuario-logado">
                Comunidade:{" "}
                {usuario.comunidadeNome}
              </p>
            )}
          </div>

          <div>
            <button
              type="button"
              onClick={() =>
                setTelaLogada(
                  telaLogada ===
                    "paroquia"
                    ? "sistema"
                    : "paroquia"
                )
              }
            >
              {telaLogada ===
                "paroquia"
                ? "Minha Comunidade"
                : "Painel da Paróquia"}
            </button>

            <button
              type="button"
              className="btn-sair"
              onClick={sair}
            >
              Sair
            </button>
          </div>
        </div>

        {telaLogada ===
          "paroquia" && (
            <PainelParoquia
              usuario={usuario}
              onSair={sair}
            />
          )}

        {telaLogada ===
          "sistema" && (
            <Tabela
              usuario={usuario}
            />
          )}
      </div>
    );
  }

  // ========================================
  // SUPER_ADMIN / ADMIN_COMUNIDADE
  // ========================================

  return (
    <div className="container">
      <div className="topo-sistema">
        <div>
          <h1 className="titulo-sistema">
            Sistema de Dízimo
          </h1>

          <p className="usuario-logado">
            Usuário: {usuario.nome}
          </p>

          {usuario.comunidadeNome && (
            <p className="usuario-logado">
              Comunidade:{" "}
              {usuario.comunidadeNome}
            </p>
          )}
        </div>

        <div>
          {usuario.perfil ===
            "SUPER_ADMIN" && (
              <button
                type="button"
                onClick={() =>
                  setTelaLogada(
                    telaLogada ===
                      "admin"
                      ? "sistema"
                      : "admin"
                  )
                }
              >
                {telaLogada ===
                  "admin"
                  ? "Voltar ao Sistema"
                  : "Painel Administrativo"}
              </button>
            )}

          <button
            type="button"
            className="btn-sair"
            onClick={sair}
          >
            Sair
          </button>
        </div>
      </div>

      {telaLogada ===
        "sistema" && (
          <Tabela
            usuario={usuario}
          />
        )}

      {telaLogada ===
        "admin" &&
        usuario.perfil ===
        "SUPER_ADMIN" && (
          <AdminDashboard />
        )}
    </div>
  );
}

export default App;