import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import { PlusCircle, LogIn, LogOut, KeyRound, Sprout } from 'lucide-react';

const API_BASE = 'http://localhost:5000/api';

function Lobby({ user, onLogout }) {
  const navigate = useNavigate();
  const [roomCode, setRoomCode] = useState('');
  const [joinError, setJoinError] = useState('');
  const [createError, setCreateError] = useState('');
  const [joining, setJoining] = useState(false);
  const [creating, setCreating] = useState(false);

  const handleCreateRoom = async () => {
    setCreateError('');
    setCreating(true);

    try {
      const response = await fetch(`${API_BASE}/rooms/create`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: user._id }),
      });

      const data = await response.json();

      if (response.ok && data.success) {
        toast.success('Room created successfully!');
        navigate(`/room/${data.data.roomCode}`);
      } else {
        const errMsg = data.error || 'Failed to create room';
        setCreateError(errMsg);
        toast.error(errMsg);
      }
    } catch (err) {
      const errMsg = 'Network error. Failed to create room.';
      setCreateError(errMsg);
      toast.error(errMsg);
    } finally {
      setCreating(false);
    }
  };

  const handleJoinRoom = async (e) => {
    e.preventDefault();
    if (!roomCode.trim()) {
      setJoinError('Please enter a room code');
      return;
    }
    if (roomCode.trim().length !== 6) {
      setJoinError('Room code must be exactly 6 digits');
      return;
    }

    setJoinError('');
    setJoining(true);

    try {
      const response = await fetch(`${API_BASE}/rooms/join`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          roomCode: roomCode.trim(),
          userId: user._id,
        }),
      });

      const data = await response.json();

      if (response.ok && data.success) {
        toast.success('Joined room successfully!');
        navigate(`/room/${data.data.roomCode}`);
      } else {
        const errMsg = data.error || 'Failed to join room';
        setJoinError(errMsg);
        toast.error(errMsg);
      }
    } catch (err) {
      const errMsg = 'Network error. Failed to join room.';
      setJoinError(errMsg);
      toast.error(errMsg);
    } finally {
      setJoining(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col justify-between bg-[#0b0c0e] px-4 py-8 relative overflow-hidden font-sans">
      {/* Decorative Glows */}
      <div className="absolute top-1/3 right-1/4 translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-brand-orange/5 rounded-full blur-[120px] pointer-events-none animate-pulse" style={{ animationDuration: '12s' }} />
      <div className="absolute bottom-1/3 left-1/4 -translate-x-1/2 translate-y-1/2 w-[600px] h-[600px] bg-brand-blue/5 rounded-full blur-[120px] pointer-events-none animate-pulse" style={{ animationDuration: '15s' }} />

      {/* Header */}
      <header className="w-full max-w-5xl mx-auto flex justify-between items-center z-10 py-2 border-b border-white/5">
        <div className="flex items-center gap-2">
          <span className="p-1.5 bg-gradient-to-br from-brand-orange to-brand-blue rounded-lg text-white">
            <Sprout size={16} className="stroke-[2.5]" />
          </span>
          <span className="text-xl font-bold tracking-tight text-white">
            Grow <span className="bg-gradient-to-r from-brand-orange to-brand-blue bg-clip-text text-transparent">Together</span>
          </span>
        </div>
        
        <button
          onClick={() => {
            onLogout();
            toast.success('Signed out.');
          }}
          className="flex items-center gap-2 text-xs font-bold text-text-muted hover:text-white transition-all bg-white/5 border border-white/10 hover:border-white/20 px-4 py-2 rounded-xl cursor-pointer"
        >
          <LogOut size={14} /> Sign Out ({user.username})
        </button>
      </header>

      {/* Main Content */}
      <main className="w-full max-w-4xl mx-auto my-auto py-12 z-10 animate-fade-in">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-extrabold text-white tracking-tight sm:text-4xl">
            Welcome back, <span className="bg-gradient-to-r from-brand-orange to-brand-blue bg-clip-text text-transparent">{user.username}</span>
          </h2>
          <p className="mt-3 text-text-muted text-sm sm:text-base max-w-lg mx-auto">
            Create a new collaborative workspace or enter a 6-digit room code to join your partner in real time.
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-8">
          {/* Create Room Card */}
          <div className="premium-card premium-card-glow-orange p-8 flex flex-col justify-between hover:border-brand-orange/30 transition-all duration-300 group relative">
            <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-brand-orange/10 to-transparent" />
            <div>
              <div className="w-12 h-12 bg-brand-orange/10 text-brand-orange rounded-2xl flex items-center justify-center mb-6 group-hover:scale-105 transition-all duration-300 border border-brand-orange/20">
                <PlusCircle size={22} className="stroke-[2.5]" />
              </div>
              <h3 className="text-lg font-bold text-white mb-2">Create Workspace</h3>
              <p className="text-text-muted text-xs leading-relaxed mb-8">
                Start a fresh, private collaborative workspace. This will generate a unique 6-character room code you can share with your partner.
              </p>
            </div>
            <div>
              {createError && <p className="text-xs text-brand-orange mb-4 font-semibold">{createError}</p>}
              <button
                onClick={handleCreateRoom}
                disabled={creating}
                className="w-full flex items-center justify-center gap-2 py-3 px-4 bg-brand-orange hover:bg-brand-orange/90 text-white font-bold rounded-xl active:scale-[0.98] transition-all disabled:opacity-50 text-sm cursor-pointer shadow-lg shadow-brand-orange/10"
              >
                {creating ? (
                  <div className="h-5 w-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  <>Create New Room</>
                )}
              </button>
            </div>
          </div>

          {/* Join Room Card */}
          <div className="premium-card premium-card-glow-blue p-8 flex flex-col justify-between hover:border-brand-blue/30 transition-all duration-300 group relative">
            <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-brand-blue/10 to-transparent" />
            <div>
              <div className="w-12 h-12 bg-brand-blue/10 text-brand-blue rounded-2xl flex items-center justify-center mb-6 group-hover:scale-105 transition-all duration-300 border border-brand-blue/20">
                <LogIn size={22} className="stroke-[2.5]" />
              </div>
              <h3 className="text-lg font-bold text-white mb-2">Join Workspace</h3>
              <p className="text-text-muted text-xs leading-relaxed mb-8">
                Enter an existing 6-digit room code to join your partner's workspace and start syncing your tasks, goals and progress.
              </p>
            </div>
            <form onSubmit={handleJoinRoom} className="space-y-4">
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-text-muted/60">
                  <KeyRound size={16} />
                </div>
                <input
                  type="text"
                  placeholder="Enter 6-digit Room Code"
                  value={roomCode}
                  onChange={(e) => setRoomCode(e.target.value.toLowerCase())}
                  maxLength={6}
                  className="premium-input block w-full pl-11 pr-4 py-3 text-sm font-mono tracking-wider focus:border-brand-blue/40"
                  disabled={joining}
                />
              </div>
              {joinError && <p className="text-xs text-brand-orange font-semibold">{joinError}</p>}
              <button
                type="submit"
                disabled={joining}
                className="w-full flex items-center justify-center gap-2 py-3 px-4 bg-white hover:bg-white/90 text-[#0b0c0e] font-bold rounded-xl active:scale-[0.98] transition-all disabled:opacity-50 text-sm cursor-pointer shadow-lg shadow-white/5"
              >
                {joining ? (
                  <div className="h-5 w-5 border-2 border-[#0b0c0e] border-t-transparent rounded-full animate-spin" />
                ) : (
                  <>Join Room</>
                )}
              </button>
            </form>
          </div>
        </div>
      </main>

      <footer className="w-full max-w-5xl mx-auto text-center text-[10px] text-text-muted/60 z-10 pt-4 border-t border-white/5 flex justify-center items-center">
        <Link to="/about" className="hover:text-brand-orange hover:scale-105 transition-all font-bold uppercase tracking-wider">
          About Project & Developer
        </Link>
      </footer>
    </div>
  );
}

export default Lobby;
