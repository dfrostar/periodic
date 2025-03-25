import React, { useMemo, useRef, useEffect, useState } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { 
  OrbitControls, 
  PerspectiveCamera, 
  Html,
  Stars,
  Edges,
  PerformanceMonitor
} from '@react-three/drei';
import { EffectComposer, Bloom, ChromaticAberration, Vignette, SMAA } from '@react-three/postprocessing';
import { BlendFunction } from 'postprocessing';
import * as THREE from 'three';
import styles from '@/styles/PeriodicTableR3F.module.css';
import ColorLegend from './ColorLegend';
// Import types from the centralized types file
import { ColorScheme, VisualizationType, PeriodicElement, Element } from '@/types';
// Import the periodic elements data - we'll use a hook to fetch it
import { useElements } from '@/lib/api';

// Default elements data to use while loading from the API
const defaultElements: PeriodicElement[] = [
  { 
    number: 1, 
    symbol: "H", 
    name: "Hydrogen", 
    atomic_mass: 1.008, 
    category: "nonmetal", 
    phase: "gas", 
    electron_configuration: "1s1", 
    group: 1, 
    period: 1 
  },
  { 
    number: 2, 
    symbol: "He", 
    name: "Helium", 
    atomic_mass: 4.0026, 
    category: "noble gas", 
    phase: "gas", 
    electron_configuration: "1s2", 
    group: 18, 
    period: 1 
  },
  { 
    number: 3, 
    symbol: "Li", 
    name: "Lithium", 
    atomic_mass: 6.94, 
    category: "alkali metal", 
    phase: "solid", 
    electron_configuration: "1s2 2s1", 
    group: 1, 
    period: 2 
  },
  { 
    number: 4, 
    symbol: "Be", 
    name: "Beryllium", 
    atomic_mass: 9.0122, 
    category: "alkaline earth metal", 
    phase: "solid", 
    electron_configuration: "1s2 2s2", 
    group: 2, 
    period: 2 
  }
];

// Define props interface using imported types instead of local types
interface PeriodicTableR3FProps {
  // Callback when an element is selected
  onElementSelect?: (element: Element | null) => void;
  // Default color scheme to use
  colorScheme?: ColorScheme;
  // Default visualization type to display
  visualizationType?: VisualizationType;
  // Handle color scheme changes
  onColorSchemeChange?: (scheme: ColorScheme) => void;
  // Handle visualization type changes
  onVisualizationTypeChange?: (type: VisualizationType) => void;
}

// Define local element interface for rendering
interface ElementData {
  element: PeriodicElement;
  position: [number, number, number];
  color: string;
}

// Props interfaces for Three.js components
interface MeshProps {
  position?: [number, number, number];
  onClick?: (event: any) => void;
  onPointerOver?: (event: any) => void;
  onPointerOut?: (event: any) => void;
  children?: React.ReactNode;
}

interface BoxGeometryProps {
  args?: [number, number, number];
}

interface MaterialProps {
  color?: string | THREE.Color;
  emissive?: string | THREE.Color;
  emissiveIntensity?: number;
  metalness?: number;
  roughness?: number;
  transparent?: boolean;
  opacity?: number;
  side?: THREE.Side;
  toneMapped?: boolean;
  map?: THREE.Texture;
}

interface LightProps {
  position?: [number, number, number];
  intensity?: number;
  castShadow?: boolean;
}

interface PlaneProps {
  position?: [number, number, number];
  rotation?: [number, number, number];
  receiveShadow?: boolean;
  args?: [number, number];
}

// Function to calculate element positions
const calculateElementPosition = (
  element: PeriodicElement,
  index: number,
  visualizationType: VisualizationType
): [number, number, number] => {
  const atomicNumber = element.number ?? index + 1;
  
  // Declare all variables at function level to avoid lexical declarations in case blocks
  let x = 0, y = 0, z = 0;
  let column = 0, row = 0, group = 0, period = 0;
  let radial = 0, angle = 0, height = 0;
  let shellNumber = 0, electronInShell = 0, totalInShell = 0;
  let shellAngle = 0, shellRadius = 0;
  
  switch (visualizationType) {
    case 'table':
      // Standard periodic table layout
      group = element.group ?? 18;
      period = element.period ?? 7;
      
      // Handle special cases for lanthanides and actinides
      if (period === 6 && group === 3) {
        // Lanthanides
        row = 8;
        column = atomicNumber - 56;
      } else if (period === 7 && group === 3) {
        // Actinides
        row = 9;
        column = atomicNumber - 88;
      } else {
        row = period;
        column = group;
      }
      
      x = column * 2 - 18;
      // y remains 0
      z = row * 2 - 7;
      
      return [x, y, z];
    
    case 'spiral':
      // Spiral arrangement based on atomic number
      radial = Math.sqrt(atomicNumber) * 1.5;
      angle = atomicNumber * 0.6;
      
      x = radial * Math.cos(angle);
      // y remains 0
      z = radial * Math.sin(angle);
      
      return [x, y, z];
    
    case 'harmonic':
      // Arrange in a harmonic pattern based on frequency
      radial = Math.sqrt(atomicNumber) * 1.8;
      angle = atomicNumber * 0.17 * Math.PI;
      height = Math.sin(atomicNumber * 0.25) * 5;
      
      return [
        radial * Math.cos(angle),
        height,
        radial * Math.sin(angle)
      ];
    
    case 'orbital':
      // Electron orbital-like visualization
      shellNumber = Math.ceil(Math.sqrt(atomicNumber));
      electronInShell = atomicNumber - Math.pow(shellNumber - 1, 2);
      totalInShell = Math.pow(shellNumber, 2) - Math.pow(shellNumber - 1, 2);
      shellAngle = (electronInShell / totalInShell) * Math.PI * 2;
      shellRadius = shellNumber * 4;
      
      return [
        shellRadius * Math.cos(shellAngle),
        (shellNumber % 2 === 0) ? Math.sin(atomicNumber * 0.5) * 2 : 0,
        shellRadius * Math.sin(shellAngle)
      ];
  }
  
  // Default case - return origin
  return [0, 0, 0];
};

// Get color based on element properties and selected color scheme
const getElementColor = (element: PeriodicElement, colorScheme: ColorScheme): string => {
  // Declare all variables at the function level
  let categoryColors, stateColors, radius, normalizedRadius;
  let r, g, b, baseFreq, normalizedNumber, octave, noteColors;
  let elemOctave, octaveColors;

  switch (colorScheme) {
    case 'category':
      // Color by chemical category
      categoryColors = {
        "noble gas": "#5cb3cc",
        "nonmetal": "#0096FF",
        "alkali metal": "#ff4c4c",
        "alkaline earth metal": "#ff9999",
        "metalloid": "#bd93f9",
        "post-transition metal": "#8be9fd",
        "transition metal": "#ffb86c",
        "lanthanoid": "#50fa7b",
        "actinoid": "#94e2d5",
        "halogen": "#ff79c6",
        "metal": "#f1fa8c",
        "unknown": "#bfbfbf"
      };
      return categoryColors[element.category as keyof typeof categoryColors] ?? "#bfbfbf";
    
    case 'state':
      // Color by state at room temperature
      stateColors = {
        "gas": "#63E2FF",
        "liquid": "#6495ED",
        "solid": "#FFB861"
      };
      return stateColors[element.phase as keyof typeof stateColors] ?? "#bfbfbf";
    
    case 'atomic-radius':
      // Color by atomic radius (gradient)
      radius = element.atomic_radius ?? element.atomic_mass / 10;
      normalizedRadius = Math.min(Math.max((radius - 30) / 200, 0), 1);
      
      // Color gradient from blue to red
      r = Math.floor(normalizedRadius * 255);
      g = Math.floor((1 - Math.abs(normalizedRadius - 0.5) * 2) * 255);
      b = Math.floor((1 - normalizedRadius) * 255);
      
      return `rgb(${r}, ${g}, ${b})`;
    
    case 'frequency':
      // Musical frequency based on octaves
      normalizedNumber = (element.number ?? 1) % 12;
      
      // Map to musical note colors in a rainbow spectrum
      noteColors = [
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
      
      return noteColors[normalizedNumber];
    
    case 'octave':
      // Color by octave in the musical scale
      elemOctave = Math.floor((element.number ?? 1) / 12);
      octaveColors = [
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
      
    default:
      return element.color ?? "#bfbfbf";
  }
};

// Individual Element Cube component
interface ElementCubeProps {
  element: PeriodicElement;
  position: [number, number, number];
  color: string;
  onClick: () => void;
  isSelected: boolean;
}

const ElementCube: React.FC<ElementCubeProps> = ({
  element,
  position,
  color,
  onClick,
  isSelected
}) => {
  // Local state to control hover state for element info
  const [hovered, setHovered] = useState(false);
  
  // Don't use spring animation for now to avoid TypeScript errors
  const scale = isSelected ? 1.5 : 1;
  
  // Create a canvas texture for the element label
  const canvasTexture = useMemo(() => {
    const canvas = document.createElement('canvas');
    canvas.width = 128;
    canvas.height = 128;
    const ctx = canvas.getContext('2d');
    if (ctx) {
      // Fill with black background
      ctx.fillStyle = '#000000';
      ctx.fillRect(0, 0, 128, 128);
      
      // Draw element symbol
      ctx.font = 'bold 60px Arial';
      ctx.fillStyle = '#ffffff';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(element.symbol ?? '?', 64, 55);
      
      // Draw atomic number
      ctx.font = '30px Arial';
      ctx.fillText(`${element.number ?? '?'}`, 64, 95);
    }
    
    return new THREE.CanvasTexture(canvas);
  }, [element.symbol, element.number]);
  
  // Handle pointer events
  const handlePointerOver = (e: React.PointerEvent) => {
    e.stopPropagation();
    document.body.style.cursor = 'pointer';
    setHovered(true);
  };
  
  const handlePointerOut = (e: React.PointerEvent) => {
    e.stopPropagation();
    document.body.style.cursor = 'auto';
    setHovered(false);
  };
  
  // Convert hex color to THREE.Color
  const threeColor = useMemo(() => new THREE.Color(color), [color]);
  
  // Format atomic mass to a readable value
  const formattedAtomicMass = useMemo(() => {
    if (!element.atomic_mass) return 'Unknown';
    return element.atomic_mass.toFixed(4);
  }, [element.atomic_mass]);

  // Calculate electron configuration if needed
  const electronConfig = useMemo(() => {
    if (!element.number) return 'Unknown';
    
    // This is a simplified approach - could be enhanced with actual electron configurations
    if (element.number > 2) {
      return '1s² ...';
    } else {
      return '1s²';
    }
  }, [element.number]);
  
  return (
    <mesh 
      ref={(mesh: THREE.Mesh | null) => {
        if (mesh) {
          mesh.castShadow = true;
        }
      }}
      position={position} 
      scale={scale} 
      onClick={onClick}
      onPointerOver={handlePointerOver}
      onPointerOut={handlePointerOut}
    >
      <boxGeometry args={[1, 1, 1]} />
      <meshStandardMaterial 
        color={threeColor}
        transparent={true}
        toneMapped={false}
        opacity={0.8}
        emissive={threeColor}
        emissiveIntensity={0.4}
      />
      
      {/* Apply texture only to the front face */}
      <mesh position={[0, 0, 0.501]}>
        <planeGeometry args={[0.9, 0.9]} />
        <meshBasicMaterial 
          map={canvasTexture} 
          transparent={true} 
          toneMapped={false}
        />
      </mesh>
      
      <Edges visible={true} scale={1.05} threshold={15} color="#ffffff" />
      
      {/* Element name label - always visible */}
      <Html position={[0, 1.2, 0]} center distanceFactor={10}>
        <div className={styles.elementLabel}>
          {element.name}
        </div>
      </Html>

      {/* Enhanced element info panel - shown when hovered or selected */}
      {(hovered || isSelected) && (
        <Html position={[1.8, 0, 0]} center distanceFactor={12}>
          <div className={styles.elementInfo}>
            <h3>{element.name} ({element.symbol})</h3>
            <p>
              <span className={styles.property}>Atomic Number:</span>
              <span className={styles.value}>{element.number ?? 'N/A'}</span>
            </p>
            <p>
              <span className={styles.property}>Atomic Mass:</span>
              <span className={styles.value}>{formattedAtomicMass}</span>
            </p>
            <p>
              <span className={styles.property}>Group:</span>
              <span className={styles.value}>{element.group ?? 'N/A'}</span>
            </p>
            <p>
              <span className={styles.property}>Period:</span>
              <span className={styles.value}>{element.period ?? 'N/A'}</span>
            </p>
            <p>
              <span className={styles.property}>e⁻ Config:</span>
              <span className={styles.value}>{electronConfig}</span>
            </p>
            <div className={styles.category}>
              {element.category ?? 'Unknown'}
            </div>
          </div>
        </Html>
      )}
    </mesh>
  );
};

// Background Environment
const EnvironmentSetup = () => {
  // Set up scene and lighting
  const camera = useRef<THREE.PerspectiveCamera>(null);
  const controls = useRef<any>(null);
  
  // Add subtle rotation to camera for ambient motion
  useFrame(() => {
    if (controls.current) {
      controls.current.update();
    }
  });
  
  return (
    <>
      <PerspectiveCamera 
        makeDefault 
        ref={camera} 
        position={[0, 5, 40]}
        fov={60}
      />
      <OrbitControls 
        ref={controls}
        enableDamping
        dampingFactor={0.05}
        rotateSpeed={0.5}
        zoomSpeed={0.8}
      />
      
      {/* Sky environment */}
      <Stars 
        radius={100} 
        depth={50} 
        count={5000} 
        factor={4} 
        fade={true}
      />
      
      {/* Lighting */}
      <ambientLight intensity={0.4} />
      <directionalLight position={[10, 10, 5]} intensity={1.5} castShadow />
      
      {/* Ground plane with grid */}
      <mesh 
        rotation={[-Math.PI / 2, 0, 0]} 
        position={[0, -5, 0]} 
        receiveShadow
      >
        <planeGeometry args={[200, 200]} />
        <meshStandardMaterial 
          color="#1a1a2e" 
          metalness={0.8}
          roughness={0.4}
          transparent={true}
          opacity={0.6}
          side={THREE.DoubleSide}
        />
      </mesh>
      
      {/* Light columns for visual effect */}
      <group position={[0, -5, 0]}>
        {[1, 2, 3, 4].map((i) => (
          <mesh 
            key={`light-column-${i}`}
            position={[
              Math.sin(i * Math.PI / 2) * 30, 
              10, 
              Math.cos(i * Math.PI / 2) * 30
            ]}
          >
            <cylinderGeometry args={[0.5, 0.5, 30, 16]} />
            <meshStandardMaterial 
              color="#4fc3f7" 
              emissive="#4fc3f7"
              emissiveIntensity={2}
              transparent
              opacity={0.3}
            />
          </mesh>
        ))}
      </group>
    </>
  );
};

// Performance Optimizations
const SceneOptimizer: React.FC = () => {
  const { gl } = useThree();
  
  useEffect(() => {
    // Optimize renderer
    gl.setPixelRatio(window.devicePixelRatio);
    
    // @ts-ignore - physicallyCorrectLights might be deprecated in newer THREE.js versions
    gl.physicallyCorrectLights = true;
    
    // @ts-ignore - outputEncoding is deprecated in newer THREE.js versions
    // Use newer outputColorSpace instead of deprecated outputEncoding if available
    // @ts-ignore - Handle both newer and older THREE.js versions
    if (gl.outputColorSpace !== undefined) {
      // @ts-ignore - For newer THREE.js versions
      gl.outputColorSpace = THREE.SRGBColorSpace;
    } else {
      // @ts-ignore - Fallback for older THREE.js versions
      gl.outputEncoding = THREE.sRGBEncoding; 
    }
    
    // Add other optimizations here if needed
    gl.setClearColor(new THREE.Color('#111111'));
  }, [gl]);
  
  return null;
};

// Main scene component
const PeriodicTableScene: React.FC<{
  colorScheme: ColorScheme;
  visualizationType: VisualizationType;
}> = ({ 
  colorScheme,
  visualizationType
}) => {
  // Fetch elements data using the hook at component level
  const { data: elementsData } = useElements();
  
  // Memoize positions to prevent unnecessary recalculations
  const elementPositions = useMemo(() => {
    // If elementsData is not loaded yet, return empty array to avoid errors
    if (!elementsData || elementsData.length === 0) {
      return [];
    }
    
    // Ensure we handle the array as PeriodicElement[] by using a type assertion
    return (elementsData as unknown as PeriodicElement[]).map((element: PeriodicElement, index: number) => {
      const position = calculateElementPosition(element, index, visualizationType);
      // Ensure the color is calculated every time colorScheme changes
      const elementColor = getElementColor(element, colorScheme);
      return {
        element,
        position,
        color: elementColor
      };
    });
  }, [elementsData, visualizationType, colorScheme]);
  
  // Element selection handler
  const handleElementSelect = (element: PeriodicElement) => {
    // For state, ensure it's one of the expected values or default to "unknown"
    let elementState: "unknown" | "gas" | "liquid" | "solid" = "unknown";
    if (element.phase === "gas" || element.phase === "liquid" || element.phase === "solid") {
      elementState = element.phase;
    }

    // Create a complete element object for the store
    const storeElement: Element = {
      atomicNumber: element.number ?? 0,
      symbol: element.symbol ?? '',
      name: element.name ?? '',
      atomicMass: element.atomic_mass ?? 0,
      category: element.category ?? '',
      group: element.group ?? 0,
      period: element.period ?? 0,
      // For properties that might not exist in the PeriodicElement type, use type assertion
      block: (element as any).block ?? '',
      electronConfiguration: element.electron_configuration ?? '',
      state: elementState,
      electronegativity: element.electronegativity
    };
    
    // setSelectedElement(storeElement);
  };
  
  return (
    <>
      <EnvironmentSetup />
      <SceneOptimizer />
      
      {/* Render all elements */}
      {elementPositions.map(({ element, position, color }) => (
        <ElementCube 
          key={`element-${element.number}`}
          element={element}
          position={position}
          color={color}
          onClick={() => handleElementSelect(element)}
          isSelected={false}
        />
      ))}
      
      {/* Post-processing effects for enhanced visuals */}
      <EffectComposer>
        <Bloom 
          intensity={0.5} 
          luminanceThreshold={0.2} 
          luminanceSmoothing={0.9} 
        />
        <ChromaticAberration 
          offset={[0.002, 0.002]} 
          blendFunction={BlendFunction.NORMAL} 
        />
        <Vignette 
          offset={0.5} 
          darkness={0.5} 
          blendFunction={BlendFunction.NORMAL} 
        />
        <SMAA />
      </EffectComposer>
    </>
  );
};

// Main component that wraps the 3D scene
const PeriodicTableR3F: React.FC<PeriodicTableR3FProps> = ({
  onElementSelect,
  colorScheme: initialColorScheme = 'category',
  onColorSchemeChange,
  visualizationType: initialVisualizationType = 'standard',
  onVisualizationTypeChange
}) => {
  // Local state for color scheme and visualization type
  const [colorScheme, setColorScheme] = useState<ColorScheme>(initialColorScheme);
  const [visualizationType, setVisualizationType] = useState<VisualizationType>(initialVisualizationType);
  const portalRef = useRef<HTMLDivElement>(null);
  
  // Element selection state
  const [selectedElement, setSelectedElement] = useState<PeriodicElement | null>(null);
  
  // Update parent component when color scheme changes
  useEffect(() => {
    if (onColorSchemeChange) {
      onColorSchemeChange(colorScheme);
    }
  }, [colorScheme, onColorSchemeChange]);
  
  // Update parent component when visualization type changes
  useEffect(() => {
    if (onVisualizationTypeChange) {
      onVisualizationTypeChange(visualizationType);
    }
  }, [visualizationType, onVisualizationTypeChange]);
  
  // Handle color scheme changes
  const handleColorSchemeChange = (scheme: ColorScheme) => {
    setColorScheme(scheme);
  };
  
  // Handle visualization type changes
  const handleVisualizationTypeChange = (type: VisualizationType) => {
    setVisualizationType(type);
  };
  
  // Toggle controls visibility
  const toggleControls = () => {
    // Removed unused variable
  };
  
  // Handle canvas click (deselect element when clicking outside)
  const handleCanvasClick = () => {
    // When clicking on empty canvas area, deselect current element
    setSelectedElement(null);
  };
  
  // handleElementClick function for when elements are clicked
  const handleElementClick = (element: PeriodicElement) => {
    setSelectedElement(element);
  };
  
  return (
    <div className={styles.container}>
      <Canvas className={styles.canvas} onClick={handleCanvasClick}>
        <PerformanceMonitor>
          <SceneOptimizer />
          {/* @ts-ignore - THREE.js property */}
          <ambientLight intensity={0.5} />
          {/* @ts-ignore - THREE.js properties */}
          <pointLight intensity={1} position={[10, 10, 10]} castShadow />
          
          {/* Scene environment */}
          {/* @ts-ignore - THREE.js properties */}
          <Environment preset="sunset" />
          
          {/* Floor/grid for reference */}
          {/* @ts-ignore - THREE.js properties */}
          <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -2, 0]} receiveShadow>
            {/* @ts-ignore - THREE.js properties */}
            <planeGeometry args={[100, 100]} />
            {/* @ts-ignore - THREE.js properties */}
            <meshStandardMaterial 
              color="#111122"
              metalness={0.5}
              roughness={0.8}
              transparent={true}
              opacity={0.7}
              side={THREE.DoubleSide}
            />
          </mesh>
          
          {/* Stars/particles background */}
          {/* @ts-ignore - THREE.js properties */}
          <Stars radius={100} depth={50} count={5000} factor={4} saturation={0} fade speed={1} />
          
          {/* Debug grid helpers */}
          {/* @ts-ignore - THREE.js properties */}
          <gridHelper position={[0, -1.99, 0]} args={[100, 100, "#444444", "#222222"]} />
          
          {/* Camera controls */}
          {/* @ts-ignore - THREE.js properties */}
          <OrbitControls enableDamping dampingFactor={0.05} rotateSpeed={0.5} />
          <PeriodicTableScene 
            colorScheme={colorScheme}
            visualizationType={visualizationType}
          />

          {/* 3D Legend that stays visible during rotation */}
          <Html
            position={[-10, 5, 0]}
            distanceFactor={15}
            style={{
              background: 'rgba(10, 10, 20, 0.85)',
              padding: '12px',
              borderRadius: '8px',
              border: '1px solid rgba(100, 100, 255, 0.5)',
              width: '250px',
              pointerEvents: 'none',
              transformStyle: 'preserve-3d',
              boxShadow: '0 0 20px rgba(0, 0, 100, 0.3)',
              maxHeight: '400px',
              overflowY: 'auto'
            }}
            transform
            occlude
          >
            <div className={styles.threeDLegend} key={`legend-${colorScheme}`}>
              <h4>{colorScheme.charAt(0).toUpperCase() + colorScheme.slice(1).replace('-', ' ')} Legend</h4>
              <ColorLegend colorScheme={colorScheme} />
            </div>
          </Html>
        </PerformanceMonitor>
      </Canvas>
      
      {/* Unified control panel overlay */}
      <div className={styles.controlPanelOverlay}>
        {/* Toggle button for overlay controls */}
        <button 
          className={styles.toggleButton}
          onClick={() => {
            // Removed unused variable
          }}
          aria-label={'Hide controls'}
        >
          {'−'}
        </button>
        
        {/* Removed unused code */}
      </div>
      
      {/* Selected Element Panel with Details */}
      {selectedElement && (
        <Html position={[0, 0, 0]} portal={portalRef}>
          <div className={styles.selectedElementPanel}>
            <h3>Selected Element</h3>
            <h2>{selectedElement.name} ({selectedElement.symbol})</h2>
            <div className={styles.elementDetails}>
              <div className={styles.detailItem}>
                <span className={styles.detailLabel}>Atomic Number:</span> {selectedElement.number}
              </div>
              <div className={styles.detailItem}>
                <span className={styles.detailLabel}>Category:</span> {selectedElement.category}
              </div>
              <div className={styles.detailItem}>
                <span className={styles.detailLabel}>State:</span> {selectedElement.phase}
              </div>
              <div className={styles.detailItem}>
                <span className={styles.detailLabel}>Atomic Mass:</span> {selectedElement.atomic_mass.toFixed(4)}
              </div>
              <div className={styles.detailItem}>
                <span className={styles.detailLabel}>Electron Configuration:</span> {selectedElement.electron_configuration}
              </div>
              {selectedElement.frequency && (
                <div className={styles.detailItem}>
                  <span className={styles.detailLabel}>Frequency:</span> {selectedElement.frequency.toFixed(2)} Hz
                </div>
              )}
              {selectedElement.octave !== undefined && (
                <div className={styles.detailItem}>
                  <span className={styles.detailLabel}>Octave:</span> {selectedElement.octave}
                </div>
              )}
            </div>
            <div className={styles.colorBox} style={{ backgroundColor: getElementColor(selectedElement, colorScheme) }}></div>
            <div className={styles.elementLegend}>
              <ColorLegend colorScheme={colorScheme} />
            </div>
          </div>
        </Html>
      )}

      {/* Global Color Legend */}
      <Html position={[0, 0, 0]} portal={portalRef}>
        <div className={styles.legendContainer}>
          <div className={styles.threeDLegend}>
            <h4>Color Legend: {colorScheme.charAt(0).toUpperCase() + colorScheme.slice(1)}</h4>
            <ColorLegend colorScheme={colorScheme} />
          </div>
        </div>
      </Html>
      
      <div ref={portalRef} id="portal" className={styles.portalContainer} />

      {/* Render each element */}
      <PeriodicTableScene 
        colorScheme={colorScheme}
        visualizationType={visualizationType}
      />
    </div>
  );
};

export default PeriodicTableR3F;
