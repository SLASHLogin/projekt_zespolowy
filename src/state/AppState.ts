export interface Participant {
  id: string
  name: string
}

export interface Currency {
  code: string
  symbol: string
  name: string
  exchangeRate: number // kurs względem waluty głównej (PLN)
}

export interface Expense {
  id: string
  amount: number
  currency: string
  payer: string
  beneficiaries: string[]
  description: string
  date: string
}

type Subscriber = () => void;

export class AppState {
  private participants: Participant[] = []
  private expenses: Expense[] = []
  private currencies: Currency[] = [
    { code: 'PLN', symbol: 'zł', name: 'Polski złoty', exchangeRate: 1 },
    { code: 'EUR', symbol: '€', name: 'Euro', exchangeRate: 4.32 },
    { code: 'USD', symbol: '$', name: 'Dolar amerykański', exchangeRate: 3.95 },
    { code: 'GBP', symbol: '£', name: 'Funt brytyjski', exchangeRate: 5.05 }
  ]

  private subscribers: Set<Subscriber> = new Set()

  constructor() {
    this.loadFromLocalStorage()
    
    // Dodaj domyślnych uczestników, jeśli nie ma żadnych
    if (this.participants.length === 0) {
      this.participants = [
        { id: '1', name: 'Anna' },
        { id: '2', name: 'Bartosz' },
        { id: '3', name: 'Celina' },
        { id: '4', name: 'Daniel' }
      ]
      this.saveToLocalStorage()
    }
  }

  subscribe(callback: Subscriber) {
    this.subscribers.add(callback)
    return () => {
      this.subscribers.delete(callback)
    }
  }

  private notifySubscribers() {
    this.subscribers.forEach(callback => callback())
  }

  // Zarządzanie uczestnikami
  addParticipant(name: string): Participant {
    const id = crypto.randomUUID()
    const participant: Participant = { id, name }
    this.participants.push(participant)
    this.saveToLocalStorage()
    this.notifySubscribers()
    return participant
  }

  removeParticipant(id: string): void {
    this.participants = this.participants.filter(p => p.id !== id)
    this.saveToLocalStorage()
    this.notifySubscribers()
  }

  getParticipants(): Participant[] {
    return [...this.participants]
  }

  // Zarządzanie wydatkami
  addExpense(expense: Omit<Expense, 'id' | 'date'>): Expense {
    const id = crypto.randomUUID()
    const date = new Date().toISOString()
    const newExpense: Expense = { ...expense, id, date }
    this.expenses.push(newExpense)
    this.saveToLocalStorage()
    this.notifySubscribers()
    return newExpense
  }

  removeExpense(id: string): void {
    this.expenses = this.expenses.filter(e => e.id !== id)
    this.saveToLocalStorage()
    this.notifySubscribers()
  }

  updateExpense(id: string, expense: Partial<Omit<Expense, 'id'>>): void {
    const index = this.expenses.findIndex(e => e.id === id)
    if (index !== -1) {
      this.expenses[index] = { ...this.expenses[index], ...expense }
      this.saveToLocalStorage()
      this.notifySubscribers()
    }
  }

  getExpenses(): Expense[] {
    return [...this.expenses]
  }

  // Zarządzanie walutami
  getCurrencies(): Currency[] {
    return [...this.currencies]
  }

  updateExchangeRate(code: string, rate: number): void {
    const currency = this.currencies.find(c => c.code === code)
    if (currency) {
      currency.exchangeRate = rate
      this.saveToLocalStorage()
      this.notifySubscribers()
    }
  }

  // Konwersja walut
  convertToMainCurrency(amount: number, fromCurrency: string): number {
    const currency = this.currencies.find(c => c.code === fromCurrency)
    if (!currency) return amount
    return amount * currency.exchangeRate
  }

  // Persystencja danych
  private saveToLocalStorage(): void {
    const data = {
      participants: this.participants,
      expenses: this.expenses,
      currencies: this.currencies
    }
    localStorage.setItem('splitExpensesState', JSON.stringify(data))
  }

  private loadFromLocalStorage(): void {
    const data = localStorage.getItem('splitExpensesState')
    if (data) {
      const { participants, expenses, currencies } = JSON.parse(data)
      this.participants = participants
      this.expenses = expenses
      this.currencies = currencies
    }
  }

  // Eksport/Import danych
  exportState(): string {
    return JSON.stringify({
      participants: this.participants,
      expenses: this.expenses,
      currencies: this.currencies
    }, null, 2)
  }

  importState(jsonData: string): void {
    try {
      const data = JSON.parse(jsonData)
      this.participants = data.participants || []
      this.expenses = data.expenses || []
      this.currencies = data.currencies || this.currencies
      this.saveToLocalStorage()
    } catch (error) {
      console.error('Błąd podczas importowania danych:', error)
    }
  }
}
