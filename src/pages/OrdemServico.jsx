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
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import useColors from '../hooks/useColors';
import useBrands from '../hooks/useBrands';
import CustomSelect from '../components/CustomSelect';

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
        // Itens vendidos
        itensVendidos: [],

        // Paletó
        paletoNumero: '',
        paletoCor: '',
        paletoManga: '',
        paletoMarca: '',
        paletoAjuste: false,
        paletoAjusteValor: '',
        paletoExtras: '',

        // Camisa
        camisaNumero: '',
        camisaCor: '',
        camisaManga: '',
        camisaMarca: '',
        camisaAjuste: false,
        camisaAjusteValor: '',
        camisaExtras: '',

        // Calça
        calcaNumero: '',
        calcaCor: '',
        calcaCintura: '',
        calcaPerna: '',
        calcaMarca: '',
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
        gravataMarca: '',
        cinto: false,
        cintoNumero: '',
        cintoCor: '',
        cintoMarca: '',
        sapato: false,
        sapatoNumero: '',
        sapatoCor: '',
        sapatoMarca: '',
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
        dataRetirada: '',
        dataDevolucao: ''
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
        // Itens vendidos
        itensVendidos: [],

        // Paletó
        paletoNumero: '',
        paletoCor: '',
        paletoManga: '',
        paletoMarca: '',
        paletoAjuste: false,
        paletoAjusteValor: '',
        paletoExtras: '',

        // Camisa
        camisaNumero: '',
        camisaCor: '',
        camisaManga: '',
        camisaMarca: '',
        camisaAjuste: false,
        camisaAjusteValor: '',
        camisaExtras: '',

        // Calça
        calcaNumero: '',
        calcaCor: '',
        calcaCintura: '',
        calcaPerna: '',
        calcaMarca: '',
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
        gravataMarca: '',
        cinto: false,
        cintoNumero: '',
        cintoCor: '',
        cintoMarca: '',
        sapato: false,
        sapatoNumero: '',
        sapatoCor: '',
        sapatoMarca: '',
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
        dataRetirada: '',
        dataDevolucao: ''
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

    const { colors, loading: loadingColors } = useColors();
    const { brands, loading: loadingBrands } = useBrands();

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
                 'calcaNumero', 'calcaCor', 'calcaCintura', 'calcaPerna', 'dataPedido', 'dataEvento', 'dataRetirada'].includes(field)) {
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
            if (['gravataCor', 'gravataDescricao', 'cintoCor', 'sapatoCor', 'sapatoDescricao', 'coleteCor', 'coleteDescricao'].includes(field)) {
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
        
        // Limpar erro do campo quando uma opção válida é selecionada
        if (value && validationErrors[field]) {
            setValidationErrors(prev => {
                const newErrors = { ...prev };
                delete newErrors[field];
                return newErrors;
            });
        }
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
                gravata: ['gravataCor', 'gravataDescricao'],
                cinto: ['cintoCor'],
                sapato: ['sapatoCor', 'sapatoDescricao'],
                colete: ['coleteCor', 'coleteDescricao']
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
            const devolucao = addBusinessDays(new Date(inputValues.dataEvento + 'T00:00:00'), 2);
            const devolucaoIso = devolucao.toISOString().split('T')[0];
            setInputValues(prev => ({
                ...prev,
                dataDevolucao: devolucaoIso
            }));
            setFormData(prev => ({
                ...prev,
                dataDevolucao: devolucaoIso
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
            paletoNumero: '', paletoCor: '', paletoManga: '', paletoMarca: '', paletoAjuste: false, paletoAjusteValor: '', paletoExtras: '',
            camisaNumero: '', camisaCor: '', camisaManga: '', camisaMarca: '', camisaAjuste: false, camisaAjusteValor: '', camisaExtras: '',
            calcaNumero: '', calcaCor: '', calcaCintura: '', calcaPerna: '', calcaMarca: '', calcaAjusteCos: false,
            calcaAjusteComprimento: false,
            calcaAjusteCosValor: '',
            calcaAjusteComprimentoValor: '',
            calcaExtras: '',
            suspensorio: false, suspensorioCor: '', passante: false, passanteCor: '', passanteExtensor: false, lenco: false, lencoCor: '', gravata: false, gravataNumero: '', gravataCor: '', gravataMarca: '', cinto: false, cintoNumero: '', cintoCor: '', cintoMarca: '', sapato: false, sapatoNumero: '', sapatoCor: '', sapatoMarca: '', colete: false, coleteNumero: '', coleteCor: '',
            dataPedido: '', dataEvento: '', ocasiao: '', tipoPagamento: 'Aluguel', total: '', sinal: '', restante: '', dataRetirada: ''
        });
        setInputValues({
            nome: '', telefone: '', cpf: '', cep: '', rua: '', numero: '', bairro: '', cidade: '',
            paletoNumero: '', paletoCor: '', paletoManga: '', paletoMarca: '', paletoAjuste: false, paletoAjusteValor: '', paletoExtras: '',
            camisaNumero: '', camisaCor: '', camisaManga: '', camisaMarca: '', camisaAjuste: false, camisaAjusteValor: '', camisaExtras: '',
            calcaNumero: '', calcaCor: '', calcaCintura: '', calcaPerna: '', calcaMarca: '', calcaAjusteCos: false,
            calcaAjusteComprimento: false,
            calcaAjusteCosValor: '',
            calcaAjusteComprimentoValor: '',
            calcaExtras: '',
            suspensorio: false, suspensorioCor: '', passante: false, passanteCor: '', passanteExtensor: false, lenco: false, lencoCor: '', gravata: false, gravataNumero: '', gravataCor: '', gravataMarca: '', cinto: false, cintoNumero: '', cintoCor: '', cintoMarca: '', sapato: false, sapatoNumero: '', sapatoCor: '', sapatoMarca: '', colete: false, coleteNumero: '', coleteCor: '',
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

        // Dados de OS detalhados
        const os = order.ordem_servico || {};
        const itens = Array.isArray(os.itens) ? os.itens : [];
        const acessorios = Array.isArray(os.acessorios) ? os.acessorios : [];

        const findItem = (tipo) => itens.find((i) => i.tipo === tipo) || {};
        const findAcessorio = (tipo) => acessorios.find((a) => a.tipo === tipo) || {};

        // Itens principais
        const paleto = findItem('paleto');
        const camisa = findItem('camisa');
        const calca = findItem('calca');
        const colete = findItem('colete');

        // Acessórios
        const suspensorio = findAcessorio('suspensorio');
        const passante = findAcessorio('passante');
        const lenco = findAcessorio('lenco');
        const gravata = findAcessorio('gravata');
        const cinto = findAcessorio('cinto');
        const sapato = findAcessorio('sapato');

        // Itens vendidos (quando modalidade for Aluguel + Venda)
        const modalidade = os.modalidade || 'Aluguel';
        const itensVendidos = modalidade === 'Aluguel + Venda'
            ? [
                ...itens.filter((i) => i.venda).map((i) => i.tipo),
                ...acessorios.filter((a) => a.venda).map((a) => a.tipo)
              ]
            : modalidade === 'Venda'
                ? [
                    'paleto',
                    'camisa',
                    'calca',
                    ...(suspensorio.tipo ? ['suspensorio'] : []),
                    ...(passante.tipo ? ['passante'] : []),
                    ...(lenco.tipo ? ['lenco'] : []),
                    ...(gravata.tipo ? ['gravata'] : []),
                    ...(cinto.tipo ? ['cinto'] : []),
                    ...(sapato.tipo ? ['sapato'] : []),
                    ...(colete.tipo ? ['colete'] : [])
                  ]
                : [];

        // Mapear dados do cliente
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

        // Pagamento e datas (prioriza dados dentro de ordem_servico)
        const pagamento = os.pagamento || {};

        const mappedData = {
            // Cliente
            ...clientData,

            // Controle de itens vendidos
            itensVendidos,

            // Paletó
            paletoNumero: paleto.numero || '',
            paletoCor: paleto.cor || '',
            paletoManga: paleto.manga || '',
            paletoMarca: paleto.marca ? String(paleto.marca) : '',
            paletoAjuste: !!(paleto.ajuste && String(paleto.ajuste).trim() !== ''),
            paletoAjusteValor: paleto.ajuste ? String(paleto.ajuste) : '',
            paletoExtras: paleto.extras || '',

            // Camisa
            camisaNumero: camisa.numero || '',
            camisaCor: camisa.cor || '',
            camisaManga: camisa.manga || '',
            camisaMarca: camisa.marca ? String(camisa.marca) : '',
            camisaAjuste: !!(camisa.ajuste && String(camisa.ajuste).trim() !== ''),
            camisaAjusteValor: camisa.ajuste ? String(camisa.ajuste) : '',
            camisaExtras: camisa.extras || '',

            // Calça
            calcaNumero: calca.numero || '',
            calcaCor: calca.cor || '',
            calcaCintura: calca.cintura || '',
            calcaPerna: calca.perna || '',
            calcaMarca: calca.marca ? String(calca.marca) : '',
            calcaAjusteCos: !!(calca.ajuste_cintura && String(calca.ajuste_cintura).trim() !== ''),
            calcaAjusteComprimento: !!(calca.ajuste_comprimento && String(calca.ajuste_comprimento).trim() !== ''),
            calcaAjusteCosValor: calca.ajuste_cintura ? String(calca.ajuste_cintura) : '',
            calcaAjusteComprimentoValor: calca.ajuste_comprimento ? String(calca.ajuste_comprimento) : '',
            calcaExtras: calca.extras || '',

            // Acessórios
            suspensorio: !!suspensorio.tipo,
            suspensorioCor: suspensorio.cor || '',
            passante: !!passante.tipo,
            passanteCor: passante.cor || '',
            passanteExtensor: !!passante.extensor,
            lenco: !!lenco.tipo,
            lencoCor: lenco.cor || '',
            gravata: !!gravata.tipo,
            gravataDescricao: gravata.descricao || '',
            gravataCor: gravata.cor || '',
            gravataMarca: gravata.marca ? String(gravata.marca) : '',
            cinto: !!cinto.tipo,
            cintoCor: cinto.cor || '',
            cintoMarca: cinto.marca ? String(cinto.marca) : '',
            sapato: !!sapato.tipo,
            sapatoDescricao: sapato.descricao || '',
            sapatoCor: sapato.cor || '',
            sapatoNumero: sapato.numero || '',
            sapatoMarca: sapato.marca ? String(sapato.marca) : '',
            colete: !!colete.tipo,
            coleteNumero: colete.numero || '',
            coleteCor: colete.cor || '',
            coleteDescricao: colete.extras || '',

            // Pagamento
            dataPedido: order.order_date || os.data_pedido || '',
            dataEvento: os.data_evento || order.event_date || '',
            ocasiao: os.ocasiao || order.occasion || '',
            tipoPagamento: modalidade,
            total: (pagamento.total ?? order.total_value ?? '') !== '' ? String(pagamento.total ?? order.total_value) : '',
            sinal: (pagamento.sinal ?? order.advance_payment ?? '') !== '' ? String(pagamento.sinal ?? order.advance_payment) : '',
            restante: (pagamento.restante ?? order.remaining_payment ?? '') !== '' ? String(pagamento.restante ?? order.remaining_payment) : '',
            dataRetirada: os.data_retirada || order.retirada_date || '',
            dataDevolucao: os.data_devolucao || order.devolucao_date || ''
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
            // Estrutura organizada em português
            const payload = {
                ordem_servico: {
                    data_pedido: formData.dataPedido,
                    data_evento: formData.dataEvento,
                    data_retirada: formData.dataRetirada,
                    data_devolucao: formData.dataDevolucao,
                    ocasiao: formData.ocasiao,
                    modalidade: formData.tipoPagamento,
                    itens: [
                        {
                            tipo: "paleto",
                            numero: formData.paletoNumero,
                            cor: formData.paletoCor,
                            manga: formData.paletoManga,
                            marca: formData.paletoMarca,
                            ajuste: formData.paletoAjuste ? formData.paletoAjusteValor : "",
                            extras: formData.paletoExtras,
                            venda: getItensVendidos().includes('paleto')
                        },
                        {
                            tipo: "camisa",
                            numero: formData.camisaNumero,
                            cor: formData.camisaCor,
                            manga: formData.camisaManga,
                            marca: formData.camisaMarca,
                            ajuste: formData.camisaAjuste ? formData.camisaAjusteValor : "",
                            extras: formData.camisaExtras,
                            venda: getItensVendidos().includes('camisa')
                        },
                        {
                            tipo: "calca",
                            numero: formData.calcaNumero,
                            cor: formData.calcaCor,
                            cintura: formData.calcaCintura,
                            perna: formData.calcaPerna,
                            marca: formData.calcaMarca,
                            ajuste_cintura: formData.calcaAjusteCos ? formData.calcaAjusteCosValor : "",
                            ajuste_comprimento: formData.calcaAjusteComprimento ? formData.calcaAjusteComprimentoValor : "",
                            extras: formData.calcaExtras,
                            venda: getItensVendidos().includes('calca')
                        }
                    ],
                    acessorios: [
                        ...(formData.suspensorio ? [{
                            tipo: "suspensorio",
                            cor: formData.suspensorioCor,
                            venda: getItensVendidos().includes('suspensorio')
                        }] : []),
                        ...(formData.passante ? [{
                            tipo: "passante",
                            cor: formData.passanteCor,
                            extensor: formData.passanteExtensor,
                            venda: getItensVendidos().includes('passante')
                        }] : []),
                        ...(formData.lenco ? [{
                            tipo: "lenco",
                            cor: formData.lencoCor,
                            venda: getItensVendidos().includes('lenco')
                        }] : []),
                        ...(formData.gravata ? [{
                            tipo: "gravata",
                            cor: formData.gravataCor,
                            descricao: formData.gravataDescricao,
                            marca: formData.gravataMarca,
                            venda: getItensVendidos().includes('gravata')
                        }] : []),
                        ...(formData.cinto ? [{
                            tipo: "cinto",
                            cor: formData.cintoCor,
                            marca: formData.cintoMarca,
                            venda: getItensVendidos().includes('cinto')
                        }] : []),
                        ...(formData.sapato ? [{
                            tipo: "sapato",
                            cor: formData.sapatoCor,
                            descricao: formData.sapatoDescricao,
                            marca: formData.sapatoMarca,
                            numero: formData.sapatoNumero,
                            venda: getItensVendidos().includes('sapato')
                        }] : []),
                        ...(formData.colete ? [{
                            tipo: "colete",
                            cor: formData.coleteCor,
                            descricao: formData.coleteDescricao,
                            venda: getItensVendidos().includes('colete')
                        }] : [])
                    ],
                    pagamento: {
                        total: parseFloat(formData.total) || 0,
                        sinal: parseFloat(formData.sinal) || 0,
                        restante: parseFloat(formData.restante) || 0
                    }
                },
                cliente: {
                    nome: formData.nome,
                    cpf: formData.cpf ? formData.cpf.replace(/\D/g, '') : '',
                    contatos: [
                        {
                            tipo: "telefone",
                            valor: formData.telefone ? formData.telefone.replace(/\D/g, '') : ''
                        }
                    ],
                    enderecos: [
                        {
                            cep: formData.cep,
                            rua: formData.rua,
                            numero: formData.numero,
                            bairro: formData.bairro,
                            cidade: formData.cidade
                        }
                    ]
                }
            };

            // Log do payload para debug
            console.log('📦 Payload sendo enviado:', JSON.stringify(payload, null, 2));

            if (selectedOrder) {
                await serviceOrderService.updateServiceOrder(selectedOrder.id, payload);
                Swal.fire({
                    icon: 'success',
                    title: 'Sucesso!',
                    text: 'Ordem de serviço atualizada com sucesso!',
                    showCancelButton: true,
                    confirmButtonText: 'Imprimir OS',
                    cancelButtonText: 'Fechar',
                    confirmButtonColor: '#3085d6',
                    cancelButtonColor: '#ffff',
                    reverseButtons: true
                }).then((result) => {
                    if (result.isConfirmed) {
                        generatePDF();
                    }
                });
            } else {
                await serviceOrderService.createServiceOrder(payload);
                Swal.fire({
                    icon: 'success',
                    title: 'Sucesso!',
                    text: 'Ordem de serviço criada com sucesso!',
                    showCancelButton: true,
                    confirmButtonText: 'Imprimir OS',
                    cancelButtonText: 'Fechar',
                    confirmButtonColor: '#3085d6',
                    cancelButtonColor: '#6c757d'
                }).then((result) => {
                    if (result.isConfirmed) {
                        generatePDF();
                    }
                });
            }
            
            handleBackToList();
        } catch (error) {
            console.error('Erro ao salvar ordem de serviço:', error);
            Swal.fire({
                icon: 'error',
                title: 'Erro!',
                text: 'Não foi possível salvar a ordem de serviço. Verifique sua conexão e tente novamente.',
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
                const gravataValid = !inputValues.gravata || (inputValues.gravataCor.trim() !== '');
                const cintoValid = !inputValues.cinto || (inputValues.cintoCor.trim() !== '');
                const sapatoValid = !inputValues.sapato || (inputValues.sapatoCor.trim() !== '' && inputValues.sapatoNumero.trim() !== '');
                const coleteValid = !inputValues.colete || (inputValues.coleteCor.trim() !== '');
                
                const acessoriosValid = suspensorioValid && passanteValid && lencoValid && gravataValid && cintoValid && sapatoValid && coleteValid;
                
                // Debug: mostrar quais campos estão falhando
                if (!acessoriosValid) {
                    console.log('Validação acessórios falhou:');
                    console.log('Suspensorio:', inputValues.suspensorio, 'Cor:', inputValues.suspensorioCor, 'Valid:', suspensorioValid);
                    console.log('Passante:', inputValues.passante, 'Cor:', inputValues.passanteCor, 'Valid:', passanteValid);
                    console.log('Lenço:', inputValues.lenco, 'Cor:', inputValues.lencoCor, 'Valid:', lencoValid);
                                    console.log('Gravata:', inputValues.gravata, 'Cor:', inputValues.gravataCor, 'Descrição:', inputValues.gravataDescricao, 'Valid:', gravataValid);
                console.log('Cinto:', inputValues.cinto, 'Cor:', inputValues.cintoCor, 'Valid:', cintoValid);
                console.log('Sapato:', inputValues.sapato, 'Cor:', inputValues.sapatoCor, 'Número:', inputValues.sapatoNumero, 'Descrição:', inputValues.sapatoDescricao, 'Valid:', sapatoValid);
                console.log('Colete:', inputValues.colete, 'Cor:', inputValues.coleteCor, 'Descrição:', inputValues.coleteDescricao, 'Valid:', coleteValid);
                }
                
                return acessoriosValid;
            
            case 5: // Pagamento
                const pagamentoBaseValid = inputValues.dataPedido.trim() !== '' && 
                       inputValues.dataEvento.trim() !== '' && 
                       inputValues.dataRetirada.trim() !== '' && 
                       parseFloat(inputValues.total) > 0 && 
                       inputValues.sinal.trim() !== '';
                
                // Validar itens vendidos apenas se modalidade for Aluguel + Venda
                const itensVendidosValid = inputValues.tipoPagamento === 'Aluguel + Venda' 
                    ? inputValues.itensVendidos.length > 0 
                    : true;
                
                return pagamentoBaseValid && itensVendidosValid;
            
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
                if (!inputValues.paletoMarca.trim()) errors.paletoMarca = 'Marca é obrigatória';
                break;
                
            case 2: // Camisa
                if (!inputValues.camisaNumero.trim()) errors.camisaNumero = 'Número é obrigatório';
                if (!inputValues.camisaCor.trim()) errors.camisaCor = 'Cor é obrigatória';
                if (!inputValues.camisaManga.trim()) errors.camisaManga = 'Manga é obrigatória';
                if (inputValues.camisaAjuste && !inputValues.camisaAjusteValor.trim()) {
                    errors.camisaAjusteValor = 'Ajuste é obrigatório quando marcado';
                }
                if (!inputValues.camisaMarca.trim()) errors.camisaMarca = 'Marca é obrigatória';
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
                if (!inputValues.calcaMarca.trim()) errors.calcaMarca = 'Marca é obrigatória';
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
                    if (!inputValues.gravataCor.trim()) errors.gravataCor = 'Cor da gravata é obrigatória';
                }
                if (inputValues.cinto) {
                    if (!inputValues.cintoCor.trim()) errors.cintoCor = 'Cor do cinto é obrigatória';
                }
                if (inputValues.sapato) {
                    if (!inputValues.sapatoCor.trim()) errors.sapatoCor = 'Cor do sapato é obrigatória';
                    if (!inputValues.sapatoNumero.trim()) errors.sapatoNumero = 'Número do sapato é obrigatório';
                }
                if (inputValues.colete) {
                    if (!inputValues.coleteCor.trim()) errors.coleteCor = 'Cor do colete é obrigatória';
                }
                if (inputValues.gravata && !inputValues.gravataMarca.trim()) errors.gravataMarca = 'Marca da gravata é obrigatória';
                if (inputValues.cinto && !inputValues.cintoMarca.trim()) errors.cintoMarca = 'Marca do cinto é obrigatória';
                if (inputValues.sapato && !inputValues.sapatoMarca.trim()) errors.sapatoMarca = 'Marca do sapato é obrigatória';
                break;
                
            case 5: // Pagamento
                if (!inputValues.dataPedido.trim()) errors.dataPedido = 'Data do pedido é obrigatória';
                if (!inputValues.dataEvento.trim()) errors.dataEvento = 'Data do evento é obrigatória';
                if (!inputValues.dataRetirada.trim()) errors.dataRetirada = 'Data da retirada é obrigatória';
                if (!inputValues.tipoPagamento.trim()) errors.tipoPagamento = 'Modalidade é obrigatória';
                
                // Validar itens vendidos apenas se modalidade for Aluguel + Venda
                if (inputValues.tipoPagamento === 'Aluguel + Venda' && 
                    (!inputValues.itensVendidos || inputValues.itensVendidos.length === 0)) {
                    errors.itensVendidos = 'Selecione pelo menos um item vendido';
                }
                
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
                                <CustomSelect
                                    value={inputValues.paletoNumero}
                                    onChange={(value) => handleSelectChange('paletoNumero', value)}
                                    options={[
                                        { value: '', label: 'Selecione o número' },
                                        { value: '1', label: '1' },
                                        { value: '2', label: '2' },
                                        { value: '4', label: '4' },
                                        { value: '6', label: '6' },
                                        { value: '8', label: '8' },
                                        { value: '10', label: '10' },
                                        { value: '12', label: '12' },
                                        { value: '14', label: '14' },
                                        { value: '16', label: '16' },
                                        { value: '40', label: '40' },
                                        { value: '42', label: '42' },
                                        { value: '44', label: '44' },
                                        { value: '46', label: '46' },
                                        { value: '48', label: '48' },
                                        { value: '50', label: '50' },
                                        { value: '52', label: '52' },
                                        { value: '54', label: '54' },
                                        { value: '56', label: '56' },
                                        { value: '58', label: '58' },
                                        { value: '60', label: '60' },
                                        { value: '62', label: '62' },
                                        { value: '64', label: '64' },
                                        { value: '66', label: '66' },
                                        { value: '68', label: '68' },
                                        { value: '70', label: '70' },
                                        { value: '72', label: '72' },
                                        { value: '74', label: '74' },
                                        { value: '76', label: '76' },
                                        { value: '78', label: '78' },
                                        { value: '80', label: '80' },
                                        { value: '82', label: '82' },
                                        { value: '84', label: '84' },
                                        { value: '86', label: '86' },
                                        { value: '88', label: '88' },
                                        { value: '90', label: '90' },
                                        { value: '92', label: '92' },
                                        { value: '94', label: '94' },
                                        { value: '96', label: '96' },
                                        { value: '98', label: '98' },
                                        { value: '100', label: '100' }
                                    ]}
                                    placeholder="Selecione o número"
                                    error={!!validationErrors.paletoNumero}
                                />
                                {validationErrors.paletoNumero && (
                                    <div className="error-message">{validationErrors.paletoNumero}</div>
                                )}
                            </div>
                            <div className="form-group">
                                <label>Cor <span style={{ color: 'red' }}>*</span></label>
                                <CustomSelect
                                    value={inputValues.paletoCor}
                                    onChange={(value) => handleSelectChange('paletoCor', value)}
                                    options={[
                                        { value: '', label: 'Selecione a cor' },
                                        ...colors.map((c, idx) => ({
                                            value: c.combined,
                                            label: c.combined
                                        }))
                                    ]}
                                    placeholder="Selecione a cor"
                                    disabled={loadingColors}
                                    error={!!validationErrors.paletoCor}
                                />
                                {validationErrors.paletoCor && (
                                    <div className="error-message">{validationErrors.paletoCor}</div>
                                )}
                            </div>
                            <div className="form-group">
                                <label>Manga <span style={{ color: 'red' }}>*</span></label>
                                <CustomSelect
                                    value={inputValues.paletoManga}
                                    onChange={(value) => handleSelectChange('paletoManga', value)}
                                    options={[
                                        { value: '', label: 'Selecione a medida da manga' },
                                        { value: '20', label: '20' },
                                        { value: '21', label: '21' },
                                        { value: '22', label: '22' },
                                        { value: '23', label: '23' },
                                        { value: '24', label: '24' },
                                        { value: '25', label: '25' },
                                        { value: '26', label: '26' },
                                        { value: '27', label: '27' },
                                        { value: '28', label: '28' },
                                        { value: '29', label: '29' },
                                        { value: '30', label: '30' },
                                        { value: '31', label: '31' },
                                        { value: '32', label: '32' },
                                        { value: '33', label: '33' },
                                        { value: '34', label: '34' },
                                        { value: '35', label: '35' },
                                        { value: '36', label: '36' },
                                        { value: '37', label: '37' },
                                        { value: '38', label: '38' },
                                        { value: '39', label: '39' },
                                        { value: '40', label: '40' },
                                        { value: '41', label: '41' },
                                        { value: '42', label: '42' },
                                        { value: '43', label: '43' },
                                        { value: '44', label: '44' },
                                        { value: '45', label: '45' },
                                        { value: '46', label: '46' },
                                        { value: '47', label: '47' },
                                        { value: '48', label: '48' },
                                        { value: '49', label: '49' },
                                        { value: '50', label: '50' },
                                        { value: '51', label: '51' },
                                        { value: '52', label: '52' },
                                        { value: '53', label: '53' },
                                        { value: '54', label: '54' },
                                        { value: '55', label: '55' },
                                        { value: '56', label: '56' },
                                        { value: '57', label: '57' },
                                        { value: '58', label: '58' },
                                        { value: '59', label: '59' },
                                        { value: '60', label: '60' },
                                        { value: '61', label: '61' },
                                        { value: '62', label: '62' },
                                        { value: '63', label: '63' },
                                        { value: '64', label: '64' },
                                        { value: '65', label: '65' },
                                        { value: '66', label: '66' },
                                        { value: '67', label: '67' },
                                        { value: '68', label: '68' },
                                        { value: '69', label: '69' },
                                        { value: '70', label: '70' },
                                        { value: '71', label: '71' },
                                        { value: '72', label: '72' },
                                        { value: '73', label: '73' },
                                        { value: '74', label: '74' },
                                        { value: '75', label: '75' },
                                        { value: '76', label: '76' },
                                        { value: '77', label: '77' },
                                        { value: '78', label: '78' },
                                        { value: '79', label: '79' },
                                        { value: '80', label: '80' }
                                    ]}
                                    placeholder="Selecione a medida da manga"
                                    error={!!validationErrors.paletoManga}
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
                            <div className="form-group">
                                <label>Marca <span style={{ color: 'red' }}>*</span></label>
                                <CustomSelect
                                    value={inputValues.paletoMarca}
                                    onChange={(value) => handleSelectChange('paletoMarca', value)}
                                    options={[
                                        { value: '', label: 'Selecione uma marca' },
                                        ...brands.map((brand) => ({
                                            value: brand.id.toString(),
                                            label: brand.description
                                        }))
                                    ]}
                                    placeholder="Selecione uma marca"
                                    disabled={loadingBrands}
                                    error={!!validationErrors.paletoMarca}
                                />
                                {validationErrors.paletoMarca && (
                                    <div className="error-message">{validationErrors.paletoMarca}</div>
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
                                <CustomSelect
                                    value={inputValues.camisaNumero}
                                    onChange={(value) => handleSelectChange('camisaNumero', value)}
                                    options={[
                                        { value: '', label: 'Selecione o número' },
                                        // Números de 1 ao 20
                                        { value: '1', label: '1' },
                                        { value: '2', label: '2' },
                                        { value: '3', label: '3' },
                                        { value: '4', label: '4' },
                                        { value: '5', label: '5' },
                                        { value: '6', label: '6' },
                                        { value: '7', label: '7' },
                                        { value: '8', label: '8' },
                                        { value: '9', label: '9' },
                                        { value: '10', label: '10' },
                                        { value: '11', label: '11' },
                                        { value: '12', label: '12' },
                                        { value: '13', label: '13' },
                                        { value: '14', label: '14' },
                                        { value: '15', label: '15' },
                                        { value: '16', label: '16' },
                                        { value: '17', label: '17' },
                                        { value: '18', label: '18' },
                                        { value: '19', label: '19' },
                                        { value: '20', label: '20' },
                                        // Letras
                                        { value: 'S', label: 'S' },
                                        { value: 'M', label: 'M' },
                                        { value: 'L', label: 'L' },
                                        { value: 'XL', label: 'XL' },
                                        { value: 'XXL', label: 'XXL' },
                                        { value: '3XL', label: '3XL' },
                                        { value: 'P', label: 'P' },
                                        { value: 'G', label: 'G' },
                                        { value: 'XG', label: 'XG' },
                                        { value: 'XXG', label: 'XXG' },
                                        { value: 'EXG', label: 'EXG' }
                                    ]}
                                    placeholder="Selecione o número"
                                    error={!!validationErrors.camisaNumero}
                                />
                                {validationErrors.camisaNumero && (
                                    <div className="error-message">{validationErrors.camisaNumero}</div>
                                )}
                            </div>
                            <div className="form-group">
                                <label>Cor <span style={{ color: 'red' }}>*</span></label>
                                <CustomSelect
                                    value={inputValues.camisaCor}
                                    onChange={(value) => handleSelectChange('camisaCor', value)}
                                    onBlur={(value) => handleInputBlur('camisaCor', value)}
                                    options={[
                                        { value: '', label: 'Selecione a cor' },
                                        ...colors.map((c, idx) => ({
                                            value: c.combined,
                                            label: c.combined
                                        }))
                                    ]}
                                    placeholder="Selecione a cor"
                                    disabled={loadingColors}
                                    error={!!validationErrors.camisaCor}
                                />
                                {validationErrors.camisaCor && (
                                    <div className="error-message">{validationErrors.camisaCor}</div>
                                )}
                            </div>
                            <div className="form-group">
                                <label>Manga <span style={{ color: 'red' }}>*</span></label>
                                <CustomSelect
                                    value={inputValues.camisaManga}
                                    onChange={(value) => handleSelectChange('camisaManga', value)}
                                    options={[
                                        { value: '', label: 'Selecione a medida da manga' },
                                        { value: '20', label: '20' },
                                        { value: '21', label: '21' },
                                        { value: '22', label: '22' },
                                        { value: '23', label: '23' },
                                        { value: '24', label: '24' },
                                        { value: '25', label: '25' },
                                        { value: '26', label: '26' },
                                        { value: '27', label: '27' },
                                        { value: '28', label: '28' },
                                        { value: '29', label: '29' },
                                        { value: '30', label: '30' },
                                        { value: '31', label: '31' },
                                        { value: '32', label: '32' },
                                        { value: '33', label: '33' },
                                        { value: '34', label: '34' },
                                        { value: '35', label: '35' },
                                        { value: '36', label: '36' },
                                        { value: '37', label: '37' },
                                        { value: '38', label: '38' },
                                        { value: '39', label: '39' },
                                        { value: '40', label: '40' },
                                        { value: '41', label: '41' },
                                        { value: '42', label: '42' },
                                        { value: '43', label: '43' },
                                        { value: '44', label: '44' },
                                        { value: '45', label: '45' },
                                        { value: '46', label: '46' },
                                        { value: '47', label: '47' },
                                        { value: '48', label: '48' },
                                        { value: '49', label: '49' },
                                        { value: '50', label: '50' },
                                        { value: '51', label: '51' },
                                        { value: '52', label: '52' },
                                        { value: '53', label: '53' },
                                        { value: '54', label: '54' },
                                        { value: '55', label: '55' },
                                        { value: '56', label: '56' },
                                        { value: '57', label: '57' },
                                        { value: '58', label: '58' },
                                        { value: '59', label: '59' },
                                        { value: '60', label: '60' },
                                        { value: '61', label: '61' },
                                        { value: '62', label: '62' },
                                        { value: '63', label: '63' },
                                        { value: '64', label: '64' },
                                        { value: '65', label: '65' },
                                        { value: '66', label: '66' },
                                        { value: '67', label: '67' },
                                        { value: '68', label: '68' },
                                        { value: '69', label: '69' },
                                        { value: '70', label: '70' },
                                        { value: '71', label: '71' },
                                        { value: '72', label: '72' },
                                        { value: '73', label: '73' },
                                        { value: '74', label: '74' },
                                        { value: '75', label: '75' },
                                        { value: '76', label: '76' },
                                        { value: '77', label: '77' },
                                        { value: '78', label: '78' },
                                        { value: '79', label: '79' },
                                        { value: '80', label: '80' }
                                    ]}
                                    placeholder="Selecione a medida da manga"
                                    error={!!validationErrors.camisaManga}
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
                            <div className="form-group">
                                <label>Marca <span style={{ color: 'red' }}>*</span></label>
                                <CustomSelect
                                    value={inputValues.camisaMarca}
                                    onChange={(value) => handleSelectChange('camisaMarca', value)}
                                    options={[
                                        { value: '', label: 'Selecione uma marca' },
                                        ...brands.map((brand) => ({
                                            value: brand.id.toString(),
                                            label: brand.description
                                        }))
                                    ]}
                                    placeholder="Selecione uma marca"
                                    disabled={loadingBrands}
                                    error={!!validationErrors.camisaMarca}
                                />
                                {validationErrors.camisaMarca && (
                                    <div className="error-message">{validationErrors.camisaMarca}</div>
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
                                <CustomSelect
                                    value={inputValues.calcaNumero}
                                    onChange={(value) => handleSelectChange('calcaNumero', value)}
                                    options={[
                                        { value: '', label: 'Selecione o número' },
                                        // Números de 1 ao 16 (de 2 em 2, com exceção do 1)
                                        { value: '1', label: '1' },
                                        { value: '2', label: '2' },
                                        { value: '4', label: '4' },
                                        { value: '6', label: '6' },
                                        { value: '8', label: '8' },
                                        { value: '10', label: '10' },
                                        { value: '12', label: '12' },
                                        { value: '14', label: '14' },
                                        { value: '16', label: '16' },
                                        // Números de 30 ao 80 (de 2 em 2)
                                        { value: '30', label: '30' },
                                        { value: '32', label: '32' },
                                        { value: '34', label: '34' },
                                        { value: '36', label: '36' },
                                        { value: '38', label: '38' },
                                        { value: '40', label: '40' },
                                        { value: '42', label: '42' },
                                        { value: '44', label: '44' },
                                        { value: '46', label: '46' },
                                        { value: '48', label: '48' },
                                        { value: '50', label: '50' },
                                        { value: '52', label: '52' },
                                        { value: '54', label: '54' },
                                        { value: '56', label: '56' },
                                        { value: '58', label: '58' },
                                        { value: '60', label: '60' },
                                        { value: '62', label: '62' },
                                        { value: '64', label: '64' },
                                        { value: '66', label: '66' },
                                        { value: '68', label: '68' },
                                        { value: '70', label: '70' },
                                        { value: '72', label: '72' },
                                        { value: '74', label: '74' },
                                        { value: '76', label: '76' },
                                        { value: '78', label: '78' },
                                        { value: '80', label: '80' }
                                    ]}
                                    placeholder="Selecione o número"
                                    error={!!validationErrors.calcaNumero}
                                />
                                {validationErrors.calcaNumero && (
                                    <div className="error-message">{validationErrors.calcaNumero}</div>
                                )}
                            </div>
                            <div className="form-group">
                                <label>Cor <span style={{ color: 'red' }}>*</span></label>
                                <CustomSelect
                                    value={inputValues.calcaCor}
                                    onChange={(value) => handleSelectChange('calcaCor', value)}
                                    onBlur={(value) => handleInputBlur('calcaCor', value)}
                                    options={[
                                        { value: '', label: 'Selecione a cor' },
                                        ...colors.map((c, idx) => ({
                                            value: c.combined,
                                            label: c.combined
                                        }))
                                    ]}
                                    placeholder="Selecione a cor"
                                    searchPlaceholder="Pesquisar cor..."
                                    disabled={loadingColors}
                                    error={!!validationErrors.calcaCor}
                                />
                                {validationErrors.calcaCor && (
                                    <div className="error-message">{validationErrors.calcaCor}</div>
                                )}
                            </div>
                            <div className="form-group">
                                <label>Cós <span style={{ color: 'red' }}>*</span></label>
                                <CustomSelect
                                    value={inputValues.calcaCintura}
                                    onChange={(value) => handleSelectChange('calcaCintura', value)}
                                    onBlur={(value) => handleInputBlur('calcaCintura', value)}
                                    options={[
                                        { value: '', label: 'Selecione o cós' },
                                        ...Array.from({ length: 71 }, (_, i) => i + 10).map(num => ({
                                            value: num.toString(),
                                            label: num.toString()
                                        }))
                                    ]}
                                    placeholder="Selecione o cós"
                                    error={!!validationErrors.calcaCintura}
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
                                    Ajuste do Cós
                                </label>
                                <CustomSelect
                                    value={inputValues.calcaAjusteCosValor}
                                    onChange={(value) => handleSelectChange('calcaAjusteCosValor', value)}
                                    onBlur={(value) => handleInputBlur('calcaAjusteCosValor', value)}
                                    options={[
                                        { value: '', label: 'Selecione o ajuste' },
                                        ...Array.from({ length: 4 }, (_, i) => i + 1).map(num => ({
                                            value: num.toString(),
                                            label: num.toString()
                                        }))
                                    ]}
                                    placeholder="Selecione o ajuste"
                                    disabled={!inputValues.calcaAjusteCos}
                                    error={!!validationErrors.calcaAjusteCosValor}
                                />
                                {validationErrors.calcaAjusteCosValor && (
                                    <div className="error-message">{validationErrors.calcaAjusteCosValor}</div>
                                )}
                            </div>
                            <div className="form-group">
                                <label>Comprimento <span style={{ color: 'red' }}>*</span></label>
                                <CustomSelect
                                    value={inputValues.calcaPerna}
                                    onChange={(value) => handleSelectChange('calcaPerna', value)}
                                    onBlur={(value) => handleInputBlur('calcaPerna', value)}
                                    options={[
                                        { value: '', label: 'Selecione o comprimento' },
                                        ...Array.from({ length: 111 }, (_, i) => i + 10).map(num => ({
                                            value: num.toString(),
                                            label: num.toString()
                                        }))
                                    ]}
                                    placeholder="Selecione o comprimento"
                                    error={!!validationErrors.calcaPerna}
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
                                    Ajuste do Comprimento
                                </label>
                                <CustomSelect
                                    value={inputValues.calcaAjusteComprimentoValor}
                                    onChange={(value) => handleSelectChange('calcaAjusteComprimentoValor', value)}
                                    onBlur={(value) => handleInputBlur('calcaAjusteComprimentoValor', value)}
                                    options={[
                                        { value: '', label: 'Selecione o ajuste' },
                                        ...Array.from({ length: 50 }, (_, i) => i + 1).map(num => ({
                                            value: num.toString(),
                                            label: num.toString()
                                        }))
                                    ]}
                                    placeholder="Selecione o ajuste"
                                    disabled={!inputValues.calcaAjusteComprimento}
                                    error={!!validationErrors.calcaAjusteComprimentoValor}
                                />
                                {validationErrors.calcaAjusteComprimentoValor && (
                                    <div className="error-message">{validationErrors.calcaAjusteComprimentoValor}</div>
                                )}
                            </div>
                            <div className="form-group">
                                <label>Marca <span style={{ color: 'red' }}>*</span></label>
                                <CustomSelect
                                    value={inputValues.calcaMarca}
                                    onChange={(value) => handleSelectChange('calcaMarca', value)}
                                    options={[
                                        { value: '', label: 'Selecione uma marca' },
                                        ...brands.map((brand) => ({
                                            value: brand.id.toString(),
                                            label: brand.description
                                        }))
                                    ]}
                                    placeholder="Selecione uma marca"
                                    disabled={loadingBrands}
                                    error={!!validationErrors.calcaMarca}
                                />
                                {validationErrors.calcaMarca && (
                                    <div className="error-message">{validationErrors.calcaMarca}</div>
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
                                <CustomSelect
                                    value={inputValues.suspensorioCor}
                                    onChange={(value) => handleSelectChange('suspensorioCor', value)}
                                    onBlur={(value) => handleInputBlur('suspensorioCor', value)}
                                    options={[
                                        { value: '', label: 'Selecione a cor' },
                                        ...colors.map((c, idx) => ({
                                            value: c.combined,
                                            label: c.combined
                                        }))
                                    ]}
                                    placeholder="Selecione a cor"
                                    searchPlaceholder="Pesquisar cor..."
                                    disabled={!inputValues.suspensorio || loadingColors}
                                    error={!!validationErrors.suspensorioCor}
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
                                <CustomSelect
                                    value={inputValues.passanteCor}
                                    onChange={(value) => handleSelectChange('passanteCor', value)}
                                    onBlur={(value) => handleInputBlur('passanteCor', value)}
                                    options={[
                                        { value: '', label: 'Selecione a cor' },
                                        ...colors.map((c, idx) => ({
                                            value: c.combined,
                                            label: c.combined
                                        }))
                                    ]}
                                    placeholder="Selecione a cor"
                                    searchPlaceholder="Pesquisar cor..."
                                    disabled={!inputValues.passante || loadingColors}
                                    error={!!validationErrors.passanteCor}
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
                                <CustomSelect
                                    value={inputValues.lencoCor}
                                    onChange={(value) => handleSelectChange('lencoCor', value)}
                                    onBlur={(value) => handleInputBlur('lencoCor', value)}
                                    options={[
                                        { value: '', label: 'Selecione a cor' },
                                        ...colors.map((c, idx) => ({
                                            value: c.combined,
                                            label: c.combined
                                        }))
                                    ]}
                                    placeholder="Selecione a cor"
                                    searchPlaceholder="Pesquisar cor..."
                                    disabled={!inputValues.lenco || loadingColors}
                                    error={!!validationErrors.lencoCor}
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
                                    <CustomSelect
                                        value={inputValues.gravataCor}
                                        onChange={(value) => handleSelectChange('gravataCor', value)}
                                        onBlur={(value) => handleInputBlur('gravataCor', value)}
                                        options={[
                                            { value: '', label: 'Selecione a cor' },
                                            ...colors.map((c, idx) => ({
                                                value: c.combined,
                                                label: c.combined
                                            }))
                                        ]}
                                        placeholder="Selecione a cor"
                                        searchPlaceholder="Pesquisar cor..."
                                        disabled={!inputValues.gravata || loadingColors}
                                        error={!!validationErrors.gravataCor}
                                    />
                                </div>
                                <CustomSelect
                                    value={inputValues.gravataMarca}
                                    onChange={(value) => handleSelectChange('gravataMarca', value)}
                                    options={[
                                        { value: '', label: 'Selecione uma marca' },
                                        ...brands.map((brand) => ({
                                            value: brand.id.toString(),
                                            label: brand.description
                                        }))
                                    ]}
                                    placeholder="Selecione uma marca"
                                    disabled={!inputValues.gravata || loadingBrands}
                                    error={!!validationErrors.gravataMarca}
                                />
                                <input
                                    type="text"
                                    value={inputValues.gravataDescricao}
                                    onChange={(e) => handleInputChange('gravataDescricao', e.target.value)}
                                    onBlur={(e) => handleInputBlur('gravataDescricao', e.target.value)}
                                    placeholder="Descrição (lisa, riscada, etc.)"
                                    disabled={!inputValues.gravata}

                                />
                                {(validationErrors.gravataCor || validationErrors.gravataMarca) && (
                                    <div className="error-message">
                                        {validationErrors.gravataCor || validationErrors.gravataMarca}
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
                                 
                                    <CustomSelect
                                        value={inputValues.cintoCor}
                                                                            onChange={(value) => handleSelectChange('cintoCor', value)}
                                    options={[
                                        { value: '', label: 'Selecione a cor' },
                                        ...colors.map((c, idx) => ({
                                            value: c.combined,
                                            label: c.combined
                                        }))
                                    ]}
                                    placeholder="Selecione a cor"
                                    disabled={!inputValues.cinto || loadingColors}
                                    error={!!validationErrors.cintoCor}
                                    />
                                </div>
                                <CustomSelect
                                    value={inputValues.cintoMarca}
                                    onChange={(value) => handleSelectChange('cintoMarca', value)}
                                    options={[
                                        { value: '', label: 'Selecione uma marca' },
                                        ...brands.map((brand) => ({
                                            value: brand.id.toString(),
                                            label: brand.description
                                        }))
                                    ]}
                                    placeholder="Selecione uma marca"
                                    disabled={!inputValues.cinto || loadingBrands}
                                    error={!!validationErrors.cintoMarca}
                                />
                                {(validationErrors.cintoCor || validationErrors.cintoMarca) && (
                                    <div className="error-message">
                                        {validationErrors.cintoCor || validationErrors.cintoMarca}
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

                                    <CustomSelect
                                        value={inputValues.sapatoCor}
                                        onChange={(value) => handleSelectChange('sapatoCor', value)}
                                        onBlur={(value) => handleInputBlur('sapatoCor', value)}
                                        options={[
                                            { value: '', label: 'Selecione a cor' },
                                            ...colors.map((c, idx) => ({
                                                value: c.combined,
                                                label: c.combined
                                            }))
                                        ]}
                                        placeholder="Selecione a cor"
                                        searchPlaceholder="Pesquisar cor..."
                                        disabled={!inputValues.sapato || loadingColors}
                                        error={!!validationErrors.sapatoCor}
                                    />
                                </div>
                                <CustomSelect
                                    value={inputValues.sapatoMarca}
                                    onChange={(value) => handleSelectChange('sapatoMarca', value)}
                                    options={[
                                        { value: '', label: 'Selecione uma marca' },
                                        ...brands.map((brand) => ({
                                            value: brand.id.toString(),
                                            label: brand.description
                                        }))
                                    ]}
                                    placeholder="Selecione uma marca"
                                    disabled={!inputValues.sapato || loadingBrands}
                                    error={!!validationErrors.sapatoMarca}
                                />
                                <CustomSelect
                                    value={inputValues.sapatoNumero}
                                    onChange={(value) => handleSelectChange('sapatoNumero', value)}
                                    options={[
                                        { value: '', label: 'Selecione o número' },
                                        ...Array.from({ length: 50 }, (_, i) => ({
                                            value: (i + 1).toString(),
                                            label: (i + 1).toString()
                                        }))
                                    ]}
                                    placeholder="Selecione o número"
                                    disabled={!inputValues.sapato}
                                    error={!!validationErrors.sapatoNumero}
                                />
                                <input
                                    type="text"
                                    value={inputValues.sapatoDescricao}
                                    onChange={(e) => handleInputChange('sapatoDescricao', e.target.value)}
                                    onBlur={(e) => handleInputBlur('sapatoDescricao', e.target.value)}
                                    placeholder="Descrição do sapato"
                                    disabled={!inputValues.sapato}

                                />
                                {(validationErrors.sapatoCor || validationErrors.sapatoMarca || validationErrors.sapatoNumero) && (
                                    <div className="error-message">
                                        {validationErrors.sapatoCor || validationErrors.sapatoMarca || validationErrors.sapatoNumero}
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
                                    
                                    <CustomSelect
                                        value={inputValues.coleteCor}
                                        onChange={(value) => handleSelectChange('coleteCor', value)}
                                        onBlur={(value) => handleInputBlur('coleteCor', value)}
                                        options={[
                                            { value: '', label: 'Selecione a cor' },
                                            ...colors.map((c, idx) => ({
                                                value: c.combined,
                                                label: c.combined
                                            }))
                                        ]}
                                        placeholder="Selecione a cor"
                                        searchPlaceholder="Pesquisar cor..."
                                        disabled={!inputValues.colete || loadingColors}
                                        error={!!validationErrors.coleteCor}
                                    />
                                </div>
                                <input
                                    type="text"
                                    value={inputValues.coleteDescricao}
                                    onChange={(e) => handleInputChange('coleteDescricao', e.target.value)}
                                    onBlur={(e) => handleInputBlur('coleteDescricao', e.target.value)}
                                    placeholder="Descrição do colete"
                                    disabled={!inputValues.colete}

                                />
                                {validationErrors.coleteCor && (
                                    <div className="error-message">
                                        {validationErrors.coleteCor}
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
                                    selectedDate={inputValues.dataPedido ? new Date(inputValues.dataPedido + 'T00:00:00') : null}
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
                                    selectedDate={inputValues.dataEvento ? new Date(inputValues.dataEvento + 'T00:00:00') : null}
                                    onDateChange={(date) => {
                                        const isoDate = date ? date.toISOString().split('T')[0] : '';
                                        handleInputChange('dataEvento', isoDate);
                                        handleInputBlur('dataEvento', isoDate);

                                        // Preencher dataDevolucao automaticamente se estiver vazia
                                        if (!inputValues.dataDevolucao && date) {
                                            const devolucao = addBusinessDays(date, 2);
                                            const devolucaoIso = devolucao.toISOString().split('T')[0];
                                            handleInputChange('dataDevolucao', devolucaoIso);
                                            handleInputBlur('dataDevolucao', devolucaoIso);
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
                                <label>Data da Retirada <span style={{ color: 'red' }}>*</span></label>
                                <InputDate
                                    selectedDate={inputValues.dataRetirada ? new Date(inputValues.dataRetirada + 'T00:00:00') : null}
                                    onDateChange={(date) => {
                                        const isoDate = date ? date.toISOString().split('T')[0] : '';
                                        handleInputChange('dataRetirada', isoDate);
                                        handleInputBlur('dataRetirada', isoDate);
                                    }}
                                    placeholderText="Selecione a data da retirada"
                                    className={validationErrors.dataRetirada ? 'error' : ''}
                                />
                                {validationErrors.dataRetirada && (
                                    <div className="error-message">{validationErrors.dataRetirada}</div>
                                )}
                            </div>
                            <div className="form-group">
                                <label>Data da Devolução</label>
                                <InputDate
                                    selectedDate={inputValues.dataDevolucao ? new Date(inputValues.dataDevolucao + 'T00:00:00') : null}
                                    onDateChange={(date) => {
                                        const isoDate = date ? date.toISOString().split('T')[0] : '';
                                        handleInputChange('dataDevolucao', isoDate);
                                        handleInputBlur('dataDevolucao', isoDate);
                                    }}
                                    placeholderText="Selecione a data da devolução"
                                />
                            </div>

                            <div className="form-group">
                                <label>Modalidade <span style={{ color: 'red' }}>*</span></label>
                                <CustomSelect
                                    value={inputValues.tipoPagamento}
                                    onChange={(value) => handleSelectChange('tipoPagamento', value)}
                                    options={[
                                        { value: 'Aluguel', label: 'Aluguel' },
                                        { value: 'Venda', label: 'Venda' },
                                        { value: 'Aluguel + Venda', label: 'Aluguel + Venda' }
                                    ]}
                                    placeholder="Selecione a modalidade"
                                    searchPlaceholder="Pesquisar modalidade..."
                                />
                            </div>
                            {inputValues.tipoPagamento === 'Aluguel + Venda' && (
                                <div className="form-group">
                                    <label>Itens Vendidos <span style={{ color: 'red' }}>*</span></label>
                                    <CustomSelect
                                        value={inputValues.itensVendidos}
                                        onChange={(value) => handleSelectChange('itensVendidos', value)}
                                        options={[
                                            // Itens principais sempre disponíveis
                                            { value: 'paleto', label: 'Paletó' },
                                            { value: 'camisa', label: 'Camisa' },
                                            { value: 'calca', label: 'Calça' },
                                            // Acessórios apenas se selecionados
                                            ...(formData.suspensorio ? [{ value: 'suspensorio', label: 'Suspensório' }] : []),
                                            ...(formData.passante ? [{ value: 'passante', label: 'Passante' }] : []),
                                            ...(formData.lenco ? [{ value: 'lenco', label: 'Lenço' }] : []),
                                            ...(formData.gravata ? [{ value: 'gravata', label: 'Gravata' }] : []),
                                            ...(formData.cinto ? [{ value: 'cinto', label: 'Cinto' }] : []),
                                            ...(formData.sapato ? [{ value: 'sapato', label: 'Sapato' }] : []),
                                            ...(formData.colete ? [{ value: 'colete', label: 'Colete' }] : [])
                                        ]}
                                        placeholder="Selecione os itens vendidos"
                                        searchPlaceholder="Pesquisar itens..."
                                        isMulti={true}
                                        error={!!validationErrors.itensVendidos}
                                    />
                                    {validationErrors.itensVendidos && (
                                        <div className="error-message">{validationErrors.itensVendidos}</div>
                                    )}
                                </div>
                            )}
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

    // Função para gerar PDF da OS
    const generatePDF = async () => {
        try {
            // Pequeno delay para garantir que o DOM esteja renderizado
            await new Promise(resolve => setTimeout(resolve, 100));
            
            const previewElement = document.getElementById('os-preview');
            if (!previewElement) {
                console.error('Elemento do preview não encontrado');
                return;
            }
            
            // Criar um container temporário para o PDF com dimensões fixas
            const tempContainer = document.createElement('div');
            tempContainer.style.cssText = `
                position: fixed;
                top: -9999px;
                left: -9999px;
                width: 800px;
                height: auto;
                background: white;
                color: black;
                font-family: Arial, sans-serif;
                z-index: -1;
                transform: none !important;
                overflow: visible !important;
            `;
            
            // Clonar o elemento do preview
            const clonedPreview = previewElement.cloneNode(true);
            clonedPreview.setAttribute('data-pdf-target', 'true');
            clonedPreview.style.cssText = `
                width: 800px !important;
                max-width: 800px !important;
                height: auto !important;
                background: white !important;
                color: black !important;
                transform: none !important;
                overflow: visible !important;
                position: relative !important;
                top: 0 !important;
                left: 0 !important;
                margin: 0 !important;
                padding: 20px !important;
                box-shadow: none !important;
                border: 1px solid #ddd !important;
                border-radius: 0 !important;
            `;
            
            // Adicionar ao container temporário
            tempContainer.appendChild(clonedPreview);
            document.body.appendChild(tempContainer);
            
            // Forçar reflow
            tempContainer.offsetHeight;
            
            // Delay para garantir que os estilos sejam aplicados
            await new Promise(resolve => setTimeout(resolve, 500));

            // Configurar o canvas com dimensões fixas
            const canvas = await html2canvas(clonedPreview, {
                scale: 2,
                useCORS: true,
                allowTaint: true,
                backgroundColor: '#ffffff',
                logging: false,
                width: 800,
                height: clonedPreview.scrollHeight,
                onclone: (clonedDoc) => {
                    // Garantir que o elemento clonado tenha fundo branco
                    const clonedElement = clonedDoc.getElementById('os-preview');
                    if (clonedElement) {
                        clonedElement.style.background = 'white';
                        clonedElement.style.color = 'black';
                        clonedElement.style.width = '800px';
                        clonedElement.style.maxWidth = '800px';
                        clonedElement.style.transform = 'none';
                        clonedElement.style.overflow = 'visible';
                    }
                }
            });

            // Criar PDF em modo paisagem
            const imgData = canvas.toDataURL('image/png');
            const pdf = new jsPDF('l', 'mm', 'a4'); // 'l' = landscape
            
            // Calcular dimensões para paisagem
            const pageWidth = 297; // A4 landscape width
            const pageHeight = 210; // A4 landscape height
            const margin = 10;
            const availableWidth = pageWidth - (2 * margin);
            const availableHeight = pageHeight - (2 * margin);
            
            // Calcular dimensões para duas vias lado a lado
            const halfWidth = (availableWidth - margin) / 2; // Metade da largura disponível
            const imgWidth = halfWidth;
            const imgHeight = (canvas.height * imgWidth) / canvas.width;
            
            // Calcular quantas páginas precisamos
            const pagesNeeded = Math.ceil(imgHeight / availableHeight);
            
            // Gerar páginas com duas vias lado a lado
            for (let page = 0; page < pagesNeeded; page++) {
                if (page > 0) pdf.addPage();
                
                const yPosition = page * availableHeight;
                const remainingHeight = imgHeight - yPosition;
                const heightToShow = Math.min(availableHeight, remainingHeight);
                
                // VIA DO CLIENTE (lado esquerdo)
                pdf.addImage(imgData, 'PNG', margin, margin, imgWidth, heightToShow);
                
                // Título "VIA DO CLIENTE"
                pdf.setFontSize(12);
                pdf.setFont('helvetica', 'bold');
                pdf.setTextColor(0, 0, 0);
                pdf.text('VIA DO CLIENTE', margin, 8);
                
                // VIA DA LOJA (lado direito)
                const rightX = margin + halfWidth + margin;
                pdf.addImage(imgData, 'PNG', rightX, margin, imgWidth, heightToShow);
                
                // Título "VIA DA LOJA"
                pdf.text('VIA DA LOJA', rightX, 8);
                
                // Linha divisória vertical no meio
                const middleX = margin + halfWidth + (margin / 2);
                pdf.setDrawColor(200, 200, 200);
                pdf.setLineWidth(0.5);
                pdf.line(middleX, margin, middleX, pageHeight - margin);
                pdf.setLineWidth(0.1);
            }

            // Salvar PDF
            const fileName = `OS_${selectedOrder?.id || 'Nova'}_${new Date().toISOString().split('T')[0]}.pdf`;
            pdf.save(fileName);
            
            // Limpar container temporário
            if (tempContainer && tempContainer.parentNode) {
                tempContainer.parentNode.removeChild(tempContainer);
            }

        } catch (error) {
            console.error('Erro ao gerar PDF:', error);
            Swal.fire({
                icon: 'error',
                title: 'Erro!',
                text: 'Não foi possível gerar o PDF. Tente novamente.',
                timer: 3000,
                showConfirmButton: false
            });
            
            // Limpar container temporário em caso de erro também
            if (tempContainer && tempContainer.parentNode) {
                tempContainer.parentNode.removeChild(tempContainer);
            }
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

    // Função para buscar nome da marca pelo ID
    const getBrandName = (brandId) => {
        if (!brandId || !brands || brands.length === 0) return 'Não informada';
        
        const brand = brands.find(b => b.id.toString() === brandId.toString());
        return brand ? capitalizeText(brand.description) : 'Não informada';
    };

    // Função para determinar itens vendidos baseado na modalidade
    const getItensVendidos = () => {
        const modalidade = inputValues.tipoPagamento;
        
        if (modalidade === 'Venda') {
            // Todos os itens são vendidos
            const itensVendidos = ['paleto', 'camisa', 'calca'];
            
            // Adicionar acessórios se selecionados
            if (formData.suspensorio) itensVendidos.push('suspensorio');
            if (formData.passante) itensVendidos.push('passante');
            if (formData.lenco) itensVendidos.push('lenco');
            if (formData.gravata) itensVendidos.push('gravata');
            if (formData.cinto) itensVendidos.push('cinto');
            if (formData.sapato) itensVendidos.push('sapato');
            if (formData.colete) itensVendidos.push('colete');
            
            return itensVendidos;
        } else if (modalidade === 'Aluguel') {
            // Nenhum item é vendido
            return [];
        } else if (modalidade === 'Aluguel + Venda') {
            // Usar seleção manual do usuário
            return inputValues.itensVendidos || [];
        }
        
        return [];
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
                            <div className="preview-card" id="os-preview">
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
                                            <span><strong>Cor:</strong> {capitalizeText(formData.paletoCor)}</span>
                                            <span><strong>Manga:</strong> {formData.paletoManga}</span>
                                            <span><strong>Marca:</strong> {getBrandName(formData.paletoMarca)}</span>
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
                                            <span><strong>Cor:</strong> {capitalizeText(formData.camisaCor)}</span>
                                            <span><strong>Manga:</strong> {formData.camisaManga}</span>
                                            <span><strong>Marca:</strong> {getBrandName(formData.camisaMarca)}</span>
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
                                            <span><strong>Cor:</strong> {capitalizeText(formData.calcaCor)}</span>
                                            <span><strong>Cós:</strong> {formData.calcaCintura}</span>
                                            <span><strong>Comprimento:</strong> {formData.calcaPerna}</span>
                                            <span><strong>Marca:</strong> {getBrandName(formData.calcaMarca)}</span>
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
                                        <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
                                    </svg>
                                    ACESSÓRIOS
                                </h4>
                                <div className="accessories-grid">
                                    {formData.suspensorio && (
                                        <div className="accessory-item">
                                            <span className="accessory-label">Suspensório:</span>
                                            <span className="accessory-value">{capitalizeText(formData.suspensorioCor)}</span>
                                        </div>
                                    )}
                                    {formData.passante && (
                                        <div className="accessory-item">
                                            <span className="accessory-label">Passante:</span>
                                            <span className="accessory-value">{capitalizeText(formData.passanteCor)}</span>
                                        </div>
                                    )}
                                    {formData.passante && formData.passanteExtensor && (
                                        <div className="accessory-item">
                                            <span className="accessory-label">Extensor:</span>
                                            <span className="accessory-value">Sim</span>
                                        </div>
                                    )}
                                    {formData.lenco && (
                                        <div className="accessory-item">
                                            <span className="accessory-label">Lenço:</span>
                                            <span className="accessory-value">{capitalizeText(formData.lencoCor)}</span>
                                        </div>
                                    )}
                                    {formData.gravata && (
                                        <div className="accessory-item">
                                            <span className="accessory-label">Gravata:</span>
                                            <span className="accessory-value">{capitalizeText(formData.gravataCor)} - {formData.gravataDescricao} {formData.gravataMarca && `(${getBrandName(formData.gravataMarca)})`}</span>
                                        </div>
                                    )}
                                    {formData.cinto && (
                                        <div className="accessory-item">
                                            <span className="accessory-label">Cinto:</span>
                                            <span className="accessory-value">{capitalizeText(formData.cintoCor)} {formData.cintoMarca && `(${getBrandName(formData.cintoMarca)})`}</span>
                                        </div>
                                    )}
                                    {formData.sapato && (
                                        <div className="accessory-item">
                                            <span className="accessory-label">Sapato:</span>
                                            <span className="accessory-value">{capitalizeText(formData.sapatoCor)} - Número {formData.sapatoNumero} - {formData.sapatoDescricao} {formData.sapatoMarca && `(${getBrandName(formData.sapatoMarca)})`}</span>
                                        </div>
                                    )}
                                    {formData.colete && (
                                        <div className="accessory-item">
                                            <span className="accessory-label">Colete:</span>
                                            <span className="accessory-value">{capitalizeText(formData.coleteCor)} - {formData.coleteDescricao}</span>
                                        </div>
                                    )}
                                    
                                    {!formData.suspensorio && !formData.passante && !formData.lenco && 
                                     !formData.gravata && !formData.cinto && !formData.sapato && !formData.colete && (
                                        <div className="accessory-item full-width" style={{ 
                                            textAlign: 'center', 
                                            color: 'var(--color-text-muted)',
                                            fontStyle: 'italic'
                                        }}>
                                            <span>Nenhum acessório escolhido</span>
                                        </div>
                                    )}
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
                                        <span className="payment-value">{formData.dataPedido ? new Date(formData.dataPedido + 'T00:00:00').toLocaleDateString('pt-BR') : ''}</span>
                                    </div>
                                    <div className="payment-item">
                                        <span className="payment-label">Data Evento:</span>
                                        <span className="payment-value">{formData.dataEvento ? new Date(formData.dataEvento + 'T00:00:00').toLocaleDateString('pt-BR') : ''}</span>
                                    </div>
                                    <div className="payment-item">
                                        <span className="payment-label">Data da Retirada:</span>
                                        <span className="payment-value">{formData.dataRetirada ? new Date(formData.dataRetirada + 'T00:00:00').toLocaleDateString('pt-BR') : ''}</span>
                                    </div>
                                    <div className="payment-item">
                                        <span className="payment-label">Data da Devolução:</span>
                                        <span className="payment-value">{formData.dataDevolucao ? new Date(formData.dataDevolucao + 'T00:00:00').toLocaleDateString('pt-BR') : ''}</span>
                                    </div>

                                    <div className="payment-item">
                                        <span className="payment-label">Tipo:</span>
                                        <span className="payment-value">{formData.tipoPagamento}</span>
                                    </div>
                                    <div className="payment-item highlight total">
                                        <span className="payment-label">Total:</span>
                                        <span className="payment-value">{formatCurrency(Number(formData.total) || 0)}</span>
                                    </div>
                                    <div className="payment-item highlight sinal">
                                        <span className="payment-label">Sinal:</span>
                                        <span className="payment-value">{formatCurrency(Number(formData.sinal) || 0)}</span>
                                    </div>
                                    <div className="payment-item highlight restante">
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