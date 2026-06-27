'use client';

import { useState, useRef, useEffect } from 'react';
import { Search, MapPin, Bell, Settings, User, LogOut, Moon, Sun, Thermometer, X, Check, ChevronRight } from 'lucide-react';
import { useTheme } from '@/lib/theme-provider';
import { useAuth } from '@/lib/auth-context';
import AuthModal from './AuthModal';

interface NavigationProps {
  searchQuery: string;
  onSearchChange: (q: string) => void;
  suggestions: any[];
  showSuggestions: boolean;
  onSuggestionClick: (s: any) => void;
  onSearchBlur: () => void;
  locationName: string;
  unit?: 'C' | 'F';
  onUnitChange?: (u: 'C' | 'F') => void;
}

interface Notification {
  id: number;
  title: string;
  desc: string;
  time: string;
  read: boolean;
}

const mockNotifications: Notification[] = [
  { id: 1, title: 'Storm Alert', desc: 'Heavy rain expected in your area within 2 hours', time: '5m ago', read: false },
  { id: 2, title: 'Heat Advisory', desc: 'Temperature to reach 38°C tomorrow afternoon', time: '1h ago', read: false },
  { id: 3, title: 'Air Quality Drop', desc: 'AQI index rising — sensitive groups take caution', time: '3h ago', read: true },
  { id: 4, title: 'Wind Warning', desc: 'Gusts up to 65 km/h forecast for coastal regions', time: '1d ago', read: true },
];

export default function Navigation({
  searchQuery, onSearchChange, suggestions,
  showSuggestions, onSuggestionClick, onSearchBlur,
  locationName, unit: externalUnit, onUnitChange,
}: NavigationProps) {
  const { theme, toggleTheme } = useTheme();
  const { user, logout } = useAuth();
  const ref = useRef<HTMLDivElement>(null);
  const [showNotifications, setShowNotifications] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [showProfile, setShowProfile] = useState(false);
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [showPreferencesModal, setShowPreferencesModal] = useState(false);
  const [showSignOutConfirm, setShowSignOutConfirm] = useState(false);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [localUnit, setLocalUnit] = useState<'C' | 'F'>('C');
  const [notifications, setNotifications] = useState<Notification[]>(mockNotifications);
  const unit = externalUnit ?? localUnit;
  const setUnit = onUnitChange ?? setLocalUnit;
  const notifRef = useRef<HTMLDivElement>(null);
  const settingsRef = useRef<HTMLDivElement>(null);
  const profileRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) onSearchBlur();
      if (notifRef.current && !notifRef.current.contains(e.target as Node)) setShowNotifications(false);
      if (settingsRef.current && !settingsRef.current.contains(e.target as Node)) setShowSettings(false);
      if (profileRef.current && !profileRef.current.contains(e.target as Node)) setShowProfile(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [onSearchBlur]);

  const unreadCount = notifications.filter(n => !n.read).length;

  const markAllRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
  };

  return (
    <nav
      className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-6 py-4"
      style={{
        background: 'rgba(9,9,11,0.75)',
        backdropFilter: 'blur(24px)',
        borderBottom: '1px solid rgba(255,255,255,0.06)',
      }}
    >
      <div className="flex items-center gap-2.5">
        <svg width="28" height="32" viewBox="0 0 28 32" fill="none">
          <path d="M14 0C14 0 2 14 2 22C2 28.6274 7.37258 32 14 32C20.6274 32 26 28.6274 26 22C26 14 14 0 14 0Z" fill="url(#dropGrad)" />
          <path d="M14 2C14 2 4 15 4 22C4 27.5228 8.47715 30 14 30C19.5228 30 24 27.5228 24 22C24 15 14 2 14 2Z" fill="url(#dropInner)" />
          <path d="M10 22C10 18 14 14 14 14C14 14 18 18 18 22C18 24.2091 16.2091 26 14 26C11.7909 26 10 24.2091 10 22Z" fill="rgba(255,255,255,0.15)" />
          <defs>
            <linearGradient id="dropGrad" x1="14" y1="0" x2="14" y2="32" gradientUnits="userSpaceOnUse">
              <stop stopColor="#f97316" />
              <stop offset="1" stopColor="#ea580c" />
            </linearGradient>
            <linearGradient id="dropInner" x1="14" y1="2" x2="14" y2="30" gradientUnits="userSpaceOnUse">
              <stop stopColor="#fb923c" />
              <stop offset="1" stopColor="#f97316" />
            </linearGradient>
          </defs>
        </svg>
        <span
          className="text-white font-bold tracking-tight text-base select-none"
          style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}
        >
          Rain <span style={{ color: '#fb923c' }}>Byte</span>
        </span>
      </div>

      <div ref={ref} className="relative flex-1 max-w-sm mx-8">
        <div
          className="flex items-center gap-2 px-4 py-2 rounded-xl"
          style={{
            background: 'rgba(255,255,255,0.05)',
            border: '1px solid rgba(255,255,255,0.08)',
          }}
        >
          <Search className="w-4 h-4 shrink-0" style={{ color: '#71717a' }} strokeWidth={1.5} />
          <input
            type="text"
            placeholder="Search city or coordinates…"
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            className="flex-1 bg-transparent text-sm outline-none"
            style={{ color: '#fff', fontFamily: 'Inter, sans-serif' }}
          />
          <div
            className="text-xs px-1.5 py-0.5 rounded"
            style={{
              background: 'rgba(255,255,255,0.06)',
              border: '1px solid rgba(255,255,255,0.1)',
              color: '#71717a',
              fontFamily: 'Inter, sans-serif',
            }}
          >
            ⌘K
          </div>
        </div>
        {showSuggestions && suggestions.length > 0 && (
          <div
            className="absolute top-full left-0 right-0 mt-2 rounded-2xl overflow-hidden"
            style={{
              background: 'rgba(9,9,11,0.95)',
              border: '1px solid rgba(255,255,255,0.1)',
              backdropFilter: 'blur(24px)',
              boxShadow: '0 20px 60px rgba(0,0,0,0.5)',
            }}
          >
            {suggestions.map((s: any, i: number) => (
              <button
                key={i}
                onClick={() => onSuggestionClick(s)}
                className="w-full flex items-center gap-3 px-4 py-3 text-left text-sm transition-all hover:bg-white/[0.04]"
                style={{ color: '#d4d4d8', fontFamily: 'Inter, sans-serif' }}
              >
                <MapPin className="w-3.5 h-3.5 shrink-0" style={{ color: '#52525b' }} />
                <span>{s.name}{s.admin1 ? `, ${s.admin1}` : ''}{s.country ? `, ${s.country}` : ''}</span>
                <span className="ml-auto text-xs" style={{ color: '#3f3f46' }}>{s.country_code}</span>
              </button>
            ))}
          </div>
        )}
      </div>

      <div className="flex items-center gap-2">
        <button
          className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-sm transition-all duration-200 hover:bg-white/[0.08]"
          style={{ color: '#A1A1AA', fontFamily: 'Inter, sans-serif' }}
          title="Current location"
        >
          <MapPin className="w-4 h-4" strokeWidth={1.5} />
          <span className="hidden sm:inline">{locationName}</span>
        </button>

        {/* Notification Bell */}
        <div ref={notifRef} className="relative">
          <button
            className="w-9 h-9 rounded-xl flex items-center justify-center transition-all duration-200 hover:bg-white/[0.08] relative"
            style={{ color: '#71717a' }}
            onClick={() => { setShowNotifications(prev => !prev); setShowSettings(false); setShowProfile(false); }}
          >
            <Bell className="w-4 h-4" strokeWidth={1.5} />
            {unreadCount > 0 && (
              <span
                className="absolute -top-0.5 -right-0.5 w-4 h-4 rounded-full flex items-center justify-center text-[9px] font-bold"
                style={{ background: '#f97316', color: 'white' }}
              >
                {unreadCount}
              </span>
            )}
          </button>
          {showNotifications && (
            <div
              className="absolute top-full right-0 mt-3 w-80 rounded-2xl overflow-hidden"
              style={{
                background: 'rgba(9,9,11,0.96)',
                border: '1px solid rgba(255,255,255,0.1)',
                backdropFilter: 'blur(24px)',
                boxShadow: '0 20px 60px rgba(0,0,0,0.5)',
              }}
            >
              <div className="flex items-center justify-between px-4 py-3 border-b border-white/[0.06]">
                <span className="text-sm font-semibold text-white" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>Notifications</span>
                {unreadCount > 0 && (
                  <button
                    onClick={markAllRead}
                    className="text-[11px] font-medium transition-colors"
                    style={{ color: '#f97316' }}
                  >
                    Mark all read
                  </button>
                )}
              </div>
              <div className="max-h-72 overflow-y-auto">
                {notifications.length === 0 ? (
                  <div className="px-4 py-8 text-center text-sm" style={{ color: '#71717a' }}>No notifications</div>
                ) : (
                  notifications.map(n => (
                    <div
                      key={n.id}
                      className="flex gap-3 px-4 py-3 transition-all hover:bg-white/[0.03] cursor-pointer"
                      style={{ borderBottom: '1px solid rgba(255,255,255,0.04)' }}
                      onClick={() => {
                        setNotifications(prev => prev.map(p => p.id === n.id ? { ...p, read: true } : p));
                      }}
                    >
                      <div className="w-2 h-2 rounded-full mt-1.5 shrink-0" style={{ background: n.read ? 'rgba(255,255,255,0.15)' : '#f97316' }} />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-white truncate">{n.title}</p>
                        <p className="text-xs mt-0.5" style={{ color: '#a1a1aa' }}>{n.desc}</p>
                        <p className="text-[10px] mt-1" style={{ color: '#52525b' }}>{n.time}</p>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>

        {/* Settings */}
        <div ref={settingsRef} className="relative">
          <button
            className="w-9 h-9 rounded-xl flex items-center justify-center transition-all duration-200 hover:bg-white/[0.08]"
            style={{ color: '#71717a' }}
            onClick={() => { setShowSettings(prev => !prev); setShowNotifications(false); setShowProfile(false); }}
          >
            <Settings className="w-4 h-4" strokeWidth={1.5} />
          </button>
          {showSettings && (
            <div
              className="absolute top-full right-0 mt-3 w-64 rounded-2xl overflow-hidden"
              style={{
                background: 'rgba(9,9,11,0.96)',
                border: '1px solid rgba(255,255,255,0.1)',
                backdropFilter: 'blur(24px)',
                boxShadow: '0 20px 60px rgba(0,0,0,0.5)',
              }}
            >
              <div className="px-4 py-3 border-b border-white/[0.06]">
                <span className="text-sm font-semibold text-white" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>Settings</span>
              </div>
              <div className="p-2">
                <div className="flex items-center justify-between px-3 py-2.5 rounded-xl hover:bg-white/[0.04] transition-colors">
                  <div className="flex items-center gap-2.5">
                    <Thermometer className="w-4 h-4" style={{ color: '#a1a1aa' }} strokeWidth={1.5} />
                    <span className="text-sm" style={{ color: '#d4d4d8', fontFamily: 'Inter, sans-serif' }}>Temperature</span>
                  </div>
                  <div className="flex items-center gap-1 bg-white/[0.06] rounded-lg p-0.5">
                    <button
                      onClick={() => setUnit('C')}
                      className="px-2.5 py-1 rounded-md text-xs font-medium transition-all"
                      style={{
                        background: unit === 'C' ? '#f97316' : 'transparent',
                        color: unit === 'C' ? 'white' : '#71717a',
                      }}
                    >°C</button>
                    <button
                      onClick={() => setUnit('F')}
                      className="px-2.5 py-1 rounded-md text-xs font-medium transition-all"
                      style={{
                        background: unit === 'F' ? '#f97316' : 'transparent',
                        color: unit === 'F' ? 'white' : '#71717a',
                      }}
                    >°F</button>
                  </div>
                </div>
                <button
                  className="w-full flex items-center justify-between px-3 py-2.5 rounded-xl hover:bg-white/[0.04] transition-colors"
                  style={{ color: '#d4d4d8' }}
                  onClick={toggleTheme}
                >
                  <div className="flex items-center gap-2.5">
                    {theme === 'dark' ? <Moon className="w-4 h-4" style={{ color: '#a1a1aa' }} strokeWidth={1.5} /> : <Sun className="w-4 h-4" style={{ color: '#a1a1aa' }} strokeWidth={1.5} />}
                    <span className="text-sm" style={{ fontFamily: 'Inter, sans-serif' }}>{theme === 'dark' ? 'Dark Mode' : 'Light Mode'}</span>
                  </div>
                  <div
                    className="w-5 h-5 rounded flex items-center justify-center cursor-pointer"
                    style={{ background: theme === 'dark' ? 'rgba(249,115,22,0.2)' : 'rgba(255,255,255,0.08)' }}
                  >
                    {theme === 'dark' ? <Check className="w-3 h-3" style={{ color: '#f97316' }} strokeWidth={2.5} /> : <Sun className="w-3 h-3" style={{ color: '#71717a' }} strokeWidth={2.5} />}
                  </div>
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Avatar */}
        <div ref={profileRef} className="relative">
          <button
            className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-semibold transition-opacity hover:opacity-80"
            style={{
              background: user ? 'linear-gradient(135deg, #f97316, #ea580c)' : 'linear-gradient(135deg, #6366f1, #8b5cf6)',
              color: 'white',
              fontFamily: "'Plus Jakarta Sans', sans-serif",
            }}
            onClick={() => {
              if (!user) { setShowAuthModal(true); return; }
              setShowProfile(prev => !prev); setShowNotifications(false); setShowSettings(false);
            }}
          >
            {user ? user.initials : '?'}
          </button>
          {showProfile && user && (
            <div
              className="absolute top-full right-0 mt-3 w-56 rounded-2xl overflow-hidden"
              style={{
                background: 'rgba(9,9,11,0.96)',
                border: '1px solid rgba(255,255,255,0.1)',
                backdropFilter: 'blur(24px)',
                boxShadow: '0 20px 60px rgba(0,0,0,0.5)',
              }}
            >
              <div className="px-4 py-3 border-b border-white/[0.06]">
                <p className="text-sm font-semibold text-white" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>{user.username}</p>
                <p className="text-xs mt-0.5" style={{ color: '#71717a' }}>{user.email}</p>
              </div>
              <div className="p-2">
                <button
                  className="w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-sm hover:bg-white/[0.04] transition-colors"
                  style={{ color: '#d4d4d8' }}
                  onClick={() => { setShowProfile(false); setShowProfileModal(true); }}
                >
                  <User className="w-4 h-4" style={{ color: '#a1a1aa' }} strokeWidth={1.5} />
                  My Profile
                </button>
                <button
                  className="w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-sm hover:bg-white/[0.04] transition-colors"
                  style={{ color: '#d4d4d8' }}
                  onClick={() => { setShowProfile(false); setShowPreferencesModal(true); }}
                >
                  <Settings className="w-4 h-4" style={{ color: '#a1a1aa' }} strokeWidth={1.5} />
                  Preferences
                </button>
                <button
                  className="w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-sm hover:bg-white/[0.04] transition-colors"
                  style={{ color: '#ef4444' }}
                  onClick={() => { setShowProfile(false); setShowSignOutConfirm(true); }}
                >
                  <LogOut className="w-4 h-4" strokeWidth={1.5} />
                  Sign Out
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Profile Modal */}
      {showProfileModal && user && (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center"
          style={{ background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(8px)' }}
          onClick={() => setShowProfileModal(false)}
        >
          <div
            className="w-full max-w-sm rounded-2xl overflow-hidden"
            style={{
              background: 'rgba(9,9,11,0.97)',
              border: '1px solid rgba(255,255,255,0.1)',
              boxShadow: '0 40px 80px rgba(0,0,0,0.6)',
            }}
            onClick={e => e.stopPropagation()}
          >
            <div className="flex items-center justify-between px-5 py-4 border-b border-white/[0.06]">
              <span className="text-sm font-semibold text-white" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>My Profile</span>
              <button onClick={() => setShowProfileModal(false)} className="w-7 h-7 rounded-lg flex items-center justify-center hover:bg-white/[0.08] transition-colors">
                <X className="w-4 h-4" style={{ color: '#71717a' }} />
              </button>
            </div>
            <div className="p-5 space-y-5">
              <div className="flex items-center gap-4">
                <div
                  className="w-14 h-14 rounded-full flex items-center justify-center text-lg font-bold"
                  style={{
                    background: 'linear-gradient(135deg, #f97316, #ea580c)',
                    color: 'white',
                    fontFamily: "'Plus Jakarta Sans', sans-serif",
                  }}
                >{user.initials}</div>
                <div>
                  <p className="text-base font-semibold text-white" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>{user.username}</p>
                  <p className="text-xs mt-0.5" style={{ color: '#71717a' }}>{user.email}</p>
                  <p className="text-[10px] mt-1" style={{ color: '#52525b' }}>Joined June 2026</p>
                </div>
              </div>
              <div className="grid grid-cols-3 gap-2">
                {[
                  { label: 'Saved', value: String(user.savedLocations?.length || 0) },
                  { label: 'Records', value: String(user.climateRecords?.length || 0) },
                  { label: 'Searches', value: '24' },
                ].map(s => (
                  <div key={s.label} className="text-center py-2.5 rounded-xl" style={{ background: 'rgba(255,255,255,0.04)' }}>
                    <p className="text-lg font-bold text-white" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>{s.value}</p>
                    <p className="text-[10px] mt-0.5" style={{ color: '#71717a' }}>{s.label}</p>
                  </div>
                ))}
              </div>
              <div className="space-y-1">
                <p className="text-xs font-medium mb-2" style={{ color: '#a1a1aa' }}>Account Settings</p>
                {['Edit Display Name', 'Change Avatar', 'Notification Preferences'].map(item => (
                  <button
                    key={item}
                    className="w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-sm hover:bg-white/[0.04] transition-colors"
                    style={{ color: '#d4d4d8' }}
                  >
                    {item}
                    <ChevronRight className="w-3.5 h-3.5" style={{ color: '#52525b' }} />
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Preferences Modal */}
      {showPreferencesModal && (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center"
          style={{ background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(8px)' }}
          onClick={() => setShowPreferencesModal(false)}
        >
          <div
            className="w-full max-w-sm rounded-2xl overflow-hidden"
            style={{
              background: 'rgba(9,9,11,0.97)',
              border: '1px solid rgba(255,255,255,0.1)',
              boxShadow: '0 40px 80px rgba(0,0,0,0.6)',
            }}
            onClick={e => e.stopPropagation()}
          >
            <div className="flex items-center justify-between px-5 py-4 border-b border-white/[0.06]">
              <span className="text-sm font-semibold text-white" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>Preferences</span>
              <button onClick={() => setShowPreferencesModal(false)} className="w-7 h-7 rounded-lg flex items-center justify-center hover:bg-white/[0.08] transition-colors">
                <X className="w-4 h-4" style={{ color: '#71717a' }} />
              </button>
            </div>
            <div className="p-5 space-y-4">
              <div className="flex items-center justify-between px-3 py-3 rounded-xl hover:bg-white/[0.04] transition-colors">
                <div className="flex items-center gap-2.5">
                  <Thermometer className="w-4 h-4" style={{ color: '#a1a1aa' }} strokeWidth={1.5} />
                  <span className="text-sm" style={{ color: '#d4d4d8' }}>Temperature Unit</span>
                </div>
                <div className="flex items-center gap-1 bg-white/[0.06] rounded-lg p-0.5">
                  <button
                    onClick={() => setUnit('C')}
                    className="px-2.5 py-1 rounded-md text-xs font-medium transition-all"
                    style={{ background: unit === 'C' ? '#f97316' : 'transparent', color: unit === 'C' ? 'white' : '#71717a' }}
                  >°C</button>
                  <button
                    onClick={() => setUnit('F')}
                    className="px-2.5 py-1 rounded-md text-xs font-medium transition-all"
                    style={{ background: unit === 'F' ? '#f97316' : 'transparent', color: unit === 'F' ? 'white' : '#71717a' }}
                  >°F</button>
                </div>
              </div>
              <button className="w-full flex items-center justify-between px-3 py-3 rounded-xl hover:bg-white/[0.04] transition-colors" onClick={toggleTheme}>
                <div className="flex items-center gap-2.5">
                  {theme === 'dark' ? <Moon className="w-4 h-4" style={{ color: '#a1a1aa' }} strokeWidth={1.5} /> : <Sun className="w-4 h-4" style={{ color: '#a1a1aa' }} strokeWidth={1.5} />}
                  <span className="text-sm" style={{ color: '#d4d4d8' }}>{theme === 'dark' ? 'Dark Mode' : 'Light Mode'}</span>
                </div>
                <div className="w-5 h-5 rounded flex items-center justify-center" style={{ background: theme === 'dark' ? 'rgba(249,115,22,0.2)' : 'rgba(255,255,255,0.08)' }}>
                  {theme === 'dark' ? <Check className="w-3 h-3" style={{ color: '#f97316' }} strokeWidth={2.5} /> : <Sun className="w-3 h-3" style={{ color: '#71717a' }} strokeWidth={2.5} />}
                </div>
              </button>
              <div className="flex items-center justify-between px-3 py-3 rounded-xl hover:bg-white/[0.04] transition-colors">
                <div className="flex items-center gap-2.5">
                  <Bell className="w-4 h-4" style={{ color: '#a1a1aa' }} strokeWidth={1.5} />
                  <span className="text-sm" style={{ color: '#d4d4d8' }}>Push Notifications</span>
                </div>
                <div
                  className="w-10 h-5 rounded-full relative cursor-pointer transition-colors"
                  style={{ background: 'rgba(249,115,22,0.5)' }}
                  onClick={() => {}}
                >
                  <div className="w-3.5 h-3.5 rounded-full bg-white absolute top-0.5 right-0.5 transition-all" />
                </div>
              </div>
              <div className="flex items-center justify-between px-3 py-3 rounded-xl hover:bg-white/[0.04] transition-colors">
                <div className="flex items-center gap-2.5">
                  <MapPin className="w-4 h-4" style={{ color: '#a1a1aa' }} strokeWidth={1.5} />
                  <span className="text-sm" style={{ color: '#d4d4d8' }}>Default Location</span>
                </div>
                <span className="text-xs" style={{ color: '#52525b' }}>Auto</span>
              </div>
              <div className="flex items-center justify-between px-3 py-3 rounded-xl hover:bg-white/[0.04] transition-colors">
                <div className="flex items-center gap-2.5">
                  <Sun className="w-4 h-4" style={{ color: '#a1a1aa' }} strokeWidth={1.5} />
                  <span className="text-sm" style={{ color: '#d4d4d8' }}>Language</span>
                </div>
                <span className="text-xs" style={{ color: '#52525b' }}>English</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Sign Out Confirmation */}
      {showSignOutConfirm && (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center"
          style={{ background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(8px)' }}
          onClick={() => setShowSignOutConfirm(false)}
        >
          <div
            className="w-full max-w-xs rounded-2xl overflow-hidden"
            style={{
              background: 'rgba(9,9,11,0.97)',
              border: '1px solid rgba(255,255,255,0.1)',
              boxShadow: '0 40px 80px rgba(0,0,0,0.6)',
            }}
            onClick={e => e.stopPropagation()}
          >
            <div className="p-6 text-center space-y-3">
              <div
                className="w-12 h-12 rounded-full flex items-center justify-center mx-auto"
                style={{ background: 'rgba(239,68,68,0.15)' }}
              >
                <LogOut className="w-5 h-5" style={{ color: '#ef4444' }} strokeWidth={1.5} />
              </div>
              <p className="text-base font-semibold text-white" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>Sign Out</p>
              <p className="text-xs" style={{ color: '#71717a' }}>Are you sure you want to sign out? Your location and preferences will be reset.</p>
            </div>
            <div className="flex gap-2 px-6 pb-6">
              <button
                onClick={() => setShowSignOutConfirm(false)}
                className="flex-1 px-4 py-2.5 rounded-xl text-sm font-medium transition-all hover:bg-white/[0.08]"
                style={{ color: '#a1a1aa', background: 'rgba(255,255,255,0.05)', fontFamily: 'Inter, sans-serif' }}
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  logout();
                  setShowSignOutConfirm(false);
                  setShowProfileModal(false);
                  setShowPreferencesModal(false);
                  setShowProfile(false);
                  setShowSettings(false);
                  setShowNotifications(false);
                  setUnit('C');
                  setNotifications(mockNotifications);
                }}
                className="flex-1 px-4 py-2.5 rounded-xl text-sm font-medium transition-all"
                style={{ background: '#ef4444', color: 'white', fontFamily: 'Inter, sans-serif' }}
              >
                Sign Out
              </button>
            </div>
          </div>
        </div>
      )}
    </nav>
  );
}
