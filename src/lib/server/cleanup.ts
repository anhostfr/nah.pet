import { db } from './db.js';

let cleanupInterval: NodeJS.Timeout | null = null;

async function cleanupExpiredSessions() {
  try {
    await db.session.deleteMany({
      where: {
        expiresAt: { lte: new Date() }
      }
    });
  } catch (error) {
    console.error('Error while cleaning sessions', error);
  }
}

if (!cleanupInterval) {
  console.log('Initializing automatic cleanup of expired sessions');
  
  cleanupExpiredSessions();
  
  cleanupInterval = setInterval(() => {
    cleanupExpiredSessions();
  }, 60 * 60 * 1000);
}

process.on('SIGTERM', () => {
  if (cleanupInterval) {
    clearInterval(cleanupInterval);
    console.log('🛑 Cleanup of expired sessions stopped');
  }
});