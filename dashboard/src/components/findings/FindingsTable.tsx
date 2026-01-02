/**
 * @fileoverview Findings Table Component
 * @description Displays security findings in a sortable, filterable table.
 * Supports filtering by severity and tool, and sorting by multiple columns.
 * Provides a comprehensive view of all security findings with detailed information.
 * 
 * @module components/findings/FindingsTable
 */

import { useState, useMemo } from 'react';
import { AlertOctagon, AlertTriangle, AlertCircle, Info, ChevronUp, ChevronDown } from 'lucide-react';
import type { Finding, SeverityLevel } from '../../types/scan';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/Card';
import { Badge } from '../ui/Badge';
import { Select } from '../ui/Select';
import { useChartColors } from '../../hooks/useChartColors';
import { cn } from '../../utils/cn';

/**
 * Props for FindingsTable component
 * @interface FindingsTableProps
 */
interface FindingsTableProps {
  /** Array of security findings to display */
  findings: Finding[];
}

/** Fields that can be used for sorting */
type SortField = 'severity' | 'title' | 'tool' | 'file';
/** Sort direction (ascending or descending) */
type SortDirection = 'asc' | 'desc';

/**
 * Severity order mapping for sorting
 * Lower numbers = higher priority (critical first)
 * @constant
 */
const severityOrder: Record<SeverityLevel, number> = {
  critical: 0,
  high: 1,
  medium: 2,
  low: 3,
  info: 4,
};

/**
 * Icon mapping for each severity level
 * Used in severity badges for visual identification
 * @constant
 */
const severityIcons: Record<SeverityLevel, typeof AlertOctagon> = {
  critical: AlertOctagon,
  high: AlertTriangle,
  medium: AlertCircle,
  low: Info,
  info: Info,
};

/**
 * Findings Table Component
 * @component
 * @param {FindingsTableProps} props - Component props
 * @returns {JSX.Element} Rendered findings table with filters and sorting
 * 
 * @example
 * <FindingsTable findings={scanData.findings} />
 */
export function FindingsTable({ findings }: FindingsTableProps) {
  // Get severity color tokens for consistent styling
  const { severityTokens } = useChartColors();
  
  // Filter state: selected severity level (or 'all' for no filter)
  const [selectedSeverity, setSelectedSeverity] = useState<SeverityLevel | 'all'>('all');
  
  // Filter state: selected tool (or 'all' for no filter)
  const [selectedTool, setSelectedTool] = useState<string>('all');
  
  // Sort state: current field being sorted by
  const [sortField, setSortField] = useState<SortField>('severity');
  
  // Sort state: sort direction (ascending or descending)
  const [sortDirection, setSortDirection] = useState<SortDirection>('asc');

  /**
   * Extract unique tools from findings for filter dropdown
   * Memoized to avoid recalculating on every render
   * @type {string[]}
   */
  const tools = useMemo(() => {
    const uniqueTools = new Set(findings.map(f => f.tool));
    return Array.from(uniqueTools).sort(); // Sort alphabetically
  }, [findings]);

  /**
   * Filtered and sorted findings
   * Memoized to recalculate only when dependencies change
   * Applies severity filter, tool filter, and sorting
   * @type {Finding[]}
   */
  const filteredAndSortedFindings = useMemo(() => {
    // Start with copy of all findings
    let result = [...findings];

    // Apply severity filter if not 'all'
    if (selectedSeverity !== 'all') {
      result = result.filter(f => f.severity === selectedSeverity);
    }

    // Apply tool filter if not 'all'
    if (selectedTool !== 'all') {
      result = result.filter(f => f.tool === selectedTool);
    }

    // Sort findings based on selected field and direction
    result.sort((a, b) => {
      let comparison = 0;

      switch (sortField) {
        case 'severity':
          // Use severity order mapping (critical=0, high=1, etc.)
          comparison = severityOrder[a.severity] - severityOrder[b.severity];
          break;
        case 'title':
          // Alphabetical comparison
          comparison = a.title.localeCompare(b.title);
          break;
        case 'tool':
          // Alphabetical comparison
          comparison = a.tool.localeCompare(b.tool);
          break;
        case 'file':
          // Alphabetical comparison
          comparison = a.file.localeCompare(b.file);
          break;
      }

      // Reverse comparison if descending order
      return sortDirection === 'asc' ? comparison : -comparison;
    });

    return result;
  }, [findings, selectedSeverity, selectedTool, sortField, sortDirection]);

  /**
   * Handle column header click for sorting
   * @param {SortField} field - Field to sort by
   * @description Toggles sort direction if clicking same field,
   * otherwise sets new field with ascending direction
   */
  const handleSort = (field: SortField) => {
    if (sortField === field) {
      // Toggle direction if clicking same field
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      // Set new field with ascending as default
      setSortField(field);
      setSortDirection('asc');
    }
  };

  /**
   * Map severity level to badge status for styling
   * @param {SeverityLevel} severity - Finding severity level
   * @returns {'failed' | 'warning' | 'info' | 'passed'} Badge status for styling
   * @description Maps severity to visual status for consistent badge colors
   */
  const getSeverityBadgeStatus = (severity: SeverityLevel): 'failed' | 'warning' | 'info' | 'passed' => {
    switch (severity) {
      case 'critical':
        return 'failed'; // Red badge
      case 'high':
        return 'warning'; // Orange/yellow badge
      case 'medium':
      case 'low':
        return 'info'; // Blue badge
      case 'info':
        return 'passed'; // Green badge
    }
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>All Findings</CardTitle>
          <div className="flex items-center gap-2">
            <Select
              value={selectedSeverity}
              onChange={(e) => setSelectedSeverity(e.target.value as SeverityLevel | 'all')}
              className="w-40"
            >
              <option value="all">All Severities</option>
              <option value="critical">Critical</option>
              <option value="high">High</option>
              <option value="medium">Medium</option>
              <option value="low">Low</option>
              <option value="info">Info</option>
            </Select>
            <Select
              value={selectedTool}
              onChange={(e) => setSelectedTool(e.target.value)}
              className="w-40"
            >
              <option value="all">All Tools</option>
              {tools.map(tool => (
                <option key={tool} value={tool}>{tool}</option>
              ))}
            </Select>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-dark-border-primary">
                <th
                  className="cursor-pointer px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-dark-text-secondary transition-colors hover:text-dark-text-primary"
                  onClick={() => handleSort('severity')}
                >
                  <div className="flex items-center gap-1.5">
                    Severity
                    {sortField === 'severity' && (
                      sortDirection === 'asc' ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />
                    )}
                  </div>
                </th>
                <th
                  className="cursor-pointer px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-dark-text-secondary transition-colors hover:text-dark-text-primary"
                  onClick={() => handleSort('title')}
                >
                  <div className="flex items-center gap-1.5">
                    Issue
                    {sortField === 'title' && (
                      sortDirection === 'asc' ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />
                    )}
                  </div>
                </th>
                <th
                  className="cursor-pointer px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-dark-text-secondary transition-colors hover:text-dark-text-primary"
                  onClick={() => handleSort('tool')}
                >
                  <div className="flex items-center gap-1.5">
                    Tool
                    {sortField === 'tool' && (
                      sortDirection === 'asc' ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />
                    )}
                  </div>
                </th>
                <th
                  className="cursor-pointer px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-dark-text-secondary transition-colors hover:text-dark-text-primary"
                  onClick={() => handleSort('file')}
                >
                  <div className="flex items-center gap-1.5">
                    File
                    {sortField === 'file' && (
                      sortDirection === 'asc' ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />
                    )}
                  </div>
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-dark-text-secondary">
                  Line
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-dark-text-secondary">
                  Category
                </th>
              </tr>
            </thead>
            <tbody>
              {filteredAndSortedFindings.map((finding, index) => {
                const Icon = severityIcons[finding.severity];
                const isCriticalOrHigh = finding.severity === 'critical' || finding.severity === 'high';

                return (
                  <tr
                    key={`${finding.title}-${index}`}
                    className={cn(
                      'border-b border-dark-border-primary transition-colors duration-150',
                      'hover:bg-dark-bg-tertiary/30',
                      isCriticalOrHigh && 'bg-semantic-error-bg/20'
                    )}
                  >
                    <td className="px-4 py-3">
                      <Badge
                        status={getSeverityBadgeStatus(finding.severity)}
                        size="sm"
                      >
                        <Icon className="h-3 w-3" />
                        {severityTokens[finding.severity].label}
                      </Badge>
                    </td>
                    <td className="px-4 py-3">
                      <div className="max-w-md">
                        <div className="font-medium text-sm text-dark-text-primary">{finding.title}</div>
                        {finding.message && (
                          <div className="text-xs text-dark-text-secondary mt-0.5 line-clamp-1">{finding.message}</div>
                        )}
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <span className="inline-flex items-center rounded-md bg-dark-bg-tertiary border border-dark-border-primary px-2 py-0.5 text-xs font-medium text-dark-text-primary">
                        {finding.tool}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="max-w-xs truncate font-mono text-xs text-dark-text-secondary">
                        {finding.file}
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      {finding.line && (
                        <span className="font-mono text-xs text-dark-text-secondary">
                          {finding.line}
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      {finding.category && (
                        <span className="inline-flex items-center rounded-md bg-dark-bg-tertiary border border-dark-border-primary px-2 py-0.5 text-xs font-medium text-dark-text-secondary">
                          {finding.category}
                        </span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
          {filteredAndSortedFindings.length === 0 && (
            <div className="py-12 text-center">
              <p className="text-sm text-dark-text-secondary">No findings match the selected filters.</p>
            </div>
          )}
        </div>
        <div className="mt-4 text-xs text-dark-text-secondary">
          Showing {filteredAndSortedFindings.length} of {findings.length} findings
        </div>
      </CardContent>
    </Card>
  );
}
