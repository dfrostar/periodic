import React, { useState, useEffect } from 'react';
import { useElementStore } from '@/store/elementStore';
import styles from '@/styles/SearchFilter.module.css';

/**
 * SearchFilter component
 * Provides search and filtering capabilities for the periodic table
 */
const SearchFilter: React.FC = () => {
  const {
    filter,
    setSearchQuery,
    setCategoryFilter,
    setStateFilter,
    setPeriodFilter,
    setGroupFilter,
    clearFilters
  } = useElementStore();
  
  const [localSearch, setLocalSearch] = useState(filter.searchQuery);
  
  // Handle search input changes with debouncing
  useEffect(() => {
    const timer = setTimeout(() => {
      setSearchQuery(localSearch);
    }, 300);
    
    return () => clearTimeout(timer);
  }, [localSearch, setSearchQuery]);
  
  // Categories for the filter dropdown
  const categories = [
    'alkali-metal',
    'alkaline-earth-metal',
    'lanthanoid',
    'actinoid',
    'transition-metal',
    'post-transition-metal',
    'metalloid',
    'nonmetal',
    'noble-gas',
    'unknown'
  ];
  
  // States for the filter dropdown
  const states = ['solid', 'liquid', 'gas', 'unknown'];
  
  // Generate options for period and group filters
  const periods = Array.from({ length: 7 }, (_, i) => i + 1);
  const groups = Array.from({ length: 18 }, (_, i) => i + 1);
  
  return (
    <div className={styles.searchFilterContainer} role="search">
      <div className={styles.searchBox}>
        <input
          type="text"
          aria-label="Search elements"
          placeholder="Search by name, symbol, or property..."
          value={localSearch}
          onChange={(e) => setLocalSearch(e.target.value)}
          className={styles.searchInput}
        />
        <button 
          aria-label="Clear search" 
          className={styles.clearButton}
          onClick={() => {
            setLocalSearch('');
            setSearchQuery('');
          }}
          disabled={!localSearch}
        >
          ×
        </button>
      </div>
      
      <div className={styles.filtersContainer}>
        <div className={styles.filterGroup}>
          <label htmlFor="category-filter">Category:</label>
          <select
            id="category-filter"
            value={filter.categoryFilter || ''}
            onChange={(e) => setCategoryFilter(e.target.value || null)}
            className={styles.filterSelect}
          >
            <option value="">All Categories</option>
            {categories.map(category => (
              <option key={category} value={category}>
                {category.split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')}
              </option>
            ))}
          </select>
        </div>
        
        <div className={styles.filterGroup}>
          <label htmlFor="state-filter">State:</label>
          <select
            id="state-filter"
            value={filter.stateFilter || ''}
            onChange={(e) => setStateFilter(e.target.value as any || null)}
            className={styles.filterSelect}
          >
            <option value="">All States</option>
            {states.map(state => (
              <option key={state} value={state}>
                {state.charAt(0).toUpperCase() + state.slice(1)}
              </option>
            ))}
          </select>
        </div>
        
        <div className={styles.filterGroup}>
          <label htmlFor="period-filter">Period:</label>
          <select
            id="period-filter"
            value={filter.periodFilter || ''}
            onChange={(e) => setPeriodFilter(e.target.value ? parseInt(e.target.value, 10) : null)}
            className={styles.filterSelect}
          >
            <option value="">All Periods</option>
            {periods.map(period => (
              <option key={period} value={period}>{period}</option>
            ))}
          </select>
        </div>
        
        <div className={styles.filterGroup}>
          <label htmlFor="group-filter">Group:</label>
          <select
            id="group-filter"
            value={filter.groupFilter || ''}
            onChange={(e) => setGroupFilter(e.target.value ? parseInt(e.target.value, 10) : null)}
            className={styles.filterSelect}
          >
            <option value="">All Groups</option>
            {groups.map(group => (
              <option key={group} value={group}>{group}</option>
            ))}
          </select>
        </div>
        
        <button
          onClick={clearFilters}
          className={styles.clearFiltersButton}
          aria-label="Clear all filters"
        >
          Clear Filters
        </button>
      </div>
    </div>
  );
};

export default SearchFilter;
