// Declaration file for React Three Fiber components
import { Object3D, Material, Side } from 'three';

declare global {
  namespace JSX {
    interface IntrinsicElements {
      mesh: any;
      ambientLight: any;
      pointLight: any;
      planeGeometry: any;
      boxGeometry: any;
      sphereGeometry: any;
      meshStandardMaterial: any;
      gridHelper: any;
      group: any;
      stars: any;
      environment: any;
      text: any;
      directionalLight: any;
      orbitControls: any;
    }
  }
}

// Extend available JSX props to include Three.js specific properties
declare module 'react' {
  interface HTMLAttributes<T> {
    position?: [number, number, number] | any;
    rotation?: [number, number, number] | any;
    args?: any[] | any;
    intensity?: number;
    castShadow?: boolean;
    receiveShadow?: boolean;
    color?: string | any;
    opacity?: number;
    transparent?: boolean;
    side?: Side | any;
    map?: any;
    emissive?: any;
    emissiveIntensity?: number;
    metalness?: number;
    roughness?: number;
    toneMapped?: boolean;
    preset?: string;
    radius?: number;
    depth?: number;
    count?: number;
    factor?: number;
    saturation?: number;
    fade?: boolean;
    speed?: number;
    enableDamping?: boolean;
    dampingFactor?: number;
    rotateSpeed?: number;
    anchorX?: string;
    anchorY?: string;
    fontSize?: number;
  }
}
