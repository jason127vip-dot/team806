# Use a small official Node.js image to build the React frontend.
FROM node:20-alpine AS build

# Set the working directory inside the build container.
WORKDIR /app

# Copy npm dependency files first so Docker can cache the install layer.
COPY package*.json ./

# Install frontend dependencies exactly from package-lock.json.
RUN npm ci

# Copy the rest of the React source code into the build container.
COPY . .

# Build the React app into static production files.
RUN npm run build

# Use a fresh Node.js image to serve the built frontend files.
FROM node:20-alpine

# Set the working directory inside the runtime container.
WORKDIR /app

# Install a simple static file server.
RUN npm install -g serve

# Copy the built dist folder from the build stage into the runtime image.
COPY --from=build /app/dist ./dist

# Document that the frontend server listens on port 4173.
EXPOSE 4173

# Start the static frontend server.
CMD ["serve", "-s", "dist", "-l", "4173"]
