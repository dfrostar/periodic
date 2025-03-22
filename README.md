# Periodic Table Visualization

Interactive visualization of the periodic table of elements with 2D, 3D, and harmonic views, detailed element information, and atomic structure visualization.

## Features
- Multiple visualization modes:
  - 2D classic periodic table layout
  - 3D interactive cube representation
  - Harmonic visualization based on spectral and musical properties
- Atomic structure visualization showing protons, neutrons, and electrons
- Color schemes based on element categories, physical states, atomic radius, and musical notes
- Detailed element property information
- Interactive interface with element selection
- Responsive design for various screen sizes
- Error boundaries for robust error handling

## Tech Stack
- **Framework**: Next.js with React
- **State Management**: Zustand for client state
- **Data Fetching**: React Query
- **3D Rendering**: Three.js with React Three Fiber
- **Styling**: CSS Modules
- **Type Safety**: TypeScript

## Project Structure
```
/src
  /components
    /ui           # UI components
    /ai           # AI-related components (future use)
  /lib            # Utility functions
  /store          # State management
  /styles         # CSS modules
  /types          # TypeScript type definitions
  /pages          # Next.js pages
/public
  /data           # Static data files
/docs             # Documentation
```

## Installation
```bash
# Clone the repository
git clone https://github.com/dfrostar/periodic.git
cd periodic

# Install dependencies
npm install

# Start the development server
npm run dev
```

## Usage
The application provides an interactive interface for exploring the periodic table. Users can:
- Switch between 2D, 3D, and harmonic view modes
- Change coloring schemes to visualize different element properties
- Click on elements to view detailed information and atomic structure
- Rotate and zoom the 3D visualization
- Explore elements based on their musical and spectral properties in harmonic mode

### Component Examples
```jsx
// Use the PeriodicTable component with different modes and color schemes
<PeriodicTable 
  mode="3d"
  colorScheme="atomic-radius"
/>

// Use the AtomicStructure component to display atomic structure
<AtomicStructure element={selectedElement} />

// Use the PeriodicTableHarmonic component for musical visualization
<PeriodicTableHarmonic colorScheme="spectral" />
```

## Atomic Structure Visualization
The application features a detailed atomic structure visualization that shows:
- Protons (red) and neutrons (blue) clustered in the nucleus
- Electrons (green) orbiting in electron shells
- Accurate particle counts based on actual element data
- Interactive 3D view with camera controls

## Deployment
The application is configured for deployment on Vercel:

```bash
# Build for production
npm run build

# Export as static site
npm run export

# Deploy to Vercel
vercel --prod
```

## Error Handling
The application uses React Error Boundaries to catch and display errors gracefully without crashing the entire application. 

## Contributing
Contributions are welcome! Please follow these steps:

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/amazing-feature`
3. Commit your changes: `git commit -m 'Add amazing feature'`
4. Push to the branch: `git push origin feature/amazing-feature`
5. Open a Pull Request

## License
This project is licensed under the MIT License.
