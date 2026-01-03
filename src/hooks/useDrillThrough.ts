import { create } from 'zustand';

export interface DrillFilter {
  dimension: string;
  value: string;
  sourceVisualId: string;
}

interface DrillThroughState {
  filters: DrillFilter[];
  addFilter: (filter: DrillFilter) => void;
  removeFilter: (dimension: string) => void;
  clearFilters: () => void;
  toggleFilter: (filter: DrillFilter) => void;
}

export const useDrillThrough = create<DrillThroughState>((set, get) => ({
  filters: [],
  
  addFilter: (filter) => set((state) => {
    // Replace existing filter on same dimension
    const existing = state.filters.findIndex(f => f.dimension === filter.dimension);
    if (existing >= 0) {
      const newFilters = [...state.filters];
      newFilters[existing] = filter;
      return { filters: newFilters };
    }
    return { filters: [...state.filters, filter] };
  }),
  
  removeFilter: (dimension) => set((state) => ({
    filters: state.filters.filter(f => f.dimension !== dimension)
  })),
  
  clearFilters: () => set({ filters: [] }),
  
  toggleFilter: (filter) => {
    const state = get();
    const existing = state.filters.find(
      f => f.dimension === filter.dimension && f.value === filter.value
    );
    if (existing) {
      state.removeFilter(filter.dimension);
    } else {
      state.addFilter(filter);
    }
  }
}));

// Helper to filter data based on active drill filters
export function applyDrillFilters<T extends Record<string, unknown>>(
  data: T[],
  filters: DrillFilter[],
  excludeVisualId?: string
): T[] {
  if (filters.length === 0) return data;
  
  return data.filter(row => {
    return filters.every(filter => {
      // Don't filter the source visual
      if (excludeVisualId && filter.sourceVisualId === excludeVisualId) {
        return true;
      }
      const rowValue = String(row[filter.dimension] ?? '');
      return rowValue === filter.value;
    });
  });
}
