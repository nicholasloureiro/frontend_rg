import React, { useState, useEffect, useRef } from 'react';
import Button from '../components/Button';
import StepProgressBar from '../components/StepProgressBar';
import '../styles/OrdemServico.css';
import Header from '../components/Header';
import ServiceOrderList from '../components/ServiceOrderList';
import { serviceOrderService } from '../services/serviceOrderService';
import { mascaraCPF, mascaraCEP, formatarParaExibicaoDecimal, formatarTelefoneParaExibicao } from '../utils/Mascaras';
import { capitalizeText } from '../utils/capitalizeText';
import PhoneInput from 'react-phone-number-input';
import 'react-phone-number-input/style.css';
import Swal from 'sweetalert2';
import InputDate from '../components/InputDate';
import { formatCurrency } from '../utils/format';
import { addBusinessDays } from '../utils/addBusinessDays';

const OrdemServico = () => {
    const [currentStep, setCurrentStep] = useState(0);
    const [showForm, setShowForm] = useState(false);
    const [selectedOrder, setSelectedOrder] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [validationErrors, setValidationErrors] = useState({});
    const [isLoadingOrders, setIsLoadingOrders] = useState(true);
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
        paletoAjuste: false,
        paletoAjusteValor: '',
        paletoExtras: '',

        // Camisa
        camisaNumero: '',
        camisaCor: '',
        camisaManga: '',
        camisaAjuste: false,
        camisaAjusteValor: '',
        camisaExtras: '',

        // Calça
        calcaNumero: '',
        calcaCor: '',
        calcaCintura: '',
        calcaPerna: '',
        calcaAjusteCos: false,
        calcaAjusteComprimento: false,
        calcaAjusteCosValor: '',
        calcaAjusteComprimentoValor: '',
        calcaExtras: '',

        // Acessórios
        suspensorio: false,
        suspensorioCor: '',
        passante: false,
        passanteCor: '',
        passanteExtensor: false,
        lenco: false,
        lencoCor: '',
        gravata: false,
        gravataNumero: '',
        gravataCor: '',
        cinto: false,
        cintoNumero: '',
        cintoCor: '',
        sapato: false,
        sapatoNumero: '',
        sapatoCor: '',
        colete: false,
        coleteNumero: '',
        coleteCor: '',

        // Pagamento
        dataPedido: '',
        dataEvento: '',
        ocasiao: '',
        tipoPagamento: 'Aluguel',
        total: '',
        sinal: '',
        restante: '',
        dataRetirada: ''
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
        paletoAjuste: false,
        paletoAjusteValor: '',
        paletoExtras: '',

        // Camisa
        camisaNumero: '',
        camisaCor: '',
        camisaManga: '',
        camisaAjuste: false,
        camisaAjusteValor: '',
        camisaExtras: '',

        // Calça
        calcaNumero: '',
        calcaCor: '',
        calcaCintura: '',
        calcaPerna: '',
        calcaAjusteCos: false,
        calcaAjusteComprimento: false,
        calcaAjusteCosValor: '',
        calcaAjusteComprimentoValor: '',
        calcaExtras: '',

        // Acessórios
        suspensorio: false,
        suspensorioCor: '',
        passante: false,
        passanteCor: '',
        passanteExtensor: false,
        lenco: false,
        lencoCor: '',
        gravata: false,
        gravataNumero: '',
        gravataCor: '',
        cinto: false,
        cintoNumero: '',
        cintoCor: '',
        sapato: false,
        sapatoNumero: '',
        sapatoCor: '',
        colete: false,
        coleteNumero: '',
        coleteCor: '',

        // Pagamento
        dataPedido: '',
        dataEvento: '',
        ocasiao: '',
        tipoPagamento: 'Aluguel',
        total: '',
        sinal: '',
        restante: '',
        dataRetirada: ''
    });

    // Ref para debounce do cálculo do restante
    const debounceTimeout = useRef();

    const steps = [
        { label: 'Cliente' },
        { label: 'Paletó' },
        { label: 'Camisa' },
        { label: 'Calça' },
        { label: 'Acessórios' },
        { label: 'Pagamento' }
    ];

    const handleInputChange = (field, value) => {
        // Para campos de moeda, tratar valor numérico
        if (field === 'total' || field === 'sinal') {
            // Remove tudo que não for número
            let raw = value.replace(/[^\d]/g, '');
            if (raw === '') raw = '0';
            // Divide por 100 para considerar centavos
            const valor = (Number(raw) / 100).toFixed(2);
            setInputValues(prev => ({
                ...prev,
                [field]: valor
            }));
            // Debounce para cálculo do restante
            if (debounceTimeout.current) clearTimeout(debounceTimeout.current);
            debounceTimeout.current = setTimeout(() => {
                const total = parseFloat(field === 'total' ? valor : inputValues.total) || 0;
                const sinal = parseFloat(field === 'sinal' ? valor : inputValues.sinal) || 0;
                const restante = (total - sinal).toFixed(2);
                setInputValues(prev => ({
                    ...prev,
                    restante: restante
                }));
            }, 400);
            
            // Limpar erro do campo se foi preenchido corretamente
            if (validationErrors[field]) {
                const newErrors = { ...validationErrors };
                delete newErrors[field];
                setValidationErrors(newErrors);
            }
            return;
        }
        
        setInputValues(prev => ({
            ...prev,
            [field]: value
        }));
        
        // Limpar erro do campo se foi preenchido corretamente
        if (validationErrors[field]) {
            let shouldClear = false;
            
            // Para campos obrigatórios simples
            if (['nome', 'telefone', 'cpf', 'cep', 'rua', 'numero', 'bairro', 'cidade', 
                 'paletoNumero', 'paletoCor', 'paletoManga', 'camisaNumero', 'camisaCor', 'camisaManga',
                 'calcaNumero', 'calcaCor', 'calcaCintura', 'calcaPerna', 'dataPedido', 'dataEvento'].includes(field)) {
                shouldClear = value.trim() !== '';
            }
            
            // Para campos de ajuste (só limpar se checkbox estiver marcado)
            if (['paletoAjusteValor', 'camisaAjusteValor', 'calcaAjusteCosValor', 'calcaAjusteComprimentoValor'].includes(field)) {
                const checkboxField = field.replace('Valor', '');
                shouldClear = inputValues[checkboxField] && value.trim() !== '';
            }
            
            // Para campos de acessórios (só limpar se checkbox estiver marcado)
            if (['suspensorioCor', 'passanteCor', 'lencoCor'].includes(field)) {
                const checkboxField = field.replace('Cor', '');
                shouldClear = inputValues[checkboxField] && value.trim() !== '';
            }
            
            // Para campos de acessórios com número e cor
            if (['gravataNumero', 'gravataCor', 'cintoNumero', 'cintoCor', 'sapatoNumero', 'sapatoCor', 'coleteNumero', 'coleteCor'].includes(field)) {
                const baseField = field.replace(/Numero|Cor/, '');
                shouldClear = inputValues[baseField] && value.trim() !== '';
            }
            
            // Para campos de pagamento
            if (['total', 'sinal'].includes(field)) {
                shouldClear = parseFloat(value) > 0;
            }
            
            if (shouldClear) {
                const newErrors = { ...validationErrors };
                delete newErrors[field];
                setValidationErrors(newErrors);
            }
        }
    };

    const handleInputBlur = (field, value) => {
        // Para campos de moeda, garantir valor numérico no formData
        if (field === 'total' || field === 'sinal') {
            setFormData(prev => ({
                ...prev,
                [field]: inputValues[field]
            }));
            // Calcular restante
            const total = parseFloat(field === 'total' ? inputValues.total : formData.total) || 0;
            const sinal = parseFloat(field === 'sinal' ? inputValues.sinal : formData.sinal) || 0;
            const restante = (total - sinal).toFixed(2);
            setFormData(prev => ({
                ...prev,
                restante: restante
            }));
            setInputValues(prev => ({
                ...prev,
                restante: restante
            }));
            return;
        }
        setFormData(prev => ({
            ...prev,
            [field]: value
        }));
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
        
        // Se desmarcou um checkbox, limpar erros dos campos relacionados
        if (!value) {
            const newErrors = { ...validationErrors };
            
            // Mapear campos relacionados aos checkboxes
            const relatedFields = {
                paletoAjuste: ['paletoAjusteValor'],
                camisaAjuste: ['camisaAjusteValor'],
                calcaAjusteCos: ['calcaAjusteCosValor'],
                calcaAjusteComprimento: ['calcaAjusteComprimentoValor'],
                suspensorio: ['suspensorioCor'],
                passante: ['passanteCor'],
                lenco: ['lencoCor'],
                gravata: ['gravataNumero', 'gravataCor'],
                cinto: ['cintoNumero', 'cintoCor'],
                sapato: ['sapatoNumero', 'sapatoCor'],
                colete: ['coleteNumero', 'coleteCor']
            };
            
            if (relatedFields[field]) {
                relatedFields[field].forEach(relatedField => {
                    delete newErrors[relatedField];
                });
            }
            
            setValidationErrors(newErrors);
        }
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

    useEffect(() => {
        if (inputValues.dataEvento) {
            const retirada = addBusinessDays(new Date(inputValues.dataEvento), 2);
            const retiradaIso = retirada.toISOString().split('T')[0];
            setInputValues(prev => ({
                ...prev,
                dataRetirada: retiradaIso
            }));
            setFormData(prev => ({
                ...prev,
                dataRetirada: retiradaIso
            }));
        }
    }, [inputValues.dataEvento]);

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
            paletoNumero: '', paletoCor: '', paletoManga: '', paletoAjuste: false, paletoAjusteValor: '', paletoExtras: '',
            camisaNumero: '', camisaCor: '', camisaManga: '', camisaAjuste: false, camisaAjusteValor: '', camisaExtras: '',
            calcaNumero: '', calcaCor: '', calcaCintura: '', calcaPerna: '', calcaAjusteCos: false,
            calcaAjusteComprimento: false,
            calcaAjusteCosValor: '',
            calcaAjusteComprimentoValor: '',
            calcaExtras: '',
            suspensorio: false, suspensorioCor: '', passante: false, passanteCor: '', passanteExtensor: false, lenco: false, lencoCor: '', gravata: false, gravataNumero: '', gravataCor: '', cinto: false, cintoNumero: '', cintoCor: '', sapato: false, sapatoNumero: '', sapatoCor: '', colete: false, coleteNumero: '', coleteCor: '',
            dataPedido: '', dataEvento: '', ocasiao: '', tipoPagamento: 'Aluguel', total: '', sinal: '', restante: '', dataRetirada: ''
        });
        setInputValues({
            nome: '', telefone: '', cpf: '', cep: '', rua: '', numero: '', bairro: '', cidade: '',
            paletoNumero: '', paletoCor: '', paletoManga: '', paletoAjuste: false, paletoAjusteValor: '', paletoExtras: '',
            camisaNumero: '', camisaCor: '', camisaManga: '', camisaAjuste: false, camisaAjusteValor: '', camisaExtras: '',
            calcaNumero: '', calcaCor: '', calcaCintura: '', calcaPerna: '', calcaAjusteCos: false,
            calcaAjusteComprimento: false,
            calcaAjusteCosValor: '',
            calcaAjusteComprimentoValor: '',
            calcaExtras: '',
            suspensorio: false, suspensorioCor: '', passante: false, passanteCor: '', passanteExtensor: false, lenco: false, lencoCor: '', gravata: false, gravataNumero: '', gravataCor: '', cinto: false, cintoNumero: '', cintoCor: '', sapato: false, sapatoNumero: '', sapatoCor: '', colete: false, coleteNumero: '', coleteCor: '',
            dataPedido: '', dataEvento: '', ocasiao: '', tipoPagamento: 'Aluguel', total: '', sinal: '', restante: '', dataRetirada: ''
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
        
        // Formatar o telefone para o componente PhoneInput
        let telefoneFormatado = '';
        if (contact.phone) {
            telefoneFormatado = contact.phone.startsWith('+') ? contact.phone : `+55${contact.phone.substring(2)}`;
        }

        // Mapear os dados para o formato do formulário
        const clientData = {
            nome: client.name || '',
            telefone: telefoneFormatado,
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
            paletoAjuste: false,
            paletoAjusteValor: '',
            paletoExtras: '',

            // Camisa
            camisaNumero: '',
            camisaCor: '',
            camisaManga: '',
            camisaAjuste: false,
            camisaAjusteValor: '',
            camisaExtras: '',

            // Calça
            calcaNumero: '',
            calcaCor: '',
            calcaCintura: '',
            calcaPerna: '',
            calcaAjusteCos: false,
            calcaAjusteComprimento: false,
            calcaAjusteCosValor: '',
            calcaAjusteComprimentoValor: '',
            calcaExtras: '',

            // Acessórios
            suspensorio: false,
            suspensorioCor: '',
            passante: false,
            passanteCor: '',
            lenco: false,
            lencoCor: '',
            gravata: false,
            gravataNumero: '',
            gravataCor: '',
            cinto: false,
            cintoNumero: '',
            cintoCor: '',
            sapato: false,
            sapatoNumero: '',
            sapatoCor: '',
            colete: false,
            coleteNumero: '',
            coleteCor: '',

            // Pagamento
            dataPedido: order.order_date || '',
            dataEvento: order.event_date || '',
            ocasiao: order.occasion || '',
            tipoPagamento: 'Aluguel',
            total: order.total_value?.toString() || '',
            sinal: order.advance_payment?.toString() || '',
            restante: order.remaining_payment?.toString() || '',
            dataRetirada: order.pickup_date || ''
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
        const errors = validateFields();
        if (Object.keys(errors).length > 0) {
            setValidationErrors(errors);
            return;
        }

        setLoading(true);
        try {
            const orderData = {
                event_date: formData.dataEvento,
                total_value: parseFloat(formData.total) || 0,
                advance_payment: parseFloat(formData.sinal) || 0,
                remaining_payment: parseFloat(formData.restante) || 0,
                order_date: formData.dataPedido,
                pickup_date: formData.dataRetirada,
                client: {
                    name: formData.nome,
                    cpf: formData.cpf,
                    contacts: [
                        {
                            phone: formData.telefone ? formData.telefone.replace(/\D/g, '') : ''
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
                jacket_adjustment: formData.paletoAjuste ? formData.paletoAjusteValor : '',
                jacket_extras: formData.paletoExtras,
                shirt_number: formData.camisaNumero,
                shirt_color: formData.camisaCor,
                shirt_sleeve: formData.camisaManga,
                shirt_adjustment: formData.camisaAjuste ? formData.camisaAjusteValor : '',
                shirt_extras: formData.camisaExtras,
                pants_number: formData.calcaNumero,
                pants_color: formData.calcaCor,
                pants_waist: formData.calcaCintura,
                pants_leg: formData.calcaPerna,
                pants_adjustment_cos: formData.calcaAjusteCos ? formData.calcaAjusteCosValor : '',
                pants_adjustment_comprimento: formData.calcaAjusteComprimento ? formData.calcaAjusteComprimentoValor : '',
                pants_extras: formData.calcaExtras,
                suspenders: formData.suspensorio,
                suspenders_color: formData.suspensorioCor,
                belt_loop: formData.passante,
                belt_loop_color: formData.passanteCor,
                belt_loop_extensor: formData.passanteExtensor,
                tie: formData.lenco,
                tie_color: formData.lencoCor,
                tie_accessory: formData.gravata,
                tie_number: formData.gravataNumero,
                tie_color_accessory: formData.gravataCor,
                belt: formData.cinto,
                belt_number: formData.cintoNumero,
                belt_color: formData.cintoCor,
                shoes: formData.sapato,
                shoes_number: formData.sapatoNumero,
                shoes_color: formData.sapatoCor,
                vest: formData.colete,
                vest_number: formData.coleteNumero,
                vest_color: formData.coleteCor
            };

            if (selectedOrder) {
                await serviceOrderService.updateServiceOrder(selectedOrder.id, orderData);
                Swal.fire({
                    icon: 'success',
                    title: 'Sucesso!',
                    text: 'Ordem de serviço atualizada com sucesso!',
                    timer: 2000,
                    showConfirmButton: false
                });
            } else {
                await serviceOrderService.createServiceOrder(orderData);
                Swal.fire({
                    icon: 'success',
                    title: 'Sucesso!',
                    text: 'Ordem de serviço criada com sucesso!',
                    timer: 2000,
                    showConfirmButton: false
                });
            }
            
            handleBackToList();
        } catch (error) {
            console.error('Erro ao salvar ordem de serviço:', error);
            Swal.fire({
                icon: 'error',
                title: 'Erro!',
                text: 'Erro ao salvar a ordem de serviço',
                timer: 3000,
                showConfirmButton: false
            });
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
                const paletoBaseValid = inputValues.paletoNumero.trim() !== '' && 
                       inputValues.paletoCor.trim() !== '' && 
                       inputValues.paletoManga.trim() !== '';
                const paletoAjusteValid = !inputValues.paletoAjuste || inputValues.paletoAjusteValor.trim() !== '';
                return paletoBaseValid && paletoAjusteValid;
            
            case 2: // Camisa
                const camisaBaseValid = inputValues.camisaNumero.trim() !== '' && 
                       inputValues.camisaCor.trim() !== '' && 
                       inputValues.camisaManga.trim() !== '';
                const camisaAjusteValid = !inputValues.camisaAjuste || inputValues.camisaAjusteValor.trim() !== '';
                return camisaBaseValid && camisaAjusteValid;
            
            case 3: // Calça
                const calcaBaseValid = inputValues.calcaNumero.trim() !== '' && 
                       inputValues.calcaCor.trim() !== '' && 
                       inputValues.calcaCintura.trim() !== '' && 
                       inputValues.calcaPerna.trim() !== '';
                
                // Validar ajustes apenas se os checkboxes estiverem marcados
                const calcaAjusteCosValid = !inputValues.calcaAjusteCos || inputValues.calcaAjusteCosValor.trim() !== '';
                const calcaAjusteComprimentoValid = !inputValues.calcaAjusteComprimento || inputValues.calcaAjusteComprimentoValor.trim() !== '';
                
                return calcaBaseValid && calcaAjusteCosValid && calcaAjusteComprimentoValid;
            
            case 4: // Acessórios
                // Acessórios não são obrigatórios por padrão
                // Se um checkbox estiver marcado, os campos correspondentes se tornam obrigatórios
                const suspensorioValid = !inputValues.suspensorio || inputValues.suspensorioCor.trim() !== '';
                const passanteValid = !inputValues.passante || inputValues.passanteCor.trim() !== '';
                const lencoValid = !inputValues.lenco || inputValues.lencoCor.trim() !== '';
                const gravataValid = !inputValues.gravata || (inputValues.gravataNumero.trim() !== '' && inputValues.gravataCor.trim() !== '');
                const cintoValid = !inputValues.cinto || (inputValues.cintoNumero.trim() !== '' && inputValues.cintoCor.trim() !== '');
                const sapatoValid = !inputValues.sapato || (inputValues.sapatoNumero.trim() !== '' && inputValues.sapatoCor.trim() !== '');
                const coleteValid = !inputValues.colete || (inputValues.coleteNumero.trim() !== '' && inputValues.coleteCor.trim() !== '');
                
                const acessoriosValid = suspensorioValid && passanteValid && lencoValid && gravataValid && cintoValid && sapatoValid && coleteValid;
                
                // Debug: mostrar quais campos estão falhando
                if (!acessoriosValid) {
                    console.log('Validação acessórios falhou:');
                    console.log('Suspensorio:', inputValues.suspensorio, 'Cor:', inputValues.suspensorioCor, 'Valid:', suspensorioValid);
                    console.log('Passante:', inputValues.passante, 'Cor:', inputValues.passanteCor, 'Valid:', passanteValid);
                    console.log('Lenço:', inputValues.lenco, 'Cor:', inputValues.lencoCor, 'Valid:', lencoValid);
                    console.log('Gravata:', inputValues.gravata, 'Número:', inputValues.gravataNumero, 'Cor:', inputValues.gravataCor, 'Valid:', gravataValid);
                    console.log('Cinto:', inputValues.cinto, 'Número:', inputValues.cintoNumero, 'Cor:', inputValues.cintoCor, 'Valid:', cintoValid);
                    console.log('Sapato:', inputValues.sapato, 'Número:', inputValues.sapatoNumero, 'Cor:', inputValues.sapatoCor, 'Valid:', sapatoValid);
                    console.log('Colete:', inputValues.colete, 'Número:', inputValues.coleteNumero, 'Cor:', inputValues.coleteCor, 'Valid:', coleteValid);
                }
                
                return acessoriosValid;
            
            case 5: // Pagamento
                return inputValues.dataPedido.trim() !== '' && 
                       inputValues.dataEvento.trim() !== '' && 
                       parseFloat(inputValues.total) > 0 && 
                       inputValues.sinal.trim() !== '';
            
            default:
                return true;
        }
    };

    // Função para validar campos específicos e retornar erros
    const validateFields = () => {
        const errors = {};
        
        switch (currentStep) {
            case 0: // Cliente
                if (!inputValues.nome.trim()) errors.nome = 'Nome é obrigatório';
                if (!inputValues.telefone.trim()) errors.telefone = 'Telefone é obrigatório';
                if (!inputValues.cpf.trim()) errors.cpf = 'CPF é obrigatório';
                if (!inputValues.cep.trim()) errors.cep = 'CEP é obrigatório';
                if (!inputValues.rua.trim()) errors.rua = 'Endereço é obrigatório';
                if (!inputValues.numero.trim()) errors.numero = 'Número é obrigatório';
                if (!inputValues.bairro.trim()) errors.bairro = 'Bairro é obrigatório';
                if (!inputValues.cidade.trim()) errors.cidade = 'Cidade é obrigatória';
                break;
                
            case 1: // Paletó
                if (!inputValues.paletoNumero.trim()) errors.paletoNumero = 'Número é obrigatório';
                if (!inputValues.paletoCor.trim()) errors.paletoCor = 'Cor é obrigatória';
                if (!inputValues.paletoManga.trim()) errors.paletoManga = 'Manga é obrigatória';
                if (inputValues.paletoAjuste && !inputValues.paletoAjusteValor.trim()) {
                    errors.paletoAjusteValor = 'Ajuste é obrigatório quando marcado';
                }
                break;
                
            case 2: // Camisa
                if (!inputValues.camisaNumero.trim()) errors.camisaNumero = 'Número é obrigatório';
                if (!inputValues.camisaCor.trim()) errors.camisaCor = 'Cor é obrigatória';
                if (!inputValues.camisaManga.trim()) errors.camisaManga = 'Manga é obrigatória';
                if (inputValues.camisaAjuste && !inputValues.camisaAjusteValor.trim()) {
                    errors.camisaAjusteValor = 'Ajuste é obrigatório quando marcado';
                }
                break;
                
            case 3: // Calça
                if (!inputValues.calcaNumero.trim()) errors.calcaNumero = 'Número é obrigatório';
                if (!inputValues.calcaCor.trim()) errors.calcaCor = 'Cor é obrigatória';
                if (!inputValues.calcaCintura.trim()) errors.calcaCintura = 'Cós é obrigatório';
                if (!inputValues.calcaPerna.trim()) errors.calcaPerna = 'Comprimento é obrigatório';
                if (inputValues.calcaAjusteCos && !inputValues.calcaAjusteCosValor.trim()) {
                    errors.calcaAjusteCosValor = 'Ajuste do cós é obrigatório quando marcado';
                }
                if (inputValues.calcaAjusteComprimento && !inputValues.calcaAjusteComprimentoValor.trim()) {
                    errors.calcaAjusteComprimentoValor = 'Ajuste do comprimento é obrigatório quando marcado';
                }
                break;
                
            case 4: // Acessórios
                if (inputValues.suspensorio && !inputValues.suspensorioCor.trim()) {
                    errors.suspensorioCor = 'Cor do suspensório é obrigatória quando marcado';
                }
                if (inputValues.passante && !inputValues.passanteCor.trim()) {
                    errors.passanteCor = 'Cor do passante é obrigatória quando marcado';
                }
                if (inputValues.lenco && !inputValues.lencoCor.trim()) {
                    errors.lencoCor = 'Cor do lenço é obrigatória quando marcado';
                }
                if (inputValues.gravata) {
                    if (!inputValues.gravataNumero.trim()) errors.gravataNumero = 'Número da gravata é obrigatório';
                    if (!inputValues.gravataCor.trim()) errors.gravataCor = 'Cor da gravata é obrigatória';
                }
                if (inputValues.cinto) {
                    if (!inputValues.cintoNumero.trim()) errors.cintoNumero = 'Número do cinto é obrigatório';
                    if (!inputValues.cintoCor.trim()) errors.cintoCor = 'Cor do cinto é obrigatória';
                }
                if (inputValues.sapato) {
                    if (!inputValues.sapatoNumero.trim()) errors.sapatoNumero = 'Número do sapato é obrigatório';
                    if (!inputValues.sapatoCor.trim()) errors.sapatoCor = 'Cor do sapato é obrigatória';
                }
                if (inputValues.colete) {
                    if (!inputValues.coleteNumero.trim()) errors.coleteNumero = 'Número do colete é obrigatório';
                    if (!inputValues.coleteCor.trim()) errors.coleteCor = 'Cor do colete é obrigatória';
                }
                break;
                
            case 5: // Pagamento
                if (!inputValues.dataPedido.trim()) errors.dataPedido = 'Data do pedido é obrigatória';
                if (!inputValues.dataEvento.trim()) errors.dataEvento = 'Data do evento é obrigatória';
                if (!inputValues.total.trim() || parseFloat(inputValues.total) <= 0) errors.total = 'Total deve ser maior que zero';
                if (!inputValues.sinal.trim()) errors.sinal = 'Sinal é obrigatório';
                break;
        }
        
        return errors;
    };

    const nextStep = () => {
        if (currentStep < steps.length - 1) {
            const errors = validateFields();
            if (Object.keys(errors).length === 0) {
                setValidationErrors({});
                setCurrentStep(currentStep + 1);
            } else {
                setValidationErrors(errors);
            }
        }
    };

    const prevStep = () => {
        if (currentStep > 0) {
            setValidationErrors({});
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
                                    className={validationErrors.nome ? 'error' : ''}
                                />
                                {validationErrors.nome && (
                                    <div className="error-message">{validationErrors.nome}</div>
                                )}
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
                                    className={validationErrors.telefone ? 'error' : ''}
                                />
                                {validationErrors.telefone && (
                                    <div className="error-message">{validationErrors.telefone}</div>
                                )}
                            </div>
                            <div className="form-group">
                                <label>CPF <span style={{ color: 'red' }}>*</span></label>
                                <input
                                    type="text"
                                    value={mascaraCPF(inputValues.cpf)}
                                    onChange={(e) => handleInputChange('cpf', e.target.value)}
                                    onBlur={(e) => handleInputBlur('cpf', e.target.value)}
                                    placeholder="000.000.000-00"
                                    className={validationErrors.cpf ? 'error' : ''}
                                />
                                {validationErrors.cpf && (
                                    <div className="error-message">{validationErrors.cpf}</div>
                                )}
                            </div>
                            <div className="form-group">
                                <label>CEP <span style={{ color: 'red' }}>*</span></label>
                                <input
                                    type="text"
                                    value={mascaraCEP(inputValues.cep)}
                                    onChange={(e) => handleInputChange('cep', e.target.value)}
                                    onBlur={(e) => handleInputBlur('cep', e.target.value)}
                                    placeholder="00000-000"
                                    className={validationErrors.cep ? 'error' : ''}
                                />
                                {validationErrors.cep && (
                                    <div className="error-message">{validationErrors.cep}</div>
                                )}
                            </div>
                            <div className="form-group">
                                <label>Endereço <span style={{ color: 'red' }}>*</span></label>
                                <input
                                    type="text"
                                    value={capitalizeText(inputValues.rua)}
                                    onChange={(e) => handleInputChange('rua', e.target.value)}
                                    onBlur={(e) => handleInputBlur('rua', e.target.value)}
                                    placeholder="Nome da rua"
                                    className={validationErrors.rua ? 'error' : ''}
                                />
                                {validationErrors.rua && (
                                    <div className="error-message">{validationErrors.rua}</div>
                                )}
                            </div>
                            <div className="form-group">
                                <label>Número <span style={{ color: 'red' }}>*</span></label>
                                <input
                                    type="text"
                                    value={inputValues.numero}
                                    onChange={(e) => handleInputChange('numero', e.target.value)}
                                    onBlur={(e) => handleInputBlur('numero', e.target.value)}
                                    placeholder="Número"
                                    className={validationErrors.numero ? 'error' : ''}
                                />
                                {validationErrors.numero && (
                                    <div className="error-message">{validationErrors.numero}</div>
                                )}
                            </div>
                            <div className="form-group">
                                <label>Bairro <span style={{ color: 'red' }}>*</span></label>
                                <input
                                    type="text"
                                    value={capitalizeText(inputValues.bairro)}
                                    onChange={(e) => handleInputChange('bairro', e.target.value)}
                                    onBlur={(e) => handleInputBlur('bairro', e.target.value)}
                                    placeholder="Nome do bairro"
                                    className={validationErrors.bairro ? 'error' : ''}
                                />
                                {validationErrors.bairro && (
                                    <div className="error-message">{validationErrors.bairro}</div>
                                )}
                            </div>
                            <div className="form-group">
                                <label>Cidade <span style={{ color: 'red' }}>*</span></label>
                                <input
                                    type="text"
                                    value={capitalizeText(inputValues.cidade)}
                                    onChange={(e) => handleInputChange('cidade', e.target.value)}
                                    onBlur={(e) => handleInputBlur('cidade', e.target.value)}
                                    placeholder="Nome da cidade"
                                    className={validationErrors.cidade ? 'error' : ''}
                                />
                                {validationErrors.cidade && (
                                    <div className="error-message">{validationErrors.cidade}</div>
                                )}
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
                                    className={validationErrors.paletoNumero ? 'error' : ''}
                                />
                                {validationErrors.paletoNumero && (
                                    <div className="error-message">{validationErrors.paletoNumero}</div>
                                )}
                            </div>
                            <div className="form-group">
                                <label>Cor <span style={{ color: 'red' }}>*</span></label>
                                <input
                                    type="text"
                                    value={inputValues.paletoCor}
                                    onChange={(e) => handleInputChange('paletoCor', e.target.value)}
                                    onBlur={(e) => handleInputBlur('paletoCor', e.target.value)}
                                    placeholder="Cor do paletó"
                                    className={validationErrors.paletoCor ? 'error' : ''}
                                />
                                {validationErrors.paletoCor && (
                                    <div className="error-message">{validationErrors.paletoCor}</div>
                                )}
                            </div>
                            <div className="form-group">
                                <label>Manga <span style={{ color: 'red' }}>*</span></label>
                                <input
                                    type="text"
                                    value={inputValues.paletoManga}
                                    onChange={(e) => handleInputChange('paletoManga', e.target.value)}
                                    onBlur={(e) => handleInputBlur('paletoManga', e.target.value)}
                                    placeholder="Medida da manga"
                                    className={validationErrors.paletoManga ? 'error' : ''}
                                />
                                {validationErrors.paletoManga && (
                                    <div className="error-message">{validationErrors.paletoManga}</div>
                                )}
                            </div>
                            <div className="form-group">
                                <label style={{ display: 'flex', alignItems: 'center' }}>
                                    <input
                                        type="checkbox"
                                        checked={inputValues.paletoAjuste}
                                        onChange={(e) => handleCheckboxChange('paletoAjuste', e.target.checked)}
                                        style={{ marginRight: '8px' }}
                                    />
                                    Ajuste (cm)
                                </label>
                                <input
                                    type="number"
                                    value={inputValues.paletoAjusteValor}
                                    onChange={(e) => handleInputChange('paletoAjusteValor', e.target.value)}
                                    onBlur={(e) => handleInputBlur('paletoAjusteValor', e.target.value)}
                                    placeholder="Ajuste em centímetros"
                                    disabled={!inputValues.paletoAjuste}
                                    className={validationErrors.paletoAjusteValor ? 'error' : ''}
                                />
                                {validationErrors.paletoAjusteValor && (
                                    <div className="error-message">{validationErrors.paletoAjusteValor}</div>
                                )}
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
                                    className={validationErrors.camisaNumero ? 'error' : ''}
                                />
                                {validationErrors.camisaNumero && (
                                    <div className="error-message">{validationErrors.camisaNumero}</div>
                                )}
                            </div>
                            <div className="form-group">
                                <label>Cor <span style={{ color: 'red' }}>*</span></label>
                                <input
                                    type="text"
                                    value={inputValues.camisaCor}
                                    onChange={(e) => handleInputChange('camisaCor', e.target.value)}
                                    onBlur={(e) => handleInputBlur('camisaCor', e.target.value)}
                                    placeholder="Cor da camisa"
                                    className={validationErrors.camisaCor ? 'error' : ''}
                                />
                                {validationErrors.camisaCor && (
                                    <div className="error-message">{validationErrors.camisaCor}</div>
                                )}
                            </div>
                            <div className="form-group">
                                <label>Manga <span style={{ color: 'red' }}>*</span></label>
                                <input
                                    type="text"
                                    value={inputValues.camisaManga}
                                    onChange={(e) => handleInputChange('camisaManga', e.target.value)}
                                    onBlur={(e) => handleInputBlur('camisaManga', e.target.value)}
                                    placeholder="Medida da manga"
                                    className={validationErrors.camisaManga ? 'error' : ''}
                                />
                                {validationErrors.camisaManga && (
                                    <div className="error-message">{validationErrors.camisaManga}</div>
                                )}
                            </div>
                            <div className="form-group">
                                <label style={{ display: 'flex', alignItems: 'center' }}>
                                    <input
                                        type="checkbox"
                                        checked={inputValues.camisaAjuste}
                                        onChange={(e) => handleCheckboxChange('camisaAjuste', e.target.checked)}
                                        style={{ marginRight: '8px' }}
                                    />
                                    Ajuste (cm)
                                </label>
                                <input
                                    type="number"
                                    value={inputValues.camisaAjusteValor}
                                    onChange={(e) => handleInputChange('camisaAjusteValor', e.target.value)}
                                    onBlur={(e) => handleInputBlur('camisaAjusteValor', e.target.value)}
                                    placeholder="Ajuste em centímetros"
                                    disabled={!inputValues.camisaAjuste}
                                    className={validationErrors.camisaAjusteValor ? 'error' : ''}
                                />
                                {validationErrors.camisaAjusteValor && (
                                    <div className="error-message">{validationErrors.camisaAjusteValor}</div>
                                )}
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
                                    className={validationErrors.calcaNumero ? 'error' : ''}
                                />
                                {validationErrors.calcaNumero && (
                                    <div className="error-message">{validationErrors.calcaNumero}</div>
                                )}
                            </div>
                            <div className="form-group">
                                <label>Cor <span style={{ color: 'red' }}>*</span></label>
                                <input
                                    type="text"
                                    value={inputValues.calcaCor}
                                    onChange={(e) => handleInputChange('calcaCor', e.target.value)}
                                    onBlur={(e) => handleInputBlur('calcaCor', e.target.value)}
                                    placeholder="Cor da calça"
                                    className={validationErrors.calcaCor ? 'error' : ''}
                                />
                                {validationErrors.calcaCor && (
                                    <div className="error-message">{validationErrors.calcaCor}</div>
                                )}
                            </div>
                            <div className="form-group">
                                <label>Cós <span style={{ color: 'red' }}>*</span></label>
                                <input
                                    type="text"
                                    value={inputValues.calcaCintura}
                                    onChange={(e) => handleInputChange('calcaCintura', e.target.value)}
                                    onBlur={(e) => handleInputBlur('calcaCintura', e.target.value)}
                                    placeholder="Medida do cós"
                                    className={validationErrors.calcaCintura ? 'error' : ''}
                                />
                                {validationErrors.calcaCintura && (
                                    <div className="error-message">{validationErrors.calcaCintura}</div>
                                )}
                            </div>
                            <div className="form-group">
                                <label style={{ display: 'flex', alignItems: 'center' }}>
                                    <input
                                        type="checkbox"
                                        checked={inputValues.calcaAjusteCos}
                                        onChange={(e) => handleCheckboxChange('calcaAjusteCos', e.target.checked)}
                                        style={{ marginRight: '8px' }}
                                    />
                                    Ajuste do Cós (cm)
                                </label>
                                <input
                                    type="number"
                                    value={inputValues.calcaAjusteCosValor}
                                    onChange={(e) => handleInputChange('calcaAjusteCosValor', e.target.value)}
                                    onBlur={(e) => handleInputBlur('calcaAjusteCosValor', e.target.value)}
                                    placeholder="Ajuste do cós em centímetros"
                                    disabled={!inputValues.calcaAjusteCos}
                                    className={validationErrors.calcaAjusteCosValor ? 'error' : ''}
                                />
                                {validationErrors.calcaAjusteCosValor && (
                                    <div className="error-message">{validationErrors.calcaAjusteCosValor}</div>
                                )}
                            </div>
                            <div className="form-group">
                                <label>Comprimento <span style={{ color: 'red' }}>*</span></label>
                                <input
                                    type="text"
                                    value={inputValues.calcaPerna}
                                    onChange={(e) => handleInputChange('calcaPerna', e.target.value)}
                                    onBlur={(e) => handleInputBlur('calcaPerna', e.target.value)}
                                    placeholder="Medida do comprimento"
                                    className={validationErrors.calcaPerna ? 'error' : ''}
                                />
                                {validationErrors.calcaPerna && (
                                    <div className="error-message">{validationErrors.calcaPerna}</div>
                                )}
                            </div>
                            <div className="form-group">
                                <label style={{ display: 'flex', alignItems: 'center' }}>
                                    <input
                                        type="checkbox"
                                        checked={inputValues.calcaAjusteComprimento}
                                        onChange={(e) => handleCheckboxChange('calcaAjusteComprimento', e.target.checked)}
                                        style={{ marginRight: '8px' }}
                                    />
                                    Ajuste do Comprimento (cm)
                                </label>
                                <input
                                    type="number"
                                    value={inputValues.calcaAjusteComprimentoValor}
                                    onChange={(e) => handleInputChange('calcaAjusteComprimentoValor', e.target.value)}
                                    onBlur={(e) => handleInputBlur('calcaAjusteComprimentoValor', e.target.value)}
                                    placeholder="Ajuste do comprimento em centímetros"
                                    disabled={!inputValues.calcaAjusteComprimento}
                                    className={validationErrors.calcaAjusteComprimentoValor ? 'error' : ''}
                                />
                                {validationErrors.calcaAjusteComprimentoValor && (
                                    <div className="error-message">{validationErrors.calcaAjusteComprimentoValor}</div>
                                )}
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
                            {/* Suspensório */}
                            <div className="form-group">
                                <label style={{ display: 'flex', alignItems: 'center' }}>
                                    <input
                                        type="checkbox"
                                        checked={inputValues.suspensorio}
                                        onChange={(e) => handleCheckboxChange('suspensorio', e.target.checked)}
                                        style={{ marginRight: '8px' }}
                                    />
                                    Suspensório
                                </label>
                                <input
                                    type="text"
                                    value={inputValues.suspensorioCor}
                                    onChange={(e) => handleInputChange('suspensorioCor', e.target.value)}
                                    onBlur={(e) => handleInputBlur('suspensorioCor', e.target.value)}
                                    placeholder="Cor do suspensório"
                                    disabled={!inputValues.suspensorio}
                                    className={validationErrors.suspensorioCor ? 'error' : ''}
                                />
                                {validationErrors.suspensorioCor && (
                                    <div className="error-message">{validationErrors.suspensorioCor}</div>
                                )}
                            </div>

                            {/* Passante */}
                            <div className="form-group">
                                <div>
                                <label style={{ display: 'flex', alignItems: 'center' }}>
                                    <input
                                        type="checkbox"
                                        checked={inputValues.passante}
                                        onChange={(e) => handleCheckboxChange('passante', e.target.checked)}
                                        style={{ marginRight: '8px' }}
                                    />
                                    Passante
                                </label>

                                <label style={{ display: 'flex', alignItems: 'center' }}>
                                        <input
                                            type="checkbox"
                                            checked={inputValues.passanteExtensor}
                                            onChange={(e) => handleCheckboxChange('passanteExtensor', e.target.checked)}
                                            style={{ marginRight: '8px' }}
                                            disabled={!inputValues.passante}
                                        />
                                        Extensor
                                    </label>
                                    </div>
                                <input
                                    type="text"
                                    value={inputValues.passanteCor}
                                    onChange={(e) => handleInputChange('passanteCor', e.target.value)}
                                    onBlur={(e) => handleInputBlur('passanteCor', e.target.value)}
                                    placeholder="Cor do passante"
                                    disabled={!inputValues.passante}
                                    className={validationErrors.passanteCor ? 'error' : ''}
                                />
                                {validationErrors.passanteCor && (
                                    <div className="error-message">{validationErrors.passanteCor}</div>
                                )}
                                <div style={{ marginTop: '8px' }}>
                           
                                </div>
                            </div>

                            {/* Lenço */}
                            <div className="form-group">
                                <label style={{ display: 'flex', alignItems: 'center' }}>
                                    <input
                                        type="checkbox"
                                        checked={inputValues.lenco}
                                        onChange={(e) => handleCheckboxChange('lenco', e.target.checked)}
                                        style={{ marginRight: '8px' }}
                                    />
                                    Lenço
                                </label>
                                <input
                                    type="text"
                                    value={inputValues.lencoCor}
                                    onChange={(e) => handleInputChange('lencoCor', e.target.value)}
                                    onBlur={(e) => handleInputBlur('lencoCor', e.target.value)}
                                    placeholder="Cor do lenço"
                                    disabled={!inputValues.lenco}
                                    className={validationErrors.lencoCor ? 'error' : ''}
                                />
                                {validationErrors.lencoCor && (
                                    <div className="error-message">{validationErrors.lencoCor}</div>
                                )}
                            </div>

                            {/* Gravata */}
                            <div className="form-group">
                                <label style={{ display: 'flex', alignItems: 'center' }}>
                                    <input
                                        type="checkbox"
                                        checked={inputValues.gravata}
                                        onChange={(e) => handleCheckboxChange('gravata', e.target.checked)}
                                        style={{ marginRight: '8px' }}
                                    />
                                    Gravata
                                </label>
                                <div style={{ display: 'flex', gap: '10px' }}>
                                    <input
                                        type="text"
                                        value={inputValues.gravataNumero}
                                        onChange={(e) => handleInputChange('gravataNumero', e.target.value)}
                                        onBlur={(e) => handleInputBlur('gravataNumero', e.target.value)}
                                        placeholder="Número"
                                        disabled={!inputValues.gravata}
                                        style={{ flex: 1 }}
                                        className={validationErrors.gravataNumero ? 'error' : ''}
                                    />
                                    <input
                                        type="text"
                                        value={inputValues.gravataCor}
                                        onChange={(e) => handleInputChange('gravataCor', e.target.value)}
                                        onBlur={(e) => handleInputBlur('gravataCor', e.target.value)}
                                        placeholder="Cor"
                                        disabled={!inputValues.gravata}
                                        style={{ flex: 1 }}
                                        className={validationErrors.gravataCor ? 'error' : ''}
                                    />
                                </div>
                                {(validationErrors.gravataNumero || validationErrors.gravataCor) && (
                                    <div className="error-message">
                                        {validationErrors.gravataNumero || validationErrors.gravataCor}
                                    </div>
                                )}
                            </div>

                            {/* Cinto */}
                            <div className="form-group">
                                <label style={{ display: 'flex', alignItems: 'center' }}>
                                    <input
                                        type="checkbox"
                                        checked={inputValues.cinto}
                                        onChange={(e) => handleCheckboxChange('cinto', e.target.checked)}
                                        style={{ marginRight: '8px' }}
                                    />
                                    Cinto
                                </label>
                                <div style={{ display: 'flex', gap: '10px' }}>
                                    <input
                                        type="text"
                                        value={inputValues.cintoNumero}
                                        onChange={(e) => handleInputChange('cintoNumero', e.target.value)}
                                        onBlur={(e) => handleInputBlur('cintoNumero', e.target.value)}
                                        placeholder="Número"
                                        disabled={!inputValues.cinto}
                                        style={{ flex: 1 }}
                                        className={validationErrors.cintoNumero ? 'error' : ''}
                                    />
                                    <input
                                        type="text"
                                        value={inputValues.cintoCor}
                                        onChange={(e) => handleInputChange('cintoCor', e.target.value)}
                                        onBlur={(e) => handleInputBlur('cintoCor', e.target.value)}
                                        placeholder="Cor"
                                        disabled={!inputValues.cinto}
                                        style={{ flex: 1 }}
                                        className={validationErrors.cintoCor ? 'error' : ''}
                                    />
                                </div>
                                {(validationErrors.cintoNumero || validationErrors.cintoCor) && (
                                    <div className="error-message">
                                        {validationErrors.cintoNumero || validationErrors.cintoCor}
                                    </div>
                                )}
                            </div>

                            {/* Sapato */}
                            <div className="form-group">
                                <label style={{ display: 'flex', alignItems: 'center' }}>
                                    <input
                                        type="checkbox"
                                        checked={inputValues.sapato}
                                        onChange={(e) => handleCheckboxChange('sapato', e.target.checked)}
                                        style={{ marginRight: '8px' }}
                                    />
                                    Sapato
                                </label>
                                <div style={{ display: 'flex', gap: '10px' }}>
                                    <input
                                        type="text"
                                        value={inputValues.sapatoNumero}
                                        onChange={(e) => handleInputChange('sapatoNumero', e.target.value)}
                                        onBlur={(e) => handleInputBlur('sapatoNumero', e.target.value)}
                                        placeholder="Número"
                                        disabled={!inputValues.sapato}
                                        style={{ flex: 1 }}
                                        className={validationErrors.sapatoNumero ? 'error' : ''}
                                    />
                                    <input
                                        type="text"
                                        value={inputValues.sapatoCor}
                                        onChange={(e) => handleInputChange('sapatoCor', e.target.value)}
                                        onBlur={(e) => handleInputBlur('sapatoCor', e.target.value)}
                                        placeholder="Cor"
                                        disabled={!inputValues.sapato}
                                        style={{ flex: 1 }}
                                        className={validationErrors.sapatoCor ? 'error' : ''}
                                    />
                                </div>
                                {(validationErrors.sapatoNumero || validationErrors.sapatoCor) && (
                                    <div className="error-message">
                                        {validationErrors.sapatoNumero || validationErrors.sapatoCor}
                                    </div>
                                )}
                            </div>

                            {/* Colete */}
                            <div className="form-group">
                                <label style={{ display: 'flex', alignItems: 'center' }}>
                                    <input
                                        type="checkbox"
                                        checked={inputValues.colete}
                                        onChange={(e) => handleCheckboxChange('colete', e.target.checked)}
                                        style={{ marginRight: '8px' }}
                                    />
                                    Colete
                                </label>
                                <div style={{ display: 'flex', gap: '10px' }}>
                                    <input
                                        type="text"
                                        value={inputValues.coleteNumero}
                                        onChange={(e) => handleInputChange('coleteNumero', e.target.value)}
                                        onBlur={(e) => handleInputBlur('coleteNumero', e.target.value)}
                                        placeholder="Número"
                                        disabled={!inputValues.colete}
                                        style={{ flex: 1 }}
                                        className={validationErrors.coleteNumero ? 'error' : ''}
                                    />
                                    <input
                                        type="text"
                                        value={inputValues.coleteCor}
                                        onChange={(e) => handleInputChange('coleteCor', e.target.value)}
                                        onBlur={(e) => handleInputBlur('coleteCor', e.target.value)}
                                        placeholder="Cor"
                                        disabled={!inputValues.colete}
                                        style={{ flex: 1 }}
                                        className={validationErrors.coleteCor ? 'error' : ''}
                                    />
                                </div>
                                {(validationErrors.coleteNumero || validationErrors.coleteCor) && (
                                    <div className="error-message">
                                        {validationErrors.coleteNumero || validationErrors.coleteCor}
                                    </div>
                                )}
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
                                <InputDate
                                    selectedDate={inputValues.dataPedido ? new Date(inputValues.dataPedido) : null}
                                    onDateChange={(date) => {
                                        const isoDate = date ? date.toISOString().split('T')[0] : '';
                                        handleInputChange('dataPedido', isoDate);
                                        handleInputBlur('dataPedido', isoDate);
                                    }}
                                    placeholderText="Selecione a data do pedido"
                                    className={validationErrors.dataPedido ? 'error' : ''}
                                />
                                {validationErrors.dataPedido && (
                                    <div className="error-message">{validationErrors.dataPedido}</div>
                                )}
                            </div>
                            <div className="form-group">
                                <label>Data do Evento <span style={{ color: 'red' }}>*</span></label>
                                <InputDate
                                    selectedDate={inputValues.dataEvento ? new Date(inputValues.dataEvento) : null}
                                    onDateChange={(date) => {
                                        const isoDate = date ? date.toISOString().split('T')[0] : '';
                                        handleInputChange('dataEvento', isoDate);
                                        handleInputBlur('dataEvento', isoDate);

                                        // Preencher dataRetirada automaticamente se estiver vazia
                                        if (!inputValues.dataRetirada && date) {
                                            const retirada = addBusinessDays(date, 2);
                                            const retiradaIso = retirada.toISOString().split('T')[0];
                                            handleInputChange('dataRetirada', retiradaIso);
                                            handleInputBlur('dataRetirada', retiradaIso);
                                        }
                                    }}
                                    placeholderText="Selecione a data do evento"
                                    className={validationErrors.dataEvento ? 'error' : ''}
                                />
                                {validationErrors.dataEvento && (
                                    <div className="error-message">{validationErrors.dataEvento}</div>
                                )}
                            </div>
                            <div className="form-group">
                                <label>Data da Retirada</label>
                                <InputDate
                                    selectedDate={inputValues.dataRetirada ? new Date(inputValues.dataRetirada) : null}
                                    onDateChange={(date) => {
                                        const isoDate = date ? date.toISOString().split('T')[0] : '';
                                        handleInputChange('dataRetirada', isoDate);
                                        handleInputBlur('dataRetirada', isoDate);
                                    }}
                                    placeholderText="Selecione a data da retirada"
                                />
                            </div>

                            <div className="form-group">
                                <label>Modalidade <span style={{ color: 'red' }}>*</span></label>
                                <select
                                    value={inputValues.tipoPagamento}
                                    onChange={(e) => handleSelectChange('tipoPagamento', e.target.value)}
                                >
                                
                                    <option value="Aluguel">Aluguel</option>
                                    <option value="Compra">Compra</option>
                                </select>
                            </div>
                            <div className="form-group">
                                <label>Total <span style={{ color: 'red' }}>*</span></label>
                                <input
                                    type="text"
                                    value={inputValues.total !== '' ? formatCurrency(Number(inputValues.total)) : ''}
                                    onChange={(e) => handleInputChange('total', e.target.value)}
                                    onBlur={(e) => handleInputBlur('total', inputValues.total)}
                                    placeholder="Valor total"
                                    className={validationErrors.total ? 'error' : ''}
                                />
                                {validationErrors.total && (
                                    <div className="error-message">{validationErrors.total}</div>
                                )}
                            </div>
                            <div className="form-group">
                                <label>Sinal <span style={{ color: 'red' }}>*</span></label>
                                <input
                                    type="text"
                                    value={inputValues.sinal !== '' ? formatCurrency(Number(inputValues.sinal)) : ''}
                                    onChange={(e) => handleInputChange('sinal', e.target.value)}
                                    onBlur={(e) => handleInputBlur('sinal', inputValues.sinal)}
                                    placeholder="Valor do sinal"
                                    className={validationErrors.sinal ? 'error' : ''}
                                />
                                {validationErrors.sinal && (
                                    <div className="error-message">{validationErrors.sinal}</div>
                                )}
                            </div>
                            <div className="form-group">
                                <label>Restante</label>
                                <input
                                    type="text"
                                    value={inputValues.restante !== '' ? formatCurrency(Number(inputValues.restante)) : ''}
                                    readOnly
                                    placeholder="Valor restante"
                                />
                            </div>
                        </div>
                    </div>
                );

            default:
                return null;
        }
    };

    // Função para limpar erro de um campo específico
    const clearFieldError = (field) => {
        if (validationErrors[field]) {
            const newErrors = { ...validationErrors };
            delete newErrors[field];
            setValidationErrors(newErrors);
        }
    };

    // Componente para exibir mensagens de erro
    const ValidationError = ({ errors }) => {
        if (Object.keys(errors).length === 0) return null;
        
        const errorMessages = Object.values(errors);
        
        return (
            <div className="validation-error">
                <strong>Por favor, corrija os seguintes campos:</strong>
                <ul style={{ margin: '8px 0 0 0', paddingLeft: '20px' }}>
                    {errorMessages.map((message, index) => (
                        <li key={index}>{message}</li>
                    ))}
                </ul>
            </div>
        );
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
                                <ValidationError errors={validationErrors} />

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
                                            style={{width: "fit-content"}}
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
                                        <span className="value">{formatarTelefoneParaExibicao(formData.telefone)}</span>
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
                                            <span><strong>Ajuste:</strong> {formData.paletoAjuste ? formData.paletoAjusteValor : 'Não'}</span>
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
                                            <span><strong>Ajuste:</strong> {formData.camisaAjuste ? formData.camisaAjusteValor : 'Não'}</span>
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
                                            <span><strong>Cós:</strong> {formData.calcaCintura}</span>
                                            <span><strong>Comprimento:</strong> {formData.calcaPerna}</span>
                                            {formData.calcaAjusteCos && (
                                                <span><strong>Ajuste Cós:</strong> {formData.calcaAjusteCosValor} cm</span>
                                            )}
                                            {formData.calcaAjusteComprimento && (
                                                <span><strong>Ajuste Comprimento:</strong> {formData.calcaAjusteComprimentoValor} cm</span>
                                            )}
                                            <span><strong>Extras:</strong> {formData.calcaExtras}</span>
                                        </div>
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
                                        <span className="payment-label">Data da Retirada:</span>
                                        <span className="payment-value">{formData.dataRetirada ? new Date(formData.dataRetirada).toLocaleDateString('pt-BR') : ''}</span>
                                    </div>

                                    <div className="payment-item">
                                        <span className="payment-label">Tipo:</span>
                                        <span className="payment-value">{formData.tipoPagamento}</span>
                                    </div>
                                    <div className="payment-item highlight">
                                        <span className="payment-label">Total:</span>
                                        <span className="payment-value">{formatCurrency(Number(formData.total) || 0)}</span>
                                    </div>
                                    <div className="payment-item">
                                        <span className="payment-label">Sinal:</span>
                                        <span className="payment-value">{formatCurrency(Number(formData.sinal) || 0)}</span>
                                    </div>
                                    <div className="payment-item highlight">
                                        <span className="payment-label">Restante:</span>
                                        <span className="payment-value">{formatCurrency(Number(formData.restante) || 0)}</span>
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