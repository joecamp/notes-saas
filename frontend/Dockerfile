# Stage 1 — build
# Install dependencies and compile the React app into static files.
FROM node:20-alpine AS build
WORKDIR /app
COPY package*.json .
RUN npm ci --legacy-peer-deps
COPY . .
ARG VITE_API_URL
ENV VITE_API_URL=$VITE_API_URL
RUN npm run build

# Stage 2 — serve
# Use a lightweight nginx image to serve the compiled static files.
# The node image is thrown away — only the dist/ output moves forward.
FROM nginx:alpine AS runtime
COPY --from=build /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
