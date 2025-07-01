# Step 1: Build the app with yarn
FROM node:20.12.1 AS builder


# Set working directory
WORKDIR /app

# Copy package files to install dependencies
COPY package.json yarn.lock ./

# Install dependencies
RUN yarn

# Copy the rest of the application code
COPY . .

# Build the NetJS app
RUN yarn build

# Step 2: Prepare the final image (runtime)
FROM node:20.12.1 AS runner


# Set working directory
WORKDIR /app

COPY --from=builder /app .

EXPOSE 3001



# Run the NextJS app
CMD yarn start