import React from 'react';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import "../styles/InputDate.css";

const InputDate = ({ selectedDate, onDateChange, placeholderText, locale = "pt-BR", disabled = false }) => {
  return (
    <div className="date-picker-container">
      <DatePicker
        showIcon
        icon="bi bi-calendar3"
        selected={selectedDate}
        onChange={(date) => onDateChange(date)}
        locale={locale}
        isClearable
        peekNextMonth
        showMonthDropdown
        showYearDropdown
        dropdownMode="select"
        dateFormat="dd/MM/yyyy"
        placeholderText={placeholderText}
        disabled={disabled}
        style={{ width: '100%' }}
      />
    </div>
  );
};


export default InputDate;
