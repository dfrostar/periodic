import React, { useRef, useState, useMemo } from 'react';
import { useFrame } from 'react-three-fiber';
import { Mesh, CanvasTexture, MeshStandardMaterial } from 'three';
import { useElementStore } from '@/store/elementStore';
import { Element } from '@/types/element';

interface ElementCubeProps {
  element: Element;
  position: number[];
  colorScheme: string;
}

const ElementCube: React.FC<ElementCubeProps> = ({ element, position, colorScheme }) => {
  const mesh = useRef<Mesh>();
  const [hovered, setHover] = useState(false);
  const [active, setActive] = useState(false);
  const setSelectedElement = useElementStore(state => state.setSelectedElement);

  // Calculate color based on properties
  const getColor = () => {
    if (colorScheme === 'category') {
      switch (element.category) {
        case 'alkali-metal': return 'hotpink';
        case 'alkaline-earth-metal': return 'orange';
        case 'transition-metal': return 'gold';
        case 'post-transition-metal': return 'lightgreen';
        case 'metalloid': return 'yellowgreen';
        case 'nonmetal': return 'deepskyblue';
        case 'halogen': return 'turquoise';
        case 'noble-gas': return 'slateblue';
        case 'lanthanoid': return 'mediumpurple';
        case 'actinoid': return 'lightpink';
        default: return 'lightgray';
      }
    } else if (colorScheme === 'state') {
      switch (element.state) {
        case 'solid': return 'royalblue';
        case 'liquid': return 'turquoise';
        case 'gas': return 'indianred';
        default: return 'lightgray';
      }
    } else if (colorScheme === 'atomic-radius') {
      // Generate color based on atomic radius
      const min = 40; // approximate minimum atomic radius
      const max = 270; // approximate maximum atomic radius
      const normalized = (element.atomicRadius || min - 10) / max;
      // Convert HSL to a color string
      return `hsl(${normalized * 240}, 100%, 60%)`;
    } else if (colorScheme === 'frequency' || colorScheme === 'octave') {
      // Musical note frequency color mapping
      const noteIndex = (element.atomicNumber % 12);
      const noteColors = [
        '#ff0000', // C (Red)
        '#ff4500', // C# (Orange-Red)
        '#ffa500', // D (Orange)
        '#ffd700', // D# (Gold)
        '#ffff00', // E (Yellow)
        '#9acd32', // F (Yellow-Green)
        '#008000', // F# (Green)
        '#00ffff', // G (Cyan)
        '#0000ff', // G# (Blue)
        '#4b0082', // A (Indigo)
        '#8a2be2', // A# (Blue-Violet)
        '#ff00ff'  // B (Magenta)
      ];
      return noteColors[noteIndex];
    }
    
    return 'lightgray';
  };

  // Create canvas texture for element symbol and atomic number
  const texture = useMemo(() => {
    const canvas = document.createElement('canvas');
    canvas.width = 256;
    canvas.height = 256;
    const context = canvas.getContext('2d');
    
    if (context) {
      // Set background to transparent
      context.clearRect(0, 0, canvas.width, canvas.height);
      
      // Draw element symbol
      context.font = 'bold 120px Arial';
      context.textAlign = 'center';
      context.textBaseline = 'middle';
      context.fillStyle = '#ffffff';
      context.fillText(element.symbol, canvas.width / 2, canvas.height / 2);
      
      // Draw atomic number
      context.font = 'bold 60px Arial';
      context.fillStyle = '#dddddd';
      context.fillText(element.atomicNumber.toString(), canvas.width / 2, 50);
    }
    
    return new CanvasTexture(canvas);
  }, [element.symbol, element.atomicNumber]);

  // Create materials array with texture only on front face
  const materials = useMemo(() => {
    const baseColor = getColor();
    const baseMaterial = new MeshStandardMaterial({ 
      color: baseColor,
      metalness: 0.5,
      roughness: 0.5,
      emissive: hovered ? "#111" : "#000",
      emissiveIntensity: hovered ? 0.5 : 0
    });
    
    const frontMaterial = baseMaterial.clone();
    frontMaterial.map = texture;
    
    // Return materials for each face [right, left, top, bottom, front, back]
    return [
      baseMaterial,
      baseMaterial,
      baseMaterial,
      baseMaterial,
      frontMaterial,
      baseMaterial
    ];
  }, [getColor, hovered, texture]);

  // Add subtle animation
  useFrame(() => {
    if (mesh.current) {
      mesh.current.rotation.x = mesh.current.rotation.x += 0.01 * (hovered ? 2 : 0.5);
      mesh.current.rotation.y = mesh.current.rotation.y += 0.01 * (hovered ? 2 : 0.5);
    }
  });

  return (
    <mesh
      position={[position[0], position[1], position[2]]}
      ref={mesh}
      scale={active ? [1.2, 1.2, 1.2] : [1, 1, 1]}
      onClick={() => {
        setActive(!active);
        setSelectedElement(element);
      }}
      onPointerOver={() => setHover(true)}
      onPointerOut={() => setHover(false)}
      material={materials}
    >
      <boxGeometry args={[1, 1, 1]} />
    </mesh>
  );
};

export default ElementCube;
