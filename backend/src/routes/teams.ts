import { Router } from 'express';

const router = Router();

// Mock teams data
const mockTeams = [
  { id: 'backend', name: 'Backend Team', lead: 'Sarah Chen', members: 10, focus: 'API v3 Migration' },
  { id: 'frontend', name: 'Frontend Team', lead: 'Mike Johnson', members: 8, focus: 'Dashboard Redesign' },
  { id: 'mobile', name: 'Mobile Team', lead: 'Lisa Wang', members: 6, focus: 'iOS App Launch' },
  { id: 'devops', name: 'DevOps Team', lead: 'Tom Brown', members: 5, focus: 'Infrastructure Upgrade' }
];

// Get all teams
router.get('/', (req, res) => {
  res.json(mockTeams);
});

// Get team details
router.get('/:teamId', (req, res) => {
  const { teamId } = req.params;
  const team = mockTeams.find(t => t.id === teamId);
  
  if (team) {
    res.json(team);
  } else {
    res.status(404).json({ error: 'Team not found' });
  }
});

// Get team activity
router.get('/:teamId/activity', (req, res) => {
  const { teamId } = req.params;
  
  // Mock activity data
  const activity = [
    { date: '2024-01-10', commits: 23, prs: 5, issues: 12 },
    { date: '2024-01-11', commits: 18, prs: 3, issues: 8 },
    { date: '2024-01-12', commits: 31, prs: 7, issues: 15 }
  ];
  
  res.json(activity);
});

export { router as teamsRouter };
