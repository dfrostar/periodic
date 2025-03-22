import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { Element } from '@/types/element';
import styles from '@/styles/AtomicStructure.module.css';

interface AtomicStructureProps {
  element: Element | null;
}

// Helper functions to reduce nesting depth
const createProton = (index: number, atomicNumber: number) => {
  const protonGeometry = new THREE.SphereGeometry(0.5, 32, 32);
  const protonMaterial = new THREE.MeshStandardMaterial({ 
    color: 0xff4444,
    emissive: 0x331111,
    roughness: 0.4,
    metalness: 0.3
  });
  const proton = new THREE.Mesh(protonGeometry, protonMaterial);
  
  // Position protons in a clustered arrangement
  const angle = (index / atomicNumber) * Math.PI * 2;
  const radius = 1.5 * Math.sqrt(atomicNumber) / Math.PI;
  const x = Math.cos(angle) * radius * (0.8 + Math.random() * 0.4);
  const y = Math.sin(angle) * radius * (0.8 + Math.random() * 0.4);
  const z = (Math.random() - 0.5) * radius;
  
  proton.position.set(x, y, z);
  return proton;
};

const createNeutron = (index: number, neutronCount: number) => {
  const neutronGeometry = new THREE.SphereGeometry(0.5, 32, 32);
  const neutronMaterial = new THREE.MeshStandardMaterial({ 
    color: 0x4444ff,
    emissive: 0x111133,
    roughness: 0.4,
    metalness: 0.3
  });
  const neutron = new THREE.Mesh(neutronGeometry, neutronMaterial);
  
  // Position neutrons in a clustered arrangement
  const angle = (index / neutronCount) * Math.PI * 2;
  const radius = 1.5 * Math.sqrt(neutronCount) / Math.PI;
  const x = Math.cos(angle) * radius * (0.8 + Math.random() * 0.4);
  const y = Math.sin(angle) * radius * (0.8 + Math.random() * 0.4);
  const z = (Math.random() - 0.5) * radius;
  
  neutron.position.set(x, y, z);
  return neutron;
};

const createElectronShell = (shellNumber: number) => {
  const shellRadius = 3 + (shellNumber * 2.5);
  const shellGeometry = new THREE.TorusGeometry(shellRadius, 0.05, 16, 100);
  const shellMaterial = new THREE.MeshBasicMaterial({ 
    color: 0x333333, 
    transparent: true, 
    opacity: 0.5 
  });
  const shell = new THREE.Mesh(shellGeometry, shellMaterial);
  
  // Rotate shell to appear horizontal
  shell.rotation.x = Math.PI / 2;
  
  return shell;
};

const createElectron = (position: number, totalElectrons: number, shellRadius: number) => {
  const electronGeometry = new THREE.SphereGeometry(0.3, 16, 16);
  const electronMaterial = new THREE.MeshStandardMaterial({ 
    color: 0x44ff44,
    emissive: 0x113311,
    roughness: 0.4,
    metalness: 0.3
  });
  const electron = new THREE.Mesh(electronGeometry, electronMaterial);
  
  // Position electron on shell
  const angle = position;
  const x = Math.cos(angle) * shellRadius;
  const z = Math.sin(angle) * shellRadius;
  electron.position.set(x, 0, z);
  
  return electron;
};

const createNucleus = (scene: THREE.Scene, atomicNumber: number, neutrons: number) => {
  const nucleusGroup = new THREE.Group();
  const protonPositions: THREE.Vector3[] = [];
  const neutronPositions: THREE.Vector3[] = [];
  
  // Add protons and neutrons to the nucleus
  for (let i = 0; i < atomicNumber; i++) {
    const proton = createProton(i, atomicNumber);
    nucleusGroup.add(proton);
    protonPositions.push(proton.position.clone());
  }
  
  for (let i = 0; i < neutrons; i++) {
    const neutron = createNeutron(i, neutrons);
    nucleusGroup.add(neutron);
    neutronPositions.push(neutron.position.clone());
  }
  
  scene.add(nucleusGroup);
  return { nucleusGroup, protonPositions, neutronPositions };
};

const createElectronShells = (scene: THREE.Scene, atomicNumber: number) => {
  // Bohr model electron configuration
  const shells = [2, 8, 18, 32, 32, 18, 8];
  const electronGroups: THREE.Group[] = [];
  const electronPositions: THREE.Vector3[] = [];
  
  let electronsPlaced = 0;
  let shellIndex = 0;
  
  while (electronsPlaced < atomicNumber && shellIndex < shells.length) {
    const shellCapacity = shells[shellIndex];
    const electronsInShell = Math.min(shellCapacity, atomicNumber - electronsPlaced);
    
    if (electronsInShell <= 0) break;
    
    const shell = createElectronShell(shellIndex);
    scene.add(shell);
    
    const electronGroup = new THREE.Group();
    scene.add(electronGroup);
    electronGroups.push(electronGroup);
    
    const shellRadius = 3 + (shellIndex * 2.5);
    
    for (let i = 0; i < electronsInShell; i++) {
      const electron = createElectron((i / electronsInShell) * Math.PI * 2, electronsInShell, shellRadius);
      electronGroup.add(electron);
      electronPositions.push(electron.position.clone());
    }
    
    electronsPlaced += electronsInShell;
    shellIndex++;
  }
  
  return { electronGroups, electronPositions };
};

const setupScene = (container: HTMLDivElement) => {
  // Create scene
  const scene = new THREE.Scene();
  scene.background = new THREE.Color(0x111111);
  
  // Create camera with adjusted field of view and position
  const camera = new THREE.PerspectiveCamera(
    60, // Wider field of view (was 75)
    container.clientWidth / container.clientHeight,
    0.1,
    1000
  );
  camera.position.z = 25; // Increased camera distance
  camera.position.y = 5; // Slightly elevated view
  
  // Setup renderer with better pixel ratio and background
  const renderer = new THREE.WebGLRenderer({ 
    antialias: true,
    alpha: true 
  });
  renderer.setSize(container.clientWidth, container.clientHeight);
  renderer.setPixelRatio(window.devicePixelRatio);
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.5;
  container.appendChild(renderer.domElement);
  
  // Enhanced lighting for better visibility
  const ambientLight = new THREE.AmbientLight(0xffffff, 0.8);
  scene.add(ambientLight);
  
  const pointLight = new THREE.PointLight(0xffffff, 1.5);
  pointLight.position.set(15, 15, 15);
  scene.add(pointLight);
  
  // Add a subtle backlight for depth
  const backLight = new THREE.PointLight(0xffffff, 0.8);
  backLight.position.set(-10, -5, -10);
  scene.add(backLight);

  // Add hemisphere light for natural lighting
  const hemiLight = new THREE.HemisphereLight(0xffffff, 0x444444, 0.6);
  scene.add(hemiLight);
  
  return { scene, camera, renderer };
};

// Helper function to dispose materials and geometries
const disposeMeshResources = (object: THREE.Object3D) => {
  if (object instanceof THREE.Mesh) {
    if (object.geometry) {
      object.geometry.dispose();
    }
    
    if (object.material) {
      if (Array.isArray(object.material)) {
        object.material.forEach((material) => material.dispose());
      } else {
        object.material.dispose();
      }
    }
  }
};

// Create CSS2DObject for a label
const createElementLabel = (text: string, color: string, position: THREE.Vector3): THREE.Group => {
  // Create a group to hold the sphere and label
  const group = new THREE.Group();
  
  // Create a text sprite
  const canvas = document.createElement('canvas');
  canvas.width = 128;
  canvas.height = 64;
  
  const context = canvas.getContext('2d');
  if (context) {
    context.fillStyle = '#ffffff';
    context.font = 'bold 48px Arial';
    context.textAlign = 'center';
    context.textBaseline = 'middle';
    context.fillText(text, canvas.width / 2, canvas.height / 2);
    
    const texture = new THREE.CanvasTexture(canvas);
    texture.needsUpdate = true;
    
    const spriteMaterial = new THREE.SpriteMaterial({ 
      map: texture,
      transparent: true
    });
    
    const sprite = new THREE.Sprite(spriteMaterial);
    sprite.scale.set(1.5, 0.75, 1);
    sprite.position.set(0, 0.6, 0);
    
    group.add(sprite);
  }
  
  group.position.copy(position);
  return group;
};

const AtomicStructure: React.FC<AtomicStructureProps> = ({ element }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const sceneRef = useRef<THREE.Scene | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const animationFrameRef = useRef<number | null>(null);
  const nucleusRef = useRef<THREE.Group | null>(null);
  const electronGroupsRef = useRef<THREE.Group[]>([]);
  const labelsRef = useRef<THREE.Group[]>([]);

  useEffect(() => {
    if (!element || !containerRef.current) return;

    // Clear previous content
    if (containerRef.current.childNodes.length > 0) {
      containerRef.current.innerHTML = '';
    }

    // Setup scene and components
    const { scene, camera, renderer } = setupScene(containerRef.current);
    sceneRef.current = scene;
    cameraRef.current = camera;
    rendererRef.current = renderer;

    // Calculate atomic structure values
    const atomicNumber = element.atomicNumber;
    const neutrons = Math.round(element.atomicMass - atomicNumber);
    
    // Create nucleus
    const { nucleusGroup, protonPositions, neutronPositions } = createNucleus(scene, atomicNumber, neutrons);
    nucleusRef.current = nucleusGroup;
    
    // Create electron shells and electrons
    const { electronGroups, electronPositions } = createElectronShells(scene, atomicNumber);
    electronGroupsRef.current = electronGroups;
    
    // Create labels - make them optional and smaller to not obstruct the view
    const labels: THREE.Group[] = [];
    
    // Don't add so many labels as they can obscure the visualization
    // Just add a few representative labels
    if (protonPositions.length > 0) {
      const label = createElementLabel('p', '0xff4444', protonPositions[0]);
      scene.add(label);
      labels.push(label);
    }
    
    if (neutronPositions.length > 0) {
      const label = createElementLabel('n', '0x4444ff', neutronPositions[0]);
      scene.add(label);
      labels.push(label);
    }
    
    electronPositions.forEach((position, index) => {
      // Only add labels to the first electron in each shell
      if (index === 0 || index === 2 || index === 10) {
        const label = createElementLabel('e', '0x44ff44', position);
        scene.add(label);
        labels.push(label);
      }
    });
    
    labelsRef.current = labels;
    
    // Define animation function outside of the animate call to reduce nesting
    const animateScene = () => {
      animationFrameRef.current = requestAnimationFrame(animateScene);
      
      // Rotate nucleus slightly
      if (nucleusRef.current) {
        nucleusRef.current.rotation.x += 0.003;
        nucleusRef.current.rotation.y += 0.005;
      }
      
      // Rotate electron shells at different speeds
      electronGroupsRef.current.forEach((group, index) => {
        group.rotation.x += 0.01 / (index + 1);
        group.rotation.y += 0.02 / (index + 1);
        group.rotation.z += 0.015 / (index + 1);
      });
      
      renderer.render(scene, camera);
    };
    
    // Start animation
    animateScene();
    
    // Handle window resize
    const handleResize = () => {
      if (!containerRef.current || !cameraRef.current || !rendererRef.current) return;
      
      const width = containerRef.current.clientWidth;
      const height = containerRef.current.clientHeight;
      
      cameraRef.current.aspect = width / height;
      cameraRef.current.updateProjectionMatrix();
      
      rendererRef.current.setSize(width, height);
    };
    
    window.addEventListener('resize', handleResize);
    
    // Cleanup function
    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
        animationFrameRef.current = null;
      }
      
      window.removeEventListener('resize', handleResize);
      
      // Store container reference in a variable to avoid the React Hook cleanup warning
      const container = containerRef.current;
      
      // Clear references to prevent memory leaks
      nucleusRef.current = null;
      electronGroupsRef.current = [];
      labelsRef.current = [];
      
      // Dispose of geometries and materials
      if (sceneRef.current) {
        sceneRef.current.traverse((object) => {
          disposeMeshResources(object);
        });
        
        // Clear the scene
        while(sceneRef.current.children.length > 0) { 
          sceneRef.current.remove(sceneRef.current.children[0]); 
        }
      }
      
      // Dispose of renderer
      if (rendererRef.current) {
        rendererRef.current.dispose();
        
        if (container && rendererRef.current.domElement) {
          container.removeChild(rendererRef.current.domElement);
        }
        
        rendererRef.current = null;
      }
      
      sceneRef.current = null;
      cameraRef.current = null;
    };
  }, [element]);
  
  if (!element) return null;
  
  return (
    <div className={styles.atomicStructureContainer}>
      <h3 className={styles.atomicStructureTitle}>
        Atomic Structure of {element.name} ({element.symbol})
      </h3>
      <div className={styles.atomicStructureInfo}>
        <p>Protons: {element.atomicNumber}</p>
        <p>Neutrons: {Math.round(element.atomicMass - element.atomicNumber)}</p>
        <p>Electrons: {element.atomicNumber}</p>
      </div>
      <div className={styles.atomicStructureVisualization} ref={containerRef}></div>
      <div className={styles.atomicStructureLegend}>
        <div className={styles.legendItem}>
          <span className={styles.protonColor}></span> Protons
        </div>
        <div className={styles.legendItem}>
          <span className={styles.neutronColor}></span> Neutrons
        </div>
        <div className={styles.legendItem}>
          <span className={styles.electronColor}></span> Electrons
        </div>
      </div>
    </div>
  );
};

export default AtomicStructure;
