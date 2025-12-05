FROM node:22-alpine

WORKDIR /app

RUN npm install -g pnpm

COPY package.json ./

RUN pnpm install

COPY . .

RUN apk add --no-cache openssl

# Provide a placeholder DATABASE_URL for prisma generate (doesn't need real connection)
ARG DATABASE_URL="postgresql://placeholder:placeholder@localhost:5432/placeholder"
ENV DATABASE_URL=$DATABASE_URL

RUN pnpm dlx prisma generate

RUN pnpm run build

EXPOSE 3000

CMD [ "node", "./build/index.js" ]