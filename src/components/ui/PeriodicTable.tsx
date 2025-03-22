import React from 'react';
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

  if (isLoading) return <div className={styles.loading}>Loading elements data...</div>;
  
  if (error) return <div className={styles.error}>Error loading periodic table data</div>;
  
  if (mode === '3d') {
    return <PeriodicTable3D elements={elements || []} colorScheme={colorScheme} />;
  }
  
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
            {tableStructure.map((row, rowIndex) => (
              <div key={`row-${rowIndex}`} className={styles.tableRow}>
                {row.map((atomicNumber, colIndex) => {
                  if (atomicNumber === 0) {
                    return <div key={`empty-${rowIndex}-${colIndex}`} className={styles.emptyCell} />;
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
            ))}
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
