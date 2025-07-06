import React from 'react';
import '../styles/Card.css';
import { formatCurrency } from '../utils/format';

const Card = ({ title, value, icon, bgColor, textColor, rightLabel, iconBgColor }) => {
  // Formatar valor se for número float
  let displayValue = value;
  if (typeof value === 'number' && title.toLowerCase().includes('total')) {
    displayValue = formatCurrency(value);
  }
  return (
    <div className="dashboard-card" style={{ backgroundColor: bgColor, color: textColor }}>
      <div className="dashboard-card-content">
        <div
          className="dashboard-card-icon"
          style={{ background: iconBgColor }}
        >
          {icon}
        </div>
        <div className="dashboard-card-info">
          <span className="dashboard-card-title">{title}</span>
          <span className="dashboard-card-value">{displayValue}</span>
        </div>
        {rightLabel && <div className="dashboard-card-right">{rightLabel}</div>}
      </div>
    </div>
  );
};

export default Card; 