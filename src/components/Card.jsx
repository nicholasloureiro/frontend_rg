import React from 'react';
import '../styles/Card.css';

const Card = ({ title, value, icon, bgColor, textColor, rightLabel, iconBgColor }) => {
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
          <span className="dashboard-card-value">{value}</span>
        </div>
        {rightLabel && <div className="dashboard-card-right">{rightLabel}</div>}
      </div>
    </div>
  );
};

export default Card; 