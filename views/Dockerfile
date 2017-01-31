# Set nginx base image
FROM nginx

RUN apt-get update
RUN apt-get -y install curl && \
    curl -sL https://deb.nodesource.com/setup_6.x | bash - && \
    apt-get install -y nodejs

# Install yarn
RUN npm install -g yarn

# Provides cached layer for node_modules
COPY package.json /tmp/package.json
ADD yarn.lock /tmp/yarn.lock
RUN cd /tmp && yarn install
RUN mkdir -p /src && cp -a /tmp/node_modules /src/

# Define working directory
WORKDIR /src
ADD . /src
RUN cd /src && yarn run build

# Copy custom configuration file from the current directory
COPY nginx.prod.conf /etc/nginx/nginx.conf
