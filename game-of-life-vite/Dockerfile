# Stage 1: Build the app
FROM node:slim AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

# Stage 2: Serve the app with nginx
FROM nginx:alpine-slim
COPY --from=builder /app/dist /usr/share/nginx/html
COPY ./nginx/default.conf /etc/nginx/conf.d/default.conf