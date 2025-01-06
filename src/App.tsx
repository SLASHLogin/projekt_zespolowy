import React, { useState, useCallback, memo } from 'react'
import './App.css'
import ExpenseForm from './components/ExpenseForm.tsx'
import ExpenseList from './components/ExpenseList.tsx'
import ExpenseSummary from './components/ExpenseSummary.tsx'
import { CurrencyRateModal } from './components/CurrencyRateModal'
import { PaymentForm } from './components/PaymentForm'
import { AppProvider, useAppState } from './state/AppContext'
import { DateRangeModal } from './components/DateRangeModal'
import { ExpenseReport } from './components/ExpenseReport'
import { PDFDownloadLink } from '@react-pdf/renderer'

interface ResetModalProps {
  show: boolean;
  onClose: () => void;
  onReset: () => void;
}

const ResetModal = memo<ResetModalProps>(({ show, onClose, onReset }) => {
  if (!show) return null;
  
  return (
    <div className="modal-wrapper">
      <div className="modal show d-block" tabIndex={-1} style={{ zIndex: 1050 }}>
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
});

interface PaymentModalProps {
  show: boolean;
  onClose: () => void;
}

const PaymentModal = memo<PaymentModalProps>(({ show, onClose }) => {
  if (!show) return null;
  
  return (
    <div className="modal-wrapper">
      <div className="modal show d-block" tabIndex={-1} style={{ zIndex: 1050 }}>
        <div className="modal-dialog">
          <PaymentForm onClose={onClose} />
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
});

const AppContent = memo(() => {
  const [showCurrencyModal, setShowCurrencyModal] = useState(false);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [showResetModal, setShowResetModal] = useState(false);
  const [showDateRangeModal, setShowDateRangeModal] = useState(false);
  const [showParticipantModal, setShowParticipantModal] = useState(false);
  const [newParticipantName, setNewParticipantName] = useState('');
  const [reportDates, setReportDates] = useState<{
    startDate?: Date;
    endDate?: Date;
  }>({});
  const appState = useAppState();
  const participants = appState.getParticipants();

  const handleAddParticipant = () => {
    try {
      const newParticipant = appState.addParticipant(newParticipantName);
      setNewParticipantName('');
      console.log('Dodano nowego uczestnika:', newParticipant);
    } catch (error) {
      console.error('Błąd podczas dodawania uczestnika:', error);
    }
  };

  const handleEditParticipant = (id: string) => {
    const participant = participants.find(p => p.id === id);
    if (participant) {
      setNewParticipantName(participant.name);
    }
  };

  const handleUpdateParticipant = () => {
    try {
      const participantId = participants.find(p => p.name === newParticipantName)?.id;
      if (participantId) {
        appState.updateParticipant(participantId, newParticipantName);
        setNewParticipantName('');
        console.log('Zaktualizowano uczestnika');
      } else {
        console.error('Nie znaleziono uczestnika o takiej nazwie');
      }
    } catch (error) {
      console.error('Błąd podczas aktualizacji uczestnika:', error);
    }
  };

  const handleRemoveParticipant = (id: string) => {
    try {
      appState.removeParticipant(id);
      console.log('Usunięto uczestnika o id:', id);
    } catch (error) {
      console.error('Błąd podczas usuwania uczestnika:', error);
    }
  };

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
  const handleCloseDateRangeModal = useCallback(() => setShowDateRangeModal(false), []);
  const handleShowDateRangeModal = useCallback(() => setShowDateRangeModal(true), []);
  
  const handleGenerateReport = useCallback((startDate?: Date, endDate?: Date) => {
    setReportDates({ startDate, endDate });
  }, []);
  const handleReset = useCallback(() => {
    appState.resetState();
    setShowResetModal(false);
  }, [appState]);

  return (
    <div className="min-vh-100 d-flex flex-column">
        {/* Nagłówek */}
        <header className="bg-primary text-white py-3">
          <div className="container">
            <div className="row g-3">
              <div className="col-12 col-md-4 col-lg-3">
                <h1 className="h3 mb-0">Split Expenses</h1>
                <p className="mb-0 d-none d-md-block">Rozliczenia grupowe</p>
              </div>
              <div className="col-12 col-md-8 col-lg-9">
                <div className="d-flex flex-wrap gap-2 justify-content-start justify-content-md-end">
                  <button 
                    className="btn btn-outline-light btn-md btn-md-lg"
                    onClick={handleExport}
                  >
                    Eksportuj
                  </button>
                  <button 
                    className="btn btn-outline-light btn-md btn-md-lg"
                    onClick={handleImport}
                  >
                    Importuj
                  </button>
                  <button 
                    className="btn btn-outline-light btn-md btn-md-lg"
                    onClick={handleShowPaymentModal}
                  >
                    Zarejestruj spłatę
                  </button>
                  <button 
                    className="btn btn-outline-light btn-md btn-md-lg"
                    onClick={handleShowCurrencyModal}
                  >
                    Kursy walut
                  </button>
                  <button 
                    className="btn btn-outline-light btn-md btn-md-lg"
                    onClick={handleShowDateRangeModal}
                  >
                    Wybierz zakres dat
                  </button>
                  {reportDates.startDate !== undefined && (
                    <PDFDownloadLink
                      document={
                        <AppProvider>
                          <ExpenseReport
                            startDate={reportDates.startDate}
                            endDate={reportDates.endDate}
                          />
                        </AppProvider>
                      }
                      fileName={`rozliczenia-${new Date().toISOString().split('T')[0]}.pdf`}
                      className="btn btn-outline-light btn-md btn-md-lg"
                    >
                      <span>Generuj PDF</span>
                    </PDFDownloadLink>
                  )}
                  <button
                    className="btn btn-outline-light btn-md btn-md-lg"
                    onClick={handleShowResetModal}
                  >
                    Resetuj rozliczenia
                  </button>
                  <button
                    className="btn btn-outline-light btn-md btn-md-lg"
                    onClick={() => setShowParticipantModal(true)}
                  >
                    Zarządzaj uczestnikami
                  </button>
                </div>
              </div>
            </div>
          </div>
        </header>

        {/* Modal do zarządzania uczestnikami */}
        {showParticipantModal && (
          <div className="modal-wrapper">
            <div className="modal show d-block" tabIndex={-1} style={{ zIndex: 1050 }}>
              <div className="modal-dialog">
                <div className="modal-content">
                  <div className="modal-header">
                    <h5 className="modal-title">Zarządzaj uczestnikami</h5>
                    <button
                      type="button"
                      className="btn-close"
                      onClick={() => setShowParticipantModal(false)}
                    ></button>
                  </div>
                  <div className="modal-body">
                    {/* Formularz dodawania nowego uczestnika */}
                    <div className="mb-3">
                      <label htmlFor="newParticipantName" className="form-label">
                        Dodaj nowego uczestnika
                      </label>
                      <div className="input-group">
                        <input
                          type="text"
                          className="form-control"
                          id="newParticipantName"
                          placeholder="Wprowadź imię"
                          value={newParticipantName}
                          onChange={(e) => setNewParticipantName(e.target.value)}
                        />
                        <button
                          className="btn btn-primary"
                          onClick={handleAddParticipant}
                          disabled={!newParticipantName.trim()}
                        >
                          Dodaj
                        </button>
                      </div>
                    </div>

                    {/* Lista istniejących uczestników */}
                    <div>
                      <h6>Uczestnicy:</h6>
                      <ul className="list-group">
                        {participants.map((participant) => (
                          <li
                            key={participant.id}
                            className="list-group-item d-flex justify-content-between align-items-center"
                          >
                            <span>{participant.name}</span>
                            <div>
                              <button
                                className="btn btn-sm btn-outline-primary me-2"
                                onClick={() => handleEditParticipant(participant.id)}
                              >
                                Edytuj
                              </button>
                              <button
                                className="btn btn-sm btn-outline-danger"
                                onClick={() => handleRemoveParticipant(participant.id)}
                              >
                                Usuń
                              </button>
                            </div>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                  <div className="modal-footer">
                    <button
                      type="button"
                      className="btn btn-secondary"
                      onClick={() => setShowParticipantModal(false)}
                    >
                      Zamknij
                    </button>
                  </div>
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
              onClick={() => setShowParticipantModal(false)}
            />
          </div>
        )}

        {/* Główny obszar roboczy */}
        <main className="flex-grow-1 py-4">
          <div className="container">
            <div className="row g-4">
              {/* Sekcja dodawania/edycji wydatków */}
              <div className="col-12 col-md-6 col-lg-4">
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
              <div className="col-12 col-md-6 col-lg-4">
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
              <div className="col-12 col-md-6 col-lg-4">
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

        <DateRangeModal
          isOpen={showDateRangeModal}
          onClose={handleCloseDateRangeModal}
          onGenerate={handleGenerateReport}
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
