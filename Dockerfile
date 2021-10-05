FROM node:16

WORKDIR /starter-rest

COPY .env /starter-rest/.env
COPY package*.json ./

# If you are building for production
# RUN npm ci --only=production
RUN npm install

COPY . .

# Port your app is listening to
EXPOSE 8080

# For production use
# CMD ["npm", "start"]
CMD ["npm", "run", "dev"]