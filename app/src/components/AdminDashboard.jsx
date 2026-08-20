import { useEffect, useState } from "react";
import api from "../api/api";

function AdminDashboard() {
    // ========================================
    // USUÁRIO LOGADO
    // ========================================

    const usuarioLogado = (() => {
        try {
            const usuarioSalvo =
                localStorage.getItem("usuario");

            return usuarioSalvo
                ? JSON.parse(usuarioSalvo)
                : null;
        } catch {
            return null;
        }
    })();

    // ========================================
    // ESTADOS DO DASHBOARD
    // ========================================

    const [resumo, setResumo] = useState(null);
    const [erro, setErro] = useState("");
    const [carregando, setCarregando] =
        useState(true);

    const [aba, setAba] =
        useState("visao-geral");

    // ========================================
    // ESTADOS DE USUÁRIOS
    // ========================================

    const [usuarios, setUsuarios] =
        useState([]);

    const [
        carregandoUsuarios,
        setCarregandoUsuarios,
    ] = useState(false);

    const [
        erroUsuarios,
        setErroUsuarios,
    ] = useState("");

    const [
        usuarioAlterandoStatus,
        setUsuarioAlterandoStatus,
    ] = useState(null);

    const [
        usuarioAlterandoLicenca,
        setUsuarioAlterandoLicenca,
    ] = useState(null);

    const [
        mostrarFormularioUsuario,
        setMostrarFormularioUsuario,
    ] = useState(false);

    const [novoUsuario, setNovoUsuario] =
        useState({
            nome: "",
            email: "",
            senha: "",
            perfil: "ADMIN_COMUNIDADE",
            licencaStatus: "ATIVA",
        });

    const [
        cadastrandoUsuario,
        setCadastrandoUsuario,
    ] = useState(false);

    const [
        mensagemUsuario,
        setMensagemUsuario,
    ] = useState("");

    // ========================================
    // ESTADOS DE COMUNIDADES
    // ========================================

    const [comunidades, setComunidades] =
        useState([]);

    const [
        carregandoComunidades,
        setCarregandoComunidades,
    ] = useState(false);

    const [
        erroComunidades,
        setErroComunidades,
    ] = useState("");

    const [
        comunidadeAlterando,
        setComunidadeAlterando,
    ] = useState(null);

    // ========================================
    // CARREGAR RESUMO DO DASHBOARD
    // ========================================

    useEffect(() => {
        const carregarDashboard = async () => {
            try {
                const resposta = await api.get(
                    "/admin/dashboard"
                );

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
    // CARREGAR USUÁRIOS AO ABRIR A ABA
    // ========================================

    useEffect(() => {
        if (aba !== "usuarios") {
            return;
        }

        carregarUsuarios();
    }, [aba]);

    // ========================================
    // CARREGAR COMUNIDADES AO ABRIR A ABA
    // ========================================

    useEffect(() => {
        if (aba !== "comunidades") {
            return;
        }

        carregarComunidades();
    }, [aba]);

    // ========================================
    // CARREGAR USUÁRIOS
    // ========================================

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
    // CARREGAR COMUNIDADES
    // ========================================

    const carregarComunidades = async () => {
        try {
            setCarregandoComunidades(true);
            setErroComunidades("");

            const resposta = await api.get(
                "/admin/comunidades"
            );

            setComunidades(resposta.data);
        } catch (error) {
            console.error(
                "Erro ao carregar comunidades:",
                error
            );

            setErroComunidades(
                "Não foi possível carregar as comunidades."
            );
        } finally {
            setCarregandoComunidades(false);
        }
    };

    // ========================================
    // ALTERAR CAMPOS DO NOVO USUÁRIO
    // ========================================

    const alterarCampoNovoUsuario = (event) => {
        const { name, value } = event.target;

        setNovoUsuario((dadosAtuais) => ({
            ...dadosAtuais,
            [name]: value,
        }));
    };

    // ========================================
    // CADASTRAR NOVO USUÁRIO
    // ========================================

    const cadastrarNovoUsuario = async (event) => {
        event.preventDefault();

        try {
            setCadastrandoUsuario(true);
            setErroUsuarios("");
            setMensagemUsuario("");

            const resposta = await api.post(
                "/admin/usuarios",
                {
                    nome: novoUsuario.nome.trim(),
                    email: novoUsuario.email
                        .trim()
                        .toLowerCase(),
                    senha: novoUsuario.senha,
                    perfil: "ADMIN_COMUNIDADE",
                    licencaStatus:
                        novoUsuario.licencaStatus,
                }
            );

            setNovoUsuario({
                nome: "",
                email: "",
                senha: "",
                perfil: "ADMIN_COMUNIDADE",
                licencaStatus: "ATIVA",
            });

            setMostrarFormularioUsuario(false);

            setMensagemUsuario(
                resposta.data?.mensagem ||
                "Usuário cadastrado com sucesso."
            );

            await carregarUsuarios();

            setResumo((resumoAtual) => {
                if (!resumoAtual) {
                    return resumoAtual;
                }

                return {
                    ...resumoAtual,
                    totalUsuarios:
                        (resumoAtual.totalUsuarios ?? 0) + 1,
                    usuariosAtivos:
                        (resumoAtual.usuariosAtivos ?? 0) + 1,
                };
            });
        } catch (error) {
            console.error(
                "Erro ao cadastrar usuário:",
                error
            );

            const mensagem =
                error.response?.data?.erro ||
                "Não foi possível cadastrar o usuário.";

            setErroUsuarios(mensagem);
        } finally {
            setCadastrandoUsuario(false);
        }
    };

    // ========================================
    // ALTERAR STATUS DA COMUNIDADE
    // ========================================

    const alterarStatusComunidade = async (
        comunidadeId,
        novoStatus
    ) => {
        try {
            setComunidadeAlterando(comunidadeId);
            setErroComunidades("");

            await api.patch(
                `/admin/comunidades/${comunidadeId}/status`,
                {
                    ativa: novoStatus,
                }
            );

            setComunidades((comunidadesAtuais) =>
                comunidadesAtuais.map(
                    (comunidade) =>
                        comunidade.id === comunidadeId
                            ? {
                                ...comunidade,
                                ativa: novoStatus,
                            }
                            : comunidade
                )
            );

            setResumo((resumoAtual) => {
                if (!resumoAtual) {
                    return resumoAtual;
                }

                return {
                    ...resumoAtual,

                    comunidadesAtivas:
                        resumoAtual.comunidadesAtivas +
                        (novoStatus ? 1 : -1),
                };
            });
        } catch (error) {
            console.error(
                "Erro ao alterar status da comunidade:",
                error
            );

            const mensagem =
                error.response?.data?.erro ||
                "Não foi possível alterar o status da comunidade.";

            setErroComunidades(mensagem);
        } finally {
            setComunidadeAlterando(null);
        }
    };

    // ========================================
    // DESATIVAR COMUNIDADE
    // ========================================

    const desativarComunidade = (
        comunidade
    ) => {
        const confirmar = window.confirm(
            `Deseja realmente desativar a comunidade "${comunidade.nome}"?`
        );

        if (!confirmar) {
            return;
        }

        alterarStatusComunidade(
            comunidade.id,
            false
        );
    };

    // ========================================
    // REATIVAR COMUNIDADE
    // ========================================

    const reativarComunidade = (
        comunidade
    ) => {
        const confirmar = window.confirm(
            `Deseja reativar a comunidade "${comunidade.nome}"?`
        );

        if (!confirmar) {
            return;
        }

        alterarStatusComunidade(
            comunidade.id,
            true
        );
    };

    // ========================================
    // ALTERAR STATUS DO USUÁRIO
    // ========================================

    const alterarStatusUsuario = async (
        usuarioId,
        novoStatus
    ) => {
        try {
            setUsuarioAlterandoStatus(usuarioId);
            setErroUsuarios("");

            await api.patch(
                `/admin/usuarios/${usuarioId}/status`,
                {
                    ativo: novoStatus,
                }
            );

            setUsuarios((usuariosAtuais) =>
                usuariosAtuais.map((usuario) =>
                    usuario.id === usuarioId
                        ? {
                            ...usuario,
                            ativo: novoStatus,
                        }
                        : usuario
                )
            );

            setResumo((resumoAtual) => {
                if (!resumoAtual) {
                    return resumoAtual;
                }

                return {
                    ...resumoAtual,

                    usuariosAtivos:
                        resumoAtual.usuariosAtivos +
                        (novoStatus ? 1 : -1),
                };
            });
        } catch (error) {
            console.error(
                "Erro ao alterar status do usuário:",
                error
            );

            const mensagem =
                error.response?.data?.erro ||
                "Não foi possível alterar o status do usuário.";

            setErroUsuarios(mensagem);
        } finally {
            setUsuarioAlterandoStatus(null);
        }
    };

    // ========================================
    // DESATIVAR USUÁRIO
    // ========================================

    const desativarUsuario = (usuario) => {
        const confirmar = window.confirm(
            `Deseja realmente desativar o usuário "${usuario.nome}"?`
        );

        if (!confirmar) {
            return;
        }

        alterarStatusUsuario(
            usuario.id,
            false
        );
    };

    // ========================================
    // REATIVAR USUÁRIO
    // ========================================

    const reativarUsuario = (usuario) => {
        const confirmar = window.confirm(
            `Deseja reativar o usuário "${usuario.nome}"?`
        );

        if (!confirmar) {
            return;
        }

        alterarStatusUsuario(
            usuario.id,
            true
        );
    };

    // ========================================
    // ALTERAR LICENÇA
    // ========================================

    const alterarLicenca = async (
        usuarioId,
        novoStatus
    ) => {
        try {
            setUsuarioAlterandoLicenca(usuarioId);
            setErroUsuarios("");

            await api.patch(
                `/admin/usuarios/${usuarioId}/licenca`,
                {
                    licencaStatus: novoStatus,
                }
            );

            setUsuarios((usuariosAtuais) =>
                usuariosAtuais.map((usuario) =>
                    usuario.id === usuarioId
                        ? {
                            ...usuario,
                            licencaStatus:
                                novoStatus,
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
            setUsuarioAlterandoLicenca(null);
        }
    };

    // ========================================
    // BLOQUEAR LICENÇA
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
    // REATIVAR LICENÇA
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

            {/* =====================================
          MENU
      ===================================== */}

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

            {/* =====================================
          VISÃO GERAL
      ===================================== */}

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

            {/* =====================================
          COMUNIDADES
      ===================================== */}

            {aba === "comunidades" && (
                <div className="admin-secao">

                    <h3>
                        Gerenciamento de Comunidades
                    </h3>

                    {carregandoComunidades && (
                        <p>
                            Carregando comunidades...
                        </p>
                    )}

                    {erroComunidades && (
                        <p className="admin-erro">
                            {erroComunidades}
                        </p>
                    )}

                    {!carregandoComunidades &&
                        !erroComunidades &&
                        comunidades.length === 0 && (
                            <p>
                                Nenhuma comunidade encontrada.
                            </p>
                        )}

                    {!carregandoComunidades &&
                        comunidades.length > 0 && (

                            <div className="admin-tabela-wrapper">

                                <table className="admin-tabela admin-tabela-comunidades">

                                    <thead>
                                        <tr>
                                            <th>Nome</th>
                                            <th>Paróquia</th>
                                            <th>Cidade</th>
                                            <th>Usuários</th>
                                            <th>Dizimistas</th>
                                            <th>Status</th>
                                            <th>Ações</th>
                                        </tr>
                                    </thead>

                                    <tbody>

                                        {comunidades.map(
                                            (comunidade) => {
                                                const alterando =
                                                    comunidadeAlterando ===
                                                    comunidade.id;

                                                const ehComunidadeDoSuperAdmin =
                                                    Number(
                                                        comunidade.id
                                                    ) ===
                                                    Number(
                                                        usuarioLogado
                                                            ?.comunidadeId
                                                    );

                                                return (
                                                    <tr
                                                        key={
                                                            comunidade.id
                                                        }
                                                    >

                                                        <td>
                                                            {comunidade.nome}
                                                        </td>

                                                        <td>
                                                            {comunidade.paroquia ||
                                                                "-"}
                                                        </td>

                                                        <td>
                                                            {comunidade.cidade ||
                                                                "-"}
                                                        </td>

                                                        <td>
                                                            {comunidade.totalUsuarios ??
                                                                0}
                                                        </td>

                                                        <td>
                                                            {comunidade.totalDizimistas ??
                                                                0}
                                                        </td>

                                                        <td>
                                                            {comunidade.ativa ? (
                                                                <span className="status-ativo">
                                                                    Ativa
                                                                </span>
                                                            ) : (
                                                                <span className="status-inativo">
                                                                    Inativa
                                                                </span>
                                                            )}
                                                        </td>

                                                        <td>

                                                            {ehComunidadeDoSuperAdmin ? (
                                                                <span className="admin-sem-acao">
                                                                    Protegida
                                                                </span>
                                                            ) : comunidade.ativa ? (

                                                                <button
                                                                    type="button"
                                                                    className="btn-bloquear-licenca"
                                                                    disabled={
                                                                        alterando
                                                                    }
                                                                    onClick={() =>
                                                                        desativarComunidade(
                                                                            comunidade
                                                                        )
                                                                    }
                                                                >
                                                                    {alterando
                                                                        ? "Alterando..."
                                                                        : "Desativar"}
                                                                </button>

                                                            ) : (

                                                                <button
                                                                    type="button"
                                                                    className="btn-reativar-licenca"
                                                                    disabled={
                                                                        alterando
                                                                    }
                                                                    onClick={() =>
                                                                        reativarComunidade(
                                                                            comunidade
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
                                            }
                                        )}

                                    </tbody>

                                </table>

                            </div>

                        )}

                </div>
            )}

            {/* =====================================
          USUÁRIOS / LICENÇAS
      ===================================== */}

            {aba === "usuarios" && (
                <div className="admin-secao">

                    <div className="admin-secao-cabecalho">
                        <h3>Usuários e Licenças</h3>

                        <button
                            type="button"
                            className="btn-novo-usuario"
                            disabled={cadastrandoUsuario}
                            onClick={() => {
                                setMostrarFormularioUsuario(
                                    !mostrarFormularioUsuario
                                );
                                setErroUsuarios("");
                                setMensagemUsuario("");
                            }}
                        >
                            {mostrarFormularioUsuario
                                ? "Cancelar"
                                : "+ Novo Usuário"}
                        </button>
                    </div>

                    {mensagemUsuario && (
                        <p className="admin-sucesso">
                            {mensagemUsuario}
                        </p>
                    )}

                    {mostrarFormularioUsuario && (
                        <form
                            className="admin-form-usuario"
                            onSubmit={cadastrarNovoUsuario}
                        >
                            <h4>Cadastrar Novo Usuário</h4>

                            <div className="admin-form-grid">

                                <div className="admin-form-campo">
                                    <label htmlFor="novo-usuario-nome">
                                        Nome
                                    </label>
                                    <input
                                        id="novo-usuario-nome"
                                        name="nome"
                                        type="text"
                                        placeholder="Nome do usuário"
                                        value={novoUsuario.nome}
                                        onChange={alterarCampoNovoUsuario}
                                        disabled={cadastrandoUsuario}
                                        required
                                    />
                                </div>

                                <div className="admin-form-campo">
                                    <label htmlFor="novo-usuario-email">
                                        E-mail
                                    </label>
                                    <input
                                        id="novo-usuario-email"
                                        name="email"
                                        type="email"
                                        placeholder="email@exemplo.com"
                                        value={novoUsuario.email}
                                        onChange={alterarCampoNovoUsuario}
                                        disabled={cadastrandoUsuario}
                                        required
                                    />
                                </div>

                                <div className="admin-form-campo">
                                    <label htmlFor="novo-usuario-senha">
                                        Senha inicial
                                    </label>
                                    <input
                                        id="novo-usuario-senha"
                                        name="senha"
                                        type="password"
                                        placeholder="Mínimo de 6 caracteres"
                                        minLength={6}
                                        value={novoUsuario.senha}
                                        onChange={alterarCampoNovoUsuario}
                                        disabled={cadastrandoUsuario}
                                        required
                                    />
                                </div>

                                <div className="admin-form-campo">
                                    <label htmlFor="novo-usuario-perfil">
                                        Perfil
                                    </label>
                                    <select
                                        id="novo-usuario-perfil"
                                        name="perfil"
                                        value={novoUsuario.perfil}
                                        onChange={alterarCampoNovoUsuario}
                                        disabled
                                    >
                                        <option value="ADMIN_COMUNIDADE">
                                            Administrador de Comunidade
                                        </option>
                                    </select>
                                </div>

                                <div className="admin-form-campo">
                                    <label htmlFor="novo-usuario-licenca">
                                        Licença
                                    </label>
                                    <select
                                        id="novo-usuario-licenca"
                                        name="licencaStatus"
                                        value={
                                            novoUsuario.licencaStatus
                                        }
                                        onChange={
                                            alterarCampoNovoUsuario
                                        }
                                        disabled={cadastrandoUsuario}
                                    >
                                        <option value="ATIVA">
                                            ATIVA
                                        </option>
                                        <option value="BLOQUEADA">
                                            BLOQUEADA
                                        </option>
                                    </select>
                                </div>

                            </div>

                            <div className="admin-form-acoes">
                                <button
                                    type="submit"
                                    className="btn-salvar-usuario"
                                    disabled={cadastrandoUsuario}
                                >
                                    {cadastrandoUsuario
                                        ? "Cadastrando..."
                                        : "Cadastrar Usuário"}
                                </button>
                            </div>

                        </form>
                    )}

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

                                        {usuarios.map(
                                            (usuario) => {
                                                const alterandoStatus =
                                                    usuarioAlterandoStatus ===
                                                    usuario.id;

                                                const alterandoLicenca =
                                                    usuarioAlterandoLicenca ===
                                                    usuario.id;

                                                const ehSuperAdmin =
                                                    usuario.perfil ===
                                                    "SUPER_ADMIN";

                                                return (
                                                    <tr
                                                        key={usuario.id}
                                                    >

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
                                                            ) : (
                                                                <div className="admin-acoes-usuario">

                                                                    {/* STATUS DO USUÁRIO */}

                                                                    {usuario.ativo ? (
                                                                        <button
                                                                            type="button"
                                                                            className="btn-desativar-usuario"
                                                                            disabled={
                                                                                alterandoStatus ||
                                                                                alterandoLicenca
                                                                            }
                                                                            onClick={() =>
                                                                                desativarUsuario(
                                                                                    usuario
                                                                                )
                                                                            }
                                                                        >
                                                                            {alterandoStatus
                                                                                ? "Alterando..."
                                                                                : "Desativar"}
                                                                        </button>
                                                                    ) : (
                                                                        <button
                                                                            type="button"
                                                                            className="btn-ativar-usuario"
                                                                            disabled={
                                                                                alterandoStatus ||
                                                                                alterandoLicenca
                                                                            }
                                                                            onClick={() =>
                                                                                reativarUsuario(
                                                                                    usuario
                                                                                )
                                                                            }
                                                                        >
                                                                            {alterandoStatus
                                                                                ? "Alterando..."
                                                                                : "Reativar"}
                                                                        </button>
                                                                    )}

                                                                    {/* LICENÇA */}

                                                                    {usuario.licencaStatus ===
                                                                        "ATIVA" ? (
                                                                        <button
                                                                            type="button"
                                                                            className="btn-bloquear-licenca"
                                                                            disabled={
                                                                                alterandoStatus ||
                                                                                alterandoLicenca
                                                                            }
                                                                            onClick={() =>
                                                                                bloquearLicenca(
                                                                                    usuario
                                                                                )
                                                                            }
                                                                        >
                                                                            {alterandoLicenca
                                                                                ? "Alterando..."
                                                                                : "Bloquear"}
                                                                        </button>
                                                                    ) : (
                                                                        <button
                                                                            type="button"
                                                                            className="btn-reativar-licenca"
                                                                            disabled={
                                                                                alterandoStatus ||
                                                                                alterandoLicenca
                                                                            }
                                                                            onClick={() =>
                                                                                reativarLicenca(
                                                                                    usuario
                                                                                )
                                                                            }
                                                                        >
                                                                            {alterandoLicenca
                                                                                ? "Alterando..."
                                                                                : "Licença"}
                                                                        </button>
                                                                    )}

                                                                </div>
                                                            )}

                                                        </td>

                                                    </tr>
                                                );
                                            }
                                        )}

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