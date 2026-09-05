FROM library/node:24-alpine AS builder

WORKDIR /app

ENV VITE_API_URL=https://tind.eirb.fr

COPY package.json package-lock.json ./
RUN npm install

COPY . .

RUN npm run build

# runtime
FROM library/alpine:3.24

WORKDIR /app
EXPOSE 80

COPY --from=builder /app/backend .

CMD [ "/app/pocketbase", "serve", "--http", "0.0.0.0:80", "tind.eirb.fr" ]
