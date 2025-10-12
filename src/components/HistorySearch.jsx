import React, { useState, useEffect } from 'react';
import '../styles/HistorySearch.css';

const HistorySearch = ({ 
  serviceOrders, 
  onFilteredResults, 
  onClearFilters,
  isLoading = false 
}) => {
  const [searchTerm, setSearchTerm] = useState('');

  // Função para aplicar busca combinada
  const applySearch = () => {
    if (!searchTerm.trim()) {
      onFilteredResults(serviceOrders);
      return;
    }

    // Separar termos por vírgula, espaço ou ponto e vírgula
    const searchTerms = searchTerm
      .split(/[,;\s]+/)
      .map(term => term.trim().toLowerCase())
      .filter(term => term.length > 0);

    if (searchTerms.length === 0) {
      onFilteredResults(serviceOrders);
      return;
    }

    // Filtrar ordens onde TODOS os termos estão presentes
    const filtered = serviceOrders.filter(order => {
      // Criar string combinada com todos os campos pesquisáveis
      const searchableText = [
        order.event_name || '',
        order.employee_name || '',
        order.attendant_name || '',
        order.id?.toString() || '',
        order.phase_name || '',
        order.justificativa_atraso || ''
      ].join(' ').toLowerCase();

      // Verificar se TODOS os termos estão presentes
      return searchTerms.every(term => searchableText.includes(term));
    });

    onFilteredResults(filtered);
  };

  // Aplicar busca automaticamente quando o termo mudar
  useEffect(() => {
    applySearch();
  }, [searchTerm, serviceOrders]);

  // Função para limpar busca
  const clearSearch = () => {
    setSearchTerm('');
    onClearFilters();
  };

  // Verificar se há busca ativa
  const hasSearch = searchTerm.trim().length > 0;

  return (
    <div className="history-search-container">
      <div className="search-main">
        <div className="search-input-container">
          <i className="bi bi-search search-icon"></i>
          <input
            type="text"
            className="search-input"
            placeholder="Buscar por evento, funcionário, atendente, ID..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            disabled={isLoading}
          />
          {hasSearch && (
            <button
              className="clear-search-btn"
              onClick={clearSearch}
              title="Limpar busca"
            >
              <i className="bi bi-x"></i>
            </button>
          )}
        </div>

        {hasSearch && (
          <div className="search-info">
            <span className="search-tip">
              <i className="bi bi-info-circle"></i>
              Use vírgula, espaço ou ; para buscar múltiplos termos
            </span>
          </div>
        )}
      </div>
    </div>
  );
};

export default HistorySearch;