FROM library/node:24-alpine AS builder

WORKDIR /app

COPY package.json package-lock.json ./
RUN npm install

COPY . .

ARG VITE_API_URL="https://tind.eirb.fr"

RUN npm run build

# runtime
FROM library/alpine:3.24

WORKDIR /app
EXPOSE 80

COPY --from=builder /app/backend .

CMD [ "/app/pocketbase", "serve", "--http", "0.0.0.0:80" ]
