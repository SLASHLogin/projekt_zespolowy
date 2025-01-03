import { performanceTest } from './performanceTest'

console.log('Uruchamiam testy wydajności...')
performanceTest.runAllTests().catch(console.error)
