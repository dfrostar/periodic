import React from 'react';
import styles from '@/styles/ControlPanel.module.css';

interface ControlPanelProps {
  viewMode: '2d' | '3d';
  colorScheme: string;
  onViewModeChange: (mode: '2d' | '3d') => void;
  onColorSchemeChange: (scheme: string) => void;
}

const ControlPanel: React.FC<ControlPanelProps> = ({
  viewMode,
  colorScheme,
  onViewModeChange,
  onColorSchemeChange
}) => {
  return (
    <div className={styles.controlPanel}>
      <div className={styles.controlGroup}>
        <h3>View Mode</h3>
        <div className={styles.buttonGroup}>
          <button
            className={`${styles.controlButton} ${viewMode === '2d' ? styles.active : ''}`}
            onClick={() => onViewModeChange('2d')}
          >
            2D
          </button>
          <button
            className={`${styles.controlButton} ${viewMode === '3d' ? styles.active : ''}`}
            onClick={() => onViewModeChange('3d')}
          >
            3D
          </button>
        </div>
      </div>

      <div className={styles.controlGroup}>
        <h3>Color Scheme</h3>
        <div className={styles.buttonGroup}>
          <button
            className={`${styles.controlButton} ${colorScheme === 'category' ? styles.active : ''}`}
            onClick={() => onColorSchemeChange('category')}
            title="Color by element category (metal, nonmetal, etc.)"
          >
            Category
          </button>
          <button
            className={`${styles.controlButton} ${colorScheme === 'state' ? styles.active : ''}`}
            onClick={() => onColorSchemeChange('state')}
            title="Color by physical state (solid, liquid, gas)"
          >
            State
          </button>
          <button
            className={`${styles.controlButton} ${colorScheme === 'atomic-radius' ? styles.active : ''}`}
            onClick={() => onColorSchemeChange('atomic-radius')}
            title="Color gradient based on atomic radius"
          >
            Atomic Radius
          </button>
        </div>
      </div>
      
      <div className={styles.controlInfo}>
        <p>
          Click on any element to view its detailed information. In 3D mode, 
          you can rotate the table by dragging and zoom with the mouse wheel.
        </p>
      </div>
    </div>
  );
};

export default ControlPanel;
