# Stage 1: Build Angular App
FROM node:16-alpine AS build
WORKDIR /app

# Install dependencies
COPY package*.json ./
RUN npm install --legacy-peer-deps

# Copy frontend source and build
COPY . .
RUN npx ng build --configuration=production

# Stage 2: Serve App via Nginx
FROM nginx:alpine
COPY nginx.conf /etc/nginx/nginx.conf
COPY --from=build /app/dist/sigslab /usr/share/nginx/html
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
