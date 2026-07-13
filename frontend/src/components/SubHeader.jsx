import React from 'react';
import { Copy, Check } from 'lucide-react';

function SubHeader({
  roomCode,
  activeTab,
  socketConnected,
  copied,
  handleCopyCode
}) {
  if (!roomCode) return null;

  return (
    <section className="bg-white/60 backdrop-blur-md py-4 px-4 md:px-8 border-b border-[#e2eae7]">
      <div className="w-full flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-lg font-bold text-[#2d4a43] flex items-center gap-2 capitalize">
            {activeTab === 'dashboard' && <>Workspace Dashboard</>}
            {activeTab === 'goals' && <>Goals Room</>}
            {activeTab === 'progress' && <>Sync Performance</>}
            {activeTab === 'applications' && <>Applications Management</>}
          </h2>
          <p className="text-xs text-[#6b7280]">Room Code: <b className="font-mono text-[#2d4a43]">{roomCode}</b> &bull; Real-time active collaboration</p>
        </div>

        {/* Right actions: Copy button and socket connection */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5 bg-white border border-[#e2eae7] pl-3 pr-2.5 py-1.5 rounded-xl shadow-sm">
            <span className="text-[11px] font-mono text-[#ca9428] font-bold uppercase tracking-wider">Room {roomCode}</span>
            <button 
              onClick={handleCopyCode}
              className="text-[#6b7280] hover:text-[#2d4a43] p-1 hover:bg-slate-50 rounded-lg transition-all cursor-pointer"
              title="Copy Room Code"
            >
              {copied ? <Check size={12} className="text-emerald-500" /> : <Copy size={12} />}
            </button>
          </div>
          
          <div className="flex items-center gap-1.5 bg-white border border-[#e2eae7] px-3 py-1.5 rounded-xl shadow-sm">
            <span className={`w-2 h-2 rounded-full ${socketConnected ? 'bg-emerald-500 animate-pulse' : 'bg-red-500 animate-pulse'}`} />
            <span className="text-[11px] font-bold text-[#6b7280] uppercase tracking-wider">{socketConnected ? 'Connected' : 'Offline'}</span>
          </div>
        </div>
      </div>
    </section>
  );
}

export default SubHeader;
