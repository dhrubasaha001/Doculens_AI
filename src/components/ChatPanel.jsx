import React, { useState, useRef, useEffect } from 'react';
import { Send, User, Bot, Loader2, MessageSquare } from 'lucide-react';
import { motion } from 'framer-motion';

export default function ChatPanel() {
  const [messages, setMessages] = useState([
    { role: 'assistant', text: 'Ask me anything about this document.' }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef(null);

  const API_BASE_URL = 'http://localhost:8000';

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSend = async (e) => {
    e.preventDefault();
    if (!input.trim()) return;

    const userMessage = { role: 'user', text: input.trim() };
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      const response = await fetch(`${API_BASE_URL}/ask?question=${encodeURIComponent(userMessage.text)}`);
      if (!response.ok) throw new Error('Network response was not ok');
      const data = await response.json();
      
      const botMessage = { role: 'assistant', text: data.answer || "I couldn't find an answer to that." };
      setMessages(prev => [...prev, botMessage]);
    } catch (error) {
      setMessages(prev => [...prev, { role: 'assistant', text: 'Error: Could not reach the server.' }]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="glass-card rounded-2xl p-6 flex flex-col h-[500px]">
      <div className="flex items-center gap-3 mb-4 text-primary">
        <MessageSquare size={20} />
        <h3 className="font-display font-semibold text-lg text-white">Document Q&A</h3>
      </div>
      
      <div className="flex-1 overflow-y-auto mb-4 space-y-4 pr-2 custom-scrollbar">
        {messages.map((msg, idx) => (
          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            key={idx} 
            className={`flex gap-3 ${msg.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}
          >
            <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${msg.role === 'user' ? 'bg-primary text-white' : 'bg-surface border border-border text-accent'}`}>
              {msg.role === 'user' ? <User size={16} /> : <Bot size={16} />}
            </div>
            <div className={`px-4 py-2 rounded-2xl max-w-[80%] text-sm ${msg.role === 'user' ? 'bg-primary/20 text-white rounded-tr-none border border-primary/30' : 'bg-surface border border-border text-white/80 rounded-tl-none'}`}>
              {msg.text}
            </div>
          </motion.div>
        ))}
        {isLoading && (
          <div className="flex gap-3">
            <div className="w-8 h-8 rounded-full bg-surface border border-border text-accent flex items-center justify-center shrink-0">
              <Bot size={16} />
            </div>
            <div className="px-4 py-2 rounded-2xl bg-surface border border-border text-white/80 rounded-tl-none flex items-center gap-2">
              <Loader2 size={14} className="animate-spin" /> Thinking...
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      <form onSubmit={handleSend} className="relative mt-auto">
        <input 
          type="text" 
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Ask a question..."
          className="w-full bg-surface border border-border rounded-xl px-4 py-3 pr-12 text-sm text-white placeholder:text-white/40 focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all"
        />
        <button 
          type="submit"
          disabled={!input.trim() || isLoading}
          className="absolute right-2 top-1/2 -translate-y-1/2 p-2 bg-primary hover:bg-primaryHover text-white rounded-lg disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          <Send size={16} />
        </button>
      </form>
    </div>
  );
}
