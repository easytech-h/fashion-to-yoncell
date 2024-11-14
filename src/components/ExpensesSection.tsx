import React, { useState } from 'react';
import { useExpenses } from '../context/ExpensesContext';
import { Plus, Trash2, Edit, FileText } from 'lucide-react';

const EXPENSE_CATEGORIES = [
  'Salaries',
  'Supplies',
  'Marketing',
  'Equipment',
  'Utilities',
  'Rent',
  'Other'
];

const ExpensesSection: React.FC = () => {
  const {
    expenses,
    addExpense,
    updateExpense,
    deleteExpense,
    getTotalExpenses,
    getExpensesByCategory
  } = useExpenses();

  const [newExpense, setNewExpense] = useState({
    description: '',
    amount: 0,
    date: new Date().toISOString().split('T')[0],
    category: 'Other',
    supplier: '',
    attachmentUrl: ''
  });

  const [editingId, setEditingId] = useState<string | null>(null);

  const handleAddExpense = async () => {
    await addExpense(newExpense);
    setNewExpense({
      description: '',
      amount: 0,
      date: new Date().toISOString().split('T')[0],
      category: 'Other',
      supplier: '',
      attachmentUrl: ''
    });
  };

  const handleDeleteExpense = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this expense?')) {
      await deleteExpense(id);
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setNewExpense({ ...newExpense, attachmentUrl: reader.result as string });
      };
      reader.readAsDataURL(file);
    }
  };

  const expensesByCategory = getExpensesByCategory();
  const totalExpenses = getTotalExpenses();

  return (
    <div className="mt-8">
      <h2 className="text-xl font-semibold mb-4">Expenses Management</h2>

      {/* Add New Expense Form */}
      <div className="bg-white p-4 rounded-lg shadow-md mb-6">
        <h3 className="text-lg font-medium mb-4">Add New Expense</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <input
            type="text"
            placeholder="Description"
            className="p-2 border rounded"
            value={newExpense.description}
            onChange={(e) => setNewExpense({ ...newExpense, description: e.target.value })}
          />
          <input
            type="number"
            placeholder="Amount"
            className="p-2 border rounded"
            value={newExpense.amount}
            onChange={(e) => setNewExpense({ ...newExpense, amount: parseFloat(e.target.value) || 0 })}
          />
          <input
            type="date"
            className="p-2 border rounded"
            value={newExpense.date}
            onChange={(e) => setNewExpense({ ...newExpense, date: e.target.value })}
          />
          <select
            className="p-2 border rounded"
            value={newExpense.category}
            onChange={(e) => setNewExpense({ ...newExpense, category: e.target.value })}
          >
            {EXPENSE_CATEGORIES.map(category => (
              <option key={category} value={category}>{category}</option>
            ))}
          </select>
          <input
            type="text"
            placeholder="Supplier"
            className="p-2 border rounded"
            value={newExpense.supplier}
            onChange={(e) => setNewExpense({ ...newExpense, supplier: e.target.value })}
          />
          <input
            type="file"
            accept="image/*,.pdf"
            className="p-2 border rounded"
            onChange={handleFileUpload}
          />
        </div>
        <button
          className="mt-4 bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600"
          onClick={handleAddExpense}
        >
          <Plus className="inline-block mr-2" size={18} />
          Add Expense
        </button>
      </div>

      {/* Expenses Summary */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        <div className="bg-white p-4 rounded-lg shadow-md">
          <h3 className="text-lg font-medium mb-4">Expenses by Category</h3>
          <div className="space-y-2">
            {Object.entries(expensesByCategory).map(([category, amount]) => (
              <div key={category} className="flex justify-between">
                <span>{category}</span>
                <span className="font-medium">HTG {amount.toFixed(2)}</span>
              </div>
            ))}
          </div>
          <div className="mt-4 pt-4 border-t">
            <div className="flex justify-between font-bold">
              <span>Total Expenses</span>
              <span>HTG {totalExpenses.toFixed(2)}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Expenses List */}
      <div className="bg-white rounded-lg shadow-md overflow-x-auto">
        <table className="min-w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Description</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Category</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Supplier</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Amount</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {expenses.map((expense) => (
              <tr key={expense.id}>
                <td className="px-6 py-4 whitespace-nowrap">{new Date(expense.date).toLocaleDateString()}</td>
                <td className="px-6 py-4">{expense.description}</td>
                <td className="px-6 py-4">{expense.category}</td>
                <td className="px-6 py-4">{expense.supplier}</td>
                <td className="px-6 py-4">HTG {expense.amount.toFixed(2)}</td>
                <td className="px-6 py-4">
                  <button
                    className="text-blue-600 hover:text-blue-900 mr-2"
                    onClick={() => setEditingId(expense.id)}
                  >
                    <Edit size={18} />
                  </button>
                  <button
                    className="text-red-600 hover:text-red-900 mr-2"
                    onClick={() => handleDeleteExpense(expense.id)}
                  >
                    <Trash2 size={18} />
                  </button>
                  {expense.attachmentUrl && (
                    <button
                      className="text-gray-600 hover:text-gray-900"
                      onClick={() => window.open(expense.attachmentUrl)}
                    >
                      <FileText size={18} />
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default ExpensesSection;