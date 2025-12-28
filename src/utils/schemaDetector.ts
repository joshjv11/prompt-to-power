import { ColumnSchema, DataRow } from '@/store/appStore';

export const detectSchema = (data: DataRow[]): ColumnSchema[] => {
  if (data.length === 0) return [];

  const columns = Object.keys(data[0]);
  
  return columns.map((col) => {
    const values = data.slice(0, 100).map((row) => row[col]).filter((v) => v !== null && v !== undefined && v !== '');
    
    // Check if it's a date column
    const isDate = values.some((v) => {
      if (typeof v !== 'string') return false;
      const datePatterns = [
        /^\d{4}-\d{2}-\d{2}$/,
        /^\d{2}\/\d{2}\/\d{4}$/,
        /^\d{2}-\d{2}-\d{4}$/,
      ];
      return datePatterns.some((pattern) => pattern.test(v));
    });

    if (isDate) {
      return {
        name: col,
        type: 'date' as const,
        dataType: 'date' as const,
        sampleValues: values.slice(0, 3) as (string | number)[],
      };
    }

    // Check if it's numeric
    const numericValues = values.filter((v) => {
      const num = typeof v === 'number' ? v : parseFloat(String(v));
      return !isNaN(num);
    });

    const isNumeric = numericValues.length > values.length * 0.8;

    if (isNumeric) {
      return {
        name: col,
        type: 'measure' as const,
        dataType: 'number' as const,
        sampleValues: numericValues.slice(0, 3) as (string | number)[],
      };
    }

    // Otherwise it's a dimension
    return {
      name: col,
      type: 'dimension' as const,
      dataType: 'string' as const,
      sampleValues: values.slice(0, 3) as (string | number)[],
    };
  });
};
