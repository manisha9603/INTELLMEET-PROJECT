import mongoose from 'mongoose';

const messageSchema = new mongoose.Schema({
  channelId: { type: mongoose.Schema.Types.ObjectId, required: true },
  senderId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  content: { type: String, required: true },
  attachments: [{ type: String }],
  reactions: [{
    emoji: String,
    users: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }]
  }],
}, { timestamps: true });

const Message = mongoose.model('Message', messageSchema);
export default Message;
