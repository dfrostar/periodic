import React, { useState, useEffect, useRef, useCallback } from 'react';
import * as THREE from 'three';
import { useElements } from '@/lib/api';
import styles from '@/styles/PeriodicTableHarmonic.module.css';
import { Element } from '@/types/element';
import { useElementStore } from '@/store/elementStore';
import AtomicStructure from './AtomicStructure';

// Define visualization types
export type HarmonicVisualizationType = 'spiral' | 'wave' | 'circle' | 'frequency' | 'harmonic' | 'standard';

// Define OscillatorType if it's not available from the Web Audio API types
type OscillatorType = 'sine' | 'square' | 'sawtooth' | 'triangle';

export interface PeriodicTableHarmonicProps {
  colorScheme: string;
}

// Musical note frequencies (A4 = 440Hz standard)
const NOTE_FREQUENCIES: Record<string, number> = {
  'C': 261.63,
  'C#': 277.18,
  'D': 293.66,
  'D#': 311.13,
  'E': 329.63,
  'F': 349.23,
  'F#': 369.99,
  'G': 392.00,
  'G#': 415.30,
  'A': 440.00,
  'A#': 466.16,
  'B': 493.88
};

// Scientific data about element frequencies and spectral lines
const ELEMENT_SPECTRAL_DATA: Record<string, {
  dominantWavelength: number; // in nm
  spectralLines: number[]; // in nm
  color: string;
  spectroscopyUse: string;
}> = {
  'H': { 
    dominantWavelength: 656.3, 
    spectralLines: [656.3, 486.1, 434.0, 410.2],
    color: '#ff0000',
    spectroscopyUse: 'Used to identify stars and galaxies through redshift measurements'
  },
  'He': { 
    dominantWavelength: 587.6, 
    spectralLines: [587.6, 501.6, 492.2, 471.3],
    color: '#ffff00',
    spectroscopyUse: 'First discovered through spectral analysis of the sun'
  },
  'Li': { 
    dominantWavelength: 670.8, 
    spectralLines: [670.8, 610.4, 460.3],
    color: '#ff0000',
    spectroscopyUse: 'Used to measure lithium abundance in stars'
  },
  'Ne': { 
    dominantWavelength: 585.2, 
    spectralLines: [585.2, 540.1, 614.3],
    color: '#ff7700',
    spectroscopyUse: 'Used in bright street lighting and signs'
  },
  'Na': { 
    dominantWavelength: 589.3, 
    spectralLines: [589.3, 589.0],
    color: '#ffff00',
    spectroscopyUse: 'Used to identify sodium in astronomical objects and flame tests'
  }
  // More elements would be added in a complete implementation
};

const PeriodicTableHarmonic: React.FC<PeriodicTableHarmonicProps> = ({ colorScheme }) => {
  const { data: elements, isLoading, error } = useElements();
  const [visualizationType, setVisualizationType] = useState<HarmonicVisualizationType>('spiral');
  const [isPlaying, setIsPlaying] = useState(false);
  const [audioContext, setAudioContext] = useState<AudioContext | null>(null);
  // This is used by the UI to highlight the currently playing element
  const [currentPlayingElement, setCurrentPlayingElement] = useState<number | null>(null);
  const [autoRotate, setAutoRotate] = useState(true);
  const [volume, setVolume] = useState(0.5); 
  const [waveform, setWaveform] = useState<OscillatorType>('sine');
  const [attackTime, setAttackTime] = useState(0.05);
  const [releaseTime, setReleaseTime] = useState(0.5);
  const containerRef = useRef<HTMLDivElement>(null);
  const audioNodesRef = useRef<any[]>([]);
  
  // Use the shared element store instead of local state
  const { selectedElement, setSelectedElement } = useElementStore();

  // Add explanation toggle state
  const [showExplanation, setShowExplanation] = useState(false);
  const [showSpectralInfo, setShowSpectralInfo] = useState(false);

  // Add scientific sound mode that uses actual spectral frequencies
  const [soundMode, setSoundMode] = useState<'musical' | 'spectral'>('musical');

  // Three.js variables
  const sceneRef = useRef<THREE.Scene | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const elementsRef = useRef<Record<number, THREE.Mesh>>({});
  const controlsRef = useRef<{
    isDragging: boolean;
    autoRotate: boolean;
    autoRotateSpeed: number;
    lastX: number;
    lastY: number;
    rotationSpeed: number;
    zoom: number;
    update: () => void;
  } | null>(null);
  const animationIdRef = useRef<number | null>(null);

  // Map atomic number to frequency and octave
  const mapElementToNoteAndOctave = (atomicNumber: number) => {
    if (!elements) return { note: 'C', octave: 4, frequency: 261.63, spectralFrequency: 500 };
    
    // Map elements to 7 octaves (periodic table has 7 main periods)
    const element = elements.find(e => e.atomicNumber === atomicNumber);
    const period = Math.min(7, element?.period ?? 1);
    const octave = period + 2; // Start at octave 3 (C3)
    
    // Map elements to 12 notes in a chromatic scale based on position in group
    const group = element?.group ?? 1;
    const noteIndex = ((group - 1) % 12);
    const notes = Object.keys(NOTE_FREQUENCIES);
    const note = notes[noteIndex];
    
    // Calculate frequency based on note and octave
    // Formula: freq = baseFreq * (2^octaveShift)
    const baseFreq = NOTE_FREQUENCIES[note];
    const octaveShift = octave - 4; // Relative to octave 4 (where A4=440Hz is defined)
    const frequency = baseFreq * Math.pow(2, octaveShift);
    
    // Calculate the element's spectral frequency (approximation based on emission spectra)
    // Convert from nanometers to Hz, then scale down to audible range
    const atomicNum = element?.atomicNumber ?? 1;
    
    // For a more scientific approach - converting emission wavelength to audible frequency
    // This uses Balmer formula for hydrogen-like spectra and scales to audible range
    // The formula below is a simplified approximation for educational purposes
    let spectralFrequency = 440; // Default to A4 = 440Hz
    
    // Using primary emission lines for common elements (in audible range)
    if (element?.symbol && ELEMENT_SPECTRAL_DATA[element.symbol]) {
      const dominantWavelength = ELEMENT_SPECTRAL_DATA[element.symbol].dominantWavelength;
      // Convert wavelength (nm) to frequency (THz) and scale to audible range (20-20000 Hz)
      // c = λν where c is speed of light, λ is wavelength, ν is frequency
      const lightSpeed = 299792458; // m/s
      const wavelengthInMeters = dominantWavelength * 1e-9; // nm to m
      const actualFrequency = lightSpeed / wavelengthInMeters; // Hz
      // Scale down logarithmically to audible range
      spectralFrequency = 440 * Math.pow(2, (Math.log(actualFrequency / 5e14) / Math.log(2)));
      // Constrain to reasonable audible range
      spectralFrequency = Math.max(55, Math.min(7040, spectralFrequency));
    } else {
      // Fallback - map atomic number to audible range
      spectralFrequency = 220 * Math.pow(2, (atomicNum % 36) / 12);
    }
    
    return {
      note,
      octave,
      frequency,
      spectralFrequency
    };
  };

  // Helper function to get element color based on note and octave
  const getElementColor = (element: Element): { color: string, opacity: number } => {
    const { note, octave } = mapElementToNoteAndOctave(element.atomicNumber);
    
    // Use color based on musical note
    const noteColors: Record<string, string> = {
      'C': '#FF0000', // Red
      'C#': '#FF3300', // Red-Orange
      'D': '#FF6600', // Orange
      'D#': '#FF9900', // Orange-Yellow
      'E': '#FFCC00', // Yellow
      'F': '#00FF00', // Green
      'F#': '#00CC99', // Teal
      'G': '#0099FF', // Light Blue
      'G#': '#0000FF', // Blue
      'A': '#3300FF', // Blue-Purple
      'A#': '#6600FF', // Purple
      'B': '#CC00FF', // Magenta
    };
    
    const color = noteColors[note] || '#FFFFFF';
    
    // Adjust opacity based on octave for visual depth
    const opacity = Math.min(0.6 + (octave * 0.05), 1.0);
    
    return { color, opacity };
  };

  // Helper function to get contrasting text color
  const getContrastingTextColor = (backgroundColor: string): string => {
    const r = parseInt(backgroundColor.substring(1, 3), 16);
    const g = parseInt(backgroundColor.substring(3, 5), 16);
    const b = parseInt(backgroundColor.substring(5, 7), 16);
    const brightness = (r * 299 + g * 587 + b * 114) / 1000;
    
    return brightness > 125 ? '#000000' : '#FFFFFF';
  };

  // Handle element click
  const handleElementClick = (element: Element) => {
    if (element.atomicNumber) {
      playElementSound(element.atomicNumber);
      setSelectedElement(element);
    }
  };

  // Play sound for an element
  const playElementSound = (atomicNumber: number) => {
    if (!audioContext) {
      const newAudioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
      setAudioContext(newAudioContext);
    }
    
    if (!audioContext) return;
    
    // Stop any currently playing sounds
    stopAllSounds();
    
    // Get sound properties based on selected mode
    const { frequency, spectralFrequency } = mapElementToNoteAndOctave(atomicNumber);
    const soundFrequency = soundMode === 'musical' ? frequency : spectralFrequency;
    
    setCurrentPlayingElement(atomicNumber);
    
    // Create oscillator
    const oscillator = audioContext.createOscillator();
    const gain = audioContext.createGain();
    
    // Configure sound
    oscillator.type = waveform;
    oscillator.frequency.value = soundFrequency;
    gain.gain.value = volume * 0.2;
    
    // Envelope
    gain.gain.setValueAtTime(0, audioContext.currentTime);
    gain.gain.linearRampToValueAtTime(volume * 0.2, audioContext.currentTime + attackTime);
    gain.gain.linearRampToValueAtTime(0, audioContext.currentTime + attackTime + releaseTime);
    
    // Connect and play
    oscillator.connect(gain);
    gain.connect(audioContext.destination);
    oscillator.start();
    oscillator.stop(audioContext.currentTime + attackTime + releaseTime + 0.1);
    
    // Store the nodes so we can stop them if needed
    audioNodesRef.current.push({ oscillator, gain });
    
    // Schedule automatic stop
    setTimeout(() => {
      setCurrentPlayingElement(null);
      // Remove this node from the reference array
      audioNodesRef.current = audioNodesRef.current.filter(
        nodes => nodes.oscillator !== oscillator
      );
    }, (attackTime + releaseTime + 0.1) * 1000);
  };
  
  // Stop all currently playing sounds
  const stopAllSounds = () => {
    if (!audioContext) return;
    
    audioNodesRef.current.forEach(({ oscillator, gain }) => {
      try {
        gain.gain.cancelScheduledValues(audioContext.currentTime);
        gain.gain.setValueAtTime(gain.gain.value, audioContext.currentTime);
        gain.gain.linearRampToValueAtTime(0, audioContext.currentTime + 0.02);
        setTimeout(() => {
          oscillator.stop();
          oscillator.disconnect();
          gain.disconnect();
        }, 50);
      } catch (e) {
        console.error("Error stopping sound:", e);
      }
    });
    
    audioNodesRef.current = [];
    setCurrentPlayingElement(null);
  };

  useEffect(() => {
    if (!containerRef.current) return;

    // Clear any existing canvas
    while (containerRef.current.firstChild) {
      containerRef.current.removeChild(containerRef.current.firstChild);
    }

    // Create scene
    const scene = new THREE.Scene();
    sceneRef.current = scene;
    scene.background = new THREE.Color(0x121212);

    // Create camera
    const aspectRatio = containerRef.current.clientWidth / containerRef.current.clientHeight;
    const camera = new THREE.PerspectiveCamera(75, aspectRatio, 0.1, 1000);
    camera.position.z = 40; // Start with a better viewing distance
    camera.position.y = 5;
    cameraRef.current = camera;

    // Setup renderer
    const renderer = new THREE.WebGLRenderer({ antialias: true });
    rendererRef.current = renderer;
    renderer.setSize(containerRef.current.clientWidth, containerRef.current.clientHeight);
    containerRef.current.appendChild(renderer.domElement);

    // Add ambient light
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
    scene.add(ambientLight);

    // Add directional light
    const directionalLight = new THREE.DirectionalLight(0xffffff, 1);
    directionalLight.position.set(1, 1, 1).normalize();
    scene.add(directionalLight);

    // Initialize control state
    controlsRef.current = {
      isDragging: false,
      autoRotate: autoRotate,
      autoRotateSpeed: 0.8,
      lastX: 0,
      lastY: 0,
      rotationSpeed: 0.01,
      zoom: 40,
      update: () => {
        // Use arrow function instead of 'this' for React functional component
        if (controlsRef.current?.autoRotate && sceneRef.current) {
          sceneRef.current.rotation.y += controlsRef.current.autoRotateSpeed * 0.01;
        }
      }
    };

    // Add event listeners for manual rotation
    const handleMouseDown = (e: MouseEvent) => {
      if (!containerRef.current) return;
      if (controlsRef.current) {
        controlsRef.current.isDragging = true;
        controlsRef.current.lastX = e.clientX;
        controlsRef.current.lastY = e.clientY;
      }
    };

    const handleMouseUp = () => {
      if (controlsRef.current) {
        controlsRef.current.isDragging = false;
      }
    };

    const handleMouseMove = (e: MouseEvent) => {
      if (!controlsRef.current || !controlsRef.current.isDragging || !sceneRef.current) return;
      
      const deltaX = e.clientX - controlsRef.current.lastX;
      const deltaY = e.clientY - controlsRef.current.lastY;
      
      sceneRef.current.rotation.y += deltaX * controlsRef.current.rotationSpeed;
      sceneRef.current.rotation.x += deltaY * controlsRef.current.rotationSpeed;
      
      controlsRef.current.lastX = e.clientX;
      controlsRef.current.lastY = e.clientY;
    };

    const handleWheel = (e: WheelEvent) => {
      e.preventDefault();
      if (!cameraRef.current || !controlsRef.current) return;
      
      // Adjust zoom level
      controlsRef.current.zoom += e.deltaY * 0.05;
      controlsRef.current.zoom = Math.max(10, Math.min(100, controlsRef.current.zoom));
      
      // Update camera position based on zoom
      cameraRef.current.position.z = controlsRef.current.zoom;
      cameraRef.current.updateProjectionMatrix();
    };

    // Ray casting for element selection
    const raycaster = new THREE.Raycaster();
    const mouse = new THREE.Vector2();
    
    const handleClick = (e: MouseEvent) => {
      if (!containerRef.current || !sceneRef.current || !cameraRef.current) return;
      
      // Calculate mouse position in normalized device coordinates
      const rect = containerRef.current.getBoundingClientRect();
      mouse.x = ((e.clientX - rect.left) / containerRef.current.clientWidth) * 2 - 1;
      mouse.y = -((e.clientY - rect.top) / containerRef.current.clientHeight) * 2 + 1;
      
      // Update the picking ray with the camera and mouse position
      raycaster.setFromCamera(mouse, cameraRef.current);
      
      // Calculate objects intersecting the picking ray
      const intersects = raycaster.intersectObjects(sceneRef.current.children);
      
      if (intersects.length > 0) {
        const selectedObject = intersects[0].object as THREE.Mesh;
        if (selectedObject.userData?.onClick) {
          selectedObject.userData.onClick();
        }
      }
    };

    // Add event listeners directly to the renderer DOM element
    const canvasElement = renderer.domElement;
    canvasElement.addEventListener('mousedown', handleMouseDown);
    canvasElement.addEventListener('click', handleClick);
    canvasElement.addEventListener('wheel', handleWheel, { passive: false });
    window.addEventListener('mouseup', handleMouseUp);
    window.addEventListener('mousemove', handleMouseMove);

    // Position elements
    positionElements();

    // Animation loop
    const animate = () => {
      const animationId = requestAnimationFrame(animate);
      
      if (controlsRef.current) {
        controlsRef.current.update();
      }
      
      renderer.render(scene, camera);

      // Store animation ID for cleanup
      animationIdRef.current = animationId;
    };
    
    animate();

    // Handle resize
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
      if (animationIdRef.current) {
        cancelAnimationFrame(animationIdRef.current);
      }

      window.removeEventListener('resize', handleResize);
      window.removeEventListener('mouseup', handleMouseUp);
      window.removeEventListener('mousemove', handleMouseMove);
      
      if (canvasElement) {
        canvasElement.removeEventListener('mousedown', handleMouseDown);
        canvasElement.removeEventListener('click', handleClick);
        canvasElement.removeEventListener('wheel', handleWheel);
      }
      
      if (sceneRef.current) {
        sceneRef.current.clear();
      }
      
      if (containerRef.current && rendererRef.current) {
        if (containerRef.current.contains(rendererRef.current.domElement)) {
          containerRef.current.removeChild(rendererRef.current.domElement);
        }
      }
    };
  }, [visualizationType, autoRotate]);

  // Position elements based on visualization type
  const positionElements = () => {
    if (!elements || !sceneRef.current) return;
    
    // Clear previous elements if any
    if (sceneRef.current.children.length > 2) {
      for (let i = sceneRef.current.children.length - 1; i >= 2; i--) {
        sceneRef.current.remove(sceneRef.current.children[i]);
      }
    }
    
    // Track created elements
    const createdElements: Record<number, THREE.Mesh> = {};
    
    elements.forEach((element) => {
      // Skip elements with no atomic number
      if (!element.atomicNumber) return;
      
      let position: THREE.Vector3;
      
      switch (visualizationType) {
        case 'standard':
          position = getStandardPosition(element);
          break;
        case 'harmonic':
          position = getHarmonicPosition(element);
          break;
        case 'frequency':
          position = getFrequencyPosition(element);
          break;
        case 'wave':
          position = getWavePosition(element);
          break;
        case 'spiral':
          position = getSpiralPosition(element);
          break;
        case 'circle':
          position = getCirclePosition(element);
          break;
        default:
          position = getHarmonicPosition(element);
      }
      
      // Create cube geometry
      const geometry = new THREE.BoxGeometry(1, 1, 1);
      
      // Create text for element symbol
      const canvas = document.createElement('canvas');
      canvas.width = 128;
      canvas.height = 128;
      const context = canvas.getContext('2d');
      
      if (context) {
        // Fill background with element color
        const { color, opacity } = getElementColor(element);
        context.fillStyle = color;
        context.fillRect(0, 0, canvas.width, canvas.height);
        
        // Determine text color based on background brightness
        const textColor = getContrastingTextColor(color);
        
        // Draw symbol
        context.font = 'bold 60px Arial';
        context.fillStyle = textColor;
        context.textAlign = 'center';
        context.textBaseline = 'middle';
        context.fillText(element.symbol, canvas.width / 2, canvas.height / 2 - 15);
        
        // Draw atomic number
        context.font = '30px Arial';
        context.fillText(element.atomicNumber.toString(), canvas.width / 2, canvas.height / 2 + 30);
        
        // Create texture from canvas
        const texture = new THREE.CanvasTexture(canvas);
        texture.minFilter = THREE.LinearFilter;
        texture.magFilter = THREE.LinearFilter;
        
        // Create materials for each face - with the text on all faces
        const materials = [
          new THREE.MeshPhongMaterial({ 
            map: texture,
            transparent: opacity < 1,
            opacity,
            shininess: 30,
            specular: 0x333333
          }),
          new THREE.MeshPhongMaterial({ 
            map: texture,
            transparent: opacity < 1,
            opacity,
            shininess: 30,
            specular: 0x333333
          }),
          new THREE.MeshPhongMaterial({ 
            map: texture,
            transparent: opacity < 1,
            opacity,
            shininess: 30,
            specular: 0x333333
          }),
          new THREE.MeshPhongMaterial({ 
            map: texture,
            transparent: opacity < 1,
            opacity,
            shininess: 30,
            specular: 0x333333
          }),
          new THREE.MeshPhongMaterial({ 
            map: texture,
            transparent: opacity < 1,
            opacity,
            shininess: 30,
            specular: 0x333333
          }),
          new THREE.MeshPhongMaterial({ 
            map: texture,
            transparent: opacity < 1,
            opacity,
            shininess: 30,
            specular: 0x333333
          })
        ];
        
        // Create mesh
        const mesh = new THREE.Mesh(geometry, materials);
        mesh.position.copy(position);
        
        // Add callback to mesh
        mesh.userData = {
          isElement: true,
          element,
          onClick: () => handleElementClick(element)
        };
        
        // Add to scene (check if sceneRef is still valid)
        if (sceneRef.current) {
          sceneRef.current.add(mesh);
        }
        
        // Store created element
        createdElements[element.atomicNumber] = mesh;
      }
    });
    
    // Store all created elements in the ref
    elementsRef.current = createdElements;
  };

  // Memoize position elements function to avoid unnecessary re-renders
  const memoizedPositionElements = useCallback(positionElements, [elements, visualizationType, sceneRef]);

  // Play sequence of element sounds
  const playElementSequence = () => {
    if (!elements || elements.length === 0 || !audioContext) return;
    
    setIsPlaying(true);
    
    let index = 0;
    const maxIndex = 20; // Limit to first 20 elements for a reasonable demo
    
    const playNext = () => {
      if (index >= maxIndex || !isPlaying) {
        setIsPlaying(false);
        return;
      }
      
      const atomicNumber = elements[index].atomicNumber;
      playElementSound(atomicNumber);
      
      // Highlight current element
      if (sceneRef.current) {
        const elementObject = sceneRef.current.children.find(
          child => child.userData?.atomicNumber === atomicNumber
        );
        
        if (elementObject && elementObject instanceof THREE.Mesh) {
          const originalScale = { x: 1, y: 1, z: 1 };
          elementObject.scale.set(1.5, 1.5, 1.5);
          
          setTimeout(() => {
            elementObject.scale.set(originalScale.x, originalScale.y, originalScale.z);
          }, 950);
        }
      }
      
      index++;
      setTimeout(playNext, 1000);
    };
    
    playNext();
  };

  // Render legend for frequency visualization
  const renderFrequencyLegend = () => {
    if (visualizationType !== 'frequency') return null;
    
    return (
      <div className={styles.frequencyLegend}>
        <h4>Frequency Visualization Guide</h4>
        <div className={styles.legendItem}>
          <div className={styles.legendColor} style={{ backgroundColor: '#FF0000' }}></div>
          <span>X-axis: Frequency (logarithmic)</span>
        </div>
        <div className={styles.legendItem}>
          <div className={styles.legendColor} style={{ backgroundColor: '#00FF00' }}></div>
          <span>Y-axis: Musical Note (C to B)</span>
        </div>
        <div className={styles.legendItem}>
          <div className={styles.legendColor} style={{ backgroundColor: '#0000FF' }}></div>
          <span>Z-axis: Octave (1-7)</span>
        </div>
        <p>Colors represent the musical note of each element.</p>
      </div>
    );
  };

  // Render legend for harmonic visualization
  const renderHarmonicLegend = () => {
    if (visualizationType !== 'harmonic') return null;
    
    return (
      <div className={styles.frequencyLegend}>
        <h4>Harmonic Series Guide</h4>
        <div className={styles.legendItem}>
          <div className={styles.legendColor} style={{ backgroundColor: '#FF9900' }}></div>
          <span>Circular Arrangement: Harmonic Series</span>
        </div>
        <div className={styles.legendItem}>
          <div className={styles.legendColor} style={{ backgroundColor: '#66CCFF' }}></div>
          <span>Radius: Relates to Atomic Number</span>
        </div>
        <div className={styles.legendItem}>
          <div className={styles.legendColor} style={{ backgroundColor: '#CC66FF' }}></div>
          <span>Height: Atomic Number Progression</span>
        </div>
        <p>Elements with related overtone frequencies appear in similar positions.</p>
      </div>
    );
  };

  // Add educational content about spectroscopy
  const getSpectroscopyExplanation = () => {
    return (
      <div className={styles.spectroscopyExplanation}>
        <h4>The Science of Spectroscopy</h4>
        <p>
          Spectroscopy is the study of how matter interacts with electromagnetic radiation. 
          When atoms absorb energy, electrons jump to higher energy levels. When electrons 
          return to lower energy levels, they emit photons with specific wavelengths, 
          creating a unique "spectral fingerprint" for each element.
        </p>
        <p>
          In the harmonic view, we've mapped these spectral signatures to audible frequencies, 
          allowing you to "hear" a representation of each element's spectral pattern. 
          This sonification of data provides a new way to understand atomic properties.
        </p>
        <h5>Applications in Science</h5>
        <ul>
          <li><strong>Astronomy:</strong> Identifying elements in distant stars and galaxies</li>
          <li><strong>Medicine:</strong> Analyzing biological samples non-invasively</li>
          <li><strong>Environmental Science:</strong> Detecting pollutants at trace levels</li>
          <li><strong>Material Science:</strong> Characterizing new compounds</li>
          <li><strong>Forensics:</strong> Analyzing crime scene evidence</li>
        </ul>
      </div>
    );
  };

  // Add explanation of musical-scientific connection
  const getMusicalAtomicExplanation = () => {
    return (
      <div className={styles.musicalExplanation}>
        <h4>The Harmony of Elements</h4>
        <p>
          The periodic table organization closely mirrors musical structure. Just as musical
          notes repeat in octaves, elements in the same group (column) share similar properties.
          Elements in the same period (row) follow a progression similar to moving through notes
          in a scale.
        </p>
        <p>
          This visualization explores the concept of "matter as music" - representing atomic
          properties through sound to reveal patterns that might not be obvious through
          traditional data visualization.
        </p>
      </div>
    );
  };

  // Render spectral lines visualization for selected element
  const renderSpectralLines = () => {
    if (!selectedElement?.symbol || !ELEMENT_SPECTRAL_DATA[selectedElement.symbol]) {
      return null;
    }

    const spectralData = ELEMENT_SPECTRAL_DATA[selectedElement.symbol];
    const spectralLines = spectralData.spectralLines;
    
    // Determine min and max wavelengths for scaling
    const minWavelength = Math.min(...spectralLines);
    const maxWavelength = Math.max(...spectralLines);
    const range = maxWavelength - minWavelength;
    
    // Scale to width of container
    const scalePosition = (wavelength: number): number => {
      return ((wavelength - minWavelength) / range) * 100;
    };
    
    return (
      <div className={styles.spectralPanel}>
        <div className={styles.spectralHeader}>
          <h4>Spectral Lines for {selectedElement.name}</h4>
          <button 
            className={styles.button}
            onClick={() => soundMode === 'spectral' && playElementSound(selectedElement.atomicNumber)}
          >
            Play Spectral Sound
          </button>
        </div>
        <p>
          Each element produces a unique pattern of spectral lines when excited by energy. 
          These lines serve as a "fingerprint" for identifying elements in astronomy, 
          chemistry, and materials science.
        </p>
        <div className={styles.spectralLines}>
          {spectralLines.map((wavelength) => {
            const position = scalePosition(wavelength);
            const color = getSpectralColor(wavelength);
            return (
              <React.Fragment key={`spectral-${selectedElement.symbol}-${wavelength}`}>
                <div 
                  className={styles.spectralLine} 
                  style={{
                    left: `${position}%`,
                    backgroundColor: color
                  }}
                />
                <div 
                  className={styles.spectralLineLabel}
                  style={{
                    left: `${position}%`,
                    bottom: '5px'
                  }}
                >
                  {wavelength}nm
                </div>
              </React.Fragment>
            );
          })}
        </div>
        <p><strong>Common Use:</strong> {spectralData.spectroscopyUse}</p>
      </div>
    );
  };
  
  // Convert wavelength to visible color (simplified)
  const getSpectralColor = (wavelength: number): string => {
    // Range for visible light: ~380-750nm
    if (wavelength < 380) return '#8F00FF'; // ultraviolet approximation
    if (wavelength < 450) return '#0000FF'; // blue
    if (wavelength < 495) return '#00FFFF'; // cyan
    if (wavelength < 570) return '#00FF00'; // green
    if (wavelength < 590) return '#FFFF00'; // yellow
    if (wavelength < 620) return '#FF7F00'; // orange
    if (wavelength <= 750) return '#FF0000'; // red
    return '#8B0000'; // infrared approximation
  };

  // Render element cell with appropriate styling and proper accessibility
  const renderElementCell = (element: Element) => {
    const { color, opacity } = getElementColor(element);
    const textColor = getContrastingTextColor(color);
    const { note, octave } = mapElementToNoteAndOctave(element.atomicNumber);
    
    // Determine if this element is currently playing audio
    const isPlaying = currentPlayingElement === element.atomicNumber;
    
    return (
      <button 
        key={element.atomicNumber}
        className={`${styles.elementCell} ${isPlaying ? styles.currentlyPlaying : ''}`}
        style={{
          backgroundColor: color,
          opacity,
          color: textColor,
          border: 'none',
          cursor: 'pointer',
          textAlign: 'center',
          padding: '4px'
        }}
        onClick={() => handleElementClick(element)}
        aria-pressed={isPlaying}
        aria-label={`Element ${element.name}, atomic number ${element.atomicNumber}, note ${note}${octave}`}
      >
        <div className={styles.elementSymbol}>{element.symbol}</div>
        <div className={styles.atomicNumber}>{element.atomicNumber}</div>
        <div className={styles.noteValue}>{note}{octave}</div>
      </button>
    );
  };

  // Stop playing on visualization change
  useEffect(() => {
    setIsPlaying(false);
  }, [visualizationType]);

  // Handle audio context
  useEffect(() => {
    return () => {
      if (audioContext) {
        audioContext.close();
      }
    };
  }, [audioContext]);

  // Update camera settings to improve zoom and rotation
  useEffect(() => {
    if (cameraRef.current) {
      // Adjust camera initial position for better visibility
      cameraRef.current.position.z = 40;
      cameraRef.current.position.y = 5;
      cameraRef.current.updateProjectionMatrix();
    }
  }, []);

  // Increase rotation speed for auto-rotation
  useEffect(() => {
    if (controlsRef.current) {
      controlsRef.current.autoRotateSpeed = autoRotate ? 0.8 : 0;
    }
  }, [autoRotate]);

  // Update auto-rotation state in the controls
  useEffect(() => {
    if (controlsRef.current) {
      controlsRef.current.autoRotate = autoRotate;
    }
  }, [autoRotate]);

  // Update visualization when type changes
  useEffect(() => {
    if (sceneRef.current && cameraRef.current) {
      // Reset rotation when changing visualization type
      sceneRef.current.rotation.x = 0;
      sceneRef.current.rotation.y = 0;
      
      // Adjust camera position based on visualization type
      if (visualizationType === 'harmonic' || visualizationType === 'spiral') {
        cameraRef.current.position.set(0, 5, 45);
      } else if (visualizationType === 'frequency') {
        cameraRef.current.position.set(5, 0, 50);
      } else if (visualizationType === 'wave') {
        cameraRef.current.position.set(0, 10, 40);
      } else {
        cameraRef.current.position.set(0, 0, 40);
      }
      
      cameraRef.current.updateProjectionMatrix();
      
      // Refresh the element positions
      memoizedPositionElements();
    }
  }, [visualizationType, memoizedPositionElements]);

  // Helper functions for positioning elements in different visualizations
  const getStandardPosition = (element: Element): THREE.Vector3 => {
    // Standard periodic table layout
    const group = element.group || 0;
    const period = element.period || 0;
    
    return new THREE.Vector3(
      group * 1.2 - 10,
      -(period * 1.2) + 4,
      0
    );
  };

  const getSpiralPosition = (element: Element): THREE.Vector3 => {
    if (!element.atomicNumber) return new THREE.Vector3(0, 0, 0);
    
    const angle = element.atomicNumber * 0.2;
    const radius = Math.sqrt(element.atomicNumber) * 0.8;
    
    return new THREE.Vector3(
      Math.cos(angle) * radius,
      Math.sin(angle) * radius,
      element.atomicNumber * 0.05
    );
  };

  const getWavePosition = (element: Element): THREE.Vector3 => {
    if (!element.atomicNumber) return new THREE.Vector3(0, 0, 0);
    
    const scaledFreq = mapElementToNoteAndOctave(element.atomicNumber).frequency / 1000;
    
    return new THREE.Vector3(
      element.atomicNumber * 0.3 - 20,
      Math.sin(scaledFreq * 10) * 5,
      Math.cos(scaledFreq * 10) * 5
    );
  };

  const getFrequencyPosition = (element: Element): THREE.Vector3 => {
    if (!element.atomicNumber) return new THREE.Vector3(0, 0, 0);
    
    const { note, octave, frequency } = mapElementToNoteAndOctave(element.atomicNumber);
    const noteIndex = Object.keys(NOTE_FREQUENCIES).indexOf(note);
    const normalizedNotePos = noteIndex / 12; // 0 to 1 value
    
    return new THREE.Vector3(
      Math.log2(frequency) * 2,
      normalizedNotePos * 12 - 6,
      (octave - 3) * 3
    );
  };

  const getHarmonicPosition = (element: Element): THREE.Vector3 => {
    if (!element.atomicNumber) return new THREE.Vector3(0, 0, 0);
    
    const harmonicIndex = element.atomicNumber % 12;
    const harmonicAngle = (harmonicIndex / 12) * Math.PI * 2;
    const harmonicRadius = Math.sqrt(element.atomicNumber) * 1.6;
    
    return new THREE.Vector3(
      Math.cos(harmonicAngle) * harmonicRadius,
      Math.sin(harmonicAngle) * harmonicRadius,
      element.atomicNumber * 0.1
    );
  };

  const getCirclePosition = (element: Element): THREE.Vector3 => {
    if (!element.atomicNumber) return new THREE.Vector3(0, 0, 0);
    
    const { note, octave } = mapElementToNoteAndOctave(element.atomicNumber);
    const noteIndex = Object.keys(NOTE_FREQUENCIES).indexOf(note);
    const angle = (noteIndex / 12) * Math.PI * 2;
    const radius = 6 + octave * 2;
    
    return new THREE.Vector3(
      Math.cos(angle) * radius,
      Math.sin(angle) * radius,
      0
    );
  };

  if (isLoading) {
    return <div className={styles.loading}>Loading elements...</div>;
  }

  if (error) {
    return <div className={styles.error}>Error loading elements</div>;
  }

  return (
    <div className={styles.container}>
      <div className={styles.controls}>
        <div className={styles.visualControls}>
          <div className={styles.selectContainer}>
            <label htmlFor="visualizationType">Visualization Type:</label>
            <select
              id="visualizationType"
              value={visualizationType}
              onChange={(e) => setVisualizationType(e.target.value as HarmonicVisualizationType)}
              className={styles.select}
            >
              <option value="spiral">Spiral (Atomic Number)</option>
              <option value="wave">Wave (Frequency)</option>
              <option value="circle">Circle (Notes)</option>
              <option value="frequency">Frequency Spectrum</option>
              <option value="harmonic">Harmonic Series</option>
              <option value="standard">Standard Periodic Table</option>
            </select>
          </div>
          <button
            className={styles.playButton}
            onClick={() => isPlaying ? setIsPlaying(false) : playElementSequence()}
            disabled={isPlaying}
          >
            {isPlaying ? 'Stop Playing' : 'Play Sequence'}
          </button>
          <div className={styles.checkboxContainer}>
            <input
              type="checkbox"
              id="autoRotate"
              checked={autoRotate}
              onChange={() => setAutoRotate(!autoRotate)}
            />
            <label htmlFor="autoRotate">Auto Rotate</label>
          </div>
        </div>

        <div className={styles.instructionsPanel}>
          <h3>Interactive Controls:</h3>
          <ul>
            <li><strong>Rotate:</strong> Click and drag with mouse</li>
            <li><strong>Zoom:</strong> Use mouse wheel to zoom in/out</li>
            <li><strong>Select:</strong> Click on any element to see details</li>
            <li><strong>Auto-Rotate:</strong> Toggle rotation with the checkbox above</li>
          </ul>
        </div>
        
        <div className={styles.audioControls}>
          <div className={styles.audioControl}>
            <label htmlFor="waveformSelect">Waveform:</label>
            <select
              id="waveformSelect"
              value={waveform}
              onChange={(e) => setWaveform(e.target.value as OscillatorType)}
              className={styles.select}
            >
              <option value="sine">Sine</option>
              <option value="square">Square</option>
              <option value="sawtooth">Sawtooth</option>
              <option value="triangle">Triangle</option>
            </select>
          </div>
          
          <div className={styles.audioControl}>
            <label htmlFor="volumeInput">Volume:</label>
            <input
              id="volumeInput"
              type="range"
              min="0"
              max="1"
              step="0.01"
              value={volume}
              onChange={(e) => setVolume(parseFloat(e.target.value))}
              className={styles.rangeInput}
            />
            <span>{volume.toFixed(2)}</span>
          </div>
          
          <div className={styles.audioControl}>
            <label htmlFor="attackTimeInput">Attack:</label>
            <input
              id="attackTimeInput"
              type="range"
              min="0.01"
              max="1"
              step="0.01"
              value={attackTime}
              onChange={(e) => setAttackTime(parseFloat(e.target.value))}
              className={styles.rangeInput}
            />
            <span>{attackTime.toFixed(2)}s</span>
          </div>
          
          <div className={styles.audioControl}>
            <label htmlFor="releaseTimeInput">Release:</label>
            <input
              id="releaseTimeInput"
              type="range"
              min="0.1"
              max="3"
              step="0.1"
              value={releaseTime}
              onChange={(e) => setReleaseTime(parseFloat(e.target.value))}
              className={styles.rangeInput}
            />
            <span>{releaseTime.toFixed(2)}s</span>
          </div>
          <div className={styles.audioControl}>
            <label htmlFor="soundModeSelect">Sound Mode:</label>
            <select
              id="soundModeSelect"
              value={soundMode}
              onChange={(e) => setSoundMode(e.target.value as 'musical' | 'spectral')}
              className={styles.select}
            >
              <option value="musical">Musical Notes</option>
              <option value="spectral">Spectral Frequencies</option>
            </select>
          </div>
        </div>
        
        <div className={styles.explanationControls}>
          <div className={styles.checkboxContainer}>
            <input
              type="checkbox"
              id="showExplanation"
              checked={showExplanation}
              onChange={() => setShowExplanation(!showExplanation)}
            />
            <label htmlFor="showExplanation">Show Scientific Explanation</label>
          </div>
          <div className={styles.checkboxContainer}>
            <input
              type="checkbox"
              id="showSpectralInfo"
              checked={showSpectralInfo}
              onChange={() => setShowSpectralInfo(!showSpectralInfo)}
            />
            <label htmlFor="showSpectralInfo">Show Spectral Information</label>
          </div>
        </div>
      </div>
      
      <div className={styles.mainContent}>
        <div className={styles.visualizationContainer}>
          <div className={visualizationType === 'spiral' ? styles.spiralContainer : styles.tableContainer}>
            {visualizationType === 'spiral' ? (
              <div className={styles.spiral}>
                {elements?.map((element) => 
                  renderElementCell(element)
                )}
              </div>
            ) : (
              <div className={styles.table}>
                {Array.from({ length: 7 }).map((_, period) => (
                  <div key={`period-${period + 1}`} className={styles.periodRow}>
                    {elements
                      ?.filter(element => element.period === period + 1)
                      .map((element) => 
                        renderElementCell(element)
                      )}
                  </div>
                ))}
              </div>
            )}
          </div>
          
          <div ref={containerRef} className={styles.canvas} style={{ height: '600px' }}></div>
          
          {selectedElement && (
            <div className={styles.atomicStructurePanelLarge}>
              <AtomicStructure element={selectedElement} />
            </div>
          )}
        </div>
      </div>
      
      <div className={styles.info}>
        <p>This visualization maps elements to musical notes based on their positions in the periodic table.</p>
        <p>Groups correspond to notes (C through B), and periods correspond to octaves.</p>
        <p>Click on any element to hear its sound, or use the Play button to hear a sequence.</p>
      </div>
      
      {renderFrequencyLegend()}
      {renderHarmonicLegend()}
      
      {showExplanation && (
        <div className={styles.educationalContent}>
          {getSpectroscopyExplanation()}
          {getMusicalAtomicExplanation()}
        </div>
      )}
      
      {selectedElement && (
        <div className={styles.elementDetails}>
          <h4>
            {selectedElement.name} ({selectedElement.symbol})
            <button 
              className={styles.closeButton} 
              onClick={() => setSelectedElement(null)}
            >
              ×
            </button>
          </h4>
          
          <p><strong>Atomic Number:</strong> {selectedElement.atomicNumber}</p>
          <p><strong>Atomic Mass:</strong> {selectedElement.atomicMass}</p>
          <p><strong>Category:</strong> {selectedElement.category}</p>
          <p><strong>Group:</strong> {selectedElement.group}</p>
          <p><strong>Period:</strong> {selectedElement.period}</p>
          
          {showSpectralInfo && (
            <div className={styles.elementSection}>
              <h5>Spectral Information</h5>
              <p><strong>Dominant Wavelength:</strong> {ELEMENT_SPECTRAL_DATA[selectedElement.symbol]?.dominantWavelength} nm</p>
              <p><strong>Spectral Lines:</strong> {ELEMENT_SPECTRAL_DATA[selectedElement.symbol]?.spectralLines.join(', ')} nm</p>
              <p><strong>Color:</strong> {ELEMENT_SPECTRAL_DATA[selectedElement.symbol]?.color}</p>
              <p><strong>Spectroscopy Use:</strong> {ELEMENT_SPECTRAL_DATA[selectedElement.symbol]?.spectroscopyUse}</p>
            </div>
          )}
          
          {showExplanation && (
            <div className={styles.elementSection}>
              <h5>Scientific Explanation</h5>
              <p>{selectedElement.description ?? "No description available."}</p>
            </div>
          )}
          {renderSpectralLines()}
        </div>
      )}
    </div>
  );
};

export default PeriodicTableHarmonic;
