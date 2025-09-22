# Use Bun's official Docker image as the base
FROM oven/bun:1 as base
WORKDIR /usr/src/app

# Install dependencies into temp directory
FROM base AS install
RUN mkdir -p /temp/dev
COPY package.json bun.lock /temp/dev/
RUN cd /temp/dev && bun install --frozen-lockfile

# Install with --production for production dependencies only
RUN mkdir -p /temp/prod
COPY package.json bun.lock /temp/prod/
RUN cd /temp/prod && bun install --frozen-lockfile --production

# Development stage
FROM base AS development
COPY --from=install /temp/dev/node_modules node_modules
COPY . .

# Expose the port
EXPOSE 5000

# Use bun to run the development server
CMD ["bun", "run", "dev"]

# Build stage
FROM base AS build
COPY --from=install /temp/dev/node_modules node_modules
COPY . .

# Build the TypeScript application
RUN bun run build

# Production stage
FROM base AS production
COPY --from=install /temp/prod/node_modules node_modules
COPY --from=build /usr/src/app/dist dist

# Create a non-root user
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nodejs

# Change ownership of the app directory
RUN chown -R nodejs:nodejs /usr/src/app
USER nodejs

# Expose the port
EXPOSE 5000

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD curl -f http://localhost:5000/health || exit 1

# Start the production server
CMD ["bun", "run", "start"]