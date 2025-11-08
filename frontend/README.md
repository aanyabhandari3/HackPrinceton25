# Data Center Impact Analyzer - Frontend

A React application with Mapbox integration for visualizing and analyzing the environmental and economic impact of data centers.

## Setup

1. Install dependencies:
```bash
npm install
```

2. Create a `.env` file in the frontend directory:
```
VITE_MAPBOX_TOKEN=your_mapbox_token_here
```

Get your Mapbox token from: https://account.mapbox.com/

## Running the Application

```bash
npm run dev
```

The app will be available at `http://localhost:3000`

## Features

- **Interactive Map**: Click anywhere in the USA to place a data center
- **Data Center Configuration**: Choose from 4 preset sizes or create custom configurations
- **Real-time Analysis**: Get comprehensive impact reports powered by AI
- **Beautiful Visualizations**: Clean, modern UI with detailed metrics

## Data Center Sizes

- **Small**: Edge data center (1 MW)
- **Medium**: Enterprise data center (10 MW)
- **Large**: Hyperscale data center (50 MW)
- **Mega**: Mega hyperscale data center (150 MW)

## Technology Stack

- React 18
- Mapbox GL JS
- Tailwind CSS
- Axios
- Vite

