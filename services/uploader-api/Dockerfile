FROM public.ecr.aws/docker/library/node:20-alpine AS builder

WORKDIR /usr/src/app

# Install dependencies
COPY package*.json ./
RUN npm install

# Copy source code
COPY . .

# Build TypeScript
RUN npm run build

# ---------- Runtime image ----------
FROM public.ecr.aws/docker/library/node:20-alpine

WORKDIR /usr/src/app

# Copy only what we need from builder
COPY --from=builder /usr/src/app/package*.json ./
COPY --from=builder /usr/src/app/node_modules ./node_modules
COPY --from=builder /usr/src/app/dist ./dist

# Create non-root user
RUN addgroup -S appgroup && adduser -S appuser -G appgroup
USER appuser

ENV NODE_ENV=production \
    PORT=8080

EXPOSE 8080

CMD ["node", "dist/server.js"]
