# ---------- Build stage ----------
FROM public.ecr.aws/docker/library/node:22-alpine AS builder

WORKDIR /app

COPY package*.json tsconfig*.json ./
RUN npm install

COPY . .
RUN npm run build

# ---------- Runtime stage ----------
FROM public.ecr.aws/docker/library/nginx:alpine

COPY --from=builder /app/dist /usr/share/nginx/html

EXPOSE 80
USER nginx

CMD ["nginx", "-g", "daemon off;"]
