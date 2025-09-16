# Use Node LTS
FROM node:lts

# Set working directory
WORKDIR /app

# Install dependencies only
COPY package*.json ./
RUN npm install

# Expose port for CRA
EXPOSE 3000

# Start app in dev mode (will watch for changes)
CMD ["npm", "start"]
