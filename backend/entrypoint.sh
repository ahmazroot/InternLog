#!/bin/bash
set -e

# Generate APP_KEY jika belum ada
php artisan key:generate --force

# Tunggu DB siap lalu migrate
php artisan migrate --force

# Jalankan built-in Laravel server
exec php artisan serve --host=0.0.0.0 --port=8000
