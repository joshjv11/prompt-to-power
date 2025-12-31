import { useCallback } from 'react';
import { motion } from 'framer-motion';
import { Upload, FileSpreadsheet, AlertCircle } from 'lucide-react';
import Papa from 'papaparse';
import * as XLSX from 'xlsx';
import { useAppStore, DataRow } from '@/store/appStore';
import { detectSchema } from '@/utils/schemaDetector';
import { cn } from '@/lib/utils';

interface FileUploaderProps {
  className?: string;
}

export const FileUploader = ({ className }: FileUploaderProps) => {
  const { setFileData, setError, fileName } = useAppStore();

  const processData = useCallback((name: string, data: DataRow[]) => {
    if (data.length === 0) {
      setError('The file appears to be empty');
      return;
    }
    const schema = detectSchema(data);
    setFileData(name, data, schema);
  }, [setFileData, setError]);

  const handleFile = useCallback((file: File) => {
    const extension = file.name.split('.').pop()?.toLowerCase();

    if (extension === 'csv') {
      Papa.parse(file, {
        header: true,
        skipEmptyLines: true,
        complete: (results) => {
          processData(file.name, results.data as DataRow[]);
        },
        error: (error) => {
          setError(`Failed to parse CSV: ${error.message}`);
        },
      });
    } else if (['xlsx', 'xls'].includes(extension || '')) {
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const workbook = XLSX.read(e.target?.result, { type: 'binary' });
          const sheetName = workbook.SheetNames[0];
          const worksheet = workbook.Sheets[sheetName];
          const data = XLSX.utils.sheet_to_json(worksheet) as DataRow[];
          processData(file.name, data);
        } catch (error) {
          setError('Failed to parse Excel file');
        }
      };
      reader.readAsBinaryString(file);
    } else {
      setError('Please upload a CSV or Excel file');
    }
  }, [processData, setError]);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    if (file) handleFile(file);
  }, [handleFile]);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
  }, []);

  const handleChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) handleFile(file);
  }, [handleFile]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className={cn('relative', className)}
    >
      <label
        htmlFor="file-upload"
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        className={cn(
          'flex-col-center w-full p-8',
          'border-2 border-dashed border-border rounded-xl cursor-pointer',
          'bg-muted/30 hover:bg-muted/50 hover:border-primary/50',
          'transition-all duration-300 group',
          fileName && 'border-primary/50 bg-primary/5'
        )}
      >
        <div className="flex-col-center gap-3">
          {fileName ? (
            <>
              <div className="p-3 bg-primary/10 rounded-xl">
                <FileSpreadsheet className="w-8 h-8 text-primary" />
              </div>
              <div className="text-center">
                <p className="font-medium text-foreground">{fileName}</p>
                <p className="text-sm text-muted-foreground">Click or drag to replace</p>
              </div>
            </>
          ) : (
            <>
              <div className="p-3 bg-muted rounded-xl group-hover:bg-primary/10 transition-colors">
                <Upload className="w-8 h-8 text-muted-foreground group-hover:text-primary transition-colors" />
              </div>
              <div className="text-center">
                <p className="font-medium text-foreground">Drop your file here</p>
                <p className="text-sm text-muted-foreground">CSV or Excel files supported</p>
              </div>
            </>
          )}
        </div>
        <input
          id="file-upload"
          type="file"
          accept=".csv,.xlsx,.xls"
          onChange={handleChange}
          className="hidden"
        />
      </label>
    </motion.div>
  );
};
