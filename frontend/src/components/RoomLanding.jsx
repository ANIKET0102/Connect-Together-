import React from 'react';
import { Plus, Loader2, LogIn } from 'lucide-react';

function RoomLanding({
  creatingRoom,
  joiningRoom,
  joinCode,
  setJoinCode,
  handleCreateRoom,
  handleJoinRoom
}) {
  return (
    <div className="max-w-xl mx-auto my-auto py-12 text-center animate-fade-in space-y-8 flex flex-col justify-center min-h-[60vh]">
      <div className="space-y-3">
        <h2 className="text-3xl font-extrabold text-[#2d4a43] tracking-tight sm:text-4xl">
          Welcome to your <span className="bg-gradient-to-r from-brand-orange to-brand-yellow bg-clip-text text-transparent font-black">Workspace</span>
        </h2>
        <p className="text-[#6b7280] text-xs sm:text-sm max-w-md mx-auto leading-relaxed">
          Collaborate, track tasks, sync progress, and organize job applications in real time. Start by creating a room or entering a 6-digit code.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 pt-4">
        {/* Create Card */}
        <div className="premium-card p-6 flex flex-col justify-between hover:border-brand-orange/30 transition-all duration-300 group relative bg-white border border-[#e2eae7]">
          <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-brand-orange/15 to-transparent" />
          <div>
            <div className="w-10 h-10 bg-brand-orange/10 text-brand-orange rounded-xl flex items-center justify-center mb-4 group-hover:scale-105 transition-all duration-300 border border-brand-orange/20">
              <Plus size={18} className="stroke-[2.5]" />
            </div>
            <h3 className="text-sm font-bold text-[#2d4a43] mb-1.5 text-left">Create Workspace</h3>
            <p className="text-[#6b7280] text-[11px] leading-relaxed mb-6 text-left">
              Start a fresh, private workspace. Generates a unique 6-character room code.
            </p>
          </div>
          <button
            onClick={handleCreateRoom}
            disabled={creatingRoom}
            className="w-full flex items-center justify-center gap-1.5 py-2.5 px-4 bg-[#2d4a43] hover:bg-[#2d4a43]/90 text-white font-extrabold rounded-xl transition-all text-xs cursor-pointer active:scale-95 disabled:opacity-50"
          >
            {creatingRoom ? <Loader2 className="animate-spin" size={14} /> : <span>Create Room</span>}
          </button>
        </div>

        {/* Join Card */}
        <div className="premium-card p-6 flex flex-col justify-between hover:border-brand-blue/30 transition-all duration-300 group relative bg-white border border-[#e2eae7]">
          <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-brand-blue/15 to-transparent" />
          <div>
            <div className="w-10 h-10 bg-[#2d4a43]/10 text-[#2d4a43] rounded-xl flex items-center justify-center mb-4 group-hover:scale-105 transition-all duration-300 border border-[#2d4a43]/20">
              <LogIn size={18} className="stroke-[2.5]" />
            </div>
            <h3 className="text-sm font-bold text-[#2d4a43] mb-1.5 text-left">Join Workspace</h3>
            <p className="text-[#6b7280] text-[11px] leading-relaxed mb-6 text-left">
              Enter an existing 6-digit room code to join your partner's workspace.
            </p>
          </div>
          <form onSubmit={handleJoinRoom} className="space-y-2">
            <div className="relative">
              <input
                type="text"
                placeholder="6-digit Room Code"
                value={joinCode}
                onChange={(e) => setJoinCode(e.target.value.toLowerCase())}
                maxLength={6}
                className="premium-input block w-full px-3 py-2 text-xs font-mono tracking-wider focus:border-brand-orange/40 text-center"
                disabled={joiningRoom}
              />
            </div>
            <button
              type="submit"
              disabled={joiningRoom || joinCode.trim().length !== 6}
              className="w-full flex items-center justify-center gap-1.5 py-2 px-4 bg-brand-orange hover:bg-brand-orange/90 text-white font-extrabold rounded-xl transition-all text-xs cursor-pointer active:scale-95 disabled:opacity-50"
            >
              {joiningRoom ? <Loader2 className="animate-spin" size={14} /> : <span>Join Room</span>}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}

export default RoomLanding;
