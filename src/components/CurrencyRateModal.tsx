import React, { useState } from 'react'
import { Currency } from '../state/AppState'
import { useAppState } from '../state/AppContext'

interface CurrencyRateModalProps {
  show: boolean
  onClose: () => void
}

export const CurrencyRateModal: React.FC<CurrencyRateModalProps> = ({ show, onClose }) => {
  const appState = useAppState()
  const currencies = appState.getCurrencies()
  
  // Stan lokalny dla edytowanych kursów
  const [rates, setRates] = useState<Record<string, string>>(
    currencies.reduce((acc: Record<string, string>, curr: Currency) => ({
      ...acc,
      [curr.code]: curr.exchangeRate.toString()
    }), {})
  )

  // Obsługa zmiany kursu
  const handleRateChange = (currency: Currency, value: string) => {
    setRates(prev => ({
      ...prev,
      [currency.code]: value
    }))
  }

  // Stan dla błędów walidacji
  const [errors, setErrors] = useState<Record<string, string>>({})

  // Zapisywanie zmian
  const handleSave = () => {
    const newErrors: Record<string, string> = {}
    let hasErrors = false

    currencies.forEach(currency => {
      if (currency.code !== 'PLN') {
        const newRate = parseFloat(rates[currency.code])
        if (!appState.validateExchangeRate(newRate)) {
          newErrors[currency.code] = 'Kurs musi być liczbą większą od 0 i mniejszą od 1000'
          hasErrors = true
        }
      }
    })

    if (hasErrors) {
      setErrors(newErrors)
      return
    }

    currencies.forEach(currency => {
      if (currency.code !== 'PLN') {
        const newRate = parseFloat(rates[currency.code])
        appState.updateExchangeRate(currency.code, newRate)
      }
    })
    onClose()
  }

  if (!show) return null

  return (
    <div className="modal show d-block" tabIndex={-1}>
      <div className="modal-dialog">
        <div className="modal-content">
          <div className="modal-header">
            <h5 className="modal-title">Kursy walut</h5>
            <button
              type="button"
              className="btn-close"
              onClick={onClose}
              aria-label="Close"
            />
          </div>
          <div className="modal-body">
            <div className="table-responsive">
              <table className="table">
                <thead>
                  <tr>
                    <th>Waluta</th>
                    <th>Kod</th>
                    <th>Kurs (PLN)</th>
                  </tr>
                </thead>
                <tbody>
                  {currencies.map(currency => (
                    <tr key={currency.code}>
                      <td>{currency.name}</td>
                      <td>{currency.code}</td>
                      <td>
                        {currency.code === 'PLN' ? (
                          <span>1.00</span>
                        ) : (
                          <>
                            <input
                              type="number"
                              className={`form-control form-control-sm ${errors[currency.code] ? 'is-invalid' : ''}`}
                              value={rates[currency.code]}
                              onChange={(e) => {
                                handleRateChange(currency, e.target.value)
                                if (errors[currency.code]) {
                                  setErrors(prev => ({
                                    ...prev,
                                    [currency.code]: ''
                                  }))
                                }
                              }}
                              min="0"
                              step="0.01"
                            />
                            {errors[currency.code] && (
                              <div className="invalid-feedback">
                                {errors[currency.code]}
                              </div>
                            )}
                          </>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
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
            <button
              type="button"
              className="btn btn-primary"
              onClick={handleSave}
            >
              Zapisz zmiany
            </button>
          </div>
        </div>
      </div>
      <div className="modal-backdrop show"></div>
    </div>
  )
}
