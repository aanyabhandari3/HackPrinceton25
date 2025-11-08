import React, { useState } from 'react'
import { 
  Settings, Users, Link as LinkIcon, FileText, Shield, 
  Bell, Save, RefreshCw, Trash2, Plus, Edit, Check, X,
  Github, Slack, Calendar, Database, Key, Eye, EyeOff
} from 'lucide-react'

const SettingsPage = () => {
  const [activeTab, setActiveTab] = useState('hierarchy')
  const [showApiKey, setShowApiKey] = useState(false)

  const hierarchy = [
    {
      id: 1,
      name: 'John Doe',
      role: 'Engineering Manager',
      email: 'john.doe@company.com',
      reports: [
        { name: 'Sarah Chen', role: 'Backend Team Lead', team: 'Backend' },
        { name: 'Mike Johnson', role: 'Frontend Team Lead', team: 'Frontend' },
        { name: 'Lisa Wang', role: 'Mobile Team Lead', team: 'Mobile' },
        { name: 'Tom Brown', role: 'DevOps Team Lead', team: 'DevOps' }
      ]
    }
  ]

  const connectors = [
    {
      id: 1,
      name: 'GitHub',
      icon: Github,
      status: 'connected',
      lastSync: '5 minutes ago',
      repos: 23,
      permissions: ['Read repositories', 'Read pull requests', 'Read issues']
    },
    {
      id: 2,
      name: 'Jira',
      icon: FileText,
      status: 'connected',
      lastSync: '10 minutes ago',
      projects: 8,
      permissions: ['Read projects', 'Read issues', 'Create issues', 'Update issues']
    },
    {
      id: 3,
      name: 'Slack',
      icon: Slack,
      status: 'connected',
      lastSync: '2 minutes ago',
      channels: 45,
      permissions: ['Read channels', 'Read messages', 'Send messages']
    },
    {
      id: 4,
      name: 'Google Calendar',
      icon: Calendar,
      status: 'disconnected',
      lastSync: 'Never',
      calendars: 0,
      permissions: []
    },
    {
      id: 5,
      name: 'Linear',
      icon: FileText,
      status: 'disconnected',
      lastSync: 'Never',
      projects: 0,
      permissions: []
    }
  ]

  const reportDefaults = {
    frequency: 'weekly',
    format: 'markdown',
    recipients: ['john.doe@company.com', 'leadership@company.com'],
    sections: ['Executive Summary', 'Team Performance', 'Risk Assessment', 'People Insights'],
    autoGenerate: true,
    includeCharts: true
  }

  const privacyRules = [
    { id: 1, rule: 'Exclude private channels', enabled: true },
    { id: 2, rule: 'Redact sensitive information (API keys, passwords)', enabled: true },
    { id: 3, rule: 'Exclude HR-related discussions', enabled: true },
    { id: 4, rule: 'Require approval for external sharing', enabled: false },
    { id: 5, rule: 'Anonymize personal data in reports', enabled: false }
  ]

  const agentAccessLevels = [
    { level: 'Read Only', description: 'Can read data but cannot make changes', enabled: true },
    { level: 'Read/Write', description: 'Can read and create/update items', enabled: true },
    { level: 'Admin', description: 'Full access including deletions', enabled: false }
  ]

  const getStatusColor = (status) => {
    return status === 'connected' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'
  }

  const getStatusIcon = (status) => {
    return status === 'connected' ? <Check className="w-4 h-4" /> : <X className="w-4 h-4" />
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Settings & Administration</h1>
          <p className="text-gray-500 mt-1">Manage your organization settings, integrations, and permissions</p>
        </div>
        <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2">
          <Save className="w-4 h-4" />
          <span>Save All Changes</span>
        </button>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200">
        <nav className="flex space-x-8">
          {['hierarchy', 'connectors', 'reports', 'privacy', 'access-control'].map(tab => (
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

      {/* Hierarchy & Permissions Tab */}
      {activeTab === 'hierarchy' && (
        <div className="space-y-6">
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-semibold text-gray-900">Organization Hierarchy</h2>
              <button className="px-3 py-1.5 text-sm border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors flex items-center space-x-2">
                <Edit className="w-4 h-4" />
                <span>Edit Hierarchy</span>
              </button>
            </div>

            {hierarchy.map((person) => (
              <div key={person.id} className="space-y-4">
                <div className="flex items-center space-x-4 p-4 bg-blue-50 rounded-lg">
                  <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-semibold">
                    JD
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-gray-900">{person.name}</h3>
                    <p className="text-sm text-gray-600">{person.role}</p>
                    <p className="text-xs text-gray-500">{person.email}</p>
                  </div>
                  <span className="px-3 py-1 bg-blue-600 text-white rounded-full text-xs font-medium">
                    You
                  </span>
                </div>

                <div className="ml-8 space-y-3">
                  <p className="text-sm font-medium text-gray-700">Direct Reports ({person.reports.length})</p>
                  {person.reports.map((report, idx) => (
                    <div key={idx} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:border-blue-300 transition-colors">
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 bg-gradient-to-br from-gray-500 to-gray-600 rounded-full flex items-center justify-center text-white font-semibold text-sm">
                          {report.name.split(' ').map(n => n[0]).join('')}
                        </div>
                        <div>
                          <p className="font-medium text-gray-900">{report.name}</p>
                          <p className="text-sm text-gray-600">{report.role} • {report.team}</p>
                        </div>
                      </div>
                      <button className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors">
                        <Edit className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>

          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Visibility Permissions</h2>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                <div>
                  <p className="font-medium text-gray-900">View all direct reports</p>
                  <p className="text-sm text-gray-600">Access to team data and individual performance</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input type="checkbox" className="sr-only peer" defaultChecked />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                </label>
              </div>
              <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                <div>
                  <p className="font-medium text-gray-900">Cross-team visibility</p>
                  <p className="text-sm text-gray-600">View data from other teams in the organization</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input type="checkbox" className="sr-only peer" defaultChecked />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                </label>
              </div>
              <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                <div>
                  <p className="font-medium text-gray-900">Financial data access</p>
                  <p className="text-sm text-gray-600">View budget and cost information</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input type="checkbox" className="sr-only peer" />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                </label>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Connectors Tab */}
      {activeTab === 'connectors' && (
        <div className="space-y-6">
          {connectors.map((connector) => {
            const Icon = connector.icon
            return (
              <div key={connector.id} className="bg-white rounded-xl border border-gray-200 p-6">
                <div className="flex items-start justify-between">
                  <div className="flex items-start space-x-4 flex-1">
                    <div className="p-3 bg-gray-100 rounded-lg">
                      <Icon className="w-6 h-6 text-gray-700" />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center space-x-3 mb-2">
                        <h3 className="text-lg font-semibold text-gray-900">{connector.name}</h3>
                        <span className={`inline-flex items-center space-x-1 px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(connector.status)}`}>
                          {getStatusIcon(connector.status)}
                          <span>{connector.status}</span>
                        </span>
                      </div>
                      
                      {connector.status === 'connected' && (
                        <>
                          <p className="text-sm text-gray-600 mb-3">Last synced: {connector.lastSync}</p>
                          
                          <div className="grid grid-cols-3 gap-4 mb-4">
                            {connector.repos !== undefined && (
                              <div className="text-center p-3 bg-gray-50 rounded-lg">
                                <p className="text-xl font-bold text-gray-900">{connector.repos}</p>
                                <p className="text-xs text-gray-600">Repositories</p>
                              </div>
                            )}
                            {connector.projects !== undefined && (
                              <div className="text-center p-3 bg-gray-50 rounded-lg">
                                <p className="text-xl font-bold text-gray-900">{connector.projects}</p>
                                <p className="text-xs text-gray-600">Projects</p>
                              </div>
                            )}
                            {connector.channels !== undefined && (
                              <div className="text-center p-3 bg-gray-50 rounded-lg">
                                <p className="text-xl font-bold text-gray-900">{connector.channels}</p>
                                <p className="text-xs text-gray-600">Channels</p>
                              </div>
                            )}
                          </div>

                          <div className="mb-4">
                            <p className="text-sm font-medium text-gray-700 mb-2">Permissions</p>
                            <div className="flex flex-wrap gap-2">
                              {connector.permissions.map((permission, idx) => (
                                <span key={idx} className="px-2 py-1 bg-blue-50 text-blue-700 rounded text-xs">
                                  {permission}
                                </span>
                              ))}
                            </div>
                          </div>
                        </>
                      )}
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    {connector.status === 'connected' ? (
                      <>
                        <button className="px-3 py-1.5 text-sm border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors flex items-center space-x-2">
                          <RefreshCw className="w-4 h-4" />
                          <span>Sync</span>
                        </button>
                        <button className="px-3 py-1.5 text-sm border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors flex items-center space-x-2">
                          <Edit className="w-4 h-4" />
                          <span>Configure</span>
                        </button>
                        <button className="px-3 py-1.5 text-sm border border-red-300 text-red-600 rounded-lg hover:bg-red-50 transition-colors">
                          Disconnect
                        </button>
                      </>
                    ) : (
                      <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2">
                        <LinkIcon className="w-4 h-4" />
                        <span>Connect</span>
                      </button>
                    )}
                  </div>
                </div>
              </div>
            )
          })}

          <div className="bg-gradient-to-r from-blue-50 to-purple-50 border border-blue-200 rounded-xl p-6">
            <div className="flex items-start space-x-3">
              <Plus className="w-6 h-6 text-blue-600 flex-shrink-0" />
              <div>
                <h3 className="font-semibold text-gray-900 mb-2">Add More Connectors</h3>
                <p className="text-sm text-gray-600 mb-4">
                  Connect additional tools to enhance your AI agents' capabilities. Available: Notion, Figma, Asana, Trello, and more.
                </p>
                <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm">
                  Browse Integrations
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Report Defaults Tab */}
      {activeTab === 'reports' && (
        <div className="space-y-6">
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-6">Report Configuration</h2>
            
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Default Frequency</label>
                <select 
                  defaultValue={reportDefaults.frequency}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="daily">Daily</option>
                  <option value="weekly">Weekly</option>
                  <option value="bi-weekly">Bi-weekly</option>
                  <option value="monthly">Monthly</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Default Format</label>
                <select 
                  defaultValue={reportDefaults.format}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="markdown">Markdown</option>
                  <option value="pdf">PDF</option>
                  <option value="html">HTML</option>
                  <option value="json">JSON</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Default Recipients</label>
                <div className="space-y-2">
                  {reportDefaults.recipients.map((recipient, idx) => (
                    <div key={idx} className="flex items-center space-x-2">
                      <input
                        type="text"
                        defaultValue={recipient}
                        className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                      <button className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                  <button className="px-3 py-2 text-sm border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors flex items-center space-x-2">
                    <Plus className="w-4 h-4" />
                    <span>Add Recipient</span>
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Report Sections</label>
                <div className="space-y-2">
                  {reportDefaults.sections.map((section, idx) => (
                    <label key={idx} className="flex items-center space-x-2">
                      <input type="checkbox" className="rounded" defaultChecked />
                      <span className="text-sm text-gray-700">{section}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div className="space-y-3 pt-4 border-t border-gray-200">
                <label className="flex items-center justify-between">
                  <div>
                    <p className="font-medium text-gray-900">Auto-generate reports</p>
                    <p className="text-sm text-gray-600">Automatically create reports on schedule</p>
                  </div>
                  <input type="checkbox" className="rounded" defaultChecked={reportDefaults.autoGenerate} />
                </label>
                <label className="flex items-center justify-between">
                  <div>
                    <p className="font-medium text-gray-900">Include charts and visualizations</p>
                    <p className="text-sm text-gray-600">Add graphs and charts to reports</p>
                  </div>
                  <input type="checkbox" className="rounded" defaultChecked={reportDefaults.includeCharts} />
                </label>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Privacy Rules Tab */}
      {activeTab === 'privacy' && (
        <div className="space-y-6">
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-6">Privacy & Data Rules</h2>
            
            <div className="space-y-4">
              {privacyRules.map((rule) => (
                <div key={rule.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <Shield className="w-5 h-5 text-gray-600" />
                    <span className="text-sm font-medium text-gray-900">{rule.rule}</span>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input type="checkbox" className="sr-only peer" defaultChecked={rule.enabled} />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                  </label>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-6">Data Retention</h2>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Chat History Retention</label>
                <select className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500">
                  <option>30 days</option>
                  <option>90 days</option>
                  <option>1 year</option>
                  <option>Forever</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Report Archive Retention</label>
                <select className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500">
                  <option>90 days</option>
                  <option>1 year</option>
                  <option>2 years</option>
                  <option>Forever</option>
                </select>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Access Control Tab */}
      {activeTab === 'access-control' && (
        <div className="space-y-6">
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-6">Agent Access Levels</h2>
            
            <div className="space-y-4">
              {agentAccessLevels.map((level, idx) => (
                <div key={idx} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                  <div>
                    <p className="font-medium text-gray-900">{level.level}</p>
                    <p className="text-sm text-gray-600">{level.description}</p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input type="checkbox" className="sr-only peer" defaultChecked={level.enabled} />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                  </label>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-6">API Keys</h2>
            
            <div className="space-y-4">
              <div className="p-4 bg-gray-50 rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <p className="text-sm font-medium text-gray-700">Production API Key</p>
                  <button 
                    onClick={() => setShowApiKey(!showApiKey)}
                    className="p-1 text-gray-600 hover:bg-gray-200 rounded transition-colors"
                  >
                    {showApiKey ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
                <div className="flex items-center space-x-2">
                  <code className="flex-1 px-3 py-2 bg-white border border-gray-300 rounded text-sm font-mono">
                    {showApiKey ? 'sk_prod_1234567890abcdefghijklmnop' : '••••••••••••••••••••••••••••'}
                  </code>
                  <button className="px-3 py-2 text-sm border border-gray-300 rounded-lg hover:bg-gray-100 transition-colors">
                    Copy
                  </button>
                </div>
                <p className="text-xs text-gray-500 mt-2">Created: Jan 1, 2024 • Last used: 5 minutes ago</p>
              </div>

              <button className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors flex items-center space-x-2">
                <Plus className="w-4 h-4" />
                <span>Generate New API Key</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default SettingsPage
