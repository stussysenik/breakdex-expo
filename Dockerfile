FROM node:20-alpine

WORKDIR /app

COPY package*.json ./
RUN npm ci --legacy-peer-deps

COPY . .

RUN npx expo export:embed --platform web --output-dir ./dist

EXPOSE 3000

CMD ["npx", "serve", "dist"]