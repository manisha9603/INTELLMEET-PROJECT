import express from 'express';
import { createMeeting, getMeetingReport, endMeeting } from '../controllers/meetingController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.route('/')
  .post(protect, createMeeting);

router.route('/:id/report')
  .get(protect, getMeetingReport);

router.route('/:id/end')
  .post(protect, endMeeting);

export default router;
