'use client';

import React, { useState, useRef, useEffect } from 'react';
import { Bot, User, Send, Sparkles, HelpCircle, Loader2, Zap } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { answerWeatherQuestion, WeatherSummaryData } from '../utils/aiAssistant';

interface Message {
  id: string;
  sender: 'bot' | 'user';
  text: string;
  timestamp: Date;
}

interface AIAssistantProps {
  weatherData: WeatherSummaryData;
}

const SUGGESTIONS = [
  'Will it rain today?',
  'Should I carry an umbrella?',
  'Can I wash my car?',
  'Is today suitable for farming?',
  'Can I fly my drone?',
  'Is tomorrow hotter?',
  'Explain today\'s weather simply.',
  'Which day is best for travel?',
  'Should I postpone my outdoor event?'
];

export default function AIAssistant({ weatherData }: AIAssistantProps) {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 'welcome',
      sender: 'bot',
      text: 'Hello! I am your Rainy Byte AI Weather & Climate Assistant. Ask me anything about how the forecast affects your plans today — travel, farming, drone flights, or events!',
      timestamp: new Date()
    }
  ]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping]);

  const handleSend = (textToSend: string) => {
    if (!textToSend.trim()) return;

    const userMessage: Message = {
      id: `user-${Date.now()}`,
      sender: 'user',
      text: textToSend,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsTyping(true);

    setTimeout(() => {
      const replyText = answerWeatherQuestion(textToSend, weatherData);
      const botMessage: Message = {
        id: `bot-${Date.now()}`,
        sender: 'bot',
        text: replyText,
        timestamp: new Date()
      };
      setMessages(prev => [...prev, botMessage]);
      setIsTyping(false);
    }, 800 + Math.random() * 400);
  };

  return (
    <div className="glass-card glass-card-cyan flex flex-col overflow-hidden" style={{ height: '540px' }}>
      {/* Header */}
      <div className="flex items-center justify-between px-6 py-4 flex-shrink-0"
        style={{ borderBottom: '1px solid rgba(34,211,238,0.08)', background: 'rgba(34,211,238,0.03)' }}>
        <div className="flex items-center gap-3">
          <div className="icon-badge icon-badge-md icon-badge-cyan">
            <Sparkles className="w-5 h-5 text-cyan animate-pulse-soft" style={{ color: '#22D3EE' }} />
          </div>
          <div>
            <h3 className="font-semibold text-white flex items-center gap-2">
              AI Assistant
              <span className="text-[9px] uppercase font-bold tracking-widest px-1.5 py-0.5 rounded"
                style={{ background: 'rgba(34,211,238,0.1)', border: '1px solid rgba(34,211,238,0.2)', color: '#22D3EE' }}>
                Cognitive v2.4
              </span>
            </h3>
            <p className="text-xs text-white/35 mt-0.5">Forecasting Tomorrow with AI Precision</p>
          </div>
        </div>
        <div className="flex items-center gap-1.5 text-xs px-2.5 py-1 rounded-full"
          style={{ background: 'rgba(34,211,238,0.07)', border: '1px solid rgba(34,211,238,0.15)', color: '#22D3EE' }}>
          <div className="w-1.5 h-1.5 rounded-full bg-cyan animate-pulse" style={{ backgroundColor: '#22D3EE', boxShadow: '0 0 6px rgba(34,211,238,0.8)' }} />
          Online
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-5 py-5 space-y-4" style={{ scrollbarWidth: 'thin' }}>
        <AnimatePresence initial={false}>
          {messages.map((msg) => (
            <motion.div
              key={msg.id}
              initial={{ opacity: 0, y: 10, scale: 0.96 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
              className={`flex items-end gap-2.5 max-w-[90%] ${msg.sender === 'user' ? 'ml-auto flex-row-reverse' : ''}`}
            >
              {/* Avatar */}
              <div className={`w-7 h-7 rounded-full flex items-center justify-center shrink-0 ${
                msg.sender === 'user'
                  ? 'icon-badge-blue'
                  : 'icon-badge-cyan'
              }`}
                style={msg.sender === 'bot'
                  ? { background: 'rgba(34,211,238,0.1)', border: '1px solid rgba(34,211,238,0.2)' }
                  : { background: 'rgba(14,165,233,0.1)', border: '1px solid rgba(14,165,233,0.2)' }}>
                {msg.sender === 'user'
                  ? <User className="w-3.5 h-3.5 text-sky-400" />
                  : <Bot className="w-3.5 h-3.5" style={{ color: '#22D3EE' }} />}
              </div>

              {/* Bubble */}
              <div className={`relative px-4 py-3 rounded-2xl text-sm leading-relaxed max-w-full ${
                msg.sender === 'user'
                  ? 'rounded-tr-sm'
                  : 'rounded-tl-sm'
              }`}
                style={msg.sender === 'user'
                  ? {
                      background: 'rgba(14,165,233,0.12)',
                      border: '1px solid rgba(14,165,233,0.2)',
                      color: 'rgba(255,255,255,0.9)',
                    }
                  : {
                      background: 'rgba(255,255,255,0.04)',
                      border: '1px solid rgba(34,211,238,0.08)',
                      color: 'rgba(255,255,255,0.8)',
                    }}>
                <p>{msg.text}</p>
                <span className="block text-[10px] text-white/25 mt-1.5 text-right">
                  {msg.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </span>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>

        {/* Typing indicator */}
        <AnimatePresence>
          {isTyping && (
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 8 }}
              className="flex items-end gap-2.5 max-w-[80%]"
            >
              <div className="w-7 h-7 rounded-full flex items-center justify-center shrink-0"
                style={{ background: 'rgba(34,211,238,0.1)', border: '1px solid rgba(34,211,238,0.2)' }}>
                <Bot className="w-3.5 h-3.5" style={{ color: '#22D3EE' }} />
              </div>
              <div className="flex items-center gap-2 px-4 py-3 rounded-2xl rounded-tl-sm"
                style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(34,211,238,0.08)' }}>
                <div className="flex gap-1">
                  {[0, 0.2, 0.4].map((d, i) => (
                    <span key={i} className="w-1.5 h-1.5 rounded-full bg-cyan animate-bounce"
                      style={{ backgroundColor: '#22D3EE', animationDelay: `${d}s`, opacity: 0.7 }} />
                  ))}
                </div>
                <span className="text-xs italic text-white/30">Analyzing weather patterns…</span>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
        <div ref={messagesEndRef} />
      </div>

      {/* Suggestions Chips */}
      <div className="px-5 py-3 flex-shrink-0" style={{ borderTop: '1px solid rgba(255,255,255,0.04)' }}>
        <div className="flex items-center gap-1.5 text-[10px] text-white/30 mb-2">
          <Zap className="w-3 h-3" />
          <span>Quick questions:</span>
        </div>
        <div className="flex gap-2 overflow-x-auto pb-1 no-scrollbar">
          {SUGGESTIONS.map((s) => (
            <button
              key={s}
              onClick={() => handleSend(s)}
              disabled={isTyping}
              className="text-[11px] px-3 py-1.5 rounded-full whitespace-nowrap transition-all duration-200 hover:scale-[1.02] active:scale-95"
              style={{
                background: 'rgba(34,211,238,0.05)',
                border: '1px solid rgba(34,211,238,0.12)',
                color: 'rgba(255,255,255,0.5)',
                opacity: isTyping ? 0.4 : 1,
              }}
            >
              {s}
            </button>
          ))}
        </div>
      </div>

      {/* Input */}
      <form
        onSubmit={(e) => { e.preventDefault(); handleSend(input); }}
        className="flex gap-2 px-5 pb-5 pt-2 flex-shrink-0"
      >
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Ask anything about the weather…"
          disabled={isTyping}
          className="flex-1 rounded-xl px-4 py-2.5 text-sm text-white placeholder-white/25 focus:outline-none transition-all"
          style={{
            background: 'rgba(255,255,255,0.04)',
            border: '1px solid rgba(255,255,255,0.07)',
          }}
          onFocus={(e) => {
            e.target.style.border = '1px solid rgba(34,211,238,0.25)';
            e.target.style.boxShadow = '0 0 0 1px rgba(34,211,238,0.1)';
          }}
          onBlur={(e) => {
            e.target.style.border = '1px solid rgba(255,255,255,0.07)';
            e.target.style.boxShadow = 'none';
          }}
        />
        <button
          type="submit"
          disabled={!input.trim() || isTyping}
          className="w-10 h-10 rounded-xl flex items-center justify-center transition-all duration-200 hover:scale-105 active:scale-95 shrink-0"
          style={{
            background: input.trim() && !isTyping ? '#22D3EE' : 'rgba(34,211,238,0.2)',
            boxShadow: input.trim() && !isTyping ? '0 0 20px rgba(34,211,238,0.3)' : 'none',
            cursor: !input.trim() || isTyping ? 'not-allowed' : 'pointer',
          }}
        >
          <Send className="w-4 h-4" style={{ color: input.trim() && !isTyping ? '#060810' : 'rgba(34,211,238,0.5)' }} />
        </button>
      </form>
    </div>
  );
}
