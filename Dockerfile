# Use the official Node.js 16 as a parent image
FROM node:16-alpine

# Set the working directory in the container
WORKDIR /usr/src/app

# Copy package.json and package-lock.json (if available) to the container
COPY package*.json ./

# Install any dependencies
RUN npm install

# Create an empty uploads directory
RUN mkdir -p /usr/src/app/uploads

# Set permissions for the uploads directory (optional, adjust as needed)
RUN chmod 755 /usr/src/app/uploads

# Bundle the app source inside the Docker image
COPY . .

# Make port 3000 available to the world outside this container
EXPOSE 3000

# Define the command to run the app
CMD [ "node", "server.js" ]
