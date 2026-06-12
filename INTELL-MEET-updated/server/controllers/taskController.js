import Task from '../models/Task.js';

// @desc  Get all tasks for a meeting
// @route GET /api/tasks/:meetingId
export const getTasksByMeeting = async (req, res) => {
  try {
    const tasks = await Task.find({ meeting: req.params.meetingId })
      .populate('assignedTo', 'name email');
    res.json(tasks);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc  Create a task
// @route POST /api/tasks
export const createTask = async (req, res) => {
  try {
    const { title, description, meeting, assignedTo, status, priority } = req.body;
    const task = await Task.create({
      title,
      description,
      meeting,
      assignedTo,
      status: status || 'todo',
      priority: priority || 'medium',
      createdBy: req.user._id,
    });
    res.status(201).json(task);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc  Update task (drag & drop status change)
// @route PUT /api/tasks/:id
export const updateTask = async (req, res) => {
  try {
    const task = await Task.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    );
    if (!task) return res.status(404).json({ message: 'Task not found' });
    res.json(task);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc  Delete a task
// @route DELETE /api/tasks/:id
export const deleteTask = async (req, res) => {
  try {
    const task = await Task.findByIdAndDelete(req.params.id);
    if (!task) return res.status(404).json({ message: 'Task not found' });
    res.json({ message: 'Task deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};