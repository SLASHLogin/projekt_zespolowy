import React, { useState } from 'react';
import { useAppState } from '../state/AppContext';
import { Participant, Currency } from '../state/AppState';

interface PaymentFormProps {
  onClose: () => void;
}

export const PaymentForm: React.FC<PaymentFormProps> = ({ onClose }) => {
  const appState = useAppState();
  const [payer, setPayer] = useState<string>('');
  const [recipient, setRecipient] = useState<string>('');
  const [amount, setAmount] = useState<string>('');
  const [currency, setCurrency] = useState<string>('PLN');
  const [error, setError] = useState<string>('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!payer || !recipient || !amount || !currency) {
      setError('Wszystkie pola są wymagane');
      return;
    }

    if (payer === recipient) {
      setError('Płatnik i odbiorca nie mogą być tą samą osobą');
      return;
    }

    const amountValue = parseFloat(amount);
    if (isNaN(amountValue) || amountValue <= 0) {
      setError('Kwota musi być większa od 0');
      return;
    }

    try {
      appState.registerPayment(payer, recipient, amountValue, currency);
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Wystąpił błąd podczas rejestracji płatności');
    }
  };

  return (
    <div className="modal-content">
      <div className="modal-header">
        <h5 className="modal-title">Zarejestruj spłatę</h5>
        <button type="button" className="btn-close" onClick={onClose}></button>
      </div>
      <div className="modal-body">
        <form onSubmit={handleSubmit}>
          {error && <div className="alert alert-danger">{error}</div>}
          
          <div className="mb-3">
            <label className="form-label">Płatnik</label>
            <select 
              className="form-select"
              value={payer}
              onChange={(e) => setPayer(e.target.value)}
            >
              <option value="">Wybierz płatnika</option>
              {appState.getParticipants().map((participant: Participant) => (
                <option key={participant.id} value={participant.id}>
                  {participant.name}
                </option>
              ))}
            </select>
          </div>

          <div className="mb-3">
            <label className="form-label">Odbiorca</label>
            <select 
              className="form-select"
              value={recipient}
              onChange={(e) => setRecipient(e.target.value)}
            >
              <option value="">Wybierz odbiorcę</option>
              {appState.getParticipants().map((participant: Participant) => (
                <option key={participant.id} value={participant.id}>
                  {participant.name}
                </option>
              ))}
            </select>
          </div>

          <div className="mb-3">
            <label className="form-label">Kwota</label>
            <input
              type="number"
              className="form-control"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              step="0.01"
              min="0"
            />
          </div>

          <div className="mb-3">
            <label className="form-label">Waluta</label>
            <select
              className="form-select"
              value={currency}
              onChange={(e) => setCurrency(e.target.value)}
            >
              {appState.getCurrencies().map((curr: Currency) => (
                <option key={curr.code} value={curr.code}>
                  {curr.code}
                </option>
              ))}
            </select>
          </div>

          <div className="modal-footer">
            <button type="button" className="btn btn-secondary" onClick={onClose}>
              Anuluj
            </button>
            <button type="submit" className="btn btn-primary">
              Zarejestruj spłatę
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
