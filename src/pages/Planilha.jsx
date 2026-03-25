import React, { useState, useEffect, useMemo, useCallback } from "react";
import { serviceOrderService } from "../services/serviceOrderService";
import { MaterialReactTable } from "material-react-table";
import { Pagination } from "@mui/material";
import Header from "../components/Header";
import InputDate from "../components/InputDate";
import { useAuth } from "../hooks/useAuth";
import "../styles/Planilha.css";

const Planilha = () => {
  const { user } = useAuth();
  const isAdministrator = user?.person?.person_type?.type === "ADMINISTRADOR";

  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [pageSize] = useState(50);
  const [totals, setTotals] = useState({});
  const [availableFilters, setAvailableFilters] = useState({ canais: [], atendentes: [] });

  // Filtros
  const [startDate, setStartDate] = useState(new Date());
  const [endDate, setEndDate] = useState(null);
  const [search, setSearch] = useState("");
  const [searchDebounced, setSearchDebounced] = useState("");
  const [fechamentoFilter, setFechamentoFilter] = useState("");
  const [canalFilter, setCanalFilter] = useState("");
  const [atendenteFilter, setAtendenteFilter] = useState("");

  useEffect(() => {
    const timer = setTimeout(() => setSearchDebounced(search), 500);
    return () => clearTimeout(timer);
  }, [search]);

  const formatDateForApi = (date) => {
    if (!date) return null;
    const y = date.getFullYear();
    const m = String(date.getMonth() + 1).padStart(2, "0");
    const d = String(date.getDate()).padStart(2, "0");
    return `${y}-${m}-${d}`;
  };

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const filters = { page: currentPage, page_size: pageSize };
      if (startDate) filters.start_date = formatDateForApi(startDate);
      if (endDate) filters.end_date = formatDateForApi(endDate);
      if (searchDebounced) filters.search = searchDebounced;
      if (fechamentoFilter) filters.fechamento = fechamentoFilter;
      if (canalFilter) filters.canal = canalFilter;
      if (atendenteFilter) filters.atendente = atendenteFilter;

      const res = await serviceOrderService.getPlanilha(filters);
      setData(res.results || []);
      setTotalPages(res.total_pages || 1);
      setTotalCount(res.count || 0);
      setTotals(res.totals || {});
      if (res.available_filters) setAvailableFilters(res.available_filters);
    } catch (err) {
      console.error("Erro ao carregar planilha:", err);
      setData([]);
    } finally {
      setLoading(false);
    }
  }, [currentPage, pageSize, startDate, endDate, searchDebounced, fechamentoFilter, canalFilter, atendenteFilter]);

  useEffect(() => {
    if (isAdministrator) fetchData();
  }, [fetchData, isAdministrator]);

  useEffect(() => {
    setCurrentPage(1);
  }, [startDate, endDate, searchDebounced, fechamentoFilter, canalFilter, atendenteFilter]);

  const formatDate = (val) => {
    if (!val) return "";
    const d = new Date(val + "T00:00:00");
    return d.toLocaleDateString("pt-BR");
  };

  const fmtCurrency = (val) => {
    if (val == null) return "R$ 0,00";
    return new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(val);
  };

  const columns = useMemo(
    () => [
      { accessorKey: "data", header: "Data", size: 100, Cell: ({ cell }) => formatDate(cell.getValue()) },
      { accessorKey: "numero_os", header: "N° OS", size: 70 },
      { accessorKey: "cliente", header: "Cliente", size: 130 },
      { accessorKey: "atendente", header: "Atendente", size: 120 },
      {
        accessorKey: "fechamento", header: "Fechamento", size: 95,
        Cell: ({ cell }) => (
          <span style={{ color: cell.getValue() === "SIM" ? "#4caf50" : "#f44336", fontWeight: 600 }}>
            {cell.getValue()}
          </span>
        ),
      },
      { accessorKey: "canal", header: "Canal", size: 110 },
      { accessorKey: "nome_cliente", header: "Nome Cliente", size: 200 },
      { accessorKey: "valor", header: "Valor", size: 110, Cell: ({ cell }) => fmtCurrency(cell.getValue()) },
      { accessorKey: "forma_pgto", header: "Forma Pgto", size: 110 },
      { accessorKey: "valor_total_venda", header: "Valor Total Venda", size: 140, Cell: ({ cell }) => fmtCurrency(cell.getValue()) },
      { accessorKey: "justificativa", header: "Justificativa", size: 280 },
    ],
    []
  );

  if (!isAdministrator) {
    return (
      <div className="planilha-page">
        <Header title="Planilha" />
        <div className="planilha-container" style={{ textAlign: "center", padding: 60 }}>
          <i className="bi bi-lock" style={{ fontSize: 48, color: "#999" }}></i>
          <h3 style={{ marginTop: 16, color: "#666" }}>Acesso Restrito</h3>
          <p style={{ color: "#999" }}>Apenas administradores podem acessar a planilha.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="planilha-page">
      <Header title="Planilha" />
      <div className="planilha-container">
        {/* Totalizers */}
        <div className="planilha-totals">
          <div className="total-card">
            <span className="total-label">Total de OS</span>
            <span className="total-value">{totals.total_os || 0}</span>
          </div>
          <div className="total-card">
            <span className="total-label">Fechadas</span>
            <span className="total-value" style={{ color: "#4caf50" }}>{totals.total_fechadas || 0}</span>
          </div>
          <div className="total-card">
            <span className="total-label">Conversão</span>
            <span className="total-value" style={{ color: "#1976d2" }}>{totals.taxa_conversao || 0}%</span>
          </div>
          <div className="total-card">
            <span className="total-label">Total Recebido</span>
            <span className="total-value" style={{ color: "#2e7d32" }}>{fmtCurrency(totals.total_recebido)}</span>
          </div>
          <div className="total-card">
            <span className="total-label">Total Vendido</span>
            <span className="total-value" style={{ color: "#1565c0" }}>{fmtCurrency(totals.total_vendido)}</span>
          </div>
        </div>

        {/* Filtros */}
        <div className="planilha-filters">
          <div className="filter-group">
            <label>De</label>
            <InputDate selectedDate={startDate} onDateChange={setStartDate} placeholderText="Data inicial" />
          </div>
          <div className="filter-group">
            <label>Até</label>
            <InputDate selectedDate={endDate} onDateChange={setEndDate} placeholderText="Data final" />
          </div>
          <div className="filter-group">
            <label>Fechamento</label>
            <select value={fechamentoFilter} onChange={(e) => setFechamentoFilter(e.target.value)} className="planilha-select">
              <option value="">Todos</option>
              <option value="SIM">SIM</option>
              <option value="NAO">NÃO</option>
            </select>
          </div>
          <div className="filter-group">
            <label>Canal</label>
            <select value={canalFilter} onChange={(e) => setCanalFilter(e.target.value)} className="planilha-select">
              <option value="">Todos</option>
              {availableFilters.canais.map((c) => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </div>
          <div className="filter-group">
            <label>Atendente</label>
            <select value={atendenteFilter} onChange={(e) => setAtendenteFilter(e.target.value)} className="planilha-select">
              <option value="">Todos</option>
              {availableFilters.atendentes.map((a) => (
                <option key={a} value={a}>{a}</option>
              ))}
            </select>
          </div>
          <div className="filter-group" style={{ flex: 1 }}>
            <label>Buscar</label>
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Nome, CPF, OS..."
              className="planilha-select"
              style={{ minWidth: 150 }}
            />
          </div>
          <div className="filter-group" style={{ alignSelf: "flex-end" }}>
            <span className="result-count">{totalCount} registros</span>
          </div>
        </div>

        {/* Tabela */}
        <div className="planilha-table-wrapper">
          <MaterialReactTable
            columns={columns}
            data={data}
            enableColumnActions={false}
            enableColumnFilters={false}
            enableTopToolbar={false}
            enableBottomToolbar={false}
            enablePagination={false}
            enableSorting={false}
            enableGlobalFilter={false}
            enableStickyHeader={true}
            state={{ isLoading: loading }}
            muiTableContainerProps={{
              sx: { maxHeight: "calc(100vh - 380px)" },
            }}
            muiTableBodyRowProps={({ row }) => {
              const fase = row.original.fase;
              let bgColor = undefined;
              if (fase === "FINALIZADO") bgColor = "#e8f5e9";
              else if (fase === "RECUSADA") bgColor = "#ffebee";
              return {
                sx: {
                  backgroundColor: bgColor,
                  "&:hover": {
                    backgroundColor: fase === "FINALIZADO" ? "#c8e6c9" : fase === "RECUSADA" ? "#ffcdd2" : "#e8f0fe",
                  },
                },
              };
            }}
            muiTableHeadCellProps={{
              sx: {
                backgroundColor: "#1F3B4D",
                color: "#fff",
                fontWeight: 600,
                fontSize: "12px",
                textTransform: "uppercase",
                padding: "8px 10px",
                borderRight: "1px solid #2a5068",
              },
            }}
            muiTableBodyCellProps={{
              sx: {
                padding: "6px 10px",
                fontSize: "13px",
                borderRight: "1px solid #e0e0e0",
              },
            }}
          />
        </div>

        {/* Paginacao */}
        {totalPages > 1 && (
          <div className="planilha-pagination">
            <Pagination
              count={totalPages}
              page={currentPage}
              onChange={(_, p) => setCurrentPage(p)}
              color="primary"
              showFirstButton
              showLastButton
            />
          </div>
        )}
      </div>
    </div>
  );
};

export default Planilha;
