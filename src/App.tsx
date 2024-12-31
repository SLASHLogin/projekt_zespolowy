import { useState } from 'react'
import './App.css'

function App() {
  return (
    <div className="min-vh-100 d-flex flex-column">
      {/* Nagłówek */}
      <header className="bg-primary text-white py-3">
        <div className="container">
          <h1 className="h3 mb-0">Split Expenses</h1>
          <p className="mb-0">Rozliczenia grupowe</p>
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
                  <p className="text-muted">Formularz dodawania wydatku pojawi się tutaj</p>
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
                  <p className="text-muted">Lista wydatków pojawi się tutaj</p>
                </div>
              </div>
            </div>

            {/* Sekcja podsumowania rozliczeń */}
            <div className="col-12 col-lg-4">
              <div className="card h-100">
                <div className="card-header">
                  <h2 className="h5 mb-0">Podsumowanie rozliczeń</h2>
                </div>
                <div className="card-body">
                  <p className="text-muted">Podsumowanie rozliczeń pojawi się tutaj</p>
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
    </div>
  )
}

export default App
