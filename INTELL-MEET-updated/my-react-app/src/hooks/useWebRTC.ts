import { useEffect, useRef, useState, useCallback } from 'react';
import { socketService } from '../services/websocket.service';
import { useMeetingStore } from '../store/useMeetingStore';

export const useWebRTC = (roomId: string) => {
  const localStream = useMeetingStore(s => s.localStream);
  const screenShareStream = useMeetingStore(s => s.screenShareStream);
  const peerConnections = useRef<Map<string, RTCPeerConnection>>(new Map());
  const [remoteStreams, setRemoteStreams] = useState<Map<string, MediaStream>>(new Map());

  // ── Peer Connection factory ─────────────────────────────
  const createPeerConnection = (targetSocketId: string) => {
    const pc = new RTCPeerConnection({
      iceServers: [
        { urls: 'stun:stun.l.google.com:19302' },
        { urls: 'stun:stun1.l.google.com:19302' },
      ],
    });

    // Add local tracks
    localStream?.getTracks().forEach(track => {
      pc.addTrack(track, localStream);
    });

    // Remote stream arrived → update state
    pc.ontrack = (event) => {
      const remoteStream = event.streams[0];
      setRemoteStreams(prev => {
        const updated = new Map(prev);
        updated.set(targetSocketId, remoteStream);
        return updated;
      });
      console.log(`📹 Remote stream received: ${targetSocketId}`);
    };

    // ICE candidate → send via socket
    pc.onicecandidate = (event) => {
      if (event.candidate) {
        socketService.sendIceCandidate(targetSocketId, event.candidate);
      }
    };

    pc.onconnectionstatechange = () => {
      console.log(`🔗 Connection state [${targetSocketId}]: ${pc.connectionState}`);
    };

    peerConnections.current.set(targetSocketId, pc);
    return pc;
  };

  // ── Screen share: replace video track on all peer connections ──
  const replaceScreenTrack = useCallback(async (stream: MediaStream) => {
    const screenVideoTrack = stream.getVideoTracks()[0];
    if (!screenVideoTrack) return;

    const replacements = Array.from(peerConnections.current.values()).map(async (pc) => {
      const sender = pc.getSenders().find(s => s.track?.kind === 'video');
      if (sender) {
        await sender.replaceTrack(screenVideoTrack);
      }
    });

    await Promise.all(replacements);
    console.log('🖥️ Screen share track replaced on all peer connections');
  }, []);

  // ── Screen share stop: restore camera track on all peer connections ──
  const restoreCameraTrack = useCallback(async () => {
    const cameraVideoTrack = localStream?.getVideoTracks()[0];
    if (!cameraVideoTrack) return;

    const restorations = Array.from(peerConnections.current.values()).map(async (pc) => {
      const sender = pc.getSenders().find(s => s.track?.kind === 'video');
      if (sender) {
        await sender.replaceTrack(cameraVideoTrack);
      }
    });

    await Promise.all(restorations);
    console.log('📷 Camera track restored on all peer connections');
  }, [localStream]);

  // ── React to screenShareStream changes from the store ──
  useEffect(() => {
    if (screenShareStream) {
      replaceScreenTrack(screenShareStream);
    } else {
      restoreCameraTrack();
    }
  }, [screenShareStream, replaceScreenTrack, restoreCameraTrack]);

  // ── Main WebRTC signalling effect ───────────────────────
  useEffect(() => {
    if (!localStream) return;

    // New user joined → send offer
    socketService.onUserJoined(async ({ socketId, userId }) => {
      console.log(`👤 User joined, creating offer for: ${socketId}`);
      const pc = createPeerConnection(socketId);
      const offer = await pc.createOffer();
      await pc.setLocalDescription(offer);
      socketService.sendOffer(socketId, offer, userId);
    });

    // Offer received → send answer
    socketService.onOffer(async ({ offer, fromSocketId, fromUserId }) => {
      console.log(`📨 Offer received from: ${fromSocketId}`);
      const pc = createPeerConnection(fromSocketId);
      await pc.setRemoteDescription(new RTCSessionDescription(offer));
      const answer = await pc.createAnswer();
      await pc.setLocalDescription(answer);
      socketService.sendAnswer(fromSocketId, answer, fromUserId);
    });

    // Answer received → connection complete
    socketService.onAnswer(async ({ answer, fromSocketId }) => {
      console.log(`📨 Answer received from: ${fromSocketId}`);
      const pc = peerConnections.current.get(fromSocketId);
      if (pc) {
        await pc.setRemoteDescription(new RTCSessionDescription(answer));
      }
    });

    // ICE candidate received
    socketService.onIceCandidate(({ candidate, fromSocketId }) => {
      const pc = peerConnections.current.get(fromSocketId);
      if (pc && candidate) {
        pc.addIceCandidate(new RTCIceCandidate(candidate));
      }
    });

    // Cleanup
    return () => {
      peerConnections.current.forEach(pc => pc.close());
      peerConnections.current.clear();
      setRemoteStreams(new Map());
    };
  }, [localStream]);

  const getRemoteStream = (socketId: string): MediaStream | null => {
    return remoteStreams.get(socketId) || null;
  };

  return { getRemoteStream, remoteStreams };
};