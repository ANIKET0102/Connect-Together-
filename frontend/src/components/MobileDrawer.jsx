import React from 'react';
import { Link } from 'react-router-dom';
import { Info, Plus, Loader2, Check, Copy } from 'lucide-react';
import toast from 'react-hot-toast';

function MobileDrawer({
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
  socketConnected,
  copied,
  handleCopyCode,
  onLogout
}) {
  if (!mobileMenuOpen) return null;

  return (
    <div className="fixed inset-0 top-[65px] bg-[#2d4a43]/95 backdrop-blur-xl z-30 md:hidden flex flex-col justify-between p-6 overflow-y-auto animate-fade-in border-t border-white/10 pb-10">
      <div className="space-y-6">
        <div className="flex items-center gap-3 bg-white/10 border border-white/10 p-4 rounded-2xl">
          <div className="w-8 h-8 rounded-full bg-brand-orange text-[#2d4a43] flex items-center justify-center text-xs font-bold">
            {user.username.substring(0, 2).toUpperCase()}
          </div>
          <div>
            <p className="text-sm font-bold text-white">{user.username}</p>
            <p className="text-[10px] text-white/60">Collaborator</p>
          </div>
        </div>

        <nav className="space-y-2">
          <p className="text-[10px] font-bold tracking-widest text-white/40 uppercase px-3">Workspace Menu</p>
          {navItems.map((item) => {
            const Icon = item.icon;
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
                  setMobileMenuOpen(false);
                }}
                className={`w-full flex items-center justify-between px-4 py-3.5 rounded-xl text-sm font-bold transition-all cursor-pointer ${
                  item.disabled
                    ? 'opacity-35 cursor-not-allowed text-white/40'
                    : isActive 
                      ? 'bg-brand-orange text-white shadow-sm font-extrabold' 
                      : 'text-white/80 hover:text-white hover:bg-white/5'
                }`}
              >
                <div className="flex items-center gap-3">
                  <Icon size={18} className={isActive ? 'text-white' : 'text-white/60'} />
                  <span>{item.label}</span>
                </div>
                {item.badge !== undefined && item.badge > 0 && (
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-white/10 text-white/80">
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
          
          {/* About Link in Drawer */}
          <Link
            to="/about"
            className="w-full flex items-center justify-between px-4 py-3.5 rounded-xl text-sm font-bold text-white/80 hover:text-white hover:bg-white/10 transition-all cursor-pointer"
            onClick={() => setMobileMenuOpen(false)}
          >
            <div className="flex items-center gap-3">
              <Info size={18} className="text-white/60" />
              <span>About Project & Dev</span>
            </div>
          </Link>
        </nav>

        {/* Room Actions in Mobile Drawer */}
        <div className="space-y-3 pt-4 border-t border-white/10">
          <p className="text-[10px] font-bold tracking-widest text-white/40 uppercase px-3">Room Options</p>
          
          <button
            onClick={handleCreateRoom}
            disabled={creatingRoom}
            className="w-full flex items-center justify-center gap-2 py-3 px-4 bg-brand-orange hover:bg-brand-orange/90 text-white font-extrabold rounded-xl transition-all text-xs cursor-pointer shadow-md"
          >
            {creatingRoom ? (
              <Loader2 className="animate-spin" size={14} />
            ) : (
              <>
                <Plus size={14} />
                <span>Create New Room</span>
              </>
            )}
          </button>

          <form onSubmit={handleJoinRoom} className="flex gap-2">
            <input
              type="text"
              placeholder="6-digit Room Code"
              value={joinCode}
              onChange={(e) => setJoinCode(e.target.value.toLowerCase())}
              maxLength={6}
              className="flex-1 px-3 py-2 text-xs font-mono tracking-wider bg-white/10 border border-white/10 text-white rounded-xl focus:outline-none focus:border-brand-orange/45 placeholder:text-white/40"
              disabled={joiningRoom}
            />
            <button
              type="submit"
              disabled={joiningRoom || joinCode.trim().length !== 6}
              className="px-4 bg-white hover:bg-white/90 text-[#2d4a43] font-extrabold rounded-xl text-xs transition-all active:scale-95 disabled:opacity-50 cursor-pointer"
            >
              {joiningRoom ? <Loader2 className="animate-spin" size={14} /> : <span>Join</span>}
            </button>
          </form>
        </div>

        {/* Sync connection status card on mobile */}
        {roomCode && (
          <div className="bg-white/10 border border-white/10 rounded-2xl p-4 space-y-3">
            <div className="flex justify-between items-center text-xs text-white/60">
              <span className="font-bold uppercase tracking-wider text-[10px]">Sync Engine Status</span>
              <span className={`w-2 h-2 rounded-full ${socketConnected ? 'bg-emerald-500 animate-pulse' : 'bg-red-500 animate-pulse'}`} />
            </div>
            <div className="flex items-center justify-between bg-white/10 border border-white/10 px-3 py-2 rounded-xl">
              <span className="font-mono text-xs text-brand-orange font-bold">{roomCode}</span>
              <button 
                onClick={handleCopyCode}
                className="text-white/80 hover:text-white p-1 hover:bg-white/5 rounded-lg transition-colors cursor-pointer"
              >
                {copied ? <Check size={14} className="text-emerald-500" /> : <Copy size={14} />}
              </button>
            </div>
          </div>
        )}
      </div>

      <button
        onClick={() => {
          setMobileMenuOpen(false);
          onLogout();
        }}
        className="w-full py-3.5 bg-red-500/10 border border-red-500/20 text-red-400 font-bold rounded-xl active:scale-[0.98] transition-all text-xs cursor-pointer mt-6"
      >
        {roomCode ? "Leave Workspace Room" : "Log Out"}
      </button>
    </div>
  );
}

export default MobileDrawer;
