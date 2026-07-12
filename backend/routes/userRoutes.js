const express = require('express');
const router = express.Router();
const { registerUser, loginUser, checkUsername, deleteGuestUser } = require('../controllers/userController');

router.post('/register', registerUser);
router.post('/login', loginUser);
router.get('/check-username/:username', checkUsername);
router.delete('/guest/:userId', deleteGuestUser);

module.exports = router;
