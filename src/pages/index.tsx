import React, { useState } from 'react';
import Head from 'next/head';
import PeriodicTable from '@/components/ui/PeriodicTable';
import ControlPanel from '@/components/ui/ControlPanel';
import ElementDetails from '@/components/ui/ElementDetails';
import styles from '@/styles/Home.module.css';

/**
 * Home page component for the Periodic Table Visualization
 * Manages view mode and color scheme state
 */
export default function Home() {
  const [viewMode, setViewMode] = useState<'2d' | '3d'>('2d');
  const [colorScheme, setColorScheme] = useState<string>('category');

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
          <div className={styles.controls}>
            <ControlPanel
              viewMode={viewMode}
              colorScheme={colorScheme}
              onViewModeChange={setViewMode}
              onColorSchemeChange={setColorScheme}
            />
          </div>

          <div className={styles.tableWrapper}>
            <PeriodicTable mode={viewMode} colorScheme={colorScheme} />
          </div>
        </div>

        <ElementDetails />
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
