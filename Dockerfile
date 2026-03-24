FROM node:22.16.0 AS builder

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .

# Set build-time env to skip API routes during build
ENV SKIP_ENV_VALIDATION=true


# Build the app
RUN npm run build

# Production stage
FROM node:22.16.0

WORKDIR /app

COPY package*.json ./
RUN npm install --production

COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static
COPY --from=builder /app/public ./public

EXPOSE 3000

CMD ["node", "server.js"]