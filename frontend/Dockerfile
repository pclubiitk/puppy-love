# pclubiitk/puppy-love:frontend
FROM node:8-alpine as builder

# Cached layer for node_modules
COPY package.json /tmp/package.json
COPY yarn.lock /tmp/yarn.lock
RUN cd /tmp && yarn install
RUN mkdir -p /src && cp -a /tmp/node_modules /src/

WORKDIR /src
COPY . .
RUN yarn build

FROM nginx

RUN mkdir -p /src/dist
COPY --from=builder /src/dist /src/dist
COPY nginx.conf /etc/nginx/nginx.conf
