# Step 1: Build the app with yarn
FROM node:20.12.1 AS builder

# Install OpenJDK 17 for OpenAPI generator to work (use the correct version)
RUN apt-get update && apt-get install -y openjdk-17-jdk && apt-get clean

# Verify Java installation (add this line to ensure Java is available in PATH)
RUN java -version

# Set working directory
WORKDIR /app

# Copy package files to install dependencies
COPY package.json yarn.lock ./

# Install dependencies
RUN yarn

# Copy the rest of the application code (excluding node_modules or unwanted files)
COPY . .

# Build the NestJS app
RUN yarn build

# Step 2: Prepare the final image (slim runtime)
FROM node:20.12.1 AS runner

# Set working directory
WORKDIR /app

# Copy the build artifacts from the builder stage
COPY --from=builder /app/ ./

# Expose the NestJS app port
EXPOSE 3000

# Run the NestJS app
CMD ["node", "dist/main"]
