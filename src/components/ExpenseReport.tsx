import React from 'react';
import { Document, Page, Text, View, StyleSheet, Font } from '@react-pdf/renderer';
import { useAppState } from '../state/AppContext';
import { Balance, Expense, Payment, Transfer } from '../state/AppState';

// Rejestracja czcionek z pełnym wsparciem dla polskich znaków
Font.register({
  family: 'RobotoRegular',
  src: 'https://cdnjs.cloudflare.com/ajax/libs/ink/3.1.10/fonts/Roboto/roboto-regular-webfont.ttf',
});

Font.register({
  family: 'RobotoBold',
  src: 'https://cdnjs.cloudflare.com/ajax/libs/ink/3.1.10/fonts/Roboto/roboto-bold-webfont.ttf',
});

// Definicja stylów dla dokumentu PDF
const styles = StyleSheet.create({
  page: {
    flexDirection: 'column',
    backgroundColor: '#ffffff',
    padding: 30,
    fontFamily: 'RobotoRegular',
  },
  section: {
    margin: 10,
    padding: 10,
    flexGrow: 1,
  },
  title: {
    fontSize: 24,
    marginBottom: 20,
    textAlign: 'center',
    fontFamily: 'RobotoBold',
  },
  subtitle: {
    fontSize: 18,
    marginBottom: 10,
    marginTop: 20,
    fontFamily: 'RobotoBold',
  },
  row: {
    flexDirection: 'row',
    marginBottom: 5,
  },
  cell: {
    flex: 1,
    padding: 5,
  },
  headerRow: {
    flexDirection: 'row',
    marginBottom: 5,
    backgroundColor: '#f0f0f0',
  },
  headerCell: {
    flex: 1,
    padding: 5,
    fontFamily: 'RobotoBold',
  },
  footer: {
    position: 'absolute',
    bottom: 30,
    left: 30,
    right: 30,
    textAlign: 'center',
    fontSize: 10,
    color: 'grey',
  },
});

interface ExpenseReportProps {
  startDate?: Date;
  endDate?: Date;
}

export const ExpenseReport: React.FC<ExpenseReportProps> = ({ startDate, endDate }) => {
  const state = useAppState();
  const expenses = state.getExpenses();
  const payments = state.getPayments();
  const participants = state.getParticipants();

  // Helper do zamiany ID na imię uczestnika
  const getParticipantName = (id: string): string => {
    const participant = participants.find(p => p.id === id);
    return participant ? participant.name : id;
  };

  // Filtrowanie wydatków według zakresu dat
  const filteredExpenses = expenses.filter((expense: Expense) => {
    if (!startDate && !endDate) return true;
    const expenseDate = new Date(expense.date);
    if (startDate && expenseDate < startDate) return false;
    if (endDate && expenseDate > endDate) return false;
    return true;
  });

  // Filtrowanie płatności według zakresu dat
  const filteredPayments = payments.filter((payment: Payment) => {
    if (!startDate && !endDate) return true;
    const paymentDate = new Date(payment.date);
    if (startDate && paymentDate < startDate) return false;
    if (endDate && paymentDate > endDate) return false;
    return true;
  });

  // Obliczanie bilansu i optymalnych transferów
  const balances: Record<string, Record<string, number>> = {};
  state.calculateBalances().forEach((balance: Balance) => {
    balances[balance.participantId] = {
      PLN: balance.netBalance
    };
  });
  
  const transfers = state.calculateTransfers();

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        <View style={styles.section}>
          <Text style={styles.title}>Raport rozliczeń</Text>
          
          {/* Zakres dat */}
          <Text style={styles.subtitle}>Zakres dat</Text>
          <View style={styles.row}>
            <Text>
              {startDate ? startDate.toLocaleDateString() : 'Początek'} - {endDate ? endDate.toLocaleDateString() : 'Koniec'}
            </Text>
          </View>

          {/* Bilanse */}
          <Text style={styles.subtitle}>Bilanse</Text>
          {Object.entries(balances).map(([personId, balance]) => (
            <View key={personId} style={styles.row}>
              <Text style={styles.cell}>{getParticipantName(personId)}</Text>
              <Text style={styles.cell}>
                {Object.entries(balance)
                  .map(([currency, amount]) => `${amount.toFixed(2)} ${currency}`)
                  .join(', ')}
              </Text>
            </View>
          ))}

          {/* Optymalne transfery */}
          <Text style={styles.subtitle}>Sugerowane przelewy</Text>
          {transfers.map((transfer: Transfer, index: number) => (
            <View key={index} style={styles.row}>
              <Text style={styles.cell}>
                {`${getParticipantName(transfer.from)} przekazuje ${getParticipantName(transfer.to)}: ${transfer.amount.toFixed(2)} PLN`}
              </Text>
            </View>
          ))}

          {/* Lista wydatków */}
          <Text style={styles.subtitle}>Lista wydatków</Text>
          <View style={styles.headerRow}>
            <Text style={styles.headerCell}>Data</Text>
            <Text style={styles.headerCell}>Opis</Text>
            <Text style={styles.headerCell}>Kwota</Text>
            <Text style={styles.headerCell}>Płatnik</Text>
          </View>
          {filteredExpenses.map((expense: Expense, index: number) => (
            <View key={index} style={styles.row}>
              <Text style={styles.cell}>{new Date(expense.date).toLocaleDateString()}</Text>
              <Text style={styles.cell}>{expense.description}</Text>
              <Text style={styles.cell}>{`${expense.amount} ${expense.currency}`}</Text>
              <Text style={styles.cell}>{getParticipantName(expense.payer)}</Text>
            </View>
          ))}

          {/* Lista płatności */}
          <Text style={styles.subtitle}>Historia spłat</Text>
          <View style={styles.headerRow}>
            <Text style={styles.headerCell}>Data</Text>
            <Text style={styles.headerCell}>Od</Text>
            <Text style={styles.headerCell}>Do</Text>
            <Text style={styles.headerCell}>Kwota</Text>
          </View>
          {filteredPayments.map((payment: Payment, index: number) => (
            <View key={index} style={styles.row}>
              <Text style={styles.cell}>{new Date(payment.date).toLocaleDateString()}</Text>
              <Text style={styles.cell}>{getParticipantName(payment.from)}</Text>
              <Text style={styles.cell}>{getParticipantName(payment.to)}</Text>
              <Text style={styles.cell}>{`${payment.amount} ${payment.currency}`}</Text>
            </View>
          ))}
        </View>

        {/* Stopka */}
        <Text style={styles.footer}>
          Wygenerowano: {new Date().toLocaleString()}
        </Text>
      </Page>
    </Document>
  );
};
