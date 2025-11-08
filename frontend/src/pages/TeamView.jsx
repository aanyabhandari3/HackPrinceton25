import React, { useState, useEffect } from 'react'
import { useSearchParams } from 'react-router-dom'
import { 
  UserMultiple, ArrowUp, WarningAlt, CheckmarkFilled, Time, 
  Chat as ChatIcon, Add, Filter, RequestQuote, Code, Debug, Branch 
} from '@carbon/icons-react'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from 'recharts'
import { useAIChat } from '../hooks/useAIChat.js'
import SarahChenImg from '../assets/profiles/SarahChen.png'
import AlexKumarImg from '../assets/profiles/AlexKumar.png'
import EmilyRodriguezImg from '../assets/profiles/EmilyRodriguez.png'

const TeamView = () => {
  const [searchParams, setSearchParams] = useSearchParams()
  const teamFromUrl = searchParams.get('team') || 'backend'
  const [selectedTeam, setSelectedTeam] = useState(teamFromUrl)
  const [activeTab, setActiveTab] = useState('overview')
  const [chatInput, setChatInput] = useState('')
  
  // AI Chat hook
  const { messages, isLoading: aiLoading, sendMessage } = useAIChat(selectedTeam)

  // Sync selectedTeam with URL parameter
  useEffect(() => {
    const teamParam = searchParams.get('team') || 'backend'
    if (teamParam !== selectedTeam) {
      setSelectedTeam(teamParam)
    }
  }, [searchParams])

  // Update URL when team is changed via dropdown
  const handleTeamChange = (newTeamId) => {
    setSearchParams({ team: newTeamId })
  }

  const teams = [
    { id: 'backend', name: 'Backend Team', lead: 'Sarah Chen', members: 10, focus: 'API v3 Migration' },
    { id: 'frontend', name: 'Frontend Team', lead: 'Mike Johnson', members: 8, focus: 'Dashboard Redesign' },
    { id: 'mobile', name: 'Mobile Team', lead: 'Lisa Wang', members: 6, focus: 'iOS App Launch' },
    { id: 'devops', name: 'DevOps Team', lead: 'Tom Brown', members: 5, focus: 'Infrastructure Upgrade' }
  ]

  // Team-specific velocity data
  const teamVelocityData = {
    backend: [
      { sprint: 'S1', planned: 45, completed: 42 },
      { sprint: 'S2', planned: 50, completed: 48 },
      { sprint: 'S3', planned: 48, completed: 45 },
      { sprint: 'S4', planned: 52, completed: 50 },
      { sprint: 'S5', planned: 55, completed: 52 },
      { sprint: 'S6', planned: 53, completed: 51 }
    ],
    frontend: [
      { sprint: 'S1', planned: 38, completed: 36 },
      { sprint: 'S2', planned: 42, completed: 41 },
      { sprint: 'S3', planned: 40, completed: 38 },
      { sprint: 'S4', planned: 45, completed: 44 },
      { sprint: 'S5', planned: 48, completed: 47 },
      { sprint: 'S6', planned: 46, completed: 45 }
    ],
    mobile: [
      { sprint: 'S1', planned: 32, completed: 30 },
      { sprint: 'S2', planned: 35, completed: 33 },
      { sprint: 'S3', planned: 34, completed: 32 },
      { sprint: 'S4', planned: 38, completed: 37 },
      { sprint: 'S5', planned: 40, completed: 38 },
      { sprint: 'S6', planned: 39, completed: 38 }
    ],
    devops: [
      { sprint: 'S1', planned: 28, completed: 27 },
      { sprint: 'S2', planned: 30, completed: 29 },
      { sprint: 'S3', planned: 32, completed: 30 },
      { sprint: 'S4', planned: 35, completed: 34 },
      { sprint: 'S5', planned: 33, completed: 32 },
      { sprint: 'S6', planned: 36, completed: 35 }
    ]
  }

  // Team-specific KPIs
  const teamKPIs = {
    backend: [
      { label: 'Velocity', value: '52', trend: '+8%', status: 'up', icon: ArrowUp },
      { label: 'Burn Rate', value: '94%', trend: 'On track', status: 'good', icon: CheckmarkFilled },
      { label: 'Carryover', value: '3', trend: '-2 from last', status: 'good', icon: Time },
      { label: 'Incidents', value: '1', trend: 'P2 open', status: 'warning', icon: WarningAlt }
    ],
    frontend: [
      { label: 'Velocity', value: '45', trend: '+12%', status: 'up', icon: ArrowUp },
      { label: 'Burn Rate', value: '97%', trend: 'Excellent', status: 'good', icon: CheckmarkFilled },
      { label: 'Carryover', value: '1', trend: '-3 from last', status: 'good', icon: Time },
      { label: 'Incidents', value: '0', trend: 'All clear', status: 'good', icon: CheckmarkFilled }
    ],
    mobile: [
      { label: 'Velocity', value: '38', trend: '+5%', status: 'up', icon: ArrowUp },
      { label: 'Burn Rate', value: '89%', trend: 'Good pace', status: 'good', icon: CheckmarkFilled },
      { label: 'Carryover', value: '2', trend: 'Same as last', status: 'warning', icon: Time },
      { label: 'Incidents', value: '2', trend: 'P3 open', status: 'warning', icon: WarningAlt }
    ],
    devops: [
      { label: 'Velocity', value: '35', trend: '+15%', status: 'up', icon: ArrowUp },
      { label: 'Burn Rate', value: '91%', trend: 'On track', status: 'good', icon: CheckmarkFilled },
      { label: 'Carryover', value: '4', trend: '+1 from last', status: 'warning', icon: Time },
      { label: 'Incidents', value: '3', trend: '1 P1, 2 P2', status: 'warning', icon: WarningAlt }
    ]
  }

  const velocityData = teamVelocityData[selectedTeam] || teamVelocityData.backend
  const kpis = teamKPIs[selectedTeam] || teamKPIs.backend

  // Team-specific members
  const teamMembersData = {
    backend: [
      { name: 'Sarah Chen', role: 'Team Lead', avatar: 'SC', avatarImg: SarahChenImg, lastUpdate: '2 hours ago', openTasks: 5, recentPRs: 3, status: 'active', focus: 'API authentication refactor' },
      { name: 'Alex Kumar', role: 'Senior Engineer', avatar: 'AK', avatarImg: AlexKumarImg, lastUpdate: '1 hour ago', openTasks: 4, recentPRs: 2, status: 'active', focus: 'Database optimization' },
      { name: 'Emily Rodriguez', role: 'Engineer', avatar: 'ER', avatarImg: EmilyRodriguezImg, lastUpdate: '3 hours ago', openTasks: 6, recentPRs: 1, status: 'active', focus: 'Payment gateway integration' },
      { name: 'David Park', role: 'Engineer', avatar: 'DP', avatarImg: null, lastUpdate: '5 hours ago', openTasks: 3, recentPRs: 4, status: 'away', focus: 'Microservices migration' },
      { name: 'Maria Santos', role: 'Junior Engineer', avatar: 'MS', avatarImg: null, lastUpdate: '1 day ago', openTasks: 2, recentPRs: 1, status: 'active', focus: 'Testing automation' }
    ],
    frontend: [
      { name: 'Mike Johnson', role: 'Team Lead', avatar: 'MJ', avatarImg: null, lastUpdate: '1 hour ago', openTasks: 7, recentPRs: 4, status: 'active', focus: 'Component library redesign' },
      { name: 'Lisa Wang', role: 'Senior Engineer', avatar: 'LW', avatarImg: null, lastUpdate: '30 min ago', openTasks: 5, recentPRs: 3, status: 'active', focus: 'Dashboard UI improvements' },
      { name: 'James Wilson', role: 'Engineer', avatar: 'JW', avatarImg: null, lastUpdate: '2 hours ago', openTasks: 4, recentPRs: 2, status: 'active', focus: 'Responsive design fixes' },
      { name: 'Nina Patel', role: 'Engineer', avatar: 'NP', avatarImg: null, lastUpdate: '4 hours ago', openTasks: 6, recentPRs: 1, status: 'active', focus: 'Accessibility improvements' }
    ],
    mobile: [
      { name: 'Lisa Wang', role: 'Team Lead', avatar: 'LW', avatarImg: null, lastUpdate: '45 min ago', openTasks: 4, recentPRs: 2, status: 'active', focus: 'iOS app store submission' },
      { name: 'Carlos Martinez', role: 'Senior Engineer', avatar: 'CM', avatarImg: null, lastUpdate: '2 hours ago', openTasks: 5, recentPRs: 3, status: 'active', focus: 'Push notification system' },
      { name: 'Priya Singh', role: 'Engineer', avatar: 'PS', avatarImg: null, lastUpdate: '3 hours ago', openTasks: 3, recentPRs: 1, status: 'active', focus: 'Offline mode implementation' },
      { name: 'Tom Chen', role: 'Engineer', avatar: 'TC', avatarImg: null, lastUpdate: '1 day ago', openTasks: 2, recentPRs: 2, status: 'away', focus: 'Performance optimization' }
    ],
    devops: [
      { name: 'Tom Brown', role: 'Team Lead', avatar: 'TB', avatarImg: null, lastUpdate: '3 hours ago', openTasks: 6, recentPRs: 2, status: 'active', focus: 'Kubernetes migration' },
      { name: 'Rachel Green', role: 'Senior Engineer', avatar: 'RG', avatarImg: null, lastUpdate: '1 hour ago', openTasks: 4, recentPRs: 3, status: 'active', focus: 'CI/CD pipeline optimization' },
      { name: 'Kevin Liu', role: 'Engineer', avatar: 'KL', avatarImg: null, lastUpdate: '5 hours ago', openTasks: 5, recentPRs: 1, status: 'active', focus: 'Monitoring setup' },
      { name: 'Sophie Turner', role: 'Engineer', avatar: 'ST', avatarImg: null, lastUpdate: '2 hours ago', openTasks: 3, recentPRs: 2, status: 'active', focus: 'Security hardening' }
    ]
  }

  // Team-specific backlog
  const teamBacklogData = {
    backend: [
      { id: 'BACK-234', title: 'Implement OAuth 2.0 flow', status: 'In Progress', priority: 'high', assignee: 'Sarah Chen', points: 8 },
      { id: 'BACK-235', title: 'Optimize database queries', status: 'In Progress', priority: 'high', assignee: 'Alex Kumar', points: 5 },
      { id: 'BACK-236', title: 'Add rate limiting middleware', status: 'To Do', priority: 'medium', assignee: 'Emily Rodriguez', points: 3 },
      { id: 'BACK-237', title: 'Update API documentation', status: 'To Do', priority: 'low', assignee: 'David Park', points: 2 },
      { id: 'BACK-238', title: 'Fix memory leak in worker', status: 'In Review', priority: 'high', assignee: 'Alex Kumar', points: 5 }
    ],
    frontend: [
      { id: 'FRONT-101', title: 'Redesign navigation component', status: 'In Progress', priority: 'high', assignee: 'Mike Johnson', points: 8 },
      { id: 'FRONT-102', title: 'Implement dark mode', status: 'In Progress', priority: 'medium', assignee: 'Lisa Wang', points: 5 },
      { id: 'FRONT-103', title: 'Fix responsive layout bugs', status: 'To Do', priority: 'high', assignee: 'James Wilson', points: 3 },
      { id: 'FRONT-104', title: 'Add keyboard shortcuts', status: 'To Do', priority: 'low', assignee: 'Nina Patel', points: 2 },
      { id: 'FRONT-105', title: 'Optimize bundle size', status: 'In Review', priority: 'medium', assignee: 'Lisa Wang', points: 5 }
    ],
    mobile: [
      { id: 'MOB-45', title: 'iOS app store submission', status: 'In Progress', priority: 'high', assignee: 'Lisa Wang', points: 13 },
      { id: 'MOB-46', title: 'Implement push notifications', status: 'In Progress', priority: 'high', assignee: 'Carlos Martinez', points: 8 },
      { id: 'MOB-47', title: 'Add offline mode', status: 'To Do', priority: 'medium', assignee: 'Priya Singh', points: 5 },
      { id: 'MOB-48', title: 'Optimize app performance', status: 'In Review', priority: 'medium', assignee: 'Tom Chen', points: 5 },
      { id: 'MOB-49', title: 'Fix camera integration', status: 'To Do', priority: 'low', assignee: 'Carlos Martinez', points: 3 }
    ],
    devops: [
      { id: 'OPS-78', title: 'Migrate to Kubernetes', status: 'In Progress', priority: 'high', assignee: 'Tom Brown', points: 13 },
      { id: 'OPS-79', title: 'Setup monitoring dashboards', status: 'In Progress', priority: 'high', assignee: 'Kevin Liu', points: 8 },
      { id: 'OPS-80', title: 'Optimize CI/CD pipeline', status: 'To Do', priority: 'medium', assignee: 'Rachel Green', points: 5 },
      { id: 'OPS-81', title: 'Security audit and fixes', status: 'In Review', priority: 'high', assignee: 'Sophie Turner', points: 8 },
      { id: 'OPS-82', title: 'Database backup automation', status: 'To Do', priority: 'medium', assignee: 'Kevin Liu', points: 3 }
    ]
  }

  const teamMembers = teamMembersData[selectedTeam] || teamMembersData.backend
  const backlogItems = teamBacklogData[selectedTeam] || teamBacklogData.backend

  const currentTeam = teams.find(t => t.id === selectedTeam)

  const getStatusColor = (status) => {
    const colors = {
      'To Do': 'bg-gray-100 text-gray-700',
      'In Progress': 'bg-blue-100 text-blue-700',
      'In Review': 'bg-purple-100 text-purple-700',
      'Done': 'bg-green-100 text-green-700'
    }
    return colors[status] || colors['To Do']
  }

  const getPriorityColor = (priority) => {
    const colors = {
      high: 'text-red-600',
      medium: 'text-yellow-600',
      low: 'text-green-600'
    }
    return colors[priority] || colors.medium
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header with Team Selector */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <select 
            value={selectedTeam}
            onChange={(e) => handleTeamChange(e.target.value)}
            className="px-3 py-2 text-lg font-semibold bg-white border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            {teams.map(team => (
              <option key={team.id} value={team.id}>{team.name}</option>
            ))}
          </select>
          <div className="text-sm text-gray-600">
            <p>Lead: {currentTeam?.lead} • {currentTeam?.members} members</p>
            <p className="text-xs text-gray-500">Current Focus: {currentTeam?.focus}</p>
          </div>
        </div>
        <div className="flex items-center space-x-2">
          <button className="px-3 py-2 text-sm bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors flex items-center space-x-2">
            <Filter size={16} />
            <span>Filter</span>
          </button>
          <button className="px-3 py-2 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2">
            <ChatIcon size={16} />
            <span>Ping Team Agent</span>
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200">
        <nav className="flex space-x-8">
          {['overview', 'members', 'ai-chat', 'backlog'].map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`pb-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                activeTab === tab
                  ? 'border-blue-600 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              {tab.split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')}
            </button>
          ))}
        </nav>
      </div>

      {/* Overview Tab */}
      {activeTab === 'overview' && (
        <div className="space-y-6">
          {/* KPI Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {kpis.map((kpi, index) => {
              const Icon = kpi.icon
              const iconColor = kpi.status === 'warning' ? 'text-red-600' : kpi.status === 'good' ? 'text-green-600' : 'text-blue-600'
              return (
                <div key={index} className="bg-white rounded-xl border border-gray-200 p-4 hover:shadow-md transition-shadow">
                  <div className="flex items-start justify-between mb-3">
                    <p className="text-xs font-medium uppercase tracking-wider text-gray-600">{kpi.label}</p>
                    <Icon size={20} className={iconColor} />
                  </div>
                  <p className="text-3xl font-semibold text-gray-900 mb-2">{kpi.value}</p>
                  <p className="text-xs text-gray-600">{kpi.trend}</p>
                </div>
              )
            })}
          </div>

          {/* Velocity Chart */}
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-6">Sprint Velocity</h2>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={velocityData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="sprint" stroke="#9ca3af" />
                <YAxis stroke="#9ca3af" />
                <Tooltip />
                <Bar dataKey="planned" fill="#93c5fd" name="Planned" />
                <Bar dataKey="completed" fill="#3b82f6" name="Completed" />
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Quick Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white rounded-xl border border-gray-200 p-6">
              <div className="flex items-center space-x-3 mb-4">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <Branch className="w-5 h-5 text-blue-600" />
                </div>
                <h3 className="font-semibold text-gray-900">Pull Requests</h3>
              </div>
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Open</span>
                  <span className="font-semibold">12</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">In Review</span>
                  <span className="font-semibold">8</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Merged (7d)</span>
                  <span className="font-semibold text-green-600">34</span>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl border border-gray-200 p-6">
              <div className="flex items-center space-x-3 mb-4">
                <div className="p-2 bg-purple-100 rounded-lg">
                  <Code className="w-5 h-5 text-purple-600" />
                </div>
                <h3 className="font-semibold text-gray-900">Code Quality</h3>
              </div>
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Coverage</span>
                  <span className="font-semibold text-green-600">87%</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Tech Debt</span>
                  <span className="font-semibold text-yellow-600">Medium</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Code Smells</span>
                  <span className="font-semibold">23</span>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl border border-gray-200 p-6">
              <div className="flex items-center space-x-3 mb-4">
                <div className="p-2 bg-red-100 rounded-lg">
                  <Debug className="w-5 h-5 text-red-600" />
                </div>
                <h3 className="font-semibold text-gray-900">Issues</h3>
              </div>
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Critical</span>
                  <span className="font-semibold text-red-600">1</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">High</span>
                  <span className="font-semibold text-orange-600">5</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Medium/Low</span>
                  <span className="font-semibold">12</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Members Tab */}
      {activeTab === 'members' && (
        <div className="space-y-4">
          {teamMembers.map((member, index) => (
            <div key={index} className="bg-white rounded-xl border border-gray-200 p-6 hover:shadow-md transition-shadow">
              <div className="flex items-start justify-between">
                <div className="flex items-start space-x-4">
                  {member.avatarImg ? (
                    <img 
                      src={member.avatarImg} 
                      alt={member.name}
                      className="w-12 h-12 rounded-full object-cover"
                    />
                  ) : (
                    <div className="w-12 h-12 rounded-full border border-gray-300 bg-gray-100 flex items-center justify-center text-gray-700 font-semibold">
                      {member.avatar}
                    </div>
                  )}
                  <div>
                    <div className="flex items-center space-x-2">
                      <h3 className="font-semibold text-gray-900">{member.name}</h3>
                      <span className={`w-2 h-2 rounded-full ${member.status === 'active' ? 'bg-green-500' : 'bg-gray-400'}`}></span>
                    </div>
                    <p className="text-sm text-gray-500">{member.role}</p>
                    <p className="text-sm text-gray-600 mt-2">Current focus: {member.focus}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-xs text-gray-500">Last update: {member.lastUpdate}</p>
                  <div className="flex items-center space-x-4 mt-3">
                    <div className="text-center">
                      <p className="text-lg font-semibold text-gray-900">{member.openTasks}</p>
                      <p className="text-xs text-gray-500">Open Tasks</p>
                    </div>
                    <div className="text-center">
                      <p className="text-lg font-semibold text-gray-900">{member.recentPRs}</p>
                      <p className="text-xs text-gray-500">Recent PRs</p>
                    </div>
                  </div>
                </div>
              </div>
              <div className="mt-4 flex items-center space-x-2">
                <button className="px-3 py-1.5 text-sm border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
                  View Profile
                </button>
                <button className="px-3 py-1.5 text-sm border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
                  Add to Report
                </button>
                <button className="px-3 py-1.5 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
                  Chat with Agent
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* AI Chat Tab */}
      {activeTab === 'ai-chat' && (
        <div className="bg-white rounded-xl border border-gray-200 p-6 min-h-[500px] flex flex-col">
          <div className="flex items-center space-x-3 mb-6 pb-4 border-b border-gray-200">
            <div className="p-3 rounded-lg border border-gray-300 bg-gray-100 text-gray-700">
              <ChatIcon className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-gray-900">Team AI Agent</h2>
              <p className="text-sm text-gray-500">Ask about project updates, create tickets, or get summaries</p>
            </div>
          </div>

          {/* Messages */}
          <div className="flex-1 space-y-4 mb-4 overflow-y-auto max-h-[400px]">
            {messages.map((message) => (
              <div key={message.id} className="flex items-start space-x-3">
                {message.role === 'assistant' && (
                  <div className="w-8 h-8 rounded-full border border-gray-300 bg-gray-100 flex items-center justify-center text-gray-700 text-sm font-semibold flex-shrink-0">
                    AI
                  </div>
                )}
                {message.role === 'user' && (
                  <div className="w-8 h-8 bg-gray-300 rounded-full flex items-center justify-center text-gray-700 text-sm font-semibold flex-shrink-0">
                    You
                  </div>
                )}
                <div className={`flex-1 rounded-lg p-4 ${
                  message.role === 'assistant' 
                    ? message.isError 
                      ? 'bg-red-50 border border-red-200' 
                      : 'bg-gray-50'
                    : 'bg-blue-50'
                }`}>
                  <p className="text-sm text-gray-900 whitespace-pre-wrap">{message.content}</p>
                  <p className="text-xs text-gray-500 mt-2">
                    {message.timestamp.toLocaleTimeString()}
                  </p>
                </div>
              </div>
            ))}
            {aiLoading && (
              <div className="flex items-start space-x-3">
                <div className="w-8 h-8 rounded-full border border-gray-300 bg-gray-100 flex items-center justify-center text-gray-700 text-sm font-semibold">
                  AI
                </div>
                <div className="flex-1 bg-gray-50 rounded-lg p-4">
                  <div className="flex items-center space-x-2">
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Input */}
          <div className="relative">
            <input
              type="text"
              value={chatInput}
              onChange={(e) => setChatInput(e.target.value)}
              onKeyPress={(e) => {
                if (e.key === 'Enter' && !aiLoading && chatInput.trim()) {
                  sendMessage(chatInput);
                  setChatInput('');
                }
              }}
              placeholder="Ask the team agent anything..."
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 pr-24"
              disabled={aiLoading}
            />
            <button 
              onClick={() => {
                if (chatInput.trim() && !aiLoading) {
                  sendMessage(chatInput);
                  setChatInput('');
                }
              }}
              disabled={aiLoading || !chatInput.trim()}
              className="absolute right-2 top-1/2 transform -translate-y-1/2 px-4 py-1.5 bg-blue-600 text-white rounded-md font-medium hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {aiLoading ? 'Sending...' : 'Send'}
            </button>
          </div>
        </div>
      )}

      {/* Backlog Tab */}
      {activeTab === 'backlog' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <button className="px-3 py-1.5 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
                All
              </button>
              <button className="px-3 py-1.5 text-sm border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
                To Do
              </button>
              <button className="px-3 py-1.5 text-sm border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
                In Progress
              </button>
              <button className="px-3 py-1.5 text-sm border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
                In Review
              </button>
            </div>
            <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2">
              <Add className="w-4 h-4" />
              <span>New Task</span>
            </button>
          </div>

          <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ID</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Title</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Priority</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Assignee</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Points</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {backlogItems.map((item, index) => (
                  <tr key={index} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{item.id}</td>
                    <td className="px-6 py-4 text-sm text-gray-900">{item.title}</td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(item.status)}`}>
                        {item.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`text-sm font-medium ${getPriorityColor(item.priority)}`}>
                        {item.priority.charAt(0).toUpperCase() + item.priority.slice(1)}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{item.assignee}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{item.points}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  )
}

export default TeamView
