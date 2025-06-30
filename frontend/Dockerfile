FROM node:18

WORKDIR /app

COPY . .

RUN npm install

# Expose React dev server port
EXPOSE 3000

# Start React dev server
CMD ["npm", "start"]
