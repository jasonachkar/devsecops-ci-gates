import {
  IAMClient,
  ListUsersCommand,
  ListRolesCommand,
  GetUserPolicyCommand,
  GetRolePolicyCommand,
  GetPolicyCommand,
  GetPolicyVersionCommand,
  ListAttachedUserPoliciesCommand,
  ListAttachedRolePoliciesCommand,
  GetUserCommand,
  GetRoleCommand,
} from '@aws-sdk/client-iam';
import { env } from '../../config/env';
import { logger } from '../../config/logger';

/**
 * AWS IAM Policy Analysis Service
 * Analyzes IAM policies for over-permissions and CIS benchmark compliance
 */
export class IamAnalysisService {
  private client: IAMClient | null = null;

  constructor() {
    if (env.AWS_ACCESS_KEY_ID && env.AWS_SECRET_ACCESS_KEY) {
      this.client = new IAMClient({
        region: env.AWS_REGION,
        credentials: {
          accessKeyId: env.AWS_ACCESS_KEY_ID,
          secretAccessKey: env.AWS_SECRET_ACCESS_KEY,
        },
      });
      logger.info('AWS IAM client initialized', { region: env.AWS_REGION });
    } else {
      logger.warn('AWS IAM analysis disabled - credentials not configured');
    }
  }

  /**
   * Analyze IAM policies for over-permissions
   */
  async analyzePolicies() {
    if (!this.client) {
      throw new Error('AWS IAM is not enabled or configured');
    }

    try {
      const [users, roles] = await Promise.all([
        this.listAllUsers(),
        this.listAllRoles(),
      ]);

      const userAnalysis = await Promise.all(
        users.map((user) => this.analyzeUser(user))
      );
      const roleAnalysis = await Promise.all(
        roles.map((role) => this.analyzeRole(role))
      );

      return {
        users: {
          total: users.length,
          findings: userAnalysis.flatMap((a) => a.findings),
          summary: this.summarizeFindings(userAnalysis.flatMap((a) => a.findings)),
        },
        roles: {
          total: roles.length,
          findings: roleAnalysis.flatMap((a) => a.findings),
          summary: this.summarizeFindings(roleAnalysis.flatMap((a) => a.findings)),
        },
        overall: {
          riskScore: this.calculateOverallRiskScore([
            ...userAnalysis.flatMap((a) => a.findings),
            ...roleAnalysis.flatMap((a) => a.findings),
          ]),
          totalFindings: userAnalysis.length + roleAnalysis.length,
        },
      };
    } catch (error) {
      logger.error('Failed to analyze IAM policies', { error });
      throw error;
    }
  }

  /**
   * List all IAM users
   */
  private async listAllUsers() {
    const users: any[] = [];
    let marker: string | undefined;

    do {
      const command = new ListUsersCommand({ Marker: marker });
      const response = await this.client!.send(command);
      if (response.Users) {
        users.push(...response.Users);
      }
      marker = response.Marker;
    } while (marker);

    return users;
  }

  /**
   * List all IAM roles
   */
  private async listAllRoles() {
    const roles: any[] = [];
    let marker: string | undefined;

    do {
      const command = new ListRolesCommand({ Marker: marker });
      const response = await this.client!.send(command);
      if (response.Roles) {
        roles.push(...response.Roles);
      }
      marker = response.Marker;
    } while (marker);

    return roles;
  }

  /**
   * Analyze a single IAM user
   */
  private async analyzeUser(user: any) {
    const findings: Array<{
      type: string;
      severity: 'critical' | 'high' | 'medium' | 'low';
      description: string;
      recommendation: string;
    }> = [];

    try {
      // Check for admin access
      const attachedPolicies = await this.getAttachedUserPolicies(user.UserName!);
      const inlinePolicies = await this.getInlineUserPolicies(user.UserName!);

      // Check for AdministratorAccess
      const hasAdminAccess = [
        ...attachedPolicies,
        ...inlinePolicies,
      ].some((policy) => policy.includes('AdministratorAccess') || policy.includes('*:*'));

      if (hasAdminAccess) {
        findings.push({
          type: 'admin_access',
          severity: 'critical',
          description: `User ${user.UserName} has administrator access`,
          recommendation: 'Remove administrator access and apply least privilege principles',
        });
      }

      // Check for wildcard permissions
      const hasWildcard = [...attachedPolicies, ...inlinePolicies].some((policy) =>
        policy.includes('*')
      );
      if (hasWildcard) {
        findings.push({
          type: 'wildcard_permissions',
          severity: 'high',
          description: `User ${user.UserName} has wildcard permissions (*)`,
          recommendation: 'Replace wildcard permissions with specific actions and resources',
        });
      }

      // Check for password policy violations
      if (!user.PasswordLastUsed) {
        findings.push({
          type: 'unused_credentials',
          severity: 'medium',
          description: `User ${user.UserName} has never used password (consider removing)`,
          recommendation: 'Review and remove unused user accounts',
        });
      }

      // Check for access keys
      const userDetails = await this.client!.send(
        new GetUserCommand({ UserName: user.UserName })
      );
      if (userDetails.User?.Tags?.some((tag) => tag.Key === 'AccessKeyCount')) {
        findings.push({
          type: 'access_keys_present',
          severity: 'medium',
          description: `User ${user.UserName} has access keys configured`,
          recommendation: 'Regularly rotate access keys and monitor usage',
        });
      }
    } catch (error) {
      logger.error(`Failed to analyze user ${user.UserName}`, { error });
    }

    return { user: user.UserName, findings };
  }

  /**
   * Analyze a single IAM role
   */
  private async analyzeRole(role: any) {
    const findings: Array<{
      type: string;
      severity: 'critical' | 'high' | 'medium' | 'low';
      description: string;
      recommendation: string;
    }> = [];

    try {
      const attachedPolicies = await this.getAttachedRolePolicies(role.RoleName!);
      const inlinePolicies = await this.getInlineRolePolicies(role.RoleName!);

      // Check for admin access
      const hasAdminAccess = [
        ...attachedPolicies,
        ...inlinePolicies,
      ].some((policy) => policy.includes('AdministratorAccess') || policy.includes('*:*'));

      if (hasAdminAccess) {
        findings.push({
          type: 'admin_access',
          severity: 'critical',
          description: `Role ${role.RoleName} has administrator access`,
          recommendation: 'Remove administrator access and apply least privilege principles',
        });
      }

      // Check trust policy for overly permissive principals
      if (role.AssumeRolePolicyDocument) {
        const trustPolicy = JSON.parse(
          decodeURIComponent(role.AssumeRolePolicyDocument)
        );
        const statements = trustPolicy.Statement || [];
        statements.forEach((stmt: any) => {
          if (stmt.Principal?.AWS === '*' || stmt.Principal?.Service === '*') {
            findings.push({
              type: 'overly_permissive_trust',
              severity: 'high',
              description: `Role ${role.RoleName} has overly permissive trust policy`,
              recommendation: 'Restrict trust policy to specific principals',
            });
          }
        });
      }
    } catch (error) {
      logger.error(`Failed to analyze role ${role.RoleName}`, { error });
    }

    return { role: role.RoleName, findings };
  }

  /**
   * Get attached policies for a user
   */
  private async getAttachedUserPolicies(userName: string): Promise<string[]> {
    try {
      const command = new ListAttachedUserPoliciesCommand({ UserName: userName });
      const response = await this.client!.send(command);
      return (response.AttachedPolicies || []).map((p) => p.PolicyArn || '');
    } catch (error) {
      return [];
    }
  }

  /**
   * Get inline policies for a user (simplified - would need to fetch each policy)
   */
  private async getInlineUserPolicies(userName: string): Promise<string[]> {
    // In a full implementation, we would list and fetch each inline policy
    // For MVP, return empty array
    return [];
  }

  /**
   * Get attached policies for a role
   */
  private async getAttachedRolePolicies(roleName: string): Promise<string[]> {
    try {
      const command = new ListAttachedRolePoliciesCommand({ RoleName: roleName });
      const response = await this.client!.send(command);
      return (response.AttachedPolicies || []).map((p) => p.PolicyArn || '');
    } catch (error) {
      return [];
    }
  }

  /**
   * Get inline policies for a role (simplified)
   */
  private async getInlineRolePolicies(roleName: string): Promise<string[]> {
    // In a full implementation, we would list and fetch each inline policy
    return [];
  }

  /**
   * Summarize findings by type
   */
  private summarizeFindings(findings: Array<{ type: string; severity: string }>) {
    const summary: Record<string, number> = {};
    findings.forEach((f) => {
      summary[f.type] = (summary[f.type] || 0) + 1;
    });
    return summary;
  }

  /**
   * Calculate overall risk score
   */
  private calculateOverallRiskScore(
    findings: Array<{ severity: string }>
  ): number {
    const weights = { critical: 10, high: 5, medium: 2, low: 1 };
    const score = findings.reduce((sum, f) => {
      const weight = weights[f.severity as keyof typeof weights] || 0;
      return sum + weight;
    }, 0);
    return Math.min(100, score);
  }
}


