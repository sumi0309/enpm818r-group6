# ---------- Build stage ----------
FROM public.ecr.aws/docker/library/node:22-alpine AS builder

WORKDIR /app
COPY package*.json tsconfig*.json ./
RUN npm install
COPY . .

ARG VITE_UPLOADER_API_URL
ARG VITE_ANALYTICS_API_URL
ARG VITE_S3_BUCKET_NAME

# Set them as ENV variables so the build process (Vite) can see them
ENV VITE_UPLOADER_API_URL=$VITE_UPLOADER_API_URL
ENV VITE_ANALYTICS_API_URL=$VITE_ANALYTICS_API_URL
ENV VITE_S3_BUCKET_NAME=$VITE_S3_BUCKET_NAME

RUN npm run build

# ---------- Runtime stage ----------
FROM public.ecr.aws/nginx/nginx-unprivileged:1.29-alpine

# (optional) custom nginx config if you need SPA routing:
# COPY nginx.conf /etc/nginx/conf.d/default.conf

COPY --from=builder /app/dist /usr/share/nginx/html

# nginx-unprivileged already runs as non-root on 8080
EXPOSE 8080

CMD ["nginx", "-g", "daemon off;"]
