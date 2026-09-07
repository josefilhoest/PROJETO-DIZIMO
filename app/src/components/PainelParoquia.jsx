import { useEffect, useMemo, useState } from "react";

import api from "../api/api";
import Tabela from "./Tabela";

function PainelParoquia({ usuario, onSair }) {
  // ========================================
  // ESTADOS
  // ========================================

  const [secaoAtiva, setSecaoAtiva] =
    useState("inicio");

  const [ferramentaSelecionada, setFerramentaSelecionada] =
    useState("");

  const [comunidades, setComunidades] =
    useState([]);

  const [resumoMensal, setResumoMensal] = useState({
    totalArrecadado: 0,
    comunidadesComFechamento: 0,
    totalComunidades: 0,
    mes: new Date().getMonth() + 1,
    ano: new Date().getFullYear(),
  });

  const [carregandoResumoMensal, setCarregandoResumoMensal] =
    useState(true);

  const [erroResumoMensal, setErroResumoMensal] =
    useState("");

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
  // CARREGAR RESUMO MENSAL DA PARÓQUIA
  // ========================================

  const carregarResumoMensal = async () => {
    try {
      setCarregandoResumoMensal(true);
      setErroResumoMensal("");

      const agora = new Date();
      const mes = agora.getMonth() + 1;
      const ano = agora.getFullYear();

      const resposta = await api.get(
        `/admin/paroquia/resumo-mensal?mes=${mes}&ano=${ano}`
      );

      setResumoMensal({
        totalArrecadado: Number(
          resposta.data?.totalArrecadado || 0
        ),
        comunidadesComFechamento: Number(
          resposta.data?.comunidadesComFechamento || 0
        ),
        totalComunidades: Number(
          resposta.data?.totalComunidades || 0
        ),
        mes: Number(resposta.data?.mes || mes),
        ano: Number(resposta.data?.ano || ano),
      });
    } catch (error) {
      console.error(
        "Erro ao carregar resumo mensal da paróquia:",
        error
      );

      setErroResumoMensal(
        error.response?.data?.erro ||
        "Não foi possível carregar o total arrecadado no mês."
      );
    } finally {
      setCarregandoResumoMensal(false);
    }
  };

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
    carregarResumoMensal();
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
  // NAVEGAÇÃO INTERNA DO PAINEL
  // ========================================

  const navegarPainel = (secao, alvoId) => {
    setSecaoAtiva(secao);

    // Ao trocar de área, fechamos painéis auxiliares
    // para evitar conteúdo antigo aberto em outra seção.
    setComunidadeDetalhada(null);
    setErroDetalhes("");
    setHistoricoComunidadeId(null);
    setHistoricoMensal([]);
    setErroHistorico("");
    setFechamentoDetalhado(null);

    if (!alvoId) {
      return;
    }

    window.setTimeout(() => {
      document
        .getElementById(alvoId)
        ?.scrollIntoView({
          behavior: "smooth",
          block: "start",
        });
    }, 0);
  };

  const abrirFerramentaRelatorio = (ferramenta) => {
    setFerramentaSelecionada(ferramenta);
    navegarPainel("comunidades", "comunidades-paroquia");
  };


  // ========================================
  // RENDERIZAÇÃO
  // ========================================

  return (
    <div className="painel-paroquia-app">

      <style>{`
        .painel-paroquia-app {
          width: 100vw;
          min-height: 100vh;
          margin-left: calc(50% - 50vw);
          background: #eef3f1;
          padding: 12px;
          box-sizing: border-box;
          color: #21352e;
        }

        .painel-paroquia-app * {
          box-sizing: border-box;
        }

        .painel-paroquia-layout {
          width: 100%;
          max-width: none;
          min-height: calc(100vh - 24px);
          margin: 0;
          display: grid;
          grid-template-columns: 230px minmax(0, 1fr);
          overflow: hidden;
          background: #ffffff;
          border: 1px solid #dfe8e3;
          border-radius: 18px;
          box-shadow: 0 14px 36px rgba(22, 71, 52, 0.10);
        }

        .painel-paroquia-sidebar {
          background: linear-gradient(180deg, #0b7148 0%, #075a39 100%);
          color: #ffffff;
          padding: 22px 15px;
          display: flex;
          flex-direction: column;
          gap: 22px;
        }

        .painel-paroquia-marca {
          padding: 2px 8px 18px;
          border-bottom: 1px solid rgba(255, 255, 255, 0.18);
        }

        .painel-paroquia-marca-linha {
          display: flex;
          align-items: center;
          gap: 10px;
        }

        .painel-paroquia-marca-icone {
          width: 42px;
          height: 42px;
          display: grid;
          place-items: center;
          flex: 0 0 42px;
          border-radius: 12px;
          background: rgba(255, 255, 255, 0.16);
          font-size: 1.25rem;
        }

        .painel-paroquia-marca strong {
          display: block;
          font-size: 1.25rem;
          line-height: 1.1;
          letter-spacing: -0.02em;
        }

        .painel-paroquia-marca span {
          display: block;
          margin-top: 4px;
          font-size: 0.72rem;
          color: rgba(255, 255, 255, 0.80);
        }

        .painel-paroquia-menu {
          display: flex;
          flex-direction: column;
          gap: 6px;
        }

        .painel-paroquia-menu-item {
          width: 100%;
          display: flex;
          align-items: center;
          gap: 10px;
          border: 0;
          border-radius: 10px;
          padding: 11px 12px;
          background: transparent;
          color: #ffffff;
          font: inherit;
          font-size: 0.90rem;
          font-weight: 700;
          text-align: left;
          cursor: pointer;
          transition: background 0.18s ease, transform 0.18s ease;
        }

        .painel-paroquia-menu-item:hover {
          background: rgba(255, 255, 255, 0.12);
          transform: translateX(2px);
        }

        .painel-paroquia-menu-item-ativo {
          background: rgba(255, 255, 255, 0.17);
          box-shadow: inset 3px 0 0 rgba(255, 255, 255, 0.75);
        }

        .painel-paroquia-menu-icone {
          width: 22px;
          text-align: center;
          font-size: 1rem;
        }

        .painel-paroquia-sidebar-rodape {
          margin-top: auto;
          padding: 14px 10px 4px;
          border-top: 1px solid rgba(255, 255, 255, 0.15);
          font-size: 0.72rem;
          line-height: 1.45;
          color: rgba(255, 255, 255, 0.72);
        }

        .painel-paroquia-paroquia-detalhes {
          display: grid;
          grid-template-columns: repeat(2, minmax(0, 1fr));
          gap: 12px;
          margin-bottom: 16px;
        }

        .painel-paroquia-paroquia-info-card {
          background: #ffffff;
          border: 1px solid #dfe8e3;
          border-radius: 12px;
          padding: 16px;
        }

        .painel-paroquia-paroquia-info-card span {
          display: block;
          margin-bottom: 5px;
          color: #6c7d75;
          font-size: 0.78rem;
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: 0.03em;
        }

        .painel-paroquia-paroquia-info-card strong {
          color: #173f30;
          font-size: 1rem;
        }

        .painel-paroquia-relatorio-card {
          width: 100%;
          border: 1px solid #dbe7e1;
          background: #f8fbf9;
          border-radius: 10px;
          padding: 13px;
          text-align: left;
          cursor: pointer;
          color: inherit;
          font: inherit;
          transition: transform 0.16s ease, box-shadow 0.16s ease, border-color 0.16s ease;
        }

        .painel-paroquia-relatorio-card:hover {
          transform: translateY(-1px);
          border-color: #9fc7b5;
          box-shadow: 0 7px 18px rgba(22, 89, 61, 0.08);
        }

        .painel-paroquia-relatorio-card small {
          display: block;
          margin-top: 8px;
          color: #0b7148;
          font-weight: 800;
        }

        .painel-paroquia-ferramenta-aviso {
          margin-bottom: 14px;
          padding: 12px 14px;
          border: 1px solid #b9d8c9;
          border-radius: 10px;
          background: #eef8f3;
          color: #184f38;
          display: flex;
          justify-content: space-between;
          gap: 12px;
          align-items: center;
          flex-wrap: wrap;
        }

        .painel-paroquia-ferramenta-aviso button {
          border: 1px solid #9fc7b5;
          background: #ffffff;
          color: #0b7148;
          border-radius: 8px;
          padding: 7px 10px;
          cursor: pointer;
          font-weight: 700;
        }

        .painel-paroquia-area-principal {
          min-width: 0;
          background: #f6f9f7;
        }

        .painel-paroquia-topbar {
          min-height: 74px;
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 18px;
          padding: 14px 22px;
          background: #ffffff;
          border-bottom: 1px solid #e1e9e5;
        }

        .painel-paroquia-topbar-identidade {
          min-width: 0;
          display: flex;
          align-items: center;
          gap: 11px;
        }

        .painel-paroquia-topbar-igreja {
          width: 38px;
          height: 38px;
          display: grid;
          place-items: center;
          flex: 0 0 38px;
          border: 1px solid #dce9e3;
          border-radius: 10px;
          background: #f3faf6;
          color: #0b7148;
        }

        .painel-paroquia-topbar-texto {
          min-width: 0;
        }

        .painel-paroquia-topbar-texto strong {
          display: block;
          overflow: hidden;
          color: #1c3d31;
          font-size: 0.98rem;
          text-overflow: ellipsis;
          white-space: nowrap;
        }

        .painel-paroquia-topbar-texto span {
          display: block;
          margin-top: 3px;
          color: #71827a;
          font-size: 0.74rem;
        }

        .painel-paroquia-topbar-usuario {
          display: flex;
          align-items: center;
          gap: 10px;
          min-width: 0;
        }

        .painel-paroquia-avatar {
          width: 38px;
          height: 38px;
          display: grid;
          place-items: center;
          flex: 0 0 38px;
          border-radius: 50%;
          background: #0b7148;
          color: #ffffff;
          font-weight: 800;
        }

        .painel-paroquia-topbar-usuario-texto {
          min-width: 0;
          text-align: right;
        }

        .painel-paroquia-topbar-usuario-texto strong {
          display: block;
          overflow: hidden;
          max-width: 210px;
          color: #1d3b31;
          font-size: 0.88rem;
          text-overflow: ellipsis;
          white-space: nowrap;
        }

        .painel-paroquia-topbar-usuario-texto span {
          display: block;
          margin-top: 3px;
          color: #798982;
          font-size: 0.72rem;
        }

        .painel-paroquia-pagina {
          padding: 22px;
        }

        .painel-paroquia {
          width: 100%;
          margin: 0;
        }

        .painel-paroquia-cabecalho {
          margin-bottom: 16px;
          padding: 2px 2px 4px;
          background: transparent;
        }

        .painel-paroquia-cabecalho h2 {
          margin: 0 0 7px;
          color: #173c2e;
          font-size: 1.45rem;
          letter-spacing: -0.02em;
        }

        .painel-paroquia-info {
          display: flex;
          flex-wrap: wrap;
          gap: 7px 18px;
          color: #687a72;
          font-size: 0.87rem;
        }

        .painel-paroquia-resumo {
          display: grid;
          grid-template-columns: repeat(4, minmax(150px, 1fr));
          gap: 14px;
          margin-bottom: 18px;
        }

        .painel-paroquia-card {
          position: relative;
          overflow: hidden;
          min-height: 112px;
          padding: 18px 18px 16px;
          background: #ffffff;
          border: 1px solid #e1e9e5;
          border-radius: 12px;
          box-shadow: 0 5px 14px rgba(23, 73, 54, 0.05);
        }

        .painel-paroquia-card::before {
          content: "";
          position: absolute;
          left: 0;
          top: 0;
          bottom: 0;
          width: 4px;
          background: #0b7148;
        }

        .painel-paroquia-card span {
          display: block;
          margin-bottom: 10px;
          color: #718078;
          font-size: 0.82rem;
          font-weight: 600;
        }

        .painel-paroquia-card strong {
          color: #153d2d;
          font-size: 1.7rem;
          line-height: 1;
        }

        .painel-paroquia-card-arrecadado strong {
          font-size: 1.45rem;
          white-space: nowrap;
        }

        .painel-paroquia-card small {
          display: block;
          margin-top: 9px;
          color: #718078;
          font-size: 0.72rem;
          font-weight: 600;
          line-height: 1.3;
        }

        .painel-paroquia-conteudo {
          padding: 18px;
          background: #ffffff;
          border: 1px solid #e1e9e5;
          border-radius: 12px;
          box-shadow: 0 5px 14px rgba(23, 73, 54, 0.05);
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
          background: #edf5f1;
          color: #365448;
          font-size: 0.78rem;
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
          display: grid;
          grid-template-columns: repeat(2, minmax(118px, 1fr));
          gap: 6px;
          min-width: 260px;
        }

        .painel-paroquia-btn {
          border: 1px solid #cfe1d8;
          border-radius: 8px;
          padding: 8px 11px;
          background: #f7fbf9;
          color: #0b6843;
          cursor: pointer;
          font-weight: 700;
          transition: background 0.16s ease, border-color 0.16s ease;
        }

        .painel-paroquia-btn:hover:not(:disabled) {
          background: #eaf6f0;
          border-color: #9fc8b5;
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

        .painel-paroquia-secao-titulo {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 16px;
          margin-bottom: 16px;
          padding: 18px 20px;
          background: #ffffff;
          border: 1px solid #e4ece8;
          border-radius: 12px;
          box-shadow: 0 4px 14px rgba(16, 72, 51, 0.05);
        }

        .painel-paroquia-secao-titulo span {
          display: block;
          margin-bottom: 3px;
          color: #6d8178;
          font-size: 0.72rem;
          font-weight: 800;
          letter-spacing: 0.06em;
        }

        .painel-paroquia-secao-titulo h2 {
          margin: 0;
          color: #123c2d;
          font-size: 1.35rem;
        }

        .painel-paroquia-relatorios {
          margin-bottom: 16px;
          padding: 18px 20px;
          background: #ffffff;
          border: 1px solid #e1e9e5;
          border-radius: 12px;
          box-shadow: 0 4px 14px rgba(0, 0, 0, 0.05);
          scroll-margin-top: 18px;
        }

        .painel-paroquia-relatorios h3 {
          margin: 0 0 12px;
          color: #173c2f;
        }

        .painel-paroquia-relatorios-grid {
          display: grid;
          grid-template-columns: repeat(4, minmax(150px, 1fr));
          gap: 10px;
        }

        .painel-paroquia-relatorio-card {
          padding: 13px;
          border: 1px solid #e1e9e5;
          border-radius: 10px;
          background: #f8fbf9;
        }

        .painel-paroquia-relatorio-card strong {
          display: block;
          margin-bottom: 5px;
          color: #0b7148;
        }

        .painel-paroquia-relatorio-card span {
          color: #687971;
          font-size: 0.78rem;
          line-height: 1.35;
        }

        .painel-paroquia-minha-comunidade-topo {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 12px;
          margin-bottom: 14px;
          padding: 14px 16px;
          background: #ffffff;
          border: 1px solid #e1e9e5;
          border-radius: 12px;
        }

        .painel-paroquia-minha-comunidade-topo h2 {
          margin: 0;
          color: #173c2f;
          font-size: 1.15rem;
        }

        .painel-paroquia-voltar {
          border: 1px solid #bcd7ca;
          border-radius: 9px;
          padding: 9px 12px;
          background: #f3faf6;
          color: #0b6844;
          font-weight: 700;
          cursor: pointer;
        }


        .painel-paroquia-sair {
          border: 1px solid #d7e5df;
          background: #ffffff;
          color: #0b6b45;
          border-radius: 9px;
          padding: 8px 12px;
          font-weight: 800;
          cursor: pointer;
          transition: background 0.2s ease, border-color 0.2s ease;
        }

        .painel-paroquia-sair:hover {
          background: #f0f8f4;
          border-color: #9bc9b5;
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

        @media (max-width: 1050px) {
          .painel-paroquia-layout {
            grid-template-columns: 195px minmax(0, 1fr);
          }

          .painel-paroquia-sidebar {
            padding-left: 10px;
            padding-right: 10px;
          }

          .painel-paroquia-topbar-usuario-texto strong {
            max-width: 150px;
          }
        }

        @media (max-width: 700px) {
          .painel-paroquia-app {
            padding: 0;
          }

          .painel-paroquia-secao-titulo {
            align-items: stretch;
            flex-direction: column;
            padding: 14px;
          }

          .painel-paroquia-layout {
            display: block;
            min-height: 100vh;
            border: 0;
            border-radius: 0;
            box-shadow: none;
          }

          .painel-paroquia-sidebar {
            padding: 12px;
            gap: 12px;
          }

          .painel-paroquia-marca {
            padding: 2px 6px 10px;
          }

          .painel-paroquia-marca-linha {
            justify-content: center;
          }

          .painel-paroquia-menu {
            display: grid;
            grid-template-columns: repeat(2, minmax(0, 1fr));
            gap: 7px;
          }

          .painel-paroquia-menu-item {
            justify-content: center;
            min-height: 42px;
            padding: 9px 7px;
            font-size: 0.80rem;
            text-align: center;
          }

          .painel-paroquia-menu-item-ativo {
            box-shadow: none;
          }

          .painel-paroquia-sidebar-rodape {
            display: none;
          }

          .painel-paroquia-topbar {
            min-height: auto;
            padding: 11px 13px;
          }

          .painel-paroquia-topbar-usuario-texto {
            display: none;
          }

          .painel-paroquia-pagina {
            padding: 12px;
          }

          .painel-paroquia-relatorios-grid {
            grid-template-columns: 1fr;
          }

          .painel-paroquia-minha-comunidade-topo {
            align-items: stretch;
            flex-direction: column;
          }

          .painel-paroquia-voltar {
            width: 100%;
          }

          .painel-paroquia {
            width: 100%;
            margin-top: 12px;
          }

          .painel-paroquia-cabecalho,
          .painel-paroquia-card-arrecadado strong {
          font-size: 1.45rem;
          white-space: nowrap;
        }

        .painel-paroquia-card small {
          display: block;
          margin-top: 9px;
          color: #718078;
          font-size: 0.72rem;
          font-weight: 600;
          line-height: 1.3;
        }

        .painel-paroquia-conteudo {
            padding: 14px;
            border-radius: 10px;
          }

          .painel-paroquia-cabecalho h2 {
            font-size: 1.2rem;
            margin-bottom: 10px;
          }

          .painel-paroquia-info {
            flex-direction: column;
            gap: 6px;
          }

          .painel-paroquia-resumo,
          .painel-paroquia-paroquia-detalhes {
            grid-template-columns: 1fr;
            gap: 8px;
          }

          .painel-paroquia-card {
            padding: 14px;
          }

          .painel-paroquia-card strong {
            font-size: 1.3rem;
          }

          .painel-paroquia-acoes {
            display: block;
          }

          .painel-paroquia-acoes h3 {
            margin-top: 0;
            margin-bottom: 10px;
          }

          .painel-paroquia-busca {
            width: 100%;
            box-sizing: border-box;
          }

          .painel-paroquia-tabela-wrapper {
            overflow: visible;
            width: 100%;
          }

          .painel-paroquia-tabela,
          .painel-paroquia-tabela tbody,
          .painel-paroquia-tabela tr,
          .painel-paroquia-tabela td {
            display: block;
            width: 100%;
            box-sizing: border-box;
          }

          .painel-paroquia-tabela thead {
            display: none;
          }

          .painel-paroquia-tabela {
            border-collapse: separate;
          }

          .painel-paroquia-tabela tr {
            margin-bottom: 12px;
            border: 1px solid #e2e8f0;
            border-radius: 10px;
            overflow: hidden;
            background: #ffffff;
          }

          .painel-paroquia-tabela td {
            display: grid;
            grid-template-columns: minmax(92px, 34%) 1fr;
            gap: 10px;
            align-items: start;
            padding: 10px 12px;
            border-bottom: 1px solid #edf0f3;
            overflow-wrap: anywhere;
          }

          .painel-paroquia-tabela td:last-child {
            display: block;
            border-bottom: 0;
          }

          .painel-paroquia-tabela td::before {
            font-weight: 700;
            color: #374151;
          }

          .painel-paroquia-tabela td:nth-child(1)::before {
            content: "Comunidade";
          }

          .painel-paroquia-tabela td:nth-child(2)::before {
            content: "Cidade";
          }

          .painel-paroquia-tabela td:nth-child(3)::before {
            content: "Status";
          }

          .painel-paroquia-tabela td:nth-child(4)::before {
            content: "Ações";
            display: block;
            margin-bottom: 8px;
          }

          .painel-paroquia-acoes-linha {
            display: grid;
            grid-template-columns: 1fr;
            gap: 7px;
          }

          .painel-paroquia-btn {
            width: 100%;
            min-height: 42px;
            padding: 9px 10px;
          }

          .painel-paroquia-detalhes,
          .painel-paroquia-historico {
            padding: 14px;
          }

          .painel-paroquia-detalhes-grid,
          .painel-paroquia-fechamento-resumo {
            grid-template-columns: 1fr;
          }

          .painel-paroquia-detalhes-topo,
          .painel-paroquia-historico-topo,
          .painel-paroquia-historico-item {
            flex-direction: column;
            align-items: stretch;
          }

          .painel-paroquia-fechar {
            width: 100%;
            min-height: 40px;
          }

          .painel-paroquia-fechamento-tabela {
            min-width: 560px;
          }
        }

        @media (max-width: 420px) {
          .painel-paroquia-cabecalho,
          .painel-paroquia-card-arrecadado strong {
          font-size: 1.45rem;
          white-space: nowrap;
        }

        .painel-paroquia-card small {
          display: block;
          margin-top: 9px;
          color: #718078;
          font-size: 0.72rem;
          font-weight: 600;
          line-height: 1.3;
        }

        .painel-paroquia-conteudo {
            padding: 12px;
          }

          .painel-paroquia-tabela td {
            grid-template-columns: 1fr;
            gap: 4px;
          }

          .painel-paroquia-tabela td::before {
            margin-bottom: 2px;
          }
        }
      `}</style>

      <div className="painel-paroquia-layout">

        <aside className="painel-paroquia-sidebar">

          <div className="painel-paroquia-marca">
            <div className="painel-paroquia-marca-linha">
              <div className="painel-paroquia-marca-icone" aria-hidden="true">
                ⛪
              </div>

              <div>
                <strong>Dízimo</strong>
                <span>Comunidades mais fortes</span>
              </div>
            </div>
          </div>

          <nav className="painel-paroquia-menu" aria-label="Navegação do painel da paróquia">
            <button
              type="button"
              className={`painel-paroquia-menu-item ${secaoAtiva === "inicio" ? "painel-paroquia-menu-item-ativo" : ""}`}
              onClick={() => navegarPainel("inicio", "inicio-painel-paroquia")}
            >
              <span className="painel-paroquia-menu-icone" aria-hidden="true">🏠</span>
              <span>Início</span>
            </button>

            <button
              type="button"
              className={`painel-paroquia-menu-item ${secaoAtiva === "paroquia" ? "painel-paroquia-menu-item-ativo" : ""}`}
              onClick={() => navegarPainel("paroquia", "dados-paroquia")}
            >
              <span className="painel-paroquia-menu-icone" aria-hidden="true">⛪</span>
              <span>Paróquia</span>
            </button>

            <button
              type="button"
              className={`painel-paroquia-menu-item ${secaoAtiva === "comunidades" ? "painel-paroquia-menu-item-ativo" : ""}`}
              onClick={() => navegarPainel("comunidades", "comunidades-paroquia")}
            >
              <span className="painel-paroquia-menu-icone" aria-hidden="true">👥</span>
              <span>Comunidades</span>
            </button>

            <button
              type="button"
              className={`painel-paroquia-menu-item ${secaoAtiva === "relatorios" ? "painel-paroquia-menu-item-ativo" : ""}`}
              onClick={() => navegarPainel("relatorios", "relatorios-paroquia")}
            >
              <span className="painel-paroquia-menu-icone" aria-hidden="true">📊</span>
              <span>Relatórios</span>
            </button>

            <button
              type="button"
              className={`painel-paroquia-menu-item ${secaoAtiva === "minha-comunidade" ? "painel-paroquia-menu-item-ativo" : ""}`}
              onClick={() => navegarPainel("minha-comunidade")}
            >
              <span className="painel-paroquia-menu-icone" aria-hidden="true">🏡</span>
              <span>Minha Comunidade</span>
            </button>
          </nav>

          <div className="painel-paroquia-sidebar-rodape">
            Painel administrativo da paróquia.<br />
            Dados e permissões permanecem vinculados ao usuário autenticado.
          </div>

        </aside>

        <div className="painel-paroquia-area-principal">

          <header className="painel-paroquia-topbar">
            <div className="painel-paroquia-topbar-identidade">
              <div className="painel-paroquia-topbar-igreja" aria-hidden="true">⛪</div>

              <div className="painel-paroquia-topbar-texto">
                <strong>
                  {usuario?.paroquiaNome || "Paróquia não identificada"}
                </strong>
                <span>ADMIN_PAROQUIA</span>
              </div>
            </div>

            <div className="painel-paroquia-topbar-usuario">
              <div className="painel-paroquia-topbar-usuario-texto">
                <strong>{usuario?.nome || "Administrador"}</strong>
                <span>
                  {usuario?.paroquiaCidade || "Administração da Paróquia"}
                </span>
              </div>

              <div className="painel-paroquia-avatar" aria-hidden="true">
                {(usuario?.nome || "A").trim().charAt(0).toUpperCase()}
              </div>

              {typeof onSair === "function" && (
                <button
                  type="button"
                  className="painel-paroquia-sair"
                  onClick={onSair}
                >
                  Sair
                </button>
              )}
            </div>
          </header>

          <div className="painel-paroquia-pagina">

            {secaoAtiva === "minha-comunidade" ? (
              <section className="painel-paroquia-minha-comunidade">
                <div className="painel-paroquia-minha-comunidade-topo">
                  <div>
                    <h2>Minha Comunidade</h2>
                    <span>{usuario?.comunidadeNome || "Comunidade-sede da paróquia"}</span>
                  </div>

                  <button
                    type="button"
                    className="painel-paroquia-voltar"
                    onClick={() => navegarPainel("inicio", "inicio-painel-paroquia")}
                  >
                    ← Voltar ao painel da paróquia
                  </button>
                </div>

                <Tabela usuario={usuario} />
              </section>
            ) : (
              <>

            {/* ======================================
                TOPO
            ====================================== */}

            <main className="painel-paroquia" id="inicio-painel-paroquia">

        {secaoAtiva !== "inicio" && (
          <div className="painel-paroquia-secao-titulo">
            <div>
              <span>ADMIN_PAROQUIA</span>
              <h2>
                {secaoAtiva === "paroquia" && "Paróquia"}
                {secaoAtiva === "comunidades" && "Comunidades"}
                {secaoAtiva === "relatorios" && "Relatórios"}
              </h2>
            </div>
            <button
              type="button"
              className="painel-paroquia-voltar"
              onClick={() => navegarPainel("inicio", "inicio-painel-paroquia")}
            >
              ← Voltar ao início
            </button>
          </div>
        )}

        {/* ====================================
            IDENTIFICAÇÃO DA PARÓQUIA
        ==================================== */}

        {(secaoAtiva === "inicio" || secaoAtiva === "paroquia") && (
          <>
        <section className="painel-paroquia-cabecalho" id="dados-paroquia">
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

        {secaoAtiva === "paroquia" && (
          <section className="painel-paroquia-paroquia-detalhes">
            <div className="painel-paroquia-paroquia-info-card">
              <span>Administrador paroquial</span>
              <strong>{usuario?.nome || "Administrador"}</strong>
            </div>

            <div className="painel-paroquia-paroquia-info-card">
              <span>Perfil de acesso</span>
              <strong>ADMIN_PAROQUIA</strong>
            </div>

            <div className="painel-paroquia-paroquia-info-card">
              <span>Comunidade-sede</span>
              <strong>{usuario?.comunidadeNome || "Não vinculada"}</strong>
            </div>

            <div className="painel-paroquia-paroquia-info-card">
              <span>Situação das comunidades</span>
              <strong>{comunidadesAtivas} ativas de {totalComunidades}</strong>
            </div>
          </section>
        )}

        {/* ====================================
            RESUMO
        ==================================== */}

        <section className="painel-paroquia-resumo">

          <div className="painel-paroquia-card">
            <span>Total de comunidades</span>
            <strong>{totalComunidades}</strong>
          </div>

          <div className="painel-paroquia-card painel-paroquia-card-arrecadado">
            <span>Total arrecadado no mês</span>
            <strong>
              {carregandoResumoMensal
                ? "Carregando..."
                : formatarMoeda(resumoMensal.totalArrecadado)}
            </strong>
            <small>
              {resumoMensal.comunidadesComFechamento} de {totalComunidades} comunidades com fechamento
            </small>
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

        {erroResumoMensal && (
          <div className="painel-paroquia-erro" role="alert">
            {erroResumoMensal}
          </div>
        )}

          </>
        )}

        {/* ====================================
            RELATÓRIOS E FERRAMENTAS
        ==================================== */}

        {(secaoAtiva === "inicio" || secaoAtiva === "relatorios") && (
        <section className="painel-paroquia-relatorios" id="relatorios-paroquia">
          <h3>Relatórios e ferramentas</h3>

          <div className="painel-paroquia-relatorios-grid">
            <button type="button" className="painel-paroquia-relatorio-card" onClick={() => abrirFerramentaRelatorio("Histórico mensal")}>
              <strong>Histórico mensal</strong>
              <span>Consulte os fechamentos mensais de cada comunidade.</span>
              <small>Abrir comunidades →</small>
            </button>

            <button type="button" className="painel-paroquia-relatorio-card" onClick={() => abrirFerramentaRelatorio("Exportar CSV")}>
              <strong>Exportação CSV</strong>
              <span>Baixe a relação de dizimistas da comunidade selecionada.</span>
              <small>Abrir comunidades →</small>
            </button>

            <button type="button" className="painel-paroquia-relatorio-card" onClick={() => abrirFerramentaRelatorio("Backup")}>
              <strong>Backup</strong>
              <span>Gere uma cópia dos dados da comunidade vinculada à paróquia.</span>
              <small>Abrir comunidades →</small>
            </button>

            <button type="button" className="painel-paroquia-relatorio-card" onClick={() => abrirFerramentaRelatorio("Imprimir tabela")}>
              <strong>Impressão</strong>
              <span>Prepare a tabela de dizimistas para impressão em A4.</span>
              <small>Abrir comunidades →</small>
            </button>
          </div>
        </section>

        )}

        {/* ====================================
            COMUNIDADES
        ==================================== */}

        {(secaoAtiva === "inicio" || secaoAtiva === "comunidades") && (
        <section className="painel-paroquia-conteudo" id="comunidades-paroquia">

          {ferramentaSelecionada && (
            <div className="painel-paroquia-ferramenta-aviso">
              <span>
                <strong>{ferramentaSelecionada}:</strong>{" "}
                escolha a comunidade abaixo e use o botão correspondente na coluna Ações.
              </span>
              <button type="button" onClick={() => setFerramentaSelecionada("")}>
                Fechar aviso
              </button>
            </div>
          )}

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
        )}

            </main>

              </>
            )}

          </div>

        </div>

      </div>

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
