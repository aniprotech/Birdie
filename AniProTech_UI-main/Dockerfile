FROM node:22-alpine AS build
WORKDIR /app
ARG VITE_APP_BASE_LIVE_URL=https://backend.aniprotech.com
ARG VITE_APP_MAP_API_KEY
ARG VITE_APP_SECRET_KEY
ENV VITE_APP_BASE_LIVE_URL=$VITE_APP_BASE_LIVE_URL
ENV VITE_APP_MAP_API_KEY=$VITE_APP_MAP_API_KEY
ENV VITE_APP_SECRET_KEY=$VITE_APP_SECRET_KEY
COPY package.json package-lock.json ./
RUN npm ci
COPY . .
RUN npm run build

FROM nginx:1.27-alpine
COPY nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=build /app/dist /usr/share/nginx/html
EXPOSE 8080
CMD ["nginx", "-g", "daemon off;"]
