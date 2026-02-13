
import React, { useState } from 'react';
import { Camera, Lock, User, AlertCircle, ArrowRight, Mail, Loader2, Sparkles, Cloud } from 'lucide-react';
import { auth, signInWithEmailAndPassword, createUserWithEmailAndPassword } from '../firebase.ts';
import ForgotPasswordModal from './ForgotPasswordModal';

interface LoginProps {
  onLogin: (userData: any) => void;
}

const Login: React.FC<LoginProps> = ({ onLogin }) => {
  const [isSignup, setIsSignup] = useState(false);
  const [authMode, setAuthMode] = useState<'sql' | 'firebase'>('sql');
  const [username, setUsername] = useState(''); // Use as Email for Firebase
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showForgotModal, setShowForgotModal] = useState(false);

  const handleDemoCredentials = () => {
    setIsSignup(false);
    setAuthMode('sql');
    setUsername('admin');
    setPassword('password123');
    setError('');
  };

  const handleFirebaseSubmit = async () => {
    try {
      if (isSignup) {
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        alert('Firebase account created! You can now log in.');
        setIsSignup(false);
      } else {
        const userCredential = await signInWithEmailAndPassword(auth, username, password);
        const user = { 
          username: userCredential.user.email?.split('@')[0] || 'User', 
          email: userCredential.user.email,
          mode: 'firebase'
        };
        localStorage.setItem('photo_studio_auth', 'true');
        localStorage.setItem('photo_studio_user', JSON.stringify(user));
        localStorage.setItem('studio_storage_mode', 'firebase');
        onLogin(user);
      }
    } catch (err: any) {
      let msg = 'Firebase Auth failed.';
      if (err.code === 'auth/user-not-found') msg = 'User not found.';
      else if (err.code === 'auth/wrong-password') msg = 'Incorrect password.';
      else if (err.code === 'auth/email-already-in-use') msg = 'Email already exists.';
      else msg = err.message;
      setError(msg);
    }
  };

  const handleSqlSubmit = async () => {
    const endpoint = isSignup ? 'api.php?type=auth&action=signup' : 'api.php?type=auth&action=login';
    const body = isSignup ? { username, email, password } : { username, password };

    const response = await fetch(endpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body)
    });

    const text = await response.text();
    let data;
    try {
      data = JSON.parse(text);
    } catch (e) {
      throw new Error('Server returned an invalid response. Ensure SQL server is running.');
    }

    if (response.ok) {
      if (isSignup) {
        alert(data.message || 'SQL account created! Please login.');
        setIsSignup(false);
      } else {
        localStorage.setItem('photo_studio_auth', 'true');
        localStorage.setItem('photo_studio_user', JSON.stringify(data.user));
        localStorage.setItem('studio_storage_mode', 'sql');
        onLogin(data.user);
      }
    } else {
      setError(data.message || 'Authentication failed.');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      if (authMode === 'firebase') {
        await handleFirebaseSubmit();
      } else {
        await handleSqlSubmit();
      }
    } catch (err: any) {
      setError(err.message || 'Login failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center p-4 relative overflow-hidden">
      <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-indigo-600/20 blur-[120px] rounded-full"></div>
      <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-emerald-600/20 blur-[120px] rounded-full"></div>

      <div className="w-full max-w-md bg-white rounded-[2.5rem] shadow-2xl overflow-hidden relative z-10 animate-in fade-in zoom-in duration-500">
        <div className="p-10 pb-6 text-center">
          <div className="bg-indigo-600 w-20 h-20 rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-2xl shadow-indigo-200 rotate-3">
            <Camera className="text-white -rotate-3" size={40} />
          </div>
          <h2 className="text-4xl font-black text-slate-900 tracking-tight mb-2">
            {isSignup ? 'Create Account' : 'Studio Login'}
          </h2>
          
          <div className="flex bg-slate-100 p-1 rounded-xl mt-6 border border-slate-200">
            <button 
              onClick={() => {setAuthMode('sql'); setError('');}} 
              className={`flex-1 py-2 text-[10px] font-black uppercase tracking-widest rounded-lg transition-all ${authMode === 'sql' ? 'bg-white shadow-sm text-slate-900' : 'text-slate-400 hover:text-slate-600'}`}
            >
              SQL Server
            </button>
            <button 
              onClick={() => {setAuthMode('firebase'); setError('');}} 
              className={`flex-1 py-2 text-[10px] font-black uppercase tracking-widest rounded-lg transition-all ${authMode === 'firebase' ? 'bg-indigo-600 shadow-sm text-white' : 'text-slate-400 hover:text-slate-600'}`}
            >
              Firebase Cloud
            </button>
          </div>
        </div>

        <div className="px-10 pb-10 space-y-6">
          {error && (
            <div className="bg-rose-50 border border-rose-100 text-rose-600 px-4 py-4 rounded-2xl flex items-start gap-3 text-sm font-bold">
              <AlertCircle size={20} className="mt-0.5 flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {!isSignup && authMode === 'sql' && (
              <button type="button" onClick={handleDemoCredentials} className="w-full py-2.5 px-4 bg-indigo-50 text-indigo-700 border border-indigo-100 rounded-xl text-[10px] font-black uppercase tracking-[0.2em] flex items-center justify-center gap-2">
                <Sparkles size={14} /> Load SQL Demo
              </button>
            )}

            <div className="space-y-1">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-2">
                {authMode === 'firebase' ? 'Email Address' : 'Username'}
              </label>
              <div className="relative">
                {authMode === 'firebase' ? <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" size={20} /> : <User className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" size={20} />}
                <input 
                  type={authMode === 'firebase' ? 'email' : 'text'} 
                  required
                  className="w-full pl-12 pr-4 py-4 bg-slate-50 border border-slate-100 rounded-2xl focus:ring-2 focus:ring-indigo-500 focus:bg-white outline-none font-bold text-slate-800"
                  placeholder={authMode === 'firebase' ? 'admin@studio.com' : 'admin'}
                  value={authMode === 'firebase' && !isSignup ? username : isSignup ? email : username}
                  onChange={(e) => authMode === 'firebase' && !isSignup ? setUsername(e.target.value) : isSignup ? setEmail(e.target.value) : setUsername(e.target.value)}
                />
              </div>
            </div>

            {isSignup && authMode === 'sql' && (
              <div className="space-y-1">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-2">Email Address</label>
                <div className="relative">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" size={20} />
                  <input type="email" required className="w-full pl-12 pr-4 py-4 bg-slate-50 border border-slate-100 rounded-2xl focus:ring-2 focus:ring-indigo-500 outline-none font-bold text-slate-800" value={email} onChange={(e) => setEmail(e.target.value)} />
                </div>
              </div>
            )}

            <div className="space-y-1">
              <div className="flex justify-between items-center ml-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Password</label>
                {!isSignup && (
                  <button type="button" onClick={() => setShowForgotModal(true)} className="text-[10px] font-black text-indigo-600 uppercase tracking-widest">Forgot?</button>
                )}
              </div>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" size={20} />
                <input type="password" required className="w-full pl-12 pr-4 py-4 bg-slate-50 border border-slate-100 rounded-2xl focus:ring-2 focus:ring-indigo-500 outline-none font-bold text-slate-800" value={password} onChange={(e) => setPassword(e.target.value)} />
              </div>
            </div>

            <button type="submit" disabled={isLoading} className={`w-full py-4 rounded-2xl font-black flex items-center justify-center gap-2 transition-all shadow-xl disabled:opacity-50 ${authMode === 'firebase' ? 'bg-indigo-600 text-white' : 'bg-slate-900 text-white'}`}>
              {isLoading ? <Loader2 size={24} className="animate-spin" /> : (
                <>
                  <span>{isSignup ? 'Join Studio' : `Login via ${authMode.toUpperCase()}`}</span>
                  <ArrowRight size={20} />
                </>
              )}
            </button>
          </form>

          <div className="text-center">
            <button type="button" onClick={() => { setIsSignup(!isSignup); setError(''); }} className="text-xs font-black text-indigo-600 hover:underline uppercase tracking-widest">
              {isSignup ? 'Already have an account? Login' : "Don't have an account? Sign Up"}
            </button>
          </div>
        </div>
      </div>

      {showForgotModal && <ForgotPasswordModal onClose={() => setShowForgotModal(false)} />}
    </div>
  );
};

export default Login;
