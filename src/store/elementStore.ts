import { create } from 'zustand';
import { Element } from '@/types/element';

interface ElementState {
  selectedElement: Element | null;
  setSelectedElement: (element: Element | null) => void;
  clearSelectedElement: () => void;
}

/**
 * Element store to manage the currently selected element in the Periodic Table
 * Uses Zustand for client state management as per coding standards
 */
export const useElementStore = create<ElementState>((set) => ({
  selectedElement: null,
  
  setSelectedElement: (element) => set({ 
    selectedElement: element 
  }),
  
  clearSelectedElement: () => set({ 
    selectedElement: null 
  }),
}));
