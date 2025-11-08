import React, { useState } from 'react'
import { 
  FileText, Calendar, Download, Share2, Edit, Play, 
  Clock, CheckCircle, Users, TrendingUp, AlertTriangle,
  Eye, Plus, Filter, RefreshCw
} from 'lucide-react'

const ReportsCenter = () => {
  const [selectedReport, setSelectedReport] = useState(null)

  const scheduledReports = [
    {
      id: 1,
      name: 'Weekly Team Summary',
      frequency: 'Weekly',
      nextRun: '2024-01-15 09:00',
      recipients: ['Leadership Channel', 'john.doe@company.com'],
      scope: ['All Teams'],
      lastRun: '2024-01-08 09:00',
      status: 'active'
    },
    {
      id: 2,
      name: 'Backend Team Sprint Report',
      frequency: 'Bi-weekly',
      nextRun: '2024-01-16 10:00',
      recipients: ['Backend Team', 'sarah.chen@company.com'],
      scope: ['Backend Team'],
      lastRun: '2024-01-02 10:00',
      status: 'active'
    },
    {
      id: 3,
      name: 'Monthly Executive Summary',
      frequency: 'Monthly',
      nextRun: '2024-02-01 08:00',
      recipients: ['Executive Team', 'Leadership Channel'],
      scope: ['All Teams', 'Finance', 'HR'],
      lastRun: '2024-01-01 08:00',
      status: 'active'
    },
    {
      id: 4,
      name: 'Daily Incident Report',
      frequency: 'Daily',
      nextRun: '2024-01-13 17:00',
      recipients: ['DevOps Team', 'On-call'],
      scope: ['DevOps Team'],
      lastRun: '2024-01-12 17:00',
      status: 'active'
    }
  ]

  const pastReports = [
    {
      id: 1,
      name: 'Weekly Team Summary',
      period: 'Jan 1-7, 2024',
      scope: 'All Teams',
      health: 'good',
      created: '2024-01-08 09:15',
      size: '2.4 MB'
    },
    {
      id: 2,
      name: 'Backend Team Sprint Report',
      period: 'Sprint 24',
      scope: 'Backend Team',
      health: 'good',
      created: '2024-01-02 10:20',
      size: '1.8 MB'
    },
    {
      id: 3,
      name: 'Monthly Executive Summary',
      period: 'December 2023',
      scope: 'Organization',
      health: 'warning',
      created: '2024-01-01 08:30',
      size: '3.2 MB'
    },
    {
      id: 4,
      name: 'Q4 2023 Performance Review',
      period: 'Q4 2023',
      scope: 'All Teams',
      health: 'good',
      created: '2023-12-31 16:00',
      size: '4.1 MB'
    },
    {
      id: 5,
      name: 'Frontend Team Progress',
      period: 'Dec 18-24, 2023',
      scope: 'Frontend Team',
      health: 'good',
      created: '2023-12-25 09:00',
      size: '1.5 MB'
    }
  ]

  const reportPreview = {
    title: 'Weekly Team Summary',
    period: 'Jan 1-7, 2024',
    generated: '2024-01-08 09:15',
    sections: [
      {
        title: 'Executive Summary',
        content: `This week saw strong progress across all teams with 87% project health. Backend team completed API v3 migration milestone, Frontend team launched new dashboard UI, and Mobile team submitted iOS app for review.

Key Highlights:
• 142 tasks completed across all teams (+12% from last week)
• 3 major features shipped to production
• Zero critical incidents
• Team velocity trending upward

Areas of Concern:
• Mobile team has 1 blocker on App Store submission
• Frontend team experiencing performance regression in dashboard
• DevOps team infrastructure upgrade delayed by 2 days`
      },
      {
        title: 'Team Performance',
        content: `Backend Team (Lead: Sarah Chen)
• Velocity: 52 points (+8%)
• Completed: 23 tasks
• Open Blockers: 0
• Highlights: API v3 migration completed, OAuth 2.0 implemented

Frontend Team (Lead: Mike Johnson)
• Velocity: 48 points (+5%)
• Completed: 19 tasks
• Open Blockers: 1 (Performance issue)
• Highlights: Dashboard UI launched, Component library updated

Mobile Team (Lead: Lisa Wang)
• Velocity: 38 points (-3%)
• Completed: 15 tasks
• Open Blockers: 1 (App Store review)
• Highlights: iOS app submitted, Offline mode implemented

DevOps Team (Lead: Tom Brown)
• Velocity: 42 points (+10%)
• Completed: 18 tasks
• Open Blockers: 0
• Highlights: CI/CD optimization (40% faster), Infrastructure monitoring improved`
      },
      {
        title: 'Risk Assessment',
        content: `Current Risks:

HIGH PRIORITY:
• Mobile App Store approval delay - May impact Q1 launch timeline
• Frontend performance regression - Affecting user experience

MEDIUM PRIORITY:
• Backend API documentation incomplete - Blocking partner integrations
• DevOps infrastructure upgrade delayed - May affect scalability

LOW PRIORITY:
• QA test coverage gaps in new features
• Technical debt accumulation in legacy systems

Mitigation Actions:
• Mobile team working with App Store review team
• Frontend team investigating performance bottleneck
• Backend team prioritizing documentation sprint
• DevOps team added resources to infrastructure project`
      },
      {
        title: 'People Insights',
        content: `Team Member Highlights:

Sarah Chen (Backend Lead)
• Led successful API v3 migration
• Mentored 2 junior engineers
• Reduced API latency by 40%

Alex Kumar (Backend Senior Engineer)
• Optimized database queries (50% faster)
• Fixed critical production bug
• Improved test coverage to 92%

Mike Johnson (Frontend Lead)
• Launched new dashboard UI
• Improved page load time by 35%
• Coordinated with design team

Emily Rodriguez (Backend Engineer)
• Integrated payment gateway
• Implemented webhook retry logic
• Documented API endpoints

Team Activity:
• 5 team members with exceptional performance
• 2 team members requiring additional support
• Average team satisfaction: 8.2/10`
      }
    ]
  }

  const getHealthColor = (health) => {
    const colors = {
      good: 'bg-green-100 text-green-700',
      warning: 'bg-yellow-100 text-yellow-700',
      critical: 'bg-red-100 text-red-700'
    }
    return colors[health] || colors.good
  }

  const getHealthIcon = (health) => {
    if (health === 'good') return <CheckCircle className="w-4 h-4" />
    if (health === 'warning') return <AlertTriangle className="w-4 h-4" />
    return <AlertTriangle className="w-4 h-4" />
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Reports Center</h1>
          <p className="text-gray-500 mt-1">View, schedule, and manage periodic roll-up reports</p>
        </div>
        <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2">
          <Plus className="w-4 h-4" />
          <span>Create Report</span>
        </button>
      </div>

      {/* Scheduled Reports */}
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-lg font-semibold text-gray-900">Scheduled Reports</h2>
          <button className="text-sm text-blue-600 hover:text-blue-700 font-medium flex items-center space-x-1">
            <Plus className="w-4 h-4" />
            <span>Add Schedule</span>
          </button>
        </div>

        <div className="space-y-4">
          {scheduledReports.map((report) => (
            <div key={report.id} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:border-blue-300 transition-colors">
              <div className="flex items-start space-x-4 flex-1">
                <div className="p-3 bg-blue-50 rounded-lg">
                  <FileText className="w-5 h-5 text-blue-600" />
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-gray-900">{report.name}</h3>
                  <div className="flex items-center space-x-4 mt-2 text-sm text-gray-500">
                    <span className="flex items-center space-x-1">
                      <Clock className="w-4 h-4" />
                      <span>{report.frequency}</span>
                    </span>
                    <span className="flex items-center space-x-1">
                      <Calendar className="w-4 h-4" />
                      <span>Next: {report.nextRun}</span>
                    </span>
                    <span className="flex items-center space-x-1">
                      <Users className="w-4 h-4" />
                      <span>{report.recipients.length} recipients</span>
                    </span>
                  </div>
                  <div className="flex flex-wrap gap-2 mt-2">
                    {report.scope.map((scope, idx) => (
                      <span key={idx} className="px-2 py-0.5 bg-gray-100 text-gray-700 rounded text-xs">
                        {scope}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <button className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors" title="Run now">
                  <Play className="w-4 h-4" />
                </button>
                <button className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors" title="Edit">
                  <Edit className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Past Reports */}
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-lg font-semibold text-gray-900">Past Reports</h2>
          <div className="flex items-center space-x-3">
            <button className="px-3 py-1.5 text-sm border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors flex items-center space-x-2">
              <Filter className="w-4 h-4" />
              <span>Filter</span>
            </button>
            <button className="px-3 py-1.5 text-sm border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors flex items-center space-x-2">
              <RefreshCw className="w-4 h-4" />
              <span>Refresh</span>
            </button>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Report</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Period</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Scope</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Health</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Created</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {pastReports.map((report) => (
                <tr key={report.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4">
                    <div className="flex items-center space-x-3">
                      <FileText className="w-5 h-5 text-gray-400" />
                      <div>
                        <p className="text-sm font-medium text-gray-900">{report.name}</p>
                        <p className="text-xs text-gray-500">{report.size}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-900">{report.period}</td>
                  <td className="px-6 py-4 text-sm text-gray-900">{report.scope}</td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex items-center space-x-1 px-2 py-1 rounded-full text-xs font-medium ${getHealthColor(report.health)}`}>
                      {getHealthIcon(report.health)}
                      <span>{report.health}</span>
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-500">{report.created}</td>
                  <td className="px-6 py-4">
                    <div className="flex items-center space-x-2">
                      <button 
                        onClick={() => setSelectedReport(reportPreview)}
                        className="p-1.5 text-blue-600 hover:bg-blue-50 rounded transition-colors"
                        title="View"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                      <button className="p-1.5 text-gray-600 hover:bg-gray-100 rounded transition-colors" title="Download">
                        <Download className="w-4 h-4" />
                      </button>
                      <button className="p-1.5 text-gray-600 hover:bg-gray-100 rounded transition-colors" title="Share">
                        <Share2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Report Viewer Modal */}
      {selectedReport && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-6" onClick={() => setSelectedReport(null)}>
          <div className="bg-white rounded-xl max-w-5xl w-full h-[90vh] flex" onClick={(e) => e.stopPropagation()}>
            {/* Sidebar Navigation */}
            <div className="w-64 border-r border-gray-200 p-6 overflow-y-auto">
              <div className="mb-6">
                <h3 className="font-semibold text-gray-900 mb-1">{selectedReport.title}</h3>
                <p className="text-sm text-gray-500">{selectedReport.period}</p>
                <p className="text-xs text-gray-400 mt-1">Generated: {selectedReport.generated}</p>
              </div>
              
              <nav className="space-y-1">
                {selectedReport.sections.map((section, idx) => (
                  <button
                    key={idx}
                    className="w-full text-left px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
                  >
                    {section.title}
                  </button>
                ))}
              </nav>

              <div className="mt-6 pt-6 border-t border-gray-200 space-y-2">
                <button className="w-full px-3 py-2 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center space-x-2">
                  <Download className="w-4 h-4" />
                  <span>Download PDF</span>
                </button>
                <button className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors flex items-center justify-center space-x-2">
                  <Share2 className="w-4 h-4" />
                  <span>Share</span>
                </button>
                <button className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors flex items-center justify-center space-x-2">
                  <RefreshCw className="w-4 h-4" />
                  <span>Regenerate</span>
                </button>
              </div>
            </div>

            {/* Main Content */}
            <div className="flex-1 flex flex-col">
              {/* Header */}
              <div className="flex items-center justify-between p-6 border-b border-gray-200">
                <h2 className="text-xl font-bold text-gray-900">Report Viewer</h2>
                <button 
                  onClick={() => setSelectedReport(null)}
                  className="text-gray-400 hover:text-gray-600 text-2xl"
                >
                  ×
                </button>
              </div>

              {/* Content */}
              <div className="flex-1 overflow-y-auto p-6">
                <div className="prose max-w-none">
                  {selectedReport.sections.map((section, idx) => (
                    <div key={idx} className="mb-8">
                      <h2 className="text-2xl font-bold text-gray-900 mb-4">{section.title}</h2>
                      <div className="text-gray-700 whitespace-pre-line leading-relaxed">
                        {section.content}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default ReportsCenter
