import React, { useState } from 'react';
import Head from 'next/head';
import PeriodicTable from '@/components/ui/PeriodicTable';
import ControlPanel from '@/components/ui/ControlPanel';
import ElementDetails from '@/components/ui/ElementDetails';
import AtomicStructure from '@/components/ui/AtomicStructure';
import { useElementStore } from '@/store/elementStore';
import styles from '@/styles/Home.module.css';

/**
 * Home page component for the Periodic Table Visualization
 * Manages view mode and color scheme state
 */
export default function Home() {
  const [viewMode, setViewMode] = useState<'2d' | '3d' | 'harmonic'>('2d');
  const [colorScheme, setColorScheme] = useState<string>('category');
  const selectedElement = useElementStore(state => state.selectedElement);

  // Handler for view mode changes
  const handleViewModeChange = (mode: '2d' | '3d' | 'harmonic') => {
    setViewMode(mode);
  };

  return (
    <div className={styles.container}>
      <Head>
        <title>Interactive Periodic Table Visualization</title>
        <meta name="description" content="Explore the periodic table of elements in 2D and 3D visualizations" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <main className={styles.main}>
        <header className={styles.header}>
          <h1 className={styles.title}>Interactive Periodic Table</h1>
          <p className={styles.description}>
            Explore the periodic table in 2D and 3D visualizations
          </p>
        </header>

        <div className={styles.grid}>
          {/* Controls Box */}
          <div className={`${styles.componentBox} ${styles.controls}`}>
            <h2>Controls</h2>
            <ControlPanel
              viewMode={viewMode}
              colorScheme={colorScheme}
              onViewModeChange={handleViewModeChange}
              onColorSchemeChange={setColorScheme}
            />
          </div>

          {/* Table Box */}
          <div className={`${styles.componentBox} ${styles.tableWrapper}`}>
            <PeriodicTable mode={viewMode} colorScheme={colorScheme} />
          </div>

          {/* Element Details Box */}
          <div className={`${styles.componentBox} ${styles.detailsWrapper}`}>
            <h2>Element Details</h2>
            <ElementDetails />
          </div>
          
          {/* Atomic Structure Box */}
          <div className={`${styles.componentBox} ${styles.atomicModelWrapper}`}>
            <h2>Atomic Structure</h2>
            {selectedElement ? (
              <AtomicStructure element={selectedElement} />
            ) : (
              <div className={styles.placeholder}>
                <p>Select an element to view its atomic structure</p>
              </div>
            )}
          </div>
        </div>
      </main>

      <footer className={styles.footer}>
        <p>
          Data sourced from public domain periodic table resources. 
          Built with Next.js, React, and Three.js.
        </p>
      </footer>
    </div>
  );
}
