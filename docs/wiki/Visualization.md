# Visualization Methodology

## Frequency Calculation
```math
f = \frac{E}{h}
```

## Octave Band Grouping
```python
def calculate_octave(base_freq):
    return [base_freq * (2**n) for n in range(-2, 3)]
```
