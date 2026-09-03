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
    const usuarioSalvo = localStorage.getItem("usuario");

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
  // sistema | admin
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
      JSON.stringify(dadosUsuarioAtualizados)
    );

    setUsuario(dadosUsuarioAtualizados);
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
    return <Login onLogin={entrar} />;
  }

  // ========================================
  // ADMIN_COMUNIDADE SEM COMUNIDADE
  //
  // Somente ADMIN_COMUNIDADE pode cadastrar
  // a própria comunidade no primeiro acesso.
  // ========================================

  const adminSemComunidade =
    usuario.perfil === "ADMIN_COMUNIDADE" &&
    !usuario.comunidadeId;

  if (adminSemComunidade) {
    return (
      <CadastroComunidade
        usuario={usuario}
        onCadastroConcluido={comunidadeCadastrada}
        onSair={sair}
      />
    );
  }

  // ========================================
  // ADMIN_PAROQUIA
  //
  // Possui área própria. Ele não cai na
  // Tabela.jsx, pois não administra uma única
  // comunidade. O backend continua sendo a
  // autoridade de segurança e isolamento.
  // ========================================

  if (usuario.perfil === "ADMIN_PAROQUIA") {
    return (
      <PainelParoquia
        usuario={usuario}
        onSair={sair}
      />
    );
  }

  // ========================================
  // SEGURANÇA DE PERFIL
  //
  // Perfis desconhecidos não recebem acesso
  // à tabela por padrão.
  // ========================================

  const perfisPermitidosNoSistema = [
    "SUPER_ADMIN",
    "ADMIN_COMUNIDADE",
  ];

  if (
    !perfisPermitidosNoSistema.includes(
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
          <h2>Acesso não autorizado</h2>

          <p>
            O perfil deste usuário não possui uma
            área liberada no sistema.
          </p>
        </div>
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
        </div>

        <div>
          {usuario.perfil === "SUPER_ADMIN" && (
            <button
              type="button"
              onClick={() =>
                setTelaLogada(
                  telaLogada === "admin"
                    ? "sistema"
                    : "admin"
                )
              }
            >
              {telaLogada === "admin"
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

      {telaLogada === "sistema" && (
        <Tabela usuario={usuario} />
      )}

      {telaLogada === "admin" &&
        usuario.perfil === "SUPER_ADMIN" && (
          <AdminDashboard />
        )}
    </div>
  );
}

export default App;
