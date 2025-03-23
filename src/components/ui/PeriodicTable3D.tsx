import React, { useState, useEffect, useRef } from 'react';
import * as THREE from 'three';
import styles from '@/styles/PeriodicTable3D.module.css';
import { Element } from '@/types/element';
import { useElementStore } from '@/store/elementStore';
import AtomicStructure from './AtomicStructure';

// Type for visualization modes
type VisualizationType = 'spiral' | 'table' | 'harmonic';
type ColorScheme = 'category' | 'state' | 'note' | 'electroneg';

// Interface for the component props
interface PeriodicTable3DProps {
  elements?: Element[];
  colorScheme?: string;
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
      state: "gas" as const,
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
      state: "gas" as const,
      electronegativity: null
    },
    // ...more elements would be included here
  ] as Element[]
};

// 3D table layout positions
const getElementPosition = (atomicNumber: number) => {
  // For spiral layout
  if (atomicNumber <= 18) {
    // Place the first 18 elements in a circle
    const angle = (atomicNumber / 18) * Math.PI * 2;
    const radius = 5;
    const x = Math.cos(angle) * radius;
    const y = Math.sin(angle) * radius;
    return new THREE.Vector3(x, y, 0);
  } else {
    // Place remaining elements in expanding spiral
    const angle = (atomicNumber / 18) * Math.PI * 2;
    const radius = 5 + Math.floor(atomicNumber / 18) * 1.5;
    const x = Math.cos(angle) * radius;
    const y = Math.sin(angle) * radius;
    return new THREE.Vector3(x, y, 0);
  }
};

// Get element color based on scheme
const getElementColor = (element: Element, scheme: ColorScheme) => {
  if (scheme === 'category') {
    switch (element.category) {
      case 'alkali metal': return new THREE.Color(0xff8a65);
      case 'alkaline earth metal': return new THREE.Color(0xffb74d);
      case 'transition metal': return new THREE.Color(0xffd54f);
      case 'post-transition metal': return new THREE.Color(0xdce775);
      case 'metalloid': return new THREE.Color(0xaed581);
      case 'nonmetal': return new THREE.Color(0x4fc3f7);
      case 'halogen': return new THREE.Color(0x4dd0e1);
      case 'noble gas': return new THREE.Color(0x7986cb);
      case 'lanthanoid': return new THREE.Color(0xba68c8);
      case 'actinoid': return new THREE.Color(0xf06292);
      default: return new THREE.Color(0xe0e0e0);
    }
  } else if (scheme === 'state') {
    switch (element.state) {
      case 'solid': return new THREE.Color(0x90caf9);
      case 'liquid': return new THREE.Color(0x80deea);
      case 'gas': return new THREE.Color(0xef9a9a);
      default: return new THREE.Color(0xe0e0e0);
    }
  } else if (scheme === 'note') {
    // Color based on musical notes (using 7 colors for 7 notes)
    const noteIndex = element.atomicNumber % 7;
    const colors = [
      0xff0000, // C - Red
      0xff7f00, // D - Orange
      0xffff00, // E - Yellow
      0x00ff00, // F - Green
      0x0000ff, // G - Blue
      0x4b0082, // A - Indigo
      0x9400d3  // B - Violet
    ];
    return new THREE.Color(colors[noteIndex]);
  } else if (scheme === 'electroneg') {
    // Color based on electronegativity
    const electronegativity = element.electronegativity ?? 0;
    // Color from blue (low) to red (high)
    const hue = (1 - (electronegativity / 4)) * 240; // 4 is approximate max electronegativity
    return new THREE.Color(`hsl(${hue}, 100%, 50%)`);
  }
  
  // Default color
  return new THREE.Color(0xaaaaaa);
};

const PeriodicTable3D: React.FC<PeriodicTable3DProps> = ({ 
  elements = periodicTableData.elements,
  colorScheme: propColorScheme = 'note' 
}) => {
  // State for visualizations
  const [visualizationType, setVisualizationType] = useState<VisualizationType>('spiral');
  const [colorScheme, setColorScheme] = useState<ColorScheme>((propColorScheme || 'note') as ColorScheme);
  // Use element store instead of local state
  const { selectedElement, setSelectedElement } = useElementStore();
  const [autoRotate, setAutoRotate] = useState(false);
  const [showDetails, setShowDetails] = useState(false);
  const [zoom, setZoom] = useState(8);
  
  // Update colorScheme when prop changes
  useEffect(() => {
    setColorScheme((propColorScheme || 'note') as ColorScheme);
  }, [propColorScheme]);
  
  // Refs for Three.js objects
  const containerRef = useRef<HTMLDivElement>(null);
  const requestRef = useRef<number>();
  const sceneRef = useRef<THREE.Scene | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const controlsRef = useRef<CustomControls | null>(null);

  // Create canvas texture for element display
  const createElementLabel = (element: Element) => {
    const canvas = document.createElement('canvas');
    canvas.width = 256;
    canvas.height = 256;
    
    const context = canvas.getContext('2d');
    if (!context) return canvas;
    
    // Fill background
    context.fillStyle = '#000000';
    context.fillRect(0, 0, canvas.width, canvas.height);
    
    // Draw symbol in large text
    context.font = 'bold 100px Arial';
    context.textAlign = 'center';
    context.fillStyle = '#ffffff';
    context.fillText(element.symbol, canvas.width / 2, canvas.height / 2);
    
    // Draw atomic number
    context.font = '40px Arial';
    context.fillText(element.atomicNumber.toString(), canvas.width / 2, canvas.height / 2 + 60);
    
    return canvas;
  };
  
  // Create materials array for each face of the cube
  const createElementMesh = (element: Element, scheme: ColorScheme, position: THREE.Vector3) => {
    const color = getElementColor(element, scheme);
    const colorHex = '#' + color.getHexString();
    
    // Create a single canvas texture to use for all faces
    const canvas = createElementLabel(element);
    const texture = new THREE.CanvasTexture(canvas);
    
    // Create materials for each face
    const materials = [
      new THREE.MeshPhongMaterial({ color: colorHex, map: texture }),
      new THREE.MeshPhongMaterial({ color: colorHex, map: texture }),
      new THREE.MeshPhongMaterial({ color: colorHex, map: texture }),
      new THREE.MeshPhongMaterial({ color: colorHex, map: texture }),
      new THREE.MeshPhongMaterial({ color: colorHex, map: texture }),
      new THREE.MeshPhongMaterial({ color: colorHex, map: texture })
    ];
    
    // Create mesh
    const geometry = new THREE.BoxGeometry(1, 1, 1);
    const cube = new THREE.Mesh(geometry, materials);
    cube.position.copy(position);
    
    // Store element data as user data for raycasting
    cube.userData.element = element;
    
    return cube;
  };

  // Initialize and maintain Three.js scene
  useEffect(() => {
    if (!containerRef.current) return;

    // Clear previous scene
    while (containerRef.current.firstChild) {
      containerRef.current.removeChild(containerRef.current.firstChild);
    }

    // Setup scene
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x121212);
    sceneRef.current = scene;
    
    // Setup camera
    const aspect = containerRef.current.clientWidth / containerRef.current.clientHeight;
    const camera = new THREE.PerspectiveCamera(75, aspect, 0.1, 1000);
    camera.position.z = zoom;
    cameraRef.current = camera;
    
    // Setup renderer
    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(containerRef.current.clientWidth, containerRef.current.clientHeight);
    containerRef.current.appendChild(renderer.domElement);
    rendererRef.current = renderer;
    
    // Add lights
    const ambientLight = new THREE.AmbientLight(0x404040, 1);
    scene.add(ambientLight);
    
    const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
    directionalLight.position.set(5, 5, 5);
    scene.add(directionalLight);
    
    const directionalLight2 = new THREE.DirectionalLight(0xffffff, 0.5);
    directionalLight2.position.set(-5, -5, -5);
    scene.add(directionalLight2);
    
    // Create custom controls instead of OrbitControls
    const controls = new CustomControls(camera, renderer.domElement);
    controls.setAutoRotate(autoRotate);
    controlsRef.current = controls;
    
    // Create raycaster for mouse picking
    const raycaster = new THREE.Raycaster();
    const mouse = new THREE.Vector2();
    
    // Create periodic table
    const elementObjects: { [key: string]: THREE.Mesh } = {};
    const boundingBox = new THREE.Box3();
    
    // Create elements based on visualization type
    elements.forEach((element) => {
      const position = getElementPosition(element.atomicNumber);
      const mesh = createElementMesh(element, colorScheme, position);
      
      // Store mesh reference
      elementObjects[element.symbol] = mesh;
      
      // Add to scene
      scene.add(mesh);

      // Expand bounding box to include this element
      boundingBox.expandByObject(mesh);
    });
    
    // Center the entire periodic table based on its bounding box
    const center = new THREE.Vector3();
    boundingBox.getCenter(center);
    
    // Adjust all element positions to center the table
    Object.values(elementObjects).forEach(mesh => {
      mesh.position.sub(center);
    });
    
    // Handle window resize
    const handleResize = () => {
      const container = containerRef.current;
      const camera = cameraRef.current;
      const renderer = rendererRef.current;
      
      if (!container || !camera || !renderer) return;
      
      const width = container.clientWidth;
      const height = container.clientHeight;
      
      camera.aspect = width / height;
      camera.updateProjectionMatrix();
      
      renderer.setSize(width, height);
    };
    
    window.addEventListener('resize', handleResize);
    
    // Handle clicking on elements
    const handleClick = (event: MouseEvent) => {
      if (!containerRef.current || !cameraRef.current) return;
      
      // Calculate mouse position in normalized device coordinates
      const rect = containerRef.current.getBoundingClientRect();
      mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
      mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;
      
      // Update the raycaster
      raycaster.setFromCamera(mouse, cameraRef.current);
      
      // Find intersections
      const intersects = raycaster.intersectObjects(scene.children);
      
      if (intersects.length > 0) {
        const selectedObject = intersects[0].object;
        
        // Find which element was clicked using userData
        if (selectedObject.userData?.element) {
          const clickedElement = selectedObject.userData.element as Element;
          console.log(`Selected element: ${clickedElement.name} (${clickedElement.symbol})`);
          setSelectedElement(clickedElement);
        }
      }
    };
    
    containerRef.current.addEventListener('click', handleClick);
    
    // Animation loop
    const animate = () => {
      requestRef.current = requestAnimationFrame(animate);
      
      if (controlsRef.current) {
        controlsRef.current.update();
      }
      
      if (rendererRef.current && cameraRef.current && sceneRef.current) {
        rendererRef.current.render(sceneRef.current, cameraRef.current);
      }
    };
    
    animate();
    
    // Apply zoom from state
    camera.position.z = zoom;
    
    // Cleanup on unmount
    return () => {
      if (requestRef.current) {
        cancelAnimationFrame(requestRef.current);
      }
      
      window.removeEventListener('resize', handleResize);
      containerRef.current?.removeEventListener('click', handleClick);
      
      // Dispose geometries and materials
      Object.values(elementObjects).forEach(disposeGeometryAndMaterial);
      
      if (controlsRef.current) controlsRef.current.dispose();
      if (rendererRef.current) rendererRef.current.dispose();
    };
  }, [visualizationType, autoRotate, zoom, colorScheme]);

  // Update auto-rotate when checkbox changes
  useEffect(() => {
    if (controlsRef.current) {
      controlsRef.current.setAutoRotate(autoRotate);
    }
  }, [autoRotate]);

  // Update zoom when slider changes
  useEffect(() => {
    if (cameraRef.current) {
      cameraRef.current.position.z = zoom;
    }
  }, [zoom]);
  
  return (
    <div className={styles.periodicTableContainer}>
      <div className={styles.controlBar}>
        <div className={styles.visualizationControls}>
          <div className={styles.visualizationSelector}>
            <span>Visualization:</span>&nbsp;
            <select 
              value={visualizationType} 
              onChange={(e) => setVisualizationType(e.target.value as VisualizationType)}
            >
              <option value="spiral">Spiral (Atomic Number)</option>
              <option value="table">Traditional Table</option>
              <option value="harmonic">Harmonic (Frequency)</option>
            </select>
          </div>
          <label className={styles.controlLabel}>
            <input
              type="checkbox"
              checked={autoRotate}
              onChange={(e) => setAutoRotate(e.target.checked)}
            />
            <span>Auto Rotate</span>
          </label>
          <label className={styles.controlLabel}>
            <input
              type="checkbox"
              checked={showDetails}
              onChange={(e) => setShowDetails(e.target.checked)}
            />
            <span>Show Details</span>
          </label>
        </div>
        
        <div className={styles.soundControls}>
          <span>Zoom:</span>&nbsp;
          <input
            type="range"
            min={2}
            max={20}
            value={zoom}
            onChange={(e) => setZoom(Number(e.target.value))}
            className={styles.slider}
          />
        </div>
      </div>

      <div className={styles.mainContent}>
        <div className={styles.visualizationContainer}>
          <div className={styles.visualization} ref={containerRef}>
            {!selectedElement && (
              <div className={styles.interactiveControls}>
                <h3>Interactive Controls:</h3>
                <ul>
                  <li><strong>Rotate:</strong> Click and drag with mouse</li>
                  <li><strong>Zoom:</strong> Use mouse wheel to zoom in/out</li>
                  <li><strong>Select:</strong> Click on any element to see details</li>
                  <li><strong>Auto-Rotate:</strong> Toggle rotation with the checkbox above</li>
                </ul>
              </div>
            )}
          </div>
          
          {selectedElement && (
            <div className={styles.elementDescription}>
              <h2>{selectedElement.name} ({selectedElement.symbol})</h2>
              <div className={styles.elementInfo}>
                <p><strong>Atomic Number:</strong> {selectedElement.atomicNumber}</p>
                <p><strong>Atomic Mass:</strong> {selectedElement.atomicMass}</p>
                <p><strong>Category:</strong> {selectedElement.category}</p>
                <p><strong>State:</strong> {selectedElement.state}</p>
                <p><strong>Electron Configuration:</strong> {selectedElement.electronConfiguration}</p>
                {selectedElement.electronegativity && (
                  <p><strong>Electronegativity:</strong> {selectedElement.electronegativity}</p>
                )}
              </div>
            </div>
          )}
        </div>
        
        {selectedElement && (
          <div className={styles.atomicStructurePanelLarge}>
            <h3 className={styles.sectionTitle}>Atomic Structure</h3>
            <AtomicStructure element={selectedElement} />
          </div>
        )}
      </div>
    </div>
  );
};

export default PeriodicTable3D;
