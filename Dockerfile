FROM oven/bun:latest

WORKDIR /app

COPY package.json bun.lock ./

RUN bun install --frozen-lockfile

COPY . .

RUN apt-get update -y && apt-get install -y openssl

RUN bunx prisma generate
RUN bunx prisma migrate deploy

RUN bun run build

EXPOSE 3000
ENV NODE_ENV=production

CMD [ "bun", "./build/index.js" ]