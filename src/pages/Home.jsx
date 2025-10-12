import React, { useState } from 'react';
import '../styles/Home.css';
import Header from '../components/Header';
import Card from '../components/Card';
import PeriodFilter from '../components/PeriodFilter';
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
  VendasPorTipoChart,
  ConversaoPorAtendenteChart,
  VendasPorCanalChart,
  TipoClienteChart,
  MotivosRecusaChart,
  TicketMedioChart,
  ClientesAtendidosChart,
  StatCard
} from '../components/Charts';

const Home = () => {
  const [selectedPeriod, setSelectedPeriod] = useState('mes');
  const [customDate, setCustomDate] = useState(null);
  const [customType, setCustomType] = useState(null);
  const { dashboardData, loading, changePeriod } = useDashboard(selectedPeriod, customDate, customType);

  // Função para lidar com mudança de período
  const handlePeriodChange = (newPeriod, newCustomDate = null, newCustomType = null) => {
    setSelectedPeriod(newPeriod);
    setCustomDate(newCustomDate);
    setCustomType(newCustomType);
    changePeriod(newPeriod, newCustomDate, newCustomType);
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

  // Verificar se os dados estão na estrutura esperada
  if (dashboardData && (!dashboardData.status || !dashboardData.resultados)) {
    console.warn('Estrutura de dados inesperada:', dashboardData);
  }

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
        </div>        {/* Filtro de Período */}
        <PeriodFilter 
          selectedPeriod={selectedPeriod}
          onPeriodChange={handlePeriodChange}
          loading={loading}
          customDate={customDate}
          customType={customType}
        />

        {/* Seção de Análises - Cards de Métricas Principais */}
        <div className="analytics-section">
          <h2 className="analytics-section-title">Métricas Principais</h2>
          <div className="analytics-grid analytics-grid-4">
            <StatCard
              title="Clientes Atendidos"
              value={currentAnalyticsData.clientesAtendidos.total}
              subtitle={`${currentAnalyticsData.clientesAtendidos.novos} novos | ${currentAnalyticsData.clientesAtendidos.recorrentes} recorrentes`}
              icon={<FontAwesomeIcon icon={faUsers} />}
              color="#1EC1BC"
            />
            <StatCard
              title="Ticket Médio"
              value={formatCurrency(currentAnalyticsData.ticketMedio.geral)}
              subtitle={`Locação: ${formatCurrency(currentAnalyticsData.ticketMedio.locacao)} | Venda: ${formatCurrency(currentAnalyticsData.ticketMedio.venda)}`}
              icon={<FontAwesomeIcon icon={faDollarSign} />}
              color="#10a3ff"
            />
            <StatCard
              title="Conversão Geral"
              value={`${currentAnalyticsData.conversao.geral}%`}
              subtitle="Taxa de fechamento de vendas"
              icon={<FontAwesomeIcon icon={faPercent} />}
              color="#a855f7"
            />
          </div>
        </div>

        {/* Seção de Vendas */}
        <div className="analytics-section">
          <h2 className="analytics-section-title">Análise de Vendas</h2>
          <div className="analytics-grid analytics-grid-2">
            <div className="chart-card">
              <h3 className="chart-card-title">Vendas por Tipo</h3>
              <VendasPorTipoChart data={currentAnalyticsData.vendasPorTipo} />
              <div style={{ 
                marginTop: 16, 
                display: 'flex', 
                justifyContent: 'space-around',
                padding: '12px',
                background: 'var(--color-bg-secondary)',
                borderRadius: '8px'
              }}>
                <div style={{ textAlign: 'center' }}>
                  <div style={{ fontSize: 12, color: 'var(--color-text-secondary)' }}>Locação</div>
                  <div style={{ fontSize: 18, fontWeight: 700, color: '#1EC1BC' }}>
                    {currentAnalyticsData.vendasPorTipo.percentualLocacao.toFixed(1)}%
                  </div>
                </div>
                <div style={{ textAlign: 'center' }}>
                  <div style={{ fontSize: 12, color: 'var(--color-text-secondary)' }}>Venda</div>
                  <div style={{ fontSize: 18, fontWeight: 700, color: '#10a3ff' }}>
                    {currentAnalyticsData.vendasPorTipo.percentualVenda.toFixed(1)}%
                  </div>
                </div>
              </div>
            </div>

            <div className="chart-card">
              <h3 className="chart-card-title">Evolução do Ticket Médio</h3>
              <TicketMedioChart data={currentAnalyticsData.ticketMedio.evolucao} />
            </div>
          </div>
        </div>

        {/* Seção de Clientes */}
        <div className="analytics-section">
          <h2 className="analytics-section-title">Análise de Clientes</h2>
          <div className="analytics-grid analytics-grid-3">
            <div className="chart-card">
              <h3 className="chart-card-title">Clientes Atendidos por Período</h3>
              <ClientesAtendidosChart data={currentAnalyticsData.clientesAtendidos.porPeriodo} />
            </div>

            <div className="chart-card">
              <h3 className="chart-card-title">Vendas por Canal</h3>
              <VendasPorCanalChart data={currentAnalyticsData.vendasPorCanal} />
            </div>

            <div className="chart-card">
              <h3 className="chart-card-title">Tipo de Cliente</h3>
              <TipoClienteChart data={currentAnalyticsData.tipoCliente} />
            </div>
          </div>
        </div>

        {/* Seção de Conversão */}
        <div className="analytics-section">
          <h2 className="analytics-section-title">Análise de Conversão</h2>
          <div className="chart-card">
            <h3 className="chart-card-title">Taxa de Conversão por Atendente</h3>
            <ConversaoPorAtendenteChart data={currentAnalyticsData.conversao.atendentes} />
            <div style={{ 
              marginTop: 20, 
              padding: '16px',
              background: 'var(--color-bg-tertiary)',
              borderRadius: '8px'
            }}>
              <h4 style={{ 
                fontSize: 14, 
                fontWeight: 600, 
                color: 'var(--color-text-primary)',
                marginBottom: 12
              }}>
                Detalhes por Atendente
              </h4>
              <div style={{ 
                display: 'grid', 
                gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
                gap: 16
              }}>
                {currentAnalyticsData.conversao.atendentes.map((atendente) => (
                  <div key={atendente.id} style={{
                    padding: '16px',
                    background: 'var(--color-bg-secondary)',
                    borderRadius: '12px',
                    border: '1px solid var(--color-border)',
                    boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
                  }}>
                    <div style={{ 
                      display: 'flex', 
                      justifyContent: 'space-between', 
                      alignItems: 'center',
                      marginBottom: '12px'
                    }}>
                      <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--color-text-primary)' }}>
                        {atendente.nome}
                      </div>
                      <div style={{ 
                        fontSize: 18, 
                        fontWeight: 700, 
                        color: atendente.taxa >= 70 ? '#10b981' : atendente.taxa >= 60 ? '#f59e0b' : '#ef4444'
                      }}>
                        {atendente.taxa.toFixed(1)}%
                      </div>
                    </div>
                    
                    <div style={{ 
                      display: 'grid', 
                      gridTemplateColumns: '1fr 1fr', 
                      gap: '8px',
                      fontSize: 12,
                      color: 'var(--color-text-secondary)'
                    }}>
                      <div>
                        <strong>Conversões:</strong> {atendente.conversoes}/{atendente.atendimentos}
                      </div>
                      <div>
                        <strong>Total Atendimentos:</strong> {atendente.totalAtendimentos || atendente.atendimentos}
                      </div>
                      <div>
                        <strong>Finalizados:</strong> {atendente.finalizados || 0}
                      </div>
                      <div>
                        <strong>Cancelados:</strong> {atendente.cancelados || 0}
                      </div>
                      <div>
                        <strong>Em Andamento:</strong> {atendente.emAndamento || 0}
                      </div>
                      <div>
                        <strong>Itens Vendidos:</strong> {atendente.itensVendidos || 0}
                      </div>
                    </div>
                    
                    <div style={{ 
                      marginTop: '12px',
                      padding: '8px',
                      background: 'var(--color-bg-tertiary)',
                      borderRadius: '6px',
                      fontSize: 12
                    }}>
                      <div style={{ color: 'var(--color-text-secondary)', marginBottom: '4px' }}>
                        <strong>Financeiro:</strong>
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                        <span>Vendido: R$ {(atendente.totalVendido || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
                        <span>Recebido: R$ {(atendente.totalRecebido || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Seção de Feedback */}
        <div className="analytics-section">
          <h2 className="analytics-section-title">Feedback e Melhorias</h2>
          <div className="analytics-grid analytics-grid-2">
            <div className="chart-card">
              <h3 className="chart-card-title">Motivos de Recusa</h3>
              <MotivosRecusaChart data={currentAnalyticsData.motivosRecusa} />
              <div style={{ 
                marginTop: 16, 
                padding: '12px',
                background: 'rgba(239, 68, 68, 0.1)',
                borderRadius: '8px',
                border: '1px solid rgba(239, 68, 68, 0.2)'
              }}>
                <div style={{ fontSize: 12, color: 'var(--color-text-secondary)' }}>
                  Total de Recusas
                </div>
                <div style={{ fontSize: 24, fontWeight: 700, color: '#ef4444', marginTop: 4 }}>
                  {currentAnalyticsData.motivosRecusa.reduce((acc, item) => acc + item.quantidade, 0)}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default Home; 