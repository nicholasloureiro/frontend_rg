import React, { useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCalendarAlt, faChevronDown, faChevronLeft, faChevronRight } from '@fortawesome/free-solid-svg-icons';
import '../styles/PeriodFilter.css';

// Componente para renderizar ícones Bootstrap dinamicamente
const BootstrapIcon = ({ iconName, className = '' }) => {
  return <i className={`bi bi-${iconName} ${className}`}></i>;
};

const PeriodFilter = ({ selectedPeriod, onPeriodChange, loading = false, customDate = null, customType = null }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [currentView, setCurrentView] = useState('period'); // 'period' ou 'calendar'
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [currentYear, setCurrentYear] = useState(new Date().getFullYear());
  const [currentMonth, setCurrentMonth] = useState(new Date().getMonth());
  
  // Inicializar estados baseado nos props
  const [selectedYear, setSelectedYear] = useState(() => {
    if (customDate && customType === 'year') {
      // Parsear a data ISO corretamente sem timezone
      const [year] = customDate.split('-');
      return parseInt(year, 10);
    }
    if (customDate && customType === 'month') {
      // Parsear a data ISO corretamente sem timezone
      const [year] = customDate.split('-');
      return parseInt(year, 10);
    }
    return null;
  });
  
  const [selectedMonth, setSelectedMonth] = useState(() => {
    if (customDate && customType === 'month') {
      // Parsear a data ISO corretamente sem timezone
      const [year, month] = customDate.split('-');
      return parseInt(month, 10) - 1; // Mês é 0-indexed
    }
    return null;
  });

  const periods = [
    { value: 'dia', label: 'Hoje', icon: 'calendar-day' },
    { value: 'semana', label: 'Últimos 7 dias', icon: 'calendar-week' },
    { value: 'mes', label: 'Este mês', icon: 'calendar-month' },
    { value: 'ano', label: 'Este ano', icon: 'calendar-range' },
    { value: 'custom', label: 'Período personalizado', icon: 'calendar-event' }
  ];

  const selectedPeriodData = periods.find(p => p.value === selectedPeriod) || periods[0];

  // NÃO sincronizar estados - os estados internos são a fonte da verdade
  // O customDate é apenas para inicialização no useState acima

  const handlePeriodSelect = (period) => {
    if (period === 'custom') {
      setCurrentView('calendar');
    } else {
      // Limpa as seleções customizadas quando volta para períodos padrão
      setSelectedMonth(null);
      setSelectedYear(null);
      onPeriodChange(period);
      setIsOpen(false);
    }
  };

  const handleCustomDateSelect = () => {
    const dateStr = selectedDate.toISOString().split('T')[0];
    onPeriodChange('custom', dateStr);
    setIsOpen(false);
    setCurrentView('period');
  };

  const handleBackToPeriods = () => {
    setCurrentView('period');
  };

  const months = [
    'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
    'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
  ];

  const years = Array.from({ length: 10 }, (_, i) => currentYear - 5 + i);

  const handleMonthSelect = (month) => {
    // Se já temos um ano selecionado, usa esse ano; senão usa o ano atual
    const targetYear = selectedYear !== null ? selectedYear : new Date().getFullYear();
    
    setSelectedMonth(month);
    setSelectedYear(targetYear);
    
    const date = new Date(targetYear, month, 1);
    const dateStr = date.toISOString().split('T')[0];
    
    // Se temos ano e mês, é um mês específico
    onPeriodChange('custom', dateStr, 'month');
    setIsOpen(false);
    setCurrentView('period');
  };

  const handleYearSelect = (year) => {
    setSelectedYear(year);
    // NÃO limpa o mês - permite concatenação
    
    // Se temos mês e ano, usa o mês; senão usa o ano inteiro
    if (selectedMonth !== null) {
      const date = new Date(year, selectedMonth, 1);
      setSelectedDate(date);
      const dateStr = date.toISOString().split('T')[0];
      onPeriodChange('custom', dateStr, 'month');
    } else {
      const date = new Date(year, 0, 1);
      setSelectedDate(date);
      const dateStr = date.toISOString().split('T')[0];
      onPeriodChange('custom', dateStr, 'year');
    }
    
    setIsOpen(false);
    setCurrentView('period');
  };

  const getDisplayText = () => {
    // Se temos estados internos selecionados, usar eles
    if (selectedMonth !== null && selectedYear !== null) {
      const month = months[selectedMonth];
      return `${month} ${selectedYear}`;
    }
    
    if (selectedYear !== null && selectedMonth === null) {
      return `Ano ${selectedYear}`;
    }
    
    // Se há uma data customizada selecionada
    if (customDate) {
      const date = new Date(customDate);
      
      // Se é um filtro por mês
      if (customType === 'month') {
        const month = months[date.getMonth()];
        const year = date.getFullYear();
        return `${month} ${year}`;
      }
      
      // Se é um filtro por ano
      if (customType === 'year') {
        const year = date.getFullYear();
        return `Ano ${year}`;
      }
      
      // Se é uma data específica
      if (customType === 'day' || !customType) {
        const day = date.getDate();
        const month = months[date.getMonth()];
        const year = date.getFullYear();
        return `${day} de ${month} ${year}`;
      }
    }
    
    // Se é um período customizado mas sem data específica ainda
    if (selectedPeriod === 'custom') {
      return 'Selecionar período';
    }
    
    // Para períodos padrão, mostrar texto específico baseado na data atual
    const now = new Date();
    
    if (selectedPeriod === 'dia') {
      const day = now.getDate();
      const month = months[now.getMonth()];
      const year = now.getFullYear();
      return `${day} de ${month} ${year}`;
    }
    
    if (selectedPeriod === 'semana') {
      const day = now.getDate();
      const month = months[now.getMonth()];
      const year = now.getFullYear();
      return `Semana de ${day} de ${month} ${year}`;
    }
    
    if (selectedPeriod === 'mes') {
      const month = months[now.getMonth()];
      const year = now.getFullYear();
      return `${month} ${year}`;
    }
    
    if (selectedPeriod === 'ano') {
      const year = now.getFullYear();
      return `Ano ${year}`;
    }
    
    return selectedPeriodData.label;
  };

  return (
    <div className="period-filter">
      <div className="period-filter-label">
        <FontAwesomeIcon icon={faCalendarAlt} />
        <span>Período:</span>
      </div>
      
      <div className="period-filter-dropdown">
        <button 
          className={`period-filter-button ${isOpen ? 'open' : ''} ${loading ? 'loading' : ''}`}
          onClick={() => setIsOpen(!isOpen)}
          disabled={loading}
        >
          <span className="period-filter-icon">
            <BootstrapIcon iconName={selectedPeriodData.icon} />
          </span>
          <span className="period-filter-text">{getDisplayText()}</span>
          <FontAwesomeIcon 
            icon={faChevronDown} 
            className={`period-filter-arrow ${isOpen ? 'rotated' : ''}`} 
          />
        </button>

        {isOpen && (
          <div className="period-filter-menu">
            {currentView === 'period' && (
              <>
                {periods.map((period) => (
                  <button
                    key={period.value}
                    className={`period-filter-item ${selectedPeriod === period.value ? 'selected' : ''}`}
                    onClick={() => handlePeriodSelect(period.value)}
                  >
                    <span className="period-filter-item-icon">
                      <BootstrapIcon iconName={period.icon} />
                    </span>
                    <span className="period-filter-item-text">{period.label}</span>
                    {selectedPeriod === period.value && (
                      <span className="period-filter-item-check">✓</span>
                    )}
                  </button>
                ))}
                
                <div className="period-filter-divider"></div>
                
                <div className="period-filter-custom-section">
                  <h4 className="period-filter-custom-title">Selecionar período específico:</h4>
                  
                  {(selectedMonth !== null || selectedYear !== null) && (
                    <div className="period-filter-selection-info">
                      <span>Selecionado: {getDisplayText()}</span>
                      <button 
                        className="period-filter-clear-btn"
                        onClick={() => {
                          setSelectedMonth(null);
                          setSelectedYear(null);
                        }}
                      >
                        Limpar
                      </button>
                    </div>
                  )}
                  
                  <div className="period-filter-month-year">
                    <h5>Por Mês:</h5>
                    <div className="period-filter-months-grid">
                      {months.map((month, index) => (
                        <button
                          key={index}
                          className={`period-filter-month-item ${selectedMonth === index ? 'selected' : ''}`}
                          onClick={() => handleMonthSelect(index)}
                        >
                          {month}
                        </button>
                      ))}
                    </div>
                    
                    <div className="period-filter-year-selector">
                      <button 
                        className="period-filter-year-nav"
                        onClick={() => setCurrentYear(currentYear - 10)}
                      >
                        <FontAwesomeIcon icon={faChevronLeft} />
                      </button>
                      <span className="period-filter-year-display">{currentYear - 5} - {currentYear + 4}</span>
                      <button 
                        className="period-filter-year-nav"
                        onClick={() => setCurrentYear(currentYear + 10)}
                      >
                        <FontAwesomeIcon icon={faChevronRight} />
                      </button>
                    </div>
                  </div>

                  <div className="period-filter-year-section">
                    <h5>Por Ano:</h5>
                    <div className="period-filter-years-grid">
                      {years.map((year) => (
                        <button
                          key={year}
                          className={`period-filter-year-item ${selectedYear === year ? 'selected' : ''}`}
                          onClick={() => handleYearSelect(year)}
                        >
                          {year}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default PeriodFilter;