import {
  CloudTrailClient,
  LookupEventsCommand,
  Event,
} from '@aws-sdk/client-cloudtrail';
import { env } from '../../config/env';
import { logger } from '../../config/logger';
import { prisma } from '../../config/database';

/**
 * AWS CloudTrail Analysis Service
 * Analyzes CloudTrail logs for suspicious activity and security events
 */
export class CloudTrailService {
  private client: CloudTrailClient | null = null;

  constructor() {
    if (env.AWS_ACCESS_KEY_ID && env.AWS_SECRET_ACCESS_KEY) {
      this.client = new CloudTrailClient({
        region: env.AWS_REGION,
        credentials: {
          accessKeyId: env.AWS_ACCESS_KEY_ID,
          secretAccessKey: env.AWS_SECRET_ACCESS_KEY,
        },
      });
      logger.info('AWS CloudTrail client initialized', { region: env.AWS_REGION });
    } else {
      logger.warn('AWS CloudTrail disabled - credentials not configured');
    }
  }

  /**
   * Analyze CloudTrail events for suspicious activity
   */
  async analyzeEvents(filters: {
    startTime?: Date;
    endTime?: Date;
    eventName?: string;
    username?: string;
    awsAccountId?: string;
  }) {
    if (!this.client) {
      throw new Error('AWS CloudTrail is not enabled or configured');
    }

    try {
      const { startTime, endTime, eventName, username, awsAccountId } = filters;

      const lookupAttributes: any[] = [];

      if (eventName) {
        lookupAttributes.push({
          AttributeKey: 'EventName',
          AttributeValue: eventName,
        });
      }

      if (username) {
        lookupAttributes.push({
          AttributeKey: 'Username',
          AttributeValue: username,
        });
      }

      const events: Event[] = [];
      let nextToken: string | undefined;

      do {
        const command = new LookupEventsCommand({
          LookupAttributes: lookupAttributes.length > 0 ? lookupAttributes : undefined,
          StartTime: startTime,
          EndTime: endTime,
          MaxResults: 50,
          NextToken: nextToken,
        });

        const response = await this.client.send(command);
        if (response.Events) {
          events.push(...response.Events);
        }
        nextToken = response.NextToken;
      } while (nextToken);

      // Analyze events for suspicious patterns
      const analysis = this.analyzeSuspiciousPatterns(events, awsAccountId);

      return {
        totalEvents: events.length,
        analysis,
        events: events.slice(0, 100), // Return first 100 for preview
      };
    } catch (error) {
      logger.error('Failed to analyze CloudTrail events', { error });
      throw error;
    }
  }

  /**
   * Detect suspicious patterns in CloudTrail events
   */
  private analyzeSuspiciousPatterns(events: Event[], awsAccountId?: string) {
    const suspicious: Array<{
      type: string;
      severity: 'critical' | 'high' | 'medium' | 'low';
      description: string;
      count: number;
      examples: Event[];
    }> = [];

    // Failed authentication attempts
    const failedAuth = events.filter(
      (e) =>
        e.EventName?.includes('Login') ||
        e.EventName?.includes('Authenticate') ||
        (e.EventName?.includes('AssumeRole') && e.CloudTrailEvent?.includes('error'))
    );
    if (failedAuth.length > 0) {
      suspicious.push({
        type: 'failed_authentication',
        severity: failedAuth.length > 10 ? 'high' : 'medium',
        description: `${failedAuth.length} failed authentication attempts detected`,
        count: failedAuth.length,
        examples: failedAuth.slice(0, 5),
      });
    }

    // Privilege escalation attempts
    const privilegeEscalation = events.filter(
      (e) =>
        e.EventName?.includes('PutUserPolicy') ||
        e.EventName?.includes('AttachUserPolicy') ||
        e.EventName?.includes('CreateRole') ||
        e.EventName?.includes('UpdateAssumeRolePolicy')
    );
    if (privilegeEscalation.length > 0) {
      suspicious.push({
        type: 'privilege_escalation',
        severity: 'high',
        description: `${privilegeEscalation.length} potential privilege escalation attempts`,
        count: privilegeEscalation.length,
        examples: privilegeEscalation.slice(0, 5),
      });
    }

    // Unusual API calls (outside business hours)
    const unusualHours = events.filter((e) => {
      if (!e.EventTime) return false;
      const hour = new Date(e.EventTime).getHours();
      return hour < 6 || hour > 22; // Outside 6 AM - 10 PM
    });
    if (unusualHours.length > 0) {
      suspicious.push({
        type: 'unusual_hours',
        severity: 'medium',
        description: `${unusualHours.length} API calls outside business hours`,
        count: unusualHours.length,
        examples: unusualHours.slice(0, 5),
      });
    }

    // Resource creation outside normal patterns
    const resourceCreation = events.filter(
      (e) =>
        e.EventName?.includes('Create') &&
        (e.EventName?.includes('Instance') ||
          e.EventName?.includes('Bucket') ||
          e.EventName?.includes('Database') ||
          e.EventName?.includes('Function'))
    );
    if (resourceCreation.length > 10) {
      suspicious.push({
        type: 'excessive_resource_creation',
        severity: 'medium',
        description: `${resourceCreation.length} resources created (potential sprawl)`,
        count: resourceCreation.length,
        examples: resourceCreation.slice(0, 5),
      });
    }

    // S3 bucket policy changes
    const s3PolicyChanges = events.filter(
      (e) =>
        e.EventName?.includes('PutBucketPolicy') ||
        e.EventName?.includes('PutBucketAcl') ||
        e.EventName?.includes('PutBucketPublicAccessBlock')
    );
    if (s3PolicyChanges.length > 0) {
      suspicious.push({
        type: 's3_policy_changes',
        severity: 'high',
        description: `${s3PolicyChanges.length} S3 bucket policy changes detected`,
        count: s3PolicyChanges.length,
        examples: s3PolicyChanges.slice(0, 5),
      });
    }

    // Security group changes
    const securityGroupChanges = events.filter(
      (e) =>
        e.EventName?.includes('AuthorizeSecurityGroup') ||
        e.EventName?.includes('RevokeSecurityGroup') ||
        e.EventName?.includes('ModifySecurityGroup')
    );
    if (securityGroupChanges.length > 0) {
      suspicious.push({
        type: 'security_group_changes',
        severity: 'high',
        description: `${securityGroupChanges.length} security group changes detected`,
        count: securityGroupChanges.length,
        examples: securityGroupChanges.slice(0, 5),
      });
    }

    return {
      totalSuspicious: suspicious.reduce((sum, s) => sum + s.count, 0),
      categories: suspicious,
      riskScore: this.calculateRiskScore(suspicious),
    };
  }

  /**
   * Calculate overall risk score based on suspicious events
   */
  private calculateRiskScore(
    suspicious: Array<{ severity: string; count: number }>
  ): number {
    let score = 0;
    suspicious.forEach((s) => {
      const weight =
        s.severity === 'critical'
          ? 10
          : s.severity === 'high'
          ? 5
          : s.severity === 'medium'
          ? 2
          : 1;
      score += s.count * weight;
    });
    return Math.min(100, score);
  }

  /**
   * Get recent security events
   */
  async getRecentSecurityEvents(hours: number = 24) {
    const endTime = new Date();
    const startTime = new Date(endTime.getTime() - hours * 60 * 60 * 1000);

    return this.analyzeEvents({
      startTime,
      endTime,
    });
  }
}


