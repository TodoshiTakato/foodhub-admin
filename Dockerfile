FROM node:18-alpine

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies as root first
RUN npm install

# Copy source code  
COPY . .

# Switch to node user (UID 1000) 
USER node

# Expose port
EXPOSE 5173

# Start development server with hot reload
CMD ["npm", "run", "dev"] 