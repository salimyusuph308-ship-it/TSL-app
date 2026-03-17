import { io, Socket } from "socket.io-client";

class PairingService {
  private socket: Socket | null = null;
  private roomId: string | null = null;

  constructor() {
    // Connect to the same host that serves the app
    this.socket = io(window.location.origin);
    
    this.socket.on("connect", () => {
      console.log("Connected to WebSocket server");
    });

    this.socket.on("receive-message", (message: any) => {
      console.log("Received message:", message);
      // Dispatch custom event for the UI to listen to
      window.dispatchEvent(new CustomEvent("afyasign:message", { detail: message }));
    });

    this.socket.on("user-joined", (userId: string) => {
      console.log("User joined room:", userId);
      window.dispatchEvent(new CustomEvent("afyasign:user-joined", { detail: userId }));
    });
  }

  joinRoom(roomId: string) {
    this.roomId = roomId;
    this.socket?.emit("join-room", roomId);
  }

  sendMessage(message: any) {
    if (this.roomId) {
      this.socket?.emit("send-message", { roomId: this.roomId, message });
    }
  }

  getRoomId() {
    return this.roomId;
  }

  generateRoomId() {
    return Math.random().toString(36).substring(2, 10).toUpperCase();
  }
}

export const pairingService = new PairingService();
