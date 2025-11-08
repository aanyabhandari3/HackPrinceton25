import React, { useState } from 'react'
import { 
  Search, Filter, TrendingUp, TrendingDown, Minus, 
  GitPullRequest, CheckCircle, AlertCircle, MessageSquare,
  FileText, Star, Calendar
} from 'lucide-react'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'
import SarahChenImg from '../assets/profiles/SarahChen.png'
import AlexKumarImg from '../assets/profiles/AlexKumar.png'
import LisaWangImg from '../assets/profiles/LisaWang.png'
import MikeJohnsonImg from '../assets/profiles/MikeJohnson.png'
import EmilyRodriguezImg from '../assets/profiles/EmilyRodriguez.png'

const PeopleView = () => {
  const [searchQuery, setSearchQuery] = useState('')
  const [filterRole, setFilterRole] = useState('all')
  const [filterTeam, setFilterTeam] = useState('all')
  const [selectedPerson, setSelectedPerson] = useState(null)

  const people = [
    {
      id: 1,
      name: 'Sarah Chen',
      role: 'Team Lead',
      team: 'Backend',
      avatar: 'SC',
      avatarImg: SarahChenImg,
      email: 'sarah.chen@company.com',
      lastActivity: '2 hours ago',
      openTasks: 5,
      completedTasks: 23,
      openPRs: 3,
      mergedPRs: 15,
      blockers: 0,
      trend: 'up',
      highlights: [
        'Led successful API v3 migration',
        'Mentored 2 junior engineers',
        'Reduced API latency by 40%'
      ],
      activityData: [
        { day: 'Mon', commits: 8, prs: 2 },
        { day: 'Tue', commits: 12, prs: 3 },
        { day: 'Wed', commits: 6, prs: 1 },
        { day: 'Thu', commits: 15, prs: 4 },
        { day: 'Fri', commits: 10, prs: 2 }
      ],
      focus: 'OAuth 2.0 implementation and team sprint planning',
      notes: ''
    },
    {
      id: 2,
      name: 'Alex Kumar',
      role: 'Senior Engineer',
      team: 'Backend',
      avatar: 'AK',
      avatarImg: AlexKumarImg,
      email: 'alex.kumar@company.com',
      lastActivity: '1 hour ago',
      openTasks: 4,
      completedTasks: 31,
      openPRs: 2,
      mergedPRs: 22,
      blockers: 1,
      trend: 'up',
      highlights: [
        'Optimized database queries (50% faster)',
        'Fixed critical production bug',
        'Improved test coverage to 92%'
      ],
      activityData: [
        { day: 'Mon', commits: 10, prs: 3 },
        { day: 'Tue', commits: 8, prs: 2 },
        { day: 'Wed', commits: 14, prs: 3 },
        { day: 'Thu', commits: 12, prs: 2 },
        { day: 'Fri', commits: 9, prs: 1 }
      ],
      focus: 'Database optimization and performance tuning',
      notes: 'Blocked on infrastructure access for load testing'
    },
    {
      id: 3,
      name: 'Mike Johnson',
      role: 'Team Lead',
      team: 'Frontend',
      avatar: 'MJ',
      avatarImg: MikeJohnsonImg,
      email: 'mike.johnson@company.com',
      lastActivity: '3 hours ago',
      openTasks: 6,
      completedTasks: 28,
      openPRs: 4,
      mergedPRs: 18,
      blockers: 0,
      trend: 'stable',
      highlights: [
        'Launched new dashboard UI',
        'Improved page load time by 35%',
        'Coordinated with design team'
      ],
      activityData: [
        { day: 'Mon', commits: 7, prs: 2 },
        { day: 'Tue', commits: 9, prs: 2 },
        { day: 'Wed', commits: 8, prs: 3 },
        { day: 'Thu', commits: 7, prs: 2 },
        { day: 'Fri', commits: 8, prs: 1 }
      ],
      focus: 'Dashboard redesign and component library updates',
      notes: ''
    },
    {
      id: 4,
      name: 'Emily Rodriguez',
      role: 'Engineer',
      team: 'Backend',
      avatar: 'ER',
      avatarImg: EmilyRodriguezImg,
      email: 'emily.rodriguez@company.com',
      lastActivity: '4 hours ago',
      openTasks: 6,
      completedTasks: 19,
      openPRs: 1,
      mergedPRs: 12,
      blockers: 0,
      trend: 'up',
      highlights: [
        'Integrated payment gateway',
        'Implemented webhook retry logic',
        'Documented API endpoints'
      ],
      activityData: [
        { day: 'Mon', commits: 5, prs: 1 },
        { day: 'Tue', commits: 8, prs: 2 },
        { day: 'Wed', commits: 6, prs: 1 },
        { day: 'Thu', commits: 9, prs: 2 },
        { day: 'Fri', commits: 7, prs: 1 }
      ],
      focus: 'Payment system integration and testing',
      notes: ''
    },
    {
      id: 5,
      name: 'Lisa Wang',
      role: 'Team Lead',
      team: 'Mobile',
      avatar: 'LW',
      email: 'lisa.wang@company.com',
      lastActivity: '1 day ago',
      openTasks: 7,
      completedTasks: 25,
      openPRs: 2,
      mergedPRs: 16,
      blockers: 1,
      trend: 'down',
      highlights: [
        'iOS app beta launch',
        'Implemented offline mode',
        'Reduced app size by 30%'
      ],
      activityData: [
        { day: 'Mon', commits: 6, prs: 2 },
        { day: 'Tue', commits: 4, prs: 1 },
        { day: 'Wed', commits: 3, prs: 0 },
        { day: 'Thu', commits: 5, prs: 1 },
        { day: 'Fri', commits: 2, prs: 1 }
      ],
      focus: 'iOS app store submission and bug fixes',
      notes: 'Out sick - will return Monday'
    }
  ]

  const filteredPeople = people.filter(person => {
    const matchesSearch = person.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         person.role.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesRole = filterRole === 'all' || person.role === filterRole
    const matchesTeam = filterTeam === 'all' || person.team === filterTeam
    return matchesSearch && matchesRole && matchesTeam
  })

  const getTrendIcon = (trend) => {
    if (trend === 'up') return <TrendingUp className="w-4 h-4 text-green-600" />
    if (trend === 'down') return <TrendingDown className="w-4 h-4 text-red-600" />
    return <Minus className="w-4 h-4 text-gray-600" />
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">People & Downline</h1>
          <p className="text-gray-500 mt-1">Monitor and manage your team members</p>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="flex items-center space-x-4">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            placeholder="Search by name or role..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <select
          value={filterRole}
          onChange={(e) => setFilterRole(e.target.value)}
          className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="all">All Roles</option>
          <option value="Team Lead">Team Lead</option>
          <option value="Senior Engineer">Senior Engineer</option>
          <option value="Engineer">Engineer</option>
          <option value="Junior Engineer">Junior Engineer</option>
        </select>
        <select
          value={filterTeam}
          onChange={(e) => setFilterTeam(e.target.value)}
          className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="all">All Teams</option>
          <option value="Backend">Backend</option>
          <option value="Frontend">Frontend</option>
          <option value="Mobile">Mobile</option>
          <option value="DevOps">DevOps</option>
        </select>
        <button className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors flex items-center space-x-2">
          <Filter className="w-4 h-4" />
          <span>More Filters</span>
        </button>
      </div>

      {/* People Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {filteredPeople.map((person) => (
          <div 
            key={person.id} 
            className="bg-white rounded-xl border border-gray-200 p-6 hover:shadow-lg transition-all cursor-pointer"
            onClick={() => setSelectedPerson(person)}
          >
            {/* Header */}
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-start space-x-4">
                {person.avatarImg ? (
                  <img 
                    src={person.avatarImg} 
                    alt={person.name}
                    className="w-14 h-14 rounded-full object-cover"
                  />
                ) : (
                  <div className="w-14 h-14 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-semibold text-lg">
                    {person.avatar}
                  </div>
                )}
                <div>
                  <h3 className="font-semibold text-lg text-gray-900">{person.name}</h3>
                  <p className="text-sm text-gray-500">{person.role} • {person.team}</p>
                  <p className="text-xs text-gray-400 mt-1">Last active: {person.lastActivity}</p>
                </div>
              </div>
              {getTrendIcon(person.trend)}
            </div>

            {/* Stats */}
            <div className="grid grid-cols-4 gap-4 mb-4">
              <div className="text-center">
                <p className="text-xl font-bold text-gray-900">{person.openTasks}</p>
                <p className="text-xs text-gray-500">Open Tasks</p>
              </div>
              <div className="text-center">
                <p className="text-xl font-bold text-gray-900">{person.openPRs}</p>
                <p className="text-xs text-gray-500">Open PRs</p>
              </div>
              <div className="text-center">
                <p className="text-xl font-bold text-green-600">{person.completedTasks}</p>
                <p className="text-xs text-gray-500">Completed</p>
              </div>
              <div className="text-center">
                <p className="text-xl font-bold text-red-600">{person.blockers}</p>
                <p className="text-xs text-gray-500">Blockers</p>
              </div>
            </div>

            {/* AI Insight */}
            <div className="bg-blue-50 rounded-lg p-3 mb-4">
              <p className="text-sm text-gray-700">
                <span className="font-medium">AI Insight:</span> {person.focus}
              </p>
            </div>

            {/* Highlights */}
            <div className="mb-4">
              <p className="text-xs font-medium text-gray-500 uppercase mb-2">Recent Highlights</p>
              <div className="space-y-1">
                {person.highlights.slice(0, 2).map((highlight, idx) => (
                  <div key={idx} className="flex items-start space-x-2">
                    <Star className="w-3 h-3 text-yellow-500 mt-0.5 flex-shrink-0" />
                    <p className="text-xs text-gray-600">{highlight}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-center space-x-2">
              <button className="flex-1 px-3 py-2 text-sm border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
                View Full Profile
              </button>
              <button className="px-3 py-2 text-sm border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
                <FileText className="w-4 h-4" />
              </button>
              <button className="px-3 py-2 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
                <MessageSquare className="w-4 h-4" />
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Detail Modal */}
      {selectedPerson && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-6" onClick={() => setSelectedPerson(null)}>
          <div className="bg-white rounded-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            {/* Modal Header */}
            <div className="sticky top-0 bg-white border-b border-gray-200 p-6 flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-semibold text-xl">
                  {selectedPerson.avatar}
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-gray-900">{selectedPerson.name}</h2>
                  <p className="text-gray-500">{selectedPerson.role} • {selectedPerson.team}</p>
                  <p className="text-sm text-gray-400">{selectedPerson.email}</p>
                </div>
              </div>
              <button 
                onClick={() => setSelectedPerson(null)}
                className="text-gray-400 hover:text-gray-600 text-2xl"
              >
                ×
              </button>
            </div>

            {/* Modal Content */}
            <div className="p-6 space-y-6">
              {/* Stats Grid */}
              <div className="grid grid-cols-4 gap-4">
                <div className="bg-gray-50 rounded-lg p-4 text-center">
                  <p className="text-2xl font-bold text-gray-900">{selectedPerson.openTasks}</p>
                  <p className="text-sm text-gray-500">Open Tasks</p>
                </div>
                <div className="bg-gray-50 rounded-lg p-4 text-center">
                  <p className="text-2xl font-bold text-gray-900">{selectedPerson.openPRs}</p>
                  <p className="text-sm text-gray-500">Open PRs</p>
                </div>
                <div className="bg-green-50 rounded-lg p-4 text-center">
                  <p className="text-2xl font-bold text-green-600">{selectedPerson.completedTasks}</p>
                  <p className="text-sm text-gray-500">Completed</p>
                </div>
                <div className="bg-red-50 rounded-lg p-4 text-center">
                  <p className="text-2xl font-bold text-red-600">{selectedPerson.blockers}</p>
                  <p className="text-sm text-gray-500">Blockers</p>
                </div>
              </div>

              {/* Activity Chart */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Activity Trend (This Week)</h3>
                <ResponsiveContainer width="100%" height={200}>
                  <LineChart data={selectedPerson.activityData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                    <XAxis dataKey="day" stroke="#9ca3af" />
                    <YAxis stroke="#9ca3af" />
                    <Tooltip />
                    <Line type="monotone" dataKey="commits" stroke="#3b82f6" strokeWidth={2} name="Commits" />
                    <Line type="monotone" dataKey="prs" stroke="#8b5cf6" strokeWidth={2} name="PRs" />
                  </LineChart>
                </ResponsiveContainer>
              </div>

              {/* Highlights */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-3">Recent Highlights</h3>
                <div className="space-y-2">
                  {selectedPerson.highlights.map((highlight, idx) => (
                    <div key={idx} className="flex items-start space-x-3 p-3 bg-yellow-50 rounded-lg">
                      <Star className="w-5 h-5 text-yellow-500 mt-0.5 flex-shrink-0" />
                      <p className="text-sm text-gray-700">{highlight}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Current Focus */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-3">Current Focus</h3>
                <div className="bg-blue-50 rounded-lg p-4">
                  <p className="text-sm text-gray-700">{selectedPerson.focus}</p>
                </div>
              </div>

              {/* Manager Notes */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-3">Private Manager Notes</h3>
                <textarea
                  placeholder="Add private notes about this person..."
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 min-h-[100px]"
                  defaultValue={selectedPerson.notes}
                />
              </div>

              {/* Actions */}
              <div className="flex items-center space-x-3">
                <button className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center space-x-2">
                  <MessageSquare className="w-4 h-4" />
                  <span>Chat with Their Agent</span>
                </button>
                <button className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors flex items-center space-x-2">
                  <FileText className="w-4 h-4" />
                  <span>Add to Report</span>
                </button>
                <button className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
                  <Calendar className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default PeopleView
