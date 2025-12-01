import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { formatCurrency } from '../utils/format';
import '../styles/Financeiro.css';
import { getFinanceSummary, postCloseCash } from '../services/financeService';
import { useAuth } from '../hooks/useAuth';
import Header from '../components/Header';
import { capitalizeText } from '../utils/capitalizeText';

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

const formatTransactionType = (type) => {
  if (!type) return '—';
  return type.charAt(0).toUpperCase() + type.slice(1).toLowerCase();
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

      const response = await getFinanceSummary(params);
      setSummary(normalizeSummary(response));
    } catch (err) {
      console.error('Erro ao buscar resumo financeiro:', err);
      setMessage({ type: 'error', text: 'Erro ao buscar dados. Tente novamente.' });
      setSummary(normalizeSummary(null));
    } finally {
      setLoadingSummary(false);
    }
  }, [date, monthYear, tab, isAdministrator]);

  useEffect(() => {
    if (isAdministrator) {
      fetchSummary();
    }
  }, [fetchSummary, isAdministrator]);

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

        <div className="financeiro-controls enhanced">
          {tab === 'today' ? (
            <label>
              <span style={{ fontSize: '16px', fontWeight: 'bold' }}>Data</span>
              <input type="date" value={date} onChange={(e) => setDate(e.target.value)} />
            </label>
          ) : (
            <label>
              <span style={{ fontSize: '16px', fontWeight: 'bold' }}>Mês</span>
              <input type="month" value={monthYear} onChange={(e) => setMonthYear(e.target.value)} />
            </label>
          )}
        </div>

        {message && (
          <div className={`financeiro-message ${message.type}`}>
            {message.text}
          </div>
        )}

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
              <table className="transactions-table">
                <thead>
                  <tr>
                    <th>OS</th>
                    <th>Tipo</th>
                    <th>Forma</th>
                    <th>Valor</th>
                    <th>Data</th>
                  </tr>
                </thead>
                <tbody>
                  {transactions.map((tx) => (
                    <tr key={tx._internalId}>
                      <td>#{tx.order_id ?? '—'}</td>
                      <td>
                        <span className={`chip ${tx.transaction_type}`}>
                          {formatTransactionType(capitalizeText(tx.transaction_type))}
                        </span>
                      </td>
                      <td>{ capitalizeText(tx.payment_method) || '—'}</td>
                      <td>{formatCurrency(tx.amount)}</td>
                      <td>{formatDate(tx.date)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
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

