#!/bin/bash
set -e

# Copy .env.example to .env if .env doesn't exist (to prevent Laravel errors)
if [ ! -f .env ]; then
    echo "Creating .env from .env.example..."
    cp .env.example .env
fi

# Generate APP_KEY if it's not set
if ! grep -q "APP_KEY=base" .env && [ -z "$APP_KEY" ]; then
    echo "Generating application key..."
    php artisan key:generate --force
fi

# Run database migrations
echo "Running database migrations..."
php artisan migrate --force

# Start Apache in the foreground
echo "Starting Apache web server..."
exec apache2-foreground
