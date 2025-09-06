FROM node:22-alpine

WORKDIR /app

COPY package.json package-lock.json ./

RUN npm ci --frozen-lockfile

COPY . .

RUN apk add --no-cache openssl

RUN npx prisma generate

RUN npm run build

EXPOSE 3000

CMD [ "node", "./build/index.js" ]