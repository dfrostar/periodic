---
layout: default
title: ElementPredictor
parent: AI Components
grand_parent: Components
---

# ElementPredictor Component

The `ElementPredictor` component uses AI to predict properties of undiscovered or theoretical elements, following the project's AI integration architecture.

![ElementPredictor Component](../../assets/diagrams/elementpredictor-component.png)

## Import

```tsx
import { ElementPredictor } from '@/components/ai/ElementPredictor';
```

## Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `atomicNumber` | `number` | Required | Atomic number to predict (typically > 118) |
| `properties` | `string[]` | `['electronegativity', 'atomicRadius', 'ionizationEnergy']` | Properties to predict |
| `fallbackEnabled` | `boolean` | `true` | Whether to use fallback mode when AI is unavailable |
| `maxLatency` | `number` | `3000` | Maximum wait time (ms) before showing fallback |
| `cacheResults` | `boolean` | `true` | Whether to cache prediction results |
| `onPredictionComplete` | `(prediction: ElementPrediction) => void` | `undefined` | Callback when prediction completes |
| `onError` | `(error: Error) => void` | `undefined` | Callback when prediction fails |

## Examples

### Basic Usage

```tsx
import { ElementPredictor } from '@/components/ai/ElementPredictor';

function TheoreticalElement() {
  return (
    <div className="theoretical-element">
      <h2>Element 119</h2>
      <ElementPredictor atomicNumber={119} />
    </div>
  );
}
```

### With Custom Properties and Callbacks

```tsx
import { useState } from 'react';
import { ElementPredictor } from '@/components/ai/ElementPredictor';
import { ElementPrediction } from '@/types';

function TheoreticalElementExplorer() {
  const [prediction, setPrediction] = useState<ElementPrediction | null>(null);
  const [error, setError] = useState<Error | null>(null);
  
  return (
    <div className="explorer">
      <ElementPredictor
        atomicNumber={120}
        properties={['meltingPoint', 'density', 'electronAffinity']}
        onPredictionComplete={setPrediction}
        onError={setError}
      />
      
      {prediction && (
        <div className="prediction-results">
          <h3>Predicted Properties</h3>
          <dl>
            {Object.entries(prediction.properties).map(([key, value]) => (
              <div key={key} className="property">
                <dt>{key}</dt>
                <dd>{value}</dd>
              </div>
            ))}
          </dl>
        </div>
      )}
      
      {error && (
        <div className="error-message">
          Failed to generate prediction: {error.message}
        </div>
      )}
    </div>
  );
}
```

### With Fallback Control

```tsx
import { ElementPredictor } from '@/components/ai/ElementPredictor';

function PerformanceSensitivePredictor() {
  return (
    <ElementPredictor
      atomicNumber={121}
      fallbackEnabled={true}
      maxLatency={1500} // Show fallback after 1.5s
      cacheResults={true}
    />
  );
}
```

## Implementation Details

### Component Structure

```tsx
// src/components/ai/ElementPredictor/ElementPredictor.tsx
import React, { useEffect } from 'react';
import { ErrorBoundary } from 'react-error-boundary';
import { useElementPrediction } from '@/lib/hooks/useElementPrediction';
import { ElementFallback } from './ElementFallback';
import { ElementPredictionError } from './ElementPredictionError';
import { ElementPrediction } from '@/types';
import './ElementPredictor.css';

export interface ElementPredictorProps {
  atomicNumber: number;
  properties?: string[];
  fallbackEnabled?: boolean;
  maxLatency?: number;
  cacheResults?: boolean;
  onPredictionComplete?: (prediction: ElementPrediction) => void;
  onError?: (error: Error) => void;
}

export const ElementPredictor: React.FC<ElementPredictorProps> = ({
  atomicNumber,
  properties = ['electronegativity', 'atomicRadius', 'ionizationEnergy'],
  fallbackEnabled = true,
  maxLatency = 3000,
  cacheResults = true,
  onPredictionComplete,
  onError,
}) => {
  // Separate AI state using the project architecture pattern
  const { 
    prediction, 
    isLoading, 
    error, 
    latency,
    fetchPrediction,
    reset
  } = useElementPrediction({
    atomicNumber,
    properties,
    cacheResults,
  });

  // Show fallback if loading takes too long
  const showFallback = fallbackEnabled && (latency > maxLatency || error);

  useEffect(() => {
    if (prediction && onPredictionComplete) {
      onPredictionComplete(prediction);
    }
  }, [prediction, onPredictionComplete]);

  useEffect(() => {
    if (error && onError) {
      onError(error);
    }
  }, [error, onError]);

  // AI-specific error boundary
  return (
    <ErrorBoundary
      FallbackComponent={ElementPredictionError}
      onReset={reset}
      resetKeys={[atomicNumber, ...properties]}
    >
      <div className="element-predictor" data-testid="element-predictor">
        {showFallback ? (
          <ElementFallback 
            atomicNumber={atomicNumber} 
            properties={properties} 
          />
        ) : (
          <div className="prediction-content">
            <h3>Element {atomicNumber} Predictions</h3>
            
            {isLoading ? (
              <div className="prediction-loading">
                <span className="loading-indicator" aria-hidden="true" />
                <span>Analyzing periodic trends and generating predictions...</span>
              </div>
            ) : prediction ? (
              <div className="prediction-results">
                <div className="element-card theoretical">
                  <div className="atomic-number">{atomicNumber}</div>
                  <div className="symbol">{prediction.symbol}</div>
                  <div className="name">{prediction.name}</div>
                  <div className="category">{prediction.category}</div>
                </div>
                
                <div className="properties">
                  {Object.entries(prediction.properties).map(([key, value]) => (
                    <div key={key} className="property-row">
                      <span className="property-name">{key}</span>
                      <span className="property-value">{value}</span>
                      <span className="confidence-indicator" 
                          style={{ width: `${prediction.confidence[key] * 100}%` }}
                          title={`${Math.round(prediction.confidence[key] * 100)}% confidence`} 
                      />
                    </div>
                  ))}
                </div>
                
                <div className="confidence-note">
                  <small>* Predictions based on periodic trends with confidence indicators shown</small>
                </div>
              </div>
            ) : (
              <div className="start-prediction">
                <button onClick={() => fetchPrediction()}>
                  Generate Predictions
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </ErrorBoundary>
  );
};
```

### AI State Hook

Following our architecture pattern for separating AI state from UI state:

```tsx
// src/lib/hooks/useElementPrediction.ts
import { useState, useEffect, useRef } from 'react';
import { useQuery } from 'react-query';
import { useAIStore } from '@/lib/stores/aiStore';
import { predictElement } from '@/lib/api/elementPrediction';
import { ElementPrediction } from '@/types';

interface UseElementPredictionProps {
  atomicNumber: number;
  properties: string[];
  cacheResults?: boolean;
}

export function useElementPrediction({
  atomicNumber,
  properties,
  cacheResults = true,
}: UseElementPredictionProps) {
  const startTimeRef = useRef<number | null>(null);
  const [latency, setLatency] = useState(0);
  
  // AI state is kept separate from UI state
  const { setGenerating, setError: setAIError } = useAIStore();
  
  const {
    data: prediction,
    isLoading,
    error,
    refetch,
    remove,
  } = useQuery<ElementPrediction, Error>(
    ['elementPrediction', atomicNumber, properties],
    async () => {
      startTimeRef.current = performance.now();
      setGenerating(true);
      
      try {
        // Stream responses for long-running predictions
        const result = await predictElement(atomicNumber, properties);
        
        setLatency(performance.now() - (startTimeRef.current || 0));
        setGenerating(false);
        
        return result;
      } catch (err) {
        const error = err instanceof Error ? err : new Error('Unknown error');
        setAIError(error);
        setGenerating(false);
        throw error;
      }
    },
    {
      enabled: false, // Don't fetch on mount
      retry: 2,       // Retry failed requests twice
      staleTime: cacheResults ? 1000 * 60 * 30 : 0, // 30 minute cache if enabled
      onError: (error) => {
        console.error('Element prediction failed:', error);
        setLatency(performance.now() - (startTimeRef.current || 0));
      },
    }
  );
  
  const reset = () => {
    remove();
    startTimeRef.current = null;
    setLatency(0);
  };
  
  return {
    prediction,
    isLoading,
    error,
    latency,
    fetchPrediction: refetch,
    reset,
  };
}
```

### Fallback Component

Non-AI fallback for when AI services are unavailable:

```tsx
// src/components/ai/ElementPredictor/ElementFallback.tsx
import React from 'react';
import { extrapolateElement } from '@/lib/utils/elementExtrapolation';

interface ElementFallbackProps {
  atomicNumber: number;
  properties: string[];
}

export const ElementFallback: React.FC<ElementFallbackProps> = ({
  atomicNumber,
  properties,
}) => {
  // Use non-AI extrapolation based on periodic trends
  const extrapolation = extrapolateElement(atomicNumber, properties);
  
  return (
    <div className="element-fallback">
      <div className="fallback-notice">
        <p>
          <strong>Using extrapolated data.</strong> AI predictions are currently unavailable.
          Showing estimates based on periodic trends.
        </p>
      </div>
      
      <div className="element-card theoretical fallback">
        <div className="atomic-number">{atomicNumber}</div>
        <div className="symbol">{extrapolation.symbol}</div>
        <div className="name">{extrapolation.name}</div>
        <div className="category">{extrapolation.category}</div>
      </div>
      
      <div className="properties">
        {Object.entries(extrapolation.properties).map(([key, value]) => (
          <div key={key} className="property-row">
            <span className="property-name">{key}</span>
            <span className="property-value">{value}</span>
            <span className="extrapolation-indicator" />
          </div>
        ))}
      </div>
      
      <div className="extrapolation-note">
        <small>* Values are extrapolated from known elements using periodic trends</small>
      </div>
    </div>
  );
};
```

## State Architecture

The component follows our project's state architecture:

1. **AI State**: Managed in a dedicated Zustand store
2. **UI State**: Managed by the component or parent components
3. **Separation of Concerns**: AI logic isolated from UI logic

```tsx
// src/lib/stores/aiStore.ts
import create from 'zustand';

interface AIState {
  isGenerating: boolean;
  generationError: Error | null;
  setGenerating: (isGenerating: boolean) => void;
  setError: (error: Error | null) => void;
  resetState: () => void;
}

export const useAIStore = create<AIState>((set) => ({
  isGenerating: false,
  generationError: null,
  setGenerating: (isGenerating) => set({ isGenerating }),
  setError: (error) => set({ generationError: error }),
  resetState: () => set({ isGenerating: false, generationError: null }),
}));
```

## Accessibility

The component implements several accessibility features:

1. **Loading States**: Properly communicated to screen readers
2. **Error Handling**: Accessible error messages
3. **Keyboard Navigation**: All interactive elements are keyboard accessible
4. **Screen Reader Support**: AI-generated content is properly labeled
5. **Confidence Indicators**: Visual indicators have text alternatives

## Testing

```tsx
// src/components/ai/ElementPredictor/ElementPredictor.test.tsx
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { QueryClientProvider, QueryClient } from 'react-query';
import { ElementPredictor } from './ElementPredictor';
import { mockPredictElement } from '@/lib/api/__mocks__/elementPrediction';

// Mock the API call
jest.mock('@/lib/api/elementPrediction');

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: false,
    },
  },
});

const wrapper = ({ children }: { children: React.ReactNode }) => (
  <QueryClientProvider client={queryClient}>
    {children}
  </QueryClientProvider>
);

describe('ElementPredictor', () => {
  beforeEach(() => {
    queryClient.clear();
  });
  
  it('shows loading state when fetching prediction', async () => {
    // Setup mock to delay response
    (mockPredictElement as jest.Mock).mockImplementation(
      () => new Promise(resolve => setTimeout(resolve, 100))
    );
    
    render(<ElementPredictor atomicNumber={119} />, { wrapper });
    
    // Click to start prediction
    fireEvent.click(screen.getByText('Generate Predictions'));
    
    expect(screen.getByText(/Analyzing periodic trends/i)).toBeInTheDocument();
  });
  
  it('displays prediction results when API call succeeds', async () => {
    // Setup mock response
    const mockPrediction = {
      symbol: 'Uue',
      name: 'Ununennium',
      category: 'alkali metal',
      properties: {
        electronegativity: 0.7,
        atomicRadius: 235,
      },
      confidence: {
        electronegativity: 0.85,
        atomicRadius: 0.78,
      },
    };
    
    (mockPredictElement as jest.Mock).mockResolvedValue(mockPrediction);
    
    render(<ElementPredictor atomicNumber={119} />, { wrapper });
    
    // Click to start prediction
    fireEvent.click(screen.getByText('Generate Predictions'));
    
    await waitFor(() => {
      expect(screen.getByText('Ununennium')).toBeInTheDocument();
      expect(screen.getByText('0.7')).toBeInTheDocument();
      expect(screen.getByText('235')).toBeInTheDocument();
    });
  });
  
  it('shows fallback when AI service fails', async () => {
    // Setup mock to throw error
    (mockPredictElement as jest.Mock).mockRejectedValue(
      new Error('AI service unavailable')
    );
    
    render(
      <ElementPredictor 
        atomicNumber={119}
        fallbackEnabled={true}
        maxLatency={0} // Show fallback immediately on error
      />, 
      { wrapper }
    );
    
    // Click to start prediction
    fireEvent.click(screen.getByText('Generate Predictions'));
    
    await waitFor(() => {
      expect(screen.getByText(/Using extrapolated data/i)).toBeInTheDocument();
    });
  });
  
  it('calls onPredictionComplete when prediction succeeds', async () => {
    const mockPrediction = {
      symbol: 'Uue',
      name: 'Ununennium',
      category: 'alkali metal',
      properties: { electronegativity: 0.7 },
      confidence: { electronegativity: 0.85 },
    };
    
    (mockPredictElement as jest.Mock).mockResolvedValue(mockPrediction);
    
    const handleComplete = jest.fn();
    
    render(
      <ElementPredictor 
        atomicNumber={119}
        onPredictionComplete={handleComplete}
      />, 
      { wrapper }
    );
    
    // Click to start prediction
    fireEvent.click(screen.getByText('Generate Predictions'));
    
    await waitFor(() => {
      expect(handleComplete).toHaveBeenCalledWith(mockPrediction);
    });
  });
});
```

## Related Components

- [`TrendPredictor`](./TrendPredictor) - Predict periodic table trends
- [`ElementRelationship`](./ElementRelationship) - Show element relationships
- [`ElementCard`](../ui/ElementCard) - Display element information
