FROM node:20-alpine AS builder

WORKDIR /app

COPY package*.json ./
RUN npm i

COPY . .
RUN npm run build

FROM node:20-alpine

WORKDIR /app

COPY package*.json ./
RUN npm i --only=production

COPY --from=builder /app/dist ./dist

EXPOSE 8080

CMD ["node", "dist/server.js"]
