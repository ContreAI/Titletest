# syntax=docker/dockerfile:1.7-labs

# ---------- Builder ----------
    FROM node:22-alpine AS builder
    WORKDIR /app

    # Accept build arg for GitHub Packages auth
    ARG NODE_AUTH_TOKEN

    # Install deps with cache (include .npmrc for GitHub Packages)
    # Note: Using npm install instead of npm ci because the package-lock.json
    # may not have the resolved GitHub Packages URL for @contreai/api-client
    COPY package*.json .npmrc ./
    RUN --mount=type=cache,target=/root/.npm \
        npm install --prefer-offline --no-audit --progress=false
    
    # Accept public build-time variables for Vite
    ARG VITE_API_URL
    ARG VITE_SOCKET_URL
    ARG VITE_AUTH_URL
    ARG VITE_SUPABASE_URL
    ARG VITE_SUPABASE_ANON_KEY
    
    ENV VITE_API_URL=$VITE_API_URL
    ENV VITE_AUTH_URL=$VITE_AUTH_URL
    ENV VITE_SOCKET_URL=$VITE_SOCKET_URL
    ENV VITE_SUPABASE_URL=$VITE_SUPABASE_URL
    ENV VITE_SUPABASE_ANON_KEY=$VITE_SUPABASE_ANON_KEY
    ENV NODE_ENV=production

    # Copy source and build
    COPY . .
    RUN --mount=type=cache,target=/root/.npm \
        npm run build
    
    # ---------- Runtime ----------
    FROM nginx:1.27-alpine
    # Static files only; nginx.conf should come from K8s ConfigMap if you need custom routes
    COPY --from=builder /app/dist /usr/share/nginx/html
    EXPOSE 80
    CMD ["nginx", "-g", "daemon off;"]
    