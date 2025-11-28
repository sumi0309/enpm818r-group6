# ---------- Build stage ----------
FROM node:22-alpine AS builder

WORKDIR /app

COPY package*.json tsconfig*.json ./
RUN npm install

COPY . .
RUN npm run build

# ---------- Runtime stage ----------
FROM nginx:alpine

COPY --from=builder /app/dist /usr/share/nginx/html

EXPOSE 80
USER nginx

CMD ["nginx", "-g", "daemon off;"]
