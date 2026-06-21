# Stage 1: Build React SPA
FROM node:22-alpine AS build

WORKDIR /app

# Declare build argument for API Base URL
ARG VITE_API_BASE_URL
# Set as environment variable for Vite compiler
ENV VITE_API_BASE_URL=$VITE_API_BASE_URL

COPY package*.json ./

RUN npm ci

COPY . .

RUN npm run build

# Stage 2: Serve SPA with Nginx
FROM nginx:alpine

COPY --from=build /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
