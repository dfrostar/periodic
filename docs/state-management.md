---
layout: default
title: State Management
nav_order: 4
---

# State Management

This project implements a robust state management approach using Zustand and React Query, following the architecture patterns outlined in the project requirements.

## Core Architecture

![State Management Architecture](assets/state-diagram.png)

### Client State (Zustand)

UI state is managed with Zustand stores, providing:

```tsx
// Example visualization state store
import create from 'zustand';

interface VisualizationState {
  mode: '2d' | '3d';
  colorScheme: string;
  zoom: number;
  setMode: (mode: '2d' | '3d') => void;
  setColorScheme: (scheme: string) => void;
  setZoom: (zoom: number) => void;
}

export const useVisualizationStore = create<VisualizationState>((set) => ({
  mode: '3d',
  colorScheme: 'atomic-radius',
  zoom: 1,
  setMode: (mode) => set({ mode }),
  setColorScheme: (colorScheme) => set({ colorScheme }),
  setZoom: (zoom) => set({ zoom }),
}));
```

### Server State (React Query)

Data fetching and caching are handled with React Query:

```tsx
// Example element data fetching
import { useQuery } from 'react-query';
import { fetchElements } from '@/lib/api';

export function useElementData() {
  return useQuery('elements', fetchElements, {
    staleTime: 1000 * 60 * 60, // 1 hour
    cacheTime: 1000 * 60 * 60 * 24, // 24 hours
    refetchOnWindowFocus: false,
    onError: (error) => {
      console.error('Failed to fetch element data:', error);
    }
  });
}
```

### State Separation

Following the project guidelines, AI and UI states are kept separate:

```tsx
// AI state store
export const useAIStore = create<AIState>((set) => ({
  isGenerating: false,
  generationError: null,
  lastResponse: null,
  setGenerating: (isGenerating) => set({ isGenerating }),
  setError: (error) => set({ generationError: error }),
  setResponse: (response) => set({ lastResponse: response }),
}));

// UI state is in a separate store
export const useUIStore = create<UIState>(() => ({
  // UI-specific state
}));
```

## Error Boundaries

The state management architecture includes comprehensive error boundaries:

```tsx
import { ErrorBoundary } from 'react-error-boundary';
import { useQueryErrorResetBoundary } from 'react-query';

function ElementExplorer() {
  const { reset } = useQueryErrorResetBoundary();
  
  return (
    <ErrorBoundary
      onReset={reset}
      fallbackRender={({ error, resetErrorBoundary }) => (
        <div className="error-container">
          <h3>Error loading element data</h3>
          <pre>{error.message}</pre>
          <button onClick={resetErrorBoundary}>Try again</button>
        </div>
      )}
    >
      <PeriodicTable />
    </ErrorBoundary>
  );
}
```

## Performance Optimizations

State updates are optimized to prevent unnecessary renders:

1. **Selector Functions**: Only subscribe to the specific state slices needed
2. **Shallow Comparisons**: Prevent re-renders when objects reference changes but values remain the same
3. **Debounced Updates**: For high-frequency state changes like zoom level

```tsx
// Example of optimized state selector
const zoom = useVisualizationStore(state => state.zoom);
```
