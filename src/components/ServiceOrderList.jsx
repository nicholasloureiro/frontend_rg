import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { serviceOrderService } from '../services/serviceOrderService';
import '../styles/ServiceOrderList.css';
import { capitalizeText } from '../utils/capitalizeText';
import { mascaraTelefoneInternacional } from '../utils/Mascaras';
import { parseCurrency } from '../utils/parseCurrency';
import Button from './Button';
import InputDate from './InputDate';
import CustomSelect from './CustomSelect';
import Modal from './Modal';
import Swal from 'sweetalert2';

const ServiceOrderList = ({ onSelectOrder, onCreateNew, isLoading, error, onRetry }) => {
    const navigate = useNavigate();
    const [activeTab, setActiveTab] = useState('PENDENTE');
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(false);
    const [internalError, setInternalError] = useState(null);
    const [refusalReasons, setRefusalReasons] = useState([]);

    // Estados para o modal de recusa
    const [showRefusalModal, setShowRefusalModal] = useState(false);
    const [selectedOrder, setSelectedOrder] = useState(null);
    const [selectedReasonId, setSelectedReasonId] = useState('');
    const [refusalJustification, setRefusalJustification] = useState('');

    // Estados para o modal de retirada
    const [showPickupModal, setShowPickupModal] = useState(false);
    const [pickupOrder, setPickupOrder] = useState(null);
    const [receiveRemainingPayment, setReceiveRemainingPayment] = useState(false);
    const [paymentMethod, setPaymentMethod] = useState('');
    const [isProcessingPickup, setIsProcessingPickup] = useState(false);

    // Estados para busca
    const [showSearchPanel, setShowSearchPanel] = useState(false);
    const [searchText, setSearchText] = useState('');
    const [initialDate, setInitialDate] = useState(null);
    const [endDate, setEndDate] = useState(null);
    const [isSearching, setIsSearching] = useState(false);

    const tabs = [
        { key: 'PENDENTE', label: 'PENDENTES', color: '#0095e2' },
        { key: 'AGUARDANDO_RETIRADA', label: 'AGUARDANDO RETIRADA', color: '#e2d502' },
        { key: 'AGUARDANDO_DEVOLUCAO', label: 'AGUARDANDO DEVOLUÇÃO', color: '#1c3b4d' },
        { key: 'ATRASADO', label: 'ATRASADAS', color: '#f44336' },
        { key: 'RECUSADA', label: 'RECUSADAS', color: '#9e9e9e' },
        { key: 'FINALIZADO', label: 'FINALIZADAS', color: '#4caf50' },
    ];

    const fetchOrders = async (phase, filters = {}) => {
        setLoading(true);
        setInternalError(null);
        try {
            const data = await serviceOrderService.searchServiceOrders(phase, filters);
            // Garante que orders sempre será um array
            setOrders(Array.isArray(data) ? data : []);
        } catch (err) {
            setInternalError('Erro ao carregar ordens de serviço');
            console.error('Erro:', err);
        } finally {
            setLoading(false);
        }
    };

    const fetchRefusalReasons = async () => {
        try {
            const data = await serviceOrderService.getRefusalReasons();
            setRefusalReasons(Array.isArray(data) ? data : []);
        } catch (err) {
            console.error('Erro ao carregar motivos de recusa:', err);
        }
    };

    // Converte os motivos de recusa para o formato do CustomSelect
    const refusalReasonOptions = refusalReasons.map(reason => ({
        value: reason.id.toString(),
        label: reason.name
    }));

    const openRefusalModal = (order) => {
        setSelectedOrder(order);
        setSelectedReasonId('');
        setRefusalJustification('');
        setShowRefusalModal(true);
    };

    const closeRefusalModal = () => {
        setShowRefusalModal(false);
        setSelectedOrder(null);
        setSelectedReasonId('');
        setRefusalJustification('');
    };

    const handleRefusalSubmit = async () => {
        if (!selectedReasonId) {
            Swal.fire({
                title: 'Motivo obrigatório',
                text: 'Por favor, selecione um motivo da recusa.',
                icon: 'warning',
                confirmButtonColor: '#f44336'
            });
            return;
        }

        try {
            await serviceOrderService.refuseServiceOrder(
                selectedOrder.id,
                refusalJustification.trim() || null,
                parseInt(selectedReasonId)
            );

            // Mostra mensagem de sucesso
            await Swal.fire({
                title: 'Ordem cancelada!',
                text: `A ordem de serviço #${selectedOrder.id} foi cancelada com sucesso.`,
                icon: 'success',
                confirmButtonColor: '#f44336'
            });

            closeRefusalModal();
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
    };

    useEffect(() => {
        fetchOrders(activeTab);
        fetchRefusalReasons();
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
        // Limpa os filtros quando muda de aba
        setSearchText('');
        setInitialDate(null);
        setEndDate(null);
    };

    const handleSearch = async () => {
        setIsSearching(true);
        const filters = {};

        if (searchText.trim()) {
            filters.search = searchText.trim();
        }
        if (initialDate) {
            filters.initial_date = initialDate.toISOString().split('T')[0];
        }
        if (endDate) {
            filters.end_date = endDate.toISOString().split('T')[0];
        }

        await fetchOrders(activeTab, filters);
        setIsSearching(false);
    };

    const handleClearSearch = async () => {
        setSearchText('');
        setInitialDate(null);
        setEndDate(null);
        await fetchOrders(activeTab);
    };

    const toggleSearchPanel = () => {
        setShowSearchPanel(!showSearchPanel);
    };

    const handleOrderClick = (order) => {
        // Navega para a rota com o ID da ordem
        navigate(`/ordens/${order.id}`);
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

    const openPickupModal = (order, event) => {
        event.stopPropagation();
        setPickupOrder(order);
        setReceiveRemainingPayment(order.remaining_payment > 0);
        setPaymentMethod('');
        setShowPickupModal(true);
    };

    const closePickupModal = () => {
        setShowPickupModal(false);
        setPickupOrder(null);
        setReceiveRemainingPayment(false);
        setPaymentMethod('');
        setIsProcessingPickup(false);
    };

    const handlePickupSubmit = async () => {
        if (!pickupOrder) return;

        setIsProcessingPickup(true);

        try {
            // Se há valor restante e foi selecionado para receber, mas não escolheu forma de pagamento
            if (pickupOrder.remaining_payment > 0 && receiveRemainingPayment && !paymentMethod) {
                await Swal.fire({
                    title: 'Forma de pagamento obrigatória',
                    text: 'Por favor, selecione a forma de pagamento para o valor restante.',
                    icon: 'warning',
                    confirmButtonColor: '#CBA135'
                });
                setIsProcessingPickup(false);
                return;
            }

            // Prepara os dados de pagamento se necessário
            const paymentData = pickupOrder.remaining_payment > 0 && receiveRemainingPayment ? {
                receiveRemainingPayment: true,
                paymentMethod: paymentMethod,
                remainingAmount: pickupOrder.remaining_payment
            } : null;

            // Chama o serviço para marcar como retirada com dados de pagamento
            await serviceOrderService.pickUpServiceOrder(pickupOrder.id, paymentData);

            await Swal.fire({
                title: 'Retirada confirmada!',
                text: `Ordem #${pickupOrder.id} marcada como retirada${receiveRemainingPayment ? ` e valor restante recebido via ${paymentMethod}` : ''}.`,
                icon: 'success',
                confirmButtonColor: '#CBA135'
            });

            closePickupModal();
            fetchOrders(activeTab);
        } catch (error) {
            console.error('Erro ao marcar como retirada:', error);

            await Swal.fire({
                title: 'Erro!',
                text: 'Não foi possível marcar a ordem como retirada. Tente novamente.',
                icon: 'error',
                confirmButtonColor: '#f44336'
            });
        } finally {
            setIsProcessingPickup(false);
        }
    };

    const handleRefuseOrder = async (order, event) => {
        event.stopPropagation(); // Previne que o clique propague para o card
        openRefusalModal(order);
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
            <div className="tabs-container mb-3">
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
            <div className="search-toggle-btn-container mb-3">
                <div className="search-toggle-btn-container-content d-flex justify-content-end">
                    <Button variant="primary" text={`${showSearchPanel ? 'Ocultar Busca' : 'Buscar'}`} iconName={`${showSearchPanel ? 'x-circle' : 'search'}`} iconPosition="left" onClick={toggleSearchPanel} style={{ width: 'fit-content' }} />
                </div>
                {/* Painel de Busca */}
                {showSearchPanel && (
                    <div className="search-panel mt-3">
                        <div className="search-filters">
                            <div className="search-field">
                                <label htmlFor="search-text">Buscar por texto:</label>
                                <input
                                    id="search-text"
                                    type="text"
                                    placeholder="Digite nome do cliente, evento, recepcionista..."
                                    value={searchText}
                                    onChange={(e) => setSearchText(e.target.value)}
                                    onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                                />
                            </div>

                            <div className="date-filters">
                                <div className="date-field">
                                    <label htmlFor="initial-date">Data inicial:</label>
                                    <InputDate
                                        selectedDate={initialDate}
                                        onDateChange={setInitialDate}
                                        placeholderText="Selecione a data inicial"
                                    />
                                </div>

                                <div className="date-field">
                                    <label htmlFor="end-date">Data final:</label>
                                    <InputDate
                                        selectedDate={endDate}
                                        onDateChange={setEndDate}
                                        placeholderText="Selecione a data final"
                                    />
                                </div>
                            </div>
                        </div>

                        <div className="search-actions">
                            <Button
                                variant="outline"
                                text="Limpar"
                                iconName="x-circle"
                                iconPosition="left"
                                onClick={handleClearSearch}
                                disabled={isSearching || loading}
                            />
                            <Button
                                variant="primary"
                                text="Buscar"
                                iconName="search"
                                iconPosition="left"
                                onClick={handleSearch}
                                disabled={isSearching || loading}
                            />
                        </div>
                    </div>
                )}
            </div>

            {/* Content */}
            <div className="list-content">
                {(isLoading || loading) ? (
                    <div className="loading-container">
                        <div className="loading-spinner" style={{ color: 'var(--color-accent)' }}></div>
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
                                            <span className="value">{capitalizeText(order.event_name)}</span>
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
                                        {activeTab === 'RECUSADA' && order.justification_reason && (
                                            <>
                                                <div className="info-row">
                                                    <span className="label">Motivo da Recusa:</span>
                                                    <span className="value justification-reason">{capitalizeText(order.justification_reason)}</span>
                                                </div>
                                                {order.justification_refusal && (
                                                    <div className="info-row">
                                                        <span className="label">Justificativa da Recusa:</span>
                                                        <span className="value justification-refusal">{capitalizeText(order.justification_refusal)}</span>
                                                    </div>
                                                )}
                                            </>
                                        )}
                                        {activeTab === 'ATRASADO' && order.justificativa_atraso && (
                                            <div className="info-row">
                                                <span className="label">Motivo do Atraso:</span>
                                                <span className="value justification-delay">{capitalizeText(order.justificativa_atraso)}</span>
                                            </div>
                                        )}
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
                                                    onClick={(e) => openPickupModal(order, e)}
                                                    title="Marcar como retirada"
                                                >
                                                    <i className="bi bi-box-arrow-right"></i>
                                                </button>
                                            </>
                                        )}
                                        {activeTab === 'AGUARDANDO_DEVOLUCAO' && (
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
                                        {activeTab === 'ATRASADO' && (
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
                                                    className="action-btn return"
                                                    onClick={(e) => handleMarkAsReturned(order, e)}
                                                    title="Marcar como devolvida"
                                                >
                                                    <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                                                        <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z" />
                                                    </svg>
                                                </button>
                                            </>
                                        )}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* Modal de Recusa */}
            <Modal
                show={showRefusalModal}
                onClose={closeRefusalModal}
                onCloseX={closeRefusalModal}
                title="Cancelar Ordem de Serviço"
                bodyContent={
                    <div>
                        <p style={{ marginBottom: '20px', color: 'var(--color-text-secondary)' }}>
                            Deseja cancelar a ordem de serviço #{selectedOrder?.id}?
                        </p>

                        <div className="form-group mb-3">
                            <label htmlFor="refusal-reason" className="form-label">
                                Motivo da recusa:
                            </label>
                            <CustomSelect
                                options={refusalReasonOptions}
                                value={selectedReasonId}
                                onChange={setSelectedReasonId}
                                placeholder="Selecione um motivo"
                            />
                        </div>

                        <div className="form-group">
                            <label htmlFor="refusal-justification" className="form-label">
                                Justificativa do cancelamento (opcional):
                            </label>
                            <textarea
                                id="refusal-justification"
                                className="form-textarea"
                                placeholder="Digite o motivo do cancelamento (opcional)..."
                                value={refusalJustification}
                                onChange={(e) => setRefusalJustification(e.target.value)}
                                rows={4}
                            />
                        </div>

                        <div className="form-actions">
                            <Button
                                variant="outline"
                                text="Cancelar"
                                onClick={closeRefusalModal}
                            />
                            <Button
                                variant="danger"
                                text="Sim, cancelar ordem"
                                onClick={handleRefusalSubmit}
                            />
                        </div>
                    </div>
                }
            />

            {/* Modal de Retirada */}
            <Modal
                show={showPickupModal}
                onClose={closePickupModal}
                onCloseX={closePickupModal}
                title="Confirmar Retirada"
                bodyContent={
                    <div>
                        <div style={{ 
                            background: 'linear-gradient(135deg, #CBA135 0%, #e2d502 100%)', 
                            color: 'white', 
                            padding: '16px', 
                            borderRadius: '8px', 
                            marginBottom: '20px',
                            textAlign: 'center'
                        }}>
                            <h4 style={{ margin: '0 0 8px 0', fontSize: '18px' }}>
                                🎉 Ordem #{pickupOrder?.id} - Retirada
                            </h4>
                            <p style={{ margin: '0', fontSize: '14px', opacity: '0.9' }}>
                                Cliente: {capitalizeText(pickupOrder?.client?.name)}
                            </p>
                        </div>

                        {pickupOrder?.remaining_payment > 0 && (
                            <div style={{ 
                                border: '2px solid #ff9800', 
                                borderRadius: '8px', 
                                padding: '16px', 
                                marginBottom: '20px',
                                backgroundColor: '#fff8e1'
                            }}>
                                <div style={{ 
                                    display: 'flex', 
                                    alignItems: 'center', 
                                    marginBottom: '12px',
                                    color: '#e65100'
                                }}>
                                    <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor" style={{ marginRight: '8px' }}>
                                        <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
                                    </svg>
                                    <strong>Valor Restante para Receber</strong>
                                </div>
                                <div style={{ 
                                    fontSize: '20px', 
                                    fontWeight: 'bold', 
                                    color: '#e65100',
                                    marginBottom: '12px'
                                }}>
                                    {formatCurrency(pickupOrder.remaining_payment)}
                                </div>
                                
                                <div className="form-group mb-3">
                                    <label style={{ 
                                        display: 'flex', 
                                        alignItems: 'center', 
                                        cursor: 'pointer',
                                        fontSize: '14px',
                                        fontWeight: '500'
                                    }}>
                                        <input
                                            type="checkbox"
                                            checked={receiveRemainingPayment}
                                            onChange={(e) => {
                                                setReceiveRemainingPayment(e.target.checked);
                                                if (!e.target.checked) {
                                                    setPaymentMethod('');
                                                }
                                            }}
                                            style={{ 
                                                marginRight: '8px',
                                                transform: 'scale(1.2)'
                                            }}
                                        />
                                        <span>Receber valor restante agora</span>
                                    </label>
                                </div>

                                {receiveRemainingPayment && (
                                    <div className="form-group">
                                        <label className="form-label">
                                            Forma de Pagamento <span style={{ color: '#f44336' }}>*</span>
                                        </label>
                                        <CustomSelect
                                            value={paymentMethod}
                                            onChange={setPaymentMethod}
                                            options={[
                                                { value: '', label: 'Selecione a forma de pagamento' },
                                                { value: 'credito', label: '💳 Crédito' },
                                                { value: 'debito', label: '💳 Débito' },
                                                { value: 'pix', label: '📱 PIX' },
                                                { value: 'dinheiro', label: '💵 Dinheiro' },
                                                { value: 'voucher', label: '🎫 Voucher' }
                                            ]}
                                            placeholder="Selecione a forma de pagamento"
                                        />
                                    </div>
                                )}
                            </div>
                        )}

                        <div style={{ 
                            background: '#f5f5f5', 
                            padding: '12px', 
                            borderRadius: '6px', 
                            marginBottom: '20px',
                            fontSize: '14px',
                            color: 'var(--color-text-secondary)'
                        }}>
                            <strong>Confirmação:</strong> Ao confirmar, a ordem será marcada como retirada 
                            {pickupOrder?.remaining_payment > 0 && receiveRemainingPayment && ' e o pagamento restante será registrado'}.
                        </div>

                        <div className="form-actions">
                            <Button
                                variant="outline"
                                text="Cancelar"
                                onClick={closePickupModal}
                                disabled={isProcessingPickup}
                            />
                            <Button
                                variant="primary"
                                text={isProcessingPickup ? "Processando..." : "Confirmar Retirada"}
                                onClick={handlePickupSubmit}
                                disabled={isProcessingPickup}
                                style={{ 
                                    background: 'linear-gradient(135deg, #CBA135 0%, #e2d502 100%)',
                                    border: 'none'
                                }}
                            />
                        </div>
                    </div>
                }
            />
        </div>
    );
};

export default ServiceOrderList; 