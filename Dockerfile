FROM node:18-alpine

# Create app directory
WORKDIR /app

# Copy package manifests to install dependencies first (leverages cache)
COPY package*.json ./
COPY server/package*.json ./server/

# Install root and server deps
RUN npm install --production && cd server && npm install --production

# Copy app source
COPY . .

# Use PORT from environment (Cloud Run sets it)
ENV PORT 8080
EXPOSE 8080

# Start the app (root package.json 'start' runs server)
CMD ["npm", "start"]
