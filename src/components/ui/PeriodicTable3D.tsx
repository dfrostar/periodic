import React, { useState, useEffect, useRef } from 'react';
import * as THREE from 'three';
import styles from '@/styles/PeriodicTable3D.module.css';
import { Element } from '@/types/element';
import { useElementStore } from '@/store/elementStore';
import AtomicStructure from './AtomicStructure';
import ColorLegend from './ColorLegend';

// Type for visualization modes
type VisualizationType = 'spiral' | 'table' | 'harmonic' | 'orbital';
type ColorScheme = 'category' | 'state' | 'atomic-radius' | 'frequency' | 'octave';

// Interface for the component props
interface PeriodicTable3DProps {
  elements?: Element[];
  colorScheme?: ColorScheme;
  visualizationType?: VisualizationType;
}

// Custom camera controls class to replace OrbitControls
class CustomControls {
  private readonly camera: THREE.PerspectiveCamera;
  private readonly domElement: HTMLElement;
  private readonly enabled: boolean = true;
  private readonly target: THREE.Vector3 = new THREE.Vector3();
  private readonly minDistance: number = 1;
  private readonly maxDistance: number = 50;
  private readonly enableZoom: boolean = true;
  private readonly enableRotate: boolean = true;
  private readonly autoRotateSpeed: number = 1.0;
  
  private readonly rotateStart = new THREE.Vector2();
  private readonly rotateEnd = new THREE.Vector2();
  private readonly rotateDelta = new THREE.Vector2();
  
  private readonly spherical = new THREE.Spherical();
  private isDragging = false;
  private autoRotate: boolean = false;
  
  constructor(camera: THREE.PerspectiveCamera, domElement: HTMLElement) {
    this.camera = camera;
    this.domElement = domElement;
    
    // Set initial spherical coordinates
    this.updateSpherical();
    
    // Event listeners
    this.domElement.addEventListener('mousedown', this.onMouseDown);
    this.domElement.addEventListener('mousemove', this.onMouseMove);
    window.addEventListener('mouseup', this.onMouseUp);
    this.domElement.addEventListener('wheel', this.onMouseWheel);
  }
  
  private updateSpherical() {
    const offset = new THREE.Vector3();
    offset.copy(this.camera.position).sub(this.target);
    this.spherical.setFromVector3(offset);
  }
  
  private readonly onMouseDown = (event: MouseEvent) => {
    if (!this.enabled || !this.enableRotate) return;
    
    event.preventDefault();
    this.isDragging = true;
    
    this.rotateStart.set(event.clientX, event.clientY);
  };
  
  private readonly onMouseMove = (event: MouseEvent) => {
    if (!this.enabled || !this.isDragging) return;
    
    event.preventDefault();
    
    this.rotateEnd.set(event.clientX, event.clientY);
    this.rotateDelta.subVectors(this.rotateEnd, this.rotateStart);
    
    // Rotate based on mouse movement
    this.spherical.theta -= 2 * Math.PI * this.rotateDelta.x / this.domElement.clientWidth;
    this.spherical.phi -= 2 * Math.PI * this.rotateDelta.y / this.domElement.clientHeight;
    
    // Limit the phi angle (avoid the poles)
    this.spherical.phi = Math.max(0.1, Math.min(Math.PI - 0.1, this.spherical.phi));
    
    this.updateCamera();
    
    this.rotateStart.copy(this.rotateEnd);
  };
  
  private readonly onMouseUp = () => {
    this.isDragging = false;
  };
  
  private readonly onMouseWheel = (event: WheelEvent) => {
    if (!this.enabled || !this.enableZoom) return;
    
    event.preventDefault();
    
    // Zoom based on wheel direction
    const delta = event.deltaY;
    
    if (delta > 0) {
      // Zoom out
      this.spherical.radius += this.spherical.radius * 0.1;
    } else {
      // Zoom in
      this.spherical.radius -= this.spherical.radius * 0.1;
    }
    
    // Clamp distance
    this.spherical.radius = Math.max(this.minDistance, Math.min(this.maxDistance, this.spherical.radius));
    
    this.updateCamera();
  };
  
  private updateCamera() {
    const offset = new THREE.Vector3();
    
    // Convert spherical to cartesian
    offset.setFromSpherical(this.spherical);
    
    // Add offset to target to get new camera position
    offset.add(this.target);
    
    this.camera.position.copy(offset);
    this.camera.lookAt(this.target);
  }
  
  public update() {
    if (this.autoRotate && !this.isDragging) {
      this.spherical.theta += this.autoRotateSpeed * 0.01;
      this.updateCamera();
    }
  }
  
  public setAutoRotate(value: boolean) {
    this.autoRotate = value;
  }
  
  public dispose() {
    this.domElement.removeEventListener('mousedown', this.onMouseDown);
    this.domElement.removeEventListener('mousemove', this.onMouseMove);
    window.removeEventListener('mouseup', this.onMouseUp);
    this.domElement.removeEventListener('wheel', this.onMouseWheel);
  }
}

// Helper functions outside of component to reduce nesting depth
const disposeGeometryAndMaterial = (mesh: THREE.Mesh) => {
  if (mesh.geometry) mesh.geometry.dispose();
  if (mesh.material) {
    if (Array.isArray(mesh.material)) {
      mesh.material.forEach(material => material.dispose());
    } else {
      mesh.material.dispose();
    }
  }
};

// Sample periodic table data for development
const periodicTableData = {
  elements: [
    {
      atomicNumber: 1,
      symbol: "H",
      name: "Hydrogen",
      atomicMass: 1.008,
      category: "nonmetal",
      group: 1,
      period: 1,
      block: "s",
      electronConfiguration: "1s1",
      state: "gas",
      electronegativity: 2.2
    },
    {
      atomicNumber: 2,
      symbol: "He",
      name: "Helium",
      atomicMass: 4.0026,
      category: "noble gas",
      group: 18,
      period: 1,
      block: "s",
      electronConfiguration: "1s2",
      state: "gas",
      electronegativity: null
    },
    // ...more elements would be included here
  ] as Element[]
};

// 3D table layout position helper functions
const getSpiralPosition = (atomicNumber: number) => {
  if (atomicNumber <= 18) {
    // Place the first 18 elements in a circle
    const angle = (atomicNumber / 18) * Math.PI * 2;
    const radius = 5;
    const x = Math.cos(angle) * radius;
    const y = Math.sin(angle) * radius;
    return new THREE.Vector3(x, y, 0);
  } else {
    // Place the rest in an outward spiral
    const turns = 2; // Number of turns in the spiral
    const theta = (atomicNumber / 118) * turns * Math.PI * 2;
    const radius = 5 + (atomicNumber - 18) * 0.1;
    const x = Math.cos(theta) * radius;
    const y = Math.sin(theta) * radius;
    return new THREE.Vector3(x, y, 0);
  }
};

const getTablePosition = (atomicNumber: number) => {
  // Conventional periodic table layout
  const element = periodicTableData.elements.find(e => e.atomicNumber === atomicNumber);
  if (!element) return new THREE.Vector3(0, 0, 0);
  
  const group = element.group || 0;
  const period = element.period || 0;
  
  // Apply offsets for lanthanides and actinides
  const x = group;
  const y = -period;
  
  return new THREE.Vector3(x, y, 0);
};

const getHarmonicPosition = (atomicNumber: number) => {
  // Musical harmonic layout based on note frequencies
  const noteIndex = atomicNumber % 12; // Maps to 12 musical notes
  const octave = Math.floor(atomicNumber / 12);
  
  // Use a circle of fifths layout
  const angle = (noteIndex / 12) * Math.PI * 2;
  const radius = 4 + octave * 0.8;
  const x = Math.cos(angle) * radius;
  const y = Math.sin(angle) * radius;
  const z = octave * 0.5; // Slight elevation for higher octaves
  
  return new THREE.Vector3(x, y, z);
};

const getOrbitalPosition = (atomicNumber: number) => {
  // Orbital layout based on electron configuration
  const element = periodicTableData.elements.find(e => e.atomicNumber === atomicNumber);
  if (!element) return new THREE.Vector3(0, 0, 0);
  
  const electronConfiguration = element.electronConfiguration;
  const orbitals = electronConfiguration.split(' ');
  const orbitalIndex = orbitals.findIndex(orbital => 
    orbital.includes('s') || orbital.includes('p') || 
    orbital.includes('d') || orbital.includes('f')
  );
  
  if (orbitalIndex === -1) return new THREE.Vector3(0, 0, 0);
  
  // Use the orbital type to position elements
  const currentOrbital = orbitals[orbitalIndex];
  const radius = orbitalIndex * 2;
  const angle = atomicNumber * Math.PI / 18;
  const x = radius * Math.cos(angle);
  const y = radius * Math.sin(angle);
  
  // Determine z position based on orbital type
  let z = 0;
  if (currentOrbital.includes('p')) {
    z = 1;
  } else if (currentOrbital.includes('d')) {
    z = 2;
  } else if (currentOrbital.includes('f')) {
    z = 3;
  }
  
  return new THREE.Vector3(x, y, z);
};

// Main element position function with reduced complexity
const getElementPosition = (atomicNumber: number, visualizationType: VisualizationType) => {
  switch (visualizationType) {
    case 'spiral': 
      return getSpiralPosition(atomicNumber);
    case 'table': 
      return getTablePosition(atomicNumber);
    case 'harmonic': 
      return getHarmonicPosition(atomicNumber);
    case 'orbital': 
      return getOrbitalPosition(atomicNumber);
    default: 
      return new THREE.Vector3(0, 0, 0);
  }
};

// Get element color based on scheme
const getElementColor = (element: Element, scheme: string) => {
  // Color based on category (default)
  if (scheme === 'category') {
    switch (element.category) {
      case 'alkali metal': 
      case 'alkali-metal': return new THREE.Color('#ff4c4c'); // Consistent red
      case 'alkaline earth metal': 
      case 'alkaline-earth-metal': return new THREE.Color('#ff9999'); // Consistent light red
      case 'transition metal': 
      case 'transition-metal': return new THREE.Color('#ffb86c'); // Consistent orange
      case 'post-transition metal': 
      case 'post-transition-metal': return new THREE.Color('#8be9fd'); // Consistent light blue
      case 'metalloid': return new THREE.Color('#bd93f9'); // Consistent purple
      case 'nonmetal': return new THREE.Color('#0096FF'); // Consistent blue
      case 'halogen': return new THREE.Color('#ff79c6'); // Consistent pink
      case 'noble gas': 
      case 'noble-gas': return new THREE.Color('#5cb3cc'); // Consistent light blue
      case 'lanthanoid': return new THREE.Color('#50fa7b'); // Consistent green
      case 'actinoid': return new THREE.Color('#94e2d5'); // Consistent teal
      default: return new THREE.Color('#bfbfbf'); // Consistent gray
    }
  } 
  // Color based on physical state
  else if (scheme === 'state') {
    switch (element.state) {
      case 'solid': return new THREE.Color('#FFB861'); // Match ElementTile solid color
      case 'liquid': return new THREE.Color('#6495ED'); // Match ElementTile liquid color
      case 'gas': return new THREE.Color('#63E2FF'); // Match ElementTile gas color
      default: return new THREE.Color('#bfbfbf');
    }
  } 
  // Color based on atomic radius
  else if (scheme === 'atomic-radius') {
    // Use atomic radius for color
    const radius = element.atomicRadius ?? element.atomicMass / 10; // Fallback to atomicMass
    const normalizedRadius = Math.min(Math.max((radius - 30) / 200, 0), 1); // Match ElementTile normalization
    
    // Color gradient from blue to red (matching ElementTile)
    const r = Math.floor(normalizedRadius * 255);
    const g = Math.floor((1 - Math.abs(normalizedRadius - 0.5) * 2) * 255);
    const b = Math.floor((1 - normalizedRadius) * 255);
    
    return new THREE.Color(`rgb(${r}, ${g}, ${b})`);
  }
  // Color based on frequency
  else if (scheme === 'frequency') {
    // Map to musical note colors (C to B) - matching ElementTile with 12 notes
    const noteIndex = element.atomicNumber % 12;
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
    return new THREE.Color(noteColors[noteIndex]);
  }
  // Color based on octave
  else if (scheme === 'octave') {
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
    
    return new THREE.Color(octaveColors[elemOctave % octaveColors.length]);
  }
  
  // Default color
  return new THREE.Color('#bfbfbf');
};

const PeriodicTable3D: React.FC<PeriodicTable3DProps> = ({ 
  elements = periodicTableData.elements,
  colorScheme = 'category',
  visualizationType = 'spiral'
}) => {
  // Component state
  const [colorSchemeState, setColorSchemeState] = useState<ColorScheme>(colorScheme);
  const [visualizationTypeState, setVisualizationTypeState] = useState<VisualizationType>(visualizationType);
  const [autoRotate, setAutoRotate] = useState(true);
  const [showControls, setShowControls] = useState(true);
  const containerRef = useRef<HTMLDivElement>(null);
  const selectedElement = useElementStore(state => state.selectedElement);
  
  // Three.js related state
  const [camera, setCamera] = useState<THREE.PerspectiveCamera | null>(null);
  const [controls, setControls] = useState<CustomControls | null>(null);
  const [scene, setScene] = useState<THREE.Scene | null>(null);
  const [renderer, setRenderer] = useState<THREE.WebGLRenderer | null>(null);
  
  // Effect for initializing the 3D scene
  useEffect(() => {
    if (!containerRef.current) return;
    
    // Scene initialization
    const container = containerRef.current;
    const width = container.clientWidth;
    const height = container.clientHeight;
    
    // Scene setup
    const newScene = new THREE.Scene();
    newScene.background = new THREE.Color(0x111111);
    
    // Camera setup
    const aspect = width / height;
    const newCamera = new THREE.PerspectiveCamera(75, aspect, 0.1, 1000);
    newCamera.position.z = 15;
    
    // Renderer setup
    const newRenderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    newRenderer.setSize(width, height);
    newRenderer.setPixelRatio(window.devicePixelRatio);
    container.appendChild(newRenderer.domElement);
    
    // Lighting
    const ambientLight = new THREE.AmbientLight(0x808080);
    newScene.add(ambientLight);
    
    const mainLight = new THREE.DirectionalLight(0xffffff, 1);
    mainLight.position.set(10, 10, 10);
    newScene.add(mainLight);
    
    const fillLight = new THREE.DirectionalLight(0xffffff, 0.5);
    fillLight.position.set(-10, -10, -10);
    newScene.add(fillLight);
    
    // Controls
    const newControls = new CustomControls(newCamera, newRenderer.domElement);
    newControls.setAutoRotate(autoRotate);
    
    // Save references
    setCamera(newCamera);
    setControls(newControls);
    setScene(newScene);
    setRenderer(newRenderer);
    
    // Cleanup on component unmount
    return () => {
      if (newRenderer && container) {
        container.removeChild(newRenderer.domElement);
        newRenderer.dispose();
      }
      
      if (newControls) {
        newControls.dispose();
      }
      
      // Clean up any meshes
      if (newScene) {
        newScene.traverse((object) => {
          if (object instanceof THREE.Mesh) {
            disposeGeometryAndMaterial(object);
          }
        });
      }
    };
  }, [autoRotate]);
  
  // Effect for handling window resize
  useEffect(() => {
    if (!containerRef.current || !camera || !renderer) return;
    
    const handleResize = () => {
      if (!containerRef.current || !camera || !renderer) return;
      
      const width = containerRef.current.clientWidth;
      const height = containerRef.current.clientHeight;
      
      camera.aspect = width / height;
      camera.updateProjectionMatrix();
      
      renderer.setSize(width, height);
    };
    
    window.addEventListener('resize', handleResize);
    
    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, [camera, renderer]);
  
  // Effect for populating the scene with element cubes
  useEffect(() => {
    if (!scene) return;
    
    // Clear existing elements
    const elementsToRemove: THREE.Object3D[] = [];
    scene.traverse((object) => {
      if (object instanceof THREE.Mesh && object.userData.isElementCube) {
        elementsToRemove.push(object);
      }
    });
    
    elementsToRemove.forEach((object) => {
      scene.remove(object);
      if (object instanceof THREE.Mesh) {
        disposeGeometryAndMaterial(object);
      }
    });
    
    // Add elements
    elements.forEach(element => {
      const position = getElementPosition(element.atomicNumber, visualizationTypeState);
      
      // Create a mesh for each element (this will be replaced by ElementCube in React Three Fiber)
      const geometry = new THREE.BoxGeometry(1, 1, 1);
      const material = new THREE.MeshStandardMaterial({
        color: getElementColor(element, colorSchemeState),
        metalness: 0.5,
        roughness: 0.5
      });
      
      const mesh = new THREE.Mesh(geometry, material);
      mesh.position.copy(position);
      mesh.userData = { 
        isElementCube: true, 
        atomicNumber: element.atomicNumber,
        symbol: element.symbol,
        name: element.name
      };
      
      scene.add(mesh);
    });
    
  }, [scene, elements, colorSchemeState, visualizationTypeState]);
  
  // Animation loop
  useEffect(() => {
    if (!renderer || !scene || !camera || !controls) return;
    
    let frameId: number;
    
    const animate = () => {
      frameId = requestAnimationFrame(animate);
      
      // Update controls
      controls.update();
      
      // Render the scene
      renderer.render(scene, camera);
    };
    
    animate();
    
    return () => {
      cancelAnimationFrame(frameId);
    };
  }, [renderer, scene, camera, controls]);
  
  // Handlers for controls
  const handleColorSchemeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setColorSchemeState(e.target.value as ColorScheme);
  };
  
  const handleVisualizationTypeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setVisualizationTypeState(e.target.value as VisualizationType);
  };
  
  const toggleAutoRotate = () => {
    const newAutoRotate = !autoRotate;
    setAutoRotate(newAutoRotate);
    if (controls) {
      controls.setAutoRotate(newAutoRotate);
    }
  };
  
  const toggleControls = () => {
    setShowControls(!showControls);
  };
  
  return (
    <div className={styles.container}>
      <div ref={containerRef} className={styles.visualizationContainer}></div>
      
      {/* Controls Panel */}
      {showControls && (
        <div className={styles.controlsPanel}>
          <div className={styles.controlGroup}>
            <label htmlFor="colorScheme">Color Scheme:</label>
            <select 
              id="colorScheme"
              value={colorSchemeState}
              onChange={handleColorSchemeChange}
              className={styles.select}
            >
              <option value="category">Element Category</option>
              <option value="state">Physical State</option>
              <option value="atomic-radius">Atomic Radius</option>
              <option value="frequency">Musical Frequency</option>
              <option value="octave">Musical Octave</option>
            </select>
          </div>
          
          <div className={styles.controlGroup}>
            <label htmlFor="visualizationType">Visualization:</label>
            <select 
              id="visualizationType"
              value={visualizationTypeState}
              onChange={handleVisualizationTypeChange}
              className={styles.select}
            >
              <option value="spiral">Spiral</option>
              <option value="table">Periodic Table</option>
              <option value="harmonic">Harmonic</option>
              <option value="orbital">Orbital</option>
            </select>
          </div>
          
          <div className={styles.controlGroup}>
            <button 
              onClick={toggleAutoRotate}
              className={`${styles.button} ${autoRotate ? styles.active : ''}`}
            >
              {autoRotate ? 'Disable Auto-Rotate' : 'Enable Auto-Rotate'}
            </button>
          </div>
          
          {/* Color Legend */}
          <div className={styles.legendContainer}>
            <ColorLegend colorScheme={colorSchemeState} />
          </div>
        </div>
      )}
      
      {/* Toggle Controls Button */}
      <button 
        className={styles.toggleControls}
        onClick={toggleControls}
      >
        {showControls ? 'Hide Controls' : 'Show Controls'}
      </button>
      
      {/* Element Details Panel */}
      {selectedElement && (
        <div className={styles.elementDetails}>
          <h3>{selectedElement.name} ({selectedElement.symbol})</h3>
          <p>Atomic Number: {selectedElement.atomicNumber}</p>
          <p>Atomic Mass: {selectedElement.atomicMass}</p>
          <p>Category: {selectedElement.category}</p>
          <p>State: {selectedElement.state}</p>
          
          {/* Atomic Structure Visualization */}
          <div className={styles.atomicStructure}>
            <AtomicStructure element={selectedElement} />
          </div>
        </div>
      )}
    </div>
  );
};

export default PeriodicTable3D;
