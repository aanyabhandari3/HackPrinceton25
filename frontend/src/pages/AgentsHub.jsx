import React, { useState } from 'react'
import { 
  Bot, Chat, Settings, Activity, Link as LinkIcon, 
  CheckmarkFilled, Time, ChartLine, UserMultiple, Branch, 
  LogoSlack, LogoGithub, Document, Add, Edit, TrashCan, View, WarningAlt
} from '@carbon/icons-react'

const AgentsHub = () => {
  const [activeTab, setActiveTab] = useState('my-agents')
  const [selectedAgent, setSelectedAgent] = useState(null)

  const myAgents = [
    {
      id: 1,
      name: 'Backend Team Agent',
      purpose: 'Monitor backend team activities, generate reports, and answer queries',
      team: 'Backend Team',
      status: 'active',
      queriesHandled: 342,
      reportsGenerated: 28,
      lastActive: '5 minutes ago',
      connectedSources: ['GitHub', 'Jira', 'Slack'],
      scope: ['Read team data', 'Create tickets', 'Generate reports'],
      tone: 'Professional',
      visibility: 'Team only',
      recentInteractions: [
        { query: 'What are the open blockers?', time: '5 min ago', type: 'query' },
        { query: 'Generate weekly report', time: '2 hours ago', type: 'report' },
        { query: 'Create ticket for API bug', time: '5 hours ago', type: 'action' }
      ]
    },
    {
      id: 2,
      name: 'Frontend Team Agent',
      purpose: 'Track frontend development progress and coordinate with design team',
      team: 'Frontend Team',
      status: 'active',
      queriesHandled: 256,
      reportsGenerated: 22,
      lastActive: '15 minutes ago',
      connectedSources: ['GitHub', 'Figma', 'Slack'],
      scope: ['Read team data', 'Generate reports', 'Design sync'],
      tone: 'Friendly',
      visibility: 'Team only',
      recentInteractions: [
        { query: 'Show component library updates', time: '15 min ago', type: 'query' },
        { query: 'Sync with design team', time: '1 hour ago', type: 'action' },
        { query: 'Performance metrics summary', time: '3 hours ago', type: 'query' }
      ]
    },
    {
      id: 3,
      name: 'Mobile Team Agent',
      purpose: 'Monitor mobile app development and app store metrics',
      team: 'Mobile Team',
      status: 'active',
      queriesHandled: 189,
      reportsGenerated: 15,
      lastActive: '1 hour ago',
      connectedSources: ['GitHub', 'Jira', 'App Store Connect'],
      scope: ['Read team data', 'App metrics', 'Generate reports'],
      tone: 'Professional',
      visibility: 'Team only',
      recentInteractions: [
        { query: 'App store review summary', time: '1 hour ago', type: 'query' },
        { query: 'Sprint velocity analysis', time: '4 hours ago', type: 'report' },
        { query: 'Bug triage summary', time: '6 hours ago', type: 'query' }
      ]
    },
    {
      id: 4,
      name: 'DevOps Team Agent',
      purpose: 'Monitor infrastructure, deployments, and system health',
      team: 'DevOps Team',
      status: 'active',
      queriesHandled: 421,
      reportsGenerated: 35,
      lastActive: '2 minutes ago',
      connectedSources: ['GitHub', 'AWS', 'DataDog', 'PagerDuty'],
      scope: ['Read infrastructure', 'Monitor deployments', 'Alert management'],
      tone: 'Technical',
      visibility: 'Team + Leadership',
      recentInteractions: [
        { query: 'Deployment status check', time: '2 min ago', type: 'query' },
        { query: 'Infrastructure cost report', time: '30 min ago', type: 'report' },
        { query: 'Alert summary', time: '1 hour ago', type: 'query' }
      ]
    },
    {
      id: 5,
      name: 'Organization Agent',
      purpose: 'Cross-team insights, executive summaries, and org-wide analytics',
      team: 'All Teams',
      status: 'active',
      queriesHandled: 567,
      reportsGenerated: 48,
      lastActive: '10 minutes ago',
      connectedSources: ['All team sources', 'HR System', 'Finance'],
      scope: ['Read all data', 'Cross-team analysis', 'Executive reports'],
      tone: 'Executive',
      visibility: 'Leadership only',
      recentInteractions: [
        { query: 'Q4 progress summary', time: '10 min ago', type: 'report' },
        { query: 'Cross-team dependencies', time: '1 hour ago', type: 'query' },
        { query: 'Resource allocation analysis', time: '3 hours ago', type: 'query' }
      ]
    }
  ]

  const allAgents = [
    ...myAgents,
    {
      id: 6,
      name: 'QA Team Agent',
      purpose: 'Track testing progress and quality metrics',
      team: 'QA Team',
      status: 'active',
      queriesHandled: 178,
      reportsGenerated: 19,
      lastActive: '30 minutes ago',
      connectedSources: ['Jira', 'TestRail'],
      scope: ['Read test data', 'Generate reports'],
      tone: 'Professional',
      visibility: 'Team only',
      recentInteractions: []
    }
  ]

  const connectorIcons = {
    'GitHub': LogoGithub,
    'Jira': Document,
    'Slack': LogoSlack,
    'Figma': Document,
    'AWS': Activity,
    'DataDog': ChartLine,
    'PagerDuty': WarningAlt,
    'Linear': Branch,
    'Notion': Document,
    'HR System': UserMultiple,
    'Finance': Document,
    'TestRail': CheckmarkFilled
  }

  const getStatusColor = (status) => {
    return status === 'active' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'
  }

  const getInteractionIcon = (type) => {
    if (type === 'query') return <Chat className="w-4 h-4 text-blue-600" />
    if (type === 'report') return <Document className="w-4 h-4 text-purple-600" />
    if (type === 'action') return <Activity className="w-4 h-4 text-green-600" />
    return <Chat className="w-4 h-4 text-gray-600" />
  }

  const agents = activeTab === 'my-agents' ? myAgents : allAgents

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">AI Agents Hub</h1>
          <p className="text-gray-500 mt-1">Manage and monitor your AI agents across the organization</p>
        </div>
        <button className="px-4 py-2 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-lg hover:from-blue-600 hover:to-purple-700 transition-all flex items-center space-x-2">
          <Add className="w-4 h-4" />
          <span>Create New Agent</span>
        </button>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200">
        <nav className="flex space-x-8">
          {['my-agents', 'all-agents', 'settings'].map(tab => (
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

      {/* My Agents / All Agents Tab */}
      {(activeTab === 'my-agents' || activeTab === 'all-agents') && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {agents.map((agent) => (
            <div 
              key={agent.id} 
              className="bg-white rounded-xl border border-gray-200 p-6 hover:shadow-lg transition-all"
            >
              {/* Agent Header */}
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-start space-x-3">
                  <div className="p-3 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg">
                    <Bot className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-lg text-gray-900">{agent.name}</h3>
                    <p className="text-sm text-gray-500">{agent.team}</p>
                  </div>
                </div>
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(agent.status)}`}>
                  {agent.status}
                </span>
              </div>

              {/* Purpose */}
              <p className="text-sm text-gray-600 mb-4">{agent.purpose}</p>

              {/* Stats */}
              <div className="grid grid-cols-3 gap-4 mb-4">
                <div className="text-center p-3 bg-blue-50 rounded-lg">
                  <p className="text-xl font-bold text-blue-600">{agent.queriesHandled}</p>
                  <p className="text-xs text-gray-600">Queries</p>
                </div>
                <div className="text-center p-3 bg-purple-50 rounded-lg">
                  <p className="text-xl font-bold text-purple-600">{agent.reportsGenerated}</p>
                  <p className="text-xs text-gray-600">Reports</p>
                </div>
                <div className="text-center p-3 bg-green-50 rounded-lg">
                  <p className="text-xs text-gray-600 mb-1">Last Active</p>
                  <p className="text-xs font-semibold text-gray-900">{agent.lastActive}</p>
                </div>
              </div>

              {/* Connected Sources */}
              <div className="mb-4">
                <p className="text-xs font-medium text-gray-500 uppercase mb-2">Connected Sources</p>
                <div className="flex flex-wrap gap-2">
                  {agent.connectedSources.map((source, idx) => {
                    const Icon = connectorIcons[source] || LinkIcon
                    return (
                      <div key={idx} className="flex items-center space-x-1 px-2 py-1 bg-gray-100 rounded-md">
                        <Icon className="w-3 h-3 text-gray-600" />
                        <span className="text-xs text-gray-700">{source}</span>
                      </div>
                    )
                  })}
                </div>
              </div>

              {/* Recent Interactions */}
              {agent.recentInteractions.length > 0 && (
                <div className="mb-4">
                  <p className="text-xs font-medium text-gray-500 uppercase mb-2">Recent Interactions</p>
                  <div className="space-y-2">
                    {agent.recentInteractions.slice(0, 2).map((interaction, idx) => (
                      <div key={idx} className="flex items-start space-x-2 text-xs">
                        {getInteractionIcon(interaction.type)}
                        <div className="flex-1 min-w-0">
                          <p className="text-gray-700 truncate">{interaction.query}</p>
                          <p className="text-gray-400">{interaction.time}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Actions */}
              <div className="flex items-center space-x-2">
                <button 
                  onClick={() => setSelectedAgent(agent)}
                  className="flex-1 px-3 py-2 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center space-x-2"
                >
                  <Chat className="w-4 h-4" />
                  <span>Chat</span>
                </button>
                <button className="px-3 py-2 text-sm border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
                  <View className="w-4 h-4" />
                </button>
                <button className="px-3 py-2 text-sm border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
                  <Settings className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Settings Tab */}
      {activeTab === 'settings' && (
        <div className="max-w-4xl space-y-6">
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Global Agent Settings</h2>
            
            <div className="space-y-6">
              {/* Default Tone */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Default Agent Tone</label>
                <select className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500">
                  <option>Professional</option>
                  <option>Friendly</option>
                  <option>Technical</option>
                  <option>Executive</option>
                </select>
              </div>

              {/* Default Scope */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Default Scope</label>
                <div className="space-y-2">
                  <label className="flex items-center space-x-2">
                    <input type="checkbox" className="rounded" defaultChecked />
                    <span className="text-sm text-gray-700">Read team data</span>
                  </label>
                  <label className="flex items-center space-x-2">
                    <input type="checkbox" className="rounded" defaultChecked />
                    <span className="text-sm text-gray-700">Generate reports</span>
                  </label>
                  <label className="flex items-center space-x-2">
                    <input type="checkbox" className="rounded" />
                    <span className="text-sm text-gray-700">Create/modify tickets</span>
                  </label>
                  <label className="flex items-center space-x-2">
                    <input type="checkbox" className="rounded" />
                    <span className="text-sm text-gray-700">Send notifications</span>
                  </label>
                </div>
              </div>

              {/* Default Visibility */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Default Visibility</label>
                <select className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500">
                  <option>Team only</option>
                  <option>Team + Leadership</option>
                  <option>Organization wide</option>
                  <option>Private</option>
                </select>
              </div>

              {/* Privacy Rules */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Privacy Rules</label>
                <div className="space-y-2">
                  <label className="flex items-center space-x-2">
                    <input type="checkbox" className="rounded" defaultChecked />
                    <span className="text-sm text-gray-700">Exclude private channels</span>
                  </label>
                  <label className="flex items-center space-x-2">
                    <input type="checkbox" className="rounded" defaultChecked />
                    <span className="text-sm text-gray-700">Redact sensitive information</span>
                  </label>
                  <label className="flex items-center space-x-2">
                    <input type="checkbox" className="rounded" />
                    <span className="text-sm text-gray-700">Require approval for external sharing</span>
                  </label>
                </div>
              </div>

              {/* Save Button */}
              <div className="flex justify-end">
                <button className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
                  Save Settings
                </button>
              </div>
            </div>
          </div>

          {/* Available Connectors */}
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Available Connectors</h2>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {['GitHub', 'Jira', 'Slack', 'Figma', 'AWS', 'DataDog', 'PagerDuty', 'Linear', 'Notion'].map((connector, idx) => {
                const Icon = connectorIcons[connector] || LinkIcon
                return (
                  <div key={idx} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:border-blue-300 transition-colors">
                    <div className="flex items-center space-x-3">
                      <Icon className="w-5 h-5 text-gray-600" />
                      <span className="text-sm font-medium text-gray-900">{connector}</span>
                    </div>
                    <CheckmarkFilled className="w-5 h-5 text-green-600" />
                  </div>
                )
              })}
            </div>
          </div>
        </div>
      )}

      {/* Chat Modal */}
      {selectedAgent && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-6" onClick={() => setSelectedAgent(null)}>
          <div className="bg-white rounded-xl max-w-3xl w-full h-[600px] flex flex-col" onClick={(e) => e.stopPropagation()}>
            {/* Modal Header */}
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg">
                  <Bot className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-gray-900">{selectedAgent.name}</h2>
                  <p className="text-sm text-gray-500">{selectedAgent.team}</p>
                </div>
              </div>
              <button 
                onClick={() => setSelectedAgent(null)}
                className="text-gray-400 hover:text-gray-600 text-2xl"
              >
                ×
              </button>
            </div>

            {/* Chat Area */}
            <div className="flex-1 p-6 overflow-y-auto">
              <div className="space-y-4">
                <div className="flex items-start space-x-3">
                  <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white text-sm font-semibold">
                    AI
                  </div>
                  <div className="flex-1 bg-gray-50 rounded-lg p-4">
                    <p className="text-sm text-gray-900">
                      Hello! I'm the {selectedAgent.name}. How can I help you today?
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Input Area */}
            <div className="p-6 border-t border-gray-200">
              <div className="relative">
                <input
                  type="text"
                  placeholder="Ask the agent anything..."
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 pr-24"
                />
                <button className="absolute right-2 top-1/2 transform -translate-y-1/2 px-4 py-1.5 bg-blue-600 text-white rounded-md font-medium hover:bg-blue-700 transition-colors">
                  Send
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default AgentsHub
