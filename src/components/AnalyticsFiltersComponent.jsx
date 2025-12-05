import React from "react";
import CustomSelect from "./CustomSelect";
import InputDate from "./InputDate";
import "../styles/AnalyticsFilters.css";

const AnalyticsFilters = ({
  filters = {},
  onFilterChange,
  selectedFilters = {},
}) => {
  const handleSelectChange = (filterName, value) => {
    onFilterChange({
      ...selectedFilters,
      [filterName]: value,
    });
  };

  const handleDateChange = (filterName, date) => {
    // Converter Date para string YYYY-MM-DD (sem hora)
    if (!date) {
      onFilterChange({
        ...selectedFilters,
        [filterName]: '',
      });
      return;
    }
    
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const dateString = `${year}-${month}-${day}`;
    
    onFilterChange({
      ...selectedFilters,
      [filterName]: dateString,
    });
  };

  // Converter string YYYY-MM-DD para Date object (evitando issues de timezone)
  const stringToDate = (dateString) => {
    if (!dateString) return null;
    const [year, month, day] = dateString.split('-');
    return new Date(year, month - 1, day);
  };

  return (
    <div className="analytics-filters">
      <div className="filters-container">
        {/* Filtro de Atendente */}
        {filters.atendentes && filters.atendentes.length > 0 && (
          <div style={{display: 'flex', flexDirection: 'column', alignItems: 'flex-start'}}>
            <label>Atendente</label>
            <CustomSelect
              options={[
                { value: "", label: "Todos" },
                ...filters.atendentes.map((atendente) => ({
                  value: atendente.id,
                  label: atendente.nome,
                })),
              ]}
              value={selectedFilters.atendente || ""}
              onChange={(value) => handleSelectChange("atendente", value)}
              placeholder="Selecione um atendente"
            />
          </div>
        )}

        {/* Filtro de Tipo de Cliente */}
        {filters.tipos_cliente && filters.tipos_cliente.length > 0 && (
          <div style={{display: 'flex', flexDirection: 'column', alignItems: 'flex-start'}}>
            <label>Tipo de Cliente</label>
            <CustomSelect
              options={[
                { value: "", label: "Todos" },
                ...filters.tipos_cliente.map((tipo) => ({
                  value: tipo,
                  label: tipo,
                })),
              ]}
              value={selectedFilters.tipoCliente || ""}
              onChange={(value) => handleSelectChange("tipoCliente", value)}
              placeholder="Selecione um tipo"
            />
          </div>
        )}

        {/* Filtro de Forma de Pagamento */}
        {filters.formas_pagamento && filters.formas_pagamento.length > 0 && (
          <div style={{display: 'flex', flexDirection: 'column', alignItems: 'flex-start'}}>
            <label>Forma de Pagamento</label>
            <CustomSelect
              options={[
                { value: "", label: "Todos" },
                ...filters.formas_pagamento.map((forma) => ({
                  value: forma,
                  label: forma,
                })),
              ]}
              value={selectedFilters.formaPagamento || ""}
              onChange={(value) => handleSelectChange("formaPagamento", value)}
              placeholder="Selecione uma forma"
            />
          </div>
        )}

        {/* Filtro de Canal de Origem */}
        {filters.canais_origem && filters.canais_origem.length > 0 && (
          <div style={{display: 'flex', flexDirection: 'column', alignItems: 'flex-start'}}>
            <label>Canal de Origem</label>
            <CustomSelect
              options={[
                { value: "", label: "Todos" },
                ...filters.canais_origem.map((canal) => ({
                  value: canal,
                  label: canal,
                })),
              ]}
              value={selectedFilters.canalOrigem || ""}
              onChange={(value) => handleSelectChange("canalOrigem", value)}
              placeholder="Selecione um canal"
            />
          </div>
        )}

        {/* Filtro de Data Início */}
        <div style={{display: 'flex', flexDirection: 'column', alignItems: 'flex-start'}}>
          <label>Data Início</label>
          <InputDate
            selectedDate={stringToDate(selectedFilters.dataInicio)}
            onDateChange={(date) => handleDateChange("dataInicio", date)}
            placeholderText="Data início"
          />
        </div>

        {/* Filtro de Data Fim */}
        <div style={{display: 'flex', flexDirection: 'column', alignItems: 'flex-start'}}>
          <label>Data Fim</label>
          <InputDate
            selectedDate={stringToDate(selectedFilters.dataFim)}
            onDateChange={(date) => handleDateChange("dataFim", date)}
            placeholderText="Data fim"
          />
        </div>
      </div>
    </div>
  );
};

export default AnalyticsFilters;
