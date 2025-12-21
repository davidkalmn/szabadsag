FROM php:8.2-cli

# Set working directory
WORKDIR /var/www/html

# Install system dependencies
RUN apt-get update && apt-get install -y \
    git \
    curl \
    libpng-dev \
    libonig-dev \
    libxml2-dev \
    zip \
    unzip \
    sqlite3 \
    libsqlite3-dev \
    && rm -rf /var/lib/apt/lists/*

# Install PHP extensions
RUN docker-php-ext-install pdo_mysql pdo_sqlite mbstring exif pcntl bcmath gd

# Install Composer
COPY --from=composer:latest /usr/bin/composer /usr/bin/composer

# Install Node.js (LTS version)
RUN curl -fsSL https://deb.nodesource.com/setup_20.x | bash - \
    && apt-get install -y nodejs

# Copy existing application directory contents
COPY . /var/www/html

# Set proper permissions (for development, we'll keep root user)
# Volumes will override these permissions anyway
RUN chmod -R 755 /var/www/html \
    && mkdir -p /var/www/html/storage /var/www/html/bootstrap/cache \
    && chmod -R 775 /var/www/html/storage \
    && chmod -R 775 /var/www/html/bootstrap/cache

# Keep root user for easier development (can be changed to www-data for production)
# USER www-data

# Expose port 8000 for Laravel
EXPOSE 8000

# Default command (can be overridden in docker-compose)
CMD ["php", "artisan", "serve", "--host=0.0.0.0", "--port=8000"]

