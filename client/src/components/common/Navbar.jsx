import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext.jsx';
import {
  Compass,
  GitBranch,
  Terminal,
  AlertCircle,
  Menu,
  X,
  Sparkles,
  Github,
  LogIn,
  LogOut,
  UserPlus,
} from 'lucide-react';

export function Navbar() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { user, isAuthenticated, logout } = useAuth();
  const initials = (user?.name || user?.email || '?').split(' ').map((p) => p[0]).join('').slice(0, 2).toUpperCase();
  const handleLogout = () => {
    logout();
    setMobileMenuOpen(false);
    navigate('/login');
  };

  const navLinks = [
    { name: 'Analyze', path: '/analyze', icon: Compass },
    { name: 'Git Reference', path: '/git', icon: Terminal },
    { name: 'Git Error Helper', path: '/git/errors', icon: AlertCircle },
  ];

  const isActive = (path) => {
    if (path === '/analyze') {
      return location.pathname === '/analyze' || location.pathname.startsWith('/repository');
    }
    return location.pathname === path;
  };

  return (
    <nav className="sticky top-0 z-40 bg-dark-950/80 backdrop-blur-lg border-b border-dark-800/80">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Brand Logo */}
          <Link to="/" className="flex items-center gap-2.5 group">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-brand-600 to-emerald-400 p-0.5 shadow-lg shadow-brand-500/20 group-hover:scale-105 transition-transform">
              <div className="w-full h-full bg-dark-950 rounded-[10px] flex items-center justify-center">
                <GitBranch className="w-5 h-5 text-brand-400" />
              </div>
            </div>
            <div>
              <span className="text-base font-bold text-slate-100 tracking-tight flex items-center gap-1.5">
                GitHub Buddy
                <span className="text-[10px] font-mono uppercase px-1.5 py-0.5 rounded bg-brand-500/10 text-brand-400 border border-brand-500/30">
                  MVP
                </span>
              </span>
              <p className="text-[10px] text-slate-400 hidden sm:block">Understand repositories visually</p>
            </div>
          </Link>

          {/* Desktop Nav Links */}
          <div className="hidden md:flex items-center gap-1">
            {navLinks.map((link) => {
              const Icon = link.icon;
              const active = isActive(link.path);
              return (
                <Link
                  key={link.path}
                  to={link.path}
                  className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-sm font-medium transition-colors ${
                    active
                      ? 'bg-brand-500/10 text-brand-400 border border-brand-500/20'
                      : 'text-slate-300 hover:text-slate-100 hover:bg-dark-800'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  {link.name}
                </Link>
              );
            })}
          </div>

          {/* Desktop Right Actions */}
          <div className="hidden md:flex items-center gap-3">
            {isAuthenticated ? (
              <div className="flex items-center gap-2">
                <div className="flex items-center gap-2 pl-1 pr-3 py-1 rounded-full bg-dark-900 border border-dark-800" title={user.email}>
                  <span className="w-7 h-7 rounded-full bg-brand-500/20 text-brand-300 text-[11px] font-bold flex items-center justify-center">{initials}</span>
                  <span className="text-xs text-slate-200 font-medium max-w-[110px] truncate">{user.name}</span>
                </div>
                <button onClick={handleLogout} title="Log out" aria-label="Log out" className="p-2 text-slate-400 hover:text-rose-300 rounded-lg hover:bg-dark-800 transition-colors">
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-1.5">
                <Link to="/login" className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium text-slate-300 hover:text-slate-100 hover:bg-dark-800 transition-colors">
                  <LogIn className="w-4 h-4" />
                  Log in
                </Link>
                <Link to="/register" className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium text-brand-400 border border-brand-500/30 hover:bg-brand-500/10 transition-colors">
                  <UserPlus className="w-4 h-4" />
                  Sign up
                </Link>
              </div>
            )}
            <Link
              to="/analyze"
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-brand-500 hover:bg-brand-400 text-dark-950 font-semibold text-sm transition-all shadow-lg shadow-brand-500/20 hover:scale-[1.02] active:scale-[0.98]"
            >
              <Sparkles className="w-4 h-4 text-dark-950" />
              Analyze Repo
            </Link>
            <a
              href="https://github.com"
              target="_blank"
              rel="noreferrer"
              aria-label="GitHub"
              className="p-2 text-slate-400 hover:text-slate-200 rounded-lg hover:bg-dark-800 transition-colors"
            >
              <Github className="w-5 h-5" />
            </a>
          </div>

          {/* Mobile Hamburger Button (Touch friendly >= 44px) */}
          <div className="md:hidden flex items-center">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2.5 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-dark-800 focus:outline-none"
              aria-label="Toggle Navigation Menu"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden border-b border-dark-800 bg-dark-950/95 backdrop-blur-xl px-4 pt-3 pb-5 space-y-2">
          {navLinks.map((link) => {
            const Icon = link.icon;
            const active = isActive(link.path);
            return (
              <Link
                key={link.path}
                to={link.path}
                onClick={() => setMobileMenuOpen(false)}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl text-base font-medium transition-colors ${
                  active
                    ? 'bg-brand-500/15 text-brand-400 border border-brand-500/30'
                    : 'text-slate-300 hover:bg-dark-900'
                }`}
              >
                <Icon className="w-5 h-5" />
                {link.name}
              </Link>
            );
          })}

          <div className="pt-2 border-t border-dark-800 mt-2">
            {isAuthenticated ? (
              <div className="flex items-center justify-between px-4 py-3">
                <div className="flex items-center gap-3 min-w-0">
                  <span className="w-9 h-9 rounded-full bg-brand-500/20 text-brand-300 text-xs font-bold flex items-center justify-center shrink-0">{initials}</span>
                  <div className="min-w-0">
                    <p className="text-sm text-slate-100 font-medium truncate">{user.name}</p>
                    <p className="text-xs text-slate-500 truncate">{user.email}</p>
                  </div>
                </div>
                <button onClick={handleLogout} className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm text-rose-300 hover:bg-dark-900">
                  <LogOut className="w-4 h-4" /> Log out
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-2">
                <Link to="/login" onClick={() => setMobileMenuOpen(false)} className="flex items-center justify-center gap-2 py-3 rounded-xl text-slate-200 bg-dark-900 border border-dark-800 text-base font-medium">
                  <LogIn className="w-5 h-5" /> Log in
                </Link>
                <Link to="/register" onClick={() => setMobileMenuOpen(false)} className="flex items-center justify-center gap-2 py-3 rounded-xl text-brand-400 border border-brand-500/30 text-base font-medium">
                  <UserPlus className="w-5 h-5" /> Sign up
                </Link>
              </div>
            )}
          </div>

          <div className="pt-2">
            <Link
              to="/analyze"
              onClick={() => setMobileMenuOpen(false)}
              className="flex items-center justify-center gap-2 w-full py-3 rounded-xl bg-brand-500 text-dark-950 font-semibold text-base shadow-lg shadow-brand-500/20"
            >
              <Sparkles className="w-5 h-5" />
              Analyze Repository
            </Link>
          </div>
        </div>
      )}
    </nav>
  );
}

export default Navbar;
