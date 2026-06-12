import Message from '../models/Message.js';

// Get message history for a room (REST fallback)
export const getMessages = async (req, res) => {
  try {
    const { roomId } = req.params;
    const messages = await Message.find({ channelId: roomId })
      .sort({ createdAt: -1 })
      .limit(50)
      .populate('senderId', 'name avatar');
    res.json(messages.reverse());
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
