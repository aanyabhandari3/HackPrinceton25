import React, { useState } from 'react'
import { 
  UserMultiple, ArrowUp, WarningAlt, CheckmarkFilled, Time, 
  Chat as ChatIcon, Add, Filter, RequestQuote, Code, Debug 
} from '@carbon/icons-react'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from 'recharts'

const TeamView = () => {
  const [selectedTeam, setSelectedTeam] = useState('backend')
  const [activeTab, setActiveTab] = useState('overview')

  const teams = [
    { id: 'backend', name: 'Backend Team', lead: 'Sarah Chen', members: 10, focus: 'API v3 Migration' },
    { id: 'frontend', name: 'Frontend Team', lead: 'Mike Johnson', members: 8, focus: 'Dashboard Redesign' },
    { id: 'mobile', name: 'Mobile Team', lead: 'Lisa Wang', members: 6, focus: 'iOS App Launch' },
    { id: 'devops', name: 'DevOps Team', lead: 'Tom Brown', members: 5, focus: 'Infrastructure Upgrade' }
  ]

  const velocityData = [
    { sprint: 'S1', planned: 45, completed: 42 },
    { sprint: 'S2', planned: 50, completed: 48 },
    { sprint: 'S3', planned: 48, completed: 45 },
    { sprint: 'S4', planned: 52, completed: 50 },
    { sprint: 'S5', planned: 55, completed: 52 },
    { sprint: 'S6', planned: 53, completed: 51 }
  ]

  const kpis = [
    { label: 'Velocity', value: '52', trend: '+8%', status: 'up', icon: ArrowUp },
    { label: 'Burn Rate', value: '94%', trend: 'On track', status: 'good', icon: CheckmarkFilled },
    { label: 'Carryover', value: '3', trend: '-2 from last', status: 'good', icon: Time },
    { label: 'Incidents', value: '1', trend: 'P2 open', status: 'warning', icon: WarningAlt }
  ]

  const teamMembers = [
    { 
      name: 'Sarah Chen', 
      role: 'Team Lead', 
      avatar: 'SC',
      lastUpdate: '2 hours ago',
      openTasks: 5,
      recentPRs: 3,
      status: 'active',
      focus: 'API authentication refactor'
    },
    { 
      name: 'Alex Kumar', 
      role: 'Senior Engineer', 
      avatar: 'AK',
      lastUpdate: '1 hour ago',
      openTasks: 4,
      recentPRs: 2,
      status: 'active',
      focus: 'Database optimization'
    },
    { 
      name: 'Emily Rodriguez', 
      role: 'Engineer', 
      avatar: 'ER',
      lastUpdate: '3 hours ago',
      openTasks: 6,
      recentPRs: 1,
      status: 'active',
      focus: 'Payment gateway integration'
    },
    { 
      name: 'David Park', 
      role: 'Engineer', 
      avatar: 'DP',
      lastUpdate: '5 hours ago',
      openTasks: 3,
      recentPRs: 4,
      status: 'active',
      focus: 'Webhook system redesign'
    },
    { 
      name: 'Maria Santos', 
      role: 'Junior Engineer', 
      avatar: 'MS',
      lastUpdate: '1 day ago',
      openTasks: 2,
      recentPRs: 1,
      status: 'away',
      focus: 'Unit test coverage'
    }
  ]

  const backlogItems = [
    { id: 'BACK-234', title: 'Implement OAuth 2.0 flow', status: 'In Progress', priority: 'high', assignee: 'Sarah Chen', points: 8 },
    { id: 'BACK-235', title: 'Optimize database queries', status: 'In Progress', priority: 'high', assignee: 'Alex Kumar', points: 5 },
    { id: 'BACK-236', title: 'Add rate limiting middleware', status: 'To Do', priority: 'medium', assignee: 'Emily Rodriguez', points: 3 },
    { id: 'BACK-237', title: 'Update API documentation', status: 'To Do', priority: 'low', assignee: 'David Park', points: 2 },
    { id: 'BACK-238', title: 'Fix memory leak in worker', status: 'In Review', priority: 'high', assignee: 'Alex Kumar', points: 5 }
  ]

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
            onChange={(e) => setSelectedTeam(e.target.value)}
            className="px-3 py-2 text-lg font-semibold focus:outline-none"
            style={{ 
              backgroundColor: '#f4f4f4',
              border: '1px solid #8d8d8d',
              borderBottom: '1px solid #8d8d8d',
              color: '#161616'
            }}
          >
            {teams.map(team => (
              <option key={team.id} value={team.id}>{team.name}</option>
            ))}
          </select>
          <div className="text-sm" style={{ color: '#525252' }}>
            <p>Lead: {currentTeam?.lead} • {currentTeam?.members} members</p>
            <p className="text-xs">Current Focus: {currentTeam?.focus}</p>
          </div>
        </div>
        <div className="flex items-center space-x-2">
          <button className="px-3 py-2 text-sm transition-colors flex items-center space-x-2" style={{ backgroundColor: '#ffffff', border: '1px solid #8d8d8d', color: '#161616' }} onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#e0e0e0'} onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#ffffff'}>
            <Filter size={16} />
            <span>Filter</span>
          </button>
          <button className="px-3 py-2 text-white text-sm transition-colors flex items-center space-x-2" style={{ backgroundColor: '#0f62fe' }} onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#0353e9'} onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#0f62fe'}>
            <ChatIcon size={16} />
            <span>Ping Team Agent</span>
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div style={{ borderBottom: '1px solid #e0e0e0' }}>
        <nav className="flex space-x-8">
          {['overview', 'members', 'ai-chat', 'backlog'].map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`pb-3 px-1 border-b-2 font-medium text-sm transition-colors`}
              style={{
                borderBottomColor: activeTab === tab ? '#0f62fe' : 'transparent',
                color: activeTab === tab ? '#0f62fe' : '#525252'
              }}
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
              const iconColor = kpi.status === 'warning' ? '#da1e28' : kpi.status === 'good' ? '#24a148' : '#0f62fe'
              return (
                <div key={index} className="p-4 transition-all hover:shadow-md" style={{ backgroundColor: '#ffffff', border: '1px solid #e0e0e0' }}>
                  <div className="flex items-start justify-between mb-3">
                    <p className="text-xs font-medium uppercase tracking-wider" style={{ color: '#525252' }}>{kpi.label}</p>
                    <Icon size={20} style={{ color: iconColor }} />
                  </div>
                  <p className="text-3xl font-semibold mb-2" style={{ color: '#161616' }}>{kpi.value}</p>
                  <p className="text-xs" style={{ color: '#525252' }}>{kpi.trend}</p>
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
                  <GitPullRequest className="w-5 h-5 text-blue-600" />
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
                  <Bug className="w-5 h-5 text-red-600" />
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
                  <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-semibold">
                    {member.avatar}
                  </div>
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
            <div className="p-3 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg">
              <MessageSquare className="w-6 h-6 text-white" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-gray-900">Team AI Agent</h2>
              <p className="text-sm text-gray-500">Ask about project updates, create tickets, or get summaries</p>
            </div>
          </div>

          <div className="flex-1 space-y-4 mb-4">
            <div className="flex items-start space-x-3">
              <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white text-sm font-semibold">
                AI
              </div>
              <div className="flex-1 bg-gray-50 rounded-lg p-4">
                <p className="text-sm text-gray-900">Hello! I'm the Backend Team's AI agent. I can help you with:</p>
                <ul className="mt-2 space-y-1 text-sm text-gray-700">
                  <li>• Get project status updates</li>
                  <li>• Summarize recent discussions</li>
                  <li>• Create or update tickets</li>
                  <li>• Analyze team performance</li>
                </ul>
              </div>
            </div>
          </div>

          <div className="relative">
            <input
              type="text"
              placeholder="Ask the team agent anything..."
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 pr-24"
            />
            <button className="absolute right-2 top-1/2 transform -translate-y-1/2 px-4 py-1.5 bg-blue-600 text-white rounded-md font-medium hover:bg-blue-700 transition-colors">
              Send
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
              <Plus className="w-4 h-4" />
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
