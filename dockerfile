# Step 1: Build the app with yarn
FROM node:22-alpine AS builder

# Set working directory
WORKDIR /app

# Copy package files to install dependencies
COPY package.json yarn.lock ./
RUN yarn

# Copy the rest of the application code
COPY . .

# Pass ENV_FILE dynamically
ARG ENV_FILE=.env
COPY ${ENV_FILE} .env

# Build the Vite app
RUN yarn build

FROM node:22-alpine AS runner

WORKDIR /app

# Copy built app and dependencies
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/package.json ./package.json
COPY --from=builder /app/node_modules ./node_modules

# Copy Vite config so allowedHosts is used
COPY . .

# Expose port 3000
EXPOSE 3000

# Serve the built app with Vite preview
CMD ["yarn", "preview", "--host", "0.0.0.0", "--port", "3000"]
