import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import '../styles/EventoDetalhes.css';
import Header from '../components/Header';
import eventService from '../services/eventService';
import { capitalizeText } from '../utils/capitalizeText';
import Button from '../components/Button';

const EventoDetalhes = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [evento, setEvento] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        if (id) {
            loadEvento();
        }
    }, [id]);

    const loadEvento = async () => {
        setIsLoading(true);
        setError(null);
        try {
            const data = await eventService.buscarEventoPorId(id);
            setEvento(data);
        } catch (error) {
            console.error('Erro ao carregar evento:', error);
            setError('Não foi possível carregar os detalhes do evento. Tente novamente.');
        } finally {
            setIsLoading(false);
        }
    };

    const formatDate = (dateString) => {
        if (!dateString) return '-';
        const date = new Date(dateString);
        return date.toLocaleDateString('pt-BR', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    const formatEventDate = (dateString) => {
        if (!dateString) return '-';
        const date = new Date(dateString);
        return date.toLocaleDateString('pt-BR', {
            weekday: 'long',
            day: '2-digit',
            month: 'long',
            year: 'numeric'
        });
    };


    const handleVoltar = () => {
        navigate('/eventos');
    };

    if (isLoading) {
        return (
            <>
                <Header nomeHeader="Detalhes do Evento" />
                <div className="evento-detalhes-container">
                    <div className="loading-state">
                        <div className="spinner" style={{ color: 'var(--color-accent)' }}></div>
                        <p>Carregando detalhes do evento...</p>
                    </div>
                </div>
            </>
        );
    }

    if (error) {
        return (
            <>
                <Header nomeHeader="Detalhes do Evento" />
                <div className="evento-detalhes-container">
                    <div className="error-state">
                        <i className="bi bi-exclamation-triangle"></i>
                        <h3>Erro ao carregar evento</h3>
                        <p>{error}</p>
                        <div className="error-actions">
                            <button className="btn-retry" onClick={loadEvento}>
                                <i className="bi bi-arrow-clockwise"></i>
                                Tentar novamente
                            </button>
                            <button className="btn-back" onClick={handleVoltar}>
                                <i className="bi bi-arrow-left"></i>
                                Voltar para eventos
                            </button>
                        </div>
                    </div>
                </div>
            </>
        );
    }

    if (!evento) {
        return (
            <>
                <Header nomeHeader="Detalhes do Evento" />
                <div className="evento-detalhes-container">
                    <div className="no-results">
                        <i className="bi bi-calendar-event"></i>
                        <h3>Evento não encontrado</h3>
                        <p>O evento solicitado não foi encontrado.</p>
                        <button className="btn-back" onClick={handleVoltar}>
                            <i className="bi bi-arrow-left"></i>
                            Voltar para eventos
                        </button>
                    </div>
                </div>
            </>
        );
    }

    return (
        <>
            <Header nomeHeader="Detalhes do Evento" />
            <div className="evento-detalhes-container">
                {/* Header com ações */}
                <div className="evento-header">
                <Button text="Voltar para eventos" onClick={handleVoltar} variant="primary" iconName="arrow-left" iconPosition="left" />
                </div>

                {/* Informações principais do evento */}
                <div className="evento-info-card">
                    <div className="evento-info-header">
                        <div className="evento-title-section d-flex flex-row justify-content-between align-items-center">
                            <h1 className="evento-title">
                                {evento.name ? capitalizeText(evento.name) : 'Evento sem nome'}
                            </h1>
                            <div className="evento-id">OS-{evento.id}</div>
                        </div>
                        <div className="evento-status">
                            <span className={`status-badge status-${evento.status?.toLowerCase().replace(' ', '-') || 'open'}`}>
                                {evento.status || 'Em Aberto'}
                            </span>
                        </div>
                    </div>

                    <div className="evento-description">
                        <h3>Descrição</h3>
                        <p>{evento.description || 'Sem descrição disponível'}</p>
                    </div>

                    <div className="evento-metadata">
                        <div className="metadata-item">
                            <i className="bi bi-calendar-event"></i>
                            <div>
                                <span className="metadata-label">Data do Evento</span>
                                <span className="metadata-value">{formatEventDate(evento.event_date)}</span>
                            </div>
                        </div>
                        <div className="metadata-item">
                            <i className="bi bi-calendar-plus"></i>
                            <div>
                                <span className="metadata-label">Criado em</span>
                                <span className="metadata-value">{formatDate(evento.date_created)}</span>
                            </div>
                        </div>
                        <div className="metadata-item">
                            <i className="bi bi-pencil"></i>
                            <div>
                                <span className="metadata-label">Atualizado em</span>
                                <span className="metadata-value">{formatDate(evento.date_updated)}</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Lista de ordens de serviço */}
                <div className="ordens-servico-card">
                    <div className="card-header">
                        <h2>
                            <i className="bi bi-clipboard-check"></i>
                            Ordens de Serviço ({evento.service_orders_count || 0})
                        </h2>
                    </div>

                    <div className="ordens-servico-content">
                        {!evento.service_orders || evento.service_orders.length === 0 ? (
                            <div className="no-ordens">
                                <i className="bi bi-clipboard-x"></i>
                                <p>Nenhuma ordem de serviço vinculada</p>
                            </div>
                        ) : (
                            <div className="ordens-servico-list">
                                {evento.service_orders.map((ordem, index) => (
                                    <div key={ordem.id || index} className="ordem-item" onClick={() => navigate(`/ordens/${ordem.id}`)}>
                                        <div className="ordem-header">
                                            <div className="ordem-numero d-flex flex-column">
                                                <h4 className="ordem-numero-id mb-3">OS-{ordem.id}</h4>
                                                <span className="ordem-cliente mb-2">Cliente: {capitalizeText(ordem.client_name)}</span>
                                                <span className="ordem-cliente mb-2">Criado em: {formatDate(ordem.date_created)}</span>
                                            </div>
                                        </div>

                                        <div className="ordem-details d-flex flex-column">
                                            <div className="ordem-detail">
                                                <i className="bi bi-cash"></i>
                                                <span>Total: R$ {parseFloat(ordem.total_value).toFixed(2)}</span>
                                            </div>
                                            <div className="ordem-detail">
                                                <i className="bi bi-clipboard-data"></i>
                                                <span>Fase: {capitalizeText(ordem.phase)}</span>
                                            </div>
                                        </div>

                                        <div className="ordem-arrow d-flex flex-row justify-content-center align-items-center">
                                            <i className="bi bi-arrow-right"></i>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </>
    );
};

export default EventoDetalhes;
