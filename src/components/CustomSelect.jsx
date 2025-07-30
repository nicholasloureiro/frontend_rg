import React, { useState, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';
import '../styles/CustomSelect.css';
import { capitalizeText } from '../utils/capitalizeText';

const CustomSelect = ({ options, value, onChange, placeholder, label, disabled, error, isMulti = false }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const selectRef = useRef(null);
  const [position, setPosition] = useState({ top: 0, left: 0, width: 0 });
  const [showSearchInput, setShowSearchInput] = useState(false);

  const selectedOptions = isMulti && Array.isArray(value) 
    ? options.filter(option => value.includes(option.value))
    : [];
  const selectedOption = !isMulti && value ? options.find(option => option.value === value) : null;

  const handleSelect = (option) => {
    if (disabled) return;
    
    if (isMulti) {
      const currentValues = Array.isArray(value) ? value : [];
      const newValues = currentValues.includes(option.value)
        ? currentValues.filter(v => v !== option.value)
        : [...currentValues, option.value];
      onChange(newValues);
    } else {
      onChange(option.value);
      setIsOpen(false);
    }
  };

  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
    if (!showSearchInput) {
      setShowSearchInput(true);
    }
  };

  const filteredOptions = options.filter(option =>
    option.value !== '' && option.label.toLowerCase().includes(searchTerm.toLowerCase())
  );

  useEffect(() => {
    if (isOpen) {
      if (options.length > 10) {
        setShowSearchInput(true);
      }
    } else {
      setShowSearchInput(options.length > 10);
      setSearchTerm(''); 
    }
  }, [isOpen, options]);

  // Focar no input de busca quando abrir, mas sem causar scroll
  useEffect(() => {
    if (isOpen && showSearchInput) {
      const searchInput = document.querySelector('.custom-select-search');
      if (searchInput) {
        // Pequeno delay para garantir que o input está renderizado
        setTimeout(() => {
          searchInput.focus();
        }, 10);
      }
    }
  }, [isOpen, showSearchInput]);

  useEffect(() => {
    const calculatePosition = () => {
      if (selectRef.current) {
        const rect = selectRef.current.getBoundingClientRect();
        const viewportHeight = window.innerHeight;
        const dropdownHeight = Math.min(options.length * 40 + (showSearchInput ? 50 : 0), 300); // Altura estimada do dropdown
        
        // Verificar se há espaço suficiente abaixo
        const spaceBelow = viewportHeight - rect.bottom;
        const spaceAbove = rect.top;
        
        let top;
        if (spaceBelow >= dropdownHeight || spaceBelow > spaceAbove) {
          // Posicionar abaixo
          top = rect.bottom + window.scrollY;
        } else {
          // Posicionar acima
          top = rect.top + window.scrollY - dropdownHeight;
        }
        
        setPosition({
          top: top,
          left: rect.left + window.scrollX,
          width: rect.width,
        });
      }
    };

    if (isOpen) {
      calculatePosition();
      window.addEventListener('resize', calculatePosition);
      window.addEventListener('scroll', calculatePosition);
    } else {
      window.removeEventListener('resize', calculatePosition);
      window.removeEventListener('scroll', calculatePosition);
      setSearchTerm('');
    }

    return () => {
      window.removeEventListener('resize', calculatePosition);
      window.removeEventListener('scroll', calculatePosition);
    };
  }, [isOpen, options.length, showSearchInput]);
  
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (selectRef.current && !selectRef.current.contains(event.target) && !event.target.closest('.custom-select-portal-wrapper')) {
        setIsOpen(false);
        setShowSearchInput(options.length > 10);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [options]);

  return (
    <div className="custom-select-container" ref={selectRef}>
      {label && <label className="custom-select-label">{label}</label>}
      <div
        className={`custom-select-control ${isOpen ? 'open' : ''} ${disabled ? 'disabled' : ''} ${error ? 'error' : ''}`}
        onClick={() => { !disabled && setIsOpen(!isOpen) }}
      >
        <div className="custom-select-value">
          {isMulti ? (
            selectedOptions.length > 0 ? (
              <div className="custom-select-multi-values">
                {selectedOptions.map((option, index) => (
                  <span key={option.value} className="custom-select-multi-tag">
                    {capitalizeText(option.label)}
                    {index < selectedOptions.length - 1 && ', '}
                  </span>
                ))}
              </div>
            ) : (placeholder || 'Selecione opções')
          ) : (
            selectedOption ? capitalizeText(selectedOption.label) : (placeholder || 'Selecione uma opção')
          )}
        </div>
        <div className={`custom-select-arrow ${isOpen ? 'open' : ''}`}><i className={`bi ${isOpen ? 'bi-chevron-up' : 'bi-chevron-down'}`}></i></div>
      </div>

      {isOpen && createPortal(
        <div
          className="custom-select-portal-wrapper"
          style={{
            position: 'absolute',
            top: position.top,
            left: position.left,
            width: position.width,
            zIndex: 9999999,
          }}
        >
          <div className="custom-select-menu" style={{ position: "relative", top: "10px"}}>
            {showSearchInput && (
              <div style={{ backgroundColor: "var(--background-inputs)", padding: "2px 0", position: "sticky", top: "-1px" }}>
                <input
                  type="text"
                  className="custom-select-search"
                  placeholder="Buscar..."
                  value={searchTerm}
                  onChange={handleSearchChange}
                  disabled={disabled}
                />
              </div>
            )}

            {filteredOptions.length > 0 ? (
              filteredOptions.map(option => (
                <div
                  key={option.value}
                  className={`custom-select-option ${isMulti ? (Array.isArray(value) && value.includes(option.value) ? 'selected' : '') : (option.value === value ? 'selected' : '')} ${disabled ? 'disabled' : ''}`}
                  onClick={() => handleSelect(option)}
                  style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}
                >
                 <span className="custom-select-option-value">{capitalizeText(option.label)}</span> 
                 {isMulti ? (
                   Array.isArray(value) && value.includes(option.value) && <span className="custom-select-option-value-selected"><i className="bi bi-check-lg"></i></span>
                 ) : (
                   option.value === value && <span className="custom-select-option-value-selected"><i className="bi bi-check-lg"></i></span>
                 )}
                </div>
              ))
            ) : (
              <div className="custom-select-no-options">Nenhuma opção encontrada</div>
            )}
          </div>
        </div>,
        document.body
      )}
    </div>
  );
};

export default CustomSelect; 