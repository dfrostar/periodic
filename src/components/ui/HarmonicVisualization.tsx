import React, { useRef, useEffect, useState } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import {
  OrbitControls,
  PerspectiveCamera,
  Html
} from '@react-three/drei';
import * as THREE from 'three';
import { useElements } from '@/lib/api';
import { useElementStore } from '@/store/elementStore';
import styles from '@/styles/HarmonicVisualization.module.css';
import ErrorBoundary from './ErrorBoundary';

/**
 * Convert atomic number to a musical frequency
 * Uses A4 = 440Hz as a reference and calculates frequencies
 * based on the equal temperament system
 */
const getElementFrequency = (atomicNumber: number): number => {
  // Base frequency A4 = 440Hz
  const baseFreq = 440;
  // Normalize the atomic number to fit within a reasonable range
  const normalizedNumber = (atomicNumber % 12);
  const octave = Math.floor(atomicNumber / 12) - 1;
  
  // Map to semitones relative to A4
  const semitoneMap: Record<number, number> = {
    0: 3,   // C
    1: 4,   // C#
    2: 5,   // D
    3: 6,   // D#
    4: 7,   // E
    5: 8,   // F
    6: 9,   // F#
    7: 10,  // G
    8: 11,  // G#
    9: 0,   // A
    10: 1,  // A#
    11: 2,  // B
  };
  
  const semitone = semitoneMap[normalizedNumber];
  const semitonesFromA4 = semitone + (octave - 4) * 12;
  
  // Equal temperament formula: f = 440 * 2^(n/12)
  return baseFreq * Math.pow(2, semitonesFromA4 / 12);
};

/**
 * Get note name from atomic number
 */
const getNoteName = (atomicNumber: number): string => {
  const noteNames = ['A', 'A#', 'B', 'C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#'];
  const normalizedNumber = (atomicNumber % 12);
  const octave = Math.floor(atomicNumber / 12);
  return `${noteNames[normalizedNumber]}${octave}`;
};

/**
 * Element Sphere component for the harmonic visualization
 */
interface ElementSphereProps {
  element: any;
  index: number;
  onClick: () => void;
  isSelected: boolean;
  playSound: (frequency: number) => void;
}

const ElementSphere: React.FC<ElementSphereProps> = ({ 
  element, 
  index, 
  onClick, 
  isSelected, 
  playSound 
}) => {
  const meshRef = useRef<THREE.Mesh>(null);
  const [hovered, setHovered] = useState(false);
  const frequency = getElementFrequency(element.atomicNumber);
  
  // Position calculation for harmonic pattern
  const theta = index * 0.2;
  const radius = Math.sqrt(element.atomicNumber) * 0.8;
  const y = Math.sin(element.atomicNumber * 0.05) * 5;
  
  const x = radius * Math.cos(theta);
  const z = radius * Math.sin(theta);
  
  // Scale based on atomic mass (normalized)
  const scale = 0.3 + (element.atomicMass / 300) * 0.7;
  
  // Color based on musical note
  const normalizedNumber = (element.atomicNumber % 12);
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
  
  const color = noteColors[normalizedNumber];
  
  // Animation
  useFrame((state) => {
    if (meshRef.current) {
      // Subtle floating animation
      meshRef.current.position.y = y + Math.sin(state.clock.elapsedTime * 0.5 + index) * 0.2;
      
      // Pulse effect if selected
      if (isSelected) {
        const pulse = 1 + Math.sin(state.clock.elapsedTime * 4) * 0.1;
        meshRef.current.scale.set(scale * pulse, scale * pulse, scale * pulse);
      }
    }
  });

  // Calculate emissive intensity based on selection and hover state
  let emissiveIntensityValue = 0.2; // Default
  if (isSelected) {
    emissiveIntensityValue = 1;
  } else if (hovered) {
    emissiveIntensityValue = 0.5;
  }
  
  return (
    <mesh
      ref={meshRef}
      position={[x, y, z]}
      scale={[scale, scale, scale]}
      onClick={(e) => {
        e.stopPropagation();
        onClick();
        playSound(frequency);
      }}
      onPointerOver={(e) => {
        e.stopPropagation();
        setHovered(true);
        document.body.style.cursor = 'pointer';
      }}
      onPointerOut={(e) => {
        setHovered(false);
        document.body.style.cursor = 'auto';
      }}
    >
      <sphereGeometry args={[1, 32, 32]} />
      <meshStandardMaterial
        color={color}
        emissive={color}
        emissiveIntensity={emissiveIntensityValue}
        metalness={0.8}
        roughness={0.2}
      />
      {(hovered || isSelected) && (
        <Html distanceFactor={10} position={[0, 1.5, 0]} center>
          <div className={styles.elementLabel}>
            <div className={styles.elementSymbol}>{element.symbol}</div>
            <div className={styles.elementDetails}>
              <div>{element.name}</div>
              <div>{getNoteName(element.atomicNumber)} - {frequency.toFixed(2)} Hz</div>
            </div>
          </div>
        </Html>
      )}
    </mesh>
  );
};

/**
 * Audio Player class for managing Web Audio API
 */
class AudioPlayer {
  private audioContext: AudioContext | null = null;
  private readonly oscillators: Map<number, OscillatorNode> = new Map();
  private readonly gains: Map<number, GainNode> = new Map();
  private masterGain: GainNode | null = null;
  private volume: number = 0.5;
  
  constructor() {
    this.setupAudio();
  }
  
  private setupAudio() {
    try {
      this.audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
      this.masterGain = this.audioContext.createGain();
      this.masterGain.gain.value = this.volume;
      this.masterGain.connect(this.audioContext.destination);
    } catch (error) {
      console.error('Web Audio API is not supported in this browser', error);
    }
  }
  
  public playNote(frequency: number, duration: number = 1) {
    if (!this.audioContext) return;
    
    // Stop existing oscillator for this frequency if it exists
    this.stopNote(frequency);
    
    // Create new oscillator and gain nodes
    const oscillator = this.audioContext.createOscillator();
    const gainNode = this.audioContext.createGain();
    
    // Configure oscillator
    oscillator.type = 'sine';
    oscillator.frequency.value = frequency;
    
    // Configure gain (envelope)
    gainNode.gain.value = 0;
    
    // Connect the nodes
    oscillator.connect(gainNode);
    gainNode.connect(this.masterGain!);
    
    // Start oscillator
    oscillator.start();
    
    // Apply attack
    gainNode.gain.setValueAtTime(0, this.audioContext.currentTime);
    gainNode.gain.linearRampToValueAtTime(0.5, this.audioContext.currentTime + 0.1);
    
    // Apply release
    gainNode.gain.setValueAtTime(0.5, this.audioContext.currentTime + duration - 0.2);
    gainNode.gain.linearRampToValueAtTime(0, this.audioContext.currentTime + duration);
    
    // Store references
    this.oscillators.set(frequency, oscillator);
    this.gains.set(frequency, gainNode);
    
    // Schedule cleanup
    setTimeout(() => {
      this.stopNote(frequency);
    }, duration * 1000);
  }
  
  public stopNote(frequency: number) {
    const oscillator = this.oscillators.get(frequency);
    const gain = this.gains.get(frequency);
    
    if (oscillator && gain) {
      // Apply quick release to avoid clicks
      if (this.audioContext) {
        gain.gain.setValueAtTime(gain.gain.value, this.audioContext.currentTime);
        gain.gain.linearRampToValueAtTime(0, this.audioContext.currentTime + 0.05);
      }
      
      // Schedule oscillator stop
      setTimeout(() => {
        oscillator.stop();
        oscillator.disconnect();
        gain.disconnect();
        this.oscillators.delete(frequency);
        this.gains.delete(frequency);
      }, 50);
    }
  }
  
  public setVolume(volume: number) {
    this.volume = volume;
    if (this.masterGain) {
      this.masterGain.gain.value = volume;
    }
  }
  
  public resume() {
    if (this.audioContext && this.audioContext.state === 'suspended') {
      this.audioContext.resume();
    }
  }
}

/**
 * Main scene component for the harmonic visualization
 */
const HarmonicScene: React.FC = () => {
  const { data: elements, isLoading, error } = useElements();
  const { selectedElement, setSelectedElement, audioEnabled, volume } = useElementStore();
  const audioPlayerRef = useRef<AudioPlayer | null>(null);
  
  // Initialize audio player
  useEffect(() => {
    audioPlayerRef.current = new AudioPlayer();
    return () => {
      // Cleanup when component unmounts
      audioPlayerRef.current = null;
    };
  }, []);
  
  // Update audio player volume
  useEffect(() => {
    if (audioPlayerRef.current) {
      audioPlayerRef.current.setVolume(volume);
    }
  }, [volume]);
  
  // Play sound when clicking on an element
  const playSound = (frequency: number) => {
    if (audioEnabled && audioPlayerRef.current) {
      // Resume audio context (needed for browsers that suspend it until user interaction)
      audioPlayerRef.current.resume();
      audioPlayerRef.current.playNote(frequency, 2);
    }
  };
  
  if (isLoading) {
    return (
      <Html center>
        <div className={styles.loadingContainer}>
          <div className={styles.loader}></div>
          <p>Loading elements data...</p>
        </div>
      </Html>
    );
  }
  
  if (error || !elements) {
    return (
      <Html center>
        <div className={styles.errorContainer}>
          <h3>Error loading element data</h3>
          <p>{error instanceof Error ? error.message : 'Unknown error'}</p>
        </div>
      </Html>
    );
  }
  
  return (
    <>
      <ambientLight intensity={0.5} />
      <pointLight position={[10, 10, 10]} intensity={1} />
      <pointLight position={[-10, -10, -10]} intensity={0.5} />
      
      {/* Background stars */}
      <mesh>
        <sphereGeometry args={[100, 64, 64]} />
        <meshBasicMaterial color="#000" side={THREE.BackSide} />
      </mesh>
      
      {/* Elements as spheres */}
      {elements.map((element, index) => (
        <ElementSphere
          key={element.atomicNumber}
          element={element}
          index={index}
          onClick={() => setSelectedElement(element)}
          isSelected={selectedElement?.atomicNumber === element.atomicNumber}
          playSound={playSound}
        />
      ))}
      
      {/* Add orbit controls with enhanced damping for smoother interaction */}
      <OrbitControls 
        enableDamping
        dampingFactor={0.05}
        rotateSpeed={0.5}
        zoomSpeed={0.7}
        minDistance={5}
        maxDistance={100}
      />
      
      {/* Camera setup */}
      <PerspectiveCamera makeDefault position={[0, 5, 40]} fov={60} />
    </>
  );
};

/**
 * Main harmonic visualization component with audio controls
 */
const HarmonicVisualization: React.FC = () => {
  const { audioEnabled, toggleAudio, volume, setVolume } = useElementStore();
  
  return (
    <ErrorBoundary>
      <div className={styles.container}>
        <div className={styles.audioControls}>
          <button 
            className={`${styles.audioToggle} ${audioEnabled ? styles.audioEnabled : ''}`}
            onClick={toggleAudio}
            aria-label={audioEnabled ? 'Disable audio' : 'Enable audio'}
            title={audioEnabled ? 'Disable audio' : 'Enable audio'}
          >
            {audioEnabled ? '🔊' : '🔇'}
          </button>
          
          {audioEnabled && (
            <div className={styles.volumeControl}>
              <label htmlFor="volume-slider" className={styles.srOnly}>Volume</label>
              <input
                id="volume-slider"
                type="range"
                min="0"
                max="1"
                step="0.01"
                value={volume}
                onChange={(e) => setVolume(parseFloat(e.target.value))}
                className={styles.volumeSlider}
              />
            </div>
          )}
          <div className={styles.audioHelp}>
            Click on elements to hear their frequencies
          </div>
        </div>
        
        <Canvas className={styles.canvas}>
          <HarmonicScene />
        </Canvas>
      </div>
    </ErrorBoundary>
  );
};

export default HarmonicVisualization;
