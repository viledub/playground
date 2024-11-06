FROM node:20.11 AS build
WORKDIR /app

COPY package*.json .
RUN npm ci
COPY . .

# Build SvelteKit app
RUN npm run build
RUN npm prune --production

FROM node:20.11 AS run
COPY --from=build /app/build ./build
COPY --from=build /app/package.json ./package.json
COPY --from=build /app/node_modules ./node_modules
RUN ulimit -c unlimited


USER node:node
ENTRYPOINT ["node", "build"]