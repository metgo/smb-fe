# Step 1: Build the app with yarn
FROM node:20.12.1 AS builder

# Set working directory
WORKDIR /app

# Copy project files
COPY package.json yarn.lock ./

# Install dependencies
RUN yarn 

# Copy the rest of the application code
COPY . .

# Build the nestjs app
RUN yarn build

# Step 2: Prepare the final image
FROM node:20.12.1 AS runner

# Set working directory
WORKDIR /app

# Copy the build artifacts from the builder stage
COPY --from=builder /app/ ./

# Expose the nestjs app port
EXPOSE 3000

# Run the nest.js app
CMD ["node", "dist/main"]
