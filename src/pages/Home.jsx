import React, { useState } from 'react';
import '../styles/Home.css';
import Header from '../components/Header';
import Card from '../components/Card';
import PeriodFilter from '../components/PeriodFilter';
import AnalyticsFilters from '../components/AnalyticsFiltersComponent';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faArrowRightLong, 
  faArrowLeftLong, 
  faClipboardList, 
  faMoneyBillWave, 
  faCartShopping,
  faUsers,
  faChartLine,
  faStar,
  faSmile,
  faPercent,
  faDollarSign
} from '@fortawesome/free-solid-svg-icons';
import hangerRed from '../assets/hanger-red.png';
import hangerBlue from '../assets/hanger-blue.png';
import hangerGreen from '../assets/hanger-green.png';
import setaEsquerdaRed from '../assets/seta-esquerda-red.png';
import setaEsquerdaBlue from '../assets/seta-esquerda-blue.png';
import setaEsquerdaGreen from '../assets/seta-esquerda-green.png';
import setaDireitaRed from '../assets/seta-direita-red.png';
import setaDireitaBlue from '../assets/seta-direita-blue.png';
import setaDireitaGreen from '../assets/seta-direita-green.png';
import useDashboard from '../hooks/useDashboard';
import {
  TaxaConversaoChart,
  TotalVendidoChart,
  NumAtendimentosChart,
  TipoClienteChart,
  TipoClienteAtendimentosChart,
  CanalOrigemChart
} from '../components/AnalyticsCharts';

const Home = () => {
  const [selectedPeriod, setSelectedPeriod] = useState('mes');
  const [customDate, setCustomDate] = useState(null);
  const [customType, setCustomType] = useState(null);
  
  // Obter data de hoje no formato YYYY-MM-DD
  const getTodayDate = () => {
    const today = new Date();
    // Ajustar para o timezone local
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, '0');
    const day = String(today.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  const [selectedFilters, setSelectedFilters] = useState({
    atendente: null,
    tipoCliente: null,
    formaPagamento: null,
    canalOrigem: null,
    dataInicio: getTodayDate(),
    dataFim: getTodayDate()
  });

  const { dashboardData, loading, changePeriod } = useDashboard(
    selectedPeriod, 
    customDate, 
    customType,
    selectedFilters.atendente,
    selectedFilters.tipoCliente,
    selectedFilters.formaPagamento,
    selectedFilters.canalOrigem,
    selectedFilters.dataInicio,
    selectedFilters.dataFim
  );

  // Função para lidar com mudança de período
  const handlePeriodChange = (newPeriod, newCustomDate = null, newCustomType = null) => {
    setSelectedPeriod(newPeriod);
    setCustomDate(newCustomDate);
    setCustomType(newCustomType);
    changePeriod(newPeriod, newCustomDate, newCustomType, selectedFilters.atendente, selectedFilters.tipoCliente, selectedFilters.formaPagamento, selectedFilters.canalOrigem, selectedFilters.dataInicio, selectedFilters.dataFim);
  };

  // Função para lidar com mudança de filtros
  const handleFilterChange = (newFilters) => {
    setSelectedFilters(newFilters);
    changePeriod(selectedPeriod, customDate, customType, newFilters.atendente, newFilters.tipoCliente, newFilters.formaPagamento, newFilters.canalOrigem, newFilters.dataInicio, newFilters.dataFim);
  };

  // Dados analíticos normalizados da API
  const currentAnalyticsData = dashboardData?.analytics || {
    vendasPorTipo: { locacao: 0, venda: 0, totalVendas: 0, percentualLocacao: 0, percentualVenda: 0 },
    clientesAtendidos: { total: 0, novos: 0, recorrentes: 0, porPeriodo: [] },
    conversao: { geral: 0, loja: 0, atendentes: [] },
    ticketMedio: { geral: 0, locacao: 0, venda: 0, evolucao: [] },
    vendasPorCanal: [],
    tipoCliente: [],
    motivosRecusa: [],
    reclamacoes: { total: 0, resolvidas: 0, pendentes: 0, porCategoria: [], satisfacaoPos: 0 },
    resumo: { ticketMedio: 0, conversaoGeral: 0, satisfacaoCliente: 0, nps: 0 }
  };

  // Função para formatar valores monetários
  const formatCurrency = (value) => {
    if (typeof value !== 'number') {
      return 'R$ 0,00';
    }
    
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  // Função para formatar valores baseado no tipo
  const formatValue = (value, cardKey) => {
    if (cardKey.includes('total')) {
      return formatCurrency(value);
    }
    
    return value.toString();
  };

  if (loading) {
    return (
      <>
        <Header nomeHeader="Home" />
        <div className="home">
          <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '50vh' }}>
            <p>Carregando dashboard...</p>
          </div>
        </div>
      </>
    );
  }

  // if (error) {
  //   return (
  //     <>
  //       <Header nomeHeader="Home" />
  //       <div className="home">
  //         <div className="error-state-dashboard">
  //           <i className="bi bi-exclamation-triangle"></i>
  //           <h3>Erro ao carregar dashboard</h3>
  //           <p>{error}</p>
  //           <Button
  //             text="Tentar novamente"
  //             variant="primary"
  //             iconName="arrow-clockwise"
  //             iconPosition="left"
  //             onClick={refetch}
  //             style={{ width: 'fit-content' }}
  //           />
  //         </div>
  //       </div>
  //     </>
  //   );
  // }


  // Função para garantir que os dados tenham valores padrão válidos
  const ensureValidData = (data, defaultValue = 0) => {
    if (data === null || data === undefined) return defaultValue;
    if (typeof data === 'number') return data;
    if (typeof data === 'string') {
      const parsed = parseFloat(data);
      return isNaN(parsed) ? defaultValue : parsed;
    }
    return defaultValue;
  };

  // Função para processar dados de status
  const processStatusData = (statusData) => {
    if (!statusData) return { provas: 0, retiradas: 0, devolucoes: 0 };
    
    return {
      provas: ensureValidData(statusData.provas),
      retiradas: ensureValidData(statusData.retiradas),
      devolucoes: ensureValidData(statusData.devolucoes)
    };
  };

  // Função para processar dados de resultados
  const processResultadosData = (resultadosData) => {
    if (!resultadosData) return { total_pedidos: 0, total_recebido: 0, numero_pedidos: 0 };
    
    return {
      total_pedidos: ensureValidData(resultadosData.total_pedidos),
      total_recebido: ensureValidData(resultadosData.total_recebido),
      numero_pedidos: ensureValidData(resultadosData.numero_pedidos)
    };
  };

  // Dados do status (primeira linha)
  const statusData = [
    {
      section: 'Em atraso',
      color: 'var(--color-error)',
      bg: 'rgba(239,68,68,0.12)',
      iconBgColor: 'rgba(239,68,68,0.18)',
      data: processStatusData(dashboardData?.status?.em_atraso),
      cards: [
        { key: 'provas', title: 'Provas', icon: <img src={hangerRed} alt="Provas" style={{ width: 20, height: 20 }} /> },
        { key: 'retiradas', title: 'Retiradas', icon: <img src={setaDireitaRed} alt="Retiradas" style={{ width: 20, height: 20 }} /> },
        { key: 'devolucoes', title: 'Devoluções', icon: <img src={setaEsquerdaRed} alt="Devoluções" style={{ width: 20, height: 20 }} /> },
      ],
    },
    {
      section: 'Hoje',
      color: 'var(--color-info)',
      bg: 'rgba(59,130,246,0.10)',
      iconBgColor: 'rgba(59,130,246,0.18)',
      data: processStatusData(dashboardData?.status?.hoje),
      cards: [
        { key: 'provas', title: 'Provas', icon: <img src={hangerBlue} alt="Provas" style={{ width: 20, height: 20 }} /> },
        { key: 'retiradas', title: 'Retiradas', icon: <img src={setaDireitaBlue} alt="Retiradas" style={{ width: 20, height: 20 }} /> },
        { key: 'devolucoes', title: 'Devoluções', icon: <img src={setaEsquerdaBlue} alt="Devoluções" style={{ width: 20, height: 20 }} /> },
      ],
    },
    {
      section: 'Próximos 10 dias',
      color: 'var(--color-success)',
      bg: 'rgba(16,185,129,0.10)',
      iconBgColor: 'rgba(16,185,129,0.18)',
      data: processStatusData(dashboardData?.status?.proximos_10_dias),
      cards: [
        { key: 'provas', title: 'Provas', icon: <img src={hangerGreen} alt="Provas" style={{ width: 20, height: 20 }} /> },
        { key: 'retiradas', title: 'Retiradas', icon: <img src={setaDireitaGreen} alt="Retiradas" style={{ width: 20, height: 20 }} /> },
        { key: 'devolucoes', title: 'Devoluções', icon: <img src={setaEsquerdaGreen} alt="Devoluções" style={{ width: 20, height: 20 }} /> },
      ],
    },
  ];

  // Dados dos resultados (segunda linha)
  const resultadosData = [
    {
      section: 'Resultados do dia',
      data: processResultadosData(dashboardData?.resultados?.dia),
      cards: [
        { key: 'total_pedidos', title: 'Total de pedidos', icon: <FontAwesomeIcon icon={faClipboardList} style={{color: '#1EC1BC'}} /> },
        { key: 'total_recebido', title: 'Total recebido', icon: <FontAwesomeIcon icon={faMoneyBillWave} style={{color: '#1EC1BC'}} /> },
        { key: 'numero_pedidos', title: 'Número de pedidos', icon: <FontAwesomeIcon icon={faCartShopping} style={{color: '#1EC1BC'}} /> },
      ],
    },
    {
      section: 'Resultados da semana',
      data: processResultadosData(dashboardData?.resultados?.semana),
      cards: [
        { key: 'total_pedidos', title: 'Total de pedidos', icon: <FontAwesomeIcon icon={faClipboardList} style={{color: '#1EC1BC'}} /> },
        { key: 'total_recebido', title: 'Total recebido', icon: <FontAwesomeIcon icon={faMoneyBillWave} style={{color: '#1EC1BC'}} /> },
        { key: 'numero_pedidos', title: 'Número de pedidos', icon: <FontAwesomeIcon icon={faCartShopping} style={{color: '#1EC1BC'}} /> },
      ],
    },
    {
      section: 'Resultados do mês',
      data: processResultadosData(dashboardData?.resultados?.mes),
      cards: [
        { key: 'total_pedidos', title: 'Total de pedidos', icon: <FontAwesomeIcon icon={faClipboardList} style={{color: '#1EC1BC'}} /> },
        { key: 'total_recebido', title: 'Total recebido', icon: <FontAwesomeIcon icon={faMoneyBillWave} style={{color: '#1EC1BC'}} /> },
        { key: 'numero_pedidos', title: 'Número de pedidos', icon: <FontAwesomeIcon icon={faCartShopping} style={{color: '#1EC1BC'}} /> },
      ],
    },
  ];

  return (
    <>
      <Header nomeHeader="Home" />
      <div className="home">
        {/* Primeira linha - Status */}
        <div className="dashboard-grid">
          {statusData.map((section) => (
            <div className="dashboard-section" key={section.section}>
              <h3 style={{marginBottom: 12, color: section.color}}>{section.section}</h3>
              {section.cards.map((card) => {
                const value = section.data[card.key] || 0;
                return (
                  <Card
                    key={card.key}
                    title={card.title}
                    value={value}
                    icon={card.icon}
                    bgColor={section.bg}
                    textColor={section.color}
                    iconBgColor={section.iconBgColor}
                  />
                );
              })}
            </div>
          ))}
        </div>

        {/* Segunda linha - Resultados */}
        <div className="dashboard-grid">
          {resultadosData.map((section) => (
            <div className="dashboard-section" key={section.section}>
              <h3 style={{marginBottom: 12}}>{section.section}</h3>
              {section.cards.map((card) => {
                const value = section.data[card.key] || 0;
                const formattedValue = formatValue(value, card.key);
                
                return (
                  <Card
                    key={card.key}
                    title={card.title}
                    value={formattedValue}
                    icon={card.icon}
                    iconBgColor="var(--color-bg-card-icon)"
                  />
                );
              })}
            </div>
          ))}
        </div>
        <h2 className="pt-3 pb-4">Relatório de atendimentos</h2>
          {/* Seção de KPIs */}
        <div className="kpis-section">
          <div className="kpis-grid">
            <div className="kpi-card">
              <p className="kpi-label">Total Recebido</p>
              <p className="kpi-value">
                {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(dashboardData?.kpis?.total_recebido || 0)}
              </p>
            </div>
            <div className="kpi-card">
              <p className="kpi-label">Total Vendido</p>
              <p className="kpi-value">
                {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(dashboardData?.kpis?.total_vendido || 0)}
              </p>
            </div>
            <div className="kpi-card">
              <p className="kpi-label">Total de Atend.</p>
              <p className="kpi-value">{dashboardData?.kpis?.total_atendimentos || 0}</p>
            </div>
            <div className="kpi-card">
              <p className="kpi-label">Atnd fechados</p>
              <p className="kpi-value">{dashboardData?.kpis?.atendimentos_fechados || 0}</p>
            </div>
            <div className="kpi-card">
              <p className="kpi-label">Atnd não fech.</p>
              <p className="kpi-value">{dashboardData?.kpis?.atendimentos_nao_fechados || 0}</p>
            </div>
            <div className="kpi-card">
              <p className="kpi-label">Tx. Conv</p>
              <p className="kpi-value">{(dashboardData?.kpis?.taxa_conversao || 0).toFixed(2)}%</p>
            </div>
          </div>
        </div>

        {/* Seção de Filtros */}
        {dashboardData?.filtros_disponiveis && (
          <AnalyticsFilters 
            filters={dashboardData.filtros_disponiveis}
            selectedFilters={selectedFilters}
            onFilterChange={handleFilterChange}
          />
        )}

        {/* Gráficos de Análise */}
        <div className="charts-grid">
          {/* Gráficos de Atendentes */}
          <div className="chart-section">
            <h3>Análise de Atendentes</h3>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "20px" }}>
              <div>
                <h4 style={{ margin: "10px 0", fontSize: "14px", color: "#555" }}>Taxa de Conversão (%)</h4>
                <TaxaConversaoChart data={dashboardData?.atendentes_taxa_conversao || []} />
              </div>
              <div>
                <h4 style={{ margin: "10px 0", fontSize: "14px", color: "#555" }}>Número de Atendimentos</h4>
                <NumAtendimentosChart data={dashboardData?.atendentes_taxa_conversao || []} />
              </div>
            </div>
          </div>

          {/* Gráfico de Total Vendido por Atendente */}
          <div className="chart-section">
            <h3>Total Vendido por Atendente</h3>
            <h4 style={{ margin: "10px 0", fontSize: "14px", color: "#555" }}>Valor total vendido por cada atendente</h4>
            <TotalVendidoChart data={dashboardData?.atendentes_total_vendido || []} />
          </div>

          {/* Gráfico de Tipo de Cliente */}
          <div className="chart-section">
            <h3>Análise por Tipo de Cliente</h3>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "20px" }}>
              <div>
                <h4 style={{ margin: "10px 0", fontSize: "14px", color: "#555" }}>Total Vendido</h4>
                <TipoClienteChart data={dashboardData?.grafico_tipo_cliente || []} />
              </div>
              <div>
                <h4 style={{ margin: "10px 0", fontSize: "14px", color: "#555" }}>Atendimentos Fechados</h4>
                <TipoClienteAtendimentosChart data={dashboardData?.grafico_tipo_cliente || []} />
              </div>
            </div>
          </div>

          {/* Gráfico de Canal de Origem */}
          <div className="chart-section">
            <h3>Análise por Canal de Origem</h3>
            <h4 style={{ margin: "10px 0", fontSize: "14px", color: "#555" }}>Quantidade de atendimentos fechados por canal</h4>
            <CanalOrigemChart data={dashboardData?.grafico_canal_origem || []} />
          </div>
        </div>
      </div>
    </>
  );
};

export default Home; 