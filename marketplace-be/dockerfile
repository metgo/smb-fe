# Step 1: Build the app with yarn
FROM node:20.12.1 AS builder

# Install OpenJDK 17 (for OpenAPI generator)
RUN apt-get update && apt-get install -y openjdk-17-jdk && apt-get clean

# Verify Java installation in the builder stage
RUN java -version

# Set working directory
WORKDIR /app

# Copy package files to install dependencies
COPY package.json yarn.lock ./

# Install dependencies
RUN yarn

# Copy the rest of the application code
COPY . .

# Build the NestJS app
RUN yarn build

# Step 2: Prepare the final image (runtime)
FROM node:20.12.1 AS runner

# Install OpenJDK 17 in the runtime stage as well
RUN apt-get update && apt-get install -y openjdk-17-jdk && apt-get clean

# Set working directory
WORKDIR /app

# Copy the build artifacts from the builder stage
COPY --from=builder /app/ ./

# Verify Java in runtime
RUN java -version

# Expose the NestJS app port
EXPOSE 3000

# Run the NestJS app
CMD ["node", "dist/main"]
