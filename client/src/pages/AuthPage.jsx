import React, { useState } from 'react';
import { Link, useNavigate, useLocation, Navigate } from 'react-router-dom';
import { GitBranch, Mail, Lock, User, Eye, EyeOff, Loader2, AlertCircle, LogIn, UserPlus } from 'lucide-react';
import { useAuth } from '../context/AuthContext.jsx';

const inputClass =
  'w-full pl-10 pr-4 py-3 bg-dark-950 border border-dark-700 rounded-xl text-slate-100 text-sm placeholder:text-slate-500 focus:outline-none focus:border-brand-500 transition-colors';

function Field({ icon: Icon, label, children }) {
  return (
    <label className="block">
      <span className="text-xs font-medium text-slate-300 mb-1.5 block">{label}</span>
      <div className="relative">
        <Icon className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
        {children}
      </div>
    </label>
  );
}

/**
 * Shared Login / Registration page.
 * mode = "login" | "register"
 */
export function AuthPage({ mode = 'login' }) {
  const isRegister = mode === 'register';
  const { login, register, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const redirectTo = location.state?.from || '/analyze';

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  if (isAuthenticated) return <Navigate to={redirectTo} replace />;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (isRegister) {
      if (name.trim().length < 2) return setError('Please enter your name.');
      if (password.length < 6) return setError('Password must be at least 6 characters long.');
      if (password !== confirm) return setError('Passwords do not match.');
    }
    setSubmitting(true);
    try {
      if (isRegister) await register(name, email, password);
      else await login(email, password);
      navigate(redirectTo, { replace: true });
    } catch (err) {
      setError(err?.message || 'Something went wrong. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="w-14 h-14 mx-auto rounded-2xl bg-gradient-to-tr from-brand-600 to-emerald-400 p-0.5 shadow-lg shadow-brand-500/20">
            <div className="w-full h-full bg-dark-950 rounded-[14px] flex items-center justify-center">
              <GitBranch className="w-7 h-7 text-brand-400" />
            </div>
          </div>
          <h1 className="text-2xl font-bold text-slate-100 mt-4 tracking-tight">
            {isRegister ? 'Create your GitHub Buddy account' : 'Welcome back'}
          </h1>
          <p className="text-sm text-slate-400 mt-1.5">
            {isRegister
              ? 'Sign up to start learning Git and understanding repositories.'
              : 'Log in to continue to GitHub Buddy.'}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="bg-dark-900 border border-dark-800 rounded-2xl p-6 space-y-4 shadow-xl" noValidate>
          {error && (
            <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-start gap-2" role="alert">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          {isRegister && (
            <Field icon={User} label="Full name">
              <input type="text" value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. Aachal Dalal" autoComplete="name" className={inputClass} required />
            </Field>
          )}

          <Field icon={Mail} label="Email">
            <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@example.com" autoComplete="email" className={inputClass} required />
          </Field>

          <Field icon={Lock} label="Password">
            <input
              type={showPassword ? 'text' : 'password'}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder={isRegister ? 'At least 6 characters' : 'Your password'}
              autoComplete={isRegister ? 'new-password' : 'current-password'}
              className={`${inputClass} pr-11`}
              required
            />
            <button
              type="button"
              onClick={() => setShowPassword((s) => !s)}
              className="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 text-slate-500 hover:text-slate-300"
              aria-label={showPassword ? 'Hide password' : 'Show password'}
            >
              {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </Field>

          {isRegister && (
            <Field icon={Lock} label="Confirm password">
              <input type={showPassword ? 'text' : 'password'} value={confirm} onChange={(e) => setConfirm(e.target.value)} placeholder="Re-enter password" autoComplete="new-password" className={inputClass} required />
            </Field>
          )}

          <button
            type="submit"
            disabled={submitting}
            className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-brand-500 hover:bg-brand-400 text-dark-950 font-semibold text-sm transition-all shadow-lg shadow-brand-500/20 disabled:opacity-60"
          >
            {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : isRegister ? <UserPlus className="w-4 h-4" /> : <LogIn className="w-4 h-4" />}
            {submitting ? 'Please wait…' : isRegister ? 'Create account' : 'Log in'}
          </button>

          <p className="text-center text-xs text-slate-400 pt-1">
            {isRegister ? 'Already have an account? ' : "Don't have an account? "}
            <Link to={isRegister ? '/login' : '/register'} state={location.state} className="text-brand-400 hover:text-brand-300 font-semibold">
              {isRegister ? 'Log in' : 'Sign up'}
            </Link>
          </p>
        </form>
      </div>
    </div>
  );
}

export default AuthPage;
