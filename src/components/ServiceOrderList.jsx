import React, { useState, useEffect } from 'react';
import { serviceOrderService } from '../services/serviceOrderService';
import '../styles/ServiceOrderList.css';
import { capitalizeText } from '../utils/capitalizeText';
import { mascaraTelefoneInternacional } from '../utils/Mascaras';
import { parseCurrency } from '../utils/parseCurrency';
import Button from './Button';
import Swal from 'sweetalert2';

const ServiceOrderList = ({ onSelectOrder, onCreateNew, isLoading, error, onRetry }) => {
    const [activeTab, setActiveTab] = useState('PENDENTE');
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(false);
    const [internalError, setInternalError] = useState(null);

    const tabs = [
        { key: 'PENDENTE', label: 'PENDENTES', color: '#0095e2' },
        { key: 'AGUARDANDO_RETIRADA', label: 'AGUARDANDO RETIRADA', color: '#e2d502' },
        { key: 'AGUARDANDO_DEVOLUCAO', label: 'AGUARDANDO DEVOLUÇÃO', color: '#1c3b4d' },
        { key: 'ATRASADO', label: 'ATRASADAS', color: '#f44336' },
        { key: 'RECUSADA', label: 'RECUSADAS', color: '#9e9e9e' },
        { key: 'FINALIZADO', label: 'FINALIZADAS', color: '#4caf50' },
    ];

    const fetchOrders = async (phase) => {
        setLoading(true);
        setInternalError(null);
        try {
            const data = await serviceOrderService.getServiceOrdersByPhase(phase);
            // Garante que orders sempre será um array
            setOrders(Array.isArray(data) ? data : []);
        } catch (err) {
            setInternalError('Erro ao carregar ordens de serviço');
            console.error('Erro:', err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchOrders(activeTab);
    }, [activeTab]);

    const formatDate = (dateString) => {
        if (!dateString) return '-';
        // Adiciona 'T00:00:00' se a data não tiver horário para evitar problemas de fuso horário
        const dateStr = dateString.includes('T') ? dateString : `${dateString}T00:00:00`;
        const date = new Date(dateStr);
        return date.toLocaleDateString('pt-BR');
    };

    const formatCurrency = (value) => {
        return new Intl.NumberFormat('pt-BR', {
            style: 'currency',
            currency: 'BRL'
        }).format(value || 0);
    };

    const getStatusBadge = (phase) => {
        const tab = tabs.find(t => t.key === phase);
        return (
            <span
                className="status-badge"
                style={{ backgroundColor: tab?.color }}
            >
                {tab?.label}
            </span>
        );
    };

    const handleTabChange = (tabKey) => {
        setActiveTab(tabKey);
    };

    const handleOrderClick = (order) => {
        onSelectOrder(order);
    };

    const handleMarkAsReturned = async (order, event) => {
        event.stopPropagation(); // Previne que o clique propague para o card

        const result = await Swal.fire({
            title: 'Confirmar devolução',
            text: `Deseja marcar a ordem de serviço #${order.id} como devolvida?`,
            icon: 'question',
            showCancelButton: true,
            confirmButtonColor: '#4caf50',
            cancelButtonColor: '#ffff',
            cancelButtonText: 'Cancelar',
            confirmButtonText: 'Sim, marcar como devolvida',
            reverseButtons: true
        });

        if (result.isConfirmed) {
            try {
                await serviceOrderService.finishServiceOrder(order.id);

                // Mostra mensagem de sucesso
                await Swal.fire({
                    title: 'Sucesso!',
                    text: 'Ordem de serviço marcada como devolvida.',
                    icon: 'success',
                    confirmButtonColor: '#4caf50'
                });

                // Recarrega a lista de ordens
                fetchOrders(activeTab);
            } catch (error) {
                console.error('Erro ao marcar como devolvida:', error);

                // Mostra mensagem de erro
                await Swal.fire({
                    title: 'Erro!',
                    text: 'Não foi possível marcar a ordem como devolvida. Tente novamente.',
                    icon: 'error',
                    confirmButtonColor: '#f44336'
                });
            }
        }
    };

    const handleMarkAsPickedUp = async (order, event) => {
        event.stopPropagation(); // Previne que o clique propague para o card

        // Verifica se há valor restante para receber
        const hasRemainingPayment = order.remaining_payment > 0;

                if (hasRemainingPayment) {
            // Modal informativo sobre valor restante
            const result = await Swal.fire({
                title: 'Valor restante para receber',
                text: `A ordem #${order.id} possui ${formatCurrency(order.remaining_payment)} restantes. Deseja marcar como retirada mesmo assim?`,
                icon: 'warning',
                showCancelButton: true,
                confirmButtonColor: '#CBA135',
                cancelButtonColor: '#ffff',
                confirmButtonText: 'Sim, marcar como retirada',
                cancelButtonText: 'Cancelar',
                reverseButtons: true
            });

            if (result.isConfirmed) {
                try {
                    await serviceOrderService.pickUpServiceOrder(order.id);
                    
                    await Swal.fire({
                        title: 'Retirada confirmada!',
                        text: `Ordem #${order.id} marcada como retirada.}`,
                        icon: 'success',
                        confirmButtonColor: '#CBA135'
                    });

                    // Recarrega a lista de ordens
                    fetchOrders(activeTab);
                } catch (error) {
                    console.error('Erro ao marcar como retirada:', error);
                    
                    await Swal.fire({
                        title: 'Erro!',
                        text: 'Não foi possível marcar a ordem como retirada. Tente novamente.',
                        icon: 'error',
                        confirmButtonColor: '#f44336'
                    });
                }
            }
        } else {
            // Não há valor restante, confirma diretamente
            const result = await Swal.fire({
                title: 'Confirmar retirada',
                text: `Deseja marcar a ordem de serviço #${order.id} como retirada?`,
                icon: 'question',
                showCancelButton: true,
                confirmButtonColor: '#CBA135',
                cancelButtonColor: '#6c757d',
                confirmButtonText: 'Sim, marcar como retirada',
                cancelButtonText: 'Cancelar',
                reverseButtons: true
            });

            if (result.isConfirmed) {
                try {
                    await serviceOrderService.pickUpServiceOrder(order.id);

                    await Swal.fire({
                        title: 'Retirada confirmada!',
                        text: 'Ordem de serviço marcada como retirada.',
                        icon: 'success',
                        confirmButtonColor: '#CBA135'
                    });

                    // Recarrega a lista de ordens
                    fetchOrders(activeTab);
                } catch (error) {
                    console.error('Erro ao marcar como retirada:', error);

                    await Swal.fire({
                        title: 'Erro!',
                        text: 'Não foi possível marcar a ordem como retirada. Tente novamente.',
                        icon: 'error',
                        confirmButtonColor: '#f44336'
                    });
                }
            }
        }
    };

        const handleRefuseOrder = async (order, event) => {
        event.stopPropagation(); // Previne que o clique propague para o card
        
        const { value: justification, isConfirmed } = await Swal.fire({
            title: 'Cancelar ordem de serviço',
            text: `Deseja cancelar a ordem de serviço #${order.id}?`,
            icon: 'warning',
            input: 'textarea',
            inputLabel: 'Justificativa do cancelamento:',
            inputPlaceholder: 'Digite o motivo do cancelamento...',
            inputAttributes: {
                'aria-label': 'Justificativa do cancelamento',
                'rows': 3
            },
            showCancelButton: true,
            confirmButtonColor: '#f44336',
            cancelButtonColor: '#ffff',
            confirmButtonText: 'Sim, cancelar ordem',
            cancelButtonText: 'Não, manter ordem',
            reverseButtons: true,
            inputValidator: (value) => {
                if (!value || value.trim().length === 0) {
                    return 'A justificativa é obrigatória';
                }
                if (value.trim().length < 10) {
                    return 'A justificativa deve ter pelo menos 10 caracteres';
                }
            }
        });

        if (isConfirmed && justification) {
            try {
                await serviceOrderService.refuseServiceOrder(order.id, justification);
                
                // Mostra mensagem de sucesso
                await Swal.fire({
                    title: 'Ordem cancelada!',
                    text: `A ordem de serviço #${order.id} foi cancelada com sucesso.`,
                    icon: 'success',
                    confirmButtonColor: '#f44336'
                });

                // Recarrega a lista de ordens
                fetchOrders(activeTab);
            } catch (error) {
                console.error('Erro ao cancelar ordem:', error);
                
                // Mostra mensagem de erro
                await Swal.fire({
                    title: 'Erro!',
                    text: 'Não foi possível cancelar a ordem. Tente novamente.',
                    icon: 'error',
                    confirmButtonColor: '#f44336'
                });
            }
        }
    };

    return (
        <div className="service-order-list-container">

            {/* Header */}
            <div className="list-header">
                <h2 style={{ fontSize: '18px', color: 'var(--color-text-primary)' }}>
                    Ordens de Serviço
                    {(isLoading || loading) && (
                        <span style={{ fontSize: '14px', color: 'var(--color-text-secondary)', marginLeft: '8px', fontWeight: 'normal' }}>
                            (Carregando...)
                        </span>
                    )}
                </h2>
            </div>

            {/* Tabs */}
            <div className="tabs-container">
                {tabs.map((tab) => (
                    <button
                        key={tab.key}
                        className={`tab ${activeTab === tab.key ? 'active' : ''}`}
                        onClick={() => handleTabChange(tab.key)}
                        style={{
                            borderBottomColor: activeTab === tab.key ? tab.color : 'transparent'
                        }}
                    >
                        {tab.label}
                    </button>
                ))}
            </div>

            {/* Content */}
            <div className="list-content">
                {(isLoading || loading) ? (
                    <div className="loading-container">
                        <div className="loading-spinner"></div>
                        <p>Carregando ordens de serviço...</p>
                    </div>
                ) : (error || internalError) ? (
                    <div className="error-state-service-order">
                        <i className="bi bi-exclamation-triangle"></i>
                        <h3>Erro ao carregar ordens de serviço</h3>
                        <p>{error || internalError}</p>
                        <Button variant="primary" text="Tentar novamente" iconName="arrow-clockwise" iconPosition="left" onClick={onRetry || (() => fetchOrders(activeTab))} disabled={isLoading || loading} style={{ width: 'fit-content' }} />
                    </div>
                ) : orders.length === 0 ? (
                    <div className="empty-state">
                        <svg width="64" height="64" viewBox="0 0 24 24" fill="currentColor">
                            <path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-5 14H7v-2h7v2zm3-4H7v-2h10v2zm0-4H7V7h10v2z" />
                        </svg>
                        <h3>Nenhuma ordem encontrada</h3>
                        <p>Não há ordens de serviço na fase "{activeTab}"</p>
                    </div>
                ) : (
                    <div className="orders-grid">
                        {orders.map((order) => (
                            <div
                                key={order.id}
                                className="order-card"
                                onClick={() => handleOrderClick(order)}
                            >
                                <div className="order-header">
                                    <div className="order-id">OS #{order.id}</div>
                                    {getStatusBadge(activeTab)}
                                </div>

                                <div className="order-content">
                                    <div className="order-info">
                                        <div className="info-row">
                                            <span className="label">Cliente:</span>
                                            <span className="value">{capitalizeText(order.client?.name)}</span>
                                        </div>
                                        <div className="info-row">
                                            <span className="label">Telefone:</span>
                                            <span className="value">{mascaraTelefoneInternacional(order.client?.contacts?.[0]?.phone)}</span>
                                        </div>
                                        <div className="info-row">
                                            <span className="label">Evento:</span>
                                            <span className="value">{capitalizeText(order.occasion)}</span>
                                        </div>
                                        <div className="info-row">
                                            <span className="label">Data do Evento:</span>
                                            <span className="value">{formatDate(order.event_date)}</span>
                                        </div>
                                        <div className="info-row">
                                            <span className="label">Recepcionista:</span>
                                            <span className="value">{capitalizeText(order.attendant_name)}</span>
                                        </div>
                                        <div className="info-row">
                                            <span className="label">Atendente Responsável:</span>
                                            <span className="value">{capitalizeText(order.employee_name)}</span>
                                        </div>
                                    </div>

                                    <div className="order-payment">
                                        <div className="payment-row">
                                            <span className="label">Total:</span>
                                            <span className="value total">{formatCurrency(order.total_value)}</span>
                                        </div>
                                        <div className="payment-row">
                                            <span className="label">Sinal:</span>
                                            <span className="value">{formatCurrency(order.advance_payment)}</span>
                                        </div>
                                        <div className="payment-row">
                                            <span className="label">Restante:</span>
                                            <span className="value remaining">{formatCurrency(order.remaining_payment)}</span>
                                        </div>
                                    </div>
                                </div>

                                <div className="order-footer">
                                    <div className="order-date">
                                        Pedido: {formatDate(order.order_date)}
                                    </div>
                                    <div className="order-actions">
                                        {activeTab === 'PENDENTE' && (
                                            <>
                                                <button
                                                    className="action-btn refuse"
                                                    onClick={(e) => handleRefuseOrder(order, e)}
                                                    title="Cancelar ordem"
                                                >
                                                    <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                                                        <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z" />
                                                    </svg>
                                                </button>
                                                <button className="action-btn edit">
                                                    <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                                                        <path d="M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25zM20.71 7.04c.39-.39.39-1.02 0-1.41l-2.34-2.34c-.39-.39-1.02-.39-1.41 0l-1.83 1.83 3.75 3.75 1.83-1.83z" />
                                                    </svg>
                                                </button>
                                            </>
                                        )}
                                        {activeTab === 'AGUARDANDO_RETIRADA' && (
                                            <>
                                                <button
                                                    className="action-btn refuse"
                                                    onClick={(e) => handleRefuseOrder(order, e)}
                                                    title="Cancelar ordem"
                                                >
                                                    <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                                                        <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z" />
                                                    </svg>
                                                </button>
                                                <button className="action-btn edit" title="Editar ordem">
                                                    <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                                                        <path d="M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25zM20.71 7.04c.39-.39.39-1.02 0-1.41l-2.34-2.34c-.39-.39-1.02-.39-1.41 0l-1.83 1.83 3.75 3.75 1.83-1.83z" />
                                                    </svg>
                                                </button>
                                                <button
                                                    className="action-btn pickup"
                                                    onClick={(e) => handleMarkAsPickedUp(order, e)}
                                                    title="Marcar como retirada"
                                                >
                                                    <i className="bi bi-box-arrow-right"></i>

                                                </button>
                                            </>
                                        )}
                                        {(activeTab === 'AGUARDANDO_DEVOLUCAO' || activeTab === 'ATRASADO') && (
                                            <button
                                                className="action-btn return"
                                                onClick={(e) => handleMarkAsReturned(order, e)}
                                                title="Marcar como devolvida"
                                            >
                                                <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                                                    <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z" />
                                                </svg>
                                            </button>
                                        )}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default ServiceOrderList; 