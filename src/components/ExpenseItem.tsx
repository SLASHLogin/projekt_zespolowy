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
          <div className="row row-cols-2 row-cols-sm-3 g-2">
            {participants.map(participant => (
              <div className="col" key={participant.id}>
                <div className="form-check">
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
              </div>
            ))}
          </div>
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
      <div className="mb-2">
        <div className="row g-2">
          <div className="col-12 col-sm">
            <h6 className="mb-1 text-break">{expense.description}</h6>
            <p className="mb-1">
              <strong>
                {expense.amount} {expense.currency}
              </strong>
            </p>
            <small className="text-muted d-block text-truncate">
              Płatnik: {participants.find(p => p.id === expense.payer)?.name}
            </small>
          </div>
          <div className="col-12 col-sm-auto">
            <div className="d-flex gap-2 justify-content-start justify-content-sm-end">
              <button
                className="btn btn-outline-primary"
                onClick={handleEdit}
              >
                Edytuj
              </button>
              <button
                className="btn btn-outline-danger"
                onClick={handleDelete}
              >
                Usuń
              </button>
            </div>
          </div>
        </div>
      </div>
      <div>
        <small className="text-muted d-block text-break mb-1">
          Beneficjenci:{' '}
          {expense.beneficiaries
            .map(id => participants.find(p => p.id === id)?.name)
            .join(', ')}
        </small>
        <small className="text-muted d-block">
          Data: {formatDate(expense.date)}
        </small>
      </div>
    </>
  );
});

ExpenseItem.displayName = 'ExpenseItem';

export default ExpenseItem;
