/**
 * DevSecOps Sample .NET 8 Web API
 *
 * This is a minimal API demonstrating security patterns and intentionally
 * includes some security anti-patterns for testing security scanners.
 *
 * SECURITY NOTE: This code is for demonstration purposes only.
 * Some patterns here are intentionally insecure to trigger security scans.
 */

using Microsoft.AspNetCore.Mvc;
using Microsoft.IdentityModel.Tokens;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
using System.Data;
using System.Data.SqlClient;
using Serilog;

var builder = WebApplication.CreateBuilder(args);

// ============================================================================
// Logging Configuration
// ============================================================================

Log.Logger = new LoggerConfiguration()
    .WriteTo.Console()
    .CreateLogger();

builder.Host.UseSerilog();

// ============================================================================
// Service Configuration
// ============================================================================

builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

// CORS
builder.Services.AddCors(options =>
{
    options.AddDefaultPolicy(policy =>
    {
        policy.WithOrigins("http://localhost:3000", "https://localhost:5001")
              .AllowAnyHeader()
              .AllowAnyMethod();
    });
});

// Rate limiting (production would use more sophisticated approach)
builder.Services.AddMemoryCache();

var app = builder.Build();

// ============================================================================
// Middleware Pipeline
// ============================================================================

if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

app.UseHttpsRedirection();
app.UseCors();

// ============================================================================
// Endpoints
// ============================================================================

// Root endpoint
app.MapGet("/", () => new
{
    Service = "DevSecOps .NET Sample API",
    Version = "1.0.0",
    Status = "running",
    Timestamp = DateTime.UtcNow
})
.WithName("GetRoot")
.WithOpenApi();

// Health check endpoints
app.MapGet("/health", () => new
{
    Status = "healthy",
    Timestamp = DateTime.UtcNow
})
.WithName("HealthCheck")
.WithOpenApi();

app.MapGet("/health/detailed", () => new
{
    Status = "healthy",
    Timestamp = DateTime.UtcNow,
    Uptime = Environment.TickCount64 / 1000.0,
    Version = "1.0.0",
    Environment = app.Environment.EnvironmentName
})
.WithName("DetailedHealth")
.WithOpenApi();

// ============================================================================
// INTENTIONAL SECURITY ISSUES (For Testing Scanners)
// ============================================================================

/**
 * SECURITY ISSUE: Hardcoded credentials (should trigger SAST/secrets scanning)
 * Fix: Use configuration and secret management (Azure Key Vault, etc.)
 */
const string HardcodedApiKey = "AKIAIOSFODNN7EXAMPLE"; // AWS-like key for testing
const string HardcodedPassword = "P@ssw0rd123!"; // Intentionally bad
const string ConnectionString = "Server=localhost;Database=testdb;User Id=sa;Password=Secret123!;"; // Bad

/**
 * SECURITY ISSUE: SQL Injection vulnerability (should trigger SAST)
 * Fix: Use parameterized queries or Entity Framework
 */
app.MapGet("/api/users/{id}", (string id) =>
{
    // VULNERABLE: SQL injection through string concatenation
    var query = $"SELECT * FROM Users WHERE Id = '{id}'"; // Bad!

    // This is demonstration only - not actually executing
    return Results.Json(new
    {
        Warning = "This endpoint demonstrates SQL injection vulnerability",
        VulnerableQuery = query,
        Fix = "Use parameterized queries or ORM like Entity Framework"
    });
})
.WithName("GetUserById")
.WithOpenApi();

/**
 * SECURITY ISSUE: Path traversal vulnerability (should trigger SAST)
 * Fix: Validate and sanitize file paths
 */
app.MapGet("/api/files/{filename}", (string filename) =>
{
    // VULNERABLE: Path traversal
    var filePath = $"/var/data/{filename}"; // Bad: No validation

    return Results.Json(new
    {
        Warning = "This endpoint demonstrates path traversal vulnerability",
        AttemptedPath = filePath,
        Fix = "Validate file paths and use Path.GetFullPath with allowlist"
    });
})
.WithName("GetFile")
.WithOpenApi();

/**
 * SECURITY ISSUE: Weak JWT secret and insecure token generation
 * Fix: Use strong, randomly generated secrets from configuration
 */
app.MapPost("/api/auth/login", ([FromBody] LoginRequest request) =>
{
    if (string.IsNullOrEmpty(request.Username) || string.IsNullOrEmpty(request.Password))
    {
        return Results.BadRequest(new { Error = "Username and password required" });
    }

    // VULNERABLE: Weak secret and hardcoded
    var secretKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes("weak-secret-key-123")); // Bad!
    var credentials = new SigningCredentials(secretKey, SecurityAlgorithms.HmacSha256);

    var claims = new[]
    {
        new Claim(ClaimTypes.Name, request.Username),
        new Claim(ClaimTypes.Role, "User")
    };

    var token = new JwtSecurityToken(
        issuer: "devsecops-api",
        audience: "devsecops-client",
        claims: claims,
        expires: DateTime.Now.AddHours(1),
        signingCredentials: credentials
    );

    var tokenString = new JwtSecurityTokenHandler().WriteToken(token);

    return Results.Json(new
    {
        Token = tokenString,
        Warning = "This uses a weak JWT secret for demonstration only"
    });
})
.WithName("Login")
.WithOpenApi();

/**
 * SECURITY ISSUE: Insufficient input validation
 * Fix: Validate all inputs with strong validation rules
 */
app.MapPost("/api/profile", ([FromBody] ProfileRequest profile) =>
{
    // VULNERABLE: No input validation
    // Should validate email format, age range, etc.

    return Results.Json(new
    {
        Warning = "This endpoint lacks input validation",
        Received = profile,
        Fix = "Implement comprehensive input validation with FluentValidation or DataAnnotations"
    });
})
.WithName("UpdateProfile")
.WithOpenApi();

/**
 * SECURITY ISSUE: Sensitive data exposure in logs
 * Fix: Never log sensitive information
 */
app.MapPost("/api/payment", ([FromBody] PaymentRequest payment) =>
{
    // VULNERABLE: Logging sensitive data
    Log.Information("Processing payment for card: {CardNumber}", payment.CardNumber); // Bad!

    return Results.Json(new
    {
        Warning = "This endpoint logs sensitive data",
        Fix = "Never log PII, credentials, or payment information"
    });
})
.WithName("ProcessPayment")
.WithOpenApi();

/**
 * SECURITY ISSUE: Information disclosure through error messages
 * Fix: Return generic error messages, log details server-side
 */
app.MapGet("/api/debug/error", () =>
{
    try
    {
        throw new Exception("Internal system error with sensitive info: " + ConnectionString);
    }
    catch (Exception ex)
    {
        // VULNERABLE: Exposing stack trace and sensitive info
        return Results.Json(new
        {
            Error = ex.Message,
            StackTrace = ex.StackTrace, // Bad!
            ConnectionString = ConnectionString // Very bad!
        });
    }
})
.WithName("DebugError")
.WithOpenApi();

/**
 * SECURITY ISSUE: Insecure deserialization (should trigger SAST)
 * Fix: Validate input and use safe deserialization settings
 */
app.MapPost("/api/deserialize", ([FromBody] string data) =>
{
    // In real code, this would use BinaryFormatter or similar (insecure)
    // We're just demonstrating the pattern

    return Results.Json(new
    {
        Warning = "Deserialization of untrusted data is dangerous",
        Fix = "Use safe serialization formats (JSON) with strict type validation"
    });
})
.WithName("Deserialize")
.WithOpenApi();

/**
 * SECURITY ISSUE: Command injection vulnerability
 * Fix: Avoid shell execution, use safe APIs
 */
app.MapPost("/api/execute", ([FromBody] CommandRequest request) =>
{
    // VULNERABLE: Command injection (demonstration only - not actually executing)
    // var process = Process.Start("cmd.exe", $"/c {request.Command}"); // Never do this!

    return Results.Json(new
    {
        Warning = "Command injection vulnerability",
        ReceivedCommand = request.Command,
        Fix = "Avoid shell execution, validate input, use safe APIs"
    });
})
.WithName("ExecuteCommand")
.WithOpenApi();

// ============================================================================
// Request Models
// ============================================================================

record LoginRequest(string Username, string Password);
record ProfileRequest(string Email, int Age, string Bio);
record PaymentRequest(string CardNumber, string CVV, decimal Amount);
record CommandRequest(string Command);

// ============================================================================
// Application Startup
// ============================================================================

app.Run();

Log.Information("🚀 .NET API started");
Log.Warning("⚠️  WARNING: This API contains intentional security vulnerabilities");
Log.Warning("   for demonstration purposes. DO NOT use in production!");
