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

# Build the Next.js app
RUN yarn build

# Step 2: Prepare the final image (runtime)
FROM node:22-alpine AS runner

WORKDIR /app

COPY --from=builder /app .

# Allow PORT to be set dynamically
ARG APP_PORT=3001
ENV PORT=${APP_PORT}

EXPOSE ${PORT}

CMD ["yarn", "start"]