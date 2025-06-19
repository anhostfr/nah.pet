FROM oven/bun:latest
WORKDIR /app

COPY package*.json .
COPY bun.lock* .
RUN bun install

COPY . .
RUN apt-get update -y && apt-get install -y openssl
RUN bun run build
RUN bun install --production
RUN bunx prisma generate

EXPOSE 3000

ENV NODE_ENV=production

CMD [ "bun", "./build/index.js" ]