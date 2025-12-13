import React, { useState, useEffect, useMemo, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import "../styles/ProdutosConfig.css";
import Header from "../components/Header";
import Button from "../components/Button";
import Modal from "../components/Modal";
import Swal from "sweetalert2";
import { MaterialReactTable } from "material-react-table";
import { Box, IconButton, Tooltip } from "@mui/material";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import brandService from "../services/brandService";
import colorService from "../services/colorService";

const ProdutosConfig = () => {
  const navigate = useNavigate();
  // Estado para Marcas
  const [marcas, setMarcas] = useState([]);
  const [marcaForm, setMarcaForm] = useState({ nome: "", id: null });
  const [showModalMarca, setShowModalMarca] = useState(false);
  const [loadingMarcas, setLoadingMarcas] = useState(false);
  const [paginationMarcas, setPaginationMarcas] = useState({
    pageIndex: 0,
    pageSize: 10,
  });
  const [totalMarcas, setTotalMarcas] = useState(0);
  const [searchMarca, setSearchMarca] = useState("");
  const [debouncedSearchMarca, setDebouncedSearchMarca] = useState("");

  // Estado para Cores
  const [cores, setCores] = useState([]);
  const [corForm, setCorForm] = useState({ nome: "", id: null });
  const [showModalCor, setShowModalCor] = useState(false);
  const [loadingCores, setLoadingCores] = useState(false);
  const [paginationCores, setPaginationCores] = useState({
    pageIndex: 0,
    pageSize: 10,
  });
  const [totalCores, setTotalCores] = useState(0);
  const [searchCor, setSearchCor] = useState("");
  const [debouncedSearchCor, setDebouncedSearchCor] = useState("");

  // ==================== MARCAS ====================
  // Debounce para searchMarca
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearchMarca(searchMarca);
      // Resetar para a primeira página quando a busca mudar
      setPaginationMarcas((prev) => ({ ...prev, pageIndex: 0 }));
    }, 500);
    return () => clearTimeout(handler);
  }, [searchMarca]);

  // Carregar marcas com useCallback para evitar recriação desnecessária
  const buscarMarcas = useCallback(
    async (pageIndex = 0, pageSize = 10, search = "") => {
      setLoadingMarcas(false);
      try {
        const data = await brandService.getBrands(pageIndex, pageSize, search);
        // A API retorna { id, description }, mas a tabela espera { id, name }
        const marcasFormatadas = data.results.map((m) => ({
          id: m.id,
          name: m.description,
        }));
        setMarcas(marcasFormatadas);
        setTotalMarcas(data.count);
      } catch (err) {
        console.error("Erro ao buscar marcas:", err);
        Swal.fire({
          icon: "error",
          title: "Erro!",
          text: "Não foi possível carregar as marcas.",
          confirmButtonText: "OK",
        });
      } finally {
        setLoadingMarcas(false);
      }
    },
    []
  );

  // Carregar marcas quando a paginação ou busca mudar
  useEffect(() => {
    buscarMarcas(
      paginationMarcas.pageIndex,
      paginationMarcas.pageSize,
      debouncedSearchMarca
    );
  }, [paginationMarcas, debouncedSearchMarca, buscarMarcas]);

  // Abrir modal de marca (criar ou editar)
  const handleAbrirModalMarca = useCallback((marca = null) => {
    if (marca) {
      setMarcaForm({ nome: marca.name, id: marca.id });
    } else {
      setMarcaForm({ nome: "", id: null });
    }
    setShowModalMarca(true);
  }, []);

  // Fechar modal de marca
  const handleFecharModalMarca = useCallback(() => {
    setShowModalMarca(false);
    setMarcaForm({ nome: "", id: null });
  }, []);

  // Salvar marca (criar ou atualizar)
  const handleSalvarMarca = useCallback(async () => {
    if (!marcaForm.nome.trim()) {
      Swal.fire({
        icon: "warning",
        title: "Atenção",
        text: "Por favor, preencha o nome da marca.",
        confirmButtonText: "OK",
      });
      return;
    }

    try {
      if (marcaForm.id) {
        // Atualizar marca na API
        await brandService.updateBrand(marcaForm.id, marcaForm.nome);
        Swal.fire({
          icon: "success",
          title: "Sucesso!",
          text: "Marca atualizada com sucesso!",
          timer: 2000,
          showConfirmButton: false,
        });
      } else {
        // Criar marca na API
        await brandService.createBrand(marcaForm.nome);
        Swal.fire({
          icon: "success",
          title: "Sucesso!",
          text: "Marca criada com sucesso!",
          timer: 2000,
          showConfirmButton: false,
        });
      }
      handleFecharModalMarca();
      buscarMarcas(
        paginationMarcas.pageIndex,
        paginationMarcas.pageSize,
        debouncedSearchMarca
      );
    } catch (err) {
      console.error("Erro ao salvar marca:", err);
      Swal.fire({
        icon: "error",
        title: "Erro!",
        text: "Não foi possível salvar a marca.",
        confirmButtonText: "OK",
      });
    }
  }, [
    marcaForm,
    marcas,
    handleFecharModalMarca,
    buscarMarcas,
    paginationMarcas,
  ]);

  // Excluir marca
  const handleExcluirMarca = useCallback(
    async (id) => {
      const result = await Swal.fire({
        icon: "warning",
        iconColor: "#dc3545",
        title: "Confirmar exclusão",
        text: "Tem certeza que deseja excluir esta marca?",
        showCancelButton: true,
        confirmButtonText: "Sim, excluir",
        cancelButtonText: "Cancelar",
        confirmButtonColor: "#dc3545",
        cancelButtonColor: "transparent",
        reverseButtons: true,
      });

      if (result.isConfirmed) {
        try {
          // Excluir marca na API
          await brandService.deleteBrand(id);
          Swal.fire({
            icon: "success",
            title: "Excluída!",
            text: "Marca excluída com sucesso!",
            timer: 2000,
            showConfirmButton: false,
          });
          buscarMarcas(
            paginationMarcas.pageIndex,
            paginationMarcas.pageSize,
            debouncedSearchMarca
          );
        } catch (err) {
          console.error("Erro ao excluir marca:", err);
          Swal.fire({
            icon: "error",
            title: "Erro!",
            text: "Não foi possível excluir a marca.",
            confirmButtonText: "OK",
          });
        }
      }
    },
    [buscarMarcas, paginationMarcas, debouncedSearchMarca]
  );

  // ==================== CORES ====================
  // Debounce para searchCor
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearchCor(searchCor);
      // Resetar para a primeira página quando a busca mudar
      setPaginationCores((prev) => ({ ...prev, pageIndex: 0 }));
    }, 500);
    return () => clearTimeout(handler);
  }, [searchCor]);

  // Carregar cores com useCallback
  const buscarCores = useCallback(
    async (pageIndex = 0, pageSize = 10, search = "") => {
      setLoadingCores(true);
      try {
        const data = await colorService.getColors(pageIndex, pageSize, search);
        setCores(data.results);
        setTotalCores(data.count);
      } catch (err) {
        console.error("Erro ao buscar cores:", err);
        Swal.fire({
          icon: "error",
          title: "Erro!",
          text: "Não foi possível carregar as cores.",
          confirmButtonText: "OK",
        });
      } finally {
        setLoadingCores(false);
      }
    },
    []
  );

  // Carregar cores quando a paginação ou busca mudar
  useEffect(() => {
    buscarCores(
      paginationCores.pageIndex,
      paginationCores.pageSize,
      debouncedSearchCor
    );
  }, [paginationCores, debouncedSearchCor, buscarCores]);

  // Abrir modal de cor (criar ou editar)
  const handleAbrirModalCor = useCallback((cor = null) => {
    if (cor) {
      setCorForm({ nome: cor.description, id: cor.id });
    } else {
      setCorForm({ nome: "", id: null });
    }
    setShowModalCor(true);
  }, []);

  // Fechar modal de cor
  const handleFecharModalCor = useCallback(() => {
    setShowModalCor(false);
    setCorForm({ nome: "", id: null });
  }, []);

  // Salvar cor (criar ou atualizar)
  const handleSalvarCor = useCallback(async () => {
    if (!corForm.nome.trim()) {
      Swal.fire({
        icon: "warning",
        title: "Atenção",
        text: "Por favor, preencha o nome da cor.",
        confirmButtonText: "OK",
      });
      return;
    }

    try {
      if (corForm.id) {
        // Atualizar cor na API
        await colorService.updateColor(corForm.id, corForm.nome);
        Swal.fire({
          icon: "success",
          title: "Sucesso!",
          text: "Cor atualizada com sucesso!",
          timer: 2000,
          showConfirmButton: false,
        });
      } else {
        // Criar cor na API
        await colorService.createColor(corForm.nome);
        Swal.fire({
          icon: "success",
          title: "Sucesso!",
          text: "Cor criada com sucesso!",
          timer: 2000,
          showConfirmButton: false,
        });
      }
      handleFecharModalCor();
      buscarCores(
        paginationCores.pageIndex,
        paginationCores.pageSize,
        debouncedSearchCor
      );
    } catch (err) {
      console.error("Erro ao salvar cor:", err);
      Swal.fire({
        icon: "error",
        title: "Erro!",
        text: "Não foi possível salvar a cor.",
        confirmButtonText: "OK",
      });
    }
  }, [
    corForm,
    handleFecharModalCor,
    buscarCores,
    paginationCores,
    debouncedSearchCor,
  ]);

  // Excluir cor
  const handleExcluirCor = useCallback(
    async (id) => {
      const result = await Swal.fire({
        icon: "warning",
        iconColor: "#dc3545",
        title: "Confirmar exclusão",
        text: "Tem certeza que deseja excluir esta cor?",
        showCancelButton: true,
        confirmButtonText: "Sim, excluir",
        cancelButtonText: "Cancelar",
        confirmButtonColor: "#dc3545",
        cancelButtonColor: "transparent",
        reverseButtons: true,
      });

      if (result.isConfirmed) {
        try {
          // Excluir cor na API
          await colorService.deleteColor(id);
          Swal.fire({
            icon: "success",
            title: "Excluída!",
            text: "Cor excluída com sucesso!",
            timer: 2000,
            showConfirmButton: false,
          });
          buscarCores(
            paginationCores.pageIndex,
            paginationCores.pageSize,
            debouncedSearchCor
          );
        } catch (err) {
          console.error("Erro ao excluir cor:", err);
          Swal.fire({
            icon: "error",
            title: "Erro!",
            text: "Não foi possível excluir a cor.",
            confirmButtonText: "OK",
          });
        }
      }
    },
    [buscarCores, paginationCores, debouncedSearchCor]
  );

  // ==================== COLUNAS DAS TABELAS ====================
  // Memoizar colunas para evitar recriações desnecessárias
  const colsMarcas = useMemo(
    () => [
      {
        accessorKey: "id",
        header: "ID",
        size: 80,
        Cell: ({ row }) => <span>#{row.original.id}</span>,
      },
      {
        accessorKey: "name",
        header: "Marca",
        size: 200,
        Cell: ({ cell }) => (
          <span style={{ fontWeight: 500 }}>{cell.getValue()}</span>
        ),
      },
      {
        id: "actions",
        header: "Ações",
        size: 120,
        Cell: ({ row }) => (
          <Box sx={{ display: "flex", gap: 0.5 }}>
            <Tooltip title="Editar">
              <IconButton
                size="small"
                onClick={() => handleAbrirModalMarca(row.original)}
                sx={{ color: "var(--color-accent)" }}
              >
                <EditIcon fontSize="small" />
              </IconButton>
            </Tooltip>
            <Tooltip title="Excluir">
              <IconButton
                size="small"
                onClick={() => handleExcluirMarca(row.original.id)}
                sx={{ color: "#dc3545" }}
              >
                <DeleteIcon fontSize="small" />
              </IconButton>
            </Tooltip>
          </Box>
        ),
      },
    ],
    [handleAbrirModalMarca, handleExcluirMarca]
  );

  const colsCores = useMemo(
    () => [
      {
        accessorKey: "id",
        header: "ID",
        size: 80,
        Cell: ({ row }) => <span>#{row.original.id}</span>,
      },
      {
        accessorKey: "description",
        header: "Cor",
        size: 200,
        Cell: ({ cell }) => (
          <span style={{ fontWeight: 500 }}>{cell.getValue()}</span>
        ),
      },
      {
        id: "actions",
        header: "Ações",
        size: 120,
        Cell: ({ row }) => (
          <Box sx={{ display: "flex", gap: 0.5 }}>
            <Tooltip title="Editar">
              <IconButton
                size="small"
                onClick={() => handleAbrirModalCor(row.original)}
                sx={{ color: "var(--color-accent)" }}
              >
                <EditIcon fontSize="small" />
              </IconButton>
            </Tooltip>
            <Tooltip title="Excluir">
              <IconButton
                size="small"
                onClick={() => handleExcluirCor(row.original.id)}
                sx={{ color: "#dc3545" }}
              >
                <DeleteIcon fontSize="small" />
              </IconButton>
            </Tooltip>
          </Box>
        ),
      },
    ],
    [handleAbrirModalCor, handleExcluirCor]
  );

  // ==================== COMPONENTES DE MODAL ====================
  const ModalMarca = useCallback(
    () => (
      <div className="config-modal-content">
        <div className="form-group">
          <label className="form-label">Nome da Marca</label>
          <input
            type="text"
            className="form-control"
            placeholder="Digite o nome da marca"
            value={marcaForm.nome}
            onChange={(e) =>
              setMarcaForm((prev) => ({ ...prev, nome: e.target.value }))
            }
            onKeyPress={(e) => e.key === "Enter" && handleSalvarMarca()}
            autoFocus
          />
        </div>
        <div className="d-flex justify-content-end gap-2 mt-4">
          <Button
            text="Cancelar"
            variant="disabled"
            onClick={handleFecharModalMarca}
          />
          <Button
            text={marcaForm.id ? "Atualizar" : "Criar"}
            variant="primary"
            onClick={handleSalvarMarca}
          />
        </div>
      </div>
    ),
    [marcaForm, handleSalvarMarca, handleFecharModalMarca]
  );

  const ModalCor = useCallback(
    () => (
      <div className="config-modal-content">
        <div className="form-group">
          <label className="form-label">Nome da Cor</label>
          <input
            type="text"
            className="form-control"
            placeholder="Digite o nome da cor (ex: Preto, Azul, Vermelho)"
            value={corForm.nome}
            onChange={(e) =>
              setCorForm((prev) => ({ ...prev, nome: e.target.value }))
            }
            onKeyPress={(e) => e.key === "Enter" && handleSalvarCor()}
            autoFocus
          />
        </div>
        <div className="d-flex justify-content-end gap-2 mt-4">
          <Button
            text="Cancelar"
            variant="disabled"
            onClick={handleFecharModalCor}
          />
          <Button
            text={corForm.id ? "Atualizar" : "Criar"}
            variant="primary"
            onClick={handleSalvarCor}
          />
        </div>
      </div>
    ),
    [corForm, handleSalvarCor, handleFecharModalCor]
  );

  return (
    <>
      <Header nomeHeader="Configuração de Produtos" />
      <div className="produtos-config">
        <div className="container-fluid">
          <div className="mb-3">
            <Button
              text="Voltar"
              variant="primary"
              iconName="arrow-left"
              iconPosition="left"
              onClick={() => navigate(-1)}
            />
          </div>

          {/* Seção de Marcas */}
          <div className="config-section">
            <div className="section-header">
              <div>
                <h4 className="section-title">Gerenciar Marcas</h4>
                <p className="section-description">
                  Crie, edite e exclua marcas de produtos
                </p>
              </div>
              <Button
                text="Adicionar Marca"
                variant="primary"
                iconName="plus"
                iconPosition="left"
                onClick={() => handleAbrirModalMarca()}
              />
            </div>

            <MaterialReactTable
              columns={colsMarcas}
              data={marcas}
              state={{
                isLoading: loadingMarcas,
                pagination: paginationMarcas,
                globalFilter: searchMarca,
              }}
              manualPagination
              manualGlobalFilter
              rowCount={totalMarcas}
              onPaginationChange={setPaginationMarcas}
              onGlobalFilterChange={setSearchMarca}
              enableSorting={false}
              enableColumnActions={false}
              enableColumnFilters={false}
              enableDensityToggle={false}
              enableFullScreenToggle={false}
              enableHiding={false}
              muiTableContainerProps={{
                sx: { minHeight: "474px", maxHeight: "474px" },
              }}
              muiTablePaperProps={{
                elevation: 0,
                sx: {
                  border: "1px solid var(--color-border)",
                  borderRadius: "8px",
                },
              }}
              muiTableHeadCellProps={{
                sx: {
                  backgroundColor: "var(--color-bg-card)",
                  fontWeight: 600,
                  fontSize: "0.75rem",
                  color: "var(--color-text-primary)",
                  padding: "8px 16px",
                },
              }}
              muiTableBodyCellProps={{
                sx: {
                  fontSize: "0.75rem",
                  color: "var(--color-text-primary)",
                  padding: "6px 16px",
                },
              }}
              muiTableBodyRowProps={{
                sx: {
                  "&:hover": {
                    backgroundColor: "var(--color-bg-card)",
                  },
                },
              }}
              muiPaginationProps={{
                rowsPerPageOptions: [5, 10, 20],
                showFirstButton: true,
                showLastButton: true,
              }}
              localization={{
                pagination: {
                  labelRowsPerPage: "Linhas por página",
                  labelDisplayedRows: ({ from, to, count }) =>
                    `${from}-${to} de ${
                      count !== -1 ? count : `mais de ${to}`
                    }`,
                },
                toolbar: {
                  searchPlaceholder: "Buscar...",
                },
                body: {
                  emptyDataSourceMessage: "Nenhuma marca cadastrada",
                },
              }}
            />
          </div>

          {/* Seção de Cores */}
          <div className="config-section">
            <div className="section-header">
              <div>
                <h4 className="section-title">Gerenciar Cores</h4>
                <p className="section-description">
                  Crie, edite e exclua cores de produtos
                </p>
              </div>
              <Button
                text="Adicionar Cor"
                variant="primary"
                iconName="plus"
                iconPosition="left"
                onClick={() => handleAbrirModalCor()}
              />
            </div>

            <MaterialReactTable
              columns={colsCores}
              data={cores}
              state={{
                isLoading: loadingCores,
                pagination: paginationCores,
                globalFilter: searchCor,
              }}
              manualPagination
              manualGlobalFilter
              rowCount={totalCores}
              onPaginationChange={setPaginationCores}
              onGlobalFilterChange={setSearchCor}
              enableSorting={false}
              enableColumnActions={false}
              enableColumnFilters={false}
              enableDensityToggle={false}
              enableFullScreenToggle={false}
              enableHiding={false}
              muiTableContainerProps={{
                sx: { minHeight: "474px", maxHeight: "474px" },
              }}
              muiTablePaperProps={{
                elevation: 0,
                sx: {
                  border: "1px solid var(--color-border)",
                  borderRadius: "8px",
                },
              }}
              muiTableHeadCellProps={{
                sx: {
                  backgroundColor: "var(--color-bg-card)",
                  fontWeight: 600,
                  fontSize: "0.75rem",
                  color: "var(--color-text-primary)",
                  padding: "8px 16px",
                },
              }}
              muiTableBodyCellProps={{
                sx: {
                  fontSize: "0.75rem",
                  color: "var(--color-text-primary)",
                  padding: "6px 16px",
                },
              }}
              muiTableBodyRowProps={{
                sx: {
                  "&:hover": {
                    backgroundColor: "var(--color-bg-card)",
                  },
                },
              }}
              muiPaginationProps={{
                rowsPerPageOptions: [5, 10, 20],
                showFirstButton: true,
                showLastButton: true,
              }}
              localization={{
                pagination: {
                  labelRowsPerPage: "Linhas por página",
                  labelDisplayedRows: ({ from, to, count }) =>
                    `${from}-${to} de ${
                      count !== -1 ? count : `mais de ${to}`
                    }`,
                },
                toolbar: {
                  searchPlaceholder: "Buscar...",
                },
                body: {
                  emptyDataSourceMessage: "Nenhuma cor cadastrada",
                },
              }}
            />
          </div>
        </div>
      </div>

      {/* Modal para Marca */}
      <Modal
        show={showModalMarca}
        onClose={handleFecharModalMarca}
        onCloseX={handleFecharModalMarca}
        title={marcaForm.id ? "Editar Marca" : "Adicionar Marca"}
        bodyContent={<ModalMarca />}
      />

      {/* Modal para Cor */}
      <Modal
        show={showModalCor}
        onClose={handleFecharModalCor}
        onCloseX={handleFecharModalCor}
        title={corForm.id ? "Editar Cor" : "Adicionar Cor"}
        bodyContent={<ModalCor />}
      />
    </>
  );
};

export default ProdutosConfig;
