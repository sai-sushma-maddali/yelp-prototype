import React, { useState, useRef, useEffect } from 'react';
import { Card, Form, Button, Spinner, Badge } from 'react-bootstrap';
import { FaPaperPlane, FaRobot, FaTrash } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';
import { sendChatMessage } from '../services/api';
import { useAuth } from '../context/AuthContext';
import StarRating from './StarRating';

function AIChatbot() {
  const [messages, setMessages]       = useState([
    {
      role: 'assistant',
      content: "Hi! 👋 I'm your restaurant assistant. Tell me what you're in the mood for and I'll find the perfect spot for you!"
    }
  ]);
  const [input, setInput]             = useState('');
  const [loading, setLoading]         = useState(false);
  const [restaurants, setRestaurants] = useState([]);
  const chatEndRef                    = useRef(null);
  const { user }                      = useAuth();
  const navigate                      = useNavigate();

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loading]);

  const quickActions = [
    "Find dinner tonight",
    "Best rated near me",
    "Vegan options",
    "Romantic dinner",
    "Cheap & cheerful"
  ];

  const sendMessage = async (messageText) => {
    const text = messageText || input.trim();
    if (!text) return;

    if (!user) {
      setMessages(prev => [...prev, {
        role: 'assistant',
        content: "Please log in to use the AI assistant! 🔐"
      }]);
      return;
    }

    // Add user message
    const userMessage = { role: 'user', content: text };
    const updatedMessages = [...messages, userMessage];
    setMessages(updatedMessages);
    setInput('');
    setLoading(true);

    try {
      // Build conversation history (exclude the welcome message)
      const history = updatedMessages
        .slice(1) // skip welcome message
        .slice(-6) // last 6 messages
        .map(m => ({ role: m.role, content: m.content }));

      const res = await sendChatMessage(text, history);
      const { response, restaurants: recs } = res.data;

      setMessages(prev => [...prev, { role: 'assistant', content: response }]);
      setRestaurants(recs || []);
    } catch (err) {
      setMessages(prev => [...prev, {
        role: 'assistant',
        content: "Sorry, I ran into an issue. Please make sure Ollama is running and try again! 🤖"
      }]);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const clearChat = () => {
    setMessages([{
      role: 'assistant',
      content: "Hi! 👋 I'm your restaurant assistant. Tell me what you're in the mood for!"
    }]);
    setRestaurants([]);
    setInput('');
  };

  return (
    <Card className="shadow-sm" style={{ borderRadius: '16px', border: 'none' }}>
      <Card.Header
        className="d-flex justify-content-between align-items-center"
        style={{ background: '#d32323', color: 'white', borderRadius: '16px 16px 0 0' }}
      >
        <span><FaRobot className="me-2" />AI Restaurant Assistant</span>
        <Button variant="link" style={{ color: 'white' }} onClick={clearChat} title="Clear chat">
          <FaTrash size={14} />
        </Button>
      </Card.Header>

      <Card.Body className="p-0">
        {/* Chat Messages */}
        <div className="chat-container p-3">
          {messages.map((msg, i) => (
            <div
              key={i}
              className={`d-flex ${msg.role === 'user' ? 'justify-content-end' : 'justify-content-start'} mb-2`}
            >
              <div className={msg.role === 'user' ? 'chat-message-user' : 'chat-message-ai'}>
                {msg.content}
              </div>
            </div>
          ))}

          {loading && (
            <div className="d-flex justify-content-start mb-2">
              <div className="chat-message-ai chat-thinking">
                <Spinner animation="border" size="sm" className="me-2" />
                Thinking...
              </div>
            </div>
          )}
          <div ref={chatEndRef} />
        </div>

        {/* Restaurant Recommendations */}
        {restaurants.length > 0 && (
          <div className="p-3 border-top" style={{ background: '#f8f9fa' }}>
            <p className="text-muted mb-2" style={{ fontSize: '0.85rem', fontWeight: 600 }}>
              🍽️ Recommended Restaurants
            </p>
            <div className="d-flex flex-column gap-2">
              {restaurants.map(r => (
                <div
                  key={r.id}
                  className="bg-white rounded p-2 d-flex justify-content-between align-items-center"
                  style={{ cursor: 'pointer', border: '1px solid #dee2e6' }}
                  onClick={() => navigate(`/restaurants/${r.id}`)}
                >
                  <div>
                    <div style={{ fontWeight: 600, fontSize: '0.9rem' }}>{r.name}</div>
                    <div style={{ fontSize: '0.8rem', color: '#666' }}>
                      {r.cuisine_type} • {r.price_tier} • {r.city}
                    </div>
                    <StarRating rating={r.avg_rating || 0} size="0.9rem" />
                  </div>
                  <Badge bg="danger" style={{ fontSize: '0.75rem' }}>View →</Badge>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Quick Actions */}
        <div className="px-3 pt-2 d-flex flex-wrap gap-1">
          {quickActions.map((action, i) => (
            <Button
              key={i}
              variant="outline-secondary"
              size="sm"
              style={{ fontSize: '0.75rem', borderRadius: '20px' }}
              onClick={() => sendMessage(action)}
              disabled={loading}
            >
              {action}
            </Button>
          ))}
        </div>

        {/* Input Area */}
        <div className="p-3 d-flex gap-2">
          <Form.Control
            type="text"
            placeholder={user ? "Ask me anything... e.g. 'vegan food near me'" : "Please log in to use AI assistant"}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            disabled={loading || !user}
            style={{ borderRadius: '20px' }}
          />
          <Button
            variant="danger"
            onClick={() => sendMessage()}
            disabled={loading || !input.trim() || !user}
            style={{ borderRadius: '20px', padding: '0 16px' }}
          >
            <FaPaperPlane />
          </Button>
        </div>
      </Card.Body>
    </Card>
  );
}

export default AIChatbot;