# Use an official Node.js image as the base
FROM node:20-alpine AS builder

# Set working directory
WORKDIR /app

# Copy package.json and package-lock.json (if available)
COPY package.json package-lock.json* ./

# Install dependencies
RUN npm ci --prefer-offline --no-audit --progress=false

# Copy the rest of the application code
COPY . .

# Build the Next.js app
RUN npm run build

# Production image - use smaller Node.js alpine
FROM node:20-alpine AS runner
WORKDIR /app

# Create a non-root user for security
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

# Set NODE_ENV to production
ENV NODE_ENV=production

# Copy standalone build output (much smaller than full node_modules)
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static
COPY --from=builder --chown=nextjs:nodejs /app/public ./public

# Remove unnecessary files to reduce size
RUN rm -rf /var/cache/apk/* \
    && rm -rf /tmp/* \
    && rm -rf /usr/share/man \
    && rm -rf /usr/share/doc

# Switch to non-root user
USER nextjs

# Expose port 3000
EXPOSE 3000

# Start the Next.js app using the standalone server
CMD ["node", "server.js"]
