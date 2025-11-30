import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { 
  PlusCircle, TrendingUp, TrendingDown, DollarSign, 
  Trash2, Edit2, Filter, Download, PieChart 
} from 'lucide-react';

const API_URL = 'http://localhost:5000/api';

function App() {
  const [expenses, setExpenses] = useState([]);
  const [categories] = useState(['Food', 'Transport', 'Entertainment', 'Bills', 'Shopping', 'Health', 'Other']);
  const [filter, setFilter] = useState('all');
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [stats, setStats] = useState({ total: 0, thisMonth: 0, lastMonth: 0 });
  const [view, setView] = useState('list');
  const [loading, setLoading] = useState(false);
  
  const [formData, setFormData] = useState({
    amount: '',
    category: 'Food',
    description: '',
    date: new Date().toISOString().split('T')[0]
  });

  useEffect(() => {
    loadExpenses();
  }, []);

  useEffect(() => {
    calculateStats();
  }, [expenses]);

  const loadExpenses = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${API_URL}/expenses`);
      setExpenses(response.data);
    } catch (error) {
      console.error('Error loading expenses:', error);
      alert('Failed to load expenses');
    } finally {
      setLoading(false);
    }
  };

  const calculateStats = () => {
    const now = new Date();
    const thisMonth = now.getMonth();
    const lastMonth = thisMonth === 0 ? 11 : thisMonth - 1;
    
    const total = expenses.reduce((sum, exp) => sum + exp.amount, 0);
    const thisMonthTotal = expenses.filter(exp => {
      const expDate = new Date(exp.date);
      return expDate.getMonth() === thisMonth;
    }).reduce((sum, exp) => sum + exp.amount, 0);
    
    const lastMonthTotal = expenses.filter(exp => {
      const expDate = new Date(exp.date);
      return expDate.getMonth() === lastMonth;
    }).reduce((sum, exp) => sum + exp.amount, 0);

    setStats({ total, thisMonth: thisMonthTotal, lastMonth: lastMonthTotal });
  };

  const handleSubmit = async () => {
    if (!formData.amount || !formData.description) {
      alert('Please fill in all fields');
      return;
    }
    
    try {
      setLoading(true);
      if (editingId) {
        await axios.put(`${API_URL}/expenses/${editingId}`, formData);
        setEditingId(null);
      } else {
        await axios.post(`${API_URL}/expenses`, formData);
      }
      
      await loadExpenses();
      setFormData({
        amount: '',
        category: 'Food',
        description: '',
        date: new Date().toISOString().split('T')[0]
      });
      setShowForm(false);
    } catch (error) {
      console.error('Error saving expense:', error);
      alert('Failed to save expense');
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (expense) => {
    setFormData({
      amount: expense.amount.toString(),
      category: expense.category,
      description: expense.description,
      date: expense.date.split('T')[0]
    });
    setEditingId(expense._id);
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm('Delete this expense?')) {
      try {
        setLoading(true);
        await axios.delete(`${API_URL}/expenses/${id}`);
        await loadExpenses();
      } catch (error) {
        console.error('Error deleting expense:', error);
        alert('Failed to delete expense');
      } finally {
        setLoading(false);
      }
    }
  };

  const exportToCSV = () => {
    const headers = ['Date', 'Category', 'Description', 'Amount'];
    const rows = filteredExpenses.map(exp => [
      new Date(exp.date).toLocaleDateString(),
      exp.category,
      exp.description,
      exp.amount.toFixed(2)
    ]);
    
    const csv = [headers, ...rows].map(row => row.join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `expenses_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
  };

  const filteredExpenses = filter === 'all' 
    ? expenses 
    : expenses.filter(exp => exp.category === filter);

  const categoryTotals = categories.map(cat => ({
    category: cat,
    total: expenses.filter(exp => exp.category === cat).reduce((sum, exp) => sum + exp.amount, 0)
  })).filter(item => item.total > 0);

  const monthChange = stats.lastMonth > 0 
    ? ((stats.thisMonth - stats.lastMonth) / stats.lastMonth * 100).toFixed(1)
    : 0;

  return (
    <div style={{ minHeight: '100vh', background: 'linear-gradient(to bottom right, #dbeafe, #e0e7ff)', padding: '1rem' }}>
      <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
        
        {/* Header */}
        <header style={{ background: 'white', borderRadius: '0.5rem', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)', padding: '1.5rem', marginBottom: '1.5rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
            <div>
              <h1 style={{ fontSize: '2rem', fontWeight: 'bold', color: '#1f2937', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <DollarSign style={{ color: '#4f46e5' }} />
                Smart Expense Tracker
              </h1>
              <p style={{ color: '#6b7280', marginTop: '0.25rem' }}>Track, analyze, and optimize your spending</p>
            </div>
            <button
              onClick={() => setShowForm(!showForm)}
              style={{ 
                background: '#4f46e5', 
                color: 'white', 
                padding: '0.75rem 1.5rem', 
                borderRadius: '0.5rem', 
                border: 'none',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                fontSize: '1rem',
                fontWeight: '500'
              }}
            >
              <PlusCircle size={20} />
              Add Expense
            </button>
          </div>
        </header>

        {/* Stats Dashboard */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '1rem', marginBottom: '1.5rem' }}>
          <div style={{ background: 'white', borderRadius: '0.5rem', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)', padding: '1.5rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div>
                <p style={{ color: '#6b7280', fontSize: '0.875rem' }}>Total Expenses</p>
                <p style={{ fontSize: '2rem', fontWeight: 'bold', color: '#1f2937' }}>${stats.total.toFixed(2)}</p>
              </div>
              <DollarSign style={{ color: '#4f46e5' }} size={40} />
            </div>
          </div>

          <div style={{ background: 'white', borderRadius: '0.5rem', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)', padding: '1.5rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div>
                <p style={{ color: '#6b7280', fontSize: '0.875rem' }}>This Month</p>
                <p style={{ fontSize: '2rem', fontWeight: 'bold', color: '#1f2937' }}>${stats.thisMonth.toFixed(2)}</p>
              </div>
              <TrendingUp style={{ color: '#10b981' }} size={40} />
            </div>
          </div>

          <div style={{ background: 'white', borderRadius: '0.5rem', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)', padding: '1.5rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div>
                <p style={{ color: '#6b7280', fontSize: '0.875rem' }}>vs Last Month</p>
                <p style={{ fontSize: '2rem', fontWeight: 'bold', color: monthChange > 0 ? '#ef4444' : '#10b981' }}>
                  {monthChange > 0 ? '+' : ''}{monthChange}%
                </p>
              </div>
              {monthChange > 0 ? 
                <TrendingUp style={{ color: '#ef4444' }} size={40} /> : 
                <TrendingDown style={{ color: '#10b981' }} size={40} />
              }
            </div>
          </div>
        </div>

        {/* Add/Edit Form */}
        {showForm && (
          <div style={{ background: 'white', borderRadius: '0.5rem', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)', padding: '1.5rem', marginBottom: '1.5rem' }}>
            <h2 style={{ fontSize: '1.25rem', fontWeight: 'bold', color: '#1f2937', marginBottom: '1rem' }}>
              {editingId ? 'Edit Expense' : 'Add New Expense'}
            </h2>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: '500', color: '#374151', marginBottom: '0.5rem' }}>Amount ($)</label>
                <input
                  type="number"
                  step="0.01"
                  value={formData.amount}
                  onChange={(e) => setFormData({...formData, amount: e.target.value})}
                  style={{ width: '100%', padding: '0.5rem', border: '1px solid #d1d5db', borderRadius: '0.5rem', fontSize: '1rem' }}
                  placeholder="0.00"
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: '500', color: '#374151', marginBottom: '0.5rem' }}>Category</label>
                <select
                  value={formData.category}
                  onChange={(e) => setFormData({...formData, category: e.target.value})}
                  style={{ width: '100%', padding: '0.5rem', border: '1px solid #d1d5db', borderRadius: '0.5rem', fontSize: '1rem' }}
                >
                  {categories.map(cat => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: '500', color: '#374151', marginBottom: '0.5rem' }}>Date</label>
                <input
                  type="date"
                  value={formData.date}
                  onChange={(e) => setFormData({...formData, date: e.target.value})}
                  style={{ width: '100%', padding: '0.5rem', border: '1px solid #d1d5db', borderRadius: '0.5rem', fontSize: '1rem' }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: '500', color: '#374151', marginBottom: '0.5rem' }}>Description</label>
                <input
                  type="text"
                  value={formData.description}
                  onChange={(e) => setFormData({...formData, description: e.target.value})}
                  style={{ width: '100%', padding: '0.5rem', border: '1px solid #d1d5db', borderRadius: '0.5rem', fontSize: '1rem' }}
                  placeholder="What did you spend on?"
                />
              </div>
            </div>

            <div style={{ display: 'flex', gap: '0.75rem', marginTop: '1rem' }}>
              <button
                onClick={handleSubmit}
                disabled={loading}
                style={{ 
                  flex: 1, 
                  background: '#4f46e5', 
                  color: 'white', 
                  padding: '0.5rem', 
                  borderRadius: '0.5rem', 
                  border: 'none',
                  cursor: loading ? 'not-allowed' : 'pointer',
                  fontSize: '1rem',
                  opacity: loading ? 0.6 : 1
                }}
              >
                {loading ? 'Saving...' : (editingId ? 'Update Expense' : 'Add Expense')}
              </button>
              <button
                onClick={() => {
                  setShowForm(false);
                  setEditingId(null);
                  setFormData({
                    amount: '',
                    category: 'Food',
                    description: '',
                    date: new Date().toISOString().split('T')[0]
                  });
                }}
                style={{ 
                  padding: '0.5rem 1.5rem', 
                  background: '#e5e7eb', 
                  color: '#374151', 
                  borderRadius: '0.5rem', 
                  border: 'none',
                  cursor: 'pointer',
                  fontSize: '1rem'
                }}
              >
                Cancel
              </button>
            </div>
          </div>
        )}

        {/* View Toggle & Filters */}
        <div style={{ background: 'white', borderRadius: '0.5rem', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)', padding: '1rem', marginBottom: '1.5rem' }}>
          <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', gap: '1rem' }}>
            <div style={{ display: 'flex', gap: '0.5rem' }}>
              <button
                onClick={() => setView('list')}
                style={{ 
                  padding: '0.5rem 1rem', 
                  borderRadius: '0.5rem', 
                  border: 'none',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  background: view === 'list' ? '#4f46e5' : '#e5e7eb',
                  color: view === 'list' ? 'white' : '#374151'
                }}
              >
                <Filter size={18} />
                List
              </button>
              <button
                onClick={() => setView('chart')}
                style={{ 
                  padding: '0.5rem 1rem', 
                  borderRadius: '0.5rem', 
                  border: 'none',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems:'center',
gap: '0.5rem',
background: view === 'chart' ? '#4f46e5' : '#e5e7eb',
color: view === 'chart' ? 'white' : '#374151'
}}
>
<PieChart size={18} />
Charts
</button>
</div>
<div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
          <select
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            style={{ padding: '0.5rem 1rem', border: '1px solid #d1d5db', borderRadius: '0.5rem' }}
          >
            <option value="all">All Categories</option>
            {categories.map(cat => (
              <option key={cat} value={cat}>{cat}</option>
            ))}
          </select>
          <button
            onClick={exportToCSV}
            style={{ 
              padding: '0.5rem 1rem', 
              background: '#10b981', 
              color: 'white', 
              borderRadius: '0.5rem', 
              border: 'none',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem'
            }}
          >
            <Download size={18} />
            Export CSV
          </button>
        </div>
      </div>
    </div>

    {loading && <div style={{ textAlign: 'center', padding: '2rem', color: '#6b7280' }}>Loading...</div>}
    
    {!loading && view === 'list' && (
      <div style={{ background: 'white', borderRadius: '0.5rem', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)', overflow: 'hidden' }}>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead style={{ background: '#f9fafb' }}>
              <tr>
                <th style={{ padding: '0.75rem 1.5rem', textAlign: 'left', fontSize: '0.75rem', fontWeight: '500', color: '#6b7280', textTransform: 'uppercase' }}>Date</th>
                <th style={{ padding: '0.75rem 1.5rem', textAlign: 'left', fontSize: '0.75rem', fontWeight: '500', color: '#6b7280', textTransform: 'uppercase' }}>Category</th>
                <th style={{ padding: '0.75rem 1.5rem', textAlign: 'left', fontSize: '0.75rem', fontWeight: '500', color: '#6b7280', textTransform: 'uppercase' }}>Description</th>
                <th style={{ padding: '0.75rem 1.5rem', textAlign: 'left', fontSize: '0.75rem', fontWeight: '500', color: '#6b7280', textTransform: 'uppercase' }}>Amount</th>
                <th style={{ padding: '0.75rem 1.5rem', textAlign: 'left', fontSize: '0.75rem', fontWeight: '500', color: '#6b7280', textTransform: 'uppercase' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredExpenses.length === 0 ? (
                <tr>
                  <td colSpan="5" style={{ padding: '2rem', textAlign: 'center', color: '#6b7280' }}>
                    No expenses found. Add your first expense to get started!
                  </td>
                </tr>
              ) : (
                filteredExpenses.map(expense => (
                  <tr key={expense._id} style={{ borderTop: '1px solid #e5e7eb' }}>
                    <td style={{ padding: '1rem 1.5rem', fontSize: '0.875rem', color: '#374151', whiteSpace: 'nowrap' }}>
                      {new Date(expense.date).toLocaleDateString()}
                    </td>
                    <td style={{ padding: '1rem 1.5rem', whiteSpace: 'nowrap' }}>
                      <span style={{ padding: '0.25rem 0.75rem', fontSize: '0.75rem', fontWeight: '500', borderRadius: '9999px', background: '#e0e7ff', color: '#4f46e5' }}>
                        {expense.category}
                      </span>
                    </td>
                    <td style={{ padding: '1rem 1.5rem', fontSize: '0.875rem', color: '#374151' }}>{expense.description}</td>
                    <td style={{ padding: '1rem 1.5rem', fontSize: '0.875rem', fontWeight: 'bold', color: '#1f2937', whiteSpace: 'nowrap' }}>
                      ${expense.amount.toFixed(2)}
                    </td>
                    <td style={{ padding: '1rem 1.5rem', fontSize: '0.875rem', whiteSpace: 'nowrap' }}>
                      <div style={{ display: 'flex', gap: '0.5rem' }}>
                        <button
                          onClick={() => handleEdit(expense)}
                          style={{ color: '#3b82f6', background: 'none', border: 'none', cursor: 'pointer' }}
                        >
                          <Edit2 size={18} />
                        </button>
                        <button
                          onClick={() => handleDelete(expense._id)}
                          style={{ color: '#ef4444', background: 'none', border: 'none', cursor: 'pointer' }}
                        >
                          <Trash2 size={18} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    )}

    {!loading && view === 'chart' && (
      <div style={{ background: 'white', borderRadius: '0.5rem', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)', padding: '1.5rem' }}>
        <h2 style={{ fontSize: '1.25rem', fontWeight: 'bold', color: '#1f2937', marginBottom: '1.5rem' }}>Spending by Category</h2>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {categoryTotals.length === 0 ? (
            <p style={{ textAlign: 'center', color: '#6b7280' }}>No data to display</p>
          ) : (
            categoryTotals.map(item => {
              const percentage = (item.total / stats.total * 100).toFixed(1);
              return (
                <div key={item.category}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                    <span style={{ fontWeight: '500', color: '#374151' }}>{item.category}</span>
                    <span style={{ color: '#6b7280' }}>${item.total.toFixed(2)} ({percentage}%)</span>
                  </div>
                  <div style={{ width: '100%', background: '#e5e7eb', borderRadius: '9999px', height: '0.75rem' }}>
                    <div
                      style={{ 
                        background: '#4f46e5', 
                        height: '0.75rem', 
                        borderRadius: '9999px', 
                        width: `${percentage}%`,
                        transition: 'width 0.5s'
                      }}
                    />
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    )}
  </div>
</div>
);
}

export default App;
