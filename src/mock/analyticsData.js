// Mock de dados analíticos para o dashboard
// Este mock simula a resposta esperada do backend para os novos gráficos

export const analyticsData = {
  // Vendas por tipo (locação ou venda)
  vendasPorTipo: {
    locacao: 145,
    venda: 38,
    totalVendas: 183,
    percentualLocacao: 79.2,
    percentualVenda: 20.8
  },

  // Número de clientes atendidos
  clientesAtendidos: {
    total: 156,
    novos: 89,
    recorrentes: 67,
    porPeriodo: [
      { periodo: "Semana 1", clientes: 32 },
      { periodo: "Semana 2", clientes: 45 },
      { periodo: "Semana 3", clientes: 38 },
      { periodo: "Semana 4", clientes: 41 }
    ]
  },

  // Conversão (loja e de cada atendente)
  conversao: {
    geral: 68.5,
    loja: 68.5,
    atendentes: [
      { 
        id: 1, 
        nome: "Carlos Silva", 
        atendimentos: 45, 
        conversoes: 34, 
        taxa: 75.6 
      },
      { 
        id: 2, 
        nome: "Ana Paula", 
        atendimentos: 52, 
        conversoes: 38, 
        taxa: 73.1 
      },
      { 
        id: 3, 
        nome: "Roberto Santos", 
        atendimentos: 38, 
        conversoes: 24, 
        taxa: 63.2 
      },
      { 
        id: 4, 
        nome: "Mariana Costa", 
        atendimentos: 41, 
        conversoes: 26, 
        taxa: 63.4 
      },
      { 
        id: 5, 
        nome: "Pedro Oliveira", 
        atendimentos: 36, 
        conversoes: 21, 
        taxa: 58.3 
      }
    ]
  },

  // Ticket médio
  ticketMedio: {
    geral: 1245.50,
    locacao: 890.30,
    venda: 2340.80,
    evolucao: [
      { periodo: "Semana 1", valor: 1105.20 },
      { periodo: "Semana 2", valor: 1180.40 },
      { periodo: "Semana 3", valor: 1215.60 },
      { periodo: "Semana 4", valor: 1245.50 }
    ]
  },

  // Vendas por canal (origem)
  vendasPorCanal: [
    { id: "instagram", label: "Instagram", value: 78, percentual: 42.6 },
    { id: "google", label: "Google", value: 45, percentual: 24.6 },
    { id: "indicacao", label: "Indicação", value: 38, percentual: 20.8 },
    { id: "facebook", label: "Facebook", value: 15, percentual: 8.2 },
    { id: "site", label: "Site Próprio", value: 7, percentual: 3.8 }
  ],

  // Tipo do cliente
  tipoCliente: [
    { id: "noivo", label: "Noivo", value: 56, percentual: 30.6 },
    { id: "padrinho", label: "Padrinho", value: 48, percentual: 26.2 },
    { id: "pai", label: "Pai do Noivo/Noiva", value: 42, percentual: 23.0 },
    { id: "convidado", label: "Convidado", value: 28, percentual: 15.3 },
    { id: "outros", label: "Outros", value: 9, percentual: 4.9 }
  ],

  // Motivos da recusa
  motivosRecusa: [
    { motivo: "Preço elevado", quantidade: 18, percentual: 35.3 },
    { motivo: "Não encontrou o modelo desejado", quantidade: 14, percentual: 27.5 },
    { motivo: "Prazo de entrega", quantidade: 8, percentual: 15.7 },
    { motivo: "Tamanho indisponível", quantidade: 6, percentual: 11.8 },
    { motivo: "Qualidade do produto", quantidade: 3, percentual: 5.9 },
    { motivo: "Outros", quantidade: 2, percentual: 3.8 }
  ],

  // Reclamações
  reclamacoes: {
    total: 12,
    resolvidas: 9,
    pendentes: 3,
    porCategoria: [
      { categoria: "Atraso na entrega", quantidade: 5 },
      { categoria: "Problema com ajuste", quantidade: 3 },
      { categoria: "Produto diferente", quantidade: 2 },
      { categoria: "Atendimento", quantidade: 1 },
      { categoria: "Limpeza/Conservação", quantidade: 1 }
    ],
    satisfacaoPos: 87.5 // % de clientes satisfeitos após resolução
  },

  // Dados adicionais úteis
  resumo: {
    ticketMedio: 1245.50,
    conversaoGeral: 68.5,
    satisfacaoCliente: 4.6, // de 5 estrelas
    nps: 72 // Net Promoter Score
  }
};

// Estrutura esperada da resposta do backend
export const expectedBackendResponse = {
  status: 200,
  message: "Dados analíticos recuperados com sucesso",
  data: {
    // Dados originais do dashboard (status e resultados)
    status: {
      em_atraso: { provas: 5, retiradas: 3, devolucoes: 2 },
      hoje: { provas: 8, retiradas: 6, devolucoes: 4 },
      proximos_10_dias: { provas: 12, retiradas: 9, devolucoes: 7 }
    },
    resultados: {
      dia: { total_pedidos: 15, total_recebido: 18750.00, numero_pedidos: 15 },
      semana: { total_pedidos: 89, total_recebido: 110750.00, numero_pedidos: 89 },
      mes: { total_pedidos: 345, total_recebido: 429375.00, numero_pedidos: 345 }
    },
    
    // Novos dados analíticos
    analytics: {
      vendas_por_tipo: {
        locacao: 145,
        venda: 38,
        total_vendas: 183,
        percentual_locacao: 79.2,
        percentual_venda: 20.8
      },
      clientes_atendidos: {
        total: 156,
        novos: 89,
        recorrentes: 67,
        por_periodo: [
          { periodo: "Semana 1", clientes: 32 },
          { periodo: "Semana 2", clientes: 45 },
          { periodo: "Semana 3", clientes: 38 },
          { periodo: "Semana 4", clientes: 41 }
        ]
      },
      conversao: {
        geral: 68.5,
        loja: 68.5,
        atendentes: [
          { 
            id: 1, 
            nome: "Carlos Silva", 
            atendimentos: 45, 
            conversoes: 34, 
            taxa: 75.6 
          },
          { 
            id: 2, 
            nome: "Ana Paula", 
            atendimentos: 52, 
            conversoes: 38, 
            taxa: 73.1 
          },
          { 
            id: 3, 
            nome: "Roberto Santos", 
            atendimentos: 38, 
            conversoes: 24, 
            taxa: 63.2 
          },
          { 
            id: 4, 
            nome: "Mariana Costa", 
            atendimentos: 41, 
            conversoes: 26, 
            taxa: 63.4 
          },
          { 
            id: 5, 
            nome: "Pedro Oliveira", 
            atendimentos: 36, 
            conversoes: 21, 
            taxa: 58.3 
          }
        ]
      },
      ticket_medio: {
        geral: 1245.50,
        locacao: 890.30,
        venda: 2340.80,
        evolucao: [
          { periodo: "Semana 1", valor: 1105.20 },
          { periodo: "Semana 2", valor: 1180.40 },
          { periodo: "Semana 3", valor: 1215.60 },
          { periodo: "Semana 4", valor: 1245.50 }
        ]
      },
      vendas_por_canal: [
        { id: "instagram", label: "Instagram", value: 78, percentual: 42.6 },
        { id: "google", label: "Google", value: 45, percentual: 24.6 },
        { id: "indicacao", label: "Indicação", value: 38, percentual: 20.8 },
        { id: "facebook", label: "Facebook", value: 15, percentual: 8.2 },
        { id: "site", label: "Site Próprio", value: 7, percentual: 3.8 }
      ],
      tipo_cliente: [
        { id: "noivo", label: "Noivo", value: 56, percentual: 30.6 },
        { id: "padrinho", label: "Padrinho", value: 48, percentual: 26.2 },
        { id: "pai", label: "Pai do Noivo/Noiva", value: 42, percentual: 23.0 },
        { id: "convidado", label: "Convidado", value: 28, percentual: 15.3 },
        { id: "outros", label: "Outros", value: 9, percentual: 4.9 }
      ],
      motivos_recusa: [
        { motivo: "Preço elevado", quantidade: 18, percentual: 35.3 },
        { motivo: "Não encontrou o modelo desejado", quantidade: 14, percentual: 27.5 },
        { motivo: "Prazo de entrega", quantidade: 8, percentual: 15.7 },
        { motivo: "Tamanho indisponível", quantidade: 6, percentual: 11.8 },
        { motivo: "Qualidade do produto", quantidade: 3, percentual: 5.9 },
        { motivo: "Outros", quantidade: 2, percentual: 3.8 }
      ],
      reclamacoes: {
        total: 12,
        resolvidas: 9,
        pendentes: 3,
        por_categoria: [
          { categoria: "Atraso na entrega", quantidade: 5 },
          { categoria: "Problema com ajuste", quantidade: 3 },
          { categoria: "Produto diferente", quantidade: 2 },
          { categoria: "Atendimento", quantidade: 1 },
          { categoria: "Limpeza/Conservação", quantidade: 1 }
        ],
        satisfacao_pos: 87.5
      },
      resumo: {
        ticket_medio: 1245.50,
        conversao_geral: 68.5,
        satisfacao_cliente: 4.6,
        nps: 72
      }
    }
  }
};

export default analyticsData;