# DevSecOps .NET API - Multi-stage Dockerfile
# This Dockerfile demonstrates security best practices while being
# realistic enough to trigger container security scans.

# ============================================================================
# Stage 1: Build
# ============================================================================
FROM mcr.microsoft.com/dotnet/sdk:8.0 AS build

WORKDIR /src

# Copy project file
COPY ["DevSecOps.Template.Api.csproj", "./"]

# Restore dependencies
RUN dotnet restore "DevSecOps.Template.Api.csproj"

# Copy source code
COPY . .

# Build application
RUN dotnet build "DevSecOps.Template.Api.csproj" -c Release -o /app/build

# ============================================================================
# Stage 2: Publish
# ============================================================================
FROM build AS publish

RUN dotnet publish "DevSecOps.Template.Api.csproj" -c Release -o /app/publish /p:UseAppHost=false

# ============================================================================
# Stage 3: Runtime
# ============================================================================
FROM mcr.microsoft.com/dotnet/aspnet:8.0 AS runtime

WORKDIR /app

# Security: Create non-root user
RUN adduser --disabled-password --gecos '' --uid 1001 dotnetuser && \
    chown -R dotnetuser:dotnetuser /app

# Copy published application
COPY --from=publish --chown=dotnetuser:dotnetuser /app/publish .

# Switch to non-root user
USER dotnetuser

# Expose port
EXPOSE 8080

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
    CMD curl --fail http://localhost:8080/health || exit 1

# Environment variables
ENV ASPNETCORE_URLS=http://+:8080 \
    ASPNETCORE_ENVIRONMENT=Production \
    DOTNET_SYSTEM_GLOBALIZATION_INVARIANT=false

# Start application
ENTRYPOINT ["dotnet", "DevSecOps.Template.Api.dll"]

# ============================================================================
# INTENTIONAL ISSUES (For Testing Container Scanners)
# ============================================================================

# 1. Base image vulnerabilities (realistic scenario)
#    - Using official Microsoft .NET images which may have CVEs
#    - Scanners should detect OS-level and runtime vulnerabilities

# 2. Missing curl in runtime image for health check
#    - Health check will fail unless curl is installed
#    - Demonstrates configuration issues that scanners may catch

# 3. NuGet package vulnerabilities
#    - Dependencies may have known CVEs
#    - Container scanners should detect these

# Note: This Dockerfile follows security best practices (multi-stage build,
# non-root user, minimal runtime), but remains realistic enough that
# container scanners will identify security findings.
