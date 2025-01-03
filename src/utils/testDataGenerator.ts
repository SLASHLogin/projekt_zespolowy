import { Expense, Payment } from '../state/AppState'

const PARTICIPANT_IDS = ['1', '2', '3', '4'] // domyślni uczestnicy z AppState
const CURRENCIES = ['PLN', 'EUR', 'USD', 'GBP']
const DESCRIPTIONS = [
  'Zakupy spożywcze',
  'Restauracja',
  'Transport',
  'Rozrywka',
  'Mieszkanie',
  'Paliwo',
  'Kino',
  'Pizza',
  'Prezenty',
  'Wycieczka'
]

function getRandomElement<T>(array: T[]): T {
  return array[Math.floor(Math.random() * array.length)]
}

function getRandomAmount(min: number, max: number): number {
  return Number((Math.random() * (max - min) + min).toFixed(2))
}

function getRandomDate(startDate: Date, endDate: Date): string {
  const timestamp = startDate.getTime() + Math.random() * (endDate.getTime() - startDate.getTime())
  return new Date(timestamp).toISOString()
}

function getRandomBeneficiaries(excludeId?: string): string[] {
  // Dostępni beneficjenci (bez płatnika)
  const availableIds = excludeId ? PARTICIPANT_IDS.filter(id => id !== excludeId) : [...PARTICIPANT_IDS]
  
  // Losowa liczba beneficjentów (2 do liczby dostępnych uczestników)
  const maxBeneficiaries = Math.min(4, availableIds.length)
  const count = Math.floor(Math.random() * (maxBeneficiaries - 1)) + 2
  
  // Losowo wybierz beneficjentów
  for (let i = availableIds.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [availableIds[i], availableIds[j]] = [availableIds[j], availableIds[i]]
  }
  
  return availableIds.slice(0, count)
}

export function generateExpense(): Omit<Expense, 'id'> {
  const payer = getRandomElement(PARTICIPANT_IDS)
  return {
    amount: getRandomAmount(10, 1000),
    currency: getRandomElement(CURRENCIES),
    payer,
    beneficiaries: getRandomBeneficiaries(payer),
    description: getRandomElement(DESCRIPTIONS),
    date: getRandomDate(new Date(2023, 0, 1), new Date())
  }
}

export function generatePayment(): Omit<Payment, 'id'> {
  const from = getRandomElement(PARTICIPANT_IDS)
  let to
  do {
    to = getRandomElement(PARTICIPANT_IDS)
  } while (to === from)

  return {
    from,
    to,
    amount: getRandomAmount(50, 500),
    currency: getRandomElement(CURRENCIES),
    date: getRandomDate(new Date(2023, 0, 1), new Date())
  }
}

export function generateTestData(expenseCount: number, paymentCount: number) {
  const expenses: Omit<Expense, 'id'>[] = []
  const payments: Omit<Payment, 'id'>[] = []

  for (let i = 0; i < expenseCount; i++) {
    expenses.push(generateExpense())
  }

  for (let i = 0; i < paymentCount; i++) {
    payments.push(generatePayment())
  }

  return { expenses, payments }
}
