import React, { useState, useEffect } from 'react';
import Button from '../components/Button';
import StepProgressBar from '../components/StepProgressBar';
import '../styles/OrdemServico.css';
import Header from '../components/Header';
import ServiceOrderList from '../components/ServiceOrderList';
import { serviceOrderService } from '../services/serviceOrderService';
import { mascaraCPF, mascaraCEP, formatarParaExibicaoDecimal } from '../utils/Mascaras';
import { capitalizeText } from '../utils/capitalizeText';
import PhoneInput from 'react-phone-number-input';
import 'react-phone-number-input/style.css';
import Swal from 'sweetalert2';

const OrdemServico = () => {
    const [currentStep, setCurrentStep] = useState(0);
    const [showForm, setShowForm] = useState(false);
    const [selectedOrder, setSelectedOrder] = useState(null);
    const [loading, setLoading] = useState(false);
    const [isLoadingOrders, setIsLoadingOrders] = useState(true);
    const [error, setError] = useState(null);
    const [formData, setFormData] = useState({
        // Cliente
        nome: '',
        telefone: '',
        cpf: '',
        cep: '',
        rua: '',
        numero: '',
        bairro: '',
        cidade: '',

        // Paletó
        paletoNumero: '',
        paletoCor: '',
        paletoManga: '',
        paletoAjuste: '',
        paletoExtras: '',

        // Camisa
        camisaNumero: '',
        camisaCor: '',
        camisaManga: '',
        camisaAjuste: '',
        camisaExtras: '',

        // Calça
        calcaNumero: '',
        calcaCor: '',
        calcaCintura: '',
        calcaPerna: '',
        calcaAjuste: '',
        calcaExtras: '',

        // Acessórios
        suspensorio: false,
        passante: false,
        corAcessorios: '',
        lenco: false,
        sapato: false,

        // Pagamento
        dataPedido: '',
        dataEvento: '',
        ocasiao: '',
        tipoPagamento: 'Compra',
        total: '',
        sinal: '',
        restante: ''
    });

    // Estado para controlar os valores dos inputs em tempo real
    const [inputValues, setInputValues] = useState({
        // Cliente
        nome: '',
        telefone: '',
        cpf: '',
        cep: '',
        rua: '',
        numero: '',
        bairro: '',
        cidade: '',

        // Paletó
        paletoNumero: '',
        paletoCor: '',
        paletoManga: '',
        paletoAjuste: '',
        paletoExtras: '',

        // Camisa
        camisaNumero: '',
        camisaCor: '',
        camisaManga: '',
        camisaAjuste: '',
        camisaExtras: '',

        // Calça
        calcaNumero: '',
        calcaCor: '',
        calcaCintura: '',
        calcaPerna: '',
        calcaAjuste: '',
        calcaExtras: '',

        // Acessórios
        suspensorio: false,
        passante: false,
        corAcessorios: '',
        lenco: false,
        sapato: false,

        // Pagamento
        dataPedido: '',
        dataEvento: '',
        ocasiao: '',
        tipoPagamento: 'Compra',
        total: '',
        sinal: '',
        restante: ''
    });

    const steps = [
        { label: 'Cliente' },
        { label: 'Paletó' },
        { label: 'Camisa' },
        { label: 'Calça' },
        { label: 'Acessórios' },
        { label: 'Pagamento' }
    ];

    const handleInputChange = (field, value) => {
        setInputValues(prev => ({
            ...prev,
            [field]: value
        }));
        
        // Calcular valor restante automaticamente
        if (field === 'total' || field === 'sinal') {
            const total = field === 'total' ? parseFloat(value) || 0 : parseFloat(inputValues.total) || 0;
            const sinal = field === 'sinal' ? parseFloat(value) || 0 : parseFloat(inputValues.sinal) || 0;
            const restante = total - sinal;
            
            setInputValues(prev => ({
                ...prev,
                restante: restante.toString()
            }));
        }
    };

    const handleInputBlur = (field, value) => {
        setFormData(prev => ({
            ...prev,
            [field]: value
        }));
        
        // Calcular valor restante automaticamente
        if (field === 'total' || field === 'sinal') {
            const total = field === 'total' ? parseFloat(value) || 0 : parseFloat(inputValues.total) || 0;
            const sinal = field === 'sinal' ? parseFloat(value) || 0 : parseFloat(inputValues.sinal) || 0;
            const restante = total - sinal;
            
            setFormData(prev => ({
                ...prev,
                restante: restante.toString()
            }));
            setInputValues(prev => ({
                ...prev,
                restante: restante.toString()
            }));
        }
    };

    const handleSelectChange = (field, value) => {
        setInputValues(prev => ({
            ...prev,
            [field]: value
        }));
        setFormData(prev => ({
            ...prev,
            [field]: value
        }));
    };

    const handleCheckboxChange = (field, value) => {
        setInputValues(prev => ({
            ...prev,
            [field]: value
        }));
        setFormData(prev => ({
            ...prev,
            [field]: value
        }));
    };

    // Sincronizar formData com inputValues quando restante for calculado
    useEffect(() => {
        if (inputValues.restante !== formData.restante) {
            setFormData(prev => ({
                ...prev,
                restante: inputValues.restante
            }));
        }
    }, [inputValues.restante, formData.restante]);

    // Função para carregar ordens de serviço
    const loadOrders = async () => {
        setIsLoadingOrders(true);
        setError(null);
        try {
            // A lógica de carregamento será feita pelo ServiceOrderList
            // Aqui apenas simulamos o carregamento inicial
            await new Promise(resolve => setTimeout(resolve, 1000));
        } catch (error) {
            console.error('Erro ao carregar ordens de serviço:', error);
            setError('Não foi possível carregar a lista de ordens de serviço. Tente novamente.');
            Swal.fire({
                icon: 'error',
                title: 'Erro ao carregar ordens de serviço',
                text: 'Não foi possível carregar a lista de ordens de serviço.',
                timer: 2000,
                showConfirmButton: false
            });
        } finally {
            setIsLoadingOrders(false);
        }
    };

    // Carregar ordens ao montar o componente
    useEffect(() => {
        loadOrders();
    }, []);





    // Função para criar nova ordem
    const handleCreateNew = () => {
        setSelectedOrder(null);
        setFormData({
            nome: '', telefone: '', cpf: '', cep: '', rua: '', numero: '', bairro: '', cidade: '',
            paletoNumero: '', paletoCor: '', paletoManga: '', paletoAjuste: '', paletoExtras: '',
            camisaNumero: '', camisaCor: '', camisaManga: '', camisaAjuste: '', camisaExtras: '',
            calcaNumero: '', calcaCor: '', calcaCintura: '', calcaPerna: '', calcaAjuste: '', calcaExtras: '',
            suspensorio: false, passante: false, corAcessorios: '', lenco: false, sapato: false,
            dataPedido: '', dataEvento: '', ocasiao: '', tipoPagamento: 'Compra', total: '', sinal: '', restante: ''
        });
        setInputValues({
            nome: '', telefone: '', cpf: '', cep: '', rua: '', numero: '', bairro: '', cidade: '',
            paletoNumero: '', paletoCor: '', paletoManga: '', paletoAjuste: '', paletoExtras: '',
            camisaNumero: '', camisaCor: '', camisaManga: '', camisaAjuste: '', camisaExtras: '',
            calcaNumero: '', calcaCor: '', calcaCintura: '', calcaPerna: '', calcaAjuste: '', calcaExtras: '',
            suspensorio: false, passante: false, corAcessorios: '', lenco: false, sapato: false,
            dataPedido: '', dataEvento: '', ocasiao: '', tipoPagamento: 'Compra', total: '', sinal: '', restante: ''
        });
        setCurrentStep(0);
        setShowForm(true);
    };

    // Função para selecionar uma ordem da lista
    const handleSelectOrder = (order) => {
        setSelectedOrder(order);
        
        // Extrair dados diretamente da ordem selecionada
        const client = order.client || {};
        const contact = client.contacts?.[0] || {};
        const address = client.addresses?.[0] || {};
        const city = address.cidade || {};
        
        // Mapear os dados para o formato do formulário
        const clientData = {
            nome: client.name || '',
            telefone: contact.phone || '',
            cpf: client.cpf || '',
            cep: address.cep || '',
            rua: address.rua || '',
            numero: address.numero || '',
            bairro: address.bairro || '',
            cidade: city.name || ''
        };
        
        const mappedData = {
            // Cliente
            ...clientData,

            // Paletó
            paletoNumero: '',
            paletoCor: '',
            paletoManga: '',
            paletoAjuste: '',
            paletoExtras: '',

            // Camisa
            camisaNumero: '',
            camisaCor: '',
            camisaManga: '',
            camisaAjuste: '',
            camisaExtras: '',

            // Calça
            calcaNumero: '',
            calcaCor: '',
            calcaCintura: '',
            calcaPerna: '',
            calcaAjuste: '',
            calcaExtras: '',

            // Acessórios
            suspensorio: false,
            passante: false,
            corAcessorios: '',
            lenco: false,
            sapato: false,

            // Pagamento
            dataPedido: order.order_date || '',
            dataEvento: order.event_date || '',
            ocasiao: order.occasion || '',
            tipoPagamento: 'Compra',
            total: order.total_value?.toString() || '',
            sinal: order.advance_payment?.toString() || '',
            restante: order.remaining_payment?.toString() || ''
        };

        setFormData(mappedData);
        setInputValues(mappedData);
        setCurrentStep(0);
        setShowForm(true);
    };

    // Função para voltar à listagem
    const handleBackToList = () => {
        setShowForm(false);
        setSelectedOrder(null);
        setCurrentStep(0);
    };

    // Função para finalizar a OS
    const handleFinalizeOS = async () => {
        if (!validateCurrentStep()) {
            alert('Por favor, preencha todos os campos obrigatórios antes de finalizar.');
            return;
        }

        setLoading(true);
        try {
            const orderData = {
                event_date: formData.dataEvento,
                occasion: formData.ocasiao,
                total_value: parseFloat(formData.total) || 0,
                advance_payment: parseFloat(formData.sinal) || 0,
                remaining_payment: parseFloat(formData.restante) || 0,
                order_date: formData.dataPedido,
                client: {
                    name: formData.nome,
                    cpf: formData.cpf,
                    contacts: [
                        {
                            phone: formData.telefone
                        }
                    ],
                    addresses: [
                        {
                            cep: formData.cep,
                            rua: formData.rua,
                            numero: formData.numero,
                            bairro: formData.bairro,
                            cidade: {
                                name: formData.cidade
                            }
                        }
                    ]
                },
                // Dados dos itens (se a API aceitar)
                jacket_number: formData.paletoNumero,
                jacket_color: formData.paletoCor,
                jacket_sleeve: formData.paletoManga,
                jacket_adjustment: formData.paletoAjuste,
                jacket_extras: formData.paletoExtras,
                shirt_number: formData.camisaNumero,
                shirt_color: formData.camisaCor,
                shirt_sleeve: formData.camisaManga,
                shirt_adjustment: formData.camisaAjuste,
                shirt_extras: formData.camisaExtras,
                pants_number: formData.calcaNumero,
                pants_color: formData.calcaCor,
                pants_waist: formData.calcaCintura,
                pants_leg: formData.calcaPerna,
                pants_adjustment: formData.calcaAjuste,
                pants_extras: formData.calcaExtras,
                suspenders: formData.suspensorio,
                belt_loop: formData.passante,
                accessories_color: formData.corAcessorios,
                tie: formData.lenco,
                shoes: formData.sapato
            };

            if (selectedOrder) {
                await serviceOrderService.updateServiceOrder(selectedOrder.id, orderData);
                alert('Ordem de serviço atualizada com sucesso!');
            } else {
                await serviceOrderService.createServiceOrder(orderData);
                alert('Ordem de serviço criada com sucesso!');
            }
            
            handleBackToList();
        } catch (error) {
            console.error('Erro ao salvar ordem de serviço:', error);
            alert('Erro ao salvar a ordem de serviço');
        } finally {
            setLoading(false);
        }
    };

    // Função para validar se todos os campos do step atual estão preenchidos
    const validateCurrentStep = () => {
        switch (currentStep) {
            case 0: // Cliente
                return inputValues.nome.trim() !== '' && 
                       inputValues.telefone.trim() !== '' && 
                       inputValues.cpf.trim() !== '' && 
                       inputValues.cep.trim() !== '' && 
                       inputValues.rua.trim() !== '' && 
                       inputValues.numero.trim() !== '' && 
                       inputValues.bairro.trim() !== '' && 
                       inputValues.cidade.trim() !== '';
            
            case 1: // Paletó
                return inputValues.paletoNumero.trim() !== '' && 
                       inputValues.paletoCor.trim() !== '' && 
                       inputValues.paletoManga.trim() !== '' && 
                       inputValues.paletoAjuste.trim() !== '';
            
            case 2: // Camisa
                return inputValues.camisaNumero.trim() !== '' && 
                       inputValues.camisaCor.trim() !== '' && 
                       inputValues.camisaManga.trim() !== '' && 
                       inputValues.camisaAjuste.trim() !== '';
            
            case 3: // Calça
                return inputValues.calcaNumero.trim() !== '' && 
                       inputValues.calcaCor.trim() !== '' && 
                       inputValues.calcaCintura.trim() !== '' && 
                       inputValues.calcaPerna.trim() !== '' && 
                       inputValues.calcaAjuste.trim() !== '';
            
            case 4: // Acessórios
                return inputValues.corAcessorios.trim() !== '';
            
            case 5: // Pagamento
                return inputValues.dataPedido.trim() !== '' && 
                       inputValues.dataEvento.trim() !== '' && 
                       inputValues.ocasiao.trim() !== '' && 
                       inputValues.total.trim() !== '' && 
                       inputValues.sinal.trim() !== '';
            
            default:
                return true;
        }
    };

    const nextStep = () => {
        if (currentStep < steps.length - 1) {
            if (validateCurrentStep()) {
                setCurrentStep(currentStep + 1);
            } else {
                alert('Por favor, preencha todos os campos obrigatórios antes de continuar.');
            }
        }
    };

    const prevStep = () => {
        if (currentStep > 0) {
            setCurrentStep(currentStep - 1);
        }
    };

    const renderStepContent = () => {
        switch (currentStep) {
            case 0: // Cliente
                return (
                    <div className="step-content">
                        <h3>Informações do Cliente</h3>
                        <div className="form-grid">
                            <div className="form-group">
                                <label>Nome <span style={{ color: 'red' }}>*</span></label>
                                <input
                                    type="text"
                                    value={capitalizeText(inputValues.nome)}
                                    onChange={(e) => handleInputChange('nome', e.target.value)}
                                    onBlur={(e) => handleInputBlur('nome', e.target.value)}
                                    placeholder="Digite o nome completo"
                                />
                            </div>
                            <div className="form-group">
                                <label>Telefone <span style={{ color: 'red' }}>*</span></label>
                                <PhoneInput
                                    international
                                    defaultCountry="BR"
                                    value={inputValues.telefone}
                                    onChange={(value) => handleInputChange('telefone', value)}
                                    onBlur={(e) => handleInputBlur('telefone', inputValues.telefone)}
                                    placeholder="Digite o telefone"
                                />
                            </div>
                            <div className="form-group">
                                <label>CPF <span style={{ color: 'red' }}>*</span></label>
                                <input
                                    type="text"
                                    value={mascaraCPF(inputValues.cpf)}
                                    onChange={(e) => handleInputChange('cpf', e.target.value)}
                                    onBlur={(e) => handleInputBlur('cpf', e.target.value)}
                                    placeholder="000.000.000-00"
                                />
                            </div>
                            <div className="form-group">
                                <label>CEP <span style={{ color: 'red' }}>*</span></label>
                                <input
                                    type="text"
                                    value={mascaraCEP(inputValues.cep)}
                                    onChange={(e) => handleInputChange('cep', e.target.value)}
                                    onBlur={(e) => handleInputBlur('cep', e.target.value)}
                                    placeholder="00000-000"
                                />
                            </div>
                            <div className="form-group">
                                <label>Endereço <span style={{ color: 'red' }}>*</span></label>
                                <input
                                    type="text"
                                    value={capitalizeText(inputValues.rua)}
                                    onChange={(e) => handleInputChange('rua', e.target.value)}
                                    onBlur={(e) => handleInputBlur('rua', e.target.value)}
                                    placeholder="Nome da rua"
                                />
                            </div>
                            <div className="form-group">
                                <label>Número <span style={{ color: 'red' }}>*</span></label>
                                <input
                                    type="text"
                                    value={inputValues.numero}
                                    onChange={(e) => handleInputChange('numero', e.target.value)}
                                    onBlur={(e) => handleInputBlur('numero', e.target.value)}
                                    placeholder="Número"
                                />
                            </div>
                            <div className="form-group">
                                <label>Bairro <span style={{ color: 'red' }}>*</span></label>
                                <input
                                    type="text"
                                    value={capitalizeText(inputValues.bairro)}
                                    onChange={(e) => handleInputChange('bairro', e.target.value)}
                                    onBlur={(e) => handleInputBlur('bairro', e.target.value)}
                                    placeholder="Nome do bairro"
                                />
                            </div>
                            <div className="form-group">
                                <label>Cidade <span style={{ color: 'red' }}>*</span></label>
                                <input
                                    type="text"
                                    value={capitalizeText(inputValues.cidade)}
                                    onChange={(e) => handleInputChange('cidade', e.target.value)}
                                    onBlur={(e) => handleInputBlur('cidade', e.target.value)}
                                    placeholder="Nome da cidade"
                                />
                            </div>
                        </div>
                    </div>
                );

            case 1: // Paletó
                return (
                    <div className="step-content">
                        <h3>Detalhes do Paletó</h3>
                        <div className="form-grid">
                            <div className="form-group">
                                <label>Número <span style={{ color: 'red' }}>*</span></label>
                                <input
                                    type="text"
                                    value={inputValues.paletoNumero}
                                    onChange={(e) => handleInputChange('paletoNumero', e.target.value)}
                                    onBlur={(e) => handleInputBlur('paletoNumero', e.target.value)}
                                    placeholder="Número"
                                />
                            </div>
                            <div className="form-group">
                                <label>Cor <span style={{ color: 'red' }}>*</span></label>
                                <input
                                    type="text"
                                    value={inputValues.paletoCor}
                                    onChange={(e) => handleInputChange('paletoCor', e.target.value)}
                                    onBlur={(e) => handleInputBlur('paletoCor', e.target.value)}
                                    placeholder="Cor do paletó"
                                />
                            </div>
                            <div className="form-group">
                                <label>Manga <span style={{ color: 'red' }}>*</span></label>
                                <input
                                    type="text"
                                    value={inputValues.paletoManga}
                                    onChange={(e) => handleInputChange('paletoManga', e.target.value)}
                                    onBlur={(e) => handleInputBlur('paletoManga', e.target.value)}
                                    placeholder="Medida da manga"
                                />
                            </div>
                            <div className="form-group">
                                <label>Ajuste <span style={{ color: 'red' }}>*</span></label>
                                <input
                                    type="text"
                                    value={inputValues.paletoAjuste}
                                    onChange={(e) => handleInputChange('paletoAjuste', e.target.value)}
                                    onBlur={(e) => handleInputBlur('paletoAjuste', e.target.value)}
                                    placeholder="Ajuste"
                                />
                            </div>
                            <div className="form-group full-width">
                                <label>Extras</label>
                                <input
                                    type="text"
                                    value={inputValues.paletoExtras}
                                    onChange={(e) => handleInputChange('paletoExtras', e.target.value)}
                                    onBlur={(e) => handleInputBlur('paletoExtras', e.target.value)}
                                    placeholder="Observações extras"
                                />
                            </div>
                        </div>
                    </div>
                );

            case 2: // Camisa
                return (
                    <div className="step-content">
                        <h3>Detalhes da Camisa</h3>
                        <div className="form-grid">
                            <div className="form-group">
                                <label>Número <span style={{ color: 'red' }}>*</span></label>
                                <input
                                    type="text"
                                    value={inputValues.camisaNumero}
                                    onChange={(e) => handleInputChange('camisaNumero', e.target.value)}
                                    onBlur={(e) => handleInputBlur('camisaNumero', e.target.value)}
                                    placeholder="Número"
                                />
                            </div>
                            <div className="form-group">
                                <label>Cor <span style={{ color: 'red' }}>*</span></label>
                                <input
                                    type="text"
                                    value={inputValues.camisaCor}
                                    onChange={(e) => handleInputChange('camisaCor', e.target.value)}
                                    onBlur={(e) => handleInputBlur('camisaCor', e.target.value)}
                                    placeholder="Cor da camisa"
                                />
                            </div>
                            <div className="form-group">
                                <label>Manga <span style={{ color: 'red' }}>*</span></label>
                                <input
                                    type="text"
                                    value={inputValues.camisaManga}
                                    onChange={(e) => handleInputChange('camisaManga', e.target.value)}
                                    onBlur={(e) => handleInputBlur('camisaManga', e.target.value)}
                                    placeholder="Medida da manga"
                                />
                            </div>
                            <div className="form-group">
                                <label>Ajuste <span style={{ color: 'red' }}>*</span></label>
                                <input
                                    type="text"
                                    value={inputValues.camisaAjuste}
                                    onChange={(e) => handleInputChange('camisaAjuste', e.target.value)}
                                    onBlur={(e) => handleInputBlur('camisaAjuste', e.target.value)}
                                    placeholder="Ajuste"
                                />
                            </div>
                            <div className="form-group full-width">
                                <label>Extras</label>
                                <input
                                    type="text"
                                    value={inputValues.camisaExtras}
                                    onChange={(e) => handleInputChange('camisaExtras', e.target.value)}
                                    onBlur={(e) => handleInputBlur('camisaExtras', e.target.value)}
                                    placeholder="Observações extras"
                                />
                            </div>
                        </div>
                    </div>
                );

            case 3: // Calça
                return (
                    <div className="step-content">
                        <h3>Detalhes da Calça</h3>
                        <div className="form-grid">
                            <div className="form-group">
                                <label>Número <span style={{ color: 'red' }}>*</span></label>
                                <input
                                    type="text"
                                    value={inputValues.calcaNumero}
                                    onChange={(e) => handleInputChange('calcaNumero', e.target.value)}
                                    onBlur={(e) => handleInputBlur('calcaNumero', e.target.value)}
                                    placeholder="Número"
                                />
                            </div>
                            <div className="form-group">
                                <label>Cor <span style={{ color: 'red' }}>*</span></label>
                                <input
                                    type="text"
                                    value={inputValues.calcaCor}
                                    onChange={(e) => handleInputChange('calcaCor', e.target.value)}
                                    onBlur={(e) => handleInputBlur('calcaCor', e.target.value)}
                                    placeholder="Cor da calça"
                                />
                            </div>
                            <div className="form-group">
                                <label>Cintura <span style={{ color: 'red' }}>*</span></label>
                                <input
                                    type="text"
                                    value={inputValues.calcaCintura}
                                    onChange={(e) => handleInputChange('calcaCintura', e.target.value)}
                                    onBlur={(e) => handleInputBlur('calcaCintura', e.target.value)}
                                    placeholder="Medida da cintura"
                                />
                            </div>
                            <div className="form-group">
                                <label>Perna <span style={{ color: 'red' }}>*</span></label>
                                <input
                                    type="text"
                                    value={inputValues.calcaPerna}
                                    onChange={(e) => handleInputChange('calcaPerna', e.target.value)}
                                    onBlur={(e) => handleInputBlur('calcaPerna', e.target.value)}
                                    placeholder="Medida da perna"
                                />
                            </div>
                            <div className="form-group">
                                <label>Ajuste <span style={{ color: 'red' }}>*</span></label>
                                <input
                                    type="text"
                                    value={inputValues.calcaAjuste}
                                    onChange={(e) => handleInputChange('calcaAjuste', e.target.value)}
                                    onBlur={(e) => handleInputBlur('calcaAjuste', e.target.value)}
                                    placeholder="Ajuste"
                                />
                            </div>
                            <div className="form-group full-width">
                                <label>Extras</label>
                                <input
                                    type="text"
                                    value={inputValues.calcaExtras}
                                    onChange={(e) => handleInputChange('calcaExtras', e.target.value)}
                                    onBlur={(e) => handleInputBlur('calcaExtras', e.target.value)}
                                    placeholder="Observações extras"
                                />
                            </div>
                        </div>
                    </div>
                );

            case 4: // Acessórios
                return (
                    <div className="step-content">
                        <h3>Acessórios</h3>
                        <div className="form-grid">
                            <div className="form-group checkbox-group">
                                <label>
                                    <input
                                        type="checkbox"
                                        checked={inputValues.suspensorio}
                                        onChange={(e) => handleCheckboxChange('suspensorio', e.target.checked)}
                                    />
                                    Suspensório
                                </label>
                            </div>
                            <div className="form-group checkbox-group">
                                <label>
                                    <input
                                        type="checkbox"
                                        checked={inputValues.passante}
                                        onChange={(e) => handleCheckboxChange('passante', e.target.checked)}
                                    />
                                    Passante
                                </label>
                            </div>
                            <div className="form-group">
                                <label>Cor dos Acessórios <span style={{ color: 'red' }}>*</span></label>
                                <input
                                    type="text"
                                    value={inputValues.corAcessorios}
                                    onChange={(e) => handleInputChange('corAcessorios', e.target.value)}
                                    onBlur={(e) => handleInputBlur('corAcessorios', e.target.value)}
                                    placeholder="Cor dos acessórios"
                                />
                            </div>
                            <div className="form-group checkbox-group">
                                <label>
                                    <input
                                        type="checkbox"
                                        checked={inputValues.lenco}
                                        onChange={(e) => handleCheckboxChange('lenco', e.target.checked)}
                                    />
                                    Lenço
                                </label>
                            </div>
                            <div className="form-group checkbox-group">
                                <label>
                                    <input
                                        type="checkbox"
                                        checked={inputValues.sapato}
                                        onChange={(e) => handleCheckboxChange('sapato', e.target.checked)}
                                    />
                                    Sapato
                                </label>
                            </div>
                        </div>
                    </div>
                );

            case 5: // Pagamento
                return (
                    <div className="step-content">
                        <h3>Informações de Pagamento</h3>
                        <div className="form-grid">
                            <div className="form-group">
                                <label>Data do Pedido <span style={{ color: 'red' }}>*</span></label>
                                <input
                                    type="date"
                                    value={inputValues.dataPedido}
                                    onChange={(e) => handleInputChange('dataPedido', e.target.value)}
                                    onBlur={(e) => handleInputBlur('dataPedido', e.target.value)}
                                />
                            </div>
                            <div className="form-group">
                                <label>Data do Evento <span style={{ color: 'red' }}>*</span></label>
                                <input
                                    type="date"
                                    value={inputValues.dataEvento}
                                    onChange={(e) => handleInputChange('dataEvento', e.target.value)}
                                    onBlur={(e) => handleInputBlur('dataEvento', e.target.value)}
                                />
                            </div>
                            <div className="form-group">
                                <label>Ocasião <span style={{ color: 'red' }}>*</span></label>
                                <input
                                    type="text"
                                    value={inputValues.ocasiao}
                                    onChange={(e) => handleInputChange('ocasiao', e.target.value)}
                                    onBlur={(e) => handleInputBlur('ocasiao', e.target.value)}
                                    placeholder="Tipo de evento"
                                />
                            </div>
                            <div className="form-group">
                                <label>Tipo de Pagamento <span style={{ color: 'red' }}>*</span></label>
                                <select
                                    value={inputValues.tipoPagamento}
                                    onChange={(e) => handleSelectChange('tipoPagamento', e.target.value)}
                                >
                                    <option value="Compra">Compra</option>
                                    <option value="Aluguel">Aluguel</option>
                                </select>
                            </div>
                            <div className="form-group">
                                <label>Total <span style={{ color: 'red' }}>*</span></label>
                                <input
                                    type="number"
                                    value={inputValues.total}
                                    onChange={(e) => handleInputChange('total', e.target.value)}
                                    onBlur={(e) => handleInputBlur('total', e.target.value)}
                                    placeholder="Valor total"
                                />
                            </div>
                            <div className="form-group">
                                <label>Sinal <span style={{ color: 'red' }}>*</span></label>
                                <input
                                    type="number"
                                    value={inputValues.sinal}
                                    onChange={(e) => handleInputChange('sinal', e.target.value)}
                                    onBlur={(e) => handleInputBlur('sinal', e.target.value)}
                                    placeholder="Valor do sinal"
                                />
                            </div>
                            <div className="form-group">
                                <label>Restante</label>
                                <input
                                    type="number"
                                    value={inputValues.restante}
                                    onChange={(e) => handleInputChange('restante', e.target.value)}
                                    onBlur={(e) => handleInputBlur('restante', e.target.value)}
                                    placeholder="Valor restante"
                                    readOnly
                                />
                            </div>
                        </div>
                    </div>
                );

            default:
                return null;
        }
    };

    return (
        <>
            <Header nomeHeader={"Ordem de Serviço"} />
            {!showForm ? (
                <ServiceOrderList 
                    onSelectOrder={handleSelectOrder}
                    onCreateNew={handleCreateNew}
                    isLoading={isLoadingOrders}
                    error={error}
                    onRetry={loadOrders}
                />
            ) : (
                <div className="ordem-servico-container">
                    <div className="ordem-servico-header mb-3">
                       <Button text="Voltar à Lista" onClick={handleBackToList} variant="primary" className="action-btn" disabled={loading} iconName="arrow-left" style={{ width: 'fit-content', padding: '15px 20px' }} />                       
                      
                    </div>
                    
                    <div className="ordem-servico-content">
                        <div className="form-section">
                            {/* Steps Navigation */}
                            <div className="steps-navigation">
                                <StepProgressBar steps={steps} currentStep={currentStep} />
                            </div>

                            {/* Form Content */}
                            <div className="form-content">
                                {renderStepContent()}

                                <div className="form-actions">
                                    {currentStep > 0 && (
                                        <Button
                                            text="Anterior"
                                            onClick={prevStep}
                                            variant="disabled"
                                            className="action-btn"
                                            disabled={loading}
                                        />
                                    )}
                                    {currentStep < steps.length - 1 ? (
                                        <Button
                                            text="Próximo"
                                            onClick={nextStep}
                                            variant="primary"
                                            className="action-btn"
                                            disabled={loading}
                                            style={{ marginLeft: 'auto' }}
                                        />
                                    ) : (
                                        <Button
                                            text={loading ? "Salvando..." : "Finalizar OS"}
                                            onClick={handleFinalizeOS}
                                            variant="primary"
                                            className="action-btn"
                                            disabled={loading}
                                        />
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* Preview Section */}
                        <div className="preview-section">
                            <div className="preview-card">
                                <div className="preview-header">
                                    <h2>ORDEM DE SERVIÇO</h2>
                                    <div className="os-number">OS #{selectedOrder?.id || 'Nova'}</div>
                                </div>

                            <div className="preview-section-group">
                                <h4 style={{ display: 'flex', alignItems: 'center' }}>
                                    <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor" style={{ marginRight: '8px', verticalAlign: 'middle' }}>
                                        <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/>
                                    </svg>
                                    CLIENTE
                                </h4>
                                <div className="info-grid">
                                    <div className="info-item">
                                        <span className="label">Nome:</span>
                                        <span className="value">{capitalizeText(formData.nome)}</span>
                                    </div>
                                    <div className="info-item">
                                        <span className="label">Telefone:</span>
                                        <span className="value">{formData.telefone}</span>
                                    </div>
                                    <div className="info-item">
                                        <span className="label">CPF:</span>
                                        <span className="value">{mascaraCPF(formData.cpf)}</span>
                                    </div>
                                    <div className="info-item">
                                        <span className="label">CEP:</span>
                                        <span className="value">{mascaraCEP(formData.cep)}</span>
                                    </div>
                                    <div className="info-item">
                                        <span className="label">Endereço:</span>
                                        <span className="value">{capitalizeText(formData.rua)}, {formData.numero} - {capitalizeText(formData.bairro)}, {capitalizeText(formData.cidade)}</span>
                                    </div>
                                </div>
                            </div>

                            <div className="preview-section-group">
                                <h4 style={{ display: 'flex', alignItems: 'center' }}>
                                    <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor" style={{ marginRight: '8px', verticalAlign: 'middle' }}>
                                        <path d="M21.6 18.2L13 11.75v-.91c1.65-.49 2.8-2.17 2.43-4.05-.26-1.31-1.3-2.4-2.61-2.7C10.54 3.57 8.5 5.3 8.5 7.5h2c0-.83.67-1.5 1.5-1.5s1.5.67 1.5 1.5c0 .84-.69 1.52-1.53 1.5-.54-.01-.97.45-.97.99v1.76L2.4 18.2c-.77.58-.36 1.8.6 1.8h18c.96 0 1.37-1.22.6-1.8zM6 18l6-4.5 6 4.5H6z"/>
                                    </svg>
                                    ITENS
                                </h4>
                                <div className="d-flex justify-content-between">
                                    <div className="item-card">
                                        <div className="item-header">
                                            <span className="item-title">Paletó</span>
                                        </div>
                                        <div className="item-details">
                                            <span><strong>Nº:</strong> {formData.paletoNumero}</span>
                                            <span><strong>Cor:</strong> {formData.paletoCor}</span>
                                            <span><strong>Manga:</strong> {formData.paletoManga}</span>
                                            <span><strong>Ajuste:</strong> {formData.paletoAjuste}</span>
                                            <span><strong>Extras:</strong> {formData.paletoExtras}</span>
                                        </div>
                                    </div>

                                    <div className="item-card">
                                        <div className="item-header">
                                            <span className="item-title">Camisa</span>
                                        </div>
                                        <div className="item-details">
                                            <span><strong>Nº:</strong> {formData.camisaNumero}</span>
                                            <span><strong>Cor:</strong> {formData.camisaCor}</span>
                                            <span><strong>Manga:</strong> {formData.camisaManga}</span>
                                            <span><strong>Ajuste:</strong> {formData.camisaAjuste}</span>
                                            <span><strong>Extras:</strong> {formData.camisaExtras}</span>
                                        </div>
                                    </div>

                                    <div className="item-card">
                                        <div className="item-header">
                                            <span className="item-title">Calça</span>
                                        </div>
                                        <div className="item-details">
                                            <span><strong>Nº:</strong> {formData.calcaNumero}</span>
                                            <span><strong>Cor:</strong> {formData.calcaCor}</span>
                                            <span><strong>Cintura:</strong> {formData.calcaCintura}</span>
                                            <span><strong>Perna:</strong> {formData.calcaPerna}</span>
                                            <span><strong>Ajuste:</strong> {formData.calcaAjuste}</span>
                                            <span><strong>Extras:</strong> {formData.calcaExtras}</span>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="preview-section-group">
                                <h4 style={{ display: 'flex', alignItems: 'center' }}>
                                    <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor" style={{ marginRight: '8px', verticalAlign: 'middle' }}>
                                        <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
                                    </svg>
                                    ACESSÓRIOS
                                </h4>
                                <div className="accessories-grid">
                                    <div className="accessory-item">
                                        <span className="accessory-label">Suspensório:</span>
                                        <span className="accessory-value">{formData.suspensorio ? 'Sim' : 'Não'}</span>
                                    </div>
                                    <div className="accessory-item">
                                        <span className="accessory-label">Passante:</span>
                                        <span className="accessory-value">{formData.passante ? 'Sim' : 'Não'}</span>
                                    </div>
                                    <div className="accessory-item">
                                        <span className="accessory-label">Lenço:</span>
                                        <span className="accessory-value">{formData.lenco ? 'Sim' : 'Não'}</span>
                                    </div>
                                    <div className="accessory-item">
                                        <span className="accessory-label">Sapato:</span>
                                        <span className="accessory-value">{formData.sapato ? 'Sim' : 'Não'}</span>
                                    </div>
                                    <div className="accessory-item full-width">
                                        <span className="accessory-label">Cor:</span>
                                        <span className="accessory-value">{formData.corAcessorios}</span>
                                    </div>
                                </div>
                            </div>

                            <div className="preview-section-group">
                                <h4 style={{ display: 'flex', alignItems: 'center' }}>
                                    <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor" style={{ marginRight: '8px', verticalAlign: 'middle' }}>
                                        <path d="M11.8 10.9c-2.27-.59-3-1.2-3-2.15 0-1.09 1.01-1.85 2.7-1.85 1.78 0 2.44.85 2.5 2.1h2.21c-.07-1.72-1.12-3.3-3.21-3.81V3h-3v2.16c-1.94.42-3.5 1.68-3.5 3.61 0 2.31 1.91 3.46 4.7 4.13 2.5.6 3 1.48 3 2.41 0 .69-.49 1.79-2.7 1.79-2.06 0-2.87-.92-2.98-2.1h-2.2c.12 2.19 1.76 3.42 3.68 3.83V21h3v-2.15c1.95-.37 3.5-1.5 3.5-3.55 0-2.84-2.43-3.81-4.7-4.4z"/>
                                    </svg>
                                    PAGAMENTO
                                </h4>
                                <div className="payment-grid">
                                    <div className="payment-item">
                                        <span className="payment-label">Data Pedido:</span>
                                        <span className="payment-value">{formData.dataPedido ? new Date(formData.dataPedido).toLocaleDateString('pt-BR') : ''}</span>
                                    </div>
                                    <div className="payment-item">
                                        <span className="payment-label">Data Evento:</span>
                                        <span className="payment-value">{formData.dataEvento ? new Date(formData.dataEvento).toLocaleDateString('pt-BR') : ''}</span>
                                    </div>
                                    <div className="payment-item">
                                        <span className="payment-label">Ocasião:</span>
                                        <span className="payment-value">{capitalizeText(formData.ocasiao)}</span>
                                    </div>
                                    <div className="payment-item">
                                        <span className="payment-label">Tipo:</span>
                                        <span className="payment-value">{formData.tipoPagamento}</span>
                                    </div>
                                    <div className="payment-item highlight">
                                        <span className="payment-label">Total:</span>
                                        <span className="payment-value">R$ {formatarParaExibicaoDecimal(parseFloat(formData.total) || 0)}</span>
                                    </div>
                                    <div className="payment-item">
                                        <span className="payment-label">Sinal:</span>
                                        <span className="payment-value">R$ {formatarParaExibicaoDecimal(parseFloat(formData.sinal) || 0)}</span>
                                    </div>
                                    <div className="payment-item highlight">
                                        <span className="payment-label">Restante:</span>
                                        <span className="payment-value">R$ {formatarParaExibicaoDecimal(parseFloat(formData.restante) || 0)}</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            )}
        </>
    );
};

export default OrdemServico;