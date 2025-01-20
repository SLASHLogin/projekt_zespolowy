import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { FixedSizeList as List } from 'react-window';
import { useAppState } from '../state/AppContext';
import { Expense } from '../state/AppState';
import ExpenseItem from './ExpenseItem';

const ITEM_HEIGHT = 200; // Stała wysokość elementu

const ExpenseList: React.FC = React.memo(() => {
  const appState = useAppState();
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState<Partial<Expense>>({});
  const [expenses, setExpenses] = useState<Expense[]>([]);

  useEffect(() => {
    setExpenses(appState.getExpenses());
    const unsubscribe = appState.subscribe(() => {
      setExpenses(appState.getExpenses());
    });
    return unsubscribe;
  }, [appState]);

  // Memoizacja danych, które nie zmieniają się często
  const currencies = useMemo(() => appState.getCurrencies(), [appState]);
  const participants = useMemo(() => appState.getParticipants(), [appState]);

  const handleDelete = useCallback((id: string) => {
    if (window.confirm('Czy na pewno chcesz usunąć ten wydatek?')) {
      appState.removeExpense(id);
    }
  }, [appState]);

  const handleEdit = useCallback((expense: Expense) => {
    setEditingId(expense.id);
    setEditForm(expense);
  }, []);

  const handleSave = useCallback(() => {
    if (editingId && editForm.amount && editForm.currency && editForm.payer && editForm.beneficiaries) {
      appState.updateExpense(editingId, editForm);
      setEditingId(null);
      setEditForm({});
    }
  }, [appState, editingId, editForm]);

  const handleCancel = useCallback(() => {
    setEditingId(null);
    setEditForm({});
  }, []);

  const handleEditFormChange = useCallback((form: Partial<Expense>) => {
    setEditForm(form);
  }, []);

  // Komponent renderujący pojedynczy element listy
  const Row = useCallback(({ index, style }: { index: number; style: React.CSSProperties }) => {
    const expense = expenses[index];
    return (
      <div style={style} className="list-group-item">
        <ExpenseItem
          expense={expense}
          isEditing={editingId === expense.id}
          editForm={editForm}
          participants={participants}
          currencies={currencies}
          onEdit={handleEdit}
          onDelete={handleDelete}
          onSave={handleSave}
          onCancel={handleCancel}
          onEditFormChange={handleEditFormChange}
        />
      </div>
    );
  }, [expenses, editingId, editForm, participants, currencies, handleEdit, handleDelete, handleSave, handleCancel, handleEditFormChange]);

  if (expenses.length === 0) {
    return (
      <div className="text-center text-muted">
        <p>Brak wydatków do wyświetlenia</p>
      </div>
    );
  }

  return (
    <List
      height={expenses.length * 200}
      itemCount={expenses.length}
      itemSize={ITEM_HEIGHT}
      width="100%"
      className="list-group"
    >
      {Row}
    </List>
  );
});

ExpenseList.displayName = 'ExpenseList';

export default ExpenseList;
