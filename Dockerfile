# Use Node.js official image
FROM node:18-alpine

# Set working directory
WORKDIR /app

# Copy package.json and package-lock.json (if available)
COPY package*.json ./

# Install ALL dependencies (including dev dependencies needed for build)
RUN npm install

# Copy the rest of the application code
COPY . .

# Build the application
RUN npm run build

# Install serve to run the built application
RUN npm install -g serve

# Expose port 3000
EXPOSE 3000

# Command to run the application
CMD ["serve", "-s", "dist", "-l", "3000"]
