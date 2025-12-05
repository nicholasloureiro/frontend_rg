import { useState, useEffect } from 'react';
import { dashboardService } from '../services/dashboardService';

export const useDashboard = (period = 'mes', customDate = null, customType = null, atendente = null, tipoCliente = null, formaPagamento = null, canalOrigem = null, dataInicio = null, dataFim = null) => {
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchDashboardData = async (
    selectedPeriod = period, 
    selectedCustomDate = customDate, 
    selectedCustomType = customType,
    selectedAtendente = atendente,
    selectedTipoCliente = tipoCliente,
    selectedFormaPagamento = formaPagamento,
    selectedCanalOrigem = canalOrigem,
    selectedDataInicio = dataInicio,
    selectedDataFim = dataFim
  ) => {
    try {
      setLoading(true);
      const response = await dashboardService.getDashboardData(
        selectedPeriod, 
        selectedCustomDate, 
        selectedCustomType,
        selectedAtendente,
        selectedTipoCliente,
        selectedFormaPagamento,
        selectedCanalOrigem,
        selectedDataInicio,
        selectedDataFim
      );

      if (response && response.data) {
        setDashboardData(response.data);
      } else {
        setDashboardData(response || {});
      }
    } catch (err) {
      console.error('Erro ao buscar dados do dashboard:', err);
      setDashboardData(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const changePeriod = (newPeriod, newCustomDate = null, newCustomType = null, newAtendente = null, newTipoCliente = null, newFormaPagamento = null, newCanalOrigem = null, newDataInicio = null, newDataFim = null) => {
    fetchDashboardData(newPeriod, newCustomDate, newCustomType, newAtendente, newTipoCliente, newFormaPagamento, newCanalOrigem, newDataInicio, newDataFim);
  };

  return {
    dashboardData,
    loading,
    changePeriod,
  };
};

export default useDashboard; 