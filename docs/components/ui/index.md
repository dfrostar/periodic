---
layout: default
title: UI Components
parent: Components
has_children: true
---

# UI Components

The UI components form the core visual interface of the Periodic Table Visualization project, following our established architectural patterns.

## UI Component Library

![UI Component Library](../../assets/diagrams/ui-component-overview.png)

## Core Components

### Element Display

- [`PeriodicTable`](./PeriodicTable) - Main periodic table visualization
- [`ElementCard`](./ElementCard) - Individual element card
- [`ElementDetails`](./ElementDetails) - Detailed element information
- [`ElectronConfiguration`](./ElectronConfiguration) - Electron shell visualization

### Controls and Interaction

- [`ControlPanel`](./ControlPanel) - Main user controls
- [`PropertySelector`](./PropertySelector) - Select element properties to display
- [`ElementSearch`](./ElementSearch) - Search for elements
- [`ViewToggle`](./ViewToggle) - Toggle between 2D and 3D views

### Visualization

- [`PropertyOverlay`](./PropertyOverlay) - Visualize element properties
- [`TrendVisualizer`](./TrendVisualizer) - Show periodic trends
- [`ElementComparison`](./ElementComparison) - Compare multiple elements

## Component Patterns

UI components follow these patterns:

1. **Controlled Components**: State is passed via props
2. **Composition**: Complex UIs built from simpler components
3. **Progressive Enhancement**: Core functionality works without JavaScript
4. **Mobile-First**: Responsive design from the ground up

## Usage Example

```tsx
import { PeriodicTable, ControlPanel, ElementDetails } from '@/components/ui';

function PeriodicTableApp() {
  const [selectedElement, setSelectedElement] = useState(null);
  const [colorScheme, setColorScheme] = useState('category');
  const [viewMode, setViewMode] = useState('3d');
  
  return (
    <div className="periodic-table-app">
      <ControlPanel
        colorScheme={colorScheme}
        onColorSchemeChange={setColorScheme}
        viewMode={viewMode}
        onViewModeChange={setViewMode}
      />
      
      <PeriodicTable
        colorScheme={colorScheme}
        viewMode={viewMode}
        onElementSelect={setSelectedElement}
      />
      
      {selectedElement && (
        <ElementDetails
          element={selectedElement}
          onClose={() => setSelectedElement(null)}
        />
      )}
    </div>
  );
}
```

## Implementation Guidelines

When building UI components:

1. **Accessibility First**: Ensure all components meet WCAG AA standards
2. **Keyboard Navigation**: All interactive elements must be keyboard accessible
3. **PropTypes**: Document all props with TypeScript interfaces
4. **Styling**: Use CSS modules for component-specific styles
5. **Testing**: Write unit tests for all component behaviors
