FROM node:latest

RUN mkdir -p /usr/src/app

COPY . /usr/src/app

WORKDIR /usr/src/app

RUN npm install -g bower
RUN npm install -g nodemon

# Only for frontend deps
WORKDIR /usr/src/app/views
RUN bower install --allow-root

# Get to root folder now
WORKDIR /usr/src/app
RUN npm install

EXPOSE 8091

CMD ["nodemon"]
