// components/UserProfile.jsx
import React, { useState, useEffect } from 'react';
import axios from 'axios';

const UserProfile = ({ username }) => {
  const [userData, setUserData] = useState(null);
  const [transferForm, setTransferForm] = useState({ toUsername: '', amount: '' });
  const [showTransfer, setShowTransfer] = useState(false);

  useEffect(() => {
    fetchUserData();
  }, []);

  const fetchUserData = async () => {
    const res = await axios.get(`/api/points/me`);
    setUserData(res.data);
  };

  const handleTransfer = async (e) => {
    e.preventDefault();
    try {
      await axios.post('/api/points/transfer', transferForm, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      alert('Points transferred successfully!');
      setTransferForm({ toUsername: '', amount: '' });
      fetchUserData();
    } catch (error) {
      alert(error.response?.data?.error || 'Transfer failed');
    }
  };

  if (!userData) return <div>Loading...</div>;

  const canTransfer = userData.points.total > 10;

  return (
    <div className="user-profile">
      <div className="points-display">
        <div className="points-circle">
          <span className="points-total">{userData.points.total}</span>
          <span className="points-label">Points</span>
        </div>
        <div className="points-breakdown">
          <div><strong>Earned:</strong> {userData.points.earned}</div>
          <div><strong>Spent:</strong> {userData.points.spent}</div>
        </div>
      </div>

      {!canTransfer && (
        <div className="transfer-lock">
          <span role="img" aria-label="lock">🔒</span>
          Need 10+ points to transfer
        </div>
      )}

      {canTransfer && (
        <button 
          className="transfer-toggle"
          onClick={() => setShowTransfer(!showTransfer)}
        >
          {showTransfer ? 'Cancel' : 'Transfer Points'} 💸
        </button>
      )}

      {showTransfer && canTransfer && (
        <form onSubmit={handleTransfer} className="transfer-form">
          <div className="form-group">
            <input
              type="text"
              placeholder="Username to send points"
              value={transferForm.toUsername}
              onChange={(e) => setTransferForm({...transferForm, toUsername: e.target.value})}
              required
            />
          </div>
          <div className="form-group">
            <input
              type="number"
              placeholder="Amount (min 1)"
              value={transferForm.amount}
              onChange={(e) => setTransferForm({...transferForm, amount: e.target.value})}
              min="1"
              max={userData.points.total - 10}
              required
            />
          </div>
          <button type="submit" className="transfer-btn">
            Send Points
          </button>
        </form>
      )}

      <div className="transactions">
        <h3>Recent Activity</h3>
        {userData.transactions.map((tx, i) => (
          <TransactionRow key={i} transaction={tx} />
        ))}
      </div>
    </div>
  );
};

const TransactionRow = ({ transaction }) => (
  <div className={`transaction-row ${transaction.amount > 0 ? 'gain' : 'loss'}`}>
    <div className="tx-icon">
      {transaction.type === 'answer' && '💬'}
      {transaction.type === 'upvote_bonus' && '⭐'}
      {transaction.type === 'transfer_sent' && '➡️'}
      {transaction.type === 'transfer_received' && '⬅️'}
      {transaction.type === 'deduction' && '📉'}
    </div>
    <div className="tx-details">
      <div className="tx-desc">{transaction.description}</div>
      <div className="tx-meta">
        {transaction.targetUser?.username && `To: ${transaction.targetUser.username}`}
      </div>
    </div>
    <div className="tx-amount">
      {transaction.amount > 0 ? `+${transaction.amount}` : transaction.amount}
    </div>
  </div>
);