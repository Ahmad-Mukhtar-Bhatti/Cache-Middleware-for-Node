FROM node:20-alpine3.17

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .

# Create a non-root user
RUN addgroup -g 1001 -S nodejs
RUN adduser -S appuser -u 1001

# Switch to the non-root user
USER appuser

EXPOSE 3000

CMD ["node", "app.js"]
