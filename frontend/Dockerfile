# Copy package files first, then install, then copy source.
# This order matters for Docker layer caching: if only source files change,
# Docker reuses the cached npm install layer instead of reinstalling everything.
FROM node:20-alpine
WORKDIR /app
COPY package*.json .
RUN npm ci --legacy-peer-deps
COPY . .
EXPOSE 5173
CMD ["npm", "run", "dev"]
