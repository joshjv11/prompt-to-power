import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface ColumnSchema {
  name: string;
  type: 'measure' | 'dimension' | 'date';
  dataType: 'number' | 'string' | 'date';
  sampleValues: (string | number)[];
}

export interface DataRow {
  [key: string]: string | number | null;
}

export type VisualType = 
  | 'card'
  | 'bar'
  | 'line'
  | 'pie'
  | 'combo'
  | 'area'
  | 'scatter'
  | 'histogram'
  | 'heatmap'
  | 'waterfall'
  | 'gauge'
  | 'table'
  | 'funnel'
  | 'bullet'
  | 'treemap';

export interface Visual {
  id: string;
  type: VisualType;
  title: string;
  metrics: string[];
  dimensions: string[];
  filters?: Record<string, string[]>;
  sort?: 'asc' | 'desc';
  topN?: number;
  bins?: number;
}

export interface DashboardSpec {
  title: string;
  visuals: Visual[];
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

export interface SavedDashboard {
  id: string;
  title: string;
  fileName: string;
  data: DataRow[];
  schema: ColumnSchema[];
  spec: DashboardSpec;
  chatHistory: ChatMessage[];
  createdAt: Date;
  updatedAt: Date;
}

interface AppState {
  // Data
  fileName: string | null;
  rawData: DataRow[];
  schema: ColumnSchema[];
  dataSamplingEnabled: boolean;
  maxPreviewRows: number;
  
  // Prompt
  prompt: string;
  
  // Results
  dashboardSpec: DashboardSpec | null;
  isGenerating: boolean;
  error: string | null;
  
  // Chat history for refinements
  chatHistory: ChatMessage[];
  
  // Saved dashboards
  savedDashboards: SavedDashboard[];
  
  // Insights
  insights: string[];
  isLoadingInsights: boolean;
  
  // Undo/Redo history
  history: DashboardSpec[];
  historyIndex: number;
  
  // Actions
  setFileData: (fileName: string, data: DataRow[], schema: ColumnSchema[]) => void;
  setDataSampling: (enabled: boolean, maxRows?: number) => void;
  getPreviewData: () => DataRow[];
  setPrompt: (prompt: string) => void;
  setDashboardSpec: (spec: DashboardSpec | null) => void;
  setIsGenerating: (isGenerating: boolean) => void;
  setError: (error: string | null) => void;
  
  // Chat actions
  addChatMessage: (message: Omit<ChatMessage, 'id' | 'timestamp'>) => void;
  clearChatHistory: () => void;
  
  // Dashboard save/load actions
  saveDashboard: (title?: string) => string;
  loadDashboard: (id: string) => void;
  deleteDashboard: (id: string) => void;
  renameDashboard: (id: string, newTitle: string) => void;
  
  // Insights actions
  setInsights: (insights: string[]) => void;
  setIsLoadingInsights: (loading: boolean) => void;
  
  // Undo/Redo actions
  pushToHistory: (spec: DashboardSpec) => void;
  undo: () => void;
  redo: () => void;
  canUndo: () => boolean;
  canRedo: () => boolean;
  
  reset: () => void;
}

const initialState = {
  fileName: null,
  rawData: [],
  schema: [],
  dataSamplingEnabled: true,
  maxPreviewRows: 10000,
  prompt: '',
  dashboardSpec: null,
  isGenerating: false,
  error: null,
  chatHistory: [],
  savedDashboards: [],
  insights: [],
  isLoadingInsights: false,
  history: [],
  historyIndex: -1,
};

export const useAppStore = create<AppState>()(
  persist(
    (set, get) => ({
      ...initialState,
      
      setFileData: (fileName, rawData, schema) => set({ fileName, rawData, schema, error: null }),
      setDataSampling: (enabled, maxRows) => set({ 
        dataSamplingEnabled: enabled, 
        maxPreviewRows: maxRows ?? 10000 
      }),
      getPreviewData: () => {
        const state = get();
        if (!state.dataSamplingEnabled || state.rawData.length <= state.maxPreviewRows) {
          return state.rawData;
        }
        return state.rawData.slice(0, state.maxPreviewRows);
      },
      setPrompt: (prompt) => set({ prompt }),
      setDashboardSpec: (dashboardSpec) => {
        set({ dashboardSpec });
        // Auto-push to history when spec changes (but not on initial load)
        if (dashboardSpec) {
          const state = get();
          // Only push if it's different from current history entry
          if (state.historyIndex >= 0 && state.history[state.historyIndex]) {
            const current = JSON.stringify(state.history[state.historyIndex]);
            const newSpec = JSON.stringify(dashboardSpec);
            if (current !== newSpec) {
              get().pushToHistory(dashboardSpec);
            }
          } else if (state.historyIndex === -1) {
            // First spec, push to history
            get().pushToHistory(dashboardSpec);
          }
        }
      },
      setIsGenerating: (isGenerating) => set({ isGenerating }),
      setError: (error) => set({ error }),
      
      addChatMessage: (message) => set((state) => ({
        chatHistory: [
          ...state.chatHistory,
          {
            ...message,
            id: `msg_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`,
            timestamp: new Date(),
          },
        ],
      })),
      
      clearChatHistory: () => set({ chatHistory: [] }),
      
      saveDashboard: (title) => {
        const state = get();
        if (!state.dashboardSpec || !state.rawData.length) {
          throw new Error('No dashboard to save');
        }
        
        const id = `dash_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`;
        const now = new Date();
        
        const newDashboard: SavedDashboard = {
          id,
          title: title || state.dashboardSpec.title || 'Untitled Dashboard',
          fileName: state.fileName || 'data.csv',
          data: state.rawData,
          schema: state.schema,
          spec: state.dashboardSpec,
          chatHistory: state.chatHistory,
          createdAt: now,
          updatedAt: now,
        };
        
        set((state) => ({
          savedDashboards: [newDashboard, ...state.savedDashboards],
        }));
        
        return id;
      },
      
      loadDashboard: (id) => {
        const state = get();
        const dashboard = state.savedDashboards.find((d) => d.id === id);
        if (!dashboard) return;
        
        set({
          fileName: dashboard.fileName,
          rawData: dashboard.data,
          schema: dashboard.schema,
          dashboardSpec: dashboard.spec,
          chatHistory: dashboard.chatHistory,
          prompt: '',
          error: null,
          insights: [],
        });
      },
      
      deleteDashboard: (id) => set((state) => ({
        savedDashboards: state.savedDashboards.filter((d) => d.id !== id),
      })),
      
      renameDashboard: (id, newTitle) => set((state) => ({
        savedDashboards: state.savedDashboards.map((d) =>
          d.id === id ? { ...d, title: newTitle, updatedAt: new Date() } : d
        ),
      })),
      
      setInsights: (insights) => set({ insights }),
      setIsLoadingInsights: (isLoadingInsights) => set({ isLoadingInsights }),
      
      pushToHistory: (spec) => {
        const state = get();
        const newHistory = state.history.slice(0, state.historyIndex + 1);
        newHistory.push(JSON.parse(JSON.stringify(spec))); // Deep clone
        // Limit history to 50 items
        if (newHistory.length > 50) {
          newHistory.shift();
        }
        set({
          history: newHistory,
          historyIndex: newHistory.length - 1,
        });
      },
      
      undo: () => {
        const state = get();
        if (state.historyIndex > 0) {
          const previousSpec = state.history[state.historyIndex - 1];
          set({
            dashboardSpec: JSON.parse(JSON.stringify(previousSpec)), // Deep clone
            historyIndex: state.historyIndex - 1,
          });
        }
      },
      
      redo: () => {
        const state = get();
        if (state.historyIndex < state.history.length - 1) {
          const nextSpec = state.history[state.historyIndex + 1];
          set({
            dashboardSpec: JSON.parse(JSON.stringify(nextSpec)), // Deep clone
            historyIndex: state.historyIndex + 1,
          });
        }
      },
      
      canUndo: () => {
        const state = get();
        return state.historyIndex > 0;
      },
      
      canRedo: () => {
        const state = get();
        return state.historyIndex < state.history.length - 1;
      },
      
      reset: () => set({
        ...initialState,
        savedDashboards: get().savedDashboards, // Keep saved dashboards
      }),
    }),
    {
      name: 'promptbi-storage',
      partialize: (state) => ({
        // Only persist saved dashboards, not rawData (which is stored in savedDashboards)
        savedDashboards: state.savedDashboards,
      }),
      // Add storage configuration to handle large data
      storage: {
        getItem: (name) => {
          const str = localStorage.getItem(name);
          if (!str) return null;
          try {
            return JSON.parse(str);
          } catch {
            return null;
          }
        },
        setItem: (name, value) => {
          try {
            localStorage.setItem(name, JSON.stringify(value));
          } catch (e) {
            // If storage is full, try to clear old dashboards
            console.warn('LocalStorage full, clearing old dashboards');
            if (value?.state?.savedDashboards) {
              // Keep only the 10 most recent dashboards
              const recent = value.state.savedDashboards.slice(0, 10);
              value.state.savedDashboards = recent;
              localStorage.setItem(name, JSON.stringify(value));
            }
          }
        },
        removeItem: (name) => localStorage.removeItem(name),
      },
    }
  )
);
