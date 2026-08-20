import { useState } from "react";

import Tabela from "./components/Tabela";
import Login from "./components/Login";
import CadastroComunidade from "./components/CadastroComunidade";
import AdminDashboard from "./components/AdminDashboard";

import "./App.css";

function App() {
  const [usuario, setUsuario] = useState(() => {
    const usuarioSalvo = localStorage.getItem("usuario");

    if (!usuarioSalvo) {
      return null;
    }

    try {
      return JSON.parse(usuarioSalvo);
    } catch {
      return null;
    }
  });

  const [telaAcesso, setTelaAcesso] = useState("login");
  const [telaLogada, setTelaLogada] = useState("sistema");

  const sair = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("usuario");

    setUsuario(null);
    setTelaAcesso("login");
    setTelaLogada("sistema");
  };

  // ========================================
  // USUÁRIO NÃO LOGADO
  // ========================================

  if (!usuario) {
    if (telaAcesso === "cadastro") {
      return (
        <CadastroComunidade
          onVoltar={() => setTelaAcesso("login")}
        />
      );
    }

    return (
      <Login
        onLogin={setUsuario}
        onCadastrarComunidade={() =>
          setTelaAcesso("cadastro")
        }
      />
    );
  }

  // ========================================
  // USUÁRIO LOGADO
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

      {telaLogada === "admin" && (
        <AdminDashboard />
      )}
    </div>
  );
}

export default App;