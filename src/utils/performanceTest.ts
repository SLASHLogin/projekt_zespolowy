import { AppState } from '../state/AppState'
import { generateTestData } from './testDataGenerator'
import { writeFileSync, mkdirSync } from 'fs'
import { join } from 'path'

interface TestResult {
  dataSize: {
    expenses: number
    payments: number
  }
  timing: {
    addingData: number
    calculatingBalances: number
    calculatingTransfers: number
  }
  memoryUsage: {
    before: number
    after: number
    peak: number
  }
}

function formatBytes(bytes: number): string {
  const units = ['B', 'KB', 'MB', 'GB']
  let size = bytes
  let unitIndex = 0
  
  while (size >= 1024 && unitIndex < units.length - 1) {
    size /= 1024
    unitIndex++
  }
  
  return `${size.toFixed(2)} ${units[unitIndex]}`
}

function getMemoryUsage(): number {
  return process.memoryUsage().heapUsed
}

async function runTest(expenseCount: number, paymentCount: number): Promise<TestResult> {
  console.log(`\nRozpoczynam test dla ${expenseCount} wydatków i ${paymentCount} płatności...`)
  
  // Zresetuj stan aplikacji
  const appState = new AppState()
  appState.resetState()
  
  // Pomiar początkowego użycia pamięci
  const initialMemory = getMemoryUsage()
  let peakMemory = initialMemory
  
  // Generowanie danych testowych
  console.log('Generowanie danych testowych...')
  console.log(`- Generowanie ${expenseCount} wydatków...`)
  const startGenerate = performance.now()
  const { expenses, payments } = generateTestData(expenseCount, paymentCount)
  const endGenerate = performance.now()
  console.log(`- Wygenerowano dane w ${(endGenerate - startGenerate).toFixed(2)}ms`)
  
  // Pomiar czasu dodawania danych
  console.log('Dodawanie danych...')
  const addStart = performance.now()
  
  for (const expense of expenses) {
    appState.addExpense(expense)
  }
  
  for (const payment of payments) {
    appState.registerPayment(
      payment.from,
      payment.to,
      payment.amount,
      payment.currency
    )
  }
  
  const addEnd = performance.now()
  const currentMemory = getMemoryUsage()
  peakMemory = Math.max(peakMemory, currentMemory)
  
  // Pomiar czasu obliczania bilansów
  console.log('Obliczanie bilansów...')
  const balanceStart = performance.now()
  appState.calculateBalances()
  const balanceEnd = performance.now()
  
  // Pomiar czasu obliczania transferów
  console.log('Obliczanie transferów...')
  const transferStart = performance.now()
  appState.calculateTransfers()
  const transferEnd = performance.now()
  
  const finalMemory = getMemoryUsage()
  peakMemory = Math.max(peakMemory, finalMemory)
  
  // Przygotowanie wyników
  const result: TestResult = {
    dataSize: {
      expenses: expenseCount,
      payments: paymentCount
    },
    timing: {
      addingData: addEnd - addStart,
      calculatingBalances: balanceEnd - balanceStart,
      calculatingTransfers: transferEnd - transferStart
    },
    memoryUsage: {
      before: initialMemory,
      after: finalMemory,
      peak: peakMemory
    }
  }
  
  // Wyświetl wyniki
  console.log('\nWyniki testu:')
  console.log(`Rozmiar danych: ${expenseCount} wydatków, ${paymentCount} płatności`)
  console.log(`Czas dodawania danych: ${result.timing.addingData.toFixed(2)}ms`)
  console.log(`Czas obliczania bilansów: ${result.timing.calculatingBalances.toFixed(2)}ms`)
  console.log(`Czas obliczania transferów: ${result.timing.calculatingTransfers.toFixed(2)}ms`)
  console.log(`Użycie pamięci:`)
  console.log(`- Przed: ${formatBytes(result.memoryUsage.before)}`)
  console.log(`- Po: ${formatBytes(result.memoryUsage.after)}`)
  console.log(`- Szczytowe: ${formatBytes(result.memoryUsage.peak)}`)
  
  return result
}

async function runAllTests() {
  const testCases = [
    { expenses: 100, payments: 20 },
    { expenses: 500, payments: 100 },
    { expenses: 1000, payments: 200 },
    { expenses: 5000, payments: 1000 }
  ]
  
  const results: TestResult[] = []
  
  for (const testCase of testCases) {
    const result = await runTest(testCase.expenses, testCase.payments)
    results.push(result)
  }
  
  // Zapisz wyniki do pliku w katalogu test-results
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-')
  const resultsJson = JSON.stringify(results, null, 2)
  const resultsDir = join(process.cwd(), 'test-results')
  
  try {
    writeFileSync(join(resultsDir, `performance-test-results-${timestamp}.json`), resultsJson)
    console.log(`\nWyniki zapisano w: test-results/performance-test-results-${timestamp}.json`)
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === 'ENOENT') {
      // Utwórz katalog jeśli nie istnieje
      mkdirSync(resultsDir, { recursive: true })
      writeFileSync(join(resultsDir, `performance-test-results-${timestamp}.json`), resultsJson)
      console.log(`\nWyniki zapisano w: test-results/performance-test-results-${timestamp}.json`)
    } else {
      throw error
    }
  }
  
  return results
}

// Eksportuj funkcje do użycia w konsoli przeglądarki
export const performanceTest = {
  runSingleTest: runTest,
  runAllTests
}
