import { useState } from "react";

import Tabela from "./components/Tabela";
import Login from "./components/Login";
import CadastroComunidade from "./components/CadastroComunidade";

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

  const sair = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("usuario");

    setUsuario(null);
    setTelaAcesso("login");
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

        <button
          type="button"
          className="btn-sair"
          onClick={sair}
        >
          Sair
        </button>
      </div>

      <Tabela usuario={usuario} />
    </div>
  );
}

export default App;