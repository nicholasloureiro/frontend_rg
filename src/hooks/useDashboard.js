import { useState, useEffect } from 'react';
import { dashboardService } from '../services/dashboardService';

// Função para normalizar os dados da API (snake_case -> camelCase)
const normalizeAnalyticsData = (apiData) => {
  if (!apiData || !apiData.analytics) {
    return null;
  }

  const analytics = apiData.analytics;

  return {
    vendasPorTipo: {
      locacao: analytics.vendas_por_tipo?.locacao || 0,
      venda: analytics.vendas_por_tipo?.venda || 0,
      totalVendas: analytics.vendas_por_tipo?.total_vendas || 0,
      percentualLocacao: analytics.vendas_por_tipo?.percentual_locacao || 0,
      percentualVenda: analytics.vendas_por_tipo?.percentual_venda || 0
    },
    clientesAtendidos: {
      total: analytics.clientes_atendidos?.total || 0,
      novos: analytics.clientes_atendidos?.novos || 0,
      recorrentes: analytics.clientes_atendidos?.recorrentes || 0,
      porPeriodo: analytics.clientes_atendidos?.por_periodo || []
    },
    conversao: {
      geral: analytics.conversao?.geral || 0,
      loja: analytics.conversao?.loja || 0,
      atendentes: analytics.conversao?.atendentes || []
    },
    ticketMedio: {
      geral: analytics.ticket_medio?.geral || 0,
      locacao: analytics.ticket_medio?.locacao || 0,
      venda: analytics.ticket_medio?.venda || 0,
      evolucao: analytics.ticket_medio?.evolucao || []
    },
    vendasPorCanal: analytics.vendas_por_canal || [],
    tipoCliente: analytics.tipo_cliente || [],
    motivosRecusa: analytics.motivos_recusa || [],
    reclamacoes: {
      total: analytics.reclamacoes?.total || 0,
      resolvidas: analytics.reclamacoes?.resolvidas || 0,
      pendentes: analytics.reclamacoes?.pendentes || 0,
      porCategoria: analytics.reclamacoes?.por_categoria || [],
      satisfacaoPos: analytics.reclamacoes?.satisfacao_pos || 0
    },
    resumo: {
      ticketMedio: analytics.resumo?.ticket_medio || 0,
      conversaoGeral: analytics.resumo?.conversao_geral || 0,
      satisfacaoCliente: analytics.resumo?.satisfacao_cliente || 0,
      nps: analytics.resumo?.nps || 0
    }
  };
};

// Função para normalizar dados de métricas de atendentes
const normalizeAttendantMetricsData = (attendantMetricsData) => {
  if (!attendantMetricsData || !attendantMetricsData.atendentes) {
    return [];
  }

  return attendantMetricsData.atendentes.map(atendente => {
    // Selecionar dados baseado no período (padrão: mês)
    const periodoData = atendente.mes || atendente.semana || atendente.dia;
    
    return {
      id: atendente.atendente_id,
      nome: atendente.atendente_nome,
      taxa: periodoData.conversao?.taxa_conversao || 0,
      conversoes: periodoData.conversao?.concluidos_sucesso || 0,
      atendimentos: periodoData.conversao?.atendimentos_iniciados || 0,
      totalAtendimentos: periodoData.atendimentos?.total_atendimentos || 0,
      finalizados: periodoData.atendimentos?.finalizados || 0,
      cancelados: periodoData.atendimentos?.cancelados || 0,
      emAndamento: periodoData.atendimentos?.em_andamento || 0,
      totalVendido: periodoData.financeiro?.total_vendido || 0,
      totalRecebido: periodoData.financeiro?.total_recebido || 0,
      itensVendidos: periodoData.vendas?.itens_vendidos || 0
    };
  });
};

export const useDashboard = (period = 'mes', customDate = null, customType = null) => {
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchDashboardData = async (selectedPeriod = period, selectedCustomDate = customDate, selectedCustomType = customType) => {
    try {
      setLoading(true);
      setError(null);
      
      // Buscar dados do dashboard principal e métricas de atendentes em paralelo
      const [dashboardResponse, attendantMetricsResponse] = await Promise.all([
        dashboardService.getDashboardData(selectedPeriod, selectedCustomDate, selectedCustomType),
        dashboardService.getAttendantMetrics(selectedPeriod)
      ]);
      
      console.log('📊 Resposta completa da API:', dashboardResponse);
      console.log('📊 Dados do dashboard:', dashboardResponse.data);
      console.log('👥 Métricas de atendentes:', attendantMetricsResponse);
      
      // Verificar se a resposta tem a estrutura esperada
      if (dashboardResponse && dashboardResponse.data) {
        // Normalizar os dados de analytics
        const normalizedAnalytics = normalizeAnalyticsData(dashboardResponse.data);
        
        // Normalizar dados de métricas de atendentes
        const normalizedAttendantMetrics = normalizeAttendantMetricsData(attendantMetricsResponse);
        
        // Atualizar os dados de conversão com as métricas dos atendentes
        if (normalizedAnalytics && normalizedAttendantMetrics.length > 0) {
          normalizedAnalytics.conversao.atendentes = normalizedAttendantMetrics;
        }
        
        // Combinar os dados do dashboard com os analytics normalizados
        const combinedData = {
          ...dashboardResponse.data,
          analytics: normalizedAnalytics
        };
        
        console.log('📊 Dados normalizados:', combinedData);
        console.log('👥 Atendentes normalizados:', normalizedAttendantMetrics);
        setDashboardData(combinedData);
      } else {
        console.warn('⚠️ Resposta da API não tem a estrutura esperada:', dashboardResponse);
        setDashboardData(dashboardResponse || {});
      }
    } catch (err) {
      console.error('❌ Erro no hook useDashboard:', err);
      setError(err.message || 'Erro ao carregar dados do dashboard');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const refetch = (selectedPeriod = period, selectedCustomDate = customDate, selectedCustomType = customType) => {
    fetchDashboardData(selectedPeriod, selectedCustomDate, selectedCustomType);
  };

  const changePeriod = (newPeriod, newCustomDate = null, newCustomType = null) => {
    fetchDashboardData(newPeriod, newCustomDate, newCustomType);
  };

  return {
    dashboardData,
    loading,
    error,
    refetch,
    changePeriod,
    currentPeriod: period,
    currentCustomDate: customDate,
    currentCustomType: customType
  };
};

export default useDashboard; 