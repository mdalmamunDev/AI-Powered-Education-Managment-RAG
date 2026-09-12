// src/plugins/socket.js
import { io } from "socket.io-client";

let activeSocket = null;

const baseUrl =
  process.env.VUE_APP_SOCKET ||
  (process.env.VUE_APP_API_URL || "").replace(/\/api\/v1$/, "");

// Backward-compatible instance used by MessagesCom (kept as it was).
const defaultSocket = io(baseUrl, {
  transports: ["websocket"], // Ensure websocket connection
});

export default defaultSocket;

// Lazy, auth-aware connection used by the AI chat widget. Reuses the API token
// so the server can place this connection into the user's private room and
// stream chat stage/token updates.
export function getSocket() {
  if (activeSocket && activeSocket.connected) return activeSocket;
  if (activeSocket) {
    activeSocket.removeAllListeners();
    activeSocket.disconnect();
    activeSocket = null;
  }
  activeSocket = io(baseUrl, {
    transports: ["websocket"],
    auth: { token: localStorage.getItem("token") },
    reconnectionDelay: 2000,
  });
  return activeSocket;
}

export function disconnectSocket() {
  if (activeSocket) {
    activeSocket.removeAllListeners();
    activeSocket.disconnect();
    activeSocket = null;
  }
}
