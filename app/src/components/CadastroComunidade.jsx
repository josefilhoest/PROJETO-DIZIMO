import { useState } from "react";
import api from "../api/api";

function CadastroComunidade({ onVoltar }) {
    const [formulario, setFormulario] = useState({
        nomeComunidade: "",
        paroquia: "",
        cidade: "",
        nomeResponsavel: "",
        email: "",
        senha: "",
    });

    const [erro, setErro] = useState("");
    const [sucesso, setSucesso] = useState("");
    const [carregando, setCarregando] = useState(false);
    const [mostrarSenha, setMostrarSenha] = useState(false);

    const alterarCampo = (evento) => {
        const { name, value } = evento.target;

        setFormulario((dadosAtuais) => ({
            ...dadosAtuais,
            [name]: value,
        }));
    };

    const cadastrarComunidade = async (evento) => {
        evento.preventDefault();

        setErro("");
        setSucesso("");

        if (
            !formulario.nomeComunidade.trim() ||
            !formulario.nomeResponsavel.trim() ||
            !formulario.email.trim() ||
            !formulario.senha.trim()
        ) {
            setErro(
                "Preencha o nome da comunidade, responsável, e-mail e senha."
            );

            return;
        }

        try {
            setCarregando(true);

            await api.post("/auth/cadastrar-comunidade", {
                nomeComunidade: formulario.nomeComunidade.trim(),
                paroquia: formulario.paroquia.trim(),
                cidade: formulario.cidade.trim(),
                nomeResponsavel: formulario.nomeResponsavel.trim(),
                email: formulario.email.trim(),
                senha: formulario.senha,
            });

            setSucesso(
                "Comunidade cadastrada com sucesso! Agora você já pode fazer login."
            );

            setFormulario({
                nomeComunidade: "",
                paroquia: "",
                cidade: "",
                nomeResponsavel: "",
                email: "",
                senha: "",
            });
        } catch (error) {
            console.error(
                "Erro ao cadastrar comunidade:",
                error
            );

            if (error.response?.status === 409) {
                setErro(
                    "Já existe um usuário cadastrado com este e-mail."
                );

                return;
            }

            setErro(
                error.response?.data?.erro ||
                "Não foi possível cadastrar a comunidade."
            );
        } finally {
            setCarregando(false);
        }
    };

    return (
        <div className="login-container">
            <div className="login-decoracao login-decoracao-1"></div>
            <div className="login-decoracao login-decoracao-2"></div>

            <main className="login-card cadastro-comunidade-card">
                <div className="login-topo">
                    <div className="login-icone" aria-hidden="true">
                        <span className="login-cruz">✝</span>
                    </div>

                    <span className="login-etiqueta">
                        PASTORAL DA PARTILHA
                    </span>

                    <h1>Cadastrar Comunidade</h1>

                    <p className="login-subtitulo">
                        Crie o acesso da sua comunidade
                    </p>
                </div>

                {erro && (
                    <div className="login-erro" role="alert">
                        <div className="login-erro-icone">!</div>

                        <div>
                            <strong>Não foi possível cadastrar</strong>
                            <p>{erro}</p>
                        </div>
                    </div>
                )}

                {sucesso && (
                    <div className="cadastro-sucesso">
                        <strong>Cadastro realizado!</strong>
                        <p>{sucesso}</p>
                    </div>
                )}

                <form
                    className="login-form"
                    onSubmit={cadastrarComunidade}
                >
                    <div className="login-grupo">
                        <label htmlFor="nomeComunidade">
                            Nome da comunidade *
                        </label>

                        <input
                            id="nomeComunidade"
                            name="nomeComunidade"
                            type="text"
                            value={formulario.nomeComunidade}
                            onChange={alterarCampo}
                            placeholder="Ex.: Comunidade São José"
                            required
                        />
                    </div>

                    <div className="login-grupo">
                        <label htmlFor="paroquia">
                            Paróquia
                        </label>

                        <input
                            id="paroquia"
                            name="paroquia"
                            type="text"
                            value={formulario.paroquia}
                            onChange={alterarCampo}
                            placeholder="Nome da paróquia"
                        />
                    </div>

                    <div className="login-grupo">
                        <label htmlFor="cidade">
                            Cidade
                        </label>

                        <input
                            id="cidade"
                            name="cidade"
                            type="text"
                            value={formulario.cidade}
                            onChange={alterarCampo}
                            placeholder="Cidade"
                        />
                    </div>

                    <div className="login-grupo">
                        <label htmlFor="nomeResponsavel">
                            Nome do responsável *
                        </label>

                        <input
                            id="nomeResponsavel"
                            name="nomeResponsavel"
                            type="text"
                            value={formulario.nomeResponsavel}
                            onChange={alterarCampo}
                            placeholder="Nome completo"
                            required
                        />
                    </div>

                    <div className="login-grupo">
                        <label htmlFor="emailCadastro">
                            E-mail *
                        </label>

                        <input
                            id="emailCadastro"
                            name="email"
                            type="email"
                            value={formulario.email}
                            onChange={alterarCampo}
                            placeholder="Digite seu e-mail"
                            autoComplete="email"
                            required
                        />
                    </div>

                    <div className="login-grupo">
                        <label htmlFor="senhaCadastro">
                            Senha *
                        </label>

                        <div className="login-input-wrapper">
                            <span
                                className="login-input-icone"
                                aria-hidden="true"
                            >
                                🔒
                            </span>

                            <input
                                id="senhaCadastro"
                                name="senha"
                                type={
                                    mostrarSenha
                                        ? "text"
                                        : "password"
                                }
                                value={formulario.senha}
                                onChange={alterarCampo}
                                placeholder="Crie uma senha"
                                autoComplete="new-password"
                                required
                            />

                            <button
                                type="button"
                                className="btn-mostrar-senha"
                                onClick={() =>
                                    setMostrarSenha(
                                        (valorAtual) => !valorAtual
                                    )
                                }
                            >
                                {mostrarSenha ? "🙈" : "👁️"}
                            </button>
                        </div>
                    </div>

                    <button
                        type="submit"
                        className="btn-login"
                        disabled={carregando}
                    >
                        {carregando
                            ? "Cadastrando..."
                            : "Cadastrar comunidade"}
                    </button>

                    <button
                        type="button"
                        className="btn-voltar-login"
                        onClick={onVoltar}
                    >
                        ← Voltar para o login
                    </button>
                </form>
            </main>
        </div>
    );
}

export default CadastroComunidade;