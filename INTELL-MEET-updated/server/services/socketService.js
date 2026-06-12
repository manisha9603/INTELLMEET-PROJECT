import redisClient from '../config/redis.js';
import Message from '../models/Message.js';
import Meeting from '../models/Meeting.js';
import mongoose from 'mongoose';

const isValidObjectId = (id) => mongoose.Types.ObjectId.isValid(id);

const inMemoryStore = {};

const safeRedis = {
  sAdd: async (key, value) => {
    if (redisClient) return redisClient.sadd(key, value);
    if (!inMemoryStore[key]) inMemoryStore[key] = new Set();
    inMemoryStore[key].add(value);
  },
  sRem: async (key, value) => {
    if (redisClient) return redisClient.srem(key, value);
    if (inMemoryStore[key]) inMemoryStore[key].delete(value);
  },
  sMembers: async (key) => {
    if (redisClient) return redisClient.smembers(key);
    return inMemoryStore[key] ? [...inMemoryStore[key]] : [];
  },
  set: async (key, value) => {
    if (redisClient) return redisClient.set(key, value, { ex: 86400 });
    inMemoryStore[key] = value;
  },
  get: async (key) => {
    if (redisClient) return redisClient.get(key);
    return inMemoryStore[key] || null;
  },
  del: async (key) => {
    if (redisClient) return redisClient.del(key);
    delete inMemoryStore[key];
  },
  lPush: async (key, value) => {
    if (redisClient) return redisClient.lpush(key, value);
    if (!inMemoryStore[key]) inMemoryStore[key] = [];
    inMemoryStore[key].unshift(value);
  },
  lTrim: async (key, start, end) => {
    if (redisClient) return redisClient.ltrim(key, start, end);
    if (inMemoryStore[key]) inMemoryStore[key] = inMemoryStore[key].slice(start, end + 1);
  },
  lRange: async (key, start, end) => {
    if (redisClient) return redisClient.lrange(key, start, end);
    return inMemoryStore[key] ? inMemoryStore[key].slice(start, end + 1) : [];
  },
  expire: async (key, seconds) => {
    if (redisClient) return redisClient.expire(key, seconds);
  },
};

// ─── ROOM HELPERS ─────────────────────────────────────────────────────────────

const addUserToRoom = async (roomId, userId, socketId) => {
  const key = `room:${roomId}:users`;
  const user = JSON.stringify({ userId, socketId });
  await safeRedis.sAdd(key, user);
  await safeRedis.expire(key, 86400);
};

// ✅ FIXED: JSON parse safely
const removeUserFromRoom = async (roomId, socketId) => {
  const key = `room:${roomId}:users`;
  const members = await safeRedis.sMembers(key);
  for (const member of members) {
    const parsed = typeof member === 'string' ? JSON.parse(member) : member;
    if (parsed.socketId === socketId) {
      await safeRedis.sRem(key, typeof member === 'string' ? member : JSON.stringify(member));
      return parsed.userId;
    }
  }
  return null;
};

// ✅ FIXED: JSON parse safely
const getRoomUsers = async (roomId) => {
  const key = `room:${roomId}:users`;
  const members = await safeRedis.sMembers(key);
  return members.map((m) => typeof m === 'string' ? JSON.parse(m) : m);
};

const setSocketRoom = async (socketId, roomId) => {
  await safeRedis.set(`socket:${socketId}:room`, roomId);
};

// ✅ FIXED: Already string hai
const getSocketRoom = async (socketId) => {
  const result = await safeRedis.get(`socket:${socketId}:room`);
  return result || null;
};

const deleteSocketRoom = async (socketId) => {
  await safeRedis.del(`socket:${socketId}:room`);
};

// ─── MAIN SOCKET SETUP ────────────────────────────────────────────────────────

export const initializeSocket = (io) => {
  io.on('connection', (socket) => {
    console.log(`🔌 Socket connected: ${socket.id}`);

    // ── ROOM + CHAT EVENTS ──────────────────────────────────────────────────

    socket.on('join-room', async ({ roomId, userId, userName }) => {
      try {
        socket.join(roomId);
        await addUserToRoom(roomId, userId, socket.id);
        await setSocketRoom(socket.id, roomId);

        if (isValidObjectId(roomId)) {
          await Meeting.findByIdAndUpdate(roomId, { status: 'Active' });
        }

        socket.to(roomId).emit('user-joined', {
          userId,
          userName,
          socketId: socket.id,
        });

        const users = await getRoomUsers(roomId);
        socket.emit('room-users', users);

        console.log(`👤 ${userName} joined room: ${roomId}`);
      } catch (err) {
        console.error('❌ join-room error:', err.message);
      }
    });

    socket.on('send-message', async ({ roomId, senderId, senderName, content }) => {
      try {
        let messageId = Date.now();

        if (isValidObjectId(roomId) && isValidObjectId(senderId)) {
          const message = await Message.create({
            channelId: roomId,
            senderId,
            content,
          });
          messageId = message._id;

          const msgData = JSON.stringify({
            _id: messageId,
            senderId,
            senderName,
            content,
            createdAt: message.createdAt,
          });
          const cacheKey = `chat:${roomId}`;
          await safeRedis.lPush(cacheKey, msgData);
          await safeRedis.lTrim(cacheKey, 0, 49);
          await safeRedis.expire(cacheKey, 86400);
        }

        io.to(roomId).emit('receive-message', {
          _id: messageId,
          senderId,
          senderName,
          content,
          createdAt: new Date(),
        });

      } catch (error) {
        socket.emit('error', { message: 'Message send failed' });
        console.error('❌ Message save error:', error.message);
      }
    });

    socket.on('typing', ({ roomId, userId, userName, isTyping }) => {
      socket.to(roomId).emit('user-typing', { userId, userName, isTyping });
    });

    socket.on('get-chat-history', async ({ roomId }) => {
      try {
        const cacheKey = `chat:${roomId}`;
        const cached = await safeRedis.lRange(cacheKey, 0, 49);

        if (cached.length > 0) {
          const messages = cached.map((m) => typeof m === 'string' ? JSON.parse(m) : m).reverse();
          socket.emit('chat-history', messages);
        } else if (isValidObjectId(roomId)) {
          const messages = await Message.find({ channelId: roomId })
            .sort({ createdAt: -1 })
            .limit(50)
            .populate('senderId', 'name');
          socket.emit('chat-history', messages.reverse());
        } else {
          socket.emit('chat-history', []);
        }
      } catch (error) {
        console.error('❌ Chat history error:', error.message);
      }
    });

    // ── WEBRTC SIGNALING ────────────────────────────────────────────────────

    socket.on('webrtc-offer', ({ targetSocketId, offer, fromUserId }) => {
      io.to(targetSocketId).emit('webrtc-offer', {
        offer,
        fromSocketId: socket.id,
        fromUserId,
      });
      console.log(`📡 WebRTC offer: ${socket.id} → ${targetSocketId}`);
    });

    socket.on('webrtc-answer', ({ targetSocketId, answer, fromUserId }) => {
      io.to(targetSocketId).emit('webrtc-answer', {
        answer,
        fromSocketId: socket.id,
        fromUserId,
      });
      console.log(`📡 WebRTC answer: ${socket.id} → ${targetSocketId}`);
    });

    socket.on('ice-candidate', ({ targetSocketId, candidate }) => {
      io.to(targetSocketId).emit('ice-candidate', {
        candidate,
        fromSocketId: socket.id,
      });
    });

    // ── SCREEN SHARE ────────────────────────────────────────────────────────

    socket.on('screen-share-start', ({ roomId, userId, userName }) => {
      socket.to(roomId).emit('user-screen-sharing', {
        userId, userName, socketId: socket.id, isSharing: true,
      });
      console.log(`🖥️ ${userName} started screen share`);
    });

    socket.on('screen-share-stop', ({ roomId, userId, userName }) => {
      socket.to(roomId).emit('user-screen-sharing', {
        userId, userName, socketId: socket.id, isSharing: false,
      });
    });

    // ── MEDIA CONTROLS ──────────────────────────────────────────────────────

    socket.on('toggle-audio', ({ roomId, userId, isMuted }) => {
      socket.to(roomId).emit('user-audio-toggle', { userId, isMuted });
    });

    socket.on('toggle-video', ({ roomId, userId, isVideoOff }) => {
      socket.to(roomId).emit('user-video-toggle', { userId, isVideoOff });
    });

    // ── DISCONNECT ──────────────────────────────────────────────────────────

    socket.on('disconnect', async () => {
      console.log(`🔌 Socket disconnected: ${socket.id}`);
      try {
        const roomId = await getSocketRoom(socket.id);
        if (roomId) {
          const userId = await removeUserFromRoom(roomId, socket.id);
          await deleteSocketRoom(socket.id);

          socket.to(roomId).emit('user-left', { userId, socketId: socket.id });

          const remainingUsers = await getRoomUsers(roomId);
          if (remainingUsers.length === 0 && isValidObjectId(roomId)) {
            await Meeting.findByIdAndUpdate(roomId, { status: 'Completed' });
            console.log(`🏁 Room ${roomId} empty — meeting Completed`);
          }
        }
      } catch (err) {
        console.error('❌ Disconnect cleanup error:', err.message);
      }
    });
  });
};