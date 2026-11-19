#!/bin/sh
set -e

# The API doesn't use encrypted cookies, but Laravel wants a key to boot.
if [ -z "$APP_KEY" ]; then
  export APP_KEY="$(php artisan key:generate --show)"
fi

php artisan package:discover --ansi
php artisan migrate --force
php artisan db:seed --force

exec php artisan serve --host=0.0.0.0 --port="${PORT:-10000}" --no-reload
