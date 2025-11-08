import { Router, Request, Response } from 'express';

const router = Router();

// Store active SSE connections
const clients: Set<Response> = new Set();

// SSE endpoint for real-time notifications
router.get('/notifications', (req: Request, res: Response) => {
  // Set headers for SSE
  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');
  res.setHeader('Access-Control-Allow-Origin', '*');

  // Add client to set
  clients.add(res);

  // Send initial connection message
  res.write(`data: ${JSON.stringify({ type: 'connected', message: 'Connected to notification stream' })}\n\n`);

  // Remove client on connection close
  req.on('close', () => {
    clients.delete(res);
  });
});

// Function to broadcast notification to all connected clients
export function broadcastNotification(notification: any) {
  const data = JSON.stringify({ type: 'notification', data: notification });
  clients.forEach(client => {
    client.write(`data: ${data}\n\n`);
  });
}

// Simulate sending notifications periodically (for demo)
setInterval(() => {
  const demoNotifications = [
    {
      id: Date.now(),
      type: 'update',
      title: 'New PR Merged',
      message: 'Backend Team: PR #234 has been merged to main',
      time: 'Just now',
      unread: true
    },
    {
      id: Date.now() + 1,
      type: 'mention',
      title: 'You were mentioned',
      message: 'in #frontend-team: "Can you help with the review?"',
      time: 'Just now',
      unread: true
    }
  ];

  // Randomly send a notification every 30 seconds
  if (Math.random() > 0.7) {
    const randomNotif = demoNotifications[Math.floor(Math.random() * demoNotifications.length)];
    broadcastNotification(randomNotif);
  }
}, 30000);

export { router as sseRouter };
