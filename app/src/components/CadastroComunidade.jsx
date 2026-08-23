import { useState } from "react";

import api from "../api/api";

function CadastroComunidade({
    usuario,
    onCadastroConcluido,
    onSair,
}) {
    const [formulario, setFormulario] = useState({
        nomeComunidade: "",
        paroquia: "",
        cidade: "",
    });

    const [erro, setErro] = useState("");
    const [carregando, setCarregando] = useState(false);

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

        if (!formulario.nomeComunidade.trim()) {
            setErro("Informe o nome da comunidade.");
            return;
        }

        const token = localStorage.getItem("token");

        if (!token) {
            setErro(
                "Sua sessão não foi encontrada. Faça login novamente."
            );
            return;
        }

        try {
            setCarregando(true);

            const resposta = await api.post(
                "/auth/cadastrar-comunidade",
                {
                    nomeComunidade:
                        formulario.nomeComunidade.trim(),

                    paroquia:
                        formulario.paroquia.trim(),

                    cidade:
                        formulario.cidade.trim(),
                },
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                }
            );

            /*
              A API deve devolver o usuário atualizado,
              já com comunidadeId.
            */
            const usuarioAtualizado =
                resposta.data.usuario;

            if (!usuarioAtualizado?.comunidadeId) {
                setErro(
                    "A comunidade foi cadastrada, mas não foi possível atualizar o acesso do usuário."
                );
                return;
            }

            localStorage.setItem(
                "usuario",
                JSON.stringify(usuarioAtualizado)
            );

            onCadastroConcluido(usuarioAtualizado);
        } catch (error) {
            console.error(
                "Erro ao cadastrar comunidade:",
                error
            );

            if (error.response?.status === 401) {
                setErro(
                    "Sua sessão expirou. Faça login novamente."
                );
                return;
            }

            if (error.response?.status === 403) {
                setErro(
                    error.response?.data?.erro ||
                    "Você não possui permissão para cadastrar uma comunidade."
                );
                return;
            }

            if (error.response?.status === 409) {
                setErro(
                    error.response?.data?.erro ||
                    "Este usuário já possui uma comunidade."
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
                    <div
                        className="login-icone"
                        aria-hidden="true"
                    >
                        <span className="login-cruz">✝</span>
                    </div>

                    <span className="login-etiqueta">
                        PASTORAL DA PARTILHA
                    </span>

                    <h1>Cadastrar Comunidade</h1>

                    <p className="login-subtitulo">
                        Complete seu primeiro acesso
                    </p>
                </div>

                <div className="cadastro-usuario-info">
                    <p>
                        Olá, <strong>{usuario?.nome}</strong>
                    </p>

                    <span>
                        Cadastre a comunidade que será vinculada
                        ao seu acesso.
                    </span>
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
                                Não foi possível cadastrar
                            </strong>

                            <p>{erro}</p>
                        </div>
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
                            autoComplete="organization"
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
                        onClick={onSair}
                        disabled={carregando}
                    >
                        Sair
                    </button>
                </form>
            </main>
        </div>
    );
}

export default CadastroComunidade;