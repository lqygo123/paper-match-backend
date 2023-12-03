FROM docker.finogeeks.club/base/node:20.4-alpine
# FROM node:20.4-alpine

# Set the working directory to /app
WORKDIR /app

# RUN echo 'registry=https://mirrors.finogeeks.club/repository/npm/' > ~/.npmrc \
#     && echo '//mirrors.finogeeks.club/repository/npm/:_authToken=NpmToken.ac6bbfd1-d7fb-394a-b665-7692ffd76efb' >> ~/.npmrc

# Copy the package.json and package-lock.json files to the container
COPY package*.json ./

# Install the dependencies ， use npm install --production for production
# add pm2 to start nodejs application
RUN npm install && npm install pm2 -g

# Copy the rest of the application code to the container
COPY . .

# Expose port 3000 for the application
EXPOSE 3000

# Start the application
CMD ["pm2-runtime", "app.js"]