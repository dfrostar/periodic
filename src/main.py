import matplotlib.pyplot as plt
import numpy as np
import pandas as pd
import os

# Load element data
try:
    elements_df = pd.read_csv('data/elements.csv')
except FileNotFoundError:
    print("Error: elements.csv not found in data directory")
    exit(1)

# Ensure output directory exists
os.makedirs('output', exist_ok=True)

# Convert ionization energy to frequency
h = 4.1357e-15  # Planck's constant in eV·s
elements_df['Frequency_Hz'] = elements_df['Ionization_Energy_eV'] / h

# Create octave bands
octave_bounds = [1e15 * (2**i) for i in range(6)]  # From 1e15 to 32e15 Hz

# Plot configuration
plt.figure(figsize=(16, 8))
bars = plt.bar(elements_df['Symbol'], elements_df['Frequency_Hz'], 
               color='#4fa3f5', edgecolor='#1a487f')

# Octave band lines
for bound in octave_bounds:
    plt.axhline(bound, color='#ff6b6b', linestyle='--', alpha=0.7, linewidth=1.5)

# Styling
plt.yscale('log')
plt.title('Periodic Table Arranged by Ionization Frequency (Octave Grouping)', 
          fontsize=14, pad=20)
plt.xlabel('Element Symbol', fontsize=12)
plt.ylabel('Frequency (Hz) - Log Scale', fontsize=12)
plt.grid(True, which="both", ls="--", alpha=0.2)
plt.xticks(rotation=45, ha='right')

# Add frequency annotations for key elements
key_elements = ['H', 'He', 'Li', 'Be', 'O', 'Ne', 'Na', 'Cl']
for bar, (symbol, freq) in zip(bars, zip(elements_df['Symbol'], elements_df['Frequency_Hz'])):
    if symbol in key_elements:
        plt.text(bar.get_x() + bar.get_width()/2, bar.get_height(), 
                 f'{freq:.1e}', ha='center', va='bottom', fontsize=8)

plt.tight_layout()
plt.savefig(os.path.join('output', 'periodic_table_frequency.png'), dpi=300)
plt.show()
