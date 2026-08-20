import { useEffect, useState } from "react";
import api from "../api/api";

function AdminDashboard() {
    const [resumo, setResumo] = useState(null);
    const [erro, setErro] = useState("");
    const [carregando, setCarregando] = useState(true);

    const [aba, setAba] = useState("visao-geral");

    const [usuarios, setUsuarios] = useState([]);
    const [carregandoUsuarios, setCarregandoUsuarios] =
        useState(false);

    const [erroUsuarios, setErroUsuarios] = useState("");

    const [usuarioAlterando, setUsuarioAlterando] =
        useState(null);

    // ========================================
    // CARREGAR RESUMO DO DASHBOARD
    // ========================================

    useEffect(() => {
        const carregarDashboard = async () => {
            try {
                const resposta = await api.get("/admin/dashboard");

                setResumo(resposta.data);
            } catch (error) {
                console.error(
                    "Erro ao carregar dashboard:",
                    error
                );

                setErro(
                    "Não foi possível carregar o painel administrativo."
                );
            } finally {
                setCarregando(false);
            }
        };

        carregarDashboard();
    }, []);

    // ========================================
    // CARREGAR USUÁRIOS
    // ========================================

    useEffect(() => {
        if (aba !== "usuarios") {
            return;
        }

        carregarUsuarios();
    }, [aba]);

    const carregarUsuarios = async () => {
        try {
            setCarregandoUsuarios(true);
            setErroUsuarios("");

            const resposta = await api.get(
                "/admin/usuarios"
            );

            setUsuarios(resposta.data);
        } catch (error) {
            console.error(
                "Erro ao carregar usuários:",
                error
            );

            setErroUsuarios(
                "Não foi possível carregar os usuários."
            );
        } finally {
            setCarregandoUsuarios(false);
        }
    };

    // ========================================
    // ALTERAR LICENÇA
    // ========================================

    const alterarLicenca = async (
        usuarioId,
        novoStatus
    ) => {
        try {
            setUsuarioAlterando(usuarioId);
            setErroUsuarios("");

            await api.patch(
                `/admin/usuarios/${usuarioId}/licenca`,
                {
                    licencaStatus: novoStatus,
                }
            );

            // Atualiza a tabela imediatamente
            setUsuarios((usuariosAtuais) =>
                usuariosAtuais.map((usuario) =>
                    usuario.id === usuarioId
                        ? {
                            ...usuario,
                            licencaStatus: novoStatus,
                        }
                        : usuario
                )
            );
        } catch (error) {
            console.error(
                "Erro ao alterar licença:",
                error
            );

            const mensagem =
                error.response?.data?.erro ||
                "Não foi possível alterar a licença.";

            setErroUsuarios(mensagem);
        } finally {
            setUsuarioAlterando(null);
        }
    };

    // ========================================
    // CONFIRMAR BLOQUEIO
    // ========================================

    const bloquearLicenca = (usuario) => {
        const confirmar = window.confirm(
            `Deseja realmente bloquear a licença de ${usuario.nome}?`
        );

        if (!confirmar) {
            return;
        }

        alterarLicenca(
            usuario.id,
            "BLOQUEADA"
        );
    };

    // ========================================
    // CONFIRMAR REATIVAÇÃO
    // ========================================

    const reativarLicenca = (usuario) => {
        const confirmar = window.confirm(
            `Deseja reativar a licença de ${usuario.nome}?`
        );

        if (!confirmar) {
            return;
        }

        alterarLicenca(
            usuario.id,
            "ATIVA"
        );
    };

    // ========================================
    // CARREGANDO DASHBOARD
    // ========================================

    if (carregando) {
        return (
            <div className="admin-dashboard">
                <p>Carregando painel...</p>
            </div>
        );
    }

    // ========================================
    // ERRO DASHBOARD
    // ========================================

    if (erro) {
        return (
            <div className="admin-dashboard">
                <p>{erro}</p>
            </div>
        );
    }

    // ========================================
    // PAINEL
    // ========================================

    return (
        <div className="admin-dashboard">

            <h2>Painel Administrativo</h2>

            {/* ========================================
          MENU
      ======================================== */}

            <div className="admin-menu">

                <button
                    type="button"
                    onClick={() =>
                        setAba("visao-geral")
                    }
                >
                    Visão Geral
                </button>

                <button
                    type="button"
                    onClick={() =>
                        setAba("comunidades")
                    }
                >
                    Comunidades
                </button>

                <button
                    type="button"
                    onClick={() =>
                        setAba("usuarios")
                    }
                >
                    Usuários / Licenças
                </button>

            </div>

            {/* ========================================
          VISÃO GERAL
      ======================================== */}

            {aba === "visao-geral" && (
                <div className="admin-cards">

                    <div className="admin-card">
                        <h3>Comunidades</h3>

                        <strong>
                            {resumo?.totalComunidades ?? 0}
                        </strong>
                    </div>

                    <div className="admin-card">
                        <h3>Comunidades Ativas</h3>

                        <strong>
                            {resumo?.comunidadesAtivas ?? 0}
                        </strong>
                    </div>

                    <div className="admin-card">
                        <h3>Usuários</h3>

                        <strong>
                            {resumo?.totalUsuarios ?? 0}
                        </strong>
                    </div>

                    <div className="admin-card">
                        <h3>Usuários Ativos</h3>

                        <strong>
                            {resumo?.usuariosAtivos ?? 0}
                        </strong>
                    </div>

                    <div className="admin-card">
                        <h3>Dizimistas</h3>

                        <strong>
                            {resumo?.totalDizimistas ?? 0}
                        </strong>
                    </div>

                </div>
            )}

            {/* ========================================
          COMUNIDADES
      ======================================== */}

            {aba === "comunidades" && (
                <div className="admin-secao">

                    <h3>
                        Gerenciamento de Comunidades
                    </h3>

                    <p>
                        Em desenvolvimento...
                    </p>

                </div>
            )}

            {/* ========================================
          USUÁRIOS / LICENÇAS
      ======================================== */}

            {aba === "usuarios" && (
                <div className="admin-secao">

                    <h3>Usuários e Licenças</h3>

                    {carregandoUsuarios && (
                        <p>
                            Carregando usuários...
                        </p>
                    )}

                    {erroUsuarios && (
                        <p className="admin-erro">
                            {erroUsuarios}
                        </p>
                    )}

                    {!carregandoUsuarios &&
                        !erroUsuarios &&
                        usuarios.length === 0 && (
                            <p>
                                Nenhum usuário encontrado.
                            </p>
                        )}

                    {!carregandoUsuarios &&
                        usuarios.length > 0 && (

                            <div className="admin-tabela-wrapper">

                                <table className="admin-tabela">

                                    <thead>
                                        <tr>
                                            <th>Nome</th>
                                            <th>E-mail</th>
                                            <th>Perfil</th>
                                            <th>Comunidade</th>
                                            <th>Status</th>
                                            <th>Licença</th>
                                            <th>Ações</th>
                                        </tr>
                                    </thead>

                                    <tbody>

                                        {usuarios.map((usuario) => {

                                            const alterando =
                                                usuarioAlterando ===
                                                usuario.id;

                                            const ehSuperAdmin =
                                                usuario.perfil ===
                                                "SUPER_ADMIN";

                                            return (
                                                <tr key={usuario.id}>

                                                    <td>
                                                        {usuario.nome}
                                                    </td>

                                                    <td>
                                                        {usuario.email}
                                                    </td>

                                                    <td>
                                                        {usuario.perfil}
                                                    </td>

                                                    <td>
                                                        {usuario.comunidadeNome ||
                                                            "Sem comunidade"}
                                                    </td>

                                                    <td>

                                                        {usuario.ativo ? (
                                                            <span className="status-ativo">
                                                                Ativo
                                                            </span>
                                                        ) : (
                                                            <span className="status-inativo">
                                                                Inativo
                                                            </span>
                                                        )}

                                                    </td>

                                                    <td>

                                                        {usuario.licencaStatus ===
                                                            "ATIVA" ? (
                                                            <span className="licenca-ativa">
                                                                ATIVA
                                                            </span>
                                                        ) : (
                                                            <span className="licenca-bloqueada">
                                                                {usuario.licencaStatus ||
                                                                    "SEM STATUS"}
                                                            </span>
                                                        )}

                                                    </td>

                                                    <td>

                                                        {ehSuperAdmin ? (
                                                            <span className="admin-sem-acao">
                                                                Protegido
                                                            </span>
                                                        ) : usuario.licencaStatus ===
                                                            "ATIVA" ? (

                                                            <button
                                                                type="button"
                                                                className="btn-bloquear-licenca"
                                                                disabled={alterando}
                                                                onClick={() =>
                                                                    bloquearLicenca(
                                                                        usuario
                                                                    )
                                                                }
                                                            >
                                                                {alterando
                                                                    ? "Alterando..."
                                                                    : "Bloquear"}
                                                            </button>

                                                        ) : (

                                                            <button
                                                                type="button"
                                                                className="btn-reativar-licenca"
                                                                disabled={alterando}
                                                                onClick={() =>
                                                                    reativarLicenca(
                                                                        usuario
                                                                    )
                                                                }
                                                            >
                                                                {alterando
                                                                    ? "Alterando..."
                                                                    : "Reativar"}
                                                            </button>

                                                        )}

                                                    </td>

                                                </tr>
                                            );
                                        })}

                                    </tbody>

                                </table>

                            </div>

                        )}

                </div>
            )}

        </div>
    );
}

export default AdminDashboard;