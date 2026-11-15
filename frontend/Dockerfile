FROM public.ecr.aws/docker/library/node:22-slim AS builder
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci
COPY . .
ARG VITE_API_BASE_URL
ENV VITE_API_BASE_URL=$VITE_API_BASE_URL
ENV VITE_ENABLE_MOCK_DATA=false
RUN npm run build

FROM public.ecr.aws/docker/library/nginx:alpine
RUN mkdir -p /var/cache/nginx \
    && chown -R nginx:nginx /var/cache/nginx \
    && sed -i 's@pid .*;@pid /tmp/nginx.pid;@' /etc/nginx/nginx.conf \
    && sed -i '/^user /d' /etc/nginx/nginx.conf
COPY --from=builder /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf
USER nginx
EXPOSE 8080
CMD ["nginx", "-g", "daemon off;"]
