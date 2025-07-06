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

// Definição fixa dos cards por seção
const dashboardSections = [
  {
    section: 'Em atraso',
    color: 'var(--color-error)',
    bg: 'rgba(239,68,68,0.12)',
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
    cards: [
      { key: 'provas', title: 'Provas', icon: <img src={hangerGreen} alt="Provas" style={{ width: 20, height: 20 }} /> },
      { key: 'retiradas', title: 'Retiradas', icon: <img src={setaDireitaGreen} alt="Retiradas" style={{ width: 20, height: 20 }} /> },
      { key: 'devolucoes', title: 'Devoluções', icon: <img src={setaEsquerdaGreen} alt="Devoluções" style={{ width: 20, height: 20 }} /> },
    ],
  },
];

const resumoSections = [
  {
    section: 'Resultados do dia',
    cards: [
      { key: 'totalPedidosDia', title: 'Total de pedidos', icon: <FontAwesomeIcon icon={faClipboardList} style={{color: '#1EC1BC'}} /> },
      { key: 'totalRecebidoDia', title: 'Total recebido', icon: <FontAwesomeIcon icon={faMoneyBillWave} style={{color: '#1EC1BC'}} /> },
      { key: 'numPedidosDia', title: 'Número de pedidos', icon: <FontAwesomeIcon icon={faCartShopping} style={{color: '#1EC1BC'}} /> },
    ],
  },
  {
    section: 'Resultados da semana',
    cards: [
      { key: 'totalPedidosSemana', title: 'Total de pedidos', icon: <FontAwesomeIcon icon={faClipboardList} style={{color: '#1EC1BC'}} /> },
      { key: 'totalRecebidoSemana', title: 'Total recebido', icon: <FontAwesomeIcon icon={faMoneyBillWave} style={{color: '#1EC1BC'}} /> },
      { key: 'numPedidosSemana', title: 'Número de pedidos', icon: <FontAwesomeIcon icon={faCartShopping} style={{color: '#1EC1BC'}} /> },
    ],
  },
  {
    section: 'Resultados do mês',
    cards: [
      { key: 'totalPedidosMes', title: 'Total de pedidos', icon: <FontAwesomeIcon icon={faClipboardList} style={{color: '#1EC1BC'}} /> },
      { key: 'totalRecebidoMes', title: 'Total recebido', icon: <FontAwesomeIcon icon={faMoneyBillWave} style={{color: '#1EC1BC'}} /> },
      { key: 'numPedidosMes', title: 'Número de pedidos', icon: <FontAwesomeIcon icon={faCartShopping} style={{color: '#1EC1BC'}} /> },
    ],
  },
];

// Mock de dados vindos do backend
const dashboardValues = {
  provas: { emAtraso: 2, hoje: 1, proximos10: 4 },
  retiradas: { emAtraso: 1, hoje: 2, proximos10: 2 },
  devolucoes: { emAtraso: 3, hoje: 0, proximos10: 1 },
};
const resumoValues = {
  totalPedidosDia: 1200.0,
  totalRecebidoDia: 950.0,
  numPedidosDia: 8,
  totalPedidosSemana: 8500.0,
  totalRecebidoSemana: 7200.0,
  numPedidosSemana: 42,
  totalPedidosMes: 32000.0,
  totalRecebidoMes: 28500.0,
  numPedidosMes: 180,
};

const Home = () => {
  return (
    <>
      <Header nomeHeader="Home" />
      <div className="home">
        <div className="dashboard-grid">
          {dashboardSections.map((section, idx) => (
            <div className="dashboard-section" key={section.section}>
              <h3 style={{marginBottom: 12, color: section.color}}>{section.section}</h3>
              {section.cards.map((card) => {
                // Seleciona o valor correto do mock para cada seção
                let value = 0;
                if (card.key === 'provas') value = dashboardValues.provas[Object.keys(dashboardValues.provas)[idx]] ?? 0;
                if (card.key === 'retiradas') value = dashboardValues.retiradas[Object.keys(dashboardValues.retiradas)[idx]] ?? 0;
                if (card.key === 'devolucoes') value = dashboardValues.devolucoes[Object.keys(dashboardValues.devolucoes)[idx]] ?? 0;
                // Definir cor do fundo do ícone conforme a seção
                let iconBgColor = '#b2f5ea';
                if (section.section === 'Em atraso') iconBgColor = 'rgba(239,68,68,0.18)';
                if (section.section === 'Hoje') iconBgColor = 'rgba(59,130,246,0.18)';
                if (section.section === 'Próximos 10 dias') iconBgColor = 'rgba(16,185,129,0.18)';
                return (
                  <Card
                    key={card.key}
                    title={card.title}
                    value={value}
                    icon={card.icon}
                    bgColor={section.bg}
                    textColor={section.color}
                    iconBgColor={iconBgColor}
                  />
                );
              })}
            </div>
          ))}
        </div>
        <div className="dashboard-grid" style={{marginTop: 32}}>
          {resumoSections.map((section) => (
            <div className="dashboard-section" key={section.section}>
              <h3 style={{marginBottom: 12}}>{section.section}</h3>
              {section.cards.map((card) => (
                <Card
                  key={card.key}
                  title={card.title}
                  value={resumoValues[card.key] ?? 0}
                  icon={card.icon}
                  iconBgColor="#C3FAF3"
                />
              ))}
            </div>
          ))}
        </div>
      </div>
    </>
  );
};

export default Home; 