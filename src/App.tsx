import { useState } from 'react'
import './App.css'
import ExpenseForm from './components/ExpenseForm.tsx'
import ExpenseList from './components/ExpenseList.tsx'
import ExpenseSummary from './components/ExpenseSummary.tsx'
import { CurrencyRateModal } from './components/CurrencyRateModal'
import { AppProvider } from './state/AppContext'

function App() {
  const [showCurrencyModal, setShowCurrencyModal] = useState(false)
  return (
    <AppProvider>
      <div className="min-vh-100 d-flex flex-column">
        {/* Nagłówek */}
        <header className="bg-primary text-white py-3">
          <div className="container">
            <div className="d-flex justify-content-between align-items-center">
              <div>
                <h1 className="h3 mb-0">Split Expenses</h1>
                <p className="mb-0">Rozliczenia grupowe</p>
              </div>
              <button 
                className="btn btn-outline-light"
                onClick={() => setShowCurrencyModal(true)}
              >
                Kursy walut
              </button>
            </div>
          </div>
        </header>

        {/* Główny obszar roboczy */}
        <main className="flex-grow-1 py-4">
          <div className="container">
            <div className="row g-4">
              {/* Sekcja dodawania/edycji wydatków */}
              <div className="col-12 col-lg-4">
                <div className="card h-100">
                  <div className="card-header">
                    <h2 className="h5 mb-0">Dodaj wydatek</h2>
                  </div>
                  <div className="card-body">
                    <ExpenseForm />
                  </div>
                </div>
              </div>

              {/* Sekcja listy wydatków */}
              <div className="col-12 col-lg-4">
                <div className="card h-100">
                  <div className="card-header">
                    <h2 className="h5 mb-0">Lista wydatków</h2>
                  </div>
                <div className="card-body">
                  <ExpenseList />
                </div>
                </div>
              </div>

              {/* Sekcja podsumowania rozliczeń */}
              <div className="col-12 col-lg-4">
                <div className="card h-100">
                  <div className="card-header">
                    <h2 className="h5 mb-0">Podsumowanie rozliczeń</h2>
                  </div>
                  <div className="card-body p-0">
                    <ExpenseSummary />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </main>

        {/* Stopka */}
        <footer className="bg-light py-3 mt-auto">
          <div className="container">
            <div className="text-center text-muted">
              <small>Split Expenses &copy; 2024</small>
            </div>
          </div>
        </footer>

        {/* Modal kursów walut */}
        <CurrencyRateModal 
          show={showCurrencyModal}
          onClose={() => setShowCurrencyModal(false)}
        />
      </div>
    </AppProvider>
  )
}

export default App
