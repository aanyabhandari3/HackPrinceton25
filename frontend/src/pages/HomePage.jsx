import React, { useState } from 'react'
import { 
  ArrowUp, WarningAlt, CheckmarkFilled, Activity, Calendar, Filter, Download, Renew 
} from '@carbon/icons-react'
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'
import { Button, Card, StatCard, Select } from '../components/ui/index.js'
import { activityData, teamActivity, recentHighlights, upcomingDeadlines } from '../data/mockData.js'
import { COLORS } from '../constants/theme.js'

const HomePage = () => {
  const [dateRange, setDateRange] = useState('7d')

  const summaryCards = [
    {
      title: 'Project Health',
      value: '87%',
      status: 'good',
      icon: CheckmarkFilled,
      detail: '12 ✅ 3 🟡 1 🔴'
    },
    {
      title: 'Active Projects',
      value: '16',
      status: 'neutral',
      icon: Activity,
      detail: 'Across 5 teams'
    },
    {
      title: 'Tasks Closed',
      value: '142',
      status: 'good',
      icon: ArrowUp,
      detail: 'Last 7 days (+12%)'
    },
    {
      title: 'Open Blockers',
      value: '3',
      status: 'warning',
      icon: WarningAlt,
      detail: '2 critical, 1 medium'
    }
  ]

  const highlightIcons = {
    success: CheckmarkFilled,
    warning: WarningAlt,
    info: Calendar,
  }

  const getStatusColor = (status) => {
    const colors = {
      good: 'text-green-600 bg-green-50 border-green-200',
      warning: 'text-orange-600 bg-orange-50 border-orange-200',
      neutral: 'text-blue-600 bg-blue-50 border-blue-200'
    }
    return colors[status] || colors.neutral
  }

  const getPriorityColor = (priority) => {
    const colors = {
      high: 'bg-red-100 text-red-700',
      medium: 'bg-yellow-100 text-yellow-700',
      low: 'bg-green-100 text-green-700'
    }
    return colors[priority] || colors.medium
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-semibold" style={{ color: '#161616' }}>Overview Dashboard</h1>
          <p className="mt-1 text-sm" style={{ color: '#525252' }}>Welcome back! Here's what's happening across your organization.</p>
        </div>
        <div className="flex items-center space-x-2">
          <select 
            value={dateRange}
            onChange={(e) => setDateRange(e.target.value)}
            className="px-3 py-2 text-sm focus:outline-none"
            style={{ 
              backgroundColor: '#f4f4f4',
              border: '1px solid #8d8d8d',
              borderBottom: '1px solid #8d8d8d',
              color: '#161616'
            }}
          >
            <option value="7d">Last 7 days</option>
            <option value="30d">Last 30 days</option>
            <option value="90d">Last 90 days</option>
          </select>
          <button className="px-3 py-2 text-sm transition-colors flex items-center space-x-2" style={{ backgroundColor: '#ffffff', border: '1px solid #8d8d8d', color: '#161616' }} onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#e0e0e0'} onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#ffffff'}>
            <Filter size={16} />
            <span>Filter</span>
          </button>
          <button className="px-3 py-2 text-white text-sm transition-colors flex items-center space-x-2" style={{ backgroundColor: '#0f62fe' }} onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#0353e9'} onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#0f62fe'}>
            <Download size={16} />
            <span>Generate Report</span>
          </button>
        </div>
      </div>

      {/* Summary Cards - Carbon Tiles */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {summaryCards.map((card, index) => (
          <StatCard
            key={index}
            title={card.title}
            value={card.value}
            detail={card.detail}
            icon={card.icon}
            status={card.status}
          />
        ))}
      </div>

      {/* Activity Chart & Team Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Activity Chart */}
        <div className="lg:col-span-2 p-6" style={{ backgroundColor: '#ffffff', border: '1px solid #e0e0e0' }}>
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-base font-semibold" style={{ color: '#161616' }}>Team Activity Trend</h3>
            <button className="p-2 transition-colors" style={{ color: '#161616' }} onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#e0e0e0'} onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}>
              <Renew size={16} />
            </button>
          </div>
          <ResponsiveContainer width="100%" height={250}>
            <AreaChart data={activityData}>
              <defs>
                <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#0f62fe" stopOpacity={0.3}/>
                  <stop offset="95%" stopColor="#0f62fe" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" />
              <XAxis dataKey="date" stroke="#525252" style={{ fontSize: '12px' }} />
              <YAxis stroke="#525252" style={{ fontSize: '12px' }} />
              <Tooltip contentStyle={{ backgroundColor: '#ffffff', border: '1px solid #e0e0e0', borderRadius: '0' }} />
              <Area type="monotone" dataKey="value" stroke="#0f62fe" strokeWidth={2} fillOpacity={1} fill="url(#colorValue)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Team Activity Heatmap */}
        <div className="p-6" style={{ backgroundColor: '#ffffff', border: '1px solid #e0e0e0' }}>
          <h3 className="text-base font-semibold mb-4" style={{ color: '#161616' }}>Team Activity</h3>
          <div className="space-y-4">
            {teamActivity.map((team, index) => (
              <div key={index} className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="font-medium" style={{ color: '#161616' }}>{team.name}</span>
                  <span style={{ color: '#525252' }}>{team.activity}%</span>
                </div>
                <div className="w-full h-1" style={{ backgroundColor: '#e0e0e0' }}>
                  <div 
                    className="h-1 transition-all"
                    style={{ width: `${team.activity}%`, backgroundColor: '#0f62fe' }}
                  />
                </div>
                <p className="text-xs" style={{ color: '#525252' }}>{team.active}/{team.total} active • {team.lead}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Recent Highlights & Upcoming Deadlines */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Recent Highlights */}
        <div className="p-6" style={{ backgroundColor: '#ffffff', border: '1px solid #e0e0e0' }}>
          <h3 className="text-base font-semibold mb-4" style={{ color: '#161616' }}>Recent Highlights</h3>
          <div className="space-y-4">
            {recentHighlights.map((highlight, index) => {
              const Icon = highlightIcons[highlight.type]
              const typeColors = {
                success: 'bg-green-100 text-green-600',
                warning: 'bg-orange-100 text-orange-600',
                info: 'bg-blue-100 text-blue-600'
              }
              const iconColor = highlight.type === 'success' ? '#24a148' : highlight.type === 'warning' ? '#ff832b' : '#0f62fe'
              return (
                <div key={index} className="flex items-start space-x-3 p-3 transition-colors" style={{ borderLeft: `3px solid ${iconColor}`, backgroundColor: '#f4f4f4' }}>
                  <Icon size={16} className="flex-shrink-0 mt-0.5" style={{ color: iconColor }} />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium" style={{ color: '#161616' }}>{highlight.team}</p>
                    <p className="text-sm mt-0.5" style={{ color: '#525252' }}>{highlight.message}</p>
                    <p className="text-xs mt-1" style={{ color: '#8d8d8d' }}>{highlight.time}</p>
                  </div>
                </div>
              )
            })}
          </div>
        </div>

        {/* Upcoming Deadlines */}
        <div className="p-6" style={{ backgroundColor: '#ffffff', border: '1px solid #e0e0e0' }}>
          <h3 className="text-base font-semibold mb-4" style={{ color: '#161616' }}>Upcoming Deadlines</h3>
          <div className="space-y-2">
            {upcomingDeadlines.map((deadline, index) => {
              const priorityColor = deadline.priority === 'high' ? '#da1e28' : deadline.priority === 'medium' ? '#ff832b' : '#24a148'
              return (
                <div key={index} className="flex items-center justify-between p-3 transition-colors" style={{ backgroundColor: '#f4f4f4', borderLeft: `3px solid ${priorityColor}` }}>
                  <div className="flex-1">
                    <div className="flex items-center space-x-2">
                      <p className="text-sm font-medium" style={{ color: '#161616' }}>{deadline.project}</p>
                      <span className="px-2 py-0.5 text-xs font-medium" style={{ backgroundColor: priorityColor, color: '#ffffff', borderRadius: '2px' }}>
                        {deadline.priority}
                      </span>
                    </div>
                    <p className="text-xs mt-1" style={{ color: '#525252' }}>{deadline.team} • {deadline.date}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-semibold" style={{ color: '#161616' }}>{deadline.daysLeft} days</p>
                    <p className="text-xs" style={{ color: '#525252' }}>remaining</p>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </div>

      {/* Ask Org Agent Section - Carbon Style */}
      <div className="p-6" style={{ backgroundColor: '#0f62fe', color: '#ffffff' }}>
        <div className="flex items-center space-x-3 mb-4">
          <div className="p-3" style={{ backgroundColor: 'rgba(255, 255, 255, 0.1)' }}>
            <Activity size={24} />
          </div>
          <div>
            <h3 className="text-lg font-semibold">Ask Your Org Agent</h3>
            <p className="text-sm" style={{ color: 'rgba(255, 255, 255, 0.8)' }}>Get instant insights about your teams, projects, and people</p>
          </div>
        </div>
        <div className="relative">
          <input
            type="text"
            placeholder="e.g., 'What are the top blockers for Backend team?' or 'Show me Sarah's progress this week'"
            className="w-full px-4 py-3 focus:outline-none text-sm"
            style={{ 
              backgroundColor: '#ffffff',
              color: '#161616',
              border: 'none',
              borderBottom: '1px solid #8d8d8d'
            }}
          />
          <button className="absolute right-2 top-1/2 transform -translate-y-1/2 px-4 py-1.5 text-sm font-medium transition-colors" style={{ backgroundColor: '#161616', color: '#ffffff' }} onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#393939'} onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#161616'}>
            Ask
          </button>
        </div>
      </div>
    </div>
  )
}

export default HomePage
