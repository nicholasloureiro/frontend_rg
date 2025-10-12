// Mock de dados para ordens de serviço - Loja de Aluguel de Roupas de Gala
const ordensServicoMock = [
  {
    "id": 1,
    "numero_ordem": "OS-2025-001",
    "cliente": {
      "id": 1,
      "name": "Maria Silva",
      "cpf": "12345678901",
      "phone": "+5511999887766",
      "email": "maria.silva@email.com",
      "address": {
        "cep": "01234-567",
        "rua": "Rua das Flores",
        "numero": "123",
        "bairro": "Centro",
        "cidade": "São Paulo"
      }
    },
    "ordem_servico": {
      "data_pedido": "2025-01-15",
      "data_evento": "2025-02-15",
      "data_retirada": "2025-02-10",
      "data_devolucao": "2025-02-20",
      "ocasiao": "Baile de Formatura",
      "modalidade": "Aluguel",
      "itens": [
        {
          "tipo": "paleto",
          "numero": "50",
          "cor": "Preto",
          "manga": "Longa",
          "marca": "1",
          "ajuste": "Ajuste na cintura",
          "extras": "Botões dourados",
          "venda": false
        },
        {
          "tipo": "camisa",
          "numero": "40",
          "cor": "Branca",
          "manga": "Longa",
          "marca": "2",
          "ajuste": "",
          "extras": "Gola social",
          "venda": false
        },
        {
          "tipo": "calca",
          "numero": "50",
          "cor": "Preto",
          "cintura": "100",
          "perna": "110",
          "marca": "1",
          "ajuste_cos": false,
          "ajuste_comprimento": true,
          "ajuste_cos_valor": "",
          "ajuste_comprimento_valor": "5cm",
          "extras": "Cinto incluso",
          "venda": false
        }
      ]
    },
    "pagamento": {
      "total": 450.00,
      "sinal": 150.00,
      "restante": 300.00,
      "status": "Pendente"
    },
    "status": "Em andamento",
    "fase": "Retirada",
    "date_created": "2025-01-15T10:30:00.000Z",
    "date_updated": "2025-01-15T10:30:00.000Z"
  },
  {
    "id": 2,
    "numero_ordem": "OS-2025-002",
    "cliente": {
      "id": 2,
      "name": "Ana Santos",
      "cpf": "98765432109",
      "phone": "+5511888776655",
      "email": "ana.santos@email.com",
      "address": {
        "cep": "04567-890",
        "rua": "Avenida Paulista",
        "numero": "456",
        "bairro": "Bela Vista",
        "cidade": "São Paulo"
      }
    },
    "ordem_servico": {
      "data_pedido": "2025-01-15",
      "data_evento": "2025-02-15",
      "data_retirada": "2025-02-12",
      "data_devolucao": "2025-02-22",
      "ocasiao": "Baile de Formatura",
      "modalidade": "Aluguel",
      "itens": [
        {
          "tipo": "vestido",
          "numero": "38",
          "cor": "Azul",
          "modelo": "Longo",
          "marca": "3",
          "ajuste": "Ajuste no busto",
          "extras": "Bordado em pedrarias",
          "venda": false
        }
      ]
    },
    "pagamento": {
      "total": 380.00,
      "sinal": 100.00,
      "restante": 280.00,
      "status": "Pendente"
    },
    "status": "Em andamento",
    "fase": "Retirada",
    "date_created": "2025-01-15T11:00:00.000Z",
    "date_updated": "2025-01-15T11:00:00.000Z"
  },
  {
    "id": 3,
    "numero_ordem": "OS-2025-003",
    "cliente": {
      "id": 3,
      "name": "Carla Oliveira",
      "cpf": "11122233344",
      "phone": "+5511777665544",
      "email": "carla.oliveira@email.com",
      "address": {
        "cep": "02345-678",
        "rua": "Rua Augusta",
        "numero": "789",
        "bairro": "Consolação",
        "cidade": "São Paulo"
      }
    },
    "ordem_servico": {
      "data_pedido": "2025-01-16",
      "data_evento": "2025-01-25",
      "data_retirada": "2025-01-20",
      "data_devolucao": "2025-01-30",
      "ocasiao": "Casamento",
      "modalidade": "Aluguel",
      "itens": [
        {
          "tipo": "vestido",
          "numero": "42",
          "cor": "Branco",
          "modelo": "Longo",
          "marca": "4",
          "ajuste": "Ajuste completo",
          "extras": "Véu e luvas inclusos",
          "venda": false
        }
      ]
    },
    "pagamento": {
      "total": 1200.00,
      "sinal": 400.00,
      "restante": 800.00,
      "status": "Pago"
    },
    "status": "Finalizada",
    "fase": "Devolvida",
    "date_created": "2025-01-16T08:15:00.000Z",
    "date_updated": "2025-01-30T16:00:00.000Z"
  },
  {
    "id": 4,
    "numero_ordem": "OS-2025-004",
    "cliente": {
      "id": 4,
      "name": "Patrícia Costa",
      "cpf": "55566677788",
      "phone": "+5511666554433",
      "email": "patricia.costa@email.com",
      "address": {
        "cep": "03456-789",
        "rua": "Rua Oscar Freire",
        "numero": "321",
        "bairro": "Jardins",
        "cidade": "São Paulo"
      }
    },
    "ordem_servico": {
      "data_pedido": "2025-01-17",
      "data_evento": "2025-02-01",
      "data_retirada": "2025-01-28",
      "data_devolucao": "2025-02-08",
      "ocasiao": "Gala Empresarial",
      "modalidade": "Aluguel",
      "itens": [
        {
          "tipo": "vestido",
          "numero": "40",
          "cor": "Vermelho",
          "modelo": "Longo",
          "marca": "5",
          "ajuste": "Ajuste na cintura",
          "extras": "Bolsa combinando",
          "venda": false
        }
      ]
    },
    "pagamento": {
      "total": 520.00,
      "sinal": 200.00,
      "restante": 320.00,
      "status": "Pendente"
    },
    "status": "Em andamento",
    "fase": "Retirada",
    "date_created": "2025-01-17T14:20:00.000Z",
    "date_updated": "2025-01-17T14:20:00.000Z"
  },
  {
    "id": 5,
    "numero_ordem": "OS-2025-005",
    "cliente": {
      "id": 5,
      "name": "Fernanda Ferreira",
      "cpf": "99988877766",
      "phone": "+5511555443322",
      "email": "fernanda.ferreira@email.com",
      "address": {
        "cep": "04567-890",
        "rua": "Rua Haddock Lobo",
        "numero": "654",
        "bairro": "Cerqueira César",
        "cidade": "São Paulo"
      }
    },
    "ordem_servico": {
      "data_pedido": "2025-01-17",
      "data_evento": "2025-02-01",
      "data_retirada": "2025-01-29",
      "data_devolucao": "2025-02-09",
      "ocasiao": "Gala Empresarial",
      "modalidade": "Aluguel",
      "itens": [
        {
          "tipo": "vestido",
          "numero": "36",
          "cor": "Preto",
          "modelo": "Longo",
          "marca": "6",
          "ajuste": "",
          "extras": "Sapatos inclusos",
          "venda": false
        }
      ]
    },
    "pagamento": {
      "total": 480.00,
      "sinal": 150.00,
      "restante": 330.00,
      "status": "Pendente"
    },
    "status": "Em andamento",
    "fase": "Retirada",
    "date_created": "2025-01-17T14:25:00.000Z",
    "date_updated": "2025-01-17T14:25:00.000Z"
  },
  {
    "id": 6,
    "numero_ordem": "OS-2025-006",
    "cliente": {
      "id": 6,
      "name": "Lúcia Mendes",
      "cpf": "33344455566",
      "phone": "+5511444332211",
      "email": "lucia.mendes@email.com",
      "address": {
        "cep": "05678-901",
        "rua": "Rua Bela Cintra",
        "numero": "987",
        "bairro": "Consolação",
        "cidade": "São Paulo"
      }
    },
    "ordem_servico": {
      "data_pedido": "2025-01-17",
      "data_evento": "2025-02-01",
      "data_retirada": "2025-01-30",
      "data_devolucao": "2025-02-10",
      "ocasiao": "Gala Empresarial",
      "modalidade": "Aluguel",
      "itens": [
        {
          "tipo": "vestido",
          "numero": "44",
          "cor": "Azul",
          "modelo": "Longo",
          "marca": "7",
          "ajuste": "Ajuste no busto e cintura",
          "extras": "Joias inclusas",
          "venda": false
        }
      ]
    },
    "pagamento": {
      "total": 600.00,
      "sinal": 250.00,
      "restante": 350.00,
      "status": "Pendente"
    },
    "status": "Em andamento",
    "fase": "Retirada",
    "date_created": "2025-01-17T14:30:00.000Z",
    "date_updated": "2025-01-17T14:30:00.000Z"
  }
];

export default ordensServicoMock;

