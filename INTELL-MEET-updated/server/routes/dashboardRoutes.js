import express from 'express';
import { 
  getDashboardStats, 
  getRecentMeetings 
} from '../controllers/dashboardController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.get('/stats', protect, getDashboardStats);
router.get('/recent-meetings', protect, getRecentMeetings);

export default router;