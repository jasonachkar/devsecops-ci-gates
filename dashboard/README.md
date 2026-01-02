# DevSecOps Security Dashboard

Enterprise-grade security dashboard with real-time updates, built with React, TypeScript, and modern best practices.

## Features

- ✅ **Real API Integration** - No mocks, all data comes from live backend API
- ✅ **Real-time Updates** - WebSocket integration for live scan updates
- ✅ **Enterprise Architecture** - Feature-based structure with clean separation of concerns
- ✅ **Type Safety** - Full TypeScript coverage with shared types
- ✅ **Modern UI** - Clean, professional design with Tailwind CSS
- ✅ **Responsive Design** - Works on all screen sizes
- ✅ **Error Handling** - Comprehensive error boundaries and loading states
- ✅ **Performance** - React Query for efficient data fetching and caching

## Architecture

```
src/
├── app/                    # App-level configuration
│   └── providers/         # React context providers (Query, WebSocket)
├── features/              # Feature-based modules
│   └── dashboard/        # Dashboard feature
│       ├── components/   # Feature-specific components
│       ├── hooks/         # Feature-specific hooks
│       └── pages/         # Feature pages
├── shared/                # Shared code
│   ├── api/              # API client & services
│   ├── components/       # Reusable UI components
│   ├── lib/              # Utilities & design tokens
│   └── types/             # TypeScript types
└── services/              # External service integrations
```

## Getting Started

### Prerequisites

- Node.js 18+
- Backend API running on `http://localhost:3001` (or set `VITE_API_URL`)

### Installation

```bash
npm install
```

### Development

```bash
npm run dev
```

The dashboard will be available at `http://localhost:5173`

### Build

```bash
npm run build
```

## Environment Variables

Create a `.env` file:

```env
VITE_API_URL=http://localhost:3001/api/v1
VITE_WS_URL=http://localhost:3001
```

## API Integration

The dashboard integrates with the following backend endpoints:

- `GET /api/v1/repositories` - List repositories
- `GET /api/v1/scans/latest` - Get latest scan
- `GET /api/v1/findings` - List findings
- `GET /api/v1/trends` - Get trend data
- WebSocket: Real-time scan updates

## Key Components

- **DashboardPage** - Main dashboard with metrics and charts
- **DashboardMetrics** - Key security metrics cards
- **SeverityBreakdown** - Visual breakdown by severity
- **ToolDistribution** - Findings by security tool
- **TrendsChart** - Historical trend visualization
- **FindingsTable** - Detailed findings table

## Tech Stack

- **React 19** - UI framework
- **TypeScript** - Type safety
- **Vite** - Build tool
- **Tailwind CSS** - Styling
- **React Query** - Data fetching & caching
- **Recharts** - Data visualization
- **Socket.IO** - WebSocket client
- **Axios** - HTTP client

## Design System

The dashboard uses a consistent design system with:

- **Colors**: Dark theme with semantic colors
- **Typography**: Inter font family
- **Spacing**: 4px base unit system
- **Components**: Reusable UI primitives

## Real-time Updates

The dashboard automatically updates when new scans complete via WebSocket. The connection status is shown in the header.

## License

MIT
