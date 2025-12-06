import React from 'react';

import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import "../styles/inputDate.css";
import ptBR from './datepickerLocalePTBR';


const InputDate = ({ selectedDate, onDateChange, placeholderText, locale, disabled = false, className = "", mode = "date" }) => {
  // mode: 'date' (default) ou 'month'
  const isMonth = mode === 'month';
  return (
    <div className="date-picker-container">
      <DatePicker
        showIcon
        icon="bi bi-calendar3"
        selected={selectedDate}
        onChange={onDateChange}
        locale={locale || ptBR}
        isClearable
        placeholderText={placeholderText}
        disabled={disabled}
        className={className}
        style={{ width: '100%' }}
        {...(isMonth
          ? {
              dateFormat: "MM/yyyy",
              showMonthYearPicker: true,
              showFullMonthYearPicker: true,
            }
          : {
              peekNextMonth: true,
              showMonthDropdown: true,
              showYearDropdown: true,
              dropdownMode: "select",
              dateFormat: "dd/MM/yyyy",
            })}
      />
    </div>
  );
};


export default InputDate;
