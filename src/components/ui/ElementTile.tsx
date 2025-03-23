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
      const normalized = (element.atomicRadius ?? min - 10) / max;
      return `hsl(${240 * normalized}, 80%, 65%)`;
    } else if (colorScheme === 'frequency') {
      // Color based on frequency - using a rainbow spectrum
      // Map atomic number to a spectrum position
      const normalizedPosition = (element.atomicNumber % 7) / 7;
      // Rainbow spectrum from red to violet
      const hue = normalizedPosition * 270; // 270 covers the visible spectrum
      return `hsl(${hue}, 80%, 50%)`;
    } else if (colorScheme === 'octave') {
      // Color based on octave - group elements by periods
      const period = getPeriodFromAtomicNumber(element.atomicNumber);
      switch (period) {
        case 1: return '#ffcccc'; // First period
        case 2: return '#ffe0cc'; // Second period
        case 3: return '#fff5cc'; // Third period
        case 4: return '#e6ffcc'; // Fourth period
        case 5: return '#ccf2ff'; // Fifth period
        case 6: return '#ccd9ff'; // Sixth period
        case 7: return '#e6ccff'; // Seventh period
        default: return '#ffcce6'; // Eighth period or unknown
      }
    }
    
    // Default color
    return '#e0e0e0';
  };

  // Helper function to determine an element's period from its atomic number
  const getPeriodFromAtomicNumber = (atomicNumber: number): number => {
    if (atomicNumber <= 2) return 1;
    if (atomicNumber <= 10) return 2;
    if (atomicNumber <= 18) return 3;
    if (atomicNumber <= 36) return 4;
    if (atomicNumber <= 54) return 5;
    if (atomicNumber <= 86) return 6;
    if (atomicNumber <= 118) return 7;
    return 8;
  };

  // Get a complementary/secondary color based on the background color
  const getTextColor = (backgroundColor: string) => {
    // For HSL colors, derive a complementary color with appropriate contrast
    if (backgroundColor.startsWith('hsl')) {
      const parts = backgroundColor.match(/\d+/g);
      if (parts && parts.length >= 3) {
        const hue = parseInt(parts[0], 10);
        const saturation = parseInt(parts[1], 10);
        // Calculate complementary hue (180 degrees opposite on the color wheel)
        const compHue = (hue + 180) % 360;
        // Make sure text has enough contrast - darker for light backgrounds, lighter for dark backgrounds
        const lightness = parseInt(parts[2], 10);
        return lightness > 60 
          ? `hsl(${compHue}, ${Math.min(saturation + 10, 100)}%, 25%)` // Darker complementary color
          : `hsl(${compHue}, ${Math.max(saturation - 10, 20)}%, 85%)`; // Lighter complementary color
      }
      // Fallback if parsing fails
      return '#505050';
    }
    
    // For hex colors, use appropriate contrasting colors based on the background
    if (backgroundColor.startsWith('#')) {
      // Create a mapping of background colors to appropriate text colors
      const colorMap: { [key: string]: string } = {
        // Category colors
        '#ff8a65': '#663520', // Alkali metal
        '#ffb74d': '#664927', // Alkaline earth metal
        '#ffd54f': '#665620', // Transition metal
        '#dce775': '#59611f', // Post-transition metal
        '#aed581': '#495634', // Metalloid
        '#4fc3f7': '#1f4f63', // Nonmetal
        '#4dd0e1': '#1f555c', // Halogen
        '#7986cb': '#313552', // Noble gas
        '#ba68c8': '#4b2a51', // Lanthanoid
        '#f06292': '#602839', // Actinoid
        
        // State colors
        '#90caf9': '#395063', // Solid
        '#80deea': '#335a5e', // Liquid
        '#ef9a9a': '#5f3d3d', // Gas
        
        // Octave colors
        '#ffcccc': '#664c4c', // First period
        '#ffe0cc': '#665a51', // Second period
        '#fff5cc': '#666351', // Third period
        '#e6ffcc': '#596651', // Fourth period
        '#ccf2ff': '#516266', // Fifth period
        '#ccd9ff': '#515766', // Sixth period
        '#e6ccff': '#5c5166', // Seventh period
        '#ffcce6': '#664c5c', // Eighth period
        
        // Default
        '#e0e0e0': '#505050'  // Default gray
      };
      
      return colorMap[backgroundColor] || '#505050';
    }
    
    // Fallback to standard colors if we can't determine a better match
    return '#505050';
  };

  const bgColor = getBackgroundColor();
  const textColor = getTextColor(bgColor);

  // Handle keyboard interaction
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ' ') {
      onClick();
    }
  };

  return (
    <button 
      className={styles.elementTile}
      style={{ backgroundColor: bgColor, color: textColor }}
      onClick={onClick}
      onKeyDown={handleKeyDown}
      aria-label={`Element ${element.name}, atomic number ${element.atomicNumber}`}
    >
      <div className={styles.atomicNumber}>{element.atomicNumber}</div>
      <div className={styles.symbol}>{element.symbol}</div>
      <div className={styles.name}>{element.name}</div>
      <div className={styles.mass}>{element.atomicMass.toFixed(2)}</div>
    </button>
  );
};

export default ElementTile;
