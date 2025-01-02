import React, { useState, useCallback, memo } from 'react'
import './App.css'
import ExpenseForm from './components/ExpenseForm.tsx'
import ExpenseList from './components/ExpenseList.tsx'
import ExpenseSummary from './components/ExpenseSummary.tsx'
import { CurrencyRateModal } from './components/CurrencyRateModal'
import { PaymentForm } from './components/PaymentForm'
import { AppProvider, useAppState } from './state/AppContext'

interface ResetModalProps {
  show: boolean;
  onClose: () => void;
  onReset: () => void;
}

const ResetModal = memo<ResetModalProps>(({ show, onClose, onReset }) => {
  if (!show) return null;
  
  return (
    <div className="modal show d-block" tabIndex={-1}>
      <div className="modal-dialog">
        <div className="modal-content">
          <div className="modal-header">
            <h5 className="modal-title">Potwierdź resetowanie</h5>
            <button 
              type="button" 
              className="btn-close" 
              onClick={onClose}
            ></button>
          </div>
          <div className="modal-body">
            <p>Czy na pewno chcesz zresetować wszystkie rozliczenia? Ta operacja usunie wszystkie wydatki i płatności, ale zachowa uczestników i kursy walut.</p>
            <p className="text-danger mb-0">Tej operacji nie można cofnąć!</p>
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
              className="btn btn-danger" 
              onClick={onReset}
            >
              Resetuj
            </button>
          </div>
        </div>
      </div>
      <div className="modal-backdrop fade show"></div>
    </div>
  );
});

interface PaymentModalProps {
  show: boolean;
  onClose: () => void;
}

const PaymentModal = memo<PaymentModalProps>(({ show, onClose }) => {
  if (!show) return null;
  
  return (
    <div className="modal show d-block" tabIndex={-1}>
      <div className="modal-dialog">
        <PaymentForm onClose={onClose} />
      </div>
      <div className="modal-backdrop fade show"></div>
    </div>
  );
});

const AppContent = memo(() => {
  const [showCurrencyModal, setShowCurrencyModal] = useState(false);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [showResetModal, setShowResetModal] = useState(false);
  const appState = useAppState();

  const handleExport = useCallback(() => {
    const jsonString = appState.exportState();
    const blob = new Blob([jsonString], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `split-expenses-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }, [appState]);

  const handleImport = useCallback(() => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.json';
    input.onchange = (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (file) {
        const reader = new FileReader();
        reader.onload = (e) => {
          const content = e.target?.result as string;
          appState.importState(content);
        };
        reader.readAsText(file);
      }
    };
    input.click();
  }, [appState]);

  const handleShowPaymentModal = useCallback(() => setShowPaymentModal(true), []);
  const handleShowCurrencyModal = useCallback(() => setShowCurrencyModal(true), []);
  const handleShowResetModal = useCallback(() => setShowResetModal(true), []);
  const handleClosePaymentModal = useCallback(() => setShowPaymentModal(false), []);
  const handleCloseCurrencyModal = useCallback(() => setShowCurrencyModal(false), []);
  const handleCloseResetModal = useCallback(() => setShowResetModal(false), []);
  const handleReset = useCallback(() => {
    appState.resetState();
    setShowResetModal(false);
  }, [appState]);

  return (
    <div className="min-vh-100 d-flex flex-column">
        {/* Nagłówek */}
        <header className="bg-primary text-white py-3">
          <div className="container">
            <div className="d-flex justify-content-between align-items-center">
              <div>
                <h1 className="h3 mb-0">Split Expenses</h1>
                <p className="mb-0">Rozliczenia grupowe</p>
              </div>
              <div>
                <button 
                  className="btn btn-outline-light me-2"
                  onClick={handleExport}
                >
                  Eksportuj
                </button>
                <button 
                  className="btn btn-outline-light me-2"
                  onClick={handleImport}
                >
                  Importuj
                </button>
                <button 
                  className="btn btn-outline-light me-2"
                  onClick={handleShowPaymentModal}
                >
                  Zarejestruj spłatę
                </button>
                <button 
                  className="btn btn-outline-light me-2"
                  onClick={handleShowCurrencyModal}
                >
                  Kursy walut
                </button>
                <button 
                  className="btn btn-outline-light"
                  onClick={handleShowResetModal}
                >
                  Resetuj rozliczenia
                </button>
              </div>
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

        {/* Modale */}
        <CurrencyRateModal 
          show={showCurrencyModal}
          onClose={handleCloseCurrencyModal}
        />

        <PaymentModal 
          show={showPaymentModal}
          onClose={handleClosePaymentModal}
        />

        <ResetModal 
          show={showResetModal}
          onClose={handleCloseResetModal}
          onReset={handleReset}
        />
      </div>
  )
})

function App() {
  return (
    <AppProvider>
      <AppContent />
    </AppProvider>
  )
}

export default App;
