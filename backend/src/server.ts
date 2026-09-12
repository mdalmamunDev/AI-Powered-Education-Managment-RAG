import 'dotenv/config';
import app from './app';
import { initSocket } from './helpers/socket';
import { startChatWorker } from './modules/assistant/worker';
import { chatQueue, connection } from './modules/assistant/queue';
import { prisma } from '../prisma/prisma';

const PORT = parseInt(process.env.PORT || '5000', 10);
const IP = process.env.IP || '0.0.0.0';

const server = app.listen(PORT, IP, () => {
  console.log(`Server is running on http://${IP}:${PORT}`);
});

// Socket.IO shares the HTTP port so the chat worker can stream progress to users.
initSocket(server);

// One chat job is processed at a time; everyone else waits in the BullMQ queue.
const chatWorker = startChatWorker();
console.log('[chat] BullMQ worker started (concurrency 1 — one chat at a time)');

process.on('unhandledRejection', (err: any) => {
  console.error('Unhandled Rejection:', err);
});

process.on('uncaughtException', (err: any) => {
  console.error('Uncaught Exception:', err);
});

async function shutdown(signal: string) {
  console.log(`\n[server] ${signal} received, shutting down…`);
  try {
    await chatWorker.close();
    await chatQueue.close();
    connection.disconnect(true);
    await prisma.$disconnect();
  } catch (err) {
    console.error('[server] error during shutdown:', err);
  }
  server.close(() => process.exit(0));
  setTimeout(() => process.exit(0), 5000).unref();
}

process.on('SIGINT', () => shutdown('SIGINT'));
process.on('SIGTERM', () => shutdown('SIGTERM'));
