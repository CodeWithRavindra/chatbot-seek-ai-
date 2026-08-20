import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Send, LogOut, Home, Compass, BookMarked, User, Paperclip, Globe, Search, Hash, TrendingUp, Clock } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism';
import '../styles/Chat.css';

export default function ChatPage() {
  const [chats, setChats] = useState([]);
  const [currentChat, setCurrentChat] = useState(null);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('home');
  const navigate = useNavigate();
  const token = localStorage.getItem('token');
  const user = JSON.parse(localStorage.getItem('user') || '{}');
  const messagesEndRef = useRef(null);

  useEffect(() => {
    if (!token) {
      navigate('/login');
      return;
    }
    loadChats();
  }, [token, navigate]);

  useEffect(() => {
    scrollToBottom();
  }, [messages, loading]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const loadChats = async () => {
    try {
      const response = await fetch('/api/chat', {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await response.json();
      setChats(data.chats || []);
    } catch (error) {
      console.error('Failed to load chats:', error);
    }
  };

  const handleTextareaChange = (e) => {
    setInput(e.target.value);
    // Auto-resize magic
    e.target.style.height = 'auto';
    e.target.style.height = `${Math.min(e.target.scrollHeight, 150)}px`;
  };

  const selectChat = (chat) => {
    setActiveTab('home');
    setCurrentChat(chat);
    setMessages(chat.messages || []);
  };

  const startNewThread = () => {
    setActiveTab('home');
    setCurrentChat(null);
    setMessages([]);
    setInput('');
  };

  const sendMessage = async () => {
    if (!input.trim()) return;

    let targetChat = currentChat;

    if (!targetChat) {
      try {
        const response = await fetch('/api/chat', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ title: input.substring(0, 30) + '...' }),
        });
        const data = await response.json();
        targetChat = data.chat;
        setChats([targetChat, ...chats]);
        setCurrentChat(targetChat);
      } catch (error) {
        console.error('Failed to create initial chat:', error);
        return;
      }
    }

    const userMessage = {
      role: 'user',
      content: input,
    };

    const newMessages = [...(targetChat === currentChat ? messages : []), userMessage];
    setMessages(newMessages);
    setInput('');
    
    // Reset textarea height
    const textareas = document.querySelectorAll('textarea');
    textareas.forEach(t => t.style.height = 'auto');
    
    setLoading(true);

    try {
      const response = await fetch(
        `/api/chat/${targetChat._id}/message`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(userMessage),
        }
      );

      if (!response.ok) {
        throw new Error('Failed to send message');
      }

      const data = await response.json();
      setMessages(data.chat.messages || []);
      setCurrentChat(data.chat);
      
      setChats(prevChats => 
        prevChats.map(c => c._id === data.chat._id ? data.chat : c)
      );

    } catch (error) {
      console.error('Failed to send message:', error);
      setMessages([...newMessages, { role: 'assistant', content: 'Sorry, something went wrong. Please try again.' }]);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/login');
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      if (!loading) sendMessage();
    }
  };

  const MarkdownComponents = {
    code({node, inline, className, children, ...props}) {
      const match = /language-(\w+)/.exec(className || '');
      return !inline && match ? (
        <div className="code-block-wrapper">
          <div className="code-block-header">
            <span>{match[1]}</span>
          </div>
          <SyntaxHighlighter
            style={vscDarkPlus}
            language={match[1]}
            PreTag="div"
            className="code-block"
            {...props}
          >
            {String(children).replace(/\n$/, '')}
          </SyntaxHighlighter>
        </div>
      ) : (
        <code className="inline-code" {...props}>
          {children}
        </code>
      );
    }
  };

  const MessageItem = ({ msg }) => (
    <div className={`message ${msg.role}`}>
      <div className="message-header">
        <div className={`avatar ${msg.role}`}>
          {msg.role === 'user' ? <User size={16} /> : <Compass size={16} />}
        </div>
        <span className="message-role-name">
          {msg.role === 'user' ? 'You' : 'Perplexity'}
        </span>
      </div>
      <div className="message-content">
        <ReactMarkdown components={MarkdownComponents}>{msg.content}</ReactMarkdown>
      </div>
    </div>
  );

  return (
    <div className="chat-container">
      {/* Sidebar */}
      <div className="chat-sidebar">
        <div className="sidebar-header">
          <button className="new-chat-btn" onClick={startNewThread}>
            New Thread <Plus size={18} />
          </button>
        </div>

        <div className="sidebar-nav">
          <button 
            className={`nav-item ${activeTab === 'home' ? 'active' : ''}`}
            onClick={() => setActiveTab('home')}
          >
            <Home /> Home
          </button>
          <button 
            className={`nav-item ${activeTab === 'discover' ? 'active' : ''}`}
            onClick={() => setActiveTab('discover')}
          >
            <Compass /> Discover
          </button>
          <button 
            className={`nav-item ${activeTab === 'library' ? 'active' : ''}`}
            onClick={() => setActiveTab('library')}
          >
            <BookMarked /> Library
          </button>
        </div>

        <div className="chat-list-container">
          <h3 className="chat-list-title">Your Threads</h3>
          <div className="chat-list">
            {chats.map((chat) => (
              <button
                key={chat._id}
                className={`chat-item ${currentChat?._id === chat._id && activeTab === 'home' ? 'active' : ''}`}
                onClick={() => selectChat(chat)}
              >
                {chat.title}
              </button>
            ))}
          </div>
        </div>

        <div className="sidebar-footer">
          <div className="user-profile">
            <div className="user-avatar">
              <User size={18} />
            </div>
            {user.username}
          </div>
          <button className="logout-btn" onClick={handleLogout} title="Log out">
            <LogOut size={18} />
          </button>
        </div>
      </div>

      {/* Main Area */}
      <div className="chat-main">
        {activeTab === 'discover' && (
          <div className="discover-view fade-in">
            <h1>Discover</h1>
            <p className="subtitle">Trending research and discussions</p>
            <div className="discover-grid">
              {[
                { title: "The Future of Quantum Computing", tag: "Technology" },
                { title: "How do LLMs actually work?", tag: "AI" },
                { title: "Global Economic Shifts in 2026", tag: "Finance" },
                { title: "Breakthroughs in Fusion Energy", tag: "Science" },
              ].map((item, i) => (
                <div key={i} className="discover-card">
                  <div className="discover-tag"><Hash size={14}/> {item.tag}</div>
                  <h3>{item.title}</h3>
                  <div className="discover-footer"><TrendingUp size={14}/> Trending now</div>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'library' && (
          <div className="library-view fade-in">
            <h1>Library</h1>
            <p className="subtitle">Your saved threads and collections</p>
            <div className="library-list">
              {chats.map(chat => (
                <div key={chat._id} className="library-card" onClick={() => selectChat(chat)}>
                  <div className="library-icon"><Clock size={20}/></div>
                  <div className="library-content">
                    <h3>{chat.title}</h3>
                    <span>{new Date(chat.createdAt || Date.now()).toLocaleDateString()}</span>
                  </div>
                </div>
              ))}
              {chats.length === 0 && <p className="empty-library">No threads saved yet.</p>}
            </div>
          </div>
        )}

        {activeTab === 'home' && (
          (!currentChat || messages.length === 0) ? (
            <div className="empty-state-container fade-in">
              <h1>Where knowledge begins</h1>
              <div className="centered-input-wrapper">
                <textarea
                  value={input}
                  onChange={handleTextareaChange}
                  onKeyDown={handleKeyDown}
                  placeholder="Ask anything..."
                  disabled={loading}
                  rows={1}
                />
                <div className="action-buttons">
                  <button className="action-btn" title="Focus">
                    <Globe size={20} />
                  </button>
                  <button className="action-btn" title="Attach">
                    <Paperclip size={20} />
                  </button>
                  <button onClick={sendMessage} disabled={loading || !input.trim()} className="send-btn">
                    <Send size={18} />
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <>
              <div className="chat-messages">
                <div className="messages-container">
                  {messages.map((msg, idx) => (
                    <MessageItem key={idx} msg={msg} />
                  ))}
                  {loading && (
                    <div className="message assistant fade-in">
                      <div className="message-header">
                        <div className="avatar assistant">
                          <Compass size={16} />
                        </div>
                        <span className="message-role-name">Perplexity</span>
                      </div>
                      <div className="thinking-indicator">
                        <div className="dot-flashing"></div>
                      </div>
                    </div>
                  )}
                  <div ref={messagesEndRef} />
                </div>
              </div>

              <div className="chat-input-area">
                <div className="centered-input-wrapper">
                  <textarea
                    value={input}
                    onChange={handleTextareaChange}
                    onKeyDown={handleKeyDown}
                    placeholder="Ask a follow-up..."
                    disabled={loading}
                    rows={1}
                  />
                  <div className="action-buttons">
                    <button className="action-btn">
                      <Globe size={20} />
                    </button>
                    <button className="action-btn">
                      <Paperclip size={20} />
                    </button>
                    <button onClick={sendMessage} disabled={loading || !input.trim()} className="send-btn">
                      <Send size={18} />
                    </button>
                  </div>
                </div>
              </div>
            </>
          )
        )}
      </div>
    </div>
  );
}
