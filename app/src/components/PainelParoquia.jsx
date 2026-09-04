import { useEffect, useMemo, useState } from "react";

import api from "../api/api";

function PainelParoquia({ usuario }) {
  // ========================================
  // ESTADOS
  // ========================================

  const [comunidades, setComunidades] =
    useState([]);

  const [carregando, setCarregando] =
    useState(true);

  const [erro, setErro] =
    useState("");

  const [busca, setBusca] =
    useState("");

  const [
    comunidadeDetalhada,
    setComunidadeDetalhada,
  ] = useState(null);

  const [
    carregandoDetalhes,
    setCarregandoDetalhes,
  ] = useState(false);

  const [
    erroDetalhes,
    setErroDetalhes,
  ] = useState("");

  const [
    exportandoComunidadeId,
    setExportandoComunidadeId,
  ] = useState(null);

  const [
    gerandoBackupComunidadeId,
    setGerandoBackupComunidadeId,
  ] = useState(null);


  const [
    historicoComunidadeId,
    setHistoricoComunidadeId,
  ] = useState(null);

  const [
    historicoMensal,
    setHistoricoMensal,
  ] = useState([]);

  const [
    carregandoHistorico,
    setCarregandoHistorico,
  ] = useState(false);

  const [
    erroHistorico,
    setErroHistorico,
  ] = useState("");

  const [
    fechamentoDetalhado,
    setFechamentoDetalhado,
  ] = useState(null);

  const [
    carregandoFechamento,
    setCarregandoFechamento,
  ] = useState(false);


  const [
    carregandoImpressaoComunidadeId,
    setCarregandoImpressaoComunidadeId,
  ] = useState(null);

  const [
    dadosImpressao,
    setDadosImpressao,
  ] = useState(null);

  // ========================================
  // CARREGAR COMUNIDADES DA PARÓQUIA
  // ========================================

  const carregarComunidades = async () => {
    try {
      setCarregando(true);
      setErro("");

      const resposta = await api.get(
        "/admin/paroquia/comunidades"
      );

      const lista = Array.isArray(resposta.data)
        ? resposta.data
        : Array.isArray(
          resposta.data?.comunidades
        )
          ? resposta.data.comunidades
          : [];

      setComunidades(lista);

    } catch (error) {
      console.error(
        "Erro ao carregar comunidades da paróquia:",
        error
      );

      if (error.response?.status === 401) {
        setErro(
          "Sua sessão expirou. Saia e faça login novamente."
        );
        return;
      }

      if (error.response?.status === 403) {
        setErro(
          error.response?.data?.erro ||
          "Seu usuário não possui permissão para acessar este painel."
        );
        return;
      }

      setErro(
        error.response?.data?.erro ||
        "Não foi possível carregar as comunidades da paróquia."
      );

    } finally {
      setCarregando(false);
    }
  };

  // ========================================
  // CARREGAR AO ABRIR
  // ========================================

  useEffect(() => {
    carregarComunidades();
  }, []);

  // ========================================
  // ABRIR DETALHES DA COMUNIDADE
  // ========================================

  const abrirDetalhesComunidade = async (
    comunidade
  ) => {
    if (
      !comunidade?.id ||
      carregandoDetalhes
    ) {
      return;
    }

    try {
      setCarregandoDetalhes(true);
      setErroDetalhes("");
      setComunidadeDetalhada(null);

      const resposta = await api.get(
        `/admin/paroquia/comunidades/${comunidade.id}`
      );

      setComunidadeDetalhada(
        resposta.data
      );

    } catch (error) {
      console.error(
        "Erro ao carregar detalhes da comunidade:",
        error
      );

      if (error.response?.status === 401) {
        setErroDetalhes(
          "Sua sessão expirou. Faça login novamente."
        );
        return;
      }

      if (error.response?.status === 403) {
        setErroDetalhes(
          error.response?.data?.erro ||
          "Você não possui permissão para acessar esta comunidade."
        );
        return;
      }

      if (error.response?.status === 404) {
        setErroDetalhes(
          error.response?.data?.erro ||
          "Comunidade não encontrada nesta paróquia."
        );
        return;
      }

      setErroDetalhes(
        error.response?.data?.erro ||
        "Não foi possível carregar os detalhes da comunidade."
      );

    } finally {
      setCarregandoDetalhes(false);
    }
  };

  // ========================================
  // FECHAR DETALHES
  // ========================================

  const fecharDetalhes = () => {
    setComunidadeDetalhada(null);
    setErroDetalhes("");
  };

  // ========================================
  // EXTRAIR NOME DO ARQUIVO
  // ========================================

  const obterNomeArquivo = (
    contentDisposition,
    nomePadrao
  ) => {
    const encontrado =
      String(contentDisposition || "")
        .match(
          /filename="?([^";]+)"?/i
        );

    return (
      encontrado?.[1] ||
      nomePadrao
    );
  };

  // ========================================
  // BAIXAR BLOB
  // ========================================

  const baixarBlob = (
    blob,
    nomeArquivo
  ) => {
    const url =
      window.URL.createObjectURL(
        blob
      );

    const link =
      document.createElement("a");

    link.href = url;
    link.download = nomeArquivo;

    document.body.appendChild(
      link
    );

    link.click();
    link.remove();

    window.URL.revokeObjectURL(
      url
    );
  };

  // ========================================
  // EXPORTAR CSV DA COMUNIDADE
  // ========================================

  const exportarCsvComunidade = async (
    comunidade
  ) => {
    if (
      !comunidade?.id ||
      exportandoComunidadeId
    ) {
      return;
    }

    try {
      setExportandoComunidadeId(
        comunidade.id
      );

      const resposta = await api.get(
        `/admin/paroquia/comunidades/${comunidade.id}/exportar`,
        {
          responseType: "blob",
        }
      );

      const nomeArquivo =
        obterNomeArquivo(
          resposta.headers?.[
          "content-disposition"
          ],
          `dizimistas-${comunidade.nome || "comunidade"}.csv`
        );

      const tipoConteudo =
        resposta.headers?.[
        "content-type"
        ] ||
        "text/csv;charset=utf-8";

      const blob = new Blob(
        [resposta.data],
        {
          type: tipoConteudo,
        }
      );

      baixarBlob(
        blob,
        nomeArquivo
      );

    } catch (error) {
      console.error(
        "Erro ao exportar CSV da comunidade:",
        error
      );

      if (error.response?.status === 401) {
        alert(
          "Sua sessão expirou. Faça login novamente."
        );
        return;
      }

      if (error.response?.status === 403) {
        alert(
          error.response?.data?.erro ||
          "Você não possui permissão para exportar esta comunidade."
        );
        return;
      }

      if (error.response?.status === 404) {
        alert(
          error.response?.data?.erro ||
          "Comunidade não encontrada nesta paróquia."
        );
        return;
      }

      alert(
        "Não foi possível exportar o CSV desta comunidade."
      );

    } finally {
      setExportandoComunidadeId(
        null
      );
    }
  };

  // ========================================
  // BACKUP DA COMUNIDADE
  // ========================================

  const gerarBackupComunidade = async (
    comunidade
  ) => {
    if (
      !comunidade?.id ||
      gerandoBackupComunidadeId
    ) {
      return;
    }

    try {
      setGerandoBackupComunidadeId(
        comunidade.id
      );

      const resposta = await api.get(
        `/admin/paroquia/comunidades/${comunidade.id}/backup`,
        {
          responseType: "blob",
        }
      );

      const nomeArquivo =
        obterNomeArquivo(
          resposta.headers?.[
          "content-disposition"
          ],
          `backup-${comunidade.nome || "comunidade"}.json`
        );

      const tipoConteudo =
        resposta.headers?.[
        "content-type"
        ] ||
        "application/json;charset=utf-8";

      const blob = new Blob(
        [resposta.data],
        {
          type: tipoConteudo,
        }
      );

      baixarBlob(
        blob,
        nomeArquivo
      );

    } catch (error) {
      console.error(
        "Erro ao gerar backup da comunidade:",
        error
      );

      if (error.response?.status === 401) {
        alert(
          "Sua sessão expirou. Faça login novamente."
        );
        return;
      }

      if (error.response?.status === 403) {
        alert(
          error.response?.data?.erro ||
          "Você não possui permissão para gerar backup desta comunidade."
        );
        return;
      }

      if (error.response?.status === 404) {
        alert(
          error.response?.data?.erro ||
          "Comunidade não encontrada nesta paróquia."
        );
        return;
      }

      alert(
        "Não foi possível gerar o backup desta comunidade."
      );

    } finally {
      setGerandoBackupComunidadeId(
        null
      );
    }
  };

  // ========================================
  // HISTÓRICO MENSAL DA COMUNIDADE
  // ========================================

  const abrirHistoricoComunidade = async (
    comunidade
  ) => {
    if (
      !comunidade?.id ||
      carregandoHistorico
    ) {
      return;
    }

    try {
      setHistoricoComunidadeId(
        comunidade.id
      );

      setHistoricoMensal([]);
      setErroHistorico("");
      setFechamentoDetalhado(null);
      setCarregandoHistorico(true);

      const resposta = await api.get(
        `/admin/paroquia/comunidades/${comunidade.id}/historico`
      );

      const lista = Array.isArray(
        resposta.data?.historico
      )
        ? resposta.data.historico
        : Array.isArray(resposta.data)
          ? resposta.data
          : [];

      setHistoricoMensal(lista);

    } catch (error) {
      console.error(
        "Erro ao carregar histórico mensal da comunidade:",
        error
      );

      if (error.response?.status === 401) {
        setErroHistorico(
          "Sua sessão expirou. Faça login novamente."
        );
        return;
      }

      if (error.response?.status === 403) {
        setErroHistorico(
          error.response?.data?.erro ||
          "Você não possui permissão para acessar o histórico desta comunidade."
        );
        return;
      }

      if (error.response?.status === 404) {
        setErroHistorico(
          error.response?.data?.erro ||
          "Comunidade não encontrada nesta paróquia."
        );
        return;
      }

      setErroHistorico(
        error.response?.data?.erro ||
        "Não foi possível carregar o histórico mensal."
      );

    } finally {
      setCarregandoHistorico(false);
    }
  };

  const fecharHistorico = () => {
    setHistoricoComunidadeId(null);
    setHistoricoMensal([]);
    setErroHistorico("");
    setFechamentoDetalhado(null);
  };

  const abrirFechamentoMensal = async (
    registro
  ) => {
    if (
      !historicoComunidadeId ||
      !registro?.id ||
      carregandoFechamento
    ) {
      return;
    }

    try {
      setCarregandoFechamento(true);
      setErroHistorico("");
      setFechamentoDetalhado(null);

      const resposta = await api.get(
        `/admin/paroquia/comunidades/${historicoComunidadeId}/historico/${registro.id}`
      );

      setFechamentoDetalhado(
        resposta.data
      );

    } catch (error) {
      console.error(
        "Erro ao abrir fechamento mensal:",
        error
      );

      if (error.response?.status === 401) {
        setErroHistorico(
          "Sua sessão expirou. Faça login novamente."
        );
        return;
      }

      if (error.response?.status === 403) {
        setErroHistorico(
          error.response?.data?.erro ||
          "Você não possui permissão para acessar este fechamento."
        );
        return;
      }

      if (error.response?.status === 404) {
        setErroHistorico(
          error.response?.data?.erro ||
          "Fechamento mensal não encontrado nesta comunidade."
        );
        return;
      }

      setErroHistorico(
        error.response?.data?.erro ||
        "Não foi possível abrir este fechamento mensal."
      );

    } finally {
      setCarregandoFechamento(false);
    }
  };

  const fecharFechamento = () => {
    setFechamentoDetalhado(null);
  };

  // ========================================
  // IMPRESSÃO DA TABELA DE DIZIMISTAS
  // ========================================

  const calcularTotalLista = (
    lista
  ) => {
    return (
      Array.isArray(lista)
        ? lista
        : []
    ).reduce(
      (total, item) =>
        total +
        Number(
          item?.valor || 0
        ),
      0
    );
  };

  const imprimirTabelaComunidade = async (
    comunidade
  ) => {
    if (
      !comunidade?.id ||
      carregandoImpressaoComunidadeId
    ) {
      return;
    }

    try {
      setCarregandoImpressaoComunidadeId(
        comunidade.id
      );

      const resposta = await api.get(
        `/admin/paroquia/comunidades/${comunidade.id}/dizimistas`
      );

      const dados =
        resposta.data || {};

      setDadosImpressao(dados);

      /*
       * A área de impressão é renderizada pelo React
       * e fica invisível na tela normal.
       * Após o estado atualizar, abrimos a impressão.
       */
      window.setTimeout(() => {
        window.print();
      }, 250);

    } catch (error) {
      console.error(
        "Erro ao preparar impressão da comunidade:",
        error
      );

      if (error.response?.status === 401) {
        alert(
          "Sua sessão expirou. Faça login novamente."
        );
        return;
      }

      if (error.response?.status === 403) {
        alert(
          error.response?.data?.erro ||
          "Você não possui permissão para imprimir esta comunidade."
        );
        return;
      }

      if (error.response?.status === 404) {
        alert(
          error.response?.data?.erro ||
          "Comunidade não encontrada nesta paróquia."
        );
        return;
      }

      alert(
        error.response?.data?.erro ||
        "Não foi possível preparar a impressão desta comunidade."
      );

    } finally {
      setCarregandoImpressaoComunidadeId(
        null
      );
    }
  };

  const organizarDizimistasPorFolha = (
    lista
  ) => {
    const grupos = new Map();

    (
      Array.isArray(lista)
        ? lista
        : []
    ).forEach((dizimista) => {
      const folha =
        Number(
          dizimista?.folha
        ) || 1;

      if (!grupos.has(folha)) {
        grupos.set(
          folha,
          []
        );
      }

      grupos
        .get(folha)
        .push(dizimista);
    });

    return Array.from(
      grupos.entries()
    ).sort(
      (a, b) =>
        a[0] - b[0]
    );
  };

  // ========================================
  // FILTRO LOCAL
  // ========================================

  const comunidadesFiltradas =
    useMemo(() => {
      const termo =
        busca.trim().toLowerCase();

      if (!termo) {
        return comunidades;
      }

      return comunidades.filter(
        (comunidade) => {
          const nome =
            comunidade?.nome
              ?.toLowerCase() || "";

          const cidade =
            comunidade?.cidade
              ?.toLowerCase() || "";

          return (
            nome.includes(termo) ||
            cidade.includes(termo)
          );
        }
      );
    }, [comunidades, busca]);

  // ========================================
  // INDICADORES GERAIS
  // ========================================

  const totalComunidades =
    comunidades.length;

  const comunidadesAtivas =
    comunidades.filter(
      (comunidade) =>
        comunidade?.ativa === true
    ).length;

  const comunidadesInativas =
    totalComunidades -
    comunidadesAtivas;

  // ========================================
  // FORMATADORES
  // ========================================

  const formatarMoeda = (valor) => {
    return Number(valor || 0)
      .toLocaleString("pt-BR", {
        style: "currency",
        currency: "BRL",
      });
  };

  const formatarData = (data) => {
    if (!data) {
      return "-";
    }

    const dataConvertida =
      new Date(data);

    if (
      Number.isNaN(
        dataConvertida.getTime()
      )
    ) {
      return "-";
    }

    return dataConvertida
      .toLocaleDateString("pt-BR");
  };

  const formatarMesAno = (
    mes,
    ano
  ) => {
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

    const indiceMes =
      Number(mes) - 1;

    const nomeMes =
      nomesMeses[indiceMes] ||
      `Mês ${mes}`;

    return `${nomeMes}/${ano}`;
  };

  const traduzirAtividade = (
    atividade
  ) => {
    const textos = {
      RECENTE: "Atividade recente",
      ATENCAO: "Atenção",
      INATIVA: "Sem atividade recente",
      SEM_MOVIMENTACAO:
        "Sem movimentação",
    };

    return (
      textos[atividade] ||
      "Sem informação"
    );
  };

  // ========================================
  // RENDERIZAÇÃO
  // ========================================

  return (
    <div className="container">

      <style>{`
        .painel-paroquia {
          margin-top: 16px;
        }

        .painel-paroquia-cabecalho {
          background: #ffffff;
          border-radius: 12px;
          padding: 22px;
          box-shadow:
            0 4px 14px rgba(0, 0, 0, 0.08);
          margin-bottom: 16px;
        }

        .painel-paroquia-cabecalho h2 {
          margin-top: 0;
          margin-bottom: 14px;
        }

        .painel-paroquia-info {
          display: flex;
          flex-wrap: wrap;
          gap: 12px 24px;
        }

        .painel-paroquia-resumo {
          display: grid;
          grid-template-columns:
            repeat(3, minmax(140px, 1fr));
          gap: 12px;
          margin-bottom: 16px;
        }

        .painel-paroquia-card {
          background: #ffffff;
          border-radius: 12px;
          padding: 18px;
          box-shadow:
            0 4px 14px rgba(0, 0, 0, 0.06);
        }

        .painel-paroquia-card span {
          display: block;
          margin-bottom: 6px;
          font-size: 0.9rem;
        }

        .painel-paroquia-card strong {
          font-size: 1.5rem;
        }

        .painel-paroquia-conteudo {
          background: #ffffff;
          border-radius: 12px;
          padding: 20px;
          box-shadow:
            0 4px 14px rgba(0, 0, 0, 0.06);
        }

        .painel-paroquia-acoes {
          display: flex;
          justify-content: space-between;
          align-items: center;
          gap: 12px;
          flex-wrap: wrap;
          margin-bottom: 14px;
        }

        .painel-paroquia-busca {
          width: min(420px, 100%);
          padding: 10px 12px;
          border: 1px solid #d8d8d8;
          border-radius: 8px;
        }

        .painel-paroquia-tabela-wrapper {
          overflow-x: auto;
        }

        .painel-paroquia-tabela {
          width: 100%;
          border-collapse: collapse;
        }

        .painel-paroquia-tabela th,
        .painel-paroquia-tabela td {
          padding: 11px 10px;
          border-bottom: 1px solid #e7e7e7;
          text-align: left;
          vertical-align: middle;
        }

        .painel-paroquia-tabela th {
          background: #202a36;
          color: #ffffff;
          white-space: nowrap;
        }

        .painel-paroquia-status {
          display: inline-block;
          border-radius: 999px;
          padding: 4px 9px;
          font-size: 0.78rem;
          font-weight: 700;
        }

        .painel-paroquia-status-ativo {
          background: #dcfce7;
        }

        .painel-paroquia-status-inativo {
          background: #fee2e2;
        }

        .painel-paroquia-erro {
          background: #fff1f1;
          border: 1px solid #f2b8b8;
          border-radius: 8px;
          padding: 12px;
          margin-bottom: 14px;
        }

        .painel-paroquia-vazio {
          padding: 18px 0;
        }

        .painel-paroquia-acoes-linha {
          display: flex;
          flex-wrap: wrap;
          gap: 6px;
        }

        .painel-paroquia-btn {
          border: 0;
          border-radius: 8px;
          padding: 8px 12px;
          cursor: pointer;
          font-weight: 700;
        }

        .painel-paroquia-btn:disabled {
          cursor: not-allowed;
          opacity: 0.65;
        }

        .painel-paroquia-detalhes {
          margin-top: 18px;
          border: 1px solid #e1e1e1;
          border-radius: 12px;
          padding: 18px;
          background: #fafafa;
        }

        .painel-paroquia-detalhes-topo {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          gap: 12px;
          flex-wrap: wrap;
          margin-bottom: 14px;
        }

        .painel-paroquia-detalhes-topo h4 {
          margin: 0 0 4px 0;
        }

        .painel-paroquia-fechar {
          border: 0;
          border-radius: 8px;
          padding: 8px 12px;
          cursor: pointer;
        }

        .painel-paroquia-detalhes-grid {
          display: grid;
          grid-template-columns:
            repeat(auto-fit, minmax(180px, 1fr));
          gap: 10px;
        }

        .painel-paroquia-detalhe-item {
          background: #ffffff;
          border: 1px solid #e5e5e5;
          border-radius: 10px;
          padding: 12px;
        }

        .painel-paroquia-detalhe-item span {
          display: block;
          font-size: 0.82rem;
          margin-bottom: 5px;
        }

        .painel-paroquia-detalhe-item strong {
          font-size: 1rem;
        }

        .painel-paroquia-historico {
          margin-top: 18px;
          border: 1px solid #e1e1e1;
          border-radius: 12px;
          padding: 18px;
          background: #fafafa;
        }

        .painel-paroquia-historico-topo {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          gap: 12px;
          flex-wrap: wrap;
          margin-bottom: 14px;
        }

        .painel-paroquia-historico-grid {
          display: grid;
          gap: 10px;
        }

        .painel-paroquia-historico-item {
          background: #ffffff;
          border: 1px solid #e5e5e5;
          border-radius: 10px;
          padding: 12px;
          display: flex;
          justify-content: space-between;
          align-items: center;
          gap: 12px;
          flex-wrap: wrap;
        }

        .painel-paroquia-fechamento {
          margin-top: 14px;
          background: #ffffff;
          border: 1px solid #dedede;
          border-radius: 10px;
          padding: 14px;
        }

        .painel-paroquia-fechamento-resumo {
          display: grid;
          grid-template-columns:
            repeat(auto-fit, minmax(160px, 1fr));
          gap: 10px;
          margin-bottom: 14px;
        }

        .painel-paroquia-fechamento-tabela-wrapper {
          overflow-x: auto;
        }

        .painel-paroquia-fechamento-tabela {
          width: 100%;
          border-collapse: collapse;
        }

        .painel-paroquia-fechamento-tabela th,
        .painel-paroquia-fechamento-tabela td {
          padding: 9px 8px;
          border-bottom: 1px solid #e8e8e8;
          text-align: left;
        }

        .painel-paroquia-fechamento-tabela th {
          background: #26313d;
          color: #ffffff;
        }

        .area-impressao-paroquia {
          display: none;
        }

        @media print {
          body * {
            visibility: hidden !important;
          }

          .area-impressao-paroquia,
          .area-impressao-paroquia * {
            visibility: visible !important;
          }

          .area-impressao-paroquia {
            display: block !important;
            position: absolute;
            left: 0;
            top: 0;
            width: 100%;
            margin: 0;
            padding: 0;
            background: #ffffff;
            color: #000000;
            font-family: "Times New Roman", serif;
          }

          .impressao-paroquia-cabecalho {
            text-align: center;
            margin-bottom: 12px;
          }

          .impressao-paroquia-cabecalho h1 {
            font-size: 15px;
            margin: 0 0 3px 0;
          }

          .impressao-paroquia-cabecalho h2,
          .impressao-paroquia-cabecalho h3 {
            font-size: 12px;
            margin: 2px 0;
          }

          .impressao-paroquia-info {
            display: flex;
            justify-content: space-between;
            gap: 10px;
            margin: 10px 0;
            font-size: 11px;
          }

          .impressao-paroquia-folha {
            margin-bottom: 12px;
            break-inside: avoid;
          }

          .impressao-paroquia-folha h4 {
            text-align: center;
            background: #222;
            color: #fff;
            padding: 4px;
            margin: 0;
            font-size: 11px;
          }

          .impressao-paroquia-tabela {
            width: 100%;
            border-collapse: collapse;
            font-size: 10px;
          }

          .impressao-paroquia-tabela th,
          .impressao-paroquia-tabela td {
            border: 1px solid #555;
            padding: 3px 5px;
          }

          .impressao-paroquia-tabela th {
            text-align: left;
          }

          .impressao-paroquia-total {
            width: 100%;
            border-collapse: collapse;
            margin-top: 10px;
            font-size: 10px;
          }

          .impressao-paroquia-total td {
            border: 1px solid #555;
            padding: 4px 6px;
          }

          .impressao-paroquia-assinaturas {
            margin-top: 18px;
            font-size: 10px;
          }

          .impressao-paroquia-linha {
            margin-top: 18px;
            border-top: 1px solid #000;
            padding-top: 3px;
          }

          @page {
            size: A4 portrait;
            margin: 10mm;
          }
        }

        @media (max-width: 700px) {
          .painel-paroquia-resumo {
            grid-template-columns: 1fr;
          }

          .painel-paroquia-cabecalho,
          .painel-paroquia-conteudo {
            padding: 15px;
          }

          .painel-paroquia-detalhes-grid {
            grid-template-columns: 1fr;
          }
        }
      `}</style>

      {/* ======================================
          TOPO
      ====================================== */}



      <main className="painel-paroquia">

        {/* ====================================
            IDENTIFICAÇÃO DA PARÓQUIA
        ==================================== */}

        <section className="painel-paroquia-cabecalho">
          <h2>Painel da Paróquia</h2>

          <div className="painel-paroquia-info">
            <span>
              <strong>Paróquia:</strong>{" "}
              {usuario?.paroquiaNome ||
                "Paróquia não identificada"}
            </span>

            <span>
              <strong>Cidade:</strong>{" "}
              {usuario?.paroquiaCidade ||
                "Não informada"}
            </span>
          </div>
        </section>

        {/* ====================================
            RESUMO
        ==================================== */}

        <section className="painel-paroquia-resumo">

          <div className="painel-paroquia-card">
            <span>Total de comunidades</span>
            <strong>{totalComunidades}</strong>
          </div>

          <div className="painel-paroquia-card">
            <span>Comunidades ativas</span>
            <strong>{comunidadesAtivas}</strong>
          </div>

          <div className="painel-paroquia-card">
            <span>Comunidades inativas</span>
            <strong>{comunidadesInativas}</strong>
          </div>

        </section>

        {/* ====================================
            COMUNIDADES
        ==================================== */}

        <section className="painel-paroquia-conteudo">

          <div className="painel-paroquia-acoes">
            <h3>
              Comunidades da Paróquia
            </h3>

            <input
              className="painel-paroquia-busca"
              type="search"
              placeholder="Buscar por comunidade ou cidade..."
              value={busca}
              onChange={(event) =>
                setBusca(event.target.value)
              }
            />
          </div>

          {erro && (
            <div
              className="painel-paroquia-erro"
              role="alert"
            >
              {erro}
            </div>
          )}

          {carregando && (
            <p>Carregando comunidades...</p>
          )}

          {!carregando &&
            !erro &&
            comunidades.length === 0 && (
              <div className="painel-paroquia-vazio">
                Nenhuma comunidade cadastrada
                nesta paróquia.
              </div>
            )}

          {!carregando &&
            !erro &&
            comunidades.length > 0 &&
            comunidadesFiltradas.length === 0 && (
              <div className="painel-paroquia-vazio">
                Nenhuma comunidade corresponde
                à busca informada.
              </div>
            )}

          {!carregando &&
            !erro &&
            comunidadesFiltradas.length > 0 && (
              <div className="painel-paroquia-tabela-wrapper">

                <table className="painel-paroquia-tabela">
                  <thead>
                    <tr>
                      <th>Comunidade</th>
                      <th>Cidade</th>
                      <th>Status</th>
                      <th>Ações</th>
                    </tr>
                  </thead>

                  <tbody>
                    {comunidadesFiltradas.map(
                      (comunidade) => {
                        const exportando =
                          exportandoComunidadeId ===
                          comunidade.id;

                        const gerandoBackup =
                          gerandoBackupComunidadeId ===
                          comunidade.id;

                        return (
                          <tr key={comunidade.id}>
                            <td>
                              {comunidade.nome || "-"}
                            </td>

                            <td>
                              {comunidade.cidade ||
                                "Não informada"}
                            </td>

                            <td>
                              <span
                                className={
                                  comunidade.ativa
                                    ? "painel-paroquia-status painel-paroquia-status-ativo"
                                    : "painel-paroquia-status painel-paroquia-status-inativo"
                                }
                              >
                                {comunidade.ativa
                                  ? "Ativa"
                                  : "Inativa"}
                              </span>
                            </td>

                            <td>
                              <div className="painel-paroquia-acoes-linha">

                                <button
                                  type="button"
                                  className="painel-paroquia-btn"
                                  onClick={() =>
                                    abrirDetalhesComunidade(
                                      comunidade
                                    )
                                  }
                                  disabled={
                                    carregandoDetalhes
                                  }
                                >
                                  Ver detalhes
                                </button>

                                <button
                                  type="button"
                                  className="painel-paroquia-btn"
                                  onClick={() =>
                                    exportarCsvComunidade(
                                      comunidade
                                    )
                                  }
                                  disabled={
                                    exportando ||
                                    Boolean(
                                      exportandoComunidadeId
                                    )
                                  }
                                >
                                  {exportando
                                    ? "Exportando..."
                                    : "Exportar CSV"}
                                </button>

                                <button
                                  type="button"
                                  className="painel-paroquia-btn"
                                  onClick={() =>
                                    gerarBackupComunidade(
                                      comunidade
                                    )
                                  }
                                  disabled={
                                    gerandoBackup ||
                                    Boolean(
                                      gerandoBackupComunidadeId
                                    )
                                  }
                                >
                                  {gerandoBackup
                                    ? "Gerando..."
                                    : "Backup"}
                                </button>


                                <button
                                  type="button"
                                  className="painel-paroquia-btn"
                                  onClick={() =>
                                    abrirHistoricoComunidade(
                                      comunidade
                                    )
                                  }
                                  disabled={
                                    carregandoHistorico
                                  }
                                >
                                  Histórico mensal
                                </button>


                                <button
                                  type="button"
                                  className="painel-paroquia-btn"
                                  onClick={() =>
                                    imprimirTabelaComunidade(
                                      comunidade
                                    )
                                  }
                                  disabled={
                                    Boolean(
                                      carregandoImpressaoComunidadeId
                                    )
                                  }
                                >
                                  {carregandoImpressaoComunidadeId ===
                                    comunidade.id
                                    ? "Preparando..."
                                    : "Imprimir tabela"}
                                </button>

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

          {/* =================================
              HISTÓRICO MENSAL
          ================================= */}

          {historicoComunidadeId && (
            <div className="painel-paroquia-historico">

              <div className="painel-paroquia-historico-topo">
                <div>
                  <h4>
                    Histórico mensal
                  </h4>

                  <span>
                    Fechamentos da comunidade selecionada
                  </span>
                </div>

                <button
                  type="button"
                  className="painel-paroquia-fechar"
                  onClick={fecharHistorico}
                  disabled={
                    carregandoHistorico ||
                    carregandoFechamento
                  }
                >
                  Fechar histórico
                </button>
              </div>

              {carregandoHistorico && (
                <p>
                  Carregando histórico...
                </p>
              )}

              {erroHistorico && (
                <div
                  className="painel-paroquia-erro"
                  role="alert"
                >
                  {erroHistorico}
                </div>
              )}

              {!carregandoHistorico &&
                !erroHistorico &&
                historicoMensal.length === 0 && (
                  <p>
                    Nenhum fechamento mensal encontrado
                    para esta comunidade.
                  </p>
                )}

              {!carregandoHistorico &&
                !erroHistorico &&
                historicoMensal.length > 0 && (
                  <div className="painel-paroquia-historico-grid">

                    {historicoMensal.map(
                      (registro) => (
                        <div
                          className="painel-paroquia-historico-item"
                          key={registro.id}
                        >
                          <div>
                            <strong>
                              {formatarMesAno(
                                registro.mes,
                                registro.ano
                              )}
                            </strong>

                            <div>
                              Total:{" "}
                              {formatarMoeda(
                                registro.total
                              )}
                            </div>

                            <div>
                              Data:{" "}
                              {formatarData(
                                registro.data
                              )}
                            </div>
                          </div>

                          <button
                            type="button"
                            className="painel-paroquia-btn"
                            onClick={() =>
                              abrirFechamentoMensal(
                                registro
                              )
                            }
                            disabled={
                              carregandoFechamento
                            }
                          >
                            {carregandoFechamento
                              ? "Carregando..."
                              : "Ver fechamento"}
                          </button>
                        </div>
                      )
                    )}

                  </div>
                )}

              {fechamentoDetalhado && (
                <div className="painel-paroquia-fechamento">

                  <div className="painel-paroquia-historico-topo">
                    <div>
                      <h4>
                        {formatarMesAno(
                          fechamentoDetalhado
                            .fechamento?.mes,
                          fechamentoDetalhado
                            .fechamento?.ano
                        )}
                      </h4>

                      <span>
                        Detalhes do fechamento mensal
                      </span>
                    </div>

                    <button
                      type="button"
                      className="painel-paroquia-fechar"
                      onClick={fecharFechamento}
                    >
                      Fechar fechamento
                    </button>
                  </div>

                  <div className="painel-paroquia-fechamento-resumo">

                    <div className="painel-paroquia-detalhe-item">
                      <span>Total do mês</span>
                      <strong>
                        {formatarMoeda(
                          fechamentoDetalhado
                            .fechamento?.total
                        )}
                      </strong>
                    </div>

                    <div className="painel-paroquia-detalhe-item">
                      <span>Dizimistas</span>
                      <strong>
                        {fechamentoDetalhado
                          .quantidadeDizimistas ?? 0}
                      </strong>
                    </div>

                    <div className="painel-paroquia-detalhe-item">
                      <span>Equipe da comunidade</span>
                      <strong>
                        {fechamentoDetalhado
                          .fechamento
                          ?.equipe_comunidade ||
                          "-"}
                      </strong>
                    </div>

                    <div className="painel-paroquia-detalhe-item">
                      <span>Conferido em</span>
                      <strong>
                        {formatarData(
                          fechamentoDetalhado
                            .fechamento
                            ?.conferido_em
                        )}
                      </strong>
                    </div>

                    <div className="painel-paroquia-detalhe-item">
                      <span>Responsável da paróquia</span>
                      <strong>
                        {fechamentoDetalhado
                          .fechamento
                          ?.responsavel_paroquia ||
                          "-"}
                      </strong>
                    </div>

                  </div>

                  <div className="painel-paroquia-fechamento-tabela-wrapper">

                    <table className="painel-paroquia-fechamento-tabela">
                      <thead>
                        <tr>
                          <th>Folha</th>
                          <th>Nº</th>
                          <th>Nome</th>
                          <th>Valor</th>
                        </tr>
                      </thead>

                      <tbody>
                        {Array.isArray(
                          fechamentoDetalhado.itens
                        ) &&
                          fechamentoDetalhado
                            .itens.length > 0 ? (
                          fechamentoDetalhado
                            .itens.map(
                              (item) => (
                                <tr key={item.id}>
                                  <td>
                                    {item.folha}
                                  </td>

                                  <td>
                                    {item.numero}
                                  </td>

                                  <td>
                                    {item.nome}
                                  </td>

                                  <td>
                                    {formatarMoeda(
                                      item.valor
                                    )}
                                  </td>
                                </tr>
                              )
                            )
                        ) : (
                          <tr>
                            <td colSpan="4">
                              Nenhum item salvo
                              neste fechamento.
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </table>

                  </div>

                </div>
              )}

            </div>
          )}

          {/* =================================
              DETALHES
          ================================= */}

          {(carregandoDetalhes ||
            erroDetalhes ||
            comunidadeDetalhada) && (
              <div className="painel-paroquia-detalhes">

                <div className="painel-paroquia-detalhes-topo">
                  <div>
                    <h4>
                      {comunidadeDetalhada
                        ?.comunidade?.nome ||
                        "Detalhes da comunidade"}
                    </h4>

                    <span>
                      Visão gerencial da comunidade
                    </span>
                  </div>

                  <button
                    type="button"
                    className="painel-paroquia-fechar"
                    onClick={fecharDetalhes}
                    disabled={
                      carregandoDetalhes
                    }
                  >
                    Fechar detalhes
                  </button>
                </div>

                {carregandoDetalhes && (
                  <p>
                    Carregando detalhes...
                  </p>
                )}

                {erroDetalhes && (
                  <div
                    className="painel-paroquia-erro"
                    role="alert"
                  >
                    {erroDetalhes}
                  </div>
                )}

                {!carregandoDetalhes &&
                  !erroDetalhes &&
                  comunidadeDetalhada && (
                    <div className="painel-paroquia-detalhes-grid">

                      <div className="painel-paroquia-detalhe-item">
                        <span>Comunidade</span>
                        <strong>
                          {comunidadeDetalhada
                            .comunidade
                            ?.nome || "-"}
                        </strong>
                      </div>

                      <div className="painel-paroquia-detalhe-item">
                        <span>Cidade</span>
                        <strong>
                          {comunidadeDetalhada
                            .comunidade
                            ?.cidade ||
                            "Não informada"}
                        </strong>
                      </div>

                      <div className="painel-paroquia-detalhe-item">
                        <span>Status</span>
                        <strong>
                          {comunidadeDetalhada
                            .comunidade
                            ?.ativa
                            ? "Ativa"
                            : "Inativa"}
                        </strong>
                      </div>

                      <div className="painel-paroquia-detalhe-item">
                        <span>Total de usuários</span>
                        <strong>
                          {comunidadeDetalhada
                            .indicadores
                            ?.totalUsuarios ?? 0}
                        </strong>
                      </div>

                      <div className="painel-paroquia-detalhe-item">
                        <span>Usuários ativos</span>
                        <strong>
                          {comunidadeDetalhada
                            .indicadores
                            ?.usuariosAtivos ?? 0}
                        </strong>
                      </div>

                      <div className="painel-paroquia-detalhe-item">
                        <span>Total de dizimistas</span>
                        <strong>
                          {comunidadeDetalhada
                            .indicadores
                            ?.totalDizimistas ?? 0}
                        </strong>
                      </div>

                      <div className="painel-paroquia-detalhe-item">
                        <span>Valor atual registrado</span>
                        <strong>
                          {formatarMoeda(
                            comunidadeDetalhada
                              .indicadores
                              ?.valorAtualRegistrado
                          )}
                        </strong>
                      </div>

                      <div className="painel-paroquia-detalhe-item">
                        <span>Registros mensais</span>
                        <strong>
                          {comunidadeDetalhada
                            .indicadores
                            ?.totalRegistrosMensais ?? 0}
                        </strong>
                      </div>

                      <div className="painel-paroquia-detalhe-item">
                        <span>Último registro</span>
                        <strong>
                          {formatarData(
                            comunidadeDetalhada
                              .indicadores
                              ?.ultimoRegistroData
                          )}
                        </strong>
                      </div>

                      <div className="painel-paroquia-detalhe-item">
                        <span>Última movimentação</span>
                        <strong>
                          {formatarData(
                            comunidadeDetalhada
                              .indicadores
                              ?.ultimaMovimentacao
                          )}
                        </strong>
                      </div>

                      <div className="painel-paroquia-detalhe-item">
                        <span>Dias sem movimentação</span>
                        <strong>
                          {comunidadeDetalhada
                            .indicadores
                            ?.diasSemMovimentacao ??
                            "-"}
                        </strong>
                      </div>

                      <div className="painel-paroquia-detalhe-item">
                        <span>Atividade</span>
                        <strong>
                          {traduzirAtividade(
                            comunidadeDetalhada
                              .indicadores
                              ?.atividade
                          )}
                        </strong>
                      </div>

                    </div>
                  )}

              </div>
            )}

        </section>

      </main>

      {/* =====================================
          ÁREA EXCLUSIVA DE IMPRESSÃO
      ===================================== */}

      {dadosImpressao && (
        <section className="area-impressao-paroquia">

          <div className="impressao-paroquia-cabecalho">
            <h1>
              {(
                usuario?.paroquiaNome ||
                "Paróquia"
              ).toUpperCase()}
              {usuario?.paroquiaCidade
                ? ` – ${usuario.paroquiaCidade.toUpperCase()}`
                : ""}
            </h1>

            <h2>
              PASTORAL DA PARTILHA
            </h2>

            <h3>
              REGISTRO MENSAL DA PARTILHA
            </h3>
          </div>

          <div className="impressao-paroquia-info">
            <span>
              <strong>Comunidade:</strong>{" "}
              {dadosImpressao
                ?.comunidade?.nome ||
                "-"}
            </span>

            <span>
              <strong>Cidade:</strong>{" "}
              {dadosImpressao
                ?.comunidade?.cidade ||
                "Não informada"}
            </span>
          </div>

          {organizarDizimistasPorFolha(
            dadosImpressao?.dizimistas
          ).length === 0 ? (
            <div className="impressao-paroquia-folha">
              <h4>FOLHA 01</h4>

              <table className="impressao-paroquia-tabela">
                <thead>
                  <tr>
                    <th>Nome</th>
                    <th style={{ width: "55px" }}>
                      Nº
                    </th>
                    <th style={{ width: "90px" }}>
                      Valor
                    </th>
                  </tr>
                </thead>

                <tbody>
                  <tr>
                    <td colSpan="3">
                      Nenhum dizimista cadastrado.
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          ) : (
            organizarDizimistasPorFolha(
              dadosImpressao?.dizimistas
            ).map(
              ([numeroFolha, lista]) => {
                const totalFolha =
                  calcularTotalLista(
                    lista
                  );

                return (
                  <div
                    className="impressao-paroquia-folha"
                    key={numeroFolha}
                  >
                    <h4>
                      FOLHA{" "}
                      {String(
                        numeroFolha
                      ).padStart(
                        2,
                        "0"
                      )}
                    </h4>

                    <table className="impressao-paroquia-tabela">
                      <thead>
                        <tr>
                          <th>Nome</th>

                          <th
                            style={{
                              width: "55px",
                            }}
                          >
                            Nº
                          </th>

                          <th
                            style={{
                              width: "90px",
                            }}
                          >
                            Valor
                          </th>
                        </tr>
                      </thead>

                      <tbody>
                        {lista.map(
                          (dizimista) => (
                            <tr key={dizimista.id}>
                              <td>
                                {dizimista.nome}
                              </td>

                              <td>
                                {dizimista.numero}
                              </td>

                              <td>
                                {formatarMoeda(
                                  dizimista.valor
                                )}
                              </td>
                            </tr>
                          )
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
                              {formatarMoeda(
                                totalFolha
                              )}
                            </strong>
                          </td>
                        </tr>
                      </tfoot>
                    </table>
                  </div>
                );
              }
            )
          )}

          <table className="impressao-paroquia-total">
            <tbody>
              <tr>
                <td>
                  <strong>
                    TOTAL GERAL
                  </strong>
                </td>

                <td
                  style={{
                    width: "120px",
                    textAlign: "right",
                  }}
                >
                  <strong>
                    {formatarMoeda(
                      dadosImpressao
                        ?.totalValor
                    )}
                  </strong>
                </td>
              </tr>

              <tr>
                <td>
                  <strong>
                    PARÓQUIA (50%)
                  </strong>
                </td>

                <td
                  style={{
                    textAlign: "right",
                  }}
                >
                  {formatarMoeda(
                    Number(
                      dadosImpressao
                        ?.totalValor || 0
                    ) / 2
                  )}
                </td>
              </tr>

              <tr>
                <td>
                  <strong>
                    COMUNIDADE (50%)
                  </strong>
                </td>

                <td
                  style={{
                    textAlign: "right",
                  }}
                >
                  {formatarMoeda(
                    Number(
                      dadosImpressao
                        ?.totalValor || 0
                    ) / 2
                  )}
                </td>
              </tr>
            </tbody>
          </table>

          <div className="impressao-paroquia-assinaturas">
            <div>
              Equipe da Comunidade:
            </div>

            <div className="impressao-paroquia-linha">
              Conferido em:
              ____/____/________
            </div>

            <div className="impressao-paroquia-linha">
              Responsável da Paróquia:
            </div>
          </div>

        </section>
      )}

    </div>
  );
}

export default PainelParoquia;
