import { useEffect, useState } from "react";
import api from "../api/api";

function Tabela() {
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
        comunidade: "Palmeira",
        data: "",
        equipe_comunidade: "",
        conferido_em: "",
        responsavel_paroquia: "",
    });

    // =====================================================
    // CARREGAR DIZIMISTAS
    // =====================================================

    const carregarDizimistas = async () => {
        try {
            const resposta = await api.get("/dizimistas");
            setDizimistas(resposta.data);
        } catch (erro) {
            console.error("Erro ao carregar dizimistas:", erro);
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
                    comunidade: registro.comunidade || "",
                    data: registro.data || "",
                    equipe_comunidade: registro.equipe_comunidade || "",
                    conferido_em: registro.conferido_em || "",
                    responsavel_paroquia: registro.responsavel_paroquia || "",
                });
            }
        } catch (erro) {
            console.error("Erro ao carregar registro mensal:", erro);
        }
    };

    // =====================================================
    // CARREGAR DADOS AO ABRIR A PÁGINA
    // =====================================================

    useEffect(() => {
        carregarDizimistas();
        carregarRegistroMensal();
    }, []);

    // =====================================================
    // ALTERAR CAMPOS DO FORMULÁRIO
    // =====================================================

    const alterarCampo = (evento) => {
        const { name, value } = evento.target;

        setFormulario({
            ...formulario,
            [name]: value,
        });
    };

    // =====================================================
    // ALTERAR CAMPOS DO REGISTRO MENSAL
    // =====================================================

    const alterarRegistroMensal = (evento) => {
        const { name, value } = evento.target;

        setRegistroMensal({
            ...registroMensal,
            [name]: value,
        });
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
    // CALCULAR FOLHA AUTOMATICAMENTE
    // =====================================================

    const calcularFolha = (numero) => {
        const n = Number(numero);

        if (n >= 1 && n <= 40) return 1;
        if (n >= 41 && n <= 80) return 2;
        if (n >= 81 && n <= 120) return 3;
        if (n >= 121 && n <= 137) return 4;

        return null;
    };

    // =====================================================
    // SALVAR OU EDITAR DIZIMISTA
    // =====================================================

    const salvarDizimista = async (evento) => {
        evento.preventDefault();

        const folha = calcularFolha(formulario.numero);

        if (!folha) {
            alert("O número deve estar entre 1 e 137.");
            return;
        }

        try {
            if (formulario.id) {
                await api.put(`/dizimistas/${formulario.id}`, {
                    numero: Number(formulario.numero),
                    folha,
                    nome: formulario.nome,
                    valor: Number(formulario.valor),
                });
            } else {
                await api.post("/dizimistas", {
                    numero: Number(formulario.numero),
                    folha,
                    nome: formulario.nome,
                    valor: Number(formulario.valor),
                });
            }

            limparFormulario();
            await carregarDizimistas();
        } catch (erro) {
            console.error("Erro ao salvar dizimista:", erro);

            alert("Não foi possível salvar o registro.");
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

        if (!confirmar) return;

        try {
            await api.delete(`/dizimistas/${id}`);

            await carregarDizimistas();
        } catch (erro) {
            console.error("Erro ao excluir dizimista:", erro);

            alert("Não foi possível excluir o registro.");
        }
    };

    // =====================================================
    // SALVAR REGISTRO MENSAL
    // =====================================================

    const salvarRegistroMensal = async () => {
        try {
            const dados = {
                comunidade: registroMensal.comunidade,
                data: registroMensal.data || null,
                equipe_comunidade: registroMensal.equipe_comunidade,
                conferido_em: registroMensal.conferido_em || null,
                responsavel_paroquia: registroMensal.responsavel_paroquia,
            };

            if (registroMensal.id) {
                await api.put(`/registros/${registroMensal.id}`, dados);
            } else {
                const resposta = await api.post("/registros", dados);

                setRegistroMensal({
                    ...registroMensal,
                    id: resposta.data.id,
                });
            }

            alert("Dados da ficha salvos com sucesso!");
        } catch (erro) {
            console.error("Erro ao salvar dados da ficha:", erro);

            alert("Não foi possível salvar os dados da ficha.");
        }
    };

    // =====================================================
    // SEPARAR DIZIMISTAS POR FOLHA
    // =====================================================

    const folha1 = dizimistas.filter(
        (dizimista) => Number(dizimista.folha) === 1
    );

    const folha2 = dizimistas.filter(
        (dizimista) => Number(dizimista.folha) === 2
    );

    const folha3 = dizimistas.filter(
        (dizimista) => Number(dizimista.folha) === 3
    );

    const folha4 = dizimistas.filter(
        (dizimista) => Number(dizimista.folha) === 4
    );

    // =====================================================
    // CALCULAR TOTAL
    // =====================================================

    const calcularTotal = (lista) => {
        return lista.reduce((total, dizimista) => {
            return total + Number(dizimista.valor);
        }, 0);
    };

    // =====================================================
    // TOTAL DE CADA FOLHA
    // =====================================================

    const totalFolha1 = calcularTotal(folha1);
    const totalFolha2 = calcularTotal(folha2);
    const totalFolha3 = calcularTotal(folha3);
    const totalFolha4 = calcularTotal(folha4);

    // =====================================================
    // TOTAL GERAL
    // =====================================================

    const totalGeral =
        totalFolha1 +
        totalFolha2 +
        totalFolha3 +
        totalFolha4;

    // =====================================================
    // DIVISÃO 50%
    // =====================================================

    const paroquia = totalGeral / 2;
    const comunidade = totalGeral / 2;

    // =====================================================
    // FORMATAR VALOR
    // =====================================================

    const formatarDinheiro = (valor) => {
        return Number(valor).toLocaleString("pt-BR", {
            style: "currency",
            currency: "BRL",
        });
    };

    // =====================================================
    // RENDERIZAR CADA FOLHA
    // =====================================================

    const renderizarFolha = (numeroFolha, lista) => {
        const total = calcularTotal(lista);

        return (
            <section className="folha">
                <h3>
                    FOLHA {String(numeroFolha).padStart(2, "0")}
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
                                    <td>{dizimista.nome}</td>

                                    <td>
                                        {String(dizimista.numero).padStart(2, "0")}
                                    </td>

                                    <td>
                                        {formatarDinheiro(dizimista.valor)}
                                    </td>

                                    <td>
                                        <button
                                            type="button"
                                            className="btn-editar"
                                            title="Editar"
                                            aria-label="Editar"
                                            onClick={() => editarDizimista(dizimista)}
                                        >
                                            ✏️
                                        </button>

                                        <button
                                            type="button"
                                            className="btn-excluir"
                                            title="Excluir"
                                            aria-label="Excluir"
                                            onClick={() => excluirDizimista(dizimista.id)}
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
                                <strong>TOTAL DA FOLHA</strong>
                            </td>

                            <td>
                                <strong>
                                    {formatarDinheiro(total)}
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
    // RETURN PRINCIPAL
    // =====================================================

    return (
        <div className="registro">

            {/* CABEÇALHO */}

            <header className="cabecalho-ficha">
                <h1>
                    PARÓQUIA NOSSA SENHORA DA PENHA – SUCATINGA
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
                            value={registroMensal.comunidade}
                            onChange={alterarRegistroMensal}
                        />

                        <span className="campo-impressao">
                            ______________________________
                        </span>
                    </label>

                    <label>
                        Data:

                        <input
                            className="campo-tela"
                            type="date"
                            name="data"
                            value={registroMensal.data}
                            onChange={alterarRegistroMensal}
                        />

                        <span className="campo-impressao">
                            ____ / ____ / ________
                        </span>
                    </label>

                </div>
            </header>

            {/* FORMULÁRIO DE DIZIMISTA */}

            <form
                onSubmit={salvarDizimista}
                className="formulario"
            >

                <input
                    type="number"
                    name="numero"
                    placeholder="Número"
                    min="1"
                    max="137"
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

            {/* FOLHAS */}

            {renderizarFolha(1, folha1)}

            {renderizarFolha(2, folha2)}

            {renderizarFolha(3, folha3)}

            {renderizarFolha(4, folha4)}

            {/* RESUMO GERAL */}

            <div className="resumo-geral">
                <div>
                    <span>TOTAL GERAL</span>

                    <strong>
                        {formatarDinheiro(totalGeral)}
                    </strong>
                </div>

                <div>
                    <span>PARÓQUIA (50%)</span>

                    <strong>
                        {formatarDinheiro(paroquia)}
                    </strong>
                </div>

                <div>
                    <span>COMUNIDADE (50%)</span>

                    <strong>
                        {formatarDinheiro(comunidade)}
                    </strong>
                </div>
            </div>

            {/* ASSINATURAS */}

            <section className="assinaturas">

                <div className="campo-assinatura">
                    <label>Equipe da Comunidade:</label>

                    <input
                        className="campo-tela"
                        type="text"
                        name="equipe_comunidade"
                        value={registroMensal.equipe_comunidade}
                        onChange={alterarRegistroMensal}
                        placeholder="Nome / assinatura"
                    />

                    <span className="campo-impressao linha-assinatura"></span>
                </div>

                <div className="campo-assinatura">
                    <label>Conferido em:</label>

                    <input
                        className="campo-tela"
                        type="date"
                        name="conferido_em"
                        value={registroMensal.conferido_em}
                        onChange={alterarRegistroMensal}
                    />

                    <span className="campo-impressao">
                        ____ / ____ / ________
                    </span>
                </div>

                <div className="campo-assinatura">
                    <label>Responsável da Paróquia:</label>

                    <input
                        className="campo-tela"
                        type="text"
                        name="responsavel_paroquia"
                        value={registroMensal.responsavel_paroquia}
                        onChange={alterarRegistroMensal}
                        placeholder="Nome / assinatura"
                    />

                    <span className="campo-impressao linha-assinatura"></span>
                </div>

            </section>

            {/* BOTÕES DA FICHA */}

            <div className="acoes-ficha">

                <button
                    type="button"
                    className="btn-salvar-ficha"
                    onClick={salvarRegistroMensal}
                >
                    Salvar dados da ficha
                </button>

                <button
                    type="button"
                    className="btn-imprimir"
                    onClick={() => window.print()}
                >
                    🖨️ Imprimir ficha
                </button>

            </div>

        </div>
    );
}

export default Tabela;