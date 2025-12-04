# ---------- Build stage ----------
FROM public.ecr.aws/docker/library/node:22-alpine AS builder

WORKDIR /app
COPY package*.json tsconfig*.json ./
RUN npm install
COPY . .
RUN npm run build

# ---------- Runtime stage ----------
FROM public.ecr.aws/nginx/nginx-unprivileged:1.29-alpine

# (optional) custom nginx config if you need SPA routing:
# COPY nginx.conf /etc/nginx/conf.d/default.conf

COPY --from=builder /app/dist /usr/share/nginx/html

# nginx-unprivileged already runs as non-root on 8080
EXPOSE 8080

CMD ["nginx", "-g", "daemon off;"]
