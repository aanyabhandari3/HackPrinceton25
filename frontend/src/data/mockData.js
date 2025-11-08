// Teams Data
export const teams = [
  { id: 'backend', name: 'Backend Team', lead: 'Sarah Chen', members: 10, focus: 'API v3 Migration', unread: 3 },
  { id: 'frontend', name: 'Frontend Team', lead: 'Mike Johnson', members: 8, focus: 'Dashboard Redesign', unread: 0 },
  { id: 'mobile', name: 'Mobile Team', lead: 'Lisa Wang', members: 6, focus: 'iOS App Launch', unread: 1 },
  { id: 'devops', name: 'DevOps Team', lead: 'Tom Brown', members: 5, focus: 'Infrastructure Upgrade', unread: 0 },
  { id: 'qa', name: 'QA Team', lead: 'Emma Davis', members: 7, focus: 'Automation Suite', unread: 0 },
]

// Activity Data for Charts
export const activityData = [
  { date: 'Mon', value: 45 },
  { date: 'Tue', value: 52 },
  { date: 'Wed', value: 38 },
  { date: 'Thu', value: 65 },
  { date: 'Fri', value: 58 },
  { date: 'Sat', value: 20 },
  { date: 'Sun', value: 15 },
]

// Velocity Data
export const velocityData = [
  { sprint: 'S1', planned: 45, completed: 42 },
  { sprint: 'S2', planned: 50, completed: 48 },
  { sprint: 'S3', planned: 48, completed: 45 },
  { sprint: 'S4', planned: 52, completed: 50 },
  { sprint: 'S5', planned: 55, completed: 52 },
  { sprint: 'S6', planned: 53, completed: 51 },
]

// Team Activity
export const teamActivity = [
  { name: 'Backend Team', lead: 'Sarah Chen', active: 8, total: 10, activity: 92 },
  { name: 'Frontend Team', lead: 'Mike Johnson', active: 6, total: 8, activity: 75 },
  { name: 'Mobile Team', lead: 'Lisa Wang', active: 5, total: 6, activity: 83 },
  { name: 'DevOps Team', lead: 'Tom Brown', active: 4, total: 5, activity: 80 },
  { name: 'QA Team', lead: 'Emma Davis', active: 5, total: 7, activity: 71 },
]

// Recent Highlights
export const recentHighlights = [
  {
    type: 'success',
    team: 'Backend Team',
    message: 'Successfully deployed v2.3.0 to production',
    time: '2 hours ago',
  },
  {
    type: 'warning',
    team: 'Frontend Team',
    message: 'Performance regression detected in dashboard loading',
    time: '4 hours ago',
  },
  {
    type: 'info',
    team: 'Mobile Team',
    message: 'Sprint planning completed - 23 stories committed',
    time: '5 hours ago',
  },
  {
    type: 'success',
    team: 'DevOps Team',
    message: 'CI/CD pipeline optimization reduced build time by 40%',
    time: '1 day ago',
  },
]

// Upcoming Deadlines
export const upcomingDeadlines = [
  { project: 'Q4 Platform Upgrade', team: 'Backend', date: '2024-01-15', daysLeft: 3, priority: 'high' },
  { project: 'Mobile App Redesign', team: 'Mobile', date: '2024-01-20', daysLeft: 8, priority: 'medium' },
  { project: 'API Documentation', team: 'Backend', date: '2024-01-25', daysLeft: 13, priority: 'low' },
  { project: 'Security Audit', team: 'DevOps', date: '2024-01-18', daysLeft: 6, priority: 'high' },
]

// Team Members
export const teamMembers = [
  {
    name: 'Sarah Chen',
    role: 'Team Lead',
    avatar: 'SC',
    lastUpdate: '2 hours ago',
    openTasks: 5,
    recentPRs: 3,
    status: 'active',
    focus: 'API authentication refactor',
  },
  {
    name: 'Alex Kumar',
    role: 'Senior Engineer',
    avatar: 'AK',
    lastUpdate: '1 hour ago',
    openTasks: 7,
    recentPRs: 5,
    status: 'active',
    focus: 'Database optimization',
  },
  {
    name: 'Maria Garcia',
    role: 'Engineer',
    avatar: 'MG',
    lastUpdate: '30 min ago',
    openTasks: 4,
    recentPRs: 2,
    status: 'active',
    focus: 'Payment gateway integration',
  },
  {
    name: 'James Wilson',
    role: 'Engineer',
    avatar: 'JW',
    lastUpdate: '3 hours ago',
    openTasks: 6,
    recentPRs: 4,
    status: 'away',
    focus: 'Microservices migration',
  },
]

// AI Agents
export const aiAgents = [
  {
    id: 1,
    name: 'Code Review Agent',
    description: 'Automated code review and suggestions',
    status: 'active',
    tasksCompleted: 1247,
    accuracy: 94,
    category: 'Development',
  },
  {
    id: 2,
    name: 'Sprint Planner',
    description: 'AI-powered sprint planning and estimation',
    status: 'active',
    tasksCompleted: 523,
    accuracy: 89,
    category: 'Planning',
  },
  {
    id: 3,
    name: 'Bug Predictor',
    description: 'Predicts potential bugs before deployment',
    status: 'active',
    tasksCompleted: 892,
    accuracy: 91,
    category: 'Quality',
  },
  {
    id: 4,
    name: 'Documentation Bot',
    description: 'Auto-generates and updates documentation',
    status: 'paused',
    tasksCompleted: 356,
    accuracy: 87,
    category: 'Documentation',
  },
]

// Reports
export const reports = [
  {
    id: 1,
    name: 'Weekly Team Performance',
    type: 'Performance',
    schedule: 'Every Monday 9:00 AM',
    lastRun: '2024-01-08',
    recipients: ['team-leads@company.com'],
  },
  {
    id: 2,
    name: 'Sprint Burndown',
    type: 'Sprint',
    schedule: 'Daily 6:00 PM',
    lastRun: '2024-01-11',
    recipients: ['scrum-masters@company.com'],
  },
  {
    id: 3,
    name: 'Code Quality Metrics',
    type: 'Quality',
    schedule: 'Every Friday 5:00 PM',
    lastRun: '2024-01-05',
    recipients: ['engineering@company.com'],
  },
]

export default {
  teams,
  activityData,
  velocityData,
  teamActivity,
  recentHighlights,
  upcomingDeadlines,
  teamMembers,
  aiAgents,
  reports,
}
