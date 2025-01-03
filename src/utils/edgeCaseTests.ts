import { AppState, Expense, Payment } from '../state/AppState'

function runEdgeCaseTests() {
  console.log('Rozpoczynam testy edge cases...\n')
  
  const state = new AppState()
  
  // Test 1: Bardzo małe kwoty
  console.log('Test 1: Bardzo małe kwoty')
  const expense1: Omit<Expense, 'id' | 'date'> = {
    amount: 0.01,
    currency: 'PLN',
    payer: '1',
    beneficiaries: ['1', '2', '3', '4'],
    description: 'Test małej kwoty'
  }
  state.addExpense(expense1)
  console.log('Bilans po wydatku 0.01 PLN:')
  console.log(state.calculateBalances())
  console.log('Transfery:')
  console.log(state.calculateTransfers())
  console.log('\n')

  // Test 2: Bardzo duże kwoty
  console.log('Test 2: Bardzo duże kwoty')
  const expense2: Omit<Expense, 'id' | 'date'> = {
    amount: 1000000,
    currency: 'PLN',
    payer: '2',
    beneficiaries: ['1', '2', '3', '4'],
    description: 'Test dużej kwoty'
  }
  state.addExpense(expense2)
  console.log('Bilans po wydatku 1000000 PLN:')
  console.log(state.calculateBalances())
  console.log('Transfery:')
  console.log(state.calculateTransfers())
  console.log('\n')

  // Test 3: Mieszane waluty
  console.log('Test 3: Mieszane waluty')
  const expense3: Omit<Expense, 'id' | 'date'> = {
    amount: 100,
    currency: 'EUR',
    payer: '3',
    beneficiaries: ['1', '2', '3'],
    description: 'Test w EUR'
  }
  const expense4: Omit<Expense, 'id' | 'date'> = {
    amount: 100,
    currency: 'USD',
    payer: '4',
    beneficiaries: ['2', '3', '4'],
    description: 'Test w USD'
  }
  state.addExpense(expense3)
  state.addExpense(expense4)
  console.log('Bilans po wydatkach w różnych walutach:')
  console.log(state.calculateBalances())
  console.log('Transfery:')
  console.log(state.calculateTransfers())
  console.log('\n')

  // Test 4: Płatnik jako beneficjent
  console.log('Test 4: Płatnik jako beneficjent')
  const expense5: Omit<Expense, 'id' | 'date'> = {
    amount: 100,
    currency: 'PLN',
    payer: '1',
    beneficiaries: ['1', '2'],
    description: 'Płatnik jest też beneficjentem'
  }
  state.addExpense(expense5)
  console.log('Bilans gdy płatnik jest beneficjentem:')
  console.log(state.calculateBalances())
  console.log('Transfery:')
  console.log(state.calculateTransfers())
  console.log('\n')

  // Test 5: Cykl długów
  console.log('Test 5: Cykl długów')
  const expense6: Omit<Expense, 'id' | 'date'> = {
    amount: 100,
    currency: 'PLN',
    payer: '1',
    beneficiaries: ['2'],
    description: 'A -> B'
  }
  const expense7: Omit<Expense, 'id' | 'date'> = {
    amount: 100,
    currency: 'PLN',
    payer: '2',
    beneficiaries: ['3'],
    description: 'B -> C'
  }
  const expense8: Omit<Expense, 'id' | 'date'> = {
    amount: 100,
    currency: 'PLN',
    payer: '3',
    beneficiaries: ['1'],
    description: 'C -> A'
  }
  state.addExpense(expense6)
  state.addExpense(expense7)
  state.addExpense(expense8)
  console.log('Bilans w cyklu długów:')
  console.log(state.calculateBalances())
  console.log('Transfery:')
  console.log(state.calculateTransfers())
  console.log('\n')

  // Test 6: Spłaty w różnych walutach
  console.log('Test 6: Spłaty w różnych walutach')
  state.registerPayment('2', '1', 50, 'EUR')
  state.registerPayment('3', '2', 50, 'USD')
  console.log('Bilans po spłatach w różnych walutach:')
  console.log(state.calculateBalances())
  console.log('Transfery:')
  console.log(state.calculateTransfers())
  console.log('\n')

  // Test 7: Zaokrąglanie przy przeliczaniu walut
  console.log('Test 7: Zaokrąglanie przy przeliczaniu walut')
  const expense9: Omit<Expense, 'id' | 'date'> = {
    amount: 99.99,
    currency: 'EUR',
    payer: '1',
    beneficiaries: ['1', '2', '3', '4'],
    description: 'Test zaokrąglania'
  }
  state.addExpense(expense9)
  console.log('Kwota w EUR:', 99.99)
  console.log('Przeliczona na PLN:', state.convertToMainCurrency(99.99, 'EUR'))
  console.log('Przeliczona na USD:', state.convertBetweenCurrencies(99.99, 'EUR', 'USD'))
  console.log('\n')

  // Test 8: Aktualizacja kursów walut
  console.log('Test 8: Aktualizacja kursów walut')
  console.log('Bilans przed aktualizacją kursu EUR:')
  console.log(state.calculateBalances())
  state.updateExchangeRate('EUR', 4.5)
  console.log('Bilans po aktualizacji kursu EUR:')
  console.log(state.calculateBalances())
  console.log('\n')

  console.log('Testy zakończone.')
}

export { runEdgeCaseTests }
