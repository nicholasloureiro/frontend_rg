import React, { useState, useEffect, useMemo, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { serviceOrderService } from "../services/serviceOrderService";
import api from "../services/api";
import "../styles/ServiceOrderList.css";
import { capitalizeText } from "../utils/capitalizeText";
import { mascaraTelefoneInternacional } from "../utils/Mascaras";
import { parseCurrency } from "../utils/parseCurrency";
import Button from "./Button";
import InputDate from "./InputDate";
import CustomSelect from "./CustomSelect";
// Material React Table + MUI (requer instalar: @mui/material @mui/icons-material material-react-table)
import { MaterialReactTable } from "material-react-table";
import { Box, IconButton, Pagination } from "@mui/material";
import EditIcon from "@mui/icons-material/Edit";
import PersonAddIcon from "@mui/icons-material/PersonAdd";
import CheckIcon from "@mui/icons-material/Check";
import ExitToAppIcon from "@mui/icons-material/ExitToApp";
import AssignmentReturnedIcon from "@mui/icons-material/AssignmentReturned";
import CloseIcon from "@mui/icons-material/Close";
import Modal from "./Modal";
import Swal from "sweetalert2";
import { getEmployees } from "../services/employeeService";

const ServiceOrderList = ({
  onSelectOrder,
  onCreateNew,
  isLoading,
  error,
  onRetry,
}) => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("PENDENTE");
  const [orders, setOrders] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [pageSize, setPageSize] = useState(20);
  const [totalCount, setTotalCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const [internalError, setInternalError] = useState(null);
  const [refusalReasons, setRefusalReasons] = useState([]);

  // Estados para o modal de recusa
  const [showRefusalModal, setShowRefusalModal] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [selectedReasonId, setSelectedReasonId] = useState("");
  const [refusalJustification, setRefusalJustification] = useState("");

  // Estados para o modal de retirada
  const [showPickupModal, setShowPickupModal] = useState(false);
  const [pickupOrder, setPickupOrder] = useState(null);
  const [receiveRemainingPayment, setReceiveRemainingPayment] = useState(true);
  const [isProcessingPickup, setIsProcessingPickup] = useState(false);
  // Array de formas de pagamento para o valor restante (similar ao sinalForms)
  const [remainingPaymentForms, setRemainingPaymentForms] = useState([
    { amount: "", forma_pagamento: "" },
  ]);
  // Estados para o modal de atribuição de atendente
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [assignOrder, setAssignOrder] = useState(null);
  const [atendentesAssign, setAtendentesAssign] = useState([]);
  const [assignSelected, setAssignSelected] = useState("");
  const [loadingAtendentesAssign, setLoadingAtendentesAssign] = useState(false);
  const [isAssigning, setIsAssigning] = useState(false);

  // Estados para busca
  const [showSearchPanel, setShowSearchPanel] = useState(false);
  const [searchText, setSearchText] = useState("");
  const [initialDate, setInitialDate] = useState(null);
  const [endDate, setEndDate] = useState(null);
  const [isSearching, setIsSearching] = useState(false);
  // Modo de visualização: 'cards' (padrão) ou 'table'
  const [viewMode, setViewMode] = useState("cards");
  // Filtro de data ao lado do select de modo de visualização (null = todos)
  const [dateFilter, setDateFilter] = useState(null);
  // Ordenação
  const [ordering, setOrdering] = useState("-id");

  // Opções de ordenação
  const orderingOptions = [
    { value: "-id", label: "Mais recentes" },
    { value: "id", label: "Mais antigos" },
    { value: "-total_value", label: "Maior valor" },
    { value: "total_value", label: "Menor valor" },
    { value: "renter__name", label: "Cliente A-Z" },
    { value: "-renter__name", label: "Cliente Z-A" },
    { value: "retirada_date", label: "Retirada (crescente)" },
    { value: "-retirada_date", label: "Retirada (decrescente)" },
    { value: "devolucao_date", label: "Devolução (crescente)" },
    { value: "-devolucao_date", label: "Devolução (decrescente)" },
  ];

  // Mapeamento de fase para label do filtro de data (para deixar claro o que está sendo filtrado)
  const dateFilterLabels = {
    PENDENTE: "Data do Pedido",
    EM_PRODUCAO: "Data de Produção",
    AGUARDANDO_RETIRADA: "Data de Retirada",
    AGUARDANDO_DEVOLUCAO: "Data de Devolução",
    ATRASADO: "Data de Retirada",
    FINALIZADO: "Data de Finalização",
    RECUSADA: "Data de Recusa",
  };

  // Ref para o scroll dos tabs
  const tabsContainerRef = useRef(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);

  // Contagem de ordens por fase (para exibir nos tabs)
  const [tabCounts, setTabCounts] = useState({});

  // Função para verificar se pode scrollar
  const checkTabsScroll = () => {
    const container = tabsContainerRef.current;
    if (container) {
      setCanScrollLeft(container.scrollLeft > 0);
      setCanScrollRight(
        container.scrollLeft < container.scrollWidth - container.clientWidth - 1
      );
    }
  };

  // Função para scrollar os tabs
  const scrollTabs = (direction) => {
    const container = tabsContainerRef.current;
    if (container) {
      const scrollAmount = 200;
      container.scrollBy({
        left: direction === "left" ? -scrollAmount : scrollAmount,
        behavior: "smooth",
      });
    }
  };

  // Verificar scroll ao montar e redimensionar
  useEffect(() => {
    checkTabsScroll();
    window.addEventListener("resize", checkTabsScroll);
    return () => window.removeEventListener("resize", checkTabsScroll);
  }, []);

  const tabs = [
    { key: "PENDENTE", label: "PENDENTES", color: "#0095e2" },
    { key: "EM_PRODUCAO", label: "EM PRODUÇÃO", color: "#4067a2" },
    {
      key: "AGUARDANDO_RETIRADA",
      label: "AGUARDANDO RETIRADA",
      color: "#e2d502",
    },
    {
      key: "AGUARDANDO_DEVOLUCAO",
      label: "AGUARDANDO DEVOLUÇÃO",
      color: "#1c3b4d",
    },
    { key: "ATRASADO", label: "ATRASADAS", color: "#f44336" },
    { key: "RECUSADA", label: "RECUSADAS", color: "#9e9e9e" },
    { key: "FINALIZADO", label: "FINALIZADAS", color: "#4caf50" },
  ];

  // Formata data para YYYY-MM-DD usando data local (evita problemas de timezone)
  const formatDateForApi = (date) => {
    if (!date) return null;
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  };

  const buildFiltersFromState = () => {
    const filters = {};
    if (searchText && searchText.trim()) {
      filters.search = searchText.trim();
    }
    if (initialDate) {
      filters.initial_date = formatDateForApi(initialDate);
    }
    if (endDate) {
      filters.end_date = formatDateForApi(endDate);
    }
    if (ordering) {
      filters.ordering = ordering;
    }
    if (dateFilter) {
      filters.filter_date = formatDateForApi(dateFilter);
    }
    return filters;
  };

  const fetchOrders = async (phase, filters = {}, page = 1, orderingParam = null) => {
    setLoading(true);
    setInternalError(null);
    try {
      let data;
      // Usa endpoint de busca que suporta paginação e ordenação
      const effectiveFilters = {
        ...filters,
        page,
        page_size: pageSize,
        ordering: orderingParam || ordering,
      };
      data = await serviceOrderService.searchServiceOrders(
        phase,
        effectiveFilters
      );

      // Se a API retornou objeto paginado
      if (data && typeof data === "object" && Array.isArray(data.results)) {
        setOrders(data.results);
        setCurrentPage(data.page || page);
        setTotalPages(data.total_pages || 1);
        setPageSize(data.page_size || pageSize);
        setTotalCount(data.count || 0);
      } else {
        // Compatibilidade: se retornou array simples
        setOrders(Array.isArray(data) ? data : []);
        setCurrentPage(1);
        setTotalPages(1);
        setPageSize(Array.isArray(data) ? data.length : pageSize);
        setTotalCount(Array.isArray(data) ? data.length : 0);
      }
    } catch (err) {
      setInternalError("Erro ao carregar ordens de serviço");
      console.error("Erro:", err);
    } finally {
      setLoading(false);
    }
  };

  const fetchRefusalReasons = async () => {
    try {
      const data = await serviceOrderService.getRefusalReasons();
      setRefusalReasons(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("Erro ao carregar motivos de recusa:", err);
    }
  };

  // Busca contagem de ordens para cada fase (para exibir nos tabs)
  const fetchTabCounts = async () => {
    const phases = ["PENDENTE", "EM_PRODUCAO", "AGUARDANDO_RETIRADA", "AGUARDANDO_DEVOLUCAO", "ATRASADO", "RECUSADA", "FINALIZADO"];
    try {
      const results = await Promise.all(
        phases.map(phase =>
          serviceOrderService.searchServiceOrders(phase, { page: 1, page_size: 1 })
        )
      );
      const counts = {};
      phases.forEach((phase, index) => {
        counts[phase] = results[index]?.count || 0;
      });
      setTabCounts(counts);
    } catch (err) {
      console.error("Erro ao carregar contagem de ordens:", err);
    }
  };

  // Converte os motivos de recusa para o formato do CustomSelect
  const refusalReasonOptions = refusalReasons.map((reason) => ({
    value: reason.id.toString(),
    label: reason.name,
  }));

  const openRefusalModal = (order) => {
    setSelectedOrder(order);
    setSelectedReasonId("");
    setRefusalJustification("");
    setShowRefusalModal(true);
  };

  const closeRefusalModal = () => {
    setShowRefusalModal(false);
    setSelectedOrder(null);
    setSelectedReasonId("");
    setRefusalJustification("");
  };

  const handleRefusalSubmit = async () => {
    if (!selectedReasonId) {
      Swal.fire({
        title: "Motivo obrigatório",
        text: "Por favor, selecione um motivo da recusa.",
        icon: "warning",
        confirmButtonColor: "#f44336",
      });
      return;
    }

    try {
      closeRefusalModal();
      await serviceOrderService.refuseServiceOrder(
        selectedOrder.id,
        refusalJustification.trim() || null,
        parseInt(selectedReasonId)
      );

      // Mostra mensagem de sucesso
      await Swal.fire({
        title: "Ordem cancelada!",
        text: `A ordem de serviço #${selectedOrder.id} foi cancelada com sucesso.`,
        icon: "success",
        confirmButtonColor: "#f44336",
      });

      // Recarrega a lista de ordens
      fetchOrders(activeTab);
    } catch (error) {
      console.error("Erro ao cancelar ordem:", error);

      // Mostra mensagem de erro
      await Swal.fire({
        title: "Erro!",
        text: "Não foi possível cancelar a ordem. Tente novamente.",
        icon: "error",
        confirmButtonColor: "#f44336",
      });
    }
  };

  useEffect(() => {
    // reseta para primeira página ao mudar de aba
    setCurrentPage(1);
    // chama o endpoint por fase sem filtros
    fetchOrders(activeTab);
    fetchRefusalReasons();
  }, [activeTab]);

  // Busca contagem de todas as fases ao montar o componente
  useEffect(() => {
    fetchTabCounts();
  }, []);

  // Atualiza a contagem do tab atual quando totalCount muda
  useEffect(() => {
    if (totalCount !== undefined) {
      setTabCounts(prev => ({ ...prev, [activeTab]: totalCount }));
    }
  }, [totalCount, activeTab]);

  const formatDate = (dateString) => {
    if (!dateString) return "-";
    // Adiciona 'T00:00:00' se a data não tiver horário para evitar problemas de fuso horário
    const dateStr = dateString.includes("T")
      ? dateString
      : `${dateString}T00:00:00`;
    const date = new Date(dateStr);
    return date.toLocaleDateString("pt-BR");
  };

  const formatCurrency = (value) => {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(value || 0);
  };

  const getStatusBadge = (phase) => {
    const tab = tabs.find((t) => t.key === phase);
    return (
      <span className="status-badge" style={{ backgroundColor: tab?.color }}>
        {tab?.label}
      </span>
    );
  };

  const handleTabChange = (tabKey) => {
    setActiveTab(tabKey);
    // Limpa os filtros quando muda de aba
    setSearchText("");
    setInitialDate(null);
    setEndDate(null);
    setDateFilter(null);
    setOrdering("-id");
  };

  // Handler para mudança de ordenação
  const handleOrderingChange = (newOrdering) => {
    setOrdering(newOrdering);
    setCurrentPage(1);
    // Constrói filtros manualmente para garantir valores atuais
    const filters = {
      ordering: newOrdering,
    };
    if (searchText?.trim()) filters.search = searchText.trim();
    if (initialDate) filters.initial_date = formatDateForApi(initialDate);
    if (endDate) filters.end_date = formatDateForApi(endDate);
    if (dateFilter) filters.filter_date = formatDateForApi(dateFilter);
    fetchOrders(activeTab, filters, 1, newOrdering);
  };

  // Handler para mudança do filtro de data
  const handleDateFilterChange = (newDate) => {
    setDateFilter(newDate);
    setCurrentPage(1);
    // Constrói filtros manualmente para garantir valores atuais
    const filters = {
      ordering: ordering,
    };
    if (searchText?.trim()) filters.search = searchText.trim();
    if (initialDate) filters.initial_date = formatDateForApi(initialDate);
    if (endDate) filters.end_date = formatDateForApi(endDate);
    if (newDate) filters.filter_date = formatDateForApi(newDate);
    fetchOrders(activeTab, filters, 1);
  };

  const handleSearch = async () => {
    setIsSearching(true);
    const filters = buildFiltersFromState();
    setCurrentPage(1);
    await fetchOrders(activeTab, filters, 1);
    setIsSearching(false);
  };

  const handleClearSearch = async () => {
    setSearchText("");
    setInitialDate(null);
    setEndDate(null);
    setCurrentPage(1);
    // Mantém a ordenação ao limpar a busca
    await fetchOrders(activeTab, { ordering }, 1);
  };

  const toggleSearchPanel = () => {
    setShowSearchPanel(!showSearchPanel);
  };

  const handleOrderClick = (order) => {
    // Navega para a rota com o ID da ordem
    navigate(`/ordens/${order.id}`);
  };

  const handleEditOrder = (order, event) => {
    event.stopPropagation(); // Previne que o clique propague para o card

    // Verifica se o employee_name está vazio
    if (!order.employee_name || order.employee_name.trim() === "") {
      Swal.fire({
        title: "Atendente não definido",
        text: "Por favor, defina um atendente antes de editar esta ordem de serviço.",
        icon: "warning",
        confirmButtonColor: "#0095e2",
        confirmButtonText: "OK",
      });
      return;
    }

    // Navega para a rota de edição com o ID da ordem
    navigate(`/ordens/${order.id}`);
  };

  const handleMarkAsReturned = async (order, event) => {
    event.stopPropagation(); // Previne que o clique propague para o card

    const result = await Swal.fire({
      title: "Confirmar devolução",
      text: `Deseja marcar a ordem de serviço #${order.id} como devolvida?`,
      icon: "question",
      showCancelButton: true,
      confirmButtonColor: "#4caf50",
      cancelButtonColor: "#ffff",
      cancelButtonText: "Cancelar",
      confirmButtonText: "Sim, marcar como devolvida",
      reverseButtons: true,
    });

    if (result.isConfirmed) {
      try {
        await serviceOrderService.finishServiceOrder(order.id);

        // Mostra mensagem de sucesso
        await Swal.fire({
          title: "Sucesso!",
          text: "Ordem de serviço marcada como devolvida.",
          icon: "success",
          confirmButtonColor: "#4caf50",
        });

        // Recarrega a lista de ordens
        fetchOrders(activeTab);
      } catch (error) {
        console.error("Erro ao marcar como devolvida:", error);

        // Mostra mensagem de erro
        await Swal.fire({
          title: "Erro!",
          text: "Não foi possível marcar a ordem como devolvida. Tente novamente.",
          icon: "error",
          confirmButtonColor: "#f44336",
        });
      }
    }
  };

  const handleMarkAsReady = async (order, event) => {
    event.stopPropagation(); // Previne que o clique propague para o card

    const result = await Swal.fire({
      title: "Confirmar produção",
      text: `Deseja marcar a ordem de serviço #${order.id} como produzida?`,
      icon: "question",
      showCancelButton: true,
      confirmButtonColor: "var(--color-accent)",
      cancelButtonColor: "#ffff",
      cancelButtonText: "Cancelar",
      confirmButtonText: "Sim, marcar como produzida",
      reverseButtons: true,
    });

    if (result.isConfirmed) {
      try {
        await serviceOrderService.markAsReady(order.id);

        // Mostra mensagem de sucesso
        await Swal.fire({
          title: "Sucesso!",
          text: "Ordem de serviço marcada como produzida.",
          icon: "success",
          confirmButtonColor: "var(--color-accent)",
        });

        // Recarrega a lista de ordens
        fetchOrders(activeTab);
      } catch (error) {
        console.error("Erro ao marcar como produzida:", error);

        // Mostra mensagem de erro
        await Swal.fire({
          title: "Erro!",
          text: "Não foi possível marcar a ordem como produzida. Tente novamente.",
          icon: "error",
          confirmButtonColor: "#f44336",
        });
      }
    }
  };

  const openPickupModal = (order, event) => {
    event.stopPropagation();
    setPickupOrder(order);
    setReceiveRemainingPayment(order.remaining_payment > 0);
    setRemainingPaymentForms([{ amount: "", forma_pagamento: "" }]);
    setShowPickupModal(true);
  };

  const closePickupModal = () => {
    setShowPickupModal(false);
    setPickupOrder(null);
    setReceiveRemainingPayment(false);
    setRemainingPaymentForms([{ amount: "", forma_pagamento: "" }]);
    setIsProcessingPickup(false);
  };

  const handlePickupSubmit = async () => {
    if (!pickupOrder) return;

    setIsProcessingPickup(true);

    try {
      closePickupModal();
      // Se há valor restante e foi selecionado para receber, validar formas de pagamento
      if (pickupOrder.remaining_payment > 0 && receiveRemainingPayment) {
        // Validar que todas as formas preenchidas têm valor E forma de pagamento
        const formsWithData = remainingPaymentForms.filter(
          (f) => f.amount || f.forma_pagamento
        );

        if (formsWithData.length === 0) {
          await Swal.fire({
            title: "Pagamento obrigatório",
            text: "Por favor, informe o valor e a forma de pagamento.",
            icon: "warning",
            confirmButtonColor: "#CBA135",
          });
          setIsProcessingPickup(false);
          return;
        }

        // Validar que todas as formas têm AMBOS os campos preenchidos
        const invalidForms = formsWithData.filter(
          (f) => !f.amount || !f.forma_pagamento
        );
        if (invalidForms.length > 0) {
          await Swal.fire({
            title: "Dados incompletos",
            text: "Por favor, preencha o valor e a forma de pagamento para todas as formas adicionadas.",
            icon: "warning",
            confirmButtonColor: "#CBA135",
          });
          setIsProcessingPickup(false);
          return;
        }

        // Calcular total pago
        const totalPaid = formsWithData.reduce((sum, f) => {
          const value =
            parseFloat(f.amount.replace(/[^0-9,]/g, "").replace(",", ".")) || 0;
          return sum + value;
        }, 0);

        // Validar que o total pago corresponde ao valor restante
        const remainingValue = parseFloat(pickupOrder.remaining_payment);
        if (Math.abs(totalPaid - remainingValue) > 0.01) {
          await Swal.fire({
            title: "Valor incorreto",
            text: `O total informado (${formatCurrency(
              totalPaid
            )}) não corresponde ao valor restante (${formatCurrency(
              remainingValue
            )}).`,
            icon: "warning",
            confirmButtonColor: "#CBA135",
          });
          setIsProcessingPickup(false);
          return;
        }
      }

      // Prepara os dados de pagamento se necessário
      const paymentData =
        pickupOrder.remaining_payment > 0 && receiveRemainingPayment
          ? {
              receiveRemainingPayment: true,
              paymentForms: remainingPaymentForms
                .filter((f) => f.amount && f.forma_pagamento)
                .map((f) => ({
                  amount: parseFloat(
                    f.amount.replace(/[^0-9,]/g, "").replace(",", ".")
                  ),
                  forma_pagamento: f.forma_pagamento,
                })),
              remainingAmount: pickupOrder.remaining_payment,
            }
          : null;

      // Chama o serviço para marcar como retirada com dados de pagamento
      await serviceOrderService.pickUpServiceOrder(pickupOrder.id, paymentData);

      // Mensagem de sucesso com detalhes do pagamento
      const paymentDetails =
        paymentData?.paymentForms
          ?.map((f) => `${formatCurrency(f.amount)} via ${f.forma_pagamento}`)
          .join(" + ") || "";

      await Swal.fire({
        title: "Retirada confirmada!",
        text: `Ordem #${pickupOrder.id} marcada como retirada${
          paymentDetails ? `. Pagamento recebido: ${paymentDetails}` : ""
        }.`,
        icon: "success",
        confirmButtonColor: "#CBA135",
      });

      fetchOrders(activeTab);
    } catch (error) {
      console.error("Erro ao marcar como retirada:", error);

      await Swal.fire({
        title: "Erro!",
        text: "Não foi possível marcar a ordem como retirada. Tente novamente.",
        icon: "error",
        confirmButtonColor: "#f44336",
      });
    } finally {
      setIsProcessingPickup(false);
    }
  };

  const handleRefuseOrder = async (order, event) => {
    event.stopPropagation(); // Previne que o clique propague para o card
    openRefusalModal(order);
  };

  // Handler para retornar ordem recusada para pendente
  const handleReturnToPending = async (order, event) => {
    event.stopPropagation();

    const result = await Swal.fire({
      title: "Retornar OS para PENDENTE",
      text: `Deseja retornar a ordem de serviço #${order.id} para o status PENDENTE?`,
      icon: "question",
      showCancelButton: true,
      confirmButtonColor: "#3085d6",
      cancelButtonColor: "transparent",
      confirmButtonText: "Sim, retornar",
      cancelButtonText: "Cancelar",
      reverseButtons: true,
    });

    if (result.isConfirmed) {
      try {
        await serviceOrderService.returnToPending(order.id);

        Swal.fire({
          title: "Sucesso!",
          text: "Ordem retornada para PENDENTE.",
          icon: "success",
          timer: 2000,
          showConfirmButton: false,
        });
      } catch (error) {
        console.error("Erro ao retornar ordem para pendente:", error);
        Swal.fire({
          title: "Erro",
          text:
            error.response?.data?.message ||
            "Erro ao retornar ordem para pendente.",
          confirmButtonColor: "#d33",
          icon: "error",
        });
      } finally {
        // Recarrega a lista
          fetchOrders(activeTab);
      }
    }
  };

  // Funções helper para gerenciar formas de pagamento do valor restante
  const parseCurrencyValue = (rawStr) => {
    const numStr = rawStr.replace(/[^0-9,]/g, "").replace(",", ".");
    return parseFloat(numStr) || 0;
  };

  const computeRemainingTotal = (forms) => {
    return forms.reduce((sum, f) => {
      const val = parseCurrencyValue(f.amount);
      return sum + val;
    }, 0);
  };

  const toggleSecondRemainingForm = () => {
    if (remainingPaymentForms.length === 1) {
      setRemainingPaymentForms([
        ...remainingPaymentForms,
        { amount: "", forma_pagamento: "" },
      ]);
    } else {
      setRemainingPaymentForms([remainingPaymentForms[0]]);
    }
  };

  const updateRemainingForm = (index, field, value) => {
    const updatedForms = [...remainingPaymentForms];

    if (field === "amount") {
      // Formatar valor como moeda
      const numericValue = value.replace(/\D/g, "");
      const formattedValue = (Number(numericValue) / 100).toLocaleString(
        "pt-BR",
        {
          minimumFractionDigits: 2,
          maximumFractionDigits: 2,
        }
      );
      updatedForms[index][field] = formattedValue;
    } else {
      updatedForms[index][field] = value;
    }

    setRemainingPaymentForms(updatedForms);
  };

  // Abre modal de atribuição de atendente (usado em PENDENTE)
  const handleAssignAttendant = async (order, event) => {
    event.stopPropagation();
    setAssignOrder(order);
    setAssignSelected(order.employee_id ? order.employee_id.toString() : "");
    setShowAssignModal(true);
    setLoadingAtendentesAssign(true);
    try {
      const funcionarios = await getEmployees();
      const listaFuncionarios = Array.isArray(funcionarios) ? funcionarios : [];
      const atendentes = listaFuncionarios.filter(
        (func) =>
          (func.role === "ATENDENTE" || func.role === "ADMINISTRADOR") &&
          func.active === true
      );
      setAtendentesAssign(atendentes);
    } catch (err) {
      console.error("Erro ao carregar atendentes para atribuição:", err);
      await Swal.fire({
        icon: "error",
        title: "Erro",
        text: "Não foi possível carregar os atendentes. Tente novamente.",
        confirmButtonColor: "#d33",
      });
    } finally {
      setLoadingAtendentesAssign(false);
    }
  };

  const closeAssignModal = () => {
    setShowAssignModal(false);
    setAssignOrder(null);
    setAtendentesAssign([]);
    setAssignSelected("");
    setIsAssigning(false);
    setLoadingAtendentesAssign(false);
  };

  const handleAssignSubmit = async () => {
    if (!assignOrder) return;
    if (!assignSelected) {
      await Swal.fire({
        icon: "warning",
        title: "Atendente obrigatório",
        text: "Selecione um atendente para continuar.",
        confirmButtonColor: "#f44336",
      });
      return;
    }

    setIsAssigning(true);
    try {
      const payload = {
        ordem_servico: {
          employee_id: parseInt(assignSelected),
        },
      };

      await serviceOrderService.updateServiceOrder(assignOrder.id, payload);

      closeAssignModal();
      await Swal.fire({
        icon: "success",
        title: "Sucesso!",
        text: "Atendente atribuído com sucesso.",
        confirmButtonColor: "#3085d6",
      });

      fetchOrders(activeTab);
    } catch (error) {
      console.error("Erro ao atribuir atendente:", error);
      await Swal.fire({
        icon: "error",
        title: "Erro!",
        text: "Não foi possível atribuir o atendente. Tente novamente.",
        confirmButtonColor: "#d33",
      });
      setIsAssigning(false);
    }
  };

  // Lista de ordens exibidas (filtro de data agora é feito no backend)
  const displayedOrders = orders;

  // Tabela memoizada com MaterialReactTable (hook chamado no topo do componente)
  const materialTable = useMemo(() => {
    const cols = [
      {
        accessorKey: "id",
        header: "OS",
        Cell: ({ cell }) => `#${cell.getValue()}`,
      },
      {
        accessorFn: (row) => capitalizeText(row.client?.name || "-"),
        id: "client",
        header: "Cliente",
      },
      {
        accessorFn: (row) =>
          row.client?.contacts?.[0]?.phone
            ? mascaraTelefoneInternacional(row.client?.contacts?.[0]?.phone)
            : "-",
        id: "phone",
        header: "Telefone",
      },
      {
        accessorFn: (row) =>
          row.event_name ? capitalizeText(row.event_name) : "-",
        id: "event",
        header: "Evento",
      },
      {
        accessorFn: (row) =>
          row.retirada_date ? formatDate(row.retirada_date) : "-",
        id: "retirada",
        header: "Retirada",
        Cell: ({ cell, row }) => (
          <span
            style={{ color: row.original.esta_atrasada ? "red" : "inherit" }}
          >
            {cell.getValue()}
          </span>
        ),
      },
      {
        accessorFn: (row) =>
          row.devolucao_date ? formatDate(row.devolucao_date) : "-",
        id: "devolucao",
        header: "Devolução",
      },
      {
        accessorFn: (row) => capitalizeText(row.renter_role) || "-",
        id: "papel_evento",
        header: "Papel no Evento",
      },
      {
        accessorFn: (row) =>
          row.employee_name ? capitalizeText(row.employee_name) : "-",
        id: "atendente",
        header: "Atendente",
      },
      {
        accessorFn: (row) => formatCurrency(row.total_value),
        id: "total",
        header: "Total",
      },
      {
        accessorFn: (row) => formatCurrency(row.advance_payment),
        id: "sinal",
        header: "Sinal",
      },
      {
        accessorFn: (row) => formatCurrency(row.remaining_payment),
        id: "restante",
        header: "Restante",
      },
      {
        accessorFn: () => getStatusBadge(activeTab),
        id: "status",
        header: "Status",
        Cell: ({ cell }) => cell.getValue(),
      },
      {
        id: "actions",
        header: "Ações",
        enableSorting: false,
        Cell: ({ row }) => (
          <Box sx={{ display: "flex", gap: 1 }}>
            <IconButton
              size="small"
              onClick={(e) => {
                e.stopPropagation();
                handleRefuseOrder(row.original, e);
              }}
              title="Cancelar"
            >
              <CloseIcon fontSize="small" />
            </IconButton>
            <IconButton
              size="small"
              onClick={(e) => {
                e.stopPropagation();
                handleEditOrder(row.original, e);
              }}
              title="Editar"
            >
              <EditIcon fontSize="small" />
            </IconButton>
            {activeTab === "PENDENTE" && (
              <IconButton
                size="small"
                onClick={(e) => {
                  e.stopPropagation();
                  handleAssignAttendant(row.original, e);
                }}
                title="Atribuir atendente"
              >
                <PersonAddIcon fontSize="small" />
              </IconButton>
            )}
            {activeTab === "EM_PRODUCAO" && (
              <IconButton
                size="small"
                onClick={(e) => {
                  e.stopPropagation();
                  handleMarkAsReady(row.original, e);
                }}
                title="Marcar produzida"
              >
                <CheckIcon fontSize="small" />
              </IconButton>
            )}
            {activeTab === "AGUARDANDO_RETIRADA" && (
              <IconButton
                size="small"
                onClick={(e) => {
                  e.stopPropagation();
                  openPickupModal(row.original, e);
                }}
                title="Marcar retirada"
              >
                <ExitToAppIcon fontSize="small" />
              </IconButton>
            )}
            {activeTab === "AGUARDANDO_DEVOLUCAO" && (
              <IconButton
                size="small"
                onClick={(e) => {
                  e.stopPropagation();
                  handleMarkAsReturned(row.original, e);
                }}
                title="Marcar devolvida"
              >
                <AssignmentReturnedIcon fontSize="small" />
              </IconButton>
            )}
          </Box>
        ),
      },
    ];

    return (
      <div className="orders-table-wrapper">
        <MaterialReactTable
          columns={cols}
          data={displayedOrders}
          enableSorting={false}
          muiTableBodyRowProps={({ row }) => ({
            onClick: () => handleOrderClick(row.original),
            sx: { cursor: "pointer" },
          })}
        />
      </div>
    );
  }, [displayedOrders, activeTab]);

  return (
    <div className="service-order-list-container">
      {/* Header */}
      <div className="list-header">
        <h2 style={{ fontSize: "18px", color: "var(--color-text-primary)" }}>
          Ordens de Serviço
          {(isLoading || loading) && (
            <span
              style={{
                fontSize: "14px",
                color: "var(--color-text-secondary)",
                marginLeft: "8px",
                fontWeight: "normal",
              }}
            >
              (Carregando...)
            </span>
          )}
        </h2>
      </div>

      {/* Tabs */}
      <div className="tabs-wrapper mb-3">
        <button
          className="tabs-nav-btn"
          onClick={() => scrollTabs("left")}
          disabled={!canScrollLeft}
          aria-label="Scroll tabs para esquerda"
        >
          <i className="bi bi-chevron-left"></i>
        </button>
        <div
          className="tabs-container"
          ref={tabsContainerRef}
          onScroll={checkTabsScroll}
        >
          {tabs.map((tab) => (
            <button
              key={tab.key}
              className={`tab ${activeTab === tab.key ? "active" : ""}`}
              onClick={() => handleTabChange(tab.key)}
              style={{
                borderBottomColor:
                  activeTab === tab.key ? tab.color : "transparent",
              }}
            >
              {tab.label}
              {tabCounts[tab.key] !== undefined && (
                <span className="tab-count">({tabCounts[tab.key]})</span>
              )}
            </button>
          ))}
        </div>
        <button
          className="tabs-nav-btn"
          onClick={() => scrollTabs("right")}
          disabled={!canScrollRight}
          aria-label="Scroll tabs para direita"
        >
          <i className="bi bi-chevron-right"></i>
        </button>
      </div>
      <div className="search-toggle-btn-container mb-3">
        <div className="search-toggle-btn-container-content d-flex justify-content-end">
          <div
            style={{
              display: "flex",
              gap: "12px",
              alignItems: "flex-end",
              marginRight: "auto",
            }}
          >
            <div>
              <label>Modo de visualização</label>
              <CustomSelect
                options={[
                  { value: "cards", label: "Cards" },
                  { value: "table", label: "Lista" },
                ]}
                value={viewMode}
                onChange={setViewMode}
                placeholder="Visualização"
              />
            </div>
            <div style={{ width: 180 }}>
              <label>{dateFilterLabels[activeTab] || "Filtro de data"}</label>
              <InputDate
                selectedDate={dateFilter}
                onDateChange={handleDateFilterChange}
                placeholderText="Todas as datas"
              />
            </div>
            <div style={{ width: 180 }}>
              <label>Ordenar por</label>
              <CustomSelect
                options={orderingOptions}
                value={ordering}
                onChange={handleOrderingChange}
                placeholder="Ordenar por"
              />
            </div>
          </div>
          <Button
            variant="primary"
            text={`${showSearchPanel ? "Ocultar Busca" : "Buscar"}`}
            iconName={`${showSearchPanel ? "x-circle" : "search"}`}
            iconPosition="left"
            onClick={toggleSearchPanel}
            style={{
              width: "fit-content",
              height: "min-content",
              marginTop: "auto",
              marginBottom: "auto",
            }}
          />
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
                  onKeyPress={(e) => e.key === "Enter" && handleSearch()}
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
                variant="light"
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
        {isLoading || loading ? (
          <div className="loading-container">
            <div
              className="loading-spinner"
              style={{ color: "var(--color-accent)" }}
            ></div>
            <p>Carregando ordens de serviço...</p>
          </div>
        ) : error || internalError ? (
          <div className="error-state-service-order">
            <i className="bi bi-exclamation-triangle"></i>
            <h3>Erro ao carregar ordens de serviço</h3>
            <p>{error || internalError}</p>
            <Button
              variant="primary"
              text="Tentar novamente"
              iconName="arrow-clockwise"
              iconPosition="left"
              onClick={onRetry || (() => fetchOrders(activeTab))}
              disabled={isLoading || loading}
              style={{ width: "fit-content" }}
            />
          </div>
        ) : displayedOrders.length === 0 ? (
          <div className="empty-state">
            <svg width="64" height="64" viewBox="0 0 24 24" fill="currentColor">
              <path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-5 14H7v-2h7v2zm3-4H7v-2h10v2zm0-4H7V7h10v2z" />
            </svg>
            <h3>Nenhuma ordem encontrada</h3>
            <p>Não há ordens de serviço na fase "{activeTab}"</p>
          </div>
        ) : viewMode === "cards" ? (
          <div className="orders-grid">
            {displayedOrders.map((order) => (
              <div
                key={order.id}
                className={`order-card ${
                  order.esta_atrasada ? "order-card-delayed" : ""
                }`}
              >
                <div className="order-header">
                  <div className="order-id">OS #{order.id}</div>
                  {order.esta_atrasada && (
                    <span className="delayed-badge">
                      <i className="bi bi-exclamation-triangle-fill"></i>
                      ATRASADO
                    </span>
                  )}
                  {getStatusBadge(activeTab)}
                </div>

                <div className="order-content">
                  <div className="order-info">
                    <div className="info-row">
                      <span className="label">Cliente:</span>
                      <span className="value">
                        {capitalizeText(order.client?.name)}
                      </span>
                    </div>
                    {order.client?.contacts?.[0]?.phone && (
                      <div className="info-row">
                        <span className="label">Telefone:</span>
                        <span className="value">
                          {mascaraTelefoneInternacional(
                            order.client?.contacts?.[0]?.phone
                          )}
                        </span>
                      </div>
                    )}
                    {order.event_name && (
                      <div className="info-row">
                        <span className="label">Evento:</span>
                        <span className="value">
                          {capitalizeText(order.event_name)}
                        </span>
                      </div>
                    )}
                    {order.retirada_date && (
                      <div className="info-row">
                        <span className="label">Data da Retirada:</span>
                        <span
                          className="value"
                          style={{
                            color: order.esta_atrasada
                              ? "red"
                              : "var(--color-text-primary)",
                          }}
                        >
                          {formatDate(order.retirada_date)}
                        </span>
                      </div>
                    )}
                    {order.devolucao_date && (
                      <div className="info-row">
                        <span className="label">Data da Devolução:</span>
                        <span className="value">
                          {formatDate(order.devolucao_date)}
                        </span>
                      </div>
                    )}
                    {order.renter_role && (
                      <div className="info-row">
                        <span className="label">Papel no Evento:</span>
                        <span className="value">
                          {capitalizeText(order.renter_role)}
                        </span>
                      </div>
                    )}
                    {order.employee_name && (
                      <div className="info-row">
                        <span className="label">Atendente Responsável:</span>
                        <span className="value">
                          {capitalizeText(order.employee_name)}
                        </span>
                      </div>
                    )}
                    {activeTab === "RECUSADA" && order.justification_reason && (
                      <>
                        <div className="info-row">
                          <span className="label">Motivo da Recusa:</span>
                          <span className="value justification-reason">
                            {capitalizeText(order.justification_reason)}
                          </span>
                        </div>
                        {order.justification_refusal && (
                          <div className="info-row">
                            <span className="label">
                              Justificativa da Recusa:
                            </span>
                            <span className="value justification-refusal">
                              {capitalizeText(order.justification_refusal)}
                            </span>
                          </div>
                        )}
                      </>
                    )}
                    {activeTab === "ATRASADO" && order.justificativa_atraso && (
                      <div className="info-row">
                        <span className="label">Motivo do Atraso:</span>
                        <span className="value justification-delay">
                          {capitalizeText(order.justificativa_atraso)}
                        </span>
                      </div>
                    )}
                  </div>

                  <div className="order-payment">
                    <div className="payment-row">
                      <span className="label">Valor Total:</span>
                      <span className="value total">
                        {formatCurrency(order.total_value)}
                      </span>
                    </div>
                    <div className="payment-row">
                      <span className="label">Pago:</span>
                      <span className="value">
                        {formatCurrency(order.advance_payment)}
                      </span>
                    </div>
                    <div className="payment-row">
                      <span className="label">Restante:</span>
                      <span className="value remaining">
                        {formatCurrency(order.remaining_payment)}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="order-footer">
                  <div className="order-date">
                    Data OS: {formatDate(order.order_date)}
                  </div>
                  <div className="order-actions">
                    {activeTab === "PENDENTE" && (
                      <>
                        <button
                          className="action-btn refuse"
                          onClick={(e) => handleRefuseOrder(order, e)}
                          title="Cancelar ordem"
                        >
                          <svg
                            width="16"
                            height="16"
                            viewBox="0 0 24 24"
                            fill="currentColor"
                          >
                            <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z" />
                          </svg>
                        </button>
                        <button
                          className="action-btn assign"
                          onClick={(e) => handleAssignAttendant(order, e)}
                          title="Atribuir atendente"
                        >
                          <i
                            className="bi bi-person-plus"
                            style={{ fontSize: "14px", color: "green" }}
                          ></i>
                        </button>
                        <button
                          className="action-btn edit"
                          onClick={(e) => handleEditOrder(order, e)}
                          title="Editar ordem"
                        >
                          <svg
                            width="16"
                            height="16"
                            viewBox="0 0 24 24"
                            fill="currentColor"
                          >
                            <path d="M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25zM20.71 7.04c.39-.39.39-1.02 0-1.41l-2.34-2.34c-.39-.39-1.02-.39-1.41 0l-1.83 1.83 3.75 3.75 1.83-1.83z" />
                          </svg>
                        </button>
                      </>
                    )}
                    {activeTab === "EM_PRODUCAO" && (
                      <>
                        <button
                          className="action-btn refuse"
                          onClick={(e) => handleRefuseOrder(order, e)}
                          title="Cancelar ordem"
                        >
                          <svg
                            width="16"
                            height="16"
                            viewBox="0 0 24 24"
                            fill="currentColor"
                          >
                            <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z" />
                          </svg>
                        </button>
                        <button
                          className="action-btn edit"
                          onClick={(e) => handleEditOrder(order, e)}
                          title="Editar ordem"
                        >
                          <svg
                            width="16"
                            height="16"
                            viewBox="0 0 24 24"
                            fill="currentColor"
                          >
                            <path d="M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25zM20.71 7.04c.39-.39.39-1.02 0-1.41l-2.34-2.34c-.39-.39-1.02-.39-1.41 0l-1.83 1.83 3.75 3.75 1.83-1.83z" />
                          </svg>
                        </button>

                        <button
                          className="action-btn pickup"
                          title="Marcar como produzida"
                          onClick={(e) => handleMarkAsReady(order, e)}
                        >
                          <svg
                            width="16"
                            height="16"
                            viewBox="0 0 24 24"
                            fill="currentColor"
                          >
                            <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z" />
                          </svg>
                        </button>
                      </>
                    )}
                    {activeTab === "AGUARDANDO_RETIRADA" && (
                      <>
                        <button
                          className="action-btn refuse"
                          onClick={(e) => handleRefuseOrder(order, e)}
                          title="Cancelar ordem"
                        >
                          <svg
                            width="16"
                            height="16"
                            viewBox="0 0 24 24"
                            fill="currentColor"
                          >
                            <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z" />
                          </svg>
                        </button>
                        <button
                          className="action-btn edit"
                          onClick={(e) => handleEditOrder(order, e)}
                          title="Editar ordem"
                        >
                          <svg
                            width="16"
                            height="16"
                            viewBox="0 0 24 24"
                            fill="currentColor"
                          >
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
                    {activeTab === "AGUARDANDO_DEVOLUCAO" && (
                      <button
                        className="action-btn return"
                        onClick={(e) => handleMarkAsReturned(order, e)}
                        title="Marcar como devolvida"
                      >
                        <svg
                          width="16"
                          height="16"
                          viewBox="0 0 24 24"
                          fill="currentColor"
                        >
                          <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z" />
                        </svg>
                      </button>
                    )}
                    {activeTab === "RECUSADA" && (
                      <button
                        className="action-btn return"
                        onClick={(e) => handleReturnToPending(order, e)}
                        title="Voltar ordem para 'Pendentes'"
                      >
                        <i className="bi bi-arrow-clockwise"></i>
                      </button>
                    )}
                    {activeTab === "ATRASADO" && (
                      <>
                        <button
                          className="action-btn refuse"
                          onClick={(e) => handleRefuseOrder(order, e)}
                          title="Cancelar ordem"
                        >
                          <svg
                            width="16"
                            height="16"
                            viewBox="0 0 24 24"
                            fill="currentColor"
                          >
                            <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z" />
                          </svg>
                        </button>
                        <button
                          className="action-btn edit"
                          onClick={(e) => handleEditOrder(order, e)}
                          title="Editar ordem"
                        >
                          <svg
                            width="16"
                            height="16"
                            viewBox="0 0 24 24"
                            fill="currentColor"
                          >
                            <path d="M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25zM20.71 7.04c.39-.39.39-1.02 0-1.41l-2.34-2.34c-.39-.39-1.02-.39-1.41 0l-1.83 1.83 3.75 3.75 1.83-1.83z" />
                          </svg>
                        </button>
                        <button
                          className="action-btn return"
                          onClick={(e) => handleMarkAsReturned(order, e)}
                          title="Marcar como devolvida"
                        >
                          <svg
                            width="16"
                            height="16"
                            viewBox="0 0 24 24"
                            fill="currentColor"
                          >
                            <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z" />
                          </svg>
                        </button>
                      </>
                    )}
                    {activeTab == "FINALIZADO" && (
                      <button
                        className="action-btn edit"
                        onClick={(e) => handleEditOrder(order, e)}
                        title="Visualizar ordem de serviço"
                      >
                        <i className="bi bi-eye" style={{}}></i>
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          materialTable
        )}

        <div
          style={{
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            gap: "16px",
            marginTop: "24px",
            flexWrap: "wrap",
          }}
        >
          <Pagination
            count={totalPages}
            page={currentPage}
            onChange={(event, value) => {
              setCurrentPage(value);
              fetchOrders(activeTab, buildFiltersFromState(), value);
            }}
            color="primary"
            disabled={isLoading || loading}
            showFirstButton
            showLastButton
          />
        </div>
      </div>

      {/* Modal de Recusa */}
      <Modal
        show={showRefusalModal}
        onClose={closeRefusalModal}
        onCloseX={closeRefusalModal}
        title="Cancelar Ordem de Serviço"
        bodyContent={
          <div>
            <p
              style={{
                marginBottom: "20px",
                color: "var(--color-text-secondary)",
              }}
            >
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
                style={{ backgroundColor: "var(--background-inputs)" }}
              />
            </div>

            <div className="form-actions">
              <Button
                variant="light"
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

      {/* Modal de Atribuição de Atendente */}
      <Modal
        show={showAssignModal}
        onClose={closeAssignModal}
        onCloseX={closeAssignModal}
        title={
          assignOrder
            ? `Atribuir atendente à OS #${assignOrder.id}`
            : "Atribuir atendente"
        }
        bodyContent={
          <div>
            <p
              style={{
                marginBottom: "12px",
                color: "var(--color-text-secondary)",
              }}
            >
              Selecione o atendente responsável pela ordem.
            </p>

            <div className="form-group mb-3">
              <label className="form-label">Atendente</label>
              <CustomSelect
                options={[
                  { value: "", label: "Selecione um atendente" },
                  ...atendentesAssign.map((f) => ({
                    value: f.id.toString(),
                    label: f.person?.name || f.name || `#${f.id}`,
                  })),
                ]}
                value={assignSelected}
                onChange={setAssignSelected}
                placeholder="Selecione um atendente"
                disabled={loadingAtendentesAssign || isAssigning}
              />
            </div>

            <div className="form-actions">
              <Button
                variant="light"
                text="Cancelar"
                onClick={closeAssignModal}
                disabled={isAssigning}
              />
              <Button
                variant="primary"
                text={isAssigning ? "Atribuindo..." : "Atribuir atendente"}
                onClick={handleAssignSubmit}
                disabled={isAssigning}
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
            {pickupOrder?.remaining_payment > 0 && (
              <div
                style={{
                  border: "2px solid #cba135",
                  borderRadius: "8px",
                  padding: "16px",
                  marginBottom: "20px",
                  backgroundColor: "var(--color-bg-secondary)",
                }}
              >
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    marginBottom: "12px",
                    color: "#cba135",
                  }}
                >
                  <svg
                    width="20"
                    height="20"
                    viewBox="0 0 24 24"
                    fill="currentColor"
                    style={{ marginRight: "8px" }}
                  >
                    <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z" />
                  </svg>
                  <strong>Valor Restante para Receber</strong>
                </div>
                <div
                  style={{
                    fontSize: "20px",
                    fontWeight: "bold",
                    color: "#f44336",
                    marginBottom: "16px",
                  }}
                >
                  {formatCurrency(pickupOrder.remaining_payment)}
                </div>

                {receiveRemainingPayment && (
                  <div>
                    {remainingPaymentForms.map((form, index) => (
                      <div key={index} style={{ marginBottom: "16px" }}>
                        <div
                          style={{
                            display: "flex",
                            justifyContent: "space-between",
                            alignItems: "center",
                            marginBottom: "8px",
                          }}
                        >
                          <label className="form-label" style={{ margin: 0 }}>
                            Forma de Pagamento{" "}
                            {remainingPaymentForms.length > 1
                              ? `#${index + 1}`
                              : ""}
                            <span style={{ color: "#f44336" }}> *</span>
                          </label>
                        </div>

                        <div
                          style={{
                            display: "flex",
                            gap: "12px",
                            marginBottom: "8px",
                          }}
                        >
                          <div style={{ flex: 1 }}>
                            <input
                              type="text"
                              placeholder="R$ 0,00"
                              value={form.amount}
                              onChange={(e) =>
                                updateRemainingForm(
                                  index,
                                  "amount",
                                  e.target.value
                                )
                              }
                              className="form-control"
                            />
                          </div>
                          <div style={{ flex: 1 }}>
                            <CustomSelect
                              value={form.forma_pagamento}
                              onChange={(value) =>
                                updateRemainingForm(
                                  index,
                                  "forma_pagamento",
                                  value
                                )
                              }
                              options={[
                                { value: "", label: "Selecione" },
                                { value: "credito", label: "Crédito" },
                                { value: "debito", label: "Débito" },
                                { value: "pix", label: "PIX" },
                                { value: "dinheiro", label: "Dinheiro" },
                                { value: "voucher", label: "Voucher" },
                              ]}
                              placeholder="Forma de pagamento"
                            />
                          </div>
                        </div>
                      </div>
                    ))}

                    <div
                      style={{ justifyContent: "flex-end", display: "flex" }}
                    >
                      <small
                        onClick={toggleSecondRemainingForm}
                        style={{
                          cursor: "pointer",
                          color: "var(--color-accent)",
                        }}
                      >
                        {remainingPaymentForms.length === 1
                          ? "+ Adicionar 2ª forma"
                          : "- Remover 2ª forma"}
                      </small>
                    </div>

                    <div
                      style={{
                        marginTop: "16px",
                        padding: "12px",
                        backgroundColor: "var(--color-bg-tertiary)",
                        borderRadius: "6px",
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                      }}
                    >
                      <span
                        style={{
                          fontWeight: "500",
                          color: "var(--color-text-secondary)",
                        }}
                      >
                        Total informado:
                      </span>
                      <span
                        style={{
                          fontSize: "18px",
                          fontWeight: "bold",
                          color:
                            Math.abs(
                              computeRemainingTotal(remainingPaymentForms) -
                                pickupOrder.remaining_payment
                            ) < 0.01
                              ? "#4caf50"
                              : "#f44336",
                        }}
                      >
                        {formatCurrency(
                          computeRemainingTotal(remainingPaymentForms)
                        )}
                      </span>
                    </div>
                  </div>
                )}
              </div>
            )}

            <div
              style={{
                background: "var(--color-bg-secondary)",
                padding: "12px",
                borderRadius: "6px",
                marginBottom: "20px",
                fontSize: "14px",
                color: "var(--color-text-primary)",
              }}
            >
              <strong>Confirmação:</strong> Ao confirmar, a ordem será marcada
              como retirada
              {pickupOrder?.remaining_payment > 0 &&
                receiveRemainingPayment &&
                " e o pagamento restante será registrado"}
              .
            </div>

            <div className="form-actions">
              <Button
                variant="light"
                text="Cancelar"
                onClick={closePickupModal}
                disabled={isProcessingPickup}
              />
              <Button
                variant="primary"
                text={
                  isProcessingPickup ? "Processando..." : "Confirmar Retirada"
                }
                onClick={handlePickupSubmit}
                disabled={isProcessingPickup}
                style={{
                  background: "#CBA135",
                  border: "none",
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
