import React, { useState, useEffect } from 'react';
import { HashRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import About from './pages/About';

const API_BASE = import.meta.env.DEV ? 'http://localhost:5000/api' : 'https://connect-together-vpa6.onrender.com/api';

function App() {
  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem('todo_user');
    return saved ? JSON.parse(saved) : null;
  });

  useEffect(() => {
    if (user) {
      localStorage.setItem('todo_user', JSON.stringify(user));
    } else {
      localStorage.removeItem('todo_user');
    }
  }, [user]);

  const handleLogout = async () => {
    if (user && user.isGuest) {
      try {
        await fetch(`${API_BASE}/users/guest/${user._id}`, {
          method: 'DELETE',
        });
      } catch (err) {
        console.error('Failed to clean up guest data', err);
      }
    }
    setUser(null);
  };

  return (
    <HashRouter>
      <div className="min-h-screen bg-gradient-to-br from-[#fcecef] via-[#f7f3f6] to-[#eff2f6] text-[#1f2937] font-sans antialiased selection:bg-brand-orange/20 selection:text-brand-orange">
        <Routes>
          <Route
            path="/"
            element={user ? <Navigate to="/dashboard" replace /> : <Register onRegister={setUser} />}
          />
          <Route
            path="/dashboard"
            element={user ? <Dashboard user={user} onLogout={handleLogout} /> : <Navigate to="/" replace />}
          />
          <Route
            path="/room/:roomCode"
            element={user ? <Dashboard user={user} onLogout={handleLogout} /> : <Navigate to="/" replace />}
          />
          <Route path="/about" element={<About />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
        <Toaster 
          position="top-right" 
          toastOptions={{
            style: {
              background: 'rgba(255, 255, 255, 0.9)',
              backdropFilter: 'blur(8px)',
              color: '#1f2937',
              border: '1px solid rgba(0, 0, 0, 0.05)',
              borderRadius: '16px',
              fontSize: '13px',
              fontWeight: '600',
              fontFamily: 'Outfit, sans-serif',
              boxShadow: '0 10px 30px rgba(0, 0, 0, 0.05)',
            },
            success: {
              iconTheme: {
                primary: '#10b981',
                secondary: '#ffffff',
              },
            },
            error: {
              iconTheme: {
                primary: '#ff527b',
                secondary: '#ffffff',
              },
            },
          }}
        />
      </div>
    </HashRouter>
  );
}

export default App;
