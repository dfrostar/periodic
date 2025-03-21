import React, { useRef, useState } from 'react';
import { useFrame } from 'react-three-fiber';
import { Text } from 'troika-three-text';
import { Mesh } from 'three';
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
    }
    
    return 'lightgray';
  };

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
    >
      <boxGeometry args={[1, 1, 1]} />
      <meshStandardMaterial 
        color={getColor()} 
        metalness={0.5}
        roughness={0.5}
        emissive={hovered ? "#111" : "#000"}
        emissiveIntensity={hovered ? 0.5 : 0}
      />
      
      {/* Element Symbol */}
      <Text
        position={[0, 0, 0.51]}
        fontSize={0.4}
        color="#ffffff"
        anchorX="center"
        anchorY="middle"
        text={element.symbol}
      />
      
      {/* Atomic Number */}
      <Text
        position={[0, 0.4, 0.51]}
        fontSize={0.2}
        color="#dddddd"
        anchorX="center"
        anchorY="middle"
        text={element.atomicNumber.toString()}
      />
    </mesh>
  );
};

export default ElementCube;
