// Script to convert the complete elements data to the format expected by our application
const fs = require('fs');
const path = require('path');

// Read the source file
const sourceFile = path.join(__dirname, '..', 'public', 'data', 'complete-elements.json');
const sourceData = JSON.parse(fs.readFileSync(sourceFile, 'utf8'));

// Map category names to our application's expected format
const categoryMap = {
  'diatomic nonmetal': 'nonmetal',
  'noble gas': 'noble-gas',
  'alkali metal': 'alkali-metal',
  'alkaline earth metal': 'alkaline-earth-metal',
  'metalloid': 'metalloid', 
  'polyatomic nonmetal': 'nonmetal',
  'post-transition metal': 'post-transition-metal',
  'transition metal': 'transition-metal',
  'lanthanoid': 'lanthanoid',
  'actinoid': 'actinoid',
  'halogen': 'halogen'
};

// Map phase to state
const stateMap = {
  'Gas': 'gas',
  'Liquid': 'liquid',
  'Solid': 'solid'
};

// Convert the data
const elements = sourceData.elements.map(element => {
  // Determine category
  let category = categoryMap[element.category] || 'unknown';
  
  // Extract state from phase
  let state = stateMap[element.phase] || 'unknown';
  
  return {
    atomicNumber: element.number,
    symbol: element.symbol,
    name: element.name,
    atomicMass: element.atomic_mass,
    category: category,
    group: element.group || 0,
    period: element.period || 0,
    block: element.block || '',
    electronConfiguration: element.electron_configuration || '',
    electronegativity: element.electronegativity_pauling,
    atomicRadius: element.atomic_radius,
    ionizationEnergy: element.ionization_energies ? element.ionization_energies[0] : undefined,
    electronAffinity: element.electron_affinity,
    oxidationStates: element.oxidation_states,
    state: state,
    meltingPoint: element.melt,
    boilingPoint: element.boil,
    density: element.density,
    yearDiscovered: isNaN(parseInt(element.discovered)) ? undefined : parseInt(element.discovered),
    discoveredBy: element.discovered_by,
    description: element.summary
  };
});

// Write the converted data to a new file
const targetFile = path.join(__dirname, '..', 'public', 'data', 'elements.json');
fs.writeFileSync(targetFile, JSON.stringify(elements, null, 2), 'utf8');

console.log(`Converted ${elements.length} elements and saved to ${targetFile}`);
