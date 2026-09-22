FROM node:alpine

# 1. Cập nhật hệ thống Alpine
RUN apk update && apk upgrade --no-cache

WORKDIR /app

# 2. Copy riêng các file quản lý thư viện (package.json, yarn.lock, .yarnrc.yml)
COPY package.json yarn.lock .yarnrc.yml ./

# 3. Kích hoạt Corepack để dùng đúng phiên bản Yarn được khai báo trong project
RUN npm install -g corepack@latest --force && \
    corepack enable && \
    corepack install

# 4. Cài đặt thư viện với độ ổn định tuyệt đối (tương đương npm ci)
RUN yarn install --immutable

# 5. Copy toàn bộ code vào image
COPY . .

# 6. Khởi chạy ứng dụng KHI CONTAINER BẮT ĐẦU CHẠY (không dùng RUN)
CMD ["yarn", "start"]
