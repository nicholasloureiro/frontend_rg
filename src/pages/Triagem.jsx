import React, { useState } from 'react';
import PhoneInput from 'react-phone-number-input';
import 'react-phone-number-input/style.css';
import Header from '../components/Header';
import Button from '../components/Button';
import InputDate from '../components/InputDate';
import CustomSelect from '../components/CustomSelect';
import CreateEventModal from '../components/CreateEventModal';
import { mascaraCPF, mascaraCEP, removerMascara } from '../utils/Mascaras';
import validarCPF from '../utils/ValidarCPF';
import { triagemService } from '../services/triagemService';
import { getEmployees } from '../services/employeeService';
import { clientService } from '../services/clientService';
import eventService from '../services/eventService';
import { capitalizeText } from '../utils/capitalizeText';
import Swal from 'sweetalert2';
import '../styles/Triagem.css';

const Triagem = () => {
    const [formData, setFormData] = useState({
        nomeCliente: '',
        telefone: '',
        cpf: '',
        isInfant: false,
        cep: '',
        rua: '',
        bairro: '',
        cidade: '',
        numero: '',
        complemento: '',
        email: '',
        atendenteResponsavel: '',
        origem: '',
        event_id: '',
        papelNoEvento: '',
        dataEvento: null
    });

    const [errors, setErrors] = useState({});
    const [loading, setLoading] = useState(false);
    const [cepLoading, setCepLoading] = useState(false);
    const [atendentes, setAtendentes] = useState([]);
    const [loadingAtendentes, setLoadingAtendentes] = useState(false);
    const [eventos, setEventos] = useState([]);
    const [loadingEventos, setLoadingEventos] = useState(false);
    const [showCreateEventModal, setShowCreateEventModal] = useState(false);
    const [cpfValido, setCpfValido] = useState(true);
    const [emailValido, setEmailValido] = useState(true);
    const [buscandoCliente, setBuscandoCliente] = useState(false);

    // Função para carregar atendentes da API
    const carregarAtendentes = async () => {
        setLoadingAtendentes(true);
        try {
            const funcionarios = await getEmployees();
            // Garante que funcionarios sempre será um array
            const listaFuncionarios = Array.isArray(funcionarios) ? funcionarios : [];
            // Filtrar apenas funcionários com role ATENDENTE ou ADMINISTRADOR e que estejam ativos
            const atendentesFiltrados = listaFuncionarios.filter(func => 
                (func.role === 'ATENDENTE' || func.role === 'ADMINISTRADOR') && func.active === true
            );
            setAtendentes(atendentesFiltrados);
        } catch (error) {
            console.error('Erro ao carregar atendentes:', error);

        } finally {
            setLoadingAtendentes(false);
        }
    };

    // Função para carregar eventos abertos da API
    const carregarEventos = async () => {
        setLoadingEventos(true);
        try {
            const eventosData = await eventService.listarEventosAbertos();
            // Garante que eventos sempre será um array
            const listaEventos = Array.isArray(eventosData) ? eventosData : [];
            setEventos(listaEventos);
        } catch (error) {
            console.error('Erro ao carregar eventos:', error);
        } finally {
            setLoadingEventos(false);
        }
    };

    // Função para abrir modal de criar evento
    const handleOpenCreateEventModal = () => {
        setShowCreateEventModal(true);
    };

    // Função para fechar modal de criar evento
    const handleCloseCreateEventModal = () => {
        setShowCreateEventModal(false);
    };

    // Função para atualizar lista após criar evento
    const handleEventCreated = () => {
        carregarEventos();
    };

    // Carregar atendentes e eventos quando o componente montar
    React.useEffect(() => {
        carregarAtendentes();
        carregarEventos();
    }, []);

    // Opções para os selects
    const opcoesAtendentes = [
        { value: '', label: loadingAtendentes ? 'Carregando...' : 'Selecione um atendente' },
        ...atendentes.map(atendente => ({
            value: atendente.id,
            label: capitalizeText(atendente.name)
        }))
    ];

    const opcoesOrigem = [
        { value: '', label: 'Selecione a origem' },
        { value: 'cliente', label: 'Cliente' },
        { value: 'site', label: 'Site' },
        { value: 'instagram', label: 'Instagram' },        
        { value: 'facebook', label: 'Facebook' },
        { value: 'google', label: 'Google' },
        { value: 'indicacao', label: 'Indicação' },
        { value: 'lista', label: 'Lista' },
        { value: 'outro', label: 'Outro' }
    ];

    const opcoesPapel = [
        { value: '', label: 'Selecione o papel' },
        { value: 'noivo', label: 'Noivo' },
        { value: 'padrinho', label: 'Padrinho' },
        { value: 'pais_noivos', label: 'Pais Noivos' },
        { value: 'pajem', label: 'Pajem' },
        { value: 'convidados', label: 'Convidados' },
        { value: 'formando', label: 'Formando' },
        { value: 'pais_formando', label: 'Pais Formando' },
        { value: 'principe', label: 'Príncipe' },
        { value: 'pais_debutante', label: 'Pais Debutante' },
        { value: 'uso_diario', label: 'Uso Diário' },
        { value: 'feminino', label: 'Feminino' },
        { value: 'fotos', label: 'Fotos' },
        { value: 'outro', label: 'Outros' }
    ];

    const opcoesEventos = [
        { value: '', label: loadingEventos ? 'Carregando...' : 'Selecione um evento' },
        ...eventos.map(evento => ({
            value: evento.id,
            label: evento.name
        }))
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

    // Função para validar email
    const validarEmail = (email) => {
        if (!email.trim()) {
            return true; // Email vazio é válido (não obrigatório)
        }
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    };

    // Função para validar campos obrigatórios
    const validarCampos = () => {
        const novosErros = {};

        // Nome do cliente é obrigatório
        if (!formData.nomeCliente.trim()) {
            novosErros.nomeCliente = 'Nome do cliente é obrigatório';
        }

        // Origem é obrigatória
        if (!formData.origem.trim()) {
            novosErros.origem = 'Origem é obrigatória';
        }

        // Papel no evento é obrigatório
        if (!formData.papelNoEvento.trim()) {
            novosErros.papelNoEvento = 'Papel no evento é obrigatório';
        }

        // Validações opcionais (só validam se o campo estiver preenchido e não for criança)
        if (!formData.isInfant && formData.cpf && !cpfValido) {
            novosErros.cpf = 'CPF inválido';
        }

        if (formData.email && !emailValido) {
            novosErros.email = 'Email inválido';
        }

        setErrors(novosErros);
        return Object.keys(novosErros).length === 0;
    };

    // Função para formatar data para o formato da API (YYYY-MM-DD)
    const formatarDataParaAPI = (data) => {
        if (!data) return null;
        const dataObj = new Date(data);
        return dataObj.toISOString().split('T')[0];
    };

    // Função para preparar dados para a API
    const prepararDadosParaAPI = () => {
        return {
            cliente_nome: formData.nomeCliente.toUpperCase(),
            telefone: formData.telefone ? formData.telefone.replace(/\D/g, '') : null,
            email: formData.email || null,
            is_infant: formData.isInfant,
            cpf: formData.isInfant ? null : (formData.cpf ? removerMascara(formData.cpf) : null),
            atendente_id: formData.atendenteResponsavel ? parseInt(formData.atendenteResponsavel) : null,
            origem: formData.origem ? formData.origem.toUpperCase() : null,
            event_id: formData.event_id ? parseInt(formData.event_id) : null,
            papel_evento: formData.papelNoEvento ? formData.papelNoEvento.toUpperCase() : null,
            endereco: {
                cep: formData.cep ? removerMascara(formData.cep) : null,
                rua: formData.rua ? formData.rua.toUpperCase() : null,
                numero: formData.numero || null,
                complemento: formData.complemento ? formData.complemento.toUpperCase() : null,
                bairro: formData.bairro ? formData.bairro.toUpperCase() : null,
                cidade: formData.cidade ? formData.cidade.toUpperCase() : null
            }
        };
    };

    // Função para salvar formulário
    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!validarCampos()) {
            return;
        }

        setLoading(true);

        try {
            const dadosParaAPI = prepararDadosParaAPI();
            const response = await triagemService.criarTriagem(dadosParaAPI);

            Swal.fire({
                icon: 'success',
                title: 'Sucesso!',
                text: 'Triagem salva com sucesso!',
                confirmButtonText: 'OK',
                confirmButtonColor: '#3085d6'
            });

            // Limpar formulário após sucesso
            setFormData({
                nomeCliente: '',
                telefone: '',
                cpf: '',
                isInfant: false,
                cep: '',
                rua: '',
                bairro: '',
                cidade: '',
                numero: '',
                atendenteResponsavel: '',
                origem: '',
                event_id: '',
                papelNoEvento: '',
                dataEvento: null,
                complemento: '',
                email: ''
            });
            setErrors({});

        } catch (error) {
            console.error('Erro ao salvar triagem:', error);
            Swal.fire({
                icon: 'error',
                title: 'Erro!',
                text: 'Erro ao salvar triagem. Tente novamente.',
                confirmButtonText: 'OK',
                confirmButtonColor: '#d33'
            });
        } finally {
            setLoading(false);
        }
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

        // Resetar validação do CPF quando o campo for limpo
        if (field === 'cpf' && !value) {
            setCpfValido(true);
        }

        // Resetar validação do email quando o campo for limpo
        if (field === 'email' && !value) {
            setEmailValido(true);
        }

        // Quando marcar como criança, limpar CPF e resetar validação
        if (field === 'isInfant' && value === true) {
            setFormData(prev => ({
                ...prev,
                cpf: '',
                isInfant: true
            }));
            setCpfValido(true);
            if (errors.cpf) {
                setErrors(prev => ({
                    ...prev,
                    cpf: ''
                }));
            }
            return;
        }
    };

    // Função para buscar dados do cliente por CPF
    const buscarClientePorCPF = async (cpf) => {
        setBuscandoCliente(true);
        try {
            const cliente = await clientService.buscarPorCPF(cpf);

            if (cliente) {
                // Formatar o telefone para o componente PhoneInput
                let telefoneFormatado = '';
                if (cliente.phone) {
                    telefoneFormatado = cliente.phone.startsWith('+') ? cliente.phone : `+55${cliente.phone.substring(2)}`;
                }

                // Preencher os dados do formulário com os dados do cliente encontrado
                setFormData(prev => ({
                    ...prev,
                    nomeCliente: cliente.name || '',
                    telefone: telefoneFormatado,
                    cep: cliente.address?.cep || '',
                    rua: cliente.address?.street || '',
                    bairro: cliente.address?.neighborhood || '',
                    cidade: cliente.address?.city || '',
                    numero: cliente.address?.number || '',
                    complemento: cliente.address?.complement || '',
                    email: cliente.email || ''
                }));

                // Se o CEP foi preenchido, buscar dados do endereço
                if (cliente.address?.cep) {
                    const cepFormatado = mascaraCEP(cliente.address.cep);
                    buscarCEP(cepFormatado);
                }
            }
        } catch (error) {
            console.error('Erro ao buscar cliente:', error);
            // Não mostrar erro se o cliente não for encontrado (404)
            if (error.response?.status !== 404) {
                Swal.fire({
                    icon: 'error',
                    title: 'Erro!',
                    text: 'Erro ao buscar dados do cliente.',
                    toast: true,
                    position: 'top-end',
                    showConfirmButton: false,
                    timer: 3000
                });
            }
        } finally {
            setBuscandoCliente(false);
        }
    };

    // Função para aplicar máscara de CPF e validar
    const handleCPFChange = (e) => {
        // Se for criança, não processar CPF
        if (formData.isInfant) return;

        const value = e.target.value;
        const maskedValue = mascaraCPF(value);
        handleInputChange('cpf', maskedValue);

        // Validar CPF se tiver 11 dígitos
        const cpfLimpo = removerMascara(maskedValue);
        if (cpfLimpo.length === 11) {
            const ehValido = validarCPF(cpfLimpo);
            setCpfValido(ehValido);

            // Se o CPF for válido, buscar dados do cliente
            if (ehValido) {
                buscarClientePorCPF(cpfLimpo);
            }
        } else {
            setCpfValido(true); // Reset quando não tem 11 dígitos
        }
    };

    // Função para lidar com mudança do email e validação
    const handleEmailChange = (e) => {
        const value = e.target.value;
        handleInputChange('email', value);
    };

    // Função para validar email no onBlur
    const handleEmailBlur = (e) => {
        const email = e.target.value;
        const ehValido = validarEmail(email);
        setEmailValido(ehValido);
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
                autoComplete="off"
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
                disabled={id === 'atendenteResponsavel' && loadingAtendentes}
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
                            <h3 className="section-title mb-3">Dados do Cliente</h3>

                            {/* Primeira linha: CPF, Nome do Cliente, Telefone */}
                            <div className="form-row">
                                <div className="form-group">
                                    <label htmlFor="cpf" className="form-label">
                                        CPF
                                    </label>
                                    <div className="cpf-container">
                                        <input
                                            type="text"
                                            id="cpf"
                                            className={`form-input ${errors.cpf ? 'error' : ''}`}
                                            value={formData.isInfant ? '' : formData.cpf}
                                            onChange={handleCPFChange}
                                            placeholder={formData.isInfant ? 'Criança (sem CPF)' : '000.000.000-00'}
                                            autoComplete="off"
                                            maxLength="14"
                                            disabled={buscandoCliente || formData.isInfant}
                                        />
                                        {buscandoCliente && (
                                            <div className="cpf-loading">
                                                <i className="bi bi-arrow-clockwise"></i>
                                            </div>
                                        )}
                                    </div>
                                    {errors.cpf && (
                                        <span className="error-message">{errors.cpf}</span>
                                    )}
                                    {formData.cpf && !cpfValido && !formData.isInfant && (
                                        <small className="error-message">CPF inválido</small>
                                    )}
                                    <div className="infant-checkbox" style={{ marginTop: '8px' }}>
                                        <label style={{ display: 'flex', alignItems: 'center', gap: '6px', cursor: 'pointer', fontSize: '12px', color: 'var(--color-text-secondary)' }}>
                                            <input
                                                type="checkbox"
                                                checked={formData.isInfant}
                                                onChange={(e) => handleInputChange('isInfant', e.target.checked)}
                                                style={{ cursor: 'pointer' }}
                                            />
                                            Cliente é criança (sem CPF)
                                        </label>
                                    </div>
                                </div>

                                {renderInput('nomeCliente', 'Nome do Cliente', 'text', 'Digite o nome completo', true)}

                                <div className="form-group">
                                    <label htmlFor="telefone" className="form-label">
                                        Telefone
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

                            {/* Segunda linha: Email, CEP, Logradouro, Número */}
                            <div className="form-row form-row-four-fields">
                                <div className="form-group">
                                    <label htmlFor="email" className="form-label">
                                        E-mail
                                    </label>
                                    <input
                                        type="email"
                                        id="email"
                                        className={`form-input ${errors.email ? 'error' : ''}`}
                                        value={formData.email}
                                        onChange={handleEmailChange}
                                        onBlur={handleEmailBlur}
                                        placeholder="Digite o e-mail"
                                        autoComplete="off"
                                    />
                                    {errors.email && (
                                        <span className="error-message">{errors.email}</span>
                                    )}
                                    {formData.email && !emailValido && (
                                        <small className="error-message">Email inválido</small>
                                    )}
                                </div>

                                <div className="form-group cep-field">
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
                                            autoComplete="off"
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

                                {renderInput('rua', 'Logradouro', 'text', '')}

                                <div className="form-group numero-field">
                                    <label htmlFor="numero" className="form-label">
                                        Número
                                    </label>
                                    <input
                                        type="text"
                                        id="numero"
                                        className={`form-input ${errors.numero ? 'error' : ''}`}
                                        value={formData.numero}
                                        onChange={(e) => handleInputChange('numero', e.target.value)}
                                        placeholder=""
                                        autoComplete="off"
                                    />
                                    {errors.numero && (
                                        <span className="error-message">{errors.numero}</span>
                                    )}
                                </div>
                            </div>

                            {/* Quarta linha: Complemento, Bairro, Cidade */}
                            <div className="form-row">
                                {renderInput('complemento', 'Complemento', 'text', '')}
                                {renderInput('bairro', 'Bairro', 'text', '')}
                                {renderInput('cidade', 'Cidade', 'text', '')}
                            </div>
                        </div>

                        {/* Seção: Informações do Evento */}
                        <div className="form-section mb-0">
                            <h3 className="section-title mb-3">Informações do Evento</h3>

                            <div className="form-row">
                                <div className="form-group">
                                    <label htmlFor="atendenteResponsavel" className="form-label">
                                        Atendente Responsável
                                    </label>
                                    <CustomSelect
                                        options={opcoesAtendentes}
                                        value={formData.atendenteResponsavel}
                                        onChange={(value) => handleInputChange('atendenteResponsavel', value)}
                                        placeholder="Selecione um atendente"
                                        disabled={loadingAtendentes}
                                        error={errors.atendenteResponsavel}
                                    />
                                    {errors.atendenteResponsavel && (
                                        <span className="error-message">{errors.atendenteResponsavel}</span>
                                    )}
                                </div>
                                <div className="form-group">
                                    <label htmlFor="origem" className="form-label">
                                        Origem *
                                    </label>
                                    <CustomSelect
                                        options={opcoesOrigem}
                                        value={formData.origem}
                                        onChange={(value) => handleInputChange('origem', value)}
                                        placeholder="Selecione a origem"
                                        disabled={false}
                                        error={errors.origem}
                                    />
                                    {errors.origem && (
                                        <span className="error-message">{errors.origem}</span>
                                    )}
                                </div>
                            </div>

                            <div className="form-row">
                                <div className="form-group">
                                    <label htmlFor="event_id" className="form-label">
                                        Evento
                                    </label>
                                    <CustomSelect
                                        options={opcoesEventos}
                                        value={formData.event_id}
                                        onChange={(value) => handleInputChange('event_id', value)}
                                        placeholder="Selecione um evento"
                                        disabled={loadingEventos}
                                        error={errors.event_id}
                                    />
                                    {errors.event_id && (
                                        <span className="error-message">{errors.event_id}</span>
                                    )}
                                    <small
                                        className="create-event-link"
                                        onClick={handleOpenCreateEventModal}
                                        style={{
                                            color: 'var(--color-accent)',
                                            cursor: 'pointer',
                                            textDecoration: 'underline',
                                            fontSize: '12px',
                                            marginTop: '-5px',
                                            marginLeft: 'auto',
                                            display: 'block'
                                        }}
                                    >
                                        Criar novo evento
                                    </small>
                                </div>
                                <div className="form-group">
                                    <label htmlFor="papelNoEvento" className="form-label">
                                        Papel no Evento *
                                    </label>
                                    <CustomSelect
                                        options={opcoesPapel}
                                        value={formData.papelNoEvento}
                                        onChange={(value) => handleInputChange('papelNoEvento', value)}
                                        placeholder="Selecione o papel"
                                        disabled={false}
                                        error={errors.papelNoEvento}
                                    />
                                    {errors.papelNoEvento && (
                                        <span className="error-message">{errors.papelNoEvento}</span>
                                    )}
                                </div>
                            </div>
                        </div>
                        <Button
                            text={loading ? "Salvando..." : "Salvar Triagem"}
                            type="submit"
                            variant="primary"
                            disabled={loading}
                            iconName={loading ? "arrow-clockwise" : "check-circle"}
                            className="save-button"
                            style={{ width: 'fit-content', marginLeft: 'auto' }}
                        />

                    </form>
                </div>
            </div>

            {/* Modal para criar evento */}
            <CreateEventModal
                show={showCreateEventModal}
                onClose={handleCloseCreateEventModal}
                onEventCreated={handleEventCreated}
            />
        </div>
    );
};

export default Triagem;

