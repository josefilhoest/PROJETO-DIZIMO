import { useState } from "react";

import api from "../api/api";

function Login({ onLogin }) {
    const [email, setEmail] = useState("");
    const [senha, setSenha] = useState("");
    const [mostrarSenha, setMostrarSenha] = useState(false);
    const [erro, setErro] = useState("");
    const [carregando, setCarregando] = useState(false);

    const fazerLogin = async (evento) => {
        evento.preventDefault();

        setErro("");

        if (!email.trim() || !senha.trim()) {
            setErro("Preencha o e-mail e a senha para continuar.");
            return;
        }

        try {
            setCarregando(true);

            const resposta = await api.post("/auth/login", {
                email: email.trim(),
                senha,
            });

            const { token, usuario } = resposta.data;

            localStorage.setItem("token", token);
            localStorage.setItem(
                "usuario",
                JSON.stringify(usuario)
            );

            onLogin(usuario);
        } catch (error) {
            console.error("Erro no login:", error);

            if (error.response?.status === 401) {
                setErro("E-mail ou senha inválidos.");
                return;
            }

            if (error.response?.status === 403) {
                setErro(
                    error.response?.data?.erro ||
                    "Este usuário não possui acesso ao sistema."
                );
                return;
            }

            setErro(
                error.response?.data?.erro ||
                "Não foi possível entrar no sistema. Tente novamente."
            );
        } finally {
            setCarregando(false);
        }
    };

    return (
        <div className="login-container">
            <div className="login-decoracao login-decoracao-1"></div>
            <div className="login-decoracao login-decoracao-2"></div>

            <main className="login-card">
                <div className="login-topo">
                    <div
                        className="login-icone"
                        aria-hidden="true"
                    >
                        <span className="login-cruz">✝</span>
                    </div>

                    <span className="login-etiqueta">
                        PASTORAL DA PARTILHA
                    </span>

                    <h1>Sistema de Dízimo</h1>

                    <p className="login-subtitulo">
                        Acesse sua comunidade para continuar
                    </p>
                </div>

                {erro && (
                    <div
                        className="login-erro"
                        role="alert"
                    >
                        <div className="login-erro-icone">
                            !
                        </div>

                        <div>
                            <strong>
                                Não foi possível entrar
                            </strong>

                            <p>{erro}</p>
                        </div>
                    </div>
                )}

                <form
                    className="login-form"
                    onSubmit={fazerLogin}
                >
                    <div className="login-grupo">
                        <label htmlFor="email">
                            E-mail
                        </label>

                        <div className="login-input-wrapper">
                            <span
                                className="login-input-icone"
                                aria-hidden="true"
                            >
                                @
                            </span>

                            <input
                                id="email"
                                type="email"
                                value={email}
                                onChange={(evento) =>
                                    setEmail(evento.target.value)
                                }
                                placeholder="Digite seu e-mail"
                                autoComplete="email"
                                required
                            />
                        </div>
                    </div>

                    <div className="login-grupo">
                        <label htmlFor="senha">
                            Senha
                        </label>

                        <div className="login-input-wrapper">
                            <span
                                className="login-input-icone"
                                aria-hidden="true"
                            >
                                🔒
                            </span>

                            <input
                                id="senha"
                                type={
                                    mostrarSenha
                                        ? "text"
                                        : "password"
                                }
                                value={senha}
                                onChange={(evento) =>
                                    setSenha(evento.target.value)
                                }
                                placeholder="Digite sua senha"
                                autoComplete="current-password"
                                required
                            />

                            <button
                                type="button"
                                className="btn-mostrar-senha"
                                onClick={() =>
                                    setMostrarSenha(
                                        (valorAtual) =>
                                            !valorAtual
                                    )
                                }
                                aria-label={
                                    mostrarSenha
                                        ? "Ocultar senha"
                                        : "Mostrar senha"
                                }
                                title={
                                    mostrarSenha
                                        ? "Ocultar senha"
                                        : "Mostrar senha"
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
                        {carregando ? (
                            <>
                                <span className="login-spinner"></span>
                                Entrando...
                            </>
                        ) : (
                            <>
                                <span>
                                    Entrar no sistema
                                </span>

                                <span
                                    className="btn-login-seta"
                                    aria-hidden="true"
                                >
                                    →
                                </span>
                            </>
                        )}
                    </button>
                </form>

                <div className="login-separador">
                    <span></span>
                </div>

                <footer className="login-rodape">
                    <p>
                        Sistema de Gestão de Dízimos
                    </p>

                    <span>
                        Gestão de Comunidades
                    </span>
                </footer>
            </main>
        </div>
    );
}

export default Login;