import { io, Socket } from 'socket.io-client';

const SERVER_URL = import.meta.env.VITE_SERVER_URL || 'https://intellmeet-project.onrender.com';

class SocketService {
  private socket: Socket | null = null;

  connect() {
    if (this.socket?.connected) return;
    if (this.socket) {
      this.socket.connect();
      return;
    }

    this.socket = io(SERVER_URL, {
      transports: ['websocket', 'polling'],
      autoConnect: true,
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
    });

    this.socket.on('connect', () => {
      console.log('✅ Socket connected:', this.socket?.id);
    });

    this.socket.on('disconnect', () => {
      console.log('❌ Socket disconnected');
    });

    return this.socket;
  }

  joinRoom(roomId: string, userId: string, userName: string) {
    this.socket?.emit('join-room', { roomId, userId, userName });
  }

  sendMessage(roomId: string, senderId: string, senderName: string, content: string) {
    this.socket?.emit('send-message', { roomId, senderId, senderName, content });
  }

  onMessage(callback: (msg: any) => void) {
    this.socket?.on('receive-message', callback);
  }

  sendTyping(roomId: string, userId: string, userName: string, isTyping: boolean) {
    this.socket?.emit('typing', { roomId, userId, userName, isTyping });
  }

  onTyping(callback: (data: any) => void) {
    this.socket?.on('user-typing', callback);
  }

  onUserJoined(callback: (data: any) => void) {
    this.socket?.on('user-joined', callback);
  }

  onUserLeft(callback: (data: any) => void) {
    this.socket?.on('user-left', callback);
  }

  sendOffer(targetSocketId: string, offer: any, fromUserId: string) {
    this.socket?.emit('webrtc-offer', { targetSocketId, offer, fromUserId });
  }

  sendAnswer(targetSocketId: string, answer: any, fromUserId: string) {
    this.socket?.emit('webrtc-answer', { targetSocketId, answer, fromUserId });
  }

  sendIceCandidate(targetSocketId: string, candidate: any) {
    this.socket?.emit('ice-candidate', { targetSocketId, candidate });
  }

  onOffer(callback: (data: any) => void) {
    this.socket?.on('webrtc-offer', callback);
  }

  onAnswer(callback: (data: any) => void) {
    this.socket?.on('webrtc-answer', callback);
  }

  onIceCandidate(callback: (data: any) => void) {
    this.socket?.on('ice-candidate', callback);
  }

  startScreenShare(roomId: string, userId: string, userName: string) {
    this.socket?.emit('screen-share-start', { roomId, userId, userName });
  }

  stopScreenShare(roomId: string, userId: string, userName: string) {
    this.socket?.emit('screen-share-stop', { roomId, userId, userName });
  }

  toggleAudio(roomId: string, userId: string, isMuted: boolean) {
    this.socket?.emit('toggle-audio', { roomId, userId, isMuted });
  }

  toggleVideo(roomId: string, userId: string, isVideoOff: boolean) {
    this.socket?.emit('toggle-video', { roomId, userId, isVideoOff });
  }

  disconnect() {
    this.socket?.disconnect();
    this.socket = null;
  }

  getSocket() {
    return this.socket;
  }
}

export const socketService = new SocketService();
socketService.connect();