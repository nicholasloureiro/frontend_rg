import React, { useState } from 'react';
import PhoneInput from 'react-phone-number-input';
import 'react-phone-number-input/style.css';
import Header from '../components/Header';
import Button from '../components/Button';
import InputDate from '../components/InputDate';
import { mascaraCPF, mascaraCEP, removerMascara } from '../utils/Mascaras';
import validarCPF from '../utils/ValidarCPF';
import { triagemService } from '../services/triagemService';
import { getEmployees } from '../services/employeeService';
import { clientService } from '../services/clientService';
import { capitalizeText } from '../utils/capitalizeText';
import Swal from 'sweetalert2';
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
        dataEvento: null
    });

    const [errors, setErrors] = useState({});
    const [loading, setLoading] = useState(false);
    const [cepLoading, setCepLoading] = useState(false);
    const [atendentes, setAtendentes] = useState([]);
    const [loadingAtendentes, setLoadingAtendentes] = useState(false);
    const [cpfValido, setCpfValido] = useState(true);
    const [buscandoCliente, setBuscandoCliente] = useState(false);

    // Função para carregar atendentes da API
    const carregarAtendentes = async () => {
        setLoadingAtendentes(true);
        try {
            const funcionarios = await getEmployees();
            // Garante que funcionarios sempre será um array
            const listaFuncionarios = Array.isArray(funcionarios) ? funcionarios : [];
            // Filtrar apenas funcionários com role ATENDENTE
            const atendentesFiltrados = listaFuncionarios.filter(func => func.role === 'ATENDENTE');
            setAtendentes(atendentesFiltrados);
        } catch (error) {
            console.error('Erro ao carregar atendentes:', error);
          
        } finally {
            setLoadingAtendentes(false);
        }
    };

    // Carregar atendentes quando o componente montar
    React.useEffect(() => {
        carregarAtendentes();
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
        { value: 'pai', label: 'Pai' },
        { value: 'mae', label: 'Mãe' },
        { value: 'familia', label: 'Família' },
        { value: 'outro', label: 'Outro' }
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



    // Função para validar campos obrigatórios
    const validarCampos = () => {
        const novosErros = {};

        if (!formData.nomeCliente.trim()) {
            novosErros.nomeCliente = 'Nome do cliente é obrigatório';
        }

        if (!formData.telefone) {
            novosErros.telefone = 'Telefone é obrigatório';
        }

        if (formData.cpf && !cpfValido) {
            novosErros.cpf = 'CPF inválido';
        }

        if (!formData.atendenteResponsavel || formData.atendenteResponsavel === '') {
            novosErros.atendenteResponsavel = 'Atendente responsável é obrigatório';
        }

        if (!formData.origem) {
            novosErros.origem = 'Origem é obrigatória';
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
            telefone: formData.telefone ? formData.telefone.replace(/\D/g, '') : '',
            cpf: removerMascara(formData.cpf),
            atendente_id: formData.atendenteResponsavel ? parseInt(formData.atendenteResponsavel) : null,
            origem: formData.origem.toUpperCase(),
            data_evento: formatarDataParaAPI(formData.dataEvento),
            evento: formData.evento.toUpperCase(),
            papel_evento: formData.papelNoEvento.toUpperCase(),
            endereco: {
                cep: removerMascara(formData.cep),
                rua: formData.rua.toUpperCase(),
                numero: formData.numero,
                bairro: formData.bairro.toUpperCase(),
                cidade: formData.cidade.toUpperCase()
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

            console.log('Triagem criada com sucesso:', response);
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
                cep: '',
                rua: '',
                bairro: '',
                cidade: '',
                numero: '',
                atendenteResponsavel: '',
                origem: '',
                evento: '',
                papelNoEvento: '',
                dataEvento: null
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
                    numero: cliente.address?.number || ''
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
                            <h3 className="section-title">Dados do Cliente</h3>

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
                                            value={formData.cpf}
                                            onChange={handleCPFChange}
                                            placeholder="000.000.000-00"
                                            maxLength="14"
                                            disabled={buscandoCliente}
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
                                    {formData.cpf && !cpfValido && (
                                        <small className="error-message">CPF inválido</small>
                                    )}
                                </div>

                                {renderInput('nomeCliente', 'Nome do Cliente', 'text', 'Digite o nome completo', true)}

                               
                            </div>

                            <div className="form-row">
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
                                <div className="form-group">
                                    <label htmlFor="cep" className="form-label">
                                        CEP*
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
                                {renderInput('rua', 'Logradouro*', 'text', '')}
                                {renderInput('numero', 'Número*', 'text', '')}
                            </div>

                            <div className="form-row">
                                {renderInput('bairro', 'Bairro*', 'text', '')}
                                {renderInput('cidade', 'Cidade*', 'text', '')}
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
                                <div className="form-row">
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
        </div>
    );
};

export default Triagem;

