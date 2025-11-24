import { io } from "socket.io-client";

// For local development - change this to your Render URL when deploying
export const socket = io("http://localhost:3000", {
  transports: ["websocket"],
});
