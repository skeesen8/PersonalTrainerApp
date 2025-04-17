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

# Copy server and built assets
COPY --from=build /app/build ./build
COPY server.js .

ENV PORT=3000
EXPOSE 3000

# Add healthcheck
HEALTHCHECK --interval=5s --timeout=10s --start-period=5s --retries=3 \
    CMD node -e "require('http').get('http://localhost:' + (process.env.PORT || 3000) + '/_health', (res) => process.exit(res.statusCode === 200 ? 0 : 1))"

CMD ["node", "server.js"] 