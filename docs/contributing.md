---
layout: default
title: Contributing Guide
nav_order: 10
---

# Contributing Guide

Thank you for considering contributing to the Periodic Table Visualization project! This document provides guidelines and instructions for contributing.

## Code of Conduct

This project follows our [Code of Conduct](./code-of-conduct.md). By participating, you are expected to uphold this code.

## Getting Started

### 1. Fork the Repository

Start by forking the repository on GitHub, then clone your fork:

```bash
git clone https://github.com/your-username/periodic-table-visualization.git
cd periodic-table-visualization
```

### 2. Set Up Development Environment

Follow the [Installation & Setup Guide](./installation.md) to set up your development environment.

### 3. Create a Branch

Create a branch for your contribution:

```bash
git checkout -b feature/your-feature-name
# or
git checkout -b fix/issue-you-are-fixing
```

## Development Workflow

### Coding Standards

We follow these coding standards:

1. **TypeScript**: Use TypeScript for all new code
2. **Formatting**: We use Prettier for consistent formatting
3. **Linting**: ESLint is configured to enforce coding standards
4. **Comments**: Document complex logic, especially AI-related code
5. **Naming**: Use meaningful variable and function names

### Git Workflow

1. Make changes in your feature branch
2. Commit changes with clear, descriptive commit messages:

   ```bash
   git commit -m "feat: add element comparison component"
   # or
   git commit -m "fix: resolve issue with electron configuration display"
   ```

3. Keep your branch updated with the main branch:

   ```bash
   git fetch origin
   git rebase origin/main
   ```

4. Push your branch to your fork:

   ```bash
   git push -u origin feature/your-feature-name
   ```

### Pull Request Process

1. Create a pull request from your branch to the main repository
2. Fill out the PR template with:
   - Description of changes
   - Link to related issue
   - Screenshots (if applicable)
   - Testing performed
3. Ensure all checks pass (CI/CD pipeline)
4. Request a review from a maintainer
5. Address any feedback from reviewers

## Testing Guidelines

All new code should include appropriate tests:

### Unit Tests

For utilities and hooks:

```tsx
// Example unit test for a utility function
import { calculateElectronConfiguration } from './electronConfiguration';

describe('calculateElectronConfiguration', () => {
  it('correctly calculates for Hydrogen', () => {
    expect(calculateElectronConfiguration(1)).toBe('1s¹');
  });
  
  it('correctly calculates for complex elements', () => {
    expect(calculateElectronConfiguration(11)).toBe('[Ne] 3s¹');
  });
});
```

### Component Tests

For UI components:

```tsx
// Example component test
import { render, screen } from '@testing-library/react';
import { ElementCard } from './ElementCard';

const mockElement = {
  atomicNumber: 1,
  symbol: 'H',
  name: 'Hydrogen',
  atomicMass: 1.008,
};

describe('ElementCard', () => {
  it('renders element information correctly', () => {
    render(<ElementCard element={mockElement} />);
    
    expect(screen.getByText('H')).toBeInTheDocument();
    expect(screen.getByText('Hydrogen')).toBeInTheDocument();
  });
});
```

### Integration Tests

For testing component interactions:

```tsx
// Example integration test
import { render, screen, fireEvent } from '@testing-library/react';
import { PeriodicTable } from './PeriodicTable';
import { ElementDetails } from './ElementDetails';

describe('Element selection flow', () => {
  it('displays element details when element is clicked', () => {
    render(
      <>
        <PeriodicTable />
        <ElementDetails />
      </>
    );
    
    // Click on Hydrogen element
    fireEvent.click(screen.getByTestId('element-1'));
    
    // Check that details are shown
    expect(screen.getByText('Hydrogen Details')).toBeInTheDocument();
  });
});
```

## AI Component Guidelines

When contributing AI components:

1. **Isolation**: Keep AI logic separate from UI components
2. **Fallbacks**: Implement non-AI fallbacks for all AI features
3. **Error Handling**: Include comprehensive error handling
4. **Testing**: Mock AI responses in tests
5. **Performance**: Consider streaming for long-running operations

Example AI component structure:

```
ComponentName/
├── index.ts
├── ComponentName.tsx       # Main component
├── ComponentFallback.tsx   # Non-AI fallback
├── ComponentError.tsx      # Error component
├── ComponentName.css       # Styles
├── ComponentName.test.tsx  # Tests
└── mocks/                  # Test mocks
```

## Documentation Guidelines

Update documentation when making changes:

1. **Component Documentation**: Update or create component docs in `/docs/components`
2. **API Documentation**: Update API docs in `/docs/api`
3. **Inline Code Comments**: Document complex algorithms and AI logic
4. **README**: Update the main README if adding major features

## Accessibility Guidelines

All contributions should follow accessibility best practices:

1. **Semantic HTML**: Use appropriate HTML elements
2. **ARIA Attributes**: Add ARIA attributes when necessary
3. **Keyboard Navigation**: Ensure keyboard accessibility
4. **Color Contrast**: Maintain sufficient contrast ratios
5. **Screen Readers**: Test with screen readers

## Performance Considerations

Keep performance in mind:

1. **Bundle Size**: Avoid large dependencies
2. **Memoization**: Use React.memo and useMemo appropriately
3. **Lazy Loading**: Implement code splitting for large components
4. **Rendering Optimization**: Prevent unnecessary re-renders

## Security Guidelines

Follow these security practices:

1. **Input Validation**: Validate all user inputs
2. **API Keys**: Never commit API keys to the repository
3. **Dependencies**: Keep dependencies updated
4. **XSS Prevention**: Prevent cross-site scripting vulnerabilities

## Submitting Features

For significant changes, please discuss via issue first.

### Feature Request Process

1. Check if the feature already exists in the backlog
2. Create a new issue describing the feature
3. Use the feature request template
4. Discuss the feature with maintainers
5. If approved, implement the feature as described above

## Reporting Bugs

If you find a bug:

1. Check if the bug is already reported
2. Use the bug report template
3. Include steps to reproduce
4. Include browser/environment information
5. If possible, include screenshots or code samples

## Review Process

Pull requests are reviewed by maintainers:

1. Code quality review
2. Test coverage check
3. Documentation review
4. Performance assessment
5. Accessibility verification

## Getting Help

If you need help with your contribution:

1. Comment on the relevant issue
2. Join our Slack channel (#periodic-table-dev)
3. Contact the development team at dev-team@your-organization.com

Thank you for contributing to the Periodic Table Visualization project!
