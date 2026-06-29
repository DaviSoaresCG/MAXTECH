# --- Build Stage ---
FROM node:20-alpine AS builder

WORKDIR /app

# Copy dependency manifests
COPY package*.json ./

# Install all dependencies (including devDependencies)
RUN npm install

# Copy the rest of the application files
COPY . .

# Build the application (React frontend + Express backend)
RUN npm run build

# --- Production Stage ---
FROM node:20-alpine AS runner

WORKDIR /app

# Set environment to production
ENV NODE_ENV=production
ENV PORT=3000

# Copy dependency manifests
COPY package*.json ./

# Install only production dependencies
RUN npm install --only=production

# Copy built files from the build stage
COPY --from=builder /app/dist ./dist

# Expose port 3000 (used by our server.ts)
EXPOSE 3000

# Start the production server
CMD ["npm", "run", "start"]
