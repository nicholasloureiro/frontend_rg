import React from 'react';
import '../styles/Home.css';
import Header from '../components/Header';
import Card from '../components/Card';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faArrowRightLong, faArrowLeftLong, faClipboardList, faMoneyBillWave, faCartShopping } from '@fortawesome/free-solid-svg-icons';
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
import Button from '../components/Button';

const Home = () => {
  const { dashboardData, loading, error, refetch } = useDashboard();

  // Função para formatar valores monetários
  const formatCurrency = (value) => {
    if (typeof value !== 'number') return 'R$ 0,00';
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

  if (error) {
    return (
      <>
        <Header nomeHeader="Home" />
        <div className="home">
          <div className="error-state-dashboard">
            <i className="bi bi-exclamation-triangle"></i>
            <h3>Erro ao carregar dashboard</h3>
            <p>{error}</p>
            <Button
              text="Tentar novamente"
              variant="primary"
              iconName="arrow-clockwise"
              iconPosition="left"
              onClick={refetch}
              style={{ width: 'fit-content' }}
            />
          </div>
        </div>
      </>
    );
  }

  // Dados do status (primeira linha)
  const statusData = [
    {
      section: 'Em atraso',
      color: 'var(--color-error)',
      bg: 'rgba(239,68,68,0.12)',
      iconBgColor: 'rgba(239,68,68,0.18)',
      data: dashboardData?.status?.emAtraso || { provas: 0, retiradas: 0, devolucoes: 0 },
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
      data: dashboardData?.status?.hoje || { provas: 0, retiradas: 0, devolucoes: 0 },
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
      data: dashboardData?.status?.proximos10Dias || { provas: 0, retiradas: 0, devolucoes: 0 },
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
      data: dashboardData?.resultados?.dia || { totalPedidos: 0, totalRecebido: 0, numeroPedidos: 0 },
      cards: [
        { key: 'totalPedidos', title: 'Total de pedidos', icon: <FontAwesomeIcon icon={faClipboardList} style={{color: '#1EC1BC'}} /> },
        { key: 'totalRecebido', title: 'Total recebido', icon: <FontAwesomeIcon icon={faMoneyBillWave} style={{color: '#1EC1BC'}} /> },
        { key: 'numeroPedidos', title: 'Número de pedidos', icon: <FontAwesomeIcon icon={faCartShopping} style={{color: '#1EC1BC'}} /> },
      ],
    },
    {
      section: 'Resultados da semana',
      data: dashboardData?.resultados?.semana || { totalPedidos: 0, totalRecebido: 0, numeroPedidos: 0 },
      cards: [
        { key: 'totalPedidos', title: 'Total de pedidos', icon: <FontAwesomeIcon icon={faClipboardList} style={{color: '#1EC1BC'}} /> },
        { key: 'totalRecebido', title: 'Total recebido', icon: <FontAwesomeIcon icon={faMoneyBillWave} style={{color: '#1EC1BC'}} /> },
        { key: 'numeroPedidos', title: 'Número de pedidos', icon: <FontAwesomeIcon icon={faCartShopping} style={{color: '#1EC1BC'}} /> },
      ],
    },
    {
      section: 'Resultados do mês',
      data: dashboardData?.resultados?.mes || { totalPedidos: 0, totalRecebido: 0, numeroPedidos: 0 },
      cards: [
        { key: 'totalPedidos', title: 'Total de pedidos', icon: <FontAwesomeIcon icon={faClipboardList} style={{color: '#1EC1BC'}} /> },
        { key: 'totalRecebido', title: 'Total recebido', icon: <FontAwesomeIcon icon={faMoneyBillWave} style={{color: '#1EC1BC'}} /> },
        { key: 'numeroPedidos', title: 'Número de pedidos', icon: <FontAwesomeIcon icon={faCartShopping} style={{color: '#1EC1BC'}} /> },
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
              {section.cards.map((card) => (
                <Card
                  key={card.key}
                  title={card.title}
                  value={section.data[card.key] || 0}
                  icon={card.icon}
                  bgColor={section.bg}
                  textColor={section.color}
                  iconBgColor={section.iconBgColor}
                />
              ))}
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
      </div>
    </>
  );
};

export default Home; 