# Stage 1: Build React assets
FROM node:20-alpine AS build
WORKDIR /app

# Copy dependency configs and install
COPY package*.json ./
RUN npm install

# Copy source files
COPY . .

# Set environment argument during build
ARG VITE_API_URL
ENV VITE_API_URL=$VITE_API_URL

# Build assets
RUN npm run build

# Stage 2: Host via Nginx
FROM nginx:1.25-alpine
COPY --from=build /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
