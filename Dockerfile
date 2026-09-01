# Multi-stage build: compile the static site, then serve it with a tiny nginx.
# No backend/runtime dependencies - the app calls TheSportsDB directly from
# the browser - so the final image is just static files behind nginx.

FROM node:20-alpine AS build
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci
COPY . .
RUN npm run build

FROM nginx:1.27-alpine
COPY --from=build /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 80
