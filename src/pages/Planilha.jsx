import React, { useState, useEffect, useMemo, useCallback } from "react";
import { serviceOrderService } from "../services/serviceOrderService";
import { MaterialReactTable } from "material-react-table";
import { Pagination } from "@mui/material";
import Header from "../components/Header";
import InputDate from "../components/InputDate";
import "../styles/Planilha.css";

const Planilha = () => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [pageSize] = useState(50);

  // Filtros
  const [startDate, setStartDate] = useState(null);
  const [endDate, setEndDate] = useState(null);
  const [search, setSearch] = useState("");
  const [searchDebounced, setSearchDebounced] = useState("");

  // Debounce search
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

      const res = await serviceOrderService.getPlanilha(filters);
      setData(res.results || []);
      setTotalPages(res.total_pages || 1);
      setTotalCount(res.count || 0);
    } catch (err) {
      console.error("Erro ao carregar planilha:", err);
      setData([]);
    } finally {
      setLoading(false);
    }
  }, [currentPage, pageSize, startDate, endDate, searchDebounced]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Reset page when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [startDate, endDate, searchDebounced]);

  const formatDate = (val) => {
    if (!val) return "";
    const d = new Date(val + "T00:00:00");
    return d.toLocaleDateString("pt-BR");
  };

  const formatCurrency = (val) => {
    if (val == null) return "R$ 0,00";
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(val);
  };

  const columns = useMemo(
    () => [
      {
        accessorKey: "data",
        header: "Data",
        size: 100,
        Cell: ({ cell }) => formatDate(cell.getValue()),
      },
      {
        accessorKey: "numero_os",
        header: "N° OS",
        size: 70,
      },
      {
        accessorKey: "cliente",
        header: "Cliente",
        size: 120,
      },
      {
        accessorKey: "atendente",
        header: "Atendente",
        size: 100,
      },
      {
        accessorKey: "fechamento",
        header: "Fechamento",
        size: 90,
        Cell: ({ cell }) => {
          const val = cell.getValue();
          return (
            <span
              style={{
                color: val === "SIM" ? "#4caf50" : "#f44336",
                fontWeight: 600,
              }}
            >
              {val}
            </span>
          );
        },
      },
      {
        accessorKey: "canal",
        header: "Canal",
        size: 110,
      },
      {
        accessorKey: "nome_cliente",
        header: "Nome Cliente",
        size: 180,
      },
      {
        accessorKey: "valor",
        header: "Valor",
        size: 100,
        Cell: ({ cell }) => formatCurrency(cell.getValue()),
      },
      {
        accessorKey: "forma_pgto",
        header: "Forma Pgto",
        size: 110,
      },
      {
        accessorKey: "valor_total_venda",
        header: "Valor Total Venda",
        size: 130,
        Cell: ({ cell }) => formatCurrency(cell.getValue()),
      },
      {
        accessorKey: "justificativa",
        header: "Justificativa",
        size: 250,
      },
    ],
    []
  );

  return (
    <div className="planilha-page">
      <Header title="Planilha" />
      <div className="planilha-container">
        {/* Filtros */}
        <div className="planilha-filters">
          <div className="filter-group">
            <label>De</label>
            <InputDate
              selectedDate={startDate}
              onDateChange={setStartDate}
              placeholderText="Data inicial"
            />
          </div>
          <div className="filter-group">
            <label>Até</label>
            <InputDate
              selectedDate={endDate}
              onDateChange={setEndDate}
              placeholderText="Data final"
            />
          </div>
          <div className="filter-group" style={{ flex: 1 }}>
            <label>Buscar</label>
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Nome, CPF, atendente, canal, OS..."
              className="form-control"
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
            state={{ isLoading: loading }}
            muiTableContainerProps={{
              sx: { maxHeight: "calc(100vh - 280px)" },
            }}
            muiTableBodyRowProps={({ row }) => {
              const fase = row.original.fase;
              let bgColor = undefined;
              if (fase === "FINALIZADO") bgColor = "#e8f5e9";
              else if (fase === "RECUSADA") bgColor = "#ffebee";
              return {
                sx: {
                  backgroundColor: bgColor,
                  "&:hover": { backgroundColor: fase === "FINALIZADO" ? "#c8e6c9" : fase === "RECUSADA" ? "#ffcdd2" : "#e8f0fe" },
                },
              };
            }}
            muiTableProps={{
              sx: {
                "& .MuiTableCell-root": {
                  padding: "6px 10px",
                  fontSize: "13px",
                  borderRight: "1px solid #e0e0e0",
                },
                "& .MuiTableHead-root .MuiTableCell-root": {
                  backgroundColor: "#1F3B4D",
                  color: "#fff",
                  fontWeight: 600,
                  fontSize: "12px",
                  textTransform: "uppercase",
                  position: "sticky",
                  top: 0,
                  zIndex: 1,
                },
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
