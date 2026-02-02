import React, { useState, useEffect } from 'react';
import { serviceOrderService } from '../services/serviceOrderService';
import { capitalizeText } from '../utils/capitalizeText';
import Modal from './Modal';
import '../styles/ClientHistoryModal.css';

const ClientHistoryModal = ({ show, onClose, client }) => {
  const [serviceOrders, setServiceOrders] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [expandedOrders, setExpandedOrders] = useState(new Set());

  useEffect(() => {
    if (show && client) {
      loadServiceOrders();
    }
  }, [show, client]);

  const loadServiceOrders = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await serviceOrderService.getServiceOrdersByRenter(client.id);
      setServiceOrders(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('Erro ao carregar histórico do cliente:', error);
      setError('Não foi possível carregar o histórico de ordens de serviço.');
    } finally {
      setIsLoading(false);
    }
  };

  const formatCurrency = (value) => {
    if (!value) return 'R$ 0,00';
    const numericValue = parseFloat(value);
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(numericValue);
  };

  const formatDate = (dateString) => {
    if (!dateString) return '-';
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('pt-BR');
    } catch {
      return '-';
    }
  };

  const getStatusColor = (status) => {
    if (!status) return '#9e9e9e';
    
    // Normalizar o status para maiúsculas e tratar variações
    const normalizedStatus = status.toString().toUpperCase().trim();
    
    const statusMap = {
      'PENDENTE': '#0095e2',
      'EM_PRODUCAO': '#4067a2',
      'AGUARDANDO_RETIRADA': '#ffb800',
      'AGUARDANDO_DEVOLUCAO': '#1c3b4d',
      'ATRASADO': '#f44336',
      'RECUSADA': '#9e9e9e',
      'FINALIZADO': '#4caf50',
      // Variações que podem vir do backend
      'RETIRADA': '#e2d502',
      'DEVOLVIDA': '#4caf50',
      'EM_ANDAMENTO': '#0095e2',
      'FINALIZADA': '#4caf50',
      'CANCELADA': '#9e9e9e',
      'RECUSADO': '#9e9e9e',
      'ATRASADA': '#f44336'
    };
    
    return statusMap[normalizedStatus] || '#9e9e9e';
  };

  const getStatusLabel = (status) => {
    if (!status) return 'Não definido';
    
    const statusMap = {
      'PENDENTE': 'Pendente',
      'AGUARDANDO_RETIRADA': 'Aguardando Retirada',
      'AGUARDANDO_DEVOLUCAO': 'Aguardando Devolução',
      'ATRASADO': 'Atrasado',
      'RECUSADA': 'Recusada',
      'FINALIZADO': 'Finalizado',
      // Variações que podem vir do backend
      'RETIRADA': 'Aguardando Retirada',
      'DEVOLVIDA': 'Finalizado',
      'EM_ANDAMENTO': 'Pendente',
      'FINALIZADA': 'Finalizado',
      'CANCELADA': 'Recusada',
      'RECUSADO': 'Recusada',
      'ATRASADA': 'Atrasado'
    };
    
    const normalizedStatus = status.toString().toUpperCase().trim();
    return statusMap[normalizedStatus] || capitalizeText(status);
  };

  const toggleOrderExpansion = (orderId) => {
    setExpandedOrders(prev => {
      const newSet = new Set(prev);
      if (newSet.has(orderId)) {
        newSet.delete(orderId);
      } else {
        newSet.add(orderId);
      }
      return newSet;
    });
  };

  // Detectar se é cliente criança
  const isInfant = client?.is_infant === true || client?.cpf?.startsWith('CRIANCA-');

  const modalBody = (
    <div className="client-history-modal">
      <div className="client-info">
        <h4 style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          {capitalizeText(client?.name || 'Cliente')}
          {isInfant && <span className="badge-infant">Criança</span>}
        </h4>
        <p>CPF: {isInfant ? 'Criança' : (client?.cpf || '-')}</p>
      </div>

      {isLoading ? (
        <div className="loading-state">
          <div className="spinner"></div>
          <p>Carregando histórico...</p>
        </div>
      ) : error ? (
        <div className="error-state">
          <i className="bi bi-exclamation-triangle"></i>
          <p>{error}</p>
          <button 
            className="btn-retry" 
            onClick={loadServiceOrders}
            disabled={isLoading}
          >
            Tentar novamente
          </button>
        </div>
      ) : serviceOrders.length === 0 ? (
        <div className="no-orders">
          <i className="bi bi-clipboard"></i>
          <p>Nenhuma ordem de serviço encontrada para este cliente.</p>
        </div>
      ) : (
        <div className="service-orders-list mb-3">
          <h5>Histórico de Ordens de Serviço ({serviceOrders.length})</h5>
          <div className="orders-container">
            {serviceOrders.map((order) => {
              const isExpanded = expandedOrders.has(order.id);
              
              return (
                <div key={order.id} className="service-order-card">
                  {/* Cabeçalho sempre visível - clicável para expandir/colapsar */}
                  <div 
                    className="order-header collapsible-header"
                    onClick={() => toggleOrderExpansion(order.id)}
                  >
                    <div className="order-id">
                      <strong>Ordem #{order.id}</strong>
                      <span 
                        className="status-badge"
                        style={{ backgroundColor: getStatusColor(order.phase_name) }}
                      >
                        {getStatusLabel(order.phase_name)}
                      </span>
                    </div>
                    <div className="order-header-right">
                      <div className="order-value">
                        {formatCurrency(order.total_value)}
                      </div>
                      <div className={`expand-icon ${isExpanded ? 'expanded' : ''}`}>
                        <i className="bi bi-chevron-down"></i>
                      </div>
                    </div>
                  </div>

                  {/* Detalhes básicos sempre visíveis */}
                  <div className="order-details d-flex flex-row flex-wrap gap-2">
                    <div className="detail-row">
                      <span className="label">Evento:</span>
                      <span className="value">{capitalizeText(order.event_name || '-')}</span>
                    </div>
                    <div className="detail-row">
                      <span className="label">Data do Evento:</span>
                      <span className="value">{formatDate(order.event_date)}</span>
                    </div>
                    <div className="detail-row">
                      <span className="label">Data da Ordem:</span>
                      <span className="value">{formatDate(order.order_date)}</span>
                    </div>
                    <div className="detail-row">
                      <span className="label">Funcionário:</span>
                      <span className="value">{capitalizeText(order.employee_name || '-')}</span>
                    </div>
                    <div className="detail-row">
                      <span className="label">Atendente:</span>
                      <span className="value">{capitalizeText(order.attendant_name || '-')}</span>
                    </div>
                  </div>

                  {/* Conteúdo expandível */}
                  <div className={`collapsible-content ${isExpanded ? 'expanded' : ''}`}>
                    <div className="payment-info">
                      <div className="payment-row">
                        <span className="label">Valor Total:</span>
                        <span className="value total">{formatCurrency(order.total_value)}</span>
                      </div>
                      <div className="payment-row">
                        <span className="label">Pagamento Antecipado:</span>
                        <span className="value advance">{formatCurrency(order.advance_payment)}</span>
                      </div>
                      <div className="payment-row">
                        <span className="label">Pagamento Restante:</span>
                        <span className="value remaining">{formatCurrency(order.remaining_payment)}</span>
                      </div>
                    </div>

                    <div className="dates-info">
                      <div className="dates-row">
                        <div className="date-item">
                          <span className="label">Prova:</span>
                          <span className="value">{formatDate(order.prova_date)}</span>
                        </div>
                        <div className="date-item">
                          <span className="label">Retirada:</span>
                          <span className="value">{formatDate(order.retirada_date)}</span>
                        </div>
                        <div className="date-item">
                          <span className="label">Devolução:</span>
                          <span className="value">{formatDate(order.devolucao_date)}</span>
                        </div>
                      </div>
                    </div>

                    {order.justificativa_atraso && (
                      <div className="delay-justification">
                        <span className="label">Justificativa de Atraso:</span>
                        <p className="value">{order.justificativa_atraso}</p>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );

  return (
    <Modal
      show={show}
      onClose={onClose}
      title="Histórico do Cliente"
      bodyContent={modalBody}
      buttonText="Fechar"
    />
  );
};

export default ClientHistoryModal;
