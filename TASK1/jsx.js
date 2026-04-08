// components/PublicFeed.jsx
import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';

const PublicFeed = () => {
  const [posts, setPosts] = useState([]);
  const [newPost, setNewPost] = useState({ content: '', media: null });
  const [friendCount, setFriendCount] = useState(0);
  const [canPost, setCanPost] = useState(false);
  const [loading, setLoading] = useState(false);

  // Fetch user stats and posts
  useEffect(() => {
    fetchUserStats();
    fetchPosts();
  }, []);

  const fetchUserStats = async () => {
    try {
      const res = await axios.get('/api/user/stats', {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      setFriendCount(res.data.friendCount);
      setCanPost(res.data.canPost);
    } catch (err) {
      console.error(err);
    }
  };

  const fetchPosts = async () => {
    try {
      const res = await axios.get('/api/public/posts');
      setPosts(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  const handlePostSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    const formData = new FormData();
    formData.append('content', newPost.content);
    if (newPost.media) formData.append('media', newPost.media);

    try {
      await axios.post('/api/public/posts', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
          Authorization: `Bearer ${localStorage.getItem('token')}`
        }
      });
      setNewPost({ content: '', media: null });
      fetchPosts();
      fetchUserStats();
    } catch (err) {
      alert(err.response?.data?.error || 'Error posting');
    } finally {
      setLoading(false);
    }
  };

  const getPostLimitText = () => {
    if (friendCount === 0) return "Make your first friend to start posting!";
    if (friendCount === 1) return "1 friend = 1 post/day";
    if (friendCount === 2) return "2 friends = 2 posts/day";
    if (friendCount > 10) return "Unlimited posts! 🎉";
    return `${friendCount} friends = ${friendCount} posts/day`;
  };

  return (
    <div className="public-feed">
      <div className="feed-header">
        <h2>Public Square</h2>
        <div className="post-limit">
          <span role="img" aria-label="friends">👥</span>
          {friendCount} friends • {getPostLimitText()}
        </div>
      </div>

      {canPost && (
        <form onSubmit={handlePostSubmit} className="post-form">
          <textarea
            value={newPost.content}
            onChange={(e) => setNewPost({...newPost, content: e.target.value})}
            placeholder="Share with the community... (Make friends to post more!)"
            maxLength={1000}
          />
          <div className="post-actions">
            <input
              type="file"
              accept="image/*,video/*"
              onChange={(e) => setNewPost({...newPost, media: e.target.files[0]})}
            />
            <button type="submit" disabled={loading}>
              {loading ? 'Posting...' : 'Post'}
            </button>
          </div>
        </form>
      )}

      <div className="posts-grid">
        {posts.map(post => (
          <PostCard key={post._id} post={post} onUpdate={fetchPosts} />
        ))}
      </div>
    </div>
  );
};

// PostCard component (simplified)
const PostCard = ({ post, onUpdate }) => {
  const [liked, setLiked] = useState(false);
  const handleLike = async () => {
    const res = await axios.post(`/api/public/posts/${post._id}/like`);
    onUpdate();
    setLiked(true);
  };

  return (
    <div className="post-card">
      <div className="post-header">
        <img src={post.author.avatar} alt={post.author.username} />
        <span>{post.author.username}</span>
      </div>
      {post.content && <p>{post.content}</p>}
      {post.media?.map((media, i) => (
        <div key={i} className={`media ${media.type}`}>
          {media.type === 'video' ? 
            <video src={media.url} controls /> : 
            <img src={media.url} alt="post media" />
          }
        </div>
      ))}
      <div className="post-actions">
        <button onClick={handleLike} className={liked ? 'liked' : ''}>
          {post.likes.length} ❤️
        </button>
        <span>{post.comments.length} 💬</span>
        <span>{post.shares} 🔄</span>
      </div>
    </div>
  );
};

export default PublicFeed;