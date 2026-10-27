FROM node:20-slim

# Cài đặt Python3 và thư viện Pillow để xử lý nén ảnh WebP
RUN apt-get update && apt-get install -y --no-install-recommends \
    python3 \
    python3-pil \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app

# Copy toàn bộ mã nguồn vào container
COPY . .

# Đóng gói static build
RUN node scripts/build.mjs

ENV PORT=8080
ENV HOST=0.0.0.0
ENV PYTHON_BIN=python3
ENV NODE_ENV=production

EXPOSE 8080

CMD ["node", "scripts/serve.mjs"]

