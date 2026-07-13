import React from 'react';
import { Link } from 'react-router-dom';
import { Sprout, Info, LogOut, Menu, X, Plus, Loader2 } from 'lucide-react';
import toast from 'react-hot-toast';

function Header({
  user,
  activeTab,
  setActiveTab,
  navItems,
  roomCode,
  creatingRoom,
  joiningRoom,
  joinCode,
  setJoinCode,
  handleCreateRoom,
  handleJoinRoom,
  mobileMenuOpen,
  setMobileMenuOpen,
  onLogout
}) {
  return (
    <header className="border-b border-white/10 bg-[#2d4a43] sticky top-0 z-40 py-4 px-4 md:px-8 shadow-md">
      <div className="w-full flex items-center justify-between">
        {/* Logo */}
        <div className="flex items-center gap-2.5 cursor-pointer" onClick={() => setActiveTab('dashboard')}>
          <span className="p-2 bg-gradient-to-br from-brand-orange to-brand-yellow rounded-xl text-[#2d4a43] shadow-md shadow-brand-orange/10">
            <Sprout size={18} className="stroke-[2.5]" />
          </span>
          <span className="text-lg font-extrabold tracking-tight text-white">
            Grow <span className="bg-gradient-to-r from-brand-orange to-brand-yellow bg-clip-text text-transparent font-extrabold">Together</span>
          </span>
        </div>

        {/* Center Navigation Links (Hidden on mobile) */}
        <nav className="hidden md:flex items-center gap-1.5 bg-white/10 border border-white/10 p-1 rounded-2xl">
          {navItems.map((item) => {
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                disabled={item.disabled}
                onClick={() => {
                  if (item.disabled) {
                    toast.error('Join or create a room to access this tab.');
                    return;
                  }
                  setActiveTab(item.id);
                }}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  item.disabled
                    ? 'opacity-35 cursor-not-allowed text-white/50'
                    : isActive 
                      ? 'bg-brand-orange text-white shadow-sm font-extrabold' 
                      : 'text-white/80 hover:text-white border border-transparent'
                }`}
              >
                {item.label}
                {item.badge !== undefined && item.badge > 0 && (
                  <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded-md ${isActive ? 'bg-white text-[#2d4a43]' : 'bg-white/10 text-white/80'}`}>
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </nav>

        {/* Right Side: Profile Dropdown + Leave Workspace */}
        <div className="flex items-center gap-3">
          {/* Create Room / Join Room Quick Actions (Hidden on mobile/tablet) */}
          <div className="hidden lg:flex items-center gap-2 mr-2">
            <button
              onClick={handleCreateRoom}
              disabled={creatingRoom}
              className="flex items-center gap-1.5 text-xs font-extrabold text-white bg-brand-orange hover:bg-brand-orange/90 px-3.5 py-2 rounded-xl transition-all cursor-pointer shadow-md hover:scale-[1.02] active:scale-[0.98] shrink-0"
            >
              {creatingRoom ? <Loader2 size={13} className="animate-spin" /> : <Plus size={13} />}
              <span>Create Room</span>
            </button>
            
            <form onSubmit={handleJoinRoom} className="flex items-center bg-white/10 border border-white/10 rounded-xl px-2 py-1">
              <input
                type="text"
                placeholder="Join Code"
                value={joinCode}
                onChange={(e) => setJoinCode(e.target.value.toLowerCase())}
                maxLength={6}
                className="bg-transparent border-none text-xs text-white w-16 focus:outline-none px-1 placeholder:text-white/40 font-mono tracking-wider"
                disabled={joiningRoom}
              />
              <button
                type="submit"
                disabled={joiningRoom || joinCode.trim().length !== 6}
                className="bg-white hover:bg-white/90 text-[#2d4a43] font-extrabold text-[10px] px-2.5 py-1 rounded-lg transition-all active:scale-95 disabled:opacity-50 cursor-pointer"
              >
                {joiningRoom ? <Loader2 size={10} className="animate-spin" /> : "Join"}
              </button>
            </form>
          </div>

          {/* User Pill */}
          <div className="hidden sm:flex items-center gap-2 bg-white/10 border border-white/10 px-3.5 py-1.5 rounded-2xl">
            <div className="w-5 h-5 rounded-full bg-white/20 border border-white/40 flex items-center justify-center text-white text-[10px] font-bold">
              {user.username.substring(0, 2).toUpperCase()}
            </div>
            <span className="text-xs font-bold text-white">{user.username}</span>
          </div>

          {/* About Link */}
          <Link
            to="/about"
            className="flex items-center gap-1.5 text-xs font-bold text-white/80 hover:text-white transition-all bg-white/10 border border-white/10 hover:bg-white/20 px-3 py-2 rounded-xl cursor-pointer"
            title="About the developer & project"
          >
            <Info size={13} />
            <span className="hidden sm:inline">About</span>
          </Link>

          {/* Leave / Logout Action */}
          <button
            onClick={onLogout}
            className="flex items-center gap-1.5 text-xs font-bold text-white/80 hover:text-red-400 transition-all bg-white/10 hover:bg-red-500/10 border border-white/10 hover:border-red-500/20 px-3 py-2 rounded-xl cursor-pointer"
            title={roomCode ? "Leave Room Workspace" : "Log out"}
          >
            <LogOut size={13} />
            <span className="hidden sm:inline">{roomCode ? "Leave Room" : "Log Out"}</span>
          </button>

          {/* Hamburger Button for Mobile */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-2 text-white/80 hover:text-white border border-white/10 rounded-xl md:hidden cursor-pointer bg-white/10"
          >
            {mobileMenuOpen ? <X size={18} /> : <Menu size={18} />}
          </button>
        </div>
      </div>
    </header>
  );
}

export default Header;
