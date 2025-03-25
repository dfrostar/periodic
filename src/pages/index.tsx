import React, { useState } from 'react';
import Head from 'next/head';
import PeriodicTable from '@/components/ui/PeriodicTable';
import PeriodicTable3D from '@/components/ui/PeriodicTable3D';
import PeriodicTableR3F from '@/components/ui/PeriodicTableR3F';
import ControlPanel from '@/components/ui/ControlPanel';
import ElementDetails from '@/components/ui/ElementDetails';
import AtomicStructure from '@/components/ui/AtomicStructure';
import { useElementStore } from '@/store/elementStore';
import styles from '@/styles/Home.module.css';

// Type definitions
type ViewMode = '2d' | '3d' | 'r3f' | 'harmonic';
type VisualizationType = 'spiral' | 'table' | 'harmonic' | 'orbital';
type ColorScheme = 'category' | 'state' | 'atomic-radius' | 'frequency' | 'octave';

/**
 * Home page component for the Periodic Table Visualization
 * Manages view mode and color scheme state
 */
export default function Home() {
  const [viewMode, setViewMode] = useState<ViewMode>('r3f');
  const [colorScheme, setColorScheme] = useState<ColorScheme>('category');
  const [visualizationType, setVisualizationType] = useState<VisualizationType>('spiral');
  const [showControls, setShowControls] = useState<boolean>(true);
  const [controlPanelPosition, setControlPanelPosition] = useState<'left' | 'right'>('right');
  const selectedElement = useElementStore(state => state.selectedElement);

  // Handler for view mode changes
  const handleViewModeChange = (mode: ViewMode) => {
    setViewMode(mode);
    
    // Set appropriate visualization type when view mode changes
    if (mode === 'harmonic') {
      setVisualizationType('harmonic');
    } else if (mode === '2d') {
      // Keep the current visualization type for other modes
    }
  };

  // Handler for visualization type changes
  const handleVisualizationTypeChange = (type: VisualizationType) => {
    setVisualizationType(type);
  };

  // Handler for color scheme changes
  const handleColorSchemeChange = (scheme: ColorScheme) => {
    setColorScheme(scheme);
  };

  // Toggle controls panel visibility
  const toggleControls = () => {
    setShowControls(!showControls);
  };

  // Toggle control panel position
  const toggleControlPanelPosition = () => {
    setControlPanelPosition(prev => prev === 'right' ? 'left' : 'right');
  };

  return (
    <div className={styles.container}>
      <Head>
        <title>Interactive Periodic Table Visualization</title>
        <meta name="description" content="Explore the periodic table of elements in 2D and 3D visualizations" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <main className={styles.main}>
        {/* Toggle Button for Controls */}
        <button 
          className={styles.controlToggle}
          onClick={toggleControls}
          aria-expanded={showControls}
          aria-controls="controls-panel"
        >
          {showControls ? 'Hide Controls' : 'Show Controls'}
        </button>

        {/* Toggle Button for Control Panel Position */}
        {showControls && (
          <button 
            className={styles.positionToggle}
            onClick={toggleControlPanelPosition}
            aria-label={`Move panel to ${controlPanelPosition === 'right' ? 'left' : 'right'} side`}
          >
            Move to {controlPanelPosition === 'right' ? 'Left' : 'Right'}
          </button>
        )}

        {/* Side Control Panel */}
        {showControls && (
          <ControlPanel
            viewMode={viewMode}
            colorScheme={colorScheme}
            visualizationType={visualizationType}
            onViewModeChange={handleViewModeChange}
            onColorSchemeChange={handleColorSchemeChange}
            onVisualizationTypeChange={handleVisualizationTypeChange}
            position={controlPanelPosition}
            onTogglePosition={toggleControlPanelPosition}
          />
        )}

        {/* Main Content Area */}
        <div className={styles.contentArea}>
          <header className={styles.header}>
            <h1 className={styles.title}>Interactive Periodic Table</h1>
            <p className={styles.description}>
              Explore the periodic table in advanced 2D and 3D visualizations
            </p>
          </header>

          <div className={styles.periodicTableContainer}>
            {viewMode === '2d' && (
              <PeriodicTable 
                mode={viewMode} 
                colorScheme={colorScheme} 
              />
            )}
            {viewMode === '3d' && (
              <PeriodicTable3D 
                colorScheme={colorScheme}
                visualizationType={visualizationType}
              />
            )}
            {viewMode === 'r3f' && (
              <PeriodicTableR3F 
                colorScheme={colorScheme}
                visualizationType={visualizationType}
              />
            )}
            {viewMode === 'harmonic' && (
              <PeriodicTable3D 
                colorScheme={colorScheme}
                visualizationType="harmonic"
              />
            )}
          </div>

          {selectedElement && (
            <div className={styles.detailsContainer}>
              <div className={styles.elementDetailsPanel}>
                <h2>Element Details</h2>
                <ElementDetails />
              </div>
              <div className={styles.atomicStructurePanel}>
                <h2>Atomic Structure</h2>
                <AtomicStructure element={selectedElement} />
              </div>
            </div>
          )}
        </div>
      </main>

      <footer className={styles.footer}>
        <p>
          Data sourced from public domain periodic table resources. 
          Built with Next.js, React, Three.js, and React Three Fiber.
        </p>
      </footer>
    </div>
  );
}
