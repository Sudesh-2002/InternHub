FROM php:8.2-cli

# Install dependencies
RUN apt-get update && apt-get install -y \
    git curl zip unzip libpq-dev \
    && docker-php-ext-install pdo pdo_pgsql

# Install Composer
COPY --from=composer:latest /usr/bin/composer /usr/bin/composer

# Set working directory
WORKDIR /var/www

# Copy project files
COPY . .

# Install Laravel dependencies
RUN composer install --no-dev --optimize-autoloader

# Set permissions
RUN chmod -R 775 storage bootstrap/cache

# Expose port
EXPOSE 10000

# Start script: migrate, seed (non-fatal), link storage, then serve
CMD php artisan config:clear \
    && php artisan migrate --force \
    && php artisan db:seed --force || true \
    && php artisan storage:link --force || true \
    && php artisan serve --host=0.0.0.0 --port=${PORT:-10000}