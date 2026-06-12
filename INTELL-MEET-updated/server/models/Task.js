import mongoose from 'mongoose';

const taskSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String, default: '' },
  assigneeId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  status: { type: String, enum: ['To Do', 'In Progress', 'In Review', 'Done'], default: 'To Do' },
  priority: { type: String, enum: ['Low', 'Medium', 'High', 'Urgent'], default: 'Medium' },
  dueDate: { type: Date },
  meetingSourceId: { type: mongoose.Schema.Types.ObjectId, ref: 'Meeting' }
}, { timestamps: true });

const Task = mongoose.model('Task', taskSchema);
export default Task;
