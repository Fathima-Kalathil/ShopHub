FROM php:8.3-cli

RUN apt-get update \
 && apt-get install -y --no-install-recommends libpq-dev libzip-dev unzip git \
 && docker-php-ext-install pdo_pgsql zip \
 && rm -rf /var/lib/apt/lists/*

COPY --from=composer:2 /usr/bin/composer /usr/bin/composer

WORKDIR /app
COPY . .
RUN composer install --no-dev --optimize-autoloader --no-interaction --no-scripts \
 && chmod -R 777 storage bootstrap/cache

ENV APP_ENV=production \
    APP_DEBUG=false \
    LOG_CHANNEL=stderr \
    DB_CONNECTION=pgsql \
    CACHE_STORE=file \
    SESSION_DRIVER=array \
    QUEUE_CONNECTION=sync \
    PHP_CLI_SERVER_WORKERS=4

EXPOSE 10000
CMD ["sh", "docker-entrypoint.sh"]
