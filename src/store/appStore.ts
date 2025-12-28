import { create } from 'zustand';

export interface ColumnSchema {
  name: string;
  type: 'measure' | 'dimension' | 'date';
  dataType: 'number' | 'string' | 'date';
  sampleValues: (string | number)[];
}

export interface DataRow {
  [key: string]: string | number | null;
}

export interface Visual {
  id: string;
  type: 'bar' | 'line' | 'pie' | 'table' | 'card' | 'area' | 'combo';
  title: string;
  metrics: string[];
  dimensions: string[];
  filters?: string[];
  sort?: 'asc' | 'desc';
}

export interface DashboardSpec {
  title: string;
  visuals: Visual[];
}

interface AppState {
  // Data
  fileName: string | null;
  rawData: DataRow[];
  schema: ColumnSchema[];
  
  // Prompt
  prompt: string;
  
  // Results
  dashboardSpec: DashboardSpec | null;
  isGenerating: boolean;
  error: string | null;
  
  // Actions
  setFileData: (fileName: string, data: DataRow[], schema: ColumnSchema[]) => void;
  setPrompt: (prompt: string) => void;
  setDashboardSpec: (spec: DashboardSpec | null) => void;
  setIsGenerating: (isGenerating: boolean) => void;
  setError: (error: string | null) => void;
  reset: () => void;
}

const initialState = {
  fileName: null,
  rawData: [],
  schema: [],
  prompt: '',
  dashboardSpec: null,
  isGenerating: false,
  error: null,
};

export const useAppStore = create<AppState>((set) => ({
  ...initialState,
  
  setFileData: (fileName, rawData, schema) => set({ fileName, rawData, schema, error: null }),
  setPrompt: (prompt) => set({ prompt }),
  setDashboardSpec: (dashboardSpec) => set({ dashboardSpec }),
  setIsGenerating: (isGenerating) => set({ isGenerating }),
  setError: (error) => set({ error }),
  reset: () => set(initialState),
}));
