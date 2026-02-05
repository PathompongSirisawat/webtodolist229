FROM node:18

WORKDIR /app

RUN apt-get update && apt-get install -y \
  build-essential \
  gcc \
  g++ \
  make \
  python3 \
  libc6-dev \
  libvips-dev

COPY package*.json ./
RUN npm install --production

COPY . .

RUN npm run build

EXPOSE 1337

CMD ["npm","run","start"]
