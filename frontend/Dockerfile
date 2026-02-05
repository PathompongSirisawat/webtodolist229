FROM node:18 AS build

WORKDIR /app
COPY package*.json ./
RUN npm install

COPY . .

# 1. บังคับเปลี่ยนเลข Hash ของ Cache ด้วยการใช้ Date (ทำให้ Build ใหม่แน่นอน)
RUN echo "Build date: $(date)" > build_log.txt

# 2. สร้าง .env (เช็คชื่อตัวแปรในโค้ดดีๆ นะครับ ถ้าใช้ React ปกติคือ REACT_APP_API_URL)
RUN echo "REACT_APP_API_URL=https://strapi-backend-231380388494.asia-southeast1.run.app" > .env
RUN echo "VITE_API_URL=https://strapi-backend-231380388494.asia-southeast1.run.app" >> .env

RUN npm run build

FROM node:18
WORKDIR /app
RUN npm install -g serve
# มั่นใจว่าใช้ /app/build สำหรับ React (CRA)
COPY --from=build /app/build ./build
EXPOSE 3000
CMD ["serve", "-s", "build", "-l", "3000"]