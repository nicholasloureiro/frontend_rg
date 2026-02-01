import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { formatCurrency } from '../utils/format';
import '../styles/Financeiro.css';
import { getFinanceSummary, postCloseCash, postVirtualPayment } from '../services/financeService';
import { useAuth } from '../hooks/useAuth';
import Header from '../components/Header';
import InputDate from '../components/InputDate';
import { capitalizeText } from '../utils/capitalizeText';
import Swal from 'sweetalert2';
import { createRoot } from 'react-dom/client';
import CustomSelect from '../components/CustomSelect';
import Button from '../components/Button';
import Pagination from '@mui/material/Pagination';

const methodLabels = {
  DINHEIRO: 'Dinheiro',
  PIX: 'PIX',
  CARTAO: 'Cartão',
  CREDITO: 'Credito',
  DEBITO: 'Débito',
  BOLETO: 'Boleto',
  TRANSFERENCIA: 'Transferência',
  OUTROS: 'Outros',
};

const methodAccentClass = {
  DINHEIRO: 'cash',
  PIX: 'pix',
  CARTAO: 'card',
  CREDITO: 'card',
  DEBITO: 'card',
  BOLETO: 'boleto',
  TRANSFERENCIA: 'transfer',
};


const normalizeAmount = (value) => {
  if (value == null) return 0;
  const numeric = typeof value === 'number' ? value : parseFloat(String(value).replace(',', '.'));
  return Number.isNaN(numeric) ? 0 : numeric;
};

const normalizeSummary = (payload) => {
  if (!payload) {
    return {
      total_transactions: 0,
      total_amount: 0,
      totals_by_method: {},
      transactions: [],
    };
  }

  const totalsByMethod = Object.entries(payload.totals_by_method || {}).reduce((acc, [method, amount]) => {
    acc[method] = normalizeAmount(amount);
    return acc;
  }, {});

  const transactions = Array.isArray(payload.transactions)
    ? payload.transactions.map((tx, idx) => ({
      ...tx,
      amount: normalizeAmount(tx.amount),
      _internalId: `${tx.order_id || idx}-${tx.date || idx}-${tx.transaction_type || idx}`,
    }))
    : [];

  return {
    total_transactions: payload.total_transactions ?? transactions.length,
    total_amount: normalizeAmount(payload.total_amount),
    totals_by_method: totalsByMethod,
    transactions,
  };
};

const formatDate = (value) => {
  if (!value) return '—';
  // Adiciona T00:00:00 para corrigir problema de fuso horário
  const dateStr = typeof value === 'string' && value.match(/^\d{4}-\d{2}-\d{2}$/)
    ? `${value}T00:00:00`
    : value;
  const dateObj = new Date(dateStr);
  if (Number.isNaN(dateObj.getTime())) return value;
  return new Intl.DateTimeFormat('pt-BR').format(dateObj);
};

const typeLabels = {
  sinal: 'Sinal',
  restante: 'Restante',
  indenizacao: 'Indenização',
};

const formatTransactionType = (type) => {
  if (!type) return '—';
  return typeLabels[type.toLowerCase()] || type.charAt(0).toUpperCase() + type.slice(1).toLowerCase();
};

const formatTime = (value) => {
  if (!value) return '—';
  const dateObj = new Date(value);
  if (Number.isNaN(dateObj.getTime())) return '—';
  return dateObj.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
};

const formatISODate = (dateObj) => {
  const year = dateObj.getFullYear();
  const month = String(dateObj.getMonth() + 1).padStart(2, '0');
  const day = String(dateObj.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

const getTodayLocal = () => {
  const today = new Date();
  return formatISODate(today);
};

const getMonthRange = (value) => {
  if (!value || !value.includes('-')) {
    return { start_date: null, end_date: null };
  }
  const [year, month] = value.split('-').map((part) => Number(part));
  if (Number.isNaN(year) || Number.isNaN(month)) {
    return { start_date: null, end_date: null };
  }

  const startDate = new Date(year, month - 1, 1);
  const endDate = new Date(year, month, 0);

  return {
    start_date: formatISODate(startDate),
    end_date: formatISODate(endDate),
  };
};

function getTodayLocalDateStr() {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const tzoffset = today.getTimezoneOffset() * 60000;
  const localISO = new Date(today - tzoffset).toISOString().split('T')[0];
  return localISO;
}

const Financeiro = () => {
  const { user, isLoading } = useAuth();
  const [tab, setTab] = useState('today');
  const [date, setDate] = useState(getTodayLocal());
  const [monthYear, setMonthYear] = useState(() => {
    const d = new Date();
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
  });
  const [summary, setSummary] = useState(null);
  const [loadingSummary, setLoadingSummary] = useState(false);
  const [closing, setClosing] = useState(false);
  const [message, setMessage] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [pageSize, setPageSize] = useState(50);
  const [totalCount, setTotalCount] = useState(0);

  const personType = user?.person?.person_type?.type;
  const isAdministrator = personType === 'ADMINISTRADOR';

  const fetchSummary = useCallback(async () => {
    if (!isAdministrator) return;

    setLoadingSummary(true);
    setMessage(null);
    try {
      const params = tab === 'today'
        ? { start_date: date, end_date: date }
        : getMonthRange(monthYear);
      params.page = currentPage;
      params.page_size = pageSize;

      const response = await getFinanceSummary(params);
      setCurrentPage(response.page || currentPage);
      setTotalPages(response.total_pages || 1);
      setPageSize(response.page_size || pageSize);
      setTotalCount(response.count || 0);
      setSummary(normalizeSummary(response));
    } catch (err) {
      console.error('Erro ao buscar resumo financeiro:', err);
      setMessage({ type: 'error', text: 'Erro ao buscar dados. Tente novamente.' });
      setSummary(normalizeSummary(null));
    } finally {
      setLoadingSummary(false);
    }
  }, [date, monthYear, tab, isAdministrator, currentPage, pageSize]);

  useEffect(() => {
    if (isAdministrator) {
      fetchSummary();
    }
  }, [fetchSummary, isAdministrator, currentPage, pageSize]);

  const methodEntries = useMemo(() => {
    if (!summary?.totals_by_method) return [];
    return Object.entries(summary.totals_by_method).sort(([, amountA], [, amountB]) => amountB - amountA);
  }, [summary]);

  const transactions = summary?.transactions ?? [];

  // Verificação de carregamento
  if (isLoading) {
    return (
      <>
        <Header nomeHeader="Financeiro" />
        <div className="financeiro-page">
          <div>Carregando...</div>
        </div>
      </>
    );
  }

  // Verificação de permissão - deve ser feita antes de renderizar qualquer conteúdo
  if (!isAdministrator) {
    return (
      <>
        <Header nomeHeader="Financeiro" />
        <div className="financeiro-page">
          <div className="card blocked">
            <h3 style={{ marginTop: 0, marginBottom: '12px', color: '#b42318' }}>
              Acesso Restrito
            </h3>
            <p style={{ margin: 0, color: '#6b7280', lineHeight: '1.6' }}>
              Você não tem permissão para acessar esta área. Apenas usuários com perfil de <strong>ADMINISTRADOR</strong> podem visualizar as informações financeiras.
            </p>
            <p style={{ marginTop: '12px', marginBottom: 0, color: '#6b7280', fontSize: '14px' }}>
              Se você acredita que deveria ter acesso a esta funcionalidade, entre em contato com um administrador do sistema.
            </p>
          </div>
        </div>
      </>
    );
  }

  const averageAmount =
    summary?.total_transactions ? summary.total_amount / summary.total_transactions : 0;

  const handleOpenManualPayment = () => {
    // Criar um container para os componentes React
    const formContainer = document.createElement('div');
    formContainer.id = 'swal-form-container';
    formContainer.style.cssText = 'text-align: left; padding: 10px 0;';

    // Objeto para armazenar os valores do formulário
    const formValues = {
      tipoPagamento: '',
      valor: '',
      formaPagamento: '',
      data: new Date().toISOString().split('T')[0],
      clientName: '',
      observacoes: ''
    };

    // Componente de formulário que será renderizado dentro do Swal2
    const PaymentForm = () => {
      const [tipoPagamento, setTipoPagamento] = useState('');
      const [valor, setValor] = useState('');
      const [formaPagamento, setFormaPagamento] = useState('');
      const [data, setData] = useState(formValues.data);
      const [clientName, setClientName] = useState('');
      const [observacoes, setObservacoes] = useState('');

      // Atualizar valores no objeto compartilhado
      useEffect(() => {
        formValues.tipoPagamento = tipoPagamento;
        formValues.valor = valor;
        formValues.formaPagamento = formaPagamento;
        formValues.data = data;
        formValues.clientName = clientName;
        formValues.observacoes = observacoes;
      }, [tipoPagamento, valor, formaPagamento, data, clientName, observacoes]);

      const isIndenizacao = tipoPagamento === 'indenizacao';

      return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', minWidth: '400px' }}>
          <div>
            <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold', fontSize: '14px' }}>
              Tipo de Pagamento
            </label>
            <CustomSelect
              value={tipoPagamento}
              onChange={setTipoPagamento}
              options={[
                { value: '', label: 'Selecione o tipo' },
                { value: 'sinal', label: 'Sinal' },
                { value: 'restante', label: 'Restante' },
                { value: 'indenizacao', label: 'Indenização' }
              ]}
              placeholder="Selecione o tipo"
            />
          </div>

          {isIndenizacao && (
            <div>
              <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold', fontSize: '14px' }}>
                Nome do Cliente
              </label>
              <input
                type="text"
                value={clientName}
                onChange={(e) => setClientName(e.target.value)}
                placeholder="Digite o nome do cliente"
                style={{
                  width: '100%',
                  padding: '8px 12px',
                  border: '2px solid var(--color-border)',
                  borderRadius: '8px',
                  fontSize: '14px'
                }}
              />
            </div>
          )}

          <div>
            <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold', fontSize: '14px' }}>
              Valor
            </label>
            <input
              type="text"
              value={valor !== '' ? formatCurrency(Number(valor)) : ''}
              onChange={(e) => {
                let raw = e.target.value.replace(/[^\d]/g, '');
                if (raw === '') raw = '0';
                const valorFormatado = (Number(raw) / 100).toFixed(2);
                setValor(valorFormatado);
              }}
              placeholder="R$ 0,00"
              style={{
                width: '100%',
                padding: '8px 12px',
                border: '2px solid var(--color-border)',
                borderRadius: '8px',
                fontSize: '14px'
              }}
            />
          </div>

          <div>
            <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold', fontSize: '14px' }}>
              Forma de Pagamento
            </label>
            <CustomSelect
              value={formaPagamento}
              onChange={setFormaPagamento}
              options={[
                { value: '', label: 'Selecione a forma' },
                { value: 'credito', label: 'Crédito' },
                { value: 'debito', label: 'Débito' },
                { value: 'pix', label: 'PIX' },
                { value: 'dinheiro', label: 'Dinheiro' },
                { value: 'voucher', label: 'Voucher' }
              ]}
              placeholder="Selecione a forma"
            />
          </div>

          {isIndenizacao && (
            <div>
              <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold', fontSize: '14px' }}>
                Observações
              </label>
              <textarea
                value={observacoes}
                onChange={(e) => setObservacoes(e.target.value)}
                placeholder="Descreva o motivo da indenização"
                rows={3}
                style={{
                  width: '100%',
                  padding: '8px 12px',
                  border: '2px solid var(--color-border)',
                  borderRadius: '8px',
                  fontSize: '14px',
                  resize: 'vertical'
                }}
              />
            </div>
          )}
        </div>
      );
    };

    let reactRoot = null;

    Swal.fire({
      title: 'Lançar Pagamento Manual',
      html: formContainer,
      showCancelButton: true,
      confirmButtonText: 'Lançar',
      cancelButtonText: 'Cancelar',
      confirmButtonColor: 'var(--color-accent)',
      cancelButtonColor: '#ffffff',
      reverseButtons: true,
      width: '500px',
      didOpen: () => {
        const container = document.getElementById('swal-form-container');
        if (container) {
          reactRoot = createRoot(container);
          reactRoot.render(<PaymentForm />);
        }
      },
      didClose: () => {
        // Limpar o React root quando o modal fechar
        if (reactRoot) {
          const container = document.getElementById('swal-form-container');
          if (container) {
            reactRoot.unmount();
            reactRoot = null;
          }
        }
      },
      preConfirm: async () => {
        const tipoPagamento = formValues.tipoPagamento;
        const valor = formValues.valor;
        const formaPagamento = formValues.formaPagamento;
        const clientName = formValues.clientName;
        const observacoes = formValues.observacoes;

        // Data local BR
        const data = getTodayLocalDateStr();

        // Validações
        if (!tipoPagamento || tipoPagamento === '') {
          Swal.showValidationMessage('Selecione o tipo de pagamento');
          return false;
        }

        // Validações específicas para indenização
        if (tipoPagamento === 'indenizacao') {
          if (!clientName || clientName.trim() === '') {
            Swal.showValidationMessage('Informe o nome do cliente');
            return false;
          }
        }

        if (!valor || parseFloat(valor) <= 0) {
          Swal.showValidationMessage('Informe um valor válido');
          return false;
        }

        if (!formaPagamento || formaPagamento === '') {
          Swal.showValidationMessage('Selecione a forma de pagamento');
          return false;
        }

        if (!data) {
          Swal.showValidationMessage('Informe a data');
          return false;
        }

        // Formatar valor com 2 casas decimais
        const valorFormatado = parseFloat(valor).toFixed(2);

        // Criar data/hora no formato ISO com hora atual
        const now = new Date();
        const hours = String(now.getHours()).padStart(2, '0');
        const minutes = String(now.getMinutes()).padStart(2, '0');
        const seconds = String(now.getSeconds()).padStart(2, '0');
        const dataHoraISO = `${data}T${hours}:${minutes}:${seconds}`;

        let payload;

        if (tipoPagamento === 'indenizacao') {
          // Payload específico para indenização
          payload = {
            client_name: clientName.trim(),
            total_value: valorFormatado,
            indenizacao: {
              amount: valorFormatado,
              forma_pagamento: formaPagamento,
              data: dataHoraISO
            },
            observations: observacoes.trim() || null
          };
        } else {
          // Payload padrão para sinal/restante
          payload = {
            total_value: valorFormatado,
            [tipoPagamento]: {
              amount: valorFormatado,
              forma_pagamento: formaPagamento,
              data: dataHoraISO
            }
          };

          // Se for sinal, adicionar restante vazio (ou vice-versa)
          if (tipoPagamento === 'sinal') {
            payload.restante = null;
          } else {
            payload.sinal = null;
          }
        }

        try {
          await postVirtualPayment(payload);
          return true;
        } catch (error) {
          Swal.showValidationMessage(error.response?.data?.message || 'Erro ao lançar pagamento. Tente novamente.');
          return false;
        }
      }
    }).then((result) => {
      if (result.isConfirmed) {
        Swal.fire({
          icon: 'success',
          title: 'Sucesso!',
          text: 'Pagamento lançado com sucesso!',
          confirmButtonColor: '#CBA135',
          timer: 2000,
          showConfirmButton: false
        });
        // Recarregar dados
        fetchSummary();
      }
    });
  };

  return (
    <>
      <Header nomeHeader="Financeiro" />
      <div className="financeiro-page">
        <div className="financeiro-header">
          <div>
            <h4 className="financeiro-subtitle">Resumo consolidado das ordens de serviço</h4>
          </div>
          <div className="tabs">
            <button className={tab === 'today' ? 'active' : ''} onClick={() => setTab('today')}>
              Hoje
            </button>
            <button className={tab === 'monthly' ? 'active' : ''} onClick={() => setTab('monthly')}>
              Mensal
            </button>
          </div>
        </div>

        <div className="financeiro-controls enhanced d-flex justify-content-between gap-2">
          {tab === 'today' ? (
            <label>
              <span style={{ fontSize: '16px', fontWeight: 'bold' }}>Data</span>
              <InputDate
                selectedDate={date ? new Date(date + 'T00:00:00') : null}
                onDateChange={(newDate) => {
                  if (newDate) {
                    const year = newDate.getFullYear();
                    const month = String(newDate.getMonth() + 1).padStart(2, '0');
                    const day = String(newDate.getDate()).padStart(2, '0');
                    setDate(`${year}-${month}-${day}`);
                  } else {
                    setDate('');
                  }
                }}
                placeholderText="Selecione a data"
              />
            </label>
          ) : (
            <label>
              <span style={{ fontSize: '16px', fontWeight: 'bold' }}>Mês</span>
              <InputDate
                mode="month"
                selectedDate={monthYear ? new Date(monthYear + '-01T00:00:00') : null}
                onDateChange={(newMonth) => {
                  if (newMonth) {
                    const year = newMonth.getFullYear();
                    const month = String(newMonth.getMonth() + 1).padStart(2, '0');
                    setMonthYear(`${year}-${month}`);
                  } else {
                    setMonthYear('');
                  }
                }}
                placeholderText="Selecione o mês"
              />
            </label>
          )}
          <Button
            text="Lançar Pagamento Manual"
            onClick={handleOpenManualPayment}
            variant="primary"
            style={{ width: 'fit-content' }}
          />
        </div>

        <div className="financeiro-hero">
          <div className="metric-grid">
            <div className="metric-card highlight">
              <span>Valor total</span>
              <strong>{summary ? formatCurrency(summary.total_amount) : '—'}</strong>
              <small>Movimentação no período selecionado</small>
            </div>
            <div className="metric-card">
              <span>Transações</span>
              <strong>{summary?.total_transactions ?? '—'}</strong>
              <small>Pedidos com movimentação financeira</small>
            </div>
            <div className="metric-card">
              <span>Ticket médio</span>
              <strong>{summary ? formatCurrency(averageAmount) : '—'}</strong>
              <small>Valor médio por transação</small>
            </div>
          </div>
        </div>

        <section className="financeiro-section">
          <div className="section-header">
            <div>
              <h3>Formas de pagamento</h3>
              <p>Mantenha seleções para detalhar as transações abaixo</p>
            </div>
            <span className="section-pill">{methodEntries.length} método(s)</span>
          </div>
          <div className="method-grid">
            {methodEntries.map(([method, amount]) => {
              const label = methodLabels[method] || method;
              const accent = methodAccentClass[method] || 'default';
              const totalAmount = summary?.total_amount || 0;
              const percentage = totalAmount > 0 ? ((amount / totalAmount) * 100).toFixed(1) : '0.0';

              return (
                <div
                  key={method}
                  className={`method-card ${accent}`}
                >
                  <span>{capitalizeText(method)}</span>
                  <strong>{formatCurrency(amount)}</strong>
                  <small>{percentage}% do total</small>
                </div>
              );
            })}
          </div>
        </section>

        <section className="financeiro-section">
          <div className="section-header">
            <div>
              <h3>Transações</h3>
              <p>Detalhes das ordens de serviço movimentadas</p>
            </div>
            <span className="section-pill">{transactions.length} registro(s)</span>
          </div>

          <div className="table-wrapper">
            {loadingSummary && (
              <div className="financeiro-loader">
                <span>Atualizando dados...</span>
              </div>
            )}

            {transactions.length ? (
              <>
                <table className="transactions-table">
                  <thead>
                    <tr>
                      <th>OS</th>
                      <th>Cliente</th>
                      <th>Tipo</th>
                      <th>Forma</th>
                      <th>Valor</th>
                      <th>Data</th>
                      <th>Hora</th>
                      <th>Descrição</th>
                    </tr>
                  </thead>
                  <tbody>
                    {transactions.map((tx) => (
                      <tr key={tx._internalId}>
                        <td>{tx.order_id ? `#${tx.order_id}` : '—'}</td>
                        <td>{tx.client_name || '—'}</td>
                        <td>
                          <span className={`chip ${tx.transaction_type}`}>
                            {formatTransactionType(tx.transaction_type)}
                          </span>
                        </td>
                        <td>{capitalizeText(tx.payment_method) || '—'}</td>
                        <td>{formatCurrency(tx.amount)}</td>
                        <td>{formatDate(tx.date)}</td>
                        <td>{formatTime(tx.date)}</td>
                        <td>{tx.description || '—'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                <div style={{ display: 'flex', justifyContent: 'center', marginTop: 16 }}>
                  <Pagination
                    count={totalPages}
                    page={currentPage}
                    onChange={(e, value) => {
                      setCurrentPage(value);
                    }}
                    color="primary"
                    showFirstButton
                    showLastButton
                    disabled={loadingSummary}
                  />
                </div>
              </>
            ) : (
              <div className="financeiro-empty">
                <p>Nenhuma transação encontrada para o período selecionado.</p>
              </div>
            )}
          </div>
        </section>
      </div>
    </>
  );
};

export default Financeiro;

