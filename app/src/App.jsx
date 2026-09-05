import { useEffect, useRef, useState } from "react";

import Tabela from "./components/Tabela";
import Login from "./components/Login";
import CadastroComunidade from "./components/CadastroComunidade";
import AdminDashboard from "./components/AdminDashboard";
import PainelParoquia from "./components/PainelParoquia";

import "./App.css";



const TEMPO_INATIVIDADE_MS = 30 * 60 * 1000;
const TEMPO_AVISO_MS = 28 * 60 * 1000;

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
      localStorage.removeItem("ultimaAtividadeSessao");

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

  const [telaLogada, setTelaLogada] = useState(() => {
    const usuarioSalvo = localStorage.getItem("usuario");

    if (!usuarioSalvo) {
      return "sistema";
    }

    try {
      const dadosUsuario = JSON.parse(usuarioSalvo);

      if (dadosUsuario.perfil === "SUPER_ADMIN") {
        return "admin";
      }

      if (dadosUsuario.perfil === "ADMIN_PAROQUIA") {
        return "paroquia";
      }

      return "sistema";
    } catch {
      return "sistema";
    }
  });

  // ========================================
  // CONTROLE DE INATIVIDADE
  // ========================================

  const [sessaoExpirando, setSessaoExpirando] =
    useState(false);

  const timerAvisoRef = useRef(null);
  const timerLogoutRef = useRef(null);
  const ultimaAtividadeRef = useRef(Date.now());
  const ultimoRegistroEventoRef = useRef(0);

  // ========================================
  // SAIR DO SISTEMA
  // ========================================

  const sair = () => {
    if (timerAvisoRef.current) {
      clearTimeout(timerAvisoRef.current);
    }

    if (timerLogoutRef.current) {
      clearTimeout(timerLogoutRef.current);
    }

    localStorage.removeItem("token");
    localStorage.removeItem("usuario");
    localStorage.removeItem("ultimaAtividadeSessao");

    setSessaoExpirando(false);
    setUsuario(null);
    setTelaLogada("sistema");
  };

  // ========================================
  // REINICIAR CONTAGEM DE INATIVIDADE
  // ========================================

  const reiniciarTemporizadoresSessao = () => {
    if (!usuario) {
      return;
    }

    if (timerAvisoRef.current) {
      clearTimeout(timerAvisoRef.current);
    }

    if (timerLogoutRef.current) {
      clearTimeout(timerLogoutRef.current);
    }

    setSessaoExpirando(false);

    timerAvisoRef.current = setTimeout(() => {
      setSessaoExpirando(true);
    }, TEMPO_AVISO_MS);

    timerLogoutRef.current = setTimeout(() => {
      sair();
    }, TEMPO_INATIVIDADE_MS);
  };

  // ========================================
  // REGISTRAR ATIVIDADE DO USUÁRIO
  // ========================================

  const registrarAtividade = () => {
    if (!usuario) {
      return;
    }

    const agora = Date.now();

    // Evita gravar no localStorage dezenas de vezes
    // por segundo durante movimento do mouse.
    if (
      agora - ultimoRegistroEventoRef.current <
      1000
    ) {
      return;
    }

    ultimoRegistroEventoRef.current = agora;
    ultimaAtividadeRef.current = agora;

    localStorage.setItem(
      "ultimaAtividadeSessao",
      String(agora)
    );

    reiniciarTemporizadoresSessao();
  };

  // ========================================
  // VERIFICAR TEMPO REAL DA SESSÃO
  // ========================================
  //
  // Essa verificação é importante quando o
  // navegador fica em segundo plano ou o
  // computador entra em suspensão.
  //
  // ========================================

  const verificarTempoSessao = () => {
    if (!usuario) {
      return;
    }

    const agora = Date.now();

    const ultimaAtividadeSalva = Number(
      localStorage.getItem(
        "ultimaAtividadeSessao"
      ) || ultimaAtividadeRef.current
    );

    const tempoSemAtividade =
      agora - ultimaAtividadeSalva;

    if (
      tempoSemAtividade >=
      TEMPO_INATIVIDADE_MS
    ) {
      sair();
      return;
    }

    if (
      tempoSemAtividade >=
      TEMPO_AVISO_MS
    ) {
      setSessaoExpirando(true);
    }
  };

  // ========================================
  // ATIVAR MONITORAMENTO DE INATIVIDADE
  // ========================================

  useEffect(() => {
    if (!usuario) {
      return undefined;
    }

    const agora = Date.now();

    ultimaAtividadeRef.current = agora;

    localStorage.setItem(
      "ultimaAtividadeSessao",
      String(agora)
    );

    reiniciarTemporizadoresSessao();

    const eventos = [
      "mousemove",
      "mousedown",
      "keydown",
      "scroll",
      "touchstart",
      "click",
    ];

    eventos.forEach((evento) => {
      window.addEventListener(
        evento,
        registrarAtividade,
        { passive: true }
      );
    });

    const aoFocarJanela = () => {
      verificarTempoSessao();
    };

    const aoMudarVisibilidade = () => {
      if (
        document.visibilityState === "visible"
      ) {
        verificarTempoSessao();
      }
    };

    window.addEventListener(
      "focus",
      aoFocarJanela
    );

    document.addEventListener(
      "visibilitychange",
      aoMudarVisibilidade
    );

    return () => {
      eventos.forEach((evento) => {
        window.removeEventListener(
          evento,
          registrarAtividade
        );
      });

      window.removeEventListener(
        "focus",
        aoFocarJanela
      );

      document.removeEventListener(
        "visibilitychange",
        aoMudarVisibilidade
      );

      if (timerAvisoRef.current) {
        clearTimeout(timerAvisoRef.current);
      }

      if (timerLogoutRef.current) {
        clearTimeout(timerLogoutRef.current);
      }
    };
  }, [usuario]);

  // ========================================
  // CONTINUAR CONECTADO
  // ========================================

  const continuarConectado = () => {
    registrarAtividade();
  };

  // ========================================
  // AVISO DE SESSÃO
  // ========================================

  const avisoSessao = sessaoExpirando ? (
    <div
      style={{
        position: "fixed",
        inset: 0,
        background: "rgba(0, 0, 0, 0.45)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 9999,
        padding: "20px",
      }}
    >
      <div
        style={{
          width: "100%",
          maxWidth: "430px",
          background: "#ffffff",
          borderRadius: "14px",
          padding: "24px",
          boxShadow:
            "0 18px 50px rgba(0, 0, 0, 0.25)",
        }}
      >
        <h2
          style={{
            marginTop: 0,
            marginBottom: "10px",
          }}
        >
          Sessão prestes a expirar
        </h2>

        <p
          style={{
            marginTop: 0,
            lineHeight: 1.5,
          }}
        >
          Por segurança, sua sessão será encerrada
          após 30 minutos sem atividade.
          Você está há aproximadamente 28 minutos
          sem utilizar o sistema.
        </p>

        <p
          style={{
            fontWeight: 600,
          }}
        >
          Deseja continuar conectado?
        </p>

        <div
          style={{
            display: "flex",
            gap: "10px",
            justifyContent: "flex-end",
            flexWrap: "wrap",
          }}
        >
          <button
            type="button"
            className="btn-sair"
            onClick={sair}
          >
            Sair agora
          </button>

          <button
            type="button"
            onClick={continuarConectado}
          >
            Continuar conectado
          </button>
        </div>
      </div>
    </div>
  ) : null;

  // ========================================
  // LOGIN CONCLUÍDO
  // ========================================

  const entrar = (dadosUsuario) => {
    if (!dadosUsuario) {
      return;
    }

    const agora = Date.now();

    localStorage.setItem(
      "usuario",
      JSON.stringify(dadosUsuario)
    );

    localStorage.setItem(
      "ultimaAtividadeSessao",
      String(agora)
    );

    ultimaAtividadeRef.current = agora;

    setUsuario(dadosUsuario);

    // ========================================
    // TELA INICIAL POR PERFIL
    // ========================================

    if (
      dadosUsuario.perfil ===
      "SUPER_ADMIN"
    ) {
      setTelaLogada("admin");
      return;
    }

    if (
      dadosUsuario.perfil ===
      "ADMIN_PAROQUIA"
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
  // USUÁRIO NÃO LOGADO
  // ========================================

  if (!usuario) {
    return <Login onLogin={entrar} />;
  }

  // ========================================
  // USUÁRIO LICENCIADO SEM COMUNIDADE
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
      <>
        {avisoSessao}

        <CadastroComunidade
          usuario={usuario}
          onCadastroConcluido={
            comunidadeCadastrada
          }
          onSair={sair}
        />
      </>
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
      <>
        {avisoSessao}

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
      </>
    );
  }

  // ========================================
  // SUPER_ADMIN
  // ========================================

  if (
    usuario.perfil ===
    "SUPER_ADMIN"
  ) {
    return (
      <>
        {avisoSessao}

        <div className="container">
          <div className="topo-sistema">
            <div>
              <h1 className="titulo-sistema">
                Sistema de Dízimo
              </h1>

              <p className="usuario-logado">
                Usuário: {usuario.nome}
              </p>

              <p className="usuario-logado">
                Administração Geral
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

          <AdminDashboard />
        </div>
      </>
    );
  }

  // ========================================
  // ADMIN_PAROQUIA
  // ========================================

  if (
    usuario.perfil ===
    "ADMIN_PAROQUIA"
  ) {
    return (
      <>
        {avisoSessao}

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
      </>
    );
  }

  // ========================================
  // ADMIN_COMUNIDADE
  // ========================================

  return (
    <>
      {avisoSessao}

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
    </>
  );
}

export default App;
