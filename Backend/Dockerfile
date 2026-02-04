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

RUN npm install

COPY . .

EXPOSE 1337

CMD ["npm", "run", "develop"]
