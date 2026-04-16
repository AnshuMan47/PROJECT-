// middleware/paymentTimeWindow.js
const isPaymentTimeWindow = () => {
  const now = new Date();
  
  // Convert to IST
  const istOffset = 5.5 * 60; // 5 hours 30 minutes
  const istTime = new Date(now.getTime() + (istOffset * 60 * 1000));
  
  const currentHour = istTime.getHours();
  const currentMinute = istTime.getMinutes();
  
  // 10:00 AM to 11:00 AM IST
  return currentHour === 10 || (currentHour === 10 && currentMinute >= 0);
};

const restrictPaymentTime = (req, res, next) => {
  if (!isPaymentTimeWindow()) {
    return res.status(403).json({
      error: 'Payments are only available between 10:00 AM and 11:00 AM IST.'
    });
  }
  next();
};

module.exports = { restrictPaymentTime };