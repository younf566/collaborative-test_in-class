import { io } from "socket.io-client";

// Production backend URL on Render
export const socket = io("https://collaborative-test-in-class-np6q.onrender.com", {
  transports: ["websocket"],
});
