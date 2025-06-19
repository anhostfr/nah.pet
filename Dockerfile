FROM oven/bun:latest
WORKDIR /app

COPY package*.json .
COPY bun.lock* .
RUN bun install

COPY . .
RUN apt-get update -y && apt-get install -y openssl
RUN bunx prisma generate
RUN bun run build

EXPOSE 3000

ENV NODE_ENV=production

CMD [ "bun", "./build/index.js" ]