
import React, { useState } from 'react';
import { Camera, Lock, User, AlertCircle, ArrowRight, Mail, Loader2, Sparkles, Zap } from 'lucide-react';
import ForgotPasswordModal from './ForgotPasswordModal';

interface LoginProps {
  onLogin: (userData: any) => void;
}

const Login: React.FC<LoginProps> = ({ onLogin }) => {
  const [isSignup, setIsSignup] = useState(false);
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showForgotModal, setShowForgotModal] = useState(false);

  // This function allows the user to enter the dashboard immediately without a database
  const handleInstantAccess = () => {
    const guestUser = { username: 'Guest Admin', email: 'guest@example.com', mode: 'demo' };
    localStorage.setItem('photo_studio_auth', 'true');
    localStorage.setItem('photo_studio_user', JSON.stringify(guestUser));
    onLogin(guestUser);
  };

  const handleDemoCredentials = () => {
    setIsSignup(false);
    setUsername('admin');
    setPassword('password123');
    setError('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      const endpoint = isSignup ? 'api.php?type=auth&action=signup' : 'api.php?type=auth&action=login';
      const body = isSignup ? { username, email, password } : { username, password };

      const response = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body)
      });

      // Handle cases where the response might not be JSON (like PHP errors)
      const text = await response.text();
      let data;
      try {
        data = JSON.parse(text);
      } catch (e) {
        throw new Error('Server returned an invalid response. Check your database configuration.');
      }

      if (response.ok) {
        if (isSignup) {
          alert(data.message || 'Account created! Please login.');
          setIsSignup(false);
          setPassword('');
          setUsername('');
          setEmail('');
        } else {
          localStorage.setItem('photo_studio_auth', 'true');
          localStorage.setItem('photo_studio_user', JSON.stringify(data.user));
          onLogin(data.user);
        }
      } else {
        setError(data.message || 'Authentication failed. Please check your inputs.');
      }
    } catch (err: any) {
      setError(err.message || 'Connection failed. You can use "Instant Demo Access" to bypass this.');
      console.error('Auth Error Details:', err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center p-4 relative overflow-hidden">
      {/* Background Decorative Elements */}
      <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-indigo-600/20 blur-[120px] rounded-full"></div>
      <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-emerald-600/20 blur-[120px] rounded-full"></div>

      <div className="w-full max-w-md bg-white rounded-[2.5rem] shadow-2xl overflow-hidden relative z-10 animate-in fade-in zoom-in duration-500">
        <div className="p-10 pb-6 text-center">
          <div className="bg-indigo-600 w-20 h-20 rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-2xl shadow-indigo-200 rotate-3">
            <Camera className="text-white -rotate-3" size={40} />
          </div>
          <h2 className="text-4xl font-black text-slate-900 tracking-tight mb-2">
            {isSignup ? 'Sign Up' : 'Welcome Back'}
          </h2>
          <p className="text-slate-500 font-medium">
            {isSignup ? 'Start managing your studio today' : 'Access your studio management tools'}
          </p>
        </div>

        <div className="px-10 pb-10 space-y-6">
          {error && (
            <div className="bg-rose-50 border border-rose-100 text-rose-600 px-4 py-4 rounded-2xl flex items-start gap-3 text-sm font-bold">
              <AlertCircle size={20} className="mt-0.5 flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* INSTANT ACCESS BUTTON */}
          {!isSignup && (
            <button 
              type="button"
              onClick={handleInstantAccess}
              className="w-full py-4 bg-emerald-500 text-white rounded-2xl font-black flex items-center justify-center gap-2 hover:bg-emerald-600 transition-all shadow-lg shadow-emerald-100 active:scale-[0.98] animate-pulse"
            >
              <Zap size={20} fill="currentColor" />
              <span>Instant Guest Access</span>
            </button>
          )}

          <div className="relative">
            <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-slate-100"></div></div>
            <div className="relative flex justify-center text-xs uppercase font-black tracking-widest text-slate-400"><span className="bg-white px-4">OR USE DATABASE</span></div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {!isSignup && (
              <button 
                type="button"
                onClick={handleDemoCredentials}
                className="w-full py-2.5 px-4 bg-indigo-50 text-indigo-700 border border-indigo-100 rounded-xl text-[10px] font-black uppercase tracking-[0.2em] flex items-center justify-center gap-2 hover:bg-indigo-100 transition-colors"
              >
                <Sparkles size={14} />
                Load Demo Credentials
              </button>
            )}

            <div className="space-y-1">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-2">Username</label>
              <div className="relative">
                <User className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" size={20} />
                <input 
                  type="text" 
                  required
                  className="w-full pl-12 pr-4 py-4 bg-slate-50 border border-slate-100 rounded-2xl focus:ring-2 focus:ring-indigo-500 focus:bg-white outline-none transition-all font-bold text-slate-800"
                  placeholder="admin"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                />
              </div>
            </div>

            {isSignup && (
              <div className="space-y-1 animate-in slide-in-from-top-2 duration-300">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-2">Email Address</label>
                <div className="relative">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" size={20} />
                  <input 
                    type="email" 
                    required
                    className="w-full pl-12 pr-4 py-4 bg-slate-50 border border-slate-100 rounded-2xl focus:ring-2 focus:ring-indigo-500 focus:bg-white outline-none transition-all font-bold text-slate-800"
                    placeholder="admin@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                </div>
              </div>
            )}

            <div className="space-y-1">
              <div className="flex justify-between items-center ml-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Password</label>
                {!isSignup && (
                  <button 
                    type="button"
                    onClick={() => setShowForgotModal(true)}
                    className="text-[10px] font-black text-indigo-600 hover:text-indigo-700 uppercase tracking-widest"
                  >
                    Forgot?
                  </button>
                )}
              </div>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" size={20} />
                <input 
                  type="password" 
                  required
                  className="w-full pl-12 pr-4 py-4 bg-slate-50 border border-slate-100 rounded-2xl focus:ring-2 focus:ring-indigo-500 focus:bg-white outline-none transition-all font-bold text-slate-800"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </div>
            </div>

            <button 
              type="submit"
              disabled={isLoading}
              className="w-full py-4 bg-slate-900 text-white rounded-2xl font-black flex items-center justify-center gap-2 hover:bg-slate-800 transition-all shadow-xl active:scale-[0.98] disabled:opacity-50"
            >
              {isLoading ? <Loader2 size={24} className="animate-spin" /> : (
                <>
                  <span>{isSignup ? 'Create Studio Account' : 'Sign In to Dashboard'}</span>
                  <ArrowRight size={20} />
                </>
              )}
            </button>
          </form>

          <div className="text-center">
            <button 
              type="button"
              onClick={() => {
                setIsSignup(!isSignup);
                setError('');
              }}
              className="text-xs font-black text-indigo-600 hover:underline uppercase tracking-widest"
            >
              {isSignup ? 'Already have an account? Login' : "Don't have an account? Sign Up"}
            </button>
          </div>
        </div>
      </div>

      {showForgotModal && (
        <ForgotPasswordModal onClose={() => setShowForgotModal(false)} />
      )}
    </div>
  );
};

export default Login;
