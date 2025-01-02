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

export interface Balance {
  participantId: string
  totalPaid: number      // suma wydanych pieniędzy
  totalOwed: number      // suma należności wobec innych
  netBalance: number     // bilans końcowy (totalPaid - totalOwed)
}

export interface Transfer {
  from: string           // id osoby która ma zapłacić
  to: string            // id osoby która ma otrzymać
  amount: number        // kwota w walucie głównej (PLN)
}

export interface Payment {
  id: string
  from: string           // id płatnika
  to: string            // id odbiorcy
  amount: number        // kwota płatności
  currency: string      // waluta płatności
  date: string         // data płatności
}

type Subscriber = () => void;

export class AppState {
  private participants: Participant[] = []
  private expenses: Expense[] = []
  private payments: Payment[] = []
  
  // Bufory dla kosztownych obliczeń
  private cachedBalances: Balance[] | null = null
  private cachedTransfers: Transfer[] | null = null
  private isBalancesCacheValid = false
  private isTransfersCacheValid = false
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

  private invalidateCache() {
    this.isBalancesCacheValid = false
    this.isTransfersCacheValid = false
    this.cachedBalances = null
    this.cachedTransfers = null
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
    this.invalidateCache()
    this.saveToLocalStorage()
    this.notifySubscribers()
    return newExpense
  }

  removeExpense(id: string): void {
    this.expenses = this.expenses.filter(e => e.id !== id)
    this.invalidateCache()
    this.saveToLocalStorage()
    this.notifySubscribers()
  }

  updateExpense(id: string, expense: Partial<Omit<Expense, 'id'>>): void {
    const index = this.expenses.findIndex(e => e.id === id)
    if (index !== -1) {
      this.expenses[index] = { ...this.expenses[index], ...expense }
      this.invalidateCache()
      this.saveToLocalStorage()
      this.notifySubscribers()
    }
  }

  getExpenses(): Expense[] {
    return [...this.expenses]
  }

  // Obliczanie bilansu z wykorzystaniem bufora
  calculateBalances(): Balance[] {
    if (this.isBalancesCacheValid && this.cachedBalances) {
      return [...this.cachedBalances]
    }

    const balances: Balance[] = this.participants.map(participant => ({
      participantId: participant.id,
      totalPaid: 0,
      totalOwed: 0,
      netBalance: 0
    }))

    // Oblicz sumy wydatków i należności dla każdego uczestnika
    this.expenses.forEach(expense => {
      const expenseAmount = this.convertToMainCurrency(expense.amount, expense.currency)
      const payer = balances.find(b => b.participantId === expense.payer)
      if (payer) {
        payer.totalPaid += expenseAmount
      }

      const perPersonAmount = expenseAmount / expense.beneficiaries.length
      expense.beneficiaries.forEach(beneficiaryId => {
        const beneficiary = balances.find(b => b.participantId === beneficiaryId)
        if (beneficiary) {
          beneficiary.totalOwed += perPersonAmount
        }
      })
    })

    // Oblicz bilans końcowy dla każdego uczestnika
    balances.forEach(balance => {
      balance.netBalance = balance.totalPaid - balance.totalOwed
    })

    this.cachedBalances = balances
    this.isBalancesCacheValid = true
    return [...balances]
  }

  // Obliczanie optymalnych transferów z wykorzystaniem bufora
  calculateTransfers(): Transfer[] {
    if (this.isTransfersCacheValid && this.cachedTransfers) {
      return [...this.cachedTransfers]
    }

    const balances = this.calculateBalances()
    const transfers: Transfer[] = []

    // Skopiuj bilanse do modyfikacji
    const remainingBalances = balances.map(b => ({
      participantId: b.participantId,
      balance: b.netBalance
    }))

    // Sortuj osoby z długiem (ujemny bilans) i wierzycieli (dodatni bilans)
    const debtors = remainingBalances
      .filter(b => b.balance < 0)
      .sort((a, b) => a.balance - b.balance)
    const creditors = remainingBalances
      .filter(b => b.balance > 0)
      .sort((a, b) => b.balance - a.balance)

    // Twórz transfery, zaczynając od największych kwot
    while (debtors.length > 0 && creditors.length > 0) {
      const debtor = debtors[0]
      const creditor = creditors[0]

      // Znajdź mniejszą kwotę z długu i należności
      const amount = Math.min(Math.abs(debtor.balance), creditor.balance)

      // Dodaj transfer
      transfers.push({
        from: debtor.participantId,
        to: creditor.participantId,
        amount: Number(amount.toFixed(2)) // Zaokrąglij do 2 miejsc po przecinku
      })

      // Zaktualizuj pozostałe salda
      debtor.balance += amount
      creditor.balance -= amount

      // Usuń rozliczone osoby
      if (Math.abs(debtor.balance) < 0.01) debtors.shift()
      if (Math.abs(creditor.balance) < 0.01) creditors.shift()
    }

    this.cachedTransfers = transfers
    this.isTransfersCacheValid = true
    return [...transfers]
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

  convertBetweenCurrencies(amount: number, fromCurrency: string, toCurrency: string): number {
    // Najpierw przelicz na PLN
    const amountInPLN = this.convertToMainCurrency(amount, fromCurrency)
    
    // Następnie przelicz z PLN na docelową walutę
    const targetCurrency = this.currencies.find(c => c.code === toCurrency)
    if (!targetCurrency) return amount
    
    return Number((amountInPLN / targetCurrency.exchangeRate).toFixed(2))
  }

  formatAmount(amount: number, currencyCode: string): string {
    const currency = this.currencies.find(c => c.code === currencyCode)
    if (!currency) return `${amount}`
    
    return new Intl.NumberFormat('pl-PL', {
      style: 'currency',
      currency: currencyCode,
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(amount)
  }

  validateExchangeRate(rate: number): boolean {
    return !isNaN(rate) && rate > 0 && rate <= 1000
  }

  // Persystencja danych
  private saveToLocalStorage(): void {
    const data = {
      participants: this.participants,
      expenses: this.expenses,
      currencies: this.currencies,
      payments: this.payments
    }
    localStorage.setItem('splitExpensesState', JSON.stringify(data))
  }

  private loadFromLocalStorage(): void {
    const data = localStorage.getItem('splitExpensesState')
    if (data) {
      const { participants, expenses, currencies, payments } = JSON.parse(data)
      this.participants = participants
      this.expenses = expenses
      this.currencies = currencies
      this.payments = payments || []
    }
  }

  // Zarządzanie płatnościami
  registerPayment(from: string, to: string, amount: number, currency: string): Payment {
    this.invalidateCache()
    // Sprawdź czy uczestnicy istnieją
    const payer = this.participants.find(p => p.id === from)
    const recipient = this.participants.find(p => p.id === to)
    
    if (!payer || !recipient) {
      throw new Error('Nieprawidłowy płatnik lub odbiorca')
    }

    // Sprawdź czy waluta jest obsługiwana
    const currencyExists = this.currencies.some(c => c.code === currency)
    if (!currencyExists) {
      throw new Error('Nieprawidłowa waluta')
    }

    const payment: Payment = {
      id: crypto.randomUUID(),
      from,
      to,
      amount,
      currency,
      date: new Date().toISOString()
    }

    this.payments.push(payment)
    this.saveToLocalStorage()
    this.notifySubscribers()
    return payment
  }

  getPayments(): Payment[] {
    return [...this.payments]
  }

  removePayment(id: string): void {
    this.payments = this.payments.filter(p => p.id !== id)
    this.invalidateCache()
    this.saveToLocalStorage()
    this.notifySubscribers()
  }

  // Eksport/Import danych
  exportState(): string {
    return JSON.stringify({
      participants: this.participants,
      expenses: this.expenses,
      currencies: this.currencies,
      payments: this.payments
    }, null, 2)
  }

  importState(jsonData: string): void {
    try {
      const data = JSON.parse(jsonData)
      this.participants = data.participants || []
      this.expenses = data.expenses || []
      this.currencies = data.currencies || this.currencies
      this.invalidateCache()
      this.saveToLocalStorage()
    } catch (error) {
      console.error('Błąd podczas importowania danych:', error)
    }
  }

  // Resetowanie rozliczeń
  resetState(): void {
    // Zachowaj uczestników i kursy walut
    this.expenses = []
    this.payments = []
    
    // Zresetuj bufor i zapisz stan
    this.invalidateCache()
    this.saveToLocalStorage()
    this.notifySubscribers()
  }
}
