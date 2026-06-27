'use client';

import { useState, useRef, useEffect } from 'react';
import { Send, Sparkles, Zap } from 'lucide-react';

interface Message {
  role: 'user' | 'assistant';
  text: string;
  typing?: boolean;
}

const SUGGESTIONS = [
  'Can I play football tomorrow?',
  'Will my flight be affected tonight?',
  'Is tonight good for astrophotography?',
  'When will the rain stop?',
];

const ANSWERS: Record<string, string> = {
  'Can I play football tomorrow?':
    'Tomorrow looks excellent for football! Morning (before 11 AM) is optimal with 22°C, low humidity at 52%, and a light 8 km/h breeze. Afternoon conditions are slightly warmer at 29°C but still very playable. The pitch will be dry — no rain expected until Sunday evening. Comfort score for outdoor sport peaks at 86/100 around 9–11 AM. Lace up early.',
  'Will my flight be affected tonight?':
    'Your evening flights from Heathrow face minimal disruption. Cloud ceiling remains above 1,200m through 23:00. Wind gusts peak at 22 km/h around 19:30 — within normal operating parameters. Visibility stays above 10 km. There\'s a 12% probability of a 15–30 minute delay on arrivals from the southwest due to the approaching frontal system. Overall: green light.',
  'Is tonight good for astrophotography?':
    'Tonight has exceptional potential — but timing is everything. Clear skies between 22:30 and 01:15 offer a Bortle 4 window. The Moon sets at 22:14, leaving 3 hours of dark sky. Seeing conditions score 88/100. The Milky Way core will be 28° above the horizon toward the south. Rain moves in after 01:30, so set your alarm for 23:00 and pack up by 01:15.',
  'When will the rain stop?':
    'The rain system clears in two phases. The initial light drizzle (18:00–19:30) gives way to heavier rain (20:00–21:45, peak 6 mm/hr). By 22:00, intensity drops to trace amounts. Full clear sky arrives at 23:15 ± 40 minutes. Model consensus is 91% on the 23:15 clearing. Tomorrow morning wakes up completely dry with 8°C dew point and great visibility.',
};

function TypingDots() {
  return (
    <span className="inline-flex gap-1 items-center">
      {[0, 1, 2].map((i) => (
        <span key={i} className="w-1.5 h-1.5 rounded-full" style={{ background: '#71717a', animation: `bounce 1.2s ease-in-out ${i * 0.2}s infinite` }} />
      ))}
      <style>{`@keyframes bounce { 0%,80%,100% { transform: translateY(0); } 40% { transform: translateY(-5px); } }`}</style>
    </span>
  );
}

export default function AIAssistantSection() {
  const [messages, setMessages] = useState<Message[]>([
    { role: 'assistant', text: 'Hello! I\'m RainyByte\'s AI Weather Assistant. Ask me anything about current conditions, your plans, or weather-sensitive activities.' },
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const endRef = useRef<HTMLDivElement>(null);

  useEffect(() => { endRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [messages]);

  const sendMessage = (text: string) => {
    if (!text.trim() || loading) return;
    setMessages((m) => [...m, { role: 'user', text }, { role: 'assistant', text: '', typing: true }]);
    setInput('');
    setLoading(true);

    const answer = ANSWERS[text] || `Great question about "${text}". Based on current atmospheric models and your location, conditions are generally favorable. The AI is analyzing 847 data points from nearby weather stations, satellites, and radar to give you the most accurate insight. Forecast confidence is currently 94%.`;

    setTimeout(() => {
      setMessages((m) => [...m.slice(0, -1), { role: 'assistant', text: answer }]);
      setLoading(false);
    }, 1400);
  };

  return (
    <section className="section-container pb-6">
      <div className="rounded-2xl overflow-hidden" style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.07)' }}>
        <div className="flex items-center justify-between px-6 py-4" style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-xl flex items-center justify-center" style={{ background: 'linear-gradient(135deg, #f97316, #fb923c)' }}>
              <Sparkles className="w-4 h-4 text-white" strokeWidth={1.5} />
            </div>
            <div>
              <h2 className="font-semibold" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontSize: 16, color: '#e4e4e7' }}>
                AI Weather Assistant
              </h2>
              <p style={{ fontFamily: 'Inter, sans-serif', fontSize: 11, color: '#52525b' }}>
                Powered by RainyByte Neural Engine
              </p>
            </div>
          </div>
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs" style={{ background: 'rgba(34,197,94,0.1)', border: '1px solid rgba(34,197,94,0.2)', color: '#4ade80', fontFamily: 'Inter, sans-serif' }}>
            <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />
            Online
          </div>
        </div>

        <div className="px-6 py-5 space-y-4" style={{ height: 320, overflowY: 'auto', scrollbarWidth: 'none' }}>
          {messages.map((m, i) => (
            <div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
              {m.role === 'assistant' && (
                <div className="w-7 h-7 rounded-lg flex items-center justify-center shrink-0 mr-2.5 mt-0.5" style={{ background: 'linear-gradient(135deg, #f97316, #fb923c)' }}>
                  <Zap className="w-3.5 h-3.5 text-white" strokeWidth={1.5} />
                </div>
              )}
              <div
                className="max-w-[75%] px-4 py-3 rounded-2xl text-sm"
                style={{
                  background: m.role === 'user' ? 'rgba(249,115,22,0.15)' : 'rgba(255,255,255,0.04)',
                  border: `1px solid ${m.role === 'user' ? 'rgba(249,115,22,0.25)' : 'rgba(255,255,255,0.07)'}`,
                  color: '#d4d4d8',
                  fontFamily: 'Inter, sans-serif',
                  lineHeight: 1.65,
                  borderBottomRightRadius: m.role === 'user' ? 6 : undefined,
                  borderBottomLeftRadius: m.role === 'assistant' ? 6 : undefined,
                }}
              >
                {m.typing ? <TypingDots /> : m.text}
              </div>
            </div>
          ))}
          <div ref={endRef} />
        </div>

        <div className="px-6 pb-3 flex gap-2 overflow-x-auto" style={{ scrollbarWidth: 'none' }}>
          {SUGGESTIONS.map((s) => (
            <button
              key={s}
              onClick={() => sendMessage(s)}
              disabled={loading}
              className="shrink-0 text-xs px-3 py-1.5 rounded-xl transition-all duration-200 hover:bg-white/[0.08] disabled:opacity-40"
              style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', color: '#71717a', fontFamily: 'Inter, sans-serif', whiteSpace: 'nowrap' }}
            >
              {s}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-3 px-4 py-3 mx-4 mb-4 rounded-2xl" style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)' }}>
          <input
            type="text"
            placeholder="Ask anything about the weather…"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && sendMessage(input)}
            disabled={loading}
            className="flex-1 bg-transparent text-sm outline-none"
            style={{ color: '#e4e4e7', fontFamily: 'Inter, sans-serif' }}
          />
          <button
            onClick={() => sendMessage(input)}
            disabled={loading || !input.trim()}
            className="w-8 h-8 rounded-xl flex items-center justify-center transition-all duration-200 hover:scale-110 disabled:opacity-30"
            style={{ background: 'linear-gradient(135deg, #f97316, #fb923c)' }}
          >
            <Send className="w-3.5 h-3.5 text-white" strokeWidth={2} />
          </button>
        </div>
      </div>
    </section>
  );
}
