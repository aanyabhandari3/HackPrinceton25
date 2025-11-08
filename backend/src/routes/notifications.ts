import { Router } from 'express';

const router = Router();

// Mock notifications data
const mockNotifications = [
  {
    id: 1,
    type: 'mention',
    title: 'Sarah Chen mentioned you',
    message: 'in #backend-team: "Can you review the API changes?"',
    time: '5 min ago',
    unread: true
  },
  {
    id: 2,
    type: 'update',
    title: 'Sprint Planning Complete',
    message: 'Backend Team has completed sprint planning for Sprint 24',
    time: '1 hour ago',
    unread: true
  },
  {
    id: 3,
    type: 'alert',
    title: 'Critical Issue Detected',
    message: 'Production API response time exceeded threshold',
    time: '2 hours ago',
    unread: false
  },
  {
    id: 4,
    type: 'success',
    title: 'Deployment Successful',
    message: 'v2.3.0 deployed to production successfully',
    time: '3 hours ago',
    unread: false
  },
  {
    id: 5,
    type: 'mention',
    title: 'Alex Kumar assigned you',
    message: 'to task BACK-235: Optimize database queries',
    time: '5 hours ago',
    unread: false
  }
];

// Get all notifications
router.get('/', (req, res) => {
  res.json(mockNotifications);
});

// Mark notification as read
router.patch('/:id/read', (req, res) => {
  const { id } = req.params;
  const notification = mockNotifications.find(n => n.id === parseInt(id));
  
  if (notification) {
    notification.unread = false;
    res.json({ success: true, notification });
  } else {
    res.status(404).json({ error: 'Notification not found' });
  }
});

// Mark all as read
router.patch('/read-all', (req, res) => {
  mockNotifications.forEach(n => n.unread = false);
  res.json({ success: true, message: 'All notifications marked as read' });
});

export { router as notificationsRouter };
