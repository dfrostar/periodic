---
layout: default
title: Accessibility
nav_order: 8
---

# Accessibility

This document outlines our accessibility standards and implementation details for the Periodic Table Visualization project.

## WCAG Compliance

Our application follows [Web Content Accessibility Guidelines (WCAG) 2.1](https://www.w3.org/TR/WCAG21/) at the AA level.

![Accessibility Overview](assets/diagrams/accessibility-overview.png)

## Key Principles

### 1. Perceivable

- **Text Alternatives**: All non-text content has text alternatives
- **Time-based Media**: Captions and audio descriptions are provided
- **Adaptable**: Content can be presented in different ways
- **Distinguishable**: Content is easy to see and hear

```tsx
// Example: Proper image alt text
<img 
  src="/assets/images/element-bohr.png" 
  alt="Bohr model of Carbon showing 6 electrons in their respective shells" 
/>

// Example: Color is not the only means of conveying information
<ElementCard
  element={element}
  selected={isSelected}
  aria-selected={isSelected}
  className={`element-card ${isSelected ? 'selected' : ''}`}
>
  {/* Card content */}
</ElementCard>
```

### 2. Operable

- **Keyboard Accessible**: All functionality is available from a keyboard
- **Enough Time**: Users have enough time to read and use content
- **Seizures**: Content does not cause seizures or physical reactions
- **Navigable**: Users can navigate and find content easily

```tsx
// Example: Keyboard interaction for element selection
function PeriodicTable() {
  const [focusedIndex, setFocusedIndex] = useState(0);
  const [selectedElement, setSelectedElement] = useState(null);
  
  const handleKeyDown = (event, element, index) => {
    switch (event.key) {
      case 'Enter':
      case ' ':
        setSelectedElement(element);
        break;
      case 'ArrowRight':
        setFocusedIndex(Math.min(focusedIndex + 1, elements.length - 1));
        break;
      case 'ArrowLeft':
        setFocusedIndex(Math.max(focusedIndex - 1, 0));
        break;
      // Handle other arrow keys...
    }
  };
  
  return (
    <div className="periodic-table" role="grid">
      {elements.map((element, index) => (
        <div
          key={element.atomicNumber}
          role="gridcell"
          tabIndex={focusedIndex === index ? 0 : -1}
          onKeyDown={(e) => handleKeyDown(e, element, index)}
          onClick={() => setSelectedElement(element)}
          aria-selected={selectedElement?.atomicNumber === element.atomicNumber}
          ref={focusedIndex === index ? focusRef : null}
        >
          {/* Element content */}
        </div>
      ))}
    </div>
  );
}
```

### 3. Understandable

- **Readable**: Text content is readable and understandable
- **Predictable**: Web pages operate and appear in predictable ways
- **Input Assistance**: Users are helped to avoid and correct mistakes

```tsx
// Example: Clear error messaging with instructions
function ElementSearch() {
  const [query, setQuery] = useState('');
  const [error, setError] = useState('');
  
  const validateQuery = (value) => {
    if (value && !/^[a-zA-Z0-9\s]+$/.test(value)) {
      setError('Please use only letters, numbers and spaces');
      return false;
    }
    setError('');
    return true;
  };
  
  const handleSubmit = (e) => {
    e.preventDefault();
    if (validateQuery(query)) {
      // Perform search
    }
  };
  
  return (
    <form onSubmit={handleSubmit}>
      <label htmlFor="element-search">
        Search elements
        <span className="sr-only">(by name, symbol, or atomic number)</span>
      </label>
      <input
        id="element-search"
        type="text"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        aria-invalid={!!error}
        aria-describedby={error ? "search-error" : undefined}
        placeholder="E.g. Hydrogen, He, or 6"
      />
      {error && (
        <div id="search-error" className="error-message" role="alert">
          {error}
        </div>
      )}
      <button type="submit">Search</button>
    </form>
  );
}
```

### 4. Robust

- **Compatible**: Content is compatible with current and future user tools

```tsx
// Example: Proper ARIA roles and semantic HTML
function ElementDetails({ element }) {
  return (
    <section aria-labelledby="element-title">
      <h2 id="element-title">{element.name}</h2>
      
      <div className="element-properties">
        <dl>
          <div className="property-row">
            <dt>Atomic Number</dt>
            <dd>{element.atomicNumber}</dd>
          </div>
          <div className="property-row">
            <dt>Symbol</dt>
            <dd>{element.symbol}</dd>
          </div>
          {/* More properties */}
        </dl>
      </div>
      
      {/* Interactive features with proper ARIA */}
      <div className="interactive-controls">
        <button
          aria-expanded={showElectronConfig}
          aria-controls="electron-config"
          onClick={() => setShowElectronConfig(!showElectronConfig)}
        >
          {showElectronConfig ? 'Hide' : 'Show'} Electron Configuration
        </button>
        
        <div 
          id="electron-config"
          className="electron-configuration"
          aria-hidden={!showElectronConfig}
        >
          {/* Configuration content */}
        </div>
      </div>
    </section>
  );
}
```

## Visualization Accessibility

Our 3D visualizations present unique accessibility challenges that we address:

1. **Alternative Views**: 2D fallback mode for screen reader users
2. **Keyboard Controls**: Full keyboard navigation of the 3D space
3. **Screen Reader Descriptions**: Detailed descriptions of visual elements
4. **High Contrast Mode**: Support for high contrast display settings

```tsx
// Example: Making 3D visualizations accessible
function AccessibleVisualization() {
  const [mode, setMode] = useState<'2d' | '3d'>('3d');
  
  return (
    <div className="visualization-container">
      <div className="visualization-controls">
        <fieldset>
          <legend>Visualization Mode</legend>
          <div className="radio-group">
            <input
              type="radio"
              id="mode-3d"
              name="mode"
              value="3d"
              checked={mode === '3d'}
              onChange={() => setMode('3d')}
            />
            <label htmlFor="mode-3d">3D Mode</label>
            
            <input
              type="radio"
              id="mode-2d"
              name="mode"
              value="2d"
              checked={mode === '2d'}
              onChange={() => setMode('2d')}
            />
            <label htmlFor="mode-2d">2D Mode (better for screen readers)</label>
          </div>
        </fieldset>
      </div>
      
      {mode === '3d' ? (
        <ThreeDVisualization
          ariaDescription="3D periodic table showing elements arranged by atomic number and properties"
          keyboardControlsEnabled={true}
        />
      ) : (
        <TableVisualization
          ariaDescription="Periodic table in traditional tabular format"
        />
      )}
      
      {/* Screen reader only content */}
      <div className="sr-only">
        <h3>Element Data Table</h3>
        <p>The following table provides the same information as the visualization in a screen reader friendly format.</p>
        <table>
          <thead>
            <tr>
              <th>Atomic Number</th>
              <th>Symbol</th>
              <th>Name</th>
              <th>Category</th>
              <th>Properties</th>
            </tr>
          </thead>
          <tbody>
            {elements.map(element => (
              <tr key={element.atomicNumber}>
                <td>{element.atomicNumber}</td>
                <td>{element.symbol}</td>
                <td>{element.name}</td>
                <td>{element.category}</td>
                <td>{formatElementProperties(element)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
```

## Testing and Compliance

We verify accessibility through:

1. **Automated Testing**: Using axe-core in our testing suite
2. **Manual Testing**: With screen readers (NVDA, VoiceOver, JAWS)
3. **Keyboard Testing**: All functionality tested without a mouse
4. **Color Contrast Verification**: Using conforming tools

```typescript
// Example: Automated accessibility testing in Jest
import { axe } from 'jest-axe';

describe('ElementCard', () => {
  it('should not have accessibility violations', async () => {
    const { container } = render(
      <ElementCard element={mockElement} />
    );
    
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });
});
```

## Accessibility Checklist

Our pull request process includes an accessibility checklist:

- [ ] Semantic HTML used appropriately
- [ ] ARIA attributes used correctly
- [ ] Keyboard navigation tested
- [ ] Color contrast meets WCAG AA standards
- [ ] Screen reader testing completed
- [ ] Focus indicators visible
- [ ] Text resizing tested up to 200%
- [ ] No content flashing at rates that could cause seizures
- [ ] Alternative text provided for all images and visualizations
- [ ] Form inputs have associated labels
