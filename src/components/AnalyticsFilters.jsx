import React from 'react';
import CustomSelect from './CustomSelect';
import InputDate from './InputDate';

const AnalyticsFilters = ({
  filtros, // { atendentes: [], tipos_cliente: [], formas_pagamento: [], canais_origem: [] }
  values,
  onChange,
  periodoPadrao,
}) => {
  // Converter para options
  const atendentesOptions = [{ value: '', label: 'Todos os atendentes' }, ...filtros.atendentes.map(a => ({ value: a.id, label: a.nome }))];
  const canalOptions = [{ value: '', label: 'Todos os canais' }, ...filtros.canais_origem.map(c => ({ value: c, label: c }))];
  const tipoClienteOptions = [{ value: '', label: 'Todos os tipos' }, ...filtros.tipos_cliente.map(tc => ({ value: tc, label: tc }))];
  const formaPagamentoOptions = [{ value: '', label: 'Todas as formas' }, ...filtros.formas_pagamento.map(fp => ({ value: fp, label: fp }))];

  return (
    <form className="analytics-filters" style={{
      display: 'flex', flexWrap: 'wrap', gap: 18, marginBottom: 18, alignItems: 'flex-end', background: 'var(--color-bg-card)', borderRadius: 12, padding: 16, boxShadow: '0 1px 6px #0001'
    }}>
      <CustomSelect
        label="Atendente"
        options={atendentesOptions}
        value={values.atendente_id || ''}
        onChange={v => onChange({ ...values, atendente_id: v })}
        placeholder="Todos"
      />
      <CustomSelect
        label="Canal de origem"
        options={canalOptions}
        value={values.canal_origem || ''}
        onChange={v => onChange({ ...values, canal_origem: v })}
        placeholder="Todos"
      />
      <CustomSelect
        label="Tipo de cliente"
        options={tipoClienteOptions}
        value={values.tipo_cliente || ''}
        onChange={v => onChange({ ...values, tipo_cliente: v })}
        placeholder="Todos"
      />
      <CustomSelect
        label="Forma de pagamento"
        options={formaPagamentoOptions}
        value={values.forma_pagamento || ''}
        onChange={v => onChange({ ...values, forma_pagamento: v })}
        placeholder="Todas"
      />
      <InputDate
        selectedDate={values.data_inicio ? new Date(values.data_inicio) : periodoPadrao?.data_inicio ? new Date(periodoPadrao.data_inicio) : undefined}
        onDateChange={d => onChange({ ...values, data_inicio: d ? d.toISOString().slice(0, 10) : '' })}
        placeholderText="Data de início"
      />
      <InputDate
        selectedDate={values.data_fim ? new Date(values.data_fim) : periodoPadrao?.data_fim ? new Date(periodoPadrao.data_fim) : undefined}
        onDateChange={d => onChange({ ...values, data_fim: d ? d.toISOString().slice(0, 10) : '' })}
        placeholderText="Data final"
      />
    </form>
  );
};

export default AnalyticsFilters;


