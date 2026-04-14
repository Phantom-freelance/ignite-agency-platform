FROM node:20-alpine
WORKDIR /app
COPY client-api/package*.json ./
RUN npm install
COPY client-api/src ./src
EXPOSE 8000
CMD ["node", "src/index.js"]
