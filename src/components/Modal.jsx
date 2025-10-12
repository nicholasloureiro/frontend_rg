import React from 'react';
import '../styles/Modal.css';
import Button from './Button';

const Modal = ({ show, onClose, onCloseX, title, bodyContent, buttonText }) => {
  if (!show) return null;

  return (
    <div className="modal fade show" style={{ display: 'block' }} tabIndex="-1" aria-hidden="true">
      <div className="modal-dialog-modal animate__animated animate__fadeIn">
        <div className="modal-content-modal">

          <div className="modal-header-modal">
            <h5 className="modal-title-modal">{title}</h5>
            {onCloseX && (
              <button type="button" className="close" aria-label="Close" onClick={onCloseX} style={{ backgroundColor: 'transparent', border: 'none' }}>
                <span aria-hidden="true"><i className="bi bi-x" style={{ color: 'var(--color-text-primary)' }}></i></span>
              </button>
            )}
          </div>

          <div className="modal-body-modal">
            {bodyContent}
          </div>

          {onClose && buttonText && (
            <div className="modal-footer-modal">
              <Button text={buttonText} onClick={onClose} variant="primary" />
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Modal;
