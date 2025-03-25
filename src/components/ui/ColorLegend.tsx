import React from 'react';
import styles from '@/styles/ColorLegend.module.css';

interface ColorLegendProps {
  colorScheme: string;
}

const ColorLegend: React.FC<ColorLegendProps> = ({ colorScheme }) => {
  // Generate legend items based on color scheme
  const renderLegendItems = () => {
    if (colorScheme === 'category') {
      return (
        <div className={styles.categoryLegend}>
          <div className={styles.legendItem}>
            <div className={styles.colorBox} style={{ backgroundColor: '#ff8a65' }}></div>
            <span>Alkali Metal</span>
          </div>
          <div className={styles.legendItem}>
            <div className={styles.colorBox} style={{ backgroundColor: '#ffb74d' }}></div>
            <span>Alkaline Earth Metal</span>
          </div>
          <div className={styles.legendItem}>
            <div className={styles.colorBox} style={{ backgroundColor: '#ffd54f' }}></div>
            <span>Transition Metal</span>
          </div>
          <div className={styles.legendItem}>
            <div className={styles.colorBox} style={{ backgroundColor: '#dce775' }}></div>
            <span>Post-Transition Metal</span>
          </div>
          <div className={styles.legendItem}>
            <div className={styles.colorBox} style={{ backgroundColor: '#aed581' }}></div>
            <span>Metalloid</span>
          </div>
          <div className={styles.legendItem}>
            <div className={styles.colorBox} style={{ backgroundColor: '#4fc3f7' }}></div>
            <span>Nonmetal</span>
          </div>
          <div className={styles.legendItem}>
            <div className={styles.colorBox} style={{ backgroundColor: '#4dd0e1' }}></div>
            <span>Halogen</span>
          </div>
          <div className={styles.legendItem}>
            <div className={styles.colorBox} style={{ backgroundColor: '#7986cb' }}></div>
            <span>Noble Gas</span>
          </div>
          <div className={styles.legendItem}>
            <div className={styles.colorBox} style={{ backgroundColor: '#ba68c8' }}></div>
            <span>Lanthanoid</span>
          </div>
          <div className={styles.legendItem}>
            <div className={styles.colorBox} style={{ backgroundColor: '#f06292' }}></div>
            <span>Actinoid</span>
          </div>
        </div>
      );
    } else if (colorScheme === 'state') {
      return (
        <div className={styles.stateLegend}>
          <div className={styles.legendItem}>
            <div className={styles.colorBox} style={{ backgroundColor: '#90caf9' }}></div>
            <span>Solid</span>
          </div>
          <div className={styles.legendItem}>
            <div className={styles.colorBox} style={{ backgroundColor: '#80deea' }}></div>
            <span>Liquid</span>
          </div>
          <div className={styles.legendItem}>
            <div className={styles.colorBox} style={{ backgroundColor: '#ef9a9a' }}></div>
            <span>Gas</span>
          </div>
          <div className={styles.legendItem}>
            <div className={styles.colorBox} style={{ backgroundColor: '#e0e0e0' }}></div>
            <span>Unknown</span>
          </div>
        </div>
      );
    } else if (colorScheme === 'atomic-radius') {
      return (
        <div className={styles.gradientLegend}>
          <div className={styles.gradientBar} style={{
            background: 'linear-gradient(to right, #b2ff59, #ffeb3b, #ff9800, #f44336)'
          }}></div>
          <div className={styles.gradientLabels}>
            <span>Smaller</span>
            <span>Medium</span>
            <span>Larger</span>
          </div>
        </div>
      );
    } else if (colorScheme === 'frequency') {
      return (
        <div className={styles.frequencyLegend}>
          <div className={styles.legendItem}>
            <div className={styles.colorBox} style={{ backgroundColor: '#ff0000' }}></div>
            <span>Red (C - Do)</span>
          </div>
          <div className={styles.legendItem}>
            <div className={styles.colorBox} style={{ backgroundColor: '#ff8000' }}></div>
            <span>Orange (D - Re)</span>
          </div>
          <div className={styles.legendItem}>
            <div className={styles.colorBox} style={{ backgroundColor: '#ffff00' }}></div>
            <span>Yellow (E - Mi)</span>
          </div>
          <div className={styles.legendItem}>
            <div className={styles.colorBox} style={{ backgroundColor: '#00ff00' }}></div>
            <span>Green (F - Fa)</span>
          </div>
          <div className={styles.legendItem}>
            <div className={styles.colorBox} style={{ backgroundColor: '#00ffff' }}></div>
            <span>Cyan (G - So)</span>
          </div>
          <div className={styles.legendItem}>
            <div className={styles.colorBox} style={{ backgroundColor: '#0000ff' }}></div>
            <span>Blue (A - La)</span>
          </div>
          <div className={styles.legendItem}>
            <div className={styles.colorBox} style={{ backgroundColor: '#8000ff' }}></div>
            <span>Violet (B - Ti)</span>
          </div>
        </div>
      );
    } else if (colorScheme === 'octave') {
      return (
        <div className={styles.octaveLegend}>
          <div className={styles.legendItem}>
            <div className={styles.colorBox} style={{ backgroundColor: '#ffcccc' }}></div>
            <span>First Octave</span>
          </div>
          <div className={styles.legendItem}>
            <div className={styles.colorBox} style={{ backgroundColor: '#ffe0cc' }}></div>
            <span>Second Octave</span>
          </div>
          <div className={styles.legendItem}>
            <div className={styles.colorBox} style={{ backgroundColor: '#fff5cc' }}></div>
            <span>Third Octave</span>
          </div>
          <div className={styles.legendItem}>
            <div className={styles.colorBox} style={{ backgroundColor: '#e6ffcc' }}></div>
            <span>Fourth Octave</span>
          </div>
          <div className={styles.legendItem}>
            <div className={styles.colorBox} style={{ backgroundColor: '#ccf2ff' }}></div>
            <span>Fifth Octave</span>
          </div>
          <div className={styles.legendItem}>
            <div className={styles.colorBox} style={{ backgroundColor: '#ccd9ff' }}></div>
            <span>Sixth Octave</span>
          </div>
          <div className={styles.legendItem}>
            <div className={styles.colorBox} style={{ backgroundColor: '#e6ccff' }}></div>
            <span>Seventh Octave</span>
          </div>
          <div className={styles.legendItem}>
            <div className={styles.colorBox} style={{ backgroundColor: '#ffcce6' }}></div>
            <span>Eighth Octave</span>
          </div>
        </div>
      );
    }
    
    return null;
  };

  return (
    <div className={styles.legendContainer}>
      <h4 className={styles.legendTitle}>
        {colorScheme.charAt(0).toUpperCase() + colorScheme.slice(1).replace('-', ' ')} Legend
      </h4>
      <div className={styles.legendItems}>
        {renderLegendItems()}
      </div>
    </div>
  );
};

export default ColorLegend;
