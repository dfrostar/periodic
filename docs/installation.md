---
layout: default
title: Installation & Setup
nav_order: 2
---

# Installation & Setup Guide

This guide walks through the complete setup process for the Periodic Table Visualization project.

## Prerequisites

Before installation, ensure you have the following:

- Node.js (v18.0.0 or later)
- npm (v9.0.0 or later) or yarn (v1.22.0 or later)
- Git 

## Environment Setup

### 1. Clone the Repository

```bash
git clone https://github.com/your-organization/periodic-table-visualization.git
cd periodic-table-visualization
```

### 2. Install Dependencies

Using npm:

```bash
npm install
```

Using yarn:

```bash
yarn install
```

### 3. Environment Variables

Create a `.env` file in the root directory:

```bash
# Development
cp .env.example .env
```

Configure the following environment variables:

```
# API Configuration
REACT_APP_API_URL=http://localhost:3001/api
REACT_APP_AI_MODEL_VERSION=1.0.0

# AI Service (if using local)
REACT_APP_AI_SERVICE_URL=http://localhost:5000

# Security
REACT_APP_API_KEY=your_api_key_here
REACT_APP_RATE_LIMIT=100

# Feature Flags
REACT_APP_ENABLE_3D_VISUALIZATIONS=true
REACT_APP_ENABLE_AI_PREDICTIONS=true
```

> **IMPORTANT**: Never commit `.env` files with real API keys to version control. The `.env` file is included in `.gitignore` by default.

## Development Setup

### Start Development Server

```bash
npm start
# or
yarn start
```

The application will be available at [http://localhost:3000](http://localhost:3000).

### Development Tools

The project includes several development tools:

1. **ESLint & Prettier**

   Check for linting issues:

   ```bash
   npm run lint
   # or
   yarn lint
   ```

   Auto-fix linting issues:

   ```bash
   npm run lint:fix
   # or
   yarn lint:fix
   ```

2. **TypeScript Type Checking**

   ```bash
   npm run tsc
   # or
   yarn tsc
   ```

3. **Storybook**

   Launch component documentation with Storybook:

   ```bash
   npm run storybook
   # or
   yarn storybook
   ```

   Storybook will be available at [http://localhost:6006](http://localhost:6006).

## Testing

### Run Tests

Run the test suite:

```bash
npm test
# or
yarn test
```

Run tests with coverage:

```bash
npm test -- --coverage
# or
yarn test --coverage
```

### Test Types

The project includes several types of tests:

1. **Unit Tests**

   ```bash
   npm run test:unit
   # or
   yarn test:unit
   ```

2. **Integration Tests**

   ```bash
   npm run test:integration
   # or
   yarn test:integration
   ```

3. **E2E Tests**

   ```bash
   npm run test:e2e
   # or
   yarn test:e2e
   ```

## Production Deployment

### Build for Production

```bash
npm run build
# or
yarn build
```

The build artifacts will be stored in the `build/` directory.

### Deployment Configuration

For deployment to production, use the following environment variables:

```
# Production-specific
NODE_ENV=production
REACT_APP_API_URL=https://api.your-production-domain.com
REACT_APP_ENABLE_ANALYTICS=true

# Security
REACT_APP_RATE_LIMIT=60
```

### Deployment Scripts

Deploy to staging:

```bash
npm run deploy:staging
# or
yarn deploy:staging
```

Deploy to production:

```bash
npm run deploy:production
# or
yarn deploy:production
```

## Docker Setup

The project includes Docker support for consistent environments.

### Building the Docker Image

```bash
docker build -t periodic-table-visualization .
```

### Running with Docker

```bash
docker run -p 3000:80 -e "REACT_APP_API_URL=http://localhost:3001/api" periodic-table-visualization
```

### Docker Compose

For a complete local environment with API services:

```bash
docker-compose up
```

## AI Service Setup

The project can connect to an AI service for element predictions.

### Local AI Service

1. Clone the AI service repository:

   ```bash
   git clone https://github.com/your-organization/periodic-table-ai-service.git
   cd periodic-table-ai-service
   ```

2. Install dependencies:

   ```bash
   pip install -r requirements.txt
   ```

3. Start the AI service:

   ```bash
   python app.py
   ```

   The AI service will run on [http://localhost:5000](http://localhost:5000).

4. Update your `.env` to point to the local AI service:

   ```
   REACT_APP_AI_SERVICE_URL=http://localhost:5000
   ```

### External AI Service

To use an external AI service, update the `.env` file:

```
REACT_APP_AI_SERVICE_URL=https://ai-service.your-domain.com
REACT_APP_AI_API_KEY=your_ai_service_key_here
```

## Troubleshooting

### Common Issues

1. **API Connection Errors**

   Ensure your `.env` file has the correct API URLs and the API server is running.

2. **Missing Dependencies**

   If you encounter missing dependency errors, try:

   ```bash
   npm install --force
   # or
   yarn install --force
   ```

3. **Type Errors**

   If TypeScript is reporting errors but the code still works:

   ```bash
   npm run tsc:clean
   # or
   yarn tsc:clean
   ```

4. **Port Conflicts**

   If port 3000 is already in use, you can specify a different port:

   ```bash
   PORT=3001 npm start
   # or
   PORT=3001 yarn start
   ```

### Getting Help

If you encounter issues not covered here:

1. Check the project's GitHub Issues
2. Join our Slack channel (#periodic-table-dev)
3. Contact the development team at dev-team@your-organization.com

## Contributing

Please refer to our [Contributing Guide](./contributing.md) for information on how to contribute to the project.
