import React from 'react';
import { useElementStore } from '@/store/elementStore';
import { Element } from '@/types/element';
import styles from '@/styles/ElementDetails.module.css';

const ElementDetails: React.FC = () => {
  const selectedElement = useElementStore(state => state.selectedElement);

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

  return (
    <div className={styles.elementDetails}>
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
        </div>
      </div>

      <div className={styles.propertiesGrid}>
        <div className={styles.property}>
          <h3>Atomic Number</h3>
          <p>{selectedElement.atomicNumber}</p>
        </div>
        <div className={styles.property}>
          <h3>Atomic Mass</h3>
          <p>{selectedElement.atomicMass.toFixed(4)} u</p>
        </div>
        <div className={styles.property}>
          <h3>Electron Configuration</h3>
          <p>{selectedElement.electronConfiguration || 'Unknown'}</p>
        </div>
        <div className={styles.property}>
          <h3>Electronegativity</h3>
          <p>{formatProperty(selectedElement.electronegativity)}</p>
        </div>
        <div className={styles.property}>
          <h3>Atomic Radius</h3>
          <p>{formatProperty(selectedElement.atomicRadius, ' pm')}</p>
        </div>
        <div className={styles.property}>
          <h3>Ionization Energy</h3>
          <p>{formatProperty(selectedElement.ionizationEnergy, ' eV')}</p>
        </div>
        <div className={styles.property}>
          <h3>Melting Point</h3>
          <p>{formatProperty(selectedElement.meltingPoint, ' K')}</p>
        </div>
        <div className={styles.property}>
          <h3>Boiling Point</h3>
          <p>{formatProperty(selectedElement.boilingPoint, ' K')}</p>
        </div>
        <div className={styles.property}>
          <h3>Density</h3>
          <p>{formatProperty(selectedElement.density, ' g/cm³')}</p>
        </div>
        <div className={styles.property}>
          <h3>State at STP</h3>
          <p>{formatProperty(selectedElement.state)}</p>
        </div>
        <div className={styles.property}>
          <h3>Year Discovered</h3>
          <p>{formatProperty(selectedElement.yearDiscovered)}</p>
        </div>
      </div>

      {selectedElement.description && (
        <div className={styles.description}>
          <h3>Description</h3>
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
