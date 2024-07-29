# Use the official Node.js 21 image as the base image
FROM node:22 AS build-env

# Set the working directory in the container
WORKDIR /app

# Copy package.json and package-lock.json (if available) to the working directory
COPY package*.json ./

# Install the project dependencies
RUN npm install --omit=dev
COPY . .
RUN cd react && npm install
RUN npm install -g vite
RUN cd /app/react && vite build

FROM gcr.io/distroless/nodejs22-debian11
COPY --from=build-env /app /app
WORKDIR /app

VOLUME [ "/app/logs" ]

EXPOSE 3000

# Command to run the application
CMD [ "index.js" ]