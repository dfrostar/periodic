---
layout: default
title: API Reference
nav_order: 4
has_children: true
permalink: /api
---

# API Reference

This section documents the APIs used in the Periodic Table Visualization project, including both internal modules and external services.

## API Architecture

![API Architecture](../assets/diagrams/api-architecture.png)

Our API architecture follows these core principles:

1. **Clean Separation**: Clear boundaries between UI, data, and AI layers
2. **Type Safety**: Comprehensive TypeScript interfaces for all API calls
3. **Error Handling**: Standardized error responses across all endpoints
4. **Caching**: Strategic caching for performance optimization
5. **Security**: Input validation and rate limiting on all endpoints

## API Categories

The project uses several categories of APIs:

### Data APIs

- [Element Data API](./element-data) - Core periodic table data
- [Property API](./property-api) - Element property information
- [Trend API](./trend-api) - Periodic table trends

### AI APIs

- [Prediction API](./prediction-api) - Element property predictions
- [Relationship API](./relationship-api) - Element relationship analysis
- [Generation API](./generation-api) - Content generation for elements

### Utility APIs

- [Search API](./search-api) - Element and property search functionality
- [Export API](./export-api) - Data export capabilities
- [User Preferences API](./preferences-api) - User settings management

## Using the API Client

The project includes a type-safe API client for all endpoints:

```tsx
import { api } from '@/lib/api';

// Example: Fetch element data
async function fetchElement(atomicNumber) {
  try {
    const element = await api.elements.getByAtomicNumber(atomicNumber);
    return element;
  } catch (error) {
    if (error.status === 404) {
      console.error(`Element with atomic number ${atomicNumber} not found`);
    } else {
      console.error('Failed to fetch element:', error);
    }
    throw error;
  }
}

// Example: Use with React Query
function useElementData(atomicNumber) {
  return useQuery(
    ['element', atomicNumber],
    () => api.elements.getByAtomicNumber(atomicNumber),
    {
      staleTime: 5 * 60 * 1000, // 5 minutes
      retry: 2,
    }
  );
}
```

## API Client Implementation

Our API client uses a standardized approach for all endpoints:

```tsx
// src/lib/api/index.ts
import { createApiClient } from './client';
import { elementEndpoints } from './endpoints/elements';
import { predictionEndpoints } from './endpoints/predictions';
import { trendEndpoints } from './endpoints/trends';
import { searchEndpoints } from './endpoints/search';

// Create API client with common configuration
const apiClient = createApiClient({
  baseUrl: process.env.REACT_APP_API_URL || '/api',
  headers: {
    'Content-Type': 'application/json',
  },
  // Apply middleware for authentication, logging, etc.
  middleware: [
    authMiddleware,
    loggingMiddleware,
    errorHandlingMiddleware,
  ],
});

// Combine all API endpoints
export const api = {
  elements: elementEndpoints(apiClient),
  predictions: predictionEndpoints(apiClient),
  trends: trendEndpoints(apiClient),
  search: searchEndpoints(apiClient),
  // Additional endpoint groups
};

// Export types
export type { Element, Property, Trend } from './types';
```

## Error Handling

All API calls use a standardized error handling approach:

```tsx
// src/lib/api/client.ts
import { ApiError } from './errors';

// Enhanced fetch with error handling
async function enhancedFetch(url, options) {
  try {
    const response = await fetch(url, options);
    
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      
      throw new ApiError({
        status: response.status,
        statusText: response.statusText,
        message: errorData.message || `API error: ${response.status}`,
        data: errorData,
        url,
      });
    }
    
    return response.json();
  } catch (error) {
    if (error instanceof ApiError) {
      throw error;
    }
    
    // Network or other errors
    throw new ApiError({
      status: 0,
      statusText: 'Network Error',
      message: error.message || 'Failed to connect to API',
      url,
    });
  }
}
```

## Authentication

Some API endpoints require authentication:

```tsx
// src/lib/api/middleware/auth.ts
export function authMiddleware(request) {
  // Get API key from environment
  const apiKey = process.env.REACT_APP_API_KEY;
  
  if (apiKey) {
    // Add authentication headers
    request.headers = {
      ...request.headers,
      'Authorization': `Bearer ${apiKey}`,
    };
  }
  
  return request;
}
```

## Rate Limiting

The API client implements rate limiting protection:

```tsx
// src/lib/api/middleware/rateLimit.ts
export function rateLimitMiddleware(request) {
  // Add rate limiting headers
  request.headers = {
    ...request.headers,
    'X-Rate-Limit-Strategy': 'optimistic',
  };
  
  return request;
}

// Handle rate limit errors
export function handleRateLimitError(error) {
  if (error.status === 429) {
    // Get retry time from header
    const retryAfter = error.headers.get('Retry-After') || 60;
    
    // Show user-friendly message
    showNotification({
      type: 'warning',
      message: `Rate limit exceeded. Please try again in ${retryAfter} seconds.`,
    });
    
    // Implement exponential backoff
    return new Promise(resolve => {
      setTimeout(resolve, retryAfter * 1000);
    });
  }
  
  throw error;
}
```

## Caching Strategy

The API client implements strategic caching:

```tsx
// src/lib/api/cache.ts
import { QueryClient } from 'react-query';

// Configure React Query client with caching strategy
export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      // Common data rarely changes
      staleTime: 5 * 60 * 1000, // 5 minutes
      
      // Keep cached data for a while
      cacheTime: 30 * 60 * 1000, // 30 minutes
      
      // Handle errors
      retry: (failureCount, error) => {
        // Don't retry 404s
        if (error.status === 404) return false;
        
        // Retry other errors up to 3 times
        return failureCount < 3;
      },
      
      // Refresh when window regains focus
      refetchOnWindowFocus: true,
      
      // Refresh when reconnecting
      refetchOnReconnect: true,
    },
  },
});

// Cache invalidation helpers
export const cacheUtils = {
  // Invalidate element data
  invalidateElement: (atomicNumber) => {
    queryClient.invalidateQueries(['element', atomicNumber]);
  },
  
  // Prefetch common data
  prefetchCommonElements: () => {
    // Prefetch frequently accessed elements
    [1, 2, 6, 7, 8, 11, 17, 18].forEach(atomicNumber => {
      queryClient.prefetchQuery(
        ['element', atomicNumber],
        () => api.elements.getByAtomicNumber(atomicNumber)
      );
    });
  },
};
```

## Mock API for Development

During development, we use a mock API:

```tsx
// src/lib/api/mock/index.ts
import { rest } from 'msw';
import { setupWorker } from 'msw/browser';
import { elementMocks } from './elements';
import { predictionMocks } from './predictions';

// Define mock handlers
const handlers = [
  // Element endpoints
  rest.get('/api/elements', elementMocks.getAll),
  rest.get('/api/elements/:atomicNumber', elementMocks.getByAtomicNumber),
  
  // Prediction endpoints
  rest.post('/api/predictions', predictionMocks.predictProperties),
  
  // Additional endpoints
];

// Initialize mock service worker
export const worker = setupWorker(...handlers);

// Start mock API in development
if (process.env.NODE_ENV === 'development' && process.env.REACT_APP_MOCK_API === 'true') {
  worker.start({
    onUnhandledRequest: 'bypass', // Don't warn about unhandled requests
  });
  
  console.log('🔶 Mock API Started');
}
```

## API Documentation

Each API endpoint is documented in its own section:

- [Element API](./element-api)
- [Prediction API](./prediction-api)
- [Trend API](./trend-api)

## Best Practices

When using the API:

1. **Use React Query**: Leverage React Query for data fetching and caching
2. **Error Handling**: Always handle potential errors
3. **Loading States**: Show appropriate loading indicators
4. **TypeScript**: Use the provided TypeScript types
5. **Retries**: Implement exponential backoff for retries
