const express = require('express');
const router = express.Router();
const {
  reportIssue,
  getIssues,
  getIssueById,
  updateIssue,
  deleteIssue,
  mergeIssue,
  upvoteIssue,
  assignIssue,
  updateIssueStatus,
  voiceComplaint,
  getPredictiveMaintenance,
  submitFeedback
} = require('../controllers/issueController');
const { protect, authorize } = require('../middleware/authMiddleware');

router.route('/')
  .post(protect, reportIssue)
  .get(protect, getIssues);

// Predictive maintenance dashboard (must be registered BEFORE dynamic :id routes)
router.get('/predictive-maintenance', protect, authorize('admin'), getPredictiveMaintenance);

// Voice complaint registration
router.post('/voice', protect, voiceComplaint);

router.route('/:id')
  .get(protect, getIssueById)
  .put(protect, updateIssue)
  .delete(protect, deleteIssue);

router.put('/:id/upvote', protect, upvoteIssue);

// Admin only: assign issue or merge duplicate
router.put('/:id/assign', protect, authorize('admin'), assignIssue);
router.put('/:id/merge', protect, authorize('admin'), mergeIssue);

// Officer or Admin: update issue status
router.put('/:id/status', protect, authorize('officer', 'admin'), updateIssueStatus);

// Citizen: submit feedback
router.post('/:id/feedback', protect, submitFeedback);

module.exports = router;
