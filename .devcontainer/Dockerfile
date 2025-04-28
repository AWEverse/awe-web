FROM node:20-alpine
RUN npm --global install npm
RUN apk add --no-cache \
  chromium \
  git \
  openssh \
  ripgrep
USER node
ENV CHROME_BIN=chromium-browser
