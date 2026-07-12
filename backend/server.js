const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');
require('dotenv').config();

const connectDB = require('./config/db');
const Task = require('./models/Task');
const Application = require('./models/Application');
const ActivityLog = require('./models/ActivityLog');

// Connect to Database
connectDB();

const app = express();

// Middleware
app.use(
  cors({
    origin: process.env.CORS_ORIGIN || '*',
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  })
);
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// Request Logging Middleware (Development Mode)
if (process.env.NODE_ENV === 'development') {
  app.use((req, res, next) => {
    console.log(`${req.method} ${req.originalUrl}`);
    next();
  });
}

// Routes
app.use('/api/users', require('./routes/userRoutes'));
app.use('/api/rooms', require('./routes/roomRoutes'));
app.use('/api/tasks', require('./routes/taskRoutes'));
app.use('/api/applications', require('./routes/applicationRoutes'));

// Welcome Route
app.get('/', (req, res) => {
  res.status(200).json({
    message: 'Welcome to the Collaborative Task Tracker API',
    status: 'Running',
  });
});

// 404 Route handler
app.use((req, res, next) => {
  res.status(404).json({
    success: false,
    error: 'Route not found',
  });
});

// Global Error Handler Middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    success: false,
    error: 'Server Error',
    message: err.message,
  });
});

const PORT = process.env.PORT || 5000;

// Create HTTP server
const server = http.createServer(app);

// Initialize Socket.io
const io = new Server(server, {
  cors: {
    origin: process.env.CORS_ORIGIN || '*',
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  },
});

// Helper to log user activity days dynamically
const logActivity = async (roomId, userId, roomCode) => {
  try {
    if (!roomId || !userId) return;
    const today = new Date().toISOString().split('T')[0]; // Format: YYYY-MM-DD
    const log = await ActivityLog.findOneAndUpdate(
      { roomId, userId, date: today },
      { $inc: { count: 1 } },
      { upsert: true, new: true }
    );
    if (roomCode) {
      io.to(roomCode).emit('activity_updated', log);
    }
  } catch (error) {
    console.error(`Error logging activity: ${error.message}`);
  }
};

// Socket.io Connection Logic
io.on('connection', (socket) => {
  console.log(`New socket client connected: ${socket.id}`);

  // Join Room Event
  socket.on('join_room', ({ roomCode }) => {
    if (roomCode) {
      socket.join(roomCode);
      console.log(`Socket ${socket.id} joined room: ${roomCode}`);
    }
  });

  // Add Task Event
  socket.on('add_task', async ({ roomId, roomCode, title, status, userId }) => {
    try {
      if (!roomId || !roomCode || !title) {
        return socket.emit('error', { message: 'Missing required task data (roomId, roomCode, or title)' });
      }

      const task = await Task.create({
        roomId,
        title,
        status: status || {},
      });

      // Log user activity
      if (userId) {
        await logActivity(roomId, userId, roomCode);
      }

      // Broadcast to all clients in the room
      io.to(roomCode).emit('task_added', task);
    } catch (error) {
      console.error(`Socket add_task error: ${error.message}`);
      socket.emit('error', { message: 'Failed to create task', error: error.message });
    }
  });

  // Toggle Task Event
  socket.on('toggle_task', async ({ taskId, userId, isCompleted, roomCode }) => {
    try {
      if (!taskId || !userId || isCompleted === undefined || !roomCode) {
        return socket.emit('error', { message: 'Missing required toggle data (taskId, userId, isCompleted, or roomCode)' });
      }

      const task = await Task.findById(taskId);
      if (!task) {
        return socket.emit('error', { message: 'Task not found' });
      }

      // Update the user's task status status map
      task.status.set(userId, isCompleted);
      await task.save();

      // Log user activity
      await logActivity(task.roomId, userId, roomCode);

      // Broadcast update to all clients in the room
      io.to(roomCode).emit('task_updated', task);
    } catch (error) {
      console.error(`Socket toggle_task error: ${error.message}`);
      socket.emit('error', { message: 'Failed to update task status', error: error.message });
    }
  });

  // Add Application Event
  socket.on('add_application', async ({ roomId, roomCode, url, status, tips, userId }) => {
    try {
      if (!roomId || !roomCode || !url) {
        return socket.emit('error', { message: 'Missing required application data (roomId, roomCode, or url)' });
      }

      const application = await Application.create({
        roomId,
        url,
        status: status || 'ongoing',
        tips: tips || '',
      });

      // Log user activity
      if (userId) {
        await logActivity(roomId, userId, roomCode);
      }

      // Broadcast to all clients in the room
      io.to(roomCode).emit('application_added', application);
    } catch (error) {
      console.error(`Socket add_application error: ${error.message}`);
      socket.emit('error', { message: 'Failed to create application', error: error.message });
    }
  });

  // Update Application Event
  socket.on('update_application', async ({ applicationId, roomCode, updateData, userId }) => {
    try {
      if (!applicationId || !roomCode || !updateData) {
        return socket.emit('error', { message: 'Missing required update data (applicationId, roomCode, or updateData)' });
      }

      const application = await Application.findByIdAndUpdate(
        applicationId,
        updateData,
        { new: true, runValidators: true }
      );

      if (!application) {
        return socket.emit('error', { message: 'Application not found' });
      }

      // Log user activity
      if (userId) {
        await logActivity(application.roomId, userId, roomCode);
      }

      // Broadcast to all clients in the room
      io.to(roomCode).emit('application_updated', application);
    } catch (error) {
      console.error(`Socket update_application error: ${error.message}`);
      socket.emit('error', { message: 'Failed to update application', error: error.message });
    }
  });

  // Delete Application Event
  socket.on('delete_application', async ({ applicationId, roomCode, userId }) => {
    try {
      if (!applicationId || !roomCode) {
        return socket.emit('error', { message: 'Missing required delete data (applicationId or roomCode)' });
      }

      const application = await Application.findById(applicationId);
      if (!application) {
        return socket.emit('error', { message: 'Application not found' });
      }

      const roomId = application.roomId;
      await application.deleteOne();

      // Log user activity
      if (userId) {
        await logActivity(roomId, userId, roomCode);
      }

      // Broadcast to all clients in the room
      io.to(roomCode).emit('application_deleted', applicationId);
    } catch (error) {
      console.error(`Socket delete_application error: ${error.message}`);
      socket.emit('error', { message: 'Failed to delete application', error: error.message });
    }
  });

  socket.on('disconnect', () => {
    console.log(`Socket client disconnected: ${socket.id}`);
  });
});

// Start HTTP server
server.listen(PORT, () => {
  console.log(`Server running in ${process.env.NODE_ENV || 'development'} mode on port ${PORT}`);
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (err, promise) => {
  console.error(`Unhandled Rejection Error: ${err.message}`);
  // Close server & exit process
  server.close(() => process.exit(1));
});
