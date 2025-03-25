import React from 'react';
import styles from '@/styles/ElementTile.module.css';
import { Element } from '@/types/element';

interface ElementTileProps {
  element: Element;
  colorScheme: string;
  onClick: () => void;
}

const ElementTile: React.FC<ElementTileProps> = ({ element, colorScheme, onClick }) => {
  // Color functions for each color scheme type
  const getCategoryColor = () => {
    switch (element.category) {
      case 'alkali-metal': 
      case 'alkali metal': return '#ff4c4c'; // Consistent red
      case 'alkaline-earth-metal': 
      case 'alkaline earth metal': return '#ff9999'; // Consistent light red
      case 'transition-metal': 
      case 'transition metal': return '#ffb86c'; // Consistent orange
      case 'post-transition-metal': 
      case 'post-transition metal': return '#8be9fd'; // Consistent light blue
      case 'metalloid': return '#bd93f9'; // Consistent purple
      case 'nonmetal': return '#0096FF'; // Consistent blue
      case 'halogen': return '#ff79c6'; // Consistent pink
      case 'noble-gas': 
      case 'noble gas': return '#5cb3cc'; // Consistent light blue
      case 'lanthanoid': return '#50fa7b'; // Consistent green
      case 'actinoid': return '#94e2d5'; // Consistent teal
      default: return '#bfbfbf'; // Consistent gray
    }
  };
  
  const getStateColor = () => {
    switch (element.state) {
      case 'solid': return '#FFB861'; // Match R3F solid color
      case 'liquid': return '#6495ED'; // Match R3F liquid color
      case 'gas': return '#63E2FF'; // Match R3F gas color
      default: return '#bfbfbf';
    }
  };
  
  const getAtomicRadiusColor = () => {
    // Generate color based on atomic radius
    const radius = element.atomicRadius ?? element.atomicMass / 10;
    const normalizedRadius = Math.min(Math.max((radius - 30) / 200, 0), 1);
    
    // Color gradient from blue to red (matching R3F)
    const r = Math.floor(normalizedRadius * 255);
    const g = Math.floor((1 - Math.abs(normalizedRadius - 0.5) * 2) * 255);
    const b = Math.floor((1 - normalizedRadius) * 255);
    
    return `rgb(${r}, ${g}, ${b})`;
  };
  
  const getFrequencyColor = () => {
    // Musical frequency based on notes (C to B)
    const noteIndex = (element.atomicNumber % 12);
    
    // Map to musical note colors in a rainbow spectrum (matching R3F)
    const noteColors = [
      "#ff0000", // C (red)
      "#ff4e00", // C#
      "#ff9900", // D
      "#ffe100", // D#
      "#ccff00", // E
      "#66ff00", // F
      "#00ff66", // F#
      "#00ffcc", // G
      "#00ccff", // G#
      "#0066ff", // A
      "#4c00ff", // A#
      "#9900ff"  // B (violet)
    ];
    
    return noteColors[noteIndex];
  };
  
  const getOctaveColor = () => {
    // Color based on octave in the musical scale
    const elemOctave = Math.floor(element.atomicNumber / 12);
    const octaveColors = [
      "#ff0000", // 1st octave (red)
      "#ff7700", // 2nd octave (orange)
      "#ffff00", // 3rd octave (yellow)
      "#00ff00", // 4th octave (green)
      "#0000ff", // 5th octave (blue)
      "#8a2be2", // 6th octave (indigo)
      "#ff00ff", // 7th octave (violet)
      "#ffffff"  // 8th octave (white)
    ];
    
    return octaveColors[elemOctave % octaveColors.length];
  };

  // Get color based on selected color scheme
  const getBackgroundColor = () => {
    switch (colorScheme) {
      case 'category': return getCategoryColor();
      case 'state': return getStateColor();
      case 'atomic-radius': return getAtomicRadiusColor();
      case 'frequency': return getFrequencyColor();
      case 'octave': return getOctaveColor();
      default: return '#bfbfbf';
    }
  };

  // Helper functions for text color calculation
  const calculateBrightness = (r: number, g: number, b: number) => {
    return (r * 299 + g * 587 + b * 114) / 1000;
  };
  
  const getContrastColor = (brightness: number) => {
    return brightness > 128 ? '#000000' : '#ffffff';
  };
  
  const parseRgbColor = (backgroundColor: string) => {
    const rgbMatch = backgroundColor.match(/\d+/g);
    if (rgbMatch && rgbMatch.length >= 3) {
      const r = parseInt(rgbMatch[0], 10);
      const g = parseInt(rgbMatch[1], 10);
      const b = parseInt(rgbMatch[2], 10);
      const brightness = calculateBrightness(r, g, b);
      return getContrastColor(brightness);
    }
    return null;
  };
  
  const parseHslColor = (backgroundColor: string) => {
    const parts = backgroundColor.match(/\d+/g);
    if (parts && parts.length >= 3) {
      const lightness = parseInt(parts[2], 10);
      return lightness > 60 ? '#000000' : '#ffffff';
    }
    return null;
  };
  
  const parseHexColor = (backgroundColor: string) => {
    const hex = backgroundColor.substring(1);
    const r = parseInt(hex.substring(0, 2), 16);
    const g = parseInt(hex.substring(2, 4), 16);
    const b = parseInt(hex.substring(4, 6), 16);
    const brightness = calculateBrightness(r, g, b);
    return getContrastColor(brightness);
  };

  // Calculate text color for optimal contrast with the background
  const getTextColor = (backgroundColor: string) => {
    // Parse RGB values from different color formats
    if (backgroundColor.startsWith('rgb')) {
      return parseRgbColor(backgroundColor) ?? '#505050';
    } 
    
    if (backgroundColor.startsWith('hsl')) {
      return parseHslColor(backgroundColor) ?? '#505050';
    } 
    
    if (backgroundColor.startsWith('#')) {
      return parseHexColor(backgroundColor);
    }
    
    // Default text color
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
