// pages/Subscription.jsx
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';

const SubscriptionPlans = () => {
  const [plans, setPlans] = useState([]);
  const [currentPlan, setCurrentPlan] = useState('free');
  const [isPaymentTime, setIsPaymentTime] = useState(false);
  const [loading, setLoading] = useState(false);

  const PLAN_DATA = [
    {
      id: 'free',
      name: 'Free Plan',
      price: 0,
      questions: 1,
      features: ['1 question/day', 'Basic support'],
      popular: false
    },
    {
      id: 'bronze',
      name: 'Bronze Plan',
      price: 100,
      questions: 5,
      features: ['5 questions/day', 'Priority support', 'Ad-free'],
      popular: true
    },
    {
      id: 'silver',
      name: 'Silver Plan',
      price: 300,
      questions: 10,
      features: ['10 questions/day', 'All Bronze + analytics'],
      popular: false
    },
    {
      id: 'gold',
      name: 'Gold Plan',
      price: 1000,
      questions: 'Unlimited',
      features: ['Unlimited questions', 'All features + VIP support'],
      popular: false
    }
  ];

  useEffect(() => {
    checkPaymentTime();
    const interval = setInterval(checkPaymentTime, 60000); // Check every minute
    return () => clearInterval(interval);
  }, []);

  const checkPaymentTime = () => {
    const now = new Date();
    const istTime = new Date(now.toLocaleString("en-US", {timeZone: "Asia/Kolkata"}));
    const hour = istTime.getHours();
    setIsPaymentTime(hour === 10);
  };

  const handleSubscribe = async (planId) => {
    setLoading(true);
    try {
      const response = await axios.post('/api/subscription/checkout', { plan: planId }, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      window.location.href = response.data.url;
    } catch (error) {
      alert(error.response?.data?.error || 'Subscription failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="subscription-page">
      <div className="subscription-header">
        <h1>Choose Your Plan</h1>
        <p>Unlock more questions per day with premium plans</p>
        
        <div className={`time-status ${isPaymentTime ? 'active' : 'inactive'}`}>
          {isPaymentTime ? (
            <>
              <span role="img" aria-label="available">🟢</span>
              Payments available now (10-11 AM IST)
            </>
          ) : (
            <>
              <span role="img" aria-label="unavailable">🔴</span>
              Payments available 10:00-11:00 AM IST
            </>
          )}
        </div>
      </div>

      <div className="plans-grid">
        {PLAN_DATA.map((plan) => (
          <PlanCard
            key={plan.id}
            plan={plan}
            currentPlan={currentPlan}
            onSubscribe={handleSubscribe}
            isPaymentTime={isPaymentTime}
            loading={loading}
          />
        ))}
      </div>
    </div>
  );
};

const PlanCard = ({ plan, currentPlan, onSubscribe, isPaymentTime, loading }) => (
  <div className={`plan-card ${plan.popular ? 'popular' : ''} ${currentPlan === plan.id ? 'active' : ''}`}>
    <div className="plan-badge">
      {plan.popular && <span>🔥 Most Popular</span>}
      {currentPlan === plan.id && <span>✅ Current Plan</span>}
    </div>
    
    <div className="plan-header">
      <h3>{plan.name}</h3>
      <div className="price">
        <span className="currency">₹</span>{plan.price}
        <span className="period">/month</span>
      </div>
    </div>
    
    <div className="plan-features">
      <div className="feature highlight">
        <span role="img" aria-label="questions">❓</span>
        <strong>{plan.questions} questions/day</strong>
      </div>
      {plan.features.map((feature, i) => (
        <div key={i} className="feature">
          <span role="img" aria-label="check">✅</span>
          {feature}
        </div>
      ))}
    </div>
    
    {currentPlan !== plan.id ? (
      <button
        onClick={() => onSubscribe(plan.id)}
        disabled={!isPaymentTime || loading}
        className="subscribe-btn"
      >
        {loading ? (
          <>
            <span className="spinner"></span>
            Processing...
          </>
        ) : isPaymentTime ? (
          `Upgrade to ${plan.name}`
        ) : (
          'Available 10-11 AM IST'
        )}
      </button>
    ) : (
      <button className="current-btn" disabled>
        Current Plan
      </button>
    )}
  </div>
);

export default SubscriptionPlans;