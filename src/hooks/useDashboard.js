import { useState, useEffect } from 'react';
import { dashboardService } from '../services/dashboardService';

export const useDashboard = () => {
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await dashboardService.getDashboardData();
      setDashboardData(response.data);
    } catch (err) {
      setError(err.message || 'Erro ao carregar dados do dashboard');
      console.error('Erro no hook useDashboard:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const refetch = () => {
    fetchDashboardData();
  };

  return {
    dashboardData,
    loading,
    error,
    refetch
  };
};

export default useDashboard; 