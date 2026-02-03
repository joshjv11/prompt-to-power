import { describe, it, expect } from 'vitest';
import { validateDataQuality } from '@/lib/dataValidation';
import { ColumnSchema } from '@/store/appStore';

describe('validateDataQuality', () => {
  const schema: ColumnSchema[] = [
    { name: 'id', type: 'dimension', dataType: 'string', sampleValues: ['1', '2'] },
    { name: 'sales', type: 'measure', dataType: 'number', sampleValues: [100, 200] },
    { name: 'region', type: 'dimension', dataType: 'string', sampleValues: ['North', 'South'] },
  ];

  it('should return perfect score for clean data', () => {
    const data = [
      { id: '1', sales: 100, region: 'North' },
      { id: '2', sales: 200, region: 'South' },
      { id: '3', sales: 150, region: 'East' },
    ];

    const report = validateDataQuality(data, schema);
    expect(report.score).toBe(100);
    expect(report.issues.length).toBe(0);
  });

  it('should detect missing values', () => {
    const data = [
      { id: '1', sales: 100, region: 'North' },
      { id: '2', sales: null, region: 'South' },
      { id: '3', sales: 150, region: '' },
    ];

    const report = validateDataQuality(data, schema);
    expect(report.issues.length).toBeGreaterThan(0);
    expect(report.issues.some((i) => i.type === 'missing')).toBe(true);
    expect(report.score).toBeLessThan(100);
  });

  it('should detect duplicate rows', () => {
    const data = [
      { id: '1', sales: 100, region: 'North' },
      { id: '1', sales: 100, region: 'North' },
      { id: '2', sales: 200, region: 'South' },
    ];

    const report = validateDataQuality(data, schema);
    expect(report.issues.some((i) => i.type === 'duplicate')).toBe(true);
  });

  it('should detect type mismatches in measure columns', () => {
    const data = [
      { id: '1', sales: 100, region: 'North' },
      { id: '2', sales: 'not a number', region: 'South' },
      { id: '3', sales: 150, region: 'East' },
    ];

    const report = validateDataQuality(data, schema);
    expect(report.issues.some((i) => i.type === 'type_mismatch')).toBe(true);
  });

  it('should handle empty data', () => {
    const report = validateDataQuality([], schema);
    expect(report.score).toBe(0);
    expect(report.totalRows).toBe(0);
  });
});

