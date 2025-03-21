---
layout: default
title: Performance Optimization
nav_order: 9
---

# Performance Optimization

This document outlines the performance optimization strategies implemented in the Periodic Table Visualization project.

## Performance Architecture

![Performance Architecture](assets/diagrams/performance-architecture.png)

## Core Metrics

We track the following key performance metrics:

| Metric | Target | Measurement Method |
|--------|--------|-------------------|
| Initial Load Time | < 2s | Lighthouse, Web Vitals |
| Time to Interactive | < 3s | Lighthouse |
| First Contentful Paint | < 1.2s | Web Vitals |
| Largest Contentful Paint | < 2.5s | Web Vitals |
| Cumulative Layout Shift | < 0.1 | Web Vitals |
| First Input Delay | < 100ms | Web Vitals |
| Frame Rate (3D Mode) | > 30fps | Performance API |
| Memory Usage | < 100MB | Chrome DevTools |

## Asset Optimization

### Image Optimization

Images are optimized using modern formats and responsive loading:

```tsx
// Example of optimized image loading
import { useEffect, useState } from 'react';
import { useInView } from 'react-intersection-observer';

function OptimizedImage({ src, alt, width, height }) {
  const [loaded, setLoaded] = useState(false);
  const { ref, inView } = useInView({
    triggerOnce: true,
    rootMargin: '200px 0px',
  });
  
  // Only load when in viewport (plus margin)
  const imageSrc = inView ? src : '';
  
  return (
    <div 
      ref={ref}
      className={`image-container ${loaded ? 'loaded' : 'loading'}`}
      style={{ width, height }}
    >
      {inView && (
        <picture>
          <source 
            srcSet={src.replace('.jpg', '.webp')} 
            type="image/webp" 
          />
          <img
            src={imageSrc}
            alt={alt}
            width={width}
            height={height}
            loading="lazy"
            onLoad={() => setLoaded(true)}
          />
        </picture>
      )}
      {!loaded && <div className="image-placeholder" />}
    </div>
  );
}
```

### WebGL Optimization

For 3D visualizations, we implement several WebGL optimization techniques:

```tsx
// Example of optimized Three.js rendering
import { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { useFrame } from '@react-three/fiber';

function OptimizedModelRenderer({ model, detail = 'high' }) {
  const meshRef = useRef();
  
  // Adjust level of detail based on device capability
  useEffect(() => {
    if (!meshRef.current) return;
    
    // Detect GPU capability
    const renderer = new THREE.WebGLRenderer();
    const gpu = renderer.capabilities;
    
    if (!gpu.isWebGL2 || gpu.maxAttributes < 16) {
      // For lower-end devices, reduce geometry detail
      const geometry = meshRef.current.geometry;
      const simplifier = new THREE.SimplifyModifier();
      const simplified = simplifier.modify(geometry, 
        geometry.attributes.position.count * 0.5);
      
      meshRef.current.geometry = simplified;
    }
  }, []);
  
  // Optimize render frequency
  useFrame((state, delta) => {
    // Only render when needed
    if (meshRef.current.needsUpdate) {
      meshRef.current.rotation.y += delta * 0.5;
      meshRef.current.needsUpdate = false;
    }
  });
  
  return (
    <mesh ref={meshRef}>
      {/* Model content */}
    </mesh>
  );
}
```

## Code-Splitting and Lazy Loading

We implement component-level code splitting:

```tsx
// Example of code splitting
import React, { Suspense, lazy } from 'react';

// Lazy load expensive components
const ElementVisualization = lazy(() => 
  import('@/components/ui/ElementVisualization')
);
const ElectronConfigViewer = lazy(() => 
  import('@/components/ui/ElectronConfigViewer')
);

function ElementDetailsPage({ elementId }) {
  const { data: element, isLoading } = useElementData(elementId);
  
  if (isLoading) return <ElementSkeleton />;
  
  return (
    <div className="element-page">
      <ElementHeader element={element} />
      
      {/* Core content loads immediately */}
      <ElementBasicProperties element={element} />
      
      {/* Heavy content lazy loaded */}
      <Suspense fallback={<VisualizationPlaceholder />}>
        <ElementVisualization element={element} />
      </Suspense>
      
      <Suspense fallback={<ConfigPlaceholder />}>
        <ElectronConfigViewer element={element} />
      </Suspense>
    </div>
  );
}
```

## State Management Optimization

Following our architecture pattern with Zustand and React Query:

```tsx
// Example of optimized state management
import create from 'zustand';
import { useQuery, useQueryClient } from 'react-query';
import { shallow } from 'zustand/shallow';

// Optimized Zustand store with selectors
export const useUIStore = create((set) => ({
  activeView: '3d',
  colorScheme: 'category',
  selectedElement: null,
  setActiveView: (view) => set({ activeView: view }),
  setColorScheme: (scheme) => set({ colorScheme: scheme }),
  setSelectedElement: (element) => set({ selectedElement: element }),
}));

// Component using optimized selectors
function ElementControls() {
  // Only re-render when these specific values change
  const { colorScheme, setColorScheme } = useUIStore(
    state => ({
      colorScheme: state.colorScheme,
      setColorScheme: state.setColorScheme,
    }),
    shallow // Compare with shallow equality
  );
  
  return (
    <div className="controls">
      <select 
        value={colorScheme}
        onChange={(e) => setColorScheme(e.target.value)}
      >
        <option value="category">Category</option>
        <option value="atomicRadius">Atomic Radius</option>
        <option value="electronegativity">Electronegativity</option>
      </select>
    </div>
  );
}

// React Query with optimized caching
function useElementData(elementId) {
  const queryClient = useQueryClient();
  
  return useQuery(
    ['element', elementId],
    () => fetchElement(elementId),
    {
      staleTime: 5 * 60 * 1000, // 5 minutes
      cacheTime: 30 * 60 * 1000, // 30 minutes
      onSuccess: (data) => {
        // Pre-fetch related elements
        data.relatedElements.forEach(relatedId => {
          queryClient.prefetchQuery(
            ['element', relatedId],
            () => fetchElement(relatedId)
          );
        });
      },
    }
  );
}
```

## Performance Monitoring

We implement real-time performance monitoring:

```tsx
// Example of performance monitoring
import { useEffect } from 'react';
import { getCLS, getFID, getLCP } from 'web-vitals';

function PerformanceMonitor() {
  useEffect(() => {
    // Monitor Core Web Vitals
    getCLS(metric => logMetric('CLS', metric));
    getFID(metric => logMetric('FID', metric));
    getLCP(metric => logMetric('LCP', metric));
    
    // Monitor frame rate for 3D visualizations
    let lastTime = performance.now();
    let frames = 0;
    let fps = 0;
    
    function checkFPS(timestamp) {
      frames++;
      
      if (timestamp - lastTime >= 1000) {
        fps = frames;
        frames = 0;
        lastTime = timestamp;
        
        // Log if frame rate drops below threshold
        if (fps < 30) {
          logPerformanceIssue('Low frame rate', fps);
        }
      }
      
      requestAnimationFrame(checkFPS);
    }
    
    const frameId = requestAnimationFrame(checkFPS);
    
    return () => {
      cancelAnimationFrame(frameId);
    };
  }, []);
  
  return null; // This component doesn't render anything
}

function logMetric(name, metric) {
  console.log(`${name}: ${metric.value}`);
  // Send to analytics in production
}

function logPerformanceIssue(issue, value) {
  console.warn(`Performance issue: ${issue} (${value})`);
  // Send to monitoring service in production
}
```

## Memory Management

Proper memory management is critical for long-running applications:

```tsx
// Example of memory leak prevention
function ElementVisualization({ elementId }) {
  const rendererRef = useRef(null);
  
  useEffect(() => {
    // Initialize Three.js
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    const renderer = new THREE.WebGLRenderer();
    
    rendererRef.current = renderer;
    
    // Handle window resize
    const handleResize = () => {
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(window.innerWidth, window.innerHeight);
    };
    
    window.addEventListener('resize', handleResize);
    
    // Animation loop
    let animationId;
    const animate = () => {
      animationId = requestAnimationFrame(animate);
      renderer.render(scene, camera);
    };
    
    animate();
    
    // Cleanup function to prevent memory leaks
    return () => {
      window.removeEventListener('resize', handleResize);
      cancelAnimationFrame(animationId);
      
      // Dispose of Three.js resources
      scene.traverse(object => {
        if (object.geometry) object.geometry.dispose();
        
        if (object.material) {
          if (Array.isArray(object.material)) {
            object.material.forEach(material => material.dispose());
          } else {
            object.material.dispose();
          }
        }
      });
      
      renderer.dispose();
      renderer.forceContextLoss();
      rendererRef.current = null;
    };
  }, [elementId]);
  
  return <div id="visualization-container" />;
}
```

## Bundle Optimization

We use several techniques to optimize our bundle size:

1. **Tree Shaking**: Eliminate unused code
2. **Dynamic Imports**: Load non-critical components on demand
3. **Module Analysis**: Regular audits with `webpack-bundle-analyzer`
4. **Dependency Management**: Careful selection of lightweight dependencies

```tsx
// Example of bundle optimization
// webpack.config.js
const BundleAnalyzerPlugin = require('webpack-bundle-analyzer').BundleAnalyzerPlugin;

module.exports = {
  // Other webpack config...
  
  optimization: {
    splitChunks: {
      chunks: 'all',
      maxInitialRequests: Infinity,
      minSize: 20000,
      cacheGroups: {
        vendor: {
          test: /[\\/]node_modules[\\/]/,
          name(module) {
            // Get the package name
            const packageName = module.context.match(
              /[\\/]node_modules[\\/](.*?)([\\/]|$)/
            )[1];
            
            // Create separate chunks for larger packages
            return `vendor.${packageName.replace('@', '')}`;
          },
        },
      },
    },
  },
  
  plugins: [
    // Only enable in analyze mode
    process.env.ANALYZE && new BundleAnalyzerPlugin(),
  ].filter(Boolean),
};
```

## Rendering Optimization

We optimize component rendering using memoization:

```tsx
// Example of rendering optimization
import React, { memo, useMemo, useCallback } from 'react';

// Memoized component only re-renders when props change
const ElementTile = memo(function ElementTile({ element, onSelect }) {
  // Memoize complex calculations
  const electronConfiguration = useMemo(() => {
    return calculateElectronConfiguration(element);
  }, [element.atomicNumber]);
  
  // Memoize callback functions
  const handleClick = useCallback(() => {
    onSelect(element);
  }, [element, onSelect]);
  
  return (
    <div className="element-tile" onClick={handleClick}>
      <div className="atomic-number">{element.atomicNumber}</div>
      <div className="symbol">{element.symbol}</div>
      <div className="name">{element.name}</div>
      <div className="electron-config">{electronConfiguration}</div>
    </div>
  );
});

// Parent component
function PeriodicTable() {
  // Only re-fetch when necessary
  const { data: elements } = useQuery('elements', fetchElements, {
    staleTime: Infinity, // Elements don't change often!
  });
  
  const [selectedElement, setSelectedElement] = useState(null);
  
  // Memoize the selection handler
  const handleSelect = useCallback((element) => {
    setSelectedElement(element);
  }, []);
  
  return (
    <div className="periodic-table">
      {elements?.map(element => (
        <ElementTile
          key={element.atomicNumber}
          element={element}
          onSelect={handleSelect}
        />
      ))}
    </div>
  );
}
```

## Mobile Optimization

Special optimizations for mobile devices:

1. **Reduced Geometry**: Simplified 3D models on mobile
2. **Touch Optimization**: Larger hit targets and touch-specific controls
3. **Network Awareness**: Adaptive loading based on connection quality

```tsx
// Example of adaptive loading based on network
import { useEffect, useState } from 'react';

function useNetworkQuality() {
  const [quality, setQuality] = useState('high');
  
  useEffect(() => {
    // Check connection type if available
    if ('connection' in navigator) {
      const connection = navigator.connection;
      
      const determineQuality = () => {
        if (connection.saveData) {
          return 'low';
        }
        
        if (connection.effectiveType === '4g') {
          return 'high';
        }
        
        if (connection.effectiveType === '3g') {
          return 'medium';
        }
        
        return 'low';
      };
      
      setQuality(determineQuality());
      
      connection.addEventListener('change', () => {
        setQuality(determineQuality());
      });
    }
  }, []);
  
  return quality;
}

// Usage in a component
function AdaptiveElementViewer({ element }) {
  const networkQuality = useNetworkQuality();
  
  // Adjust quality based on network
  const textureQuality = {
    high: 2048,
    medium: 1024,
    low: 512,
  }[networkQuality];
  
  return (
    <ElementVisualizer
      element={element}
      textureSize={textureQuality}
      enableParticles={networkQuality === 'high'}
      enableReflections={networkQuality !== 'low'}
    />
  );
}
```

## Performance Debugging

Use the browser's performance tools to identify bottlenecks:

```tsx
// Example of performance debugging
function debugPerformance(componentName) {
  if (process.env.NODE_ENV === 'development') {
    console.time(`${componentName} render`);
    
    return () => {
      console.timeEnd(`${componentName} render`);
    };
  }
  
  return () => {};
}

function HeavyComponent() {
  const endDebug = debugPerformance('HeavyComponent');
  
  // Component logic...
  
  endDebug();
  return <div>Heavy component content</div>;
}
```
