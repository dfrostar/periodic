import React, { useState } from 'react';
import styles from '@/styles/CollapsiblePanel.module.css';

interface CollapsiblePanelProps {
  children: React.ReactNode;
  title?: string;
}

const CollapsiblePanel: React.FC<CollapsiblePanelProps> = ({ 
  children, 
  title = 'Controls'
}) => {
  const [isOpen, setIsOpen] = useState(true);

  const togglePanel = () => {
    setIsOpen(!isOpen);
  };

  return (
    <div className={styles.collapsiblePanel}>
      <button 
        onClick={togglePanel} 
        className={styles.toggleButton}
        aria-label={isOpen ? "Collapse panel" : "Expand panel"}
      >
        {isOpen ? 'Hide Controls' : 'Show Controls'} <span className={styles.arrowIcon}>{isOpen ? '▼' : '▶'}</span>
      </button>
      
      {isOpen && (
        <div className={styles.panelContent}>
          {children}
        </div>
      )}
    </div>
  );
};

export default CollapsiblePanel;
