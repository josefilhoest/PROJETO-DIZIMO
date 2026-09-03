import { useEffect, useState } from "react";
import * as pdfjsLib from "pdfjs-dist";
import pdfWorker from "pdfjs-dist/build/pdf.worker.min.mjs?url";
import api from "../api/api";

pdfjsLib.GlobalWorkerOptions.workerSrc = pdfWorker;

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
    // ESTADOS DA IMPORTAÇÃO POR PDF
    // =====================================================

    const [mostrarImportacao, setMostrarImportacao] =
        useState(false);

    const [arquivoPdf, setArquivoPdf] = useState(null);
    const [textoPdf, setTextoPdf] = useState("");
    const [linhasPdf, setLinhasPdf] = useState([]);
    const [
        dizimistasImportacao,
        setDizimistasImportacao,
    ] = useState([]);

    const [
        linhasNaoReconhecidas,
        setLinhasNaoReconhecidas,
    ] = useState([]);

    const [lendoPdf, setLendoPdf] = useState(false);

    const [importandoPdf, setImportandoPdf] =
        useState(false);

    const [erroLeituraPdf, setErroLeituraPdf] =
        useState("");

    // =====================================================
    // ESTADO DA EXPORTAÇÃO CSV
    // =====================================================

    const [exportandoCsv, setExportandoCsv] =
        useState(false);

    // =====================================================
    // ESTADO DO BACKUP DA COMUNIDADE
    // =====================================================

    const [gerandoBackup, setGerandoBackup] =
        useState(false);

    // =====================================================
    // ESTADO DO FECHAMENTO MENSAL
    // =====================================================

    const [fechandoMes, setFechandoMes] =
        useState(false);

    // =====================================================
    // ESTADOS DO HISTÓRICO MENSAL
    // =====================================================

    const [mostrarHistorico, setMostrarHistorico] =
        useState(false);

    const [historicoMensal, setHistoricoMensal] =
        useState([]);

    const [carregandoHistorico, setCarregandoHistorico] =
        useState(false);

    const [erroHistorico, setErroHistorico] =
        useState("");

    const [detalheHistorico, setDetalheHistorico] =
        useState(null);

    const [
        carregandoDetalheHistorico,
        setCarregandoDetalheHistorico,
    ] = useState(false);

    // =====================================================
    // CARREGAR DIZIMISTAS
    // =====================================================

    const carregarDizimistas = async () => {
        try {
            const resposta =
                await api.get("/dizimistas");

            setDizimistas(resposta.data);
        } catch (erro) {
            console.error(
                "Erro ao carregar dizimistas:",
                erro
            );

            if (erro.response?.status === 401) {
                alert(
                    "Sua sessão expirou. Faça login novamente."
                );
            }
        }
    };

    // =====================================================
    // CARREGAR REGISTRO MENSAL
    // =====================================================

    const carregarRegistroMensal = async () => {
        try {
            const resposta =
                await api.get("/registros");

            if (resposta.data.length > 0) {
                const registro = resposta.data[0];

                setRegistroMensal({
                    id: registro.id,

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
                        registro.responsavel_paroquia ||
                        "",
                });
            } else {
                setRegistroMensal(
                    (registroAtual) => ({
                        ...registroAtual,

                        comunidade:
                            usuario?.comunidadeNome ||
                            "",
                    })
                );
            }
        } catch (erro) {
            console.error(
                "Erro ao carregar registro mensal:",
                erro
            );

            if (erro.response?.status === 401) {
                alert(
                    "Sua sessão expirou. Faça login novamente."
                );
            }
        }
    };

    // =====================================================
    // CARREGAR DADOS AO ABRIR
    // =====================================================

    useEffect(() => {
        carregarDizimistas();
        carregarRegistroMensal();
    }, []);

    // =====================================================
    // ATUALIZAR NOME DA COMUNIDADE
    // =====================================================

    useEffect(() => {
        if (usuario?.comunidadeNome) {
            setRegistroMensal(
                (registroAtual) => ({
                    ...registroAtual,
                    comunidade:
                        usuario.comunidadeNome,
                })
            );
        }
    }, [usuario]);

    // =====================================================
    // ALTERAR CAMPOS DO DIZIMISTA
    // =====================================================

    const alterarCampo = (evento) => {
        const { name, value } = evento.target;

        setFormulario(
            (formularioAtual) => ({
                ...formularioAtual,
                [name]: value,
            })
        );
    };

    // =====================================================
    // ALTERAR REGISTRO MENSAL
    // =====================================================

    const alterarRegistroMensal = (evento) => {
        const { name, value } = evento.target;

        if (name === "comunidade") {
            return;
        }

        setRegistroMensal(
            (registroAtual) => ({
                ...registroAtual,
                [name]: value,
            })
        );
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
    // =====================================================

    const calcularFolha = (numero) => {
        const numeroConvertido =
            Number(numero);

        if (
            !numeroConvertido ||
            numeroConvertido < 1
        ) {
            return null;
        }

        return Math.ceil(
            numeroConvertido / 40
        );
    };

    // =====================================================
    // SALVAR / EDITAR DIZIMISTA
    // =====================================================

    const salvarDizimista = async (evento) => {
        evento.preventDefault();

        const folha =
            calcularFolha(formulario.numero);

        if (!folha) {
            alert(
                "O número deve ser maior que 0."
            );
            return;
        }

        const nomeLimpo =
            formulario.nome.trim();

        if (!nomeLimpo) {
            alert(
                "Informe o nome do dizimista."
            );
            return;
        }

        const dados = {
            numero: Number(
                formulario.numero
            ),

            folha,

            nome: nomeLimpo,

            valor: Number(
                formulario.valor || 0
            ),
        };

        try {
            if (formulario.id) {
                await api.put(
                    `/dizimistas/${formulario.id}`,
                    dados
                );
            } else {
                await api.post(
                    "/dizimistas",
                    dados
                );
            }

            limparFormulario();

            await carregarDizimistas();
        } catch (erro) {
            console.error(
                "Erro ao salvar dizimista:",
                erro
            );

            if (
                erro.response?.status === 409
            ) {
                alert(
                    erro.response?.data?.erro ||
                    "Já existe um dizimista com esse número nesta comunidade."
                );

                return;
            }

            if (
                erro.response?.status === 401
            ) {
                alert(
                    "Sua sessão expirou. Faça login novamente."
                );

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

    const editarDizimista = (
        dizimista
    ) => {
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
    // EXPORTAR DIZIMISTAS EM CSV
    // =====================================================

    const exportarDizimistasCsv = async () => {
        if (exportandoCsv) {
            return;
        }

        try {
            setExportandoCsv(true);

            const resposta = await api.get(
                "/dizimistas/exportar",
                {
                    responseType: "blob",
                }
            );

            const contentDisposition =
                resposta.headers?.[
                "content-disposition"
                ] || "";

            const nomeEncontrado =
                contentDisposition.match(
                    /filename="?([^";]+)"?/i
                );

            const nomeArquivo =
                nomeEncontrado?.[1] ||
                `dizimistas-${new Date()
                    .toISOString()
                    .slice(0, 10)}.csv`;

            const tipoConteudo =
                resposta.headers?.[
                "content-type"
                ] ||
                "text/csv;charset=utf-8";

            const arquivo = new Blob(
                [resposta.data],
                {
                    type: tipoConteudo,
                }
            );

            const url =
                window.URL.createObjectURL(
                    arquivo
                );

            const link =
                document.createElement("a");

            link.href = url;
            link.download = nomeArquivo;

            document.body.appendChild(link);
            link.click();
            link.remove();

            window.URL.revokeObjectURL(url);
        } catch (erro) {
            console.error(
                "Erro ao exportar dizimistas:",
                erro
            );

            if (
                erro.response?.status === 401
            ) {
                alert(
                    "Sua sessão expirou. Faça login novamente."
                );

                return;
            }

            alert(
                erro.response?.data?.erro ||
                "Não foi possível exportar os dizimistas."
            );
        } finally {
            setExportandoCsv(false);
        }
    };

    // =====================================================
    // BACKUP COMPLETO DA COMUNIDADE
    // =====================================================

    const gerarBackupComunidade = async () => {
        if (gerandoBackup) {
            return;
        }

        try {
            setGerandoBackup(true);

            const resposta = await api.get(
                "/dizimistas/backup",
                {
                    responseType: "blob",
                }
            );

            const contentDisposition =
                resposta.headers?.[
                "content-disposition"
                ] || "";

            const nomeEncontrado =
                contentDisposition.match(
                    /filename="?([^";]+)"?/i
                );

            const nomeArquivo =
                nomeEncontrado?.[1] ||
                `backup-comunidade-${new Date()
                    .toISOString()
                    .slice(0, 10)}.json`;

            const tipoConteudo =
                resposta.headers?.[
                "content-type"
                ] ||
                "application/json;charset=utf-8";

            const arquivo = new Blob(
                [resposta.data],
                {
                    type: tipoConteudo,
                }
            );

            const url =
                window.URL.createObjectURL(
                    arquivo
                );

            const link =
                document.createElement("a");

            link.href = url;
            link.download = nomeArquivo;

            document.body.appendChild(link);
            link.click();
            link.remove();

            window.URL.revokeObjectURL(url);
        } catch (erro) {
            console.error(
                "Erro ao gerar backup da comunidade:",
                erro
            );

            if (
                erro.response?.status === 401
            ) {
                alert(
                    "Sua sessão expirou. Faça login novamente."
                );

                return;
            }

            alert(
                erro.response?.data?.erro ||
                "Não foi possível gerar o backup da comunidade."
            );
        } finally {
            setGerandoBackup(false);
        }
    };

    // =====================================================
    // IMPORTAÇÃO POR PDF
    // =====================================================

    const abrirImportacao = () => {
        setMostrarImportacao(true);
    };

    const limparDadosImportacao = () => {
        setArquivoPdf(null);
        setTextoPdf("");
        setLinhasPdf([]);
        setDizimistasImportacao([]);
        setLinhasNaoReconhecidas([]);
        setErroLeituraPdf("");
        setLendoPdf(false);
        setImportandoPdf(false);
    };

    const selecionarArquivoPdf = (
        evento
    ) => {
        const arquivo =
            evento.target.files?.[0];

        setTextoPdf("");
        setLinhasPdf([]);
        setDizimistasImportacao([]);
        setLinhasNaoReconhecidas([]);
        setErroLeituraPdf("");

        if (!arquivo) {
            setArquivoPdf(null);
            return;
        }

        const nomeEhPdf =
            arquivo.name
                .toLowerCase()
                .endsWith(".pdf");

        const tipoEhPdf =
            arquivo.type ===
            "application/pdf";

        if (!nomeEhPdf && !tipoEhPdf) {
            alert(
                "Selecione somente um arquivo PDF."
            );

            evento.target.value = "";
            setArquivoPdf(null);

            return;
        }

        const tamanhoMaximo =
            10 * 1024 * 1024;

        if (
            arquivo.size > tamanhoMaximo
        ) {
            alert(
                "O PDF deve ter no máximo 10 MB."
            );

            evento.target.value = "";
            setArquivoPdf(null);

            return;
        }

        setArquivoPdf(arquivo);
    };

    const cancelarImportacao = () => {
        if (importandoPdf) {
            return;
        }

        limparDadosImportacao();
        setMostrarImportacao(false);
    };

    // =====================================================
    // NORMALIZAR TEXTO
    // =====================================================

    const normalizarTexto = (texto) => {
        return String(texto || "")
            .replace(/\s+/g, " ")
            .trim();
    };

    // =====================================================
    // RECONSTRUIR LINHAS DO PDF
    // =====================================================

    const reconstruirLinhasPdf = (
        itens
    ) => {
        const toleranciaVertical = 2.5;
        const grupos = [];

        const itensValidos = itens
            .filter(
                (item) =>
                    typeof item.str ===
                    "string" &&
                    item.str.trim() !== ""
            )
            .map((item) => ({
                texto: item.str.trim(),

                x: Number(
                    item.transform?.[4] || 0
                ),

                y: Number(
                    item.transform?.[5] || 0
                ),
            }))
            .sort((a, b) => {
                if (
                    Math.abs(b.y - a.y) >
                    toleranciaVertical
                ) {
                    return b.y - a.y;
                }

                return a.x - b.x;
            });

        itensValidos.forEach((item) => {
            let grupo =
                grupos.find(
                    (linha) =>
                        Math.abs(
                            linha.y - item.y
                        ) <=
                        toleranciaVertical
                );

            if (!grupo) {
                grupo = {
                    y: item.y,
                    itens: [],
                };

                grupos.push(grupo);
            }

            grupo.itens.push(item);
        });

        return grupos
            .sort((a, b) => b.y - a.y)
            .map((grupo) =>
                grupo.itens
                    .sort(
                        (a, b) =>
                            a.x - b.x
                    )
                    .map(
                        (item) =>
                            item.texto
                    )
                    .join(" ")
                    .replace(
                        /\s+/g,
                        " "
                    )
                    .trim()
            )
            .filter(Boolean);
    };

    // =====================================================
    // CONVERTER VALOR
    // =====================================================

    const converterValorImportacao = (
        valorTexto
    ) => {
        const valorLimpo =
            String(valorTexto || "")
                .replace(/\s/g, "")
                .replace(/\./g, "")
                .replace(",", ".")
                .replace(
                    /[^\d.-]/g,
                    ""
                );

        const numero =
            Number(valorLimpo);

        if (
            !Number.isFinite(numero) ||
            numero < 0
        ) {
            return 0;
        }

        return numero;
    };

    // =====================================================
    // IDENTIFICAR CABEÇALHOS
    // =====================================================

    const linhaPareceCabecalho = (
        linha
    ) => {
        const texto =
            normalizarTexto(
                linha
            ).toLowerCase();

        const termosIgnorados = [
            "paróquia",
            "paroquia",
            "pastoral da partilha",
            "registro mensal",
            "comunidade",
            "folha",
            "nome nº",
            "nome n°",
            "nome no",
            "nome número",
            "nome numero",
            "total da folha",
            "total geral",
            "equipe da comunidade",
            "conferido em",
            "responsável da paróquia",
            "responsavel da paroquia",
        ];

        return termosIgnorados.some(
            (termo) =>
                texto.includes(termo)
        );
    };

    // =====================================================
    // INTERPRETAR LINHA
    // =====================================================

    const interpretarLinhaDizimista = (
        linha
    ) => {
        const texto =
            normalizarTexto(linha);

        if (
            !texto ||
            linhaPareceCabecalho(texto)
        ) {
            return null;
        }

        // NOME | Nº | R$ VALOR

        const padraoNomeNumeroValor =
            /^(.*?)\s+(\d{1,5})\s+R\$\s*([\d.,]*)\s*$/i;

        const resultadoNomeNumeroValor =
            texto.match(
                padraoNomeNumeroValor
            );

        if (
            resultadoNomeNumeroValor
        ) {
            const nome =
                normalizarTexto(
                    resultadoNomeNumeroValor[1]
                );

            const numero =
                Number(
                    resultadoNomeNumeroValor[2]
                );

            const valor =
                converterValorImportacao(
                    resultadoNomeNumeroValor[3]
                );

            if (
                nome &&
                numero > 0
            ) {
                return {
                    numero,

                    folha:
                        calcularFolha(
                            numero
                        ),

                    nome,

                    valor,

                    linhaOriginal:
                        texto,
                };
            }
        }

        // Nº | NOME | R$ VALOR

        const padraoNumeroNomeValor =
            /^(\d{1,5})\s+(.*?)\s+R\$\s*([\d.,]*)\s*$/i;

        const resultadoNumeroNomeValor =
            texto.match(
                padraoNumeroNomeValor
            );

        if (
            resultadoNumeroNomeValor
        ) {
            const numero =
                Number(
                    resultadoNumeroNomeValor[1]
                );

            const nome =
                normalizarTexto(
                    resultadoNumeroNomeValor[2]
                );

            const valor =
                converterValorImportacao(
                    resultadoNumeroNomeValor[3]
                );

            if (
                nome &&
                numero > 0
            ) {
                return {
                    numero,

                    folha:
                        calcularFolha(
                            numero
                        ),

                    nome,

                    valor,

                    linhaOriginal:
                        texto,
                };
            }
        }

        return null;
    };

    // =====================================================
    // ANALISAR LINHAS
    // =====================================================

    const analisarLinhasImportacao = (
        linhas
    ) => {
        const reconhecidos = [];
        const naoReconhecidos = [];

        const numerosEncontrados =
            new Set();

        linhas.forEach((linha) => {
            const registro =
                interpretarLinhaDizimista(
                    linha
                );

            if (!registro) {
                if (
                    normalizarTexto(
                        linha
                    ) &&
                    !linhaPareceCabecalho(
                        linha
                    )
                ) {
                    naoReconhecidos.push(
                        linha
                    );
                }

                return;
            }

            const numeroJaNoPdf =
                numerosEncontrados.has(
                    registro.numero
                );

            const numeroJaNoSistema =
                dizimistas.some(
                    (dizimista) =>
                        Number(
                            dizimista.numero
                        ) ===
                        registro.numero
                );

            numerosEncontrados.add(
                registro.numero
            );

            reconhecidos.push({
                ...registro,

                duplicadoNoPdf:
                    numeroJaNoPdf,

                jaExisteNoSistema:
                    numeroJaNoSistema,

                dadosInvalidos: false,
            });
        });

        setDizimistasImportacao(
            reconhecidos
        );

        setLinhasNaoReconhecidas(
            naoReconhecidos
        );
    };

    // =====================================================
    // RECALCULAR STATUS
    // =====================================================

    const recalcularStatusImportacao = (
        lista
    ) => {
        const numerosNoPdf =
            new Map();

        lista.forEach((item) => {
            const numero =
                Number(item.numero);

            if (!numero) {
                return;
            }

            numerosNoPdf.set(
                numero,

                (numerosNoPdf.get(
                    numero
                ) || 0) + 1
            );
        });

        return lista.map((item) => {
            const numero =
                Number(item.numero);

            const nome =
                normalizarTexto(
                    item.nome
                );

            const valor =
                Number(item.valor);

            const duplicadoNoPdf =
                numero > 0 &&
                (numerosNoPdf.get(
                    numero
                ) || 0) > 1;

            const jaExisteNoSistema =
                numero > 0 &&
                dizimistas.some(
                    (dizimista) =>
                        Number(
                            dizimista.numero
                        ) === numero
                );

            const dadosInvalidos =
                !Number.isInteger(
                    numero
                ) ||
                numero < 1 ||
                !nome ||
                !Number.isFinite(
                    valor
                ) ||
                valor < 0;

            return {
                ...item,

                numero:
                    item.numero,

                nome:
                    item.nome,

                valor:
                    item.valor,

                folha:
                    numero > 0
                        ? calcularFolha(
                            numero
                        )
                        : null,

                duplicadoNoPdf,

                jaExisteNoSistema,

                dadosInvalidos,
            };
        });
    };

    // =====================================================
    // ALTERAR CAMPO DA IMPORTAÇÃO
    // =====================================================

    const alterarCampoImportacao = (
        index,
        campo,
        valor
    ) => {
        setDizimistasImportacao(
            (listaAtual) => {
                const novaLista =
                    listaAtual.map(
                        (
                            item,
                            indice
                        ) => {
                            if (
                                indice !==
                                index
                            ) {
                                return item;
                            }

                            return {
                                ...item,
                                [campo]:
                                    valor,
                            };
                        }
                    );

                return recalcularStatusImportacao(
                    novaLista
                );
            }
        );
    };

    // =====================================================
    // REMOVER LINHA
    // =====================================================

    const removerLinhaImportacao = (
        index
    ) => {
        if (importandoPdf) {
            return;
        }

        setDizimistasImportacao(
            (listaAtual) => {
                const novaLista =
                    listaAtual.filter(
                        (
                            _,
                            indice
                        ) =>
                            indice !==
                            index
                    );

                return recalcularStatusImportacao(
                    novaLista
                );
            }
        );
    };

    // =====================================================
    // SITUAÇÃO
    // =====================================================

    const obterSituacaoImportacao = (
        dizimista
    ) => {
        if (
            dizimista.dadosInvalidos
        ) {
            return "Dados inválidos";
        }

        if (
            dizimista.duplicadoNoPdf
        ) {
            return "Duplicado no PDF";
        }

        if (
            dizimista.jaExisteNoSistema
        ) {
            return "Número já existe";
        }

        return "Pronto";
    };

    // =====================================================
    // REGISTRO VÁLIDO
    // =====================================================

    const registroImportacaoValido = (
        dizimista
    ) => {
        return (
            !dizimista.dadosInvalidos &&
            !dizimista.duplicadoNoPdf &&
            !dizimista.jaExisteNoSistema
        );
    };

    // =====================================================
    // LER PDF
    // =====================================================

    const lerConteudoPdf = async () => {
        if (!arquivoPdf) {
            alert(
                "Selecione um arquivo PDF."
            );
            return;
        }

        setLendoPdf(true);
        setTextoPdf("");
        setLinhasPdf([]);
        setDizimistasImportacao([]);
        setLinhasNaoReconhecidas([]);
        setErroLeituraPdf("");

        let documentoPdf = null;

        try {
            const buffer =
                await arquivoPdf.arrayBuffer();

            const tarefaCarregamento =
                pdfjsLib.getDocument({
                    data: buffer,
                });

            documentoPdf =
                await tarefaCarregamento.promise;

            const todasAsLinhas = [];

            const paginasParaTexto =
                [];

            for (
                let numeroPagina = 1;
                numeroPagina <=
                documentoPdf.numPages;
                numeroPagina += 1
            ) {
                const pagina =
                    await documentoPdf.getPage(
                        numeroPagina
                    );

                const conteudo =
                    await pagina.getTextContent();

                const linhasDaPagina =
                    reconstruirLinhasPdf(
                        conteudo.items
                    );

                todasAsLinhas.push(
                    ...linhasDaPagina
                );

                paginasParaTexto.push(
                    `--- PÁGINA ${numeroPagina} ---\n` +
                    linhasDaPagina.join(
                        "\n"
                    )
                );
            }

            const textoCompleto =
                paginasParaTexto
                    .join("\n\n")
                    .trim();

            if (
                !textoCompleto ||
                todasAsLinhas.length ===
                0
            ) {
                setErroLeituraPdf(
                    "Não foi encontrado texto selecionável neste PDF. " +
                    "Ele pode ser um PDF escaneado ou formado apenas por imagens."
                );

                return;
            }

            setTextoPdf(
                textoCompleto
            );

            setLinhasPdf(
                todasAsLinhas
            );

            analisarLinhasImportacao(
                todasAsLinhas
            );
        } catch (erro) {
            console.error(
                "Erro ao ler PDF:",
                erro
            );

            setErroLeituraPdf(
                "Não foi possível ler este PDF. " +
                "Tente outro arquivo PDF com texto selecionável."
            );
        } finally {
            if (documentoPdf) {
                try {
                    if (
                        typeof documentoPdf.cleanup ===
                        "function"
                    ) {
                        await documentoPdf.cleanup();
                    }

                    if (
                        typeof documentoPdf.destroy ===
                        "function"
                    ) {
                        await documentoPdf.destroy();
                    }
                } catch (
                erroFinalizacaoPdf
                ) {
                    console.warn(
                        "Não foi possível finalizar completamente o PDF:",
                        erroFinalizacaoPdf
                    );
                }
            }

            setLendoPdf(false);
        }
    };

    // =====================================================
    // CONFIRMAR IMPORTAÇÃO
    // =====================================================

    const confirmarImportacao =
        async () => {
            if (importandoPdf) {
                return;
            }

            /*
             * Recalculamos os status no momento
             * da confirmação para aumentar a
             * segurança antes do envio.
             */
            const listaRecalculada =
                recalcularStatusImportacao(
                    dizimistasImportacao
                );

            setDizimistasImportacao(
                listaRecalculada
            );

            const registrosValidos =
                listaRecalculada.filter(
                    registroImportacaoValido
                );

            if (
                registrosValidos.length ===
                0
            ) {
                alert(
                    "Não há dizimistas válidos para importar."
                );

                return;
            }

            const registrosComPendencia =
                listaRecalculada.length -
                registrosValidos.length;

            let mensagemConfirmacao =
                `Serão importados ${registrosValidos.length} dizimistas para a comunidade "${usuario?.comunidadeNome || ""}".`;

            if (
                registrosComPendencia > 0
            ) {
                mensagemConfirmacao +=
                    `\n\n${registrosComPendencia} registro(s) com pendência não serão importados.`;
            }

            mensagemConfirmacao +=
                "\n\nDeseja continuar?";

            const confirmou =
                window.confirm(
                    mensagemConfirmacao
                );

            if (!confirmou) {
                return;
            }

            /*
             * Enviamos somente os campos necessários.
             *
             * NÃO enviamos:
             * - comunidadeId
             * - folha
             *
             * O backend identifica a comunidade
             * pelo token e calcula a folha.
             */
            const dizimistasParaEnviar =
                registrosValidos.map(
                    (dizimista) => ({
                        numero: Number(
                            dizimista.numero
                        ),

                        nome: normalizarTexto(
                            dizimista.nome
                        ),

                        valor: Number(
                            dizimista.valor ||
                            0
                        ),
                    })
                );

            try {
                setImportandoPdf(true);

                const resposta =
                    await api.post(
                        "/dizimistas/importar",
                        {
                            dizimistas:
                                dizimistasParaEnviar,
                        }
                    );

                const quantidade =
                    resposta.data
                        ?.quantidade ??
                    dizimistasParaEnviar.length;

                await carregarDizimistas();

                limparDadosImportacao();

                setMostrarImportacao(
                    false
                );

                alert(
                    `${quantidade} dizimista(s) importado(s) com sucesso!`
                );
            } catch (erro) {
                console.error(
                    "Erro ao importar dizimistas:",
                    erro
                );

                if (
                    erro.response
                        ?.status === 401
                ) {
                    alert(
                        "Sua sessão expirou. Faça login novamente."
                    );

                    return;
                }

                if (
                    erro.response
                        ?.status === 409
                ) {
                    const dados =
                        erro.response
                            ?.data;

                    let mensagem =
                        dados?.erro ||
                        "Existe conflito com um ou mais números.";

                    if (
                        Array.isArray(
                            dados?.numerosDuplicados
                        ) &&
                        dados
                            .numerosDuplicados
                            .length > 0
                    ) {
                        mensagem +=
                            "\n\nNúmeros duplicados: " +
                            dados.numerosDuplicados.join(
                                ", "
                            );
                    }

                    if (
                        Array.isArray(
                            dados?.numerosJaExistentes
                        ) &&
                        dados
                            .numerosJaExistentes
                            .length > 0
                    ) {
                        mensagem +=
                            "\n\nNúmeros já existentes: " +
                            dados.numerosJaExistentes.join(
                                ", "
                            );
                    }

                    alert(mensagem);

                    /*
                     * Atualizamos a tabela para
                     * sincronizar possíveis mudanças
                     * que tenham ocorrido no servidor.
                     */
                    await carregarDizimistas();

                    return;
                }

                if (
                    erro.response
                        ?.status === 400
                ) {
                    alert(
                        erro.response
                            ?.data?.erro ||
                        "Existem dados inválidos na importação."
                    );

                    return;
                }

                alert(
                    erro.response
                        ?.data?.erro ||
                    "Não foi possível importar os dizimistas."
                );
            } finally {
                setImportandoPdf(
                    false
                );
            }
        };

    // =====================================================
    // EXCLUIR DIZIMISTA
    // =====================================================

    const excluirDizimista =
        async (id) => {
            const confirmar =
                window.confirm(
                    "Tem certeza que deseja excluir este registro?"
                );

            if (!confirmar) {
                return;
            }

            try {
                await api.delete(
                    `/dizimistas/${id}`
                );

                await carregarDizimistas();
            } catch (erro) {
                console.error(
                    "Erro ao excluir dizimista:",
                    erro
                );

                if (
                    erro.response
                        ?.status === 401
                ) {
                    alert(
                        "Sua sessão expirou. Faça login novamente."
                    );

                    return;
                }

                alert(
                    erro.response
                        ?.data?.erro ||
                    "Não foi possível excluir o dizimista."
                );
            }
        };

    // =====================================================
    // HISTÓRICO MENSAL
    // =====================================================

    const nomesMesesHistorico = [
        "Janeiro",
        "Fevereiro",
        "Março",
        "Abril",
        "Maio",
        "Junho",
        "Julho",
        "Agosto",
        "Setembro",
        "Outubro",
        "Novembro",
        "Dezembro",
    ];

    const formatarMesAnoHistorico = (
        mes,
        ano
    ) => {
        const mesNumero = Number(mes);

        const nomeMes =
            nomesMesesHistorico[
            mesNumero - 1
            ] || `Mês ${mesNumero}`;

        return `${nomeMes}/${ano}`;
    };

    const carregarHistoricoMensal =
        async () => {
            try {
                setCarregandoHistorico(
                    true
                );

                setErroHistorico("");

                const resposta =
                    await api.get(
                        "/registros/historico"
                    );

                setHistoricoMensal(
                    Array.isArray(
                        resposta.data
                    )
                        ? resposta.data
                        : []
                );
            } catch (erro) {
                console.error(
                    "Erro ao carregar histórico mensal:",
                    erro
                );

                if (
                    erro.response?.status ===
                    401
                ) {
                    alert(
                        "Sua sessão expirou. Faça login novamente."
                    );

                    return;
                }

                setErroHistorico(
                    erro.response?.data
                        ?.erro ||
                    "Não foi possível carregar o histórico mensal."
                );
            } finally {
                setCarregandoHistorico(
                    false
                );
            }
        };

    const abrirHistoricoMensal =
        async () => {
            if (mostrarHistorico) {
                setMostrarHistorico(
                    false
                );

                setDetalheHistorico(
                    null
                );

                setErroHistorico("");

                return;
            }

            setMostrarHistorico(true);
            setDetalheHistorico(null);

            await carregarHistoricoMensal();
        };

    const abrirDetalheHistorico =
        async (id) => {
            if (
                carregandoDetalheHistorico
            ) {
                return;
            }

            try {
                setCarregandoDetalheHistorico(
                    true
                );

                setErroHistorico("");

                const resposta =
                    await api.get(
                        `/registros/historico/${id}`
                    );

                setDetalheHistorico(
                    resposta.data
                );
            } catch (erro) {
                console.error(
                    "Erro ao abrir detalhes do histórico:",
                    erro
                );

                if (
                    erro.response?.status ===
                    401
                ) {
                    alert(
                        "Sua sessão expirou. Faça login novamente."
                    );

                    return;
                }

                setErroHistorico(
                    erro.response?.data
                        ?.erro ||
                    "Não foi possível abrir os detalhes deste fechamento."
                );
            } finally {
                setCarregandoDetalheHistorico(
                    false
                );
            }
        };

    const voltarListaHistorico = () => {
        setDetalheHistorico(null);
        setErroHistorico("");
    };

    // =====================================================
    // FECHAR MÊS / INICIAR NOVA CONTAGEM
    // =====================================================

    const fecharMesNovaContagem = async () => {
        if (fechandoMes) {
            return;
        }

        if (!registroMensal.data) {
            alert(
                "Informe a data da ficha antes de fechar o mês."
            );

            return;
        }

        if (dizimistas.length === 0) {
            alert(
                "Não existem dizimistas cadastrados para fechar o mês."
            );

            return;
        }

        const partesData =
            registroMensal.data.split("-");

        const ano = Number(partesData[0]);
        const mes = Number(partesData[1]);

        if (
            !Number.isInteger(mes) ||
            mes < 1 ||
            mes > 12 ||
            !Number.isInteger(ano) ||
            ano < 2000 ||
            ano > 2100
        ) {
            alert(
                "A data informada para o fechamento é inválida."
            );

            return;
        }

        const nomesMeses = [
            "Janeiro",
            "Fevereiro",
            "Março",
            "Abril",
            "Maio",
            "Junho",
            "Julho",
            "Agosto",
            "Setembro",
            "Outubro",
            "Novembro",
            "Dezembro",
        ];

        const nomeMes =
            nomesMeses[mes - 1];

        const totalAtual =
            calcularTotal(dizimistas);

        const mensagemConfirmacao =
            `Fechar ${nomeMes}/${ano}?` +
            `\n\nComunidade: ${usuario?.comunidadeNome || ""}` +
            `\nTotal atual: ${formatarDinheiro(totalAtual)}` +
            `\nDizimistas: ${dizimistas.length}` +
            "\n\nOs valores atuais serão salvos no histórico e depois zerados para iniciar uma nova contagem." +
            "\n\nNomes, números e folhas não serão alterados." +
            "\n\nDeseja continuar?";

        const confirmou =
            window.confirm(
                mensagemConfirmacao
            );

        if (!confirmou) {
            return;
        }

        try {
            setFechandoMes(true);

            const resposta =
                await api.post(
                    "/registros/fechar-mes",
                    {
                        mes,
                        ano,

                        equipe_comunidade:
                            registroMensal.equipe_comunidade.trim(),

                        conferido_em:
                            registroMensal.conferido_em ||
                            null,

                        responsavel_paroquia:
                            registroMensal.responsavel_paroquia.trim(),
                    }
                );

            await carregarDizimistas();
            await carregarRegistroMensal();

            if (mostrarHistorico) {
                await carregarHistoricoMensal();
                setDetalheHistorico(null);
            }

            const totalFechamento =
                resposta.data?.fechamento?.total ??
                totalAtual;

            alert(
                `Mês fechado com sucesso!` +
                `\n\n${nomeMes}/${ano}` +
                `\nTotal salvo no histórico: ${formatarDinheiro(totalFechamento)}` +
                "\n\nOs valores foram zerados e uma nova contagem pode ser iniciada."
            );
        } catch (erro) {
            console.error(
                "Erro ao fechar o mês:",
                erro
            );

            if (
                erro.response?.status === 401
            ) {
                alert(
                    "Sua sessão expirou. Faça login novamente."
                );

                return;
            }

            if (
                erro.response?.status === 409
            ) {
                alert(
                    erro.response?.data?.erro ||
                    "Já existe um fechamento para este mês e ano."
                );

                return;
            }

            if (
                erro.response?.status === 400
            ) {
                alert(
                    erro.response?.data?.erro ||
                    "Não foi possível fechar o mês com os dados informados."
                );

                return;
            }

            alert(
                erro.response?.data?.erro ||
                "Não foi possível fechar o mês. Nenhum valor foi alterado."
            );
        } finally {
            setFechandoMes(false);
        }
    };

    // =====================================================
    // SALVAR REGISTRO MENSAL
    // =====================================================

    const salvarRegistroMensal =
        async () => {
            try {
                if (
                    !usuario?.comunidadeNome
                ) {
                    alert(
                        "Não foi possível identificar a comunidade do usuário."
                    );

                    return;
                }

                const dados = {
                    comunidade:
                        usuario.comunidadeNome,

                    data:
                        registroMensal.data ||
                        null,

                    equipe_comunidade:
                        registroMensal.equipe_comunidade.trim(),

                    conferido_em:
                        registroMensal.conferido_em ||
                        null,

                    responsavel_paroquia:
                        registroMensal.responsavel_paroquia.trim(),
                };

                if (
                    registroMensal.id
                ) {
                    const resposta =
                        await api.put(
                            `/registros/${registroMensal.id}`,
                            dados
                        );

                    setRegistroMensal({
                        id: resposta.data.id,

                        comunidade:
                            usuario.comunidadeNome,

                        data:
                            resposta.data
                                .data || "",

                        equipe_comunidade:
                            resposta.data
                                .equipe_comunidade ||
                            "",

                        conferido_em:
                            resposta.data
                                .conferido_em ||
                            "",

                        responsavel_paroquia:
                            resposta.data
                                .responsavel_paroquia ||
                            "",
                    });
                } else {
                    const resposta =
                        await api.post(
                            "/registros",
                            dados
                        );

                    setRegistroMensal({
                        id: resposta.data.id,

                        comunidade:
                            usuario.comunidadeNome,

                        data:
                            resposta.data
                                .data || "",

                        equipe_comunidade:
                            resposta.data
                                .equipe_comunidade ||
                            "",

                        conferido_em:
                            resposta.data
                                .conferido_em ||
                            "",

                        responsavel_paroquia:
                            resposta.data
                                .responsavel_paroquia ||
                            "",
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

                if (
                    erro.response
                        ?.status === 401
                ) {
                    alert(
                        "Sua sessão expirou. Faça login novamente."
                    );

                    return;
                }

                alert(
                    erro.response
                        ?.data?.erro ||
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
                Number(
                    dizimista.folha
                ) || 1
        )
    );

    const folhas = Array.from(
        {
            length: totalFolhas,
        },

        (_, index) =>
            index + 1
    );

    // =====================================================
    // CALCULAR TOTAL
    // =====================================================

    const calcularTotal = (lista) => {
        return lista.reduce(
            (
                total,
                dizimista
            ) =>
                total +
                Number(
                    dizimista.valor ||
                    0
                ),

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
    // CONTADORES DA IMPORTAÇÃO
    // =====================================================

    const quantidadeValidos =
        dizimistasImportacao.filter(
            registroImportacaoValido
        ).length;

    const quantidadePendencias =
        dizimistasImportacao.length -
        quantidadeValidos;

    // =====================================================
    // FORMATAR DINHEIRO
    // =====================================================

    const formatarDinheiro = (
        valor
    ) => {
        return Number(
            valor || 0
        ).toLocaleString("pt-BR", {
            style: "currency",
            currency: "BRL",
        });
    };

    // =====================================================
    // RENDERIZAR FOLHA
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
                    {String(
                        numeroFolha
                    ).padStart(
                        2,
                        "0"
                    )}
                </h3>

                <table>
                    <thead>
                        <tr>
                            <th>
                                Nome
                            </th>

                            <th>
                                Nº
                            </th>

                            <th>
                                Valor
                            </th>

                            <th>
                                Ações
                            </th>
                        </tr>
                    </thead>

                    <tbody>
                        {lista.length ===
                            0 ? (
                            <tr>
                                <td
                                    colSpan="4"
                                >
                                    Nenhum
                                    registro
                                    nesta
                                    folha.
                                </td>
                            </tr>
                        ) : (
                            lista.map(
                                (
                                    dizimista
                                ) => (
                                    <tr
                                        key={
                                            dizimista.id
                                        }
                                    >
                                        <td className="nome-dizimista">
                                            {
                                                dizimista.nome
                                            }
                                        </td>

                                        <td>
                                            {String(
                                                dizimista.numero
                                            ).padStart(
                                                2,
                                                "0"
                                            )}
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
                                )
                            )
                        )}
                    </tbody>

                    <tfoot>
                        <tr>
                            <td colSpan="2">
                                <strong>
                                    TOTAL DA
                                    FOLHA
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
    // CABEÇALHO DINÂMICO DA PARÓQUIA
    // =====================================================

    const nomeParoquiaCabecalho =
        usuario?.paroquiaNome?.trim() ||
        "Paróquia não identificada";

    const cidadeParoquiaCabecalho =
        usuario?.paroquiaCidade?.trim() || "";

    const tituloParoquiaCabecalho =
        cidadeParoquiaCabecalho
            ? `${nomeParoquiaCabecalho} – ${cidadeParoquiaCabecalho}`
            : nomeParoquiaCabecalho;

    // =====================================================
    // RETURN
    // =====================================================

    return (
        <div className="registro">
            <style>{`
                .historico-desktop {
                    display: block;
                }

                .historico-mobile {
                    display: none;
                }

                .painel-historico {
                    margin-top: 16px;
                }

                .historico-cards {
                    display: grid;
                    gap: 10px;
                }

                .historico-card {
                    border: 1px solid #d9d9d9;
                    border-radius: 10px;
                    padding: 12px;
                    background: #ffffff;
                }

                .historico-card-topo {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    gap: 10px;
                    margin-bottom: 10px;
                }

                .historico-card-valores {
                    display: grid;
                    grid-template-columns: 1fr 1fr;
                    gap: 8px;
                    margin-top: 8px;
                }

                .historico-card-campo {
                    background: #f6f6f6;
                    border-radius: 8px;
                    padding: 8px;
                }

                .historico-card-campo strong {
                    display: block;
                    margin-bottom: 3px;
                    font-size: 0.82rem;
                }

                .historico-detalhe-resumo {
                    margin-top: 12px;
                    padding: 10px;
                    border: 1px solid #ddd;
                    border-radius: 8px;
                    display: grid;
                    grid-template-columns:
                        repeat(auto-fit, minmax(180px, 1fr));
                    gap: 8px;
                }

                .historico-detalhe-card {
                    border: 1px solid #e0e0e0;
                    border-radius: 10px;
                    padding: 10px;
                    background: #ffffff;
                }

                .historico-detalhe-card-topo {
                    display: flex;
                    justify-content: space-between;
                    align-items: flex-start;
                    gap: 10px;
                    margin-bottom: 8px;
                }

                .historico-detalhe-card-nome {
                    font-weight: 700;
                    overflow-wrap: anywhere;
                }

                .historico-acoes-topo {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    gap: 12px;
                    flex-wrap: wrap;
                }

                @media (max-width: 700px) {
                    .historico-desktop {
                        display: none !important;
                    }

                    .historico-mobile {
                        display: block !important;
                    }

                    .painel-historico {
                        margin-top: 12px !important;
                        padding: 10px !important;
                    }

                    .historico-acoes-topo {
                        align-items: stretch;
                    }

                    .historico-acoes-topo > div:first-child {
                        width: 100%;
                    }

                    .historico-acoes-topo button {
                        min-height: 40px;
                    }

                    .historico-card-topo {
                        align-items: flex-start;
                    }

                    .historico-card-valores {
                        grid-template-columns: 1fr;
                    }

                    .historico-detalhe-resumo {
                        grid-template-columns: 1fr;
                    }

                    .historico-detalhe-card-topo {
                        align-items: flex-start;
                    }

                    .importacao-lista > button {
                        margin-top: 6px;
                    }
                }
            `}</style>
            {/* =========================================
                CABEÇALHO
            ========================================= */}

            <header className="cabecalho-ficha">
                <h1>
                    {tituloParoquiaCabecalho.toUpperCase()}
                </h1>

                <h2>
                    PASTORAL DA
                    PARTILHA
                </h2>

                <h3>
                    REGISTRO MENSAL
                    DA PARTILHA
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
                            readOnly
                        />

                        <span className="campo-impressao">
                            {
                                registroMensal.comunidade
                            }
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
                            ____ / ____ /
                            ________
                        </span>
                    </label>
                </div>
            </header>

            {/* =========================================
                FORMULÁRIO
            ========================================= */}

            <form
                onSubmit={
                    salvarDizimista
                }
                className="formulario"
            >
                <input
                    type="number"
                    name="numero"
                    placeholder="Número"
                    min="1"
                    value={
                        formulario.numero
                    }
                    onChange={
                        alterarCampo
                    }
                    required
                />

                <input
                    type="text"
                    name="nome"
                    placeholder="Nome do dizimista"
                    value={
                        formulario.nome
                    }
                    onChange={
                        alterarCampo
                    }
                    required
                />

                <input
                    type="number"
                    name="valor"
                    placeholder="Valor"
                    step="0.01"
                    min="0"
                    value={
                        formulario.valor
                    }
                    onChange={
                        alterarCampo
                    }
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
                        onClick={
                            cancelarEdicao
                        }
                    >
                        Cancelar
                        edição
                    </button>
                )}
            </form>

            {/* =========================================
                IMPORTAÇÃO POR PDF
            ========================================= */}

            <section className="importacao-lista campo-tela">
                <button
                    type="button"
                    className="btn-importar"
                    onClick={
                        abrirImportacao
                    }
                >
                    📄 Importar lista
                    por PDF
                </button>

                <button
                    type="button"
                    className="btn-importar"
                    onClick={
                        exportarDizimistasCsv
                    }
                    disabled={
                        exportandoCsv
                    }
                    style={{
                        marginLeft: "8px",
                    }}
                >
                    {exportandoCsv
                        ? "Exportando..."
                        : "⬇️ Exportar CSV"}
                </button>

                <button
                    type="button"
                    className="btn-importar"
                    onClick={
                        gerarBackupComunidade
                    }
                    disabled={
                        gerandoBackup
                    }
                    style={{
                        marginLeft: "8px",
                    }}
                >
                    {gerandoBackup
                        ? "Gerando backup..."
                        : "💾 Backup da comunidade"}
                </button>

                <button
                    type="button"
                    className="btn-importar"
                    onClick={
                        abrirHistoricoMensal
                    }
                    disabled={
                        carregandoHistorico
                    }
                    style={{
                        marginLeft: "8px",
                    }}
                >
                    {carregandoHistorico
                        ? "Carregando histórico..."
                        : mostrarHistorico
                            ? "✖ Fechar histórico"
                            : "📊 Histórico mensal"}
                </button>

                {mostrarHistorico && (
                    <div
                        className="painel-importacao painel-historico"
                    >
                        <div className="historico-acoes-topo">
                            <div>
                                <h3
                                    style={{
                                        marginBottom:
                                            "4px",
                                    }}
                                >
                                    📊 Histórico
                                    mensal
                                </h3>

                                <p
                                    style={{
                                        marginTop: 0,
                                    }}
                                >
                                    Consulte os
                                    fechamentos já
                                    realizados desta
                                    comunidade.
                                </p>
                            </div>

                            <button
                                type="button"
                                className="btn-cancelar"
                                onClick={() => {
                                    setMostrarHistorico(
                                        false
                                    );

                                    setDetalheHistorico(
                                        null
                                    );

                                    setErroHistorico(
                                        ""
                                    );
                                }}
                            >
                                Fechar
                            </button>
                        </div>

                        {erroHistorico && (
                            <div
                                className="erro-importacao"
                                role="alert"
                                style={{
                                    marginTop:
                                        "10px",
                                }}
                            >
                                {
                                    erroHistorico
                                }
                            </div>
                        )}

                        {!detalheHistorico ? (
                            <>
                                {carregandoHistorico ? (
                                    <p>
                                        Carregando
                                        histórico...
                                    </p>
                                ) : historicoMensal.length ===
                                    0 ? (
                                    <p>
                                        Ainda não há
                                        fechamentos
                                        mensais
                                        registrados.
                                    </p>
                                ) : (
                                    <>
                                        <div
                                            className="historico-desktop"
                                            style={{
                                                overflowX:
                                                    "auto",
                                                width:
                                                    "100%",
                                                marginTop:
                                                    "12px",
                                            }}
                                        >
                                            <table
                                                style={{
                                                    width:
                                                        "100%",
                                                    minWidth:
                                                        "620px",
                                                }}
                                            >
                                                <thead>
                                                    <tr>
                                                        <th>
                                                            Mês
                                                        </th>

                                                        <th>
                                                            Total
                                                        </th>

                                                        <th>
                                                            Paróquia
                                                            (50%)
                                                        </th>

                                                        <th>
                                                            Comunidade
                                                            (50%)
                                                        </th>

                                                        <th>
                                                            Ação
                                                        </th>
                                                    </tr>
                                                </thead>

                                                <tbody>
                                                    {historicoMensal.map(
                                                        (
                                                            fechamento
                                                        ) => {
                                                            const totalFechamento =
                                                                Number(
                                                                    fechamento.total ||
                                                                    0
                                                                );

                                                            return (
                                                                <tr
                                                                    key={
                                                                        fechamento.id
                                                                    }
                                                                >
                                                                    <td>
                                                                        <strong>
                                                                            {formatarMesAnoHistorico(
                                                                                fechamento.mes,
                                                                                fechamento.ano
                                                                            )}
                                                                        </strong>
                                                                    </td>

                                                                    <td>
                                                                        {formatarDinheiro(
                                                                            totalFechamento
                                                                        )}
                                                                    </td>

                                                                    <td>
                                                                        {formatarDinheiro(
                                                                            totalFechamento /
                                                                            2
                                                                        )}
                                                                    </td>

                                                                    <td>
                                                                        {formatarDinheiro(
                                                                            totalFechamento /
                                                                            2
                                                                        )}
                                                                    </td>

                                                                    <td>
                                                                        <button
                                                                            type="button"
                                                                            className="btn-editar"
                                                                            onClick={() =>
                                                                                abrirDetalheHistorico(
                                                                                    fechamento.id
                                                                                )
                                                                            }
                                                                            disabled={
                                                                                carregandoDetalheHistorico
                                                                            }
                                                                            title="Ver detalhes do fechamento"
                                                                        >
                                                                            👁️
                                                                            Ver
                                                                        </button>
                                                                    </td>
                                                                </tr>
                                                            );
                                                        }
                                                    )}
                                                </tbody>
                                            </table>
                                        </div>

                                        <div className="historico-mobile historico-cards">
                                            {historicoMensal.map(
                                                (
                                                    fechamento
                                                ) => {
                                                    const totalFechamento =
                                                        Number(
                                                            fechamento.total ||
                                                            0
                                                        );

                                                    return (
                                                        <div
                                                            className="historico-card"
                                                            key={`mobile-${fechamento.id}`}
                                                        >
                                                            <div className="historico-card-topo">
                                                                <div>
                                                                    <strong>
                                                                        {formatarMesAnoHistorico(
                                                                            fechamento.mes,
                                                                            fechamento.ano
                                                                        )}
                                                                    </strong>
                                                                </div>

                                                                <button
                                                                    type="button"
                                                                    className="btn-editar"
                                                                    onClick={() =>
                                                                        abrirDetalheHistorico(
                                                                            fechamento.id
                                                                        )
                                                                    }
                                                                    disabled={
                                                                        carregandoDetalheHistorico
                                                                    }
                                                                    title="Ver detalhes do fechamento"
                                                                >
                                                                    👁️ Ver
                                                                </button>
                                                            </div>

                                                            <div className="historico-card-valores">
                                                                <div className="historico-card-campo">
                                                                    <strong>
                                                                        Total
                                                                    </strong>

                                                                    {formatarDinheiro(
                                                                        totalFechamento
                                                                    )}
                                                                </div>

                                                                <div className="historico-card-campo">
                                                                    <strong>
                                                                        Paróquia (50%)
                                                                    </strong>

                                                                    {formatarDinheiro(
                                                                        totalFechamento /
                                                                        2
                                                                    )}
                                                                </div>

                                                                <div className="historico-card-campo">
                                                                    <strong>
                                                                        Comunidade (50%)
                                                                    </strong>

                                                                    {formatarDinheiro(
                                                                        totalFechamento /
                                                                        2
                                                                    )}
                                                                </div>
                                                            </div>
                                                        </div>
                                                    );
                                                }
                                            )}
                                        </div>
                                    </>
                                )}
                            </>
                        ) : (
                            <div
                                style={{
                                    marginTop:
                                        "14px",
                                }}
                            >
                                <div className="historico-acoes-topo">
                                    <div>
                                        <h4
                                            style={{
                                                margin:
                                                    "0 0 4px 0",
                                            }}
                                        >
                                            {formatarMesAnoHistorico(
                                                detalheHistorico
                                                    .fechamento
                                                    ?.mes,
                                                detalheHistorico
                                                    .fechamento
                                                    ?.ano
                                            )}
                                        </h4>

                                        <div>
                                            <strong>
                                                Total:
                                            </strong>{" "}
                                            {formatarDinheiro(
                                                detalheHistorico
                                                    .fechamento
                                                    ?.total ||
                                                0
                                            )}
                                        </div>

                                        <div>
                                            <strong>
                                                Dizimistas
                                                registrados:
                                            </strong>{" "}
                                            {
                                                detalheHistorico
                                                    .itens
                                                    ?.length
                                            }
                                        </div>
                                    </div>

                                    <button
                                        type="button"
                                        className="btn-cancelar"
                                        onClick={
                                            voltarListaHistorico
                                        }
                                    >
                                        ← Voltar
                                    </button>
                                </div>

                                <div className="historico-detalhe-resumo">
                                    <div>
                                        <strong>
                                            Total
                                            geral:
                                        </strong>
                                        <br />
                                        {formatarDinheiro(
                                            detalheHistorico
                                                .fechamento
                                                ?.total ||
                                            0
                                        )}
                                    </div>

                                    <div>
                                        <strong>
                                            Paróquia
                                            (50%):
                                        </strong>
                                        <br />
                                        {formatarDinheiro(
                                            Number(
                                                detalheHistorico
                                                    .fechamento
                                                    ?.total ||
                                                0
                                            ) / 2
                                        )}
                                    </div>

                                    <div>
                                        <strong>
                                            Comunidade
                                            (50%):
                                        </strong>
                                        <br />
                                        {formatarDinheiro(
                                            Number(
                                                detalheHistorico
                                                    .fechamento
                                                    ?.total ||
                                                0
                                            ) / 2
                                        )}
                                    </div>
                                </div>

                                <div
                                    className="historico-desktop"
                                    style={{
                                        overflowX:
                                            "auto",
                                        width:
                                            "100%",
                                        marginTop:
                                            "14px",
                                    }}
                                >
                                    <table
                                        style={{
                                            width:
                                                "100%",
                                            minWidth:
                                                "650px",
                                        }}
                                    >
                                        <thead>
                                            <tr>
                                                <th>
                                                    Nº
                                                </th>

                                                <th>
                                                    Nome
                                                </th>

                                                <th>
                                                    Folha
                                                </th>

                                                <th>
                                                    Valor
                                                </th>
                                            </tr>
                                        </thead>

                                        <tbody>
                                            {(
                                                detalheHistorico.itens ||
                                                []
                                            ).map(
                                                (
                                                    item
                                                ) => (
                                                    <tr
                                                        key={
                                                            item.id
                                                        }
                                                    >
                                                        <td>
                                                            {String(
                                                                item.numero
                                                            ).padStart(
                                                                2,
                                                                "0"
                                                            )}
                                                        </td>

                                                        <td className="nome-dizimista">
                                                            {
                                                                item.nome
                                                            }
                                                        </td>

                                                        <td>
                                                            {
                                                                item.folha
                                                            }
                                                        </td>

                                                        <td>
                                                            {formatarDinheiro(
                                                                item.valor
                                                            )}
                                                        </td>
                                                    </tr>
                                                )
                                            )}
                                        </tbody>
                                    </table>
                                </div>

                                <div
                                    className="historico-mobile historico-cards"
                                    style={{
                                        marginTop:
                                            "14px",
                                    }}
                                >
                                    {(
                                        detalheHistorico.itens ||
                                        []
                                    ).map(
                                        (
                                            item
                                        ) => (
                                            <div
                                                className="historico-detalhe-card"
                                                key={`mobile-detalhe-${item.id}`}
                                            >
                                                <div className="historico-detalhe-card-topo">
                                                    <div>
                                                        <div className="historico-detalhe-card-nome">
                                                            {
                                                                item.nome
                                                            }
                                                        </div>

                                                        <div>
                                                            Nº{" "}
                                                            {String(
                                                                item.numero
                                                            ).padStart(
                                                                2,
                                                                "0"
                                                            )}
                                                        </div>
                                                    </div>

                                                    <strong>
                                                        {formatarDinheiro(
                                                            item.valor
                                                        )}
                                                    </strong>
                                                </div>

                                                <div>
                                                    Folha{" "}
                                                    {
                                                        item.folha
                                                    }
                                                </div>
                                            </div>
                                        )
                                    )}
                                </div>
                            </div>
                        )}
                    </div>
                )}

                {mostrarImportacao && (
                    <div className="painel-importacao">
                        <h3>
                            Importar lista
                            de dizimistas
                        </h3>

                        <p>
                            Selecione um PDF
                            com texto
                            selecionável. O
                            sistema reconstruirá
                            as linhas e tentará
                            identificar número,
                            nome e valor.
                        </p>

                        <input
                            type="file"
                            accept=".pdf,application/pdf"
                            onChange={
                                selecionarArquivoPdf
                            }
                            disabled={
                                lendoPdf ||
                                importandoPdf
                            }
                        />

                        {arquivoPdf && (
                            <div className="arquivo-selecionado">
                                <strong>
                                    Arquivo
                                    selecionado:
                                </strong>{" "}
                                {
                                    arquivoPdf.name
                                }

                                <br />

                                <span>
                                    Tamanho:{" "}
                                    {(
                                        arquivoPdf.size /
                                        1024 /
                                        1024
                                    ).toFixed(
                                        2
                                    )}{" "}
                                    MB
                                </span>
                            </div>
                        )}

                        <div className="acoes-importacao">
                            <button
                                type="button"
                                className="btn-validar-importacao"
                                onClick={
                                    lerConteudoPdf
                                }
                                disabled={
                                    !arquivoPdf ||
                                    lendoPdf ||
                                    importandoPdf
                                }
                            >
                                {lendoPdf
                                    ? "Lendo PDF..."
                                    : "Analisar PDF"}
                            </button>

                            <button
                                type="button"
                                className="btn-cancelar"
                                onClick={
                                    cancelarImportacao
                                }
                                disabled={
                                    lendoPdf ||
                                    importandoPdf
                                }
                            >
                                Cancelar
                            </button>
                        </div>

                        {erroLeituraPdf && (
                            <div
                                className="erro-importacao"
                                role="alert"
                            >
                                {
                                    erroLeituraPdf
                                }
                            </div>
                        )}

                        {textoPdf && (
                            <details className="previa-pdf">
                                <summary>
                                    Ver texto
                                    reconstruído do
                                    PDF
                                </summary>

                                <textarea
                                    value={
                                        textoPdf
                                    }
                                    readOnly
                                    rows="12"
                                    style={{
                                        width: "100%",
                                        resize: "vertical",
                                        marginTop:
                                            "8px",
                                    }}
                                />
                            </details>
                        )}

                        {dizimistasImportacao.length >
                            0 && (
                                <div className="previa-importacao">
                                    <h4>
                                        Revisão dos
                                        dizimistas
                                        encontrados
                                    </h4>

                                    <p>
                                        Encontrados:{" "}
                                        <strong>
                                            {
                                                dizimistasImportacao.length
                                            }
                                        </strong>

                                        {" | "}

                                        Válidos:{" "}
                                        <strong>
                                            {
                                                quantidadeValidos
                                            }
                                        </strong>

                                        {" | "}

                                        Com pendência:{" "}
                                        <strong>
                                            {
                                                quantidadePendencias
                                            }
                                        </strong>
                                    </p>

                                    <p>
                                        Revise os dados
                                        abaixo. Você pode
                                        corrigir número,
                                        nome e valor ou
                                        remover uma linha
                                        antes da
                                        importação.
                                    </p>

                                    <div
                                        style={{
                                            overflowX:
                                                "auto",
                                            width: "100%",
                                        }}
                                    >
                                        <table
                                            style={{
                                                width: "100%",
                                                minWidth:
                                                    "900px",
                                                tableLayout:
                                                    "auto",
                                            }}
                                        >
                                            <thead>
                                                <tr>
                                                    <th
                                                        style={{
                                                            width: "90px",
                                                        }}
                                                    >
                                                        Nº
                                                    </th>

                                                    <th>
                                                        Nome
                                                    </th>

                                                    <th
                                                        style={{
                                                            width: "90px",
                                                        }}
                                                    >
                                                        Folha
                                                    </th>

                                                    <th
                                                        style={{
                                                            width: "140px",
                                                        }}
                                                    >
                                                        Valor
                                                    </th>

                                                    <th
                                                        style={{
                                                            width: "160px",
                                                        }}
                                                    >
                                                        Situação
                                                    </th>

                                                    <th
                                                        style={{
                                                            width: "90px",
                                                        }}
                                                    >
                                                        Ação
                                                    </th>
                                                </tr>
                                            </thead>

                                            <tbody>
                                                {dizimistasImportacao.map(
                                                    (
                                                        dizimista,
                                                        index
                                                    ) => (
                                                        <tr
                                                            key={`${index}-${dizimista.linhaOriginal}`}
                                                        >
                                                            <td>
                                                                <input
                                                                    type="number"
                                                                    min="1"
                                                                    value={
                                                                        dizimista.numero
                                                                    }
                                                                    disabled={
                                                                        importandoPdf
                                                                    }
                                                                    onChange={(
                                                                        evento
                                                                    ) =>
                                                                        alterarCampoImportacao(
                                                                            index,
                                                                            "numero",
                                                                            evento
                                                                                .target
                                                                                .value
                                                                        )
                                                                    }
                                                                    style={{
                                                                        width: "75px",
                                                                    }}
                                                                />
                                                            </td>

                                                            <td>
                                                                <input
                                                                    type="text"
                                                                    value={
                                                                        dizimista.nome
                                                                    }
                                                                    disabled={
                                                                        importandoPdf
                                                                    }
                                                                    onChange={(
                                                                        evento
                                                                    ) =>
                                                                        alterarCampoImportacao(
                                                                            index,
                                                                            "nome",
                                                                            evento
                                                                                .target
                                                                                .value
                                                                        )
                                                                    }
                                                                    style={{
                                                                        width: "100%",
                                                                        minWidth:
                                                                            "320px",
                                                                        boxSizing:
                                                                            "border-box",
                                                                    }}
                                                                />
                                                            </td>

                                                            <td>
                                                                {dizimista.folha ||
                                                                    "-"}
                                                            </td>

                                                            <td>
                                                                <input
                                                                    type="number"
                                                                    min="0"
                                                                    step="0.01"
                                                                    value={
                                                                        dizimista.valor
                                                                    }
                                                                    disabled={
                                                                        importandoPdf
                                                                    }
                                                                    onChange={(
                                                                        evento
                                                                    ) =>
                                                                        alterarCampoImportacao(
                                                                            index,
                                                                            "valor",
                                                                            evento
                                                                                .target
                                                                                .value
                                                                        )
                                                                    }
                                                                    style={{
                                                                        width: "120px",
                                                                    }}
                                                                />
                                                            </td>

                                                            <td>
                                                                {obterSituacaoImportacao(
                                                                    dizimista
                                                                )}
                                                            </td>

                                                            <td>
                                                                <button
                                                                    type="button"
                                                                    className="btn-excluir"
                                                                    title="Remover da importação"
                                                                    aria-label="Remover da importação"
                                                                    disabled={
                                                                        importandoPdf
                                                                    }
                                                                    onClick={() =>
                                                                        removerLinhaImportacao(
                                                                            index
                                                                        )
                                                                    }
                                                                >
                                                                    🗑️
                                                                </button>
                                                            </td>
                                                        </tr>
                                                    )
                                                )}
                                            </tbody>
                                        </table>
                                    </div>

                                    <div
                                        style={{
                                            marginTop:
                                                "14px",
                                            display:
                                                "flex",
                                            gap: "10px",
                                            flexWrap:
                                                "wrap",
                                            alignItems:
                                                "center",
                                        }}
                                    >
                                        <button
                                            type="button"
                                            className="btn-salvar"
                                            onClick={
                                                confirmarImportacao
                                            }
                                            disabled={
                                                quantidadeValidos ===
                                                0 ||
                                                importandoPdf ||
                                                lendoPdf
                                            }
                                        >
                                            {importandoPdf
                                                ? "Importando..."
                                                : `Confirmar importação (${quantidadeValidos})`}
                                        </button>

                                        {quantidadeValidos >
                                            0 && (
                                                <span>
                                                    Serão
                                                    importados{" "}
                                                    <strong>
                                                        {
                                                            quantidadeValidos
                                                        }
                                                    </strong>{" "}
                                                    registro(s)
                                                    válido(s).
                                                </span>
                                            )}
                                    </div>
                                </div>
                            )}

                        {textoPdf &&
                            dizimistasImportacao.length ===
                            0 && (
                                <p className="aviso-importacao">
                                    O PDF foi
                                    lido, mas
                                    ainda não
                                    conseguimos
                                    reconhecer
                                    linhas de
                                    dizimistas
                                    automaticamente.
                                    Nenhum dado
                                    foi
                                    alterado.
                                </p>
                            )}

                        {linhasNaoReconhecidas.length >
                            0 && (
                                <details>
                                    <summary>
                                        Linhas não
                                        reconhecidas (
                                        {
                                            linhasNaoReconhecidas.length
                                        }
                                        )
                                    </summary>

                                    <textarea
                                        value={linhasNaoReconhecidas.join(
                                            "\n"
                                        )}
                                        readOnly
                                        rows="8"
                                        style={{
                                            width: "100%",
                                            resize: "vertical",
                                            marginTop:
                                                "8px",
                                        }}
                                    />
                                </details>
                            )}

                        <p className="aviso-importacao">
                            Segurança: somente
                            os registros válidos
                            serão enviados. A
                            comunidade é
                            identificada
                            automaticamente pelo
                            usuário autenticado.
                        </p>
                    </div>
                )}
            </section>

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
                                ) ===
                                numeroFolha
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
                        Equipe da
                        Comunidade:
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
                        ____ / ____ /
                        ________
                    </span>
                </div>

                <div className="campo-assinatura">
                    <label>
                        Responsável da
                        Paróquia:
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
                    Salvar dados da
                    ficha
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

                <button
                    type="button"
                    className="btn-cancelar"
                    onClick={
                        fecharMesNovaContagem
                    }
                    disabled={
                        fechandoMes
                    }
                    title="Salvar o mês no histórico e zerar os valores para iniciar uma nova contagem"
                >
                    {fechandoMes
                        ? "Fechando mês..."
                        : "🔒 Fechar mês / Nova contagem"}
                </button>
            </div>
        </div>
    );
}

export default Tabela;