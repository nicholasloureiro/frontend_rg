import React, { useState } from 'react';
import Modal from './Modal';
import Button from './Button';
import InputDate from './InputDate';
import eventService from '../services/eventService';

const CreateEventModal = ({ show, onClose, onEventCreated }) => {
    const [formData, setFormData] = useState({
        name: '',
        description: '',
        event_date: ''
    });
    const [selectedDate, setSelectedDate] = useState(null);
    const [isLoading, setIsLoading] = useState(false);
    const [errors, setErrors] = useState({});

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
        
        // Limpar erro do campo quando o usuário começar a digitar
        if (errors[name]) {
            setErrors(prev => ({
                ...prev,
                [name]: ''
            }));
        }
    };

    const handleDateChange = (date) => {
        setSelectedDate(date);
        const isoDate = date ? date.toISOString().split('T')[0] : '';
        setFormData(prev => ({
            ...prev,
            event_date: isoDate
        }));
        
        // Limpar erro do campo quando o usuário selecionar uma data
        if (errors.event_date) {
            setErrors(prev => ({
                ...prev,
                event_date: ''
            }));
        }
    };

    const validateForm = () => {
        const newErrors = {};

        if (!formData.name.trim()) {
            newErrors.name = 'Nome do evento é obrigatório';
        }

        if (!formData.description.trim()) {
            newErrors.description = 'Descrição é obrigatória';
        }

        if (!formData.event_date) {
            newErrors.event_date = 'Data do evento é obrigatória';
        } else {
            const eventDate = new Date(formData.event_date);
            const today = new Date();
            today.setHours(0, 0, 0, 0);
            
            if (eventDate < today) {
                newErrors.event_date = 'A data do evento não pode ser no passado';
            }
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        if (!validateForm()) {
            return;
        }

        setIsLoading(true);
        try {
            await eventService.criarEvento(formData);
            
            // Resetar formulário
            setFormData({
                name: '',
                description: '',
                event_date: ''
            });
            setSelectedDate(null);
            setErrors({});
            
            // Fechar modal e notificar sucesso
            onClose();
            if (onEventCreated) {
                onEventCreated();
            }
        } catch (error) {
            console.error('Erro ao criar evento:', error);
            setErrors({ submit: 'Erro ao criar evento. Tente novamente.' });
        } finally {
            setIsLoading(false);
        }
    };

    const handleClose = () => {
        if (!isLoading) {
            setFormData({
                name: '',
                description: '',
                event_date: ''
            });
            setSelectedDate(null);
            setErrors({});
            onClose();
        }
    };

    const bodyContent = (
        <form onSubmit={handleSubmit} className="create-event-form">
            <div className="form-group">
                <label htmlFor="name" className="form-label">
                    Nome do Evento *
                </label>
                <input
                    type="text"
                    id="name"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    className={`form-input ${errors.name ? 'error' : ''}`}
                    placeholder="Digite o nome do evento"
                    disabled={isLoading}
                />
                {errors.name && <span className="error-message">{errors.name}</span>}
            </div>

            <div className="form-group">
                <label htmlFor="description" className="form-label">
                    Descrição *
                </label>
                <textarea
                    id="description"
                    name="description"
                    value={formData.description}
                    onChange={handleInputChange}
                    className={`form-textarea ${errors.description ? 'error' : ''}`}
                    placeholder="Digite a descrição do evento"
                    rows="4"
                    disabled={isLoading}
                />
                {errors.description && <span className="error-message">{errors.description}</span>}
            </div>

            <div className="form-group">
                <label htmlFor="event_date" className="form-label">
                    Data do Evento *
                </label>
                <InputDate
                    selectedDate={selectedDate}
                    onDateChange={handleDateChange}
                    placeholderText="Selecione a data do evento"
                    disabled={isLoading}
                    className={errors.event_date ? 'error' : ''}
                />
                {errors.event_date && <span className="error-message">{errors.event_date}</span>}
            </div>

            {errors.submit && (
                <div className="error-message submit-error">
                    {errors.submit}
                </div>
            )}

            <div className="form-actions">
                <Button
                    type="button"
                    text="Cancelar"
                    variant="outline"
                    onClick={handleClose}
                    disabled={isLoading}
                />
                <Button
                    type="submit"
                    text={isLoading ? "Criando..." : "Criar Evento"}
                    variant="primary"
                    iconName="plus"
                    iconPosition="left"
                    disabled={isLoading}
                />
            </div>
        </form>
    );

    return (
        <Modal
            show={show}
            onClose={handleClose}
            onCloseX={handleClose}
            title="Criar Novo Evento"
            bodyContent={bodyContent}
        />
    );
};

export default CreateEventModal;
