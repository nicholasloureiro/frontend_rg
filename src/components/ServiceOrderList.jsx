import React, { useState, useEffect } from 'react';
import { serviceOrderService } from '../services/serviceOrderService';
import '../styles/ServiceOrderList.css';
import { capitalizeText } from '../utils/capitalizeText';
import { mascaraTelefoneInternacional } from '../utils/Mascaras';
import Button from './Button';

const ServiceOrderList = ({ onSelectOrder, onCreateNew, isLoading, error, onRetry }) => {
    const [activeTab, setActiveTab] = useState('PENDENTE');
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(false);
    const [internalError, setInternalError] = useState(null);

    const tabs = [
        { key: 'PENDENTE', label: 'PENDENTE', color: '#ff9800' },
        { key: 'ATRASADO', label: 'ATRASADO', color: '#f44336' },
        { key: 'RECUSADA', label: 'RECUSADA', color: '#9e9e9e' },        
        { key: 'FINALIZADO', label: 'FINALIZADO', color: '#4caf50' },
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
                <Button 
                    text="Nova Ordem" 
                    onClick={onCreateNew} 
                    variant="primary" 
                    iconName="plus" 
                    iconPosition="left"
                    style={{ width: 'fit-content' }}
                />
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
                            <path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-5 14H7v-2h7v2zm3-4H7v-2h10v2zm0-4H7V7h10v2z"/>
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
                                        <button className="action-btn edit">
                                            <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                                                <path d="M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25zM20.71 7.04c.39-.39.39-1.02 0-1.41l-2.34-2.34c-.39-.39-1.02-.39-1.41 0l-1.83 1.83 3.75 3.75 1.83-1.83z"/>
                                            </svg>
                                        </button>
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