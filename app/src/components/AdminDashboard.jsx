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

    const [paroquias, setParoquias] =
        useState([]);

    const [
        carregandoParoquias,
        setCarregandoParoquias,
    ] = useState(false);

    const [
        erroParoquias,
        setErroParoquias,
    ] = useState("");

    const [buscaUsuario, setBuscaUsuario] =
        useState("");

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
        usuarioExcluindo,
        setUsuarioExcluindo,
    ] = useState(null);

    const [
        mostrarFormularioUsuario,
        setMostrarFormularioUsuario,
    ] = useState(false);

    const [mostrarSenha, setMostrarSenha] =
        useState(false);

    const [
        mostrarSenhaEdicao,
        setMostrarSenhaEdicao,
    ] = useState(false);

    const [novoUsuario, setNovoUsuario] =
        useState({
            nome: "",
            email: "",
            senha: "",
            confirmarSenha: "",
            perfil: "ADMIN_COMUNIDADE",
            paroquiaId: "",
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

    const [
        usuarioEmEdicao,
        setUsuarioEmEdicao,
    ] = useState(null);

    const [dadosEdicaoUsuario, setDadosEdicaoUsuario] =
        useState({
            nome: "",
            email: "",
            perfil: "",
            paroquiaId: null,
            paroquiaNome: "",
            comunidadeId: null,
            comunidadeNome: "",
            novaSenha: "",
            confirmarNovaSenha: "",
        });

    const [
        salvandoEdicaoUsuario,
        setSalvandoEdicaoUsuario,
    ] = useState(false);

    // ========================================
    // ESTADOS DE COMUNIDADES
    // ========================================

    const [comunidades, setComunidades] =
        useState([]);

    const [buscaComunidade, setBuscaComunidade] =
        useState("");

    const [filtroStatusComunidade, setFiltroStatusComunidade] =
        useState("TODAS");

    const [
        carregandoComunidades,
        setCarregandoComunidades,
    ] = useState(false);

    const [
        erroComunidades,
        setErroComunidades,
    ] = useState("");

    const [
        mensagemComunidades,
        setMensagemComunidades,
    ] = useState("");

    const [
        comunidadeAlterando,
        setComunidadeAlterando,
    ] = useState(null);

    const [
        comunidadeExcluindo,
        setComunidadeExcluindo,
    ] = useState(null);

    const [
        comunidadeDetalhada,
        setComunidadeDetalhada,
    ] = useState(null);

    const [
        carregandoDetalhesComunidade,
        setCarregandoDetalhesComunidade,
    ] = useState(false);

    const [
        erroDetalhesComunidade,
        setErroDetalhesComunidade,
    ] = useState("");

    const [
        comunidadeEmEdicao,
        setComunidadeEmEdicao,
    ] = useState(null);

    const [
        dadosEdicaoComunidade,
        setDadosEdicaoComunidade,
    ] = useState({
        nome: "",
        paroquia: "",
        cidade: "",
    });

    const [
        salvandoEdicaoComunidade,
        setSalvandoEdicaoComunidade,
    ] = useState(false);

    // ========================================
    // FORMATAR DATA
    // ========================================

    const formatarData = (data) => {
        if (!data) {
            return "-";
        }

        const dataFormatada = new Date(data);

        if (Number.isNaN(dataFormatada.getTime())) {
            return "-";
        }

        return dataFormatada.toLocaleDateString("pt-BR");
    };

    const formatarMoeda = (valor) => {
        const numero = Number(valor || 0);

        return numero.toLocaleString("pt-BR", {
            style: "currency",
            currency: "BRL",
        });
    };

    const traduzirAtividade = (atividade) => {
        const textos = {
            RECENTE: "Atividade recente",
            ATENCAO: "Atenção",
            INATIVA: "Sem atividade recente",
            SEM_MOVIMENTACAO: "Sem movimentação",
        };

        return textos[atividade] || "Sem informação";
    };

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
        carregarParoquias();
    }, [aba]);

    // ========================================
    // CARREGAR PARÓQUIAS AO ABRIR A ABA
    // ========================================

    useEffect(() => {
        if (aba !== "paroquias") {
            return;
        }

        carregarParoquias();
        carregarComunidades();
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
    // CARREGAR PARÓQUIAS
    // ========================================

    const carregarParoquias = async () => {
        try {
            setCarregandoParoquias(true);
            setErroParoquias("");

            const resposta = await api.get(
                "/admin/paroquias"
            );

            setParoquias(resposta.data);
        } catch (error) {
            console.error(
                "Erro ao carregar paróquias:",
                error
            );

            const mensagem =
                error.response?.data?.erro ||
                "Não foi possível carregar as paróquias.";

            setErroParoquias(mensagem);

            if (aba === "usuarios") {
                setErroUsuarios(mensagem);
            }
        } finally {
            setCarregandoParoquias(false);
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

        // Limpa mensagens enquanto o usuário corrige o formulário
        if (erroUsuarios) {
            setErroUsuarios("");
        }

        if (mensagemUsuario) {
            setMensagemUsuario("");
        }
    };

    // ========================================
    // CADASTRAR NOVO USUÁRIO
    // ========================================

    const cadastrarNovoUsuario = async (event) => {
        event.preventDefault();

        if (novoUsuario.nome.trim().length < 3) {
            setErroUsuarios(
                "O nome deve ter pelo menos 3 caracteres."
            );
            return;
        }

        const emailValido =
            /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(
                novoUsuario.email.trim()
            );

        if (!emailValido) {
            setErroUsuarios(
                "Digite um e-mail válido."
            );
            return;
        }

        if (novoUsuario.senha.length < 6) {
            setErroUsuarios(
                "A senha deve ter pelo menos 6 caracteres."
            );
            return;
        }

        if (novoUsuario.senha !== novoUsuario.confirmarSenha) {
            setErroUsuarios(
                "As senhas não coincidem."
            );
            return;
        }

        const paroquiaIdNumero =
            Number(novoUsuario.paroquiaId);

        if (
            !Number.isInteger(paroquiaIdNumero) ||
            paroquiaIdNumero <= 0
        ) {
            setErroUsuarios(
                "Selecione a paróquia do usuário."
            );
            return;
        }

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
                    perfil: novoUsuario.perfil,
                    paroquiaId: paroquiaIdNumero,
                    licencaStatus:
                        novoUsuario.licencaStatus,
                }
            );

            setNovoUsuario({
                nome: "",
                email: "",
                senha: "",
                confirmarSenha: "",
                perfil: "ADMIN_COMUNIDADE",
                paroquiaId: "",
                licencaStatus: "ATIVA",
            });

            setMostrarFormularioUsuario(false);
            setMostrarSenha(false);

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
    // INICIAR EDIÇÃO DE USUÁRIO
    // ========================================

    const iniciarEdicaoUsuario = (usuario) => {
        setMostrarFormularioUsuario(false);
        setMostrarSenha(false);
        setMostrarSenhaEdicao(false);

        setNovoUsuario({
            nome: "",
            email: "",
            senha: "",
            confirmarSenha: "",
            perfil: "ADMIN_COMUNIDADE",
            paroquiaId: "",
            licencaStatus: "ATIVA",
        });

        setErroUsuarios("");
        setMensagemUsuario("");

        setUsuarioEmEdicao(usuario);

        setDadosEdicaoUsuario({
            nome: usuario.nome || "",
            email: usuario.email || "",
            perfil: usuario.perfil || "",
            paroquiaId: usuario.paroquiaId ?? null,
            paroquiaNome:
                usuario.paroquiaNome ||
                "Sem paróquia",
            comunidadeId: usuario.comunidadeId ?? null,
            comunidadeNome:
                usuario.comunidadeNome ||
                "Sem comunidade",
            novaSenha: "",
            confirmarNovaSenha: "",
        });
    };

    // ========================================
    // ALTERAR CAMPOS DA EDIÇÃO
    // ========================================

    const alterarCampoEdicaoUsuario = (event) => {
        const { name, value } = event.target;

        setDadosEdicaoUsuario((dadosAtuais) => ({
            ...dadosAtuais,
            [name]: value,
        }));

        if (erroUsuarios) {
            setErroUsuarios("");
        }

        if (mensagemUsuario) {
            setMensagemUsuario("");
        }
    };

    // ========================================
    // CANCELAR EDIÇÃO DE USUÁRIO
    // ========================================

    const cancelarEdicaoUsuario = () => {
        setUsuarioEmEdicao(null);
        setMostrarSenhaEdicao(false);

        setDadosEdicaoUsuario({
            nome: "",
            email: "",
            perfil: "",
            paroquiaId: null,
            paroquiaNome: "",
            comunidadeId: null,
            comunidadeNome: "",
            novaSenha: "",
            confirmarNovaSenha: "",
        });

        setErroUsuarios("");
        setMensagemUsuario("");
    };

    // ========================================
    // SALVAR EDIÇÃO DO USUÁRIO
    // ========================================

    const salvarEdicaoUsuario = async (event) => {
        event.preventDefault();

        if (!usuarioEmEdicao) {
            return;
        }

        if (dadosEdicaoUsuario.nome.trim().length < 3) {
            setErroUsuarios(
                "O nome deve ter pelo menos 3 caracteres."
            );
            return;
        }

        const emailValido =
            /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(
                dadosEdicaoUsuario.email.trim()
            );

        if (!emailValido) {
            setErroUsuarios(
                "Digite um e-mail válido."
            );
            return;
        }

        const novaSenha =
            dadosEdicaoUsuario.novaSenha;
        const confirmarNovaSenha =
            dadosEdicaoUsuario.confirmarNovaSenha;

        const informouAlgumaSenha =
            novaSenha.length > 0 ||
            confirmarNovaSenha.length > 0;

        if (informouAlgumaSenha) {
            if (
                novaSenha.length === 0 ||
                confirmarNovaSenha.length === 0
            ) {
                setErroUsuarios(
                    "Preencha a nova senha e a confirmação."
                );
                return;
            }

            if (novaSenha.length < 6) {
                setErroUsuarios(
                    "A nova senha deve ter pelo menos 6 caracteres."
                );
                return;
            }

            if (novaSenha !== confirmarNovaSenha) {
                setErroUsuarios(
                    "As novas senhas não coincidem."
                );
                return;
            }
        }

        try {
            setSalvandoEdicaoUsuario(true);
            setErroUsuarios("");
            setMensagemUsuario("");

            const respostaUsuario = await api.patch(
                `/admin/usuarios/${usuarioEmEdicao.id}`,
                {
                    nome: dadosEdicaoUsuario.nome.trim(),
                    email: dadosEdicaoUsuario.email
                        .trim()
                        .toLowerCase(),
                }
            );

            const usuarioAtualizado =
                respostaUsuario.data?.usuario;

            if (usuarioAtualizado) {
                setUsuarios((usuariosAtuais) =>
                    usuariosAtuais.map((usuario) =>
                        Number(usuario.id) === Number(usuarioAtualizado.id)
                            ? {
                                ...usuario,
                                ...usuarioAtualizado,
                            }
                            : usuario
                    )
                );
            } else {
                await carregarUsuarios();
            }

            let mensagemFinal =
                respostaUsuario.data?.mensagem ||
                "Usuário atualizado com sucesso.";

            if (informouAlgumaSenha) {
                const respostaSenha = await api.patch(
                    `/admin/usuarios/${usuarioEmEdicao.id}/senha`,
                    {
                        novaSenha,
                    }
                );

                mensagemFinal =
                    "Dados e senha atualizados com sucesso.";
            }

            setMensagemUsuario(mensagemFinal);

            setUsuarioEmEdicao(null);
            setMostrarSenhaEdicao(false);

            setDadosEdicaoUsuario({
                nome: "",
                email: "",
                perfil: "",
                paroquiaId: null,
                paroquiaNome: "",
                comunidadeId: null,
                comunidadeNome: "",
                novaSenha: "",
                confirmarNovaSenha: "",
            });
        } catch (error) {
            console.error(
                "Erro ao editar usuário:",
                error
            );

            const mensagem =
                error.response?.data?.erro ||
                "Não foi possível atualizar o usuário.";

            setErroUsuarios(mensagem);
        } finally {
            setSalvandoEdicaoUsuario(false);
        }
    };

    // ========================================
    // INICIAR EDIÇÃO DE COMUNIDADE
    // ========================================

    const iniciarEdicaoComunidade = (comunidade) => {
        setComunidadeEmEdicao(comunidade);

        setDadosEdicaoComunidade({
            nome: comunidade.nome || "",
            paroquia: comunidade.paroquia || "",
            cidade: comunidade.cidade || "",
        });

        setErroComunidades("");
        setMensagemComunidades("");
    };

    // ========================================
    // ALTERAR CAMPOS DA COMUNIDADE
    // ========================================

    const alterarCampoEdicaoComunidade = (event) => {
        const { name, value } = event.target;

        setDadosEdicaoComunidade((dadosAtuais) => ({
            ...dadosAtuais,
            [name]: value,
        }));

        if (erroComunidades) {
            setErroComunidades("");
        }

        if (mensagemComunidades) {
            setMensagemComunidades("");
        }
    };

    // ========================================
    // CANCELAR EDIÇÃO DE COMUNIDADE
    // ========================================

    const cancelarEdicaoComunidade = () => {
        setComunidadeEmEdicao(null);

        setDadosEdicaoComunidade({
            nome: "",
            paroquia: "",
            cidade: "",
        });

        setErroComunidades("");
    };

    // ========================================
    // SALVAR EDIÇÃO DE COMUNIDADE
    // ========================================

    const salvarEdicaoComunidade = async (event) => {
        event.preventDefault();

        if (!comunidadeEmEdicao) {
            return;
        }

        const nome = dadosEdicaoComunidade.nome.trim();
        const paroquia =
            dadosEdicaoComunidade.paroquia.trim();
        const cidade =
            dadosEdicaoComunidade.cidade.trim();

        if (!nome) {
            setErroComunidades(
                "O nome da comunidade é obrigatório."
            );

            return;
        }

        if (nome.length < 2) {
            setErroComunidades(
                "O nome da comunidade deve ter pelo menos 2 caracteres."
            );

            return;
        }

        try {
            setSalvandoEdicaoComunidade(true);
            setErroComunidades("");
            setMensagemComunidades("");

            const resposta = await api.patch(
                `/admin/comunidades/${comunidadeEmEdicao.id}`,
                {
                    nome,
                    paroquia,
                    cidade,
                }
            );

            const comunidadeAtualizada =
                resposta.data?.comunidade;

            if (comunidadeAtualizada) {
                setComunidades((comunidadesAtuais) =>
                    comunidadesAtuais.map((comunidade) =>
                        Number(comunidade.id) ===
                            Number(comunidadeAtualizada.id)
                            ? {
                                ...comunidade,
                                ...comunidadeAtualizada,
                            }
                            : comunidade
                    )
                );

                setComunidadeDetalhada((detalhesAtuais) => {
                    if (
                        !detalhesAtuais?.comunidade ||
                        Number(
                            detalhesAtuais.comunidade.id
                        ) !==
                        Number(
                            comunidadeAtualizada.id
                        )
                    ) {
                        return detalhesAtuais;
                    }

                    return {
                        ...detalhesAtuais,
                        comunidade: {
                            ...detalhesAtuais.comunidade,
                            ...comunidadeAtualizada,
                        },
                    };
                });
            } else {
                await carregarComunidades();
            }

            setMensagemComunidades(
                resposta.data?.mensagem ||
                "Dados da comunidade atualizados com sucesso."
            );

            setComunidadeEmEdicao(null);

            setDadosEdicaoComunidade({
                nome: "",
                paroquia: "",
                cidade: "",
            });
        } catch (error) {
            console.error(
                "Erro ao editar comunidade:",
                error
            );

            const mensagem =
                error.response?.data?.erro ||
                "Não foi possível atualizar a comunidade.";

            setErroComunidades(mensagem);
        } finally {
            setSalvandoEdicaoComunidade(false);
        }
    };

    // ========================================
    // ABRIR DETALHES DA COMUNIDADE
    // ========================================

    const abrirDetalhesComunidade = async (
        comunidade
    ) => {
        try {
            setCarregandoDetalhesComunidade(true);
            setErroDetalhesComunidade("");
            setComunidadeDetalhada(null);

            const resposta = await api.get(
                `/admin/comunidades/${comunidade.id}`
            );

            setComunidadeDetalhada(
                resposta.data
            );
        } catch (error) {
            console.error(
                "Erro ao carregar detalhes da comunidade:",
                error
            );

            const mensagem =
                error.response?.data?.erro ||
                "Não foi possível carregar os detalhes da comunidade.";

            setErroDetalhesComunidade(mensagem);
        } finally {
            setCarregandoDetalhesComunidade(false);
        }
    };

    // ========================================
    // FECHAR DETALHES DA COMUNIDADE
    // ========================================

    const fecharDetalhesComunidade = () => {
        setComunidadeDetalhada(null);
        setErroDetalhesComunidade("");
        setCarregandoDetalhesComunidade(false);
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
            setMensagemComunidades("");

            await api.patch(
                `/admin/comunidades/${comunidadeId}/status`,
                {
                    ativa: novoStatus,
                }
            );

            setComunidades((comunidadesAtuais) =>
                comunidadesAtuais.map(
                    (comunidade) =>
                        Number(comunidade.id) === Number(comunidadeId)
                            ? {
                                ...comunidade,
                                ativa: novoStatus,
                            }
                            : comunidade
                )
            );

            setComunidadeDetalhada((detalhesAtuais) => {
                if (
                    !detalhesAtuais?.comunidade ||
                    Number(detalhesAtuais.comunidade.id) !==
                    Number(comunidadeId)
                ) {
                    return detalhesAtuais;
                }

                return {
                    ...detalhesAtuais,
                    comunidade: {
                        ...detalhesAtuais.comunidade,
                        ativa: novoStatus,
                    },
                };
            });

            setResumo((resumoAtual) => {
                if (!resumoAtual) {
                    return resumoAtual;
                }

                return {
                    ...resumoAtual,

                    comunidadesAtivas: Math.max(
                        0,
                        (resumoAtual.comunidadesAtivas ?? 0) +
                        (novoStatus ? 1 : -1)
                    ),
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
    // EXCLUIR COMUNIDADE PERMANENTEMENTE
    // ========================================

    const excluirComunidade = async (comunidade) => {
        const ehComunidadeDoSuperAdmin =
            Number(comunidade.id) ===
            Number(usuarioLogado?.comunidadeId);

        if (ehComunidadeDoSuperAdmin) {
            setErroComunidades(
                "A comunidade do SUPER_ADMIN é protegida e não pode ser excluída."
            );
            return;
        }

        const confirmar = window.confirm(
            `Deseja realmente excluir permanentemente a comunidade "${comunidade.nome}"?\n\n` +
            `Usuários vinculados: ${comunidade.totalUsuarios ?? 0}\n` +
            `Dizimistas vinculados: ${comunidade.totalDizimistas ?? 0}\n\n` +
            "Esta ação excluirá também os dados vinculados à comunidade e não poderá ser desfeita."
        );

        if (!confirmar) {
            return;
        }

        try {
            setComunidadeExcluindo(comunidade.id);
            setErroComunidades("");
            setMensagemComunidades("");

            const resposta = await api.delete(
                `/admin/comunidades/${comunidade.id}`
            );

            setComunidades((comunidadesAtuais) =>
                comunidadesAtuais.filter(
                    (comunidadeAtual) =>
                        Number(comunidadeAtual.id) !==
                        Number(comunidade.id)
                )
            );

            if (
                Number(
                    comunidadeDetalhada?.comunidade?.id
                ) === Number(comunidade.id)
            ) {
                fecharDetalhesComunidade();
            }

            if (
                Number(comunidadeEmEdicao?.id) ===
                Number(comunidade.id)
            ) {
                cancelarEdicaoComunidade();
            }

            // Recarrega o resumo diretamente da API para manter
            // todos os indicadores administrativos consistentes.
            try {
                const respostaResumo = await api.get(
                    "/admin/dashboard"
                );

                setResumo(respostaResumo.data);
            } catch (erroResumo) {
                console.error(
                    "Erro ao atualizar resumo após excluir comunidade:",
                    erroResumo
                );
            }

            setMensagemComunidades(
                resposta.data?.mensagem ||
                "Comunidade excluída com sucesso."
            );
        } catch (error) {
            console.error(
                "Erro ao excluir comunidade:",
                error
            );

            const mensagem =
                error.response?.data?.erro ||
                "Não foi possível excluir a comunidade.";

            setErroComunidades(mensagem);
        } finally {
            setComunidadeExcluindo(null);
        }
    };

    // ========================================
    // EXCLUIR USUÁRIO SEM COMUNIDADE
    // ========================================

    const excluirUsuario = async (usuario) => {
        if (usuario.perfil === "SUPER_ADMIN") {
            setErroUsuarios(
                "O usuário SUPER_ADMIN é protegido e não pode ser excluído."
            );
            return;
        }

        if (usuario.comunidadeId !== null) {
            setErroUsuarios(
                "Este usuário está vinculado a uma comunidade. Desative o usuário em vez de excluí-lo."
            );
            return;
        }

        const confirmar = window.confirm(
            `Deseja realmente excluir permanentemente o usuário "${usuario.nome}"?\n\nEsta ação não poderá ser desfeita.`
        );

        if (!confirmar) {
            return;
        }

        try {
            setUsuarioExcluindo(usuario.id);
            setErroUsuarios("");
            setMensagemUsuario("");

            const resposta = await api.delete(
                `/admin/usuarios/${usuario.id}`
            );

            setUsuarios((usuariosAtuais) =>
                usuariosAtuais.filter(
                    (usuarioAtual) =>
                        Number(usuarioAtual.id) !== Number(usuario.id)
                )
            );

            if (
                usuarioEmEdicao &&
                Number(usuarioEmEdicao.id) === Number(usuario.id)
            ) {
                setUsuarioEmEdicao(null);
                setMostrarSenhaEdicao(false);

                setDadosEdicaoUsuario({
                    nome: "",
                    email: "",
                    perfil: "",
                    paroquiaId: null,
                    paroquiaNome: "",
                    comunidadeId: null,
                    comunidadeNome: "",
                    novaSenha: "",
                    confirmarNovaSenha: "",
                });
            }

            setResumo((resumoAtual) => {
                if (!resumoAtual) {
                    return resumoAtual;
                }

                return {
                    ...resumoAtual,
                    totalUsuarios:
                        Math.max(
                            0,
                            (resumoAtual.totalUsuarios ?? 0) - 1
                        ),
                    usuariosAtivos:
                        usuario.ativo
                            ? Math.max(
                                0,
                                (resumoAtual.usuariosAtivos ?? 0) - 1
                            )
                            : resumoAtual.usuariosAtivos,
                };
            });

            setMensagemUsuario(
                resposta.data?.mensagem ||
                "Usuário excluído com sucesso."
            );
        } catch (error) {
            console.error(
                "Erro ao excluir usuário:",
                error
            );

            const mensagem =
                error.response?.data?.erro ||
                "Não foi possível excluir o usuário.";

            setErroUsuarios(mensagem);
        } finally {
            setUsuarioExcluindo(null);
        }
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
                    Number(usuario.id) === Number(usuarioId)
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

                    usuariosAtivos: Math.max(
                        0,
                        (resumoAtual.usuariosAtivos ?? 0) +
                        (novoStatus ? 1 : -1)
                    ),
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
                    Number(usuario.id) === Number(usuarioId)
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
    // FILTRAR COMUNIDADES
    // ========================================

    const termoBuscaComunidade =
        buscaComunidade.trim().toLowerCase();

    const comunidadesFiltradas = comunidades.filter(
        (comunidade) => {
            const nome =
                comunidade.nome?.toLowerCase() || "";

            const paroquia =
                comunidade.paroquia?.toLowerCase() || "";

            const cidade =
                comunidade.cidade?.toLowerCase() || "";

            const correspondeBusca =
                !termoBuscaComunidade ||
                nome.includes(termoBuscaComunidade) ||
                paroquia.includes(termoBuscaComunidade) ||
                cidade.includes(termoBuscaComunidade);

            const correspondeStatus =
                filtroStatusComunidade === "TODAS" ||
                (filtroStatusComunidade === "ATIVAS" &&
                    comunidade.ativa) ||
                (filtroStatusComunidade === "INATIVAS" &&
                    !comunidade.ativa);

            return (
                correspondeBusca &&
                correspondeStatus
            );
        }
    );

    const filtrosComunidadesAtivos =
        buscaComunidade.trim() !== "" ||
        filtroStatusComunidade !== "TODAS";

    const limparFiltrosComunidades = () => {
        setBuscaComunidade("");
        setFiltroStatusComunidade("TODAS");
    };

    // ========================================
    // FILTRAR USUÁRIOS
    // ========================================

    const termoBuscaUsuario =
        buscaUsuario.trim().toLowerCase();

    const usuariosFiltrados = usuarios.filter(
        (usuario) => {
            if (!termoBuscaUsuario) {
                return true;
            }

            const nome =
                usuario.nome?.toLowerCase() || "";

            const email =
                usuario.email?.toLowerCase() || "";

            const paroquia =
                usuario.paroquiaNome
                    ?.toLowerCase() || "";

            const comunidade =
                usuario.comunidadeNome
                    ?.toLowerCase() || "";

            return (
                nome.includes(termoBuscaUsuario) ||
                email.includes(termoBuscaUsuario) ||
                paroquia.includes(termoBuscaUsuario) ||
                comunidade.includes(termoBuscaUsuario)
            );
        }
    );

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
                        setAba("paroquias")
                    }
                >
                    Paróquias
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
          PARÓQUIAS
      ===================================== */}

            {aba === "paroquias" && (
                <div className="admin-secao">

                    <h3>
                        Gerenciamento de Paróquias
                    </h3>

                    <p>
                        Visão geral das paróquias cadastradas no sistema.
                        Nesta etapa, o painel é somente para consulta.
                    </p>

                    {carregandoParoquias && (
                        <p>
                            Carregando paróquias...
                        </p>
                    )}

                    {erroParoquias && (
                        <p className="admin-erro">
                            {erroParoquias}
                        </p>
                    )}

                    {!carregandoParoquias &&
                        !erroParoquias &&
                        paroquias.length === 0 && (
                            <p>
                                Nenhuma paróquia cadastrada.
                            </p>
                        )}

                    {!carregandoParoquias &&
                        !erroParoquias &&
                        paroquias.length > 0 && (

                            <div className="admin-tabela-wrapper">

                                <table className="admin-tabela admin-tabela-comunidades">

                                    <thead>
                                        <tr>
                                            <th>Paróquia</th>
                                            <th>Cidade</th>
                                            <th>Comunidades</th>
                                            <th>Status</th>
                                        </tr>
                                    </thead>

                                    <tbody>
                                        {paroquias.map((paroquia) => {
                                            const totalComunidades =
                                                paroquia.totalComunidades ??
                                                comunidades.filter(
                                                    (comunidade) =>
                                                        Number(
                                                            comunidade.paroquiaId
                                                        ) ===
                                                        Number(paroquia.id)
                                                ).length;

                                            return (
                                                <tr key={paroquia.id}>
                                                    <td>
                                                        {paroquia.nome || "-"}
                                                    </td>

                                                    <td>
                                                        {paroquia.cidade ||
                                                            "Não informada"}
                                                    </td>

                                                    <td>
                                                        {totalComunidades}
                                                    </td>

                                                    <td>
                                                        {paroquia.ativa ? (
                                                            <span className="status-ativo">
                                                                Ativa
                                                            </span>
                                                        ) : (
                                                            <span className="status-inativo">
                                                                Inativa
                                                            </span>
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

            {/* =====================================
          COMUNIDADES
      ===================================== */}

            {aba === "comunidades" && (
                <div className="admin-secao">

                    <h3>
                        Gerenciamento de Comunidades
                    </h3>

                    {comunidadeEmEdicao && (
                        <form
                            className="admin-form-usuario"
                            onSubmit={salvarEdicaoComunidade}
                            noValidate
                        >
                            <h4>
                                Editar Comunidade
                            </h4>

                            <p>
                                Atualize os dados cadastrais da comunidade. As proteções de status e exclusão continuam inalteradas.
                            </p>

                            <div className="admin-form-grid">
                                <div className="admin-form-campo">
                                    <label htmlFor="editar-comunidade-nome">
                                        Nome
                                    </label>

                                    <input
                                        id="editar-comunidade-nome"
                                        name="nome"
                                        type="text"
                                        value={
                                            dadosEdicaoComunidade.nome
                                        }
                                        onChange={
                                            alterarCampoEdicaoComunidade
                                        }
                                        disabled={
                                            salvandoEdicaoComunidade
                                        }
                                        required
                                    />
                                </div>

                                <div className="admin-form-campo">
                                    <label htmlFor="editar-comunidade-paroquia">
                                        Paróquia
                                    </label>

                                    <input
                                        id="editar-comunidade-paroquia"
                                        name="paroquia"
                                        type="text"
                                        placeholder="Nome da paróquia"
                                        value={
                                            dadosEdicaoComunidade.paroquia
                                        }
                                        onChange={
                                            alterarCampoEdicaoComunidade
                                        }
                                        disabled={
                                            salvandoEdicaoComunidade
                                        }
                                        maxLength={150}
                                    />
                                </div>

                                <div className="admin-form-campo">
                                    <label htmlFor="editar-comunidade-cidade">
                                        Cidade
                                    </label>

                                    <input
                                        id="editar-comunidade-cidade"
                                        name="cidade"
                                        type="text"
                                        placeholder="Cidade"
                                        value={
                                            dadosEdicaoComunidade.cidade
                                        }
                                        onChange={
                                            alterarCampoEdicaoComunidade
                                        }
                                        disabled={
                                            salvandoEdicaoComunidade
                                        }
                                        maxLength={150}
                                    />
                                </div>
                            </div>

                            <div className="admin-form-acoes">
                                <button
                                    type="submit"
                                    className="btn-salvar-usuario"
                                    disabled={
                                        salvandoEdicaoComunidade
                                    }
                                >
                                    {salvandoEdicaoComunidade
                                        ? "Salvando..."
                                        : "Salvar alterações"}
                                </button>

                                <button
                                    type="button"
                                    className="btn-cancelar-usuario"
                                    onClick={
                                        cancelarEdicaoComunidade
                                    }
                                    disabled={
                                        salvandoEdicaoComunidade
                                    }
                                >
                                    Cancelar
                                </button>
                            </div>
                        </form>
                    )}

                    {(carregandoDetalhesComunidade ||
                        erroDetalhesComunidade ||
                        comunidadeDetalhada) && (
                            <div className="admin-detalhes-comunidade">

                                <div className="admin-detalhes-cabecalho">
                                    <div>
                                        <span className="admin-detalhes-legenda">
                                            Detalhes da comunidade
                                        </span>

                                        <h4>
                                            {comunidadeDetalhada
                                                ?.comunidade?.nome ||
                                                "Carregando..."}
                                        </h4>

                                        {comunidadeDetalhada && (
                                            <span className="admin-detalhes-id">
                                                ID da comunidade:{" "}
                                                {comunidadeDetalhada
                                                    .comunidade?.id}
                                            </span>
                                        )}
                                    </div>

                                    <button
                                        type="button"
                                        className="admin-detalhes-fechar"
                                        onClick={
                                            fecharDetalhesComunidade
                                        }
                                        aria-label="Fechar detalhes da comunidade"
                                    >
                                        Fechar
                                    </button>
                                </div>

                                {carregandoDetalhesComunidade && (
                                    <p>
                                        Carregando detalhes...
                                    </p>
                                )}

                                {erroDetalhesComunidade && (
                                    <p className="admin-erro">
                                        {erroDetalhesComunidade}
                                    </p>
                                )}

                                {!carregandoDetalhesComunidade &&
                                    !erroDetalhesComunidade &&
                                    comunidadeDetalhada && (
                                        <>
                                            <div className="admin-detalhes-grid">

                                                <div className="admin-detalhes-item">
                                                    <span>Nome</span>
                                                    <strong>
                                                        {comunidadeDetalhada
                                                            .comunidade
                                                            ?.nome || "-"}
                                                    </strong>
                                                </div>

                                                <div className="admin-detalhes-item">
                                                    <span>Paróquia</span>
                                                    <strong>
                                                        {comunidadeDetalhada
                                                            .comunidade
                                                            ?.paroquia || "-"}
                                                    </strong>
                                                </div>

                                                <div className="admin-detalhes-item">
                                                    <span>Cidade</span>
                                                    <strong>
                                                        {comunidadeDetalhada
                                                            .comunidade
                                                            ?.cidade || "-"}
                                                    </strong>
                                                </div>

                                                <div className="admin-detalhes-item">
                                                    <span>Status</span>

                                                    {comunidadeDetalhada
                                                        .comunidade
                                                        ?.ativa ? (
                                                        <strong className="status-ativo">
                                                            Ativa
                                                        </strong>
                                                    ) : (
                                                        <strong className="status-inativo">
                                                            Inativa
                                                        </strong>
                                                    )}
                                                </div>

                                                <div className="admin-detalhes-item">
                                                    <span>Usuários</span>
                                                    <strong>
                                                        {comunidadeDetalhada
                                                            .indicadores
                                                            ?.totalUsuarios ?? 0}
                                                    </strong>
                                                </div>

                                                <div className="admin-detalhes-item">
                                                    <span>Dizimistas</span>
                                                    <strong>
                                                        {comunidadeDetalhada
                                                            .indicadores
                                                            ?.totalDizimistas ?? 0}
                                                    </strong>
                                                </div>

                                                <div className="admin-detalhes-item">
                                                    <span>Cadastrada em</span>
                                                    <strong>
                                                        {formatarData(
                                                            comunidadeDetalhada
                                                                .comunidade
                                                                ?.createdAt
                                                        )}
                                                    </strong>
                                                </div>

                                                <div className="admin-detalhes-item admin-indicador-gerencial">
                                                    <span>Valor atual registrado</span>
                                                    <strong>
                                                        {formatarMoeda(
                                                            comunidadeDetalhada
                                                                .indicadores
                                                                ?.valorAtualRegistrado
                                                        )}
                                                    </strong>
                                                </div>

                                                <div className="admin-detalhes-item admin-indicador-gerencial">
                                                    <span>Registros mensais</span>
                                                    <strong>
                                                        {comunidadeDetalhada
                                                            .indicadores
                                                            ?.totalRegistrosMensais ?? 0}
                                                    </strong>
                                                </div>

                                                <div className="admin-detalhes-item admin-indicador-gerencial">
                                                    <span>Último registro</span>
                                                    <strong>
                                                        {formatarData(
                                                            comunidadeDetalhada
                                                                .indicadores
                                                                ?.ultimoRegistroData
                                                        )}
                                                    </strong>
                                                </div>

                                                <div className="admin-detalhes-item admin-indicador-gerencial">
                                                    <span>Última movimentação</span>
                                                    <strong>
                                                        {formatarData(
                                                            comunidadeDetalhada
                                                                .indicadores
                                                                ?.ultimaMovimentacao
                                                        )}
                                                    </strong>
                                                </div>

                                                <div className="admin-detalhes-item admin-indicador-gerencial">
                                                    <span>Dias sem movimentação</span>
                                                    <strong>
                                                        {comunidadeDetalhada
                                                            .indicadores
                                                            ?.diasSemMovimentacao ??
                                                            "-"}
                                                    </strong>
                                                </div>

                                                <div className="admin-detalhes-item admin-indicador-gerencial">
                                                    <span>Acompanhamento</span>
                                                    <strong
                                                        className={`admin-atividade admin-atividade-${comunidadeDetalhada
                                                            .indicadores
                                                            ?.atividade ||
                                                            "SEM_MOVIMENTACAO"
                                                            }`}
                                                    >
                                                        {traduzirAtividade(
                                                            comunidadeDetalhada
                                                                .indicadores
                                                                ?.atividade
                                                        )}
                                                    </strong>
                                                </div>

                                            </div>

                                            <div className="admin-indicadores-aviso">
                                                Indicadores destinados ao acompanhamento
                                                administrativo. Os dados individuais dos
                                                dizimistas não são exibidos neste painel.
                                            </div>

                                            <div className="admin-detalhes-usuarios">

                                                <h5>
                                                    Usuários vinculados
                                                </h5>

                                                {comunidadeDetalhada
                                                    .usuarios?.length > 0 ? (
                                                    <div className="admin-detalhes-usuarios-lista">
                                                        {comunidadeDetalhada
                                                            .usuarios.map(
                                                                (usuario) => (
                                                                    <div
                                                                        className="admin-detalhes-usuario"
                                                                        key={
                                                                            usuario.id
                                                                        }
                                                                    >
                                                                        <div>
                                                                            <strong>
                                                                                {
                                                                                    usuario.nome
                                                                                }
                                                                            </strong>
                                                                            <span>
                                                                                {
                                                                                    usuario.email
                                                                                }
                                                                            </span>

                                                                            <span className="admin-detalhes-perfil">
                                                                                Perfil:{" "}
                                                                                {
                                                                                    usuario.perfil
                                                                                }
                                                                            </span>
                                                                        </div>

                                                                        <div className="admin-detalhes-usuario-status">
                                                                            {usuario.ativo ? (
                                                                                <span className="status-ativo">
                                                                                    Ativo
                                                                                </span>
                                                                            ) : (
                                                                                <span className="status-inativo">
                                                                                    Inativo
                                                                                </span>
                                                                            )}

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
                                                                        </div>
                                                                    </div>
                                                                )
                                                            )}
                                                    </div>
                                                ) : (
                                                    <p>
                                                        Nenhum usuário vinculado
                                                        a esta comunidade.
                                                    </p>
                                                )}

                                            </div>
                                        </>
                                    )}

                            </div>
                        )}

                    <div className="admin-filtros-comunidades">
                        <div className="admin-busca">
                            <input
                                type="search"
                                placeholder="Buscar por nome, paróquia ou cidade..."
                                value={buscaComunidade}
                                onChange={(event) =>
                                    setBuscaComunidade(
                                        event.target.value
                                    )
                                }
                                aria-label="Buscar comunidades"
                            />
                        </div>

                        <div className="admin-filtro-campo">
                            <label htmlFor="filtro-status-comunidade">
                                Status
                            </label>

                            <select
                                id="filtro-status-comunidade"
                                value={filtroStatusComunidade}
                                onChange={(event) =>
                                    setFiltroStatusComunidade(
                                        event.target.value
                                    )
                                }
                            >
                                <option value="TODAS">
                                    Todas
                                </option>
                                <option value="ATIVAS">
                                    Ativas
                                </option>
                                <option value="INATIVAS">
                                    Inativas
                                </option>
                            </select>
                        </div>

                        {filtrosComunidadesAtivos && (
                            <button
                                type="button"
                                className="admin-busca-limpar"
                                onClick={limparFiltrosComunidades}
                            >
                                Limpar filtros
                            </button>
                        )}
                    </div>

                    {mensagemComunidades && (
                        <p className="admin-sucesso">
                            {mensagemComunidades}
                        </p>
                    )}

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
                                Nenhuma comunidade cadastrada.
                            </p>
                        )}

                    {!carregandoComunidades &&
                        !erroComunidades &&
                        comunidades.length > 0 &&
                        comunidadesFiltradas.length === 0 && (
                            <p className="admin-sem-resultados">
                                Nenhuma comunidade corresponde aos
                                filtros selecionados.
                            </p>
                        )}

                    {!carregandoComunidades &&
                        comunidadesFiltradas.length > 0 && (

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

                                        {comunidadesFiltradas.map(
                                            (comunidade) => {
                                                const alterando =
                                                    comunidadeAlterando ===
                                                    comunidade.id;

                                                const excluindo =
                                                    comunidadeExcluindo ===
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
                                                        className={
                                                            Number(
                                                                comunidadeDetalhada
                                                                    ?.comunidade
                                                                    ?.id
                                                            ) ===
                                                                Number(
                                                                    comunidade.id
                                                                )
                                                                ? "admin-comunidade-selecionada"
                                                                : ""
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

                                                            <div className="admin-acoes-comunidade">

                                                                <button
                                                                    type="button"
                                                                    className="btn-detalhes-comunidade"
                                                                    disabled={
                                                                        carregandoDetalhesComunidade
                                                                    }
                                                                    onClick={() =>
                                                                        abrirDetalhesComunidade(
                                                                            comunidade
                                                                        )
                                                                    }
                                                                >
                                                                    {Number(
                                                                        comunidadeDetalhada
                                                                            ?.comunidade
                                                                            ?.id
                                                                    ) ===
                                                                        Number(
                                                                            comunidade.id
                                                                        )
                                                                        ? "Aberto"
                                                                        : "Detalhes"}
                                                                </button>

                                                                <button
                                                                    type="button"
                                                                    className="btn-editar-usuario"
                                                                    disabled={
                                                                        alterando ||
                                                                        excluindo ||
                                                                        salvandoEdicaoComunidade
                                                                    }
                                                                    onClick={() =>
                                                                        iniciarEdicaoComunidade(
                                                                            comunidade
                                                                        )
                                                                    }
                                                                >
                                                                    {Number(
                                                                        comunidadeEmEdicao
                                                                            ?.id
                                                                    ) ===
                                                                        Number(
                                                                            comunidade.id
                                                                        )
                                                                        ? "Editando"
                                                                        : "Editar"}
                                                                </button>

                                                                {ehComunidadeDoSuperAdmin ? (
                                                                    <span className="admin-sem-acao">
                                                                        Protegida
                                                                    </span>
                                                                ) : (
                                                                    <>
                                                                        {comunidade.ativa ? (
                                                                            <button
                                                                                type="button"
                                                                                className="btn-bloquear-licenca"
                                                                                disabled={
                                                                                    alterando ||
                                                                                    excluindo
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
                                                                                    alterando ||
                                                                                    excluindo
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

                                                                        <button
                                                                            type="button"
                                                                            className="btn-excluir-usuario"
                                                                            disabled={
                                                                                alterando ||
                                                                                excluindo
                                                                            }
                                                                            onClick={() =>
                                                                                excluirComunidade(
                                                                                    comunidade
                                                                                )
                                                                            }
                                                                        >
                                                                            {excluindo
                                                                                ? "Excluindo..."
                                                                                : "Excluir"}
                                                                        </button>
                                                                    </>
                                                                )}

                                                            </div>

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
                                const novoEstado =
                                    !mostrarFormularioUsuario;

                                setMostrarFormularioUsuario(
                                    novoEstado
                                );

                                if (novoEstado) {
                                    setUsuarioEmEdicao(null);
                                    setDadosEdicaoUsuario({
                                        nome: "",
                                        email: "",
                                        perfil: "",
                                        comunidadeId: null,
                                        comunidadeNome: "",
                                        novaSenha: "",
                                        confirmarNovaSenha: "",
                                    });
                                }

                                if (!novoEstado) {
                                    setMostrarSenha(false);

                                    setNovoUsuario({
                                        nome: "",
                                        email: "",
                                        senha: "",
                                        confirmarSenha: "",
                                        perfil: "ADMIN_COMUNIDADE",
                                        paroquiaId: "",
                                        licencaStatus: "ATIVA",
                                    });
                                }

                                setErroUsuarios("");
                                setMensagemUsuario("");
                            }}
                        >
                            {mostrarFormularioUsuario
                                ? "Cancelar"
                                : "+ Novo Usuário"}
                        </button>
                    </div>

                    <div className="admin-busca">
                        <input
                            type="search"
                            placeholder="Buscar por nome, e-mail, paróquia ou comunidade..."
                            value={buscaUsuario}
                            onChange={(event) =>
                                setBuscaUsuario(
                                    event.target.value
                                )
                            }
                            aria-label="Buscar usuários"
                        />

                        {buscaUsuario && (
                            <button
                                type="button"
                                className="admin-busca-limpar"
                                onClick={() =>
                                    setBuscaUsuario("")
                                }
                            >
                                Limpar
                            </button>
                        )}
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
                            noValidate
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
                                        type={mostrarSenha ? "text" : "password"}
                                        placeholder="Mínimo de 6 caracteres"
                                        minLength={6}
                                        value={novoUsuario.senha}
                                        onChange={alterarCampoNovoUsuario}
                                        disabled={cadastrandoUsuario}
                                        required
                                    />
                                </div>

                                <div className="admin-form-campo">
                                    <label htmlFor="novo-usuario-confirmar-senha">
                                        Confirmar senha
                                    </label>

                                    <input
                                        id="novo-usuario-confirmar-senha"
                                        name="confirmarSenha"
                                        type={mostrarSenha ? "text" : "password"}
                                        placeholder="Digite a senha novamente"
                                        minLength={6}
                                        value={novoUsuario.confirmarSenha}
                                        onChange={alterarCampoNovoUsuario}
                                        disabled={cadastrandoUsuario}
                                        required
                                    />
                                </div>

                                <div className="admin-form-campo admin-form-campo-senha-toggle">
                                    <span className="admin-form-label-espaco">
                                        Visualização da senha
                                    </span>

                                    <button
                                        type="button"
                                        className="btn-mostrar-senha"
                                        onClick={() =>
                                            setMostrarSenha(
                                                !mostrarSenha
                                            )
                                        }
                                        disabled={cadastrandoUsuario}
                                    >
                                        {mostrarSenha
                                            ? "Ocultar senha"
                                            : "Mostrar senha"}
                                    </button>
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
                                        disabled={cadastrandoUsuario}
                                    >
                                        <option value="ADMIN_COMUNIDADE">
                                            Administrador de Comunidade
                                        </option>
                                        <option value="ADMIN_PAROQUIA">
                                            Administrador de Paróquia
                                        </option>
                                    </select>
                                </div>

                                <div className="admin-form-campo">
                                    <label htmlFor="novo-usuario-paroquia">
                                        Paróquia
                                    </label>
                                    <select
                                        id="novo-usuario-paroquia"
                                        name="paroquiaId"
                                        value={novoUsuario.paroquiaId}
                                        onChange={alterarCampoNovoUsuario}
                                        disabled={
                                            cadastrandoUsuario ||
                                            carregandoParoquias
                                        }
                                        required
                                    >
                                        <option value="">
                                            {carregandoParoquias
                                                ? "Carregando paróquias..."
                                                : "Selecione uma paróquia"}
                                        </option>

                                        {paroquias
                                            .filter(
                                                (paroquia) =>
                                                    paroquia.ativa
                                            )
                                            .map((paroquia) => (
                                                <option
                                                    key={paroquia.id}
                                                    value={paroquia.id}
                                                >
                                                    {paroquia.nome}
                                                    {paroquia.cidade
                                                        ? ` - ${paroquia.cidade}`
                                                        : ""}
                                                </option>
                                            ))}
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

                    {usuarioEmEdicao && (
                        <form
                            className="admin-form-usuario"
                            onSubmit={salvarEdicaoUsuario}
                            noValidate
                        >
                            <h4>
                                Editar Usuário: {usuarioEmEdicao.nome}
                            </h4>

                            <div className="admin-form-grid">

                                <div className="admin-form-campo">
                                    <label htmlFor="editar-usuario-nome">
                                        Nome
                                    </label>
                                    <input
                                        id="editar-usuario-nome"
                                        name="nome"
                                        type="text"
                                        value={dadosEdicaoUsuario.nome}
                                        onChange={alterarCampoEdicaoUsuario}
                                        disabled={salvandoEdicaoUsuario}
                                        required
                                    />
                                </div>

                                <div className="admin-form-campo">
                                    <label htmlFor="editar-usuario-email">
                                        E-mail
                                    </label>
                                    <input
                                        id="editar-usuario-email"
                                        name="email"
                                        type="email"
                                        value={dadosEdicaoUsuario.email}
                                        onChange={alterarCampoEdicaoUsuario}
                                        disabled={salvandoEdicaoUsuario}
                                        required
                                    />
                                </div>

                                <div className="admin-form-campo">
                                    <label htmlFor="editar-usuario-perfil">
                                        Perfil
                                    </label>
                                    <input
                                        id="editar-usuario-perfil"
                                        type="text"
                                        value={dadosEdicaoUsuario.perfil}
                                        disabled
                                    />
                                </div>

                                <div className="admin-form-campo">
                                    <label htmlFor="editar-usuario-paroquia">
                                        Paróquia atual
                                    </label>
                                    <input
                                        id="editar-usuario-paroquia"
                                        type="text"
                                        value={
                                            dadosEdicaoUsuario.paroquiaNome
                                        }
                                        disabled
                                    />
                                </div>

                                <div className="admin-form-campo">
                                    <label htmlFor="editar-usuario-comunidade">
                                        Comunidade atual
                                    </label>
                                    <input
                                        id="editar-usuario-comunidade"
                                        type="text"
                                        value={
                                            dadosEdicaoUsuario.comunidadeNome
                                        }
                                        disabled
                                    />
                                </div>

                                <div className="admin-form-campo">
                                    <label htmlFor="editar-usuario-nova-senha">
                                        Nova senha
                                    </label>
                                    <input
                                        id="editar-usuario-nova-senha"
                                        name="novaSenha"
                                        type={
                                            mostrarSenhaEdicao
                                                ? "text"
                                                : "password"
                                        }
                                        placeholder="Mínimo de 6 caracteres"
                                        minLength={6}
                                        value={
                                            dadosEdicaoUsuario.novaSenha
                                        }
                                        onChange={
                                            alterarCampoEdicaoUsuario
                                        }
                                        disabled={
                                            salvandoEdicaoUsuario
                                        }
                                    />
                                </div>

                                <div className="admin-form-campo">
                                    <label htmlFor="editar-usuario-confirmar-nova-senha">
                                        Confirmar nova senha
                                    </label>
                                    <input
                                        id="editar-usuario-confirmar-nova-senha"
                                        name="confirmarNovaSenha"
                                        type={
                                            mostrarSenhaEdicao
                                                ? "text"
                                                : "password"
                                        }
                                        placeholder="Digite a nova senha novamente"
                                        minLength={6}
                                        value={
                                            dadosEdicaoUsuario.confirmarNovaSenha
                                        }
                                        onChange={
                                            alterarCampoEdicaoUsuario
                                        }
                                        disabled={
                                            salvandoEdicaoUsuario
                                        }
                                    />
                                </div>

                                <div className="admin-form-campo admin-form-campo-senha-toggle">
                                    <span className="admin-form-label-espaco">
                                        Visualização da nova senha
                                    </span>

                                    <button
                                        type="button"
                                        className="btn-mostrar-senha"
                                        onClick={() =>
                                            setMostrarSenhaEdicao(
                                                !mostrarSenhaEdicao
                                            )
                                        }
                                        disabled={
                                            salvandoEdicaoUsuario
                                        }
                                    >
                                        {mostrarSenhaEdicao
                                            ? "Ocultar senha"
                                            : "Mostrar senha"}
                                    </button>
                                </div>

                            </div>

                            <div className="admin-form-acoes">
                                <button
                                    type="button"
                                    className="btn-novo-usuario"
                                    onClick={cancelarEdicaoUsuario}
                                    disabled={salvandoEdicaoUsuario}
                                >
                                    Cancelar edição
                                </button>

                                <button
                                    type="submit"
                                    className="btn-salvar-usuario"
                                    disabled={salvandoEdicaoUsuario}
                                >
                                    {salvandoEdicaoUsuario
                                        ? "Salvando..."
                                        : "Salvar alterações"}
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
                                Nenhum usuário cadastrado.
                            </p>
                        )}

                    {!carregandoUsuarios &&
                        !erroUsuarios &&
                        usuarios.length > 0 &&
                        usuariosFiltrados.length === 0 && (
                            <p className="admin-sem-resultados">
                                Nenhum usuário encontrado para
                                "{buscaUsuario}".
                            </p>
                        )}

                    {!carregandoUsuarios &&
                        usuariosFiltrados.length > 0 && (

                            <div className="admin-tabela-wrapper">

                                <table className="admin-tabela">

                                    <thead>
                                        <tr>
                                            <th>Nome</th>
                                            <th>E-mail</th>
                                            <th>Perfil</th>
                                            <th>Paróquia</th>
                                            <th>Comunidade</th>
                                            <th>Status</th>
                                            <th>Licença</th>
                                            <th>Ações</th>
                                        </tr>
                                    </thead>

                                    <tbody>

                                        {usuariosFiltrados.map(
                                            (usuario) => {
                                                const alterandoStatus =
                                                    usuarioAlterandoStatus ===
                                                    usuario.id;

                                                const alterandoLicenca =
                                                    usuarioAlterandoLicenca ===
                                                    usuario.id;

                                                const excluindo =
                                                    usuarioExcluindo ===
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
                                                            {usuario.paroquiaNome ||
                                                                "Sem paróquia"}
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

                                                                    <button
                                                                        type="button"
                                                                        className="btn-editar-usuario"
                                                                        disabled={
                                                                            alterandoStatus ||
                                                                            alterandoLicenca ||
                                                                            excluindo ||
                                                                            salvandoEdicaoUsuario
                                                                        }
                                                                        onClick={() =>
                                                                            iniciarEdicaoUsuario(
                                                                                usuario
                                                                            )
                                                                        }
                                                                    >
                                                                        Editar
                                                                    </button>

                                                                    {/* STATUS DO USUÁRIO */}

                                                                    {usuario.ativo ? (
                                                                        <button
                                                                            type="button"
                                                                            className="btn-desativar-usuario"
                                                                            disabled={
                                                                                alterandoStatus ||
                                                                                alterandoLicenca ||
                                                                                excluindo
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
                                                                                alterandoLicenca ||
                                                                                excluindo
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
                                                                                alterandoLicenca ||
                                                                                excluindo
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
                                                                                alterandoLicenca ||
                                                                                excluindo
                                                                            }
                                                                            onClick={() =>
                                                                                reativarLicenca(
                                                                                    usuario
                                                                                )
                                                                            }
                                                                        >
                                                                            {alterandoLicenca
                                                                                ? "Alterando..."
                                                                                : "Reativar licença"}
                                                                        </button>
                                                                    )}

                                                                    {/* EXCLUSÃO PERMANENTE */}

                                                                    {usuario.comunidadeId === null && (
                                                                        <button
                                                                            type="button"
                                                                            className="btn-excluir-usuario"
                                                                            disabled={
                                                                                alterandoStatus ||
                                                                                alterandoLicenca ||
                                                                                excluindo ||
                                                                                salvandoEdicaoUsuario
                                                                            }
                                                                            onClick={() =>
                                                                                excluirUsuario(
                                                                                    usuario
                                                                                )
                                                                            }
                                                                        >
                                                                            {excluindo
                                                                                ? "Excluindo..."
                                                                                : "Excluir"}
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