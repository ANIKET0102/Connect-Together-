import React, { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import Register from './pages/Register';
import Lobby from './pages/Lobby';
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
    <BrowserRouter>
      <div className="min-h-screen bg-[#0b0c0e] text-white font-sans antialiased selection:bg-brand-orange/30 selection:text-white">
        <Routes>
          <Route
            path="/"
            element={user ? <Navigate to="/lobby" replace /> : <Register onRegister={setUser} />}
          />
          <Route
            path="/lobby"
            element={user ? <Lobby user={user} onLogout={handleLogout} /> : <Navigate to="/" replace />}
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
              background: '#161719',
              color: '#ffffff',
              border: '1px solid rgba(255, 255, 255, 0.05)',
              borderRadius: '16px',
              fontSize: '13px',
              fontWeight: '600',
              fontFamily: 'Outfit, sans-serif',
            },
            success: {
              iconTheme: {
                primary: '#10b981',
                secondary: '#0b0c0e',
              },
            },
            error: {
              iconTheme: {
                primary: '#ff5a1f',
                secondary: '#0b0c0e',
              },
            },
          }}
        />
      </div>
    </BrowserRouter>
  );
}

export default App;
