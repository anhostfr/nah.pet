FROM node:22-alpine

WORKDIR /app

RUN npm install -g pnpm

COPY package.json ./

RUN pnpm install

COPY . .

RUN apk add --no-cache openssl

RUN pnpm dlx prisma generate

RUN pnpm run build

EXPOSE 3000

CMD [ "node", "./build/index.js" ]