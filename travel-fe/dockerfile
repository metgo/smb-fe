# Step 1: Build the app
FROM node:22.14.0 AS builder
WORKDIR /app

# Copy package files
COPY package.json yarn.lock tsconfig.json ./

# Install dependencies
RUN yarn

# Copy source code
COPY . .

# Build the Next.js TypeScript app
RUN yarn build

# Step 2: Runtime image
FROM node:22.14.0 AS runner
WORKDIR /app

COPY --from=builder /app .

# Set environment to production
ENV NODE_ENV=production
EXPOSE 3000

# Start Next.js
CMD ["npm", "start"]
