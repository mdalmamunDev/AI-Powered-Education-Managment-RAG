// src/socket.js
import { io } from "socket.io-client";

const socket = io(process.env.VUE_APP_SOCKET, {
  transports: ["websocket"], // Ensure websocket connection
});

export default socket;
