FROM oven/bun:latest

WORKDIR /app

COPY package.json bun.lock ./

RUN bun install --frozen-lockfile

COPY . .

RUN apt-get update -y && apt-get install -y openssl

RUN bunx prisma generate

RUN bun run build

EXPOSE 3000

CMD [ "bun", "./build/index.js" ]
