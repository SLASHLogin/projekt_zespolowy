import { AppState } from '../state/AppState'

interface TestCase {
  name: string
  input: string
  expectedError?: string
  validate?: (state: AppState) => boolean
}

function runImportTests() {
  console.log('Rozpoczynam testy importu/eksportu danych...\n')
  const testCases: TestCase[] = [
    // Test 1: Poprawny format JSON
    {
      name: 'Poprawny format JSON',
      input: JSON.stringify({
        participants: [
          { id: '1', name: 'Test User' }
        ],
        expenses: [
          {
            id: '1',
            amount: 100,
            currency: 'PLN',
            payer: '1',
            beneficiaries: ['1'],
            description: 'Test expense',
            date: '2024-01-03T12:00:00.000Z'
          }
        ],
        currencies: [
          { code: 'PLN', symbol: 'zł', name: 'Polski złoty', exchangeRate: 1 }
        ],
        payments: []
      }, null, 2),
      validate: (state: AppState) => {
        const participants = state.getParticipants()
        const expenses = state.getExpenses()
        return participants.length === 1 && expenses.length === 1
      }
    },

    // Test 2: Niepoprawny format JSON
    {
      name: 'Niepoprawny format JSON',
      input: '{ invalid json',
      expectedError: 'Błąd podczas importowania danych'
    },

    // Test 3: Brakujące wymagane pola
    {
      name: 'Brakujące wymagane pola w wydatku',
      input: JSON.stringify({
        participants: [],
        expenses: [{ id: '1' }], // brak wymaganych pól
        currencies: [],
        payments: []
      }),
      validate: (state: AppState) => state.getExpenses().length === 0
    },

    // Test 4: Niepoprawny format daty
    {
      name: 'Niepoprawny format daty',
      input: JSON.stringify({
        participants: [],
        expenses: [{
          id: '1',
          amount: 100,
          currency: 'PLN',
          payer: '1',
          beneficiaries: ['1'],
          description: 'Test',
          date: 'invalid-date'
        }],
        currencies: [],
        payments: []
      }),
      validate: (state: AppState) => state.getExpenses().length === 0
    },

    // Test 5: Niepoprawne wartości liczbowe
    {
      name: 'Niepoprawne wartości liczbowe',
      input: JSON.stringify({
        participants: [],
        expenses: [{
          id: '1',
          amount: 'not-a-number',
          currency: 'PLN',
          payer: '1',
          beneficiaries: ['1'],
          description: 'Test',
          date: '2024-01-03T12:00:00.000Z'
        }],
        currencies: [],
        payments: []
      }),
      validate: (state: AppState) => state.getExpenses().length === 0
    },

    // Test 6: Różne formaty liczb
    {
      name: 'Różne formaty liczb',
      input: JSON.stringify({
        participants: [],
        expenses: [{
          id: '1',
          amount: '100.50', // string zamiast number
          currency: 'PLN',
          payer: '1',
          beneficiaries: ['1'],
          description: 'Test',
          date: '2024-01-03T12:00:00.000Z'
        }],
        currencies: [],
        payments: []
      }),
      validate: (state: AppState) => {
        const expenses = state.getExpenses()
        return expenses.length === 1 && typeof expenses[0].amount === 'number'
      }
    },

    // Test 7: Różne formaty dat
    {
      name: 'Różne formaty dat',
      input: JSON.stringify({
        participants: [],
        expenses: [
          {
            id: '1',
            amount: 100,
            currency: 'PLN',
            payer: '1',
            beneficiaries: ['1'],
            description: 'Test',
            date: '2024-01-03' // krótszy format daty
          }
        ],
        currencies: [],
        payments: []
      }),
      validate: (state: AppState) => {
        const expenses = state.getExpenses()
        return expenses.length === 1 && expenses[0].date.includes('T')
      }
    }
  ]

  let passedTests = 0
  let failedTests = 0

  testCases.forEach(testCase => {
    console.log(`\nTest: ${testCase.name}`)
    const state = new AppState()

    try {
      state.importState(testCase.input)

      if (testCase.expectedError) {
        console.log('❌ Test nie powiódł się: oczekiwano błędu')
        failedTests++
        return
      }

      if (testCase.validate && !testCase.validate(state)) {
        console.log('❌ Test nie powiódł się: walidacja nie powiodła się')
        failedTests++
        return
      }

      console.log('✅ Test zakończony sukcesem')
      passedTests++
    } catch (error) {
      if (testCase.expectedError) {
        if (error instanceof Error && error.message.includes(testCase.expectedError)) {
          console.log('✅ Test zakończony sukcesem (oczekiwany błąd)')
          passedTests++
        } else {
          console.log('❌ Test nie powiódł się: nieoczekiwany błąd')
          failedTests++
        }
      } else {
        console.log('❌ Test nie powiódł się:', error)
        failedTests++
      }
    }
  })

  console.log(`\nPodsumowanie testów:`)
  console.log(`✅ Testy zakończone sukcesem: ${passedTests}`)
  console.log(`❌ Testy zakończone niepowodzeniem: ${failedTests}`)
  console.log(`Łącznie testów: ${testCases.length}`)
}

// Uruchom testy
runImportTests()
