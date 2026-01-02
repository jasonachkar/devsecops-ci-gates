# Security Dashboard

An interactive React-based dashboard for visualizing DevSecOps security scan results. This dashboard is automatically deployed to GitHub Pages and integrated with pull request workflows to provide real-time security insights.

## Features

- **Real-time Scan Results**: View the latest security findings from all integrated tools
- **Severity Breakdown**: Color-coded cards displaying critical, high, medium, and low severity issues
- **Tool Distribution**: Visual breakdown of findings by security tool
- **Top Findings**: Quick access to the most critical security issues
- **Threshold Indicators**: Visual indicators showing when severity thresholds are exceeded
- **Responsive Design**: Mobile-friendly interface built with Tailwind CSS

## Tech Stack

- **Framework**: React 18 + TypeScript
- **Build Tool**: Vite
- **Styling**: Tailwind CSS v4
- **State Management**: Zustand
- **Date Formatting**: date-fns
- **Charts**: Recharts (planned)
- **Tables**: TanStack Table (planned)
- **Icons**: lucide-react (planned)

## Project Structure

```
dashboard/
├── src/
│   ├── components/        # Reusable UI components
│   │   └── overview/      # Overview page components
│   │       └── SeverityCard.tsx
│   ├── pages/             # Page components
│   │   └── HomePage.tsx   # Main dashboard page
│   ├── store/             # Zustand state management
│   │   └── scanStore.ts   # Scan data store
│   ├── types/             # TypeScript type definitions
│   │   └── scan.ts        # Scan data types
│   ├── App.tsx            # Root component
│   ├── main.tsx           # Application entry point
│   └── index.css          # Global styles
├── public/
│   └── data/              # Static data files
│       └── latest.json    # Latest scan results
├── vite.config.ts         # Vite configuration
├── tailwind.config.js     # Tailwind CSS configuration
├── postcss.config.js      # PostCSS configuration
└── package.json           # Dependencies
```

## Local Development

### Prerequisites

- Node.js 20.x or later
- npm or yarn

### Installation

```bash
cd dashboard
npm install
```

### Development Server

```bash
npm run dev
```

The dashboard will be available at `http://localhost:5173`

### Using Sample Data

For local development, sample data is automatically copied from `reports/samples/sample-results.json` to `public/data/latest.json`. This allows you to develop and test the dashboard without running actual security scans.

To use different data:

1. Place your JSON file in `public/data/latest.json`
2. Ensure it matches the expected schema (see [Data Format](#data-format))
3. Reload the dashboard

### Building for Production

```bash
npm run build
```

The built files will be in the `dist/` directory.

### Preview Production Build

```bash
npm run preview
```

## Data Format

The dashboard expects scan data in the following format:

```typescript
{
  "metadata": {
    "timestamp": "2025-01-15T10:30:45.123Z",
    "repository": "org/repo",
    "branch": "main",
    "commit": "abc123",
    "triggeredBy": "username"
  },
  "summary": {
    "total": 47,
    "bySeverity": {
      "critical": 3,
      "high": 8,
      "medium": 18,
      "low": 18,
      "info": 0
    },
    "byTool": {
      "gitleaks": 2,
      "codeql": 15,
      "npm-audit": 12,
      "dotnet-vulnerable": 5,
      "checkov": 8,
      "trivy": 5
    }
  },
  "findings": [
    {
      "tool": "gitleaks",
      "category": "secrets",
      "severity": "critical",
      "ruleId": "generic-api-key",
      "title": "AWS API Key detected",
      "file": "apps/node-api/src/server.ts",
      "line": 42,
      "message": "Secret detected: AKIA...",
      "fingerprint": "abc123",
      "cwe": "CWE-798",       // Optional
      "cvss": 9.8             // Optional
    }
  ]
}
```

## GitHub Pages Deployment

### Automatic Deployment on PRs

When a pull request is created, the dashboard is automatically:

1. Built with the latest security scan results embedded
2. Deployed to `gh-pages` branch under `pr-{number}/`
3. Linked in the PR comment for easy access

**URL Pattern**: `https://{org}.github.io/{repo}/pr-{number}/`

### Manual Deployment

The dashboard can be manually deployed by:

1. Pushing changes to the `dashboard/` directory on `main` branch
2. Triggering the `deploy-dashboard` workflow manually
3. Running `npm run build` and deploying the `dist/` folder

## Configuration

### GitHub Pages Base Path

The Vite configuration includes a base path for GitHub Pages:

```typescript
// vite.config.ts
export default defineConfig({
  base: '/devsecops-ci-cd-gates/', // Update to match your repo name
  // ...
})
```

Update this value if your repository name is different.

### Tailwind CSS Theme

Custom colors for severity levels are defined in `tailwind.config.js`:

```javascript
theme: {
  extend: {
    colors: {
      critical: {
        DEFAULT: '#ef4444',
        light: '#fee2e2',
        dark: '#991b1b',
      },
      // ...
    }
  }
}
```

## State Management

The dashboard uses Zustand for lightweight state management. The main store is `scanStore.ts`:

```typescript
import { useScanStore } from './store/scanStore';

// In your component
const { currentScan, loading, error, loadScan } = useScanStore();

// Load data
useEffect(() => {
  loadScan('file'); // or 'embedded' for embedded data
}, []);
```

## Component Usage

### SeverityCard

Display severity metrics with threshold indicators:

```tsx
import { SeverityCard } from './components/overview/SeverityCard';

<SeverityCard
  severity="critical"
  count={3}
  threshold={0}  // Optional: shows "BLOCKED" if exceeded
/>
```

## Roadmap

### Phase 1 (Completed)
- ✅ Project setup with Vite + React + TypeScript
- ✅ Tailwind CSS integration
- ✅ Basic state management with Zustand
- ✅ HomePage with severity cards
- ✅ Sample data integration
- ✅ Production build

### Phase 2 (In Progress)
- ✅ GitHub Pages deployment integration
- ✅ PR comment integration
- [ ] Finding explorer with TanStack Table
- [ ] Searchable and filterable findings

### Phase 3 (Planned)
- [ ] Historical trends with Recharts
- [ ] Multi-scan comparison
- [ ] Compliance scorecard page
- [ ] Export functionality (CSV, PDF)

### Phase 4 (Future)
- [ ] Dark mode support
- [ ] GitHub API integration for dynamic data
- [ ] Exemption management UI
- [ ] Multi-repository dashboard
- [ ] Real-time updates via webhooks

## Troubleshooting

### Build Errors

**Issue**: `Cannot apply unknown utility class`

**Solution**: Ensure you're using Tailwind CSS v4 with `@tailwindcss/postcss`:

```bash
npm install @tailwindcss/postcss autoprefixer
```

**Issue**: `Failed to load scan data`

**Solution**: Check that `public/data/latest.json` exists and is valid JSON.

### Development Server Issues

**Issue**: Dashboard shows "No scan data available"

**Solution**:
1. Verify `public/data/latest.json` exists
2. Check browser console for errors
3. Ensure the data format matches the expected schema

## Contributing

When contributing to the dashboard:

1. Follow the existing code structure
2. Use TypeScript for type safety
3. Follow the component naming convention (`PascalCase`)
4. Add appropriate error handling
5. Test locally before committing
6. Update this README if adding new features

## License

This project is part of the DevSecOps CI/CD Security Gates repository. See the main repository LICENSE file for details.

## Support

For issues or questions:

1. Check the [main repository README](../README.md)
2. Review the [troubleshooting section](#troubleshooting)
3. Open an issue in the main repository
