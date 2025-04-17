# Build stage
FROM node:18-alpine as builder
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build

# Production stage - using plain alpine with node
FROM alpine:3.18
WORKDIR /app

# Install node
RUN apk add --no-cache nodejs

# Copy only the built files and server
COPY --from=builder /app/build ./build
COPY --from=builder /app/server.js .

ENV PORT=3000
EXPOSE 3000

CMD ["node", "server.js"] 