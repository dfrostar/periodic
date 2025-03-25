import React, { useEffect } from 'react';
import { useElementStore } from '@/store/elementStore';
import { useQuery } from '@tanstack/react-query';
import styles from '@/styles/PeriodicTable.module.css';
import ElementTile from './ElementTile';
import PeriodicTable3D from './PeriodicTable3D';
import { fetchElements } from '@/lib/api';
import { Element } from '@/types/element';
import AtomicStructure from './AtomicStructure';

interface PeriodicTableProps {
  mode: '2d' | '3d' | 'harmonic';
  colorScheme: string;
}

const PeriodicTable: React.FC<PeriodicTableProps> = ({ mode, colorScheme }) => {
  const { data: elements, isLoading, error } = useQuery({
    queryKey: ['elements'],
    queryFn: fetchElements
  });
  
  const setSelectedElement = useElementStore(state => state.setSelectedElement);
  const selectedElement = useElementStore(state => state.selectedElement);

  // Debug logging - remove in production
  useEffect(() => {
    console.log(`PeriodicTable rendering with mode: ${mode}, colorScheme: ${colorScheme}`);
  }, [mode, colorScheme]);

  if (isLoading) return <div className={styles.loading}>Loading elements data...</div>;
  
  if (error) return <div className={styles.error}>Error loading periodic table data</div>;
  
  if (mode === '3d' || mode === 'harmonic') {
    // For both 3D and harmonic modes, use the 3D visualization component
    // but with a different visualization type
    return (
      <div className={styles.visualizationContainer}>
        <PeriodicTable3D 
          elements={elements ?? []} 
          colorScheme={colorScheme}
          visualizationType={mode === 'harmonic' ? 'harmonic' : 'spiral'} 
        />
        {selectedElement && (
          <div className={styles.atomicStructurePanelLarge}>
            <AtomicStructure element={selectedElement} />
          </div>
        )}
      </div>
    );
  }
  
  // Only render the 2D mode if neither 3D nor harmonic is selected
  // Layout constants for 2D view
  const tableStructure = [
    [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 2],
    [3, 4, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 5, 6, 7, 8, 9, 10],
    [11, 12, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 13, 14, 15, 16, 17, 18],
    [19, 20, 21, 22, 23, 24, 25, 26, 27, 28, 29, 30, 31, 32, 33, 34, 35, 36],
    [37, 38, 39, 40, 41, 42, 43, 44, 45, 46, 47, 48, 49, 50, 51, 52, 53, 54],
    [55, 56, 57, 72, 73, 74, 75, 76, 77, 78, 79, 80, 81, 82, 83, 84, 85, 86],
    [87, 88, 89, 104, 105, 106, 107, 108, 109, 110, 111, 112, 113, 114, 115, 116, 117, 118],
    [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 58, 59, 60, 61, 62, 63, 64, 65, 66, 67, 68, 69, 70, 71, 0, 0],
    [0, 0, 90, 91, 92, 93, 94, 95, 96, 97, 98, 99, 100, 101, 102, 103, 0, 0]
  ];
  
  const handleElementClick = (element: Element) => {
    setSelectedElement(element);
  };

  return (
    <div className={styles.mainContent}>
      <div className={styles.visualizationContainer}>
        <div className={styles.tableContainer}>
          <div className={styles.periodicTable}>
            {tableStructure.map((row, rowIndex) => {
              // Use a static stable identifier for rows
              const rowId = `periodic-table-row-${rowIndex}`;
              
              return (
                <div key={rowId} className={styles.tableRow}>
                  {row.map((atomicNumber, colIndex) => {
                    if (atomicNumber === 0) {
                      // Use a proper unique ID for empty cells that doesn't rely on array index
                      const uniqueId = `empty-cell-${rowIndex * 100 + colIndex}-${Math.random().toString(36).substring(2, 7)}`;
                      return <div key={uniqueId} className={styles.emptyCell} />;
                    }
                    
                    const element = elements?.find(el => el.atomicNumber === atomicNumber);
                    if (!element) return null;
                    
                    return (
                      <ElementTile 
                        key={element.symbol}
                        element={element}
                        colorScheme={colorScheme}
                        onClick={() => handleElementClick(element)}
                      />
                    );
                  })}
                </div>
              );
            })}
          </div>
        </div>
        {selectedElement && (
          <div className={styles.atomicStructurePanelLarge}>
            <AtomicStructure element={selectedElement} />
          </div>
        )}
      </div>
    </div>
  );
};

export default PeriodicTable;
