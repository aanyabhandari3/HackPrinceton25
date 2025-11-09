#!/bin/sh

# Replace BACKEND_URL_PLACEHOLDER with actual backend URL from environment variable
# Default to localhost:5000 if not set
BACKEND_URL="${BACKEND_URL:-http://localhost:5000}"

echo "Configuring nginx to proxy to backend: $BACKEND_URL"

# Replace placeholder in nginx config
sed -i "s|BACKEND_URL_PLACEHOLDER|${BACKEND_URL}|g" /etc/nginx/conf.d/default.conf

# Start nginx
exec nginx -g 'daemon off;'

