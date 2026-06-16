# Stage 1: Build NestJS
FROM node:16-alpine AS build
WORKDIR /app

COPY package*.json ./
RUN npm install --legacy-peer-deps

COPY . .
RUN npm run build

# Stage 2: Run NestJS
FROM node:16-alpine
WORKDIR /app

COPY package*.json ./
RUN npm install --only=production --legacy-peer-deps

COPY --from=build /app/dist ./dist

EXPOSE 3000
CMD ["node", "dist/main"]
