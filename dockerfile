# Build stage
FROM node:22-alpine AS builder

WORKDIR /app

COPY package.json yarn.lock ./
RUN yarn install

# Copy source code
COPY . .

# Copy .env dynamically passed from build-arg (AFTER copying source to avoid being overwritten)
ARG ENV_FILE=.env
COPY ${ENV_FILE} .env

# Build frontend with Vite (reads .env)
RUN yarn build
