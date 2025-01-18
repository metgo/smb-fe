# Step 1: Build the app with yarn
FROM node:20.12.1 AS builder

# Install Java (for OpenAPI generator)
RUN apt-get update && apt-get install -y default-jdk && apt-get clean

# Set working directory
WORKDIR /app

# Copy package files to install dependencies
COPY package.json yarn.lock ./

# Install dependencies
RUN yarn

# Ensure the directory for credentials exists
# RUN mkdir -p /app/credentials

# # If GCS_FILE_PATH is an ARG, copy the credentials file accordingly
# # Assuming GCS_FILE_PATH is passed as an environment variable or secret
# # You could optionally pass this ARG through your build pipeline (CI/CD)
# ARG GCS_FILE_PATH
# COPY ${GCS_FILE_PATH} /app/credentials/metgo-staging-server-6d235c8ca059.json

# Copy the rest of the application code (excluding node_modules or unwanted files)
COPY . .

# Build the NestJS app
RUN yarn build

# Step 2: Prepare the final image
FROM node:20.12.1 AS runner

# Set working directory
WORKDIR /app

# Copy the build artifacts from the builder stage
COPY --from=builder /app/ ./

# Expose the NestJS app port
EXPOSE 3000

# Run the NestJS app
CMD ["node", "dist/main"]
