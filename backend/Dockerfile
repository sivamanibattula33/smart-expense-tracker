FROM node:20-alpine AS builder

WORKDIR /app

# Copy package files
COPY package*.json ./
COPY prisma ./prisma/

# Install dependencies including dev (needed for nest build)
RUN npm ci

# Copy source code
COPY . .

# Generate Prisma client and build NestJS
RUN npx prisma generate
RUN npm run build

# Production image
FROM node:20-alpine

WORKDIR /app

COPY --from=builder /app/package*.json ./
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/prisma ./prisma

EXPOSE 3000

# Start command (Runs migrations then starts server)
CMD ["sh", "-c", "npx prisma migrate deploy && node dist/main"]
