import Meeting from '../models/Meeting.js';
import Task from '../models/Task.js';
import User from '../models/User.js';
import Message from '../models/Message.js';

// @desc  Get dashboard stats
// @route GET /api/dashboard/stats
export const getDashboardStats = async (req, res) => {
  try {
    const userId = req.user._id;

    const [totalMeetings, activeMeetings, totalTasks, pendingTasks] = 
      await Promise.all([
        Meeting.countDocuments({ participants: userId }),
        Meeting.countDocuments({ participants: userId, status: 'active' }),
        Task.countDocuments({ assignedTo: userId }),
        Task.countDocuments({ assignedTo: userId, status: 'todo' }),
      ]);

    res.json({
      totalMeetings,
      activeMeetings,
      totalTasks,
      pendingTasks,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc  Get recent meetings
// @route GET /api/dashboard/recent-meetings
export const getRecentMeetings = async (req, res) => {
  try {
    const meetings = await Meeting.find({ 
      participants: req.user._id 
    })
      .sort({ createdAt: -1 })
      .limit(5)
      .populate('host', 'name email');

    res.json(meetings);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};