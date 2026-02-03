import { DataRow, ColumnSchema } from '@/store/appStore';

export interface DataQualityIssue {
  type: 'missing' | 'duplicate' | 'outlier' | 'type_mismatch' | 'empty_column';
  column: string;
  severity: 'warning' | 'error';
  message: string;
  count: number;
  percentage?: number;
}

export interface DataQualityReport {
  score: number; // 0-100
  totalRows: number;
  totalColumns: number;
  issues: DataQualityIssue[];
  warnings: DataQualityIssue[];
  errors: DataQualityIssue[];
}

export function validateDataQuality(
  data: DataRow[],
  schema: ColumnSchema[]
): DataQualityReport {
  const issues: DataQualityIssue[] = [];
  const totalRows = data.length;
  const totalColumns = schema.length;

  if (totalRows === 0) {
    return {
      score: 0,
      totalRows: 0,
      totalColumns: 0,
      issues: [],
      warnings: [],
      errors: [],
    };
  }

  // Check for missing values
  schema.forEach((col) => {
    const missingCount = data.filter((row) => {
      const value = row[col.name];
      return value === null || value === undefined || value === '' || 
             (typeof value === 'string' && value.trim() === '');
    }).length;

    if (missingCount > 0) {
      const percentage = (missingCount / totalRows) * 100;
      issues.push({
        type: 'missing',
        column: col.name,
        severity: percentage > 50 ? 'error' : 'warning',
        message: `${missingCount} missing values (${percentage.toFixed(1)}%)`,
        count: missingCount,
        percentage,
      });
    }
  });

  // Check for duplicate rows
  const rowStrings = data.map((row) => JSON.stringify(row));
  const uniqueRows = new Set(rowStrings);
  const duplicateCount = totalRows - uniqueRows.size;

  if (duplicateCount > 0) {
    issues.push({
      type: 'duplicate',
      column: 'all',
      severity: duplicateCount > totalRows * 0.1 ? 'error' : 'warning',
      message: `${duplicateCount} duplicate rows found`,
      count: duplicateCount,
      percentage: (duplicateCount / totalRows) * 100,
    });
  }

  // Check for empty columns
  schema.forEach((col) => {
    const hasValues = data.some((row) => {
      const value = row[col.name];
      return value !== null && value !== undefined && value !== '' &&
             !(typeof value === 'string' && value.trim() === '');
    });

    if (!hasValues) {
      issues.push({
        type: 'empty_column',
        column: col.name,
        severity: 'error',
        message: 'Column is completely empty',
        count: totalRows,
        percentage: 100,
      });
    }
  });

  // Check for type mismatches in measure columns
  schema
    .filter((col) => col.type === 'measure')
    .forEach((col) => {
      const nonNumericCount = data.filter((row) => {
        const value = row[col.name];
        if (value === null || value === undefined || value === '') return false;
        const num = typeof value === 'number' ? value : parseFloat(String(value));
        return isNaN(num);
      }).length;

      if (nonNumericCount > 0) {
        const percentage = (nonNumericCount / totalRows) * 100;
        issues.push({
          type: 'type_mismatch',
          column: col.name,
          severity: percentage > 20 ? 'error' : 'warning',
          message: `${nonNumericCount} non-numeric values in measure column (${percentage.toFixed(1)}%)`,
          count: nonNumericCount,
          percentage,
        });
      }
    });

  // Check for outliers in numeric columns (using IQR method)
  schema
    .filter((col) => col.type === 'measure')
    .forEach((col) => {
      const numericValues = data
        .map((row) => {
          const value = row[col.name];
          if (value === null || value === undefined || value === '') return null;
          const num = typeof value === 'number' ? value : parseFloat(String(value));
          return isNaN(num) ? null : num;
        })
        .filter((v): v is number => v !== null)
        .sort((a, b) => a - b);

      if (numericValues.length > 10) {
        const q1Index = Math.floor(numericValues.length * 0.25);
        const q3Index = Math.floor(numericValues.length * 0.75);
        const q1 = numericValues[q1Index];
        const q3 = numericValues[q3Index];
        const iqr = q3 - q1;
        const lowerBound = q1 - 1.5 * iqr;
        const upperBound = q3 + 1.5 * iqr;

        const outlierCount = numericValues.filter(
          (v) => v < lowerBound || v > upperBound
        ).length;

        if (outlierCount > 0) {
          const percentage = (outlierCount / numericValues.length) * 100;
          if (percentage > 5) {
            issues.push({
              type: 'outlier',
              column: col.name,
              severity: 'warning',
              message: `${outlierCount} potential outliers detected (${percentage.toFixed(1)}%)`,
              count: outlierCount,
              percentage,
            });
          }
        }
      }
    });

  // Calculate quality score
  const errors = issues.filter((i) => i.severity === 'error');
  const warnings = issues.filter((i) => i.severity === 'warning');
  
  // Score calculation: start at 100, deduct points for issues
  let score = 100;
  errors.forEach((issue) => {
    score -= issue.percentage ? Math.min(issue.percentage * 0.5, 20) : 10;
  });
  warnings.forEach((issue) => {
    score -= issue.percentage ? Math.min(issue.percentage * 0.2, 5) : 2;
  });
  score = Math.max(0, Math.min(100, score));

  return {
    score: Math.round(score),
    totalRows,
    totalColumns,
    issues,
    warnings,
    errors,
  };
}

