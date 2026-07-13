import React from 'react';
import { ResponsiveContainer, AreaChart, Area, CartesianGrid, XAxis, YAxis, Tooltip } from 'recharts';
import { Activity, Users, ClipboardList, ChevronRight } from 'lucide-react';
import ActiveDaysHeatmap from './ActiveDaysHeatmap';

function DashboardOverview({
  user,
  partner,
  activityLogs,
  tasks,
  activeTasks,
  completedTasks,
  applications,
  userActiveDays,
  partnerActiveDays,
  socketConnected,
  room,
  chartData,
  totalTasks,
  userACompleted,
  userBCompleted,
  userAPercentage,
  userBPercentage,
  setActiveTab,
  navItems
}) {
  return (
    <div className="space-y-8 animate-fade-in">
      {/* Welcome banner with simple dark styling */}
      <div className="premium-card p-6 md:p-8 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 relative overflow-hidden bg-white">
        <div className="absolute top-0 right-0 w-[250px] h-[250px] bg-brand-orange/5 rounded-full blur-[50px] pointer-events-none" />
        <div className="space-y-1">
          <h3 className="text-xl md:text-2xl font-bold text-[#2d4a43]">
            Welcome, <span className="bg-gradient-to-r from-brand-orange to-[#2d4a43] bg-clip-text text-transparent font-extrabold">{user.username}</span>!
          </h3>
          <p className="text-xs text-[#6b7280]">Here's a snapshot of your collaborative room progress today.</p>
        </div>
        
        {/* Partner presence */}
        <div className="flex items-center gap-2 bg-[#2d4a43]/5 border border-[#2d4a43]/10 p-3 rounded-2xl">
          <span className={`w-2 h-2 rounded-full ${partner ? 'bg-emerald-500' : 'bg-brand-orange animate-pulse'}`} />
          <span className="text-xs font-bold text-[#2d4a43]/80">
            {partner ? `Synced with ${partner.username}` : 'Waiting for partner...'}
          </span>
        </div>
      </div>

      {/* Main grid styled like the reference image */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left Column: 2 Stacked Metrics Cards (Gold and Deep Green gradients) */}
        <div className="space-y-6 flex flex-col justify-between">
          
          {/* Metric Card 1: Your stats (Gold-Yellow/Bronze gradient) */}
          <div className="bg-gradient-to-br from-[#ca9428] to-[#996f1d] p-6 rounded-[28px] shadow-lg shadow-[#ca9428]/10 flex-1 flex flex-col justify-between h-44 relative overflow-hidden text-white">
            <div className="absolute top-0 left-0 right-0 h-[1px] bg-white/20" />
            <div className="flex items-start gap-4">
              {/* Circle Icon */}
              <div className="w-10 h-10 rounded-2xl bg-white/10 border border-white/15 flex items-center justify-center text-white">
                <Activity size={18} className="stroke-[2.5]" />
              </div>
              <div>
                <h4 className="text-xs font-bold text-white/80 uppercase tracking-wider">Your Active Days</h4>
                <p className="text-3.5xl font-black text-white mt-1">{userActiveDays} Days</p>
              </div>
            </div>
            <div className="flex justify-between items-center text-[10px] text-white/80 pt-4 border-t border-white/10">
              <span>Task completion active tracking</span>
              <span className="text-[#ca9428] font-black bg-white px-2.5 py-1 rounded-lg">{userACompleted} Goals Done</span>
            </div>
          </div>

          {/* Metric Card 2: Partner stats (Deep Green/Forest gradient) */}
          <div className="bg-gradient-to-br from-[#2d4a43] to-[#1e322d] p-6 rounded-[28px] shadow-lg shadow-[#2d4a43]/10 flex-1 flex flex-col justify-between h-44 relative overflow-hidden text-white">
            <div className="absolute top-0 left-0 right-0 h-[1px] bg-white/20" />
            <div className="flex items-start gap-4">
              {/* Circle Icon */}
              <div className="w-10 h-10 rounded-2xl bg-white/10 border border-white/15 flex items-center justify-center text-white">
                <Users size={18} className="stroke-[2.5]" />
              </div>
              <div>
                <h4 className="text-xs font-bold text-white/80 uppercase tracking-wider">Partner Active Days</h4>
                <p className="text-3.5xl font-black text-white mt-1">
                  {partner ? `${partnerActiveDays} Days` : '--'}
                </p>
              </div>
            </div>
            <div className="flex justify-between items-center text-[10px] text-white/80 pt-4 border-t border-white/10">
              <span>{partner ? `${partner.username}'s active tracking` : 'Workspace status'}</span>
              <span className="text-white font-black bg-white/15 px-2.5 py-1 rounded-lg">
                {partner ? `${userBCompleted} Goals Done` : 'Awaiting sync'}
              </span>
            </div>
          </div>

        </div>

        {/* Right Column: Chart (inspired by Market Cap line chart in reference image) */}
        <div className="lg:col-span-2 premium-card p-6 flex flex-col justify-between min-h-[360px] bg-white">
          <div className="flex justify-between items-center border-b border-[#e2eae7] pb-4 mb-4">
            <div>
              <h3 className="text-xs font-bold text-[#6b7280] uppercase tracking-wider">Sync Progress Overview</h3>
              <p className="text-lg font-black text-[#2d4a43] mt-0.5">Workspace Sync Rate</p>
            </div>
            <div className="flex items-center gap-3">
              <span className="flex items-center gap-1 text-[10px] font-bold text-[#2d4a43]">
                <span className="w-2 h-2 rounded-full bg-brand-orange" /> You
              </span>
              {partner && (
                <span className="flex items-center gap-1 text-[10px] font-bold text-[#2d4a43]">
                  <span className="w-2 h-2 rounded-full bg-brand-blue" /> {partner.username}
                </span>
              )}
            </div>
          </div>

          {totalTasks === 0 ? (
            <div className="h-64 flex flex-col items-center justify-center text-[#6b7280] text-xs border border-dashed border-[#e2eae7] rounded-2xl p-6 bg-slate-50/50">
              <ClipboardList size={30} className="mb-2 opacity-50 text-[#6b7280]" />
              <span>No goals logged in this room yet. Go to Goals Room to start!</span>
            </div>
          ) : (
            <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -25, bottom: 5 }}>
                  <defs>
                    <linearGradient id="colorYou" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#ca9428" stopOpacity={0.2}/>
                      <stop offset="95%" stopColor="#ca9428" stopOpacity={0}/>
                    </linearGradient>
                    <linearGradient id="colorPartner" x1="0" y1="0" x2="0" y2="1">
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
                  
                  {/* Area for User (Gold with glow gradient fill) */}
                  <Area 
                    type="monotone" 
                    dataKey="You" 
                    stroke="#ca9428" 
                    strokeWidth={2.5} 
                    fillOpacity={1}
                    fill="url(#colorYou)"
                    activeDot={{ r: 6, stroke: '#ca9428', strokeWidth: 1, fill: '#ffffff' }} 
                    dot={{ stroke: '#ca9428', strokeWidth: 1.5, r: 4, fill: '#ffffff' }}
                  />
                  
                  {/* Area for Partner (Deep Green with glow gradient fill) */}
                  <Area 
                    type="monotone" 
                    dataKey={partner ? partner.username : 'Partner'} 
                    stroke="#2d4a43" 
                    strokeWidth={2.5} 
                    fillOpacity={1}
                    fill="url(#colorPartner)"
                    activeDot={{ r: 6, stroke: '#2d4a43', strokeWidth: 1, fill: '#ffffff' }} 
                    dot={{ stroke: '#2d4a43', strokeWidth: 1.5, r: 4, fill: '#ffffff' }}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>

      </div>

      {/* Quick Access Card Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {navItems.slice(1).map((item) => {
          const Icon = item.icon;
          return (
            <div 
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className="premium-card p-6 border-[#e2eae7] bg-white hover:border-[#ca9428]/50 transition-all duration-300 cursor-pointer group flex flex-col justify-between h-44 relative overflow-hidden"
            >
              <div className="space-y-2">
                <div className="w-9 h-9 rounded-xl bg-[#2d4a43]/5 border border-[#2d4a43]/10 flex items-center justify-center text-[#2d4a43] group-hover:text-brand-orange transition-colors">
                  <Icon size={16} />
                </div>
                <h4 className="text-sm font-bold text-[#2d4a43] group-hover:text-brand-orange transition-colors">{item.label}</h4>
                <p className="text-[11px] text-[#6b7280] leading-relaxed">
                  {item.id === 'goals' && "Create tasks, toggle checkmarks, and track sync statuses collaboratively."}
                  {item.id === 'progress' && "Analyze partner sync rates, active days grids, and performance logs."}
                  {item.id === 'applications' && "Log application URLs, review ongoing status tags, and add custom notes."}
                </p>
              </div>
              <div className="flex items-center justify-between pt-3 border-t border-[#e2eae7] text-[10px] text-[#6b7280]/60">
                <span>
                  {item.id === 'goals' && `${activeTasks.length} pending items`}
                  {item.id === 'progress' && `Performance stats synced`}
                  {item.id === 'applications' && `${applications.length} applications logged`}
                </span>
                <ChevronRight size={14} className="group-hover:translate-x-1 transition-transform" />
              </div>
            </div>
          );
        })}
      </div>

      {/* Contribution heatmap calendar */}
      <div className="space-y-4">
        <h3 className="text-xs font-bold text-[#6b7280] uppercase tracking-wider">Workspace Heatmap</h3>
        <ActiveDaysHeatmap activityLogs={activityLogs} userId={user._id} username={`${user.username} (You)`} />
      </div>

    </div>
  );
}

export default DashboardOverview;
