import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { User, Lock, ArrowRight, Sparkles, Sprout, CheckCircle, AlertCircle } from 'lucide-react';

const API_BASE = import.meta.env.DEV ? 'http://localhost:5000/api' : 'https://connect-together-vpa6.onrender.com/api';

function Register({ onRegister }) {
  const [authMode, setAuthMode] = useState('login'); // 'login' | 'signup' | 'guest'
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  // Real-time username availability check states (only for 'signup' mode)
  const [usernameAvailable, setUsernameAvailable] = useState(null);
  const [checkingUsername, setCheckingUsername] = useState(false);
  const [visitorCount, setVisitorCount] = useState(null);

  // Log visit and fetch total visitor count on mount
  useEffect(() => {
    const recordVisit = async () => {
      try {
        const response = await fetch(`${API_BASE}/visitors/visit`, {
          method: 'POST',
        });
        const data = await response.json();
        if (response.ok && data.success) {
          setVisitorCount(data.count);
        }
      } catch (err) {
        console.error('Failed to log visit:', err);
      }
    };
    recordVisit();
  }, []);

  // Debounced check for username availability during signup
  useEffect(() => {
    if (authMode !== 'signup' || !username.trim() || username.trim().length < 3) {
      setUsernameAvailable(null);
      return;
    }

    const checkAvailability = async () => {
      setCheckingUsername(true);
      try {
        const response = await fetch(
          `${API_BASE}/users/check-username/${encodeURIComponent(username.trim())}`
        );
        const data = await response.json();
        if (response.ok && data.success) {
          setUsernameAvailable(data.available);
        } else {
          setUsernameAvailable(null);
        }
      } catch (err) {
        setUsernameAvailable(null);
      } finally {
        setCheckingUsername(false);
      }
    };

    const delayDebounce = setTimeout(checkAvailability, 400);

    return () => clearTimeout(delayDebounce);
  }, [username, authMode]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    const trimmedUsername = username.trim();
    if (!trimmedUsername) {
      setError('Username is required');
      return;
    }
    if (trimmedUsername.length < 3) {
      setError('Username must be at least 3 characters');
      return;
    }

    // Passwords are not required for guest logins
    if (authMode !== 'guest') {
      if (!password) {
        setError('Password is required');
        return;
      }
      if (password.length < 6) {
        setError('Password must be at least 6 characters');
        return;
      }
    }

    // In sign-up mode, username must be available
    if (authMode === 'signup' && usernameAvailable === false) {
      setError('Username is already taken');
      return;
    }

    setLoading(true);

    try {
      let endpoint;
      let payload = { username: trimmedUsername };

      if (authMode === 'login') {
        endpoint = `${API_BASE}/users/login`;
        payload.password = password;
      } else if (authMode === 'signup') {
        endpoint = `${API_BASE}/users/register`;
        payload.password = password;
        payload.isGuest = false;
      } else {
        // Guest mode registration
        endpoint = `${API_BASE}/users/register`;
        payload.isGuest = true;
      }

      const response = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await response.json();

      if (response.ok && data.success) {
        onRegister(data.data);
      } else {
        setError(data.error || 'Authentication failed');
      }
    } catch (err) {
      setError('Could not connect to server. Ensure the backend is running.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-[#eef5f3] px-4 relative overflow-hidden font-sans">
      {/* Decorative Gradients / Ambient Glowing Lights */}
      <div className="absolute top-1/4 left-1/4 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-[#ca9428]/5 rounded-full blur-[100px] pointer-events-none animate-pulse" style={{ animationDuration: '8s' }} />
      <div className="absolute bottom-1/4 right-1/4 translate-x-1/2 translate-y-1/2 w-[500px] h-[500px] bg-[#2d4a43]/5 rounded-full blur-[100px] pointer-events-none animate-pulse" style={{ animationDuration: '10s' }} />

      <div className="w-full max-w-md z-10 animate-fade-in">
        {/* Header/Logo */}
        <div className="text-center mb-8 flex flex-col items-center">
          <div className="p-3.5 bg-gradient-to-br from-brand-orange to-brand-yellow rounded-2xl text-white shadow-lg inline-block mb-4 animate-pulse shadow-brand-orange/10" style={{ animationDuration: '4s' }}>
            <Sprout size={28} className="stroke-[2.5]" />
          </div>
          <h1 className="text-4xl font-extrabold tracking-tight text-[#2d4a43] mb-2">
            Grow <span className="bg-gradient-to-r from-brand-orange to-brand-yellow bg-clip-text text-transparent font-extrabold">Together</span>
          </h1>
          <p className="text-sm text-[#6b7280] max-w-xs mx-auto">
            A collaborative workspace and task sync engine designed for pairs.
          </p>
        </div>

        {/* Auth Card */}
        <div className="premium-card p-8 bg-white border border-[#e2eae7] relative overflow-hidden">
          <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-[#e2eae7] to-transparent" />

          {/* Sign In / Sign Up / Guest Selector Tabs */}
          <div className="flex border-b border-[#e2eae7] mb-6">
            <button
              type="button"
              onClick={() => {
                setAuthMode('login');
                setError('');
              }}
              className={`flex-1 pb-3 text-xs font-bold border-b-2 transition-all cursor-pointer ${
                authMode === 'login'
                  ? 'border-brand-orange text-[#ca9428] font-extrabold'
                  : 'border-transparent text-[#6b7280] hover:text-[#2d4a43]'
              }`}
            >
              Sign In
            </button>
            <button
              type="button"
              onClick={() => {
                setAuthMode('signup');
                setError('');
              }}
              className={`flex-1 pb-3 text-xs font-bold border-b-2 transition-all cursor-pointer ${
                authMode === 'signup'
                  ? 'border-brand-orange text-[#ca9428] font-extrabold'
                  : 'border-transparent text-[#6b7280] hover:text-[#2d4a43]'
              }`}
            >
              Create Account
            </button>
            <button
              type="button"
              onClick={() => {
                setAuthMode('guest');
                setError('');
              }}
              className={`flex-1 pb-3 text-xs font-bold border-b-2 transition-all cursor-pointer ${
                authMode === 'guest'
                  ? 'border-brand-orange text-[#ca9428] font-extrabold'
                  : 'border-transparent text-[#6b7280] hover:text-[#2d4a43]'
              }`}
            >
              Use as Guest
            </button>
          </div>

          <h2 className="text-xl font-bold text-[#2d4a43] mb-1">
            {authMode === 'login' ? 'Welcome Back' : authMode === 'signup' ? 'Get Started' : 'Temporary Guest Access'}
          </h2>
          <p className="text-xs text-[#6b7280] mb-6">
            {authMode === 'login'
              ? 'Sign in to access your sync rooms.'
              : authMode === 'signup'
              ? 'Create an account to join or host collaborative rooms.'
              : 'No account needed. Enter a nickname to start using the workspace temporarily.'}
          </p>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Username */}
            <div>
              <label htmlFor="username" className="block text-xs font-semibold text-[#6b7280] uppercase tracking-wider mb-2">
                {authMode === 'guest' ? 'Guest Nickname' : 'Username'}
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-[#6b7280]/60">
                  <User size={16} />
                </div>
                <input
                  id="username"
                  type="text"
                  placeholder={authMode === 'guest' ? 'e.g., GuestUser' : 'e.g., alex_dev'}
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="premium-input block w-full pl-11 pr-4 py-3 text-sm"
                  disabled={loading}
                />
              </div>

              {/* Username Availability Checkpoint */}
              {authMode === 'signup' && username.trim().length >= 3 && (
                <div className="mt-2 text-xs flex items-center gap-1.5 font-medium">
                  {checkingUsername ? (
                    <span className="text-[#6b7280] animate-pulse">Checking availability...</span>
                  ) : usernameAvailable === true ? (
                    <span className="text-emerald-600 flex items-center gap-1">
                      <CheckCircle size={12} className="stroke-[2.5]" /> Username is available
                    </span>
                  ) : usernameAvailable === false ? (
                    <span className="text-[#ca9428] flex items-center gap-1">
                      <AlertCircle size={12} className="stroke-[2.5]" /> Username is already taken
                    </span>
                  ) : null}
                </div>
              )}
            </div>

            {/* Password (hidden for Guest Mode) */}
            {authMode !== 'guest' && (
              <div>
                <label htmlFor="password" className="block text-xs font-semibold text-[#6b7280] uppercase tracking-wider mb-2">
                  Password
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-[#6b7280]/60">
                    <Lock size={16} />
                  </div>
                  <input
                    id="password"
                    type="password"
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="premium-input block w-full pl-11 pr-4 py-3 text-sm"
                    disabled={loading}
                  />
                </div>
              </div>
            )}

            {error && (
              <div className="text-xs text-red-600 flex items-center gap-1.5 font-semibold bg-red-50 border border-red-100 p-3 rounded-xl animate-fade-in">
                <AlertCircle size={14} className="stroke-[2.5] flex-shrink-0" />
                <span>{error}</span>
              </div>
            )}

            <button
              type="submit"
              disabled={loading || (authMode === 'signup' && usernameAvailable === false)}
              className="w-full flex items-center justify-center gap-2 py-3 px-4 bg-[#2d4a43] hover:bg-[#2d4a43]/90 text-white font-extrabold rounded-xl active:scale-[0.98] transition-all disabled:opacity-50 disabled:pointer-events-none text-sm cursor-pointer shadow-lg shadow-[#2d4a43]/10"
            >
              {loading ? (
                <div className="h-5 w-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <>
                  {authMode === 'login'
                    ? 'Sign In & Enter Dashboard'
                    : authMode === 'signup'
                    ? 'Create Account & Enter Dashboard'
                    : 'Enter Workspace as Guest'}{' '}
                  <ArrowRight size={16} className="stroke-[2.5]" />
                </>
              )}
            </button>
          </form>
        </div>

        {/* About Link & Visitor Count */}
        <div className="text-center mt-8 flex flex-col items-center gap-4">
          <Link
            to="/about"
            className="animate-floating-glow flex items-center gap-2 px-5 py-2.5 rounded-full bg-white border border-[#e2eae7] hover:border-brand-orange/30 text-[10px] sm:text-xs font-bold text-[#2d4a43] hover:text-brand-orange transition-all shadow-md cursor-pointer tracking-wider uppercase backdrop-blur-md"
          >
            <Sparkles size={12} className="text-brand-orange animate-pulse" />
            About Project & Developer
          </Link>

          {visitorCount !== null && (
            <div className="flex items-center gap-2 text-[10px] sm:text-xs font-medium text-[#6b7280] bg-white border border-[#e2eae7] px-4 py-1.5 rounded-full shadow-sm">
              <span className="h-1.5 w-1.5 rounded-full bg-green-500 animate-pulse" />
              <span className="text-[#2d4a43] font-bold">{visitorCount}</span> People use this app
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default Register;
