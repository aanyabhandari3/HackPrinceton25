# OrgAI Dashboard - Wireframe UI

A modern, AI-powered organizational management dashboard built with React, Vite, and TailwindCSS.

## Features

### 🏠 Home / Overview Dashboard
- Real-time project health metrics
- Team activity heatmap
- Recent highlights feed
- Upcoming deadlines tracker
- Interactive AI agent query interface

### 👥 Team View
- Multi-team management with tabs
- KPI tracking (velocity, burn rate, carryover, incidents)
- Sprint velocity charts
- Team member activity summaries
- Integrated AI chat for team queries
- Backlog/task management

### 🧑‍💼 People / Downline View
- Searchable team member directory
- Individual performance metrics
- Activity trend visualization
- Recent highlights and achievements
- Private manager notes
- AI-powered insights

### 🤖 AI Agents Hub
- Centralized agent management
- Agent performance metrics
- Connected source management
- Real-time agent chat interface
- Configurable agent settings
- Access control and permissions

### 📊 Reports Center
- Scheduled report management
- Past report archive with search
- Interactive report viewer
- Multiple export formats (PDF, Markdown, HTML)
- Customizable report sections
- Auto-generation capabilities

### 💬 Chat / Communication
- Unified messaging interface
- Direct messages and team chats
- AI agent conversations
- Pinned decisions and actions
- Mentions and notifications
- AI-assisted conversation summaries

### ⚙️ Settings / Admin
- Organization hierarchy management
- Integration connectors (GitHub, Jira, Slack, etc.)
- Report configuration defaults
- Privacy and data retention rules
- Agent access control
- API key management

## Tech Stack

- **React 18** - UI framework
- **Vite** - Build tool and dev server
- **TailwindCSS** - Utility-first CSS framework
- **React Router** - Client-side routing
- **Recharts** - Data visualization
- **Lucide React** - Icon library

## Getting Started

### Prerequisites
- Node.js 16+ 
- npm or yarn

### Installation

1. Navigate to the project directory:
```bash
cd org-dashboard-wireframe
```

2. Install dependencies:
```bash
npm install
```

3. Start the development server:
```bash
npm run dev
```

4. Open your browser and visit:
```
http://localhost:3000
```

### Build for Production

```bash
npm run build
```

The built files will be in the `dist` directory.

### Preview Production Build

```bash
npm run preview
```

## Project Structure

```
org-dashboard-wireframe/
├── src/
│   ├── components/
│   │   └── Layout.jsx          # Main layout with sidebar and header
│   ├── pages/
│   │   ├── HomePage.jsx         # Overview dashboard
│   │   ├── TeamView.jsx         # Team management
│   │   ├── PeopleView.jsx       # People/downline view
│   │   ├── AgentsHub.jsx        # AI agents hub
│   │   ├── ReportsCenter.jsx    # Reports management
│   │   ├── ChatPage.jsx         # Communication interface
│   │   └── SettingsPage.jsx     # Settings and admin
│   ├── App.jsx                  # Main app component
│   ├── main.jsx                 # Entry point
│   └── index.css                # Global styles
├── index.html
├── package.json
├── vite.config.js
├── tailwind.config.js
└── README.md
```

## Features by Page

### Home Dashboard
- 4 summary cards (project health, active projects, tasks closed, blockers)
- Team activity trend chart
- Team activity heatmap with progress bars
- Recent highlights with categorized events
- Upcoming deadlines with priority indicators
- AI agent query interface

### Team View
- Team selector dropdown
- 4 tabs: Overview, Members, AI Chat, Backlog
- Sprint velocity bar chart
- Quick stats for PRs, code quality, and issues
- Team member cards with activity metrics
- Integrated task management table

### People View
- Search and filter by role/team
- Grid layout of person cards
- Individual activity trends
- Highlights and achievements
- Detail modal with full profile
- Manager notes section

### AI Agents Hub
- Agent cards with metrics
- Connected sources display
- Recent interaction history
- Agent chat modal
- Global settings configuration
- Available connectors grid

### Reports Center
- Scheduled reports list
- Past reports table
- Report viewer with sidebar navigation
- Export and sharing options
- Health status indicators
- Regeneration capabilities

### Chat Page
- Thread list with search
- Pinned items section
- Mentions panel
- Message history with reactions
- AI-assisted summaries
- Rich text input

### Settings
- 5 tabs: Hierarchy, Connectors, Reports, Privacy, Access Control
- Organization chart
- Integration management
- Report configuration
- Privacy rules toggles
- API key management

## Customization

### Colors
Edit `tailwind.config.js` to customize the color scheme:

```js
theme: {
  extend: {
    colors: {
      primary: {
        // Your custom colors
      }
    }
  }
}
```

### Layout
Modify `src/components/Layout.jsx` to adjust the sidebar, header, or navigation.

### Data
All pages currently use mock data. Replace with API calls to your backend:

```jsx
// Example: Replace mock data with API call
const [teams, setTeams] = useState([])

useEffect(() => {
  fetch('/api/teams')
    .then(res => res.json())
    .then(data => setTeams(data))
}, [])
```

## Design Principles

- **Modern & Clean**: Minimalist design with focus on content
- **Responsive**: Works on desktop, tablet, and mobile
- **Accessible**: Semantic HTML and keyboard navigation
- **Performant**: Optimized rendering and lazy loading
- **Consistent**: Unified design system across all pages

## Browser Support

- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)

## License

This is a wireframe/prototype project for demonstration purposes.

## Contributing

This is a wireframe project. Feel free to fork and customize for your needs.

## Support

For questions or issues, please open an issue in the repository.
