import React, { useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { 
  Home, UserMultiple, User, Bot, Document, Chat as ChatIcon, 
  Settings, Menu, Close, Notification, Search, ChevronDown, Add, Hashtag,
  ChevronRight, OverflowMenuVertical, Star as StarIcon
} from '@carbon/icons-react'

const Layout = ({ children }) => {
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const [teamsExpanded, setTeamsExpanded] = useState(true)
  const [toolsExpanded, setToolsExpanded] = useState(true)
  const location = useLocation()

  const teams = [
    { id: 1, name: 'Backend Team', color: 'bg-blue-500', unread: 3 },
    { id: 2, name: 'Frontend Team', color: 'bg-green-500', unread: 0 },
    { id: 3, name: 'Mobile Team', color: 'bg-purple-500', unread: 1 },
    { id: 4, name: 'DevOps Team', color: 'bg-orange-500', unread: 0 },
    { id: 5, name: 'QA Team', color: 'bg-pink-500', unread: 0 },
  ]

  const tools = [
    { name: 'Overview', href: '/', icon: Home },
    { name: 'People', href: '/people', icon: User },
    { name: 'AI Agents', href: '/agents', icon: Bot },
    { name: 'Reports', href: '/reports', icon: Document },
    { name: 'Chat', href: '/chat', icon: ChatIcon },
  ]

  const isActive = (path) => location.pathname === path
  const isTeamActive = () => location.pathname === '/teams'

  return (
    <div className="flex h-screen" style={{ backgroundColor: '#f4f4f4' }}>
      {/* Sidebar - Carbon UI Shell */}
      <div className={`${sidebarOpen ? 'w-60' : 'w-16'} transition-all duration-300 flex flex-col`} style={{ backgroundColor: '#161616', color: '#f4f4f4' }}>
        {/* Workspace Header */}
        <div className="h-12 flex items-center justify-between px-3" style={{ borderBottom: '1px solid #393939' }}>
          {sidebarOpen ? (
            <button className="flex items-center space-x-2 flex-1 px-2 py-1.5 transition-colors" style={{ ':hover': { backgroundColor: '#262626' } }}>
              <div className="w-7 h-7 flex items-center justify-center" style={{ backgroundColor: '#0f62fe' }}>
                <Bot size={16} className="text-white" />
              </div>
              <div className="flex-1 text-left">
                <span className="font-semibold text-sm block" style={{ color: '#f4f4f4' }}>OrgAI</span>
                <span className="text-xs" style={{ color: '#8d8d8d' }}>Workspace</span>
              </div>
              <ChevronDown size={16} style={{ color: '#8d8d8d' }} />
            </button>
          ) : (
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="w-full flex justify-center p-2 rounded-lg hover:bg-gray-100 transition-colors"
            >
              <Menu size={20} />
            </button>
          )}
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-3 py-3 overflow-y-auto">
          {/* Quick Access */}
          {sidebarOpen && (
            <div className="mb-4 space-y-0.5">
              <Link
                to="/chat"
                className="flex items-center space-x-2 px-2 py-2 transition-colors hover:bg-[#262626]"
                style={{ color: '#c6c6c6' }}
              >
                <ChatIcon size={16} style={{ color: '#c6c6c6' }} />
                <span className="text-sm">All DMs</span>
              </Link>
              <Link
                to="/"
                className="flex items-center space-x-2 px-2 py-2 transition-colors hover:bg-[#262626]"
                style={{ color: '#c6c6c6' }}
              >
                <StarIcon size={16} style={{ color: '#c6c6c6' }} />
                <span className="text-sm">Starred</span>
              </Link>
            </div>
          )}

          {/* Teams Section */}
          <div className="mb-6">
            <button
              onClick={() => setTeamsExpanded(!teamsExpanded)}
              className="w-full flex items-center justify-between px-2 py-1 text-xs font-semibold uppercase tracking-wider transition-colors mb-2"
              style={{ color: '#8d8d8d' }}
            >
              {sidebarOpen && <span>Teams</span>}
              <ChevronRight size={16} className={`transition-transform ${teamsExpanded ? 'rotate-90' : ''}`} style={{ color: '#8d8d8d' }} />
            </button>
            {teamsExpanded && (
              <div className="space-y-0.5">
                {teams.map((team) => (
                  <Link
                    key={team.id}
                    to="/teams"
                    className={`flex items-center justify-between px-2 py-2 transition-colors group ${
                      isTeamActive() ? 'bg-[#393939]' : 'hover:bg-[#262626]'
                    }`}
                  >
                    <div className="flex items-center space-x-2 flex-1 min-w-0">
                      <Hashtag size={16} className="flex-shrink-0" style={{ color: isTeamActive() ? '#ffffff' : '#8d8d8d' }} />
                      {sidebarOpen && (
                        <span className={`text-sm truncate ${isTeamActive() ? 'font-medium' : ''}`} style={{ color: isTeamActive() ? '#ffffff' : '#c6c6c6' }}>
                          {team.name}
                        </span>
                      )}
                    </div>
                    {sidebarOpen && team.unread > 0 && (
                      <span className="px-1.5 py-0.5 text-white text-xs font-medium" style={{ backgroundColor: '#da1e28', borderRadius: '9999px' }}>
                        {team.unread}
                      </span>
                    )}
                    {!sidebarOpen && team.unread > 0 && (
                      <span className="absolute right-1 top-1 w-2 h-2 rounded-full" style={{ backgroundColor: '#da1e28' }}></span>
                    )}
                  </Link>
                ))}
                {sidebarOpen && (
                  <button className="w-full flex items-center space-x-2 px-2 py-2 text-sm transition-colors hover:bg-[#262626]" style={{ color: '#8d8d8d' }}>
                    <Add size={16} />
                    <span>Add team</span>
                  </button>
                )}
              </div>
            )}
          </div>

          {/* Tools Section */}
          <div>
            <button
              onClick={() => setToolsExpanded(!toolsExpanded)}
              className="w-full flex items-center justify-between px-2 py-1 text-xs font-semibold uppercase tracking-wider transition-colors mb-2"
              style={{ color: '#8d8d8d' }}
            >
              {sidebarOpen && <span>Tools</span>}
              <ChevronRight className={`w-4 h-4 transition-transform ${toolsExpanded ? 'rotate-90' : ''}`} style={{ color: '#8d8d8d' }} />
            </button>
            {toolsExpanded && (
              <div className="space-y-0.5">
                {tools.map((item) => {
                  const Icon = item.icon
                  const active = isActive(item.href)
                  return (
                    <Link
                      key={item.name}
                      to={item.href}
                      className={`flex items-center space-x-2 px-2 py-2 transition-colors ${
                        active
                          ? 'bg-[#393939]'
                          : 'hover:bg-[#262626]'
                      }`}
                    >
                      <Icon size={16} className="flex-shrink-0" style={{ color: active ? '#ffffff' : '#8d8d8d' }} />
                      {sidebarOpen && <span className={`text-sm ${active ? 'font-medium' : ''}`} style={{ color: active ? '#ffffff' : '#c6c6c6' }}>{item.name}</span>}
                    </Link>
                  )
                })}
              </div>
            )}
          </div>

          {/* Settings at bottom of tools */}
          <div className="mt-4 pt-4" style={{ borderTop: '1px solid #393939' }}>
            <Link
              to="/settings"
              className={`flex items-center space-x-2 px-2 py-2 transition-colors ${
                isActive('/settings')
                  ? 'bg-[#393939]'
                  : 'hover:bg-[#262626]'
              }`}
            >
              <Settings size={16} className="flex-shrink-0" style={{ color: isActive('/settings') ? '#ffffff' : '#8d8d8d' }} />
              {sidebarOpen && <span className={`text-sm ${isActive('/settings') ? 'font-medium' : ''}`} style={{ color: isActive('/settings') ? '#ffffff' : '#c6c6c6' }}>Settings</span>}
            </Link>
          </div>
        </nav>

        {/* User Profile */}
        <div className="p-3" style={{ borderTop: '1px solid #393939' }}>
          {sidebarOpen ? (
            <div className="flex items-center space-x-3 px-2 py-2 cursor-pointer transition-colors hover:bg-[#262626]">
              <div className="w-8 h-8 flex items-center justify-center text-white font-semibold text-sm" style={{ backgroundColor: '#8a3ffc' }}>
                JD
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate" style={{ color: '#f4f4f4' }}>John Doe</p>
                <div className="flex items-center space-x-1">
                  <span className="w-2 h-2 rounded-full" style={{ backgroundColor: '#24a148' }}></span>
                  <p className="text-xs" style={{ color: '#8d8d8d' }}>Active</p>
                </div>
              </div>
              <OverflowMenuVertical size={16} style={{ color: '#8d8d8d' }} />
            </div>
          ) : (
            <div className="flex justify-center">
              <div className="w-8 h-8 flex items-center justify-center text-white font-semibold text-sm relative" style={{ backgroundColor: '#8a3ffc' }}>
                JD
                <span className="absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full" style={{ backgroundColor: '#24a148', border: '2px solid #161616' }}></span>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top Bar - Carbon Header */}
        <header className="h-12 flex items-center justify-between px-4" style={{ backgroundColor: '#ffffff', borderBottom: '1px solid #e0e0e0' }}>
          <div className="flex items-center space-x-4 flex-1">
            <div className="flex items-center space-x-2">
              <h1 className="text-base font-semibold" style={{ color: '#161616' }}>
                {location.pathname === '/' && 'Overview'}
                {location.pathname === '/teams' && 'Teams'}
                {location.pathname === '/people' && 'People'}
                {location.pathname === '/agents' && 'AI Agents'}
                {location.pathname === '/reports' && 'Reports'}
                {location.pathname === '/chat' && 'Messages'}
                {location.pathname === '/settings' && 'Settings'}
              </h1>
            </div>
            
            <div className="flex-1 max-w-xl">
              <div className="relative">
                <Search size={16} className="absolute left-3 top-1/2 transform -translate-y-1/2" style={{ color: '#525252' }} />
                <input
                  type="text"
                  placeholder="Search or ask AI..."
                  className="w-full pl-9 pr-4 py-1.5 text-sm transition-all focus:outline-none"
                  style={{ 
                    backgroundColor: '#f4f4f4', 
                    border: '1px solid transparent',
                    borderBottom: '1px solid #8d8d8d',
                    borderRadius: '0',
                    color: '#161616'
                  }}
                  onFocus={(e) => {
                    e.target.style.backgroundColor = '#ffffff'
                    e.target.style.borderBottom = '2px solid #0f62fe'
                  }}
                  onBlur={(e) => {
                    e.target.style.backgroundColor = '#f4f4f4'
                    e.target.style.borderBottom = '1px solid #8d8d8d'
                  }}
                />
              </div>
            </div>
          </div>
          
          <div className="flex items-center space-x-2">
            <button className="relative p-2 transition-colors hover:bg-[#e0e0e0]" style={{ color: '#161616' }}>
              <Notification size={20} />
              <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full" style={{ backgroundColor: '#da1e28' }}></span>
            </button>
            
            <button className="px-3 py-1.5 text-white text-sm font-medium transition-colors flex items-center space-x-1.5" style={{ backgroundColor: '#0f62fe' }} onMouseEnter={(e) => e.target.style.backgroundColor = '#0353e9'} onMouseLeave={(e) => e.target.style.backgroundColor = '#0f62fe'}>
              <Bot size={16} />
              <span>Ask AI</span>
            </button>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-y-auto" style={{ backgroundColor: '#f4f4f4' }}>
          {children}
        </main>
      </div>
    </div>
  )
}

export default Layout
