FROM node:20-alpine
WORKDIR /app
COPY package*.json ./
RUN npm install --omit=dev --no-audit --no-fund
COPY . .
ENV NODE_ENV=production
EXPOSE 4005
CMD ["npm", "start"]
