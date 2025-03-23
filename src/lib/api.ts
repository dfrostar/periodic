import { Element } from '@/types/element';
import Papa from 'papaparse';
import { useQuery } from '@tanstack/react-query';

/**
 * Fetches element data from the JSON file
 * Falls back to CSV if JSON fails
 */
export const fetchElements = async (): Promise<Element[]> => {
  try {
    // First try to fetch from JSON
    const response = await fetch('/data/elements.json');
    if (!response.ok) throw new Error('Failed to fetch JSON data');
    
    const data = await response.json();
    return data as Element[];
  } catch (jsonError) {
    console.warn('JSON fetch failed, falling back to CSV:', jsonError);
    
    try {
      // Fallback to CSV parsing
      const csvResponse = await fetch('/data/elements.csv');
      if (!csvResponse.ok) throw new Error('Failed to fetch CSV data');
      
      const csvText = await csvResponse.text();
      const { data } = Papa.parse(csvText, { header: true });
      
      // Convert CSV data to Element objects
      return data.map((row: any) => ({
        atomicNumber: parseInt(row.atomicNumber, 10),
        symbol: row.symbol,
        name: row.name,
        atomicMass: parseFloat(row.atomicMass),
        category: row.category || 'unknown',
        group: parseInt(row.group, 10) || 0,
        period: parseInt(row.period, 10) || 0,
        block: row.block || '',
        electronConfiguration: row.electronConfiguration || '',
        electronegativity: row.electronegativity ? parseFloat(row.electronegativity) : undefined,
        atomicRadius: row.atomicRadius ? parseInt(row.atomicRadius, 10) : undefined,
        ionizationEnergy: row.ionizationEnergy ? parseFloat(row.ionizationEnergy) : undefined,
        electronAffinity: row.electronAffinity ? parseFloat(row.electronAffinity) : undefined,
        oxidationStates: row.oxidationStates || undefined,
        standardState: row.standardState || undefined,
        meltingPoint: row.meltingPoint ? parseFloat(row.meltingPoint) : undefined,
        boilingPoint: row.boilingPoint ? parseFloat(row.boilingPoint) : undefined,
        density: row.density ? parseFloat(row.density) : undefined,
        state: (row.state as 'solid' | 'liquid' | 'gas') || 'unknown',
        yearDiscovered: row.yearDiscovered ? parseInt(row.yearDiscovered, 10) : undefined,
        discoveredBy: row.discoveredBy || undefined,
        description: row.description || undefined,
      }));
    } catch (csvError) {
      console.error('Both JSON and CSV fetches failed:', csvError);
      // Return empty array as a last resort to prevent app from crashing
      return [];
    }
  }
};

/**
 * React Query hook for fetching elements
 */
export const useElements = () => {
  return useQuery({
    queryKey: ['elements'],
    queryFn: fetchElements
  });
};

/**
 * Fetch an element by its atomic number
 */
export const fetchElementByAtomicNumber = async (atomicNumber: number): Promise<Element | null> => {
  const elements = await fetchElements();
  return elements.find(element => element.atomicNumber === atomicNumber) || null;
};

/**
 * Search elements by name, symbol, or category
 */
export const searchElements = async (query: string): Promise<Element[]> => {
  const elements = await fetchElements();
  const lowerQuery = query.toLowerCase();
  
  return elements.filter(element => 
    element.name.toLowerCase().includes(lowerQuery) ||
    element.symbol.toLowerCase().includes(lowerQuery) ||
    (element.category && element.category.toLowerCase().includes(lowerQuery))
  );
};
