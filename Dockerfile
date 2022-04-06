FROM node:lts-alpine
# make the 'app' folder the current working directory
WORKDIR /app
# copy both 'package.json' and 'package-lock.json'
COPY package*.json ./
RUN npm ci
# copy project files and folders to the current working directory
COPY . .
RUN npm run build
EXPOSE 3000
CMD ["npm", "start"]