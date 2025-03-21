---
layout: default
title: API Reference
nav_order: 3
---

# API Reference

This document details all components, hooks, and utilities available in the Periodic Table Visualization library.

## Components

### PeriodicTable

The main visualization component that renders the interactive periodic table.

```tsx
import { PeriodicTable } from '@/components/ui/PeriodicTable';

<PeriodicTable 
  mode="3d"
  colorScheme="electronegativity"
  onElementSelect={(element) => console.log(element)}
/>
```

#### Props

| Prop | Type | Description |
|------|------|-------------|
| `mode` | `'2d' \| '3d'` | Visualization mode |
| `colorScheme` | `string` | Property to use for coloring elements |
| `onElementSelect` | `(element: Element) => void` | Callback when an element is selected |
| `highlightFilter` | `(element: Element) => boolean` | Function to determine which elements to highlight |
| `zoom` | `number` | Initial zoom level (0.5-2.0) |
| `showLabels` | `boolean` | Whether to show element labels |
| `theme` | `'light' \| 'dark'` | UI theme |

### ElementDetails

Component for displaying detailed information about a selected element.

```tsx
import { ElementDetails } from '@/components/ui/ElementDetails';

<ElementDetails 
  element={selectedElement}
  showElectronConfiguration={true}
/>
```

#### Props

| Prop | Type | Description |
|------|------|-------------|
| `element` | `Element` | The element to display details for |
| `showElectronConfiguration` | `boolean` | Whether to show electron configuration |
| `showIsotopes` | `boolean` | Whether to show isotope information |
| `onClose` | `() => void` | Callback when the details panel is closed |

## Hooks

### useElementData

Hook for accessing element data and properties.

```tsx
import { useElementData } from '@/lib/hooks/useElementData';

function MyComponent() {
  const { elements, loading, error } = useElementData();
  
  if (loading) return <p>Loading elements...</p>;
  if (error) return <p>Error loading elements: {error.message}</p>;
  
  return <div>{elements.length} elements loaded</div>;
}
```

### useColorScheme

Hook for generating element colors based on properties.

```tsx
import { useColorScheme } from '@/lib/hooks/useColorScheme';

function MyComponent({ elements }) {
  const { getElementColor } = useColorScheme('atomic-radius');
  
  return (
    <div>
      {elements.map(element => (
        <div 
          key={element.atomicNumber}
          style={{ backgroundColor: getElementColor(element) }}
        >
          {element.symbol}
        </div>
      ))}
    </div>
  );
}
```

## Utilities

### filterElements

Utility functions for filtering elements based on various criteria.

```tsx
import { filterElements } from '@/lib/utils/filterElements';

const metalElements = filterElements(elements, { 
  category: 'metal',
  discoveredAfter: 1900
});
```

### formatElementProperty

Format element properties with correct units and precision.

```tsx
import { formatElementProperty } from '@/lib/utils/formatElementProperty';

const formattedRadius = formatElementProperty(element, 'atomicRadius');
// "184 pm"
```
