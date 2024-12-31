import { useState, FormEvent } from 'react'

interface Participant {
  id: string
  name: string
}

interface ExpenseFormData {
  amount: string
  payer: string
  beneficiaries: string[]
  description: string
}

const ExpenseForm = () => {
  const [formData, setFormData] = useState<ExpenseFormData>({
    amount: '',
    payer: '',
    beneficiaries: [],
    description: ''
  })

  const [participants] = useState<Participant[]>([
    { id: '1', name: 'Osoba 1' },
    { id: '2', name: 'Osoba 2' },
    { id: '3', name: 'Osoba 3' }
  ])

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault()
    // TODO: Dodać obsługę zapisu wydatku
    console.log('Zapisano wydatek:', formData)
  }

  return (
    <form onSubmit={handleSubmit} className="needs-validation" noValidate>
      {/* Kwota */}
      <div className="mb-3">
        <label htmlFor="amount" className="form-label">Kwota</label>
        <div className="input-group">
          <input
            type="number"
            className="form-control"
            id="amount"
            value={formData.amount}
            onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
            required
            min="0"
            step="0.01"
          />
          <span className="input-group-text">PLN</span>
        </div>
        <div className="invalid-feedback">
          Proszę podać prawidłową kwotę
        </div>
      </div>

      {/* Płatnik */}
      <div className="mb-3">
        <label htmlFor="payer" className="form-label">Płatnik</label>
        <select
          className="form-select"
          id="payer"
          value={formData.payer}
          onChange={(e) => setFormData({ ...formData, payer: e.target.value })}
          required
        >
          <option value="">Wybierz płatnika</option>
          {participants.map((participant) => (
            <option key={participant.id} value={participant.id}>
              {participant.name}
            </option>
          ))}
        </select>
        <div className="invalid-feedback">
          Proszę wybrać płatnika
        </div>
      </div>

      {/* Beneficjenci */}
      <div className="mb-3">
        <label className="form-label">Beneficjenci</label>
        {participants.map((participant) => (
          <div className="form-check" key={participant.id}>
            <input
              className="form-check-input"
              type="checkbox"
              id={`beneficiary-${participant.id}`}
              checked={formData.beneficiaries.includes(participant.id)}
              onChange={(e) => {
                const newBeneficiaries = e.target.checked
                  ? [...formData.beneficiaries, participant.id]
                  : formData.beneficiaries.filter(id => id !== participant.id)
                setFormData({ ...formData, beneficiaries: newBeneficiaries })
              }}
            />
            <label className="form-check-label" htmlFor={`beneficiary-${participant.id}`}>
              {participant.name}
            </label>
          </div>
        ))}
        <div className="invalid-feedback">
          Proszę wybrać co najmniej jednego beneficjenta
        </div>
      </div>

      {/* Opis */}
      <div className="mb-3">
        <label htmlFor="description" className="form-label">Opis wydatku</label>
        <input
          type="text"
          className="form-control"
          id="description"
          value={formData.description}
          onChange={(e) => setFormData({ ...formData, description: e.target.value })}
          required
        />
        <div className="invalid-feedback">
          Proszę podać opis wydatku
        </div>
      </div>

      <button type="submit" className="btn btn-primary">
        Dodaj wydatek
      </button>
    </form>
  )
}

export default ExpenseForm
