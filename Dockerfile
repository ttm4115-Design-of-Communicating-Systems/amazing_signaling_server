FROM node
RUN mkdir -p /server/node_modules
WORKDIR /server
COPY ./* ./
CMD npm install && node server.js