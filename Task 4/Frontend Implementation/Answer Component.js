// components/Answer.jsx
const Answer = ({ answer }) => {
  const handleUpvote = async () => {
    try {
      await axios.post(`/api/answers/${answer._id}/upvote`, {}, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      // Bonus points awarded automatically via backend
    } catch (error) {
      console.error('Upvote failed');
    }
  };

  return (
    <div className="answer-card">
      <div className="answer-content">{answer.content}</div>
      <div className="answer-actions">
        <button onClick={handleUpvote} className="upvote-btn">
          👍 {answer.upvotes.length} upvotes
          {answer.upvotes.length >= 5 && ' ⭐ Bonus Awarded!'}
        </button>
      </div>
    </div>
  );
};