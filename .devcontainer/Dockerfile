FROM node:20-alpine3.18

# Install necessary packages
RUN apk add --no-cache \
    chromium \
    git \
    openssh \
    ripgrep \
    python3 \
    make \
    g++ \
    curl

# Install latest npm and pnpm
RUN npm install -g npm@latest && \
    npm install -g pnpm@latest

# Set environment variables
ENV CHROME_BIN=/usr/bin/chromium-browser \
    PUPPETEER_SKIP_CHROMIUM_DOWNLOAD=true \
    PUPPETEER_EXECUTABLE_PATH=/usr/bin/chromium-browser

# Create app directory and set permissions
RUN mkdir -p /home/node/app && chown -R node:node /home/node/app

# Switch to non-root user
USER node
WORKDIR /home/node/app

# Expose ports for development (Vite and Storybook)
EXPOSE 5173 6006
