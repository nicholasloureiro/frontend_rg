import React, { useState } from 'react';
import PhoneInput from 'react-phone-number-input';
import 'react-phone-number-input/style.css';
import Header from '../components/Header';
import Button from '../components/Button';
import InputDate from '../components/InputDate';
import { mascaraCPF, mascaraCEP, removerMascara } from '../utils/Mascaras';
import validarCPF from '../utils/ValidarCPF';
import '../styles/Triagem.css';

const Triagem = () => {
    const [formData, setFormData] = useState({
        nomeCliente: '',
        telefone: '',
        cpf: '',
        cep: '',
        rua: '',
        bairro: '',
        cidade: '',
        numero: '',
        atendenteResponsavel: '',
        origem: '',
        evento: '',
        papelNoEvento: '',
        dataEvento: null,
        tipoServico: ''
    });

    const [errors, setErrors] = useState({});
    const [loading, setLoading] = useState(false);
    const [cepLoading, setCepLoading] = useState(false);

    // Opções para os selects
    const opcoesAtendentes = [
        { value: '', label: 'Selecione um atendente' },
        { value: 'maria', label: 'Maria Silva' },
        { value: 'joao', label: 'João Santos' },
        { value: 'ana', label: 'Ana Costa' },
        { value: 'pedro', label: 'Pedro Oliveira' }
    ];

    const opcoesOrigem = [
        { value: '', label: 'Selecione a origem' },
        { value: 'site', label: 'Site' },
        { value: 'instagram', label: 'Instagram' },
        { value: 'facebook', label: 'Facebook' },
        { value: 'indicacao', label: 'Indicação' },
        { value: 'outro', label: 'Outro' }
    ];

    const opcoesPapel = [
        { value: '', label: 'Selecione o papel' },
        { value: 'noivo', label: 'Noivo' },
        { value: 'noiva', label: 'Noiva' },
        { value: 'padrinho', label: 'Padrinho' },
        { value: 'madrinha', label: 'Madrinha' },
        { value: 'pais', label: 'Pais' },
        { value: 'familia', label: 'Família' },
        { value: 'outro', label: 'Outro' }
    ];

    const opcoesTipoServico = [
        { value: '', label: 'Selecione o tipo de serviço' },
        { value: 'aluguel', label: 'Aluguel' },
        { value: 'venda', label: 'Venda' }
    ];

    // Função para buscar CEP
    const buscarCEP = async (cep) => {
        const cepLimpo = removerMascara(cep);
        if (cepLimpo.length !== 8) return;

        setCepLoading(true);
        try {
            const response = await fetch(`https://viacep.com.br/ws/${cepLimpo}/json/`);
            const data = await response.json();

            if (!data.erro) {
                setFormData(prev => ({
                    ...prev,
                    rua: data.logradouro || '',
                    bairro: data.bairro || '',
                    cidade: data.localidade || ''
                }));
            }
        } catch (error) {
            console.error('Erro ao buscar CEP:', error);
        } finally {
            setCepLoading(false);
        }
    };

    // Função para validar CPF
    const validarCPFCampo = (cpf) => {
        const cpfLimpo = removerMascara(cpf);
        if (cpfLimpo.length === 11) {
            return validarCPF(cpfLimpo);
        }
        return true;
    };

    // Função para validar campos obrigatórios
    const validarCampos = () => {
        const novosErros = {};

        if (!formData.nomeCliente.trim()) {
            novosErros.nomeCliente = 'Nome do cliente é obrigatório';
        }

        if (!formData.telefone) {
            novosErros.telefone = 'Telefone é obrigatório';
        }

        if (formData.cpf && !validarCPFCampo(formData.cpf)) {
            novosErros.cpf = 'CPF inválido';
        }

        if (!formData.atendenteResponsavel) {
            novosErros.atendenteResponsavel = 'Atendente responsável é obrigatório';
        }

        if (!formData.origem) {
            novosErros.origem = 'Origem é obrigatória';
        }

        setErrors(novosErros);
        return Object.keys(novosErros).length === 0;
    };

    // Função para salvar formulário
    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!validarCampos()) {
            return;
        }

        setLoading(true);

        // Simular envio para API
        setTimeout(() => {
            console.log('Dados do formulário:', formData);
            alert('Triagem salva com sucesso!');
            setLoading(false);
        }, 1000);
    };

    // Função para atualizar campos
    const handleInputChange = (field, value) => {
        setFormData(prev => ({
            ...prev,
            [field]: value
        }));

        if (errors[field]) {
            setErrors(prev => ({
                ...prev,
                [field]: ''
            }));
        }
    };

    // Função para aplicar máscara de CPF
    const handleCPFChange = (e) => {
        const value = e.target.value;
        const maskedValue = mascaraCPF(value);
        handleInputChange('cpf', maskedValue);
    };

    // Função para aplicar máscara de CEP
    const handleCEPChange = (e) => {
        const value = e.target.value;
        const maskedValue = mascaraCEP(value);
        handleInputChange('cep', maskedValue);

        if (removerMascara(value).length === 8) {
            buscarCEP(maskedValue);
        }
    };

    // Componente para renderizar campo de input
    const renderInput = (id, label, type = 'text', placeholder = '', required = false, maxLength = null) => (
        <div className="form-group">
            <label htmlFor={id} className="form-label">
                {label} {required && '*'}
            </label>
            <input
                type={type}
                id={id}
                className={`form-input ${errors[id] ? 'error' : ''}`}
                value={formData[id]}
                onChange={(e) => handleInputChange(id, e.target.value)}
                placeholder={placeholder}
                maxLength={maxLength}
            />
            {errors[id] && (
                <span className="error-message">{errors[id]}</span>
            )}
        </div>
    );

    // Componente para renderizar select
    const renderSelect = (id, label, options, required = false) => (
        <div className="form-group">
            <label htmlFor={id} className="form-label">
                {label} {required && '*'}
            </label>
            <select
                id={id}
                className={`form-select ${errors[id] ? 'error' : ''}`}
                value={formData[id]}
                onChange={(e) => handleInputChange(id, e.target.value)}
            >
                {options.map(option => (
                    <option key={option.value} value={option.value}>
                        {option.label}
                    </option>
                ))}
            </select>
            {errors[id] && (
                <span className="error-message">{errors[id]}</span>
            )}
        </div>
    );

    return (
        <div className="triagem-container">
            <Header nomeHeader="Triagem" />

            <div className="triagem-content">
                <div className="triagem-card">

                    <form onSubmit={handleSubmit} className="triagem-form">
                        {/* Seção: Dados do Cliente */}
                        <div className="form-section">
                            <h3 className="section-title">Dados do Cliente</h3>

                            <div className="form-row">
                                {renderInput('nomeCliente', 'Nome do Cliente', 'text', 'Digite o nome completo', true)}

                                <div className="form-group">
                                    <label htmlFor="telefone" className="form-label">
                                        Telefone *
                                    </label>
                                    <PhoneInput
                                        international
                                        defaultCountry="BR"
                                        value={formData.telefone}
                                        onChange={(value) => handleInputChange('telefone', value)}
                                        className={`phone-input ${errors.telefone ? 'error' : ''}`}
                                        placeholder="Digite o telefone"
                                    />
                                    {errors.telefone && (
                                        <span className="error-message">{errors.telefone}</span>
                                    )}
                                </div>
                            </div>

                            <div className="form-row">
                                {renderInput('cpf', 'CPF', 'text', '000.000.000-00', false, 14)}

                                <div className="form-group">
                                    <label htmlFor="cep" className="form-label">
                                        CEP
                                    </label>
                                    <div className="cep-container">
                                        <input
                                            type="text"
                                            id="cep"
                                            className="form-input"
                                            value={formData.cep}
                                            onChange={handleCEPChange}
                                            placeholder="00000-000"
                                            maxLength="9"
                                        />
                                        {cepLoading && (
                                            <div className="cep-loading">
                                                <i className="bi bi-arrow-clockwise"></i>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>

                            <div className="form-row">
                                {renderInput('rua', 'Rua', 'text', 'Nome da rua')}
                                {renderInput('numero', 'Número', 'text', 'Número')}
                            </div>

                            <div className="form-row">
                                {renderInput('bairro', 'Bairro', 'text', 'Nome do bairro')}
                                {renderInput('cidade', 'Cidade', 'text', 'Nome da cidade')}
                            </div>
                        </div>

                        {/* Seção: Informações do Evento */}
                        <div className="form-section mb-0">
                            <h3 className="section-title">Informações do Evento</h3>

                            <div className="form-row">
                                {renderSelect('atendenteResponsavel', 'Atendente Responsável', opcoesAtendentes, true)}
                                {renderSelect('origem', 'Origem', opcoesOrigem, true)}
                            </div>

                            <div className="form-row">
                                {renderInput('evento', 'Evento', 'text', 'Nome do evento')}
                                {renderSelect('papelNoEvento', 'Papel no Evento', opcoesPapel)}
                            </div>

                            <div className="form-row">
                                <div className="form-group">
                                    <label htmlFor="dataEvento" className="form-label">
                                        Data do Evento
                                    </label>
                                    <InputDate
                                        selectedDate={formData.dataEvento}
                                        onDateChange={(date) => handleInputChange('dataEvento', date)}
                                        placeholderText="Selecione a data"
                                    />
                                </div>

                                {renderSelect('tipoServico', 'Tipo de Serviço', opcoesTipoServico)}
                            </div>
                        </div>
                        <Button
                            text={loading ? "Salvando..." : "Salvar Triagem"}
                            type="submit"
                            variant="primary"
                            disabled={loading}
                            iconName={loading ? "arrow-clockwise" : "check-circle"}
                            className="save-button"
                            style={{ width: 'fit-content', marginLeft: 'auto'}}
                        />

                    </form>
                </div>
            </div>
        </div>
    );
};

export default Triagem;

