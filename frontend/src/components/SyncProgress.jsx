import React from 'react';
import { ResponsiveContainer, AreaChart, Area, CartesianGrid, XAxis, YAxis, Tooltip, Legend } from 'recharts';
import { TrendingUp, Info, Users, Calendar } from 'lucide-react';
import ActiveDaysHeatmap from './ActiveDaysHeatmap';

function SyncProgress({
  user,
  partner,
  activityLogs,
  chartData,
  totalTasks,
  userACompleted,
  userBCompleted,
  userAPercentage,
  userBPercentage,
  completedCount,
  completionPercentage,
  heatmapUserFilter,
  setHeatmapUserFilter
}) {
  return (
    <div className="space-y-8 animate-fade-in">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
        
        {/* Detailed Progress Line Chart */}
        <div className="lg:col-span-2 premium-card p-6 space-y-4 bg-white border border-[#e2eae7]">
          <div className="flex justify-between items-center border-b border-[#e2eae7] pb-4">
            <h3 className="text-xs font-bold text-[#6b7280] uppercase tracking-wider flex items-center gap-1.5">
              <TrendingUp size={16} className="text-brand-orange" /> Progress Graph Comparison
            </h3>
            <span className="text-[10px] text-[#6b7280] flex items-center gap-1">
              <Info size={11} /> Real-time tracking
            </span>
          </div>

          {totalTasks === 0 ? (
            <div className="h-72 flex items-center justify-center text-[#6b7280] text-xs border border-dashed border-[#e2eae7] rounded-2xl bg-slate-50/50">
              No tasks found. Create goals to plot completion chart.
            </div>
          ) : (
            <div className="h-72 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={chartData} margin={{ top: 20, right: 20, left: -25, bottom: 10 }}>
                  <defs>
                    <linearGradient id="colorYouProgress" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#ca9428" stopOpacity={0.2}/>
                      <stop offset="95%" stopColor="#ca9428" stopOpacity={0}/>
                    </linearGradient>
                    <linearGradient id="colorPartnerProgress" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#2d4a43" stopOpacity={0.2}/>
                      <stop offset="95%" stopColor="#2d4a43" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(45, 74, 67, 0.08)" opacity={0.6} vertical={false} />
                  <XAxis 
                    dataKey="name" 
                    stroke="#64748b" 
                    fontSize={10} 
                    tickLine={false} 
                    axisLine={false} 
                    padding={{ left: 20, right: 20 }}
                  />
                  <YAxis 
                    stroke="#64748b" 
                    fontSize={10} 
                    tickLine={false} 
                    axisLine={false} 
                    domain={[0, 100]} 
                    tickFormatter={(val) => `${val}%`}
                  />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: '#ffffff', 
                      borderColor: '#e2eae7', 
                      borderRadius: '16px',
                      fontSize: '11px',
                      color: '#2d4a43',
                      boxShadow: '0 10px 30px rgba(0, 0, 0, 0.05)',
                      backdropFilter: 'blur(8px)'
                    }}
                  />
                  <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '10px', color: '#2d4a43' }} />
                  
                  <Area 
                    type="monotone" 
                    dataKey="You" 
                    stroke="#ca9428" 
                    strokeWidth={3} 
                    fillOpacity={1}
                    fill="url(#colorYouProgress)"
                    activeDot={{ r: 7, stroke: '#ca9428', strokeWidth: 1, fill: '#ffffff' }} 
                    dot={{ stroke: '#ca9428', strokeWidth: 2, r: 4, fill: '#ffffff' }}
                  />
                  
                  <Area 
                    type="monotone" 
                    dataKey={partner ? partner.username : 'Partner'} 
                    stroke="#2d4a43" 
                    strokeWidth={3} 
                    fillOpacity={1}
                    fill="url(#colorPartnerProgress)"
                    activeDot={{ r: 7, stroke: '#2d4a43', strokeWidth: 1, fill: '#ffffff' }} 
                    dot={{ stroke: '#2d4a43', strokeWidth: 2, r: 4, fill: '#ffffff' }}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>

        {/* Statistics Panel */}
        <div className="premium-card p-6 space-y-4 bg-white border border-[#e2eae7]">
          <h3 className="text-xs font-bold text-[#6b7280] uppercase tracking-wider flex items-center gap-1.5 border-b border-[#e2eae7] pb-4">
            <Users size={16} className="text-[#2d4a43]" /> Room Performance Stats
          </h3>
          
          <div className="space-y-3">
            <div className="flex justify-between items-center text-xs p-3.5 bg-slate-50 border border-[#e2eae7] rounded-2xl">
              <span className="text-[#6b7280] font-bold">Total Workspace Goals</span>
              <span className="font-extrabold text-[#2d4a43] text-sm">{totalTasks}</span>
            </div>
            
            <div className="flex justify-between items-center text-xs p-3.5 bg-slate-50 border border-[#e2eae7] rounded-2xl">
              <span className="text-[#6b7280] font-bold">Your Completion Rate</span>
              <span className="font-extrabold text-[#ca9428] text-sm">{userACompleted} ({userAPercentage}%)</span>
            </div>
            
            <div className="flex justify-between items-center text-xs p-3.5 bg-slate-50 border border-[#e2eae7] rounded-2xl">
              <span className="text-[#6b7280] font-bold">Partner Completion Rate</span>
              <span className="font-extrabold text-[#2d4a43] text-sm">
                {partner ? `${userBCompleted} (${userBPercentage}%)` : '--'}
              </span>
            </div>

            <div className="flex justify-between items-center text-xs p-3.5 bg-slate-50 border border-[#e2eae7] rounded-2xl">
              <span className="text-[#6b7280] font-bold">100% Synced Tasks</span>
              <span className="font-extrabold text-[#2d4a43] text-sm">{completedCount} ({completionPercentage}%)</span>
            </div>
          </div>
        </div>
      </div>

      {/* Active Days Heatmap log switcher */}
      <div className="premium-card p-6 space-y-4 bg-white border border-[#e2eae7]">
        <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-3 border-b border-[#e2eae7] pb-4">
          <h3 className="text-xs font-bold text-[#6b7280] uppercase tracking-wider flex items-center gap-1.5">
            <Calendar size={16} className="text-brand-orange" /> Member Contribution Calendar
          </h3>
          
          <div className="flex items-center gap-2 self-end">
            <span className="text-[10px] font-bold text-[#6b7280] uppercase tracking-wider">Show Grid For:</span>
            <select
              value={heatmapUserFilter}
              onChange={(e) => setHeatmapUserFilter(e.target.value)}
              className="px-3 py-1.5 bg-white border border-[#c9d5d1] rounded-xl text-xs text-[#2d4a43] focus:outline-none cursor-pointer"
            >
              <option value={user._id}>{user.username} (You)</option>
              {partner && (
                <option value={partner._id}>{partner.username} (Partner)</option>
              )}
            </select>
          </div>
        </div>
        
        <ActiveDaysHeatmap 
          activityLogs={activityLogs} 
          userId={heatmapUserFilter} 
          username={heatmapUserFilter === user._id ? `${user.username} (You)` : (partner ? partner.username : 'Partner')} 
        />
      </div>
    </div>
  );
}

export default SyncProgress;
