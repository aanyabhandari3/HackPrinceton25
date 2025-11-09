# Frontend Deployment

## Quick Deploy

### Option 1: Using docker-compose (Recommended)

```bash
# Set the backend URL
export BACKEND_URL=http://your-backend-url:5000

# Build and run
docker-compose up --build
```

### Option 2: Using Docker directly

```bash
# Build
docker build -t datacenter-frontend .

# Run with backend URL
docker run -p 3000:80 -e BACKEND_URL=http://your-backend-url:5000 datacenter-frontend
```

### Option 3: For cloud platforms

When deploying to cloud platforms, set the `BACKEND_URL` environment variable:

**AWS ECS/Fargate:**
```json
{
  "environment": [
    {
      "name": "BACKEND_URL",
      "value": "http://your-backend-url:5000"
    }
  ]
}
```

**Google Cloud Run:**
```bash
gcloud run deploy datacenter-frontend \
  --image gcr.io/YOUR_PROJECT/datacenter-frontend \
  --set-env-vars BACKEND_URL=http://your-backend-url:5000
```

**Azure Container Instances:**
```bash
az container create \
  --resource-group myResourceGroup \
  --name datacenter-frontend \
  --image myregistry.azurecr.io/datacenter-frontend \
  --environment-variables BACKEND_URL=http://your-backend-url:5000
```

## Configuration

The frontend will automatically proxy `/api/*` requests to your backend URL.

**Environment Variables:**
- `BACKEND_URL` - (Required) The URL of your backend service

**Examples:**
- `http://backend.example.com:5000`
- `https://api.yourdomain.com`
- `http://10.0.0.5:5000`

## Access

Once deployed, access your frontend at:
- Local: `http://localhost:3000`
- Production: Your configured domain

## Troubleshooting

**Backend connection fails:**
1. Verify `BACKEND_URL` is set correctly
2. Ensure backend is accessible from the frontend container
3. Check CORS settings on backend
4. View logs: `docker logs datacenter-frontend`

