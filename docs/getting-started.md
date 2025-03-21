---
layout: default
title: Getting Started
nav_order: 2
---

# Getting Started

This guide will help you set up the Periodic Table Visualization project locally.

## Prerequisites

- Node.js 18+ 
- npm or yarn
- Modern browser with WebGL support

## Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/dfrostar/periodic.git
   cd periodic
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Start the development server:
   ```bash
   npm run dev
   ```

4. Open your browser and navigate to `http://localhost:3000`

## Basic Usage

### Importing Components

```tsx
import { PeriodicTable } from '@/components/ui/PeriodicTable';
import { ElementDetails } from '@/components/ui/ElementDetails';
```

### Basic Implementation

```tsx
import { useState } from 'react';
import { PeriodicTable } from '@/components/ui/PeriodicTable';
import { ElementDetails } from '@/components/ui/ElementDetails';
import { Element } from '@/types';

function App() {
  const [selectedElement, setSelectedElement] = useState<Element | null>(null);
  
  return (
    <div className="app-container">
      <PeriodicTable 
        mode="3d"
        colorScheme="atomic-radius"
        onElementSelect={setSelectedElement}
      />
      
      {selectedElement && (
        <ElementDetails element={selectedElement} />
      )}
    </div>
  );
}
```

## Configuration Options

The `PeriodicTable` component accepts the following props:

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `mode` | `'2d' \| '3d'` | `'3d'` | Visualization mode |
| `colorScheme` | `string` | `'category'` | Color scheme for elements |
| `onElementSelect` | `(element: Element) => void` | `undefined` | Selection handler |
| `highlightFilter` | `(element: Element) => boolean` | `undefined` | Highlight elements matching filter |
| `groupVisibility` | `Record<string, boolean>` | `undefined` | Toggle visibility of element groups |
