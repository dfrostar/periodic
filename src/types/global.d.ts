/**
 * Global TypeScript declarations for the project
 */

// Import React and JSX types
import 'react';

// Application-specific types
declare global {
  type ViewMode = '2d' | '3d' | 'r3f' | 'harmonic';
  type VisualizationType = 'spiral' | 'table' | 'harmonic' | 'orbital';
  type ColorScheme = 'category' | 'state' | 'atomic-radius' | 'frequency' | 'octave';
}

// Extend JSX namespace for custom elements if needed
declare namespace JSX {
  interface IntrinsicElements {
    [elemName: string]: any;
  }
}

// Extend window object if needed
interface Window {
  // Add any browser APIs you're using that might not be in the default type defs
}

// Define environment variables types
declare namespace NodeJS {
  interface ProcessEnv {
    NODE_ENV: 'development' | 'production' | 'test';
    NEXT_PUBLIC_APP_URL: string;
    // Add any other environment variables you're using
  }
}
