import Head from 'next/head';
import { useState } from 'react';
import styles from '@/styles/Home.module.css';
import PeriodicTable from '@/components/ui/PeriodicTable';
import PeriodicTableHarmonic from '@/components/ui/PeriodicTableHarmonic';
import ElementDetails from '@/components/ui/ElementDetails';
import ControlPanel from '@/components/ui/ControlPanel';
import { useElementStore } from '@/store/elementStore';

export default function Home() {
  const [viewMode, setViewMode] = useState<'2d' | '3d' | 'harmonic'>('2d');
  const [colorScheme, setColorScheme] = useState<string>('atomic-radius');
  const selectedElement = useElementStore(state => state.selectedElement);

  const handleViewModeChange = (mode: '2d' | '3d' | 'harmonic') => {
    setViewMode(mode);
  };

  const handleColorSchemeChange = (scheme: string) => {
    setColorScheme(scheme);
  };

  return (
    <div className={styles.container}>
      <Head>
        <title>Interactive Periodic Table Visualization</title>
        <meta name="description" content="Interactive 3D periodic table with element properties visualization" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <main className={styles.main}>
        <h1 className={styles.title}>
          Interactive Periodic Table
        </h1>

        <ControlPanel 
          viewMode={viewMode}
          colorScheme={colorScheme}
          onViewModeChange={(mode) => setViewMode(mode as '2d' | '3d' | 'harmonic')}
          onColorSchemeChange={handleColorSchemeChange}
        />

        <div className={styles.tableContainer}>
          {viewMode === 'harmonic' ? (
            <PeriodicTableHarmonic colorScheme={colorScheme} />
          ) : (
            <PeriodicTable 
              mode={viewMode}
              colorScheme={colorScheme}
            />
          )}
        </div>

        {selectedElement && (
          <ElementDetails />
        )}
      </main>

      <footer className={styles.footer}>
        <a
          href="https://github.com/dfrostar/periodic"
          target="_blank"
          rel="noopener noreferrer"
        >
          View on GitHub
        </a>
      </footer>
    </div>
  );
}
