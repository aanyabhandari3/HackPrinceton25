import React, { useState, useRef, useEffect } from 'react'
import { 
  MessageSquare, Bot, Users, Send, Paperclip, Smile, 
  Search, Pin, CheckCircle, AlertCircle, Info, Star,
  MoreVertical, Hash, AtSign
} from 'lucide-react'
import SarahChenImg from '../assets/profiles/SarahChen.png'

const ChatPage = () => {
  const [selectedThread, setSelectedThread] = useState(1)
  const [messageInput, setMessageInput] = useState('')
  const [searchQuery, setSearchQuery] = useState('')
  const [chatSearchQuery, setChatSearchQuery] = useState('')
  const [showEmojiPicker, setShowEmojiPicker] = useState(false)
  const [showChatSearch, setShowChatSearch] = useState(false)
  const messagesEndRef = useRef(null)
  const fileInputRef = useRef(null)

  const [threads, setThreads] = useState([
    {
      id: 1,
      type: 'agent',
      name: 'Backend Team Agent',
      avatar: 'BT',
      lastMessage: 'The API migration is 85% complete...',
      time: '2 min ago',
      unread: 2,
      pinned: true
    },
    {
      id: 2,
      type: 'team',
      name: 'Frontend Team Discussion',
      avatar: 'FT',
      lastMessage: 'Mike: The new dashboard looks great!',
      time: '15 min ago',
      unread: 0,
      pinned: false
    },
    {
      id: 3,
      type: 'agent',
      name: 'Organization Agent',
      avatar: 'OA',
      lastMessage: 'Q4 summary report is ready for review',
      time: '1 hour ago',
      unread: 1,
      pinned: true
    },
    {
      id: 4,
      type: 'direct',
      name: 'Sarah Chen',
      avatar: 'SC',
      avatarImg: SarahChenImg,
      lastMessage: 'Can we discuss the sprint planning?',
      time: '2 hours ago',
      unread: 0,
      pinned: false
    },
    {
      id: 5,
      type: 'team',
      name: 'Mobile Team Sync',
      avatar: 'MT',
      lastMessage: 'Lisa: iOS app submitted to App Store',
      time: '3 hours ago',
      unread: 0,
      pinned: false
    },
    {
      id: 6,
      type: 'agent',
      name: 'DevOps Agent',
      avatar: 'DA',
      lastMessage: 'Deployment to production successful',
      time: '5 hours ago',
      unread: 0,
      pinned: false
    }
  ])

  const [messages, setMessages] = useState([
    {
      id: 1,
      sender: 'You',
      avatar: 'JD',
      type: 'user',
      content: 'What\'s the current status of the API v3 migration?',
      time: '10:30 AM',
      reactions: []
    },
    {
      id: 2,
      sender: 'Backend Team Agent',
      avatar: 'BT',
      type: 'agent',
      content: 'The API v3 migration is currently 85% complete. Here\'s the breakdown:\n\n✅ Authentication endpoints - Complete\n✅ User management - Complete\n✅ Payment processing - Complete\n🔄 Webhook system - In Progress (75%)\n⏳ Analytics endpoints - Not Started\n\nEstimated completion: January 18, 2024\n\nWould you like more details on any specific area?',
      time: '10:31 AM',
      reactions: [{ emoji: '👍', count: 2 }]
    },
    {
      id: 3,
      sender: 'You',
      avatar: 'JD',
      type: 'user',
      content: 'What are the blockers for the webhook system?',
      time: '10:32 AM',
      reactions: []
    },
    {
      id: 4,
      sender: 'Backend Team Agent',
      avatar: 'BT',
      type: 'agent',
      content: 'Current blockers for the webhook system:\n\n1. **Infrastructure Access** (High Priority)\n   - Alex Kumar needs AWS permissions for load testing\n   - Waiting on DevOps team approval\n   - Blocking since: January 10\n\n2. **Third-party API Documentation** (Medium Priority)\n   - Stripe webhook signature validation unclear\n   - Reached out to Stripe support\n   - Expected resolution: January 15\n\nI\'ve created tickets BACK-239 and BACK-240 to track these. Would you like me to escalate the infrastructure access issue?',
      time: '10:33 AM',
      reactions: [{ emoji: '✅', count: 1 }]
    },
    {
      id: 5,
      sender: 'You',
      avatar: 'JD',
      type: 'user',
      content: 'Yes, please escalate the infrastructure access to Tom Brown',
      time: '10:35 AM',
      reactions: []
    },
    {
      id: 6,
      sender: 'Backend Team Agent',
      avatar: 'BT',
      type: 'agent',
      content: '✅ Done! I\'ve sent a message to Tom Brown (DevOps Lead) with the following:\n\n"Hi Tom, Alex Kumar needs AWS permissions for API v3 webhook load testing. This is blocking the webhook migration (currently 75% complete). Can you please grant access today? Priority: High. Ticket: BACK-239"\n\nTom has been notified via Slack and email. I\'ll follow up if there\'s no response within 2 hours.',
      time: '10:35 AM',
      reactions: [{ emoji: '🎉', count: 1 }, { emoji: '👍', count: 1 }]
    }
  ])

  const pinnedItems = [
    { type: 'decision', content: 'API v3 launch date: January 25, 2024', time: 'Yesterday' },
    { type: 'action', content: 'All teams: Update dependencies by Friday', time: '2 days ago' }
  ]

  const mentions = [
    { thread: 'Frontend Team Discussion', message: 'Can you review the dashboard PR?', time: '1 hour ago' },
    { thread: 'Organization Agent', message: 'Your approval needed for Q4 report', time: '3 hours ago' }
  ]

  // Scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  // Clear unread count when selecting a thread
  useEffect(() => {
    setThreads(prev => prev.map(t => 
      t.id === selectedThread ? { ...t, unread: 0 } : t
    ))
  }, [selectedThread])

  const getThreadIcon = (type) => {
    if (type === 'agent') return <Bot className="w-5 h-5" />
    if (type === 'team') return <Users className="w-5 h-5" />
    return <MessageSquare className="w-5 h-5" />
  }

  const getThreadColor = (type) => {
    if (type === 'agent') return 'from-blue-500 to-purple-600'
    if (type === 'team') return 'from-green-500 to-teal-600'
    return 'from-gray-500 to-gray-600'
  }

  const currentThread = threads.find(t => t.id === selectedThread)

  // Send message handler
  const handleSendMessage = () => {
    if (!messageInput.trim()) return

    const newMessage = {
      id: messages.length + 1,
      sender: 'You',
      avatar: 'JD',
      type: 'user',
      content: messageInput,
      time: new Date().toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' }),
      reactions: []
    }

    setMessages(prev => [...prev, newMessage])
    setMessageInput('')

    // Update thread's last message
    setThreads(prev => prev.map(t => 
      t.id === selectedThread 
        ? { ...t, lastMessage: messageInput.substring(0, 50) + '...', time: 'Just now' }
        : t
    ))
  }

  // Toggle pin thread
  const handleTogglePin = () => {
    setThreads(prev => prev.map(t => 
      t.id === selectedThread ? { ...t, pinned: !t.pinned } : t
    ))
  }

  // Add reaction to message
  const handleAddReaction = (messageId, emoji) => {
    setMessages(prev => prev.map(msg => {
      if (msg.id === messageId) {
        const existingReaction = msg.reactions.find(r => r.emoji === emoji)
        if (existingReaction) {
          return {
            ...msg,
            reactions: msg.reactions.map(r => 
              r.emoji === emoji ? { ...r, count: r.count + 1 } : r
            )
          }
        } else {
          return {
            ...msg,
            reactions: [...msg.reactions, { emoji, count: 1 }]
          }
        }
      }
      return msg
    }))
    setShowEmojiPicker(false)
  }

  // Handle file attachment
  const handleFileAttach = () => {
    fileInputRef.current?.click()
  }

  const handleFileChange = (e) => {
    const file = e.target.files?.[0]
    if (file) {
      const newMessage = {
        id: messages.length + 1,
        sender: 'You',
        avatar: 'JD',
        type: 'user',
        content: `📎 Attached: ${file.name}`,
        time: new Date().toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' }),
        reactions: []
      }
      setMessages(prev => [...prev, newMessage])
    }
  }

  // Filter threads by search
  const filteredThreads = threads.filter(thread =>
    thread.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    thread.lastMessage.toLowerCase().includes(searchQuery.toLowerCase())
  )

  // Filter messages by search
  const filteredMessages = chatSearchQuery
    ? messages.filter(msg => msg.content.toLowerCase().includes(chatSearchQuery.toLowerCase()))
    : messages

  return (
    <div className="h-[calc(100vh-4rem)] flex">
      {/* Sidebar */}
      <div className="w-80 bg-white border-r border-gray-200 flex flex-col">
        {/* Search */}
        <div className="p-4 border-b border-gray-200">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search conversations..."
              className="w-full pl-9 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
            />
          </div>
        </div>

        {/* Pinned Items */}
        {pinnedItems.length > 0 && (
          <div className="p-4 border-b border-gray-200 bg-yellow-50">
            <div className="flex items-center space-x-2 mb-2">
              <Pin className="w-4 h-4 text-yellow-600" />
              <h3 className="text-xs font-semibold text-gray-700 uppercase">Pinned</h3>
            </div>
            <div className="space-y-2">
              {pinnedItems.map((item, idx) => (
                <div key={idx} className="text-xs">
                  <p className="text-gray-900 font-medium">{item.content}</p>
                  <p className="text-gray-500">{item.time}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Mentions */}
        {mentions.length > 0 && (
          <div className="p-4 border-b border-gray-200 bg-blue-50">
            <div className="flex items-center space-x-2 mb-2">
              <AtSign className="w-4 h-4 text-blue-600" />
              <h3 className="text-xs font-semibold text-gray-700 uppercase">Mentions</h3>
            </div>
            <div className="space-y-2">
              {mentions.map((mention, idx) => (
                <div key={idx} className="text-xs">
                  <p className="text-gray-900 font-medium">{mention.thread}</p>
                  <p className="text-gray-600">{mention.message}</p>
                  <p className="text-gray-500">{mention.time}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Thread List */}
        <div className="flex-1 overflow-y-auto">
          {filteredThreads.map((thread) => (
            <div
              key={thread.id}
              onClick={() => setSelectedThread(thread.id)}
              className={`p-4 border-b border-gray-200 cursor-pointer transition-colors ${
                selectedThread === thread.id ? 'bg-blue-50' : 'hover:bg-gray-50'
              }`}
            >
              <div className="flex items-start space-x-3">
                {thread.avatarImg ? (
                  <img 
                    src={thread.avatarImg} 
                    alt={thread.name}
                    className="w-10 h-10 rounded-full object-cover flex-shrink-0"
                  />
                ) : (
                  <div className={`w-10 h-10 bg-gradient-to-br ${getThreadColor(thread.type)} rounded-full flex items-center justify-center text-white font-semibold text-sm flex-shrink-0`}>
                    {thread.type === 'agent' || thread.type === 'team' ? (
                      getThreadIcon(thread.type)
                    ) : (
                      thread.avatar
                    )}
                  </div>
                )}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <h3 className="font-semibold text-sm text-gray-900 truncate">{thread.name}</h3>
                    <span className="text-xs text-gray-500">{thread.time}</span>
                  </div>
                  <p className="text-sm text-gray-600 truncate mt-0.5">{thread.lastMessage}</p>
                  <div className="flex items-center space-x-2 mt-1">
                    {thread.pinned && <Pin className="w-3 h-3 text-yellow-600" />}
                    {thread.unread > 0 && (
                      <span className="px-1.5 py-0.5 bg-blue-600 text-white text-xs rounded-full">
                        {thread.unread}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col bg-gray-50">
        {/* Chat Header */}
        <div className="h-16 bg-white border-b border-gray-200 flex items-center justify-between px-6">
          <div className="flex items-center space-x-3">
            <div className={`w-10 h-10 bg-gradient-to-br ${getThreadColor(currentThread?.type)} rounded-full flex items-center justify-center text-white font-semibold`}>
              {currentThread?.type === 'agent' || currentThread?.type === 'team' ? (
                getThreadIcon(currentThread?.type)
              ) : (
                currentThread?.avatar
              )}
            </div>
            <div>
              <h2 className="font-semibold text-gray-900">{currentThread?.name}</h2>
              <p className="text-xs text-gray-500">
                {currentThread?.type === 'agent' ? 'AI Agent' : currentThread?.type === 'team' ? 'Team Chat' : 'Direct Message'}
              </p>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <button 
              onClick={() => setShowChatSearch(!showChatSearch)}
              className={`p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors ${showChatSearch ? 'bg-gray-100' : ''}`}
            >
              <Search className="w-5 h-5" />
            </button>
            <button 
              onClick={handleTogglePin}
              className={`p-2 hover:bg-gray-100 rounded-lg transition-colors ${currentThread?.pinned ? 'text-yellow-600' : 'text-gray-600'}`}
            >
              <Pin className="w-5 h-5" />
            </button>
            <button className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors">
              <MoreVertical className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Chat Search Bar */}
        {showChatSearch && (
          <div className="px-6 pt-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                value={chatSearchQuery}
                onChange={(e) => setChatSearchQuery(e.target.value)}
                placeholder="Search in conversation..."
                className="w-full pl-9 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
              />
            </div>
          </div>
        )}

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-6 space-y-4">
          {filteredMessages.map((message) => (
            <div key={message.id} className="flex items-start space-x-3">
              <div className={`w-8 h-8 bg-gradient-to-br ${
                message.type === 'agent' ? 'from-blue-500 to-purple-600' : 'from-gray-500 to-gray-600'
              } rounded-full flex items-center justify-center text-white font-semibold text-sm flex-shrink-0`}>
                {message.type === 'agent' ? <Bot className="w-4 h-4" /> : message.avatar}
              </div>
              <div className="flex-1">
                <div className="flex items-center space-x-2 mb-1">
                  <span className="font-semibold text-sm text-gray-900">{message.sender}</span>
                  <span className="text-xs text-gray-500">{message.time}</span>
                </div>
                <div className="bg-white rounded-lg p-4 shadow-sm">
                  <p className="text-sm text-gray-900 whitespace-pre-line">{message.content}</p>
                  <div className="flex items-center space-x-2 mt-2">
                    {message.reactions.map((reaction, idx) => (
                      <button
                        key={idx}
                        onClick={() => handleAddReaction(message.id, reaction.emoji)}
                        className="px-2 py-1 bg-gray-100 hover:bg-gray-200 rounded-full text-xs flex items-center space-x-1 transition-colors"
                      >
                        <span>{reaction.emoji}</span>
                        <span className="text-gray-600">{reaction.count}</span>
                      </button>
                    ))}
                    <div className="relative">
                      <button 
                        onClick={() => setShowEmojiPicker(message.id)}
                        className="p-1 text-gray-400 hover:text-gray-600 transition-colors"
                      >
                        <Smile className="w-4 h-4" />
                      </button>
                      {showEmojiPicker === message.id && (
                        <div className="absolute bottom-full left-0 mb-2 bg-white border border-gray-200 rounded-lg shadow-lg p-2 flex space-x-1 z-10">
                          {['👍', '❤️', '😊', '🎉', '✅', '🔥'].map(emoji => (
                            <button
                              key={emoji}
                              onClick={() => handleAddReaction(message.id, emoji)}
                              className="p-2 hover:bg-gray-100 rounded transition-colors text-lg"
                            >
                              {emoji}
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
          <div ref={messagesEndRef} />
        </div>

        {/* AI Summary Banner */}
        {currentThread?.type === 'agent' && (
          <div className="mx-6 mb-4 p-4 bg-gradient-to-r from-blue-50 to-purple-50 border border-blue-200 rounded-lg">
            <div className="flex items-start space-x-3">
              <Info className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-medium text-gray-900">AI-Assisted Summary</p>
                <p className="text-sm text-gray-600 mt-1">
                  This conversation covered API v3 migration status (85% complete), identified 2 blockers, and escalated infrastructure access to DevOps team.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Input Area */}
        <div className="bg-white border-t border-gray-200 p-4">
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileChange}
            className="hidden"
          />
          <div className="flex items-end space-x-3">
            <button 
              onClick={handleFileAttach}
              className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <Paperclip className="w-5 h-5" />
            </button>
            <div className="flex-1 relative">
              <textarea
                value={messageInput}
                onChange={(e) => setMessageInput(e.target.value)}
                placeholder={`Message ${currentThread?.name}...`}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                rows="1"
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault()
                    handleSendMessage()
                  }
                }}
              />
            </div>
            <button className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors">
              <Smile className="w-5 h-5" />
            </button>
            <button 
              onClick={handleSendMessage}
              disabled={!messageInput.trim()}
              className="px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Send className="w-4 h-4" />
              <span>Send</span>
            </button>
          </div>
          <p className="text-xs text-gray-500 mt-2">
            Press Enter to send, Shift+Enter for new line
          </p>
        </div>
      </div>
    </div>
  )
}

export default ChatPage
