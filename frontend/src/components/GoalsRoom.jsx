import React from 'react';
import { Plus, ClipboardList, CheckCircle, Check, Activity } from 'lucide-react';

function GoalsRoom({
  user,
  partner,
  activeTasks,
  completedTasks,
  taskTitle,
  setTaskTitle,
  handleAddTask,
  handleToggle
}) {
  return (
    <div className="space-y-6 animate-fade-in">
      {/* Input Form Card */}
      <form onSubmit={handleAddTask} className="premium-card p-4 flex gap-3 items-center bg-white border border-[#e2eae7]">
        <input
          type="text"
          placeholder="Log a new collaborative room goal..."
          value={taskTitle}
          onChange={(e) => setTaskTitle(e.target.value)}
          className="flex-1 premium-input px-4 py-3 text-sm focus:border-brand-orange/40"
        />
        <button
          type="submit"
          className="bg-brand-orange hover:bg-brand-orange/95 text-white font-extrabold px-6 py-3 rounded-xl transition-all cursor-pointer flex items-center gap-1.5 text-sm shrink-0 shadow-lg shadow-brand-orange/10"
        >
          <Plus size={16} /> Add Goal
        </button>
      </form>

      {/* Dual Grid Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        
        {/* Active Goals Column */}
        <div className="space-y-4">
          <div className="flex items-center justify-between border-b border-[#e2eae7] pb-3">
            <h3 className="text-xs font-bold text-[#6b7280] uppercase tracking-wider flex items-center gap-1.5">
              <ClipboardList size={14} className="text-brand-orange" /> Active Goals ({activeTasks.length})
            </h3>
            <span className="text-[10px] bg-brand-orange/10 text-brand-orange border border-brand-orange/20 px-2 py-0.5 rounded-md font-bold">Pending Sync</span>
          </div>

          {activeTasks.length === 0 ? (
            <div className="premium-card border-dashed p-12 text-center text-[#6b7280] bg-slate-50/50 border border-[#e2eae7]">
              <CheckCircle size={32} className="mx-auto mb-2 opacity-30 stroke-[1.5]" />
              <p className="text-xs font-bold text-[#2d4a43] mb-0.5">All goals synced & completed!</p>
              <p className="text-[10px]">Add tasks above to start syncing workspace progress.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {activeTasks.map(task => {
                const isCompletedByMe = task.status ? !!task.status[user._id] : false;
                const isCompletedByPartner = partner && task.status ? !!task.status[partner._id] : false;

                return (
                  <div 
                    key={task._id}
                    className="premium-card p-4 flex items-center justify-between gap-4 hover:border-[#ca9428]/30 transition-all duration-300 bg-white border border-[#e2eae7]"
                  >
                    <span className="text-sm font-medium text-[#2d4a43] leading-relaxed">
                      {task.title}
                    </span>

                    {/* Dual Checkboxes styled like premium toggle capsules */}
                    <div className="flex items-center gap-3 shrink-0 bg-slate-50 p-1.5 rounded-2xl border border-[#e2eae7]">
                      {/* Checkbox A (Me) */}
                      <div className="flex flex-col items-center gap-1">
                        <button
                          type="button"
                          onClick={() => handleToggle(task._id, user._id)}
                          className={`w-7 h-7 rounded-xl flex items-center justify-center transition-all duration-200 cursor-pointer ${
                            isCompletedByMe 
                              ? 'bg-brand-orange text-white shadow-md shadow-brand-orange/10'
                              : 'border border-[#c9d5d1] text-transparent hover:border-[#ca9428] hover:bg-slate-100'
                          }`}
                          title="Toggle My Status"
                        >
                          <Check size={14} className="stroke-[3]" />
                        </button>
                        <span className="text-[8px] font-bold text-[#6b7280] uppercase tracking-wider">YOU</span>
                      </div>

                      {/* Checkbox B (Partner) */}
                      <div className="flex flex-col items-center gap-1">
                        <button
                          type="button"
                          disabled
                          className={`w-7 h-7 rounded-xl flex items-center justify-center transition-all duration-200 ${
                            partner 
                              ? isCompletedByPartner
                                ? 'bg-brand-blue text-white shadow-md shadow-brand-blue/10'
                                : 'border border-[#c9d5d1] text-transparent'
                              : 'border border-dashed border-[#e2eae7] text-transparent cursor-not-allowed'
                          }`}
                          title={partner ? `${partner.username}'s Status` : 'Waiting for partner...'}
                        >
                          <Check size={14} className="stroke-[3]" />
                        </button>
                        <span className="text-[8px] font-bold text-[#6b7280] uppercase tracking-wider truncate max-w-[40px]">
                          {partner ? partner.username.substring(0, 5) : 'PARTNER'}
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Completed Goals Column */}
        <div className="space-y-4">
          <div className="flex items-center justify-between border-b border-[#e2eae7] pb-3">
            <h3 className="text-xs font-bold text-[#6b7280] uppercase tracking-wider flex items-center gap-1.5">
              <CheckCircle size={14} className="text-emerald-500" /> Completed Goals ({completedTasks.length})
            </h3>
            <span className="text-[10px] bg-emerald-50 text-emerald-600 border border-emerald-200 px-2 py-0.5 rounded-md font-bold">100% Synced</span>
          </div>

          {completedTasks.length === 0 ? (
            <div className="premium-card border-dashed p-12 text-center text-[#6b7280] bg-slate-50/50 border border-[#e2eae7]">
              <Activity size={32} className="mx-auto mb-2 opacity-35 stroke-[1.5] animate-pulse" />
              <p className="text-xs font-bold text-[#2d4a43] mb-0.5">No completed goals yet</p>
              <p className="text-[10px]">A goal is completed when checked by both collaborators.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {completedTasks.map(task => {
                const isCompletedByMe = task.status ? !!task.status[user._id] : false;

                return (
                  <div 
                    key={task._id}
                    className="premium-card p-4 flex items-center justify-between gap-4 opacity-60 hover:opacity-90 transition-all duration-200 bg-white border border-[#e2eae7]"
                  >
                    <span className="text-sm font-medium text-[#6b7280] line-through leading-relaxed">
                      {task.title}
                    </span>

                    {/* Completed Status Checkboxes */}
                    <div className="flex items-center gap-3 shrink-0 bg-slate-50 p-1.5 rounded-2xl border border-[#e2eae7]">
                      {/* Checkbox A (Me) */}
                      <div className="flex flex-col items-center gap-1">
                        <button
                          type="button"
                          onClick={() => handleToggle(task._id, user._id)}
                          className="w-7 h-7 rounded-xl flex items-center justify-center bg-[#ca9428]/20 text-[#ca9428] border border-[#ca9428]/30 cursor-pointer"
                          title="Toggle My Status"
                        >
                          <Check size={14} className="stroke-[3]" />
                        </button>
                        <span className="text-[8px] font-bold text-[#6b7280] uppercase tracking-wider">YOU</span>
                      </div>

                      {/* Checkbox B (Partner) */}
                      <div className="flex flex-col items-center gap-1">
                        <button
                          type="button"
                          disabled
                          className="w-7 h-7 rounded-xl flex items-center justify-center bg-[#2d4a43]/20 text-[#2d4a43] border border-[#2d4a43]/30"
                          title={partner ? `${partner.username}'s Status` : 'Partner status'}
                        >
                          <Check size={14} className="stroke-[3]" />
                        </button>
                        <span className="text-[8px] font-bold text-[#6b7280] uppercase tracking-wider truncate max-w-[40px]">
                          {partner ? partner.username.substring(0, 5) : 'PARTNER'}
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

      </div>
    </div>
  );
}

export default GoalsRoom;
