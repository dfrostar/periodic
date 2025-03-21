/**
 * Element interface defines the structure of a chemical element
 * in the periodic table with all its properties.
 */
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
  electronegativity?: number;
  atomicRadius?: number;
  ionizationEnergy?: number;
  electronAffinity?: number;
  oxidationStates?: string;
  standardState?: string;
  meltingPoint?: number;
  boilingPoint?: number;
  density?: number;
  state: 'solid' | 'liquid' | 'gas' | 'unknown';
  yearDiscovered?: number;
  discoveredBy?: string;
  description?: string;
}
