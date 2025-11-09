# Deployment Guide

This guide covers deploying the Data Center Impact Analyzer using Docker.

## Prerequisites

- Docker and Docker Compose installed
- API keys for:
  - Anthropic (Claude AI)
  - Mapbox
  - US Census Bureau
  - OpenWeather

## Quick Start

### 1. Set up environment variables

Create a `.env` file in the project root:

```bash
# API Keys
ANTHROPIC_API_KEY=your_anthropic_key_here
MAPBOX_ACCESS_TOKEN=your_mapbox_token_here
US_CENSUS_API_KEY=your_census_key_here
OPENWEATHER_API_KEY=your_openweather_key_here

# Optional: Production settings
FLASK_ENV=production
```

### 2. Build and run with Docker Compose

```bash
# Build and start all services
docker-compose up --build

# Or run in detached mode
docker-compose up -d --build
```

The application will be available at:
- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:5000

### 3. Stop the services

```bash
docker-compose down
```

## Individual Service Deployment

### Backend Only

```bash
cd backend
docker build -t datacenter-backend .
docker run -p 5000:5000 \
  -e ANTHROPIC_API_KEY=your_key \
  -e MAPBOX_ACCESS_TOKEN=your_token \
  datacenter-backend
```

### Frontend Only

```bash
cd frontend
docker build -t datacenter-frontend .
docker run -p 3000:80 datacenter-frontend
```

## Production Deployment

### Environment Configuration

For production deployments:

1. **Never commit `.env` files** - Use secret management services
2. **Use HTTPS** - Deploy behind a reverse proxy (nginx, Caddy, Traefik)
3. **Set proper CORS origins** in backend
4. **Use environment-specific API URLs**

### Example: Deploy to Cloud

#### Deploy to AWS/GCP/Azure

1. Push images to container registry:
```bash
# Tag images
docker tag datacenter-frontend:latest your-registry/datacenter-frontend:latest
docker tag datacenter-backend:latest your-registry/datacenter-backend:latest

# Push
docker push your-registry/datacenter-frontend:latest
docker push your-registry/datacenter-backend:latest
```

2. Deploy using your cloud provider's container service:
   - **AWS**: ECS, EKS, or App Runner
   - **GCP**: Cloud Run or GKE
   - **Azure**: Container Instances or AKS

#### Deploy to VPS (DigitalOcean, Linode, etc.)

1. SSH into your server
2. Install Docker and Docker Compose
3. Clone your repository
4. Set up `.env` file with production values
5. Run: `docker-compose up -d`
6. Set up nginx reverse proxy with SSL (Let's Encrypt)

### Nginx Reverse Proxy Configuration (Optional)

If deploying on a VPS, add this nginx config:

```nginx
server {
    listen 80;
    server_name your-domain.com;

    # Redirect to HTTPS
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    server_name your-domain.com;

    ssl_certificate /etc/letsencrypt/live/your-domain.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/your-domain.com/privkey.pem;

    # Frontend
    location / {
        proxy_pass http://localhost:3000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }

    # Backend API (optional, frontend nginx already proxies)
    location /api/ {
        proxy_pass http://localhost:5000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_buffering off;
        proxy_read_timeout 300s;
    }
}
```

## Configuration Details

### Frontend Configuration

The frontend automatically detects the environment:
- **Development** (localhost): Uses `http://127.0.0.1:5000`
- **Production**: Uses relative URLs, proxied by nginx

To override in development, set `VITE_API_URL` environment variable.

### Backend Configuration

Backend reads from environment variables:
- `ANTHROPIC_API_KEY`: Required for AI analysis
- `MAPBOX_ACCESS_TOKEN`: Required for map features
- `US_CENSUS_API_KEY`: Required for population data
- `OPENWEATHER_API_KEY`: Required for climate data
- `FLASK_ENV`: Set to `production` for production

### Nginx Configuration

The frontend's nginx config:
- Serves static files with caching
- Proxies `/api/*` requests to backend service
- Handles Server-Sent Events (SSE) for streaming
- Includes security headers
- Supports SPA routing

## Monitoring and Logs

### View logs

```bash
# All services
docker-compose logs -f

# Specific service
docker-compose logs -f backend
docker-compose logs -f frontend
```

### Health checks

- Backend: `http://localhost:5000/health`
- Frontend: `http://localhost:3000/index.html`

Docker Compose automatically performs health checks.

## Troubleshooting

### Frontend can't connect to backend

1. Check if backend is running: `docker-compose ps`
2. Check backend logs: `docker-compose logs backend`
3. Verify environment variables are set
4. Check if backend health endpoint responds: `curl http://localhost:5000/health`

### API keys not working

1. Verify `.env` file exists and has correct values
2. Restart containers: `docker-compose restart`
3. Check backend logs for API errors

### Build fails

1. Clear Docker cache: `docker-compose build --no-cache`
2. Ensure all dependencies are in requirements.txt / package.json
3. Check for syntax errors in Dockerfiles

## Scaling

To scale services:

```bash
# Run multiple backend workers
docker-compose up --scale backend=3
```

For production, use orchestration platforms:
- Kubernetes (K8s)
- Docker Swarm
- AWS ECS
- Google Cloud Run

## Security Best Practices

1. **Use secrets management** - Never commit API keys
2. **Enable HTTPS** - Use SSL certificates
3. **Set CORS properly** - Restrict to your domain
4. **Update dependencies** - Regularly update packages
5. **Use non-root users** - Configure in Dockerfile
6. **Scan images** - Use `docker scan` or Snyk
7. **Limit resources** - Set memory/CPU limits in docker-compose

## Support

For issues, check:
1. Docker logs
2. Browser console (F12)
3. Network tab for API errors
4. Backend health endpoint

