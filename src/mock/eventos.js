// Mock de dados para eventos em aberto - Loja de Aluguel de Roupas de Gala
const eventosMock = [
  {
    "id": 1,
    "ordens_servico": [1, 2], // IDs das ordens de serviço vinculadas
    "date_created": "2025-01-15T09:00:00.000Z",
    "date_updated": "2025-01-15T09:00:00.000Z",
    "date_canceled": null,
    "name": "Baile de Formatura Medicina 2025",
    "description": "Evento de formatura da turma de Medicina 2025. Aluguel de vestidos longos, ternos e acessórios para 200 formandos e convidados.",
    "event_date": "2025-02-15T19:00:00.000Z",
    "created_by": 1,
    "updated_by": 1,
    "canceled_by": null
  },
  {
    "id": 2,
    "ordens_servico": [3], // ID da ordem de serviço vinculada
    "date_created": "2025-01-16T08:00:00.000Z",
    "date_updated": "2025-01-16T08:00:00.000Z",
    "date_canceled": null,
    "name": "Casamento - Juliana e Rafael",
    "description": "Cerimônia de casamento elegante. Aluguel de vestido de noiva, terno do noivo, roupas para madrinhas e padrinhos.",
    "event_date": "2025-01-25T16:00:00.000Z",
    "created_by": 1,
    "updated_by": 1,
    "canceled_by": null
  },
  {
    "id": 3,
    "ordens_servico": [4, 5, 6], // IDs das ordens de serviço vinculadas
    "date_created": "2025-01-17T14:00:00.000Z",
    "date_updated": "2025-01-17T14:00:00.000Z",
    "date_canceled": null,
    "name": "Gala de Premiação Empresarial",
    "description": "Evento corporativo de premiação anual. Aluguel de vestidos de gala, ternos executivos e acessórios para 150 executivos.",
    "event_date": "2025-02-01T20:00:00.000Z",
    "created_by": 1,
    "updated_by": 1,
    "canceled_by": null
  },
  {
    "id": 4,
    "ordens_servico": [], // Nenhuma ordem de serviço ainda
    "date_created": "2025-01-18T10:00:00.000Z",
    "date_updated": "2025-01-18T10:00:00.000Z",
    "date_canceled": null,
    "name": "Festa de 15 Anos - Sofia",
    "description": "Festa de debutante tradicional. Aluguel de vestido de 15 anos, sapatos, joias e acessórios para a debutante e convidadas.",
    "event_date": "2025-01-30T19:30:00.000Z",
    "created_by": 1,
    "updated_by": 1,
    "canceled_by": null
  },
  {
    "id": 5,
    "ordens_servico": [], // Nenhuma ordem de serviço ainda
    "date_created": "2025-01-19T16:30:00.000Z",
    "date_updated": "2025-01-19T16:30:00.000Z",
    "date_canceled": null,
    "name": "Aniversário de 50 Anos - Dona Rosa",
    "description": "Festa de aniversário elegante. Aluguel de vestido de festa, acessórios e calçados para a aniversariante e familiares.",
    "event_date": "2025-01-28T18:00:00.000Z",
    "created_by": 1,
    "updated_by": 1,
    "canceled_by": null
  }
];

export default eventosMock;
