import React, { useState } from 'react';

interface DateRangeModalProps {
  isOpen: boolean;
  onClose: () => void;
  onGenerate: (startDate: Date | undefined, endDate: Date | undefined) => void;
}

export const DateRangeModal: React.FC<DateRangeModalProps> = ({
  isOpen,
  onClose,
  onGenerate,
}) => {
  const [startDate, setStartDate] = useState<string>('');
  const [endDate, setEndDate] = useState<string>('');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onGenerate(
      startDate ? new Date(startDate) : undefined,
      endDate ? new Date(endDate) : undefined
    );
    onClose();
  };

  return (
    <div className="modal-wrapper">
      <div className="modal show d-block" tabIndex={-1} style={{ zIndex: 1050 }}>
        <div className="modal-dialog">
          <div className="modal-content">
          <div className="modal-header">
            <h5 className="modal-title">Wybierz zakres dat dla raportu</h5>
            <button
              type="button"
              className="btn-close"
              onClick={onClose}
              aria-label="Close"
            />
          </div>
          <form onSubmit={handleSubmit}>
            <div className="modal-body">
              <div className="mb-3">
                <label htmlFor="startDate" className="form-label">
                  Data początkowa
                </label>
                <input
                  type="date"
                  className="form-control"
                  id="startDate"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                />
              </div>
              <div className="mb-3">
                <label htmlFor="endDate" className="form-label">
                  Data końcowa
                </label>
                <input
                  type="date"
                  className="form-control"
                  id="endDate"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                />
              </div>
            </div>
            <div className="modal-footer">
              <button
                type="button"
                className="btn btn-secondary"
                onClick={onClose}
              >
                Anuluj
              </button>
              <button type="submit" className="btn btn-primary">
                Generuj raport
              </button>
            </div>
          </form>
          </div>
        </div>
      </div>
      <div 
        className="modal-backdrop show" 
        style={{ 
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: '#000',
          opacity: 0.5,
          zIndex: 1040 
        }} 
        onClick={onClose}
      />
    </div>
  );
};
