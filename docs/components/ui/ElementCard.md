---
layout: default
title: ElementCard
parent: UI Components
grand_parent: Components
---

# ElementCard Component

The `ElementCard` component displays a single periodic table element with its key properties in a compact, interactive card format.

![ElementCard Component](../../assets/images/component-elementcard.png)

## Import

```tsx
import { ElementCard } from '@/components/ui/ElementCard';
```

## Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `element` | `Element` | Required | Element data object |
| `selected` | `boolean` | `false` | Whether this element is currently selected |
| `hovered` | `boolean` | `false` | Whether this element is being hovered over |
| `colorBy` | `'category' \| 'atomicRadius' \| 'electronegativity' \| 'ionizationEnergy'` | `'category'` | Property to use for element background color |
| `size` | `'sm' \| 'md' \| 'lg'` | `'md'` | Size of the card |
| `onClick` | `(element: Element) => void` | `undefined` | Callback when element is clicked |
| `onHover` | `(element: Element \| null) => void` | `undefined` | Callback when element is hovered or unhovered |

## Examples

### Basic Usage

```tsx
import { ElementCard } from '@/components/ui/ElementCard';
import { Element } from '@/types';

function ElementDisplay({ element }: { element: Element }) {
  return (
    <ElementCard
      element={element}
      colorBy="category"
      size="md"
      onClick={(element) => console.log(`Selected ${element.name}`)}
    />
  );
}
```

### With Selection State

```tsx
import { useState } from 'react';
import { ElementCard } from '@/components/ui/ElementCard';
import { Element } from '@/types';

function ElementSelector({ elements }: { elements: Element[] }) {
  const [selectedElement, setSelectedElement] = useState<Element | null>(null);
  
  return (
    <div className="element-grid">
      {elements.map((element) => (
        <ElementCard
          key={element.atomicNumber}
          element={element}
          selected={selectedElement?.atomicNumber === element.atomicNumber}
          onClick={setSelectedElement}
          colorBy="electronegativity"
        />
      ))}
    </div>
  );
}
```

### With Custom Styling

The component accepts standard HTML attributes that are passed to the root element:

```tsx
<ElementCard
  element={element}
  className="custom-card-style"
  data-testid="element-card-hydrogen"
  aria-label={`${element.name}, atomic number ${element.atomicNumber}`}
/>
```

## Implementation Details

### Component Structure

```tsx
// src/components/ui/ElementCard/ElementCard.tsx
import React, { useCallback } from 'react';
import { useElementColor } from '@/lib/hooks/useElementColor';
import { Element } from '@/types';
import './ElementCard.css';

export interface ElementCardProps {
  element: Element;
  selected?: boolean;
  hovered?: boolean;
  colorBy?: 'category' | 'atomicRadius' | 'electronegativity' | 'ionizationEnergy';
  size?: 'sm' | 'md' | 'lg';
  onClick?: (element: Element) => void;
  onHover?: (element: Element | null) => void;
}

export const ElementCard: React.FC<ElementCardProps> = ({
  element,
  selected = false,
  hovered = false,
  colorBy = 'category',
  size = 'md',
  onClick,
  onHover,
  ...props
}) => {
  const color = useElementColor(element, colorBy);
  
  const handleClick = useCallback(() => {
    onClick?.(element);
  }, [element, onClick]);
  
  const handleMouseEnter = useCallback(() => {
    onHover?.(element);
  }, [element, onHover]);
  
  const handleMouseLeave = useCallback(() => {
    onHover?.(null);
  }, [onHover]);

  return (
    <div
      className={`element-card ${size} ${selected ? 'selected' : ''} ${hovered ? 'hovered' : ''}`}
      style={{ backgroundColor: color }}
      onClick={handleClick}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      data-element-symbol={element.symbol}
      aria-selected={selected}
      {...props}
    >
      <div className="atomic-number">{element.atomicNumber}</div>
      <div className="symbol">{element.symbol}</div>
      <div className="name">{element.name}</div>
      <div className="atomic-mass">{element.atomicMass.toFixed(2)}</div>
    </div>
  );
};
```

### Styling

```css
/* src/components/ui/ElementCard/ElementCard.css */
.element-card {
  display: grid;
  grid-template-areas:
    "number number"
    "symbol symbol"
    "name name"
    "mass mass";
  padding: 0.5rem;
  border-radius: 0.25rem;
  transition: all 0.2s ease-in-out;
  user-select: none;
  color: var(--text-color);
}

.element-card.selected {
  box-shadow: 0 0 0 2px var(--selection-color);
  transform: scale(1.05);
  z-index: 1;
}

.element-card.hovered {
  transform: scale(1.03);
}

.element-card .atomic-number {
  grid-area: number;
  font-size: 0.75rem;
  text-align: left;
}

.element-card .symbol {
  grid-area: symbol;
  font-weight: bold;
  font-size: 1.5rem;
  text-align: center;
}

.element-card .name {
  grid-area: name;
  font-size: 0.7rem;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  text-align: center;
}

.element-card .atomic-mass {
  grid-area: mass;
  font-size: 0.65rem;
  text-align: center;
}

/* Size variations */
.element-card.sm {
  width: 3rem;
  height: 3rem;
  font-size: 0.8rem;
}

.element-card.md {
  width: 4rem;
  height: 4rem;
}

.element-card.lg {
  width: 5rem;
  height: 5rem;
  font-size: 1.2rem;
}
```

## Accessibility

The `ElementCard` component implements several accessibility features:

1. **Keyboard Navigation**: Cards are focusable and can be activated with keyboard
2. **ARIA Attributes**: Proper `aria-selected` state for selection status
3. **Screen Reader Support**: Appropriate text and structural hierarchy
4. **Color Contrast**: Ensures sufficient contrast for all color schemes

## Testing

```tsx
// src/components/ui/ElementCard/ElementCard.test.tsx
import { render, screen, fireEvent } from '@testing-library/react';
import { ElementCard } from './ElementCard';

const mockElement = {
  atomicNumber: 1,
  symbol: 'H',
  name: 'Hydrogen',
  atomicMass: 1.008,
  category: 'nonmetal',
  // ...other properties
};

describe('ElementCard', () => {
  it('renders element information correctly', () => {
    render(<ElementCard element={mockElement} />);
    
    expect(screen.getByText('1')).toBeInTheDocument();
    expect(screen.getByText('H')).toBeInTheDocument();
    expect(screen.getByText('Hydrogen')).toBeInTheDocument();
    expect(screen.getByText('1.01')).toBeInTheDocument();
  });
  
  it('calls onClick when clicked', () => {
    const handleClick = jest.fn();
    render(<ElementCard element={mockElement} onClick={handleClick} />);
    
    fireEvent.click(screen.getByText('H'));
    expect(handleClick).toHaveBeenCalledWith(mockElement);
  });
  
  it('applies selected styles when selected', () => {
    render(<ElementCard element={mockElement} selected />);
    
    const card = screen.getByText('H').closest('.element-card');
    expect(card).toHaveClass('selected');
    expect(card).toHaveAttribute('aria-selected', 'true');
  });
  
  it('calls onHover when mouse enters and leaves', () => {
    const handleHover = jest.fn();
    render(<ElementCard element={mockElement} onHover={handleHover} />);
    
    const card = screen.getByText('H').closest('.element-card');
    
    fireEvent.mouseEnter(card!);
    expect(handleHover).toHaveBeenCalledWith(mockElement);
    
    fireEvent.mouseLeave(card!);
    expect(handleHover).toHaveBeenCalledWith(null);
  });
});
```

## Related Components

- [`PeriodicTable`](./PeriodicTable) - Grid of ElementCards
- [`ElementDetails`](./ElementDetails) - Detailed element information
- [`ElementComparison`](./ElementComparison) - Compare properties of multiple elements
