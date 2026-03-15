import { io, Socket } from "socket.io-client";
import { SOCKET_CHAT_SERVER_URL } from "../config/api.config";

class SocketService {
  private socket: Socket | null = null;

  connect(): Socket {
    if (this.socket) return this.socket;

    const socket = io(SOCKET_CHAT_SERVER_URL, {
      transports: ["websocket", "polling"],
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
    });

    socket.on("connect", () => console.log("Socket connection:", socket.id));
    socket.on("disconnect", () => console.log("Socket disconnected"));
    socket.on("connect_error", (err) =>
      console.error("Socket Error:", err.message),
    );

    return (this.socket = socket);
  }

  disconnect() {
    this.socket?.disconnect();
    this.socket = null;
    console.log("Socket disconnected manually");
  }

  joinConversation(conversationId: string) {
    const socket = this.socket;

    if (!socket) {
      return console.error("Socket chưa được khởi tạo");
    }

    const join = () => {
      socket.emit("tham_gia_nhom", conversationId);
      console.log(`Đã vào phòng: ${conversationId}`);
    };

    if (socket.connected) {
      join();
    } else {
      console.warn("Đang đợi kết nối để vào phòng...");
      socket.once("connect", join);
    }
  }

  onNewMessage(callback: (message: any) => void) {
    this.socket?.on("tin_nhan", (msg) => {
      console.log("Tin nhắn mới:", msg._id);
      callback(msg);
    });
  }

  offNewMessage(callback?: (message: any) => void) {
    this.socket?.off("tin_nhan", callback);
    console.log("Dọn dẹp socket 'tin_nhan'");
  }

  getSocket(): Socket | null {
    return this.socket;
  }
}

export const socketService = new SocketService();
