FROM node:20.11-alpine AS external-website
WORKDIR /app

COPY package*.json .
RUN npm ci
COPY . .

# Build SvelteKit app
RUN npm run build

RUN rm -rf src/ 

USER node:node

CMD ["node","build/index.js"]