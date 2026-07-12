import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { io } from 'socket.io-client';
import toast from 'react-hot-toast';
import { 
  ResponsiveContainer, 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  Tooltip, 
  CartesianGrid,
  Legend
} from 'recharts';
import { 
  Users, 
  Plus, 
  Check, 
  Copy, 
  Activity,
  ClipboardList,
  CheckCircle,
  Sprout,
  LogOut,
  Loader2,
  AlertCircle,
  ArrowLeft,
  Briefcase,
  Search,
  Filter,
  Trash2,
  ExternalLink,
  Menu,
  X,
  TrendingUp,
  Calendar,
  Info,
  LayoutDashboard,
  ChevronRight,
  ChevronLeft,
  User
} from 'lucide-react';

const API_BASE = import.meta.env.DEV ? 'http://localhost:5000/api' : 'https://connect-together-vpa6.onrender.com/api';
const SOCKET_URL = import.meta.env.DEV ? 'http://localhost:5000' : 'https://connect-together-vpa6.onrender.com';

// Helper to generate the 365 days ending today, aligned to Sundays
const getCalendarDays = () => {
  const days = [];
  const today = new Date();
  
  // Go back 365 days
  const startDate = new Date();
  startDate.setDate(today.getDate() - 364);
  
  // Align to Sunday
  const startDayOfWeek = startDate.getDay();
  startDate.setDate(startDate.getDate() - startDayOfWeek);
  
  const currentDate = new Date(startDate);
  
  // Generate days until the coming Saturday to complete the last column
  const targetEnd = new Date(today);
  const endDayOfWeek = targetEnd.getDay();
  targetEnd.setDate(targetEnd.getDate() + (6 - endDayOfWeek));
  
  while (currentDate <= targetEnd) {
    days.push(new Date(currentDate));
    currentDate.setDate(currentDate.getDate() + 1);
  }
  
  return days;
};

// Heatmap Sub-component styled premium
function ActiveDaysHeatmap({ activityLogs, userId, username }) {
  const days = getCalendarDays();
  const weeks = [];
  for (let i = 0; i < days.length; i += 7) {
    weeks.push(days.slice(i, i + 7));
  }

  return (
    <div className="bg-black/25 border border-white/5 rounded-3xl p-6 shadow-xl space-y-4">
      <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-3">
        <h4 className="text-xs font-bold text-text-muted uppercase tracking-wider">
          Contribution Calendar: {username}
        </h4>
        <div className="flex items-center gap-2 text-[10px] text-text-muted select-none">
          <span>Less</span>
          <div className="w-[11px] h-[11px] rounded-[3px] bg-white/5 border border-white/5" />
          <div className="w-[11px] h-[11px] rounded-[3px] bg-emerald-950 border border-emerald-900/20" />
          <div className="w-[11px] h-[11px] rounded-[3px] bg-emerald-800" />
          <div className="w-[11px] h-[11px] rounded-[3px] bg-emerald-600" />
          <div className="w-[11px] h-[11px] rounded-[3px] bg-emerald-400" />
          <span>More</span>
        </div>
      </div>
      
      <div className="overflow-x-auto pb-2 scrollbar-thin">
        <div className="flex gap-[4px] min-w-[620px]">
          {weeks.map((week, weekIndex) => (
            <div key={weekIndex} className="flex flex-col gap-[4px] shrink-0">
              {week.map((day, dayIndex) => {
                const dateString = day.toISOString().split('T')[0];
                const log = activityLogs.find(
                  (l) => l.userId === userId && l.date === dateString
                );
                const count = log ? log.count : 0;

                let colorClass = 'bg-white/5 border border-white/5';
                if (count > 0 && count <= 2) colorClass = 'bg-emerald-950 border border-emerald-900/20';
                else if (count > 2 && count <= 4) colorClass = 'bg-emerald-800';
                else if (count > 4 && count <= 6) colorClass = 'bg-emerald-600';
                else if (count > 6) colorClass = 'bg-emerald-400';

                return (
                  <div
                    key={dayIndex}
                    className={`w-[11px] h-[11px] rounded-[3px] transition-all duration-200 hover:scale-125 cursor-help ${colorClass}`}
                    title={`${day.toLocaleDateString(undefined, {
                      day: 'numeric',
                      month: 'short',
                      year: 'numeric',
                    })}: ${count} activities`}
                  />
                );
              })}
            </div>
          ))}
        </div>

        {/* Month labels at bottom */}
        <div className="flex gap-[4px] min-w-[620px] text-[9px] text-text-muted mt-2 select-none font-sans relative h-4">
          {weeks.map((week, index) => {
            const isFirstWeekOfMonth =
              index === 0 ||
              week[0].getMonth() !== weeks[index - 1][0].getMonth();
            return (
              <div key={index} className="w-[11px] shrink-0 relative">
                {isFirstWeekOfMonth && (
                  <span className="absolute left-0 top-0 whitespace-nowrap text-text-muted/80">
                    {week[0].toLocaleDateString(undefined, { month: 'short' })}
                  </span>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

function Dashboard({ user, onLogout }) {
  const { roomCode } = useParams();
  const navigate = useNavigate();
  const socketRef = useRef(null);

  // Layout / Navigation State
  const [activeTab, setActiveTab] = useState(() => {
    return localStorage.getItem(`todo_active_tab_${roomCode}`) || 'dashboard';
  });
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Connection & Data States
  const [room, setRoom] = useState(null);
  const [tasks, setTasks] = useState([]);
  const [applications, setApplications] = useState([]);
  const [activityLogs, setActivityLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [copied, setCopied] = useState(false);
  const [socketConnected, setSocketConnected] = useState(false);

  // Form States
  const [taskTitle, setTaskTitle] = useState('');
  const [newAppUrl, setNewAppUrl] = useState('');
  const [newAppTips, setNewAppTips] = useState('');
  const [newAppStatus, setNewAppStatus] = useState('ongoing');

  // Search, Filter & Heatmap View Options
  const [appSearch, setAppSearch] = useState('');
  const [appFilter, setAppFilter] = useState('all');
  const [heatmapUserFilter, setHeatmapUserFilter] = useState(user._id);

  // Save active tab on change
  useEffect(() => {
    localStorage.setItem(`todo_active_tab_${roomCode}`, activeTab);
  }, [activeTab, roomCode]);

  // Fetch Room, tasks, applications, and activity logs on mount
  useEffect(() => {
    const fetchRoomData = async () => {
      try {
        setLoading(true);
        setError('');

        // 1. Fetch Room Details by Code
        const roomRes = await fetch(`${API_BASE}/rooms/code/${roomCode}`);
        const roomData = await roomRes.json();

        if (!roomRes.ok || !roomData.success) {
          setError(roomData.error || 'Failed to fetch room details');
          setLoading(false);
          return;
        }

        const roomInfo = roomData.data;
        setRoom(roomInfo);

        // 2. Fetch Tasks of the Room
        const tasksRes = await fetch(`${API_BASE}/rooms/${roomInfo._id}/tasks`);
        const tasksData = await tasksRes.json();

        if (tasksRes.ok && tasksData.success) {
          setTasks(tasksData.data);
        }

        // 3. Fetch Applications of the Room
        const appsRes = await fetch(`${API_BASE}/rooms/${roomInfo._id}/applications`);
        const appsData = await appsRes.json();

        if (appsRes.ok && appsData.success) {
          setApplications(appsData.data);
        }

        // 4. Fetch Activity Logs
        const actRes = await fetch(`${API_BASE}/rooms/${roomInfo._id}/activity`);
        const actData = await actRes.json();

        if (actRes.ok && actData.success) {
          setActivityLogs(actData.data);
        }
      } catch (err) {
        setError('Network error. Failed to connect to server.');
      } finally {
        setLoading(false);
      }
    };

    fetchRoomData();
  }, [roomCode]);

  // Setup Socket Connection & Real-Time Event Listeners
  useEffect(() => {
    if (!room) return;

    const socket = io(SOCKET_URL, {
      reconnectionAttempts: 5,
      reconnectionDelay: 2000,
    });
    socketRef.current = socket;

    socket.on('connect', () => {
      setSocketConnected(true);
      toast.success('Connected to sync engine.', { id: 'socket-status' });
      socket.emit('join_room', { roomCode });
    });

    socket.on('disconnect', (reason) => {
      setSocketConnected(false);
      if (reason === 'io server disconnect' || reason === 'io client disconnect') {
        toast.error('Session closed by server.', { id: 'socket-status' });
      } else {
        toast.error('Connection lost. Reconnecting...', { id: 'socket-status' });
      }
    });

    socket.on('connect_error', () => {
      setSocketConnected(false);
      toast.error('Sync pipeline offline. Trying to reconnect...', { id: 'socket-status' });
    });

    // Task Listeners
    socket.on('task_added', (newTask) => {
      setTasks((prev) => [newTask, ...prev]);
      toast.success(`New goal added: "${newTask.title}"`, { 
        icon: '🎯',
        id: `task-add-${newTask._id}` 
      });
    });

    const partnerId = room?.participants?.find((p) => p._id !== user._id)?._id;
    const partnerName = room?.participants?.find((p) => p._id !== user._id)?.username;

    socket.on('task_updated', (updatedTask) => {
      setTasks((prev) => {
        const oldTask = prev.find(t => t._id === updatedTask._id);
        if (oldTask && partnerId && partnerName) {
          const oldPartnerCompleted = oldTask.status ? !!oldTask.status[partnerId] : false;
          const newPartnerCompleted = updatedTask.status ? !!updatedTask.status[partnerId] : false;
          
          if (oldPartnerCompleted !== newPartnerCompleted) {
            if (newPartnerCompleted) {
              toast.success(`${partnerName} finished: "${updatedTask.title}"`, { icon: '✅' });
            } else {
              toast.success(`${partnerName} marked pending: "${updatedTask.title}"`, { icon: '⚠️' });
            }
          }
        }
        return prev.map((t) => (t._id === updatedTask._id ? updatedTask : t));
      });
    });

    // Application Listeners
    socket.on('application_added', (newApp) => {
      setApplications((prev) => [newApp, ...prev]);
      toast.success(`New application added: "${newApp.url}"`, { 
        icon: '💼',
        id: `app-add-${newApp._id}` 
      });
    });

    socket.on('application_updated', (updatedApp) => {
      setApplications((prev) => prev.map((a) => (a._id === updatedApp._id ? updatedApp : a)));
      toast.success(`Application tracker updated`, {
        icon: '🔄',
        id: `app-update-${updatedApp._id}`
      });
    });

    socket.on('application_deleted', (appId) => {
      setApplications((prev) => prev.filter((a) => a._id !== appId));
      toast.success(`Application removed`, {
        icon: '🗑️',
        id: `app-delete-${appId}`
      });
    });

    // Activity Log Listener
    socket.on('activity_updated', (updatedLog) => {
      setActivityLogs((prev) => {
        const exists = prev.some((l) => l._id === updatedLog._id);
        if (exists) {
          return prev.map((l) => (l._id === updatedLog._id ? updatedLog : l));
        } else {
          return [...prev, updatedLog];
        }
      });
    });

    return () => {
      if (socket) {
        socket.disconnect();
      }
    };
  }, [room, roomCode, user._id]);

  // Copy Room Code
  const handleCopyCode = () => {
    navigator.clipboard.writeText(roomCode);
    setCopied(true);
    toast.success('Room code copied to clipboard!');
    setTimeout(() => setCopied(false), 2000);
  };

  // Task Handlers
  const handleToggle = (taskId, targetUserId) => {
    if (targetUserId !== user._id) return;
    
    if (!socketConnected || !socketRef.current) {
      toast.error('Action failed: disconnected from workspace.');
      return;
    }

    const task = tasks.find(t => t._id === taskId);
    if (!task) return;

    const currentStatus = task.status ? !!task.status[user._id] : false;

    socketRef.current.emit('toggle_task', {
      taskId,
      userId: user._id,
      isCompleted: !currentStatus,
      roomCode
    });
  };

  const handleAddTask = (e) => {
    e.preventDefault();
    if (!taskTitle.trim() || !room) return;

    if (!socketConnected || !socketRef.current) {
      toast.error('Action failed: disconnected from workspace.');
      return;
    }

    socketRef.current.emit('add_task', {
      roomId: room._id,
      roomCode,
      title: taskTitle.trim(),
      userId: user._id,
      status: {},
    });
    setTaskTitle('');
  };

  // Application Handlers
  const handleAddApplication = (e) => {
    e.preventDefault();
    if (!newAppUrl.trim() || !room) {
      toast.error('Please enter a valid URL');
      return;
    }

    if (!socketConnected || !socketRef.current) {
      toast.error('Action failed: disconnected from workspace.');
      return;
    }

    socketRef.current.emit('add_application', {
      roomId: room._id,
      roomCode,
      url: newAppUrl.trim(),
      status: newAppStatus,
      tips: newAppTips.trim(),
      userId: user._id,
    });

    setNewAppUrl('');
    setNewAppTips('');
    setNewAppStatus('ongoing');
    toast.success('Adding application...');
  };

  const handleUpdateStatus = (appId, statusValue) => {
    if (!socketConnected || !socketRef.current) {
      toast.error('Action failed: disconnected from workspace.');
      return;
    }

    socketRef.current.emit('update_application', {
      applicationId: appId,
      roomCode,
      updateData: { status: statusValue },
      userId: user._id,
    });
  };

  const handleUpdateTips = (appId, tipsValue) => {
    if (!socketConnected || !socketRef.current) {
      toast.error('Action failed: disconnected from workspace.');
      return;
    }

    socketRef.current.emit('update_application', {
      applicationId: appId,
      roomCode,
      updateData: { tips: tipsValue },
      userId: user._id,
    });
  };

  const handleDeleteApplication = (appId) => {
    if (!socketConnected || !socketRef.current) {
      toast.error('Action failed: disconnected from workspace.');
      return;
    }

    if (window.confirm('Delete this application entry?')) {
      socketRef.current.emit('delete_application', {
        applicationId: appId,
        roomCode,
        userId: user._id,
      });
    }
  };

  // Participant Data
  const partner = room?.participants?.find((p) => p._id !== user._id);

  // Task Classification
  const activeTasks = tasks.filter(t => {
    const userCompleted = t.status ? !!t.status[user._id] : false;
    const partnerCompleted = partner && t.status ? !!t.status[partner._id] : false;
    return partner ? !(userCompleted && partnerCompleted) : !userCompleted;
  });

  const completedTasks = tasks.filter(t => {
    const userCompleted = t.status ? !!t.status[user._id] : false;
    const partnerCompleted = partner && t.status ? !!t.status[partner._id] : false;
    return partner ? (userCompleted && partnerCompleted) : userCompleted;
  });

  // Calculate Metrics
  const totalTasks = tasks.length;
  const userACompleted = tasks.filter(t => t.status && t.status[user._id]).length;
  const userBCompleted = partner ? tasks.filter(t => t.status && t.status[partner._id]).length : 0;

  const userAPercentage = totalTasks > 0 ? Math.round((userACompleted / totalTasks) * 100) : 0;
  const userBPercentage = totalTasks > 0 ? Math.round((userBCompleted / totalTasks) * 100) : 0;

  const completedCount = completedTasks.length;
  const completionPercentage = totalTasks > 0 ? Math.round((completedCount / totalTasks) * 100) : 0;

  // Chart Data (Yellow line and Grey line matching the reference image)
  const chartData = [
    {
      name: 'Start Point',
      'You': 0,
      [partner ? partner.username : 'Partner']: 0
    },
    {
      name: 'Current Progress',
      'You': userAPercentage,
      [partner ? partner.username : 'Partner']: userBPercentage
    }
  ];

  // Filter & Search Applications
  const filteredApps = applications.filter(app => {
    const query = appSearch.toLowerCase().trim();
    const matchesSearch = app.url.toLowerCase().includes(query) || app.tips.toLowerCase().includes(query);
    const matchesFilter = appFilter === 'all' ? true : app.status === appFilter;
    return matchesSearch && matchesFilter;
  });

  // Active Days Calculation
  const userActiveDays = new Set(
    activityLogs.filter(l => l.userId === user._id && l.count > 0).map(l => l.date)
  ).size;

  const partnerActiveDays = partner ? new Set(
    activityLogs.filter(l => l.userId === partner._id && l.count > 0).map(l => l.date)
  ).size : 0;

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#0b0c0e] text-text-muted">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="animate-spin text-brand-orange" size={40} />
          <p className="text-sm font-semibold tracking-wider">Synchronizing Workspace...</p>
        </div>
      </div>
    );
  }

  if (error || !room) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#0b0c0e] px-4">
        <div className="premium-card p-8 max-w-md w-full text-center relative overflow-hidden">
          <AlertCircle className="mx-auto text-brand-orange mb-4" size={48} />
          <h2 className="text-xl font-bold text-white mb-2">Failed to Enter Room</h2>
          <p className="text-text-muted text-xs mb-6">{error || 'Room not found.'}</p>
          <button
            onClick={() => navigate('/lobby')}
            className="flex items-center justify-center gap-2 w-full py-3 px-4 bg-white/5 border border-white/10 hover:bg-white/10 text-white rounded-xl transition-all cursor-pointer text-sm font-bold"
          >
            <ArrowLeft className="w-4 h-4" /> Return to Lobby
          </button>
        </div>
      </div>
    );
  }

  // Navigation tabs for the premium header
  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'goals', label: 'Goals Room', icon: ClipboardList, badge: activeTasks.length },
    { id: 'progress', label: 'Sync Progress', icon: TrendingUp },
    { id: 'applications', label: 'Applications', icon: Briefcase, badge: applications.length },
  ];

  return (
    <div className="min-h-screen bg-[#0b0c0e] text-white flex flex-col font-sans selection:bg-brand-orange/30 selection:text-white relative overflow-x-hidden">
      {/* Mesh glowing gradient overlays */}
      <div className="absolute top-0 right-1/4 w-[700px] h-[700px] bg-brand-orange/5 rounded-full blur-[140px] pointer-events-none animate-pulse" style={{ animationDuration: '15s' }} />
      <div className="absolute bottom-0 left-1/4 w-[700px] h-[700px] bg-brand-blue/5 rounded-full blur-[140px] pointer-events-none animate-pulse" style={{ animationDuration: '20s' }} />

      {/* TOP NAVIGATION HEADER (Inspired by Level in reference image) */}
      <header className="border-b border-white/5 bg-[#0b0c0e]/80 backdrop-blur-md sticky top-0 z-40 py-4 px-4 md:px-8">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          {/* Logo */}
          <div className="flex items-center gap-2.5 cursor-pointer" onClick={() => setActiveTab('dashboard')}>
            <span className="p-2 bg-gradient-to-br from-brand-orange to-brand-blue rounded-xl text-white shadow-md">
              <Sprout size={18} className="stroke-[2.5]" />
            </span>
            <span className="text-lg font-bold tracking-tight text-white">
              Grow <span className="bg-gradient-to-r from-brand-orange to-brand-blue bg-clip-text text-transparent">Together</span>
            </span>
          </div>

          {/* Center Navigation Links (Hidden on mobile) */}
          <nav className="hidden md:flex items-center gap-1.5 bg-white/5 border border-white/10 p-1 rounded-2xl">
            {navItems.map((item) => {
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id)}
                  className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                    isActive 
                      ? 'bg-white/5 border border-white/10 text-white shadow-sm' 
                      : 'text-text-muted hover:text-white border border-transparent'
                  }`}
                >
                  {item.label}
                  {item.badge !== undefined && item.badge > 0 && (
                    <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded-md ${isActive ? 'bg-brand-orange text-white' : 'bg-white/10 text-text-muted'}`}>
                      {item.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>

          {/* Right Side: Profile Dropdown + Leave Workspace */}
          <div className="flex items-center gap-3">
            {/* User Pill */}
            <div className="hidden sm:flex items-center gap-2 bg-white/5 border border-white/10 px-3.5 py-1.5 rounded-2xl">
              <div className="w-5 h-5 rounded-full bg-brand-orange/20 border border-brand-orange/40 flex items-center justify-center text-brand-orange text-[10px] font-bold">
                {user.username.substring(0, 2).toUpperCase()}
              </div>
              <span className="text-xs font-bold text-white">{user.username}</span>
            </div>

            {/* About Link */}
            <Link
              to="/about"
              className="flex items-center gap-1.5 text-xs font-bold text-text-muted hover:text-white transition-all bg-white/5 border border-white/10 hover:border-white/20 px-3 py-2 rounded-xl cursor-pointer"
              title="About the developer & project"
            >
              <Info size={13} />
              <span className="hidden sm:inline">About</span>
            </Link>

            {/* Leave Room Action */}
            <button
              onClick={() => navigate('/lobby')}
              className="flex items-center gap-1.5 text-xs font-bold text-text-muted hover:text-white transition-all bg-white/5 hover:bg-red-500/10 border border-white/10 hover:border-red-500/20 px-3 py-2 rounded-xl cursor-pointer"
              title="Leave Room Workspace"
            >
              <LogOut size={13} />
              <span className="hidden sm:inline">Leave Room</span>
            </button>

            {/* Hamburger Button for Mobile */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 text-text-muted hover:text-white border border-white/10 rounded-xl md:hidden cursor-pointer bg-white/5"
            >
              {mobileMenuOpen ? <X size={18} /> : <Menu size={18} />}
            </button>
          </div>
        </div>
      </header>

      {/* MOBILE NAVIGATION DRAWER */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 top-[65px] bg-[#0b0c0e]/95 backdrop-blur-xl z-30 md:hidden flex flex-col justify-between p-6 animate-fade-in border-t border-white/5">
          <div className="space-y-6">
            <div className="flex items-center gap-3 bg-white/5 border border-white/10 p-4 rounded-2xl">
              <div className="w-8 h-8 rounded-full bg-brand-orange/20 border border-brand-orange/40 flex items-center justify-center text-brand-orange text-xs font-bold">
                {user.username.substring(0, 2).toUpperCase()}
              </div>
              <div>
                <p className="text-sm font-bold text-white">{user.username}</p>
                <p className="text-[10px] text-text-muted">Host Collaborator</p>
              </div>
            </div>

            <nav className="space-y-2">
              <p className="text-[10px] font-bold tracking-widest text-text-muted/60 uppercase px-3">Workspace Menu</p>
              {navItems.map((item) => {
                const Icon = item.icon;
                const isActive = activeTab === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => {
                      setActiveTab(item.id);
                      setMobileMenuOpen(false);
                    }}
                    className={`w-full flex items-center justify-between px-4 py-3.5 rounded-xl text-sm font-bold transition-all cursor-pointer ${
                      isActive 
                        ? 'bg-white/5 border border-white/10 text-white' 
                        : 'text-text-muted hover:text-white hover:bg-white/5'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <Icon size={18} className={isActive ? 'text-brand-orange' : 'text-text-muted'} />
                      <span>{item.label}</span>
                    </div>
                    {item.badge !== undefined && item.badge > 0 && (
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-white/10 text-text-muted">
                        {item.badge}
                      </span>
                    )}
                  </button>
                );
              })}
              
              {/* About Link in Drawer */}
              <Link
                to="/about"
                className="w-full flex items-center justify-between px-4 py-3.5 rounded-xl text-sm font-bold text-text-muted hover:text-white hover:bg-white/5 transition-all cursor-pointer"
              >
                <div className="flex items-center gap-3">
                  <Info size={18} className="text-text-muted" />
                  <span>About Project & Dev</span>
                </div>
              </Link>
            </nav>

            {/* Sync connection status card on mobile */}
            <div className="bg-white/5 border border-white/10 rounded-2xl p-4 space-y-3">
              <div className="flex justify-between items-center text-xs text-text-muted">
                <span className="font-bold uppercase tracking-wider text-[10px]">Sync Engine Status</span>
                <span className={`w-2 h-2 rounded-full ${socketConnected ? 'bg-emerald-500 animate-pulse' : 'bg-red-500 animate-pulse'}`} />
              </div>
              <div className="flex items-center justify-between bg-black/30 border border-white/5 px-3 py-2 rounded-xl">
                <span className="font-mono text-xs text-brand-orange font-bold">{roomCode}</span>
                <button 
                  onClick={handleCopyCode}
                  className="text-text-muted hover:text-white p-1 hover:bg-white/5 rounded-lg transition-colors cursor-pointer"
                >
                  {copied ? <Check size={14} className="text-emerald-400" /> : <Copy size={14} />}
                </button>
              </div>
            </div>
          </div>

          <button
            onClick={() => {
              setMobileMenuOpen(false);
              navigate('/lobby');
            }}
            className="w-full py-3.5 bg-red-500/10 border border-red-500/20 text-red-400 font-bold rounded-xl active:scale-[0.98] transition-all text-xs cursor-pointer"
          >
            Leave Workspace Room
          </button>
        </div>
      )}

      {/* SUB-HEADER / METRICS ROW */}
      <section className="bg-black/15 py-4 px-4 md:px-8 border-b border-white/5">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h2 className="text-lg font-bold text-white flex items-center gap-2 capitalize">
              {activeTab === 'dashboard' && <>📊 Workspace Dashboard</>}
              {activeTab === 'goals' && <>🎯 Goals Room</>}
              {activeTab === 'progress' && <>📈 Sync Performance</>}
              {activeTab === 'applications' && <>💼 Applications Management</>}
            </h2>
            <p className="text-xs text-text-muted">Room Code: <b className="font-mono text-white">{roomCode}</b> &bull; Real-time active collaboration</p>
          </div>

          {/* Right actions: Copy button and socket connection */}
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1.5 bg-white/5 border border-white/10 pl-3 pr-2.5 py-1.5 rounded-xl">
              <span className="text-[11px] font-mono text-brand-orange font-bold uppercase tracking-wider">Room {roomCode}</span>
              <button 
                onClick={handleCopyCode}
                className="text-text-muted hover:text-white p-1 hover:bg-white/5 rounded-lg transition-all cursor-pointer"
                title="Copy Room Code"
              >
                {copied ? <Check size={12} className="text-emerald-400" /> : <Copy size={12} />}
              </button>
            </div>
            
            <div className="flex items-center gap-1.5 bg-white/5 border border-white/10 px-3 py-1.5 rounded-xl">
              <span className={`w-2 h-2 rounded-full ${socketConnected ? 'bg-emerald-500 animate-pulse' : 'bg-red-500 animate-pulse'}`} />
              <span className="text-[11px] font-bold text-text-muted uppercase tracking-wider">{socketConnected ? 'Connected' : 'Offline'}</span>
            </div>
          </div>
        </div>
      </section>

      {/* MAIN VIEW AREA */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 md:px-8 py-8">
        
        {/* TAB 0: DASHBOARD OVERVIEW */}
        {activeTab === 'dashboard' && (
          <div className="space-y-8 animate-fade-in">
            {/* Welcome banner with simple dark styling */}
            <div className="premium-card p-6 md:p-8 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 relative overflow-hidden">
              <div className="absolute top-0 right-0 w-[250px] h-[250px] bg-brand-orange/5 rounded-full blur-[50px] pointer-events-none" />
              <div className="space-y-1">
                <h3 className="text-xl md:text-2xl font-bold text-white">
                  Welcome, <span className="bg-gradient-to-r from-brand-orange to-brand-blue bg-clip-text text-transparent">{user.username}</span>!
                </h3>
                <p className="text-xs text-text-muted">Here's a snapshot of your collaborative room progress today.</p>
              </div>
              
              {/* Partner presence */}
              <div className="flex items-center gap-2 bg-white/5 border border-white/10 p-3 rounded-2xl">
                <span className={`w-2 h-2 rounded-full ${partner ? 'bg-emerald-500' : 'bg-amber-500 animate-pulse'}`} />
                <span className="text-xs font-bold text-text-muted">
                  {partner ? `Synced with ${partner.username}` : 'Waiting for partner...'}
                </span>
              </div>
            </div>

            {/* Main grid styled like the reference image */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              
              {/* Left Column: 2 Stacked Metrics Cards (lviUSD card design style) */}
              <div className="space-y-6 flex flex-col justify-between">
                
                {/* Metric Card 1: Your stats */}
                <div className="premium-card premium-card-glow-orange p-6 flex-1 flex flex-col justify-between h-44 relative">
                  <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-brand-orange/15 to-transparent" />
                  <div className="flex items-start gap-4">
                    {/* Circle Icon */}
                    <div className="w-10 h-10 rounded-2xl bg-brand-orange/10 border border-brand-orange/20 flex items-center justify-center text-brand-orange">
                      <Activity size={18} className="stroke-[2.5]" />
                    </div>
                    <div>
                      <h4 className="text-xs font-bold text-text-muted uppercase tracking-wider">Your Active Days</h4>
                      <p className="text-3xl font-black text-white mt-1">{userActiveDays} Days</p>
                    </div>
                  </div>
                  <div className="flex justify-between items-center text-[10px] text-text-muted/80 pt-4 border-t border-white/5">
                    <span>Task completion active tracking</span>
                    <span className="text-brand-orange font-bold">{userACompleted} Goals Done</span>
                  </div>
                </div>

                {/* Metric Card 2: Partner stats */}
                <div className="premium-card premium-card-glow-blue p-6 flex-1 flex flex-col justify-between h-44 relative">
                  <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-brand-blue/15 to-transparent" />
                  <div className="flex items-start gap-4">
                    {/* Circle Icon */}
                    <div className="w-10 h-10 rounded-2xl bg-brand-blue/10 border border-brand-blue/20 flex items-center justify-center text-brand-blue">
                      <Users size={18} className="stroke-[2.5]" />
                    </div>
                    <div>
                      <h4 className="text-xs font-bold text-text-muted uppercase tracking-wider">Partner Active Days</h4>
                      <p className="text-3xl font-black text-white mt-1">
                        {partner ? `${partnerActiveDays} Days` : '--'}
                      </p>
                    </div>
                  </div>
                  <div className="flex justify-between items-center text-[10px] text-text-muted/80 pt-4 border-t border-white/5">
                    <span>{partner ? `${partner.username}'s active tracking` : 'Workspace status'}</span>
                    <span className="text-brand-blue font-bold">
                      {partner ? `${userBCompleted} Goals Done` : 'Awaiting sync'}
                    </span>
                  </div>
                </div>

              </div>

              {/* Right Column: Chart (inspired by Market Cap line chart in reference image) */}
              <div className="lg:col-span-2 premium-card p-6 flex flex-col justify-between min-h-[360px]">
                <div className="flex justify-between items-center border-b border-white/5 pb-4 mb-4">
                  <div>
                    <h3 className="text-xs font-bold text-text-muted uppercase tracking-wider">Sync Progress Overview</h3>
                    <p className="text-lg font-black text-white mt-0.5">Workspace Sync Rate</p>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="flex items-center gap-1 text-[10px] font-bold text-text-muted">
                      <span className="w-2 h-2 rounded-full bg-brand-orange" /> You
                    </span>
                    {partner && (
                      <span className="flex items-center gap-1 text-[10px] font-bold text-text-muted">
                        <span className="w-2 h-2 rounded-full bg-brand-blue" /> {partner.username}
                      </span>
                    )}
                  </div>
                </div>

                {totalTasks === 0 ? (
                  <div className="h-64 flex flex-col items-center justify-center text-text-muted text-xs border border-dashed border-white/5 rounded-2xl p-6">
                    <ClipboardList size={30} className="mb-2 opacity-50" />
                    <span>No goals logged in this room yet. Go to Goals Room to start!</span>
                  </div>
                ) : (
                  <div className="h-64 w-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -25, bottom: 5 }}>
                        <defs>
                          <linearGradient id="colorYou" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#ff5a1f" stopOpacity={0.25}/>
                            <stop offset="95%" stopColor="#ff5a1f" stopOpacity={0}/>
                          </linearGradient>
                          <linearGradient id="colorPartner" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#1f8cff" stopOpacity={0.25}/>
                            <stop offset="95%" stopColor="#1f8cff" stopOpacity={0}/>
                          </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" stroke="#222" opacity={0.3} vertical={false} />
                        <XAxis 
                          dataKey="name" 
                          stroke="#555" 
                          fontSize={10} 
                          tickLine={false} 
                          axisLine={false} 
                          padding={{ left: 20, right: 20 }}
                        />
                        <YAxis 
                          stroke="#555" 
                          fontSize={10} 
                          tickLine={false} 
                          axisLine={false} 
                          domain={[0, 100]} 
                          tickFormatter={(val) => `${val}%`}
                        />
                        <Tooltip 
                          contentStyle={{ 
                            backgroundColor: '#161719', 
                            borderColor: 'rgba(255,255,255,0.05)', 
                            borderRadius: '16px',
                            fontSize: '11px',
                            color: '#fff',
                            boxShadow: '0 10px 15px -3px rgba(0,0,0,0.5)'
                          }}
                        />
                        
                        {/* Area for User (Orange with glow gradient fill) */}
                        <Area 
                          type="monotone" 
                          dataKey="You" 
                          stroke="#ff5a1f" 
                          strokeWidth={2.5} 
                          fillOpacity={1}
                          fill="url(#colorYou)"
                          activeDot={{ r: 6, stroke: '#ff5a1f', strokeWidth: 1, fill: '#0b0c0e' }} 
                          dot={{ stroke: '#ff5a1f', strokeWidth: 1.5, r: 4, fill: '#0b0c0e' }}
                        />
                        
                        {/* Area for Partner (Blue with glow gradient fill) */}
                        <Area 
                          type="monotone" 
                          dataKey={partner ? partner.username : 'Partner'} 
                          stroke="#1f8cff" 
                          strokeWidth={2.5} 
                          fillOpacity={1}
                          fill="url(#colorPartner)"
                          activeDot={{ r: 6, stroke: '#1f8cff', strokeWidth: 1, fill: '#0b0c0e' }} 
                          dot={{ stroke: '#1f8cff', strokeWidth: 1.5, r: 4, fill: '#0b0c0e' }}
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
                    className="premium-card p-6 hover:border-white/10 transition-all duration-300 cursor-pointer group flex flex-col justify-between h-44 relative overflow-hidden"
                  >
                    <div className="space-y-2">
                      <div className="w-9 h-9 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-text-muted group-hover:text-white transition-colors">
                        <Icon size={16} />
                      </div>
                      <h4 className="text-sm font-bold text-white group-hover:text-brand-orange transition-colors">{item.label}</h4>
                      <p className="text-[11px] text-text-muted leading-relaxed">
                        {item.id === 'goals' && "Create tasks, toggle checkmarks, and track sync statuses collaboratively."}
                        {item.id === 'progress' && "Analyze partner sync rates, active days grids, and performance logs."}
                        {item.id === 'applications' && "Log application URLs, review ongoing status tags, and add custom notes."}
                      </p>
                    </div>
                    <div className="flex items-center justify-between pt-3 border-t border-white/5 text-[10px] text-text-muted">
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
              <h3 className="text-xs font-bold text-text-muted uppercase tracking-wider">Workspace Heatmap</h3>
              <ActiveDaysHeatmap activityLogs={activityLogs} userId={user._id} username={`${user.username} (You)`} />
            </div>

          </div>
        )}

        {/* TAB 1: GOALS VIEW */}
        {activeTab === 'goals' && (
          <div className="space-y-6 animate-fade-in">
            {/* Input Form Card */}
            <form onSubmit={handleAddTask} className="premium-card p-4 flex gap-3 items-center">
              <input
                type="text"
                placeholder="Log a new collaborative room goal..."
                value={taskTitle}
                onChange={(e) => setTaskTitle(e.target.value)}
                className="flex-1 premium-input px-4 py-3 text-sm focus:border-brand-orange/40"
              />
              <button
                type="submit"
                className="bg-brand-orange hover:bg-brand-orange/95 text-white font-bold px-6 py-3 rounded-xl transition-all cursor-pointer flex items-center gap-1.5 text-sm shrink-0 shadow-lg shadow-brand-orange/10"
              >
                <Plus size={16} /> Add Goal
              </button>
            </form>

            {/* Dual Grid Layout */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              
              {/* Active Goals Column */}
              <div className="space-y-4">
                <div className="flex items-center justify-between border-b border-white/5 pb-3">
                  <h3 className="text-xs font-bold text-text-muted uppercase tracking-wider flex items-center gap-1.5">
                    <ClipboardList size={14} className="text-brand-orange" /> Active Goals ({activeTasks.length})
                  </h3>
                  <span className="text-[10px] bg-brand-orange/10 text-brand-orange border border-brand-orange/20 px-2 py-0.5 rounded-md font-bold">Pending Sync</span>
                </div>

                {activeTasks.length === 0 ? (
                  <div className="premium-card border-dashed p-12 text-center text-text-muted">
                    <CheckCircle size={32} className="mx-auto mb-2 opacity-30 stroke-[1.5]" />
                    <p className="text-xs font-bold text-white mb-0.5">All goals synced & completed!</p>
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
                          className="premium-card p-4 flex items-center justify-between gap-4 hover:border-white/10 transition-all duration-300"
                        >
                          <span className="text-sm font-medium text-white leading-relaxed">
                            {task.title}
                          </span>

                          {/* Dual Checkboxes styled like premium toggle capsules */}
                          <div className="flex items-center gap-3 shrink-0 bg-black/40 p-1.5 rounded-2xl border border-white/5">
                            {/* Checkbox A (Me) */}
                            <div className="flex flex-col items-center gap-1">
                              <button
                                type="button"
                                onClick={() => handleToggle(task._id, user._id)}
                                className={`w-7 h-7 rounded-xl flex items-center justify-center transition-all duration-200 cursor-pointer ${
                                  isCompletedByMe 
                                    ? 'bg-brand-orange text-white shadow-md shadow-brand-orange/10'
                                    : 'border border-white/10 text-transparent hover:border-white/30 hover:bg-white/5'
                                }`}
                                title="Toggle My Status"
                              >
                                <Check size={14} className="stroke-[3]" />
                              </button>
                              <span className="text-[8px] font-bold text-text-muted uppercase tracking-wider">YOU</span>
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
                                      : 'border border-white/10 text-transparent'
                                    : 'border border-dashed border-white/5 text-transparent cursor-not-allowed'
                                }`}
                                title={partner ? `${partner.username}'s Status` : 'Waiting for partner...'}
                              >
                                <Check size={14} className="stroke-[3]" />
                              </button>
                              <span className="text-[8px] font-bold text-text-muted uppercase tracking-wider truncate max-w-[40px]">
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
                <div className="flex items-center justify-between border-b border-white/5 pb-3">
                  <h3 className="text-xs font-bold text-text-muted uppercase tracking-wider flex items-center gap-1.5">
                    <CheckCircle size={14} className="text-emerald-500" /> Completed Goals ({completedTasks.length})
                  </h3>
                  <span className="text-[10px] bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-2 py-0.5 rounded-md font-bold">100% Synced</span>
                </div>

                {completedTasks.length === 0 ? (
                  <div className="premium-card border-dashed p-12 text-center text-text-muted">
                    <Activity size={32} className="mx-auto mb-2 opacity-35 stroke-[1.5] animate-pulse" />
                    <p className="text-xs font-bold text-white mb-0.5">No completed goals yet</p>
                    <p className="text-[10px]">A goal is completed when checked by both collaborators.</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {completedTasks.map(task => {
                      const isCompletedByMe = task.status ? !!task.status[user._id] : false;
                      const isCompletedByPartner = partner && task.status ? !!task.status[partner._id] : false;

                      return (
                        <div 
                          key={task._id}
                          className="premium-card p-4 flex items-center justify-between gap-4 opacity-50 hover:opacity-80 transition-all duration-200"
                        >
                          <span className="text-sm font-medium text-text-muted line-through leading-relaxed">
                            {task.title}
                          </span>

                          {/* Completed Status Checkboxes */}
                          <div className="flex items-center gap-3 shrink-0 bg-black/40 p-1.5 rounded-2xl border border-white/5">
                            {/* Checkbox A (Me) */}
                            <div className="flex flex-col items-center gap-1">
                              <button
                                type="button"
                                onClick={() => handleToggle(task._id, user._id)}
                                className="w-7 h-7 rounded-xl flex items-center justify-center bg-brand-orange/20 text-brand-orange border border-brand-orange/30 cursor-pointer"
                                title="Toggle My Status"
                              >
                                <Check size={14} className="stroke-[3]" />
                              </button>
                              <span className="text-[8px] font-bold text-text-muted uppercase tracking-wider">YOU</span>
                            </div>

                            {/* Checkbox B (Partner) */}
                            <div className="flex flex-col items-center gap-1">
                              <button
                                type="button"
                                disabled
                                className="w-7 h-7 rounded-xl flex items-center justify-center bg-brand-blue/20 text-brand-blue border border-brand-blue/30"
                                title={partner ? `${partner.username}'s Status` : 'Partner status'}
                              >
                                <Check size={14} className="stroke-[3]" />
                              </button>
                              <span className="text-[8px] font-bold text-text-muted uppercase tracking-wider truncate max-w-[40px]">
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
        )}

        {/* TAB 2: PROGRESS VIEW */}
        {activeTab === 'progress' && (
          <div className="space-y-8 animate-fade-in">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
              
              {/* Detailed Progress Line Chart */}
              <div className="lg:col-span-2 premium-card p-6 space-y-4">
                <div className="flex justify-between items-center border-b border-white/5 pb-4">
                  <h3 className="text-xs font-bold text-text-muted uppercase tracking-wider flex items-center gap-1.5">
                    <TrendingUp size={16} className="text-brand-orange" /> Progress Graph Comparison
                  </h3>
                  <span className="text-[10px] text-text-muted flex items-center gap-1">
                    <Info size={11} /> Real-time tracking
                  </span>
                </div>

                {totalTasks === 0 ? (
                  <div className="h-72 flex items-center justify-center text-text-muted text-xs border border-dashed border-white/5 rounded-2xl">
                    No tasks found. Create goals to plot completion chart.
                  </div>
                ) : (
                  <div className="h-72 w-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={chartData} margin={{ top: 20, right: 20, left: -25, bottom: 10 }}>
                        <defs>
                          <linearGradient id="colorYouProgress" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#ff5a1f" stopOpacity={0.25}/>
                            <stop offset="95%" stopColor="#ff5a1f" stopOpacity={0}/>
                          </linearGradient>
                          <linearGradient id="colorPartnerProgress" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#1f8cff" stopOpacity={0.25}/>
                            <stop offset="95%" stopColor="#1f8cff" stopOpacity={0}/>
                          </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" stroke="#222" opacity={0.3} vertical={false} />
                        <XAxis 
                          dataKey="name" 
                          stroke="#555" 
                          fontSize={10} 
                          tickLine={false} 
                          axisLine={false} 
                          padding={{ left: 20, right: 20 }}
                        />
                        <YAxis 
                          stroke="#555" 
                          fontSize={10} 
                          tickLine={false} 
                          axisLine={false} 
                          domain={[0, 100]} 
                          tickFormatter={(val) => `${val}%`}
                        />
                        <Tooltip 
                          contentStyle={{ 
                            backgroundColor: '#161719', 
                            borderColor: 'rgba(255,255,255,0.05)', 
                            borderRadius: '16px',
                            fontSize: '11px',
                            color: '#fff',
                            boxShadow: '0 10px 15px -3px rgba(0,0,0,0.5)'
                          }}
                        />
                        <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }} />
                        
                        <Area 
                          type="monotone" 
                          dataKey="You" 
                          stroke="#ff5a1f" 
                          strokeWidth={3} 
                          fillOpacity={1}
                          fill="url(#colorYouProgress)"
                          activeDot={{ r: 7 }} 
                          dot={{ stroke: '#ff5a1f', strokeWidth: 2, r: 4, fill: '#0b0c0e' }}
                        />
                        
                        <Area 
                          type="monotone" 
                          dataKey={partner ? partner.username : 'Partner'} 
                          stroke="#1f8cff" 
                          strokeWidth={3} 
                          fillOpacity={1}
                          fill="url(#colorPartnerProgress)"
                          activeDot={{ r: 7 }} 
                          dot={{ stroke: '#1f8cff', strokeWidth: 2, r: 4, fill: '#0b0c0e' }}
                        />
                      </AreaChart>
                    </ResponsiveContainer>
                  </div>
                )}
              </div>

              {/* Statistics Panel */}
              <div className="premium-card p-6 space-y-4">
                <h3 className="text-xs font-bold text-text-muted uppercase tracking-wider flex items-center gap-1.5 border-b border-white/5 pb-4">
                  <Users size={16} className="text-brand-blue" /> Room Performance Stats
                </h3>
                
                <div className="space-y-3">
                  <div className="flex justify-between items-center text-xs p-3.5 bg-black/20 border border-white/5 rounded-2xl">
                    <span className="text-text-muted font-bold">Total Workspace Goals</span>
                    <span className="font-extrabold text-white text-sm">{totalTasks}</span>
                  </div>
                  
                  <div className="flex justify-between items-center text-xs p-3.5 bg-black/20 border border-white/5 rounded-2xl">
                    <span className="text-text-muted font-bold">Your Completion Rate</span>
                    <span className="font-extrabold text-brand-orange text-sm">{userACompleted} ({userAPercentage}%)</span>
                  </div>
                  
                  <div className="flex justify-between items-center text-xs p-3.5 bg-black/20 border border-white/5 rounded-2xl">
                    <span className="text-text-muted font-bold">Partner Completion Rate</span>
                    <span className="font-extrabold text-brand-blue text-sm">
                      {partner ? `${userBCompleted} (${userBPercentage}%)` : '--'}
                    </span>
                  </div>

                  <div className="flex justify-between items-center text-xs p-3.5 bg-black/20 border border-white/5 rounded-2xl">
                    <span className="text-text-muted font-bold">100% Synced Tasks</span>
                    <span className="font-extrabold text-white text-sm">{completedCount} ({completionPercentage}%)</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Active Days Heatmap log switcher */}
            <div className="premium-card p-6 space-y-4">
              <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-3 border-b border-white/5 pb-4">
                <h3 className="text-xs font-bold text-text-muted uppercase tracking-wider flex items-center gap-1.5">
                  <Calendar size={16} className="text-brand-orange" /> Member Contribution Calendar
                </h3>
                
                <div className="flex items-center gap-2 self-end">
                  <span className="text-[10px] font-bold text-text-muted uppercase tracking-wider">Show Grid For:</span>
                  <select
                    value={heatmapUserFilter}
                    onChange={(e) => setHeatmapUserFilter(e.target.value)}
                    className="px-3 py-1.5 bg-[#0b0c0e] border border-white/10 rounded-xl text-xs text-white focus:outline-none cursor-pointer"
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
        )}

        {/* TAB 3: APPLICATIONS VIEW */}
        {activeTab === 'applications' && (
          <div className="space-y-6 animate-fade-in">
            
            {/* Add Application Form */}
            <div className="premium-card p-6 relative">
              <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-brand-orange/10 to-transparent" />
              <h3 className="text-xs font-bold text-text-muted uppercase tracking-wider flex items-center gap-1.5 mb-4">
                <Plus size={16} className="text-brand-orange" /> Log New Application Entry
              </h3>
              <form onSubmit={handleAddApplication} className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
                <div className="space-y-1.5">
                  <label className="text-[10px] text-text-muted font-bold uppercase tracking-wider">Application URL</label>
                  <input
                    type="text"
                    placeholder="e.g. google.com/jobs"
                    value={newAppUrl}
                    onChange={(e) => setNewAppUrl(e.target.value)}
                    className="premium-input w-full px-3 py-2 text-xs focus:border-brand-orange/40"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] text-text-muted font-bold uppercase tracking-wider">Status</label>
                  <select
                    value={newAppStatus}
                    onChange={(e) => setNewAppStatus(e.target.value)}
                    className="w-full px-3 py-2 bg-black/20 border border-white/10 rounded-xl text-xs text-white focus:outline-none cursor-pointer"
                  >
                    <option value="ongoing" className="bg-[#161719]">Ongoing</option>
                    <option value="accepted" className="bg-[#161719]">Accepted</option>
                    <option value="rejected" className="bg-[#161719]">Rejected</option>
                  </select>
                </div>

                <div className="space-y-1.5 md:col-span-3">
                  <label className="text-[10px] text-text-muted font-bold uppercase tracking-wider">Tips / Key Notes</label>
                  <div className="flex flex-col sm:flex-row gap-3">
                    <input
                      type="text"
                      placeholder="Add key notes (resume tailor, contact point, dates)"
                      value={newAppTips}
                      onChange={(e) => setNewAppTips(e.target.value)}
                      className="flex-1 premium-input px-3 py-2 text-xs focus:border-brand-orange/40"
                    />
                    <button
                      type="submit"
                      className="bg-brand-orange hover:bg-brand-orange/95 text-white font-bold px-5 py-2.5 rounded-xl transition-all cursor-pointer flex items-center justify-center gap-1.5 text-xs shrink-0 shadow-lg"
                    >
                      <Plus size={14} /> Save Application
                    </button>
                  </div>
                </div>
              </form>
            </div>

            {/* Search & Filter bar */}
            <div className="flex flex-col sm:flex-row gap-3 items-center justify-between premium-card p-4">
              <div className="relative w-full sm:max-w-xs">
                <span className="absolute inset-y-0 left-0 flex items-center pl-3.5 pointer-events-none text-text-muted">
                  <Search size={14} />
                </span>
                <input
                  type="text"
                  placeholder="Search applications or tips..."
                  value={appSearch}
                  onChange={(e) => setAppSearch(e.target.value)}
                  className="premium-input w-full pl-9 pr-3 py-2 text-xs"
                />
              </div>

              <div className="flex items-center gap-2 w-full sm:w-auto shrink-0 justify-end">
                <Filter size={14} className="text-text-muted" />
                <span className="text-xs text-text-muted font-bold uppercase tracking-wider text-[10px]">Filter:</span>
                <select
                  value={appFilter}
                  onChange={(e) => setAppFilter(e.target.value)}
                  className="px-3 py-1.5 bg-[#0b0c0e] border border-white/10 rounded-xl text-xs text-white focus:outline-none cursor-pointer"
                >
                  <option value="all">All Statuses</option>
                  <option value="ongoing">Ongoing</option>
                  <option value="accepted">Accepted</option>
                  <option value="rejected">Rejected</option>
                </select>
              </div>
            </div>

            {/* Responsive Application entries list */}
            {/* 1. Desktop & Tablet View (HTML Table) */}
            <div className="hidden md:block premium-card overflow-hidden shadow-2xl">
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-black/40 border-b border-white/5 text-text-muted text-[10px] font-bold uppercase tracking-wider">
                      <th className="py-4 px-6 text-center w-16">Sr. No.</th>
                      <th className="py-4 px-6 w-32">Date</th>
                      <th className="py-4 px-6 min-w-[200px]">URL</th>
                      <th className="py-4 px-6 w-44">Status</th>
                      <th className="py-4 px-6 min-w-[220px]">Tips / Notes</th>
                      <th className="py-4 px-6 text-center w-20">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5">
                    {filteredApps.length === 0 ? (
                      <tr>
                        <td colSpan="6" className="py-12 px-6 text-center text-text-muted text-xs">
                          {applications.length === 0 ? 'No applications logged yet.' : 'No results matching search and filter.'}
                        </td>
                      </tr>
                    ) : (
                      filteredApps.map((app, index) => {
                        const formattedDate = new Date(app.date).toLocaleDateString(undefined, { 
                          day: '2-digit', 
                          month: 'short', 
                          year: 'numeric' 
                        });

                        const actualUrl = app.url.startsWith('http') ? app.url : `https://${app.url}`;

                        return (
                          <tr key={app._id} className="hover:bg-white/5 transition-all text-xs text-white">
                            {/* Sr No */}
                            <td className="py-4 px-6 text-center font-bold text-text-muted/60 font-mono">
                              {index + 1}
                            </td>

                            {/* Date */}
                            <td className="py-4 px-6 text-text-muted font-medium">
                              <span className="flex items-center gap-1.5 whitespace-nowrap">
                                <Calendar size={12} className="text-text-muted/80" />
                                {formattedDate}
                              </span>
                            </td>

                            {/* URL */}
                            <td className="py-4 px-6 font-medium">
                              <div className="flex items-center gap-2 group max-w-xs md:max-w-sm">
                                <a 
                                  href={actualUrl}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="text-brand-blue hover:underline truncate flex items-center gap-1 transition-all"
                                >
                                  {app.url}
                                  <ExternalLink size={11} className="shrink-0 opacity-60 group-hover:opacity-100" />
                                </a>
                              </div>
                            </td>

                            {/* Status Dropdown */}
                            <td className="py-4 px-6">
                              <select
                                value={app.status}
                                onChange={(e) => handleUpdateStatus(app._id, e.target.value)}
                                className={`px-3 py-1.5 rounded-full text-[10px] font-bold border bg-[#0b0c0e] cursor-pointer focus:outline-none transition-all uppercase tracking-wide ${
                                  app.status === 'accepted' 
                                    ? 'border-emerald-500/30 text-emerald-400 bg-emerald-500/10' 
                                    : app.status === 'rejected'
                                      ? 'border-rose-500/30 text-rose-400 bg-rose-500/10'
                                      : 'border-amber-500/30 text-amber-400 bg-amber-500/10'
                                }`}
                              >
                                <option value="ongoing">Ongoing</option>
                                <option value="accepted">Accepted</option>
                                <option value="rejected">Rejected</option>
                              </select>
                            </td>

                            {/* Tips Textbox */}
                            <td className="py-4 px-6">
                              <input
                                type="text"
                                defaultValue={app.tips}
                                onBlur={(e) => {
                                  if (e.target.value !== app.tips) {
                                    handleUpdateTips(app._id, e.target.value);
                                  }
                                }}
                                onKeyDown={(e) => {
                                  if (e.key === 'Enter') {
                                    e.target.blur();
                                  }
                                }}
                                placeholder="Add custom notes..."
                                className="w-full px-3 py-1.5 bg-black/45 border border-white/5 focus:border-white/10 rounded-lg text-xs text-white placeholder-text-muted/40 focus:outline-none transition-all"
                              />
                            </td>

                            {/* Actions */}
                            <td className="py-4 px-6 text-center">
                              <button
                                type="button"
                                onClick={() => handleDeleteApplication(app._id)}
                                className="text-text-muted hover:text-red-400 hover:bg-red-500/15 p-1.5 rounded-lg transition-all cursor-pointer"
                                title="Delete Application Entry"
                              >
                                <Trash2 size={13} />
                              </button>
                            </td>
                          </tr>
                        );
                      })
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            {/* 2. Mobile View (Card List) */}
            <div className="block md:hidden space-y-4">
              {filteredApps.length === 0 ? (
                <div className="premium-card p-8 text-center text-text-muted text-xs">
                  {applications.length === 0 ? 'No applications logged yet.' : 'No results matching search and filter.'}
                </div>
              ) : (
                filteredApps.map((app, index) => {
                  const formattedDate = new Date(app.date).toLocaleDateString(undefined, { 
                    day: '2-digit', 
                    month: 'short', 
                    year: 'numeric' 
                  });

                  const actualUrl = app.url.startsWith('http') ? app.url : `https://${app.url}`;

                  return (
                    <div key={app._id} className="premium-card p-5 space-y-4 relative">
                      {/* Delete action top right */}
                      <button
                        type="button"
                        onClick={() => handleDeleteApplication(app._id)}
                        className="absolute top-4 right-4 text-text-muted hover:text-red-400 p-1.5 hover:bg-red-500/10 rounded-lg transition-all cursor-pointer"
                        title="Delete Application Entry"
                      >
                        <Trash2 size={14} />
                      </button>

                      {/* URL & Index */}
                      <div>
                        <div className="flex items-center gap-1.5 text-text-muted font-mono text-[10px] font-bold mb-1">
                          <span>#{index + 1} &bull;</span>
                          <span className="flex items-center gap-1">
                            <Calendar size={11} />
                            {formattedDate}
                          </span>
                        </div>
                        <a 
                          href={actualUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-brand-blue font-bold text-sm hover:underline flex items-center gap-1 break-all"
                        >
                          {app.url}
                          <ExternalLink size={12} className="shrink-0" />
                        </a>
                      </div>

                      {/* Status Selector */}
                      <div className="grid grid-cols-2 gap-4 items-center border-t border-white/5 pt-3">
                        <span className="text-[10px] text-text-muted font-bold uppercase tracking-wider">Status:</span>
                        <select
                          value={app.status}
                          onChange={(e) => handleUpdateStatus(app._id, e.target.value)}
                          className={`px-3 py-1.5 rounded-full text-[10px] font-bold border bg-[#0b0c0e] cursor-pointer focus:outline-none transition-all uppercase tracking-wide w-full ${
                            app.status === 'accepted' 
                              ? 'border-emerald-500/30 text-emerald-400 bg-emerald-500/10' 
                              : app.status === 'rejected'
                                ? 'border-rose-500/30 text-rose-400 bg-rose-500/10'
                                : 'border-amber-500/30 text-amber-400 bg-amber-500/10'
                          }`}
                        >
                          <option value="ongoing">Ongoing</option>
                          <option value="accepted">Accepted</option>
                          <option value="rejected">Rejected</option>
                        </select>
                      </div>

                      {/* Tips / Notes textbox */}
                      <div className="space-y-1.5 border-t border-white/5 pt-3">
                        <label className="text-[10px] text-text-muted font-bold uppercase tracking-wider block">Notes & Tips:</label>
                        <input
                          type="text"
                          defaultValue={app.tips}
                          onBlur={(e) => {
                            if (e.target.value !== app.tips) {
                              handleUpdateTips(app._id, e.target.value);
                            }
                          }}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') {
                              e.target.blur();
                            }
                          }}
                          placeholder="Add details, contact point..."
                          className="w-full px-3 py-2 bg-black/45 border border-white/5 focus:border-white/10 rounded-lg text-xs text-white placeholder-text-muted/40 focus:outline-none transition-all"
                        />
                      </div>
                    </div>
                  );
                })
              )}
            </div>

          </div>
        )}

      </main>

      {/* COMPACT FOOTER */}
      <footer className="text-center py-6 text-[10px] text-text-muted/50 max-w-7xl w-full mx-auto border-t border-white/5 mt-auto flex flex-col sm:flex-row justify-between items-center px-4 md:px-8 gap-2">
        <div className="flex items-center gap-1.5">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
          <span>Grow Together Workspace Sync Engine &bull; Version 2.0</span>
        </div>
        <p>&copy; {new Date().getFullYear()} Grow Together. Designed with high-performance responsive premium dark aesthetics.</p>
      </footer>

    </div>
  );
}

export default Dashboard;
