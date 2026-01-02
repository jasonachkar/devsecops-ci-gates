# 🔐 DevSecOps Security Dashboard

A production-ready, full-stack security dashboard platform showcasing enterprise cloud security engineering capabilities. This project demonstrates AWS integration, real-time security monitoring, compliance scorecards, and modern full-stack development practices.

![Status](https://img.shields.io/badge/status-production%20ready-success)
![TypeScript](https://img.shields.io/badge/TypeScript-5.7-blue)
![React](https://img.shields.io/badge/React-19.2-blue)
![Node](https://img.shields.io/badge/Node-20-green)

## ✨ Features

### 🔒 Security Scanning
- **SAST**: CodeQL static analysis
- **SCA**: Dependency vulnerability scanning (npm, .NET)
- **Secrets**: Gitleaks secret detection
- **IaC**: Checkov infrastructure scanning
- **Container**: Trivy container image scanning

### ☁️ AWS Cloud Security
- **Security Hub**: Real-time security findings sync
- **CloudTrail**: Suspicious activity detection and analysis
- **IAM Analysis**: Over-permission detection and CIS compliance checking
- **Cloud Security Dashboard**: Unified view of AWS security posture

### 📊 Analytics & Reporting
- **Historical Trends**: Time-series analysis of security findings
- **Compliance Scorecards**: OWASP Top 10 and CWE Top 25 mapping
- **Real-time Updates**: WebSocket-powered live dashboard updates
- **Risk Scoring**: Automated risk assessment and gate evaluation

### 🏗️ Architecture
- **Backend**: Node.js + Express + TypeScript + PostgreSQL
- **Frontend**: React 19 + TypeScript + Tailwind CSS
- **Real-time**: Socket.IO WebSocket communication
- **CI/CD**: GitHub Actions with automated scanning
- **Containerization**: Docker support for easy deployment

## 🚀 Quick Start

### Prerequisites
- Node.js 20+
- PostgreSQL 16+ (or Docker)
- npm or yarn

### Option 1: Docker Compose (Recommended)

```bash
# Clone the repository
git clone <your-repo-url>
cd devsecops-ci-cd-gates

# Start all services
docker-compose up

# Services will be available at:
# - Dashboard: http://localhost:5173
# - API: http://localhost:3001
# - PostgreSQL: localhost:5432
```

### Option 2: Manual Setup

See [QUICK_START.md](./QUICK_START.md) for detailed setup instructions.

## 📁 Project Structure

```
devsecops-ci-cd-gates/
├── backend/              # Node.js API server
│   ├── src/
│   │   ├── config/      # Configuration
│   │   ├── controllers/  # Request handlers
│   │   ├── services/     # Business logic
│   │   │   └── aws/     # AWS integrations
│   │   ├── routes/      # API routes
│   │   └── middleware/  # Auth, validation
│   └── prisma/          # Database schema
│
├── dashboard/           # React frontend
│   ├── src/
│   │   ├── components/  # UI components
│   │   ├── pages/       # Page components
│   │   ├── services/    # API clients
│   │   └── store/       # State management
│
├── .github/workflows/   # CI/CD pipelines
└── docs/                # Documentation
```

## 🔑 Key Features for Recruiters

### 1. **Production-Ready Backend**
- Clean architecture with separation of concerns
- Type-safe with TypeScript throughout
- Comprehensive error handling and logging
- Security best practices (JWT, RBAC, rate limiting)
- Database migrations and seeding

### 2. **AWS Cloud Security Integration**
- **Security Hub**: Real-time findings sync
- **CloudTrail**: Security event analysis
- **IAM**: Policy analysis and over-permission detection
- Demonstrates real AWS SDK usage (not mockups)

### 3. **Modern Frontend**
- React 19 with TypeScript
- Beautiful dark-themed UI
- Real-time WebSocket updates
- Professional charts and visualizations
- Responsive design

### 4. **CI/CD Integration**
- GitHub Actions workflow
- Automated security scanning
- API integration for data persistence
- Automated dashboard deployment

### 5. **Security Best Practices**
- JWT authentication
- Role-based access control
- Rate limiting
- Input validation (Zod)
- Security headers (Helmet.js)
- API key management

## 📚 Documentation

- **[QUICK_START.md](./QUICK_START.md)** - Getting started guide
- **[backend/README.md](./backend/README.md)** - Backend API documentation
- **[PROJECT_COMPLETE.md](./PROJECT_COMPLETE.md)** - Complete feature list
- **[IMPLEMENTATION_STATUS.md](./IMPLEMENTATION_STATUS.md)** - Implementation details

## 🛠️ Tech Stack

### Backend
- **Runtime**: Node.js 20
- **Framework**: Express.js
- **Language**: TypeScript
- **Database**: PostgreSQL 16
- **ORM**: Prisma
- **Authentication**: JWT + API Keys
- **WebSocket**: Socket.IO
- **Validation**: Zod
- **Logging**: Winston

### Frontend
- **Framework**: React 19
- **Language**: TypeScript
- **Styling**: Tailwind CSS 4
- **Charts**: Recharts
- **State**: Zustand
- **Routing**: React Router
- **Animations**: Framer Motion

### AWS Services
- Security Hub
- CloudTrail
- IAM

## 🔐 Security Features

- ✅ JWT authentication with role-based access control
- ✅ API key authentication for CI/CD
- ✅ Rate limiting on all endpoints
- ✅ Input validation with Zod
- ✅ Security headers (Helmet.js)
- ✅ CORS configuration
- ✅ SQL injection prevention (Prisma)
- ✅ XSS protection (React)

## 📊 API Endpoints

### Authentication
- `POST /api/v1/auth/login` - Login
- `GET /api/v1/auth/me` - Get current user

### Scans
- `POST /api/v1/scans` - Create scan
- `GET /api/v1/scans` - List scans
- `GET /api/v1/scans/:id` - Get scan
- `GET /api/v1/scans/latest` - Get latest scan

### Findings
- `GET /api/v1/findings` - List findings
- `GET /api/v1/findings/:id` - Get finding
- `PATCH /api/v1/findings/:id` - Update finding

### Trends & Compliance
- `GET /api/v1/trends` - Historical trends
- `GET /api/v1/compliance/owasp-top10` - OWASP scorecard
- `GET /api/v1/compliance/cwe-top25` - CWE scorecard

### AWS
- `POST /api/v1/aws/securityhub/sync` - Sync Security Hub
- `GET /api/v1/aws/securityhub/findings` - Get Security Hub findings
- `POST /api/v1/aws/cloudtrail/analyze` - Analyze CloudTrail
- `POST /api/v1/aws/iam/analyze` - Analyze IAM policies

## 🎯 What This Demonstrates

### For Cloud Security Engineers
- AWS Security Hub integration
- CloudTrail log analysis
- IAM policy analysis
- Cloud security posture management

### For Full-Stack Developers
- RESTful API design
- Real-time WebSocket communication
- Database schema design
- Modern React patterns
- TypeScript throughout

### For DevSecOps Engineers
- CI/CD pipeline integration
- Security scanning automation
- Compliance mapping
- Security metrics and trending

## 🚧 Roadmap

Future enhancements (designed, not yet implemented):
- Multi-cloud support (Azure, GCP)
- SBOM generation (Syft)
- DAST integration (OWASP ZAP)
- Advanced remediation workflows
- Infrastructure as Code (Terraform)

## 📝 License

MIT

## 🤝 Contributing

This is a portfolio project. Feel free to fork and extend!

---

**Status**: ✅ **Production Ready**

All core features implemented. Ready for deployment and demonstration.
