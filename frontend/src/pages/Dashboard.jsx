import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { io } from 'socket.io-client';
import toast from 'react-hot-toast';
import { 
  Users, 
  Activity,
  ClipboardList,
  Briefcase,
  Loader2
} from 'lucide-react';

// Custom subcomponents
import Header from '../components/Header';
import Sidebar from '../components/Sidebar';
import MobileDrawer from '../components/MobileDrawer';
import SubHeader from '../components/SubHeader';
import RoomLanding from '../components/RoomLanding';
import DashboardOverview from '../components/DashboardOverview';
import GoalsRoom from '../components/GoalsRoom';
import SyncProgress from '../components/SyncProgress';
import ApplicationsTracker from '../components/ApplicationsTracker';

const API_BASE = import.meta.env.DEV ? 'http://localhost:5000/api' : 'https://connect-together-vpa6.onrender.com/api';
const SOCKET_URL = import.meta.env.DEV ? 'http://localhost:5000' : 'https://connect-together-vpa6.onrender.com';

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

  // Room action states
  const [creatingRoom, setCreatingRoom] = useState(false);
  const [joiningRoom, setJoiningRoom] = useState(false);
  const [joinCode, setJoinCode] = useState('');

  // Setup navigation items configuration dynamically based on room availability
  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: Activity, disabled: false },
    { id: 'goals', label: 'Goals Room', icon: ClipboardList, badge: tasks.filter(t => {
        const isCompletedMe = t.status ? !!t.status[user._id] : false;
        const partner = room?.participants?.find((p) => p._id !== user._id);
        const isCompletedPartner = partner && t.status ? !!t.status[partner._id] : false;
        return partner ? !(isCompletedMe && isCompletedPartner) : !isCompletedMe;
      }).length, disabled: !roomCode },
    { id: 'progress', label: 'Sync Progress', icon: Users, disabled: !roomCode },
    { id: 'applications', label: 'Applications', icon: Briefcase, badge: applications.length, disabled: !roomCode },
  ];

  // Save active tab on change
  useEffect(() => {
    localStorage.setItem(`todo_active_tab_${roomCode}`, activeTab);
  }, [activeTab, roomCode]);

  // Fetch Room & Initial Data if roomCode exists
  useEffect(() => {
    if (!roomCode) {
      // Find or create their personal room silently in the background
      const fetchOrCreatePersonalRoom = async () => {
        setLoading(true);
        try {
          const response = await fetch(`${API_BASE}/rooms/user/${user._id}`);
          const data = await response.json();
          if (response.ok && data.success && data.data) {
            navigate(`/room/${data.data.roomCode}`);
          } else {
            setLoading(false);
          }
        } catch (err) {
          console.error('Failed to auto-provision workspace:', err);
          setLoading(false);
        }
      };
      fetchOrCreatePersonalRoom();
      return;
    }

    const fetchRoomDetails = async () => {
      setLoading(true);
      setError('');
      try {
        const response = await fetch(`${API_BASE}/rooms/code/${roomCode}`);
        const data = await response.json();

        if (response.ok && data.success) {
          setRoom(data.data);
          setTasks(data.data.tasks || []);
          setApplications(data.data.applications || []);
          setActivityLogs(data.data.activityLogs || []);
        } else {
          setError(data.error || 'Failed to sync workspace');
          toast.error(data.error || 'Failed to sync workspace');
        }
      } catch (err) {
        setError('Network error. Could not connect to workspace server.');
        toast.error('Network error. Could not connect to workspace server.');
      } finally {
        setLoading(false);
      }
    };

    fetchRoomDetails();
  }, [roomCode]);

  // Handle Socket Synchronization Connections
  useEffect(() => {
    if (!roomCode || !room) return;

    const socket = io(SOCKET_URL, {
      transports: ['websocket'],
      upgrade: false,
    });

    socketRef.current = socket;

    socket.on('connect', () => {
      setSocketConnected(true);
      socket.emit('join_room', { roomCode, userId: user._id });
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
              toast.success(`${partnerName} finished: "${updatedTask.title}"`);
            } else {
              toast.success(`${partnerName} marked pending: "${updatedTask.title}"`);
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
        id: `app-add-${newApp._id}` 
      });
    });

    socket.on('application_updated', (updatedApp) => {
      setApplications((prev) => prev.map((a) => (a._id === updatedApp._id ? updatedApp : a)));
      toast.success(`Application tracker updated`, {
        id: `app-update-${updatedApp._id}`
      });
    });

    socket.on('application_deleted', (appId) => {
      setApplications((prev) => prev.filter((a) => a._id !== appId));
      toast.success(`Application removed`, {
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

  const handleCreateRoom = async () => {
    setCreatingRoom(true);
    try {
      const response = await fetch(`${API_BASE}/rooms/create`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: user._id }),
      });

      const data = await response.json();

      if (response.ok && data.success) {
        toast.success('Room created successfully!');
        setMobileMenuOpen(false);
        navigate(`/room/${data.data.roomCode}`);
      } else {
        const errMsg = data.error || 'Failed to create room';
        toast.error(errMsg);
      }
    } catch (err) {
      toast.error('Network error. Failed to create room.');
    } finally {
      setCreatingRoom(false);
    }
  };

  const handleJoinRoom = async (e) => {
    if (e && e.preventDefault) e.preventDefault();
    if (!joinCode.trim()) {
      toast.error('Please enter a room code');
      return;
    }
    if (joinCode.trim().length !== 6) {
      toast.error('Room code must be exactly 6 digits');
      return;
    }

    setJoiningRoom(true);
    try {
      const response = await fetch(`${API_BASE}/rooms/join`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          roomCode: joinCode.trim(),
          userId: user._id,
        }),
      });

      const data = await response.json();

      if (response.ok && data.success) {
        toast.success('Joined room successfully!');
        setJoinCode('');
        setMobileMenuOpen(false);
        navigate(`/room/${data.data.roomCode}`);
      } else {
        const errMsg = data.error || 'Failed to join room';
        toast.error(errMsg);
      }
    } catch (err) {
      toast.error('Network error. Failed to join room.');
    } finally {
      setJoiningRoom(false);
    }
  };

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

  // Chart Data
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
      <div className="min-h-screen flex items-center justify-center bg-[#eef5f3] text-[#6b7280]">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="animate-spin text-brand-orange" size={40} />
          <p className="text-sm font-semibold tracking-wider text-[#2d4a43]">Synchronizing Workspace...</p>
        </div>
      </div>
    );
  }

  if (roomCode && (error || !room)) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#eef5f3] px-4 font-sans text-center">
        <div className="premium-card p-8 max-w-md relative overflow-hidden space-y-6 bg-white">
          <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-red-500/25 to-transparent" />
          
          <div className="space-y-2">
            <h2 className="text-xl font-bold text-[#2d4a43]">Synchronization Error</h2>
            <p className="text-xs text-[#6b7280] leading-relaxed">
              We couldn't connect you to this collaborative workspace. The room might have been deleted, or the network link is broken.
            </p>
          </div>

          <div className="bg-red-500/5 border border-red-500/10 p-3 rounded-xl">
            <p className="text-[10px] font-mono text-red-500 break-all">{error || 'Unknown Room Sync Code'}</p>
          </div>

          <button
            onClick={() => navigate('/')}
            className="w-full py-2.5 bg-[#2d4a43] text-white hover:bg-[#2d4a43]/90 font-bold rounded-xl text-xs active:scale-[0.98] transition-all cursor-pointer shadow-md"
          >
            Return to Dashboard Entrance
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen bg-transparent text-[#2d4a43] font-sans antialiased selection:bg-brand-orange/20 select-none">
      
      {/* 1. Header component */}
      <Header
        user={user}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        navItems={navItems}
        roomCode={roomCode}
        creatingRoom={creatingRoom}
        joiningRoom={joiningRoom}
        joinCode={joinCode}
        setJoinCode={setJoinCode}
        handleCreateRoom={handleCreateRoom}
        handleJoinRoom={handleJoinRoom}
        mobileMenuOpen={mobileMenuOpen}
        setMobileMenuOpen={setMobileMenuOpen}
        onLogout={onLogout}
      />

      {/* 2. Mobile Drawer Navigation menu */}
      <MobileDrawer
        user={user}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        navItems={navItems}
        roomCode={roomCode}
        creatingRoom={creatingRoom}
        joiningRoom={joiningRoom}
        joinCode={joinCode}
        setJoinCode={setJoinCode}
        handleCreateRoom={handleCreateRoom}
        handleJoinRoom={handleJoinRoom}
        mobileMenuOpen={mobileMenuOpen}
        setMobileMenuOpen={setMobileMenuOpen}
        socketConnected={socketConnected}
        copied={copied}
        handleCopyCode={handleCopyCode}
        onLogout={onLogout}
      />

      {/* Dashboard Body container */}
      <div className="flex-1 flex w-full">
        
        {/* 3. Responsive left sidebar */}
        <Sidebar
          user={user}
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          navItems={navItems}
          creatingRoom={creatingRoom}
          joiningRoom={joiningRoom}
          joinCode={joinCode}
          setJoinCode={setJoinCode}
          handleCreateRoom={handleCreateRoom}
          handleJoinRoom={handleJoinRoom}
        />

        {/* 4. Content Area container */}
        <div className="flex-1 flex flex-col min-w-0">

          {/* Sub Header */}
          <SubHeader
            roomCode={roomCode}
            activeTab={activeTab}
            socketConnected={socketConnected}
            copied={copied}
            handleCopyCode={handleCopyCode}
          />

          {/* Main workspace view */}
          <main className="flex-1 w-full px-4 md:px-8 py-8">
            {!roomCode ? (
              <RoomLanding
                creatingRoom={creatingRoom}
                joiningRoom={joiningRoom}
                joinCode={joinCode}
                setJoinCode={setJoinCode}
                handleCreateRoom={handleCreateRoom}
                handleJoinRoom={handleJoinRoom}
              />
            ) : (
              <>
                {/* TAB 0: DASHBOARD OVERVIEW */}
                {activeTab === 'dashboard' && (
                  <DashboardOverview
                    user={user}
                    partner={partner}
                    activityLogs={activityLogs}
                    tasks={tasks}
                    activeTasks={activeTasks}
                    completedTasks={completedTasks}
                    applications={applications}
                    userActiveDays={userActiveDays}
                    partnerActiveDays={partnerActiveDays}
                    socketConnected={socketConnected}
                    room={room}
                    chartData={chartData}
                    totalTasks={totalTasks}
                    userACompleted={userACompleted}
                    userBCompleted={userBCompleted}
                    userAPercentage={userAPercentage}
                    userBPercentage={userBPercentage}
                    setActiveTab={setActiveTab}
                    navItems={navItems}
                  />
                )}

                {/* TAB 1: GOALS ROOM */}
                {activeTab === 'goals' && (
                  <GoalsRoom
                    user={user}
                    partner={partner}
                    activeTasks={activeTasks}
                    completedTasks={completedTasks}
                    taskTitle={taskTitle}
                    setTaskTitle={setTaskTitle}
                    handleAddTask={handleAddTask}
                    handleToggle={handleToggle}
                  />
                )}

                {/* TAB 2: PROGRESS VIEW */}
                {activeTab === 'progress' && (
                  <SyncProgress
                    user={user}
                    partner={partner}
                    activityLogs={activityLogs}
                    chartData={chartData}
                    totalTasks={totalTasks}
                    userACompleted={userACompleted}
                    userBCompleted={userBCompleted}
                    userAPercentage={userAPercentage}
                    userBPercentage={userBPercentage}
                    completedCount={completedCount}
                    completionPercentage={completionPercentage}
                    heatmapUserFilter={heatmapUserFilter}
                    setHeatmapUserFilter={setHeatmapUserFilter}
                  />
                )}

                {/* TAB 3: APPLICATIONS VIEW */}
                {activeTab === 'applications' && (
                  <ApplicationsTracker
                    applications={applications}
                    filteredApps={filteredApps}
                    appSearch={appSearch}
                    setAppSearch={setAppSearch}
                    appFilter={appFilter}
                    setAppFilter={setAppFilter}
                    newAppUrl={newAppUrl}
                    setNewAppUrl={setNewAppUrl}
                    newAppTips={newAppTips}
                    setNewAppTips={setNewAppTips}
                    newAppStatus={newAppStatus}
                    setNewAppStatus={setNewAppStatus}
                    handleAddApplication={handleAddApplication}
                    handleUpdateStatus={handleUpdateStatus}
                    handleUpdateTips={handleUpdateTips}
                    handleDeleteApplication={handleDeleteApplication}
                  />
                )}
              </>
            )}
          </main>

          {/* COMPACT FOOTER */}
          <footer className="text-center py-6 text-[10px] text-[#6b7280]/60 w-full border-t border-[#e2eae7] mt-auto flex flex-col sm:flex-row justify-between items-center px-4 md:px-8 gap-2">
            <div className="flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              <span>Grow Together Workspace Sync Engine &bull; Version 2.0</span>
            </div>
            <p>&copy; {new Date().getFullYear()} Grow Together. Designed with high-performance responsive premium glassmorphic aesthetics.</p>
          </footer>

        </div>
      </div>

    </div>
  );
}

export default Dashboard;
