FROM node:20-alpine

WORKDIR /app

COPY package*.json ./
RUN npm ci --legacy-peer-deps

COPY . .
RUN npm run build


RUN apk add --no-cache curl

EXPOSE 8000

CMD ["node", "dist/index.js"]
