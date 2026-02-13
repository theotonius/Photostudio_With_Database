
import React, { useState } from 'react';
import { Camera, Lock, User, AlertCircle, ArrowRight, Loader2 } from 'lucide-react';
import { initializeApp } from 'firebase/app';
import { getAuth, signInWithEmailAndPassword, createUserWithEmailAndPassword } from 'firebase/auth';

const Login: React.FC<{ onLogin: () => void }> = ({ onLogin }) => {
  const [isSignup, setIsSignup] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const app = initializeApp((window as any).firebaseConfig);
  const auth = getAuth(app);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      if (isSignup) {
        await createUserWithEmailAndPassword(auth, email, password);
        alert('Account created! Now you can login.');
        setIsSignup(false);
      } else {
        await signInWithEmailAndPassword(auth, email, password);
        localStorage.setItem('photo_studio_auth', 'true');
        onLogin();
      }
    } catch (err: any) {
      setError(err.message || 'Authentication failed.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center p-4 overflow-hidden relative">
      <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-indigo-600/20 blur-[120px] rounded-full"></div>
      <div className="w-full max-w-md bg-white rounded-[2.5rem] shadow-2xl overflow-hidden z-10 p-10">
        <div className="text-center mb-10">
          <div className="bg-indigo-600 w-20 h-20 rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-2xl rotate-3">
            <Camera className="text-white -rotate-3" size={40} />
          </div>
          <h2 className="text-4xl font-black text-slate-900 tracking-tight">{isSignup ? 'Sign Up' : 'Studio Pro'}</h2>
          <p className="text-slate-500 font-medium">{isSignup ? 'Create your studio account' : 'Welcome back to your dashboard'}</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {error && <div className="bg-rose-50 border border-rose-100 text-rose-600 p-4 rounded-2xl flex items-start gap-3 text-sm font-bold"><AlertCircle size={20} /> <span>{error}</span></div>}
          
          <div className="space-y-1">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-2">Email Address</label>
            <div className="relative">
              <User className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" size={20} />
              <input type="email" required className="w-full pl-12 pr-4 py-4 bg-slate-50 border border-slate-100 rounded-2xl focus:ring-2 focus:ring-indigo-500 outline-none font-bold" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="admin@example.com" />
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-2">Password</label>
            <div className="relative">
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" size={20} />
              <input type="password" required className="w-full pl-12 pr-4 py-4 bg-slate-50 border border-slate-100 rounded-2xl focus:ring-2 focus:ring-indigo-500 outline-none font-bold" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••••••" />
            </div>
          </div>

          <button type="submit" disabled={isLoading} className="w-full py-4 bg-slate-900 text-white rounded-2xl font-black flex items-center justify-center gap-2 hover:bg-slate-800 transition-all shadow-xl">
            {isLoading ? <Loader2 className="animate-spin" /> : (isSignup ? 'Create Account' : 'Sign In')}
            {!isLoading && <ArrowRight size={20} />}
          </button>
        </form>

        <button onClick={() => setIsSignup(!isSignup)} className="w-full mt-6 text-xs font-black text-indigo-600 hover:underline uppercase tracking-widest">
          {isSignup ? 'Already have an account? Login' : "Don't have an account? Sign Up"}
        </button>
      </div>
    </div>
  );
};

export default Login;
