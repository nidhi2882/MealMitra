#operating system base image
FROM node:22-alpine

#workdir
WORKDIR /app

COPY package*.json ./

RUN npm install
#copy whole code
COPY . .

EXPOSE 5000
#cmd
CMD ["node","server.js"]
