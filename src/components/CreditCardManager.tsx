import { useState, useEffect } from 'react';
import './CreditCardManager.css';

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

interface CreditCardManagerProps {
  cards: CreditCard[];
  payments: Payment[];
  setCards: React.Dispatch<React.SetStateAction<CreditCard[]>>;
  setPayments: React.Dispatch<React.SetStateAction<Payment[]>>;
}

const CreditCardManager = ({ cards, payments, setCards, setPayments }: CreditCardManagerProps) => {
  const [activeSubTab, setActiveSubTab] = useState('overview');
  const [showAddCard, setShowAddCard] = useState(false);
  const [notifications, setNotifications] = useState<string[]>([]);
  const [notificationDays, setNotificationDays] = useState(3);

  // Custom banka adı için state'ler
  const [customBankName, setCustomBankName] = useState('');
  const [editCustomBankName, setEditCustomBankName] = useState('');

  // Yeni kart formu state'leri
  const [newCard, setNewCard] = useState({
    name: '',
    bank: '',
    limit: '',
    currentDebt: '',
    minimumPayment: '',
    cardType: 'bireysel' as 'bireysel' | 'ticari',
    statementDate: '',
    dueDate: '',
    color: '#667eea'
  });

  // Ödeme formu state'leri
  const [selectedCardId, setSelectedCardId] = useState<number | null>(null);
  const [paymentAmount, setPaymentAmount] = useState('');
  const [paymentDescription, setPaymentDescription] = useState('');
  const [paymentType, setPaymentType] = useState<'payment' | 'expense'>('expense');
  
  // Düzenleme formu state'leri
  const [editingCardId, setEditingCardId] = useState<number | null>(null);
  const [editCard, setEditCard] = useState({
    name: '',
    bank: '',
    limit: '',
    currentDebt: '',
    minimumPayment: '',
    cardType: 'bireysel' as 'bireysel' | 'ticari',
    statementDate: '',
    dueDate: '',
    color: '#667eea'
  });

  const banks = [
    'Akbank', 'Garanti BBVA', 'İş Bankası', 'Yapı Kredi', 'Ziraat Bankası',
    'Halkbank', 'VakıfBank', 'QNB Finansbank', 'DenizBank', 'TEB', 'İNG Bank',
    'HSBC', 'Citibank', 'Anadolubank', 'Şekerbank', 'Fibabanka', 'Odeabank',
    'Diğer'
  ];

  const cardColors = [
    '#667eea', '#764ba2', '#f093fb', '#f5576c', '#4facfe', '#00f2fe',
    '#43e97b', '#38f9d7', '#ffecd2', '#fcb69f', '#a8edea', '#fed6e3'
  ];

  // Bildirimler için kontrol
  useEffect(() => {
    checkDueDates();
  }, [cards, payments, notificationDays]);

  const checkDueDates = () => {
    const today = new Date();
    const newNotifications: string[] = [];

    cards.forEach(card => {
      const currentMonth = today.getMonth();
      const currentYear = today.getFullYear();
      
      const dueDate = new Date(currentYear, currentMonth, card.dueDate);
      const timeDiff = dueDate.getTime() - today.getTime();
      const daysDiff = Math.ceil(timeDiff / (1000 * 3600 * 24));

      if (daysDiff <= notificationDays && daysDiff >= 0 && card.currentDebt > 0) {
        newNotifications.push(
          `⚠️ ${card.name} kartınızın son ödeme tarihi ${daysDiff === 0 ? 'bugün' : `${daysDiff} gün sonra`}! Borç: ₺${card.currentDebt.toLocaleString('tr-TR')}`
        );
      }
    });

    setNotifications(newNotifications);
  };

  // Ödeme özet hesaplamaları
  const getPaymentSummary = () => {
    const today = new Date();
    const thisMonth = today.getMonth();
    const thisYear = today.getFullYear();
    
    let totalMinimumPayment = 0;
    let totalCurrentDebt = 0;
    let upcomingPayments: any[] = [];
    
    cards.forEach(card => {
      if (card.currentDebt > 0) {
        totalMinimumPayment += card.minimumPayment;
        totalCurrentDebt += card.currentDebt;
        
        const dueDate = new Date(thisYear, thisMonth, card.dueDate);
        const timeDiff = dueDate.getTime() - today.getTime();
        const daysDiff = Math.ceil(timeDiff / (1000 * 3600 * 24));
        
        upcomingPayments.push({
          ...card,
          daysLeft: daysDiff,
          dueDate: dueDate,
          isPastDue: daysDiff < 0,
          isUrgent: daysDiff <= 3 && daysDiff >= 0
        });
      }
    });
    
    upcomingPayments.sort((a, b) => a.daysLeft - b.daysLeft);
    
    return {
      totalMinimumPayment,
      totalCurrentDebt,
      upcomingPayments,
      cardsWithDebt: cards.filter(card => card.currentDebt > 0).length
    };
  };

  // Aylık takvim verisi oluştur
  const getMonthlyCalendar = () => {
    const today = new Date();
    const currentMonth = today.getMonth();
    const currentYear = today.getFullYear();
    const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
    
    const calendarData: any[] = [];
    
    for (let day = 1; day <= daysInMonth; day++) {
      const dayCards = cards.filter(card => 
        card.dueDate === day && card.currentDebt > 0
      );
      
      const totalDue = dayCards.reduce((sum, card) => sum + card.minimumPayment, 0);
      
      calendarData.push({
        day,
        cards: dayCards,
        totalDue,
        isToday: day === today.getDate(),
        isPastDue: day < today.getDate()
      });
    }
    
    return calendarData;
  };

  // Aylık istatistikler
  const getMonthlyStats = () => {
    const today = new Date();
    const thisMonth = today.getMonth();
    const thisYear = today.getFullYear();
    
    const thisMonthPayments = payments.filter(payment => {
      const paymentDate = new Date(payment.date.split('.').reverse().join('-'));
      return paymentDate.getMonth() === thisMonth && paymentDate.getFullYear() === thisYear;
    });
    
    const totalExpenses = thisMonthPayments
      .filter(p => p.type === 'expense')
      .reduce((sum, p) => sum + p.amount, 0);
    
    const totalPayments = thisMonthPayments
      .filter(p => p.type === 'payment')
      .reduce((sum, p) => sum + p.amount, 0);
    
    const cardStats = cards.map(card => {
      const cardPayments = thisMonthPayments.filter(p => p.cardId === card.id);
      const totalAmount = cardPayments.reduce((sum, p) => sum + p.amount, 0);
      
      return {
        cardId: card.id,
        cardName: card.name,
        totalAmount,
        transactionCount: cardPayments.length
      };
    }).sort((a, b) => b.totalAmount - a.totalAmount);
    
    return {
      totalExpenses,
      totalPayments,
      transactionCount: thisMonthPayments.length,
      cardStats
    };
  };

  // Toplu ödeme fonksiyonu
  const payAllMinimums = () => {
    const today = new Date().toLocaleDateString('tr-TR');
    const newPayments: any[] = [];
    
    const updatedCards = cards.map(card => {
      if (card.currentDebt > 0 && card.minimumPayment > 0) {
        const paymentAmount = Math.min(card.minimumPayment, card.currentDebt);
        
        newPayments.push({
          id: Date.now() + card.id,
          cardId: card.id,
          amount: paymentAmount,
          description: 'Asgari ödeme - Toplu ödeme',
          date: today,
          type: 'payment'
        });
        
        return {
          ...card,
          currentDebt: Math.max(0, card.currentDebt - paymentAmount),
          currentBalance: card.limit - Math.max(0, card.currentDebt - paymentAmount)
        };
      }
      return card;
    });
    
    setCards(updatedCards);
    setPayments([...payments, ...newPayments]);
    
    alert(`${newPayments.length} kartın asgari ödemesi yapıldı!`);
  };

  const startEditCard = (card: CreditCard) => {
    setEditingCardId(card.id);
    
    // Eğer banka adı standart listede yoksa "Diğer" olarak ayarla ve custom banka adını doldur
    const isStandardBank = banks.includes(card.bank) && card.bank !== 'Diğer';
    
    setEditCard({
      name: card.name,
      bank: isStandardBank ? card.bank : 'Diğer',
      limit: card.limit.toString(),
      currentDebt: card.currentDebt.toString(),
      minimumPayment: card.minimumPayment.toString(),
      cardType: card.cardType,
      statementDate: card.statementDate.toString(),
      dueDate: card.dueDate.toString(),
      color: card.color
    });
    
    // Eğer standart banka değilse custom banka adını ayarla
    setEditCustomBankName(isStandardBank ? '' : card.bank);
  };

  const updateCard = () => {
    if (editingCardId && editCard.name && editCard.bank && editCard.limit && editCard.statementDate && editCard.dueDate) {
      // Eğer "Diğer" seçilmişse ve custom banka adı girilmişse onu kullan
      const bankName = editCard.bank === 'Diğer' ? editCustomBankName.trim() : editCard.bank;
      
      // Custom banka adı kontrolü
      if (editCard.bank === 'Diğer' && !editCustomBankName.trim()) {
        alert('Lütfen banka adını girin.');
        return;
      }
      
      const limit = parseFloat(editCard.limit);
      const currentDebt = editCard.currentDebt ? parseFloat(editCard.currentDebt) : 0;
      const currentBalance = limit - currentDebt;
      const minimumPayment = editCard.minimumPayment ? parseFloat(editCard.minimumPayment) : 0;

      setCards(cards.map(card => {
        if (card.id === editingCardId) {
          return {
            ...card,
            name: editCard.name,
            bank: bankName,
            limit: limit,
            currentDebt: currentDebt,
            currentBalance: currentBalance,
            cardType: editCard.cardType,
            minimumPayment: minimumPayment,
            statementDate: parseInt(editCard.statementDate),
            dueDate: parseInt(editCard.dueDate),
            color: editCard.color
          };
        }
        return card;
      }));

      setEditingCardId(null);
      setEditCard({
        name: '',
        bank: '',
        limit: '',
        currentDebt: '',
        minimumPayment: '',
        cardType: 'bireysel',
        statementDate: '',
        dueDate: '',
        color: '#667eea'
      });
      setEditCustomBankName(''); // Custom banka adını sıfırla
    }
  };

  const cancelEdit = () => {
    setEditingCardId(null);
    setEditCard({
      name: '',
      bank: '',
      limit: '',
      currentDebt: '',
      minimumPayment: '',
      cardType: 'bireysel',
      statementDate: '',
      dueDate: '',
      color: '#667eea'
    });
    setEditCustomBankName(''); // Custom banka adını sıfırla
  };

  const addCard = () => {
    if (newCard.name && newCard.bank && newCard.limit && newCard.statementDate && newCard.dueDate) {
      // Eğer "Diğer" seçilmişse ve custom banka adı girilmişse onu kullan
      const bankName = newCard.bank === 'Diğer' ? customBankName.trim() : newCard.bank;
      
      // Custom banka adı kontrolü
      if (newCard.bank === 'Diğer' && !customBankName.trim()) {
        alert('Lütfen banka adını girin.');
        return;
      }
      
      const limit = parseFloat(newCard.limit);
      const currentDebt = newCard.currentDebt ? parseFloat(newCard.currentDebt) : 0;
      const currentBalance = limit - currentDebt;
      const minimumPayment = newCard.minimumPayment ? parseFloat(newCard.minimumPayment) : 0;

      const card: CreditCard = {
        id: Date.now(),
        name: newCard.name,
        bank: bankName,
        limit: limit,
        currentDebt: currentDebt,
        currentBalance: currentBalance,
        cardType: newCard.cardType,
        minimumPayment: minimumPayment,
        statementDate: parseInt(newCard.statementDate),
        dueDate: parseInt(newCard.dueDate),
        color: newCard.color
      };

      setCards([...cards, card]);
      setNewCard({
        name: '',
        bank: '',
        limit: '',
        currentDebt: '',
        minimumPayment: '',
        cardType: 'bireysel',
        statementDate: '',
        dueDate: '',
        color: '#667eea'
      });
      setCustomBankName(''); // Custom banka adını sıfırla
      setShowAddCard(false);
    }
  };

  const addPayment = () => {
    if (selectedCardId && paymentAmount && paymentAmount.trim() !== '') {
      const amount = parseFloat(paymentAmount);
      const description = paymentDescription.trim() || (paymentType === 'payment' ? 'Kart ödemesi' : 'Kart harcaması');
      
      const payment: Payment = {
        id: Date.now(),
        cardId: selectedCardId,
        amount,
        description: description,
        date: new Date().toLocaleDateString('tr-TR'),
        type: paymentType
      };

      setPayments([...payments, payment]);

      const updatedCards = cards.map(card => {
        if (card.id === selectedCardId) {
          const newDebt = paymentType === 'payment' 
            ? Math.max(0, card.currentDebt - amount)
            : card.currentDebt + amount;
          const newBalance = card.limit - newDebt;
          
          return { 
            ...card, 
            currentDebt: newDebt,
            currentBalance: newBalance
          };
        }
        return card;
      });
      
      setCards(updatedCards);
      setPaymentAmount('');
      setPaymentDescription('');
      setSelectedCardId(null);
    }
  };

  const deleteCard = (id: number) => {
    setCards(cards.filter(card => card.id !== id));
    setPayments(payments.filter(payment => payment.cardId !== id));
  };

  const getUtilizationPercentage = (card: CreditCard) => {
    return (card.currentDebt / card.limit) * 100;
  };

  // Özet bölümünü render et
  const renderOverviewSection = () => {
    const summary = getPaymentSummary();
    
    return (
      <>
        <div className="notification-settings">
          <h3>🔔 Bildirim Ayarları</h3>
          <div className="setting-item">
            <label>Kaç gün öncesinden bildirim alsın?</label>
            <select 
              value={notificationDays} 
              onChange={(e) => setNotificationDays(parseInt(e.target.value))}
            >
              <option value={1}>1 gün öncesi</option>
              <option value={3}>3 gün öncesi</option>
              <option value={7}>7 gün öncesi</option>
              <option value={15}>15 gün öncesi</option>
            </select>
          </div>
        </div>

        <div className="summary-cards">
          <div className="summary-card total-debt">
            <div className="summary-icon">💳</div>
            <div className="summary-content">
              <h4>Toplam Borç</h4>
              <p className="summary-amount">₺{summary.totalCurrentDebt.toLocaleString('tr-TR')}</p>
              <span className="summary-detail">{summary.cardsWithDebt} kart</span>
            </div>
          </div>

          <div className="summary-card minimum-payment">
            <div className="summary-icon">📊</div>
            <div className="summary-content">
              <h4>Toplam Asgari Ödeme</h4>
              <p className="summary-amount">₺{summary.totalMinimumPayment.toLocaleString('tr-TR')}</p>
              <span className="summary-detail">Bu ay</span>
            </div>
          </div>

          <div className="summary-card urgent-payments">
            <div className="summary-icon">⚠️</div>
            <div className="summary-content">
              <h4>Acil Ödemeler</h4>
              <p className="summary-amount">{summary.upcomingPayments.filter(p => p.isUrgent).length}</p>
              <span className="summary-detail">Yaklaşan ödeme</span>
            </div>
          </div>
        </div>

        <div className="quick-actions">
          <h3>⚡ Hızlı Eylemler</h3>
          <div className="action-buttons">
            <button onClick={payAllMinimums} className="action-btn pay-all">
              💰 Tüm Asgari Ödemeleri Yap
            </button>
            <button onClick={() => setActiveSubTab('calendar')} className="action-btn view-calendar">
              📅 Ödeme Takvimini Gör
            </button>
            <button onClick={() => setShowAddCard(true)} className="action-btn add-card">
              ➕ Yeni Kart Ekle
            </button>
          </div>
        </div>

        <div className="upcoming-payments">
          <h3>📋 Yaklaşan Ödemeler</h3>
          {summary.upcomingPayments.length === 0 ? (
            <div className="no-payments">
              <p>🎉 Hiç yaklaşan ödeme yok!</p>
            </div>
          ) : (
            <div className="payment-list">
              {summary.upcomingPayments.slice(0, 10).map((payment) => (
                <div key={payment.id} className={`payment-item ${payment.isUrgent ? 'urgent' : ''} ${payment.isPastDue ? 'past-due' : ''}`}>
                  <div className="payment-card-info">
                    <div className="card-name">{payment.name}</div>
                    <div className="card-bank">{payment.bank}</div>
                  </div>
                  <div className="payment-details">
                    <div className="payment-amount">₺{payment.minimumPayment.toLocaleString('tr-TR')}</div>
                    <div className="payment-date">
                      {payment.isPastDue ? '❌ Gecikmiş' : 
                       payment.daysLeft === 0 ? '🔥 Bugün' :
                       `📅 ${payment.daysLeft} gün kaldı`}
                    </div>
                  </div>
                  <div className="payment-actions">
                    <button onClick={() => {
                      setSelectedCardId(payment.id);
                      setPaymentType('payment');
                      setPaymentAmount(payment.minimumPayment.toString());
                    }} className="quick-pay-btn">
                      💸 Öde
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </>
    );
  };

  // Takvim bölümünü render et
  const renderCalendarSection = () => {
    const calendarData = getMonthlyCalendar();
    const today = new Date();
    const currentMonth = today.toLocaleDateString('tr-TR', { month: 'long', year: 'numeric' });
    
    return (
      <>
        <div className="calendar-header">
          <h3>📅 {currentMonth} Ödeme Takvimi</h3>
        </div>

        <div className="calendar-grid">
          {calendarData.map(day => (
            <div key={day.day} className={`calendar-day ${day.isToday ? 'today' : ''} ${day.isPastDue ? 'past-due' : ''} ${day.cards.length > 0 ? 'has-payments' : ''}`}>
              <div className="day-number">{day.day}</div>
              
              {day.cards.length > 0 && (
                <>
                  <div className="day-total">₺{day.totalDue.toLocaleString('tr-TR')}</div>
                  <div className="day-cards">
                    {day.cards.map((card: CreditCard) => (
                      <div key={card.id} className="calendar-card" style={{borderColor: card.color}}>
                        <div className="card-name-short">{card.name.substring(0, 8)}...</div>
                        <div className="card-amount">₺{card.minimumPayment.toLocaleString('tr-TR')}</div>
                      </div>
                    ))}
                  </div>
                </>
              )}
            </div>
          ))}
        </div>

        <div className="calendar-legend">
          <div className="legend-item">
            <div className="legend-color today"></div>
            <span>Bugün</span>
          </div>
          <div className="legend-item">
            <div className="legend-color has-payments"></div>
            <span>Ödeme var</span>
          </div>
          <div className="legend-item">
            <div className="legend-color past-due"></div>
            <span>Gecikmiş</span>
          </div>
        </div>
      </>
    );
  };

  // Kartlar bölümünü render et
  const renderCardsSection = () => {
    return (
      <>
        {notifications.length > 0 && (
          <div className="notifications">
            {notifications.map((notification, index) => (
              <div key={index} className="notification warning">
                {notification}
              </div>
            ))}
          </div>
        )}

        <div className="add-card-section">
          <button 
            onClick={() => setShowAddCard(!showAddCard)}
            className="add-card-button"
          >
            💳 Yeni Kart Ekle
          </button>
        </div>

        {showAddCard && renderAddCardForm()}

        <div className="cards-grid">
          {cards.map(card => {
            const utilizationPercentage = getUtilizationPercentage(card);
            
            return (
              <div key={card.id} className="credit-card" style={{borderLeft: `5px solid ${card.color}`}}>
                <div className="card-header">
                  <div className="card-info">
                    <h4>{card.name}</h4>
                    <p>{card.bank}</p>
                  </div>
                  <button 
                    onClick={() => deleteCard(card.id)}
                    className="delete-card-button"
                    title="Kartı Sil"
                  >
                    🗑️
                  </button>
                </div>

                <div className="card-details">
                  <div className="card-type-badge">
                    {card.cardType === 'bireysel' ? '🏠 Bireysel' : '🏢 Ticari'}
                  </div>
                  
                  <div className="limit-info">
                    <div className="total-limit">
                      <span>Toplam Limit:</span>
                      <strong>₺{card.limit.toLocaleString('tr-TR')}</strong>
                    </div>
                    <div className="current-debt">
                      <span>Mevcut Borç:</span>
                      <strong style={{color: card.currentDebt > 0 ? '#e74c3c' : '#27ae60'}}>
                        ₺{card.currentDebt.toLocaleString('tr-TR')}
                      </strong>
                    </div>
                    <div className="available-limit">
                      <span>Kullanılabilir Bakiye:</span>
                      <strong style={{color: card.currentBalance > 0 ? '#27ae60' : '#e74c3c'}}>
                        ₺{card.currentBalance.toLocaleString('tr-TR')}
                      </strong>
                    </div>
                    <div className="minimum-payment">
                      <span>Asgari Ödeme:</span>
                      <strong style={{color: '#f39c12'}}>
                        ₺{card.minimumPayment.toLocaleString('tr-TR')}
                      </strong>
                    </div>
                  </div>

                  <div className="utilization-bar">
                    <div className="utilization-label">
                      Kullanım Oranı: %{utilizationPercentage.toFixed(1)}
                    </div>
                    <div className="progress-bar">
                      <div 
                        className="progress-fill"
                        style={{
                          width: `${Math.min(utilizationPercentage, 100)}%`,
                          backgroundColor: utilizationPercentage > 80 ? '#e74c3c' : 
                                         utilizationPercentage > 60 ? '#f39c12' : '#27ae60'
                        }}
                      ></div>
                    </div>
                  </div>

                  <div className="card-dates">
                    <div>📅 Kesim: Her ayın {card.statementDate}. günü</div>
                    <div>⏰ Son Ödeme: Her ayın {card.dueDate}. günü</div>
                  </div>

                  <div className="card-actions">
                    <button 
                      onClick={() => setSelectedCardId(card.id)}
                      className="action-button payment-button"
                    >
                      💳 İşlem Yap
                    </button>
                    <button 
                      onClick={() => startEditCard(card)}
                      className="action-button edit-button"
                    >
                      ✏️ Düzenle
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {cards.length === 0 && (
          <div className="empty-state">
            <h3>💳 Henüz kredi kartınız yok</h3>
            <p>Kredi kartlarınızı ekleyerek harcamalarınızı ve ödeme tarihlerinizi takip edebilirsiniz.</p>
          </div>
        )}
      </>
    );
  };

  // Geçmiş bölümünü render et
  const renderHistorySection = () => {
    const monthlyStats = getMonthlyStats();
    
    return (
      <>
        <div className="history-header">
          <h3>📈 Ödeme Geçmişi ve İstatistikler</h3>
        </div>

        <div className="stats-grid">
          <div className="stat-card">
            <h4>📊 Bu Ay</h4>
            <div className="stat-content">
              <div className="stat-item">
                <span>Toplam Harcama:</span>
                <strong>₺{monthlyStats.totalExpenses.toLocaleString('tr-TR')}</strong>
              </div>
              <div className="stat-item">
                <span>Toplam Ödeme:</span>
                <strong>₺{monthlyStats.totalPayments.toLocaleString('tr-TR')}</strong>
              </div>
              <div className="stat-item">
                <span>İşlem Sayısı:</span>
                <strong>{monthlyStats.transactionCount}</strong>
              </div>
            </div>
          </div>

          <div className="stat-card">
            <h4>💳 Kart Bazında</h4>
            <div className="card-stats">
              {monthlyStats.cardStats.slice(0, 5).map(stat => (
                <div key={stat.cardId} className="card-stat-item">
                  <span>{stat.cardName}:</span>
                  <strong>₺{stat.totalAmount.toLocaleString('tr-TR')}</strong>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="recent-transactions">
          <h4>📋 Son İşlemler</h4>
          <div className="transaction-list">
            {payments.slice(0, 20).reverse().map(payment => {
              const card = cards.find(c => c.id === payment.cardId);
              return (
                <div key={payment.id} className="transaction-item">
                  <div className="transaction-icon">
                    {payment.type === 'payment' ? '💰' : '🛒'}
                  </div>
                  <div className="transaction-details">
                    <div className="transaction-description">{payment.description}</div>
                    <div className="transaction-card">{card?.name} - {card?.bank}</div>
                  </div>
                  <div className="transaction-amount">
                    <span className={payment.type === 'payment' ? 'payment' : 'expense'}>
                      {payment.type === 'payment' ? '-' : '+'}₺{payment.amount.toLocaleString('tr-TR')}
                    </span>
                    <div className="transaction-date">{payment.date}</div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </>
    );
  };

  // Yeni kart formu
  const renderAddCardForm = () => {
    return (
      <div className="add-card-form">
        <h3>🆕 Yeni Kredi Kartı</h3>
        
        <div className="form-row">
          <div className="form-group">
            <label>Kart Adı</label>
            <input
              type="text"
              value={newCard.name}
              onChange={(e) => setNewCard({...newCard, name: e.target.value})}
              placeholder="Örn: World Card"
            />
          </div>
          
          <div className="form-group">
            <label>Banka</label>
            <select
              value={newCard.bank}
              onChange={(e) => {
                setNewCard({...newCard, bank: e.target.value});
                if (e.target.value !== 'Diğer') {
                  setCustomBankName('');
                }
              }}
            >
              <option value="">Banka Seçin</option>
              {banks.map(bank => (
                <option key={bank} value={bank}>{bank}</option>
              ))}
            </select>
            
            {newCard.bank === 'Diğer' && (
              <div className="custom-bank-input">
                <label>Banka Adı Girin</label>
                <input
                  type="text"
                  placeholder="Örn: Yeni Banka"
                  value={customBankName}
                  onChange={(e) => setCustomBankName(e.target.value)}
                />
              </div>
            )}
          </div>
        </div>

        <div className="form-row">
          <div className="form-group">
            <label>Kart Limiti (₺)</label>
            <input
              type="number"
              value={newCard.limit}
              onChange={(e) => setNewCard({...newCard, limit: e.target.value})}
              placeholder="0.00"
              step="0.01"
            />
          </div>
          
          <div className="form-group">
            <label>Kart Tipi</label>
            <select
              value={newCard.cardType}
              onChange={(e) => setNewCard({...newCard, cardType: e.target.value as 'bireysel' | 'ticari'})}
            >
              <option value="bireysel">🏠 Bireysel</option>
              <option value="ticari">🏢 Ticari</option>
            </select>
          </div>
        </div>

        <div className="form-row">
          <div className="form-group">
            <label>Mevcut Borç (₺)</label>
            <input
              type="number"
              value={newCard.currentDebt}
              onChange={(e) => setNewCard({...newCard, currentDebt: e.target.value})}
              placeholder="0.00"
              step="0.01"
            />
          </div>
          
          <div className="form-group">
            <label>Asgari Ödeme (₺)</label>
            <input
              type="number"
              value={newCard.minimumPayment}
              onChange={(e) => setNewCard({...newCard, minimumPayment: e.target.value})}
              placeholder="0.00"
              step="0.01"
            />
          </div>
        </div>

        <div className="form-row">
          <div className="form-group">
            <label>Renk</label>
            <select
              value={newCard.color}
              onChange={(e) => setNewCard({...newCard, color: e.target.value})}
            >
              {cardColors.map(color => (
                <option key={color} value={color} style={{backgroundColor: color}}>
                  {color}
                </option>
              ))}
            </select>
          </div>
          
          <div className="form-group">
            <label>Hesap Kesim Günü</label>
            <input
              type="number"
              min="1"
              max="31"
              value={newCard.statementDate}
              onChange={(e) => setNewCard({...newCard, statementDate: e.target.value})}
              placeholder="15"
            />
          </div>
        </div>

        <div className="form-row">
          <div className="form-group">
            <label>Son Ödeme Günü</label>
            <input
              type="number"
              min="1"
              max="31"
              value={newCard.dueDate}
              onChange={(e) => setNewCard({...newCard, dueDate: e.target.value})}
              placeholder="30"
            />
          </div>
          
          <div className="form-group">
            {/* Boş alan */}
          </div>
        </div>

        <div className="form-buttons">
          <button onClick={addCard} className="save-button">
            ✅ Kartı Kaydet
          </button>
          <button onClick={() => {
            setShowAddCard(false);
            setCustomBankName('');
          }} className="cancel-button">
            ❌ İptal
          </button>
        </div>
      </div>
    );
  };

  // Modal'ları render et
  const renderModals = () => {
    return (
      <>
        {/* Ödeme formu */}
        {selectedCardId && (
          <div className="payment-modal">
            <div className="payment-form">
              <h3>💰 Kart İşlemi</h3>
              
              <div className="form-group">
                <label>İşlem Türü</label>
                <div className="radio-group">
                  <label>
                    <input
                      type="radio"
                      value="expense"
                      checked={paymentType === 'expense'}
                      onChange={(e) => setPaymentType(e.target.value as 'expense')}
                    />
                    Harcama (Borç Artacak)
                  </label>
                  <label>
                    <input
                      type="radio"
                      value="payment"
                      checked={paymentType === 'payment'}
                      onChange={(e) => setPaymentType(e.target.value as 'payment')}
                    />
                    Ödeme (Borç Azalacak)
                  </label>
                </div>
              </div>

              <div className="form-group">
                <label>Açıklama (opsiyonel)</label>
                <input
                  type="text"
                  value={paymentDescription}
                  onChange={(e) => setPaymentDescription(e.target.value)}
                  placeholder="İşlem açıklaması..."
                />
              </div>

              <div className="form-group">
                <label>Tutar (₺)</label>
                <input
                  type="number"
                  value={paymentAmount}
                  onChange={(e) => setPaymentAmount(e.target.value)}
                  placeholder="0.00"
                  step="0.01"
                />
              </div>

              <div className="form-buttons">
                <button onClick={addPayment} className="save-button">
                  ✅ {paymentType === 'payment' ? 'Ödeme Yap' : 'Harcama Ekle'}
                </button>
                <button onClick={() => setSelectedCardId(null)} className="cancel-button">
                  ❌ İptal
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Düzenleme formu */}
        {editingCardId && (
          <div className="payment-modal">
            <div className="payment-form">
              <h3>✏️ Kredi Kartı Düzenle</h3>
              
              <div className="form-row">
                <div className="form-group">
                  <label>Kart Adı</label>
                  <input
                    type="text"
                    value={editCard.name}
                    onChange={(e) => setEditCard({...editCard, name: e.target.value})}
                    placeholder="Örn: World Card"
                  />
                </div>
                
                <div className="form-group">
                  <label>Banka</label>
                  <select
                    value={editCard.bank}
                    onChange={(e) => {
                      setEditCard({...editCard, bank: e.target.value});
                      if (e.target.value !== 'Diğer') {
                        setEditCustomBankName('');
                      }
                    }}
                  >
                    <option value="">Banka Seçin</option>
                    {banks.map(bank => (
                      <option key={bank} value={bank}>{bank}</option>
                    ))}
                  </select>
                  
                  {editCard.bank === 'Diğer' && (
                    <div className="custom-bank-input">
                      <label>Banka Adı Girin</label>
                      <input
                        type="text"
                        placeholder="Örn: Yeni Banka"
                        value={editCustomBankName}
                        onChange={(e) => setEditCustomBankName(e.target.value)}
                      />
                    </div>
                  )}
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Kart Limiti (₺)</label>
                  <input
                    type="number"
                    value={editCard.limit}
                    onChange={(e) => setEditCard({...editCard, limit: e.target.value})}
                    placeholder="0.00"
                    step="0.01"
                  />
                </div>
                
                <div className="form-group">
                  <label>Kart Tipi</label>
                  <select
                    value={editCard.cardType}
                    onChange={(e) => setEditCard({...editCard, cardType: e.target.value as 'bireysel' | 'ticari'})}
                  >
                    <option value="bireysel">🏠 Bireysel</option>
                    <option value="ticari">🏢 Ticari</option>
                  </select>
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Mevcut Borç (₺)</label>
                  <input
                    type="number"
                    value={editCard.currentDebt}
                    onChange={(e) => setEditCard({...editCard, currentDebt: e.target.value})}
                    placeholder="0.00"
                    step="0.01"
                  />
                </div>
                
                <div className="form-group">
                  <label>Asgari Ödeme (₺)</label>
                  <input
                    type="number"
                    value={editCard.minimumPayment}
                    onChange={(e) => setEditCard({...editCard, minimumPayment: e.target.value})}
                    placeholder="0.00"
                    step="0.01"
                  />
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Renk</label>
                  <select
                    value={editCard.color}
                    onChange={(e) => setEditCard({...editCard, color: e.target.value})}
                  >
                    {cardColors.map(color => (
                      <option key={color} value={color} style={{backgroundColor: color}}>
                        {color}
                      </option>
                    ))}
                  </select>
                </div>
                
                <div className="form-group">
                  <label>Hesap Kesim Günü</label>
                  <input
                    type="number"
                    min="1"
                    max="31"
                    value={editCard.statementDate}
                    onChange={(e) => setEditCard({...editCard, statementDate: e.target.value})}
                    placeholder="15"
                  />
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Son Ödeme Günü</label>
                  <input
                    type="number"
                    min="1"
                    max="31"
                    value={editCard.dueDate}
                    onChange={(e) => setEditCard({...editCard, dueDate: e.target.value})}
                    placeholder="30"
                  />
                </div>
                
                <div className="form-group">
                  {/* Boş alan */}
                </div>
              </div>

              <div className="form-buttons">
                <button onClick={updateCard} className="save-button">
                  ✅ Değişiklikleri Kaydet
                </button>
                <button onClick={cancelEdit} className="cancel-button">
                  ❌ İptal
                </button>
              </div>
            </div>
          </div>
        )}
      </>
    );
  };

  return (
    <div className="credit-card-manager">
      {/* Sub Tab Navigation */}
      <div className="sub-tab-navigation">
        <button 
          className={`sub-tab-button ${activeSubTab === 'overview' ? 'active' : ''}`}
          onClick={() => setActiveSubTab('overview')}
        >
          📊 Özet
        </button>
        <button 
          className={`sub-tab-button ${activeSubTab === 'calendar' ? 'active' : ''}`}
          onClick={() => setActiveSubTab('calendar')}
        >
          📅 Takvim
        </button>
        <button 
          className={`sub-tab-button ${activeSubTab === 'cards' ? 'active' : ''}`}
          onClick={() => setActiveSubTab('cards')}
        >
          💳 Kartlarım
        </button>
        <button 
          className={`sub-tab-button ${activeSubTab === 'history' ? 'active' : ''}`}
          onClick={() => setActiveSubTab('history')}
        >
          📈 Geçmiş
        </button>
      </div>

      {/* Tab Content */}
      {activeSubTab === 'overview' && (
        <div className="overview-section">
          {renderOverviewSection()}
        </div>
      )}

      {activeSubTab === 'calendar' && (
        <div className="calendar-section">
          {renderCalendarSection()}
        </div>
      )}

      {activeSubTab === 'cards' && (
        <div className="cards-section">
          {renderCardsSection()}
        </div>
      )}

      {activeSubTab === 'history' && (
        <div className="history-section">
          {renderHistorySection()}
        </div>
      )}

      {/* Modal'lar */}
      {renderModals()}
    </div>
  );
};

export default CreditCardManager;
