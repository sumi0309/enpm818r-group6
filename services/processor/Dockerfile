FROM public.ecr.aws/docker/library/node:20-alpine AS builder
WORKDIR /usr/src/app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build

# ---------- Runtime image ----------
FROM public.ecr.aws/docker/library/node:20-alpine

# INSTALL FFMPEG HERE
RUN apk add --no-cache ffmpeg

WORKDIR /usr/src/app
COPY --from=builder /usr/src/app/package*.json ./
COPY --from=builder /usr/src/app/node_modules ./node_modules
COPY --from=builder /usr/src/app/dist ./dist

# Create non-root user
RUN addgroup -S appgroup && adduser -S appuser -G appgroup
USER appuser

ENV NODE_ENV=production
EXPOSE 8082

CMD ["node", "dist/worker.js"]
