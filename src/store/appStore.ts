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
  
  // Actions
  setFileData: (fileName: string, data: DataRow[], schema: ColumnSchema[]) => void;
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
  chatHistory: [],
  savedDashboards: [],
  insights: [],
  isLoadingInsights: false,
};

export const useAppStore = create<AppState>()(
  persist(
    (set, get) => ({
      ...initialState,
      
      setFileData: (fileName, rawData, schema) => set({ fileName, rawData, schema, error: null }),
      setPrompt: (prompt) => set({ prompt }),
      setDashboardSpec: (dashboardSpec) => set({ dashboardSpec }),
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
      
      reset: () => set({
        ...initialState,
        savedDashboards: get().savedDashboards, // Keep saved dashboards
      }),
    }),
    {
      name: 'promptbi-storage',
      partialize: (state) => ({
        savedDashboards: state.savedDashboards,
      }),
    }
  )
);
