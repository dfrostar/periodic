import React from 'react';
import styles from '@/styles/ElementTile.module.css';
import { Element } from '@/types/element';

interface ElementTileProps {
  element: Element;
  colorScheme: string;
  onClick: () => void;
}

const ElementTile: React.FC<ElementTileProps> = ({ element, colorScheme, onClick }) => {
  // Get color based on selected color scheme
  const getBackgroundColor = () => {
    if (colorScheme === 'category') {
      switch (element.category) {
        case 'alkali-metal': return '#ff8a65';
        case 'alkaline-earth-metal': return '#ffb74d';
        case 'transition-metal': return '#ffd54f';
        case 'post-transition-metal': return '#dce775';
        case 'metalloid': return '#aed581';
        case 'nonmetal': return '#4fc3f7';
        case 'halogen': return '#4dd0e1';
        case 'noble-gas': return '#7986cb';
        case 'lanthanoid': return '#ba68c8';
        case 'actinoid': return '#f06292';
        default: return '#e0e0e0';
      }
    } else if (colorScheme === 'state') {
      switch (element.state) {
        case 'solid': return '#90caf9';
        case 'liquid': return '#80deea';
        case 'gas': return '#ef9a9a';
        default: return '#e0e0e0';
      }
    } else if (colorScheme === 'atomic-radius') {
      // Generate color based on atomic radius - from red (small) to blue (large)
      const min = 40; // approximate minimum atomic radius
      const max = 270; // approximate maximum atomic radius
      const normalized = (element.atomicRadius || min - 10) / max;
      return `hsl(${240 * normalized}, 80%, 65%)`;
    }
    
    // Default color
    return '#e0e0e0';
  };

  // Determine text color based on background brightness
  const getTextColor = (backgroundColor: string) => {
    // Simple function to determine if background is dark or light
    // Use a more sophisticated approach in production
    return backgroundColor.includes('ff') || backgroundColor.includes('9a') 
      ? '#fff' : '#333';
  };

  const bgColor = getBackgroundColor();
  const textColor = getTextColor(bgColor);

  return (
    <div 
      className={styles.elementTile}
      style={{ backgroundColor: bgColor, color: textColor }}
      onClick={onClick}
    >
      <div className={styles.atomicNumber}>{element.atomicNumber}</div>
      <div className={styles.symbol}>{element.symbol}</div>
      <div className={styles.name}>{element.name}</div>
      <div className={styles.mass}>{element.atomicMass.toFixed(2)}</div>
    </div>
  );
};

export default ElementTile;
