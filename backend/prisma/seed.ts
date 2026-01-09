import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

/**
 * Database seed script
 * Creates comprehensive demo data showcasing real security findings
 * from popular vulnerable test applications (OWASP Juice Shop, NodeGoat, etc.)
 */
async function main() {
  console.log('🌱 Seeding database with comprehensive security demo data...');

  // ==========================================================================
  // REPOSITORIES - Real vulnerable test applications
  // ==========================================================================

  const repositories = await Promise.all([
    prisma.repository.upsert({
      where: { name_provider: { name: 'juice-shop', provider: 'github' } },
      update: {},
      create: {
        name: 'juice-shop',
        url: 'https://github.com/juice-shop/juice-shop',
        provider: 'github',
        description: 'OWASP Juice Shop - Intentionally insecure web application for security training',
        isActive: true,
      },
    }),
    prisma.repository.upsert({
      where: { name_provider: { name: 'nodegoat', provider: 'github' } },
      update: {},
      create: {
        name: 'nodegoat',
        url: 'https://github.com/OWASP/NodeGoat',
        provider: 'github',
        description: 'OWASP NodeGoat - Vulnerable Node.js application for learning',
        isActive: true,
      },
    }),
    prisma.repository.upsert({
      where: { name_provider: { name: 'vulnerable-aws-terraform', provider: 'github' } },
      update: {},
      create: {
        name: 'vulnerable-aws-terraform',
        url: 'https://github.com/bridgecrewio/terragoat',
        provider: 'github',
        description: 'Bridgecrew TerraGoat - Vulnerable Terraform configurations for IaC security testing',
        isActive: true,
      },
    }),
    prisma.repository.upsert({
      where: { name_provider: { name: 'devsecops-demo-api', provider: 'github' } },
      update: {},
      create: {
        name: 'devsecops-demo-api',
        url: 'https://github.com/your-org/devsecops-demo-api',
        provider: 'github',
        description: 'Internal API with DevSecOps security gates enabled',
        isActive: true,
      },
    }),
  ]);

  console.log(`✅ Created ${repositories.length} repositories`);

  // ==========================================================================
  // USERS
  // ==========================================================================

  const users = await Promise.all([
    prisma.user.upsert({
      where: { email: 'admin@devsecops.io' },
      update: {},
      create: {
        email: 'admin@devsecops.io',
        name: 'Security Admin',
        role: 'admin',
        isActive: true,
      },
    }),
    prisma.user.upsert({
      where: { email: 'engineer@devsecops.io' },
      update: {},
      create: {
        email: 'engineer@devsecops.io',
        name: 'DevSecOps Engineer',
        role: 'engineer',
        isActive: true,
      },
    }),
    prisma.user.upsert({
      where: { email: 'developer@devsecops.io' },
      update: {},
      create: {
        email: 'developer@devsecops.io',
        name: 'Full Stack Developer',
        role: 'developer',
        isActive: true,
      },
    }),
  ]);

  console.log(`✅ Created ${users.length} users`);

  // ==========================================================================
  // API KEYS
  // ==========================================================================

  for (const repo of repositories) {
    await prisma.apiKey.upsert({
      where: { key: `cicd-key-${repo.name}` },
      update: {},
      create: {
        key: `cicd-key-${repo.name}`,
        name: `CI/CD Key for ${repo.name}`,
        repositoryId: repo.id,
        isActive: true,
      },
    });
  }

  console.log('✅ Created API keys for all repositories');

  // ==========================================================================
  // SECURITY SCANS - Comprehensive scan history
  // ==========================================================================

  const juiceShop = repositories[0];
  const nodegoat = repositories[1];
  const terragoat = repositories[2];
  const demoApi = repositories[3];

  // Generate scan data for the past 30 days
  const now = new Date();
  const scans = [];

  // Juice Shop Scans - Many critical findings (as expected from vulnerable app)
  for (let i = 0; i < 15; i++) {
    const scanDate = new Date(now);
    scanDate.setDate(scanDate.getDate() - i * 2);

    const scan = await prisma.scan.create({
      data: {
        repositoryId: juiceShop.id,
        branch: i % 3 === 0 ? 'main' : 'develop',
        commitSha: generateCommitSha(),
        status: 'completed',
        gateStatus: i < 2 ? 'failed' : 'warning',
        totalFindings: 45 - i * 2,
        criticalCount: Math.max(0, 8 - Math.floor(i / 2)),
        highCount: Math.max(0, 12 - Math.floor(i / 3)),
        mediumCount: 15 - Math.floor(i / 4),
        lowCount: 10 - Math.floor(i / 5),
        infoCount: 2,
        createdAt: scanDate,
        completedAt: new Date(scanDate.getTime() + 180000), // 3 min later
      },
    });
    scans.push(scan);
  }

  // NodeGoat Scans
  for (let i = 0; i < 10; i++) {
    const scanDate = new Date(now);
    scanDate.setDate(scanDate.getDate() - i * 3);

    const scan = await prisma.scan.create({
      data: {
        repositoryId: nodegoat.id,
        branch: 'main',
        commitSha: generateCommitSha(),
        status: 'completed',
        gateStatus: i < 3 ? 'failed' : 'warning',
        totalFindings: 32 - i * 2,
        criticalCount: Math.max(0, 5 - Math.floor(i / 2)),
        highCount: Math.max(0, 8 - Math.floor(i / 2)),
        mediumCount: 12 - Math.floor(i / 3),
        lowCount: 7 - Math.floor(i / 4),
        infoCount: 1,
        createdAt: scanDate,
        completedAt: new Date(scanDate.getTime() + 120000),
      },
    });
    scans.push(scan);
  }

  // TerraGoat Scans (IaC vulnerabilities)
  for (let i = 0; i < 8; i++) {
    const scanDate = new Date(now);
    scanDate.setDate(scanDate.getDate() - i * 4);

    const scan = await prisma.scan.create({
      data: {
        repositoryId: terragoat.id,
        branch: 'main',
        commitSha: generateCommitSha(),
        status: 'completed',
        gateStatus: i < 2 ? 'failed' : 'warning',
        totalFindings: 28 - i * 2,
        criticalCount: Math.max(0, 3 - Math.floor(i / 3)),
        highCount: Math.max(0, 6 - Math.floor(i / 2)),
        mediumCount: 10 - Math.floor(i / 2),
        lowCount: 9 - Math.floor(i / 3),
        infoCount: 3,
        createdAt: scanDate,
        completedAt: new Date(scanDate.getTime() + 90000),
      },
    });
    scans.push(scan);
  }

  // Demo API Scans - Clean (well-secured)
  for (let i = 0; i < 12; i++) {
    const scanDate = new Date(now);
    scanDate.setDate(scanDate.getDate() - i * 2);

    const scan = await prisma.scan.create({
      data: {
        repositoryId: demoApi.id,
        branch: i % 4 === 0 ? 'main' : i % 4 === 1 ? 'develop' : `feature/sprint-${Math.floor(i / 4) + 1}`,
        commitSha: generateCommitSha(),
        status: 'completed',
        gateStatus: 'passed',
        totalFindings: Math.max(0, 5 - Math.floor(i / 3)),
        criticalCount: 0,
        highCount: 0,
        mediumCount: Math.min(2, Math.max(0, 2 - Math.floor(i / 4))),
        lowCount: Math.min(3, Math.max(0, 3 - Math.floor(i / 4))),
        infoCount: 1,
        createdAt: scanDate,
        completedAt: new Date(scanDate.getTime() + 150000),
      },
    });
    scans.push(scan);
  }

  console.log(`✅ Created ${scans.length} security scans`);

  // ==========================================================================
  // SECURITY FINDINGS - Real CVEs and CWEs from vulnerable apps
  // ==========================================================================

  const latestJuiceShopScan = scans[0];
  const latestNodeGoatScan = scans[15];
  const latestTerraGoatScan = scans[25];
  const latestDemoApiScan = scans[33];

  // Juice Shop Findings (OWASP Top 10 vulnerabilities)
  const juiceShopFindings = [
    // SAST - SQL Injection
    {
      tool: 'codeql',
      category: 'sast',
      severity: 'critical',
      ruleId: 'js/sql-injection',
      title: 'SQL Injection vulnerability in search query',
      filePath: 'routes/search.js',
      lineNumber: 42,
      cwe: 'CWE-89',
      cvssScore: 9.8,
      message: 'User input is concatenated directly into SQL query without sanitization, allowing SQL injection attacks.',
      status: 'open',
    },
    {
      tool: 'codeql',
      category: 'sast',
      severity: 'critical',
      ruleId: 'js/xss-through-dom',
      title: 'DOM-based Cross-Site Scripting (XSS)',
      filePath: 'frontend/src/app/search-result/search-result.component.ts',
      lineNumber: 87,
      cwe: 'CWE-79',
      cvssScore: 8.2,
      message: 'User-controlled data is written to the DOM without proper encoding, enabling XSS attacks.',
      status: 'open',
    },
    {
      tool: 'semgrep',
      category: 'sast',
      severity: 'high',
      ruleId: 'javascript.express.security.audit.xss.mustache.var-in-href',
      title: 'Potential XSS in href attribute',
      filePath: 'views/userProfile.pug',
      lineNumber: 15,
      cwe: 'CWE-79',
      cvssScore: 7.5,
      message: 'User input used in href attribute without proper URL encoding.',
      status: 'open',
    },
    {
      tool: 'codeql',
      category: 'sast',
      severity: 'high',
      ruleId: 'js/insecure-randomness',
      title: 'Use of cryptographically weak PRNG for security',
      filePath: 'lib/utils.js',
      lineNumber: 23,
      cwe: 'CWE-330',
      cvssScore: 7.0,
      message: 'Math.random() used for security-sensitive operation. Use crypto.randomBytes() instead.',
      status: 'open',
    },
    // Secrets Detection
    {
      tool: 'gitleaks',
      category: 'secrets',
      severity: 'critical',
      ruleId: 'aws-access-key-id',
      title: 'AWS Access Key ID detected',
      filePath: 'config/cloud.js',
      lineNumber: 8,
      cwe: 'CWE-798',
      cvssScore: 9.1,
      message: 'Hardcoded AWS access key found in source code. This credential should be rotated immediately.',
      status: 'open',
    },
    {
      tool: 'gitleaks',
      category: 'secrets',
      severity: 'critical',
      ruleId: 'jwt-secret',
      title: 'JWT Secret Key hardcoded',
      filePath: 'lib/insecurity.js',
      lineNumber: 12,
      cwe: 'CWE-798',
      cvssScore: 9.0,
      message: 'JWT signing secret is hardcoded. Move to environment variable or secrets manager.',
      status: 'open',
    },
    // Dependency Vulnerabilities
    {
      tool: 'trivy',
      category: 'sca',
      severity: 'critical',
      ruleId: 'CVE-2021-3807',
      title: 'ansi-regex: Inefficient Regular Expression Complexity',
      filePath: 'package-lock.json',
      lineNumber: 1245,
      cwe: 'CWE-1333',
      cvssScore: 7.5,
      message: 'ansi-regex < 5.0.1 is vulnerable to Regular Expression Denial of Service (ReDoS).',
      status: 'open',
    },
    {
      tool: 'npm-audit',
      category: 'sca',
      severity: 'high',
      ruleId: 'CVE-2022-25883',
      title: 'semver: Regular Expression Denial of Service',
      filePath: 'package.json',
      lineNumber: 45,
      cwe: 'CWE-1333',
      cvssScore: 7.5,
      message: 'Versions of semver vulnerable to ReDoS when parsing long version strings.',
      status: 'open',
    },
    {
      tool: 'npm-audit',
      category: 'sca',
      severity: 'high',
      ruleId: 'CVE-2023-26136',
      title: 'tough-cookie: Prototype Pollution',
      filePath: 'package.json',
      lineNumber: 52,
      cwe: 'CWE-1321',
      cvssScore: 6.5,
      message: 'tough-cookie < 4.1.3 allows prototype pollution via rejectPublicSuffixes.',
      status: 'open',
    },
    // Medium Severity
    {
      tool: 'codeql',
      category: 'sast',
      severity: 'medium',
      ruleId: 'js/path-injection',
      title: 'Potential path traversal in file operations',
      filePath: 'routes/fileUpload.js',
      lineNumber: 78,
      cwe: 'CWE-22',
      cvssScore: 6.5,
      message: 'User input used in file path without sanitization may allow path traversal.',
      status: 'open',
    },
    {
      tool: 'semgrep',
      category: 'sast',
      severity: 'medium',
      ruleId: 'javascript.lang.security.audit.vm-injection',
      title: 'Potential code injection through vm module',
      filePath: 'routes/b2bOrder.js',
      lineNumber: 34,
      cwe: 'CWE-94',
      cvssScore: 6.3,
      message: 'User input passed to vm.runInNewContext() could lead to code injection.',
      status: 'open',
    },
    {
      tool: 'codeql',
      category: 'sast',
      severity: 'medium',
      ruleId: 'js/missing-rate-limiting',
      title: 'Authentication endpoint lacks rate limiting',
      filePath: 'routes/login.js',
      lineNumber: 12,
      cwe: 'CWE-307',
      cvssScore: 5.9,
      message: 'Login endpoint does not implement rate limiting, vulnerable to brute force attacks.',
      status: 'open',
    },
  ];

  // NodeGoat Findings
  const nodeGoatFindings = [
    {
      tool: 'codeql',
      category: 'sast',
      severity: 'critical',
      ruleId: 'js/nosql-injection',
      title: 'NoSQL Injection in MongoDB query',
      filePath: 'app/routes/contributions.js',
      lineNumber: 56,
      cwe: 'CWE-943',
      cvssScore: 9.4,
      message: 'User input directly used in MongoDB query allows NoSQL injection.',
      status: 'open',
    },
    {
      tool: 'semgrep',
      category: 'sast',
      severity: 'critical',
      ruleId: 'javascript.express.security.express-vm2-injection',
      title: 'Command Injection via eval()',
      filePath: 'app/routes/benefits.js',
      lineNumber: 23,
      cwe: 'CWE-94',
      cvssScore: 9.8,
      message: 'User input passed to eval() function allows arbitrary code execution.',
      status: 'open',
    },
    {
      tool: 'codeql',
      category: 'sast',
      severity: 'high',
      ruleId: 'js/insecure-deserialization',
      title: 'Insecure deserialization of user data',
      filePath: 'app/routes/session.js',
      lineNumber: 89,
      cwe: 'CWE-502',
      cvssScore: 8.1,
      message: 'Unvalidated data passed to unserialize() may lead to remote code execution.',
      status: 'open',
    },
    {
      tool: 'gitleaks',
      category: 'secrets',
      severity: 'critical',
      ruleId: 'mongodb-connection-string',
      title: 'MongoDB connection string with credentials',
      filePath: 'config/config.js',
      lineNumber: 5,
      cwe: 'CWE-798',
      cvssScore: 8.5,
      message: 'Database credentials hardcoded in connection string.',
      status: 'open',
    },
    {
      tool: 'npm-audit',
      category: 'sca',
      severity: 'high',
      ruleId: 'CVE-2024-21538',
      title: 'cross-spawn: Regular Expression Denial of Service',
      filePath: 'package.json',
      lineNumber: 28,
      cwe: 'CWE-1333',
      cvssScore: 7.5,
      message: 'Vulnerable version of cross-spawn allows ReDoS attacks.',
      status: 'open',
    },
  ];

  // TerraGoat Findings (IaC Security)
  const terraGoatFindings = [
    {
      tool: 'checkov',
      category: 'iac',
      severity: 'critical',
      ruleId: 'CKV_AWS_20',
      title: 'S3 Bucket has public access enabled',
      filePath: 'aws/s3.tf',
      lineNumber: 15,
      cwe: 'CWE-284',
      cvssScore: 9.1,
      message: 'S3 bucket ACL allows public read access, exposing sensitive data.',
      status: 'open',
    },
    {
      tool: 'checkov',
      category: 'iac',
      severity: 'critical',
      ruleId: 'CKV_AWS_24',
      title: 'Security group allows unrestricted SSH access',
      filePath: 'aws/ec2.tf',
      lineNumber: 42,
      cwe: 'CWE-284',
      cvssScore: 8.6,
      message: 'Security group ingress rule allows SSH (port 22) from 0.0.0.0/0.',
      status: 'open',
    },
    {
      tool: 'checkov',
      category: 'iac',
      severity: 'high',
      ruleId: 'CKV_AWS_19',
      title: 'EBS volume not encrypted',
      filePath: 'aws/ec2.tf',
      lineNumber: 28,
      cwe: 'CWE-311',
      cvssScore: 7.2,
      message: 'EBS volume does not have encryption enabled for data at rest.',
      status: 'open',
    },
    {
      tool: 'checkov',
      category: 'iac',
      severity: 'high',
      ruleId: 'CKV_AWS_17',
      title: 'RDS instance is publicly accessible',
      filePath: 'aws/rds.tf',
      lineNumber: 12,
      cwe: 'CWE-284',
      cvssScore: 7.5,
      message: 'RDS database instance has publicly_accessible set to true.',
      status: 'open',
    },
    {
      tool: 'checkov',
      category: 'iac',
      severity: 'medium',
      ruleId: 'CKV_AWS_18',
      title: 'S3 bucket does not have access logging enabled',
      filePath: 'aws/s3.tf',
      lineNumber: 8,
      cwe: 'CWE-778',
      cvssScore: 5.3,
      message: 'S3 bucket logging should be enabled for audit trail.',
      status: 'open',
    },
    {
      tool: 'checkov',
      category: 'iac',
      severity: 'medium',
      ruleId: 'CKV_AWS_52',
      title: 'Lambda function does not have X-Ray tracing enabled',
      filePath: 'aws/lambda.tf',
      lineNumber: 35,
      cwe: 'CWE-778',
      cvssScore: 3.7,
      message: 'Enable X-Ray tracing for better observability.',
      status: 'open',
    },
  ];

  // Demo API Findings (minimal - well-secured)
  const demoApiFindings = [
    {
      tool: 'npm-audit',
      category: 'sca',
      severity: 'low',
      ruleId: 'CVE-2024-4067',
      title: 'micromatch: Regular Expression Denial of Service',
      filePath: 'package.json',
      lineNumber: 38,
      cwe: 'CWE-1333',
      cvssScore: 3.1,
      message: 'Low severity ReDoS in micromatch. Consider upgrading when convenient.',
      status: 'open',
    },
    {
      tool: 'codeql',
      category: 'sast',
      severity: 'info',
      ruleId: 'js/unused-local-variable',
      title: 'Unused variable in error handler',
      filePath: 'src/middleware/errorHandler.ts',
      lineNumber: 12,
      cwe: null,
      cvssScore: null,
      message: 'Variable "originalError" is declared but never used.',
      status: 'open',
    },
  ];

  // Insert all findings
  const findingsToCreate = [
    ...juiceShopFindings.map(f => ({ ...f, scanId: latestJuiceShopScan.id })),
    ...nodeGoatFindings.map(f => ({ ...f, scanId: latestNodeGoatScan.id })),
    ...terraGoatFindings.map(f => ({ ...f, scanId: latestTerraGoatScan.id })),
    ...demoApiFindings.map(f => ({ ...f, scanId: latestDemoApiScan.id })),
  ];

  for (const finding of findingsToCreate) {
    await prisma.finding.create({
      data: {
        ...finding,
        fingerprint: generateFingerprint(finding),
      },
    });
  }

  console.log(`✅ Created ${findingsToCreate.length} security findings`);

  // ==========================================================================
  // SCAN TRENDS - Historical aggregation
  // ==========================================================================

  for (const repo of repositories) {
    for (let i = 0; i < 30; i++) {
      const date = new Date(now);
      date.setDate(date.getDate() - i);
      date.setHours(0, 0, 0, 0);

      // Simulate improving trends over time
      const baseMultiplier = repo.name === 'juice-shop' ? 3 : repo.name === 'nodegoat' ? 2 : repo.name === 'vulnerable-aws-terraform' ? 1.5 : 0.2;
      const improvementFactor = 1 - (i * 0.015); // Gradual improvement

      await prisma.scanTrend.upsert({
        where: {
          repositoryId_date: {
            repositoryId: repo.id,
            date: date,
          },
        },
        update: {},
        create: {
          repositoryId: repo.id,
          date: date,
          totalFindings: Math.round(35 * baseMultiplier * improvementFactor),
          criticalCount: Math.round(5 * baseMultiplier * improvementFactor),
          highCount: Math.round(10 * baseMultiplier * improvementFactor),
          mediumCount: Math.round(12 * baseMultiplier * improvementFactor),
          lowCount: Math.round(8 * baseMultiplier * improvementFactor),
          scanCount: Math.floor(Math.random() * 3) + 1,
        },
      });
    }
  }

  console.log('✅ Created 30 days of scan trend data');

  // ==========================================================================
  // COMPLIANCE MAPPINGS
  // ==========================================================================

  const complianceMappings = [
    { framework: 'OWASP Top 10 2021', controlId: 'A01:2021', controlName: 'Broken Access Control', cweIds: ['CWE-284', 'CWE-285', 'CWE-639'] },
    { framework: 'OWASP Top 10 2021', controlId: 'A02:2021', controlName: 'Cryptographic Failures', cweIds: ['CWE-311', 'CWE-327', 'CWE-330'] },
    { framework: 'OWASP Top 10 2021', controlId: 'A03:2021', controlName: 'Injection', cweIds: ['CWE-89', 'CWE-79', 'CWE-94', 'CWE-943'] },
    { framework: 'OWASP Top 10 2021', controlId: 'A04:2021', controlName: 'Insecure Design', cweIds: ['CWE-307', 'CWE-522'] },
    { framework: 'OWASP Top 10 2021', controlId: 'A05:2021', controlName: 'Security Misconfiguration', cweIds: ['CWE-16', 'CWE-778'] },
    { framework: 'OWASP Top 10 2021', controlId: 'A06:2021', controlName: 'Vulnerable Components', cweIds: ['CWE-1321', 'CWE-1333'] },
    { framework: 'OWASP Top 10 2021', controlId: 'A07:2021', controlName: 'Auth Failures', cweIds: ['CWE-287', 'CWE-798'] },
    { framework: 'OWASP Top 10 2021', controlId: 'A08:2021', controlName: 'Software Integrity Failures', cweIds: ['CWE-502', 'CWE-829'] },
    { framework: 'OWASP Top 10 2021', controlId: 'A09:2021', controlName: 'Logging Failures', cweIds: ['CWE-778', 'CWE-117'] },
    { framework: 'OWASP Top 10 2021', controlId: 'A10:2021', controlName: 'SSRF', cweIds: ['CWE-918'] },
    { framework: 'CIS AWS v1.4', controlId: '2.1.1', controlName: 'Ensure S3 buckets not publicly accessible', cweIds: ['CWE-284'] },
    { framework: 'CIS AWS v1.4', controlId: '4.1', controlName: 'Ensure SSH is not open to 0.0.0.0/0', cweIds: ['CWE-284'] },
    { framework: 'CIS AWS v1.4', controlId: '2.1.5', controlName: 'Ensure S3 access logging is enabled', cweIds: ['CWE-778'] },
    { framework: 'PCI DSS 4.0', controlId: '6.2.4', controlName: 'Software Development - Injection Prevention', cweIds: ['CWE-89', 'CWE-79'] },
    { framework: 'PCI DSS 4.0', controlId: '3.5.1', controlName: 'Protect Stored Account Data', cweIds: ['CWE-311', 'CWE-798'] },
  ];

  for (const mapping of complianceMappings) {
    await prisma.complianceMapping.upsert({
      where: {
        framework_controlId: {
          framework: mapping.framework,
          controlId: mapping.controlId,
        },
      },
      update: {},
      create: mapping,
    });
  }

  console.log(`✅ Created ${complianceMappings.length} compliance mappings`);

  console.log('\n✨ Database seeding completed successfully!');
  console.log('=====================================');
  console.log(`📁 Repositories: ${repositories.length}`);
  console.log(`👥 Users: ${users.length}`);
  console.log(`🔍 Scans: ${scans.length}`);
  console.log(`🚨 Findings: ${findingsToCreate.length}`);
  console.log(`📊 Trend data: 30 days x ${repositories.length} repos`);
  console.log(`📋 Compliance mappings: ${complianceMappings.length}`);
}

// Helpers
function generateCommitSha(): string {
  return [...Array(40)].map(() => Math.floor(Math.random() * 16).toString(16)).join('');
}

function generateFingerprint(finding: any): string {
  const data = `${finding.tool}-${finding.ruleId}-${finding.filePath}-${finding.lineNumber}`;
  return Buffer.from(data).toString('base64').slice(0, 32);
}

main()
  .catch((e) => {
    console.error('❌ Seeding failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
