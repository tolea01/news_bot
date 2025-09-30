FROM node:20
WORKDIR /news-bot
COPY package*.json .
RUN npm i
COPY . .
EXPOSE 3000
RUN npx prisma generate
CMD [ "npm", "run", "dev" ]