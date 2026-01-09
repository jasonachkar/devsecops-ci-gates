/**
 * @fileoverview Trend Service - Historical data analysis
 * @description Handles time-series queries, aggregations, and trend comparisons.
 * Provides historical analysis of security scan data over time.
 * 
 * @module services/trendService
 */

import { prisma } from '../config/database';
import { logger } from '../config/logger';

/**
 * Trend Service Class
 * @class TrendService
 * @description Provides static methods for historical trend analysis
 * All methods are static as this is a stateless service layer
 */
export class TrendService {
  /**
   * Get historical trends for a repository
   */
  static async getTrends(filters: {
    repositoryId?: string;
    days?: number;
    startDate?: Date;
    endDate?: Date;
  }) {
    const { repositoryId, days = 30, startDate, endDate } = filters;

    const where: any = {};
    if (repositoryId) where.repositoryId = repositoryId;

    // Calculate date range
    const end = endDate || new Date();
    const start = startDate || new Date(Date.now() - days * 24 * 60 * 60 * 1000);
    where.date = {
      gte: start,
      lte: end,
    };

    const trends = await prisma.scanTrend.findMany({
      where,
      orderBy: { date: 'asc' },
    });

    return trends;
  }

  /**
   * Aggregate daily trends from scans
   * Should be called periodically (e.g., via cron job)
   */
  static async aggregateDailyTrends(repositoryId: string, date: Date = new Date()) {
    const startOfDay = new Date(date);
    startOfDay.setHours(0, 0, 0, 0);
    const endOfDay = new Date(date);
    endOfDay.setHours(23, 59, 59, 999);

    // Get all scans for this repository on this date
    const scans = await prisma.scan.findMany({
      where: {
        repositoryId,
        createdAt: {
          gte: startOfDay,
          lte: endOfDay,
        },
        status: 'completed',
      },
      select: {
        totalFindings: true,
        criticalCount: true,
        highCount: true,
        mediumCount: true,
        lowCount: true,
        infoCount: true,
      },
    });

    if (scans.length === 0) {
      // No scans, create empty trend
      // Use findFirst + create/update pattern for compound unique constraint
      const existing = await prisma.scanTrend.findFirst({
        where: {
          repositoryId,
          date: startOfDay,
        },
      });

      if (existing) {
        return prisma.scanTrend.update({
          where: { id: existing.id },
          data: {
            totalFindings: 0,
            criticalCount: 0,
            highCount: 0,
            mediumCount: 0,
            lowCount: 0,
            infoCount: 0,
            scansCount: 0,
          },
        });
      }

      return prisma.scanTrend.create({
        data: {
          repositoryId,
          date: startOfDay,
          totalFindings: 0,
          criticalCount: 0,
          highCount: 0,
          mediumCount: 0,
          lowCount: 0,
          infoCount: 0,
          scansCount: 0,
        },
      });
    }

    // Aggregate counts
    const aggregated = scans.reduce(
      (acc, scan) => ({
        totalFindings: acc.totalFindings + scan.totalFindings,
        criticalCount: acc.criticalCount + scan.criticalCount,
        highCount: acc.highCount + scan.highCount,
        mediumCount: acc.mediumCount + scan.mediumCount,
        lowCount: acc.lowCount + scan.lowCount,
        infoCount: acc.infoCount + scan.infoCount,
        scansCount: acc.scansCount + 1,
      }),
      {
        totalFindings: 0,
        criticalCount: 0,
        highCount: 0,
        mediumCount: 0,
        lowCount: 0,
        infoCount: 0,
        scansCount: 0,
      }
    );

    // Calculate averages (for multiple scans per day)
    const avgFindings = Math.round(aggregated.totalFindings / aggregated.scansCount);

    // Use findFirst + create/update pattern for compound unique constraint
    const existing = await prisma.scanTrend.findFirst({
      where: {
        repositoryId,
        date: startOfDay,
      },
    });

    if (existing) {
      return prisma.scanTrend.update({
        where: { id: existing.id },
        data: {
          totalFindings: avgFindings,
          criticalCount: aggregated.criticalCount,
          highCount: aggregated.highCount,
          mediumCount: aggregated.mediumCount,
          lowCount: aggregated.lowCount,
          infoCount: aggregated.infoCount,
          scansCount: aggregated.scansCount,
        },
      });
    }

    return prisma.scanTrend.create({
      data: {
        repositoryId,
        date: startOfDay,
        totalFindings: avgFindings,
        criticalCount: aggregated.criticalCount,
        highCount: aggregated.highCount,
        mediumCount: aggregated.mediumCount,
        lowCount: aggregated.lowCount,
        infoCount: aggregated.infoCount,
        scansCount: aggregated.scansCount,
      },
    });
  }

  /**
   * Compare two time periods
   */
  static async comparePeriods(
    repositoryId: string,
    period1Start: Date,
    period1End: Date,
    period2Start: Date,
    period2End: Date
  ) {
    const [period1, period2] = await Promise.all([
      this.getTrends({
        repositoryId,
        startDate: period1Start,
        endDate: period1End,
      }),
      this.getTrends({
        repositoryId,
        startDate: period2Start,
        endDate: period2End,
      }),
    ]);

    // Calculate averages for each period
    const avg1 = this.calculateAverage(period1);
    const avg2 = this.calculateAverage(period2);

    // Calculate percentage changes
    const changes = {
      totalFindings: this.calculateChange(avg1.totalFindings, avg2.totalFindings),
      criticalCount: this.calculateChange(avg1.criticalCount, avg2.criticalCount),
      highCount: this.calculateChange(avg1.highCount, avg2.highCount),
      mediumCount: this.calculateChange(avg1.mediumCount, avg2.mediumCount),
      lowCount: this.calculateChange(avg1.lowCount, avg2.lowCount),
      infoCount: this.calculateChange(avg1.infoCount, avg2.infoCount),
    };

    return {
      period1: { start: period1Start, end: period1End, average: avg1 },
      period2: { start: period2Start, end: period2End, average: avg2 },
      changes,
    };
  }

  private static calculateAverage(trends: any[]) {
    if (trends.length === 0) {
      return {
        totalFindings: 0,
        criticalCount: 0,
        highCount: 0,
        mediumCount: 0,
        lowCount: 0,
        infoCount: 0,
      };
    }

    const sum = trends.reduce(
      (acc, trend) => ({
        totalFindings: acc.totalFindings + trend.totalFindings,
        criticalCount: acc.criticalCount + trend.criticalCount,
        highCount: acc.highCount + trend.highCount,
        mediumCount: acc.mediumCount + trend.mediumCount,
        lowCount: acc.lowCount + trend.lowCount,
        infoCount: acc.infoCount + trend.infoCount,
      }),
      {
        totalFindings: 0,
        criticalCount: 0,
        highCount: 0,
        mediumCount: 0,
        lowCount: 0,
        infoCount: 0,
      }
    );

    return {
      totalFindings: Math.round(sum.totalFindings / trends.length),
      criticalCount: Math.round(sum.criticalCount / trends.length),
      highCount: Math.round(sum.highCount / trends.length),
      mediumCount: Math.round(sum.mediumCount / trends.length),
      lowCount: Math.round(sum.lowCount / trends.length),
      infoCount: Math.round(sum.infoCount / trends.length),
    };
  }

  private static calculateChange(oldValue: number, newValue: number): number {
    if (oldValue === 0) return newValue > 0 ? 100 : 0;
    return Math.round(((newValue - oldValue) / oldValue) * 100);
  }
}

