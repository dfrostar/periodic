import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { Element } from '@/types/element';
import styles from '@/styles/PeriodicTable3D.module.css';

interface PeriodicTable3DProps {
  elements: Element[];
  colorScheme: string;
}

const PeriodicTable3D: React.FC<PeriodicTable3DProps> = ({ elements, colorScheme }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const requestRef = useRef<number>();
  
  // Initialize and maintain Three.js scene
  useEffect(() => {
    if (!containerRef.current) return;
    
    // Create scene, camera, and renderer
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x111111);
    
    const camera = new THREE.PerspectiveCamera(
      50, 
      containerRef.current.clientWidth / containerRef.current.clientHeight, 
      0.1, 
      1000
    );
    camera.position.z = 30;
    
    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(containerRef.current.clientWidth, containerRef.current.clientHeight);
    containerRef.current.appendChild(renderer.domElement);
    
    // Add lighting
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
    scene.add(ambientLight);
    
    const pointLight = new THREE.PointLight(0xffffff, 1);
    pointLight.position.set(10, 10, 10);
    scene.add(pointLight);
    
    // Add elements as cubes
    elements.forEach(element => {
      // Calculate position
      const position = getElementPosition(element.atomicNumber);
      
      // Create a cube
      const geometry = new THREE.BoxGeometry(1, 1, 1);
      
      // Determine color based on element category and color scheme
      let color = 0x0088ff; // Default color
      if (element.category?.includes('metal')) {
        color = colorScheme === 'dark' ? 0x66ccff : 0x0088ff;
      } else if (element.category?.includes('nonmetal')) {
        color = colorScheme === 'dark' ? 0xff9966 : 0xff6600;
      } else if (element.category?.includes('noble gas')) {
        color = colorScheme === 'dark' ? 0xffcc66 : 0xffaa00;
      }
      
      const material = new THREE.MeshPhongMaterial({ 
        color,
        shininess: 100,
        emissive: new THREE.Color(color).multiplyScalar(0.2)
      });
      
      const cube = new THREE.Mesh(geometry, material);
      cube.position.set(position[0], position[1], position[2]);
      
      // Add custom property to identify the element (for potential interaction)
      (cube as any).userData = { element };
      
      scene.add(cube);
    });
    
    // Simple rotation animation
    const animate = () => {
      requestRef.current = requestAnimationFrame(animate);
      
      // Slowly rotate the camera around the scene
      const time = Date.now() * 0.0001;
      camera.position.x = Math.sin(time) * 30;
      camera.position.z = Math.cos(time) * 30;
      camera.lookAt(scene.position);
      
      renderer.render(scene, camera);
    };
    
    // Start animation
    requestRef.current = requestAnimationFrame(animate);
    
    // Handle window resize
    const handleResize = () => {
      if (!containerRef.current) return;
      
      camera.aspect = containerRef.current.clientWidth / containerRef.current.clientHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(containerRef.current.clientWidth, containerRef.current.clientHeight);
    };
    
    window.addEventListener('resize', handleResize);
    
    // Cleanup
    return () => {
      if (requestRef.current) {
        cancelAnimationFrame(requestRef.current);
      }
      
      window.removeEventListener('resize', handleResize);
      
      if (containerRef.current) {
        containerRef.current.removeChild(renderer.domElement);
      }
      
      // Dispose of geometries and materials
      scene.traverse(object => {
        if (object instanceof THREE.Mesh) {
          object.geometry.dispose();
          if (Array.isArray(object.material)) {
            object.material.forEach(material => material.dispose());
          } else {
            object.material.dispose();
          }
        }
      });
    };
  }, [elements, colorScheme]);
  
  // 3D table layout positions
  const getElementPosition = (atomicNumber: number) => {
    // Standard periodic table structure but in 3D space
    const period = Math.ceil(atomicNumber / 18);
    let group = atomicNumber % 18;
    if (group === 0) group = 18;
    
    // Adjust positions of lanthanides and actinides
    if (atomicNumber >= 57 && atomicNumber <= 71) {
      return [(atomicNumber - 57) * 1.5 - 10, -6, 0];
    } else if (atomicNumber >= 89 && atomicNumber <= 103) {
      return [(atomicNumber - 89) * 1.5 - 10, -9, 0];
    }
    
    return [(group - 1) * 1.5, -(period - 1) * 1.5, 0];
  };

  return (
    <div ref={containerRef} className={styles.canvas3DContainer} style={{ height: '600px' }}></div>
  );
};

export default PeriodicTable3D;
