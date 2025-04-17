# Build stage
FROM node:18 as build

WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build

# Production stage
FROM node:18-slim

WORKDIR /app
RUN npm install -g serve
COPY --from=build /app/build ./build
COPY public/_health ./_health

ENV PORT=3000
EXPOSE 3000

CMD serve -s build -l ${PORT} 