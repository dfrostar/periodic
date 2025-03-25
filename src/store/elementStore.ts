import { create } from 'zustand';
import { Element } from '@/types/element';

// Type definitions for view modes and color schemes
export type ViewMode = '2d' | '3d' | 'r3f' | 'harmonic';
export type VisualizationType = 'spiral' | 'table' | 'harmonic' | 'orbital';
export type ColorScheme = 'category' | 'state' | 'atomic-radius' | 'frequency' | 'octave';

interface FilterState {
  searchQuery: string;
  categoryFilter: string | null;
  stateFilter: 'solid' | 'liquid' | 'gas' | 'unknown' | null;
  periodFilter: number | null;
  groupFilter: number | null;
}

interface ElementState {
  // Selected element
  selectedElement: Element | null;
  setSelectedElement: (element: Element | null) => void;
  clearSelectedElement: () => void;
  
  // View settings
  viewMode: ViewMode;
  setViewMode: (mode: ViewMode) => void;
  
  visualizationType: VisualizationType;
  setVisualizationType: (type: VisualizationType) => void;
  
  colorScheme: ColorScheme;
  setColorScheme: (scheme: ColorScheme) => void;
  
  // Filters
  filter: FilterState;
  setSearchQuery: (query: string) => void;
  setCategoryFilter: (category: string | null) => void;
  setStateFilter: (state: 'solid' | 'liquid' | 'gas' | 'unknown' | null) => void;
  setPeriodFilter: (period: number | null) => void;
  setGroupFilter: (group: number | null) => void;
  clearFilters: () => void;
  
  // UI state
  showControls: boolean;
  toggleControls: () => void;
  
  controlPanelPosition: 'left' | 'right';
  toggleControlPanelPosition: () => void;
  
  showAtomicStructure: boolean;
  toggleAtomicStructure: () => void;
  
  // Audio settings for harmonic view
  audioEnabled: boolean;
  toggleAudio: () => void;
  volume: number;
  setVolume: (volume: number) => void;
}

/**
 * Element store to manage the application state
 * Uses Zustand for client state management as per coding standards
 */
export const useElementStore = create<ElementState>((set) => ({
  // Selected element
  selectedElement: null,
  setSelectedElement: (element) => set({ selectedElement: element }),
  clearSelectedElement: () => set({ selectedElement: null }),
  
  // View settings
  viewMode: 'r3f',
  setViewMode: (mode) => set({ viewMode: mode }),
  
  visualizationType: 'spiral',
  setVisualizationType: (type) => set({ visualizationType: type }),
  
  colorScheme: 'category',
  setColorScheme: (scheme) => set({ colorScheme: scheme }),
  
  // Filters
  filter: {
    searchQuery: '',
    categoryFilter: null,
    stateFilter: null,
    periodFilter: null,
    groupFilter: null
  },
  setSearchQuery: (query) => set((state) => ({ 
    filter: { ...state.filter, searchQuery: query } 
  })),
  setCategoryFilter: (category) => set((state) => ({ 
    filter: { ...state.filter, categoryFilter: category } 
  })),
  setStateFilter: (state) => set((prevState) => ({ 
    filter: { ...prevState.filter, stateFilter: state } 
  })),
  setPeriodFilter: (period) => set((state) => ({ 
    filter: { ...state.filter, periodFilter: period } 
  })),
  setGroupFilter: (group) => set((state) => ({ 
    filter: { ...state.filter, groupFilter: group } 
  })),
  clearFilters: () => set((state) => ({ 
    filter: {
      searchQuery: '',
      categoryFilter: null,
      stateFilter: null,
      periodFilter: null,
      groupFilter: null
    }
  })),
  
  // UI state
  showControls: true,
  toggleControls: () => set((state) => ({ showControls: !state.showControls })),
  
  controlPanelPosition: 'right',
  toggleControlPanelPosition: () => set((state) => ({ 
    controlPanelPosition: state.controlPanelPosition === 'right' ? 'left' : 'right' 
  })),
  
  showAtomicStructure: true,
  toggleAtomicStructure: () => set((state) => ({ 
    showAtomicStructure: !state.showAtomicStructure 
  })),
  
  // Audio settings for harmonic view
  audioEnabled: false,
  toggleAudio: () => set((state) => ({ audioEnabled: !state.audioEnabled })),
  volume: 0.5,
  setVolume: (volume) => set({ volume })
}));
