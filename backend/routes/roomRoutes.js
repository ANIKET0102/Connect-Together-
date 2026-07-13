const express = require('express');
const router = express.Router();
const { createRoom, joinRoom, getRoomTasks, getRoomByCode, getRoomActivity, getUserRoom } = require('../controllers/roomController');
const { getRoomApplications } = require('../controllers/applicationController');

router.post('/create', createRoom);
router.post('/join', joinRoom);
router.get('/code/:roomCode', getRoomByCode);
router.get('/user/:userId', getUserRoom);
router.get('/:roomId/tasks', getRoomTasks);
router.get('/:roomId/applications', getRoomApplications);
router.get('/:roomId/activity', getRoomActivity);

module.exports = router;
