import { useState, useEffect } from 'react'
import { useAppState } from '../state/AppContext'
import { Expense } from '../state/AppState'

const ExpenseList = () => {
  const appState = useAppState()
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editForm, setEditForm] = useState<Partial<Expense>>({})
  const [expenses, setExpenses] = useState<Expense[]>([])

  useEffect(() => {
    setExpenses(appState.getExpenses())
    const unsubscribe = appState.subscribe(() => {
      setExpenses(appState.getExpenses())
    })
    return unsubscribe
  }, [appState])

  const currencies = appState.getCurrencies()
  const participants = appState.getParticipants()

  const handleDelete = (id: string) => {
    if (window.confirm('Czy na pewno chcesz usunąć ten wydatek?')) {
      appState.removeExpense(id)
    }
  }

  const handleEdit = (expense: Expense) => {
    setEditingId(expense.id)
    setEditForm(expense)
  }

  const handleSave = () => {
    if (editingId && editForm.amount && editForm.currency && editForm.payer && editForm.beneficiaries) {
      appState.updateExpense(editingId, editForm)
      setEditingId(null)
      setEditForm({})
    }
  }

  const handleCancel = () => {
    setEditingId(null)
    setEditForm({})
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pl-PL', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  if (expenses.length === 0) {
    return (
      <div className="text-center text-muted">
        <p>Brak wydatków do wyświetlenia</p>
      </div>
    )
  }

  return (
    <div className="list-group">
      {expenses.map(expense => (
        <div key={expense.id} className="list-group-item">
          {editingId === expense.id ? (
            // Formularz edycji
            <div className="mb-3">
              <div className="input-group mb-2">
                <input
                  type="number"
                  className="form-control"
                  value={editForm.amount || ''}
                  onChange={e => setEditForm({ ...editForm, amount: parseFloat(e.target.value) })}
                  min="0"
                  step="0.01"
                  required
                />
                <select
                  className="form-select"
                  value={editForm.currency || ''}
                  onChange={e => setEditForm({ ...editForm, currency: e.target.value })}
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
                onChange={e => setEditForm({ ...editForm, payer: e.target.value })}
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
                        const beneficiaries = editForm.beneficiaries || []
                        setEditForm({
                          ...editForm,
                          beneficiaries: e.target.checked
                            ? [...beneficiaries, participant.id]
                            : beneficiaries.filter(id => id !== participant.id)
                        })
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
                onChange={e => setEditForm({ ...editForm, description: e.target.value })}
                placeholder="Opis wydatku"
                required
              />
              <div className="d-flex gap-2">
                <button className="btn btn-primary btn-sm" onClick={handleSave}>
                  Zapisz
                </button>
                <button className="btn btn-secondary btn-sm" onClick={handleCancel}>
                  Anuluj
                </button>
              </div>
            </div>
          ) : (
            // Widok wydatku
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
                    onClick={() => handleEdit(expense)}
                  >
                    Edytuj
                  </button>
                  <button
                    className="btn btn-outline-danger btn-sm"
                    onClick={() => handleDelete(expense.id)}
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
          )}
        </div>
      ))}
    </div>
  )
}

export default ExpenseList
