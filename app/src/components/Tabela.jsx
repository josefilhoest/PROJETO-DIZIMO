import { useEffect, useState } from "react";
import api from "../api/api";

function Tabela({ usuario }) {
    // =====================================================
    // ESTADOS
    // =====================================================

    const [dizimistas, setDizimistas] = useState([]);

    const [formulario, setFormulario] = useState({
        id: null,
        numero: "",
        nome: "",
        valor: "",
    });

    const [registroMensal, setRegistroMensal] = useState({
        id: null,
        comunidade: usuario?.comunidadeNome || "",
        data: "",
        equipe_comunidade: "",
        conferido_em: "",
        responsavel_paroquia: "",
    });

    // =====================================================
    // CARREGAR DIZIMISTAS
    // A comunidade é identificada pelo token JWT.
    // =====================================================

    const carregarDizimistas = async () => {
        try {
            const resposta = await api.get("/dizimistas");

            setDizimistas(resposta.data);
        } catch (erro) {
            console.error("Erro ao carregar dizimistas:", erro);

            if (erro.response?.status === 401) {
                alert("Sua sessão expirou. Faça login novamente.");
            }
        }
    };

    // =====================================================
    // CARREGAR REGISTRO MENSAL
    // =====================================================

    const carregarRegistroMensal = async () => {
        try {
            const resposta = await api.get("/registros");

            if (resposta.data.length > 0) {
                const registro = resposta.data[0];

                setRegistroMensal({
                    id: registro.id,

                    // O nome vindo do usuário logado tem prioridade.
                    comunidade:
                        usuario?.comunidadeNome ||
                        registro.comunidade ||
                        "",

                    data: registro.data || "",

                    equipe_comunidade:
                        registro.equipe_comunidade || "",

                    conferido_em:
                        registro.conferido_em || "",

                    responsavel_paroquia:
                        registro.responsavel_paroquia || "",
                });
            } else {
                // Se ainda não existir ficha mensal,
                // mantém automaticamente a comunidade do usuário.
                setRegistroMensal((registroAtual) => ({
                    ...registroAtual,

                    comunidade:
                        usuario?.comunidadeNome || "",
                }));
            }
        } catch (erro) {
            console.error(
                "Erro ao carregar registro mensal:",
                erro
            );

            if (erro.response?.status === 401) {
                alert("Sua sessão expirou. Faça login novamente.");
            }
        }
    };

    // =====================================================
    // CARREGAR DADOS AO ABRIR A TELA
    // =====================================================

    useEffect(() => {
        carregarDizimistas();
        carregarRegistroMensal();
    }, []);

    // =====================================================
    // ATUALIZAR O NOME DA COMUNIDADE
    // CASO O USUÁRIO MUDE/SEJA CARREGADO
    // =====================================================

    useEffect(() => {
        if (usuario?.comunidadeNome) {
            setRegistroMensal((registroAtual) => ({
                ...registroAtual,
                comunidade: usuario.comunidadeNome,
            }));
        }
    }, [usuario]);

    // =====================================================
    // ALTERAR CAMPOS DO FORMULÁRIO DE DIZIMISTA
    // =====================================================

    const alterarCampo = (evento) => {
        const { name, value } = evento.target;

        setFormulario((formularioAtual) => ({
            ...formularioAtual,
            [name]: value,
        }));
    };

    // =====================================================
    // ALTERAR CAMPOS DA FICHA MENSAL
    // =====================================================

    const alterarRegistroMensal = (evento) => {
        const { name, value } = evento.target;

        // Segurança extra:
        // comunidade não deve ser alterada manualmente.
        if (name === "comunidade") {
            return;
        }

        setRegistroMensal((registroAtual) => ({
            ...registroAtual,
            [name]: value,
        }));
    };

    // =====================================================
    // LIMPAR FORMULÁRIO
    // =====================================================

    const limparFormulario = () => {
        setFormulario({
            id: null,
            numero: "",
            nome: "",
            valor: "",
        });
    };

    // =====================================================
    // CALCULAR FOLHA
    // 40 PESSOAS POR FOLHA
    // =====================================================

    const calcularFolha = (numero) => {
        const numeroConvertido = Number(numero);

        if (!numeroConvertido || numeroConvertido < 1) {
            return null;
        }

        return Math.ceil(numeroConvertido / 40);
    };

    // =====================================================
    // SALVAR / EDITAR DIZIMISTA
    // =====================================================

    const salvarDizimista = async (evento) => {
        evento.preventDefault();

        const folha = calcularFolha(formulario.numero);

        if (!folha) {
            alert("O número deve ser maior que 0.");
            return;
        }

        const nomeLimpo = formulario.nome.trim();

        if (!nomeLimpo) {
            alert("Informe o nome do dizimista.");
            return;
        }

        const dados = {
            numero: Number(formulario.numero),
            folha,
            nome: nomeLimpo,
            valor: Number(formulario.valor || 0),
        };

        try {
            if (formulario.id) {
                await api.put(
                    `/dizimistas/${formulario.id}`,
                    dados
                );
            } else {
                await api.post("/dizimistas", dados);
            }

            limparFormulario();

            await carregarDizimistas();
        } catch (erro) {
            console.error(
                "Erro ao salvar dizimista:",
                erro
            );

            if (erro.response?.status === 409) {
                alert(
                    erro.response?.data?.erro ||
                    "Já existe um dizimista com esse número nesta comunidade."
                );

                return;
            }

            if (erro.response?.status === 401) {
                alert("Sua sessão expirou. Faça login novamente.");
                return;
            }

            alert(
                erro.response?.data?.erro ||
                "Não foi possível salvar o dizimista."
            );
        }
    };

    // =====================================================
    // EDITAR DIZIMISTA
    // =====================================================

    const editarDizimista = (dizimista) => {
        setFormulario({
            id: dizimista.id,
            numero: dizimista.numero,
            nome: dizimista.nome,
            valor: dizimista.valor,
        });

        window.scrollTo({
            top: 0,
            behavior: "smooth",
        });
    };

    // =====================================================
    // CANCELAR EDIÇÃO
    // =====================================================

    const cancelarEdicao = () => {
        limparFormulario();
    };

    // =====================================================
    // EXCLUIR DIZIMISTA
    // =====================================================

    const excluirDizimista = async (id) => {
        const confirmar = window.confirm(
            "Tem certeza que deseja excluir este registro?"
        );

        if (!confirmar) {
            return;
        }

        try {
            await api.delete(`/dizimistas/${id}`);

            await carregarDizimistas();
        } catch (erro) {
            console.error(
                "Erro ao excluir dizimista:",
                erro
            );

            if (erro.response?.status === 401) {
                alert("Sua sessão expirou. Faça login novamente.");
                return;
            }

            alert(
                erro.response?.data?.erro ||
                "Não foi possível excluir o dizimista."
            );
        }
    };

    // =====================================================
    // SALVAR REGISTRO MENSAL
    // =====================================================

    const salvarRegistroMensal = async () => {
        try {
            if (!usuario?.comunidadeNome) {
                alert(
                    "Não foi possível identificar a comunidade do usuário."
                );
                return;
            }

            const dados = {
                // Nunca usamos um valor digitado pelo usuário.
                comunidade: usuario.comunidadeNome,

                data:
                    registroMensal.data || null,

                equipe_comunidade:
                    registroMensal.equipe_comunidade.trim(),

                conferido_em:
                    registroMensal.conferido_em || null,

                responsavel_paroquia:
                    registroMensal.responsavel_paroquia.trim(),
            };

            if (registroMensal.id) {
                const resposta = await api.put(
                    `/registros/${registroMensal.id}`,
                    dados
                );

                setRegistroMensal({
                    id: resposta.data.id,

                    comunidade:
                        usuario.comunidadeNome,

                    data:
                        resposta.data.data || "",

                    equipe_comunidade:
                        resposta.data.equipe_comunidade || "",

                    conferido_em:
                        resposta.data.conferido_em || "",

                    responsavel_paroquia:
                        resposta.data.responsavel_paroquia || "",
                });
            } else {
                const resposta = await api.post(
                    "/registros",
                    dados
                );

                setRegistroMensal({
                    id: resposta.data.id,

                    comunidade:
                        usuario.comunidadeNome,

                    data:
                        resposta.data.data || "",

                    equipe_comunidade:
                        resposta.data.equipe_comunidade || "",

                    conferido_em:
                        resposta.data.conferido_em || "",

                    responsavel_paroquia:
                        resposta.data.responsavel_paroquia || "",
                });
            }

            alert(
                "Dados da ficha salvos com sucesso!"
            );
        } catch (erro) {
            console.error(
                "Erro ao salvar dados da ficha:",
                erro
            );

            if (erro.response?.status === 401) {
                alert("Sua sessão expirou. Faça login novamente.");
                return;
            }

            alert(
                erro.response?.data?.erro ||
                "Não foi possível salvar os dados da ficha."
            );
        }
    };

    // =====================================================
    // TOTAL DE FOLHAS
    // =====================================================

    const totalFolhas = Math.max(
        1,
        ...dizimistas.map(
            (dizimista) =>
                Number(dizimista.folha) || 1
        )
    );

    const folhas = Array.from(
        {
            length: totalFolhas,
        },
        (_, index) => index + 1
    );

    // =====================================================
    // CALCULAR TOTAL
    // =====================================================

    const calcularTotal = (lista) => {
        return lista.reduce(
            (total, dizimista) =>
                total + Number(dizimista.valor || 0),
            0
        );
    };

    // =====================================================
    // TOTAL GERAL
    // =====================================================

    const totalGeral =
        calcularTotal(dizimistas);

    // =====================================================
    // DIVISÃO 50%
    // =====================================================

    const totalParoquia =
        totalGeral / 2;

    const totalComunidade =
        totalGeral / 2;

    // =====================================================
    // FORMATAR DINHEIRO
    // =====================================================

    const formatarDinheiro = (valor) => {
        return Number(valor || 0).toLocaleString(
            "pt-BR",
            {
                style: "currency",
                currency: "BRL",
            }
        );
    };

    // =====================================================
    // RENDERIZAR UMA FOLHA
    // =====================================================

    const renderizarFolha = (
        numeroFolha,
        lista
    ) => {
        const totalFolha =
            calcularTotal(lista);

        return (
            <section
                className="folha"
                key={numeroFolha}
            >
                <h3>
                    FOLHA{" "}
                    {String(numeroFolha).padStart(
                        2,
                        "0"
                    )}
                </h3>

                <table>
                    <thead>
                        <tr>
                            <th>Nome</th>
                            <th>Nº</th>
                            <th>Valor</th>
                            <th>Ações</th>
                        </tr>
                    </thead>

                    <tbody>
                        {lista.length === 0 ? (
                            <tr>
                                <td colSpan="4">
                                    Nenhum registro nesta folha.
                                </td>
                            </tr>
                        ) : (
                            lista.map((dizimista) => (
                                <tr key={dizimista.id}>
                                    <td className="nome-dizimista">
                                        {dizimista.nome}
                                    </td>

                                    <td>
                                        {String(
                                            dizimista.numero
                                        ).padStart(2, "0")}
                                    </td>

                                    <td>
                                        {formatarDinheiro(
                                            dizimista.valor
                                        )}
                                    </td>

                                    <td>
                                        <button
                                            type="button"
                                            className="btn-editar"
                                            title="Editar"
                                            aria-label="Editar"
                                            onClick={() =>
                                                editarDizimista(
                                                    dizimista
                                                )
                                            }
                                        >
                                            ✏️
                                        </button>

                                        <button
                                            type="button"
                                            className="btn-excluir"
                                            title="Excluir"
                                            aria-label="Excluir"
                                            onClick={() =>
                                                excluirDizimista(
                                                    dizimista.id
                                                )
                                            }
                                        >
                                            🗑️
                                        </button>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>

                    <tfoot>
                        <tr>
                            <td colSpan="2">
                                <strong>
                                    TOTAL DA FOLHA
                                </strong>
                            </td>

                            <td>
                                <strong>
                                    {formatarDinheiro(
                                        totalFolha
                                    )}
                                </strong>
                            </td>

                            <td></td>
                        </tr>
                    </tfoot>
                </table>
            </section>
        );
    };

    // =====================================================
    // RETURN
    // =====================================================

    return (
        <div className="registro">
            {/* =========================================
          CABEÇALHO DA FICHA
      ========================================= */}

            <header className="cabecalho-ficha">
                <h1>
                    PARÓQUIA NOSSA SENHORA DA PENHA –
                    SUCATINGA
                </h1>

                <h2>
                    PASTORAL DA PARTILHA
                </h2>

                <h3>
                    REGISTRO MENSAL DA PARTILHA
                </h3>

                <div className="dados-ficha">
                    <label>
                        Comunidade:

                        <input
                            className="campo-tela"
                            type="text"
                            name="comunidade"
                            value={
                                registroMensal.comunidade
                            }

                            /*
                              O usuário não pode trocar manualmente
                              a comunidade vinculada à sua conta.
                            */
                            readOnly
                        />

                        <span className="campo-impressao">
                            {registroMensal.comunidade}
                        </span>
                    </label>

                    <label>
                        Data:

                        <input
                            className="campo-tela"
                            type="date"
                            name="data"
                            value={
                                registroMensal.data
                            }
                            onChange={
                                alterarRegistroMensal
                            }
                        />

                        <span className="campo-impressao">
                            ____ / ____ / ________
                        </span>
                    </label>
                </div>
            </header>

            {/* =========================================
          FORMULÁRIO DIZIMISTA
      ========================================= */}

            <form
                onSubmit={salvarDizimista}
                className="formulario"
            >
                <input
                    type="number"
                    name="numero"
                    placeholder="Número"
                    min="1"
                    value={formulario.numero}
                    onChange={alterarCampo}
                    required
                />

                <input
                    type="text"
                    name="nome"
                    placeholder="Nome do dizimista"
                    value={formulario.nome}
                    onChange={alterarCampo}
                    required
                />

                <input
                    type="number"
                    name="valor"
                    placeholder="Valor"
                    step="0.01"
                    min="0"
                    value={formulario.valor}
                    onChange={alterarCampo}
                    required
                />

                <button
                    type="submit"
                    className="btn-salvar"
                >
                    {formulario.id
                        ? "Salvar alteração"
                        : "Adicionar"}
                </button>

                {formulario.id && (
                    <button
                        type="button"
                        className="btn-cancelar"
                        onClick={cancelarEdicao}
                    >
                        Cancelar edição
                    </button>
                )}
            </form>

            {/* =========================================
          FOLHAS
      ========================================= */}

            {folhas.map(
                (numeroFolha) => {
                    const dizimistasDaFolha =
                        dizimistas.filter(
                            (dizimista) =>
                                Number(
                                    dizimista.folha
                                ) === numeroFolha
                        );

                    return renderizarFolha(
                        numeroFolha,
                        dizimistasDaFolha
                    );
                }
            )}

            {/* =========================================
          RESUMO GERAL
      ========================================= */}

            <div className="resumo-geral">
                <div>
                    <span>
                        TOTAL GERAL
                    </span>

                    <strong>
                        {formatarDinheiro(
                            totalGeral
                        )}
                    </strong>
                </div>

                <div>
                    <span>
                        PARÓQUIA (50%)
                    </span>

                    <strong>
                        {formatarDinheiro(
                            totalParoquia
                        )}
                    </strong>
                </div>

                <div>
                    <span>
                        COMUNIDADE (50%)
                    </span>

                    <strong>
                        {formatarDinheiro(
                            totalComunidade
                        )}
                    </strong>
                </div>
            </div>

            {/* =========================================
          ASSINATURAS
      ========================================= */}

            <section className="assinaturas">
                <div className="campo-assinatura">
                    <label>
                        Equipe da Comunidade:
                    </label>

                    <input
                        className="campo-tela"
                        type="text"
                        name="equipe_comunidade"
                        value={
                            registroMensal.equipe_comunidade
                        }
                        onChange={
                            alterarRegistroMensal
                        }
                        placeholder="Nome / assinatura"
                    />

                    <span className="campo-impressao linha-assinatura"></span>
                </div>

                <div className="campo-assinatura">
                    <label>
                        Conferido em:
                    </label>

                    <input
                        className="campo-tela"
                        type="date"
                        name="conferido_em"
                        value={
                            registroMensal.conferido_em
                        }
                        onChange={
                            alterarRegistroMensal
                        }
                    />

                    <span className="campo-impressao">
                        ____ / ____ / ________
                    </span>
                </div>

                <div className="campo-assinatura">
                    <label>
                        Responsável da Paróquia:
                    </label>

                    <input
                        className="campo-tela"
                        type="text"
                        name="responsavel_paroquia"
                        value={
                            registroMensal.responsavel_paroquia
                        }
                        onChange={
                            alterarRegistroMensal
                        }
                        placeholder="Nome / assinatura"
                    />

                    <span className="campo-impressao linha-assinatura"></span>
                </div>
            </section>

            {/* =========================================
          BOTÕES DA FICHA
      ========================================= */}

            <div className="acoes-ficha">
                <button
                    type="button"
                    className="btn-salvar-ficha"
                    onClick={
                        salvarRegistroMensal
                    }
                >
                    Salvar dados da ficha
                </button>

                <button
                    type="button"
                    className="btn-imprimir"
                    onClick={() =>
                        window.print()
                    }
                >
                    🖨️ Imprimir ficha
                </button>
            </div>
        </div>
    );
}

export default Tabela;