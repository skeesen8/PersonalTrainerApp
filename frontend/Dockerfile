# Build stage
FROM node:18 as build

WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build
# Add health check file to the build output
RUN echo "OK" > build/_health

# Production stage
FROM node:18-slim

WORKDIR /app
COPY package*.json ./
RUN npm install --production
RUN npm install -g serve
COPY --from=build /app/build ./build

ENV PORT=3000
EXPOSE 3000

# Add healthcheck
HEALTHCHECK --interval=5s --timeout=10s --start-period=5s --retries=3 \
    CMD curl -f http://localhost:$PORT/_health || exit 1

# Install curl for healthcheck
RUN apt-get update && apt-get install -y curl && rm -rf /var/lib/apt/lists/*

CMD ["npx", "serve", "-s", "build"] 