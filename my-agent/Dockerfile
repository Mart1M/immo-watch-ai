FROM node:24-slim AS build
WORKDIR /app
COPY package*.json ./
RUN npm ci --no-audit --no-fund
COPY . .
RUN npx eve build

FROM node:24-slim
WORKDIR /app
ENV NODE_ENV=production PORT=2000
COPY --from=build /app ./
EXPOSE 2000
CMD ["npx", "eve", "start", "--host", "0.0.0.0"]
