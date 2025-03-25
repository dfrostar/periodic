import React, { useState } from 'react';
import styles from '@/styles/Home.module.css';
import { ViewMode, ColorScheme, VisualizationType } from '@/types';

interface ControlPanelProps {
  viewMode: ViewMode;
  colorScheme: ColorScheme;
  visualizationType: VisualizationType;
  onViewModeChange: (mode: ViewMode) => void;
  onColorSchemeChange: (scheme: ColorScheme) => void;
  onVisualizationTypeChange: (type: VisualizationType) => void;
  position?: 'left' | 'right'; // New prop for panel position
  onTogglePosition?: () => void; // New prop for toggling panel position
}

const ControlPanel: React.FC<ControlPanelProps> = ({
  viewMode,
  colorScheme,
  visualizationType,
  onViewModeChange,
  onColorSchemeChange,
  onVisualizationTypeChange = () => {}, // Add default empty function
  position = 'right', // Default to right side
  onTogglePosition
}) => {
  const [expanded, setExpanded] = useState({
    viewMode: true,
    colorScheme: true,
    visualizationType: true
  });

  // Toggle section expansion
  const toggleSection = (section: keyof typeof expanded) => {
    setExpanded(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };

  // Handle keyboard events for accessibility
  const handleKeyDown = (event: React.KeyboardEvent, section: keyof typeof expanded) => {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      toggleSection(section);
    }
  };

  // Determine panel position class
  const panelPositionClass = position === 'left' 
    ? `${styles.sideControlPanel} ${styles.leftSidePanel}`
    : styles.sideControlPanel;

  return (
    <div className={panelPositionClass}>
      <h2 className={styles.heading}>Control Panel</h2>
      
      {/* View Mode Section */}
      <div className={styles.collapsibleSection}>
        <button 
          className={styles.collapsibleHeader}
          onClick={() => toggleSection('viewMode')}
          aria-expanded={expanded.viewMode}
          aria-controls="viewModeContent"
          type="button"
        >
          <h3>View Mode</h3>
          <span aria-hidden="true">{expanded.viewMode ? '▼' : '►'}</span>
        </button>
        
        {expanded.viewMode && (
          <div className={styles.collapsibleContent} id="viewModeContent">
            <div className={styles.controlGroup}>
              <button
                className={`${styles.controlButton} ${viewMode === '2d' ? styles.active : ''}`}
                onClick={() => onViewModeChange('2d')}
                aria-pressed={viewMode === '2d'}
              >
                2D
              </button>
              <button
                className={`${styles.controlButton} ${viewMode === '3d' ? styles.active : ''}`}
                onClick={() => onViewModeChange('3d')}
                aria-pressed={viewMode === '3d'}
              >
                3D Basic
              </button>
              <button
                className={`${styles.controlButton} ${viewMode === 'r3f' ? styles.active : ''}`}
                onClick={() => onViewModeChange('r3f')}
                aria-pressed={viewMode === 'r3f'}
              >
                3D Advanced
              </button>
              <button
                className={`${styles.controlButton} ${viewMode === 'harmonic' ? styles.active : ''}`}
                onClick={() => onViewModeChange('harmonic')}
                aria-pressed={viewMode === 'harmonic'}
              >
                Harmonic
              </button>
            </div>
          </div>
        )}
      </div>
      
      {/* Color Scheme Section */}
      <div className={styles.collapsibleSection}>
        <button 
          className={styles.collapsibleHeader}
          onClick={() => toggleSection('colorScheme')}
          aria-expanded={expanded.colorScheme}
          aria-controls="colorSchemeContent"
          type="button"
        >
          <h3>Color Scheme</h3>
          <span aria-hidden="true">{expanded.colorScheme ? '▼' : '►'}</span>
        </button>
        
        {expanded.colorScheme && (
          <div className={styles.collapsibleContent} id="colorSchemeContent">
            <div className={styles.controlGroup}>
              <button
                className={`${styles.controlButton} ${colorScheme === 'category' ? styles.active : ''}`}
                onClick={() => onColorSchemeChange('category')}
                aria-pressed={colorScheme === 'category'}
              >
                Category
              </button>
              <button
                className={`${styles.controlButton} ${colorScheme === 'state' ? styles.active : ''}`}
                onClick={() => onColorSchemeChange('state')}
                aria-pressed={colorScheme === 'state'}
              >
                State
              </button>
              <button
                className={`${styles.controlButton} ${colorScheme === 'atomic-radius' ? styles.active : ''}`}
                onClick={() => onColorSchemeChange('atomic-radius')}
                aria-pressed={colorScheme === 'atomic-radius'}
              >
                Atomic Radius
              </button>
              <button
                className={`${styles.controlButton} ${colorScheme === 'frequency' ? styles.active : ''}`}
                onClick={() => onColorSchemeChange('frequency')}
                aria-pressed={colorScheme === 'frequency'}
              >
                Frequency
              </button>
            </div>
          </div>
        )}
      </div>
      
      {/* Visualization Type Section (for 3D mode) */}
      {(viewMode === '3d' || viewMode === 'r3f' || viewMode === 'harmonic') && (
        <div className={styles.collapsibleSection}>
          <button 
            className={styles.collapsibleHeader}
            onClick={() => toggleSection('visualizationType')}
            aria-expanded={expanded.visualizationType}
            aria-controls="visualizationTypeContent"
            type="button"
          >
            <h3>Visualization Type</h3>
            <span aria-hidden="true">{expanded.visualizationType ? '▼' : '►'}</span>
          </button>
          
          {expanded.visualizationType && (
            <div className={styles.collapsibleContent} id="visualizationTypeContent">
              <div className={styles.controlGroup}>
                <button
                  className={`${styles.controlButton} ${visualizationType === 'spiral' ? styles.active : ''}`}
                  onClick={() => typeof onVisualizationTypeChange === 'function' && onVisualizationTypeChange('spiral')}
                  aria-pressed={visualizationType === 'spiral'}
                >
                  Spiral
                </button>
                <button
                  className={`${styles.controlButton} ${visualizationType === 'table' ? styles.active : ''}`}
                  onClick={() => typeof onVisualizationTypeChange === 'function' && onVisualizationTypeChange('table')}
                  aria-pressed={visualizationType === 'table'}
                >
                  Table
                </button>
                <button
                  className={`${styles.controlButton} ${visualizationType === 'harmonic' ? styles.active : ''}`}
                  onClick={() => typeof onVisualizationTypeChange === 'function' && onVisualizationTypeChange('harmonic')}
                  aria-pressed={visualizationType === 'harmonic'}
                >
                  Harmonic
                </button>
                {(viewMode === 'r3f') && (
                  <button
                    className={`${styles.controlButton} ${visualizationType === 'orbital' ? styles.active : ''}`}
                    onClick={() => typeof onVisualizationTypeChange === 'function' && onVisualizationTypeChange('orbital')}
                    aria-pressed={visualizationType === 'orbital'}
                  >
                    Orbital
                  </button>
                )}
              </div>
            </div>
          )}
        </div>
      )}
      
      {/* Position Toggle Button */}
      <button 
        className={styles.controlButton}
        onClick={onTogglePosition}
        title="Toggle Panel Position"
      >
        Move Panel to {position === 'right' ? 'Left' : 'Right'}
      </button>
    </div>
  );
};

export default ControlPanel;
