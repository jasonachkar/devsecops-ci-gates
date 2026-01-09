/**
 * @fileoverview GitHub Integration Service
 * @description Fetches repository metadata and handles GitHub API interactions
 * 
 * @module services/github
 */

import { Octokit } from '@octokit/rest';
import { logger } from '../config/logger';
import { env } from '../config/env';

/**
 * GitHub Service Class
 * @class GitHubService
 */
export class GitHubService {
  private static octokit: Octokit | null = null;

  /**
   * Get or create Octokit instance
   * @static
   * @returns {Octokit}
   */
  private static getOctokit(): Octokit {
    if (!this.octokit) {
      const token = process.env.GITHUB_TOKEN;
      this.octokit = new Octokit({
        auth: token,
        // Use GitHub API without token for public repos, but token enables higher rate limits
      });
    }
    return this.octokit;
  }

  /**
   * Parse GitHub repository URL or owner/repo string
   * @static
   * @param {string} repoIdentifier - GitHub URL or owner/repo format
   * @returns {{owner: string, repo: string}|null}
   */
  static parseRepository(repoIdentifier: string): { owner: string; repo: string } | null {
    // Handle full GitHub URL: https://github.com/owner/repo or git@github.com:owner/repo.git
    const urlMatch = repoIdentifier.match(/github\.com[/:]([\w-]+)\/([\w.-]+)/);
    if (urlMatch) {
      return {
        owner: urlMatch[1],
        repo: urlMatch[2].replace(/\.git$/, ''),
      };
    }

    // Handle owner/repo format
    const parts = repoIdentifier.split('/');
    if (parts.length === 2) {
      return {
        owner: parts[0],
        repo: parts[1],
      };
    }

    return null;
  }

  /**
   * Get repository metadata from GitHub
   * @static
   * @async
   * @param {string} owner - Repository owner
   * @param {string} repo - Repository name
   * @returns {Promise<Object>} Repository metadata
   */
  static async getRepositoryMetadata(owner: string, repo: string) {
    try {
      const octokit = this.getOctokit();
      const response = await octokit.repos.get({
        owner,
        repo,
      });

      return {
        name: response.data.name,
        fullName: response.data.full_name,
        description: response.data.description,
        url: response.data.html_url,
        cloneUrl: response.data.clone_url,
        sshUrl: response.data.ssh_url,
        defaultBranch: response.data.default_branch,
        language: response.data.language,
        stars: response.data.stargazers_count,
        forks: response.data.forks_count,
        isPrivate: response.data.private,
        createdAt: response.data.created_at,
        updatedAt: response.data.updated_at,
      };
    } catch (error: any) {
      logger.error('Failed to fetch GitHub repository metadata', { error, owner, repo });
      if (error.status === 404) {
        throw new Error(`Repository ${owner}/${repo} not found`);
      }
      if (error.status === 403) {
        throw new Error('GitHub API rate limit exceeded. Consider setting GITHUB_TOKEN environment variable.');
      }
      throw new Error(`Failed to fetch repository: ${error.message}`);
    }
  }

  /**
   * Get repository commit history
   * @static
   * @async
   * @param {string} owner - Repository owner
   * @param {string} repo - Repository name
   * @param {string} branch - Branch name (default: main)
   * @param {number} limit - Number of commits to fetch (default: 10)
   * @returns {Promise<Array>} Commit history
   */
  static async getCommitHistory(
    owner: string,
    repo: string,
    branch: string = 'main',
    limit: number = 10
  ) {
    try {
      const octokit = this.getOctokit();
      const response = await octokit.repos.listCommits({
        owner,
        repo,
        sha: branch,
        per_page: limit,
      });

      return response.data.map((commit) => ({
        sha: commit.sha,
        message: commit.commit.message,
        author: commit.commit.author?.name,
        date: commit.commit.author?.date,
        url: commit.html_url,
      }));
    } catch (error: any) {
      logger.error('Failed to fetch commit history', { error, owner, repo, branch });
      return [];
    }
  }

  /**
   * Clone repository to temporary directory
   * @static
   * @async
   * @param {string} cloneUrl - Repository clone URL
   * @param {string} targetPath - Target directory path
   * @returns {Promise<void>}
   */
  static async cloneRepository(cloneUrl: string, targetPath: string): Promise<void> {
    const { exec } = await import('child_process');
    const { promisify } = await import('util');
    const execAsync = promisify(exec);

    try {
      // Clone repository shallow (depth 1) for faster cloning
      const command = `git clone --depth 1 --single-branch ${cloneUrl} ${targetPath}`;
      logger.info('Cloning repository', { cloneUrl, targetPath });

      await execAsync(command, {
        timeout: 300000, // 5 minute timeout
        maxBuffer: 10 * 1024 * 1024,
      });

      logger.info('Repository cloned successfully', { targetPath });
    } catch (error) {
      logger.error('Failed to clone repository', { error, cloneUrl, targetPath });
      throw new Error(`Failed to clone repository: ${error instanceof Error ? error.message : String(error)}`);
    }
  }
}
