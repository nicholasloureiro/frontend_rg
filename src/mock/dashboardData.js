// Exemplo de resposta que o backend deve retornar
// Endpoint: GET /api/dashboard/home

export const mockDashboardResponse = {
  "success": true,
  "message": "Dados do dashboard carregados com sucesso",
  "data": {
    "status": {
      "emAtraso": {
        "provas": 2,
        "retiradas": 1,
        "devolucoes": 3
      },
      "hoje": {
        "provas": 1,
        "retiradas": 2,
        "devolucoes": 0
      },
      "proximos10Dias": {
        "provas": 4,
        "retiradas": 2,
        "devolucoes": 1
      }
    },
    "resultados": {
      "dia": {
        "totalPedidos": 1200.00,
        "totalRecebido": 950.00,
        "numeroPedidos": 8
      },
      "semana": {
        "totalPedidos": 8500.00,
        "totalRecebido": 7200.00,
        "numeroPedidos": 42
      },
      "mes": {
        "totalPedidos": 32000.00,
        "totalRecebido": 28500.00,
        "numeroPedidos": 180
      }
    },
    "metadata": {
      "dataAtualizacao": "2024-01-15T10:30:00Z",
      "periodoReferencia": {
        "inicio": "2024-01-01T00:00:00Z",
        "fim": "2024-01-31T23:59:59Z"
      }
    }
  }
};

// Documentação da estrutura de dados
export const dashboardStructure = {
  // Estrutura da resposta do backend
  response: {
    success: "boolean - indica se a requisição foi bem-sucedida",
    message: "string - mensagem descritiva",
    data: {
      status: {
        emAtraso: {
          provas: "number - quantidade de provas em atraso",
          retiradas: "number - quantidade de retiradas em atraso", 
          devolucoes: "number - quantidade de devoluções em atraso"
        },
        hoje: {
          provas: "number - quantidade de provas para hoje",
          retiradas: "number - quantidade de retiradas para hoje",
          devolucoes: "number - quantidade de devoluções para hoje"
        },
        proximos10Dias: {
          provas: "number - quantidade de provas nos próximos 10 dias",
          retiradas: "number - quantidade de retiradas nos próximos 10 dias",
          devolucoes: "number - quantidade de devoluções nos próximos 10 dias"
        }
      },
      resultados: {
        dia: {
          totalPedidos: "number - valor total dos pedidos do dia",
          totalRecebido: "number - valor total recebido no dia",
          numeroPedidos: "number - quantidade de pedidos do dia"
        },
        semana: {
          totalPedidos: "number - valor total dos pedidos da semana",
          totalRecebido: "number - valor total recebido na semana",
          numeroPedidos: "number - quantidade de pedidos da semana"
        },
        mes: {
          totalPedidos: "number - valor total dos pedidos do mês",
          totalRecebido: "number - valor total recebido no mês",
          numeroPedidos: "number - quantidade de pedidos do mês"
        }
      },
      metadata: {
        dataAtualizacao: "string - data/hora da última atualização (ISO 8601)",
        periodoReferencia: {
          inicio: "string - início do período de referência (ISO 8601)",
          fim: "string - fim do período de referência (ISO 8601)"
        }
      }
    }
  }
};

export default mockDashboardResponse; 