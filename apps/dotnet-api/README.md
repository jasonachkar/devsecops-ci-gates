# DevSecOps .NET 8 Web API

A sample .NET 8 minimal API designed to demonstrate security scanning capabilities in a CI/CD pipeline.

## ⚠️ Important Notice

**This application contains intentional security vulnerabilities for testing purposes.**

This code is designed to trigger various security scanners including:
- SAST (CodeQL for C#)
- Dependency scanning (dotnet list package --vulnerable)
- Secret scanning (Gitleaks)
- Container scanning (Trivy)

**DO NOT deploy this application to production!**

## Purpose

This API serves as a realistic test subject for the DevSecOps Security Gates pipeline, demonstrating:

1. **Security Best Practices** (what TO do):
   - HTTPS redirection
   - CORS configuration
   - Structured logging with Serilog
   - OpenAPI/Swagger documentation
   - Health check endpoints

2. **Security Anti-Patterns** (what NOT to do - intentional for testing):
   - Hardcoded secrets and credentials
   - SQL injection vulnerabilities
   - Path traversal vulnerabilities
   - Weak JWT secrets
   - Insufficient input validation
   - Sensitive data in logs
   - Information disclosure
   - Command injection risks

## Features

### Endpoints

- `GET /` - Service information
- `GET /health` - Basic health check
- `GET /health/detailed` - Detailed health information
- `GET /swagger` - API documentation (development only)

#### Vulnerable Endpoints (For Testing Only)

- `GET /api/users/{id}` - SQL injection vulnerability
- `GET /api/files/{filename}` - Path traversal vulnerability
- `POST /api/auth/login` - Weak JWT secret
- `POST /api/profile` - Input validation issues
- `POST /api/payment` - Sensitive data logging
- `GET /api/debug/error` - Information disclosure
- `POST /api/deserialize` - Insecure deserialization
- `POST /api/execute` - Command injection

## Development

### Prerequisites

- .NET 8.0 SDK or later
- Visual Studio 2022, VS Code, or Rider (optional)

### Installation

```bash
dotnet restore
```

### Running

Development mode:
```bash
dotnet run
```

With watch mode (auto-reload):
```bash
dotnet watch run
```

### Building

```bash
dotnet build
```

Release build:
```bash
dotnet build -c Release
```

### Testing

```bash
dotnet test
```

## Security Scanning

### Local Scans

Check for vulnerable packages:
```bash
dotnet list package --vulnerable
```

With JSON output for automation:
```bash
dotnet list package --vulnerable --format json > ../../reports/dotnet-vulnerable.json
```

### Expected Scan Results

This application is designed to trigger the following types of findings:

1. **Secrets Scanning (Gitleaks)**
   - Hardcoded API keys
   - Embedded passwords
   - Connection strings with credentials

2. **SAST (CodeQL for C#)**
   - SQL injection (CWE-89)
   - Path traversal (CWE-22)
   - Command injection (CWE-78)
   - Hardcoded credentials (CWE-798)
   - Information exposure (CWE-200)
   - Weak cryptography (CWE-326)
   - Insecure deserialization (CWE-502)

3. **Dependency Vulnerabilities**
   - Varies based on NuGet package versions

4. **Container Scanning (Trivy)**
   - Base image vulnerabilities
   - Dependency vulnerabilities

## Docker

Build:
```bash
docker build -t devsecops-dotnet-api .
```

Run:
```bash
docker run -p 8080:8080 devsecops-dotnet-api
```

## Configuration

### Environment Variables

- `ASPNETCORE_ENVIRONMENT` - Environment (Development/Staging/Production)
- `ASPNETCORE_URLS` - URLs to bind (default: http://localhost:5000)
- `Logging__LogLevel__Default` - Log level

### appsettings.json

Configuration can be added to `appsettings.json` and `appsettings.Development.json` as needed.

## CI/CD Integration

This application is automatically scanned by the security gates pipeline defined in `.github/workflows/security-gates.yml`.

See the main [README.md](../../README.md) for details on the security pipeline.

## API Documentation

When running in Development mode, Swagger UI is available at:
- `https://localhost:5001/swagger`
- `http://localhost:5000/swagger`

## Project Structure

```
dotnet-api/
├── DevSecOps.Template.Api.csproj  # Project file
├── Program.cs                      # Application entry point
├── Dockerfile                      # Container definition
└── README.md                       # This file
```

## License

MIT - For demonstration and testing purposes only
