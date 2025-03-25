// Global type definitions for the periodic table application

export type ViewMode = '2d' | '3d' | 'r3f' | 'harmonic';
export type VisualizationType = 'spiral' | 'table' | 'harmonic' | 'orbital';
export type ColorScheme = 'category' | 'state' | 'atomic-radius' | 'frequency' | 'octave';

export interface PeriodicElement {
  number: number;
  symbol: string;
  name: string;
  atomic_mass: number;
  category: string;
  phase: 'solid' | 'liquid' | 'gas' | string;
  electron_configuration: string;
  electron_configuration_semantic?: string;
  electronegativity?: number;
  atomic_radius?: number;
  ionization_energy?: number;
  group: number;
  period: number;
  // Musical properties
  frequency?: number;
  octave?: number;
  note?: string;
  // Additional properties
  color?: string;
}

// Element type used in the element store
export interface Element {
  atomicNumber: number;
  symbol: string;
  name: string;
  atomicMass: number;
  category: string;
  group: number;
  period: number;
  block: string;
  electronConfiguration: string;
  state: "unknown" | "gas" | "liquid" | "solid";
  electronegativity?: number;
}
