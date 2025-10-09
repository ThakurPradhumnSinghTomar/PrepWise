# Use official Node.js 22.16.0 image as the base
FROM node:22.16.0

# Set working directory inside the container
WORKDIR /app

# Copy package.json and package-lock.json to the working directory
COPY package*.json ./

# Install project dependencies
RUN npm install

# Copy the rest of the application code to the working directory
COPY . .

# Build the Next.js app for production
RUN npm run build

# Expose the production port
EXPOSE 3000

# Start the app in production mode
CMD ["npm", "start"]

