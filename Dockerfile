FROM node:24-alpine

EXPOSE 6767

WORKDIR /app

COPY . .


# deps
RUN apk add typescript

# frontend deps
RUN cd frontend
RUN npm i

# full deps
RUN cd ..
RUN npm i 
# RUN npm i --save-dev @types/react
# RUN npm i --save-dev @types/react-dom
# RUN npm i --save-dev tailwindcss

# build
RUN npm run build

RUN npm install -g serve


CMD [ "./run.sh" ]
