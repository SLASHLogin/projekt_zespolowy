import React from 'react'
import { useAppState } from '../state/AppContext'
import { Balance, Transfer, Participant } from '../state/AppState'

const ExpenseSummary: React.FC = () => {
  const state = useAppState()
  const balances = state.calculateBalances()
  const transfers = state.calculateTransfers()
  const participants = state.getParticipants()

  const formatAmount = (amount: number): string => {
    return new Intl.NumberFormat('pl-PL', {
      style: 'currency',
      currency: 'PLN'
    }).format(amount)
  }

  const getParticipantName = (id: string): string => {
    return participants.find((p: Participant) => p.id === id)?.name || id
  }

  const renderBalance = (balance: Balance) => {
    const className = balance.netBalance > 0 
      ? 'text-success' 
      : balance.netBalance < 0 
        ? 'text-danger' 
        : 'text-body'

    return (
      <div key={balance.participantId} className="card mb-2">
        <div className="card-body p-2 p-sm-3">
          <h6 className="card-title mb-3">{getParticipantName(balance.participantId)}</h6>
          <div className="row row-cols-1 row-cols-sm-3 g-2">
            <div className="col">
              <div className="d-flex flex-column h-100">
                <small className="text-muted mb-1">Wydał(a):</small>
                <div>{formatAmount(balance.totalPaid)}</div>
              </div>
            </div>
            <div className="col">
              <div className="d-flex flex-column h-100">
                <small className="text-muted mb-1">Powinien/Powinna wydać:</small>
                <div>{formatAmount(balance.totalOwed)}</div>
              </div>
            </div>
            <div className="col">
              <div className="d-flex flex-column h-100">
                <small className="text-muted mb-1">Bilans:</small>
                <div className={className}>{formatAmount(balance.netBalance)}</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  const renderTransfer = (transfer: Transfer) => (
    <div key={`${transfer.from}-${transfer.to}`} className="alert alert-info">
      <i className="bi bi-arrow-right me-2"></i>
      <strong>{getParticipantName(transfer.from)}</strong>
      {' powinien/powinna przelać '}
      <strong>{formatAmount(transfer.amount)}</strong>
      {' do '}
      <strong>{getParticipantName(transfer.to)}</strong>
    </div>
  )

  return (
    <div className="container my-4">
      <div className="mb-4">
        <h5 className="mb-3">Bilans per osoba</h5>
        {balances.map(renderBalance)}
      </div>

      <div>
        <h5 className="mb-3">Sugerowane przelewy</h5>
        {transfers.length > 0 ? (
          transfers.map(renderTransfer)
        ) : (
          <div className="alert alert-success">
            <i className="bi bi-check-circle me-2"></i>
            Wszyscy są rozliczeni!
          </div>
        )}
      </div>
    </div>
  )
}

export default ExpenseSummary
