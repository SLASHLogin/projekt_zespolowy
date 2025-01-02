import React, { memo, useCallback } from 'react';
import { Expense } from '../state/AppState';
import { Participant, Currency } from '../state/AppState';

interface ExpenseItemProps {
  expense: Expense;
  isEditing: boolean;
  editForm: Partial<Expense>;
  participants: Participant[];
  currencies: Currency[];
  onEdit: (expense: Expense) => void;
  onDelete: (id: string) => void;
  onSave: () => void;
  onCancel: () => void;
  onEditFormChange: (form: Partial<Expense>) => void;
}

const ExpenseItem = memo(({
  expense,
  isEditing,
  editForm,
  participants,
  currencies,
  onEdit,
  onDelete,
  onSave,
  onCancel,
  onEditFormChange,
}: ExpenseItemProps) => {
  const handleEdit = useCallback(() => onEdit(expense), [expense, onEdit]);
  const handleDelete = useCallback(() => onDelete(expense.id), [expense.id, onDelete]);

  const formatDate = useCallback((dateString: string) => {
    return new Date(dateString).toLocaleDateString('pl-PL', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  }, []);

  if (isEditing) {
    return (
      <div className="mb-3">
        <div className="input-group mb-2">
          <input
            type="number"
            className="form-control"
            value={editForm.amount || ''}
            onChange={e => onEditFormChange({ ...editForm, amount: parseFloat(e.target.value) })}
            min="0"
            step="0.01"
            required
          />
          <select
            className="form-select"
            value={editForm.currency || ''}
            onChange={e => onEditFormChange({ ...editForm, currency: e.target.value })}
            required
          >
            {currencies.map(currency => (
              <option key={currency.code} value={currency.code}>
                {currency.code} ({currency.symbol})
              </option>
            ))}
          </select>
        </div>
        <select
          className="form-select mb-2"
          value={editForm.payer || ''}
          onChange={e => onEditFormChange({ ...editForm, payer: e.target.value })}
          required
        >
          <option value="">Wybierz płatnika</option>
          {participants.map(participant => (
            <option key={participant.id} value={participant.id}>
              {participant.name}
            </option>
          ))}
        </select>
        <div className="mb-2">
          {participants.map(participant => (
            <div className="form-check" key={participant.id}>
              <input
                type="checkbox"
                className="form-check-input"
                id={`edit-beneficiary-${participant.id}`}
                checked={(editForm.beneficiaries || []).includes(participant.id)}
                onChange={e => {
                  const beneficiaries = editForm.beneficiaries || [];
                  onEditFormChange({
                    ...editForm,
                    beneficiaries: e.target.checked
                      ? [...beneficiaries, participant.id]
                      : beneficiaries.filter(id => id !== participant.id)
                  });
                }}
              />
              <label className="form-check-label" htmlFor={`edit-beneficiary-${participant.id}`}>
                {participant.name}
              </label>
            </div>
          ))}
        </div>
        <input
          type="text"
          className="form-control mb-2"
          value={editForm.description || ''}
          onChange={e => onEditFormChange({ ...editForm, description: e.target.value })}
          placeholder="Opis wydatku"
          required
        />
        <div className="d-flex gap-2">
          <button className="btn btn-primary btn-sm" onClick={onSave}>
            Zapisz
          </button>
          <button className="btn btn-secondary btn-sm" onClick={onCancel}>
            Anuluj
          </button>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="d-flex justify-content-between align-items-start mb-2">
        <div>
          <h6 className="mb-1">{expense.description}</h6>
          <p className="mb-1">
            <strong>
              {expense.amount} {expense.currency}
            </strong>
          </p>
          <small className="text-muted">
            Płatnik: {participants.find(p => p.id === expense.payer)?.name}
          </small>
        </div>
        <div className="btn-group">
          <button
            className="btn btn-outline-primary btn-sm"
            onClick={handleEdit}
          >
            Edytuj
          </button>
          <button
            className="btn btn-outline-danger btn-sm"
            onClick={handleDelete}
          >
            Usuń
          </button>
        </div>
      </div>
      <div className="mb-2">
        <small className="text-muted">
          Beneficjenci:{' '}
          {expense.beneficiaries
            .map(id => participants.find(p => p.id === id)?.name)
            .join(', ')}
        </small>
      </div>
      <small className="text-muted d-block">
        Data: {formatDate(expense.date)}
      </small>
    </>
  );
});

ExpenseItem.displayName = 'ExpenseItem';

export default ExpenseItem;
