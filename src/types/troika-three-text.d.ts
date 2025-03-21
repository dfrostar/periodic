declare module 'troika-three-text' {
  import { Object3D, MeshBasicMaterial, Vector3, Color } from 'three';
  import React from 'react';

  interface TextProps {
    text?: string;
    fontSize?: number;
    color?: string | number | Color;
    anchorX?: string | number;
    anchorY?: string | number;
    font?: string;
    material?: MeshBasicMaterial;
    maxWidth?: number;
    textAlign?: string;
    outlineWidth?: number;
    outlineColor?: string | number | Color;
    position?: [number, number, number] | Vector3;
    rotation?: [number, number, number] | Vector3;
    scale?: [number, number, number] | Vector3;
    children?: React.ReactNode;
    [key: string]: any; // Allow any additional props
  }

  export const Text: React.ForwardRefExoticComponent<TextProps & React.RefAttributes<Object3D>>;
}
