/**
 * @fileoverview Repository Service - Business logic for repository management
 * @description Handles repository CRUD operations and repository record management
 * 
 * @module services/repositoryService
 */

import { prisma } from '../config/database';
import { logger } from '../config/logger';

/**
 * Repository Service Class
 * @class RepositoryService
 */
export class RepositoryService {
  /**
   * Get or create a repository record
   * @static
   * @async
   * @param {Object} data - Repository data
   * @param {string} data.name - Repository name
   * @param {string} data.url - Repository URL
   * @param {string} [data.provider='github'] - Git provider (github, gitlab, bitbucket)
   * @param {string} [data.description] - Repository description
   * @returns {Promise<Repository>} Repository record
   */
  static async getOrCreateRepository(data: {
    name: string;
    url: string;
    provider?: string;
    description?: string;
  }) {
    const { name, url, provider = 'github', description } = data;

    // Try to find existing repository
    const existing = await prisma.repository.findUnique({
      where: {
        repository_name_provider: {
          name,
          provider,
        },
      },
    });

    if (existing) {
      logger.debug('Repository already exists', { repositoryId: existing.id, name, provider });
      return existing;
    }

    // Create new repository
    const repository = await prisma.repository.create({
      data: {
        name,
        url,
        provider,
        description,
        isActive: true,
      },
    });

    logger.info('Repository created', { repositoryId: repository.id, name, provider });

    return repository;
  }

  /**
   * Get repository by ID
   * @static
   * @async
   * @param {string} repositoryId - Repository UUID
   * @returns {Promise<Repository | null>}
   */
  static async getRepositoryById(repositoryId: string) {
    return prisma.repository.findUnique({
      where: { id: repositoryId },
    });
  }

  /**
   * List all active repositories
   * @static
   * @async
   * @returns {Promise<Repository[]>}
   */
  static async listRepositories() {
    return prisma.repository.findMany({
      where: { isActive: true },
      orderBy: { name: 'asc' },
    });
  }
}
