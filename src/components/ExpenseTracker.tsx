import { useState } from 'react';
import './ExpenseTracker.css';
import CreditCardManager from './CreditCardManager';

interface Expense {
  id: number;
  amount: number;
  description: string;
  date: string;
  category: string;
}

interface CreditCard {
  id: number;
  name: string;
  bank: string;
  limit: number;
  currentDebt: number;
  currentBalance: number;
  statementDate: number;
  dueDate: number;
  cardType: 'bireysel' | 'ticari';
  minimumPayment: number;
  color: string;
}

interface Payment {
  id: number;
  cardId: number;
  amount: number;
  description: string;
  date: string;
  type: 'payment' | 'expense';
}

const ExpenseTracker = () => {
  const [activeTab, setActiveTab] = useState('expenses');
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [creditCards, setCreditCards] = useState<CreditCard[]>([]);
  const [payments, setPayments] = useState<Payment[]>([]);
  const [amount, setAmount] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('genel');

  // Yaklaşan borç ödeme bildirimlerini kontrol et
  const getUpcomingPaymentNotifications = () => {
    const today = new Date();
    const notifications: string[] = [];

    creditCards.forEach(card => {
      const currentMonth = today.getMonth();
      const currentYear = today.getFullYear();
      
      // Bu ayın son ödeme tarihi
      const dueDate = new Date(currentYear, currentMonth, card.dueDate);
      const timeDiff = dueDate.getTime() - today.getTime();
      const daysDiff = Math.ceil(timeDiff / (1000 * 3600 * 24));

      if (daysDiff <= 3 && daysDiff >= 0 && card.currentDebt > 0) {
        notifications.push(
          `⚠️ ${card.name} kartınızın son ödeme tarihi ${daysDiff === 0 ? 'bugün' : `${daysDiff} gün sonra`}! Borç: ₺${card.currentDebt.toLocaleString('tr-TR')}`
        );
      }
    });

    return notifications;
  };

  const categories = [
    { value: 'market', label: '🛒 Market', color: '#4CAF50' },
    { value: 'ulaşım', label: '🚗 Ulaşım', color: '#2196F3' },
    { value: 'faturalar', label: '📄 Faturalar', color: '#FF9800' },
    { value: 'yemek', label: '🍽️ Yemek', color: '#F44336' },
    { value: 'giyim', label: '👔 Giyim', color: '#9C27B0' },
    { value: 'sağlık', label: '⚕️ Sağlık', color: '#00BCD4' },
    { value: 'eğlence', label: '🎮 Eğlence', color: '#FFEB3B' },
    { value: 'genel', label: '📋 Genel', color: '#607D8B' }
  ];

  const addExpense = () => {
    if (amount && description.trim()) {
      const newExpense: Expense = {
        id: Date.now(),
        amount: parseFloat(amount),
        description: description.trim(),
        date: new Date().toLocaleDateString('tr-TR'),
        category
      };
      setExpenses([...expenses, newExpense]);
      setAmount('');
      setDescription('');
    }
  };

  const deleteExpense = (id: number) => {
    setExpenses(expenses.filter(expense => expense.id !== id));
  };

  const totalExpense = expenses.reduce((acc, curr) => acc + curr.amount, 0);
  
  const getCategoryInfo = (categoryValue: string) => {
    return categories.find(cat => cat.value === categoryValue) || categories[categories.length - 1];
  };

  const currentMonth = new Date().toLocaleDateString('tr-TR', { 
    month: 'long', 
    year: 'numeric' 
  });

  const upcomingPayments = getUpcomingPaymentNotifications();

  return (
    <div className="expense-tracker">
      <div className="header">
        <h1>💰 Finansal Takip Sistemi</h1>
        <p className="month">{currentMonth}</p>
      </div>

      {/* Yaklaşan Ödeme Bildirimleri */}
      {upcomingPayments.length > 0 && (
        <div className="notifications-panel">
          <h3>🔔 Yaklaşan Ödemeler</h3>
          {upcomingPayments.map((notification, index) => (
            <div key={index} className="notification-item warning">
              {notification}
            </div>
          ))}
        </div>
      )}

      {/* Tab Navigation */}
      <div className="tab-navigation">
        <button 
          className={`tab-button ${activeTab === 'expenses' ? 'active' : ''}`}
          onClick={() => setActiveTab('expenses')}
        >
          📊 Giderler
        </button>
        <button 
          className={`tab-button ${activeTab === 'cards' ? 'active' : ''}`}
          onClick={() => setActiveTab('cards')}
        >
          💳 Kredi Kartları
        </button>
      </div>

      {/* Tab Content */}
      {activeTab === 'expenses' ? (
        <>
          <div className="summary-card">
            <div className="total-amount">
              <span className="currency">₺</span>
              <span className="amount">{totalExpense.toLocaleString('tr-TR', { minimumFractionDigits: 2 })}</span>
            </div>
            <p className="summary-text">Bu ay toplam harcamanız</p>
            <div className="expense-count">
              {expenses.length} adet gider kaydı
            </div>
          </div>

          <div className="add-expense-form">
            <h3>➕ Yeni Gider Ekle</h3>
            
            <div className="form-group">
              <label>Açıklama</label>
              <input
                type="text"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Gider açıklaması..."
                className="description-input"
              />
            </div>

            <div className="form-row">
              <div className="form-group">
                <label>Miktar</label>
                <input
                  type="number"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  placeholder="0.00"
                  className="amount-input"
                  step="0.01"
                />
              </div>

              <div className="form-group">
                <label>Kategori</label>
                <select 
                  value={category} 
                  onChange={(e) => setCategory(e.target.value)}
                  className="category-select"
                >
                  {categories.map(cat => (
                    <option key={cat.value} value={cat.value}>
                      {cat.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <button onClick={addExpense} className="add-button">
              ✅ Gider Ekle
            </button>
          </div>

          <div className="expenses-list">
            <h3>📋 Giderler Listesi</h3>
            {expenses.length === 0 ? (
              <div className="empty-state">
                <p>Henüz gider kaydınız bulunmuyor.</p>
                <p>Yukarıdaki formu kullanarak ilk giderinizi ekleyebilirsiniz.</p>
              </div>
            ) : (
              <div className="expense-items">
                {expenses.map((expense) => {
                  const categoryInfo = getCategoryInfo(expense.category);
                  return (
                    <div key={expense.id} className="expense-item">
                      <div className="expense-content">
                        <div className="expense-header">
                          <span 
                            className="category-badge"
                            style={{ backgroundColor: categoryInfo.color }}
                          >
                            {categoryInfo.label}
                          </span>
                          <span className="expense-date">{expense.date}</span>
                        </div>
                        <div className="expense-description">{expense.description}</div>
                        <div className="expense-amount">
                          ₺{expense.amount.toLocaleString('tr-TR', { minimumFractionDigits: 2 })}
                        </div>
                      </div>
                      <button 
                        onClick={() => deleteExpense(expense.id)}
                        className="delete-button"
                        title="Sil"
                      >
                        🗑️
                      </button>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </>
      ) : (
        <CreditCardManager 
          cards={creditCards}
          payments={payments}
          setCards={setCreditCards}
          setPayments={setPayments}
        />
      )}
    </div>
  );
};

export default ExpenseTracker;
