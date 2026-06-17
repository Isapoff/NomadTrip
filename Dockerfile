FROM node:22-alpine AS build
WORKDIR /app
COPY package.json ./
RUN npm install --no-audit --no-fund
COPY . .
RUN npm run build

FROM node:22-alpine
WORKDIR /app
COPY --from=build /app/dist ./dist
COPY --from=build /app/node_modules ./node_modules
COPY --from=build /app/package.json ./
COPY --from=build /app/db ./db
COPY --from=build /app/api ./api
COPY --from=build /app/drizzle.config.ts ./
COPY --from=build /app/tsconfig.json ./
COPY --from=build /app/tsconfig.server.json ./
ENV NODE_ENV=production
EXPOSE 3000
CMD ["node", "dist/boot.js"]
