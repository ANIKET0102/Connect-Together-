import React from 'react';
import { Plus, Loader2 } from 'lucide-react';
import toast from 'react-hot-toast';

function Sidebar({
  user,
  activeTab,
  setActiveTab,
  navItems,
  creatingRoom,
  joiningRoom,
  joinCode,
  setJoinCode,
  handleCreateRoom,
  handleJoinRoom
}) {
  return (
    <aside className="hidden md:flex flex-col w-[88px] hover:w-64 shrink-0 border-r border-[#e2eae7] bg-[#2d4a43] px-4 py-6 space-y-6 sticky top-[69px] h-[calc(100vh-69px)] overflow-y-auto overflow-x-hidden transition-all duration-300 ease-in-out group z-30 shadow-lg">
      {/* User profile / info in sidebar */}
      <div className="flex items-center justify-center group-hover:justify-start gap-3 bg-white/10 border border-white/10 p-2.5 rounded-2xl min-h-[50px] overflow-hidden">
        <div className="w-8 h-8 rounded-full bg-brand-orange text-[#2d4a43] flex items-center justify-center text-xs font-bold shrink-0">
          {user.username.substring(0, 2).toUpperCase()}
        </div>
        <div className="min-w-0 hidden group-hover:block transition-all duration-300 ease-in-out overflow-hidden whitespace-nowrap">
          <p className="text-xs font-bold text-white truncate">{user.username}</p>
          <p className="text-[10px] text-white/60">Collaborator</p>
        </div>
      </div>

      {/* Navigation Links in Sidebar */}
      <nav className="space-y-1">
        <p className="text-[9px] font-bold tracking-widest text-white/40 uppercase px-1 mb-2.5 hidden group-hover:block transition-all duration-300 ease-in-out overflow-hidden whitespace-nowrap">
          Workspace Menu
        </p>
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
              }}
              className={`w-full flex items-center justify-center group-hover:justify-start gap-3.5 px-3 py-3 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                item.disabled
                  ? 'opacity-30 cursor-not-allowed text-white/40'
                  : isActive 
                    ? 'bg-white text-[#2d4a43] shadow-md font-extrabold' 
                    : 'text-white/80 hover:text-white hover:bg-white/10'
              }`}
            >
              <Icon size={16} className={`shrink-0 ${isActive ? 'text-[#ca9428]' : 'text-white/60'}`} />
              <span className="hidden group-hover:inline-block transition-all duration-300 ease-in-out overflow-hidden whitespace-nowrap">
                {item.label}
              </span>
              {item.badge !== undefined && item.badge > 0 && (
                <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded-md ml-auto hidden group-hover:inline-block transition-all duration-300 ${isActive ? 'bg-[#ca9428] text-white' : 'bg-white/10 text-white/80'}`}>
                  {item.badge}
                </span>
              )}
            </button>
          );
        })}
      </nav>

      {/* Workspace Options / Actions Section */}
      <div className="space-y-4 pt-4 border-t border-white/10 hidden group-hover:block transition-all duration-300 ease-in-out overflow-hidden">
        <p className="text-[9px] font-bold tracking-widest text-white/40 uppercase px-1">Room Options</p>
        
        {/* Create Room Button */}
        <div className="px-0.5">
          <button
            onClick={handleCreateRoom}
            disabled={creatingRoom}
            className="w-full flex items-center justify-center gap-2 py-2.5 px-3 bg-brand-orange hover:bg-brand-orange/90 text-white font-extrabold rounded-xl active:scale-[0.98] transition-all disabled:opacity-50 text-xs cursor-pointer shadow-md"
          >
            {creatingRoom ? (
              <Loader2 className="animate-spin" size={14} />
            ) : (
              <>
                <Plus size={14} />
                <span>Create Room</span>
              </>
            )}
          </button>
        </div>

        {/* Join Room Form */}
        <form onSubmit={handleJoinRoom} className="px-0.5 space-y-2">
          <div className="relative">
            <input
              type="text"
              placeholder="6-digit Room Code"
              value={joinCode}
              onChange={(e) => setJoinCode(e.target.value.toLowerCase())}
              maxLength={6}
              className="block w-full px-3 py-2 text-xs font-mono tracking-wider bg-white/10 border border-white/10 text-white rounded-xl focus:outline-none focus:border-brand-orange/45 placeholder:text-white/40"
              disabled={joiningRoom}
            />
          </div>
          <button
            type="submit"
            disabled={joiningRoom || joinCode.trim().length !== 6}
            className="w-full flex items-center justify-center gap-2 py-2 px-3 bg-white hover:bg-white/90 text-[#2d4a43] font-extrabold rounded-xl active:scale-[0.98] transition-all disabled:opacity-50 text-xs cursor-pointer"
          >
            {joiningRoom ? (
              <Loader2 className="animate-spin" size={14} />
            ) : (
              <span>Join Room</span>
            )}
          </button>
        </form>
      </div>
    </aside>
  );
}

export default Sidebar;
