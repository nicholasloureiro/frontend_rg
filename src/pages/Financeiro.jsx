import React, { useEffect, useState } from 'react';
import { formatCurrency } from '../utils/format';
import '../styles/Financeiro.css';
import { getDailySalesSummary, getMonthlySalesSummary, postCloseCash } from '../services/financeService';
import { useAuth } from '../hooks/useAuth';

const PaymentTypeCard = ({ label, amount }) => {
  return (
    <div className="payment-card">
      <div className="payment-card-label">{label}</div>
      <div className="payment-card-amount">{amount != null ? formatCurrency(amount) : '—'}</div>
    </div>
  );
};

const Financeiro = () => {
  const { user, isLoading } = useAuth();
  const [tab, setTab] = useState('today'); // 'today' | 'monthly'
  const [date, setDate] = useState(new Date().toISOString().slice(0, 10));
  const [monthYear, setMonthYear] = useState(() => {
    const d = new Date();
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
  });
  const [summary, setSummary] = useState(null);
  const [loadingSummary, setLoadingSummary] = useState(false);
  const [closing, setClosing] = useState(false);
  const [message, setMessage] = useState(null);

  // Bloqueio básico de UI para tipos de usuário (ex.: atendente)
  const personType = user?.person?.person_type?.type;

  useEffect(() => {
    fetchSummary();
  }, [tab, date, monthYear]);

  const fetchSummary = async () => {
    setLoadingSummary(true);
    setSummary(null);
    try {
      if (tab === 'today') {
        const res = await getDailySalesSummary(date);
        setSummary(res);
      } else {
        const [year, month] = monthYear.split('-');
        const res = await getMonthlySalesSummary(month, year);
        setSummary(res);
      }
    } catch (err) {
      console.error('Erro ao buscar resumo financeiro:', err);
      setMessage({ type: 'error', text: 'Erro ao buscar dados. Tente novamente.' });
    } finally {
      setLoadingSummary(false);
    }
  };

  const handleCloseCash = async () => {
    if (!summary) return;
    setClosing(true);
    try {
      const payload = {
        date: tab === 'today' ? date : null,
        period: tab === 'today' ? 'daily' : 'monthly',
        month: tab === 'monthly' ? monthYear : null,
        cashier_id: user?.id || null,
        totals: summary.totals || {},
        transactions_count: summary.transactions_count || 0,
        closed_by: user?.id || null,
      };

      await postCloseCash(payload);
      setMessage({ type: 'success', text: 'Caixa fechado com sucesso (registro enviado ao backend).' });
    } catch (err) {
      console.error('Erro ao fechar caixa:', err);
      setMessage({ type: 'error', text: 'Falha ao fechar caixa. Tente novamente.' });
    } finally {
      setClosing(false);
    }
  };

  if (isLoading) {
    return <div className="financeiro-page">Carregando...</div>;
  }

  // UI/UX: bloqueia acesso a usuários do tipo ATENDENTE (apenas sugestão de front)
  if (personType && personType.toLowerCase() === 'atendente') {
    return (
      <div className="financeiro-page">
        <h2>Financeiro</h2>
        <div className="card blocked">
          <p>Você não tem permissão para acessar esta área. Contate um administrador.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="financeiro-page">
      <div className="financeiro-header">
        <h2>Financeiro</h2>
        <div className="tabs">
          <button className={tab === 'today' ? 'active' : ''} onClick={() => setTab('today')}>Hoje</button>
          <button className={tab === 'monthly' ? 'active' : ''} onClick={() => setTab('monthly')}>Mensal</button>
        </div>
      </div>

      <div className="financeiro-controls">
        {tab === 'today' ? (
          <label>
            Data:
            <input type="date" value={date} onChange={(e) => setDate(e.target.value)} />
          </label>
        ) : (
          <label>
            Mês:
            <input type="month" value={monthYear} onChange={(e) => setMonthYear(e.target.value)} />
          </label>
        )}
        <button className="btn-refresh" onClick={fetchSummary} disabled={loadingSummary}>
          {loadingSummary ? 'Carregando...' : 'Atualizar'}
        </button>
      </div>

      {message && (
        <div className={`financeiro-message ${message.type}`}>
          {message.text}
        </div>
      )}

      <div className="financeiro-summary">
        <div className="summary-left">
          <div className="summary-cards">
            <PaymentTypeCard label="Dinheiro" amount={summary?.totals?.cash} />
            <PaymentTypeCard label="PIX" amount={summary?.totals?.pix} />
            <PaymentTypeCard label="Crédito" amount={summary?.totals?.credit} />
            <PaymentTypeCard label="Débito" amount={summary?.totals?.debit} />
            <PaymentTypeCard label="Outros" amount={summary?.totals?.other} />
          </div>
          <div className="summary-meta">
            <div>Total de transações: {summary?.transactions_count ?? '—'}</div>
            <div>Valor total: {summary?.total_amount != null ? formatCurrency(summary.total_amount) : '—'}</div>
          </div>
        </div>

        <div className="summary-actions">
          <button className="btn-close-cash" onClick={handleCloseCash} disabled={closing || !summary}>
            {closing ? 'Fechando...' : 'Fechar caixa'}
          </button>
        </div>
      </div>

      <div className="financeiro-notes">
        <small>
          Observações: este painel mostra um resumo por forma de pagamento. A ação "Fechar caixa" envia um registro para o endpoint sugerido
          — é recomendável que o backend valide permissões e armazene um histórico de fechamentos por usuário.
        </small>
      </div>
    </div>
  );
};

export default Financeiro;


