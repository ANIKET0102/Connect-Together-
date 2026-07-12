const express = require('express');
const router = express.Router();
const {
  createApplication,
  updateApplication,
  deleteApplication,
} = require('../controllers/applicationController');

router.route('/')
  .post(createApplication);

router.route('/:id')
  .put(updateApplication)
  .delete(deleteApplication);

module.exports = router;
