import React, { useRef, useEffect } from 'react';
import { useElementStore } from '@/store/elementStore';
import { Element } from '@/types/element';
import styles from '@/styles/ElementDetails.module.css';

interface PropertyChartProps {
  element: Element;
  property: keyof Element;
  title: string;
  unit: string;
  min: number;
  max: number;
}

/**
 * Bar chart to visualize an element property relative to min/max values
 */
const PropertyChart: React.FC<PropertyChartProps> = ({ 
  element, 
  property, 
  title, 
  unit, 
  min, 
  max 
}) => {
  // Get the property value safely
  const value = element[property] as number;
  
  // Skip rendering if no value
  if (value === undefined || value === null) {
    return (
      <div className={styles.property}>
        <h3>{title}</h3>
        <p>Unknown</p>
      </div>
    );
  }
  
  // Calculate percentage for bar width
  const percentage = Math.min(100, Math.max(0, ((value - min) / (max - min)) * 100));
  
  return (
    <div className={styles.property}>
      <h3>{title}</h3>
      <p>{value.toFixed(typeof value === 'number' ? 2 : 0)} {unit}</p>
      <div className={styles.barChart}>
        <div 
          className={styles.barFill} 
          style={{ width: `${percentage}%` }}
          title={`${value} ${unit} (${percentage.toFixed(1)}% of range)`}
        ></div>
      </div>
      <div className={styles.barRange}>
        <span>{min}{unit}</span>
        <span>{max}{unit}</span>
      </div>
    </div>
  );
};

/**
 * Component to visualize electron configuration by shell
 */
const ElectronShells: React.FC<{ configuration: string }> = ({ configuration }) => {
  // Parse the electron configuration to get electrons per shell
  const shellElectrons = getElectronsPerShell(configuration);
  const maxShellCapacity = [2, 8, 18, 32, 32, 18, 8];
  
  if (!shellElectrons.length) {
    return <div className={styles.electronShells}>Unknown configuration</div>;
  }
  
  return (
    <div className={styles.electronShells}>
      {shellElectrons.map((electrons, index) => (
        <div key={`shell-${index}`} className={styles.shell}>
          <div className={styles.shellLabel}>{index + 1}</div>
          <div className={styles.shellElectrons}>
            {Array.from({ length: maxShellCapacity[index] || 8 }).map((_, i) => (
              <div 
                key={`electron-${index}-${i}`}
                className={`${styles.electron} ${i < electrons ? styles.filled : ''}`}
                title={i < electrons ? 'Electron' : 'Empty'}
              ></div>
            ))}
          </div>
          <div className={styles.shellCount}>{electrons}/{maxShellCapacity[index] || 8}</div>
        </div>
      ))}
    </div>
  );
};

/**
 * Helper to extract electrons per shell from configuration
 */
const getElectronsPerShell = (configuration: string): number[] => {
  if (!configuration) return [];
  
  // Initialize shells array with zeros
  const shells = [0, 0, 0, 0, 0, 0, 0];
  
  try {
    // Parse the configuration
    const parts = configuration.split(' ');
    const regex = /(\d+)([spdfg])(\d+)/;
    
    parts.forEach(part => {
      // Extract the shell number, subshell letter, and electron count
      const match = regex.exec(part);
      if (match) {
        const shellNumber = parseInt(match[1], 10);
        // We can ignore the subshell letter for our visualization
        const electronCount = parseInt(match[3], 10);
        
        // Adjust shell index to be 0-based
        const shellIndex = shellNumber - 1;
        if (shellIndex >= 0 && shellIndex < shells.length) {
          shells[shellIndex] += electronCount;
        }
      }
    });
    
    return shells;
  } catch (error) {
    console.error('Error parsing electron configuration:', error);
    return [];
  }
};

/**
 * Physical properties panel
 */
const PhysicalProperties: React.FC<{ element: Element }> = ({ element }) => {
  return (
    <div className={styles.propertiesSection}>
      <h3 className={styles.sectionTitle}>Physical Properties</h3>
      <div className={styles.propertiesGrid}>
        <PropertyChart
          element={element}
          property="atomicMass"
          title="Atomic Mass"
          unit="u"
          min={1}
          max={300}
        />
        <PropertyChart
          element={element}
          property="density"
          title="Density"
          unit="g/cm³"
          min={0}
          max={25}
        />
        <PropertyChart
          element={element}
          property="meltingPoint"
          title="Melting Point"
          unit="K"
          min={0}
          max={4000}
        />
        <PropertyChart
          element={element}
          property="boilingPoint"
          title="Boiling Point"
          unit="K"
          min={0}
          max={6000}
        />
      </div>
    </div>
  );
};

/**
 * Atomic properties panel
 */
const AtomicProperties: React.FC<{ element: Element }> = ({ element }) => {
  return (
    <div className={styles.propertiesSection}>
      <h3 className={styles.sectionTitle}>Atomic Properties</h3>
      <div className={styles.propertiesGrid}>
        <PropertyChart
          element={element}
          property="atomicRadius"
          title="Atomic Radius"
          unit="pm"
          min={25}
          max={300}
        />
        <PropertyChart
          element={element}
          property="electronegativity"
          title="Electronegativity"
          unit=""
          min={0}
          max={4}
        />
        <PropertyChart
          element={element}
          property="ionizationEnergy"
          title="Ionization Energy"
          unit="eV"
          min={0}
          max={2500}
        />
        <PropertyChart
          element={element}
          property="electronAffinity"
          title="Electron Affinity"
          unit="eV"
          min={-500}
          max={500}
        />
      </div>
    </div>
  );
};

/**
 * Main ElementDetails component
 */
const ElementDetails: React.FC = () => {
  const selectedElement = useElementStore(state => state.selectedElement);
  const detailsRef = useRef<HTMLDivElement>(null);

  // Scroll to top when selected element changes
  useEffect(() => {
    if (detailsRef.current) {
      detailsRef.current.scrollTop = 0;
    }
  }, [selectedElement]);

  if (!selectedElement) {
    return (
      <div className={styles.elementDetails}>
        <div className={styles.placeholder}>
          <h2>Select an element to view details</h2>
          <p>Click on any element in the periodic table to view its properties.</p>
        </div>
      </div>
    );
  }

  const formatProperty = (value: any, unit: string = ''): string => {
    if (value === undefined || value === null) return 'Unknown';
    return `${value}${unit}`;
  };

  // Calculate note and frequency based on atomic number
  const getMusicalNote = (atomicNumber: number) => {
    const notes = ['A', 'A#', 'B', 'C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#'];
    const noteIndex = atomicNumber % 12;
    const octave = Math.floor(atomicNumber / 12);
    return `${notes[noteIndex]}${octave}`;
  };

  const getFrequency = (atomicNumber: number) => {
    // A4 = 440Hz standard
    const baseFreq = 440;
    const a4Index = 9; // Index of A in our notes array
    
    const noteIndex = atomicNumber % 12;
    const octave = Math.floor(atomicNumber / 12);
    
    // Calculate semitones from A4
    const semitonesFromA4 = (noteIndex - a4Index) + (octave - 4) * 12;
    
    // Equal temperament formula: f = 440 * 2^(n/12)
    return baseFreq * Math.pow(2, semitonesFromA4 / 12);
  };

  return (
    <div className={styles.elementDetails} ref={detailsRef}>
      {/* Header section with element symbol and basic info */}
      <div className={styles.elementHeader}>
        <div className={styles.symbolBox} style={getElementColor(selectedElement)}>
          <span className={styles.atomicNumber}>{selectedElement.atomicNumber}</span>
          <span className={styles.symbol}>{selectedElement.symbol}</span>
          <span className={styles.name}>{selectedElement.name}</span>
          <span className={styles.mass}>{selectedElement.atomicMass.toFixed(4)}</span>
        </div>
        <div className={styles.elementBasic}>
          <h1>{selectedElement.name}</h1>
          <p className={styles.category}>{formatCategory(selectedElement.category)}</p>
          <div className={styles.tags}>
            <span className={styles.tag}>{formatProperty(selectedElement.state)}</span>
            <span className={styles.tag}>Group {selectedElement.group}</span>
            <span className={styles.tag}>Period {selectedElement.period}</span>
            <span className={styles.tag}>Block {selectedElement.block}</span>
          </div>
        </div>
      </div>

      {/* Electron configuration visualization */}
      <div className={styles.propertiesSection}>
        <h3 className={styles.sectionTitle}>Electron Configuration</h3>
        <div className={styles.electronConfig}>
          <p className={styles.configText}>{selectedElement.electronConfiguration || 'Unknown'}</p>
          <ElectronShells configuration={selectedElement.electronConfiguration} />
        </div>
      </div>

      {/* Physical properties with bar charts */}
      <PhysicalProperties element={selectedElement} />

      {/* Atomic properties with bar charts */}
      <AtomicProperties element={selectedElement} />

      {/* Musical properties (for harmonic visualization) */}
      <div className={styles.propertiesSection}>
        <h3 className={styles.sectionTitle}>Musical Properties</h3>
        <div className={styles.propertiesGrid}>
          <div className={styles.property}>
            <h3>Musical Note</h3>
            <p>{getMusicalNote(selectedElement.atomicNumber)}</p>
          </div>
          <div className={styles.property}>
            <h3>Frequency</h3>
            <p>{getFrequency(selectedElement.atomicNumber).toFixed(2)} Hz</p>
          </div>
        </div>
      </div>

      {/* Historical information */}
      <div className={styles.propertiesSection}>
        <h3 className={styles.sectionTitle}>Historical Information</h3>
        <div className={styles.propertiesGrid}>
          <div className={styles.property}>
            <h3>Year Discovered</h3>
            <p>{formatProperty(selectedElement.yearDiscovered)}</p>
          </div>
          <div className={styles.property}>
            <h3>Discovered By</h3>
            <p>{formatProperty(selectedElement.discoveredBy)}</p>
          </div>
        </div>
      </div>

      {/* Element description */}
      {selectedElement.description && (
        <div className={styles.description}>
          <h3>About {selectedElement.name}</h3>
          <p>{selectedElement.description}</p>
        </div>
      )}
    </div>
  );
};

function getElementColor(element: Element) {
  switch (element.category) {
    case 'alkali-metal': return { backgroundColor: '#ff8a65', color: '#fff' };
    case 'alkaline-earth-metal': return { backgroundColor: '#ffb74d', color: '#333' };
    case 'transition-metal': return { backgroundColor: '#ffd54f', color: '#333' };
    case 'post-transition-metal': return { backgroundColor: '#dce775', color: '#333' };
    case 'metalloid': return { backgroundColor: '#aed581', color: '#333' };
    case 'nonmetal': return { backgroundColor: '#4fc3f7', color: '#333' };
    case 'halogen': return { backgroundColor: '#4dd0e1', color: '#333' };
    case 'noble-gas': return { backgroundColor: '#7986cb', color: '#fff' };
    case 'lanthanoid': return { backgroundColor: '#ba68c8', color: '#fff' };
    case 'actinoid': return { backgroundColor: '#f06292', color: '#fff' };
    default: return { backgroundColor: '#e0e0e0', color: '#333' };
  }
}

function formatCategory(category: string): string {
  if (!category) return 'Unknown';
  
  // Format hyphenated category names
  return category
    .split('-')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
}

export default ElementDetails;
