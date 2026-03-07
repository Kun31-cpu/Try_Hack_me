import React, { useState, useEffect, useCallback, useRef } from 'react';
import { 
  Shield, 
  Terminal, 
  Trophy, 
  PlusCircle, 
  Layout, 
  Search, 
  User as UserIcon, 
  LogOut, 
  ChevronRight, 
  ChevronLeft,
  Flag, 
  Lightbulb,
  Activity,
  Globe,
  Lock,
  Cpu,
  Database,
  BookOpen,
  Zap,
  Clock,
  BarChart3,
  CheckCircle2,
  Trash2,
  Bell,
  Flame,
  Settings,
  Moon,
  Briefcase,
  GraduationCap,
  Bookmark,
  Award,
  FileText,
  ShoppingCart,
  Ticket,
  MessageSquare,
  MessageCircle,
  ExternalLink,
  Copy,
  ChevronDown,
  Sun,
  Gamepad2,
  Sword,
  Target,
  Code2,
  Users,
  Rocket,
  X,
  Monitor,
  Video,
  RotateCcw,
  MoreHorizontal,
  Plus,
  Cloud,
  CreditCard,
  Heart,
  ShoppingBag,
  Vibrate,
  Github,
  Linkedin,
  Twitter,
  Instagram,
  Network,
  Download,
  Crown,
  Share2,
  Camera,
  Facebook,
  Save,
  Star
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import ReactMarkdown from 'react-markdown';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { User, Room, Task, SubmissionResponse } from './types';
import { getHint } from './services/geminiService';

import { io } from 'socket.io-client';

const socket = io();

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// --- Types & Constants ---

interface Toast {
  id: string;
  message: string;
  type: 'success' | 'error' | 'info';
}

// --- Components ---

const Toast = ({ message, type, onClose }: { message: string, type: 'success' | 'error' | 'info', onClose: () => void }) => {
  useEffect(() => {
    const timer = setTimeout(onClose, 3000);
    return () => clearTimeout(timer);
  }, [onClose]);

  const icons = {
    success: <CheckCircle2 className="w-5 h-5 text-emerald-400" />,
    error: <X className="w-5 h-5 text-red-400" />,
    info: <Bell className="w-5 h-5 text-blue-400" />
  };

  const bgColors = {
    success: 'bg-emerald-500/10 border-emerald-500/20',
    error: 'bg-red-500/10 border-red-500/20',
    info: 'bg-blue-500/10 border-blue-500/20'
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20, scale: 0.9 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, scale: 0.9 }}
      className={cn(
        "fixed bottom-6 right-6 z-[100] flex items-center gap-3 px-4 py-3 rounded-xl border shadow-2xl backdrop-blur-xl",
        bgColors[type]
      )}
    >
      {icons[type]}
      <p className="text-sm font-bold text-app-heading">{message}</p>
      <button 
        onClick={onClose}
        className="ml-2 p-1 hover:bg-app-heading/5 rounded-lg transition-colors"
        aria-label="Close notification"
      >
        <X className="w-4 h-4 text-zinc-500" />
      </button>
    </motion.div>
  );
};

const LoadingSpinner = ({ size = 'md' }: { size?: 'sm' | 'md' | 'lg' }) => {
  const sizes = {
    sm: 'w-4 h-4 border-2',
    md: 'w-8 h-8 border-3',
    lg: 'w-12 h-12 border-4'
  };

  return (
    <div className={cn(
      "animate-spin rounded-full border-app-border border-t-[#a3e635]",
      sizes[size]
    )} />
  );
};

const LoadingOverlay = () => (
  <div className="fixed inset-0 z-[100] bg-black/60 backdrop-blur-sm flex items-center justify-center">
    <div className="flex flex-col items-center gap-4">
      <LoadingSpinner size="lg" />
      <p className="text-sm font-black text-white uppercase tracking-widest animate-pulse">Loading...</p>
    </div>
  </div>
);

const Navbar = ({ 
  user, 
  onLogout, 
  setView, 
  isDarkMode, 
  setIsDarkMode, 
  addToast,
  searchQuery,
  setSearchQuery,
  view,
  notifications,
  markNotificationsRead
}: { 
  user: User | null, 
  onLogout: () => void, 
  setView: (v: string) => void, 
  isDarkMode: boolean, 
  setIsDarkMode: (v: boolean) => void, 
  addToast: (m: string, t?: 'success' | 'error' | 'info') => void,
  searchQuery: string,
  setSearchQuery: (v: string) => void,
  view: string,
  notifications: any[],
  markNotificationsRead: () => void
}) => {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isDevelopDropdownOpen, setIsDevelopDropdownOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const [isPremiumModalOpen, setIsPremiumModalOpen] = useState(false);

  const handleGiveFeedback = () => {
    setView('feedback');
    setIsDropdownOpen(false);
  };

  return (
    <nav className="border-b border-app-border bg-app-card sticky top-0 z-50 transition-colors duration-300">
      <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
        <div className="flex items-center gap-6">
          <div 
            className="flex items-center gap-2 cursor-pointer group"
            onClick={() => setView('dashboard')}
          >
            <div className="flex items-center gap-2">
              <div className="relative">
                <Cloud className="w-10 h-10 text-app-heading fill-app-heading/10" />
                <div className="absolute inset-0 flex items-center justify-center">
                  <Shield className="w-5 h-5 text-[#a3e635]" />
                </div>
              </div>
              <div className="flex flex-col -gap-1">
                <span className="text-lg font-black leading-none text-app-heading tracking-tighter">Try</span>
                <span className="text-lg font-black leading-none text-app-heading tracking-tighter">HackMe</span>
              </div>
            </div>
          </div>
          
          <div className="hidden lg:flex items-center gap-4 text-[13px] font-bold">
            {/* Navigation moved to floating bar */}
          </div>
        </div>

        <div className="flex items-center gap-2 md:gap-4">
          {user ? (
            <>
              <div className="flex items-center gap-1 md:gap-3 mr-2">
                <div className="relative flex items-center group">
                  <div id="tour-search" className={cn(
                    "flex items-center bg-black/5 dark:bg-black/40 border border-app-border rounded-xl px-3 py-1.5 transition-all duration-300",
                    isSearchOpen ? "w-64 border-[#a3e635] ring-1 ring-[#a3e635]/20" : "w-10 overflow-hidden cursor-pointer hover:border-[#a3e635]/50"
                  )}
                  onClick={() => !isSearchOpen && setIsSearchOpen(true)}
                  >
                    <Search className={cn("w-4 h-4 flex-shrink-0 transition-colors", isSearchOpen ? "text-[#a3e635]" : "text-zinc-500")} />
                    <AnimatePresence>
                      {isSearchOpen && (
                        <motion.div
                          initial={{ width: 0, opacity: 0 }}
                          animate={{ width: '100%', opacity: 1 }}
                          exit={{ width: 0, opacity: 0 }}
                          className="ml-2 flex-1"
                        >
                          <input 
                            type="text"
                            placeholder="Search labs, paths..."
                            className="w-full bg-transparent border-none text-xs text-app-heading focus:outline-none placeholder:text-zinc-600"
                            autoFocus
                            value={searchQuery}
                            onChange={(e) => {
                              setSearchQuery(e.target.value);
                              if (view !== 'rooms') setView('rooms');
                            }}
                            onBlur={() => !searchQuery && setIsSearchOpen(false)}
                          />
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                </div>

                <div className="relative">
                  <button 
                    onClick={() => setIsNotificationsOpen(!isNotificationsOpen)}
                    className="p-2 text-app-text hover:text-app-heading hover:bg-app-heading/5 rounded-lg transition-colors relative"
                  >
                    <Bell className="w-5 h-5" />
                    {notifications.some(n => !n.read) && (
                      <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full border-2 border-app-card"></span>
                    )}
                  </button>
                  
                  <AnimatePresence>
                    {isNotificationsOpen && (
                      <>
                        <div className="fixed inset-0 z-40" onClick={() => setIsNotificationsOpen(false)} />
                        <motion.div 
                          initial={{ opacity: 0, y: 10, scale: 0.95 }}
                          animate={{ opacity: 1, y: 0, scale: 1 }}
                          exit={{ opacity: 0, y: 10, scale: 0.95 }}
                          className="absolute right-0 mt-2 w-80 bg-app-card border border-app-border rounded-xl shadow-2xl z-50 overflow-hidden"
                        >
                          <div className="px-4 py-3 border-b border-app-border flex items-center justify-between">
                            <h4 className="text-xs font-black text-app-heading uppercase tracking-widest">Notifications</h4>
                            <button 
                              onClick={markNotificationsRead}
                              className="text-[10px] text-zinc-500 hover:text-app-heading uppercase font-bold"
                            >
                              Mark all read
                            </button>
                          </div>
                          <div className="max-h-96 overflow-y-auto">
                            {notifications.length > 0 ? notifications.map(n => (
                              <div key={n.id} className={cn(
                                "px-4 py-3 border-b border-app-border hover:bg-app-heading/5 transition-colors cursor-pointer",
                                !n.read && "bg-app-heading/5"
                              )}>
                                <div className="flex gap-3">
                                  <div className={cn(
                                    "w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0",
                                    n.type === 'solve' ? "bg-emerald-500/10 text-emerald-500" : 
                                    n.type === 'new_room' ? "bg-[#a3e635]/10 text-[#a3e635]" :
                                    n.type === 'leaderboard' ? "bg-yellow-500/10 text-yellow-500" :
                                    "bg-zinc-500/10 text-zinc-500"
                                  )}>
                                    {n.type === 'solve' ? <CheckCircle2 className="w-4 h-4" /> : 
                                     n.type === 'new_room' ? <PlusCircle className="w-4 h-4" /> :
                                     n.type === 'leaderboard' ? <Trophy className="w-4 h-4" /> :
                                     <Bell className="w-4 h-4" />}
                                  </div>
                                  <div>
                                    <p className="text-xs text-app-text leading-relaxed">
                                      <span className="font-bold text-app-heading">{n.title}:</span> {n.message}
                                    </p>
                                    <span className="text-[10px] text-zinc-500 mt-1 block">
                                      {new Date(n.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                    </span>
                                  </div>
                                </div>
                              </div>
                            )) : (
                              <div className="p-8 text-center text-zinc-500 text-xs font-medium">
                                No notifications yet.
                              </div>
                            )}
                          </div>
                          <button className="w-full py-2 text-[10px] text-zinc-500 hover:text-app-heading uppercase font-bold bg-black/5 dark:bg-black/20">View all notifications</button>
                        </motion.div>
                      </>
                    )}
                  </AnimatePresence>
                </div>

                <button 
                  onClick={() => setView('premium')}
                  className="hidden sm:flex px-4 py-1.5 bg-[#a3e635] hover:bg-[#bef264] text-black text-xs font-bold rounded-md transition-colors"
                >
                  Go Premium
                </button>

                <div className="flex items-center gap-1 px-2 py-1 hover:bg-app-heading/5 rounded-lg cursor-pointer transition-colors group">
                  <span className="text-lg font-bold text-app-text group-hover:text-app-heading">5</span>
                  <Flame className="w-5 h-5 text-[#a3e635]" />
                </div>
              </div>

              <div className="relative">
                <button 
                  id="tour-profile"
                  onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                  className="relative group"
                >
                  <div className="w-10 h-10 rounded-full border-2 border-emerald-500/30 group-hover:border-emerald-500 transition-all overflow-hidden">
                    <img 
                      src={user.avatar_url || `https://picsum.photos/seed/${user.username}/100/100`} 
                      alt={user.username}
                      className="w-full h-full object-cover"
                      referrerPolicy="no-referrer"
                    />
                  </div>
                </button>

                <AnimatePresence>
                  {isDropdownOpen && (
                    <>
                      <div 
                        className="fixed inset-0 z-40" 
                        onClick={() => setIsDropdownOpen(false)}
                      />
                      <motion.div 
                        initial={{ opacity: 0, y: 10, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 10, scale: 0.95 }}
                        className="absolute right-0 mt-2 w-64 bg-app-card border border-app-border rounded-xl shadow-2xl z-50 overflow-hidden py-2"
                      >
                        {/* Section 1 */}
                        <div className="px-2 pb-2 border-b border-app-border">
                          <button 
                            onClick={() => { setView('profile'); setIsDropdownOpen(false); }}
                            className="w-full flex items-center gap-3 px-3 py-2 text-app-text hover:text-app-heading hover:bg-app-heading/5 rounded-lg transition-colors text-sm font-bold"
                          >
                            <UserIcon className="w-4 h-4" />
                            View Profile
                          </button>
                          <button 
                            onClick={() => { setView('settings'); setIsDropdownOpen(false); }}
                            className="w-full flex items-center gap-3 px-3 py-2 text-app-text hover:text-app-heading hover:bg-app-heading/5 rounded-lg transition-colors text-sm font-bold"
                          >
                            <Settings className="w-4 h-4" />
                            Manage Account
                          </button>
                          <div className="flex items-center justify-between px-3 py-2 text-app-text text-sm font-bold">
                            <div className="flex items-center gap-3">
                              {isDarkMode ? <Moon className="w-4 h-4" /> : <Sun className="w-4 h-4" />}
                              Dark Mode
                            </div>
                            <button 
                              onClick={() => setIsDarkMode(!isDarkMode)}
                              className={cn(
                                "w-10 h-5 rounded-full relative transition-colors",
                                isDarkMode ? "bg-[#a3e635]" : "bg-zinc-300 dark:bg-zinc-700"
                              )}
                            >
                              <div className={cn(
                                "absolute top-1 w-3 h-3 rounded-full bg-white transition-all",
                                isDarkMode ? "left-6" : "left-1"
                              )} />
                            </button>
                          </div>
                        </div>

                        {/* Section 3 */}
                        <div className="px-2 py-2 border-b border-app-border">
                          <button 
                            onClick={() => { setView('saved'); setIsDropdownOpen(false); }}
                            className="w-full flex items-center justify-between px-3 py-2 text-app-text hover:text-app-heading hover:bg-app-heading/5 rounded-lg transition-colors text-sm font-bold"
                          >
                            <div className="flex items-center gap-3">
                              <Bookmark className="w-4 h-4" />
                              Saved
                            </div>
                          </button>
                          <button 
                            onClick={() => { setView('badges'); setIsDropdownOpen(false); }}
                            className="w-full flex items-center gap-3 px-3 py-2 text-app-text hover:text-app-heading hover:bg-app-heading/5 rounded-lg transition-colors text-sm font-bold"
                          >
                            <Award className="w-4 h-4" />
                            Badges
                          </button>
                        </div>

                        {/* Section 4 */}
                        <div className="px-2 py-2 border-b border-app-border">
                          <button 
                            onClick={handleGiveFeedback}
                            className="w-full flex items-center gap-3 px-3 py-2 text-app-text hover:text-app-heading hover:bg-app-heading/5 rounded-lg transition-colors text-sm font-bold"
                          >
                            <MessageCircle className="w-4 h-4" />
                            Give Feedback
                          </button>
                        </div>

                        {/* Section 6 */}
                        <div className="px-2 pt-2">
                          <button 
                            onClick={() => { onLogout(); setIsDropdownOpen(false); }}
                            className="w-full flex items-center gap-3 px-3 py-2 text-red-500 hover:bg-red-500/10 rounded-lg transition-colors text-sm font-bold"
                          >
                            <LogOut className="w-4 h-4" />
                            Logout
                          </button>
                        </div>
                      </motion.div>
                    </>
                  )}
                </AnimatePresence>
              </div>
            </>
          ) : (
            <button 
              onClick={() => setView('auth')}
              className="px-6 py-2 bg-[#a3e635] text-black text-sm font-black rounded-lg hover:bg-[#bef264] transition-all shadow-lg shadow-[#a3e635]/20"
            >
              Login
            </button>
          )}
        </div>
      </div>

      {/* Premium Modal */}
      <AnimatePresence>
        {isPremiumModalOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-black/80 backdrop-blur-sm"
              onClick={() => setIsPremiumModalOpen(false)}
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="relative w-full max-w-2xl bg-app-card border border-app-border rounded-3xl overflow-hidden shadow-2xl"
            >
              <button 
                onClick={() => setIsPremiumModalOpen(false)}
                className="absolute top-6 right-6 text-zinc-500 hover:text-app-heading transition-colors z-10"
              >
                <X className="w-6 h-6" />
              </button>

              <div className="grid grid-cols-1 md:grid-cols-2">
                <div className="p-10 bg-gradient-to-br from-[#a3e635] to-emerald-500 text-black">
                  <Rocket className="w-12 h-12 mb-6" />
                  <h2 className="text-3xl font-black mb-4 leading-tight">Level up your skills with Premium</h2>
                  <p className="font-medium opacity-80 mb-8">Get unlimited access to all labs, paths, and our AI mentor.</p>
                  <ul className="space-y-4">
                    {[
                      'Unlimited Lab Access',
                      'Private VPN Network',
                      'AI Mentor Assistance',
                      'Certificate of Completion',
                      'Priority Support'
                    ].map(feat => (
                      <li key={feat} className="flex items-center gap-2 text-sm font-bold">
                        <CheckCircle2 className="w-4 h-4" />
                        {feat}
                      </li>
                    ))}
                  </ul>
                </div>
                <div className="p-10 flex flex-col justify-center">
                  <div className="mb-8">
                    <span className="text-[10px] font-black text-zinc-500 uppercase tracking-widest block mb-2">Monthly Plan</span>
                    <div className="flex items-baseline gap-1">
                      <span className="text-4xl font-black text-app-heading">$14</span>
                      <span className="text-zinc-500 font-bold">/month</span>
                    </div>
                  </div>
                  <button className="w-full py-4 bg-[#a3e635] hover:bg-[#bef264] text-black font-black rounded-xl transition-all shadow-lg shadow-[#a3e635]/20 mb-4">
                    Start Learning Now
                  </button>
                  <p className="text-[10px] text-zinc-500 text-center font-medium">Cancel anytime. No hidden fees.</p>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </nav>
  );
};

const AuthPage = ({ onLogin }: { onLogin: (u: User, token: string) => void }) => {
  const [isLogin, setIsLogin] = useState(true);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      if (event.data?.type === 'OAUTH_AUTH_SUCCESS') {
        onLogin(event.data.user, event.data.token);
      }
    };
    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, [onLogin]);

  const handleGoogleLogin = async () => {
    try {
      const res = await fetch('/api/auth/google/url');
      const { url } = await res.json();
      window.open(url, 'google_auth', 'width=500,height=600');
    } catch (err) {
      setError('Failed to initiate Google login');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    const endpoint = isLogin ? '/api/auth/login' : '/api/auth/register';
    try {
      const res = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password })
      });
      const data = await res.json();
      if (res.ok) {
        onLogin(data.user, data.token);
      } else {
        setError(data.error);
      }
    } catch (err) {
      setError('Connection error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-64px)] flex items-center justify-center p-4">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md bg-app-card border border-app-border p-8 rounded-2xl shadow-2xl"
      >
        <div className="text-center mb-8">
          <div className="w-12 h-12 bg-emerald-500 rounded-xl flex items-center justify-center mx-auto mb-4">
            <Lock className="w-6 h-6 text-black" />
          </div>
          <h2 className="text-2xl font-bold text-app-heading mb-2">{isLogin ? 'Welcome Back' : 'Join HackLab'}</h2>
          <p className="text-zinc-400 text-sm">Elevate your cybersecurity skills today.</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-zinc-500 uppercase tracking-wider mb-2">Username</label>
            <input 
              type="text" 
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full bg-black/5 dark:bg-black border border-app-border rounded-lg px-4 py-3 text-app-heading focus:outline-none focus:border-emerald-500 transition-colors"
              placeholder="Enter your username"
              required
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-zinc-500 uppercase tracking-wider mb-2">Password</label>
            <input 
              type="password" 
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full bg-black/5 dark:bg-black border border-app-border rounded-lg px-4 py-3 text-app-heading focus:outline-none focus:border-emerald-500 transition-colors"
              placeholder="••••••••"
              required
            />
          </div>
          {error && <p className="text-red-500 text-xs">{error}</p>}
          <button 
            type="submit"
            disabled={loading}
            className="w-full bg-emerald-500 text-black font-bold py-3 rounded-lg hover:bg-emerald-400 transition-colors mt-6 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? <LoadingSpinner size="sm" /> : (isLogin ? 'Sign In' : 'Create Account')}
          </button>
        </form>

        <div className="relative my-8">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-app-border"></div>
          </div>
          <div className="relative flex justify-center text-xs uppercase">
            <span className="bg-app-card px-2 text-zinc-500 font-black tracking-widest">Or continue with</span>
          </div>
        </div>

        <button 
          onClick={handleGoogleLogin}
          className="w-full bg-white text-black font-black py-3 rounded-lg hover:bg-zinc-200 transition-all flex items-center justify-center gap-3 shadow-lg shadow-white/5"
        >
          <svg className="w-5 h-5" viewBox="0 0 24 24">
            <path
              fill="currentColor"
              d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
            />
            <path
              fill="currentColor"
              d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
            />
            <path
              fill="currentColor"
              d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z"
            />
            <path
              fill="currentColor"
              d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
            />
          </svg>
          Google Account
        </button>

        <p className="text-center text-zinc-500 text-sm mt-6">
          {isLogin ? "Don't have an account?" : "Already have an account?"}{' '}
          <button 
            onClick={() => setIsLogin(!isLogin)}
            className="text-emerald-500 hover:underline"
          >
            {isLogin ? 'Sign Up' : 'Sign In'}
          </button>
        </p>
      </motion.div>
    </div>
  );
};

const RoomCard = ({ room, onClick, isSaved, onToggleSave }: { room: Room, onClick: () => void, isSaved?: boolean, onToggleSave?: (id: number) => void }) => {
  const difficultyStyles = {
    Easy: {
      border: 'hover:border-emerald-500/50',
      badge: 'text-emerald-500 border-emerald-500/30',
      glow: 'group-hover:shadow-[0_0_20px_rgba(16,185,129,0.1)]',
      text: 'group-hover:text-emerald-400'
    },
    Medium: {
      border: 'hover:border-yellow-500/50',
      badge: 'text-yellow-500 border-yellow-500/30',
      glow: 'group-hover:shadow-[0_0_20px_rgba(234,179,8,0.1)]',
      text: 'group-hover:text-yellow-400'
    },
    Hard: {
      border: 'hover:border-orange-500/50',
      badge: 'text-orange-500 border-orange-500/30',
      glow: 'group-hover:shadow-[0_0_20px_rgba(249,115,22,0.1)]',
      text: 'group-hover:text-orange-400'
    },
    Insane: {
      border: 'hover:border-purple-500/50',
      badge: 'text-purple-500 border-purple-500/30',
      glow: 'group-hover:shadow-[0_0_20px_rgba(168,85,247,0.1)]',
      text: 'group-hover:text-purple-400'
    }
  }[room.difficulty] || {
    border: 'hover:border-zinc-500/50',
    badge: 'text-zinc-500 border-zinc-500/30',
    glow: '',
    text: 'group-hover:text-white'
  };

  return (
    <motion.div 
      whileHover={{ y: -4 }}
      onClick={onClick}
      className={cn(
        "bg-app-card border border-app-border rounded-xl overflow-hidden cursor-pointer group transition-all duration-300 relative shadow-xl",
        difficultyStyles.border,
        difficultyStyles.glow
      )}
    >
      <div className="h-40 bg-app-card relative overflow-hidden">
        <img 
          src={`https://picsum.photos/seed/${room.id}/800/400`} 
          alt={room.title}
          className="w-full h-full object-cover opacity-60 group-hover:scale-105 transition-transform duration-500"
          referrerPolicy="no-referrer"
        />
        <div className={cn(
          "absolute top-4 right-4 px-2 py-1 bg-black/80 backdrop-blur rounded text-[10px] font-bold uppercase tracking-widest border",
          difficultyStyles.badge
        )}>
          {room.difficulty}
        </div>
        {onToggleSave && (
          <button 
            onClick={(e) => { e.stopPropagation(); onToggleSave(room.id); }}
            className={cn(
              "absolute top-4 left-4 flex items-center gap-2 px-3 py-1.5 rounded-lg border backdrop-blur-md transition-all group/save",
              isSaved ? "bg-yellow-500/20 border-yellow-500/30 text-yellow-500" : "bg-black/40 border-app-border text-zinc-500 hover:text-app-heading hover:bg-black/60"
            )}
          >
            <Bookmark className={cn("w-3.5 h-3.5 transition-transform group-hover/save:scale-110", isSaved && "fill-yellow-500")} />
            <span className="text-[10px] font-black uppercase tracking-widest">
              {isSaved ? 'Saved' : 'Save Room'}
            </span>
          </button>
        )}
      </div>
      <div className="p-5">
        <h3 className={cn("text-lg font-bold text-app-heading mb-1 transition-colors", difficultyStyles.text)}>{room.title}</h3>
        <p className="text-app-text text-sm line-clamp-2 mb-4">{room.description}</p>
        
        <div className="flex items-center justify-between pt-4 border-t border-app-border">
          <div className="flex items-center gap-2 text-xs text-app-text">
            <UserIcon className="w-3 h-3" />
            <span>{room.creator_name || 'Admin'}</span>
          </div>
          <div className="flex items-center gap-2 text-xs text-app-text">
            <Activity className="w-3 h-3" />
            <span>{room.task_count || 0} Tasks</span>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

const SavedLabs = ({ rooms, savedLabs, onToggleSave, setView, setSelectedRoomId }: { rooms: Room[], savedLabs: number[], onToggleSave: (id: number) => void, setView: (v: string) => void, setSelectedRoomId: (id: number) => void }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState('saved');
  const [hideCompleted, setHideCompleted] = useState(false);

  const savedRooms = rooms.filter(r => savedLabs.includes(r.id));
  
  return (
    <div className="max-w-7xl mx-auto px-4 py-12">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-8 mb-12">
        <div>
          <h1 className="text-5xl font-black text-app-heading tracking-tighter mb-4">My Rooms</h1>
          <p className="text-zinc-500 text-lg font-medium">All the rooms that you have joined and saved.</p>
        </div>
        <div className="flex flex-col items-end gap-2">
          <div className="flex items-center gap-2 text-zinc-500 font-black uppercase tracking-widest text-xs">
            <span className="text-app-heading text-2xl leading-none">{savedRooms.length}</span>
            <span>Rooms Saved</span>
          </div>
        </div>
      </div>

      <div className="flex flex-col md:flex-row gap-6 mb-10">
        <div className="flex-1 relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
          <input 
            type="text" 
            placeholder="Find posts by a keyword..."
            className="w-full bg-app-card border border-app-border rounded-xl pl-12 pr-4 py-3 text-sm text-app-heading focus:outline-none focus:border-[#a3e635] transition-all"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <div className="flex items-center gap-3">
          <span className="text-xs font-black text-zinc-500 uppercase tracking-widest">Hide Completed rooms</span>
          <button 
            onClick={() => setHideCompleted(!hideCompleted)}
            className={cn(
              "w-10 h-5 rounded-full relative transition-colors",
              hideCompleted ? "bg-[#a3e635]" : "bg-zinc-700"
            )}
          >
            <div className={cn(
              "absolute top-1 w-3 h-3 rounded-full bg-white transition-all",
              hideCompleted ? "left-6" : "left-1"
            )} />
          </button>
        </div>
      </div>

      <div className="flex items-center gap-8 border-b border-app-border mb-10">
        {['Saved', 'Joined rooms', 'Manage Rooms'].map(tab => (
          <button 
            key={tab}
            onClick={() => setActiveTab(tab.toLowerCase())}
            className={cn(
              "pb-4 text-xs font-black uppercase tracking-widest border-b-2 transition-all",
              activeTab === tab.toLowerCase() ? "text-[#a3e635] border-[#a3e635]" : "text-zinc-500 border-transparent hover:text-app-heading"
            )}
          >
            {tab}
          </button>
        ))}
      </div>

      {savedRooms.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {savedRooms.map(room => (
            <RoomCard 
              key={room.id} 
              room={room} 
              onClick={() => {
                setSelectedRoomId(room.id);
                setView('room-detail');
              }} 
              isSaved={true}
              onToggleSave={onToggleSave}
            />
          ))}
        </div>
      ) : (
        <div className="text-center py-20 bg-app-card border border-dashed border-app-border rounded-3xl">
          <Bookmark className="w-12 h-12 text-zinc-700 mx-auto mb-4" />
          <h3 className="text-xl font-bold text-app-heading mb-2">No saved rooms</h3>
          <p className="text-zinc-500">You haven't saved any rooms yet.</p>
        </div>
      )}

      <div className="mt-12 flex items-center justify-center gap-2">
        <button className="px-4 py-2 text-zinc-500 font-black uppercase tracking-widest text-[10px] hover:text-app-heading transition-colors">Previous</button>
        <button className="w-8 h-8 bg-[#a3e635] text-black rounded-lg text-[10px] font-black">1</button>
        <button className="w-8 h-8 hover:bg-app-heading/5 text-zinc-500 rounded-lg text-[10px] font-black transition-colors">2</button>
        <button className="w-8 h-8 hover:bg-app-heading/5 text-zinc-500 rounded-lg text-[10px] font-black transition-colors">3</button>
        <button className="px-4 py-2 text-zinc-500 font-black uppercase tracking-widest text-[10px] hover:text-app-heading transition-colors">Next</button>
      </div>
    </div>
  );
};

const FeedbackPage = ({ addToast, user }: { addToast: (m: string, t?: 'success' | 'error' | 'info') => void, user: User | null }) => {
  const [feedback, setFeedback] = useState('');
  const [isSent, setIsSent] = useState(false);
  const [isSending, setIsSending] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!feedback.trim()) return;
    
    setIsSending(true);
    try {
      const response = await fetch('/api/feedback', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          feedback,
          username: user?.username,
          userEmail: user?.email
        })
      });

      if (response.ok) {
        setIsSent(true);
        addToast('Feedback sent successfully!', 'success');
      } else {
        throw new Error('Failed to send feedback');
      }
    } catch (error) {
      console.error('Error sending feedback:', error);
      addToast('Failed to send feedback. Please try again later.', 'error');
    } finally {
      setIsSending(false);
    }
  };

  if (isSent) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-20 text-center">
        <div className="w-20 h-20 bg-emerald-500/10 rounded-full flex items-center justify-center mx-auto mb-8">
          <CheckCircle2 className="w-10 h-10 text-emerald-500" />
        </div>
        <h1 className="text-5xl font-black text-app-heading tracking-tighter mb-4">Feedback sent!</h1>
        <p className="text-zinc-500 text-lg font-medium mb-10 leading-relaxed">
          Thank you for your feedback! We're constantly trying to improve our product, so if you have anything else to add, we'd love to know more!
        </p>
        <button 
          onClick={() => { setIsSent(false); setFeedback(''); }}
          className="px-8 py-3 bg-[#a3e635] hover:bg-[#bef264] text-black font-black rounded-xl transition-all shadow-lg shadow-[#a3e635]/20"
        >
          Send more feedback
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto px-4 py-20">
      <div className="text-center mb-12">
        <h1 className="text-5xl font-black text-app-heading tracking-tighter mb-4">Feedback</h1>
        <p className="text-zinc-500 text-lg font-medium">Help us improve and make TryHackMe a better platform.</p>
      </div>

      <form onSubmit={handleSubmit} className="bg-app-card border border-app-border rounded-3xl p-8 shadow-2xl">
        <div className="space-y-6">
          <div className="space-y-2">
            <label className="text-[10px] font-black text-zinc-500 uppercase tracking-widest px-1">Send us your suggestions, ideas, and comments.*</label>
            <textarea 
              value={feedback}
              onChange={(e) => setFeedback(e.target.value)}
              placeholder="Type your feedback here..."
              className="w-full h-48 bg-black/5 dark:bg-black/40 border border-app-border rounded-2xl px-6 py-4 text-app-heading focus:outline-none focus:border-[#a3e635] transition-all resize-none"
              maxLength={800}
            />
            <div className="flex justify-end">
              <span className="text-[10px] font-black text-zinc-500 uppercase tracking-widest">{feedback.length} / 800 characters</span>
            </div>
          </div>

          <button 
            type="submit"
            disabled={isSending}
            className="w-full py-4 bg-[#a3e635] hover:bg-[#bef264] text-black font-black rounded-xl transition-all shadow-lg shadow-[#a3e635]/20 uppercase tracking-widest text-sm disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {isSending ? (
              <>
                <LoadingSpinner size="sm" />
                Sending...
              </>
            ) : (
              'Send Feedback'
            )}
          </button>
        </div>

        <div className="mt-10 pt-10 border-t border-app-border">
          <h4 className="text-xs font-black text-app-heading uppercase tracking-widest mb-4">Need help? This form is for general feedback only.</h4>
          <p className="text-xs text-zinc-500 leading-relaxed font-medium">
            For support, contact <span className="text-[#a3e635]">support@tryhackme.com</span> or visit our <span className="text-[#a3e635]">Contact Page</span>.
          </p>
        </div>
      </form>
    </div>
  );
};

const BadgesPage = ({ user }: { user: User }) => {
  const [filters, setFilters] = useState({ status: 'All', rarity: 'All', category: 'All' });

  return (
    <div className="max-w-7xl mx-auto px-4 py-12">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-8 mb-12">
        <div>
          <h1 className="text-5xl font-black text-app-heading tracking-tighter mb-4">Badges</h1>
          <p className="text-zinc-500 text-lg font-medium">Earn TryHackMe badges by completing rooms. The more you hack, the more badges you earn!</p>
        </div>
        <div className="flex flex-col items-end gap-2">
          <div className="flex items-center gap-2 text-zinc-500 font-black uppercase tracking-widest text-xs">
            <span className="text-app-heading text-2xl leading-none">{user.badges?.length || 8} / 122</span>
            <span>Badges Earned</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
        {['Status', 'Rarity', 'Category'].map(filter => (
          <div key={filter} className="space-y-2">
            <label className="text-[10px] font-black text-zinc-500 uppercase tracking-widest px-1">{filter}</label>
            <select 
              className="w-full bg-app-card border border-app-border rounded-xl px-4 py-3 text-sm text-app-heading focus:outline-none focus:border-[#a3e635] transition-all"
              value={filters[filter.toLowerCase() as keyof typeof filters]}
              onChange={(e) => setFilters(prev => ({ ...prev, [filter.toLowerCase()]: e.target.value }))}
            >
              <option>All</option>
              {filter === 'Rarity' && (
                <>
                  <option>Common</option>
                  <option>Rare</option>
                  <option>Epic</option>
                </>
              )}
              {filter === 'Category' && (
                <>
                  <option>Learning Milestones</option>
                  <option>Blue Team</option>
                  <option>Red Team</option>
                  <option>Foundations</option>
                </>
              )}
            </select>
          </div>
        ))}
      </div>

      <section className="mb-16">
        <h3 className="text-xl font-black text-app-heading mb-8 tracking-tight">Learning Milestones</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
          {[
            { id: 1, title: '30 Day Streak', desc: 'Hacking for 30 days solid', rarity: 'Common', progress: '100%', active: true, color: 'emerald' },
            { id: 2, title: '7 Day Streak', desc: 'Achieving a 7 day hacking streak', rarity: 'Common', progress: '100%', active: true, color: 'emerald' },
            { id: 3, title: '3 Day Streak', desc: 'Achieving a 3 day hacking streak', rarity: 'Common', progress: '100%', active: true, color: 'emerald' },
            { id: 4, title: 'Gold League', desc: 'Gold League 1st place', rarity: 'Epic', progress: '1.7%', active: false, color: 'yellow' },
            { id: 5, title: '3 Million Legend', desc: 'Was a legend and solved any room in the 3 Million Users Special Module!', rarity: 'Epic', progress: '0.2%', active: false, color: 'purple' },
            { id: 6, title: '180 Day Streak', desc: 'Hacking for 180 days in a row', rarity: 'Rare', progress: '2.2%', active: false, color: 'blue' }
          ].map(badge => (
            <div key={badge.id} className={cn(
              "p-8 bg-app-card border rounded-3xl relative overflow-hidden group transition-all duration-500",
              badge.active ? "border-[#a3e635]/30 shadow-lg shadow-[#a3e635]/5" : "border-app-border opacity-60 grayscale"
            )}>
              <div className="relative z-10">
                <div className={cn(
                  "w-20 h-20 rounded-2xl flex items-center justify-center mb-6 transition-transform duration-500 group-hover:scale-110",
                  badge.active ? "bg-[#a3e635]/10" : "bg-zinc-800"
                )}>
                  <Award className={cn(
                    "w-10 h-10",
                    badge.active ? "text-[#a3e635]" : "text-zinc-600"
                  )} />
                </div>
                <h4 className="text-lg font-black text-app-heading mb-2 tracking-tight">{badge.title}</h4>
                <p className="text-xs text-zinc-500 font-medium mb-6 leading-relaxed">{badge.desc}</p>
                <div className="flex items-center justify-between">
                  <span className={cn(
                    "px-2 py-0.5 text-[8px] font-black rounded uppercase tracking-widest border",
                    badge.rarity === 'Epic' ? "text-purple-400 border-purple-400/20 bg-purple-400/10" :
                    badge.rarity === 'Rare' ? "text-blue-400 border-blue-400/20 bg-blue-400/10" :
                    "text-emerald-400 border-emerald-400/20 bg-emerald-400/10"
                  )}>
                    {badge.rarity} {badge.progress}
                  </span>
                </div>
              </div>
              {badge.active && (
                <div className="absolute -bottom-12 -right-12 w-32 h-32 bg-[#a3e635]/5 rounded-full blur-3xl group-hover:bg-[#a3e635]/10 transition-all duration-500" />
              )}
            </div>
          ))}
        </div>
      </section>
    </div>
  );
};

const RoomDetail = ({ roomId, token, onBack, addToast, onRoomComplete, presence, user }: { roomId: number, token: string, onBack: () => void, addToast: (m: string, t?: 'success' | 'error' | 'info') => void, onRoomComplete?: (id: number) => void, presence: { roomId: number, count: number }, user: User | null }) => {
  const [room, setRoom] = useState<Room | null>(null);
  const [loading, setLoading] = useState(true);
  const [answers, setAnswers] = useState<Record<number, string>>({});
  const [results, setResults] = useState<Record<number, SubmissionResponse>>({});
  const [hints, setHints] = useState<Record<number, string>>({});
  const [hintsLoading, setHintsLoading] = useState<Record<number, boolean>>({});
  
  // Simulation states
  const [machineStatus, setMachineStatus] = useState<'stopped' | 'starting' | 'running'>('stopped');
  const [deployProgress, setDeployProgress] = useState(0);
  const [vpnConnected, setVpnConnected] = useState(false);
  const [showMetrics, setShowMetrics] = useState(false);
  const [metrics, setMetrics] = useState({ cpu: 0, ram: 0 });
  const [sshKey, setSshKey] = useState<{ publicKey: string, privateKey: string } | null>(null);
  const [isGeneratingKey, setIsGeneratingKey] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [isFlashing, setIsFlashing] = useState(false);

  useEffect(() => {
    // Fetch existing SSH key on mount
    fetch('/api/user/ssh-key')
      .then(res => res.ok ? res.json() : null)
      .then(data => setSshKey(data));
  }, []);

  const handleGenerateSSHKey = async () => {
    setIsGeneratingKey(true);
    try {
      const res = await fetch('/api/user/ssh-key/generate', { method: 'POST' });
      const data = await res.json();
      setSshKey(data);
      addToast('SSH Key pair generated successfully!', 'success');
    } catch (err) {
      addToast('Failed to generate SSH key', 'error');
    } finally {
      setIsGeneratingKey(false);
    }
  };

  useEffect(() => {
    let interval: any;
    if (showMetrics && machineStatus === 'running') {
      interval = setInterval(() => {
        setMetrics({
          cpu: Math.floor(Math.random() * 40) + 10, // 10-50%
          ram: Math.floor(Math.random() * 20) + 40, // 40-60%
        });
      }, 2000);
    }
    return () => clearInterval(interval);
  }, [showMetrics, machineStatus]);

  useEffect(() => {
    socket.emit('join-room', roomId);
    
    fetch(`/api/rooms/${roomId}`)
      .then(res => res.json())
      .then(data => {
        setRoom(data);
        if (data.tasks) {
          const initialResults: Record<number, SubmissionResponse> = {};
          data.tasks.forEach((t: Task) => {
            if (t.is_solved) {
              initialResults[t.id] = { status: 'already_solved' };
            }
          });
          setResults(initialResults);
        }
        setLoading(false);
      });

    return () => {
      socket.emit('leave-room', roomId);
    };
  }, [roomId]);

  const submitFlag = async (taskId: number) => {
    const res = await fetch('/api/submissions', {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({ taskId, answer: answers[taskId] })
    });
    const data = await res.json();
    
    const newResults = { ...results, [taskId]: data };
    setResults(newResults);
    
    if (data.status === 'correct') {
      addToast('Correct flag! Points added.', 'success');
      
      // Check if all tasks are solved
      if (room && room.tasks) {
        const solvedCount = Object.values(newResults).filter(r => r.status === 'correct' || r.status === 'already_solved').length;
        if (solvedCount === room.tasks.length) {
          addToast(`Congratulations! You've completed ${room.title}!`, 'success');
          setShowSuccessModal(true);
          onRoomComplete?.(roomId);
        }
      }
    } else {
      addToast('Incorrect flag. Try again.', 'error');
    }
  };

  const requestHint = async (task: Task) => {
    if (!room) return;
    setHintsLoading(prev => ({ ...prev, [task.id]: true }));
    try {
      const h = await getHint(room.title, task.question, "");
      setHints(prev => ({ ...prev, [task.id]: h || "No hint available." }));
    } catch (e) {
      setHints(prev => ({ ...prev, [task.id]: "AI is currently unavailable." }));
    }
    setHintsLoading(prev => ({ ...prev, [task.id]: false }));
  };

  const handleStartMachine = async () => {
    setMachineStatus('starting');
    setDeployProgress(0);
    addToast('Starting virtual machine...', 'info');
    
    // Sync with backend
    try {
      await fetch(`/api/user/machines/${roomId}/status`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'starting', username: user?.username })
      });
    } catch (e) { console.error(e); }

    const interval = setInterval(() => {
      setDeployProgress(prev => {
        if (prev >= 100) {
          clearInterval(interval);
          setMachineStatus('running');
          addToast('Machine is ready!', 'success');
          
          // Final sync
          fetch(`/api/user/machines/${roomId}/status`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ status: 'running', username: user?.username })
          }).catch(console.error);
          
          return 100;
        }
        return prev + 5;
      });
    }, 200);
  };

  const handleStopMachine = async () => {
    setMachineStatus('stopped');
    setDeployProgress(0);
    addToast('Machine stopped successfully.', 'info');
    
    // Sync with backend
    try {
      await fetch(`/api/user/machines/${roomId}/status`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'stopped', username: user?.username })
      });
    } catch (e) { console.error(e); }
  };

  const handleDownloadVPN = () => {
    const config = `client
dev tun
proto udp
remote hacklab.network 1194
resolv-retry infinite
nobind
persist-key
persist-tun
remote-cert-tls server
cipher AES-256-GCM
verb 3
<ca>
-----BEGIN CERTIFICATE-----
MIIDBTCCAe2gAwIBAgIUXVv6v7+9v7+9v7+9v7+9v7+9v7+9v7+9v7+9v7+9v7+9
v7+9v7+9v7+9v7+9v7+9v7+9v7+9v7+9v7+9v7+9v7+9v7+9v7+9v7+9v7+9v7+9
v7+9v7+9v7+9v7+9v7+9v7+9v7+9v7+9v7+9v7+9v7+9v7+9v7+9v7+9v7+9v7+9
v7+9v7+9v7+9v7+9v7+9v7+9v7+9v7+9v7+9v7+9v7+9v7+9v7+9v7+9v7+9v7+9
v7+9v7+9v7+9v7+9v7+9v7+9v7+9v7+9v7+9v7+9v7+9v7+9v7+9v7+9v7+9v7+9
-----END CERTIFICATE-----
</ca>
<cert>
-----BEGIN CERTIFICATE-----
MIIDBTCCAe2gAwIBAgIUXVv6v7+9v7+9v7+9v7+9v7+9v7+9v7+9v7+9v7+9v7+9
v7+9v7+9v7+9v7+9v7+9v7+9v7+9v7+9v7+9v7+9v7+9v7+9v7+9v7+9v7+9v7+9
v7+9v7+9v7+9v7+9v7+9v7+9v7+9v7+9v7+9v7+9v7+9v7+9v7+9v7+9v7+9v7+9
v7+9v7+9v7+9v7+9v7+9v7+9v7+9v7+9v7+9v7+9v7+9v7+9v7+9v7+9v7+9v7+9
v7+9v7+9v7+9v7+9v7+9v7+9v7+9v7+9v7+9v7+9v7+9v7+9v7+9v7+9v7+9v7+9
-----END CERTIFICATE-----
</cert>
<key>
-----BEGIN PRIVATE KEY-----
MIIEvAIBADANBgkqhkiG9w0BAQEFAASCBKYwggSiAgEAAoIBAQCv7+9v7+9v7+9v
7+9v7+9v7+9v7+9v7+9v7+9v7+9v7+9v7+9v7+9v7+9v7+9v7+9v7+9v7+9v7+9
7+9v7+9v7+9v7+9v7+9v7+9v7+9v7+9v7+9v7+9v7+9v7+9v7+9v7+9v7+9v7+9
7+9v7+9v7+9v7+9v7+9v7+9v7+9v7+9v7+9v7+9v7+9v7+9v7+9v7+9v7+9v7+9
7+9v7+9v7+9v7+9v7+9v7+9v7+9v7+9v7+9v7+9v7+9v7+9v7+9v7+9v7+9v7+9
-----END PRIVATE KEY-----
</key>`;
    const blob = new Blob([config], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${room?.title.toLowerCase().replace(/\s+/g, '_')}_hacklab.ovpn`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    
    // Simulate connection after download
    setTimeout(() => setVpnConnected(true), 2000);
  };

  const generateCertificateCanvas = () => {
    if (!room) return null;
    
    const canvas = document.createElement('canvas');
    canvas.width = 1200;
    canvas.height = 850;
    const ctx = canvas.getContext('2d');
    if (!ctx) return null;

    // 1. Background (White)
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // 2. Decorative Corner Shapes (Blue and Gold)
    // Top Left
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.lineTo(300, 0);
    ctx.bezierCurveTo(200, 100, 100, 200, 0, 300);
    ctx.closePath();
    ctx.fillStyle = '#0f172a'; // Deep Blue
    ctx.fill();

    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.lineTo(250, 0);
    ctx.bezierCurveTo(180, 80, 80, 180, 0, 250);
    ctx.closePath();
    ctx.fillStyle = '#facc15'; // Gold
    ctx.fill();

    // Bottom Right
    ctx.beginPath();
    ctx.moveTo(canvas.width, canvas.height);
    ctx.lineTo(canvas.width - 300, canvas.height);
    ctx.bezierCurveTo(canvas.width - 200, canvas.height - 100, canvas.width - 100, canvas.height - 200, canvas.width, canvas.height - 300);
    ctx.closePath();
    ctx.fillStyle = '#0f172a';
    ctx.fill();

    ctx.beginPath();
    ctx.moveTo(canvas.width, canvas.height);
    ctx.lineTo(canvas.width - 250, canvas.height);
    ctx.bezierCurveTo(canvas.width - 180, canvas.height - 80, canvas.width - 80, canvas.height - 180, canvas.width, canvas.height - 250);
    ctx.closePath();
    ctx.fillStyle = '#facc15';
    ctx.fill();

    // 3. Gold Border
    ctx.strokeStyle = '#facc15';
    ctx.lineWidth = 4;
    ctx.strokeRect(40, 40, canvas.width - 80, canvas.height - 80);
    ctx.lineWidth = 1;
    ctx.strokeRect(50, 50, canvas.width - 100, canvas.height - 100);

    // 4. Header: CERTIFICATE
    ctx.fillStyle = '#1e3a8a'; // Darker Blue
    ctx.font = '900 80px "Inter", sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('CERTIFICATE', canvas.width / 2, 180);

    // 5. Sub-header: OF PARTICIPATION (Pill shape)
    const pillWidth = 400;
    const pillHeight = 60;
    const pillX = (canvas.width - pillWidth) / 2;
    const pillY = 210;
    ctx.beginPath();
    ctx.roundRect(pillX, pillY, pillWidth, pillHeight, 30);
    ctx.fillStyle = '#1e3a8a';
    ctx.fill();
    
    ctx.fillStyle = '#ffffff';
    ctx.font = '700 24px "Inter", sans-serif';
    ctx.fillText('OF PARTICIPATION', canvas.width / 2, pillY + 38);

    // 6. Text: This participation certificate is given to
    ctx.fillStyle = '#475569';
    ctx.font = '500 20px "Inter", sans-serif';
    ctx.fillText('This participation certificate is given to', canvas.width / 2, 330);

    // 7. User Name (Cursive)
    const username = user?.full_name || user?.username || 'GHOST_OPERATOR';
    ctx.fillStyle = '#1e3a8a';
    ctx.font = 'italic 700 80px "Georgia", serif'; // Using Georgia for a classic look
    ctx.fillText(username, canvas.width / 2, 440);

    // 8. Description
    ctx.fillStyle = '#475569';
    ctx.font = '500 22px "Inter", sans-serif';
    ctx.fillText(`Who have successfully completed the laboratory on "${room.title}"`, canvas.width / 2, 520);
    
    const dateStr = new Date().toLocaleDateString('en-US', { 
      weekday: 'long', 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });
    ctx.fillText(`hosted by the HackLab Platform on ${dateStr}`, canvas.width / 2, 560);

    // 9. Signatures
    // Signature 1: Chairman
    ctx.strokeStyle = '#1e3a8a';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(350, 750);
    ctx.lineTo(550, 750);
    ctx.stroke();
    
    ctx.fillStyle = '#1e3a8a';
    ctx.font = 'italic 32px "Brush Script MT", cursive, sans-serif';
    ctx.fillText('Cla Rodriguez', 450, 730);
    
    ctx.fillStyle = '#1e3a8a';
    ctx.font = '700 16px "Inter", sans-serif';
    ctx.fillText('Chairman', 450, 680);
    ctx.font = '700 14px "Inter", sans-serif';
    ctx.fillText('Cla Rodriguez', 450, 775);

    // Signature 2: Representative
    ctx.beginPath();
    ctx.moveTo(650, 750);
    ctx.lineTo(850, 750);
    ctx.stroke();
    
    ctx.fillStyle = '#1e3a8a';
    ctx.font = 'italic 32px "Brush Script MT", cursive, sans-serif';
    ctx.fillText('Chad Gibbons', 750, 730);
    
    ctx.fillStyle = '#1e3a8a';
    ctx.font = '700 16px "Inter", sans-serif';
    ctx.fillText('Representative', 750, 680);
    ctx.font = '700 14px "Inter", sans-serif';
    ctx.fillText('Chad Gibbons', 750, 775);

    // 10. Gold Seal (Top Right)
    const sealX = canvas.width - 180;
    const sealY = 150;
    
    // Seal Ribbons
    ctx.fillStyle = '#facc15';
    ctx.beginPath();
    ctx.moveTo(sealX - 20, sealY + 40);
    ctx.lineTo(sealX - 40, sealY + 120);
    ctx.lineTo(sealX - 10, sealY + 100);
    ctx.lineTo(sealX + 20, sealY + 120);
    ctx.lineTo(sealX, sealY + 40);
    ctx.fill();

    ctx.beginPath();
    ctx.arc(sealX, sealY, 50, 0, Math.PI * 2);
    ctx.fillStyle = '#facc15';
    ctx.fill();
    ctx.strokeStyle = '#eab308';
    ctx.lineWidth = 4;
    ctx.stroke();
    
    // Inner seal circle
    ctx.beginPath();
    ctx.arc(sealX, sealY, 40, 0, Math.PI * 2);
    ctx.stroke();

    return canvas;
  };

  const handleDownloadBadge = () => {
    if (!room) return;
    addToast('Generating your official certificate...', 'info');
    
    const canvas = generateCertificateCanvas();
    if (!canvas) return;

    // 11. Download
    const link = document.createElement('a');
    link.download = `HackLab_Certificate_${room.title.replace(/\s+/g, '_')}.png`;
    link.href = canvas.toDataURL('image/png');
    link.click();
    addToast('Certificate downloaded successfully!', 'success');
  };

  const handleShareSuccess = async () => {
    if (!room) return;
    addToast('Preparing certificate for sharing...', 'info');
    
    try {
      const canvas = generateCertificateCanvas();
      if (!canvas) return;

      const blob = await new Promise<Blob | null>(resolve => canvas.toBlob(resolve, 'image/png'));
      if (!blob) return;

      const file = new File([blob], `HackLab_Certificate_${room.title.replace(/\s+/g, '_')}.png`, { type: 'image/png' });

      if (navigator.share && navigator.canShare && navigator.canShare({ files: [file] })) {
        await navigator.share({
          files: [file],
          title: 'HackLab Achievement Unlocked!',
          text: `I just completed the ${room.title} lab on HackLab! 🚀 #HackLab #CyberSecurity`,
        });
        addToast('Shared successfully!', 'success');
      } else {
        // Fallback to clipboard link if file sharing is not supported
        const url = window.location.origin;
        const text = `I just completed the ${room.title} lab on HackLab! 🚀 #HackLab #CyberSecurity ${url}`;
        await navigator.clipboard.writeText(text);
        addToast('Link copied to clipboard (file sharing not supported)', 'info');
      }
    } catch (err) {
      console.error('Error sharing:', err);
      addToast('Failed to share certificate', 'error');
    }
  };

  const shareToSocial = (platform: string) => {
    const url = encodeURIComponent(window.location.origin);
    const text = encodeURIComponent(`I just completed the ${room?.title} lab on HackLab! #HackLab #CyberSecurity #Hacking`);
    let shareUrl = '';

    switch (platform) {
      case 'twitter':
        shareUrl = `https://twitter.com/intent/tweet?text=${text}&url=${url}`;
        break;
      case 'linkedin':
        shareUrl = `https://www.linkedin.com/sharing/share-offsite/?url=${url}`;
        break;
      case 'facebook':
        shareUrl = `https://www.facebook.com/sharer/sharer.php?u=${url}`;
        break;
    }

    if (shareUrl) {
      window.open(shareUrl, '_blank', 'width=600,height=400');
    }
  };

  if (loading || !room) return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
      <LoadingSpinner size="lg" />
      <p className="text-sm font-black text-zinc-500 uppercase tracking-widest animate-pulse">Initializing Lab Environment...</p>
    </div>
  );

  return (
    <div className="max-w-7xl mx-auto p-6">
      <div className="flex items-center justify-between mb-8">
        <button 
          onClick={() => {
            if (machineStatus !== 'stopped') {
              addToast('CRITICAL: Shutdown the machine before leaving the lab environment!', 'error');
              return;
            }
            onBack();
          }} 
          className="flex items-center gap-2 text-app-text hover:text-app-heading transition-colors font-bold text-sm"
        >
          <ChevronRight className="w-4 h-4 rotate-180" />
          Back to Labs
        </button>
        <div className="flex items-center gap-4">
          <span className="text-xs font-bold text-zinc-500 uppercase tracking-widest">Room ID: {room.id}</span>
          <div className="h-4 w-px bg-app-border" />
          <div className="flex items-center gap-2">
            <Users className="w-4 h-4 text-zinc-500" />
            <span className="text-xs font-bold text-zinc-500">1.2k Solves</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        <div className="lg:col-span-8 space-y-8">
          <div className="bg-app-card border border-app-border rounded-2xl overflow-hidden shadow-xl">
            <div className="h-48 bg-app-card relative">
              <img 
                src={`https://picsum.photos/seed/${room.id}/1200/400`} 
                className="w-full h-full object-cover opacity-40"
                referrerPolicy="no-referrer"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-app-card to-transparent" />
              <div className="absolute bottom-6 left-8">
                <h1 className="text-4xl font-black text-app-heading mb-2 tracking-tight">{room.title}</h1>
                <div className="flex items-center gap-3">
                  <span className="px-3 py-1 bg-emerald-500 text-black text-[10px] font-black rounded uppercase tracking-widest">{room.difficulty}</span>
                  <span className="text-app-text text-xs font-bold">Created by {room.creator_name || 'Admin'}</span>
                </div>
              </div>
            </div>
            
            <div className="p-8">
              <div className="prose prose-invert max-w-none text-app-text leading-relaxed mb-12">
                <ReactMarkdown>{room.description}</ReactMarkdown>
              </div>

              <div className="space-y-8">
                <div className="flex items-center justify-between">
                  <h2 className="text-xl font-bold text-app-heading flex items-center gap-2">
                    <Terminal className="w-5 h-5 text-[#a3e635]" />
                    Tasks & Challenges
                  </h2>
                  <div className="text-xs font-bold text-zinc-500 uppercase tracking-widest">
                    {room.tasks?.length || 0} Tasks Total
                  </div>
                </div>

                <div className="space-y-4">
                  {room.tasks?.map((task, idx) => (
                    <div key={task.id} className="bg-app-card border border-app-border rounded-xl overflow-hidden group">
                      <div className="p-6">
                        <div className="flex items-start justify-between mb-6">
                          <div className="flex gap-4">
                            <div className="w-10 h-10 bg-app-card border border-app-border rounded-lg flex items-center justify-center text-sm font-black text-zinc-500 group-hover:text-[#a3e635] transition-colors">
                              {idx + 1}
                            </div>
                            <div>
                              <p className="text-app-heading font-bold mb-1 leading-relaxed">{task.question}</p>
                              <div className="flex items-center flex-wrap gap-y-2 gap-x-3">
                                <span className="text-[10px] text-zinc-500 font-black uppercase tracking-widest">Task ID: {task.id}</span>
                                <div className="w-1 h-1 bg-zinc-800 rounded-full hidden sm:block" />
                                <span className="text-[10px] text-zinc-500 font-black uppercase tracking-widest">{task.points} POINTS</span>
                                <div className="w-1 h-1 bg-zinc-800 rounded-full hidden sm:block" />
                                {(results[task.id]?.status === 'correct' || results[task.id]?.status === 'already_solved') ? (
                                  <span className="flex items-center gap-1 text-[10px] text-emerald-500 font-black uppercase tracking-widest">
                                    <CheckCircle2 className="w-3 h-3" />
                                    Status: Complete
                                  </span>
                                ) : results[task.id]?.status === 'incorrect' ? (
                                  <span className="flex items-center gap-1 text-[10px] text-red-500 font-black uppercase tracking-widest">
                                    <X className="w-3 h-3" />
                                    Status: Incorrect
                                  </span>
                                ) : (
                                  <span className="text-[10px] text-zinc-500 font-black uppercase tracking-widest">Status: Pending</span>
                                )}
                              </div>
                            </div>
                          </div>
                          <button 
                            onClick={() => requestHint(task)}
                            disabled={hintsLoading[task.id]}
                            className="flex items-center gap-2 px-3 py-1.5 bg-yellow-500/10 hover:bg-yellow-500/20 text-yellow-500 rounded-lg border border-yellow-500/20 transition-all group/hint disabled:opacity-50"
                            title="Get AI Hint"
                          >
                            <Lightbulb className={cn("w-4 h-4 transition-transform group-hover/hint:scale-110", hintsLoading[task.id] && "animate-pulse")} />
                            <span className="text-[10px] font-black uppercase tracking-widest">
                              {hintsLoading[task.id] ? 'Thinking...' : 'Get Hint'}
                            </span>
                          </button>
                        </div>

                        <div className="flex flex-col sm:flex-row gap-3">
                          <div className="flex-1 relative">
                            <input 
                              type="text" 
                              placeholder="Enter flag (e.g. HACK{...})"
                              className={cn(
                                "w-full bg-black/5 dark:bg-black border rounded-lg pl-4 pr-12 py-3 text-sm text-app-heading focus:outline-none disabled:opacity-50 transition-all",
                                (results[task.id]?.status === 'correct' || results[task.id]?.status === 'already_solved')
                                  ? "border-emerald-500 ring-1 ring-emerald-500/20" 
                                  : results[task.id]?.status === 'incorrect'
                                    ? "border-red-500 ring-1 ring-red-500/20"
                                    : "border-app-border focus:border-[#a3e635]"
                              )}
                              value={answers[task.id] || ''}
                              onChange={(e) => setAnswers(prev => ({ ...prev, [task.id]: e.target.value }))}
                              disabled={machineStatus !== 'running' || results[task.id]?.status === 'correct' || results[task.id]?.status === 'already_solved'}
                            />
                            <div className="absolute right-4 top-1/2 -translate-y-1/2 flex items-center gap-2">
                              {(results[task.id]?.status === 'correct' || results[task.id]?.status === 'already_solved') && (
                                <CheckCircle2 className="w-5 h-5 text-emerald-500" />
                              )}
                              {results[task.id]?.status === 'incorrect' && (
                                <X className="w-5 h-5 text-red-500" />
                              )}
                            </div>
                          </div>
                          <button 
                            onClick={() => submitFlag(task.id)}
                            className={cn(
                              "w-full sm:w-auto px-8 py-3 text-sm font-black rounded-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg",
                              (results[task.id]?.status === 'correct' || results[task.id]?.status === 'already_solved')
                                ? "bg-emerald-500 text-black shadow-emerald-500/10"
                                : "bg-[#a3e635] hover:bg-[#bef264] text-black shadow-[#a3e635]/10"
                            )}
                            disabled={machineStatus !== 'running' || results[task.id]?.status === 'correct' || results[task.id]?.status === 'already_solved'}
                          >
                            {(results[task.id]?.status === 'correct' || results[task.id]?.status === 'already_solved') ? 'Solved' : 'Submit'}
                          </button>
                        </div>
                        
                        {machineStatus !== 'running' && !results[task.id] && (
                          <p className="mt-4 text-[10px] text-zinc-500 uppercase font-black italic flex items-center gap-2">
                            <Zap className="w-3 h-3" />
                            Start the machine to submit flags
                          </p>
                        )}

                        {results[task.id] && results[task.id].status !== 'correct' && (
                          <motion.p 
                            initial={{ opacity: 0, y: 5 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="mt-4 text-[10px] text-red-500 font-black uppercase tracking-widest flex items-center gap-2"
                          >
                            <X className="w-3 h-3" />
                            Incorrect flag. Try again.
                          </motion.p>
                        )}

                        <AnimatePresence>
                          {hints[task.id] && (
                            <motion.div 
                              initial={{ opacity: 0, height: 0 }}
                              animate={{ opacity: 1, height: 'auto' }}
                              exit={{ opacity: 0, height: 0 }}
                              className="mt-4 p-4 bg-yellow-500/10 border border-yellow-500/20 rounded-lg"
                            >
                              <div className="flex items-center gap-2 mb-2">
                                <Lightbulb className="w-4 h-4 text-yellow-500" />
                                <span className="text-[10px] font-black text-yellow-500 uppercase tracking-widest">AI Mentor Hint</span>
                              </div>
                              <p className="text-sm text-zinc-300 italic leading-relaxed">
                                {hints[task.id]}
                              </p>
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="lg:col-span-4 space-y-6">
          <div className="bg-app-card border border-app-border rounded-2xl p-6 shadow-xl">
            <div className="flex items-center justify-between mb-6">
              <div className="flex flex-col gap-1">
                <h3 className="text-xs font-black text-app-heading uppercase tracking-widest">Machine Control</h3>
                <div className="flex items-center gap-2">
                  <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse" />
                  <span className="text-[9px] font-black text-emerald-500 uppercase tracking-widest">Global Presence: {presence.count || 1}</span>
                </div>
              </div>
              <div className={cn(
                "w-2 h-2 rounded-full",
                machineStatus === 'stopped' ? "bg-zinc-800" :
                machineStatus === 'starting' ? "bg-yellow-500 animate-pulse" :
                "bg-emerald-500 animate-pulse"
              )} />
            </div>
            
            <div className="space-y-4">
              {machineStatus === 'stopped' ? (
                <button 
                  onClick={handleStartMachine}
                  className="w-full py-4 bg-[#a3e635] hover:bg-[#bef264] text-black text-sm font-black rounded-xl transition-all flex items-center justify-center gap-2 shadow-lg shadow-[#a3e635]/20"
                >
                  <Rocket className="w-4 h-4" />
                  Start Machine
                </button>
              ) : machineStatus === 'starting' ? (
                <div className="space-y-3">
                  <div className="flex justify-between text-[10px] font-black text-zinc-500 uppercase tracking-widest">
                    <span>Deploying Instance...</span>
                    <span>{deployProgress}%</span>
                  </div>
                  <div className="w-full h-2 bg-app-heading/10 rounded-full overflow-hidden">
                    <motion.div 
                      className="h-full bg-[#a3e635]"
                      initial={{ width: 0 }}
                      animate={{ width: `${deployProgress}%` }}
                    />
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="p-4 bg-black/5 dark:bg-black rounded-xl border border-app-border">
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-[10px] font-black text-zinc-500 uppercase tracking-widest">IP Address</span>
                      <span className={`text-xs font-mono font-bold ${vpnConnected ? 'text-[#a3e635]' : 'text-zinc-500'}`}>
                        {room?.machine_ip || '10.10.123.45'}
                      </span>
                    </div>
                    {!vpnConnected && (
                      <p className="text-[9px] text-red-400 font-bold uppercase tracking-tighter text-center mb-2">
                        VPN Connection Required to reach IP
                      </p>
                    )}
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-black text-zinc-500 uppercase tracking-widest">Expires In</span>
                      <span className="text-xs font-mono text-app-heading font-bold">59:42</span>
                    </div>
                  </div>

                  {showMetrics && (
                    <motion.div 
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      className="p-4 bg-black/5 dark:bg-black rounded-xl border border-app-border space-y-4"
                    >
                      <div className="space-y-2">
                        <div className="flex justify-between text-[10px] font-black text-zinc-500 uppercase tracking-widest">
                          <span className="flex items-center gap-1"><Cpu className="w-3 h-3" /> CPU Usage</span>
                          <span className="text-app-heading">{metrics.cpu}%</span>
                        </div>
                        <div className="w-full h-1.5 bg-app-heading/10 rounded-full overflow-hidden">
                          <motion.div 
                            className="h-full bg-[#a3e635]"
                            animate={{ width: `${metrics.cpu}%` }}
                            transition={{ duration: 1 }}
                          />
                        </div>
                      </div>
                      <div className="space-y-2">
                        <div className="flex justify-between text-[10px] font-black text-zinc-500 uppercase tracking-widest">
                          <span className="flex items-center gap-1"><Database className="w-3 h-3" /> RAM Usage</span>
                          <span className="text-app-heading">{metrics.ram}%</span>
                        </div>
                        <div className="w-full h-1.5 bg-app-heading/10 rounded-full overflow-hidden">
                          <motion.div 
                            className="h-full bg-blue-500"
                            animate={{ width: `${metrics.ram}%` }}
                            transition={{ duration: 1 }}
                          />
                        </div>
                      </div>
                    </motion.div>
                  )}

                  <div className="flex flex-col gap-2">
                    <button 
                      onClick={handleStopMachine}
                      className="w-full py-3 bg-red-500/10 hover:bg-red-500/20 text-red-500 text-xs font-black rounded-xl border border-red-500/20 transition-all flex items-center justify-center gap-2"
                    >
                      <RotateCcw className="w-4 h-4" />
                      Stop Machine
                    </button>
                    <div className="flex gap-2">
                      <button 
                        onClick={() => {
                          setMachineStatus('stopped');
                          setShowMetrics(false);
                        }}
                        className="flex-1 py-3 bg-red-500/10 hover:bg-red-500/20 text-red-500 text-xs font-black rounded-lg transition-all border border-red-500/20"
                      >
                        Terminate
                      </button>
                      <button className="px-4 py-3 bg-app-heading/5 hover:bg-app-heading/10 text-app-heading text-xs font-black rounded-lg transition-all border border-app-border">
                        Add Time
                      </button>
                    </div>
                    <button 
                      onClick={() => setShowMetrics(!showMetrics)}
                      className={cn(
                        "w-full py-3 text-xs font-black rounded-lg transition-all border flex items-center justify-center gap-2",
                        showMetrics 
                          ? "bg-[#a3e635]/10 border-[#a3e635]/30 text-[#a3e635]" 
                          : "bg-app-heading/5 border-app-border text-app-heading hover:bg-app-heading/10"
                      )}
                    >
                      <Activity className={cn("w-4 h-4", showMetrics && "animate-pulse")} />
                      {showMetrics ? 'Hide Performance' : 'Monitor Performance'}
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>

          <div className="bg-app-card border border-app-border rounded-2xl p-6 shadow-xl">
            <h3 className="text-xs font-black text-app-heading uppercase tracking-widest mb-4">Global Activity</h3>
            <div className="space-y-3">
              {[
                { user: 'cyber_ninja', action: 'connected', time: '2m ago', country: '🇺🇸' },
                { user: 'root_hacker', action: 'solved task 1', time: '5m ago', country: '🇩🇪' },
                { user: 'beraniranjan722', action: 'deployed machine', time: 'just now', country: '🇮🇳' }
              ].map((activity, i) => (
                <div key={i} className="flex items-center justify-between text-[10px] font-medium">
                  <div className="flex items-center gap-2">
                    <span>{activity.country}</span>
                    <span className="text-[#a3e635] font-black">{activity.user}</span>
                    <span className="text-zinc-500">{activity.action}</span>
                  </div>
                  <span className="text-zinc-600">{activity.time}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-app-card border border-app-border rounded-2xl p-6 shadow-xl">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xs font-black text-app-heading uppercase tracking-widest">Network Access</h3>
              <div className={cn(
                "w-2 h-2 rounded-full",
                vpnConnected ? "bg-emerald-500 animate-pulse" : "bg-red-500"
              )} />
            </div>
            
            <div className="space-y-4">
              <div className="p-4 bg-black/5 dark:bg-black rounded-xl border border-app-border">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[10px] font-black text-zinc-500 uppercase tracking-widest">Status</span>
                  <span className={cn(
                    "text-[10px] font-black uppercase tracking-widest",
                    vpnConnected ? "text-emerald-500" : "text-red-500"
                  )}>
                    {vpnConnected ? 'Connected' : 'Disconnected'}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-black text-zinc-500 uppercase tracking-widest">Interface</span>
                  <span className="text-xs font-mono text-app-heading font-bold">{vpnConnected ? 'tun0' : 'N/A'}</span>
                </div>
              </div>
              
              <button 
                onClick={handleDownloadVPN}
                className="w-full py-4 bg-app-heading/5 hover:bg-app-heading/10 text-app-heading text-sm font-black rounded-xl transition-all flex items-center justify-center gap-2 border border-app-border"
              >
                <Download className="w-4 h-4" />
                Download Config
              </button>

              <button 
                onClick={() => {
                  if (!vpnConnected) {
                    addToast('Connecting to lab network...', 'info');
                    setTimeout(() => setVpnConnected(true), 1500);
                  } else {
                    setVpnConnected(false);
                  }
                }}
                className={`w-full py-4 text-sm font-black rounded-xl transition-all flex items-center justify-center gap-2 border ${
                  vpnConnected 
                    ? 'bg-red-500/10 border-red-500/20 text-red-500 hover:bg-red-500 hover:text-white' 
                    : 'bg-[#a3e635] text-black hover:bg-[#bef264]'
                }`}
              >
                <Network className="w-4 h-4" />
                {vpnConnected ? 'Disconnect VPN' : 'Simulate Connection'}
              </button>

              <p className="text-[10px] text-zinc-500 text-center leading-relaxed">
                Note: This is a simulated VPN for the platform preview. Connecting here enables access to the lab machine IP.
              </p>
            </div>
          </div>

          <div className="bg-app-card border border-app-border rounded-2xl p-6 shadow-xl">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xs font-black text-app-heading uppercase tracking-widest flex items-center gap-2">
                <Lock className="w-4 h-4 text-[#a3e635]" />
                SSH Access
              </h3>
              {sshKey && (
                <div className="flex items-center gap-1.5">
                  <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full" />
                  <span className="text-[9px] font-black text-emerald-500 uppercase tracking-widest">Key Active</span>
                </div>
              )}
            </div>
            
            <div className="space-y-4">
              {sshKey ? (
                <div className="space-y-4">
                  <div className="p-4 bg-black/5 dark:bg-black rounded-xl border border-app-border space-y-3">
                    <div>
                      <label className="text-[9px] font-black text-zinc-500 uppercase tracking-widest block mb-1">Public Key</label>
                      <div className="flex items-center gap-2">
                        <code className="text-[10px] font-mono text-app-heading truncate flex-1 bg-black/20 p-1 rounded">
                          {sshKey.publicKey}
                        </code>
                        <button 
                          onClick={() => {
                            navigator.clipboard.writeText(sshKey.publicKey);
                            addToast('Public key copied!', 'success');
                          }}
                          className="p-1.5 hover:bg-app-heading/5 rounded text-zinc-500 hover:text-[#a3e635]"
                        >
                          <Copy className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                    <div>
                      <label className="text-[9px] font-black text-zinc-500 uppercase tracking-widest block mb-1">Private Key</label>
                      <div className="flex items-center gap-2">
                        <code className="text-[10px] font-mono text-app-heading truncate flex-1 bg-black/20 p-1 rounded">
                          ••••••••••••••••••••••••••••••••
                        </code>
                        <button 
                          onClick={() => {
                            navigator.clipboard.writeText(sshKey.privateKey);
                            addToast('Private key copied!', 'success');
                          }}
                          className="p-1.5 hover:bg-app-heading/5 rounded text-zinc-500 hover:text-red-500"
                        >
                          <Copy className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  </div>
                  <button 
                    onClick={handleGenerateSSHKey}
                    disabled={isGeneratingKey}
                    className="w-full py-3 bg-app-heading/5 hover:bg-app-heading/10 text-app-heading text-xs font-black rounded-lg transition-all border border-app-border flex items-center justify-center gap-2"
                  >
                    <RotateCcw className={cn("w-3.5 h-3.5", isGeneratingKey && "animate-spin")} />
                    Regenerate Keys
                  </button>
                </div>
              ) : (
                <div className="space-y-4">
                  <p className="text-xs text-zinc-500 leading-relaxed text-center italic">
                    No SSH key pair found. Generate one to access lab machines via SSH.
                  </p>
                  <button 
                    onClick={handleGenerateSSHKey}
                    disabled={isGeneratingKey}
                    className="w-full py-4 bg-[#a3e635] text-black text-sm font-black rounded-xl hover:bg-[#bef264] transition-all flex items-center justify-center gap-2 shadow-lg shadow-[#a3e635]/20"
                  >
                    {isGeneratingKey ? <RotateCcw className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
                    Generate SSH Key Pair
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      <AnimatePresence>
        {showSuccessModal && room && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/90 backdrop-blur-xl"
          >
            <motion.div 
              initial={{ scale: 0.9, y: 20, opacity: 0 }}
              animate={{ scale: 1, y: 0, opacity: 1 }}
              exit={{ scale: 0.9, y: 20, opacity: 0 }}
              className="w-full max-w-lg bg-app-card border border-[#a3e635]/30 rounded-[2rem] overflow-hidden shadow-[0_0_80px_rgba(163,230,53,0.15)] relative"
            >
              {/* Header Actions */}
              <div className="absolute top-6 right-6 flex items-center gap-2 z-20">
                <button 
                  onClick={() => setShowSuccessModal(false)}
                  className="px-3 py-1.5 bg-white/5 hover:bg-white/10 rounded-lg text-[10px] font-black text-zinc-500 hover:text-white transition-all uppercase tracking-widest flex items-center gap-1.5"
                >
                  <RotateCcw className="w-3 h-3" />
                  Skip
                </button>
                <button 
                  onClick={() => {
                    setShowSuccessModal(false);
                    onBack();
                  }}
                  className="px-3 py-1.5 bg-red-500/10 hover:bg-red-500/20 rounded-lg text-[10px] font-black text-red-500 transition-all uppercase tracking-widest flex items-center gap-1.5"
                >
                  <X className="w-3 h-3" />
                  Cut
                </button>
              </div>

              {/* Decorative elements */}
              <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-[#a3e635] to-transparent opacity-50" />
              <div className="absolute -top-24 -left-24 w-48 h-48 bg-[#a3e635]/10 blur-[100px] rounded-full" />

              <div className="p-8 md:p-10 flex flex-col items-center text-center relative z-10">
                <motion.div
                  initial={{ rotate: -10, scale: 0 }}
                  animate={{ rotate: 0, scale: 1 }}
                  transition={{ type: "spring", damping: 12, delay: 0.2 }}
                  className="w-24 h-24 bg-gradient-to-br from-[#a3e635] to-emerald-600 rounded-2xl flex items-center justify-center shadow-[0_15px_30px_rgba(163,230,53,0.3)] mb-6 relative"
                >
                  <Trophy className="w-12 h-12 text-black" strokeWidth={1.5} />
                </motion.div>

                <h2 className="text-3xl font-black text-white mb-2 tracking-tight">
                  MISSION ACCOMPLISHED
                </h2>
                <p className="text-zinc-400 text-sm mb-8 max-w-xs leading-relaxed">
                  You've successfully compromised <span className="text-[#a3e635] font-bold">{room.title}</span>. 
                </p>

                <div className="grid grid-cols-2 gap-3 w-full mb-8">
                  <div className="bg-white/5 border border-white/10 rounded-xl p-3">
                    <div className="text-[9px] font-black text-zinc-500 uppercase tracking-widest mb-0.5">Points</div>
                    <div className="text-xl font-black text-[#a3e635]">+{room.tasks?.reduce((acc, t) => acc + t.points, 0)}</div>
                  </div>
                  <div className="bg-white/5 border border-white/10 rounded-xl p-3">
                    <div className="text-[9px] font-black text-zinc-500 uppercase tracking-widest mb-0.5">Time</div>
                    <div className="text-xl font-black text-white">42m</div>
                  </div>
                </div>

                <div className="flex flex-col gap-3 w-full">
                  <button 
                    onClick={handleDownloadBadge}
                    className="w-full py-3.5 bg-[#a3e635] text-black font-black rounded-xl hover:bg-[#bef264] transition-all flex items-center justify-center gap-2.5 shadow-lg shadow-[#a3e635]/20 text-xs uppercase tracking-widest"
                  >
                    <Download className="w-4 h-4" />
                    Download Certificate
                  </button>
                  <button 
                    onClick={handleShareSuccess}
                    className="w-full py-3.5 bg-white/5 border border-white/10 text-white font-black rounded-xl hover:bg-white/10 transition-all flex items-center justify-center gap-2.5 text-xs uppercase tracking-widest"
                  >
                    <Share2 className="w-4 h-4" />
                    Share Certificate
                  </button>
                </div>

                <div className="mt-6 flex items-center gap-4">
                  <button onClick={() => shareToSocial('twitter')} className="p-2 text-zinc-500 hover:text-[#a3e635] transition-colors bg-white/5 rounded-lg">
                    <Twitter className="w-4 h-4" />
                  </button>
                  <button onClick={() => shareToSocial('linkedin')} className="p-2 text-zinc-500 hover:text-[#a3e635] transition-colors bg-white/5 rounded-lg">
                    <Linkedin className="w-4 h-4" />
                  </button>
                  <button onClick={() => shareToSocial('facebook')} className="p-2 text-zinc-500 hover:text-[#a3e635] transition-colors bg-white/5 rounded-lg">
                    <Facebook className="w-4 h-4" />
                  </button>
                  <button 
                    onClick={() => {
                      setIsFlashing(true);
                      addToast('Capturing achievement photo...', 'info');
                      setTimeout(() => {
                        setIsFlashing(false);
                        handleDownloadBadge();
                      }, 400);
                    }}
                    className="p-2 text-zinc-500 hover:text-[#a3e635] transition-colors bg-white/5 rounded-lg"
                  >
                    <Camera className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Flash Effect */}
              <AnimatePresence>
                {isFlashing && (
                  <motion.div 
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="absolute inset-0 bg-white z-[100]"
                  />
                )}
              </AnimatePresence>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

const Leaderboard = ({ addToast }: { addToast: (m: string, t?: 'success' | 'error' | 'info') => void }) => {
  const [users, setUsers] = useState<User[]>([]);
  const [activity, setActivity] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [usersRes, activityRes] = await Promise.all([
          fetch('/api/leaderboard'),
          fetch('/api/activity')
        ]);
        const usersData = await usersRes.json();
        const activityData = await activityRes.json();
        setUsers(Array.isArray(usersData) ? usersData : []);
        setActivity(Array.isArray(activityData) ? activityData : []);
      } catch (e) {
        console.error("Failed to fetch leaderboard data");
      } finally {
        setLoading(false);
      }
    };

    fetchData();

    socket.on('leaderboard-update', (updatedUsers: User[]) => {
      setUsers(updatedUsers);
    });

    socket.on('activity-update', (newActivity: any) => {
      setActivity(prev => [newActivity, ...prev].slice(0, 20));
    });

    return () => {
      socket.off('leaderboard-update');
      socket.off('activity-update');
    };
  }, []);

  const filteredUsers = users.filter(u => 
    u.username.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (loading) return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
      <LoadingSpinner size="lg" />
      <p className="text-sm font-black text-zinc-500 uppercase tracking-widest animate-pulse">Syncing Global Rankings...</p>
    </div>
  );

  return (
    <div className="max-w-7xl mx-auto p-6">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Main Leaderboard */}
        <div className="lg:col-span-8 space-y-8">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-4">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <div className="p-2 bg-yellow-500/10 rounded-lg">
                  <Trophy className="w-6 h-6 text-yellow-500" />
                </div>
                <h1 className="text-4xl font-black text-app-heading tracking-tighter">Hall of Fame</h1>
              </div>
              <p className="text-zinc-500 text-sm font-medium">The elite hackers of the HackLab community.</p>
            </div>
            
            <div className="relative w-full md:w-64">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
              <input 
                type="text"
                placeholder="Search hackers..."
                className="w-full bg-app-card border border-app-border rounded-xl pl-10 pr-4 py-2 text-sm text-app-heading focus:outline-none focus:border-[#a3e635] transition-all"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </div>

          {/* Top 3 Podium */}
          <div className="grid grid-cols-3 gap-4 items-end mb-12 pt-12">
            {/* 2nd Place */}
            {users[1] && (
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex flex-col items-center"
              >
                <div className="relative mb-4">
                  <div className="w-16 h-16 md:w-20 md:h-20 rounded-full border-4 border-zinc-400 p-1 overflow-hidden">
                    <img src={users[1].avatar_url || `https://picsum.photos/seed/${users[1].username}/100/100`} className="w-full h-full object-cover rounded-full" referrerPolicy="no-referrer" />
                  </div>
                  <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 bg-zinc-400 text-black text-[10px] font-black px-2 py-0.5 rounded-full">2ND</div>
                </div>
                <div className="text-center">
                  <p className="text-sm font-black text-app-heading truncate w-24 md:w-32">{users[1].username}</p>
                  <p className="text-xs font-bold text-zinc-500">{users[1].points} PTS</p>
                </div>
                <div className="w-full h-24 bg-zinc-400/10 border-t-2 border-zinc-400/20 mt-4 rounded-t-xl" />
              </motion.div>
            )}

            {/* 1st Place */}
            {users[0] && (
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="flex flex-col items-center"
              >
                <div className="relative mb-6">
                  <div className="absolute -top-8 left-1/2 -translate-x-1/2">
                    <Crown className="w-8 h-8 text-yellow-500 animate-bounce" />
                  </div>
                  <div className="w-20 h-20 md:w-28 md:h-28 rounded-full border-4 border-yellow-500 p-1 overflow-hidden shadow-[0_0_30px_rgba(234,179,8,0.2)]">
                    <img src={users[0].avatar_url || `https://picsum.photos/seed/${users[0].username}/100/100`} className="w-full h-full object-cover rounded-full" referrerPolicy="no-referrer" />
                  </div>
                  <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 bg-yellow-500 text-black text-xs font-black px-3 py-1 rounded-full">1ST</div>
                </div>
                <div className="text-center">
                  <p className="text-lg font-black text-app-heading truncate w-24 md:w-40">{users[0].username}</p>
                  <p className="text-sm font-bold text-yellow-500">{users[0].points} PTS</p>
                </div>
                <div className="w-full h-32 bg-yellow-500/10 border-t-2 border-yellow-500/20 mt-4 rounded-t-xl" />
              </motion.div>
            )}

            {/* 3rd Place */}
            {users[2] && (
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="flex flex-col items-center"
              >
                <div className="relative mb-4">
                  <div className="w-16 h-16 md:w-20 md:h-20 rounded-full border-4 border-orange-500 p-1 overflow-hidden">
                    <img src={users[2].avatar_url || `https://picsum.photos/seed/${users[2].username}/100/100`} className="w-full h-full object-cover rounded-full" referrerPolicy="no-referrer" />
                  </div>
                  <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 bg-orange-500 text-black text-[10px] font-black px-2 py-0.5 rounded-full">3RD</div>
                </div>
                <div className="text-center">
                  <p className="text-sm font-black text-app-heading truncate w-24 md:w-32">{users[2].username}</p>
                  <p className="text-xs font-bold text-zinc-500">{users[2].points} PTS</p>
                </div>
                <div className="w-full h-20 bg-orange-500/10 border-t-2 border-orange-500/20 mt-4 rounded-t-xl" />
              </motion.div>
            )}
          </div>

          <div className="bg-app-card border border-app-border rounded-2xl overflow-hidden shadow-xl">
            <div className="px-6 py-4 border-b border-app-border bg-black/5 flex items-center text-[10px] font-black text-zinc-500 uppercase tracking-widest">
              <span className="w-12 text-center">Rank</span>
              <span className="flex-1 ml-6">Hacker</span>
              <span className="w-24 text-right">Points</span>
            </div>
            <div className="divide-y divide-app-border">
              {filteredUsers.length > 0 ? filteredUsers.map((user, idx) => (
                <motion.div 
                  layout
                  key={user.id} 
                  className={cn(
                    "flex items-center justify-between p-4 hover:bg-app-heading/5 transition-colors group",
                    idx < 3 && "hidden" // Already shown in podium
                  )}
                >
                  <div className="flex items-center gap-6 flex-1">
                    <span className="w-12 text-center font-black text-zinc-600 group-hover:text-app-heading transition-colors">
                      #{idx + 1}
                    </span>
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl border border-app-border p-0.5 overflow-hidden">
                        <img src={user.avatar_url || `https://picsum.photos/seed/${user.username}/100/100`} className="w-full h-full object-cover rounded-lg" referrerPolicy="no-referrer" />
                      </div>
                      <div className="flex flex-col">
                        <span className="font-bold text-app-heading text-sm">{user.username}</span>
                        <div className="flex items-center gap-2">
                          <span className="text-[10px] text-zinc-500 font-bold">Streak: {user.streak || 0}d</span>
                          <Flame className="w-3 h-3 text-orange-500" />
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-6">
                    <button 
                      onClick={() => addToast(`Challenge sent to ${user.username}!`, 'info')}
                      className="hidden md:flex px-3 py-1 bg-app-heading/5 hover:bg-app-heading/10 text-app-heading text-[10px] font-black rounded-lg border border-app-border transition-all uppercase tracking-widest"
                    >
                      Challenge
                    </button>
                    <div className="text-right w-24">
                      <span className="text-emerald-500 font-mono font-bold">{user.points}</span>
                      <span className="text-[10px] text-zinc-500 uppercase ml-2 tracking-widest">PTS</span>
                    </div>
                  </div>
                </motion.div>
              )) : (
                <div className="p-12 text-center text-zinc-500">No hackers found matching your search.</div>
              )}
            </div>
          </div>
        </div>

        {/* Sidebar: Live Activity & Stats */}
        <div className="lg:col-span-4 space-y-6">
          <div className="bg-app-card border border-app-border rounded-2xl p-6 shadow-xl">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xs font-black text-app-heading uppercase tracking-widest flex items-center gap-2">
                <Zap className="w-4 h-4 text-[#a3e635]" />
                Live Activity
              </h3>
              <div className="flex items-center gap-1.5">
                <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse" />
                <span className="text-[9px] font-black text-emerald-500 uppercase tracking-widest">Live</span>
              </div>
            </div>

            <div className="space-y-4 max-h-[500px] overflow-y-auto pr-2 custom-scrollbar">
              <AnimatePresence initial={false}>
                {activity.map((item) => (
                  <motion.div 
                    key={item.id}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    className="p-3 bg-app-heading/5 border border-app-border rounded-xl"
                  >
                    <div className="flex gap-3">
                      <div className={cn(
                        "w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0",
                        item.type === 'solve' ? "bg-emerald-500/10 text-emerald-500" : "bg-orange-500/10 text-orange-500"
                      )}>
                        {item.type === 'solve' ? <CheckCircle2 className="w-4 h-4" /> : <Flame className="w-4 h-4" />}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs text-app-text leading-tight">
                          <span className="font-bold text-app-heading">{item.user}</span>
                          {item.type === 'solve' ? (
                            <> solved <span className="text-emerald-500 font-bold">{item.room}</span></>
                          ) : (
                            <> reached a <span className="text-orange-500 font-bold">{item.streak} day streak!</span></>
                          )}
                        </p>
                        <div className="flex items-center justify-between mt-1">
                          <span className="text-[9px] text-zinc-500 uppercase font-black">
                            {item.type === 'solve' ? `+${item.points} PTS` : 'Level Up'}
                          </span>
                          <span className="text-[9px] text-zinc-600 font-bold">
                            {new Date(item.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </span>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          </div>

          <div className="bg-gradient-to-br from-[#a3e635]/10 to-emerald-500/10 border border-[#a3e635]/20 rounded-2xl p-6">
            <h3 className="text-xs font-black text-app-heading uppercase tracking-widest mb-4">Global Stats</h3>
            <div className="space-y-4">
              {[
                { label: 'Total Solves', value: '12,402', icon: Target },
                { label: 'Active Hackers', value: '1,842', icon: Users },
                { label: 'Avg. Points', value: '842', icon: Award },
              ].map((stat, i) => (
                <div key={i} className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <stat.icon className="w-3.5 h-3.5 text-zinc-500" />
                    <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">{stat.label}</span>
                  </div>
                  <span className="text-xs font-black text-app-heading">{stat.value}</span>
                </div>
              ))}
            </div>
            <div className="mt-6 pt-6 border-t border-white/5">
              <button className="w-full py-2 bg-white text-black text-[10px] font-black rounded-lg uppercase tracking-widest hover:bg-zinc-200 transition-colors">
                View Global Stats
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const UploadPage = ({ token, onSuccess }: { token: string, onSuccess: () => void }) => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [type, setType] = useState<'vm' | 'file'>('vm');
  const [accessMethod, setAccessMethod] = useState('SSH');
  const [adminUsername, setAdminUsername] = useState('kbera1363@gmail.com');
  const [adminPassword, setAdminPassword] = useState('');
  const [port, setPort] = useState('');
  const [osTab, setOsTab] = useState('Ubuntu');
  const [file, setFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const xhrRef = useRef<XMLHttpRequest | null>(null);

  const osData: Record<string, string[]> = {
    'Windows': ['Any Microsoft Windows Machine (64x)'],
    'Ubuntu': [
      'Version 12.04 and kernel 3.2.0',
      'Version 13.04 and kernel 3.8.0',
      'Version 14.04 and kernel 3.13.0, 3.16.0, 3.19.0',
      'Version 14.10 and kernel 3.16.0',
      'Version 15.04 and kernel 3.19.0',
      'Version 16.04 and kernel 4.4.0, 4.8.0, 4.10.0, 4.13.0, 4.15.0',
      'Version 17.04 and kernel 4.10.0',
      'Version 18.04 and kernel 4.15.0, 5.4.0',
      'Version 20.04 and kernel 5.4.0',
      'Version 22.04 and kernel 5.15.0',
      'Version 23.04 and kernel 6.2.0'
    ],
    'RedHat': ['Red Hat Enterprise Linux (RHEL)', 'Version 5 and kernel 2.6.18', 'Version 6 and kernel 2.6.32', 'Version 7 and kernel 3.10.0', 'Version 8.0-8.9 and kernel 4.18.0', 'Version 9.0-9.4 and kernel 5.14.0'],
    'SUSE': ['SUSE Linux Enterprise Server', 'Version 11 with Service Pack 1 and kernel 2.6.32.12', 'Version 12 with Service Pack 1 and kernel 3.12.49'],
    'CentOS': ['Version 6.0-6.10 and kernel 2.6.32', 'Version 7.0-7.9 and kernel 3.10.0'],
    'Debian': ['Version 6.1-9.0 and kernel 5.14.0'],
    'Oracle': ['Version 6.1-9.0 and kernel 5.14.0'],
    'Fedora': ['Version 38 and kernel 6.2.9', 'Version 39 and kernel 6.5.6']
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file) {
      alert('Please select an .ova file to upload.');
      return;
    }
    
    setIsUploading(true);
    setUploadProgress(0);
    const formData = new FormData();
    formData.append('title', title);
    formData.append('description', description);
    formData.append('file', file);

    const xhr = new XMLHttpRequest();
    xhrRef.current = xhr;

    xhr.upload.addEventListener('progress', (event) => {
      if (event.lengthComputable) {
        const percentComplete = Math.round((event.loaded / event.total) * 100);
        setUploadProgress(percentComplete);
      }
    });

    xhr.addEventListener('load', () => {
      xhrRef.current = null;
      if (xhr.status >= 200 && xhr.status < 300) {
        onSuccess();
      } else {
        let errorMsg = 'Upload failed';
        try {
          const response = JSON.parse(xhr.responseText);
          if (response.error) errorMsg += `: ${response.error}`;
        } catch (e) {
          errorMsg += ` (Status: ${xhr.status})`;
        }
        console.error(errorMsg);
        alert(errorMsg);
      }
      setIsUploading(false);
    });

    xhr.addEventListener('error', () => {
      xhrRef.current = null;
      console.error('Error uploading room');
      setIsUploading(false);
    });

    xhr.addEventListener('abort', () => {
      xhrRef.current = null;
      console.log('Upload aborted');
      setIsUploading(false);
      setUploadProgress(0);
    });

    xhr.open('POST', '/api/rooms');
    xhr.setRequestHeader('Authorization', `Bearer ${token}`);
    xhr.send(formData);
  };

  const handleCancel = () => {
    if (xhrRef.current) {
      xhrRef.current.abort();
    }
  };

  return (
    <div className="max-w-5xl mx-auto px-4 py-12">
      {/* Upload Header */}
      <div className="text-center mb-16">
        <div className="inline-flex items-center justify-center w-24 h-24 bg-app-heading/5 rounded-3xl mb-6 relative group">
          <Cloud className="w-12 h-12 text-app-heading group-hover:scale-110 transition-transform" />
          <Plus className="w-6 h-6 text-[#a3e635] absolute -top-2 -right-2" />
        </div>
        <h1 className="text-6xl font-black text-app-heading tracking-tighter mb-4">Upload</h1>
        <p className="text-xl text-zinc-500 font-medium">Upload virtual machines or files to use in room tasks.</p>
      </div>

      <div className="bg-app-card border border-app-border rounded-3xl overflow-hidden shadow-2xl">
        <div className="p-8 md:p-12">
          <h2 className="text-2xl font-black text-app-heading mb-8 tracking-tight">Upload virtual machine or file</h2>
          
          <form onSubmit={handleSubmit} className="space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="space-y-6">
                <div>
                  <label className="block text-[10px] font-black text-zinc-500 uppercase tracking-widest mb-3 ml-1">Title</label>
                  <input 
                    type="text" 
                    className="w-full bg-black/5 dark:bg-black/40 border border-app-border rounded-xl px-5 py-4 text-app-heading focus:outline-none focus:border-[#a3e635] transition-all font-medium"
                    placeholder="SkyCTF2018"
                    value={title}
                    onChange={e => setTitle(e.target.value)}
                    required
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-black text-zinc-500 uppercase tracking-widest mb-3 ml-1">Description</label>
                  <textarea 
                    className="w-full bg-black/5 dark:bg-black/40 border border-app-border rounded-xl px-5 py-4 text-app-heading focus:outline-none focus:border-[#a3e635] transition-all font-medium min-h-[120px]"
                    placeholder="Room for first year university students..."
                    value={description}
                    onChange={e => setDescription(e.target.value)}
                    required
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-black text-zinc-500 uppercase tracking-widest mb-3 ml-1">Type</label>
                  <div className="flex gap-6">
                    <label className="flex items-center gap-3 cursor-pointer group">
                      <div className={cn(
                        "w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all",
                        type === 'vm' ? "border-[#a3e635] bg-[#a3e635]" : "border-app-border group-hover:border-zinc-500"
                      )}>
                        {type === 'vm' && <div className="w-2 h-2 bg-black rounded-full" />}
                      </div>
                      <input type="radio" className="hidden" name="type" checked={type === 'vm'} onChange={() => setType('vm')} />
                      <span className="text-sm font-black text-app-heading uppercase tracking-widest">Virtual Machine</span>
                    </label>
                    <label className="flex items-center gap-3 cursor-pointer group">
                      <div className={cn(
                        "w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all",
                        type === 'file' ? "border-[#a3e635] bg-[#a3e635]" : "border-app-border group-hover:border-zinc-500"
                      )}>
                        {type === 'file' && <div className="w-2 h-2 bg-black rounded-full" />}
                      </div>
                      <input type="radio" className="hidden" name="type" checked={type === 'file'} onChange={() => setType('file')} />
                      <span className="text-sm font-black text-app-heading uppercase tracking-widest">Downloadable File</span>
                    </label>
                  </div>
                </div>
              </div>

              <div className="space-y-6">
                <div>
                  <label className="block text-[10px] font-black text-zinc-500 uppercase tracking-widest mb-3 ml-1">Upload* (Accepted file types: .ova)</label>
                  <div className="relative group">
                    <input 
                      type="file" 
                      className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                      accept=".ova"
                      onChange={e => setFile(e.target.files?.[0] || null)}
                    />
                    <div className="w-full bg-black/5 dark:bg-black/40 border border-dashed border-app-border rounded-xl px-5 py-4 flex items-center justify-between group-hover:border-[#a3e635]/50 transition-all">
                      <span className="text-sm text-zinc-500 font-medium">{file ? file.name : "Choose file..."}</span>
                      <button type="button" className="px-4 py-2 bg-app-heading/5 text-app-heading text-[10px] font-black rounded-lg border border-app-border uppercase tracking-widest">Browse...</button>
                    </div>
                  </div>
                </div>

                <div>
                  <label className="block text-[10px] font-black text-zinc-500 uppercase tracking-widest mb-3 ml-1">Access method*</label>
                  <select 
                    className="w-full bg-black/5 dark:bg-black/40 border border-app-border rounded-xl px-5 py-4 text-app-heading focus:outline-none focus:border-[#a3e635] transition-all font-medium appearance-none"
                    value={accessMethod}
                    onChange={e => setAccessMethod(e.target.value)}
                  >
                    <option>SSH</option>
                    <option>RDP</option>
                    <option>VNC</option>
                    <option>HTTP</option>
                  </select>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[10px] font-black text-zinc-500 uppercase tracking-widest mb-3 ml-1">Administrator Username*</label>
                    <input 
                      type="text" 
                      className="w-full bg-black/5 dark:bg-black/40 border border-app-border rounded-xl px-5 py-4 text-app-heading focus:outline-none focus:border-[#a3e635] transition-all font-medium"
                      value={adminUsername}
                      onChange={e => setAdminUsername(e.target.value)}
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-black text-zinc-500 uppercase tracking-widest mb-3 ml-1">Administrator Password*</label>
                    <input 
                      type="password" 
                      className="w-full bg-black/5 dark:bg-black/40 border border-app-border rounded-xl px-5 py-4 text-app-heading focus:outline-none focus:border-[#a3e635] transition-all font-medium"
                      value={adminPassword}
                      onChange={e => setAdminPassword(e.target.value)}
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[10px] font-black text-zinc-500 uppercase tracking-widest mb-3 ml-1">Port (Optional)</label>
                  <input 
                    type="text" 
                    className="w-full bg-black/5 dark:bg-black/40 border border-app-border rounded-xl px-5 py-4 text-app-heading focus:outline-none focus:border-[#a3e635] transition-all font-medium"
                    placeholder="Default port: 3389 (RDP) or 22 (SSH)"
                    value={port}
                    onChange={e => setPort(e.target.value)}
                  />
                  <p className="mt-2 text-[10px] text-zinc-500 font-medium">Credentials will be stored securely and used for maintenance purposes. They won't be made public.</p>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-4">
              <button 
                type="submit"
                disabled={isUploading}
                className={cn(
                  "px-12 py-4 bg-[#a3e635] hover:bg-[#bef264] text-black font-black rounded-2xl transition-all shadow-xl shadow-[#a3e635]/20 uppercase tracking-widest text-sm flex items-center gap-3",
                  isUploading && "opacity-50 cursor-not-allowed"
                )}
              >
                {isUploading ? (
                  <>
                    <RotateCcw className="w-4 h-4 animate-spin" />
                    Uploading {uploadProgress}%
                  </>
                ) : (
                  "Upload and finish"
                )}
              </button>

              {isUploading && (
                <button 
                  type="button"
                  onClick={handleCancel}
                  className="px-8 py-4 bg-red-500/10 hover:bg-red-500/20 text-red-500 font-black rounded-2xl transition-all border border-red-500/20 uppercase tracking-widest text-sm flex items-center gap-2"
                >
                  <X className="w-4 h-4" />
                  Cancel
                </button>
              )}
            </div>
          </form>
        </div>

        <div className="p-8 md:p-12 bg-black/5 dark:bg-black/20 border-t border-app-border">
          <div className="space-y-12">
            <section>
              <h3 className="text-xl font-black text-app-heading mb-6 tracking-tight">Upload Instructions</h3>
              <p className="text-sm text-zinc-500 leading-relaxed font-medium">
                Please note that you can only upload one object at a time. To ensure that your upload succeeds, do not refresh the page while your item is uploading and do not open another instance of the upload page. Please also be sure to provide the machine's administrator/ privileged user credentials and access method. These will be used for maintenance purposes and won't be made public.
              </p>
            </section>

            <section>
              <h3 className="text-xl font-black text-app-heading mb-8 tracking-tight">Supported virtual machines</h3>
              <div className="border-b border-app-border mb-8 flex items-center gap-8 overflow-x-auto scrollbar-hide">
                {Object.keys(osData).map(os => (
                  <button
                    key={os}
                    onClick={() => setOsTab(os)}
                    className={cn(
                      "pb-4 text-xs font-black uppercase tracking-widest border-b-2 transition-all whitespace-nowrap",
                      osTab === os ? "text-[#a3e635] border-[#a3e635]" : "text-zinc-500 border-transparent hover:text-app-heading"
                    )}
                  >
                    {os}
                  </button>
                ))}
              </div>
              <div className="bg-black/5 dark:bg-black/40 border border-app-border rounded-2xl p-8">
                <p className="text-[10px] font-black text-[#a3e635] uppercase tracking-widest mb-4">64bit only</p>
                <ul className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-2">
                  {osData[osTab].map((item, i) => (
                    <li key={i} className="text-xs text-zinc-500 font-medium flex items-center gap-2">
                      <div className="w-1.5 h-1.5 bg-[#a3e635] rounded-full" />
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            </section>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
              <section>
                <h3 className="text-lg font-black text-app-heading mb-4 tracking-tight">Virtual machine resources</h3>
                <p className="text-xs text-zinc-500 leading-relaxed font-medium">
                  The machines you upload are deployed with low resources. If your machine is running slow and needs more RAM/vCPUs, email us to increase it: <span className="text-[#a3e635]">support@tryhackme.com</span>
                </p>
              </section>
              <section>
                <h3 className="text-lg font-black text-app-heading mb-4 tracking-tight">Control your machine in-browser</h3>
                <p className="text-xs text-zinc-500 leading-relaxed font-medium">
                  Let your users control your machine directly in their browser (this also removes any OpenVPN requirement). Email us the credentials (whether for SSH, RDP, or VNC), and we will add this functionality for you.
                </p>
              </section>
              <section>
                <h3 className="text-lg font-black text-app-heading mb-4 tracking-tight">Costs</h3>
                <p className="text-xs text-zinc-500 leading-relaxed font-medium">
                  We cover the storage and processing costs for your uploaded virtual machines. To keep this sustainable, free accounts can now upload <span className="text-app-heading font-black">1 VM</span> and subscribers can upload up to <span className="text-app-heading font-black">3</span>. If you reach your limit, you can delete an existing VM or submit your room to be published as a public room to free up space.
                </p>
              </section>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const ManageRooms = ({ rooms, setView, setSelectedRoomId }: { rooms: Room[], setView: (v: string) => void, setSelectedRoomId: (id: number) => void }) => {
  return (
    <div className="max-w-7xl mx-auto px-4 py-12">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-8 mb-12">
        <div>
          <h1 className="text-5xl font-black text-app-heading tracking-tighter mb-4">My Rooms</h1>
          <p className="text-zinc-500 text-lg">Manage the rooms that you have joined and saved.</p>
        </div>
        <button 
          onClick={() => setView('create')}
          className="px-8 py-3 bg-[#a3e635] hover:bg-[#bef264] text-black text-xs font-black rounded-xl uppercase tracking-widest transition-all shadow-lg shadow-[#a3e635]/20 flex items-center gap-2"
        >
          <Plus className="w-4 h-4" />
          Create new room
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {rooms.map(room => (
          <div key={room.id} className="bg-app-card border border-app-border rounded-2xl overflow-hidden group hover:border-[#a3e635]/50 transition-all">
            <div className="h-40 bg-black/20 relative overflow-hidden">
              <img src={`https://picsum.photos/seed/${room.id}/400/200`} className="w-full h-full object-cover opacity-60 group-hover:scale-110 transition-transform duration-500" />
              <div className="absolute top-4 left-4 flex gap-2">
                <span className="px-2 py-0.5 bg-black/60 text-white text-[10px] font-black rounded uppercase tracking-widest backdrop-blur-md border border-white/10">{room.difficulty}</span>
              </div>
            </div>
            <div className="p-6">
              <h3 className="text-xl font-black text-app-heading mb-2 group-hover:text-[#a3e635] transition-colors">{room.title}</h3>
              <p className="text-xs text-zinc-500 font-medium mb-6 line-clamp-2">{room.description}</p>
              <button 
                onClick={() => {
                  setSelectedRoomId(room.id);
                  setView('manage-room-detail');
                }}
                className="w-full py-3 bg-app-heading/5 hover:bg-app-heading/10 text-app-heading text-xs font-black rounded-xl border border-app-border transition-all uppercase tracking-widest flex items-center justify-center gap-2"
              >
                <Settings className="w-4 h-4" />
                Manage room
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

const ManageRoomDetail = ({ roomId, rooms, onBack, addToast, onUpdate }: { roomId: number, rooms: Room[], onBack: () => void, addToast: (m: string, t?: 'success' | 'error' | 'info') => void, onUpdate: () => void }) => {
  const room = rooms.find(r => r.id === roomId);
  const [activeTab, setActiveTab] = useState('general');
  const [selectedTaskId, setSelectedTaskId] = useState<number | null>(null);
  const [isGeneratingVideo, setIsGeneratingVideo] = useState(false);
  const [generatedVideoUrl, setGeneratedVideoUrl] = useState<string | null>(null);
  
  // Form states
  const [title, setTitle] = useState(room?.title || '');
  const [description, setDescription] = useState(room?.description || '');
  const [roomCode, setRoomCode] = useState(room?.title.toLowerCase().replace(/\s+/g, '-') || '');
  const [difficulty, setDifficulty] = useState<string>(room?.difficulty || 'Easy');
  const [type, setType] = useState('Challenge');
  const [completionTime, setCompletionTime] = useState(45);
  const [isPublic, setIsPublic] = useState(true);
  const [machineIp, setMachineIp] = useState(room?.machine_ip || '10.10.123.45');
  const [isUpdating, setIsUpdating] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  
  // Enhanced states
  const [machineOs, setMachineOs] = useState('Linux');
  const [themeColor, setThemeColor] = useState('#a3e635');
  const [certificateTemplate, setCertificateTemplate] = useState('Standard');
  const [videoAutoplay, setVideoAutoplay] = useState(false);
  const [prerequisites, setPrerequisites] = useState<string[]>(['Basic Linux', 'Networking Fundamentals']);
  const [learningPath, setLearningPath] = useState('Offensive Security');

  const bannerInputRef = useRef<HTMLInputElement>(null);
  const avatarInputRef = useRef<HTMLInputElement>(null);
  const [bannerUrl, setBannerUrl] = useState(`https://picsum.photos/seed/${room.id}-banner/1200/400`);
  const [avatarUrl, setAvatarUrl] = useState(`https://picsum.photos/seed/${room.id}-avatar/200/200`);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>, type: 'banner' | 'avatar') => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        if (type === 'banner') setBannerUrl(reader.result as string);
        else setAvatarUrl(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const sidebarItems = [
    { id: 'general', label: 'General Settings', icon: Settings },
    { id: 'design', label: 'Design', icon: Layout },
    { id: 'video', label: 'Video', icon: Video },
    { id: 'stats', label: 'Stats', icon: BarChart3 },
    { id: 'categories', label: 'Categories', icon: Target },
    { id: 'tasks', label: 'Tasks', icon: Terminal },
    { id: 'writeups', label: 'Write-ups', icon: FileText },
    { id: 'users', label: 'Users', icon: Users },
    { id: 'clone', label: 'Clone', icon: Copy },
    { id: 'access', label: 'Access', icon: Lock },
    { id: 'reset', label: 'Reset', icon: RotateCcw },
    { id: 'delete', label: 'Delete', icon: Trash2 },
  ];

  if (!room) return null;

  const handleUpdateRoom = async () => {
    setIsUpdating(true);
    try {
      const res = await fetch(`/api/rooms/${roomId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title,
          description,
          difficulty,
          machine_ip: machineIp,
          // Add other fields as needed by your API
        })
      });
      
      if (res.ok) {
        addToast('Room updated successfully!', 'success');
        onUpdate();
      } else {
        throw new Error('Failed to update room');
      }
    } catch (err) {
      addToast('Error updating room settings', 'error');
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-12">
      <div className="flex items-center gap-4 mb-8">
        <button 
          onClick={onBack}
          className="p-2 text-zinc-500 hover:text-app-heading transition-colors"
        >
          <ChevronLeft className="w-6 h-6" />
        </button>
        <div>
          <h1 className="text-4xl font-black text-app-heading tracking-tighter">Manage room</h1>
          <p className="text-zinc-500 text-sm">Update room settings, tasks and users.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
        {/* Sidebar */}
        <div className="lg:col-span-3 space-y-1">
          <div className="flex items-center gap-2 px-4 py-2 mb-4">
            <div className="w-2 h-2 bg-zinc-500 rounded-full" />
            <span className="text-[10px] font-black text-zinc-500 uppercase tracking-widest">Private room</span>
          </div>
          {sidebarItems.map(item => (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={cn(
                "w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-black transition-all",
                activeTab === item.id ? "bg-[#a3e635] text-black shadow-lg shadow-[#a3e635]/20" : "text-zinc-400 hover:text-app-heading hover:bg-app-heading/5"
              )}
            >
              <item.icon className="w-4 h-4" />
              {item.label}
            </button>
          ))}
        </div>

        {/* Content */}
        <div className="lg:col-span-9 bg-app-card border border-app-border rounded-3xl p-10 shadow-xl">
          {activeTab === 'general' && (
            <div className="space-y-10">
              <div className="flex items-center justify-between mb-8">
                <div className="flex items-center gap-3">
                  <Settings className="w-6 h-6 text-[#a3e635]" />
                  <h3 className="text-2xl font-black text-app-heading tracking-tight">General Settings</h3>
                </div>
                <div className="flex items-center gap-3">
                  <button 
                    onClick={() => {
                      navigator.clipboard.writeText(`${window.location.origin}/room/${roomCode}`);
                      addToast('Room link copied to clipboard!', 'success');
                    }}
                    className="p-2.5 bg-app-heading/5 hover:bg-app-heading/10 text-app-heading rounded-xl border border-app-border transition-all flex items-center gap-2 text-[10px] font-black uppercase tracking-widest"
                    title="Copy Room Link"
                  >
                    <Copy className="w-3.5 h-3.5" />
                    Copy Link
                  </button>
                  <button 
                    onClick={() => setShowPreview(true)}
                    className="p-2.5 bg-app-heading/5 hover:bg-app-heading/10 text-app-heading rounded-xl border border-app-border transition-all flex items-center gap-2 text-[10px] font-black uppercase tracking-widest"
                  >
                    <Globe className="w-3.5 h-3.5" />
                    Preview
                  </button>
                  <div className="h-8 w-px bg-app-border mx-1" />
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-black text-zinc-500 uppercase tracking-widest">Visibility:</span>
                    <button 
                      onClick={() => setIsPublic(!isPublic)}
                      className={cn(
                        "px-3 py-1 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all border",
                        isPublic ? "bg-emerald-500/10 text-emerald-500 border-emerald-500/20" : "bg-red-500/10 text-red-500 border-red-500/20"
                      )}
                    >
                      {isPublic ? 'Public' : 'Private'}
                    </button>
                  </div>
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-zinc-500 uppercase tracking-widest px-1">Title*</label>
                  <input 
                    type="text" 
                    value={title}
                    onChange={(e) => setTitle(e.target.value.slice(0, 45))}
                    className="w-full bg-black/5 dark:bg-black/40 border border-app-border rounded-xl px-4 py-3 text-sm text-app-heading focus:outline-none focus:border-[#a3e635] transition-all"
                  />
                  <div className="flex justify-between px-1">
                    <p className="text-[10px] text-zinc-500 font-medium">Max character count is 45.</p>
                    <p className={cn("text-[10px] font-black", title.length >= 40 ? "text-red-500" : "text-zinc-500")}>{title.length}/45</p>
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-zinc-500 uppercase tracking-widest px-1">Description*</label>
                  <textarea 
                    value={description}
                    onChange={(e) => setDescription(e.target.value.slice(0, 250))}
                    className="w-full bg-black/5 dark:bg-black/40 border border-app-border rounded-xl px-4 py-3 text-sm text-app-heading focus:outline-none focus:border-[#a3e635] transition-all h-32 resize-none"
                  />
                  <div className="flex justify-between px-1">
                    <p className="text-[10px] text-zinc-500 font-medium">Max character count is 250.</p>
                    <p className={cn("text-[10px] font-black", description.length >= 240 ? "text-red-500" : "text-zinc-500")}>{description.length}/250</p>
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-zinc-500 uppercase tracking-widest px-1">Room code*</label>
                  <div className="flex gap-2">
                    <input 
                      type="text" 
                      value={roomCode}
                      onChange={(e) => setRoomCode(e.target.value.toLowerCase().replace(/\s+/g, '-'))}
                      className="flex-1 bg-black/5 dark:bg-black/40 border border-app-border rounded-xl px-4 py-3 text-sm text-app-heading focus:outline-none focus:border-[#a3e635] transition-all"
                    />
                    <button 
                      onClick={() => setRoomCode(title.toLowerCase().replace(/\s+/g, '-'))}
                      className="px-4 py-2 bg-app-heading/5 hover:bg-app-heading/10 text-app-heading text-xs font-black rounded-xl border border-app-border transition-all"
                    >
                      Auto
                    </button>
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-zinc-500 uppercase tracking-widest px-1">Completion time*</label>
                  <div className="flex gap-2">
                    <input 
                      type="number" 
                      value={completionTime}
                      onChange={(e) => setCompletionTime(parseInt(e.target.value) || 0)}
                      className="flex-1 bg-black/5 dark:bg-black/40 border border-app-border rounded-xl px-4 py-3 text-sm text-app-heading focus:outline-none focus:border-[#a3e635] transition-all"
                    />
                    <span className="flex items-center text-xs text-zinc-500 font-black uppercase tracking-widest">minutes</span>
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-zinc-500 uppercase tracking-widest px-1">Machine IP Address*</label>
                  <input 
                    type="text" 
                    value={machineIp}
                    onChange={(e) => setMachineIp(e.target.value)}
                    placeholder="e.g. 10.10.123.45"
                    className="w-full bg-black/5 dark:bg-black/40 border border-app-border rounded-xl px-4 py-3 text-sm text-app-heading focus:outline-none focus:border-[#a3e635] transition-all"
                  />
                  <p className="text-[10px] text-zinc-500 font-medium px-1">The IP address users will target in this lab.</p>
                </div>
              </div>

              <div className="h-px bg-app-border" />

              <div className="space-y-8">
                <div className="flex items-center gap-3">
                  <Monitor className="w-6 h-6 text-[#a3e635]" />
                  <h3 className="text-xl font-black text-app-heading tracking-tight">Room Classification</h3>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                  <div className="space-y-4">
                    <label className="text-[10px] font-black text-zinc-500 uppercase tracking-widest px-1">Difficulty</label>
                    <div className="grid grid-cols-2 gap-3">
                      {['Info', 'Easy', 'Medium', 'Hard', 'Insane'].map(d => (
                        <button 
                          key={d}
                          onClick={() => setDifficulty(d)}
                          className={cn(
                            "px-4 py-2 rounded-xl border text-[10px] font-black uppercase tracking-widest transition-all",
                            difficulty === d ? "bg-[#a3e635] text-black border-[#a3e635]" : "bg-app-heading/5 text-zinc-500 border-app-border hover:border-app-heading/10"
                          )}
                        >
                          {d}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="space-y-4">
                    <label className="text-[10px] font-black text-zinc-500 uppercase tracking-widest px-1">Type</label>
                    <div className="flex flex-col gap-3">
                      {['Challenge', 'Walkthrough'].map(t => (
                        <button 
                          key={t}
                          onClick={() => setType(t)}
                          className={cn(
                            "w-full px-4 py-2 rounded-xl border text-[10px] font-black uppercase tracking-widest transition-all",
                            type === t ? "bg-[#a3e635] text-black border-[#a3e635]" : "bg-app-heading/5 text-zinc-500 border-app-border hover:border-app-heading/10"
                          )}
                        >
                          {t}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="space-y-4">
                    <label className="text-[10px] font-black text-zinc-500 uppercase tracking-widest px-1">Machine OS</label>
                    <div className="flex flex-col gap-3">
                      {['Linux', 'Windows', 'MacOS'].map(os => (
                        <button 
                          key={os}
                          onClick={() => setMachineOs(os)}
                          className={cn(
                            "w-full px-4 py-2 rounded-xl border text-[10px] font-black uppercase tracking-widest transition-all",
                            machineOs === os ? "bg-[#a3e635] text-black border-[#a3e635]" : "bg-app-heading/5 text-zinc-500 border-app-border hover:border-app-heading/10"
                          )}
                        >
                          {os}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              <div className="h-px bg-app-border" />

              <div className="space-y-8">
                <div className="flex items-center gap-3">
                  <Shield className="w-6 h-6 text-[#a3e635]" />
                  <h3 className="text-xl font-black text-app-heading tracking-tight">Advanced Configuration</h3>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="flex items-center justify-between p-4 bg-app-heading/5 border border-app-border rounded-xl">
                    <div>
                      <h4 className="text-xs font-black text-app-heading uppercase tracking-widest">Enable Hints</h4>
                      <p className="text-[10px] text-zinc-500">Allow users to request AI hints.</p>
                    </div>
                    <button className="w-10 h-5 bg-[#a3e635] rounded-full relative">
                      <div className="absolute right-1 top-1 w-3 h-3 bg-white rounded-full" />
                    </button>
                  </div>
                  <div className="flex items-center justify-between p-4 bg-app-heading/5 border border-app-border rounded-xl">
                    <div>
                      <h4 className="text-xs font-black text-app-heading uppercase tracking-widest">Show Leaderboard</h4>
                      <p className="text-[10px] text-zinc-500">Display top solvers for this room.</p>
                    </div>
                    <button className="w-10 h-5 bg-[#a3e635] rounded-full relative">
                      <div className="absolute right-1 top-1 w-3 h-3 bg-white rounded-full" />
                    </button>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-4 pt-4">
                <button 
                  onClick={handleUpdateRoom}
                  disabled={isUpdating}
                  className={cn(
                    "px-8 py-3 bg-[#a3e635] hover:bg-[#bef264] text-black font-black rounded-xl transition-all shadow-lg shadow-[#a3e635]/20 flex items-center gap-2",
                    isUpdating && "opacity-50 cursor-not-allowed"
                  )}
                >
                  {isUpdating ? <RotateCcw className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                  Update room settings
                </button>
                <button 
                  onClick={() => {
                    setTitle(room.title);
                    setDescription(room.description);
                    setDifficulty(room.difficulty);
                    setMachineIp(room.machine_ip || '');
                  }}
                  className="px-8 py-3 bg-app-heading/5 hover:bg-app-heading/10 text-app-heading text-xs font-black rounded-xl border border-app-border transition-all"
                >
                  Reset changes
                </button>
              </div>
            </div>
          )}

          {activeTab === 'design' && (
            <div className="space-y-10">
              <div className="flex items-center gap-3 mb-8">
                <Layout className="w-6 h-6 text-[#a3e635]" />
                <h3 className="text-2xl font-black text-app-heading tracking-tight">Design</h3>
              </div>

              <div className="space-y-8">
                <div className="space-y-4">
                  <label className="text-[10px] font-black text-zinc-500 uppercase tracking-widest px-1">Banner</label>
                  <input 
                    type="file" 
                    ref={bannerInputRef} 
                    className="hidden" 
                    accept="image/*"
                    onChange={(e) => handleFileChange(e, 'banner')}
                  />
                  <div className="w-full h-48 bg-black/20 rounded-2xl border border-app-border overflow-hidden relative group">
                    <img src={bannerUrl} className="w-full h-full object-cover opacity-60" />
                    <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity bg-black/40">
                      <button 
                        onClick={() => bannerInputRef.current?.click()}
                        className="px-6 py-2 bg-white text-black text-xs font-black rounded-lg uppercase tracking-widest"
                      >
                        Browse...
                      </button>
                    </div>
                  </div>
                  <p className="text-[10px] text-zinc-500 font-medium px-1">Select a 1920 x 300 px PNG image with a resolution of 72 DPI to use as a banner image.</p>
                </div>

                <div className="space-y-4">
                  <label className="text-[10px] font-black text-zinc-500 uppercase tracking-widest px-1">Room avatar</label>
                  <input 
                    type="file" 
                    ref={avatarInputRef} 
                    className="hidden" 
                    accept="image/*"
                    onChange={(e) => handleFileChange(e, 'avatar')}
                  />
                  <div className="flex items-center gap-8">
                    <div className="w-24 h-24 bg-black/20 rounded-2xl border border-app-border overflow-hidden relative group">
                      <img src={avatarUrl} className="w-full h-full object-cover opacity-60" />
                      <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity bg-black/40">
                        <button 
                          onClick={() => avatarInputRef.current?.click()}
                          className="p-2 bg-white text-black rounded-lg"
                        >
                          <Plus className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                    <div className="flex-1 space-y-4">
                      <div className="flex gap-3">
                        <button 
                          onClick={() => avatarInputRef.current?.click()}
                          className="px-6 py-2 bg-app-heading/5 hover:bg-app-heading/10 text-app-heading text-[10px] font-black rounded-lg border border-app-border transition-all uppercase tracking-widest"
                        >
                          Choose a file...
                        </button>
                        <button 
                          onClick={() => setAvatarUrl(`https://picsum.photos/seed/${Math.random()}/200/200`)}
                          className="px-6 py-2 bg-app-heading/5 hover:bg-app-heading/10 text-app-heading text-[10px] font-black rounded-lg border border-app-border transition-all uppercase tracking-widest"
                        >
                          Generate random avatar
                        </button>
                      </div>
                      <p className="text-[10px] text-zinc-500 font-medium">Supported formats: SVG, JPG or PNG. Max file size is 5MB.</p>
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <label className="text-[10px] font-black text-zinc-500 uppercase tracking-widest px-1">Theme & Branding</label>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div className="p-6 bg-app-heading/5 border border-app-border rounded-2xl space-y-4">
                      <label className="text-[10px] font-black text-zinc-500 uppercase tracking-widest block">Primary Theme Color</label>
                      <div className="flex items-center gap-4">
                        <input 
                          type="color" 
                          value={themeColor}
                          onChange={(e) => setThemeColor(e.target.value)}
                          className="w-12 h-12 rounded-lg bg-transparent border-none cursor-pointer"
                        />
                        <code className="text-xs font-mono text-app-heading bg-black/20 px-2 py-1 rounded uppercase">{themeColor}</code>
                      </div>
                    </div>
                    <div className="p-6 bg-app-heading/5 border border-app-border rounded-2xl space-y-4">
                      <label className="text-[10px] font-black text-zinc-500 uppercase tracking-widest block">Certificate Template</label>
                      <select 
                        value={certificateTemplate}
                        onChange={(e) => setCertificateTemplate(e.target.value)}
                        className="w-full bg-black/5 dark:bg-black/40 border border-app-border rounded-xl px-4 py-3 text-sm text-app-heading focus:outline-none focus:border-[#a3e635] transition-all"
                      >
                        <option>Standard</option>
                        <option>Modern Dark</option>
                        <option>Retro Terminal</option>
                        <option>Elite Hacker</option>
                      </select>
                    </div>
                  </div>
                </div>
              </div>

              <button className="px-8 py-3 bg-[#a3e635] hover:bg-[#bef264] text-black font-black rounded-xl transition-all shadow-lg shadow-[#a3e635]/20">
                Update room
              </button>
            </div>
          )}

          {activeTab === 'video' && (
            <div className="space-y-10">
              <div className="flex items-center gap-3 mb-8">
                <Video className="w-6 h-6 text-[#a3e635]" />
                <h3 className="text-2xl font-black text-app-heading tracking-tight">Video</h3>
              </div>

              <p className="text-sm text-zinc-500 font-medium leading-relaxed">Add up to two videos to your room by providing valid URLs. Each video can be individually toggled on or off. The videos will be embedded directly into your room to enhance the learning experience.</p>

              <div className="space-y-8">
                <div className="flex items-center justify-between p-6 bg-app-heading/5 border border-app-border rounded-2xl">
                  <div>
                    <h4 className="text-sm font-black text-app-heading uppercase tracking-widest">Video Settings</h4>
                    <p className="text-xs text-zinc-500">Configure how videos behave in your room.</p>
                  </div>
                  <div className="flex items-center gap-4">
                    <span className="text-[10px] font-black text-zinc-500 uppercase tracking-widest">Auto-play:</span>
                    <button 
                      onClick={() => setVideoAutoplay(!videoAutoplay)}
                      className={cn(
                        "w-10 h-5 rounded-full relative transition-all",
                        videoAutoplay ? "bg-[#a3e635]" : "bg-zinc-700"
                      )}
                    >
                      <div className={cn(
                        "absolute top-1 w-3 h-3 bg-white rounded-full transition-all",
                        videoAutoplay ? "right-1" : "left-1"
                      )} />
                    </button>
                  </div>
                </div>

                <div className="p-6 bg-app-heading/5 border border-app-border rounded-2xl space-y-6">
                  <div className="flex items-center justify-between">
                    <h4 className="text-sm font-black text-app-heading uppercase tracking-widest">First Video</h4>
                    <div className="w-10 h-5 bg-[#a3e635] rounded-full relative">
                      <div className="absolute right-1 top-1 w-3 h-3 bg-white rounded-full" />
                    </div>
                  </div>
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <label className="text-[10px] font-black text-zinc-500 uppercase tracking-widest px-1">First Video URL</label>
                      <input 
                        type="text" 
                        placeholder="Enter URL"
                        className="w-full bg-black/5 dark:bg-black/40 border border-app-border rounded-xl px-4 py-3 text-sm text-app-heading focus:outline-none focus:border-[#a3e635] transition-all"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] font-black text-zinc-500 uppercase tracking-widest px-1">First Video Title (Optional)</label>
                      <input 
                        type="text" 
                        placeholder="Enter custom title"
                        className="w-full bg-black/5 dark:bg-black/40 border border-app-border rounded-xl px-4 py-3 text-sm text-app-heading focus:outline-none focus:border-[#a3e635] transition-all"
                      />
                    </div>
                  </div>
                </div>

                <div className="p-6 bg-app-heading/5 border border-app-border rounded-2xl space-y-6 opacity-50">
                  <div className="flex items-center justify-between">
                    <h4 className="text-sm font-black text-app-heading uppercase tracking-widest">Second Video</h4>
                    <div className="w-10 h-5 bg-zinc-700 rounded-full relative">
                      <div className="absolute left-1 top-1 w-3 h-3 bg-white rounded-full" />
                    </div>
                  </div>
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <label className="text-[10px] font-black text-zinc-500 uppercase tracking-widest px-1">Second Video URL</label>
                      <input 
                        type="text" 
                        placeholder="Enter URL"
                        disabled
                        className="w-full bg-black/5 dark:bg-black/40 border border-app-border rounded-xl px-4 py-3 text-sm text-app-heading focus:outline-none transition-all cursor-not-allowed"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] font-black text-zinc-500 uppercase tracking-widest px-1">Second Video Title (Optional)</label>
                      <input 
                        type="text" 
                        placeholder="Enter custom title"
                        disabled
                        className="w-full bg-black/5 dark:bg-black/40 border border-app-border rounded-xl px-4 py-3 text-sm text-app-heading focus:outline-none transition-all cursor-not-allowed"
                      />
                    </div>
                  </div>
                </div>
              </div>

              <div className="p-8 bg-gradient-to-br from-[#a3e635]/10 to-emerald-500/10 border border-[#a3e635]/20 rounded-3xl">
                <div className="flex items-center gap-4 mb-4">
                  <div className="w-12 h-12 bg-[#a3e635]/20 rounded-2xl flex items-center justify-center">
                    <Rocket className="w-6 h-6 text-[#a3e635]" />
                  </div>
                  <div>
                    <h4 className="text-lg font-black text-app-heading tracking-tight">AI Video Generation</h4>
                    <p className="text-xs text-zinc-500 font-medium">Generate a professional room trailer using Veo.</p>
                  </div>
                </div>
                {generatedVideoUrl ? (
                  <div className="space-y-4">
                    <div className="aspect-video bg-black rounded-xl overflow-hidden border border-app-border">
                      <video src={generatedVideoUrl} controls className="w-full h-full" />
                    </div>
                    <button 
                      onClick={() => setGeneratedVideoUrl(null)}
                      className="text-[10px] font-black text-red-500 uppercase tracking-widest hover:underline"
                    >
                      Remove video
                    </button>
                  </div>
                ) : (
                  <button 
                    disabled={isGeneratingVideo}
                    onClick={() => {
                      setIsGeneratingVideo(true);
                      addToast('Generating video with Veo... This may take a few minutes.', 'info');
                      // Simulate generation
                      setTimeout(() => {
                        setGeneratedVideoUrl('https://storage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4');
                        setIsGeneratingVideo(false);
                        addToast('Video generated successfully!', 'success');
                      }, 5000);
                    }}
                    className={cn(
                      "w-full py-4 bg-[#a3e635] hover:bg-[#bef264] text-black font-black rounded-xl transition-all shadow-lg shadow-[#a3e635]/20 uppercase tracking-widest text-xs flex items-center justify-center gap-2",
                      isGeneratingVideo && "opacity-50 cursor-not-allowed"
                    )}
                  >
                    {isGeneratingVideo ? (
                      <>
                        <RotateCcw className="w-4 h-4 animate-spin" />
                        Generating...
                      </>
                    ) : (
                      "Generate Room Trailer with Veo"
                    )}
                  </button>
                )}
              </div>

              <button className="px-8 py-3 bg-[#a3e635] hover:bg-[#bef264] text-black font-black rounded-xl transition-all shadow-lg shadow-[#a3e635]/20">
                Update room
              </button>
            </div>
          )}

          {activeTab === 'stats' && (
            <div className="space-y-10">
              <div className="flex items-center gap-3 mb-8">
                <BarChart3 className="w-6 h-6 text-[#a3e635]" />
                <h3 className="text-2xl font-black text-app-heading tracking-tight">Room Stats</h3>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                {[
                  { label: 'Views', value: '1,240', icon: Layout },
                  { label: 'Users', value: '18', icon: Users },
                  { label: 'Completed', value: '2', icon: CheckCircle2 },
                  { label: 'Avg. Time', value: '38m', icon: Clock },
                ].map((stat, i) => (
                  <div key={i} className="p-6 bg-app-heading/5 border border-app-border rounded-2xl">
                    <p className="text-[10px] font-black text-zinc-500 uppercase tracking-widest mb-2">{stat.label}</p>
                    <div className="flex items-center gap-3">
                      <stat.icon className="w-5 h-5 text-[#a3e635]" />
                      <span className="text-2xl font-black text-app-heading">{stat.value}</span>
                    </div>
                  </div>
                ))}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="bg-app-heading/5 border border-app-border rounded-2xl p-6">
                  <h4 className="text-sm font-black text-app-heading uppercase tracking-widest mb-6">Success Rate</h4>
                  <div className="flex items-end gap-2 h-32">
                    {[40, 65, 30, 85, 55, 90, 70].map((h, i) => (
                      <div key={i} className="flex-1 bg-[#a3e635]/20 rounded-t-lg relative group">
                        <div 
                          style={{ height: `${h}%` }} 
                          className="absolute bottom-0 left-0 right-0 bg-[#a3e635] rounded-t-lg transition-all group-hover:brightness-110"
                        />
                        <div className="absolute -top-6 left-1/2 -translate-x-1/2 text-[8px] font-black text-[#a3e635] opacity-0 group-hover:opacity-100 transition-opacity">
                          {h}%
                        </div>
                      </div>
                    ))}
                  </div>
                  <div className="flex justify-between mt-4">
                    <span className="text-[8px] font-black text-zinc-500 uppercase tracking-widest">Mon</span>
                    <span className="text-[8px] font-black text-zinc-500 uppercase tracking-widest">Sun</span>
                  </div>
                </div>

                <div className="bg-app-heading/5 border border-app-border rounded-2xl p-6">
                  <h4 className="text-sm font-black text-app-heading uppercase tracking-widest mb-6">User Ratings</h4>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1">
                        {[1, 2, 3, 4, 5].map(s => (
                          <Star key={s} className={cn("w-3 h-3", s <= 4 ? "text-yellow-500 fill-yellow-500" : "text-zinc-600")} />
                        ))}
                      </div>
                      <span className="text-xs font-black text-app-heading">4.2 / 5.0</span>
                    </div>
                    <div className="space-y-2">
                      {[
                        { label: 'Difficulty', val: 85 },
                        { label: 'Quality', val: 92 },
                        { label: 'Fun Factor', val: 78 }
                      ].map(r => (
                        <div key={r.label} className="space-y-1">
                          <div className="flex justify-between text-[8px] font-black text-zinc-500 uppercase tracking-widest">
                            <span>{r.label}</span>
                            <span>{r.val}%</span>
                          </div>
                          <div className="h-1 bg-black/20 rounded-full overflow-hidden">
                            <div style={{ width: `${r.val}%` }} className="h-full bg-[#a3e635]" />
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-app-heading/5 border border-app-border rounded-2xl overflow-hidden">
                <div className="px-6 py-4 border-b border-app-border flex items-center justify-between">
                  <h4 className="text-sm font-black text-app-heading uppercase tracking-widest">Recent Activity</h4>
                  <button className="text-[10px] font-black text-[#a3e635] uppercase tracking-widest hover:underline">Download CSV</button>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-left">
                    <thead>
                      <tr className="border-b border-app-border bg-black/20">
                        <th className="px-6 py-4 text-[10px] font-black text-zinc-500 uppercase tracking-widest">Rank</th>
                        <th className="px-6 py-4 text-[10px] font-black text-zinc-500 uppercase tracking-widest">Username</th>
                        <th className="px-6 py-4 text-[10px] font-black text-zinc-500 uppercase tracking-widest">Questions</th>
                        <th className="px-6 py-4 text-[10px] font-black text-zinc-500 uppercase tracking-widest">Points</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-app-border">
                      {[
                        { rank: 1, user: 'Techie18', questions: '24/25', points: 660 },
                        { rank: 2, user: 'beraniranjan722', questions: '0/25', points: 630 },
                        { rank: 3, user: 'nitishrana5443', questions: '21/25', points: 570 },
                      ].map((row, i) => (
                        <tr key={i} className="hover:bg-app-heading/5 transition-colors">
                          <td className="px-6 py-4 text-sm font-black text-app-heading">{row.rank}</td>
                          <td className="px-6 py-4 text-sm font-black text-[#a3e635]">{row.user}</td>
                          <td className="px-6 py-4 text-sm font-medium text-zinc-500">{row.questions}</td>
                          <td className="px-6 py-4 text-sm font-black text-app-heading">{row.points}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'categories' && (
            <div className="space-y-10">
              <div className="flex items-center gap-3 mb-8">
                <Target className="w-6 h-6 text-[#a3e635]" />
                <h3 className="text-2xl font-black text-app-heading tracking-tight">Categories</h3>
              </div>

              <div className="space-y-8">
                <div className="space-y-4">
                  <label className="text-[10px] font-black text-zinc-500 uppercase tracking-widest px-1">Tags</label>
                  <div className="flex flex-wrap gap-2">
                    {['Capture the Flag (CTF)', 'Boot2Root', 'Beginner Friendly', 'Education', 'Cyber Security'].map(tag => (
                      <span key={tag} className="px-3 py-1 bg-[#a3e635]/10 text-[#a3e635] text-[10px] font-black rounded-lg border border-[#a3e635]/20 uppercase tracking-widest">{tag}</span>
                    ))}
                    <button className="px-3 py-1 bg-app-heading/5 text-zinc-500 text-[10px] font-black rounded-lg border border-app-border uppercase tracking-widest hover:text-app-heading transition-colors">+ Add tag</button>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="space-y-4">
                    <label className="text-[10px] font-black text-zinc-500 uppercase tracking-widest px-1">Job Roles</label>
                    <div className="space-y-2">
                      {['Penetration Tester / Red Team', 'Security Analyst / Blue Team'].map(role => (
                        <div key={role} className="flex items-center justify-between p-3 bg-app-heading/5 border border-app-border rounded-xl">
                          <span className="text-xs font-black text-app-heading">{role}</span>
                          <button className="text-red-500 hover:text-red-400"><X className="w-4 h-4" /></button>
                        </div>
                      ))}
                    </div>
                  </div>
                  <div className="space-y-4">
                    <label className="text-[10px] font-black text-zinc-500 uppercase tracking-widest px-1">Technology</label>
                    <div className="space-y-2">
                      {['Linux', 'Web', 'Active Directory'].map(tech => (
                        <div key={tech} className="flex items-center justify-between p-3 bg-app-heading/5 border border-app-border rounded-xl">
                          <span className="text-xs font-black text-app-heading">{tech}</span>
                          <button className="text-red-500 hover:text-red-400"><X className="w-4 h-4" /></button>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="space-y-4">
                    <label className="text-[10px] font-black text-zinc-500 uppercase tracking-widest px-1">Prerequisites</label>
                    <div className="space-y-2">
                      {prerequisites.map(p => (
                        <div key={p} className="flex items-center justify-between p-3 bg-app-heading/5 border border-app-border rounded-xl">
                          <span className="text-xs font-black text-app-heading">{p}</span>
                          <button 
                            onClick={() => setPrerequisites(prerequisites.filter(item => item !== p))}
                            className="text-red-500 hover:text-red-400"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        </div>
                      ))}
                      <button className="w-full py-2 bg-app-heading/5 border border-dashed border-app-border rounded-xl text-[10px] font-black text-zinc-500 uppercase tracking-widest hover:text-app-heading transition-all">
                        + Add Prerequisite
                      </button>
                    </div>
                  </div>
                  <div className="space-y-4">
                    <label className="text-[10px] font-black text-zinc-500 uppercase tracking-widest px-1">Learning Path</label>
                    <select 
                      value={learningPath}
                      onChange={(e) => setLearningPath(e.target.value)}
                      className="w-full bg-black/5 dark:bg-black/40 border border-app-border rounded-xl px-4 py-3 text-sm text-app-heading focus:outline-none focus:border-[#a3e635] transition-all"
                    >
                      <option>Offensive Security</option>
                      <option>Defensive Security</option>
                      <option>Web Fundamentals</option>
                      <option>Network Security</option>
                      <option>Cloud Security</option>
                    </select>
                    <p className="text-[10px] text-zinc-500 font-medium px-1">Assign this room to a specific learning track.</p>
                  </div>
                </div>
              </div>

              <button className="px-8 py-3 bg-[#a3e635] hover:bg-[#bef264] text-black font-black rounded-xl transition-all shadow-lg shadow-[#a3e635]/20">
                Update room
              </button>
            </div>
          )}

          {activeTab === 'tasks' && (
            <div className="space-y-10">
              {selectedTaskId === null ? (
                <>
                  <div className="flex items-center justify-between mb-8">
                    <div className="flex items-center gap-3">
                      <Terminal className="w-6 h-6 text-[#a3e635]" />
                      <h3 className="text-2xl font-black text-app-heading tracking-tight">Room tasks</h3>
                    </div>
                    <button className="px-6 py-2 bg-[#a3e635] hover:bg-[#bef264] text-black text-[10px] font-black rounded-lg uppercase tracking-widest transition-all shadow-lg shadow-[#a3e635]/20 flex items-center gap-2">
                      <Plus className="w-4 h-4" /> Add task
                    </button>
                  </div>

                  <div className="space-y-4">
                    {[
                      'Deploy the machine',
                      'Enumerate',
                      'HiddenCorridors',
                      'FTP',
                      'Secrets in the Zip',
                      'Dracarys'
                    ].map((task, i) => (
                      <div key={i} className="p-4 bg-app-heading/5 border border-app-border rounded-2xl flex items-center justify-between group hover:border-[#a3e635]/30 transition-all">
                        <div className="flex items-center gap-4">
                          <div className="w-8 h-8 bg-black/20 rounded-lg flex items-center justify-center text-[10px] font-black text-zinc-500">
                            {i + 1}
                          </div>
                          <button 
                            onClick={() => setSelectedTaskId(i)}
                            className="text-sm font-black text-app-heading hover:text-[#a3e635] transition-colors"
                          >
                            {task}
                          </button>
                        </div>
                        <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button onClick={() => setSelectedTaskId(i)} className="p-2 text-zinc-500 hover:text-app-heading transition-colors"><Settings className="w-4 h-4" /></button>
                          <button className="p-2 text-zinc-500 hover:text-red-500 transition-colors"><Trash2 className="w-4 h-4" /></button>
                        </div>
                      </div>
                    ))}
                  </div>

                  <button className="w-full py-3 bg-app-heading/5 hover:bg-app-heading/10 text-app-heading text-[10px] font-black rounded-xl border border-app-border transition-all uppercase tracking-widest">
                    Update order
                  </button>
                </>
              ) : (
                <div className="space-y-10">
                  <div className="flex items-center gap-4 mb-8">
                    <button 
                      onClick={() => setSelectedTaskId(null)}
                      className="p-2 text-zinc-500 hover:text-app-heading transition-colors"
                    >
                      <ChevronLeft className="w-6 h-6" />
                    </button>
                    <h3 className="text-2xl font-black text-app-heading tracking-tight">Edit Task</h3>
                  </div>

                  <div className="space-y-8">
                    <div className="space-y-4">
                      <label className="text-[10px] font-black text-zinc-500 uppercase tracking-widest px-1">Type</label>
                      <div className="flex flex-wrap gap-3">
                        {['VM', 'Downloadable file', 'Our material', 'Static site', 'None'].map(t => (
                          <button 
                            key={t}
                            className={cn(
                              "px-4 py-2 rounded-xl border text-[10px] font-black uppercase tracking-widest transition-all",
                              t === 'VM' ? "bg-[#a3e635] text-black border-[#a3e635]" : "bg-app-heading/5 text-zinc-500 border-app-border hover:border-app-heading/10"
                            )}
                          >
                            {t}
                          </button>
                        ))}
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                      <div className="space-y-2">
                        <label className="text-[10px] font-black text-zinc-500 uppercase tracking-widest px-1">Title</label>
                        <input 
                          type="text" 
                          defaultValue="Deploy the machine"
                          className="w-full bg-black/5 dark:bg-black/40 border border-app-border rounded-xl px-4 py-3 text-sm text-app-heading focus:outline-none focus:border-[#a3e635] transition-all"
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-[10px] font-black text-zinc-500 uppercase tracking-widest px-1">Objective</label>
                        <textarea 
                          defaultValue="Doing basic reconnaissance"
                          className="w-full bg-black/5 dark:bg-black/40 border border-app-border rounded-xl px-4 py-3 text-sm text-app-heading focus:outline-none focus:border-[#a3e635] transition-all h-20 resize-none"
                        />
                      </div>
                    </div>

                    <div className="space-y-4">
                      <label className="text-[10px] font-black text-zinc-500 uppercase tracking-widest px-1">Task Content</label>
                      <div className="w-full bg-black/5 dark:bg-black/40 border border-app-border rounded-xl overflow-hidden">
                        <div className="flex items-center gap-2 p-2 border-b border-app-border bg-black/20">
                          <button className="p-1.5 hover:bg-app-heading/10 rounded text-app-text">B</button>
                          <button className="p-1.5 hover:bg-app-heading/10 rounded text-app-text italic">I</button>
                          <button className="p-1.5 hover:bg-app-heading/10 rounded text-app-text underline">U</button>
                          <div className="w-px h-4 bg-app-border mx-1" />
                          <button className="p-1.5 hover:bg-app-heading/10 rounded text-app-text"><Layout className="w-4 h-4" /></button>
                          <button className="p-1.5 hover:bg-app-heading/10 rounded text-app-text"><Terminal className="w-4 h-4" /></button>
                        </div>
                        <textarea 
                          className="w-full bg-transparent p-4 text-sm text-app-heading focus:outline-none h-48 resize-none"
                          placeholder="To deploy the Dracarys virtual machine, you will first need to connect to our network..."
                        />
                      </div>
                    </div>

                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <h4 className="text-sm font-black text-app-heading uppercase tracking-widest">Questions, answers & hints</h4>
                        <button className="text-[10px] font-black text-[#a3e635] uppercase tracking-widest hover:underline">+ Add question</button>
                      </div>
                      <div className="space-y-4">
                        {[
                          { q: 'If you don\'t know how to do this, complete the OpenVPN room first.', a: 'No answer required' },
                          { q: 'What version of Apache is running?', a: '2.4.41' },
                          { q: 'What service is running on port 22?', a: 'ssh' }
                        ].map((q, i) => (
                          <div key={i} className="p-6 bg-app-heading/5 border border-app-border rounded-2xl space-y-4">
                            <div className="flex items-center justify-between">
                              <span className="text-[10px] font-black text-zinc-500 uppercase tracking-widest">Question {i + 1}</span>
                              <button className="text-red-500 hover:text-red-400"><Trash2 className="w-4 h-4" /></button>
                            </div>
                            <div className="space-y-4">
                              <div className="space-y-2">
                                <label className="text-[10px] font-black text-zinc-500 uppercase tracking-widest px-1">Question</label>
                                <input 
                                  type="text" 
                                  defaultValue={q.q}
                                  className="w-full bg-black/5 dark:bg-black/40 border border-app-border rounded-xl px-4 py-3 text-sm text-app-heading focus:outline-none focus:border-[#a3e635] transition-all"
                                />
                              </div>
                              <div className="space-y-2">
                                <label className="text-[10px] font-black text-zinc-500 uppercase tracking-widest px-1">Answer</label>
                                <input 
                                  type="text" 
                                  defaultValue={q.a}
                                  className="w-full bg-black/5 dark:bg-black/40 border border-app-border rounded-xl px-4 py-3 text-sm text-app-heading focus:outline-none focus:border-[#a3e635] transition-all"
                                />
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>

                  <div className="flex gap-4">
                    <button 
                      onClick={async () => { 
                        try {
                          const response = await fetch(`/api/rooms/${roomId}/tasks`, {
                            method: 'PUT',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({ tasks: room.tasks }) // In a real app, you'd manage the tasks state locally
                          });
                          if (response.ok) {
                            onUpdate();
                            setSelectedTaskId(null); 
                            addToast('Task updated successfully!', 'success');
                          }
                        } catch (error) {
                          console.error('Error saving tasks:', error);
                        }
                      }}
                      className="px-8 py-3 bg-[#a3e635] hover:bg-[#bef264] text-black font-black rounded-xl transition-all shadow-lg shadow-[#a3e635]/20"
                    >
                      Save changes
                    </button>
                    <button 
                      onClick={() => setSelectedTaskId(null)}
                      className="px-8 py-3 bg-red-500/10 hover:bg-red-500 text-red-500 hover:text-white font-black rounded-xl border border-red-500/20 transition-all"
                    >
                      Delete task
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}

          {!['general', 'design', 'video', 'stats', 'categories', 'tasks'].includes(activeTab) && (
            <div className="flex flex-col items-center justify-center py-20 text-center">
              <div className="w-20 h-20 bg-app-heading/5 rounded-full flex items-center justify-center mb-6">
                <Settings className="w-10 h-10 text-zinc-700" />
              </div>
              <h3 className="text-2xl font-black text-app-heading mb-2 tracking-tight">{sidebarItems.find(i => i.id === activeTab)?.label}</h3>
              <p className="text-zinc-500 font-medium mb-8 max-w-md leading-relaxed">This section is currently under development.</p>
            </div>
          )}
        </div>
      </div>

      <AnimatePresence>
        {showPreview && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm"
          >
            <motion.div 
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="w-full max-w-md bg-app-card border border-app-border rounded-3xl overflow-hidden shadow-2xl relative"
            >
              <button 
                onClick={() => setShowPreview(false)}
                className="absolute top-4 right-4 p-2 bg-black/40 hover:bg-black/60 rounded-full text-white z-20"
              >
                <X className="w-4 h-4" />
              </button>
              <div className="p-8 text-center border-b border-app-border bg-app-heading/5">
                <h3 className="text-xs font-black text-app-heading uppercase tracking-widest">Room Preview</h3>
                <p className="text-[10px] text-zinc-500 mt-1">This is how your room appears in the library.</p>
              </div>
              <div className="p-8">
                <RoomCard 
                  room={{
                    ...room,
                    title,
                    description,
                    difficulty: difficulty as any
                  }} 
                  onClick={() => {}} 
                />
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

const PremiumPage = () => {
  return (
    <div className="max-w-7xl mx-auto px-4 py-20">
      <div className="text-center mb-20">
        <h1 className="text-6xl font-black text-app-heading mb-6 tracking-tighter">Level up your <span className="text-[#a3e635]">Cyber Security</span> skills</h1>
        <p className="text-xl text-zinc-500 max-w-2xl mx-auto font-medium">Get access to all premium rooms, learning paths, and exclusive features to accelerate your career.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {[
          { 
            name: 'Free', 
            price: '$0', 
            desc: 'Perfect for beginners starting their journey.',
            features: ['Access to free rooms', 'Basic learning paths', 'Community support', 'Public profile'],
            button: 'Current Plan',
            popular: false
          },
          { 
            name: 'Premium', 
            price: '$12', 
            period: '/mo',
            desc: 'The complete experience for serious learners.',
            features: ['All premium rooms', 'Advanced learning paths', 'Private VPN access', 'Certificate of completion', 'AI Mentor access', 'Priority support'],
            button: 'Go Premium',
            popular: true
          },
          { 
            name: 'Business', 
            price: 'Custom', 
            desc: 'Empower your team with hands-on training.',
            features: ['Team management', 'Custom learning paths', 'Advanced reporting', 'Dedicated support', 'SSO integration'],
            button: 'Contact Sales',
            popular: false
          }
        ].map((plan, i) => (
          <div key={i} className={cn(
            "p-10 rounded-3xl border transition-all relative flex flex-col",
            plan.popular ? "bg-app-card border-[#a3e635] shadow-2xl shadow-[#a3e635]/10 scale-105 z-10" : "bg-app-card border-app-border hover:border-app-heading/10"
          )}>
            {plan.popular && (
              <div className="absolute -top-4 left-1/2 -translate-x-1/2 px-4 py-1 bg-[#a3e635] text-black text-[10px] font-black rounded-full uppercase tracking-widest">
                Most Popular
              </div>
            )}
            <h3 className="text-2xl font-black text-app-heading mb-2">{plan.name}</h3>
            <div className="flex items-baseline gap-1 mb-6">
              <span className="text-5xl font-black text-app-heading">{plan.price}</span>
              {plan.period && <span className="text-zinc-500 font-bold">{plan.period}</span>}
            </div>
            <p className="text-sm text-zinc-500 mb-8 font-medium leading-relaxed">{plan.desc}</p>
            <div className="space-y-4 mb-10 flex-1">
              {plan.features.map((feature, j) => (
                <div key={j} className="flex items-center gap-3 text-sm text-app-text font-medium">
                  <CheckCircle2 className="w-5 h-5 text-[#a3e635]" />
                  {feature}
                </div>
              ))}
            </div>
            <button className={cn(
              "w-full py-4 rounded-xl font-black transition-all",
              plan.popular ? "bg-[#a3e635] hover:bg-[#bef264] text-black shadow-lg shadow-[#a3e635]/20" : "bg-app-heading/5 hover:bg-app-heading/10 text-app-heading border border-app-border"
            )}>
              {plan.button}
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};

const SettingsPage = ({ user, setView, addToast, onLogout, onUpdateUser, token, onRestartTour }: { user: User, setView: (v: string) => void, addToast: (m: string, t?: 'success' | 'error' | 'info') => void, onLogout: () => void, onUpdateUser: (u: User) => void, token: string, onRestartTour: () => void }) => {
  const [activeSection, setActiveSection] = useState('account');
  const [avatar, setAvatar] = useState(user.avatar_url || `https://picsum.photos/seed/${user.username}/200/200`);
  const [fullName, setFullName] = useState(user.full_name || '');
  const [bio, setBio] = useState(user.bio || '');
  const [email, setEmail] = useState(user.email || '');
  const [calendlyLink, setCalendlyLink] = useState(user.calendly_link || '');
  const [socials, setSocials] = useState(user.socials || {});
  const [isVpnConnected, setIsVpnConnected] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);
  
  // Preferences State
  const [prefs, setPrefs] = useState({
    echo: true,
    soundEffects: true,
    privateProfile: false,
    essentialCookies: true,
    analyticsCookies: true,
    marketingCookies: false
  });

  // Teams State
  const [team, setTeam] = useState<any>(null);
  const [isCreateTeamModalOpen, setIsCreateTeamModalOpen] = useState(false);
  const [newTeamName, setNewTeamName] = useState('');
  const [newTeamAvatar, setNewTeamAvatar] = useState('');

  // VPN Tabs State
  const [vpnTab, setVpnTab] = useState('machines');
  const [activeFaq, setActiveFaq] = useState<number | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState('');
  
  const fileInputRef = React.useRef<HTMLInputElement>(null);
  const teamAvatarRef = React.useRef<HTMLInputElement>(null);

  const handleDownloadVPN = async () => {
    setIsDownloading(true);
    try {
      const res = await fetch('/api/vpn/config', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (!res.ok) throw new Error('Failed to download config');
      
      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `hacklab-${user.username}.ovpn`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      
      addToast('VPN Configuration downloaded!', 'success');
    } catch (err) {
      addToast('Error downloading VPN config', 'error');
    } finally {
      setIsDownloading(false);
    }
  };

  const toggleVpnConnection = () => {
    if (!isVpnConnected) {
      addToast('Connecting to HackLab VPN...', 'info');
      setTimeout(() => {
        setIsVpnConnected(true);
        addToast('Connected to HackLab VPN!', 'success');
      }, 1500);
    } else {
      setIsVpnConnected(false);
      addToast('Disconnected from VPN', 'info');
    }
  };

  const handleAvatarUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const result = reader.result as string;
        setAvatar(result);
        onUpdateUser({ ...user, avatar_url: result });
        addToast('Avatar updated successfully!', 'success');
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSaveChanges = () => {
    const updatedUser = {
      ...user,
      full_name: fullName,
      bio: bio,
      email: email,
      calendly_link: calendlyLink,
      avatar_url: avatar
    };
    onUpdateUser(updatedUser);
    addToast('Changes saved successfully!', 'success');
  };

  const handleUpdateSocials = () => {
    const updatedUser = {
      ...user,
      socials: socials
    };
    onUpdateUser(updatedUser);
    addToast('Social information updated!', 'success');
  };

  const handleDeleteAccount = () => {
    if (deleteConfirm.toLowerCase() === 'delete') {
      addToast('Account deleted. Redirecting...', 'error');
      setTimeout(() => {
        onLogout();
      }, 2000);
    } else {
      addToast('Please type "delete" to confirm.', 'error');
    }
  };
  const sidebarItems = [
    { id: 'account', label: 'Account Details', icon: UserIcon },
    { id: 'preferences', label: 'Preferences', icon: Settings },
    { id: 'teams', label: 'CTF Teams', icon: Users },
    { id: 'develop', label: 'Develop rooms', icon: Terminal },
    { id: 'vpn', label: 'VM and VPN Settings', icon: Network }
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 py-12">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
        {/* Sidebar */}
        <div className="lg:col-span-3 space-y-2">
          <h2 className="text-xs font-black text-zinc-500 uppercase tracking-widest mb-6 px-4">Manage Account</h2>
          {sidebarItems.map(item => (
            <button
              key={item.id}
              onClick={() => setActiveSection(item.id)}
              className={cn(
                "w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-black transition-all",
                activeSection === item.id ? "bg-[#a3e635] text-black shadow-lg shadow-[#a3e635]/20" : "text-zinc-400 hover:text-app-heading hover:bg-app-heading/5"
              )}
            >
              <item.icon className="w-4 h-4" />
              {item.label}
            </button>
          ))}
        </div>

        {/* Content */}
        <div className="lg:col-span-9 bg-app-card border border-app-border rounded-3xl p-10 shadow-xl">
          {activeSection === 'account' && (
            <div className="space-y-10">
              <section>
                <h3 className="text-xl font-black text-app-heading mb-8">General Information</h3>
                <div className="flex items-center gap-8 mb-10">
                  <div className="w-24 h-24 rounded-2xl border-2 border-app-border overflow-hidden bg-app-card relative group">
                    <img 
                      src={avatar} 
                      alt={user.username}
                      className="w-full h-full object-cover"
                      referrerPolicy="no-referrer"
                    />
                    <div 
                      onClick={() => fileInputRef.current?.click()}
                      className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center cursor-pointer"
                    >
                      <Cloud className="w-6 h-6 text-white" />
                    </div>
                  </div>
                  <div className="flex flex-col gap-3">
                    <input 
                      type="file" 
                      ref={fileInputRef} 
                      onChange={handleAvatarUpload} 
                      className="hidden" 
                      accept="image/*"
                    />
                    <button 
                      onClick={() => fileInputRef.current?.click()}
                      className="px-6 py-2.5 bg-[#a3e635] text-black text-xs font-black rounded-lg border border-[#a3e635] transition-all flex items-center gap-2"
                    >
                      <Cloud className="w-4 h-4" /> Upload Avatar
                    </button>
                    <button 
                      onClick={() => setAvatar(`https://picsum.photos/seed/${Math.random()}/200/200`)}
                      className="px-6 py-2.5 bg-app-heading/5 hover:bg-app-heading/10 text-app-heading text-xs font-black rounded-lg border border-app-border transition-all flex items-center gap-2"
                    >
                      <RotateCcw className="w-4 h-4" /> Randomize Picture
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-zinc-500 uppercase tracking-widest px-1">Username*</label>
                    <input 
                      type="text" 
                      defaultValue={user.username}
                      className="w-full bg-black/5 dark:bg-black/40 border border-app-border rounded-xl px-4 py-3 text-sm text-app-heading focus:outline-none focus:border-[#a3e635] transition-all"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-zinc-500 uppercase tracking-widest px-1">Full Name*</label>
                    <input 
                      type="text" 
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      className="w-full bg-black/5 dark:bg-black/40 border border-app-border rounded-xl px-4 py-3 text-sm text-app-heading focus:outline-none focus:border-[#a3e635] transition-all"
                    />
                  </div>
                  <div className="md:col-span-2 space-y-2">
                    <label className="text-[10px] font-black text-zinc-500 uppercase tracking-widest px-1">Biography</label>
                    <textarea 
                      placeholder="Write a short summary about yourself..."
                      value={bio}
                      onChange={(e) => setBio(e.target.value)}
                      className="w-full bg-black/5 dark:bg-black/40 border border-app-border rounded-xl px-4 py-3 text-sm text-app-heading focus:outline-none focus:border-[#a3e635] transition-all h-32 resize-none"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-zinc-500 uppercase tracking-widest px-1">Email Address*</label>
                    <input 
                      type="email" 
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full bg-black/5 dark:bg-black/40 border border-app-border rounded-xl px-4 py-3 text-sm text-app-heading focus:outline-none focus:border-[#a3e635] transition-all"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-zinc-500 uppercase tracking-widest px-1">Calendly link</label>
                    <input 
                      type="text" 
                      placeholder="Paste your Calendly Link"
                      value={calendlyLink}
                      onChange={(e) => setCalendlyLink(e.target.value)}
                      className="w-full bg-black/5 dark:bg-black/40 border border-app-border rounded-xl px-4 py-3 text-sm text-app-heading focus:outline-none focus:border-[#a3e635] transition-all"
                    />
                  </div>
                </div>
                <button 
                  onClick={handleSaveChanges}
                  className="mt-10 px-8 py-3 bg-[#a3e635] hover:bg-[#bef264] text-black font-black rounded-xl transition-all shadow-lg shadow-[#a3e635]/20"
                >
                  Save Changes
                </button>
                <button 
                  onClick={() => setView('profile')}
                  className="mt-10 ml-4 px-8 py-3 bg-app-heading/5 hover:bg-app-heading/10 text-app-heading font-black rounded-xl border border-app-border transition-all"
                >
                  View Profile
                </button>
              </section>

              <div className="h-px bg-app-border" />

              <section>
                <h3 className="text-xl font-black text-app-heading mb-8">Social Information</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  {[
                    { id: 'discord', label: 'Discord' },
                    { id: 'twitter', label: 'X' },
                    { id: 'reddit', label: 'Reddit' },
                    { id: 'instagram', label: 'Instagram' },
                    { id: 'github', label: 'Github' },
                    { id: 'website', label: 'Personal Website' },
                    { id: 'linkedin', label: 'LinkedIn' }
                  ].map(social => (
                    <div key={social.id} className="space-y-2">
                      <label className="text-[10px] font-black text-zinc-500 uppercase tracking-widest px-1">{social.label} Username</label>
                      <input 
                        type="text" 
                        placeholder={`${social.label} username`}
                        value={(socials as any)?.[social.id] || ''}
                        onChange={(e) => setSocials(prev => ({ ...prev, [social.id]: e.target.value }))}
                        className="w-full bg-black/5 dark:bg-black/40 border border-app-border rounded-xl px-4 py-3 text-sm text-app-heading focus:outline-none focus:border-[#a3e635] transition-all"
                      />
                    </div>
                  ))}
                </div>
                <button 
                  onClick={handleUpdateSocials}
                  className="mt-10 px-8 py-3 bg-[#a3e635] hover:bg-[#bef264] text-black font-black rounded-xl transition-all shadow-lg shadow-[#a3e635]/20"
                >
                  Update Socials
                </button>
                <button 
                  onClick={() => setView('profile')}
                  className="mt-10 ml-4 px-8 py-3 bg-app-heading/5 hover:bg-app-heading/10 text-app-heading font-black rounded-xl border border-app-border transition-all"
                >
                  View Profile
                </button>
              </section>

              <div className="h-px bg-app-border" />

              <section className="p-8 bg-red-500/5 border border-red-500/20 rounded-3xl">
                <h3 className="text-xl font-black text-red-500 mb-2">Delete your account</h3>
                <p className="text-sm text-zinc-500 mb-8 leading-relaxed font-medium">If you delete your account you will lose definitive access to it with no way of recovery. Your data and progress will be erased and lost as well as any ongoing subscription.</p>
                
                <div className="max-w-md space-y-4">
                  <p className="text-xs font-black text-zinc-500 uppercase tracking-widest">Type <span className="text-red-500">delete</span> to confirm</p>
                  <div className="flex gap-3">
                    <input 
                      type="text" 
                      placeholder="Type 'delete'"
                      value={deleteConfirm}
                      onChange={(e) => setDeleteConfirm(e.target.value)}
                      className="flex-1 bg-black/5 dark:bg-black/40 border border-app-border rounded-xl px-4 py-3 text-sm text-app-heading focus:outline-none focus:border-red-500 transition-all"
                    />
                    <button 
                      onClick={handleDeleteAccount}
                      disabled={deleteConfirm.toLowerCase() !== 'delete'}
                      className={cn(
                        "px-8 py-3 font-black rounded-xl border transition-all",
                        deleteConfirm.toLowerCase() === 'delete' 
                          ? "bg-red-500 text-white border-red-500 shadow-lg shadow-red-500/20" 
                          : "bg-red-500/10 text-red-500 border-red-500/20 opacity-50 cursor-not-allowed"
                      )}
                    >
                      Delete My Account
                    </button>
                  </div>
                </div>
              </section>
            </div>
          )}

          {activeSection === 'preferences' && (
            <div className="space-y-10">
              <section>
                <div className="flex items-center gap-3 mb-8">
                  <Settings className="w-6 h-6 text-[#a3e635]" />
                  <h3 className="text-xl font-black text-app-heading">Preferences</h3>
                </div>
                
                <div className="space-y-6">
                  {[
                    { id: 'echo', label: 'Echo', desc: 'AI-powered assistant to help you learn and solve rooms.', value: prefs.echo },
                    { id: 'soundEffects', label: 'Sound Effects', desc: 'Play sound effects throughout the platform.', value: prefs.soundEffects },
                    { id: 'privateProfile', label: 'Make my profile private', desc: 'You can hide your profile from search, followers, leaderboards, and leagues.', value: prefs.privateProfile },
                  ].map(pref => (
                    <div key={pref.id} className="flex items-center justify-between p-4 bg-app-heading/5 rounded-2xl border border-app-border">
                      <div>
                        <h4 className="text-sm font-black text-app-heading mb-1">{pref.label}</h4>
                        <p className="text-xs text-zinc-500 font-medium">{pref.desc}</p>
                      </div>
                      <button 
                        onClick={() => setPrefs(prev => ({ ...prev, [pref.id]: !prev[pref.id as keyof typeof prev] }))}
                        className={cn(
                          "w-12 h-6 rounded-full transition-all relative",
                          pref.value ? "bg-[#a3e635]" : "bg-zinc-700"
                        )}
                      >
                        <div className={cn(
                          "absolute top-1 w-4 h-4 bg-white rounded-full transition-all",
                          pref.value ? "left-7" : "left-1"
                        )} />
                      </button>
                    </div>
                  ))}
                </div>
              </section>

              <div className="h-px bg-app-border" />

              <section>
                <div className="flex items-center gap-3 mb-8">
                  <Rocket className="w-6 h-6 text-[#a3e635]" />
                  <h3 className="text-xl font-black text-app-heading">Onboarding</h3>
                </div>
                <p className="text-sm text-zinc-500 mb-8 font-medium leading-relaxed">Want to see the tour again? Click below to restart the interactive guide.</p>
                <button 
                  onClick={() => {
                    localStorage.removeItem('hasSeenOnboarding');
                    onRestartTour();
                  }}
                  className="px-8 py-3 bg-app-heading/5 hover:bg-app-heading/10 text-app-heading text-xs font-black rounded-xl border border-app-border transition-all uppercase tracking-widest"
                >
                  Restart Interactive Tour
                </button>
              </section>

              <div className="h-px bg-app-border" />

              <section>
                <div className="flex items-center gap-3 mb-8">
                  <Shield className="w-6 h-6 text-[#a3e635]" />
                  <h3 className="text-xl font-black text-app-heading">Cookie Settings</h3>
                </div>
                <p className="text-sm text-zinc-500 mb-8 font-medium leading-relaxed">Manage your cookie preferences. You can enable or disable different types of cookies below.</p>
                
                <div className="space-y-6">
                  {[
                    { id: 'essentialCookies', label: 'Essential Cookies', desc: 'These cookies are necessary for the website to function and cannot be switched off. Includes: GTM, Sentry, Segment, Intercom, GrowthBook, HubSpot.', value: prefs.essentialCookies, disabled: true },
                    { id: 'analyticsCookies', label: 'Analytics Cookies', desc: 'These cookies help us understand how visitors interact with our website. Includes: Hotjar, Amplitude, ChumZero.', value: prefs.analyticsCookies },
                    { id: 'marketingCookies', label: 'Marketing Cookies', desc: 'These cookies are used to track visitors across websites to display relevant ads. Includes: GTM, Reddit, Impact, Focus, ZoomInfo.', value: prefs.marketingCookies },
                  ].map(pref => (
                    <div key={pref.id} className="flex items-center justify-between p-4 bg-app-heading/5 rounded-2xl border border-app-border">
                      <div className="flex-1 pr-8">
                        <h4 className="text-sm font-black text-app-heading mb-1">{pref.label}</h4>
                        <p className="text-xs text-zinc-500 font-medium leading-relaxed">{pref.desc}</p>
                      </div>
                      <button 
                        disabled={pref.disabled}
                        onClick={() => setPrefs(prev => ({ ...prev, [pref.id]: !prev[pref.id as keyof typeof prev] }))}
                        className={cn(
                          "w-12 h-6 rounded-full transition-all relative flex-shrink-0",
                          pref.value ? "bg-[#a3e635]" : "bg-zinc-700",
                          pref.disabled && "opacity-50 cursor-not-allowed"
                        )}
                      >
                        <div className={cn(
                          "absolute top-1 w-4 h-4 bg-white rounded-full transition-all",
                          pref.value ? "left-7" : "left-1"
                        )} />
                      </button>
                    </div>
                  ))}
                </div>
              </section>
            </div>
          )}

          {activeSection === 'teams' && (
            <div className="space-y-10">
              {!team ? (
                <div className="flex flex-col items-center justify-center py-20 text-center">
                  <div className="w-20 h-20 bg-app-heading/5 rounded-full flex items-center justify-center mb-6">
                    <Users className="w-10 h-10 text-zinc-500" />
                  </div>
                  <h3 className="text-2xl font-black text-app-heading mb-2 tracking-tight">Create a team to compete in CTFs</h3>
                  <p className="text-zinc-500 font-medium mb-8 max-w-md leading-relaxed">Add friends to pick your perfect formation.</p>
                  <button 
                    onClick={() => setIsCreateTeamModalOpen(true)}
                    className="px-8 py-3 bg-[#a3e635] hover:bg-[#bef264] text-black font-black rounded-xl transition-all shadow-lg shadow-[#a3e635]/20"
                  >
                    Create a CTF team
                  </button>
                </div>
              ) : (
                <div className="space-y-10">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-6">
                      <div className="w-24 h-24 bg-app-heading/5 border border-app-border rounded-2xl overflow-hidden flex items-center justify-center">
                        {team.avatar ? (
                          <img src={team.avatar} className="w-full h-full object-cover" />
                        ) : (
                          <Users className="w-10 h-10 text-[#a3e635]" />
                        )}
                      </div>
                      <div>
                        <h3 className="text-3xl font-black text-app-heading tracking-tighter mb-2">{team.name}</h3>
                        <div className="flex items-center gap-2">
                          <span className="px-2 py-0.5 bg-emerald-500/10 text-emerald-500 text-[10px] font-black rounded uppercase tracking-widest border border-emerald-500/20">Active Team</span>
                        </div>
                      </div>
                    </div>
                    <div className="flex gap-3">
                      <button className="p-3 bg-app-heading/5 hover:bg-app-heading/10 text-app-heading rounded-xl border border-app-border transition-all">
                        <Settings className="w-5 h-5" />
                      </button>
                      <button 
                        onClick={() => {
                          setTeam(null);
                          addToast('Team deleted successfully', 'info');
                        }}
                        className="px-6 py-3 bg-red-500/10 hover:bg-red-500 text-red-500 hover:text-white font-black rounded-xl border border-red-500/20 transition-all flex items-center gap-2"
                      >
                        <Trash2 className="w-4 h-4" /> Delete Team
                      </button>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <section>
                      <h4 className="text-xs font-black text-zinc-500 uppercase tracking-widest mb-6 px-1">Members (1/20)</h4>
                      <div className="space-y-4">
                        <div className="relative">
                          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
                          <input 
                            type="text" 
                            placeholder="Search members"
                            className="w-full bg-black/5 dark:bg-black/40 border border-app-border rounded-xl pl-12 pr-4 py-3 text-sm text-app-heading focus:outline-none focus:border-[#a3e635] transition-all"
                          />
                        </div>
                        <div className="p-4 bg-app-heading/5 border border-app-border rounded-2xl flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-lg overflow-hidden">
                              <img src={user.avatar_url || `https://picsum.photos/seed/${user.username}/100/100`} className="w-full h-full object-cover" />
                            </div>
                            <div>
                              <p className="text-sm font-black text-app-heading">{user.username} <span className="text-[10px] text-[#a3e635] ml-1">You</span></p>
                              <p className="text-[10px] text-zinc-500 font-black uppercase tracking-widest">Owner</p>
                            </div>
                          </div>
                        </div>
                      </div>
                    </section>

                    <section className="space-y-8">
                      <div>
                        <h4 className="text-xs font-black text-zinc-500 uppercase tracking-widest mb-4 px-1">Invite new members</h4>
                        <p className="text-xs text-zinc-500 font-medium mb-4 leading-relaxed">Assign role to member via invite link.</p>
                        <div className="flex gap-2">
                          <input 
                            type="text" 
                            readOnly 
                            value={`https://hacklab.network/join-team?id=${Math.random().toString(36).substring(7)}`}
                            className="flex-1 bg-black/5 dark:bg-black/40 border border-app-border rounded-xl px-4 py-3 text-xs text-zinc-500 focus:outline-none"
                          />
                          <button 
                            onClick={() => {
                              navigator.clipboard.writeText('https://hacklab.network/join-team?id=xyz');
                              addToast('Invite link copied!', 'success');
                            }}
                            className="px-6 py-3 bg-app-heading/5 hover:bg-app-heading/10 text-app-heading text-xs font-black rounded-xl border border-app-border transition-all whitespace-nowrap"
                          >
                            Copy invite link
                          </button>
                        </div>
                      </div>

                      <div>
                        <h4 className="text-xs font-black text-zinc-500 uppercase tracking-widest mb-4 px-1">Invite by username</h4>
                        <div className="flex gap-2">
                          <input 
                            type="text" 
                            placeholder="Type username"
                            className="flex-1 bg-black/5 dark:bg-black/40 border border-app-border rounded-xl px-4 py-3 text-sm text-app-heading focus:outline-none focus:border-[#a3e635] transition-all"
                          />
                          <button 
                            onClick={() => addToast('Invite sent!', 'success')}
                            className="px-6 py-3 bg-[#a3e635] hover:bg-[#bef264] text-black text-xs font-black rounded-xl transition-all shadow-lg shadow-[#a3e635]/20"
                          >
                            Send Invite
                          </button>
                        </div>
                      </div>
                    </section>
                  </div>
                </div>
              )}

              {/* Create Team Modal */}
              <AnimatePresence>
                {isCreateTeamModalOpen && (
                  <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                    <motion.div 
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      onClick={() => setIsCreateTeamModalOpen(false)}
                      className="absolute inset-0 bg-black/80 backdrop-blur-sm"
                    />
                    <motion.div 
                      initial={{ opacity: 0, scale: 0.9, y: 20 }}
                      animate={{ opacity: 1, scale: 1, y: 0 }}
                      exit={{ opacity: 0, scale: 0.9, y: 20 }}
                      className="relative w-full max-w-md bg-app-card border border-app-border rounded-3xl p-8 shadow-2xl"
                    >
                      <button 
                        onClick={() => setIsCreateTeamModalOpen(false)}
                        className="absolute top-6 right-6 text-zinc-500 hover:text-app-heading transition-colors"
                      >
                        <X className="w-6 h-6" />
                      </button>

                      <h3 className="text-2xl font-black text-app-heading mb-8 tracking-tight">Create a CTF Team</h3>
                      
                      <div className="space-y-8">
                        <div className="flex flex-col items-center gap-4">
                          <div className="w-24 h-24 bg-app-heading/5 border border-app-border rounded-2xl overflow-hidden flex items-center justify-center relative group">
                            {newTeamAvatar ? (
                              <img src={newTeamAvatar} className="w-full h-full object-cover" />
                            ) : (
                              <Users className="w-10 h-10 text-zinc-700" />
                            )}
                            <div 
                              onClick={() => teamAvatarRef.current?.click()}
                              className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center cursor-pointer"
                            >
                              <Cloud className="w-6 h-6 text-white" />
                            </div>
                          </div>
                          <div className="flex gap-2">
                            <button 
                              onClick={() => teamAvatarRef.current?.click()}
                              className="px-4 py-2 bg-app-heading/5 hover:bg-app-heading/10 text-app-heading text-[10px] font-black rounded-lg border border-app-border transition-all uppercase tracking-widest"
                            >
                              Upload
                            </button>
                            <button 
                              onClick={() => setNewTeamAvatar(`https://picsum.photos/seed/${Math.random()}/200/200`)}
                              className="px-4 py-2 bg-app-heading/5 hover:bg-app-heading/10 text-app-heading text-[10px] font-black rounded-lg border border-app-border transition-all uppercase tracking-widest"
                            >
                              Generate random avatar
                            </button>
                          </div>
                          <input 
                            type="file" 
                            ref={teamAvatarRef} 
                            className="hidden" 
                            accept="image/*"
                            onChange={(e) => {
                              const file = e.target.files?.[0];
                              if (file) {
                                const reader = new FileReader();
                                reader.onloadend = () => setNewTeamAvatar(reader.result as string);
                                reader.readAsDataURL(file);
                              }
                            }}
                          />
                        </div>

                        <div className="space-y-2">
                          <label className="text-[10px] font-black text-zinc-500 uppercase tracking-widest px-1">Team name</label>
                          <input 
                            type="text" 
                            placeholder="Acm, Inc."
                            value={newTeamName}
                            onChange={(e) => setNewTeamName(e.target.value)}
                            className="w-full bg-black/5 dark:bg-black/40 border border-app-border rounded-xl px-4 py-3 text-sm text-app-heading focus:outline-none focus:border-[#a3e635] transition-all"
                          />
                        </div>

                        <div className="flex gap-3 pt-4">
                          <button 
                            onClick={() => setIsCreateTeamModalOpen(false)}
                            className="flex-1 py-3 bg-app-heading/5 hover:bg-app-heading/10 text-app-heading font-black rounded-xl border border-app-border transition-all"
                          >
                            Close
                          </button>
                          <button 
                            onClick={() => {
                              if (!newTeamName) return addToast('Team name is required', 'error');
                              setTeam({ name: newTeamName, avatar: newTeamAvatar });
                              setIsCreateTeamModalOpen(false);
                              addToast('Team created successfully!', 'success');
                            }}
                            className="flex-1 py-3 bg-[#a3e635] hover:bg-[#bef264] text-black font-black rounded-xl transition-all shadow-lg shadow-[#a3e635]/20"
                          >
                            Create Team
                          </button>
                        </div>
                      </div>
                    </motion.div>
                  </div>
                )}
              </AnimatePresence>
            </div>
          )}

          {activeSection === 'vpn' && (
            <div className="space-y-10">
              <section className="space-y-6">
                <div className="p-6 bg-blue-500/5 border border-blue-500/20 rounded-2xl flex gap-4">
                  <div className="w-10 h-10 bg-blue-500/10 rounded-xl flex items-center justify-center flex-shrink-0">
                    <Shield className="w-5 h-5 text-blue-400" />
                  </div>
                  <div>
                    <h4 className="text-sm font-black text-app-heading mb-2">Why can't I select a VPN Server anymore?</h4>
                    <p className="text-xs text-zinc-500 leading-relaxed font-medium">Your selected VM region automatically assigns a VPN server matched to your VMs. Selecting the region closest to you has the biggest impact on latency and your experience.</p>
                  </div>
                </div>

                <div className="p-6 bg-emerald-500/5 border border-emerald-500/20 rounded-2xl flex gap-4">
                  <div className="w-10 h-10 bg-emerald-500/10 rounded-xl flex items-center justify-center flex-shrink-0">
                    <Zap className="w-5 h-5 text-[#a3e635]" />
                  </div>
                  <div>
                    <h4 className="text-sm font-black text-app-heading mb-2">Premium vs Regular VPN</h4>
                    <p className="text-xs text-zinc-500 leading-relaxed font-medium mb-2">Premium VPN routes traffic through a dedicated private network from the closest entry point, reducing latency and lag while improving connection stability.</p>
                    <p className="text-xs text-zinc-500 leading-relaxed font-medium mb-4">Regular VPN uses standard internet routing to connect to the server in your selected region.</p>
                    <p className="text-xs text-zinc-500 leading-relaxed font-medium italic">You're on the free plan, so your configuration uses the regular path. Upgrade to unlock Premium VPN routing.</p>
                  </div>
                </div>
              </section>

              <div className="flex items-center gap-8 border-b border-app-border">
                {['machines', 'networks'].map(tab => (
                  <button 
                    key={tab}
                    onClick={() => setVpnTab(tab)}
                    className={cn(
                      "pb-4 text-xs font-black uppercase tracking-widest border-b-2 transition-all",
                      vpnTab === tab ? "text-[#a3e635] border-[#a3e635]" : "text-zinc-500 border-transparent hover:text-app-heading"
                    )}
                  >
                    {tab}
                  </button>
                ))}
              </div>

              {vpnTab === 'machines' && (
                <div className="space-y-10">
                  <section>
                    <h3 className="text-xl font-black text-app-heading mb-8">Virtual Machines</h3>
                    <div className="space-y-6">
                      <div className="space-y-2">
                        <label className="text-[10px] font-black text-zinc-500 uppercase tracking-widest px-1">Virtual Machine Region</label>
                        <select className="w-full max-w-md bg-black/5 dark:bg-black/40 border border-app-border rounded-xl px-4 py-3 text-sm text-app-heading focus:outline-none focus:border-[#a3e635] transition-all">
                          <option>Asia Pacific (Mumbai)</option>
                          <option>Europe (Ireland)</option>
                          <option>US East</option>
                          <option>US West</option>
                        </select>
                      </div>
                      
                      <div className="space-y-4">
                        <h4 className="text-xs font-black text-zinc-500 uppercase tracking-widest px-1">Your running machines</h4>
                        <div className="p-12 bg-app-heading/5 border border-app-border rounded-2xl flex flex-col items-center justify-center text-center">
                          <Monitor className="w-10 h-10 text-zinc-700 mb-4" />
                          <p className="text-sm text-zinc-500 font-medium italic">You currently have no running machines.</p>
                        </div>
                      </div>
                    </div>
                  </section>

                  <div className="h-px bg-app-border" />

                  <section>
                    <div className="flex items-center justify-between mb-8">
                      <h3 className="text-xl font-black text-app-heading">Access via OpenVPN</h3>
                      <button className="text-[#a3e635] text-xs font-black uppercase tracking-widest flex items-center gap-2">
                        <RotateCcw className="w-4 h-4" /> Refresh
                      </button>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-10">
                      <div className="p-6 bg-app-card border border-app-border rounded-2xl">
                        <p className="text-[10px] text-zinc-500 font-black uppercase tracking-widest mb-2">VPN Server Name</p>
                        <p className="text-lg font-black text-app-heading">Asia Pacific (Mumbai)</p>
                      </div>
                      <div className="p-6 bg-app-card border border-app-border rounded-2xl">
                        <p className="text-[10px] text-zinc-500 font-black uppercase tracking-widest mb-2">Internal Virtual IP Address</p>
                        <p className="text-lg font-black text-app-heading">{isVpnConnected ? '10.8.0.42' : '0.0.0.0'}</p>
                      </div>
                      <div className="p-6 bg-app-card border border-app-border rounded-2xl">
                        <p className="text-[10px] text-zinc-500 font-black uppercase tracking-widest mb-2">Server status</p>
                        <div className="flex items-center gap-2">
                          <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
                          <span className="text-lg font-black text-emerald-500">Online</span>
                        </div>
                      </div>
                      <div className="p-6 bg-app-card border border-app-border rounded-2xl">
                        <p className="text-[10px] text-zinc-500 font-black uppercase tracking-widest mb-2">Connection</p>
                        <div className="flex items-center gap-2">
                          <div className={`w-2 h-2 rounded-full ${isVpnConnected ? 'bg-emerald-500 animate-pulse' : 'bg-red-500'}`} />
                          <span className={`text-lg font-black ${isVpnConnected ? 'text-emerald-500' : 'text-red-500'}`}>
                            {isVpnConnected ? 'Connected' : 'Not connected'}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="space-y-12">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        {/* AttackBox Card */}
                        <div className="p-8 bg-gradient-to-br from-indigo-500/10 to-purple-500/10 border border-indigo-500/20 rounded-3xl relative overflow-hidden group">
                          <div className="absolute top-4 right-4 px-2 py-1 bg-[#a3e635] text-black text-[8px] font-black rounded uppercase tracking-widest">
                            Try for Free
                          </div>
                          <div className="w-12 h-12 bg-indigo-500/20 rounded-2xl flex items-center justify-center mb-6">
                            <Monitor className="w-6 h-6 text-indigo-400" />
                          </div>
                          <h4 className="text-xl font-black text-app-heading mb-2">AttackBox</h4>
                          <p className="text-xs text-zinc-500 font-medium mb-6 leading-relaxed">Included in your Premium subscription. Access a pre-configured hacking environment directly in your browser.</p>
                          <div className="flex items-baseline gap-1 mb-6">
                            <span className="text-2xl font-black text-app-heading">₹499</span>
                            <span className="text-zinc-500 text-xs font-bold">/per month</span>
                          </div>
                          <div className="flex gap-2">
                            <button className="flex-1 py-3 bg-indigo-500 hover:bg-indigo-600 text-white text-xs font-black rounded-xl transition-all shadow-lg shadow-indigo-500/20">
                              Try for free
                            </button>
                            <button className="px-4 py-3 bg-app-heading/5 hover:bg-app-heading/10 text-app-heading text-xs font-black rounded-xl border border-app-border transition-all">
                              Learn more
                            </button>
                          </div>
                          <div className="mt-6 space-y-2">
                            {['Safe and secure', 'All you need is internet connection', 'Easy to use', 'No setup required'].map(f => (
                              <div key={f} className="flex items-center gap-2 text-[10px] text-zinc-500 font-bold">
                                <CheckCircle2 className="w-3 h-3 text-emerald-500" />
                                {f}
                              </div>
                            ))}
                          </div>
                        </div>

                        {/* OpenVPN Card */}
                        <div className="p-8 bg-app-heading/5 border border-app-border rounded-3xl relative overflow-hidden group">
                          <div className="w-12 h-12 bg-app-heading/10 rounded-2xl flex items-center justify-center mb-6">
                            <Lock className="w-6 h-6 text-[#a3e635]" />
                          </div>
                          <h4 className="text-xl font-black text-app-heading mb-2">OpenVPN (Advanced)</h4>
                          <p className="text-xs text-zinc-500 font-medium mb-6 leading-relaxed">Connect your own machine to our network using OpenVPN. Best for advanced users.</p>
                          <div className="flex items-baseline gap-1 mb-6">
                            <span className="text-2xl font-black text-app-heading">Free</span>
                          </div>
                          <button 
                            onClick={handleDownloadVPN}
                            className="w-full py-3 bg-app-heading/5 hover:bg-app-heading/10 text-app-heading text-xs font-black rounded-xl border border-app-border transition-all flex items-center justify-center gap-2"
                          >
                            <Download className="w-4 h-4" /> Configuration
                          </button>
                          <div className="mt-6 space-y-2">
                            <div className="flex items-center gap-2 text-[10px] text-red-400 font-bold">
                              <X className="w-3 h-3" /> Setup required
                            </div>
                            <div className="flex items-center gap-2 text-[10px] text-zinc-500 font-bold">
                              <CheckCircle2 className="w-3 h-3 text-emerald-500" /> Use your own machine
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* FAQs Section */}
                      <section>
                        <h3 className="text-xl font-black text-app-heading mb-8">FAQs</h3>
                        <div className="space-y-4">
                          {[
                            { q: 'Switching VPN Servers', a: 'When you change your server region, you must download a new OpenVPN configuration file for that region. VPN servers can no longer be switched using the same configuration file. Instead, each region has its own region-specific OpenVPN configuration, which must be downloaded after switching regions.' },
                            { q: 'Why do we need this?', a: 'Connecting to our VPN allows you to access the private lab network where the target machines are hosted. Without it, you won\'t be able to reach the machine IPs.' },
                            { q: 'I keep getting disconnected', a: 'Make sure you only have ONE VPN instance running. Check your internet stability and ensure your firewall isn\'t blocking the connection.' },
                            { q: 'I can\'t get my VPN working', a: 'If you\'re still having problems, check out our OpenVPN guide for troubleshooting steps.' }
                          ].map((faq, i) => (
                            <div key={i} className="bg-app-card border border-app-border rounded-2xl overflow-hidden">
                              <button 
                                onClick={() => setActiveFaq(activeFaq === i ? null : i)}
                                className="w-full px-6 py-4 flex items-center justify-between text-left hover:bg-app-heading/5 transition-all"
                              >
                                <span className="text-sm font-black text-app-heading tracking-tight">{faq.q}</span>
                                <ChevronDown className={cn("w-5 h-5 text-zinc-500 transition-transform", activeFaq === i && "rotate-180")} />
                              </button>
                              <AnimatePresence>
                                {activeFaq === i && (
                                  <motion.div 
                                    initial={{ height: 0, opacity: 0 }}
                                    animate={{ height: 'auto', opacity: 1 }}
                                    exit={{ height: 0, opacity: 0 }}
                                    className="px-6 pb-6"
                                  >
                                    <p className="text-xs text-zinc-500 leading-relaxed font-medium pt-2 border-t border-app-border">{faq.a}</p>
                                  </motion.div>
                                )}
                              </AnimatePresence>
                            </div>
                          ))}
                        </div>
                      </section>
                    </div>
                  </section>
                </div>
              )}

              {vpnTab === 'networks' && (
                <div className="space-y-10">
                  <section>
                    <div className="p-6 bg-blue-500/5 border border-blue-500/20 rounded-2xl flex gap-4 mb-8">
                      <div className="w-10 h-10 bg-blue-500/10 rounded-xl flex items-center justify-center flex-shrink-0">
                        <Bell className="w-5 h-5 text-blue-400" />
                      </div>
                      <div>
                        <h4 className="text-sm font-black text-app-heading mb-2">Network VPNs appear here only after you've joined a network</h4>
                        <p className="text-xs text-zinc-500 leading-relaxed font-medium">Join a network first, then return to this page to select it and download its OpenVPN configuration.</p>
                      </div>
                    </div>

                    <div className="space-y-6">
                      <div className="space-y-2">
                        <label className="text-[10px] font-black text-zinc-500 uppercase tracking-widest px-1">Network VPN Server</label>
                        <select className="w-full max-w-md bg-black/5 dark:bg-black/40 border border-app-border rounded-xl px-4 py-3 text-sm text-app-heading focus:outline-none focus:border-[#a3e635] transition-all">
                          <option>No options</option>
                        </select>
                      </div>

                      <div className="flex gap-3">
                        <button className="px-8 py-3 bg-app-heading/5 hover:bg-app-heading/10 text-app-heading text-xs font-black rounded-xl border border-app-border transition-all flex items-center gap-2">
                          <Download className="w-4 h-4" /> Download Regular Configuration File
                        </button>
                        <button className="px-8 py-3 bg-app-heading/5 hover:bg-app-heading/10 text-app-heading text-xs font-black rounded-xl border border-app-border transition-all flex items-center gap-2">
                          <RotateCcw className="w-4 h-4" /> Regenerate
                        </button>
                      </div>
                    </div>
                  </section>
                </div>
              )}
            </div>
          )}

          {activeSection === 'develop' && (
            <div className="space-y-10">
              <section>
                <h3 className="text-xl font-black text-app-heading mb-8">Develop rooms</h3>
                <p className="text-sm text-zinc-500 mb-8 leading-relaxed font-medium">Develop rooms by uploading hackable virtual machines, and creating walkthroughs or challenge rooms with tasks and questions. You can also easily clone and share rooms with different user groups.</p>
                <button onClick={() => setView('create')} className="px-8 py-3 bg-[#a3e635] hover:bg-[#bef264] text-black font-black rounded-xl transition-all shadow-lg shadow-[#a3e635]/20 flex items-center gap-2">
                  <Plus className="w-5 h-5" /> Create your first room
                </button>
              </section>

              <div className="h-px bg-app-border" />

              <section>
                <h3 className="text-lg font-black text-app-heading mb-8">Room developer options</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                  {[
                    { step: 1, title: 'Create a room', desc: 'Create and customise your room.', icon: Monitor },
                    { step: 2, title: 'Add tasks & resources', desc: 'Upload resources (like virtual machines or files) and create tasks with questions.', icon: Terminal },
                    { step: 3, title: 'Share', desc: 'Distribute your room privately or publicly.', icon: Rocket }
                  ].map(item => (
                    <div key={item.step} className="p-6 bg-black/5 dark:bg-black/40 border border-app-border rounded-2xl relative">
                      <div className="absolute -top-3 -left-3 w-8 h-8 bg-[#a3e635] text-black rounded-lg flex items-center justify-center text-[10px] font-black shadow-lg">
                        STEP {item.step}
                      </div>
                      <item.icon className="w-10 h-10 text-[#a3e635] mb-4" />
                      <h4 className="text-sm font-black text-app-heading mb-2 uppercase tracking-widest">{item.title}</h4>
                      <p className="text-xs text-zinc-500 leading-relaxed font-medium">{item.desc}</p>
                    </div>
                  ))}
                </div>
              </section>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

const ProfilePage = ({ user, rooms, addToast, setView }: { user: User, rooms: Room[], addToast: (m: string, t?: 'success' | 'error' | 'info') => void, setView: (v: string) => void }) => {
  const [activeTab, setActiveTab] = useState('completed');
  
  const completedRooms = rooms.filter(r => user.completed_rooms?.includes(r.id));

  return (
    <div className="max-w-7xl mx-auto px-4 py-12">
      {/* Header Banner */}
      <div className="bg-app-card border border-app-border rounded-3xl overflow-hidden mb-8 relative">
        <div className="h-48 bg-gradient-to-r from-[#a3e635]/20 to-emerald-500/20 relative">
          <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-20" />
          <div className="absolute bottom-0 left-0 w-full h-24 bg-gradient-to-t from-app-card to-transparent" />
        </div>
        
        <div className="px-8 pb-8 -mt-16 relative z-10 flex flex-col md:flex-row items-end justify-between gap-6">
          <div className="flex flex-col md:flex-row items-end gap-6">
            <div className="w-32 h-32 rounded-3xl border-4 border-app-card overflow-hidden shadow-2xl bg-app-card">
              <img 
                src={user.avatar_url || `https://picsum.photos/seed/${user.username}/200/200`} 
                alt={user.username}
                className="w-full h-full object-cover"
                referrerPolicy="no-referrer"
              />
            </div>
            <div className="mb-2 flex-1">
              <div className="flex items-center gap-3 mb-2">
                <h1 className="text-4xl font-black text-app-heading tracking-tighter">{user.full_name || user.username}</h1>
                <span className="px-2 py-0.5 bg-[#a3e635] text-black text-[10px] font-black rounded uppercase tracking-widest">Student</span>
              </div>
              <div className="flex flex-col gap-4">
                <div className="flex items-center gap-6 text-zinc-500 text-sm font-black uppercase tracking-widest">
                  <div className="flex flex-col">
                    <span className="text-app-heading text-lg leading-none">0</span>
                    <span className="text-[10px]">Following</span>
                  </div>
                  <div className="flex flex-col">
                    <span className="text-app-heading text-lg leading-none">0</span>
                    <span className="text-[10px]">Followers</span>
                  </div>
                </div>
                {user.bio && (
                  <div className="bg-app-heading/5 border-l-4 border-[#a3e635] p-4 rounded-r-xl max-w-2xl">
                    <p className="text-app-text text-sm font-medium leading-relaxed italic">"{user.bio}"</p>
                  </div>
                )}
                
                {/* Social Links & Calendly - Compact Left Aligned */}
                <div className="flex flex-wrap gap-2 mt-2">
                  {user.socials?.discord && (
                    <div className="flex items-center gap-1.5 bg-app-heading/5 border border-app-border rounded-lg px-2 py-1 text-zinc-400 hover:text-[#a3e635] hover:border-[#a3e635]/30 hover:-translate-y-0.5 transition-all duration-300 group cursor-default shadow-sm hover:shadow-[#a3e635]/10" title={user.socials.discord}>
                      <MessageSquare className="w-3.5 h-3.5" />
                      <span className="text-[10px] font-black uppercase tracking-tight">{user.socials.discord}</span>
                    </div>
                  )}
                  {user.socials?.twitter && (
                    <a href={`https://twitter.com/${user.socials.twitter.replace('@', '')}`} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1.5 bg-app-heading/5 border border-app-border rounded-lg px-2 py-1 text-zinc-400 hover:text-[#a3e635] hover:border-[#a3e635]/30 hover:-translate-y-0.5 transition-all duration-300 group shadow-sm hover:shadow-[#a3e635]/10" title="Twitter">
                      <Twitter className="w-3.5 h-3.5" />
                      <span className="text-[10px] font-black uppercase tracking-tight">Twitter</span>
                    </a>
                  )}
                  {user.socials?.github && (
                    <a href={`https://github.com/${user.socials.github}`} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1.5 bg-app-heading/5 border border-app-border rounded-lg px-2 py-1 text-zinc-400 hover:text-[#a3e635] hover:border-[#a3e635]/30 hover:-translate-y-0.5 transition-all duration-300 group shadow-sm hover:shadow-[#a3e635]/10" title="GitHub">
                      <Github className="w-3.5 h-3.5" />
                      <span className="text-[10px] font-black uppercase tracking-tight">GitHub</span>
                    </a>
                  )}
                  {user.socials?.linkedin && (
                    <a href={`https://linkedin.com/in/${user.socials.linkedin}`} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1.5 bg-app-heading/5 border border-app-border rounded-lg px-2 py-1 text-zinc-400 hover:text-[#a3e635] hover:border-[#a3e635]/30 hover:-translate-y-0.5 transition-all duration-300 group shadow-sm hover:shadow-[#a3e635]/10" title="LinkedIn">
                      <Linkedin className="w-3.5 h-3.5" />
                      <span className="text-[10px] font-black uppercase tracking-tight">LinkedIn</span>
                    </a>
                  )}
                  {user.socials?.website && (
                    <a href={user.socials.website.startsWith('http') ? user.socials.website : `https://${user.socials.website}`} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1.5 bg-app-heading/5 border border-app-border rounded-lg px-2 py-1 text-zinc-400 hover:text-[#a3e635] hover:border-[#a3e635]/30 hover:-translate-y-0.5 transition-all duration-300 group shadow-sm hover:shadow-[#a3e635]/10" title="Website">
                      <Globe className="w-3.5 h-3.5" />
                      <span className="text-[10px] font-black uppercase tracking-tight">Web</span>
                    </a>
                  )}
                  {user.calendly_link && (
                    <a href={user.calendly_link} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1.5 bg-emerald-500/10 border border-emerald-500/30 rounded-lg px-2 py-1 text-emerald-500 hover:bg-emerald-500/20 hover:border-emerald-500/50 hover:-translate-y-0.5 transition-all duration-300 group shadow-sm hover:shadow-emerald-500/10">
                      <Clock className="w-3.5 h-3.5" />
                      <span className="text-[10px] font-black uppercase tracking-tight">Meeting</span>
                    </a>
                  )}
                </div>

                <div className="flex items-center gap-2 bg-black/5 dark:bg-black/40 border border-app-border rounded-xl px-4 py-2 w-fit">
                  <Globe className="w-3 h-3 text-zinc-500" />
                  <span className="text-[10px] font-mono text-zinc-500 select-all">
                    https://hacklab.network/profile/{user.username}
                  </span>
                  <button 
                    onClick={() => {
                      navigator.clipboard.writeText(`https://hacklab.network/profile/${user.username}`);
                      addToast('Profile link copied!', 'success');
                    }}
                    className="ml-2 p-1 hover:bg-app-heading/5 rounded transition-colors"
                  >
                    <Copy className="w-3 h-3 text-[#a3e635]" />
                  </button>
                </div>
              </div>
            </div>
          </div>

          <div className="flex flex-col items-end gap-4 mb-2">
            <div className="flex flex-wrap gap-2 justify-end">
              <button 
                onClick={() => setView('settings')}
                className="px-4 py-2 bg-app-heading/5 hover:bg-app-heading/10 text-app-heading text-xs font-black rounded-xl border border-app-border transition-all flex items-center gap-2"
              >
                Edit Socials
              </button>
              <button 
                onClick={() => setView('settings')}
                className="px-4 py-2 bg-app-heading/5 hover:bg-app-heading/10 text-app-heading text-xs font-black rounded-xl border border-app-border transition-all flex items-center gap-2"
              >
                Add Calendly Link
              </button>
              <button 
                className="px-4 py-2 bg-app-heading/5 hover:bg-app-heading/10 text-app-heading text-xs font-black rounded-xl border border-app-border transition-all flex items-center gap-2"
              >
                <Award className="w-4 h-4" /> Share room badges
              </button>
            </div>
          </div>
        </div>

        <div className="px-8 py-6 border-t border-app-border bg-black/5 dark:bg-black/20 grid grid-cols-2 md:grid-cols-4 gap-8">
          <div>
            <p className="text-[10px] text-zinc-500 font-black uppercase tracking-widest mb-1">Rank</p>
            <div className="flex items-center gap-2">
              <Trophy className="w-5 h-5 text-yellow-500" />
              <span className="text-xl font-black text-app-heading">#{user.rank || 'N/A'}</span>
            </div>
          </div>
          <div>
            <p className="text-[10px] text-zinc-500 font-black uppercase tracking-widest mb-1">Badges</p>
            <div className="flex items-center gap-2">
              <Award className="w-5 h-5 text-emerald-500" />
              <span className="text-xl font-black text-app-heading">{user.badges?.length || 0}</span>
            </div>
          </div>
          <div>
            <p className="text-[10px] text-zinc-500 font-black uppercase tracking-widest mb-1">Streak</p>
            <div className="flex items-center gap-2">
              <Flame className="w-5 h-5 text-[#a3e635]" />
              <span className="text-xl font-black text-app-heading">{user.streak || 0}</span>
            </div>
          </div>
          <div>
            <p className="text-[10px] text-zinc-500 font-black uppercase tracking-widest mb-1">Completed Rooms</p>
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5 text-blue-500" />
              <span className="text-xl font-black text-app-heading">{user.completed_rooms?.length || 0}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-app-border mb-8 flex items-center gap-8 overflow-x-auto scrollbar-hide">
        {[
          { id: 'completed', label: 'Completed rooms', icon: CheckCircle2 },
          { id: 'certificates', label: 'Certificates', icon: Award },
          { id: 'skills', label: 'Skills matrix', icon: Target },
          { id: 'badges', label: 'Badges', icon: Award },
          { id: 'created', label: 'Created rooms', icon: Plus },
          { id: 'activity', label: 'Yearly activity', icon: Activity }
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={cn(
              "pb-4 text-sm font-black uppercase tracking-widest flex items-center gap-2 border-b-2 transition-all whitespace-nowrap",
              activeTab === tab.id ? "text-[#a3e635] border-[#a3e635]" : "text-zinc-500 border-transparent hover:text-app-heading"
            )}
          >
            <tab.icon className="w-4 h-4" />
            {tab.label}
          </button>
        ))}
      </div>

      {/* Content */}
      <div className="min-h-[400px]">
        {activeTab === 'completed' && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {completedRooms.length > 0 ? (
              completedRooms.map(room => (
                <div key={room.id} className="bg-app-card border border-app-border rounded-2xl p-6 flex items-center gap-4">
                  <div className="w-16 h-16 bg-app-card rounded-xl overflow-hidden flex-shrink-0">
                    <img 
                      src={`https://picsum.photos/seed/${room.id}/100/100`} 
                      className="w-full h-full object-cover opacity-60"
                      referrerPolicy="no-referrer"
                    />
                  </div>
                  <div>
                    <h4 className="text-app-heading font-bold mb-1">{room.title}</h4>
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-black text-[#a3e635] uppercase tracking-widest">{room.difficulty}</span>
                      <span className="text-[10px] text-zinc-500 font-black uppercase tracking-widest">Completed</span>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="col-span-full flex items-center justify-center text-zinc-600 italic font-medium py-12">
                No completed rooms yet.
              </div>
            )}
          </div>
        )}

        {activeTab === 'badges' && (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-6">
            {user.badges?.map((badge, i) => (
              <div key={i} className="flex flex-col items-center gap-3 group">
                <div className="w-20 h-20 bg-[#a3e635]/10 rounded-full flex items-center justify-center border border-[#a3e635]/20 group-hover:bg-[#a3e635]/20 transition-all">
                  <Award className="w-10 h-10 text-[#a3e635]" />
                </div>
                <span className="text-xs font-black text-app-heading uppercase tracking-widest text-center">{badge}</span>
              </div>
            ))}
            {(!user.badges || user.badges.length === 0) && (
              <div className="col-span-full flex items-center justify-center text-zinc-600 italic font-medium py-12">
                No badges earned yet.
              </div>
            )}
          </div>
        )}

        {activeTab === 'activity' && (
          <div className="w-full bg-app-card border border-app-border rounded-3xl p-8">
            <h3 className="text-lg font-black text-app-heading mb-6">Yearly activity</h3>
            <div className="flex flex-wrap gap-2">
              {Array.from({ length: 52 * 7 }).map((_, i) => (
                <div key={i} className="w-3 h-3 bg-black/5 dark:bg-zinc-800 rounded-sm" />
              ))}
            </div>
          </div>
        )}

        {!['completed', 'badges', 'activity'].includes(activeTab) && (
          <div className="flex items-center justify-center text-zinc-600 italic font-medium py-12">
            No {activeTab} yet.
          </div>
        )}
      </div>
    </div>
  );
};

// --- Onboarding Tour Component ---

const OnboardingTour = ({ onComplete }: { onComplete: () => void }) => {
  const [step, setStep] = useState(0);
  const [targetRect, setTargetRect] = useState<DOMRect | null>(null);

  const steps = [
    {
      target: null,
      title: "Welcome to HackLab!",
      content: "Let's take a quick tour to help you get started with the platform.",
      position: 'center'
    },
    {
      target: "#tour-search",
      title: "Quick Search",
      content: "Use this to quickly find labs, learning paths, or other hackers.",
      position: 'bottom'
    },
    {
      target: "#tour-profile",
      title: "Your Profile",
      content: "Manage your account, view your progress, and switch between light/dark modes here.",
      position: 'bottom'
    },
    {
      target: "#tour-nav-dashboard",
      title: "Dashboard",
      content: "Your central hub for learning paths, stats, and weekly missions.",
      position: 'top'
    },
    {
      target: "#tour-nav-rooms",
      title: "Practice Labs",
      content: "Access all our interactive labs and practice your hacking skills.",
      position: 'top'
    },
    {
      target: "#tour-nav-create",
      title: "Upload Labs",
      content: "Contribute to the community by uploading your own OVA machines.",
      position: 'top'
    },
    {
      target: "#tour-nav-manage-rooms",
      title: "Manage Rooms",
      content: "Manage the rooms you've created and track their performance.",
      position: 'top'
    },
    {
      target: "#tour-nav-leaderboard",
      title: "Leaderboard",
      content: "Compete with other hackers and climb the global rankings.",
      position: 'top'
    },
    {
      target: "#tour-nav-settings",
      title: "Settings",
      content: "Configure your preferences and account security.",
      position: 'top'
    }
  ];

  const updateTargetRect = useCallback(() => {
    const currentStep = steps[step];
    if (currentStep.target) {
      const element = document.querySelector(currentStep.target);
      if (element) {
        const rect = element.getBoundingClientRect();
        // Only update if rect has changed significantly to avoid infinite loops
        setTargetRect(rect);
      } else {
        setTargetRect(null);
      }
    } else {
      setTargetRect(null);
    }
  }, [step]);

  useEffect(() => {
    // Retry finding the element a few times if not found immediately
    let attempts = 0;
    const findElement = () => {
      updateTargetRect();
      const currentStep = steps[step];
      if (currentStep.target) {
        const element = document.querySelector(currentStep.target);
        if (element) {
          element.scrollIntoView({ behavior: 'smooth', block: 'center' });
        } else if (attempts < 5) {
          attempts++;
          setTimeout(findElement, 200);
        }
      }
    };

    findElement();

    window.addEventListener('resize', updateTargetRect);
    window.addEventListener('scroll', updateTargetRect, true);
    return () => {
      window.removeEventListener('resize', updateTargetRect);
      window.removeEventListener('scroll', updateTargetRect, true);
    };
  }, [step, updateTargetRect]);

  const handleNext = () => {
    if (step < steps.length - 1) {
      setStep(step + 1);
    } else {
      onComplete();
    }
  };

  const currentStep = steps[step];

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[200] pointer-events-none"
    >
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="absolute inset-0 bg-black/60 backdrop-blur-sm pointer-events-auto"
        onClick={handleNext}
      />

      {targetRect && (
        <motion.div 
          layoutId="tour-highlight"
          initial={false}
          animate={{
            top: targetRect.top - 8,
            left: targetRect.left - 8,
            width: targetRect.width + 16,
            height: targetRect.height + 16,
          }}
          className="absolute border-2 border-[#a3e635] rounded-2xl shadow-[0_0_30px_rgba(163,230,53,0.3)] z-[201]"
          transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
        />
      )}

      <div className="absolute inset-0 flex items-center justify-center p-6">
        <motion.div 
          key={step}
          initial={{ opacity: 0, y: 20, scale: 0.95 }}
          animate={{ 
            opacity: 1, 
            scale: 1,
            top: targetRect ? `${currentStep.position === 'top' ? targetRect.top - 20 : targetRect.bottom + 20}px` : '50%',
            left: targetRect ? `${targetRect.left + targetRect.width / 2}px` : '50%',
            x: '-50%',
            y: targetRect ? (currentStep.position === 'top' ? '-100%' : '0%') : '-50%'
          }}
          transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
          className={cn(
            "absolute w-full max-w-sm bg-app-card border border-app-border rounded-3xl p-8 shadow-2xl pointer-events-auto",
            !targetRect && "relative"
          )}
        >
          <div className="flex items-center justify-between mb-4">
            <span className="text-[10px] font-black text-[#a3e635] uppercase tracking-widest">Step {step + 1} of {steps.length}</span>
            <div className="flex items-center gap-3">
              <button 
                onClick={onComplete}
                className="text-[10px] font-black text-zinc-500 hover:text-white uppercase tracking-widest transition-colors"
              >
                Skip Tour
              </button>
              <button onClick={onComplete} className="p-1 hover:bg-white/5 rounded-full text-zinc-500 hover:text-white transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>
          <h3 className="text-2xl font-black text-app-heading mb-3 tracking-tight">{currentStep.title}</h3>
          <p className="text-sm text-zinc-400 leading-relaxed mb-8">{currentStep.content}</p>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button 
                onClick={() => step > 0 && setStep(step - 1)}
                className={cn(
                  "text-xs font-black uppercase tracking-widest transition-colors",
                  step === 0 ? "opacity-0 pointer-events-none" : "text-zinc-500 hover:text-white"
                )}
              >
                Back
              </button>
              {step < steps.length - 1 && (
                <button 
                  onClick={onComplete}
                  className="text-xs font-black uppercase tracking-widest text-zinc-500 hover:text-red-400 transition-colors"
                >
                  Skip
                </button>
              )}
            </div>
            <button 
              onClick={handleNext}
              className="px-8 py-3 bg-[#a3e635] hover:bg-[#bef264] text-black text-xs font-black rounded-xl uppercase tracking-widest transition-all shadow-lg shadow-[#a3e635]/20"
            >
              {step === steps.length - 1 ? "Get Started" : "Next"}
            </button>
          </div>
        </motion.div>
      </div>
    </motion.div>
  );
};

// --- Main App ---

export default function App() {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(localStorage.getItem('token'));
  const [view, setView] = useState('dashboard');
  const [rooms, setRooms] = useState<Room[]>([]);
  const [selectedRoomId, setSelectedRoomId] = useState<number | null>(null);
  const [notifications, setNotifications] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [toasts, setToasts] = useState<Toast[]>([]);
  const [isDarkMode, setIsDarkMode] = useState(true);
  const [savedLabs, setSavedLabs] = useState<number[]>(JSON.parse(localStorage.getItem('savedLabs') || '[]'));
  const [presence, setPresence] = useState<{ roomId: number, count: number }>({ roomId: 0, count: 0 });
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [globalActivity, setGlobalActivity] = useState<Record<string, { username: string, roomId: number, status: string }>>({});

  useEffect(() => {
    socket.on('global-presence-update', (data: { userId: string, username: string, roomId: number, status: string }) => {
      setGlobalActivity(prev => ({
        ...prev,
        [data.userId]: data
      }));
    });

    return () => {
      socket.off('global-presence-update');
    };
  }, []);
  useEffect(() => {
    const fetchInitialData = async () => {
      try {
        const res = await fetch('/api/notifications');
        const data = await res.json();
        setNotifications(Array.isArray(data) ? data : []);
      } catch (e) {
        console.error('Failed to fetch notifications:', e);
      }
    };

    if (token) {
      fetchInitialData();
    }
  }, [token]);

  useEffect(() => {
    socket.on('notification-new', (notification) => {
      setNotifications(prev => [notification, ...prev].slice(0, 20));
      addToast(notification.title, 'info');
    });

    return () => {
      socket.off('notification-new');
    };
  }, [token]);

  const markNotificationsRead = async () => {
    try {
      await fetch('/api/notifications/read', { method: 'POST' });
      setNotifications(prev => prev.map(n => ({ ...n, read: true })));
    } catch (e) {
      console.error('Failed to mark notifications as read:', e);
    }
  };

  useEffect(() => {
    if (user && !localStorage.getItem('hasSeenOnboarding')) {
      setShowOnboarding(true);
    }
  }, [user]);

  const handleOnboardingComplete = () => {
    setShowOnboarding(false);
    localStorage.setItem('hasSeenOnboarding', 'true');
    addToast('Tour completed! Enjoy HackLab.', 'success');
  };

  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
      document.documentElement.classList.remove('light');
    } else {
      document.documentElement.classList.add('light');
      document.documentElement.classList.remove('dark');
    }
  }, [isDarkMode]);

  useEffect(() => {
    localStorage.setItem('savedLabs', JSON.stringify(savedLabs));
  }, [savedLabs]);

  const addToast = (message: string, type: 'success' | 'error' | 'info' = 'info') => {
    const id = Math.random().toString(36).substring(2, 9);
    setToasts(prev => [...prev, { id, message, type }]);
  };

  const removeToast = (id: string) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  };

  // Filter states
  const [searchQuery, setSearchQuery] = useState('');
  const [difficultyFilter, setDifficultyFilter] = useState<string>('All');
  const [categoryFilter, setCategoryFilter] = useState<string>('All');

  useEffect(() => {
    const refreshProfile = async (u: User, t: string) => {
      try {
        const res = await fetch(`/api/users/${u.id}/profile`, {
          headers: { 'Authorization': `Bearer ${t}` }
        });
        const profileData = await res.json();
        const completedRoomIds = profileData.solvedLabs?.map((lab: any) => lab.id) || [];
        
        const updatedUser = {
          ...u,
          completed_rooms: completedRoomIds
        };
        setUser(updatedUser);
        localStorage.setItem('user', JSON.stringify(updatedUser));
      } catch (e) {
        console.error('Failed to refresh profile:', e);
      }
    };

    if (token) {
      const savedUser = localStorage.getItem('user');
      if (savedUser) {
        const u = JSON.parse(savedUser);
        setUser(u);
        refreshProfile(u, token);
      }
    }
    fetchRooms();
  }, [token]);

  useEffect(() => {
    socket.on('presence-update', (data) => {
      setPresence(data);
    });

    return () => {
      socket.off('presence-update');
    };
  }, []);

  const fetchRooms = async () => {
    try {
      const res = await fetch('/api/rooms');
      const data = await res.json();
      setRooms(Array.isArray(data) ? data : []);
    } catch (e) {
      setRooms([]);
    }
  };

  const handleLogin = async (u: User, t: string) => {
    try {
      // Fetch real profile data from backend
      const res = await fetch(`/api/users/${u.id}/profile`, {
        headers: { 'Authorization': `Bearer ${t}` }
      });
      const profileData = await res.json();
      
      const completedRoomIds = profileData.solvedLabs?.map((lab: any) => lab.id) || [];

      // Enrich user with mock data for profile + real completed rooms
      const enrichedUser: User = {
        ...u,
        rank: 1240,
        streak: completedRoomIds.length, // Real-time lab result (completed rooms count)
        badges: ['First Blood', 'Bug Hunter', 'Top 1%'],
        calendly_link: 'https://calendly.com/hacklab-kuntal',
        socials: {
          discord: 'kuntal#1234',
          twitter: '@kuntal_hack',
          github: 'kuntal-bera',
          linkedin: 'kuntalbera'
        },
        completed_rooms: completedRoomIds
      };
      setUser(enrichedUser);
      setToken(t);
      localStorage.setItem('token', t);
      localStorage.setItem('user', JSON.stringify(enrichedUser));
      setView('dashboard');
      addToast(`Welcome back, ${enrichedUser.username}!`, 'success');
    } catch (error) {
      console.error('Error fetching profile:', error);
      // Fallback to basic user if profile fetch fails
      setUser(u);
      setToken(t);
      localStorage.setItem('token', t);
      setView('dashboard');
    }
  };

  const handleRoomComplete = (roomId: number) => {
    if (!user) return;
    const completedRooms = user.completed_rooms || [];
    if (!completedRooms.includes(roomId)) {
      const updatedUser = {
        ...user,
        completed_rooms: [...completedRooms, roomId],
        streak: (user.streak || 0) + 1,
        points: user.points + 500 // Bonus points for completion
      };
      setUser(updatedUser);
      localStorage.setItem('user', JSON.stringify(updatedUser));
    }
  };

  const handleLogout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setView('dashboard');
    addToast('Logged out successfully.', 'info');
  };

  const filteredRooms = rooms.filter(room => {
    const matchesSearch = room.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                         room.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesDifficulty = difficultyFilter === 'All' || room.difficulty === difficultyFilter;
    const matchesCategory = categoryFilter === 'All' || room.category === categoryFilter;
    return matchesSearch && matchesDifficulty && matchesCategory;
  });

  const categories = ['All', ...new Set(rooms.map(r => r.category).filter(Boolean))] as string[];

  return (
    <div className="min-h-screen bg-[var(--bg-main)] text-[var(--text-main)] font-sans selection:bg-emerald-500/30 selection:text-emerald-400 transition-colors duration-300">
      <Navbar 
        user={user} 
        onLogout={handleLogout} 
        setView={setView} 
        isDarkMode={isDarkMode} 
        setIsDarkMode={setIsDarkMode} 
        addToast={addToast}
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        view={view}
        notifications={notifications}
        markNotificationsRead={markNotificationsRead}
      />

      {/* Modern Floating Navigation - Visible on all devices */}
      <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-[100] w-fit">
        <motion.div 
          initial={{ y: 100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="bg-black/80 backdrop-blur-xl border border-white/10 rounded-2xl p-2 flex items-center gap-1 shadow-[0_20px_50px_rgba(0,0,0,0.5)] ring-1 ring-white/5"
        >
          {[
            { id: 'dashboard', label: 'Home', icon: Layout },
            { id: 'rooms', label: 'Practice', icon: Target },
            { id: 'create', label: 'Upload', icon: Cloud },
            { id: 'manage-rooms', label: 'Manage', icon: Monitor },
            { id: 'leaderboard', label: 'Compete', icon: Trophy },
            { id: 'settings', label: 'Settings', icon: Settings }
          ].map((item) => (
            <button
              id={`tour-nav-${item.id}`}
              key={item.id}
              onClick={() => setView(item.id)}
              className={cn(
                "relative flex flex-col items-center gap-1 px-4 py-2 rounded-xl transition-all duration-300 group",
                view === item.id 
                  ? "text-[#a3e635] bg-white/5" 
                  : "text-zinc-500 hover:text-white hover:bg-white/5"
              )}
            >
              <item.icon className={cn(
                "w-5 h-5 transition-transform duration-300 group-hover:scale-110",
                view === item.id && "drop-shadow-[0_0_8px_rgba(163,230,53,0.5)]"
              )} />
              <span className="text-[9px] font-black uppercase tracking-[0.2em] hidden md:block">
                {item.label}
              </span>
              {view === item.id && (
                <motion.div 
                  layoutId="nav-active"
                  className="absolute -bottom-1 left-2 right-2 h-0.5 bg-[#a3e635] rounded-full"
                  transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                />
              )}
            </button>
          ))}
        </motion.div>
      </div>
      
      {isLoading && <LoadingOverlay />}
      
      <AnimatePresence>
        {showOnboarding && (
          <OnboardingTour onComplete={handleOnboardingComplete} />
        )}
      </AnimatePresence>
      
      <div className="fixed bottom-6 right-6 z-[100] flex flex-col gap-3 pointer-events-none">
        <AnimatePresence>
          {toasts.map(toast => (
            <div key={toast.id} className="pointer-events-auto">
              <Toast {...toast} onClose={() => removeToast(toast.id)} />
            </div>
          ))}
        </AnimatePresence>
      </div>
      
      <main className="pb-24 lg:pb-20">
        <AnimatePresence mode="wait">
          {view === 'auth' && (
            <AuthPage onLogin={handleLogin} />
          )}

          {view === 'dashboard' && (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="max-w-7xl mx-auto px-4 py-8"
            >
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                {/* Left Column: Learning Paths & Labs */}
                <div className="lg:col-span-8 space-y-8">
                  
                  {/* Dashboard Header */}
                  <div className="flex flex-col md:flex-row md:items-center gap-6 bg-app-card border border-app-border p-6 rounded-xl shadow-lg relative overflow-hidden">
                    <div className="relative z-10 flex items-center gap-6">
                      <div className="w-16 h-16 bg-[#a3e635]/20 rounded-2xl flex items-center justify-center">
                        <UserIcon className="w-10 h-10 text-[#a3e635]" />
                      </div>
                      <div>
                        <h2 className="text-4xl font-black text-app-heading tracking-tighter">Hey {user?.username || 'Kuntal'}</h2>
                        <p className="text-zinc-500 font-medium">Welcome back! Ready to break stuff (ethically, of course)?</p>
                      </div>
                    </div>
                    
                    <div className="md:ml-auto relative z-10 flex flex-col items-center gap-3 bg-app-heading/5 border border-app-border rounded-xl px-6 py-4">
                      <span className="text-[10px] font-black text-zinc-500 uppercase tracking-widest">Join our community</span>
                      <button 
                        onClick={() => window.open('https://discord.gg/tryhackme', '_blank')}
                        className="flex items-center gap-2 px-4 py-2 bg-[#5865F2] hover:bg-[#4752C4] text-white text-xs font-black rounded-lg transition-all shadow-lg shadow-[#5865F2]/20"
                      >
                        <MessageSquare className="w-4 h-4" />
                        Join the Discord server
                      </button>
                    </div>
                    <div className="absolute -bottom-12 -right-12 w-48 h-48 bg-[#a3e635]/5 rounded-full blur-3xl" />
                  </div>

                  {/* My Learning Section */}
                  <section className="bg-app-card border border-app-border rounded-xl overflow-hidden shadow-lg">
                    <div className="px-6 py-4 border-b border-app-border flex items-center justify-between bg-black/5 dark:bg-black/20">
                      <h3 className="text-sm font-black text-app-heading uppercase tracking-widest flex items-center gap-2">
                        <BookOpen className="w-4 h-4 text-[#a3e635]" />
                        My Learning
                      </h3>
                      <div className="flex items-center gap-3 md:gap-6 overflow-x-auto pb-2 scrollbar-hide">
                        <button className="text-xs font-black text-[#a3e635] uppercase tracking-widest flex items-center gap-2 border-b-2 border-[#a3e635] pb-1 whitespace-nowrap">
                          <Rocket className="w-4 h-4" /> Current
                        </button>
                        <button className="text-xs font-black text-zinc-500 hover:text-app-heading uppercase tracking-widest flex items-center gap-2 transition-colors pb-1 border-b-2 border-transparent whitespace-nowrap">
                          <RotateCcw className="w-4 h-4" /> Recent
                        </button>
                        <button 
                          onClick={() => setView('saved')}
                          className="text-xs font-black text-zinc-500 hover:text-app-heading uppercase tracking-widest flex items-center gap-2 transition-colors pb-1 border-b-2 border-transparent whitespace-nowrap"
                        >
                          <Bookmark className="w-4 h-4" /> Saved
                        </button>
                      </div>
                    </div>

                    <div className="p-6">
                      <div className="flex items-center justify-between mb-8">
                        <div className="flex items-center gap-4">
                          <div className="w-12 h-12 bg-[#a3e635]/10 rounded-xl flex items-center justify-center">
                            <Rocket className="w-6 h-6 text-[#a3e635]" />
                          </div>
                          <div>
                            <h4 className="text-xl font-black text-app-heading">Jr Penetration Tester</h4>
                            <div className="flex items-center gap-3 mt-1">
                              <div className="w-48 h-2 bg-black/5 dark:bg-black rounded-full overflow-hidden">
                                <div className="h-full bg-[#a3e635] w-[19%]" />
                              </div>
                              <span className="text-[10px] font-black text-zinc-500 uppercase tracking-widest">19%</span>
                            </div>
                          </div>
                        </div>
                        <button 
                          className="p-2 text-zinc-500 hover:text-app-heading transition-colors"
                          aria-label="More options"
                        >
                          <MoreHorizontal className="w-6 h-6" />
                        </button>
                      </div>

                      <div className="space-y-3">
                        {[
                          { title: 'Offensive Security Intro', desc: 'Hack your first website (legally in a safe environment) and experience an ethical hacker\'s job.', icon: Sword, active: true, progress: 100 },
                          { title: 'Defensive Security Intro', desc: 'Introducing defensive security and related topics, such as Threat Intelligence, SOC, DFIR, Malware Analysis, and SIEM.', icon: Shield, active: false, progress: 0 },
                          { title: 'Careers in Cyber', desc: 'Learn about the different careers in cyber security.', icon: Briefcase, active: false, progress: 0 },
                          { title: 'Topic Rewind Recap', desc: 'Lock in what you learned in a weekly recap. Earn points and keep your streak.', icon: Rocket, active: false, progress: 0 }
                        ].map((module, i) => (
                          <div 
                            key={i} 
                            className={cn(
                              "p-5 rounded-2xl border transition-all flex items-center justify-between gap-6 group",
                              module.active ? "bg-app-heading/5 border-[#a3e635]/30 hover:border-[#a3e635]" : "bg-black/5 dark:bg-black/20 border-app-border hover:border-app-heading/10"
                            )}
                          >
                            <div className="flex items-center gap-5 flex-1">
                              <div className={cn(
                                "w-14 h-14 rounded-2xl flex items-center justify-center flex-shrink-0 relative",
                                module.active ? "bg-[#a3e635]/20 text-[#a3e635]" : "bg-app-heading/5 text-zinc-500"
                              )}>
                                <module.icon className="w-7 h-7" />
                                {module.progress === 100 && (
                                  <div className="absolute -top-2 -right-2 w-6 h-6 bg-[#a3e635] text-black rounded-full flex items-center justify-center text-[10px] font-black border-2 border-app-card">
                                    100%
                                  </div>
                                )}
                              </div>
                              <div>
                                <h5 className="text-base font-black text-app-heading group-hover:text-[#a3e635] transition-colors">{module.title}</h5>
                                <p className="text-xs text-zinc-500 font-medium leading-relaxed max-w-md">{module.desc}</p>
                              </div>
                            </div>
                            <div className="block">
                              <ChevronRight className="w-5 h-5 text-zinc-700 group-hover:text-[#a3e635] transition-all group-hover:translate-x-1" />
                            </div>
                          </div>
                        ))}
                      </div>

                      <div className="mt-8 pt-8 border-t border-app-border flex items-center justify-between">
                        <button 
                          onClick={() => setView('rooms')}
                          className="px-6 py-3 text-zinc-500 hover:text-app-heading text-xs font-black uppercase tracking-widest transition-colors"
                        >
                          View path
                        </button>
                        <button 
                          onClick={() => setView('rooms')}
                          className="flex items-center gap-2 px-8 py-3 bg-[#a3e635] hover:bg-[#bef264] text-black text-xs font-black rounded-xl uppercase tracking-widest transition-all shadow-lg shadow-[#a3e635]/20"
                        >
                          <Gamepad2 className="w-4 h-4" />
                          Resume learning
                        </button>
                      </div>
                    </div>
                  </section>

                  {/* Bronze League Section */}
                  <section className="bg-app-card border border-app-border rounded-xl p-8 text-center relative overflow-hidden">
                    <div className="relative z-10">
                      <div className="flex items-center justify-center gap-4 mb-6">
                        <div className="w-12 h-px bg-app-border" />
                        <h3 className="text-xl font-black text-app-heading uppercase tracking-tighter">Bronze League</h3>
                        <div className="w-12 h-px bg-app-border" />
                      </div>
                      <p className="text-xs text-zinc-500 font-black uppercase tracking-widest mb-8">5 days left to join</p>
                      
                      <div className="w-24 h-24 bg-amber-700/20 rounded-3xl flex items-center justify-center mx-auto mb-6 border border-amber-700/30">
                        <Trophy className="w-12 h-12 text-amber-700" />
                      </div>
                      
                      <h4 className="text-2xl font-black text-app-heading mb-2 tracking-tight">Solve two rooms and grab your Bronze spot!</h4>
                      <p className="text-sm text-zinc-500 font-medium mb-8">Top players are already inside.</p>
                      
                      <button 
                        onClick={() => setView('leaderboard')}
                        className="px-8 py-3 bg-app-heading/5 hover:bg-app-heading/10 text-app-heading text-xs font-black rounded-xl border border-app-border transition-all uppercase tracking-widest"
                      >
                        View league
                      </button>
                    </div>
                    <div className="absolute top-0 right-0 w-64 h-64 bg-amber-700/5 rounded-full blur-3xl -mr-32 -mt-32" />
                  </section>

                  {/* New Rooms Section */}
                  <section>
                    <div className="flex items-center justify-between mb-6">
                      <h3 className="text-xl font-black text-app-heading uppercase tracking-tighter">New Rooms</h3>
                      <button onClick={() => setView('rooms')} className="text-xs font-black text-[#a3e635] uppercase tracking-widest hover:underline">View all</button>
                    </div>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      {[
                        { title: 'Monitoring AWS Services', difficulty: 'Medium', icon: Cloud },
                        { title: 'Operation Endgame', difficulty: 'Hard', icon: Flag },
                        { title: 'Become a Defender', difficulty: 'Easy', icon: Shield },
                        { title: 'Become a Hacker', difficulty: 'Easy', icon: Terminal }
                      ].map((room, i) => (
                        <div key={i} className="bg-app-card border border-app-border rounded-2xl p-4 hover:border-[#a3e635]/30 transition-all cursor-pointer group">
                          <div className="aspect-square bg-app-heading/5 rounded-xl mb-4 flex items-center justify-center relative overflow-hidden">
                            <room.icon className="w-10 h-10 text-zinc-700 group-hover:text-[#a3e635] transition-colors" />
                            <div className="absolute bottom-2 right-2">
                              <div className={cn(
                                "px-2 py-0.5 text-[8px] font-black rounded uppercase tracking-widest border",
                                room.difficulty === 'Easy' ? "text-emerald-500 border-emerald-500/20 bg-emerald-500/10" :
                                room.difficulty === 'Medium' ? "text-yellow-500 border-yellow-500/20 bg-yellow-500/10" :
                                "text-red-500 border-red-500/20 bg-red-500/10"
                              )}>
                                {room.difficulty}
                              </div>
                            </div>
                          </div>
                          <h4 className="text-xs font-black text-app-heading leading-tight line-clamp-2">{room.title}</h4>
                        </div>
                      ))}
                    </div>
                  </section>

                  {/* Saved Rooms Section */}
                  {savedLabs.length > 0 && (
                    <section className="mt-12">
                      <div className="flex items-center justify-between mb-6">
                        <div className="flex items-center gap-3">
                          <Bookmark className="w-6 h-6 text-yellow-500 fill-yellow-500" />
                          <h3 className="text-xl font-black text-app-heading uppercase tracking-tighter">Saved Rooms</h3>
                        </div>
                        <button 
                          onClick={() => setView('saved')} 
                          className="text-xs font-black text-zinc-500 hover:text-app-heading uppercase tracking-widest transition-colors"
                        >
                          Manage All
                        </button>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {rooms.filter(r => savedLabs.includes(r.id)).slice(0, 4).map(room => (
                          <RoomCard 
                            key={room.id} 
                            room={room} 
                            onClick={() => {
                              setSelectedRoomId(room.id);
                              setView('room-detail');
                            }}
                            isSaved={true}
                            onToggleSave={(id) => {
                              setSavedLabs(prev => prev.filter(i => i !== id));
                            }}
                          />
                        ))}
                      </div>
                    </section>
                  )}
                </div>

                {/* Right Column: Sidebars */}
                <div className="lg:col-span-4 space-y-8">
                  {/* Teams Plan Card */}
                  <div className="bg-gradient-to-br from-app-card to-black/20 border border-app-border rounded-xl p-6 shadow-xl relative overflow-hidden group">
                    <button className="absolute top-4 right-4 text-zinc-500 hover:text-app-heading transition-colors">
                      <X className="w-4 h-4" />
                    </button>
                    <div className="relative z-10">
                      <h4 className="text-lg font-black text-app-heading mb-4 tracking-tight">Unlock the Teams plan</h4>
                      <p className="text-sm text-zinc-500 mb-6 leading-relaxed font-medium">
                        See how your team performs in real time. Track progress, uncover insights, and drive improvement with powerful reporting built for managers.
                      </p>
                      <button 
                        onClick={() => setView('premium')}
                        className="w-full py-4 bg-[#a3e635] hover:bg-[#bef264] text-black font-black rounded-xl transition-all shadow-lg shadow-[#a3e635]/20 uppercase tracking-widest text-xs"
                      >
                        Upgrade to Teams
                      </button>
                    </div>
                    <div className="absolute -bottom-8 -right-8 w-32 h-32 bg-[#a3e635]/10 rounded-full blur-3xl group-hover:bg-[#a3e635]/20 transition-all"></div>
                  </div>

                  {/* Weekly Mission Card */}
                  <div className="bg-app-card border border-app-border rounded-xl overflow-hidden shadow-lg">
                    <div className="px-6 py-4 border-b border-app-border bg-black/5 dark:bg-white/5 flex items-center justify-between">
                      <div className="flex items-center gap-2 text-zinc-500 text-[10px] font-black uppercase tracking-widest">
                        <Clock className="w-4 h-4" />
                        5 days to next mission
                      </div>
                    </div>
                    <div className="p-6 space-y-6">
                      <div className="flex items-center gap-4">
                        <div className="w-14 h-14 bg-[#a3e635]/10 rounded-2xl flex items-center justify-center">
                          <Award className="w-8 h-8 text-[#a3e635]" />
                        </div>
                        <div>
                          <h4 className="text-lg font-black text-app-heading tracking-tight">Weekly Mission</h4>
                          <p className="text-xs text-zinc-500 font-medium">What's in the chest? 👀</p>
                        </div>
                      </div>

                      <div className="space-y-4">
                        {[
                          { label: 'Earn Points', current: 0, total: 33, icon: Zap },
                          { label: 'Answer Questions', current: 0, total: 14, icon: MessageCircle },
                          { label: 'Labs Completed', current: user?.streak || 0, total: 10, icon: Flame }
                        ].map((stat, i) => (
                          <div key={i} className="space-y-2">
                            <div className="flex justify-between text-[10px] font-black uppercase tracking-widest">
                              <span className="text-app-heading flex items-center gap-1">
                                <stat.icon className="w-3 h-3 text-[#a3e635]" />
                                {stat.label}
                              </span>
                              <span className="text-zinc-500">{stat.current} / {stat.total}</span>
                            </div>
                            <div className="w-full h-2 bg-black/5 dark:bg-black rounded-full overflow-hidden">
                              <div 
                                className="h-full bg-[#a3e635] transition-all duration-1000" 
                                style={{ width: `${Math.min((stat.current / stat.total) * 100, 100)}%` }}
                              />
                            </div>
                          </div>
                        ))}
                      </div>
                      
                      <button 
                        onClick={() => setView('premium')}
                        className="w-full py-3 bg-app-heading/5 hover:bg-app-heading/10 text-zinc-500 font-black rounded-xl border border-app-border transition-all uppercase tracking-widest text-[10px] flex items-center justify-center gap-2"
                      >
                        <Lock className="w-3 h-3" /> Unlock
                      </button>
                    </div>
                  </div>

                  {/* Profile Refresh Card */}
                  <div className="bg-app-card border border-app-border rounded-xl p-6 shadow-lg">
                    <div className="flex items-center gap-4 mb-6">
                      <div className="w-12 h-12 bg-blue-500/10 rounded-xl flex items-center justify-center">
                        <UserIcon className="w-6 h-6 text-blue-500" />
                      </div>
                      <div>
                        <h4 className="text-sm font-black text-app-heading uppercase tracking-widest">Profile Refresh!</h4>
                        <p className="text-xs text-zinc-500 font-medium">Revise your info and unlock new recommendations!</p>
                      </div>
                    </div>
                    <button 
                      onClick={() => setView('profile')}
                      className="w-full py-3 bg-blue-500 hover:bg-blue-600 text-white text-xs font-black rounded-xl transition-all shadow-lg shadow-blue-500/20 uppercase tracking-widest"
                    >
                      Go to profile
                    </button>
                  </div>

                  {/* Your Stats Card */}
                  <div className="bg-app-card border border-app-border rounded-xl overflow-hidden shadow-lg">
                    <div className="px-6 py-4 border-b border-app-border">
                      <h3 className="text-xs font-black text-app-heading uppercase tracking-widest">Your Stats</h3>
                    </div>
                    <div className="p-6">
                      <div className="flex items-center gap-4 mb-8">
                        <div className="w-16 h-16 rounded-2xl overflow-hidden border-2 border-[#a3e635]">
                          <img src={user?.avatar_url || `https://picsum.photos/seed/${user?.username}/200/200`} className="w-full h-full object-cover" />
                        </div>
                        <div>
                          <h4 className="text-lg font-black text-app-heading tracking-tight">{user?.username} [HACKER]</h4>
                          <p className="text-xs text-zinc-500 font-black uppercase tracking-widest">Level 8</p>
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-2 gap-4">
                        {[
                          { label: 'Global Rank', value: '#14,823', icon: Trophy },
                          { label: 'Top', value: '15%', icon: Target },
                          { label: 'Points', value: '5240', icon: Zap },
                          { label: 'Badges', value: '47', icon: Award }
                        ].map((stat, i) => (
                          <div key={i} className="bg-black/5 dark:bg-black/20 border border-app-border rounded-xl p-3">
                            <p className="text-[8px] font-black text-zinc-500 uppercase tracking-widest mb-1">{stat.label}</p>
                            <div className="flex items-center gap-2">
                              <stat.icon className="w-3 h-3 text-[#a3e635]" />
                              <span className="text-sm font-black text-app-heading">{stat.value}</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Suggested Follows */}
                  <div className="bg-app-card border border-app-border rounded-xl overflow-hidden shadow-lg">
                    <div className="px-6 py-4 border-b border-app-border flex items-center justify-between">
                      <h3 className="text-xl font-black text-app-heading uppercase tracking-tighter">Suggested Follows</h3>
                      <button 
                        onClick={() => setView('profile')}
                        className="text-[10px] font-black text-[#a3e635] uppercase tracking-widest hover:underline"
                      >
                        View all
                      </button>
                    </div>
                    <div className="p-4 space-y-4">
                      {[
                        { name: '0xb0b', avatar: 'https://picsum.photos/seed/0xb0b/100/100' },
                        { name: '1337in', avatar: 'https://picsum.photos/seed/1337in/100/100' },
                        { name: 'MillStu25', avatar: 'https://picsum.photos/seed/MillStu25/100/100' }
                      ].map((follow, i) => (
                        <div key={i} className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-xl overflow-hidden">
                              <img src={follow.avatar} className="w-full h-full object-cover" />
                            </div>
                            <span className="text-sm font-black text-app-heading">{follow.name}</span>
                          </div>
                          <button className="px-4 py-1.5 bg-app-heading/5 hover:bg-app-heading/10 text-app-heading text-[10px] font-black rounded-lg border border-app-border transition-all uppercase tracking-widest">
                            Follow
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {view === 'rooms' && (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="max-w-7xl mx-auto px-4 py-12"
            >
              <div className="flex flex-col md:flex-row md:items-end justify-between gap-8 mb-12">
                <div>
                  <h1 className="text-5xl font-black text-app-heading tracking-tighter mb-4">Lab Library</h1>
                  <p className="text-zinc-500 text-lg">Explore hundreds of vulnerable machines and challenges.</p>
                </div>
                <div className="flex flex-wrap gap-4">
                  <div className="relative">
                    <Search className={cn(
                      "absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 transition-colors",
                      searchQuery ? "text-emerald-500" : "text-zinc-500"
                    )} />
                    <input 
                      type="text" 
                      placeholder="Search labs..."
                      className={cn(
                        "bg-app-card border rounded-xl pl-10 pr-4 py-2.5 text-sm text-app-heading focus:outline-none focus:border-emerald-500 w-64 transition-all",
                        searchQuery ? "border-emerald-500/50 ring-1 ring-emerald-500/20" : "border-app-border"
                      )}
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                    />
                  </div>
                  
                  <select 
                    className={cn(
                      "bg-app-card border rounded-xl px-4 py-2.5 text-sm text-app-heading focus:outline-none focus:border-emerald-500 transition-all",
                      difficultyFilter !== 'All' ? "border-emerald-500/50 ring-1 ring-emerald-500/20" : "border-app-border"
                    )}
                    value={difficultyFilter}
                    onChange={(e) => setDifficultyFilter(e.target.value)}
                  >
                    <option value="All">All Difficulties</option>
                    <option value="Easy">Easy</option>
                    <option value="Medium">Medium</option>
                    <option value="Hard">Hard</option>
                    <option value="Insane">Insane</option>
                  </select>

                  <select 
                    className={cn(
                      "bg-app-card border rounded-xl px-4 py-2.5 text-sm text-app-heading focus:outline-none focus:border-emerald-500 transition-all",
                      categoryFilter !== 'All' ? "border-emerald-500/50 ring-1 ring-emerald-500/20" : "border-app-border"
                    )}
                    value={categoryFilter}
                    onChange={(e) => setCategoryFilter(e.target.value)}
                  >
                    {categories.map(cat => (
                      <option key={cat} value={cat}>{cat === 'All' ? 'All Categories' : cat}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Active Operators Section */}
              {Object.keys(globalActivity).length > 0 && (
                <div className="mb-12">
                  <div className="flex items-center gap-3 mb-6">
                    <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
                    <h2 className="text-xs font-black text-emerald-500 uppercase tracking-[0.3em]">Active Operators</h2>
                  </div>
                  <div className="flex flex-wrap gap-4">
                    {Object.values(globalActivity).filter(act => act.status !== 'stopped').map((activity, idx) => (
                      <motion.div 
                        key={idx}
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="bg-app-card border border-emerald-500/20 rounded-2xl p-4 flex items-center gap-4 shadow-lg shadow-emerald-500/5"
                      >
                        <div className="w-10 h-10 rounded-xl overflow-hidden border border-emerald-500/30">
                          <img src={`https://picsum.photos/seed/${activity.username}/100/100`} className="w-full h-full object-cover" />
                        </div>
                        <div>
                          <div className="flex items-center gap-2 mb-1">
                            <span className="text-sm font-black text-app-heading">{activity.username}</span>
                            <span className={cn(
                              "w-1.5 h-1.5 rounded-full",
                              activity.status === 'running' ? "bg-emerald-500" : "bg-yellow-500"
                            )} />
                          </div>
                          <p className="text-[10px] text-zinc-500 font-black uppercase tracking-widest">
                            {activity.status === 'running' ? 'Compromising' : 'Deploying'} {rooms.find(r => r.id === activity.roomId)?.title || 'Unknown Lab'}
                          </p>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </div>
              )}

              {filteredRooms.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                  {filteredRooms.map(room => (
                    <RoomCard 
                      key={room.id} 
                      room={room} 
                      onClick={() => {
                        setSelectedRoomId(room.id);
                        setView('room-detail');
                      }} 
                      isSaved={savedLabs.includes(room.id)}
                      onToggleSave={(id) => {
                        setSavedLabs(prev => 
                          prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
                        );
                      }}
                    />
                  ))}
                </div>
              ) : (
                <div className="text-center py-20 bg-app-card border border-dashed border-app-border rounded-3xl">
                  <Search className="w-12 h-12 text-zinc-700 mx-auto mb-4" />
                  <h3 className="text-xl font-bold text-app-heading mb-2">No labs found</h3>
                  <p className="text-zinc-500">Try adjusting your filters or search query.</p>
                  <button 
                    onClick={() => { setSearchQuery(''); setDifficultyFilter('All'); setCategoryFilter('All'); }}
                    className="mt-6 text-emerald-500 font-bold hover:underline"
                  >
                    Clear all filters
                  </button>
                </div>
              )}
            </motion.div>
          )}

          {view === 'room-detail' && selectedRoomId && (
            <RoomDetail 
              roomId={selectedRoomId} 
              token={token || ''} 
              onBack={() => setView('rooms')} 
              addToast={addToast}
              onRoomComplete={handleRoomComplete}
              presence={presence}
              user={user}
            />
          )}

          {view === 'leaderboard' && (
            <Leaderboard addToast={addToast} />
          )}

          {view === 'saved' && (
            <SavedLabs 
              rooms={rooms} 
              savedLabs={savedLabs} 
              onToggleSave={(id) => {
                setSavedLabs(prev => 
                  prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
                );
              }}
              setView={setView}
              setSelectedRoomId={setSelectedRoomId}
            />
          )}

          {view === 'badges' && (
            <BadgesPage user={user!} />
          )}

          {view === 'feedback' && (
            <FeedbackPage addToast={addToast} user={user} />
          )}

          {view === 'profile' && user && (
            <ProfilePage user={user} rooms={rooms} addToast={addToast} setView={setView} />
          )}

          {view === 'settings' && user && (
            <SettingsPage 
              user={user} 
              setView={setView} 
              addToast={addToast} 
              onLogout={handleLogout} 
              token={token || ''}
              onRestartTour={() => setShowOnboarding(true)}
              onUpdateUser={(updatedUser) => {
                setUser(updatedUser);
                localStorage.setItem('user', JSON.stringify(updatedUser));
              }}
            />
          )}

          {view === 'premium' && (
            <PremiumPage />
          )}

          {view === 'manage-rooms' && (
            <ManageRooms 
              rooms={rooms} 
              setView={setView} 
              setSelectedRoomId={setSelectedRoomId} 
            />
          )}

          {view === 'manage-room-detail' && selectedRoomId && (
            <ManageRoomDetail 
              roomId={selectedRoomId} 
              rooms={rooms} 
              onBack={() => setView('manage-rooms')} 
              addToast={addToast}
              onUpdate={fetchRooms}
            />
          )}

          {view === 'create' && (
            token ? (
              <UploadPage token={token} onSuccess={() => { fetchRooms(); setView('rooms'); }} />
            ) : (
              <AuthPage onLogin={handleLogin} />
            )
          )}
        </AnimatePresence>
      </main>
    </div>
  );
}
