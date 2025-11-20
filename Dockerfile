FROM node:18

WORKDIR /app

COPY package*.json ./

RUN npm install --legacy-peer-deps

COPY . .

# Copy dummy env for build

RUN MONGODB_URI="mongodb://dummy-uri" npm run build


EXPOSE 3000

CMD ["npm", "start"]
